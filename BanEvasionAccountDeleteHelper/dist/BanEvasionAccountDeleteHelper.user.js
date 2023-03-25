// ==UserScript==
// @name         Ban Evasion Account Delete Helper
// @description  Adds streamlined interface for deleting evasion accounts, then annotating and messaging the main accounts
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.2.1
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/dist/BanEvasionAccountDeleteHelper.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/dist/BanEvasionAccountDeleteHelper.user.js
//
// @match        *://*.askubuntu.com/users/account-info/*
// @match        *://*.mathoverflow.net/users/account-info/*
// @match        *://*.serverfault.com/users/account-info/*
// @match        *://*.stackapps.com/users/account-info/*
// @match        *://*.stackexchange.com/users/account-info/*
// @match        *://*.stackoverflow.com/users/account-info/*
// @match        *://*.superuser.com/users/account-info/*
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, Stacks, $ */
(function() {
    "use strict";

    function getFormDataFromObject(obj) {
        return Object.entries(obj)
            .reduce((acc, [key, value]) => {
                acc.set(key, value);
                return acc;
            }, new FormData());
    }

    function fetchPostFormData(endPoint, data) {
        return fetch(endPoint, {
            method: "POST",
            body: getFormDataFromObject(data)
        });
    }

    function buildDetailStringFromObject(obj, keyValueSeparator, recordSeparator, alignColumns = false) {
        const filteredObj = Object.entries(obj)
            .reduce((acc, [key, value]) => {
                if (value.length > 0) {
                    acc[`${key}${keyValueSeparator}`] = value;
                }
                return acc;
            }, {});
        const getPaddingStr = function() {
            if (alignColumns) {
                const maxLabelLength = Math.max(...Object.keys(filteredObj)
                    .map((k) => k.length));
                return function(key) {
                    return new Array(maxLabelLength - key.length + 1)
                        .join(" ");
                };
            } else {
                return function(_) {
                    return "";
                };
            }
        }();
        return Object.entries(filteredObj)
            .map(([key, value]) => `${key}${getPaddingStr(key)}${value}`)
            .join(recordSeparator);
    }

    function getUserPii(userId) {
        return fetchPostFormData(
                "/admin/all-pii", { id: userId, fkey: StackExchange.options.user.fkey }
            )
            .then((res) => res.text())
            .then((resText) => {
                const html = $(resText);
                return {
                    email: html[1].children[1].innerText.trim(),
                    name: html[1].children[3].innerText.trim(),
                    ip: html[3].children[1].innerText.trim()
                };
            });
    }

    function deleteUser(userId, deleteReason, deleteReasonDetails) {
        return fetchPostFormData(
            `/admin/users/${userId}/delete`, {
                fkey: StackExchange.options.user.fkey,
                deleteReason,
                deleteReasonDetails
            }
        );
    }

    function annotateUser(userId, annotationDetails) {
        return fetchPostFormData(
            `/admin/users/${userId}/annotate`, {
                fkey: StackExchange.options.user.fkey,
                annotation: annotationDetails
            }
        );
    }
    const config = {
        validationBounds: {
            deleteReasonDetails: {
                min: 15,
                max: 600
            },
            annotationDetails: {
                min: 10,
                max: 300
            }
        }
    };

    function fetchFullUrlFromUserId(userId) {
        return fetch(`/users/${userId}`, { method: "OPTIONS" })
            .then((res) => res.url);
    }

    function fetchUserIdFromHref(href, convertToNumber = true) {
        let match = href.match(/\/users\/(\d+)\/.*/i);
        if (match === null) {
            match = href.match(/users\/account-info\/(\d+)/i);
        }
        if (match === null || match.length < 2) {
            return void 0;
        }
        if (!convertToNumber) {
            return match[1];
        }
        return Number(match[1]);
    }

    function getUserIdFromAccountInfoURL() {
        const userId = fetchUserIdFromHref(window.location.pathname);
        if (userId === void 0) {
            const message = "Could not get Sock Id from URL";
            StackExchange.helpers.showToast(message, { transientTimeout: 3e3, type: "danger" });
            throw Error(message);
        }
        return userId;
    }

    function handleDeleteUser(userId, deletionReason, deletionDetails) {
        return deleteUser(userId, deletionReason, deletionDetails)
            .then((res) => {
                if (res.status !== 200) {
                    const message = `Deletion of ${userId} unsuccessful.`;
                    StackExchange.helpers.showToast(message, { transient: false, type: "danger" });
                    console.error(res);
                    throw Error(message);
                }
            });
    }

    function handleAnnotateUser(userId, annotationDetails) {
        return annotateUser(userId, annotationDetails)
            .then((res) => {
                if (res.status !== 200) {
                    const message = `Annotation on ${userId} unsuccessful.`;
                    StackExchange.helpers.showToast(message, { transient: false, type: "danger" });
                    console.error(res);
                    throw Error(message);
                }
            });
    }

    function handleDeleteAndAnnotateUsers(sockAccountId, deletionReason, deletionDetails, mainAccountId, annotationDetails) {
        return handleDeleteUser(sockAccountId, deletionReason, deletionDetails)
            .then(() => handleAnnotateUser(mainAccountId, annotationDetails));
    }

    function validateLength(label, s, bounds) {
        if (s.length < bounds.min || s.length > bounds.max) {
            const message = `${label} has ${s.length} characters which is outside the supported bounds of ${bounds.min} to ${bounds.max}`;
            StackExchange.helpers.showToast(
                message, {
                    transientTimeout: 3e3,
                    type: "danger"
                }
            );
            throw Error(message);
        }
    }

    function addBanEvasionModalController() {
        const banEvasionControllerConfiguration = {
            targets: ["main-account-id", "main-account-id-button", "form-elements", "delete-reason", "delete-reason-detail-text", "annotation-detail-text", "message-user-checkbox", "submit-actions-button"],
            initialize() {
                this.sockAccountId = getUserIdFromAccountInfoURL();
            },
            // Needs to be defined for typing reasons
            sockAccountId: void 0,
            get mainAccountId() {
                return Number(this["main-account-idTarget"].value);
            },
            get deletionReason() {
                return this["delete-reasonTarget"].value;
            },
            get deletionDetails() {
                return this["delete-reason-detail-textTarget"].value;
            },
            get annotationDetails() {
                return this["annotation-detail-textTarget"].value;
            },
            get shouldMessageAfter() {
                return this["message-user-checkboxTarget"].checked;
            },
            validateFields() {
                validateLength("Deletion reason details", this.deletionDetails, config.validationBounds.deleteReasonDetails);
                validateLength("Annotation details", this.annotationDetails, config.validationBounds.annotationDetails);
            },
            handleSubmitActions(ev) {
                ev.preventDefault();
                this.validateFields();
                void StackExchange.helpers.showConfirmModal({
                        title: "Are you sure you want to delete this account?",
                        body: "You will be deleting this account and placing an annotation on the main. This operation cannot be undone.",
                        buttonLabelHtml: "I'm sure"
                    })
                    .then((actionConfirmed) => {
                        if (!actionConfirmed) {
                            return;
                        }
                        handleDeleteAndAnnotateUsers(this.sockAccountId, this.deletionReason, this.deletionDetails, this.mainAccountId, this.annotationDetails)
                            .then(() => {
                                if (this.shouldMessageAfter) {
                                    window.open(`/users/message/create/${this.mainAccountId}`, "_blank");
                                }
                                window.location.reload();
                            })
                            .catch((err) => {
                                console.error(err);
                            });
                    });
            },
            handleCancelActions(ev) {
                ev.preventDefault();
                document.getElementById("beadh-modal")
                    .remove();
            },
            handleLookupMainAccount(ev) {
                ev.preventDefault();
                if (this.mainAccountId === this.sockAccountId) {
                    StackExchange.helpers.showToast("Cannot enter current account ID in parent field.", {
                        type: "danger",
                        transientTimeout: 3e3
                    });
                    return;
                }
                this["main-account-idTarget"].disabled = true;
                this["main-account-id-buttonTarget"].disabled = true;
                void this.buildRemainingFormElements();
            },
            async buildRemainingFormElements() {
                const [mainUrl, sockUrl, { email: sockEmail, name: sockRealName }] = await Promise.all([
                    fetchFullUrlFromUserId(this.mainAccountId),
                    fetchFullUrlFromUserId(this.sockAccountId),
                    getUserPii(this.sockAccountId)
                ]);
                $(this["form-elementsTarget"])
                    .append(`<div class="d-flex fd-row g6">
                            <label class="s-label">Main account located here:</label>
                            <a href="${mainUrl}" target="_blank">${mainUrl}</a>
                        </div>`)
                    .append(`
<div class="d-flex gy4 fd-column">
    <label class="s-label flex--item" for="beadh-delete-reason">Reason for deleting this user</label>
    <div class="flex--item s-select">
        <select id="beadh-delete-reason" data-beadh-form-target="delete-reason"><option value="This user was created to circumvent system or moderator imposed restrictions and continues to contribute poorly">Ban evasion</option><option value="This user is no longer welcome to participate on the site">No longer welcome</option></select>
    </div>
</div>
<div class="d-flex ff-column-nowrap gs4 gsy" data-controller="se-char-counter" data-se-char-counter-min="15" data-se-char-counter-max="600">
    <label class="s-label flex--item" for="beadh-delete-reason-details">Please provide details leading to the deletion of this account <span class="s-label--status s-label--status__required">Required</span><p class="s-description mt2"><span class="fw-bold">Reminder</span>: Markdown is not supported!</p></label>
    <textarea style="font-family:monospace" class="flex--item s-textarea" data-se-char-counter-target="field" data-is-valid-length="false" id="beadh-delete-reason-details" name="deleteReasonDetails" placeholder="Please provide at least a brief explanation of what this user has done; this will be logged with the action and may need to be referenced later." rows="6" data-beadh-form-target="delete-reason-detail-text"></textarea>
    <div data-se-char-counter-target="output"></div>
</div>
<div class="d-flex ff-column-nowrap gs4 gsy" data-controller="se-char-counter" data-se-char-counter-min="10" data-se-char-counter-max="300">
    <label class="s-label flex--item" for="beadh-mod-menu-annotation">Annotate the main account <span class="s-label--status s-label--status__required">Required</span><p class="s-description mt2"><span class="fw-bold">Reminder</span>: Markdown is not supported!</p></label>
    <textarea style="font-family:monospace" class="flex--item s-textarea" data-se-char-counter-target="field" data-is-valid-length="false" id="beadh-mod-menu-annotation" name="annotation" placeholder="Examples: &quot;possible sock of /users/XXXX, see mod room [link] for discussion&quot; or &quot;left a series of abusive comments, suspend on next occurrence&quot;" rows="4" data-beadh-form-target="annotation-detail-text"></textarea>
    <div data-se-char-counter-target="output"></div>
</div>
<div class="d-flex fd-row">
    <div class="s-check-control">
        <input id="beadh-message-user-checkbox" class="s-checkbox" type="checkbox" checked data-beadh-form-target="message-user-checkbox">
        <label class="s-label flex--item" for="beadh-message-user-checkbox">Open message user in new tab <span class="s-label--status">Optional</span></label>
    </div>
</div>`);
                const deleteDetailTextArea = this["delete-reason-detail-textTarget"];
                deleteDetailTextArea.value = buildDetailStringFromObject({
                    "Main Account": mainUrl + "\n",
                    "Email": sockEmail,
                    "Real name": sockRealName
                }, ":  ", "\n", true) + "\n\n";
                deleteDetailTextArea.focus();
                deleteDetailTextArea.setSelectionRange(deleteDetailTextArea.value.length, deleteDetailTextArea.value.length);
                this["annotation-detail-textTarget"].value = buildDetailStringFromObject({
                    "Deleted evasion account": sockUrl,
                    "Email": sockEmail,
                    "Real name": sockRealName
                }, ": ", " | ");
                this["submit-actions-buttonTarget"].disabled = false;
            }
        };
        Stacks.addController("beadh-form", banEvasionControllerConfiguration);
    }

    function runVoidOnce(fn) {
        let hasRun = false;
        return function(...args) {
            if (hasRun === false) {
                Reflect.apply(fn, this, args);
                hasRun = true;
            }
        };
    }
    const onceAddBanEvasionModalController = runVoidOnce(addBanEvasionModalController);

    function handleBanEvasionButtonClick(ev) {
        ev.preventDefault();
        onceAddBanEvasionModalController();
        const modal = document.getElementById("beadh-modal");
        if (modal !== null) {
            Stacks.showModal(modal);
        } else {
            $("body")
                .append(`
<aside class="s-modal s-modal__danger" id="beadh-modal" tabindex="-1" role="dialog" aria-hidden="false" data-controller="s-modal" data-s-modal-target="modal">
    <div class="s-modal--dialog" style="width: max-content; max-width: 65vw;" role="document" data-controller="beadh-form">
        <h1 class="s-modal--header">Delete Ban Evasion Account</h1>
        <div class="s-modal--body">
            <div class="d-flex fd-column g12 mx8" data-beadh-form-target="form-elements">
                <div class="d-flex fd-row g4 jc-space-between ai-center">
                    <label class="s-label" for="beadh-main-account-id-input" style="min-width:fit-content;">Enter ID For Main Account: </label>
                    <input data-beadh-form-target="main-account-id" class="s-input" type="number" id="beadh-main-account-id-input">
                    <button data-beadh-form-target="main-account-id-button" class="s-btn s-btn__primary" type="button" style="min-width:max-content;" data-action="beadh-form#handleLookupMainAccount">Resolve User URL</button>
                </div>
            </div>
        </div>
        <div class="d-flex gx8 s-modal--footer">
            <button class="s-btn flex--item s-btn__filled s-btn__danger" type="button" data-beadh-form-target="submit-actions-button" data-action="click->beadh-form#handleSubmitActions" disabled>Delete and Annotate</button>
            <button class="s-btn flex--item s-btn__muted" type="button" data-action="click->beadh-form#handleCancelActions">Cancel</button>
        </div>
        <button class="s-modal--close s-btn s-btn__muted" type="button" aria-label="Close" data-action="s-modal#hide"><svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14"><path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path></svg></button>
    </div>
</aside>`);
        }
    }

    function main() {
        const link = $('<a href="#" role="button">delete ban evasion account</a>');
        link.on("click", handleBanEvasionButtonClick);
        $(".list.list-reset.mod-actions li:eq(3)")
            .after(
                $("<li></li>")
                .append(link)
            );
    }
    StackExchange.ready(main);
})();

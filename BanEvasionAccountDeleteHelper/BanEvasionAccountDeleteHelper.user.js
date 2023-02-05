// ==UserScript==
// @name         Ban Evasion Account Delete Helper
// @description  Adds streamlined interface to deleting, annotating, and messaging accounts
// @homepage     https://github.com/HenryEcker/SO-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.1
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/BanEvasionAccountDeleteHelper.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/BanEvasionAccountDeleteHelper.user.js
//
// @match        *://*.stackoverflow.com/users/account-info/*
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, Stacks, $ */
(function () {
    'use strict';
    const config = {
        ids: {
            modal: 'beadh-modal',
            mainAccountIdInput: 'beadh-main-account-id-input',
            deleteReasonDetails: 'beadh-deleteReasonDetails',
            annotationDetails: 'beadh-mod-menu-annotation'
        },
        validationBounds: {
            deleteReasonDetails: {
                min: 15,
                max: 600
            },
            annotationDetails: {
                min: 10,
                max: 300
            },
        }
    };
    // User Actions
    function getUserIdFromAccountInfoURL() {
        const match = window.location.pathname.match(/users\/account-info\/(\d+)/);
        if (match === null || match.length < 2) {
            const message = 'Could not get Sock Id from URL';
            StackExchange.helpers.showToast(message, { transientTimeout: 3000, type: 'danger' });
            throw Error();
        }
        return Number(match[1]);
    }
    function fetchFullUrlFromUserId(userId) {
        return fetch(`https://stackoverflow.com/users/${userId}`, { method: 'OPTIONS' })
            .then(res => {
            return res.url;
        });
    }
    function getUserPii(userId) {
        const fd = new FormData();
        fd.set('id', `${userId}`);
        fd.set('fkey', StackExchange.options.user.fkey);
        return fetch('/admin/all-pii', { method: 'POST', body: fd })
            .then(res => res.text())
            .then(resText => {
            const html = $(resText);
            return {
                email: html[1].children[1].innerText.trim(),
                name: html[1].children[3].innerText.trim(),
                ip: html[3].children[1].innerText.trim()
            };
        });
    }
    function deleteUser(userId, deletionDetails) {
        const fd = new FormData();
        fd.set('fkey', StackExchange.options.user.fkey);
        fd.set('deleteReason', 'This user was created to circumvent system or moderator imposed restrictions and continues to contribute poorly');
        fd.set('deleteReasonDetails', deletionDetails);
        return fetch(`/admin/users/${userId}/delete`, { method: 'POST', body: fd })
            .then(res => {
            if (res.status !== 200) {
                StackExchange.helpers.showToast('Deletion unsuccessful.', { transient: false, type: 'danger' });
                console.error(res);
                throw Error('Something went wrong!');
            }
        });
    }
    function annotateUser(userId, annotationDetails) {
        const fd = new FormData();
        fd.set('fkey', StackExchange.options.user.fkey);
        fd.set('annotation', annotationDetails);
        return fetch(`/admin/users/${userId}/annotate`, { method: 'POST', body: fd })
            .then(res => {
            if (res.status !== 200) {
                StackExchange.helpers.showToast('Annotation unsuccessful.', { transient: false, type: 'danger' });
                console.error(res);
                throw Error('Something went wrong!');
            }
        });
    }
    // JQuery Component Builders
    function attachAttrs(e, attrs) {
        for (const [key, value] of Object.entries(attrs)) {
            if (key === 'className') {
                e.addClass(value);
            }
            else if (key === 'htmlFor') {
                e.attr('for', value);
            }
            else {
                e.attr(key, value);
            }
        }
        return e;
    }
    function buildLabel(text, attrs) {
        return attachAttrs($(`<label class="s-label">${text}</label>`), attrs ?? {});
    }
    function buildInput(attrs) {
        return attachAttrs($('<input class="s-input"/>'), attrs);
    }
    function buildButton(text, attrs) {
        return attachAttrs($(`<button class="s-btn">${text}</button>`), attrs ?? {});
    }
    class DeleteEvasionAccountControls {
        mainAccountUrl;
        mainAccountId;
        sockUrl;
        sockAccountId;
        sockEmail;
        sockRealName;
        deletionDetails;
        annotationDetails;
        modalBodyContainer;
        mainAccountLookupControls;
        mainAccountInfoDisplay;
        constructor(sockAccountId) {
            this.sockAccountId = sockAccountId;
            this.modalBodyContainer = $('<div class="d-flex fd-column g12 mx8"></div>');
            this.mainAccountLookupControls = $('<div class="d-flex fd-row g4 jc-space-between ai-center"></div>');
            this.mainAccountInfoDisplay = $('<div></div>');
            this.modalBodyContainer
                .append(this.mainAccountLookupControls)
                .append(this.mainAccountInfoDisplay);
            this.createMainAccountInput();
        }
        createMainAccountInput() {
            const input = buildInput({ type: 'number', id: config.ids.mainAccountIdInput });
            const checkButton = buildButton('Resolve User URL', {
                className: 's-btn__primary',
                type: 'button',
                style: 'min-width:max-content;'
            });
            checkButton.on('click', (ev) => {
                ev.preventDefault();
                // Disable so that no changes are made with this information after the fact (a refresh is required to fix this)
                input.prop('disabled', true);
                checkButton.prop('disabled', true);
                this.mainAccountId = input.val();
                void fetchFullUrlFromUserId(this.mainAccountId)
                    .then((mainUrl) => {
                    this.mainAccountUrl = mainUrl;
                    this.createMainAccountInfoDisplay();
                });
            });
            this.mainAccountLookupControls
                .append(buildLabel('Enter Id For Main Account: ', {
                htmlFor: config.ids.mainAccountIdInput,
                style: 'min-width:fit-content;'
            }))
                .append(input)
                .append(checkButton);
        }
        createMainAccountInfoDisplay() {
            this.mainAccountInfoDisplay
                .append($('<div class="d-flex fd-row g6"></div>')
                .append(buildLabel('Main account located here:'))
                .append($(`<a href=${this.mainAccountUrl} target="_blank">${this.mainAccountUrl}</a>`)));
            this.createDeleteAndAnnotateControls();
        }
        buildDeleteReasonDetailsTextarea() {
            const label = buildLabel('Please provide details leading to deleting this account (required):', {
                className: 'flex--item',
                htmlFor: config.ids.deleteReasonDetails
            });
            const textarea = $(`<textarea style="font-family:monospace" rows="6" class="flex--item s-textarea" id="${config.ids.deleteReasonDetails}" name="deleteReasonDetails" placeholder="Please provide at least a brief explanation of what this user has done; this will be logged with the action and may need to be referenced later." data-se-user-delete-form-target="detailTextarea" data-se-char-counter-target="field" data-is-valid-length="false"></textarea>`);
            this.deletionDetails = `\n\nMain Account:  ${this.mainAccountUrl}\nEmail:         ${this.sockEmail}\nReal Name:     ${this.sockRealName}`;
            textarea.val(this.deletionDetails);
            textarea.on('change', () => {
                this.deletionDetails = textarea.val();
            });
            textarea.trigger('input');
            return $(`<div class="d-flex ff-column-nowrap gs4 gsy" data-controller="se-char-counter" data-se-char-counter-min="${config.validationBounds.deleteReasonDetails.min}" data-se-char-counter-max="${config.validationBounds.deleteReasonDetails.max}"></div>`)
                .append(label)
                .append(textarea)
                .append('<div data-se-char-counter-target="output" class="cool"></div>');
        }
        buildAnnotateDetailsTextarea() {
            const label = buildLabel('Annotate the main account (required): ', {
                className: 'flex--item',
                htmlFor: config.ids.annotationDetails
            });
            const textarea = $(`<textarea style="font-family:monospace"  rows="4" class="flex--item s-textarea" id="${config.ids.annotationDetails}" name="annotation" placeholder="Examples: &quot;possible sock of /users/XXXX, see mod room [link] for discussion&quot; or &quot;left a series of abusive comments, suspend on next occurrence&quot;" data-se-char-counter-target="field" data-is-valid-length="false"></textarea>`);
            this.annotationDetails = `Deleted evasion account: ${this.sockUrl} | Email: ${this.sockEmail} | Real Name: ${this.sockRealName}`;
            textarea.val(this.annotationDetails);
            textarea.on('change', () => {
                this.annotationDetails = textarea.val();
            });
            textarea.trigger('input');
            return $(`<div class="d-flex ff-column-nowrap gs4 gsy" data-controller="se-char-counter" data-se-char-counter-min="${config.validationBounds.annotationDetails.min}" data-se-char-counter-max="${config.validationBounds.annotationDetails.max}"></div>`)
                .append(label)
                .append(textarea)
                .append('<div data-se-char-counter-target="output" class="cool"></div>');
        }
        createDeleteAndAnnotateControls() {
            void Promise.all([
                getUserPii(this.sockAccountId),
                fetchFullUrlFromUserId(this.sockAccountId)
            ])
                .then(([{ email, name }, sockUrl]) => {
                this.sockEmail = email;
                this.sockRealName = name;
                this.sockUrl = sockUrl;
                this.modalBodyContainer
                    .append(this.buildDeleteReasonDetailsTextarea())
                    .append(this.buildAnnotateDetailsTextarea());
            });
        }
        getForm() {
            return this.modalBodyContainer;
        }
        static validateLength(label, s, bounds) {
            if (s.length < bounds.min || s.length > bounds.max) {
                const message = `${label} has ${s.length} characters which is outside the supported bounds of ${bounds.min} to ${bounds.max}`;
                StackExchange.helpers.showToast(message, {
                    transientTimeout: 3000,
                    type: 'danger'
                });
                throw Error(message);
            }
        }
        validateFields() {
            DeleteEvasionAccountControls.validateLength('Deletion reason details', this.deletionDetails, config.validationBounds.deleteReasonDetails);
            DeleteEvasionAccountControls.validateLength('Annotation details', this.annotationDetails, config.validationBounds.annotationDetails);
        }
        getDeletionDetails() {
            return {
                sockAccountId: this.sockAccountId,
                deletionDetails: this.deletionDetails
            };
        }
        getAnnotationDetails() {
            return {
                mainAccountId: this.mainAccountId,
                annotationDetails: this.annotationDetails
            };
        }
    }
    function createModal() {
        const controller = new DeleteEvasionAccountControls(getUserIdFromAccountInfoURL());
        const submitButton = $('<button class="flex--item s-btn s-btn__filled s-btn__danger" type="button">Delete and Annotate</button>');
        submitButton.on('click', (ev) => {
            ev.preventDefault();
            controller.validateFields();
            void StackExchange.helpers.showConfirmModal({
                title: 'Are you sure you want to delete this account?',
                body: 'You will be deleting this account and placing an annotation on the main. This operation cannot be undone.',
                buttonLabelHtml: 'I\'m sure'
            })
                .then(res => {
                if (res) {
                    const { sockAccountId, deletionDetails } = controller.getDeletionDetails();
                    const { mainAccountId, annotationDetails } = controller.getAnnotationDetails();
                    deleteUser(sockAccountId, deletionDetails)
                        .then(() => {
                        return annotateUser(mainAccountId, annotationDetails);
                    })
                        .then(() => {
                        // Reload current page if delete and annotation is successful
                        window.location.reload();
                        // Open new tab to send message to main account
                        window.open(`/users/message/create/${mainAccountId}`, '_blank');
                    })
                        .catch(err => {
                        console.error(err);
                    });
                }
            });
        });
        // Build Modal
        return $(`<aside class="s-modal s-modal__danger" id="${config.ids.modal}" tabindex="-1" role="dialog" aria-labelledby="${config.ids.modal}-title" aria-describedby="${config.ids.modal}-description" aria-hidden="false" data-controller="s-modal" data-s-modal-target="modal">`)
            .append($('<div class="s-modal--dialog" role="document">')
            .append(`<h1 class="s-modal--header" id="${config.ids.modal}-title">Delete Ban Evasion Account</h1>`)
            .append($(`<div class="s-modal--body" id="${config.ids.modal}-description"></div>`)
            .append(controller.getForm()))
            .append($('<div class="d-flex gx8 s-modal--footer"></div>')
            .append(submitButton)
            .append('<button class="flex--item s-btn s-btn__muted" type="button" data-action="s-modal#hide">Cancel</button>'))
            .append('<button class="s-modal--close s-btn s-btn__muted" type="button" aria-label="@_s(&quot; Close&quot;)" data-action="s-modal#hide"><svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14"><path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path></svg></button>'));
    }
    function handleBanEvasionButtonClick(ev) {
        ev.preventDefault();
        const modal = document.getElementById(config.ids.modal);
        if (modal !== null) {
            Stacks.showModal(modal);
        }
        else {
            $('body').append(createModal());
        }
    }
    function main() {
        // Adds link to list of mod actions in Dashboard
        const link = $('<a href="#" role="button">delete ban evasion account</a>');
        link.on('click', handleBanEvasionButtonClick);
        $('.list.list-reset.mod-actions li:eq(3)')
            .after($('<li></li>')
            .append(link));
    }
    StackExchange.ready(() => {
        main();
    });
}());

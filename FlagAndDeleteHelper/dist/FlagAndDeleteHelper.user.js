// ==UserScript==
// @name         SE post flag and delete helper 
// @description  Adds a "Flag and remove" button to all posts that assists in raising text flags and immediately handling them
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.6
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/FlagAndDeleteHelper/dist/FlagAndDeleteHelper.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/FlagAndDeleteHelper/dist/FlagAndDeleteHelper.user.js
//
// @match        *://*.askubuntu.com/questions/*
// @match        *://*.mathoverflow.net/questions/*
// @match        *://*.serverfault.com/questions/*
// @match        *://*.stackapps.com/questions/*
// @match        *://*.stackexchange.com/questions/*
// @match        *://*.stackoverflow.com/questions/*
// @match        *://*.superuser.com/questions/*
//
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
//
// ==/UserScript==
/* globals StackExchange, Stacks, $ */
(function() {
    "use strict";

    function getFormDataFromObject(obj) {
        return Object.entries(obj).reduce((acc, [key, value]) => {
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

    function fetchPostFormDataBodyJsonResponse(endPoint, data) {
        return fetchPostFormData(endPoint, data).then((res) => res.json());
    }

    function flagPost(flagType, postId, otherText, overrideWarning, customData) {
        const data = {
            fkey: StackExchange.options.user.fkey,
            otherText: otherText ?? ""
        };
        if (overrideWarning !== void 0) {
            data["overrideWarning"] = overrideWarning;
        }
        if (customData !== void 0) {
            data["customData"] = JSON.stringify(customData);
        }
        return fetchPostFormDataBodyJsonResponse(
            `/flags/posts/${postId}/add/${flagType}`,
            data
        );
    }

    function castPostsVote(postId, voteType) {
        return fetchPostFormData(
            `/posts/${postId}/vote/${voteType}`, {
                fkey: StackExchange.options.user.fkey
            }
        );
    }

    function flagPlagiarizedContent(postId, originalSource, detailText) {
        return flagPost("PlagiarizedContent", postId, detailText, false, { plagiarizedSource: originalSource });
    }

    function flagInNeedOfModeratorIntervention(postId, detailText) {
        return flagPost("PostOther", postId, detailText);
    }

    function deletePost(postId) {
        return castPostsVote(postId, 10);
    }

    function deleteAsPlagiarism(postId) {
        return fetchPostFormData(
            `/admin/posts/${postId}/delete-as-plagiarism`, {
                fkey: StackExchange.options.user.fkey
            }
        );
    }

    function isInValidationBounds(textLength, bounds) {
        const min = bounds.min ?? 0;
        if (bounds.max === void 0) {
            return min <= textLength;
        }
        return min <= textLength && textLength <= bounds.max;
    }
    const modFlagTextLengthBounds = { min: 10, max: 500 };

    function assertValidModFlagTextLength(flagDetailLength) {
        if (!isInValidationBounds(flagDetailLength, modFlagTextLengthBounds)) {
            throw new Error(`Mod flag text must be between ${modFlagTextLengthBounds.min} and ${modFlagTextLengthBounds.max} characters.`);
        }
        return true;
    }
    const plagiarismFlagLengthBounds = {
        source: { min: 10 },
        explanation: { min: 10, max: 500 }
    };

    function assertValidPlagiarismFlagTextLengths(sourceLength, explanationLength) {
        if (!isInValidationBounds(sourceLength, plagiarismFlagLengthBounds.source)) {
            throw new Error(`Plagiarism flag source must be more than ${plagiarismFlagLengthBounds.source.min} characters.`);
        }
        if (!isInValidationBounds(explanationLength, plagiarismFlagLengthBounds.explanation)) {
            throw new Error(`Plagiarism flag explanation text must be between ${plagiarismFlagLengthBounds.explanation.min} and ${plagiarismFlagLengthBounds.explanation.max} characters.`);
        }
        return true;
    }
    const commentTextLengthBounds = { min: 15, max: 600 };

    function assertValidCommentTextLength(commentLength) {
        if (!isInValidationBounds(commentLength, commentTextLengthBounds)) {
            throw new Error(`Comment text must be between ${commentTextLengthBounds.min} and ${commentTextLengthBounds.max} characters.`);
        }
        return true;
    }

    function removeModalFromDOM(modalId) {
        const existingModal = document.getElementById(modalId);
        if (existingModal !== null) {
            Stacks.hideModal(existingModal);
            setTimeout(() => {
                existingModal.remove();
            }, 125);
        }
    }

    function getModalId(postId) {
        return "fadh-nuke-post-form-{postId}".formatUnicorn({
            postId
        });
    }

    function addComment(postId, commentText) {
        return fetchPostFormData(
            `/posts/${postId}/comments`, {
                fkey: StackExchange.options.user.fkey,
                comment: commentText
            }
        );
    }
    const gmConfigKey = "fadh-config";
    const defaultFlagTemplateConfig = JSON.stringify({
        flagType: "mod-flag",
        flagDetailTemplate: "",
        enableComment: false,
        commentTextTemplate: ""
    });
    const fadhController = {
        targets: ["submit-button", "mod-flag-radio", "plagiarism-flag-radio", "comment-enable-toggle", "mod-flag-info-area", "plagiarism-flag-info-area", "comment-info-area", "plagiarism-original-source-area", "plagiarism-detail-area", "mod-flag-area", "comment-area"],
        getFlagType(postId) {
            return document.querySelector(`input[name="${"fadh-flag-type-{postId}".formatUnicorn({ postId })}"]:checked`).value;
        },
        get plagiarismFlagOriginalSourceText() {
            return this["plagiarism-original-source-areaTarget"].value ?? "";
        },
        get plagiarismFlagDetailText() {
            return this["plagiarism-detail-areaTarget"].value ?? "";
        },
        get modFlagDetailText() {
            return this["mod-flag-areaTarget"].value ?? "";
        },
        _getRelevantDetailText(flagType) {
            switch (flagType) {
                case "mod-flag":
                    return this.modFlagDetailText;
                case "plagiarism":
                    return this.plagiarismFlagDetailText;
                default:
                    throw new Error("Invalid flag type; no corresponding text field found");
            }
        },
        _getRelevantEnableToggleTarget(flagType) {
            switch (flagType) {
                case "mod-flag":
                    return "mod-flag-radioTarget";
                case "plagiarism":
                    return "plagiarism-flag-radioTarget";
                default:
                    throw new Error("Invalid flag type; no corresponding enable toggle found");
            }
        },
        get shouldComment() {
            return this["comment-enable-toggleTarget"].checked;
        },
        get commentText() {
            return this["comment-areaTarget"].value ?? "";
        },
        _hideTargetDiv(target) {
            $(this[target]).addClass("d-none");
        },
        _showTargetDiv(target) {
            $(this[target]).removeClass("d-none");
        },
        _setupFlagUI(flagType, baseDetailText) {
            if (![1].includes(StackExchange.options.site.id)) {
                this["plagiarism-flag-radioTarget"].disabled = true;
                if (flagType === "plagiarism") {
                    flagType = "mod-flag";
                    baseDetailText = void 0;
                }
            }
            const radioTarget = this._getRelevantEnableToggleTarget(flagType);
            this[radioTarget].checked = true;
            const {
                fadhNukePostFormHidesParam,
                fadhNukePostFormShowsParam,
                fadhNukePostFormTextareaParam
            } = $(this[radioTarget]).data();
            this._hideTargetDiv(fadhNukePostFormHidesParam + "Target");
            this._showTargetDiv(fadhNukePostFormShowsParam + "Target");
            this[`${fadhNukePostFormTextareaParam}Target`].value = baseDetailText ?? "";
        },
        _setupCommentUI(shouldComment, baseCommentText) {
            this["comment-enable-toggleTarget"].checked = shouldComment;
            if (shouldComment) {
                this._showTargetDiv("comment-info-areaTarget");
                this["comment-areaTarget"].value = baseCommentText ?? "";
            } else {
                this._hideTargetDiv("comment-info-areaTarget");
            }
        },
        connect() {
            const loadedConfig = JSON.parse(
                GM_getValue(gmConfigKey, defaultFlagTemplateConfig)
            );
            this._setupFlagUI(loadedConfig.flagType, loadedConfig.flagDetailTemplate);
            this._setupCommentUI(loadedConfig.enableComment, loadedConfig.commentTextTemplate);
        },
        _assertValidCharacterLengths(flagType) {
            if (flagType === "mod-flag") {
                assertValidModFlagTextLength(this.modFlagDetailText.length);
            } else if (flagType === "plagiarism") {
                assertValidPlagiarismFlagTextLengths(this.plagiarismFlagOriginalSourceText.length, this.plagiarismFlagDetailText.length);
            } else {
                throw new Error("Cannot validate bounds for invalid flag type.");
            }
            if (this.shouldComment === true) {
                assertValidCommentTextLength(this.commentText.length);
            }
        },
        _handleFlag(flagType, postId) {
            switch (flagType) {
                case "mod-flag":
                    return handleNukeAsModFlag(postId, this.modFlagDetailText);
                case "plagiarism":
                    return handleNukeAsPlagiarism(postId, this.plagiarismFlagOriginalSourceText, this.plagiarismFlagDetailText);
                default:
                    throw new Error("Cannot run flag operation for invalid flag type");
            }
        },
        async handleNukeSubmitActions(ev) {
            ev.preventDefault();
            const jSubmitButton = $(this["submit-buttonTarget"]);
            jSubmitButton.prop("disabled", true).addClass("is-loading");
            const { postId } = ev.params;
            const flagType = this.getFlagType(postId);
            try {
                this._assertValidCharacterLengths(flagType);
                await this._handleFlag(flagType, postId);
                if (this.shouldComment) {
                    await addComment(postId, this.commentText);
                }
                window.location.reload();
            } catch (e) {
                StackExchange.helpers.showToast(e.message, { type: "danger" });
                jSubmitButton.prop("disabled", false).removeClass("is-loading");
            }
        },
        cancelHandleForm(ev) {
            ev.preventDefault();
            const { postId } = ev.params;
            removeModalFromDOM(getModalId(postId));
        },
        handleUpdateCommentControlledField(ev) {
            ev.preventDefault();
            this._setupCommentUI(ev.target.checked);
        },
        handleUpdateFlagSelection(ev) {
            ev.preventDefault();
            this._setupFlagUI(ev.target.value, "");
        },
        handleSaveCurrentConfig(ev) {
            ev.preventDefault();
            const { postId } = ev.params;
            const flagType = this.getFlagType(postId);
            const shouldComment = this.shouldComment;
            const currentConfig = {
                flagType,
                flagDetailTemplate: this._getRelevantDetailText(flagType),
                enableComment: shouldComment,
                commentTextTemplate: shouldComment ? this.commentText : ""
            };
            GM_setValue(gmConfigKey, JSON.stringify(currentConfig));
            StackExchange.helpers.showToast("Successfully saved the current configuration. The form will now open in this state until updated or wiped.", { type: "success" });
        },
        handleDeleteCurrentConfig(ev) {
            ev.preventDefault();
            GM_deleteValue(gmConfigKey);
            this.connect();
            StackExchange.helpers.showToast("The saved configuration has been wiped. The form will now open in the default state until a new configuration is saved.", { type: "info" });
        }
    };
    async function handleNukeAsModFlag(postId, otherText) {
        const flagFetch = await flagInNeedOfModeratorIntervention(postId, otherText);
        if (!flagFetch.Success) {
            throw new Error(flagFetch.Message);
        }
        const deleteFetch = await deletePost(postId);
        if (deleteFetch.status !== 200) {
            throw new Error("Something went wrong when deleting the post!");
        }
    }
    async function handleNukeAsPlagiarism(postId, originalSource, detailText) {
        const flagFetch = await flagPlagiarizedContent(postId, originalSource, detailText);
        if (!flagFetch.Success) {
            throw new Error(flagFetch.Message);
        }
        const deleteFetch = await deleteAsPlagiarism(postId);
        if (deleteFetch.status !== 200) {
            throw new Error('Something went wrong when deleting the post "as plagiarism"!');
        }
    }

    function registerFlagAndRemoveController() {
        Stacks.addController("fadh-nuke-post-form", fadhController);
    }

    function clickHandler(ev) {
        ev.preventDefault();
        const postId = $(ev.target).data("postid");
        const modalId = getModalId(postId);
        const existingModal = document.getElementById(modalId);
        if (existingModal !== null) {
            Stacks.showModal(existingModal);
        } else {
            $("body").append(`
<aside class="s-modal s-modal__danger" id="{modalId}" tabindex="-1" role="dialog" aria-hidden="true" data-controller="s-modal" data-s-modal-target="modal">
    <div class="s-modal--dialog" style="min-width:550px; width: max-content; max-width: 65vw;" role="document" data-controller="fadh-nuke-post-form se-draggable" data-fadh-nuke-post-form-post-id-value="{postId}">
        <h1 class="s-modal--header c-move" data-se-draggable-target="handle">Flag and remove {postId}</h1>
        <div class="s-modal--body" style="margin-bottom: 0;">
            <div class="d-flex fd-column g12">
                <fieldset class="s-check-group s-check-group__horizontal">
                    <legend class="s-label">I am flagging this answer as...</legend>
                    <div class="s-check-control">
                        <input class="s-radio" type="radio" name="fadh-flag-type-{postId}" id="fadh-flag-type-{postId}-1" value="mod-flag" data-fadh-nuke-post-form-target="mod-flag-radio" data-fadh-nuke-post-form-shows-param="mod-flag-info-area" data-fadh-nuke-post-form-hides-param="plagiarism-flag-info-area" data-fadh-nuke-post-form-textarea-param="mod-flag-area" data-action="fadh-nuke-post-form#handleUpdateFlagSelection" />
                        <label class="s-label" for="fadh-flag-type-{postId}-1">In need of moderator intervention</label>
                    </div>
                    <div class="s-check-control">
                        <input class="s-radio" type="radio" name="fadh-flag-type-{postId}" id="fadh-flag-type-{postId}-2" value="plagiarism" data-fadh-nuke-post-form-target="plagiarism-flag-radio" data-fadh-nuke-post-form-shows-param="plagiarism-flag-info-area" data-fadh-nuke-post-form-hides-param="mod-flag-info-area" data-fadh-nuke-post-form-textarea-param="plagiarism-detail-area" data-action="fadh-nuke-post-form#handleUpdateFlagSelection" />
                        <label class="s-label" for="fadh-flag-type-{postId}-2">Plagiarized content</label>
                    </div>
                </fieldset>
                <div class="d-flex fd-column g8 d-none" data-fadh-nuke-post-form-target="mod-flag-info-area">
                    <div class="d-flex ff-column-nowrap gs4 gsy" data-controller="se-char-counter" data-se-char-counter-min="10" data-se-char-counter-max="500">
                        <label class="s-label flex--item" for="fadh-mod-flag-area-{postId}">A problem that requires action by a moderator.</label>
                        <textarea class="flex--item s-textarea" data-se-char-counter-target="field" data-is-valid-length="false" id="fadh-mod-flag-area-{postId}" name="otherText" rows="5" data-fadh-nuke-post-form-target="mod-flag-area"></textarea>
                        <div data-se-char-counter-target="output"></div>
                    </div>
                </div>
                <div class="d-flex fd-column g8 d-none" data-fadh-nuke-post-form-target="plagiarism-flag-info-area">
                    <div class="d-flex ff-column-nowrap gs4 gsy">
                        <div class="flex--item">
                            <label class="d-block s-label" for="fadh-plagiarism-original-source-area-{postId}">Link(s) to original content</label>
                        </div>
                        <div class="d-flex ps-relative">
                            <input type="text" id="fadh-plagiarism-original-source-area-{postId}" class="s-input" name="plagiarizedSource" data-fadh-nuke-post-form-target="plagiarism-original-source-area">
                        </div>
                    </div>
                    <div class="d-flex ff-column-nowrap gs4 gsy" data-controller="se-char-counter" data-se-char-counter-min="10" data-se-char-counter-max="500">
                        <label class="s-label flex--item" for="fadh-plagiarism-detail-area-{postId}">Why do you consider this answer to be plagiarized?</label>
                        <textarea class="flex--item s-textarea" data-se-char-counter-target="field" data-is-valid-length="false" id="fadh-plagiarism-detail-area-{postId}" name="plagiarizedExplanation" rows="5" data-fadh-nuke-post-form-target="plagiarism-detail-area"></textarea>
                        <div data-se-char-counter-target="output"></div>
                    </div>
                </div>
                <div class="my6 bb bc-black-400"></div>
                <div class="d-flex ai-center g8 jc-space-between">
                    <label class="s-label" for="fadh-comment-enable-toggle-{postId}">Comment after deletion</label>
                    <input class="s-toggle-switch" id="fadh-comment-enable-toggle-{postId}" data-fadh-nuke-post-form-target="comment-enable-toggle" data-action="change->fadh-nuke-post-form#handleUpdateCommentControlledField" type="checkbox">
                </div>
                <div class="d-flex fd-column g8 d-none" data-fadh-nuke-post-form-target="comment-info-area">
                    <div class="d-flex ff-column-nowrap gs4 gsy" data-controller="se-char-counter" data-se-char-counter-min="15" data-se-char-counter-max="600">
                        <label class="s-label flex--item" for="fadh-comment-area-{postId}">Comment Text</label>
                        <textarea class="flex--item s-textarea" data-se-char-counter-target="field" data-is-valid-length="false" id="fadh-comment-area-{postId}" name="comment text" rows="5" data-fadh-nuke-post-form-target="comment-area"></textarea>
                        <div data-se-char-counter-target="output"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="d-flex gx8 s-modal--footer ai-center">
            <button class="s-btn flex--item s-btn__filled s-btn__danger" type="button" data-fadh-nuke-post-form-target="submit-button" data-action="click->fadh-nuke-post-form#handleNukeSubmitActions" data-fadh-nuke-post-form-post-id-param="{postId}">Nuke Post</button>
            <button class="s-btn flex--item s-btn__muted" type="button" data-action="click->fadh-nuke-post-form#cancelHandleForm" data-fadh-nuke-post-form-post-id-param="{postId}">Cancel</button>
            <button class="ml-auto s-btn flex--item" type="button" data-action="click->fadh-nuke-post-form#handleSaveCurrentConfig" data-fadh-nuke-post-form-post-id-param="{postId}" title="Save the current modal configuration as a template. These values will populate by default every time the modal is opened.">Save</button>
            <button class="s-btn s-btn__danger flex--item" type="button" data-action="click->fadh-nuke-post-form#handleDeleteCurrentConfig" title="Empty the modal and delete any template data from memory. This cannot be undone.">Wipe</button>
        </div>
        <button class="s-modal--close s-btn s-btn__muted" type="button" aria-label="Close" data-action="s-modal#hide"><svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14">
                <path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path>
            </svg></button>
    </div>
</aside>`.formatUnicorn({ modalId, postId }));
            window.setTimeout(() => {
                const modal = document.getElementById(modalId);
                Stacks.showModal(modal);
            }, 50);
        }
    }

    function addButtonToPosts() {
        $(".js-post-menu").each((i, n) => {
            const jsPostMenu = $(n);
            const parentElement = jsPostMenu.closest("div.question,div.answer");
            const isDeleted = parentElement.hasClass("deleted-answer");
            if (isDeleted) {
                return;
            }
            const postId = Number(parentElement.attr("data-questionid") ?? parentElement.attr("data-answerid"));
            const btn = $(`<a href="#" data-postid="${postId}">Flag and remove</a>`);
            btn.on("click", clickHandler);
            jsPostMenu.find(">div.s-anchors").append(
                $('<div class="flex--item"></div>').append(btn)
            );
        });
    }
    StackExchange.ready(() => {
        if (StackExchange.options.user.isModerator) {
            registerFlagAndRemoveController();
            addButtonToPosts();
        }
    });
})();

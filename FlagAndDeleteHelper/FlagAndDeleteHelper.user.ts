import type {ActionEvent} from '@hotwired/stimulus';
import {isInValidationBounds, type ModFlagRadioType, textAreaLimits} from './Globals';
import {
    flagInNeedOfModeratorIntervention,
    flagPlagiarizedContent
} from 'se-ts-userscript-utilities/FlaggingAndVoting/PostFlags';
import {deletePost} from 'se-ts-userscript-utilities/FlaggingAndVoting/PostVotes';
import {deleteAsPlagiarism} from 'se-ts-userscript-utilities/Moderators/HandleFlags';
import {addComment} from 'se-ts-userscript-utilities/Comments/Comments';


function getModalId(postId: number) {
    return FADHNS.JS_MODAL_ID.formatUnicorn({
        postId: postId
    });
}

function registerNukeWithFlagController() {
    Stacks.addController(
        FADHNS.CONTROLLER_NAME,
        {
            targets: FADHNS.DATA_TARGETS,
            getFlagType(postId: number): ModFlagRadioType {
                return document.querySelector<HTMLInputElement>(`input[name="${FADHNS.FLAG_RADIO_NAME.formatUnicorn({postId})}"]:checked`).value as ModFlagRadioType;
            },
            get plagiarismFlagOriginalSourceText(): string {
                return this[FADHNS.PLAGIARISM_FLAG_ORIGINAL_SOURCE_TEXT_TARGET].value ?? '';
            },
            get plagiarismFlagDetailText(): string {
                return this[FADHNS.PLAGIARISM_FLAG_DETAIL_TEXT_TARGET].value ?? '';
            },
            get modFlagDetailText(): string {
                return this[FADHNS.MOD_FLAG_DETAIL_TEXT_TARGET].value ?? '';
            },
            get shouldComment(): boolean {
                return this[FADHNS.ENABLE_COMMENT_TOGGLE_TARGET].checked as boolean;
            },
            get commentText(): string {
                return this[FADHNS.COMMENT_TEXT_TARGET].value ?? '';
            },
            connect() {
                this[FADHNS.ENABLE_COMMENT_TOGGLE_TARGET].checked = false;

                if (!this[FADHNS.ENABLE_COMMENT_TOGGLE_TARGET].checked) {
                    $(this[FADHNS.COMMENT_CONTROL_FIELDS_TARGET]).addClass('d-none');
                }
                // Right now Stack Overflow (id:1) is the only site with the plagiarism flag enabled
                // Disable this radio option for any other site
                if (!FADHNS.SUPPORTS_PLAGIARISM_FLAG_TYPE.includes(StackExchange.options.site.id)) {
                    this[FADHNS.ENABLE_PLAGIARISM_FLAG_RADIO].disabled = true;
                }
            },
            _removeModal(postId: number) {
                const existingModal = document.getElementById(getModalId(postId));
                if (existingModal !== null) {
                    Stacks.hideModal(existingModal);
                    setTimeout(() => {
                        existingModal.remove();
                    }, 50);
                }
            },
            _validateCharacterLengths(flagType: ModFlagRadioType) {
                if (flagType === 'mod-flag') {
                    if (!isInValidationBounds(this.modFlagDetailText.length, textAreaLimits.mod)) {
                        throw new Error(`Mod flag text must be between ${textAreaLimits.mod.min} and ${textAreaLimits.mod.max} characters.`);
                    }
                } else if (flagType === 'plagiarism') {
                    if (!isInValidationBounds(this.plagiarismFlagOriginalSourceText.length, textAreaLimits.plagiarismSource)) {
                        throw new Error(`Plagiarism flag source must be more than ${textAreaLimits.plagiarismSource.min} characters.`);
                    }
                    if (!isInValidationBounds(this.plagiarismFlagDetailText.length, textAreaLimits.plagiarism)) {
                        throw new Error(`Plagiarism flag explanation text must be between ${textAreaLimits.plagiarism.min} and ${textAreaLimits.plagiarism.max} characters.`);
                    }
                } else {
                    throw new Error('Cannot validate bounds for invalid flag type.');
                }
                if (this.shouldComment === true) {
                    if (!isInValidationBounds(this.commentText.length, textAreaLimits.comments)) {
                        throw new Error(`Comment text must be between ${textAreaLimits.comments.min} and ${textAreaLimits.comments.max} characters. Either update the text or disable the comment option.`);
                    }
                }
            },
            _handleFlag(flagType: ModFlagRadioType, postId: number): Promise<void> {
                switch (flagType) {
                    case 'mod-flag':
                        return handleNukeAsModFlag(postId, this.modFlagDetailText);
                    case 'plagiarism':
                        return handleNukeAsPlagiarism(postId, this.plagiarismFlagOriginalSourceText, this.plagiarismFlagDetailText);
                    default:
                        throw new Error('Cannot run flag operation for invalid flag type');
                }
            },
            async HANDLE_NUKE_SUBMIT_ACTIONS(ev: ActionEvent) {
                ev.preventDefault();
                this[FADHNS.FORM_SUBMIT_BUTTON_TARGET].disabled = true;
                const {postId} = ev.params;
                const flagType = this.getFlagType(postId);
                try {
                    this._validateCharacterLengths(flagType);
                    await this._handleFlag(flagType, postId);
                    if (this.shouldComment) {
                        await addComment(postId, this.commentText);
                    }
                    window.location.reload();
                } catch (e) {
                    StackExchange.helpers.showToast(e.message, {type: 'danger'});
                    this[FADHNS.FORM_SUBMIT_BUTTON_TARGET].disabled = false;
                }
            },
            HANDLE_CANCEL_ACTION(ev: ActionEvent) {
                ev.preventDefault();
                const {postId} = ev.params;
                this._removeModal(postId);
            },
            _hideTargetDiv(name: string) {
                $(this[`${name}Target`])
                    .addClass('d-none');
            },
            _showTargetDiv(name: string) {
                $(this[`${name}Target`])
                    .removeClass('d-none');
            },
            HANDLE_UPDATE_FLAG_TYPE_SELECTION(ev: ActionEvent) {
                ev.preventDefault();
                const {shows, hides} = ev.params;
                this._showTargetDiv(shows);
                this._hideTargetDiv(hides);
            },
            HANDLE_UPDATE_CONTROLLED_FIELD(ev: ActionEvent) {
                ev.preventDefault();
                const {controls} = ev.params;
                if ((<HTMLInputElement>ev.target).checked) {
                    this._showTargetDiv(controls);
                } else {
                    this._hideTargetDiv(controls);
                }
            }
        }
    );
}

async function handleNukeAsModFlag(postId: number, otherText: string) {
    const flagFetch = await flagInNeedOfModeratorIntervention(postId, otherText);
    if (!flagFetch.Success) {
        throw new Error(flagFetch.Message);
    }
    const deleteFetch = await deletePost(postId);
    if (deleteFetch.status !== 200) {
        throw new Error('Something went wrong when deleting the post!');
    }
}

async function handleNukeAsPlagiarism(postId: number, originalSource: string, detailText: string) {
    const flagFetch = await flagPlagiarizedContent(postId, originalSource, detailText);
    if (!flagFetch.Success) {
        throw new Error(flagFetch.Message);
    }
    const deleteFetch = await deleteAsPlagiarism(postId);
    if (deleteFetch.status !== 200) {
        throw new Error('Something went wrong when deleting the post "as plagiarism"!');
    }
}

function clickHandler(ev: Event) {
    ev.preventDefault();
    const postId = $(ev.target).data('postid');
    const modalId = getModalId(postId);
    const existingModal = document.getElementById(modalId);
    if (existingModal !== null) {
        Stacks.showModal(existingModal);
    } else {
        $('body').append(FADHNS.NUKE_FORM.formatUnicorn({modalId: modalId, postId: postId}));
        window.setTimeout(() => {
            const modal = document.getElementById(modalId);
            Stacks.showModal(modal);
        }, 50);
    }
}


function addButtonToPosts() {
    $('.js-post-menu')
        .each((i, n) => {
            const jsPostMenu = $(n);
            const parentElement = jsPostMenu.closest('div.question,div.answer');

            // For some reason deleted questions also use the semantic CSS class deleted-answer
            const isDeleted = parentElement.hasClass('deleted-answer');
            if (isDeleted) {
                // Don't render on deleted posts
                // It'd be great to make these a disabled button, but SE uses links in the mod menu and does
                // conditional rendering instead of disabled buttons here so there aren't really any supported native styles
                return;
            }

            const postId = Number(parentElement.attr('data-questionid') ?? parentElement.attr('data-answerid'));

            const btn = $(`<a href="#" data-postid="${postId}">POST_BUTTON_LABEL</a>`);

            btn.on('click', clickHandler);

            jsPostMenu.find('>div.s-anchors').append(
                $('<div class="flex--item"></div>').append(btn)
            );
        });
}

StackExchange.ready(() => {
    if (StackExchange.options.user.isModerator) {
        registerNukeWithFlagController();
        addButtonToPosts();
    }
});
import {
    flagInNeedOfModeratorIntervention,
    flagPlagiarizedContent
} from 'se-ts-userscript-utilities/FlaggingAndVoting/PostFlags';
import {deletePost} from 'se-ts-userscript-utilities/FlaggingAndVoting/PostVotes';
import {deleteAsPlagiarism} from 'se-ts-userscript-utilities/Moderators/HandleFlags';
import {getModalId, isInValidationBounds, type ModFlagRadioType, removeModal, textAreaLimits} from '../Globals';
import {type ActionEvent} from '@hotwired/stimulus';
import {addComment} from 'se-ts-userscript-utilities/Comments/Comments';


interface FlagTemplateConfig {
    flagType: ModFlagRadioType;
    flagDetailTemplate: string;
    enableComment: boolean;
    commentTextTemplate: string;
}


const gmConfigKey = 'fadh-config';
const defaultFlagTemplateConfig = JSON.stringify(<FlagTemplateConfig>{
    flagType: 'mod-flag',
    flagDetailTemplate: '',
    enableComment: false,
    commentTextTemplate: ''
});


export const fadhController = {
        targets: FADHNS.DATA_TARGETS,
        getFlagType(postId: number) {
            return document.querySelector<HTMLInputElement>(`input[name="${FADHNS.FLAG_RADIO_NAME.formatUnicorn({postId})}"]:checked`).value as ModFlagRadioType;
        },
        get plagiarismFlagOriginalSourceText() {
            return this[FADHNS.PLAGIARISM_FLAG_ORIGINAL_SOURCE_TEXT_TARGET].value ?? '';
        },
        get plagiarismFlagDetailText() {
            return this[FADHNS.PLAGIARISM_FLAG_DETAIL_TEXT_TARGET].value ?? '';
        },
        get modFlagDetailText() {
            return this[FADHNS.MOD_FLAG_DETAIL_TEXT_TARGET].value ?? '';
        },
        _getRelevantDetailText(flagType: ModFlagRadioType) {
            switch (flagType) {
                case 'mod-flag':
                    return this.modFlagDetailText;
                case 'plagiarism':
                    return this.plagiarismFlagDetailText;
                default:
                    throw new Error('Invalid flag type; no corresponding text field found');
            }
        },
        _getRelevantEnableToggleTarget(flagType: ModFlagRadioType) {
            switch (flagType) {
                case 'mod-flag':
                    return FADHNS.ENABLE_MOD_FLAG_RADIO;
                case 'plagiarism':
                    return FADHNS.ENABLE_PLAGIARISM_FLAG_RADIO;
                default:
                    throw new Error('Invalid flag type; no corresponding enable toggle found');
            }
        },
        get shouldComment() {
            return this[FADHNS.ENABLE_COMMENT_TOGGLE_TARGET].checked as boolean;
        },
        get commentText() {
            return this[FADHNS.COMMENT_TEXT_TARGET].value ?? '';
        },
        _hideTargetDiv(target: string) {
            $(this[target]).addClass('d-none');
        },
        _showTargetDiv(target: string) {
            $(this[target]).removeClass('d-none');
        },
        _setupFlagUI(flagType: ModFlagRadioType, baseDetailText?: string) {
            if (!FADHNS.SUPPORTS_PLAGIARISM_FLAG_TYPE.includes(StackExchange.options.site.id)) {
                // Disable option
                this[FADHNS.ENABLE_PLAGIARISM_FLAG_RADIO].disabled = true;
                // If flag type is plagiarism set some defaults instead
                if (flagType === 'plagiarism') {
                    flagType = 'mod-flag';
                    baseDetailText = undefined;
                }
            }
            const radioTarget = this._getRelevantEnableToggleTarget(flagType);
            this[radioTarget].checked = true;
            const {
                fadhNukePostFormHidesParam,
                fadhNukePostFormShowsParam,
                fadhNukePostFormTextareaParam,
            } = $(this[radioTarget]).data();
            this._hideTargetDiv(fadhNukePostFormHidesParam + 'Target');
            this._showTargetDiv(fadhNukePostFormShowsParam + 'Target');
            this[`${fadhNukePostFormTextareaParam}Target`].value = baseDetailText ?? '';
        },
        _setupCommentUI(shouldComment: boolean, baseCommentText?: string) {
            this[FADHNS.ENABLE_COMMENT_TOGGLE_TARGET].checked = shouldComment;
            if (shouldComment) {
                this._showTargetDiv(FADHNS.COMMENT_CONTROL_FIELDS_TARGET);
                this[FADHNS.COMMENT_TEXT_TARGET].value = baseCommentText ?? '';
            } else {
                this._hideTargetDiv(FADHNS.COMMENT_CONTROL_FIELDS_TARGET);
            }
        },
        connect() {
            const loadedConfig: FlagTemplateConfig = JSON.parse(
                GM_getValue(gmConfigKey, defaultFlagTemplateConfig)
            );
            this._setupFlagUI(loadedConfig.flagType, loadedConfig.flagDetailTemplate);
            this._setupCommentUI(loadedConfig.enableComment, loadedConfig.commentTextTemplate);
        },
        _handleFlag(flagType: ModFlagRadioType, postId: number) {
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
            const jSubmitButton = $(this[FADHNS.FORM_SUBMIT_BUTTON_TARGET]);
            jSubmitButton
                .prop('disabled', true)
                .addClass('is-loading');
            const {postId} = ev.params;
            const flagType = this.getFlagType(postId);
            try {
                validateCharacterLengths(flagType);
                await this._handleFlag(flagType, postId);
                if (this.shouldComment) {
                    await addComment(postId, this.commentText);
                }
                window.location.reload();
            } catch (e) {
                StackExchange.helpers.showToast(e.message, {type: 'danger'});
                jSubmitButton
                    .prop('disabled', false)
                    .removeClass('is-loading');
            }
        },
        HANDLE_CANCEL_ACTION(ev: ActionEvent) {
            ev.preventDefault();
            const {postId} = ev.params;
            removeModal(getModalId(postId));
        },
        HANDLE_UPDATE_COMMENT_CONTROL_FIELD(ev: ActionEvent) {
            ev.preventDefault();
            this._setupCommentUI((<HTMLInputElement>ev.target).checked);
        },
        HANDLE_UPDATE_FLAG_TYPE_SELECTION(ev: ActionEvent) {
            ev.preventDefault();
            this._setupFlagUI((<HTMLInputElement>ev.target).value as ModFlagRadioType, '');
        },
        HANDLE_SAVE_CONFIG(ev: ActionEvent) {
            ev.preventDefault();

            const {postId} = ev.params;
            const flagType = this.getFlagType(postId);
            const shouldComment = this.shouldComment;

            const currentConfig: FlagTemplateConfig = {
                flagType: flagType,
                flagDetailTemplate: this._getRelevantDetailText(flagType),
                enableComment: shouldComment,
                commentTextTemplate: shouldComment ? this.commentText : ''
            };
            GM_setValue(gmConfigKey, JSON.stringify(currentConfig));
            StackExchange.helpers.showToast('Successfully saved the current configuration. The form will now open in this state until updated or wiped.', {type: 'success'});
        },
        HANDLE_CLEAR_CONFIG(ev: ActionEvent) {
            ev.preventDefault();
            GM_deleteValue(gmConfigKey);
            this.connect(); // Rebuild without defaults
            StackExchange.helpers.showToast('The saved configuration has been wiped. The form will now open in the default state until a new configuration is saved.', {type: 'info'});
        }
    }
;

function validateCharacterLengths(flagType: ModFlagRadioType) {
    if (flagType === 'mod-flag') {
        if (!isInValidationBounds(this.modFlagDetailText.length, textAreaLimits.modFlag)) {
            throw new Error(`Mod flag text must be between ${textAreaLimits.modFlag.min} and ${textAreaLimits.modFlag.max} characters.`);
        }
    } else if (flagType === 'plagiarism') {
        if (!isInValidationBounds(this.plagiarismFlagOriginalSourceText.length, textAreaLimits.plagiarismSource)) {
            throw new Error(`Plagiarism flag source must be more than ${textAreaLimits.plagiarismSource.min} characters.`);
        }
        if (!isInValidationBounds(this.plagiarismFlagDetailText.length, textAreaLimits.plagiarismExplanation)) {
            throw new Error(`Plagiarism flag explanation text must be between ${textAreaLimits.plagiarismExplanation.min} and ${textAreaLimits.plagiarismExplanation.max} characters.`);
        }
    } else {
        throw new Error('Cannot validate bounds for invalid flag type.');
    }
    if (this.shouldComment === true) {
        if (!isInValidationBounds(this.commentText.length, textAreaLimits.comment)) {
            throw new Error(`Comment text must be between ${textAreaLimits.comment.min} and ${textAreaLimits.comment.max} characters. Either update the text or disable the comment option.`);
        }
    }
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
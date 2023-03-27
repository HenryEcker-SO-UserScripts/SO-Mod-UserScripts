import {type ModFlagRadioType} from '../Globals';
import {html_beautify} from 'js-beautify';
import {
    commentTextLengthBounds,
    modFlagTextLengthBounds,
    plagiarismFlagLengthBounds
} from 'se-ts-userscript-utilities/cjs/Validators/TextLengthValidators';

const ids = {
    modal: 'fadh-nuke-post-form-{postId}',
    enableCommentToggle: 'fadh-comment-enable-toggle-{postId}',
    plagiarismFlagOriginalSourceTextarea: 'fadh-plagiarism-original-source-area-{postId}',
    plagiarismFlagDetailTextarea: 'fadh-plagiarism-detail-area-{postId}',
    modFlagDetailTextarea: 'fadh-mod-flag-area-{postId}',
    commentTextarea: 'fadh-comment-area-{postId}'
};

const radio = {
    flagType: {
        baseId: 'fadh-flag-type-{postId}',
        name: 'fadh-flag-type-{postId}'
    }
};

const data = {
    controller: 'fadh-nuke-post-form',
    params: {
        postId: 'post-id',
        controls: 'controls',
        shows: 'shows',
        hides: 'hides',
        textarea: 'textarea'
    },
    target: {
        submitButton: 'submit-button',
        enableModFlagRadio: 'mod-flag-radio',
        enablePlagiarismFlagRadio: 'plagiarism-flag-radio',
        enableCommentToggle: 'comment-enable-toggle',
        modFlagControlFields: 'mod-flag-info-area',
        plagiarismFlagControlFields: 'plagiarism-flag-info-area',
        commentControlFields: 'comment-info-area',
        plagiarismFlagOriginalSourceTextarea: 'plagiarism-original-source-area',
        plagiarismFlagDetailTextarea: 'plagiarism-detail-area',
        modFlagTextarea: 'mod-flag-area',
        commentTextarea: 'comment-area'
    },
    action: {
        handleNukeSubmitActions: 'handleNukeSubmitActions',
        handleCancelActions: 'cancelHandleForm',
        handleUpdateFlagTypeSelection: 'handleUpdateFlagSelection',
        handleUpdateCommentControlledField: 'handleUpdateCommentControlledField',
        handleSaveConfig: 'handleSaveCurrentConfig',
        handleDeleteConfig: 'handleDeleteCurrentConfig',
    }
};

function buildFieldControlArea(target: string, innerHTML: string, isHidden = false) {
    return `
<div class="d-flex fd-column g8${isHidden ? ' d-none' : ''}" data-${data.controller}-target="${target}">${innerHTML}</div>`;
}

const modalDivider = '<div class="my6 bb bc-black-400"></div>';

function buildTextInput(labelText: string, inputId: string, name: string, dataController: string, dataTarget: string) {
    return `
<div class="d-flex ff-column-nowrap gs4 gsy">
    <div class="flex--item">
        <label class="d-block s-label" for="${inputId}">${labelText}</label>
    </div>
    <div class="d-flex ps-relative">
        <input type="text" id="${inputId}" class="s-input" name="${name}" data-${dataController}-target="${dataTarget}">
    </div>
</div>`;
}

function buildToggle(labelText: string, inputId: string, dataController: string, dataTarget: string, extraInputAttrs?: string) {
    return `
<div class="d-flex ai-center g8 jc-space-between">
    <label class="s-label" for="${inputId}">${labelText}</label>
    <input class="s-toggle-switch" 
           id="${inputId}"
           data-${dataController}-target="${dataTarget}"
            ${extraInputAttrs ?? ''}
           type="checkbox">
</div>`;
}

function buildTextarea(
    textareaId: string | number, textareaName: string, rows: string | number,
    dataController: string, dataTarget: string,
    labelText: string,
    vB: { min: number; max: number; }
) {
    return `
<div class="d-flex ff-column-nowrap gs4 gsy" 
     data-controller="se-char-counter"
     data-se-char-counter-min="${vB.min}"
     data-se-char-counter-max="${vB.max}">
     <label class="s-label flex--item" for="${textareaId}">${labelText}</label>
     <textarea class="flex--item s-textarea" 
               data-se-char-counter-target="field" 
               data-is-valid-length="false" 
               id="${textareaId}" 
               name="${textareaName}" 
               rows="${rows}" 
               data-${dataController}-target="${dataTarget}"></textarea>
     <div data-se-char-counter-target="output"></div>
</div>`;
}


function buildFlagTypeCheckbox(labelText: string, isChecked: boolean, inputValue: ModFlagRadioType, radioGroupName: string, radioId: string, dataTarget: string, shows: string, hides: string, textarea: string) {
    return `
<div class="s-check-control">
    <input class="s-radio" 
           type="radio" 
           name="${radioGroupName}" 
           id="${radioId}" 
           value="${inputValue}"
           data-${data.controller}-target="${dataTarget}"
           data-${data.controller}-${data.params.shows}-param="${shows}" 
           data-${data.controller}-${data.params.hides}-param="${hides}" 
           data-${data.controller}-${data.params.textarea}-param="${textarea}" 
           data-action="${data.controller}#${data.action.handleUpdateFlagTypeSelection}"
           ${isChecked ? ' checked' : ''}
    />
    <label class="s-label" for="${radioId}">${labelText}</label>
</div>`;
}


const nukeWithFlagForm = `
<aside class="s-modal s-modal__danger" id="{modalId}" tabindex="-1" role="dialog" aria-hidden="true" 
       data-controller="s-modal" 
       data-s-modal-target="modal">
    <div class="s-modal--dialog" style="min-width:550px; width: max-content; max-width: 65vw;" 
         role="document" 
         data-controller="${data.controller} se-draggable"
         data-${data.controller}-post-id-value="{postId}">
        <h1 class="s-modal--header c-move" data-se-draggable-target="handle">Flag and remove {postId}</h1>
        <div class="s-modal--body" style="margin-bottom: 0;">
            <div class="d-flex fd-column g12">
            <fieldset class="s-check-group s-check-group__horizontal">
                <legend class="s-label">I am flagging this answer as...</legend>
                ${buildFlagTypeCheckbox(
    'In need of moderator intervention',
    false,
    'mod-flag',
    radio.flagType.name,
    radio.flagType.baseId + '-1',
    data.target.enableModFlagRadio,
    data.target.modFlagControlFields,
    data.target.plagiarismFlagControlFields,
    data.target.modFlagTextarea
)}
                ${buildFlagTypeCheckbox(
    'Plagiarized content',
    false,
    'plagiarism',
    radio.flagType.name,
    radio.flagType.baseId + '-2',
    data.target.enablePlagiarismFlagRadio,
    data.target.plagiarismFlagControlFields,
    data.target.modFlagControlFields,
    data.target.plagiarismFlagDetailTextarea
)}
            </fieldset>
${buildFieldControlArea(
    data.target.modFlagControlFields,
    buildTextarea(
        ids.modFlagDetailTextarea,
        'otherText',
        5,
        data.controller,
        data.target.modFlagTextarea,
        'A problem that requires action by a moderator.',
        modFlagTextLengthBounds),
    true)
}
${buildFieldControlArea(
    data.target.plagiarismFlagControlFields,
    buildTextInput(
        'Link(s) to original content',
        ids.plagiarismFlagOriginalSourceTextarea,
        'plagiarizedSource',
        data.controller,
        data.target.plagiarismFlagOriginalSourceTextarea
    ) + '\n' +
    buildTextarea(
        ids.plagiarismFlagDetailTextarea,
        'plagiarizedExplanation',
        5,
        data.controller,
        data.target.plagiarismFlagDetailTextarea,
        'Why do you consider this answer to be plagiarized?',
        plagiarismFlagLengthBounds.explanation),
    true)
}
${modalDivider}
${buildToggle(
    'Comment after deletion',
    ids.enableCommentToggle,
    data.controller,
    data.target.enableCommentToggle,
    `data-action="change->${data.controller}#${data.action.handleUpdateCommentControlledField}"`
) + '\n' + buildFieldControlArea(
    data.target.commentControlFields,
    buildTextarea(
        ids.commentTextarea,
        'comment text',
        5,
        data.controller,
        data.target.commentTextarea,
        'Comment Text',
        commentTextLengthBounds),
    true
)}</div>
        </div>
    <div class="d-flex gx8 s-modal--footer ai-center">
        <button class="s-btn flex--item s-btn__filled s-btn__danger" 
                type="button"
                data-${data.controller}-target="${data.target.submitButton}"
                data-action="click->${data.controller}#${data.action.handleNukeSubmitActions}" 
                data-${data.controller}-${data.params.postId}-param="{postId}">Nuke Post</button>
        <button class="s-btn flex--item s-btn__muted" 
                type="button" 
                data-action="click->${data.controller}#${data.action.handleCancelActions}"
                data-${data.controller}-${data.params.postId}-param="{postId}">Cancel</button>
        <button class="ml-auto s-btn flex--item" 
                type="button" 
                data-action="click->${data.controller}#${data.action.handleSaveConfig}"
                data-${data.controller}-${data.params.postId}-param="{postId}"
                title="Save the current modal configuration as a template. These values will populate by default every time the modal is opened.">Save</button>
        <button class="s-btn s-btn__danger flex--item" 
                type="button" 
                data-action="click->${data.controller}#${data.action.handleDeleteConfig}"
                title="Empty the modal and delete any template data from memory. This cannot be undone.">Wipe</button>
    </div>        
    <button class="s-modal--close s-btn s-btn__muted" type="button" aria-label="Close" data-action="s-modal#hide"><svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14"><path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path></svg></button>
    </div>
</aside>`;


export default {
    JS_MODAL_ID: JSON.stringify(ids.modal),
    NUKE_FORM: `\`\n${html_beautify(nukeWithFlagForm, {preserve_newlines: false})}\``,
    FORM_SUBMIT_BUTTON_TARGET: JSON.stringify(`${data.target.submitButton}Target`),
    CONTROLLER_NAME: JSON.stringify(data.controller),
    DATA_TARGETS: [...Object.values(data.target)],
    FLAG_RADIO_NAME: JSON.stringify(radio.flagType.name),
    PLAGIARISM_FLAG_ORIGINAL_SOURCE_TEXT_TARGET: JSON.stringify(`${data.target.plagiarismFlagOriginalSourceTextarea}Target`),
    PLAGIARISM_FLAG_DETAIL_TEXT_TARGET: JSON.stringify(`${data.target.plagiarismFlagDetailTextarea}Target`),
    MOD_FLAG_DETAIL_TEXT_TARGET: JSON.stringify(`${data.target.modFlagTextarea}Target`),
    ENABLE_COMMENT_TOGGLE_TARGET: JSON.stringify(`${data.target.enableCommentToggle}Target`),
    ENABLE_MOD_FLAG_RADIO: JSON.stringify(`${data.target.enableModFlagRadio}Target`),
    ENABLE_PLAGIARISM_FLAG_RADIO: JSON.stringify(`${data.target.enablePlagiarismFlagRadio}Target`),
    COMMENT_TEXT_TARGET: JSON.stringify(`${data.target.commentTextarea}Target`),
    COMMENT_CONTROL_FIELDS_TARGET: JSON.stringify(`${data.target.commentControlFields}Target`),
    HANDLE_NUKE_SUBMIT_ACTIONS: data.action.handleNukeSubmitActions,
    HANDLE_CANCEL_ACTION: data.action.handleCancelActions,
    HANDLE_UPDATE_FLAG_TYPE_SELECTION: data.action.handleUpdateFlagTypeSelection,
    HANDLE_UPDATE_COMMENT_CONTROL_FIELD: data.action.handleUpdateCommentControlledField,
    HANDLE_SAVE_CONFIG: data.action.handleSaveConfig,
    HANDLE_CLEAR_CONFIG: data.action.handleDeleteConfig
};

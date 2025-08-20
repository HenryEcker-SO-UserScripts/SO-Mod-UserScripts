import templateManager from './TemplateManager';

export const modalId = 'usr-mmt-editor-modal';

const saveButtonId = `${modalId}-btn-save`;
const newTemplateButtonId = `${modalId}-btn-new`;
const importTemplateButtonId = `${modalId}-btn-import`;
const exportTemplatesButtonId = `${modalId}-btn-export`;
const deleteTemplateButtonId = `${modalId}-btn-delete`;
const templateListContainerId = `${modalId}-template-list-container`;

export function $messageTemplateEditorModal(): JQuery {
    const $aside = $(`<aside class="s-modal" id="${modalId}" tabindex="-1" role="dialog" aria-hidden="false"
       data-controller="s-modal" data-s-modal-target="modal">
    <div class="s-modal--dialog" style="min-width:700px; width: max-content; max-width: 65vw;" role="document"
         data-controller="se-draggable">
        <h1 class="s-modal--header c-move" data-se-draggable-target="handle">
            Mod Message Template Editor
        </h1>
        <div class="s-modal--body" style="margin-bottom: 0;">
            <div class="d-flex fd-row g12 fw-nowrap ai-center jc-center">
                <button class="s-btn flex--item s-btn__filled s-btn" type="button" id="${saveButtonId}">
                    Save Templates
                </button>
                <button class="s-btn flex--item s-btn__filled s-btn" type="button" id="${newTemplateButtonId}">
                    New Template
                </button>
                <button class="s-btn flex--item s-btn__filled s-btn" type="button" id="${importTemplateButtonId}">
                    Import Template
                </button>
                <button class="s-btn flex--item s-btn__filled s-btn" type="button" id="${exportTemplatesButtonId}">
                    Export Template(s)
                </button>
                <button class="s-btn flex--item s-btn__filled s-btn__danger" type="button" id="${deleteTemplateButtonId}">
                    Delete Template
                </button>
            </div>
            <div class="d-grid grid__auto pt16">
                <div class="grid--item" id="${templateListContainerId}"></div>
                <div class="grid--item"><input id="test1234"/></div>
            </div>
        </div>
        <div class="d-flex gx8 s-modal--footer ai-center"></div>
        <button class="s-modal--close s-btn s-btn__muted" type="button" aria-label="Close" data-action="s-modal#hide">
            <svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14">
                <path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path>
            </svg>
        </button>
    </div>
</aside>`);

    $(`#${importTemplateButtonId}`, $aside).on('click', (ev) => {
        ev.preventDefault();
        const $inputField = $('#test1234');
        void templateManager.importTemplate($inputField.val().toString())
            .then(success => {
                if (success) {
                    $inputField.val('');
                }
            });
    });

    // Populate the list of templates
    const $templateList = $('<ol>');
    for (const [index, userDefinedTemplate] of templateManager.customMessageTemplates.entries()) {
        const $elem = $(`<li draggable="true">${userDefinedTemplate.TemplateName}</li>`);
        $elem.attr('data-original-index', index);
        $elem.on('dragstart', (e: JQuery.DragStartEvent) => {
            e.originalEvent.dataTransfer.effectAllowed = 'move';
            e.originalEvent.dataTransfer.clearData();
            e.originalEvent.dataTransfer.setData('text/plain', index.toString());
        });
        $elem.on('dragover', (e: JQuery.DragOverEvent) => {
            e.preventDefault();
        });
        $elem.on('drop', (e: JQuery.DropEvent) => {
            const $srcElem = $templateList.find(`li[data-original-index=${e.originalEvent.dataTransfer.getData('text/plain')}]`);
            const $target = $(e.target);
            const currentSrcIndex = $('li', $templateList).index($srcElem);
            const currentTargetIndex = $('li', $templateList).index($target);

            if (currentTargetIndex > currentSrcIndex) {
                $srcElem.insertAfter($target);
            } else {
                $srcElem.insertBefore($target);
            }
        });
        $templateList.append($elem);
    }

    $(`#${templateListContainerId}`, $aside)
        .append($templateList);


    return $aside;
}
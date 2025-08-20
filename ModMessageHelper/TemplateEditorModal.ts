import templateManager from './TemplateManager';

export const modalId = 'usr-mmt-editor-modal';

export function $messageTemplateEditorModal(): JQuery {

    const saveButtonId = `${modalId}-btn-save`;
    const newTemplateButtonId = `${modalId}-btn-new`;
    const importTemplateButtonId = `${modalId}-btn-import`;
    const importTemplateInputField = `${modalId}-input-field`;
    const exportTemplatesButtonId = `${modalId}-btn-export`;
    const deleteTemplateButtonId = `${modalId}-btn-delete`;
    const templateListContainerId = `${modalId}-template-list-container`;

    const $aside = $(
        `<aside class="s-modal" id="${modalId}" tabindex="-1" role="dialog" aria-hidden="false"
                data-controller="s-modal" data-s-modal-target="modal">
            <div class="s-modal--dialog" style="min-width:700px; width: max-content; max-width: 65vw;" role="document"
                 data-controller="se-draggable">
                <h1 class="s-modal--header c-move" data-se-draggable-target="handle">
                    Mod Message Template Editor
                </h1>
                <div class="s-modal--body" style="margin-bottom: 0;">
                    <div class="d-flex fd-row g12 fw-nowrap ai-center">
                        <button class="s-btn flex--item s-btn__filled" type="button" id="${saveButtonId}">
                            Save Templates
                        </button>
                        <button class="s-btn flex--item s-btn__filled" type="button" id="${newTemplateButtonId}">
                            New Template
                        </button>
                        <button class="s-btn flex--item s-btn__filled" type="button" id="${exportTemplatesButtonId}">
                            Export Template(s)
                        </button>
                        <span class="flex--item fl-grow1"></span>
                        <button class="s-btn flex--item s-btn__filled s-btn__danger" type="button" id="${deleteTemplateButtonId}">
                            Delete Template
                        </button>
                    </div>
                    <div class="d-grid grid__auto pt16">
                        <div class="grid--item">
                            <div id="${templateListContainerId}" class="ws-pre-wrap"></div>
                            <div class="d-flex fd-row fw-nowrap g6 ai-center jc-space-between fl-equal">
                                <input id="${importTemplateInputField}" class="flex--item s-input"/>
                                <button class="flex--item s-btn s-btn__outlined s-btn__muted ws-nowrap" type="button" id="${importTemplateButtonId}" disabled>
                                    Import Template
                                </button>
                            </div>
                        </div>
                        <div class="grid--item"></div>
                    </div>
                </div>
                <div class="d-flex gx8 s-modal--footer ai-center"></div>
                <button class="s-modal--close s-btn s-btn__muted" type="button" aria-label="Close" data-action="s-modal#hide">
                    <svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14">
                        <path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path>
                    </svg>
                </button>
            </div>
        </aside>`
    );

    function buildImportTemplateEntryAndBtn() {
        const $importTemplateButton = $(`#${importTemplateButtonId}`, $aside);
        const $importTemplateInputField = $(`#${importTemplateInputField}`, $aside);

        $importTemplateInputField.on('input', (e: JQuery.ChangeEvent) => {
            $importTemplateButton.prop('disabled', e.target.value.trim().length === 0);
        });

        $importTemplateButton.on('click', (ev) => {
            ev.preventDefault();

            void templateManager.importFromJSONString($importTemplateInputField.val().toString())
                .then(success => {
                    if (success) {
                        // Update Templates if import is successful
                        populateTemplateList();
                    }
                })
                .finally(() => {
                    // Empty the import field
                    $importTemplateInputField.val('');
                    // Disable the button since the field was emptied
                    $importTemplateButton.prop('disabled', true);
                });
        });
    }

    function populateTemplateList() {
        const $mountPoint = $(`#${templateListContainerId}`, $aside);
        $mountPoint.empty();
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
        $mountPoint.append($templateList);
    }

    buildImportTemplateEntryAndBtn();
    populateTemplateList();
    return $aside;
}
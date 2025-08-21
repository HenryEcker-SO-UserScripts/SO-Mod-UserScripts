import {type UserDefinedMessageTemplate} from './ModMessageTypes';
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

    const templateFormId = `${modalId}-template-form`;
    const templateFormTemplateNameInputFieldId = `${modalId}-template-form-name-field`;
    const templateFormTemplateBodyInputFieldId = `${modalId}-template-form-body-field`;

    const $aside = $(
        `<aside class="s-modal" id="${modalId}" tabindex="-1" role="dialog" aria-hidden="false"
                data-controller="s-modal" data-s-modal-target="modal">
            <div class="s-modal--dialog" style="min-width:825px; width: max-content; max-width: 1250px;" role="document"
                 data-controller="se-draggable">
                <h1 class="s-modal--header c-move" data-se-draggable-target="handle">
                    Mod Message Template Editor
                </h1>
                <div class="s-modal--body" style="margin-bottom: 0;">
                    <div class="d-grid pt16 g12" style="grid-template-columns: minmax(225px, max-content) minmax(550px, 1fr)">
                        <div class="grid--item">
                            <h2 class="fs-subheading fw-bold">Available Templates</h2>
                            <div id="${templateListContainerId}" class="ws-pre-wrap ff-mono fs-body1"></div>
                            <div class="d-flex fd-row fw-nowrap g6 ai-center jc-space-between fl-equal">                                
                                <input id="${importTemplateInputField}" class="flex--item s-input"/>
                                <button class="flex--item s-btn s-btn__outlined s-btn__muted ws-nowrap" type="button" id="${importTemplateButtonId}" disabled>
                                    Import Template
                                </button>
                            </div>
                        </div>
                        <div class="grid--item">
                           <form id="${templateFormId}" class="d-flex fd-column g12 mb8">
                                <div class="d-flex gy4 fd-column">
                                    <label class="s-label" for="${templateFormTemplateNameInputFieldId}">Template Name</label>
                                    <input class="s-input" id="${templateFormTemplateNameInputFieldId}" type="text" placeholder="Be descriptive as this is what appears in user history." name="TemplateName">
                                </div>
                                <div class="d-flex fd-column gy4">
                                    <label class="flex--item s-label" for="${templateFormTemplateBodyInputFieldId}">Template Body</label>
                                    <textarea id="${templateFormTemplateBodyInputFieldId}" 
                                              class="flex--item s-textarea hs3 overflow-y-auto"
                                              placeholder="This will appear as the body of the template. Do not include header, suspension, or footer information. This happens automatically."></textarea>
                                </div>
                            </form>
                            <div class="d-flex fd-row g12 fw-nowrap ai-center jc-space-between">
                                <button class="s-btn flex--item s-btn__filled" type="button" id="${newTemplateButtonId}">
                                    New Template
                                </button>
                                <button class="s-btn flex--item s-btn__filled" type="button" id="${saveButtonId}">
                                    Save Template
                                </button>
                                <button class="s-btn flex--item s-btn__filled" type="button" id="${exportTemplatesButtonId}">
                                    Export Template(s)
                                </button>
                                <button class="s-btn flex--item s-btn__filled s-btn__danger" type="button" id="${deleteTemplateButtonId}" disabled>
                                    Delete Template
                                </button>
                            </div>
                        </div>
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


    const activeListStyleClass = 'fc-theme-secondary';

    const SelectedTemplateManager = {
        selected: -1,
        get active() {
            return this.selected;
        },
        set active(newIndex: number) {
            this.selected = newIndex;
            // Clear out any existing styles
            $(`#${templateListContainerId} li`, $aside)
                .removeClass(activeListStyleClass);

            // Bail here if selected index is invalid
            if (!templateManager.has(this.selected)) {
                this.selected = -1;
                return;
            }
            // Lookup from template manager and fill in form fields
            populateFormFromTemplate(templateManager.lookupByIndex(this.selected));
            // Give Active Styling to selected index
            $(`#${templateListContainerId} li:eq(${this.selected})`, $aside)
                .addClass(activeListStyleClass);
            // Enable Delete Button
            $(`#${deleteTemplateButtonId}`, $aside).prop('disabled', false);
        },
        reset() {
            this.active = 0;
        }
    };

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
                    // Update Selection
                    SelectedTemplateManager.reset();
                });
        });
    }

    function populateTemplateList() {
        const $mountPoint = $(`#${templateListContainerId}`, $aside);
        $mountPoint.empty();
        const $templateList = $('<ol>');
        for (const [index, userDefinedTemplate] of templateManager.customMessageTemplates.entries()) {
            const $elem = $(`<li class="mb4" draggable="true">${userDefinedTemplate.TemplateName}</li>`);
            if (index === SelectedTemplateManager.active) {
                $elem.addClass(activeListStyleClass);
            }
            $elem.on('click', (e: JQuery.ClickEvent) => {
                e.preventDefault();
                SelectedTemplateManager.active = index;
            });
            $elem.on('dragstart', (e: JQuery.DragStartEvent) => {
                e.originalEvent.dataTransfer.effectAllowed = 'move';
                e.originalEvent.dataTransfer.clearData();
                e.originalEvent.dataTransfer.setData('text/plain', index.toString());
            });
            $elem.on('dragover', (e: JQuery.DragOverEvent) => {
                e.preventDefault();
            });
            $elem.on('drop', (e: JQuery.DropEvent) => {
                const $target = $(e.target);
                const currentTargetIndex = $('li', $templateList).index($target);
                // Move from src to target
                templateManager.move(Number(e.originalEvent.dataTransfer.getData('text/plain')), currentTargetIndex);
                // Update active number to be target index
                SelectedTemplateManager.active = currentTargetIndex;
                // Repopulate List
                populateTemplateList();
            });
            $templateList.append($elem);
        }
        $mountPoint.append($templateList);
    }


    function populateFormFromTemplate(template: UserDefinedMessageTemplate) {
        $(`#${templateFormTemplateNameInputFieldId}`, $aside).val(template.TemplateName);
        $(`#${templateFormTemplateBodyInputFieldId}`, $aside).val(template.TemplateBody);
    }

    function handleSubmitForm(ev: JQuery.SubmitEvent) {
        ev.preventDefault();
    }

    $(`#${templateFormId}`, $aside).on('submit', handleSubmitForm);

    buildImportTemplateEntryAndBtn();


    populateTemplateList();
    // After populating Template List for the first time select the first
    SelectedTemplateManager.reset();

    // Wire up delete button
    $(`#${deleteTemplateButtonId}`, $aside).on('click', async (ev: JQuery.ClickEvent) => {
        ev.preventDefault();
        await templateManager.delete(SelectedTemplateManager.active);
        // Repopulate List
        populateTemplateList();
        // Previous no longer exists
        SelectedTemplateManager.reset();
    });
    return $aside;
}
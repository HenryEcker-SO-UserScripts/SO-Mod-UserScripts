import {type UserDefinedMessageTemplate} from './ModMessageTypes';
import templateManager from './TemplateManager';

export const modalId = 'usr-mmt-editor-modal';

export function $messageTemplateEditorModal(): JQuery {
    // IDs
    const saveButtonId = `${modalId}-btn-save`;
    const newTemplateButtonId = `${modalId}-btn-new`;
    const importTemplateButtonId = `${modalId}-btn-import`;
    const importTemplateInputField = `${modalId}-input-field`;
    const exportTemplatesButtonId = `${modalId}-btn-export`;
    const deleteTemplateButtonId = `${modalId}-btn-delete`;
    const templateListContainerId = `${modalId}-template-list-container`;

    const rightGridColContainer = `${modalId}-right-grid`;

    const templateFormId = `${modalId}-template-form`;
    const templateFormTemplateNameInputFieldId = `${modalId}-template-form-name-field`;
    const templateFormDefaultSuspendDays = `${modalId}-template-form-default-suspend-days-field`;
    const templateFormTemplateBodyInputFieldId = `${modalId}-template-form-body-field`;
    const templateFormStackOverflowOnly = `${modalId}-template-form-stackoverflow-only-checkbox`;
    const templateFormIncludeSuspensionFooter = `${modalId}-template-form-include-suspension-footer-checkbox`;

    const exportOutputTextarea = `${modalId}-template-export-output-text`;

    function listMemberId(n: number) {
        return `${modalId}-export-list-member-${n}`;
    }

    // CSS Classes
    const exportSelectedCheckbox = `${modalId}-export-checkbox-selector`;
    const activeListStyleClass = 'fc-theme-secondary';

    // Labels
    const exportButtonLabel = 'Export Template(s)';

    // Properties
    const exportButtonDataProp = 'data-export-mode';

    const $aside = $(
        `<aside class="s-modal" id="${modalId}" tabindex="-1" role="dialog" aria-hidden="false"
               data-controller="s-modal" data-s-modal-target="modal">
            <div class="s-modal--dialog"
                 style="min-width:825px; width: max-content; max-width: 1250px; max-height: 92vh; padding:1rem;" role="document"
                 data-controller="se-draggable">
                <h1 class="s-modal--header c-move" data-se-draggable-target="handle">
                    Mod Message Template Editor
                </h1>
                <div class="s-modal--body" style="margin-bottom: 0;">
        
                    <div class="d-flex fd-row g12 fw-nowrap ai-center jc-space-between">
                        <div class="d-flex fd-row fw-nowrap g6 ai-center jc-start fl-equal">
                            <input id="${importTemplateInputField}" class="flex--item s-input wmx3"/>
                            <button class="flex--item s-btn s-btn__outlined s-btn__muted ws-nowrap" type="button"
                                    id="${importTemplateButtonId}" disabled>
                                Import Template
                            </button>
                        </div>
                        <div class="d-flex fd-row fw-nowrap g12 ai-center jc-end fl-equal">
                            <button class="s-btn flex--item s-btn__filled ws-nowrap" type="button" id="${newTemplateButtonId}">
                                New Template
                            </button>
                            <button class="s-btn flex--item s-btn__filled ws-nowrap" type="button" id="${saveButtonId}" disabled>
                                Save Template
                            </button>
                            <button class="s-btn flex--item s-btn__filled ws-nowrap" type="button" id="${exportTemplatesButtonId}" ${exportButtonDataProp}="true">
                                ${exportButtonLabel}
                            </button>
                            <button class="s-btn flex--item s-btn__filled s-btn__danger ws-nowrap" type="button"
                                    id="${deleteTemplateButtonId}" disabled>
                                Delete Template
                            </button>
                        </div>
                    </div>
                    <div class="d-grid pt8 g12" style="grid-template-columns: minmax(225px, max-content) minmax(550px, 1fr);">
                        <div class="grid--item px6" style="max-height: 65vh; overflow-y:scroll;">
                            <h2 class="fs-subheading fw-bold">Available Templates</h2>
                            <div id="${templateListContainerId}" class="ws-pre-wrap ff-mono fs-body1"></div>
                        </div>
                        <div class="grid--item px6" style="max-height: 65vh; overflow-y:scroll;" id="${rightGridColContainer}"></div>
                    </div>
                    <div class="d-flex gx8 s-modal--footer ai-center"></div>
                    <button class="s-modal--close s-btn s-btn__muted" type="button" aria-label="Close"
                            data-action="s-modal#hide">
                        <svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14">
                            <path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </aside>`
    );

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
                        buildTemplateSelectorList();
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

    function buildTemplateSelectorList() {
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
                buildTemplateSelectorList();
            });
            $templateList.append($elem);
        }
        $mountPoint.append($templateList);
    }

    function buildExportTemplateList() {
        const $mountPoint = $(`#${templateListContainerId}`, $aside);
        $mountPoint.empty();
        const $templateList = $('<div>');
        for (const [index, userDefinedTemplate] of templateManager.customMessageTemplates.entries()) {
            const $elem = $('<div class="s-check-control mb4"></div>');
            const $label = $(`<label class="s-label" for="${listMemberId(index)}">${userDefinedTemplate.TemplateName}</label>`);
            const $input = $(`<input class="s-checkbox" type="checkbox" id="${listMemberId(index)}" data-template-index="${index}"/>`);
            $input.on('change', (ev: JQuery.ChangeEvent) => {
                if (ev.target.checked) {
                    $(ev.target).addClass(exportSelectedCheckbox);
                } else {
                    $(ev.target).removeClass(exportSelectedCheckbox);
                }
                populateExportTemplateTextarea();
            });
            $elem.append($label).append($input);
            $templateList.append($elem);
        }
        $mountPoint.append($templateList);

        function buttonHandler(checked: boolean) {
            function evHandler(ev: JQuery.ClickEvent) {
                ev.preventDefault();
                $('input.s-checkbox', $templateList).prop('checked', checked).trigger('change');
            }

            return evHandler;
        }

        const $selectAllBtn = $('<button class="s-btn s-btn__outlined">Select All </button>');
        $selectAllBtn.on('click', buttonHandler(true));

        const $deselectAllBtn = $('<button class="s-btn s-btn__danger s-btn__outlined">Clear All </button>');
        $deselectAllBtn.on('click', buttonHandler(false));

        $mountPoint.append(
            $('<div class="mt12 d-flex fd-row fw-nowrap g6 jc-space-between"></div>')
                .append($selectAllBtn)
                .append($deselectAllBtn)
        );
    }

    function populateFormFromTemplate(template: UserDefinedMessageTemplate) {
        $(`#${templateFormTemplateNameInputFieldId}`, $aside).val(template.TemplateName);
        $(`#${templateFormDefaultSuspendDays}`, $aside).val(template.DefaultSuspendDays ?? 0);
        $(`#${templateFormTemplateBodyInputFieldId}`, $aside).val(template.TemplateBody);
        $(`#${templateFormStackOverflowOnly}`, $aside).prop('checked', template.StackOverflowOnly ?? false);
        $(`#${templateFormIncludeSuspensionFooter}`, $aside).prop('checked', template.IncludeSuspensionFooter ?? true);
    }

    function buildForm() {
        const $mountPoint = $(`#${rightGridColContainer}`, $aside);
        $mountPoint.empty();
        /*
        TODO:
         Add AnalogousSuspendReason Select ComboBox
         */
        const $form = $(
            `<form id="${templateFormId}" class="d-flex fd-column g12 mb8">
                <div class="d-flex gy4 fd-column">
                    <label class="s-label" for="${templateFormTemplateNameInputFieldId}">Template Name</label>
                    <input class="s-input" id="${templateFormTemplateNameInputFieldId}" type="text"
                           placeholder="Be descriptive as this is what appears in user history."
                           name="TemplateName">
                </div>
                <div class="d-flex gy4 fd-column">
                    <label class="s-label" for="${templateFormDefaultSuspendDays}">Default Suspend Days</label>
                    <input class="s-input" 
                           id="${templateFormDefaultSuspendDays}" 
                           type="number"
                           min="0"
                           max="365"
                           name="DefaultSuspendDays">
                </div>
                <div class="d-flex fd-column gy4">
                    <label class="flex--item s-label" for="${templateFormTemplateBodyInputFieldId}">Template Body</label>
                    <textarea id="${templateFormTemplateBodyInputFieldId}"
                              name="TemplateBody"
                              class="flex--item s-textarea hmn3 wmx5"
                              style="resize: vertical;field-sizing: content;"
                              placeholder="This will appear as the body of the template. Do not include header, suspension, or footer information. This happens automatically."></textarea>
                </div>
                <div class="d-flex ai-center g8">
                    <label class="s-label" for="${templateFormStackOverflowOnly}">Stack Overflow Only</label>
                    <input class="s-toggle-switch" id="${templateFormStackOverflowOnly}" type="checkbox" name="StackOverflowOnly">
                </div>
                <div class="d-flex ai-center g8">
                    <label class="s-label" for="${templateFormIncludeSuspensionFooter}">Include Suspension Footer</label>
                    <input class="s-toggle-switch" id="${templateFormIncludeSuspensionFooter}" type="checkbox" checked name="IncludeSuspensionFooter">
                </div>
            </form>`
        );


        function handleSubmitForm(ev: JQuery.SubmitEvent) {
            ev.preventDefault();
        }

        const $defaultSuspendDaysInput = $(`#${templateFormDefaultSuspendDays}`, $form);
        $defaultSuspendDaysInput.on('input', (ev) => {
            const $target = $(ev.target);
            const value = Number($target.val());
            const inputMin = Number($target.attr('min'));
            const inputMax = Number($target.attr('max'));

            $target.val(Math.max(inputMin, Math.min(value, inputMax)));
        });

        $form.on('submit', handleSubmitForm);
        $mountPoint.append($form);
    }

    function populateExportTemplateTextarea() {
        const templateIndexes: number[] = $(`.${exportSelectedCheckbox}`).map((_, n) => $(n).data('template-index')).toArray();
        const jsonString = templateManager.exportToJsonString(templateIndexes);
        $(`#${exportOutputTextarea}`, $aside).val(jsonString);
    }

    function buildExportTextarea() {
        const $mountPoint = $(`#${rightGridColContainer}`, $aside);
        $mountPoint.empty();
        $mountPoint.append($(
            `<div class="wmx5">
                <h2 class="fs-subheading">Copy this text to share/save the export. Paste this into the input field next to the 'Import Template' button to import.</h2>
                <textarea id="${exportOutputTextarea}" class="flex--item s-textarea hmn3 hmx5" style="resize: vertical;">[]</textarea>
            </div>`
        ));
    }

    buildImportTemplateEntryAndBtn();

    function buildTemplateExporter() {
        buildExportTemplateList();
        buildExportTextarea();
    }


    function buildTemplateEditor() {
        buildTemplateSelectorList();
        buildForm();

        // After populating Template List and Building the Form for the first time select the first
        SelectedTemplateManager.reset();
    }

    buildTemplateEditor();


    const $newTemplateButton = $(`#${newTemplateButtonId}`, $aside);
    const $saveButton = $(`#${saveButtonId}`, $aside);
    const $exportButton = $(`#${exportTemplatesButtonId}`, $aside);
    const $deleteTemplateButton = $(`#${deleteTemplateButtonId}`, $aside);

    // Wire Up Export Button

    $exportButton.on('click', (ev: JQuery.ClickEvent) => {
        ev.preventDefault();
        const $target = $(ev.target);
        const toExportMode = $target.attr(exportButtonDataProp) === 'true';
        if (toExportMode) {
            buildTemplateExporter();
            $target.text('Leave Export');
        } else {
            buildTemplateEditor();
            $target.text(exportButtonLabel);
        }
        $newTemplateButton.prop('disabled', toExportMode);
        $saveButton.prop('disabled', toExportMode);
        $deleteTemplateButton.prop('disabled', toExportMode);

        $target.attr(exportButtonDataProp, (!toExportMode).toString());
    });

    // Wire up delete button
    $deleteTemplateButton.on('click', async (ev: JQuery.ClickEvent) => {
        ev.preventDefault();
        await templateManager.delete(SelectedTemplateManager.active);
        // Repopulate List
        buildTemplateSelectorList();
        // Previous no longer exists
        SelectedTemplateManager.reset();
    });


    return $aside;
}
import {parentName, parentUrl} from './ModMessageConstants';
import {type BooleanString, SystemReasonIdList, type UserDefinedMessageTemplate} from './ModMessageTypes';
import templateManager from './TemplateManager';
import {InfoSvgHtmlString} from './Icons';

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
    const templateFormAnalogousSystemReasonId = `${modalId}-template-form-analogous-system-reason-id-select`;
    const templateFormDefaultSuspendDays = `${modalId}-template-form-default-suspend-days-field`;
    const templateFormTemplateBodyInputFieldId = `${modalId}-template-form-body-field`;
    const templateFormStackOverflowOnly = `${modalId}-template-form-stackoverflow-only-checkbox`;
    const templateFormIncludeSuspensionFooter = `${modalId}-template-form-include-suspension-footer-checkbox`;

    const exportOutputTextarea = `${modalId}-template-export-output-text`;

    function listMemberId(n: number) {
        return `${modalId}-export-list-member-${n}`;
    }

    const modalCloseButtonId = `${modalId}-close-button`;

    // CSS Classes
    const exportSelectedCheckbox = `${modalId}-export-checkbox-selector`;
    const formValidationMessage = `${modalId}-form-validation-message`;
    const activeListStyleClass = 'fc-theme-secondary';

    // Labels
    const exportButtonLabel = 'Export Template(s)';

    // Properties
    const formTemplateNewModeProp = 'data-new-template';
    const formIsDirtyProp = 'data-form-is-dirty';
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
                    <div style="display:grid;grid-template-columns:repeat(2, max-content) 1fr;gap:20px;">
                        <div class="d-flex fd-row fw-nowrap g12 ai-center">
                            <button class="s-btn flex--item s-btn__outlined ws-nowrap" type="button" id="${newTemplateButtonId}">
                                New Template
                            </button>
                            <button class="s-btn flex--item s-btn__filled ws-nowrap" type="button" id="${saveButtonId}" disabled>
                                Save Template
                            </button>
                        </div>
                        <div class="d-flex fd-row fw-nowrap g6 ai-center">
                            <input id="${importTemplateInputField}" class="flex--item s-input wmn2 wmx3"/>
                            <button class="flex--item s-btn s-btn__outlined s-btn__muted ws-nowrap" type="button"
                                    id="${importTemplateButtonId}" disabled>
                                Import Template
                            </button>
                            <button class="s-btn flex--item s-btn__outlined s-btn__muted ws-nowrap" type="button" id="${exportTemplatesButtonId}" ${exportButtonDataProp}="false">
                                ${exportButtonLabel}
                            </button>
                        </div>
                        <div class="d-flex fd-row fw-nowrap g12 ai-center jc-end">
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
                            id="${modalCloseButtonId}">
                        <svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14">
                            <path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </aside>`
    );

    const ElementManager = {
        // Forms
        get $templateEditorForm() {
            return $(`#${templateFormId}`, $aside);
        },
        templateEditorFormIsDirty(): boolean {
            return this.$templateEditorForm.attr(formIsDirtyProp) === 'true';
        },
        setTemplateEditorFormIsDirty(mode: BooleanString) {
            this.$templateEditorForm.attr(formIsDirtyProp, mode);
            this.$saveButton.prop('disabled', mode === 'false');
        },
        isTemplateEditorFormInNewMode(): boolean {
            return this.$templateEditorForm.attr(formTemplateNewModeProp) === 'true';
        },
        setTemplateEditorFormNewMode(mode: BooleanString) {
            this.$templateEditorForm.attr(formTemplateNewModeProp, mode);
            this.$deleteTemplateButton.prop('disabled', mode === 'true');
            if (mode === 'true') {
                SelectedTemplateManager.active = -1;
            }
        },
        // Form Fields
        get $importTemplateInputField(): JQuery<HTMLInputElement> {
            return $(`#${importTemplateInputField}`, $aside);
        },
        get $exportOutputTextArea(): JQuery<HTMLTextAreaElement> {
            return $(`#${exportOutputTextarea}`, $aside);
        },
        get $templateFormTemplateNameInputField(): JQuery<HTMLInputElement> {
            return $(`#${templateFormTemplateNameInputFieldId}`, $aside);
        },
        get $templateFormAnalogousSystemReasonSelect(): JQuery<HTMLSelectElement> {
            return $(`#${templateFormAnalogousSystemReasonId}`, $aside);
        },
        get $templateFormDefaultSuspendDays(): JQuery<HTMLInputElement> {
            return $(`#${templateFormDefaultSuspendDays}`, $aside);
        },
        get $templateFormTemplateBodyInputField(): JQuery<HTMLInputElement> {
            return $(`#${templateFormTemplateBodyInputFieldId}`, $aside);
        },
        get $templateFormStackOverflowOnly(): JQuery<HTMLInputElement> {
            return $(`#${templateFormStackOverflowOnly}`, $aside);
        },
        get $templateFormIncludeSuspensionFooter(): JQuery<HTMLInputElement> {
            return $(`#${templateFormIncludeSuspensionFooter}`, $aside);
        },
        // Buttons
        get $importTemplateButton(): JQuery<HTMLButtonElement> {
            return $(`#${importTemplateButtonId}`, $aside);
        },
        get $newTemplateButton(): JQuery<HTMLButtonElement> {
            return $(`#${newTemplateButtonId}`, $aside);
        },
        get $saveButton() {
            return $(`#${saveButtonId}`, $aside);
        },
        get $exportButton() {
            return $(`#${exportTemplatesButtonId}`, $aside);
        },
        isExportMode(): boolean {
            return this.$exportButton.attr(exportButtonDataProp) === 'true';
        },
        setExportMode(mode: BooleanString) {
            this.$exportButton.attr(exportButtonDataProp, mode);

            const shouldDisable = mode === 'true';
            this.$importTemplateInputField.prop('disabled', shouldDisable);
            this.$newTemplateButton.prop('disabled', shouldDisable);
            // Changing modes should always leave save button disabled
            this.$saveButton.prop('disabled', true);
            this.$deleteTemplateButton.prop('disabled', shouldDisable);
        },
        get $deleteTemplateButton(): JQuery<HTMLButtonElement> {
            return $(`#${deleteTemplateButtonId}`, $aside);
        },
        get $modalCloseButton(): JQuery<HTMLButtonElement> {
            return $(`#${modalCloseButtonId}`, $aside);
        },
        // Containers
        get $templateListContainer(): JQuery<HTMLDivElement> {
            return $(`#${templateListContainerId}`, $aside);
        },
        get $rightGridColContainer(): JQuery<HTMLDivElement> {
            return $(`#${rightGridColContainer}`, $aside);
        },
        // CSS Class Selectors
        get $allSelectedExportCheckboxes(): JQuery<HTMLInputElement> {
            return $(`.${exportSelectedCheckbox}`);
        },
        get $allValidationMessages(): JQuery {
            return $(`.${formValidationMessage}`);
        },
        setNearestValidationMessage($input: JQuery<HTMLInputElement>, validationClass: 'has-warning' | 'has-error' | 'has-success', validationText: string) {
            $input.siblings(`.${formValidationMessage}`).removeClass('d-none').text(validationText);
            $input.parent().addClass(validationClass);
        },
        clearValidationMessages() {
            this.$allValidationMessages.addClass('d-none');

            this.$allValidationMessages
                .parent()
                .removeClass('has-warning')
                .removeClass('has-error')
                .removeClass('has-success');
        }
    };

    const SelectedTemplateManager = {
        selected: -1,
        get active() {
            return this.selected;
        },
        set active(newIndex: number) {
            this.selected = newIndex;
            // Clear out any existing styles
            ElementManager
                .$templateListContainer
                .find('li')
                .removeClass(activeListStyleClass);

            // Bail here if selected index is invalid
            if (!templateManager.has(this.selected)) {
                this.selected = -1;
                return;
            }
            // Lookup from template manager and fill in form fields
            populateFormFromTemplate(templateManager.lookupByIndex(this.selected));
            // Give Active Styling to selected index
            ElementManager
                .$templateListContainer
                .find(`li:eq(${this.selected})`)
                .addClass(activeListStyleClass);
            // Enable Delete Button
            ElementManager.$deleteTemplateButton.prop('disabled', false);
        },
        reset() {
            this.active = 0;
        }
    };

    async function dirtyNavigationConfirmModal(): Promise<boolean> {
        if (ElementManager.templateEditorFormIsDirty()) {
            return StackExchange.helpers.showConfirmModal({
                title: 'Pending Changes',
                bodyHtml: '<div><p>There are unsaved changes in the template!</p><p>Are you sure that you want to navigate away?</p></div>',
                buttonLabel: 'Discard Changes'
            });
        }
        return true;
    }

    function buildTemplateSelectorList() {
        const $mountPoint = ElementManager.$templateListContainer;
        $mountPoint.empty();
        const $templateList = $('<ol>');
        for (const [index, userDefinedTemplate] of templateManager.customMessageTemplates.entries()) {
            const $elem = $(`<li class="mb4" draggable="true">${userDefinedTemplate.TemplateName}</li>`);
            if (index === SelectedTemplateManager.active) {
                $elem.addClass(activeListStyleClass);
            }
            $elem.on('click', async (e: JQuery.ClickEvent) => {
                e.preventDefault();
                if (SelectedTemplateManager.active === index) {
                    // Do nothing if clicking the already active index
                    return;
                }
                if (!await dirtyNavigationConfirmModal()) {
                    return;
                }
                SelectedTemplateManager.active = index;
                ElementManager.setTemplateEditorFormNewMode('false');
            });
            $elem.on('dragstart', (e: JQuery.DragStartEvent) => {
                e.originalEvent.dataTransfer.effectAllowed = 'move';
                e.originalEvent.dataTransfer.clearData();
                e.originalEvent.dataTransfer.setData('text/plain', index.toString());
            });
            $elem.on('dragover', (e: JQuery.DragOverEvent) => {
                e.preventDefault();
            });
            $elem.on('drop', async (e: JQuery.DropEvent) => {
                if (ElementManager.templateEditorFormIsDirty()) {
                    const shouldNavigate = await StackExchange.helpers.showConfirmModal({
                        title: 'Pending Changes',
                        bodyHtml: '<div><p>There are unsaved changes in the template!</p><p>Reordering will discard these changes.</p><p>Are you sure you want to reorder these items?</p></div>',
                        buttonLabel: 'Discard Changes'
                    });
                    if (!shouldNavigate) {
                        return;
                    }
                }

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
        const $mountPoint = ElementManager.$templateListContainer;
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
        ElementManager.$templateFormTemplateNameInputField.val(template.TemplateName);
        ElementManager.$templateFormAnalogousSystemReasonSelect.val(template.AnalogousSystemReasonId ?? 'OtherViolation');
        ElementManager.$templateFormDefaultSuspendDays.val(template.DefaultSuspendDays ?? 0);
        ElementManager.$templateFormTemplateBodyInputField.val(template.TemplateBody);
        ElementManager.$templateFormStackOverflowOnly.prop('checked', template.StackOverflowOnly ?? false);
        ElementManager.$templateFormIncludeSuspensionFooter.prop('checked', template.IncludeSuspensionFooter ?? true);
        // Form is not dirty after being populated
        ElementManager.setTemplateEditorFormIsDirty('false');
    }

    function buildForm() {
        const $mountPoint = ElementManager.$rightGridColContainer;
        $mountPoint.empty();
        const $form = $(
            `<form id="${templateFormId}" class="d-flex fd-column g12 my8">
                <div class="d-flex gy4 fd-column">
                    <label class="s-label" for="${templateFormTemplateNameInputFieldId}">Template Name</label>
                    <p class="d-none flex--item s-input-message mb0 ${formValidationMessage}"></p>
                    <input class="s-input" id="${templateFormTemplateNameInputFieldId}" type="text"
                           placeholder="Be descriptive as this is what appears in user history."
                           name="TemplateName">
                </div>
                <div class="d-flex fd-column gy4">
                    <div class="d-flex fd-row fw-nowrap g6 ai-center my2">
                        <label class="flex--item s-label" for="${templateFormTemplateBodyInputFieldId}">Template Body</label>
                        <button class="flex--item s-btn s-btn__muted p4" 
                                role="button"
                                type="button"
                                aria-controls="${templateFormTemplateBodyInputFieldId}-popover"
                                aria-expanded="false"
                                data-controller="s-popover"
                                data-action="s-popover#toggle"
                                data-s-popover-placement="auto"
                                data-s-popover-toggle-class="is-selected">${InfoSvgHtmlString}</button>
                        <div class="s-popover"
                               id="${templateFormTemplateBodyInputFieldId}-popover"
                               role="menu">
                            <div class="s-popover--arrow"></div>
                            <div class="s-popover--content">
                                <span>The following replacement strings are supported by this UserScript:</span>
                                <dl class="my6 ml6">
                                    <dt class="fw-bold">{parentUrl}</dt>
                                    <dd>${parentUrl}</dd>
                                    <dt class="fw-bold mt8">{parentName}</dt>
                                    <dd>${parentName}</dd>
                                </dl>
                                <span>These will be replaced before being inserted into the editor.</span>
                                <hr/>
                                <span>The following replacement strings are supported by the base UI:</span>
                                <dl class="my6 ml6">
                                    <dt class="fw-bold">{todo}</dt><dd>Prevents the messaage from being submitted.</dd>
                                    <dt class="fw-bold mt8">{suspensionDurationDays}</dt><dd>The number of days of the suspension.</dd>
                                    <dt class="fw-bold mt8">{optionalSuspensionAutoMessage}</dt><dd>This is the standard message about suspensions also called 'Suspension Footer'.</dd>
                                </dl>
                                <span>These will only be replaced when submitting the mod message.</span>
                            </div>
                        </div>
                    </div>
                    <p class="d-none flex--item s-input-message mb0 ${formValidationMessage}"></p>
                    <textarea id="${templateFormTemplateBodyInputFieldId}"
                              name="TemplateBody"
                              class="flex--item s-textarea hmn3 wmx5"
                              style="resize: vertical;field-sizing: content;"
                              placeholder="This will appear as the body of the template.\nDo not include header, suspension, or footer information.\nThis is pulled automatically."></textarea>
                </div>
                <div class="d-flex gy4 fd-column">
                    <div class="d-flex fd-row fw-nowrap g6 ai-center my2">
                        <label class="flex--item s-label" for="${templateFormAnalogousSystemReasonId}">
                            Analogous System Reason Id
                        </label>
                        <button class="flex--item s-btn s-btn__muted p4" 
                                    role="button"
                                    type="button"
                                    aria-controls="${templateFormAnalogousSystemReasonId}-popover"
                                    aria-expanded="false"
                                    data-controller="s-popover"
                                    data-action="s-popover#toggle"
                                    data-s-popover-placement="auto"
                                    data-s-popover-toggle-class="is-selected">${InfoSvgHtmlString}</button>
                        <div class="s-popover"
                               id="${templateFormAnalogousSystemReasonId}-popover"
                               role="menu">
                            <div class="s-popover--arrow"></div>
                            <div class="s-popover--content">
                                <p>This is used to determine which suspension banner shows on the user profile.</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex--item s-select">
                        <select id="${templateFormAnalogousSystemReasonId}"></select>
                    </div>
                </div>
                <div class="d-flex gy4 fd-column">
                    <label class="s-label" for="${templateFormDefaultSuspendDays}">Default Suspend Days (0 for no suspension)</label>
                    <input class="s-input" 
                           id="${templateFormDefaultSuspendDays}" 
                           type="number"
                           min="0"
                           max="365"
                           name="DefaultSuspendDays">
                </div>
                <div class="d-flex ai-center g8">
                    <label class="s-label" for="${templateFormStackOverflowOnly}">Stack Overflow Only</label>
                    <input class="s-toggle-switch" id="${templateFormStackOverflowOnly}" type="checkbox" name="StackOverflowOnly">
                </div>
                <div class="d-flex fd-row fw-nowrap g8 ai-center my2">
                    <label class="s-label" for="${templateFormIncludeSuspensionFooter}">Include Suspension Footer</label>
                    <input class="s-toggle-switch" id="${templateFormIncludeSuspensionFooter}" type="checkbox" checked name="IncludeSuspensionFooter">
                    <button class="flex--item s-btn s-btn__muted p4" 
                                role="button"
                                type="button"
                                aria-controls="${templateFormIncludeSuspensionFooter}-popover"
                                aria-expanded="false"
                                data-controller="s-popover"
                                data-action="s-popover#toggle"
                                data-s-popover-placement="auto"
                                data-s-popover-toggle-class="is-selected">${InfoSvgHtmlString}</button>
                    <div class="s-popover"
                           id="${templateFormIncludeSuspensionFooter}-popover"
                           role="menu">
                        <div class="s-popover--arrow"></div>
                        <div class="s-popover--content">
                            <p>This option is useful in any templates that use {suspensionDurationDays} within the body</p>
                        </div>
                    </div>
                </div>
            </form>`
        );

        async function handleSubmitForm(ev: JQuery.SubmitEvent) {
            ev.preventDefault();
        }

        $form.on('submit', handleSubmitForm);
        $form.on('input', () => {
            // Any change to the form should make it dirty
            ElementManager.setTemplateEditorFormIsDirty('true');
            // Hide any validation messages
            ElementManager.$allValidationMessages.addClass('d-none');
            ElementManager.clearValidationMessages();
        });
        $mountPoint.append($form);

        // Add Form Functionality after mounted
        ElementManager.$templateFormAnalogousSystemReasonSelect
            .append(...SystemReasonIdList.map((reason) => `<option value="${reason}">${reason}</option>`));

        ElementManager.$templateFormDefaultSuspendDays.on('input', (ev) => {
            const $target = $(ev.target);
            const value = Number($target.val());
            const inputMin = Number($target.attr('min'));
            const inputMax = Number($target.attr('max'));

            $target.val(Math.max(inputMin, Math.min(value, inputMax)));
        });
    }

    function populateExportTemplateTextarea() {
        const templateIndexes: number[] = ElementManager.$allSelectedExportCheckboxes.map((_, n) => $(n).data('template-index')).toArray();
        const jsonString = templateManager.exportToJsonString(templateIndexes);
        ElementManager.$exportOutputTextArea.val(jsonString);
    }

    function buildExportTextarea() {
        const $mountPoint = ElementManager.$rightGridColContainer;
        $mountPoint.empty();
        $mountPoint.append($(
            `<div class="wmx5">
                <h2 class="fs-subheading">Copy this text to share/save the export. Paste this into the input field next to the 'Import Template' button to import.</h2>
                <textarea id="${exportOutputTextarea}" class="flex--item s-textarea hmn3 hmx5" style="resize: vertical;">[]</textarea>
            </div>`
        ));
    }

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

    // Wire Up Import Fields
    ElementManager.$importTemplateInputField.on('input', (e: JQuery.ChangeEvent) => {
        ElementManager.$importTemplateButton.prop('disabled', e.target.value.trim().length === 0);
    });

    ElementManager.$importTemplateButton.on('click', async (ev) => {
        ev.preventDefault();

        if (!await dirtyNavigationConfirmModal()) {
            return;
        }

        void templateManager.importFromJSONString(ElementManager.$importTemplateInputField.val().toString())
            .then(success => {
                if (success) {
                    // Update Templates if import is successful
                    buildTemplateSelectorList();
                }
            })
            .finally(() => {
                // Empty the import field
                ElementManager.$importTemplateInputField.val('');
                // Disable the button since the field was emptied
                ElementManager.$importTemplateButton.prop('disabled', true);
                // Update Selection
                SelectedTemplateManager.reset();
            });
    });

    // Wire up new template button
    ElementManager.$newTemplateButton.on('click', async (ev: JQuery.ClickEvent) => {
        ev.preventDefault();
        if (!await dirtyNavigationConfirmModal()) {
            return;
        }
        // Empty by using the default values
        populateFormFromTemplate({
            TemplateName: '',
            TemplateBody: '',
            AnalogousSystemReasonId: undefined,
        });
        ElementManager.setTemplateEditorFormNewMode('true');
    });

    // wire up save button
    ElementManager.$saveButton.on('click', async (ev: JQuery.ClickEvent) => {
        ev.preventDefault();
        const templateFromFormData: UserDefinedMessageTemplate = {
            TemplateName: ElementManager.$templateFormTemplateNameInputField.val(),
            TemplateBody: ElementManager.$templateFormTemplateBodyInputField.val(),
            AnalogousSystemReasonId: ElementManager.$templateFormAnalogousSystemReasonSelect.val() as string
        };
        const defaultSuspendDays = Number(ElementManager.$templateFormDefaultSuspendDays.val());
        if (defaultSuspendDays > 0) {
            templateFromFormData['DefaultSuspendDays'] = defaultSuspendDays;
        }
        const isStackOverflowOnly = ElementManager.$templateFormStackOverflowOnly.prop('checked');
        if (isStackOverflowOnly) {
            templateFromFormData['StackOverflowOnly'] = isStackOverflowOnly;
        }
        const shouldIncludeSuspensionFooter = ElementManager.$templateFormIncludeSuspensionFooter.prop('checked');
        if (!shouldIncludeSuspensionFooter) {
            templateFromFormData['IncludeSuspensionFooter'] = shouldIncludeSuspensionFooter;
        }


        let isValid = true;

        if (templateFromFormData.TemplateName.trim().length === 0) {
            ElementManager.setNearestValidationMessage(
                ElementManager.$templateFormTemplateNameInputField,
                'has-error',
                'Template name must not be blank!'
            );
            isValid = false;
        }

        if (templateFromFormData.TemplateBody.trim().length === 0) {
            ElementManager.setNearestValidationMessage(
                ElementManager.$templateFormTemplateBodyInputField,
                'has-error',
                'Template body must not be blank!'
            );
            isValid = false;
        }

        if (!isValid) {
            return false;
        }

        // Try to save or update
        let success: boolean;
        if (ElementManager.isTemplateEditorFormInNewMode()) {
            success = await templateManager.saveNewTemplate(templateFromFormData);
        } else {
            success = await templateManager.saveExistingTemplate(templateFromFormData, SelectedTemplateManager.active);
        }
        if (success) {
            StackExchange.helpers.showToast('Template Saved Successfully!', {
                type: 'success',
                transient: true,
                transientTimeout: 2e3
            });

            // Rebuild the UI with new values
            const selection = ElementManager.isTemplateEditorFormInNewMode() ? templateManager.count - 1 : SelectedTemplateManager.active;
            buildTemplateEditor();
            SelectedTemplateManager.active = selection;
        }
        return true;
    });

    // Wire Up Export Button
    ElementManager.$exportButton.on('click', async (ev: JQuery.ClickEvent) => {
        ev.preventDefault();
        if (!await dirtyNavigationConfirmModal()) {
            return;
        }

        const $target = $(ev.target);
        const isExportMode = ElementManager.isExportMode();
        if (isExportMode) {
            buildTemplateEditor();
            $target.text(exportButtonLabel);
        } else {
            buildTemplateExporter();
            $target.text('Leave Export');
        }
        ElementManager.setExportMode(isExportMode ? 'false' : 'true');
    });

    // Wire up delete button
    ElementManager.$deleteTemplateButton.on('click', async (ev: JQuery.ClickEvent) => {
        ev.preventDefault();
        await templateManager.delete(SelectedTemplateManager.active);
        // Repopulate List
        buildTemplateSelectorList();
        // Previous no longer exists
        SelectedTemplateManager.reset();
    });

    ElementManager.$modalCloseButton.on('click', async (ev: JQuery.ClickEvent) => {
        ev.preventDefault();
        if (!await dirtyNavigationConfirmModal()) {
            return false;
        }
        if (templateManager.hasPendingChanges) {
            const reloadNow = await StackExchange.helpers.showConfirmModal({
                title: 'Message options changed',
                bodyHtml: '<div><p>Changes have been made to the templates which may not be reflected in the mod message menu selector.</p><p>To ensure that all options are up-to-date, reload the page.</p><sub>Clicking \'Cancel\' will still close the modal, but the page will not reload.</sub></div>',
                buttonLabel: 'Reload'
            });
            if (reloadNow) {
                window.location.reload();
                return false;
            }
        }
        // Clear out selection to clear away dirty form
        SelectedTemplateManager.active = -1;
        // Hide Modal
        Stacks.hideModal(document.getElementById(modalId));
        // Allow background scrolling again
        $(document.body).css('overflow', 'unset');
        return true;
    });


    return $aside;
}
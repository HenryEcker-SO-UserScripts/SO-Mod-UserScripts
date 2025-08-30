// ==UserScript==
// @name         Custom Mod Message Templates V2
// @description  Adds mod message templates with default configurations to the mod message drop-down
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      1.0.1
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/ModMessageHelper/dist/ModMessageHelper.user.js
//
// @match        *://*.askubuntu.com/users/message/create/*
// @match        *://*.mathoverflow.net/users/message/create/*
// @match        *://*.serverfault.com/users/message/create/*
// @match        *://*.stackapps.com/users/message/create/*
// @match        *://*.stackexchange.com/users/message/create/*
// @match        *://*.stackoverflow.com/users/message/create/*
// @match        *://*.superuser.com/users/message/create/*
//
// @grant        GM_getValue
// @grant        GM_setValue
//
// ==/UserScript==
/* globals StackExchange, $ */
(function() {
  "use strict";      
          
  StackExchange.ready(function () {
    if (!StackExchange?.options?.user?.isModerator) {
        return;
    }
    const InfoSvgHtmlString = '<svg aria-hidden="true" class="svg-icon iconInfoSm" width="14" height="14" viewBox="0 0 14 14"><path d="M7 1a6 6 0 1 1 0 12A6 6 0 0 1 7 1m1 10V6H6v5zm0-6V3H6v2z"></path></svg>';
    const GearSvgHtmlString = '<svg aria-hidden="true" class="svg-icon iconGear" width="18" height="18" viewBox="0 0 18 18"><path d="m14.53 6.3.28.67C17 7.77 17 7.86 17 8.12V9.8c0 .26 0 .35-2.18 1.22l-.27.66c.98 2.11.91 2.18.73 2.37l-1.3 1.29h-.15q-.3 0-2.14-.8l-.66.27C10.23 17 10.13 17 9.88 17H8.2c-.26 0-.35 0-1.21-2.18l-.67-.27c-1.81.84-2.03.84-2.1.84h-.14l-.12-.1-1.19-1.2c-.18-.18-.24-.25.7-2.4l-.28-.65C1 10.24 1 10.14 1 9.88V8.2c0-.27 0-.35 2.18-1.21l.27-.66c-.98-2.12-.91-2.19-.72-2.39l1.28-1.28h.16q.3.01 2.14.8l.66-.27C7.77 1 7.87 1 8.12 1H9.8c.26 0 .34 0 1.2 2.18l.67.28c1.82-.84 2.03-.84 2.1-.84h.14l.12.1 1.2 1.19c.18.18.24.25-.7 2.4m-8.4 3.9a3.1 3.1 0 1 0 5.73-2.4 3.1 3.1 0 0 0-5.72 2.4"></path></svg>';
    const parentUrl = StackExchange?.options?.site?.parentUrl ?? location.origin;
    const parentName = StackExchange.options?.site?.name;
    const GM_STORE_KEY = "ModMessageTemplates";
    const modalId = "usr-mmt-editor-modal";
    const ui = {
      BlankTemplateOptionValue: "0",
      get $pageTitle() {
        return $(".s-page-title");
      },
      get $form() {
        return $("#js-msg-form");
      },
      get $messageContents() {
        return $("#js-message-contents");
      },
      get $aboutUserId() {
        return $('.js-about-user-id[name="userId"]');
      },
      get aboutUserId() {
        return Number(this.$aboutUserId.val());
      },
      get $templateSelector() {
        return $("#select-template-menu");
      },
      get $systemReasonOptions() {
        return this.$templateSelector.find(`option[value!="${this.BlankTemplateOptionValue}"]:not([data-is-custom="true"])`);
      },
      get reasonId() {
        return this.$templateSelector.val();
      },
      set reasonId(newOptionValue) {
        this.$templateSelector.val(newOptionValue);
      },
      get $suspendReasonInput() {
        return $("#usr-js-suspend-reason");
      },
      get suspendReason() {
        return this.$suspendReasonInput.val();
      },
      set suspendReason(newSuspendReason) {
        this.$suspendReasonInput.val(newSuspendReason);
      },
      get displayedSelectedTemplate() {
        return this.$templateSelector.find("option:selected").text();
      },
      get $customTemplateNameInput() {
        return $("#usr-template-name-input");
      },
      get customTemplateName() {
        return this.$customTemplateNameInput.val();
      },
      set customTemplateName(newTemplateName) {
        this.$customTemplateNameInput.val(newTemplateName);
      },
      get $suspensionOptions() {
        return $("#suspension-options");
      },
      get $suspensionDays() {
        return $('.js-suspension-days[name="suspendDays"]');
      },
      get suspendDays() {
        return Number(this.$suspensionDays.val());
      },
      get $editor() {
        return $("#wmd-input");
      },
      get editorText() {
        return this.$editor.val();
      },
      set editorText(newText) {
        this.$editor.val(newText);
      },
      refreshEditor() {
        StackExchange.MarkdownEditor.refreshAllPreviews();
      },
      get $autoSuspendMessageField() {
        return $("#js-auto-suspend-message");
      },
      get autoSuspendMessageTemplateText() {
        return this.$autoSuspendMessageField.val();
      },
      set autoSuspendMessageTemplateText(newValue) {
        this.$autoSuspendMessageField.val(newValue);
      },
      hasTemplateSelected() {
        return this.reasonId !== this.BlankTemplateOptionValue;
      },
      hasCustomTemplateName() {
        return this.displayedSelectedTemplate !== this.customTemplateName;
      }
    };
    const SystemReasonIdSet = new Set(ui.$systemReasonOptions.map((_, n) => $(n).val()).toArray());
    function showStandardDangerToast(message, transientTimeout) {
      StackExchange.helpers.showToast(message, {
        type: "danger",
        transient: true,
        transientTimeout: transientTimeout ?? 4e3
      });
    }
    function getModal() {
      return document.getElementById(modalId);
    }
    function openEditorModal() {
      getModal().setAttribute("aria-hidden", "false");
      $(document.body).css("overflow", "hidden");
    }
    function hideEditorModal() {
      getModal().setAttribute("aria-hidden", "true");
      $(document.body).css("overflow", "unset");
    }
    function arrayMoveMutable(array, fromIndex, toIndex) {
      const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;
      if (startIndex >= 0 && startIndex < array.length) {
        const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;
        const [item] = array.splice(fromIndex, 1);
        array.splice(endIndex, 0, item);
      }
    }
    const $const = (def) => (input) => {
      return input === def;
    };
    const _typeof = (input) => typeof input;
    const $opt = (validator) => (input, ctx) => {
      return input == null || validator(input, ctx);
    };
    const $string = (input) => {
      return _typeof(input) === "string";
    };
    const $number = (input) => {
      return _typeof(input) === "number";
    };
    const $boolean = (input) => {
      return _typeof(input) === "boolean";
    };
    const $object = (vmap, exact = true) => {
      const fn = (input, ctx, path = []) => {
        if (_typeof(input) !== "object" || input === null) {
          return false;
        }
        const unchecked = new Set(Object.keys(input));
        let failed = false;
        for (const [key, validator] of Object.entries(vmap)) {
          if (key === "__proto__") {
            continue;
          }
          const childPath = [...path, key];
          if (!validator(input?.[key], ctx, childPath)) {
            failed = true;
            ctx?.errors.push(childPath);
          }
          unchecked.delete(key);
        }
        if (failed)
          return false;
        if (exact) {
          return unchecked.size === 0;
        } else {
          return true;
        }
      };
      return fn;
    };
    function $nonEmptyString(input) {
      return $string(input) && input.trim().length > 0;
    }
    function $setMember(sourceSet) {
      function isMember(input) {
        return $string(input) && sourceSet.has(input);
      }
      return isMember;
    }
    const templateValidator = $object({
      TemplateName: $nonEmptyString,
      TemplateBody: $nonEmptyString,
      AnalogousSystemReasonId: $setMember(SystemReasonIdSet),
      DefaultSuspendDays: $opt($number),
      StackOverflowOnly: $opt($boolean),
      IncludeSuspensionFooter: $opt($boolean),
      SuspensionFooter: $opt($string),
      Footer: $opt($const(""))
    });
    function buildCtx() {
      return { errors: [] };
    }
    function validateTemplate(maybeTemplate, validationErrorMessage) {
      const ctx = buildCtx();
      const result = templateValidator(maybeTemplate, ctx);
      if (ctx.errors.length > 0) {
        console.error("Validation Error", ctx);
        showStandardDangerToast(validationErrorMessage);
        return false;
      }
      return result;
    }
    function validateTemplateArray(maybeTemplateArray, validationErrorMessage) {
      if (maybeTemplateArray.every((t) => {
        const ctx = buildCtx();
        const result = templateValidator(t, ctx);
        if (ctx.errors.length > 0) {
          console.error("Validation Error", ctx);
        }
        return result;
      })) {
        return true;
      }
      showStandardDangerToast(validationErrorMessage);
      return false;
    }
    class TemplateManager {
      templates;
      _hasPendingChanges;
      constructor() {
        this.templates = GM_getValue(GM_STORE_KEY, []);
        this._hasPendingChanges = false;
      }
      isSystemTemplate(reasonId) {
        return SystemReasonIdSet.has(reasonId);
      }
      save() {
        GM_setValue(GM_STORE_KEY, this.templates);
        this._hasPendingChanges = true;
      }
      get count() {
        return this.templates.length;
      }
      get customMessageTemplates() {
        return this.templates;
      }
      hasPendingChanges() {
        return this._hasPendingChanges;
      }
      has(index) {
        return this.templates?.[index] !== void 0;
      }
      hasName(templateName) {
        return this.templates.some((t) => t.TemplateName === templateName);
      }
      lookupByIndex(index) {
        return this.templates[index];
      }
      lookupByReasonId(reasonId) {
        return this.templates.filter((x) => {
          return x.TemplateName.localeCompare(reasonId) === 0;
        });
      }
      getIndexFromName(name) {
        return this.templates.findIndex((t) => t.TemplateName === name);
      }
      move(fromIndex, toIndex) {
        arrayMoveMutable(this.templates, fromIndex, toIndex);
        this.save();
      }
      testAgainstExistingSystemReasonIds(templateName) {
        if (this.isSystemTemplate(templateName)) {
          showStandardDangerToast("Template names cannot match any existing system reason ids");
          return false;
        }
        return true;
      }
      async insertNewTemplate(newTemplate, shouldSave) {
        if (this.hasName(newTemplate.TemplateName)) {
          showStandardDangerToast("A template with this name already exists! Template names must be unique.");
          return false;
        }
        if (!this.testAgainstExistingSystemReasonIds(newTemplate.TemplateName)) {
          return false;
        }
        this.templates.push(newTemplate);
        if (shouldSave) {
          this.save();
        }
        return true;
      }
      async updateExistingTemplate(existingTemplate, index, shouldPromptDuplicates, shouldSave) {
        if (!this.has(index)) {
          showStandardDangerToast("This template index does not exist so it cannot be updated!");
          return false;
        }
        if (!this.testAgainstExistingSystemReasonIds(existingTemplate.TemplateName)) {
          return false;
        }
        if (shouldPromptDuplicates) {
          const shouldReplace = await StackExchange.helpers.showConfirmModal({
            title: "Duplicate Template Found",
            bodyHtml: `<div><p>The template "${existingTemplate.TemplateName}" already exists.</p><p>Do you want to overwrite the existing template with the import?</p></div>`,
            buttonLabel: "Overwrite"
          });
          if (!shouldReplace) {
            return false;
          }
        }
        const foundIndex = this.getIndexFromName(existingTemplate.TemplateName);
        if (index !== foundIndex) {
          showStandardDangerToast("A different template with this name already exists! Template names must be unique.");
          return false;
        }
        this.templates[index] = existingTemplate;
        if (shouldSave) {
          this.save();
        }
        return true;
      }
      async insertOrUpdate(newTemplate, index, shouldPromptDuplicates, shouldSave) {
        const existingTemplateIndex = index ?? this.getIndexFromName(newTemplate.TemplateName);
        if (existingTemplateIndex === -1) {
          return this.insertNewTemplate(newTemplate, shouldSave);
        } else {
          return this.updateExistingTemplate(newTemplate, existingTemplateIndex, shouldPromptDuplicates, shouldSave);
        }
      }
      async unsafeInsertOrUpdate(maybeTemplate, index, shouldPromptDuplicates, shouldSave) {
        if (!validateTemplate(maybeTemplate, "Unable to parse template. See console for errors.")) {
          return false;
        }
        return this.insertOrUpdate(maybeTemplate, index, shouldPromptDuplicates, shouldSave);
      }
      async saveNewTemplate(maybeTemplate) {
        return this.unsafeInsertOrUpdate(maybeTemplate, void 0, false, true);
      }
      async saveExistingTemplate(maybeTemplate, index) {
        return this.unsafeInsertOrUpdate(maybeTemplate, index, false, true);
      }
      async delete(index) {
        if (!this.has(index)) {
          return;
        }
        const shouldDelete = await StackExchange.helpers.showConfirmModal({
          title: "Template Deletion",
          bodyHtml: `<div><p>This will delete the following template "${this.templates[index].TemplateName}"</p><p>Are you sure you want to permenantly delete this template?</p></div>`,
          buttonLabel: "Yes"
        });
        if (!shouldDelete) {
          return;
        }
        this.templates.splice(index, 1);
        this.save();
      }
      async importFromJSONString(jsonString) {
        try {
          let maybeTemplateArray = JSON.parse(jsonString);
          if (!Array.isArray(maybeTemplateArray)) {
            maybeTemplateArray = [maybeTemplateArray];
          }
          if (!validateTemplateArray(maybeTemplateArray, "Unable to parse template import. See console error for more details")) {
            return false;
          }
          for (const newTemplate of maybeTemplateArray) {
            void await this.insertOrUpdate(newTemplate, void 0, true, false);
          }
          this.save();
          return true;
        } catch (e) {
          if (e instanceof SyntaxError) {
            showStandardDangerToast("Invalid JSON!", 2e3);
          }
          console.error(e);
          return false;
        }
      }
      exportToJsonString(indexes) {
        const result = this.templates.filter((_, i) => indexes.includes(i));
        return JSON.stringify(result, null, 2);
      }
    }
    const templateManager = new TemplateManager();
    function $messageTemplateEditorModal() {
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
      const templateFormIncludeRegardsFooter = `${modalId}-template-form-include-regards-footer-checkbox`;
      const exportOutputTextarea = `${modalId}-template-export-output-text`;
      function listMemberId(n) {
        return `${modalId}-export-list-member-${n}`;
      }
      const modalCloseButtonId = `${modalId}-close-button`;
      const exportSelectedCheckbox = `${modalId}-export-checkbox-selector`;
      const formValidationMessage = `${modalId}-form-validation-message`;
      const activeListStyleClass = "fc-theme-secondary";
      const exportButtonLabel = "Export Template(s)";
      const formTemplateNewModeProp = "data-new-template";
      const formIsDirtyProp = "data-form-is-dirty";
      const exportButtonDataProp = "data-export-mode";
      const $aside = $(
        `<aside class="s-modal" id="${modalId}" tabindex="-1" role="dialog" aria-hidden="true">
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
                                <input id="${importTemplateInputField}" class="flex--item s-input wmn2 wmx4" placeholder="Paste your import here..."/>
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
        get $templateEditorForm() {
          return $(`#${templateFormId}`, $aside);
        },
        templateEditorFormIsDirty() {
          return this.$templateEditorForm.attr(formIsDirtyProp) === "true";
        },
        setTemplateEditorFormIsDirty(mode) {
          this.$templateEditorForm.attr(formIsDirtyProp, mode);
          this.$saveButton.prop("disabled", mode === "false");
        },
        isTemplateEditorFormInNewMode() {
          return this.$templateEditorForm.attr(formTemplateNewModeProp) === "true";
        },
        setTemplateEditorFormNewMode(mode) {
          this.$templateEditorForm.attr(formTemplateNewModeProp, mode);
          this.$deleteTemplateButton.prop("disabled", mode === "true");
          if (mode === "true") {
            SelectedTemplateManager.active = -1;
          }
        },
        get $importTemplateInputField() {
          return $(`#${importTemplateInputField}`, $aside);
        },
        get $exportOutputTextArea() {
          return $(`#${exportOutputTextarea}`, $aside);
        },
        get $templateFormTemplateNameInputField() {
          return $(`#${templateFormTemplateNameInputFieldId}`, $aside);
        },
        get $templateFormAnalogousSystemReasonSelect() {
          return $(`#${templateFormAnalogousSystemReasonId}`, $aside);
        },
        get $templateFormDefaultSuspendDays() {
          return $(`#${templateFormDefaultSuspendDays}`, $aside);
        },
        get $templateFormTemplateBodyInputField() {
          return $(`#${templateFormTemplateBodyInputFieldId}`, $aside);
        },
        get $templateFormStackOverflowOnly() {
          return $(`#${templateFormStackOverflowOnly}`, $aside);
        },
        get $templateFormIncludeSuspensionFooter() {
          return $(`#${templateFormIncludeSuspensionFooter}`, $aside);
        },
        get $templateFormIncludeRegardsFooter() {
          return $(`#${templateFormIncludeRegardsFooter}`, $aside);
        },
        get $importTemplateButton() {
          return $(`#${importTemplateButtonId}`, $aside);
        },
        get $newTemplateButton() {
          return $(`#${newTemplateButtonId}`, $aside);
        },
        get $saveButton() {
          return $(`#${saveButtonId}`, $aside);
        },
        get $exportButton() {
          return $(`#${exportTemplatesButtonId}`, $aside);
        },
        isExportMode() {
          return this.$exportButton.attr(exportButtonDataProp) === "true";
        },
        setExportMode(mode) {
          this.$exportButton.attr(exportButtonDataProp, mode);
          const shouldDisable = mode === "true";
          this.$importTemplateInputField.prop("disabled", shouldDisable);
          this.$newTemplateButton.prop("disabled", shouldDisable);
          this.$saveButton.prop("disabled", true);
          this.$deleteTemplateButton.prop("disabled", shouldDisable);
        },
        get $deleteTemplateButton() {
          return $(`#${deleteTemplateButtonId}`, $aside);
        },
        get $modalCloseButton() {
          return $(`#${modalCloseButtonId}`, $aside);
        },
        get $templateListContainer() {
          return $(`#${templateListContainerId}`, $aside);
        },
        get $rightGridColContainer() {
          return $(`#${rightGridColContainer}`, $aside);
        },
        get $allSelectedExportCheckboxes() {
          return $(`.${exportSelectedCheckbox}`);
        },
        get $allValidationMessages() {
          return $(`.${formValidationMessage}`);
        },
        setNearestValidationMessage($input, validationClass, validationText) {
          $input.siblings(`.${formValidationMessage}`).removeClass("d-none").text(validationText);
          $input.parent().addClass(validationClass);
        },
        clearValidationMessages() {
          this.$allValidationMessages.addClass("d-none");
          this.$allValidationMessages.parent().removeClass("has-warning").removeClass("has-error").removeClass("has-success");
        }
      };
      const SelectedTemplateManager = {
        selected: -1,
        get active() {
          return this.selected;
        },
        set active(newIndex) {
          this.selected = newIndex;
          ElementManager.$templateListContainer.find("li").removeClass(activeListStyleClass);
          if (!templateManager.has(this.selected)) {
            this.selected = -1;
            return;
          }
          populateFormFromTemplate(templateManager.lookupByIndex(this.selected));
          ElementManager.$templateListContainer.find(`li:eq(${this.selected})`).addClass(activeListStyleClass);
          ElementManager.$deleteTemplateButton.prop("disabled", false);
        },
        reset() {
          this.active = 0;
        }
      };
      async function dirtyNavigationConfirmModal() {
        if (ElementManager.templateEditorFormIsDirty()) {
          return StackExchange.helpers.showConfirmModal({
            title: "Pending Changes",
            bodyHtml: "<div><p>There are unsaved changes in the template!</p><p>Are you sure that you want to navigate away?</p></div>",
            buttonLabel: "Discard Changes"
          });
        }
        return true;
      }
      function buildTemplateSelectorList() {
        const $mountPoint = ElementManager.$templateListContainer;
        $mountPoint.empty();
        const $templateList = $("<ol>");
        if (templateManager.count === 0) {
          $mountPoint.append("<p>There are no existing templates available.<p></p>For an initial starting set of templates, return to GitHub to copy and paste the contents of templates.json into the Import Template input above.</p>");
        }
        for (const [index, userDefinedTemplate] of templateManager.customMessageTemplates.entries()) {
          const $elem = $(`<li class="mb4" draggable="true">${userDefinedTemplate.TemplateName}</li>`);
          if (index === SelectedTemplateManager.active) {
            $elem.addClass(activeListStyleClass);
          }
          $elem.on("click", async (e) => {
            e.preventDefault();
            if (SelectedTemplateManager.active === index) {
              return;
            }
            if (!await dirtyNavigationConfirmModal()) {
              return;
            }
            SelectedTemplateManager.active = index;
            ElementManager.setTemplateEditorFormNewMode("false");
          });
          $elem.on("dragstart", (e) => {
            e.originalEvent.dataTransfer.effectAllowed = "move";
            e.originalEvent.dataTransfer.clearData();
            e.originalEvent.dataTransfer.setData("text/plain", index.toString());
          });
          $elem.on("dragover", (e) => {
            e.preventDefault();
          });
          $elem.on("drop", async (e) => {
            const $target = $(e.target);
            const currentTargetIndex = $("li", $templateList).index($target);
            const srcIndex = Number(e.originalEvent.dataTransfer.getData("text/plain"));
            if (ElementManager.templateEditorFormIsDirty()) {
              const shouldNavigate = await StackExchange.helpers.showConfirmModal({
                title: "Pending Changes",
                bodyHtml: "<div><p>There are unsaved changes in the template!</p><p>Reordering will discard these changes.</p><p>Are you sure you want to reorder these items?</p></div>",
                buttonLabel: "Discard Changes"
              });
              if (!shouldNavigate) {
                return;
              }
            }
            templateManager.move(srcIndex, currentTargetIndex);
            SelectedTemplateManager.active = currentTargetIndex;
            buildTemplateSelectorList();
          });
          $templateList.append($elem);
        }
        $mountPoint.append($templateList);
      }
      function buildExportTemplateList() {
        const $mountPoint = ElementManager.$templateListContainer;
        $mountPoint.empty();
        const $templateList = $("<div>");
        for (const [index, userDefinedTemplate] of templateManager.customMessageTemplates.entries()) {
          const $elem = $('<div class="s-check-control mb4"></div>');
          const $label = $(`<label class="s-label" for="${listMemberId(index)}">${userDefinedTemplate.TemplateName}</label>`);
          const $input = $(`<input class="s-checkbox" type="checkbox" id="${listMemberId(index)}" data-template-index="${index}"/>`);
          $input.on("change", (ev) => {
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
        function buttonHandler(checked) {
          function evHandler(ev) {
            ev.preventDefault();
            $("input.s-checkbox", $templateList).prop("checked", checked).trigger("change");
          }
          return evHandler;
        }
        const $selectAllBtn = $('<button class="s-btn s-btn__outlined">Select All </button>');
        $selectAllBtn.on("click", buttonHandler(true));
        const $deselectAllBtn = $('<button class="s-btn s-btn__danger s-btn__outlined">Clear All </button>');
        $deselectAllBtn.on("click", buttonHandler(false));
        $mountPoint.append(
          $('<div class="mt12 d-flex fd-row fw-nowrap g6 jc-space-between"></div>').append($selectAllBtn).append($deselectAllBtn)
        );
      }
      function populateFormFromTemplate(template) {
        ElementManager.$templateFormTemplateNameInputField.val(template.TemplateName);
        ElementManager.$templateFormAnalogousSystemReasonSelect.val(template.AnalogousSystemReasonId ?? "OtherViolation");
        ElementManager.$templateFormDefaultSuspendDays.val(template.DefaultSuspendDays ?? 0);
        ElementManager.$templateFormTemplateBodyInputField.val(template.TemplateBody);
        ElementManager.$templateFormStackOverflowOnly.prop("checked", template.StackOverflowOnly ?? false);
        ElementManager.$templateFormIncludeSuspensionFooter.prop("checked", template.IncludeSuspensionFooter ?? true);
        ElementManager.$templateFormIncludeRegardsFooter.prop("checked", template.Footer === void 0);
        ElementManager.setTemplateEditorFormIsDirty("false");
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
                                        <dt class="fw-bold">{todo}</dt><dd>Prevents the message from being submitted.</dd>
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
                                  class="flex--item s-textarea hmn3 w100"
                                  style="resize: vertical;field-sizing: content;"
                                  placeholder="This will appear as the body of the template.
    Do not include header, suspension, or footer information.
    This is pulled automatically."></textarea>
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
                                    <p class="mb0">This is used to determine which suspension banner shows on the user profile.</p>
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
                                <p class="mb0">Turning off the suspension footer is useful in any templates that use {suspensionDurationDays} within the body</p>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex fd-row fw-nowrap g8 ai-center my2">
                        <label class="s-label" for="${templateFormIncludeRegardsFooter}">Include Regards Footer</label>
                        <input class="s-toggle-switch" id="${templateFormIncludeRegardsFooter}" type="checkbox" checked name="Footer">
                        <button class="flex--item s-btn s-btn__muted p4" 
                                    role="button"
                                    type="button"
                                    aria-controls="${templateFormIncludeRegardsFooter}-popover"
                                    aria-expanded="false"
                                    data-controller="s-popover"
                                    data-action="s-popover#toggle"
                                    data-s-popover-placement="auto"
                                    data-s-popover-toggle-class="is-selected">${InfoSvgHtmlString}</button>
                        <div class="s-popover"
                               id="${templateFormIncludeRegardsFooter}-popover"
                               role="menu">
                            <div class="s-popover--arrow"></div>
                            <div class="s-popover--content">
                                <p class="mb0">Turning this option off will remove the Regards, Moderation Team message from the Footer.</p>
                            </div>
                        </div>
                    </div>
                </form>`
        );
        async function handleSubmitForm(ev) {
          ev.preventDefault();
        }
        $form.on("submit", handleSubmitForm);
        $form.on("input", () => {
          ElementManager.setTemplateEditorFormIsDirty("true");
          ElementManager.$allValidationMessages.addClass("d-none");
          ElementManager.clearValidationMessages();
        });
        $mountPoint.append($form);
        ElementManager.$templateFormAnalogousSystemReasonSelect.append(...SystemReasonIdSet.values().map((reason) => `<option value="${reason}">${reason}</option>`));
        ElementManager.$templateFormDefaultSuspendDays.on("input", (ev) => {
          const $target = $(ev.target);
          const value = Number($target.val());
          const inputMin = Number($target.attr("min"));
          const inputMax = Number($target.attr("max"));
          $target.val(Math.max(inputMin, Math.min(value, inputMax)));
        });
      }
      function populateExportTemplateTextarea() {
        const templateIndexes = ElementManager.$allSelectedExportCheckboxes.map((_, n) => $(n).data("template-index")).toArray();
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
        SelectedTemplateManager.reset();
      }
      buildTemplateEditor();
      ElementManager.$importTemplateInputField.on("input", (e) => {
        ElementManager.$importTemplateButton.prop("disabled", e.target.value.trim().length === 0);
      });
      ElementManager.$importTemplateButton.on("click", async (ev) => {
        ev.preventDefault();
        if (!await dirtyNavigationConfirmModal()) {
          return;
        }
        void templateManager.importFromJSONString(ElementManager.$importTemplateInputField.val().toString()).then((success) => {
          if (success) {
            buildTemplateSelectorList();
          }
        }).finally(() => {
          ElementManager.$importTemplateInputField.val("");
          ElementManager.$importTemplateButton.prop("disabled", true);
          SelectedTemplateManager.reset();
        });
      });
      ElementManager.$newTemplateButton.on("click", async (ev) => {
        ev.preventDefault();
        if (!await dirtyNavigationConfirmModal()) {
          return;
        }
        populateFormFromTemplate({
          TemplateName: "",
          TemplateBody: "",
          AnalogousSystemReasonId: void 0
        });
        ElementManager.setTemplateEditorFormNewMode("true");
      });
      ElementManager.$saveButton.on("click", async (ev) => {
        ev.preventDefault();
        const templateFromFormData = {
          TemplateName: ElementManager.$templateFormTemplateNameInputField.val(),
          TemplateBody: ElementManager.$templateFormTemplateBodyInputField.val(),
          AnalogousSystemReasonId: ElementManager.$templateFormAnalogousSystemReasonSelect.val()
        };
        const defaultSuspendDays = Number(ElementManager.$templateFormDefaultSuspendDays.val());
        if (defaultSuspendDays > 0) {
          templateFromFormData["DefaultSuspendDays"] = defaultSuspendDays;
        }
        const isStackOverflowOnly = ElementManager.$templateFormStackOverflowOnly.prop("checked");
        if (isStackOverflowOnly) {
          templateFromFormData["StackOverflowOnly"] = isStackOverflowOnly;
        }
        const shouldIncludeSuspensionFooter = ElementManager.$templateFormIncludeSuspensionFooter.prop("checked");
        if (!shouldIncludeSuspensionFooter) {
          templateFromFormData["IncludeSuspensionFooter"] = shouldIncludeSuspensionFooter;
        }
        const shouldIncludeRegardsFooter = ElementManager.$templateFormIncludeRegardsFooter.prop("checked");
        if (!shouldIncludeRegardsFooter) {
          templateFromFormData["Footer"] = "";
        }
        let isValid = true;
        if (templateFromFormData.TemplateName.trim().length === 0) {
          ElementManager.setNearestValidationMessage(
            ElementManager.$templateFormTemplateNameInputField,
            "has-error",
            "Template name must not be blank!"
          );
          isValid = false;
        }
        if (templateFromFormData.TemplateBody.trim().length === 0) {
          ElementManager.setNearestValidationMessage(
            ElementManager.$templateFormTemplateBodyInputField,
            "has-error",
            "Template body must not be blank!"
          );
          isValid = false;
        }
        if (!isValid) {
          return false;
        }
        let success;
        if (ElementManager.isTemplateEditorFormInNewMode()) {
          success = await templateManager.saveNewTemplate(templateFromFormData);
        } else {
          success = await templateManager.saveExistingTemplate(templateFromFormData, SelectedTemplateManager.active);
        }
        if (success) {
          StackExchange.helpers.showToast("Template Saved Successfully!", {
            type: "success",
            transient: true,
            transientTimeout: 2e3
          });
          const selection = ElementManager.isTemplateEditorFormInNewMode() ? templateManager.count - 1 : SelectedTemplateManager.active;
          buildTemplateEditor();
          SelectedTemplateManager.active = selection;
        }
        return true;
      });
      ElementManager.$exportButton.on("click", async (ev) => {
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
          $target.text("Leave Export");
        }
        ElementManager.setExportMode(isExportMode ? "false" : "true");
      });
      ElementManager.$deleteTemplateButton.on("click", async (ev) => {
        ev.preventDefault();
        await templateManager.delete(SelectedTemplateManager.active);
        buildTemplateSelectorList();
        SelectedTemplateManager.reset();
      });
      ElementManager.$modalCloseButton.on("click", async (ev) => {
        ev.preventDefault();
        if (!await dirtyNavigationConfirmModal()) {
          return;
        }
        if (templateManager.hasPendingChanges()) {
          const reloadNow = await StackExchange.helpers.showConfirmModal({
            title: "Message options changed",
            bodyHtml: "<div><p>Changes have been made to the templates which may not be reflected in the mod message menu selector.</p><p>To ensure that all options are up-to-date, reload the page.</p><sub>Clicking 'Cancel' will still close the modal, but the page will not reload.</sub></div>",
            buttonLabel: "Reload"
          });
          if (reloadNow) {
            window.location.reload();
            return;
          }
        }
        SelectedTemplateManager.active = 0;
        hideEditorModal();
      });
      return $aside;
    }
    function attachTemplateNameInputField() {
      const customTemplateDivHiddenClass = "d-none";
      ui.$templateSelector.removeAttr("name");
      const $customTemplateDiv = $(`<div class="${customTemplateDivHiddenClass} d-flex gy4 fd-column mb12"></div>`).append('<label class="flex--item s-label">Template Name</label>').append('<input id="usr-template-name-input" name="templateName" class="flex--item s-input wmx4" maxlength="272">');
      ui.$messageContents.before($customTemplateDiv);
      ui.$templateSelector.on("change", (e) => {
        if (!e.target.options[e.target.selectedIndex]) {
          return;
        }
        ui.customTemplateName = e.target.options[e.target.selectedIndex].text;
        if (ui.hasTemplateSelected()) {
          $customTemplateDiv.removeClass(customTemplateDivHiddenClass);
        } else {
          $customTemplateDiv.addClass(customTemplateDivHiddenClass);
        }
      });
      ui.$customTemplateNameInput.on("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          return false;
        }
        return true;
      });
    }
    function attachSuspendReasonHiddenField() {
      ui.$form.append('<input type="hidden" name="suspendReason" id="usr-js-suspend-reason"/>');
    }
    function createReasonOption(newOptionValue, newOptionText) {
      return $(`<option value="${newOptionValue}" data-is-custom="true">${newOptionValue}</option>`);
    }
    function addReasonsToSelect() {
      const isStackOverflow = parentUrl === "https://stackoverflow.com";
      const reasonsToAdd = templateManager.customMessageTemplates.reduce((acc, message) => {
        if (message?.StackOverflowOnly === true && !isStackOverflow) {
          return acc;
        }
        acc.push(message.TemplateName);
        return acc;
      }, []);
      if (reasonsToAdd.length === 0) {
        return;
      }
      ui.$systemReasonOptions.wrapAll('<optgroup label="Stock Templates"></optgroup>');
      ui.$templateSelector.append(
        $('<optgroup label="Custom Templates"></optgroup>').append(...reasonsToAdd.map((reasonId) => createReasonOption(reasonId)))
      );
    }
    function checkForURLSearchParams() {
      const reasonIdParam = new URLSearchParams(window.location.search).get("reasonId");
      if (reasonIdParam) {
        ui.reasonId = reasonIdParam;
        ui.$templateSelector.trigger("change");
      }
    }
    function fixAutoSuspendMessagePluralisation() {
      ui.$suspensionOptions.on("change", () => {
        ui.autoSuspendMessageTemplateText = ui.autoSuspendMessageTemplateText.replace(
          /\$days\$ days?/,
          ui.suspendDays === 1 ? "$days$ day" : "$days$ days"
        );
        ui.refreshEditor();
      });
    }
    function setupProxyForNonDefaults() {
      $.ajaxSetup({
        beforeSend: (jqXHR, settings) => {
          if (!settings?.url?.startsWith("/admin/template/")) {
            return;
          }
          const url = new URL(settings.url, location.origin);
          if (!url.searchParams.has("reasonId")) {
            return;
          }
          const reasonId = url.searchParams.get("reasonId");
          if (templateManager.isSystemTemplate(reasonId)) {
            ui.suspendReason = reasonId;
            settings.success = new Proxy(settings.success, {
              apply: (target, thisArg, args) => {
                const [fieldDefaults] = args;
                fieldDefaults.MessageTemplate.Footer = fieldDefaults.MessageTemplate.Footer.replace("Regards,\n\n", "Regards,  \n");
                Reflect.apply(target, thisArg, args);
              }
            });
            return;
          }
          jqXHR.abort();
          const templateSearch = templateManager.lookupByReasonId(reasonId);
          if (templateSearch.length !== 1) {
            showStandardDangerToast("UserScript Message - Template with that name not found!");
            return;
          }
          const selectedTemplate = structuredClone(templateSearch[0]);
          selectedTemplate.TemplateBody = selectedTemplate.TemplateBody.formatUnicorn({ parentUrl, parentName });
          void $.ajax({
            type: "GET",
            url: url.pathname,
            data: {
              reasonId: selectedTemplate.AnalogousSystemReasonId
            },
            success: function(fieldDefaults) {
              fieldDefaults.MessageTemplate = {
                ...fieldDefaults.MessageTemplate,
                ...selectedTemplate
              };
              ui.suspendReason = selectedTemplate.AnalogousSystemReasonId;
              settings.success(fieldDefaults, "success", jqXHR);
            },
            error: settings.error
          });
        }
      });
    }
    function attachModMessageEditorModal() {
      const $modal = $messageTemplateEditorModal();
      $("body").append($modal);
    }
    function attachSettingsButton() {
      const $settingsButton = $(`<button type="button" class="s-btn s-btn__outlined s-btn__muted ws-nowrap mb6"><div class="d-flex fd-row fw-nowrap ai-center g4"><span>Message Template Editor</span> ${GearSvgHtmlString}</div></button>`);
      $settingsButton.on("click", (ev) => {
        ev.preventDefault();
        openEditorModal();
      });
      ui.$pageTitle.addClass("ai-center").append($settingsButton);
    }
    attachTemplateNameInputField();
    attachSuspendReasonHiddenField();
    addReasonsToSelect();
    checkForURLSearchParams();
    setupProxyForNonDefaults();
    fixAutoSuspendMessagePluralisation();
    attachModMessageEditorModal();
    attachSettingsButton();
  });
})();
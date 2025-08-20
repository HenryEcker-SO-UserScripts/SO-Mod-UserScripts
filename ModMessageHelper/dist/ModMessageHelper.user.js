// ==UserScript==
// @name         Custom Mod Message Templates V2
// @description  Adds mod message templates with default configurations to the mod message drop-down
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.2.5
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
  class ModMessageForm {
    blankTemplateOptionValue = "0";
    systemTemplateReasonIds;
    constructor() {
      this.systemTemplateReasonIds = /* @__PURE__ */ new Set([...this.$templateSelector.find("option").map((_, n) => $(n).val())]);
    }
    get $form() {
      return $("#js-msg-form");
    }
    get $messageContents() {
      return $("#js-message-contents");
    }
    get $aboutUserId() {
      return $('.js-about-user-id[name="userId"]');
    }
    get aboutUserId() {
      return Number(this.$aboutUserId.val());
    }
    get $templateSelector() {
      return $("#select-template-menu");
    }
    get reasonId() {
      return this.$templateSelector.val();
    }
    set reasonId(newOptionValue) {
      this.$templateSelector.val(newOptionValue);
    }
    get $suspendReasonInput() {
      return $("#usr-js-suspend-reason");
    }
    get suspendReason() {
      return this.$suspendReasonInput.val();
    }
    set suspendReason(newSuspendReason) {
      this.$suspendReasonInput.val(newSuspendReason);
    }
    get displayedSelectedTemplate() {
      return this.$templateSelector.find("option:selected").text();
    }
    get $customTemplateNameInput() {
      return $("#usr-template-name-input");
    }
    get customTemplateName() {
      return this.$customTemplateNameInput.val();
    }
    set customTemplateName(newTemplateName) {
      this.$customTemplateNameInput.val(newTemplateName);
    }
    get $suspensionOptions() {
      return $("#suspension-options");
    }
    get $suspensionDays() {
      return $('.js-suspension-days[name="suspendDays"]');
    }
    get suspendDays() {
      return Number(this.$suspensionDays.val());
    }
    get $editor() {
      return $("#wmd-input");
    }
    get editorText() {
      return this.$editor.val();
    }
    set editorText(newText) {
      this.$editor.val(newText);
    }
    refreshEditor() {
      StackExchange.MarkdownEditor.refreshAllPreviews();
    }
    get $autoSuspendMessageField() {
      return $("#js-auto-suspend-message");
    }
    get autoSuspendMessageTemplateText() {
      return this.$autoSuspendMessageField.val();
    }
    set autoSuspendMessageTemplateText(newValue) {
      this.$autoSuspendMessageField.val(newValue);
    }
    isSystemTemplate(reasonId) {
      return this.systemTemplateReasonIds.has(reasonId ?? this.reasonId);
    }
    hasTemplateSelected() {
      return this.reasonId !== this.blankTemplateOptionValue;
    }
    hasCustomTemplateName() {
      return this.displayedSelectedTemplate !== this.customTemplateName;
    }
  }
  const ui = new ModMessageForm();
  class TemplateManager {
    templates;
    constructor() {
      this.templates = GM_getValue("ModMessageTemplates", []);
    }
    get customMessageTemplates() {
      return this.templates;
    }
    getCustomMessageTemplateByReasonId(reasonId) {
      return this.templates.filter((x) => {
        return x.TemplateName.localeCompare(reasonId) === 0;
      });
    }
  }
  const templateManager = new TemplateManager();
  const modalId = "usr-mmt-editor-modal";
  const saveButtonId = `${modalId}-btn-save`;
  const newTemplateButtonId = `${modalId}-btn-new`;
  const importTemplateButtonId = `${modalId}-btn-import`;
  const exportTemplatesButtonId = `${modalId}-btn-export`;
  const deleteTemplateButtonId = `${modalId}-btn-delete`;
  const templateListContainerId = `${modalId}-template-list-container`;
  function $messageTemplateEditorModal() {
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
</aside>`);
    const $templateList = $("<ol>");
    for (const [index, userDefinedTemplate] of templateManager.customMessageTemplates.entries()) {
      const $elem = $(`<li draggable="true">${userDefinedTemplate.TemplateName}</li>`);
      $elem.attr("data-original-index", index);
      $elem.on("dragstart", (e) => {
        e.originalEvent.dataTransfer.effectAllowed = "move";
        e.originalEvent.dataTransfer.clearData();
        e.originalEvent.dataTransfer.setData("text/plain", index.toString());
      });
      $elem.on("dragover", (e) => {
        e.preventDefault();
      });
      $elem.on("drop", (e) => {
        const $srcElem = $templateList.find(`li[data-original-index=${e.originalEvent.dataTransfer.getData("text/plain")}]`);
        const $target = $(e.target);
        const currentSrcIndex = $("li", $templateList).index($srcElem);
        const currentTargetIndex = $("li", $templateList).index($target);
        if (currentTargetIndex > currentSrcIndex) {
          $srcElem.insertAfter($target);
        } else {
          $srcElem.insertBefore($target);
        }
      });
      $templateList.append($elem);
    }
    $aside.find(`#${templateListContainerId}`).append($templateList);
    return $aside;
  }
  StackExchange.ready(function() {
    if (!StackExchange?.options?.user?.isModerator) {
      return;
    }
    const parentUrl = StackExchange?.options?.site?.parentUrl ?? location.origin;
    const parentName = StackExchange.options?.site?.name;
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
      return $(`<option value="${newOptionValue}">${newOptionValue}</option>`);
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
      ui.$templateSelector.find(`option[value!="${ui.blankTemplateOptionValue}"]`).wrapAll('<optgroup label="Stock Templates"></optgroup>');
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
          if (ui.isSystemTemplate(reasonId)) {
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
          const templateSearch = templateManager.getCustomMessageTemplateByReasonId(reasonId);
          if (templateSearch.length !== 1) {
            StackExchange.helpers.showToast("UserScript Message - Template with that name not found!", { type: "danger" });
            return;
          }
          const selectedTemplate = templateSearch[0];
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
    function addModMessageTemplateEditorModal() {
      $("body").append($messageTemplateEditorModal());
      setTimeout(() => {
        Stacks.showModal(document.getElementById(modalId));
      }, 0);
    }
    attachTemplateNameInputField();
    attachSuspendReasonHiddenField();
    addReasonsToSelect();
    checkForURLSearchParams();
    setupProxyForNonDefaults();
    fixAutoSuspendMessagePluralisation();
    addModMessageTemplateEditorModal();
  });
})();

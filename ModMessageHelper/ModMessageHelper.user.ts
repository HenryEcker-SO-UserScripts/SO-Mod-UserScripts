import ui from './ModMessageForm';
import type {AjaxSuccess, TemplateRequestResponse} from './ModMessageTypes';
import {$messageTemplateEditorModal, modalId} from './TemplateEditorModal';
import templateManager from './TemplateManager';
import {parentUrl, parentName} from './ModMessageConstants';


StackExchange.ready(function () {
    if (!StackExchange?.options?.user?.isModerator) {
        return;
    }

    function attachTemplateNameInputField() {
        const customTemplateDivHiddenClass = 'd-none';

        // Get rid of the name field of the template selector dropdown
        // Use the input field for this value instead
        ui.$templateSelector.removeAttr('name');

        const $customTemplateDiv =
            $(`<div class="${customTemplateDivHiddenClass} d-flex gy4 fd-column mb12"></div>`)
                .append('<label class="flex--item s-label">Template Name</label>')
                .append('<input id="usr-template-name-input" name="templateName" class="flex--item s-input wmx4" maxlength="272">');

        ui.$messageContents.before($customTemplateDiv);

        // populate this field with the display text
        ui.$templateSelector.on('change', (e: JQuery.ChangeEvent<HTMLSelectElement>) => {
            if (!e.target.options[e.target.selectedIndex]) {
                // Don't do anything if there's no selected index (some error in selection happened)
                return;
            }
            ui.customTemplateName = e.target.options[e.target.selectedIndex].text;

            // Only show custom template name input field when template has been selected
            if (ui.hasTemplateSelected()) {
                $customTemplateDiv.removeClass(customTemplateDivHiddenClass);
            } else {
                $customTemplateDiv.addClass(customTemplateDivHiddenClass);
            }
        });

        // Prevent enter key press in template name field from submitting form
        ui.$customTemplateNameInput.on('keydown', (ev: JQuery.KeyDownEvent<HTMLInputElement>) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                return false;
            }
            return true;
        });
    }

    function attachSuspendReasonHiddenField() {
        ui.$form.append('<input type="hidden" name="suspendReason" id="usr-js-suspend-reason"/>');
    }

    function createReasonOption(newOptionValue: string, newOptionText?: string): JQuery<HTMLOptionElement> {
        return $(`<option value="${newOptionValue}">${newOptionText ?? newOptionValue}</option>`);
    }

    function addReasonsToSelect() {
        const isStackOverflow = parentUrl === 'https://stackoverflow.com';

        const reasonsToAdd: string[] = templateManager.customMessageTemplates
            .reduce((acc, message) => {
                // If is a StackOverflowOnly Template and this is not Stack Overflow don't include in result
                if (message?.StackOverflowOnly === true && !isStackOverflow) {
                    return acc;
                }

                acc.push(message.TemplateName);

                return acc;
            }, []);

        if (reasonsToAdd.length === 0) {
            return; // Don't make any changes if there are no custom templates
        }

        // Move default templates into an optgroup (excluding value blankTemplateOptionValue which is "Please select a template..."
        ui.$templateSelector.find(`option[value!="${ui.blankTemplateOptionValue}"]`).wrapAll('<optgroup label="Stock Templates"></optgroup>');

        // Create new optgroup with custom templates
        ui.$templateSelector.append(
            $('<optgroup label="Custom Templates"></optgroup>')
                .append(...reasonsToAdd.map(reasonId => createReasonOption(reasonId)))
        );
    }

    function checkForURLSearchParams() {
        const reasonIdParam = new URLSearchParams(window.location.search).get('reasonId');
        if (reasonIdParam) {
            ui.reasonId = reasonIdParam;
            // Trigger a change event to notify the change listener in attachTemplateNameInputField
            ui.$templateSelector.trigger('change');
        }
    }

    function fixAutoSuspendMessagePluralisation() {
        ui.$suspensionOptions.on('change', () => {
            // Update Auto Suspend Template value to correctly pluralise suspend days
            ui.autoSuspendMessageTemplateText = ui.autoSuspendMessageTemplateText.replace(
                /\$days\$ days?/,
                ui.suspendDays === 1 ? '$days$ day' : '$days$ days'
            );
            // Force Editor to rerender with new template values
            ui.refreshEditor();
        });
    }

    function setupProxyForNonDefaults() {
        $.ajaxSetup({
            beforeSend: (jqXHR, settings) => {
                // If not a request for an admin template do nothing
                if (!settings?.url?.startsWith('/admin/template/')) {
                    return;
                }

                const url = new URL(settings.url, location.origin);

                // If this isn't a request for a reasonId do nothing
                if (!url.searchParams.has('reasonId')) {
                    return;
                }

                const reasonId = url.searchParams.get('reasonId');

                // If this is one of the system templates
                if (ui.isSystemTemplate(reasonId)) {

                    // Set suspendReason to reasonId; this makes sure the correct suspend reason is chosen
                    // if starting with a stock template then later changing the template name text field
                    ui.suspendReason = reasonId;

                    // Create a proxy to fix the paragraph break in the footer
                    // also fixes custom reasons due to the call to an AnalogousSystemReasonId to populate the majority of fields
                    settings.success = new Proxy(settings.success, {
                        apply: (target: AjaxSuccess, thisArg, args: Parameters<AjaxSuccess>) => {
                            const [fieldDefaults] = args;
                            fieldDefaults.MessageTemplate.Footer = fieldDefaults.MessageTemplate.Footer.replace('Regards,\n\n', 'Regards,  \n');
                            Reflect.apply(target, thisArg, args);
                        }
                    });
                    return;
                }
                // Abort the request preemptively (it will fail since reasonId must be a custom reason)
                jqXHR.abort();

                // Find the selected reason in the list of templates
                const templateSearch = templateManager.lookupByReasonId(reasonId);

                if (templateSearch.length !== 1) {
                    StackExchange.helpers.showToast('UserScript Message - Template with that name not found!', {type: 'danger'});
                    return;
                }

                const selectedTemplate = templateSearch[0];
                // Replace Known Placeholders in TemplateBody
                selectedTemplate.TemplateBody = selectedTemplate.TemplateBody.formatUnicorn({parentUrl, parentName});
                // Make a different request to an analogous system defined reason to populate the majority of the fields
                void $.ajax({
                    type: 'GET',
                    url: url.pathname,
                    data: {
                        reasonId: selectedTemplate.AnalogousSystemReasonId
                    },
                    success: function (fieldDefaults: TemplateRequestResponse) {
                        // Merge returned Values with template specified values
                        fieldDefaults.MessageTemplate = {
                            ...fieldDefaults.MessageTemplate,
                            ...selectedTemplate,
                        };

                        // Set Suspend Reason Field to AnalogousSystemReasonId
                        ui.suspendReason = selectedTemplate.AnalogousSystemReasonId;

                        // Force call the old Success function with updated values
                        (<AjaxSuccess>settings.success)(fieldDefaults, 'success', jqXHR);
                    },
                    error: settings.error
                });
            }
        });
    }

    // TODO: This should be run only on settings button click
    function addModMessageTemplateEditorModal() {
        const modal = document.getElementById(modalId);
        if (!modal) {

            $('body').append($messageTemplateEditorModal());

            setTimeout(() => {
                const modal = document.getElementById(modalId);
                Stacks.showModal(modal);
            }, 0);
        } else {
            Stacks.showModal(modal);
        }
    }

    attachTemplateNameInputField();
    attachSuspendReasonHiddenField();
    addReasonsToSelect();
    checkForURLSearchParams();
    setupProxyForNonDefaults();
    fixAutoSuspendMessagePluralisation();
    addModMessageTemplateEditorModal();
});

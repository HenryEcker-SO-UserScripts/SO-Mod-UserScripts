import buildViteConfig from '../vite-config-builder';
import filterReplace from 'vite-plugin-filter-replace';
import {
    actions,
    controllerTargets,
    dataController,
    initialModal,
    modalId,
    remainingFormFields,
    targets
} from './util-beadh/stimulus-html-components';
import beautifyPlugin from '../vite-plugin-beautify-output';

const banner = `// ==UserScript==
// @name         Ban Evasion Account Delete Helper
// @description  Adds streamlined interface for deleting evasion accounts, then annotating and messaging the main accounts
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.1.7
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/dist/BanEvasionAccountDeleteHelper.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/dist/BanEvasionAccountDeleteHelper.user.js
//
// @match        *://*.stackoverflow.com/users/account-info/*
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, Stacks, $ */`;

export default ({mode}) => {
    const config = buildViteConfig('BanEvasionAccountDeleteHelper', banner);

    config.plugins.push(
        beautifyPlugin({
            brace_style: 'collapse,preserve-inline',
            break_chained_methods: true
        })
    );

    if (mode === 'testing') {
        config.plugins.push(
            filterReplace(
                [
                    // Replace (potentially) dangerous mod actions with the testing equivalents (simulated operations)
                    {
                        replace: {
                            from: /\/Utilities\/UserModActions/g,
                            to: '/Utilities-Testing/UserModActions'
                        }
                    }
                ],
                {enforce: 'pre'}
            )
        );
    }

    config.define = {
        // HTML
        JS_MODAL_ID: JSON.stringify(modalId),
        INITIAL_MODAL_HTML: `\`${initialModal}\``,
        MODAL_FORM_HTML: `\`${remainingFormFields}\``,
        // STIMULUS DATA CONTROLLER STRINGS
        DATA_CONTROLLER: JSON.stringify(dataController),
        MAIN_ACCOUNT_ID_INPUT_TARGET: JSON.stringify(targets.mainAccountIdInput),
        MAIN_ACCOUNT_ID_INPUT_BUTTON_TARGET: JSON.stringify(targets.mainAccountIdInputButton),
        FORM_ELEMENTS_TARGET: JSON.stringify(targets.formElements),
        DELETION_REASON_SELECT_TARGET: JSON.stringify(targets.deletionReasonSelect),
        DELETION_DETAILS_TARGET: JSON.stringify(targets.deletionDetails),
        ANNOTATION_DETAILS_TARGET: JSON.stringify(targets.annotationDetails),
        SHOULD_MESSAGE_AFTER_TARGET: JSON.stringify(targets.shouldMessageAfter),
        CONTROLLER_SUBMIT_BUTTON_TARGET: JSON.stringify(targets.controllerSubmitButton),
        CONTROLLER_TARGETS: JSON.stringify(controllerTargets), // <- string[] not string!!
        // String Replacement of function name (not in vite-define.d)
        HANDLE_SUBMIT_ACTION: actions.handleSubmitActions,
        HANDLE_CANCEL_ACTION: actions.handleCancelActions,
        HANDLE_LOOKUP_MAIN_ACCOUNT: actions.handleLookupMainAccount,
    };
    return config;
};
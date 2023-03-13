import buildViteConfig from '../vite-config-builder';
import filterReplace from 'vite-plugin-filter-replace';
import stimulusHtmlDefineObj from './util-beadh/stimulus-html-components';
import beautifyPlugin from '../vite-plugin-beautify-output';
import {buildMatchPatterns} from '../banner-build-util';

const banner = `// ==UserScript==
// @name         Ban Evasion Account Delete Helper
// @description  Adds streamlined interface for deleting evasion accounts, then annotating and messaging the main accounts
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.1.9
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/dist/BanEvasionAccountDeleteHelper.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/dist/BanEvasionAccountDeleteHelper.user.js
//
${buildMatchPatterns('// @match        ', '/users/account-info/*')}
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
                    },
                    {
                        replace: {
                            from: 'window.location.reload();',
                            to: 'console.log(\'window.location.reload()\');'
                        }
                    }
                ],
                {enforce: 'pre'}
            )
        );
    }

    config.define = {
        ...stimulusHtmlDefineObj
    };
    return config;
};
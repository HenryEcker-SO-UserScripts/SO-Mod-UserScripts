import buildViteConfig from '../vite-config-builder';
import filterReplace from 'vite-plugin-filter-replace';
import stimulusHtmlDefineObj from './stimulus-components/prebuildable-stimulus-components';
import beautifyPlugin from '../vite-plugin-beautify-output';
import {buildMatchPatterns} from '../banner-build-util';

const banner = `// ==UserScript==
// @name         Ban Evasion Account Delete Helper
// @description  Adds streamlined interface for deleting evasion accounts, then annotating and messaging the main accounts
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.2.2
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
        // Strip away namespace name
        filterReplace(
            [
                {
                    replace: {
                        from: 'BEADHNS.',
                        to: ''
                    }
                }
            ],
            {enforce: 'pre'}
        ),
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
                            from: /se-ts-userscript-utilities\/Moderators\/UserModActions/g,
                            to: 'se-ts-userscript-utilities/Moderators-Testing/UserModActions'
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
import buildViteConfig from '../vite-config-builder';
import filterReplace from 'vite-plugin-filter-replace';

const banner = `// ==UserScript==
// @name         Ban Evasion Account Delete Helper
// @description  Adds streamlined interface for deleting evasion accounts, then annotating and messaging the main accounts
// @homepage     https://github.com/HenryEcker/SO-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.7
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
    const plugins = mode === 'testing' ? [
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
    ] : [];
    return buildViteConfig('BanEvasionAccountDeleteHelper', banner, plugins);
};
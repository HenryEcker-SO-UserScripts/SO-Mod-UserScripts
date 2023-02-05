import buildViteConfig from '../vite-config-builder';

export default buildViteConfig(
    'BanEvasionAccountDeleteHelper',
    `// ==UserScript==
// @name         Ban Evasion Account Delete Helper
// @description  Adds streamlined interface for deleting evasion accounts, then annotating and messaging the main accounts
// @homepage     https://github.com/HenryEcker/SO-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.4
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/dist/BanEvasionAccountDeleteHelper.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/dist/BanEvasionAccountDeleteHelper.user.js
//
// @match        *://*.stackoverflow.com/users/account-info/*
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, Stacks, $ */`);
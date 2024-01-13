import buildViteConfig from '../vite-config-builder';

export default buildViteConfig(
    'DiscussionsBetaFlagStats',
    `// ==UserScript==
// @name         Discussions Beta Flag Stats
// @description  Adds statistics about flag counts and users in discussions
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.5
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/DiscussionsBetaFlagStats/dist/DiscussionsBetaFlagStats.user.js
// @updateURL    https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/DiscussionsBetaFlagStats/dist/DiscussionsBetaFlagStats.user.js
//
// @match        *://stackoverflow.com/beta/discussions/flags*
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */`);
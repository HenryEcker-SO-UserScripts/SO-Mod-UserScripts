import buildViteConfig from '../vite-config-builder';

export default buildViteConfig(
    'ReviewHistoryLinks',
    `// ==UserScript==
// @name         Review History Links
// @description  Adds direct links to individual user review history from the review result notice
// @homepage     https://github.com/HenryEcker/SO-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.2
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/ReviewHistoryLinks/dist/ReviewHistoryLinks.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/ReviewHistoryLinks/dist/ReviewHistoryLinks.user.js
//
// @match        *://*.askubuntu.com/review/*
// @match        *://*.serverfault.com/review/*
// @match        *://*.stackapps.com/review/*
// @match        *://*.stackexchange.com/review/*
// @match        *://*.stackoverflow.com/review/*
// @match        *://*.superuser.com/review/*
// @match        *://*.mathoverflow.net/review/*
//
// @exclude      /^https?:\\/\\/.*((askubuntu|serverfault|stackapps|stackexchange|stackoverflow|superuser)\\.com|mathoverflow\\.net)\\/review\\/.*\\/(stats|history)/
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */`);
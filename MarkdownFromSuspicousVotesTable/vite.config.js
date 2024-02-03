import buildViteConfig from '../vite-config-builder';
import {buildMatchPatterns} from '../banner-build-util';

export default buildViteConfig(
    'MarkdownFromSuspicousVotesTable',
    `// ==UserScript==
// @name         Markdown From Suspicious Votes Table
// @description  Creates an easy way to build a markdown table from a suspicious votes query
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.5
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/MarkdownFromSuspicousVotesTable/dist/MarkdownFromSuspicousVotesTable.user.js
// @updateURL    https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/MarkdownFromSuspicousVotesTable/dist/MarkdownFromSuspicousVotesTable.user.js
//
${buildMatchPatterns('// @match        ', '/admin/show-suspicious-votes*')}
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */`);
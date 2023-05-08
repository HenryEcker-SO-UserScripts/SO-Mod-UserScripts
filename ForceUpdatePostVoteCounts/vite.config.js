import buildViteConfig from '../vite-config-builder';
import {buildMatchPatterns} from '../banner-build-util';

export default buildViteConfig(
    'ForceUpdatePostVoteCounts',
    `// ==UserScript==
// @name         Update Post Votes From User Page
// @description  Adds button to fetch vote count for all posts to update counts (e.g. after invalidation)
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.1
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/ForceUpdatePostVoteCounts/dist/ForceUpdatePostVoteCounts.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/ForceUpdatePostVoteCounts/dist/ForceUpdatePostVoteCounts.user.js
//
${buildMatchPatterns('// @match        ', '/users/*/*?tab=answers*', '/users/*/*?tab=questions*')}
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */`);
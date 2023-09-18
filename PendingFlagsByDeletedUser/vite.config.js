import buildViteConfig from '../vite-config-builder';
import {buildMatchPatterns} from '../banner-build-util';


export default buildViteConfig(
    'PendingFlagsByDeletedUser',
    `// ==UserScript==
// @name         Pending Flags By Deleted User
// @description  Searches timelines for any pending flags on posts by deleted users
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.5
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/PendingFlagsByDeletedUser/dist/PendingFlagsByDeletedUser.user.js
//
${buildMatchPatterns('// @match        ', '/admin/posts-by-deleted-user/*')}
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */`
);
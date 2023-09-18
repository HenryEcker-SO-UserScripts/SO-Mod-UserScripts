import buildViteConfig from '../vite-config-builder';
import {buildMatchPatterns} from '../banner-build-util';


export default buildViteConfig(
    'Delete-UndeleteFromUserPage',
    `// ==UserScript==
// @name         Inline delete/undelete post buttons
// @description  Adds delete/undelete buttons on the questions and answers tabs in user profile
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.1.1
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/Delete-UndeletedFromUserPage/dist/Delete-UndeleteFromUserPage.user.js
// @updateURL    https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/Delete-UndeletedFromUserPage/dist/Delete-UndeleteFromUserPage.user.js
//
${buildMatchPatterns('// @match        ', '/users/*/*?tab=answers*', '/users/*/*?tab=questions*')}
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */`
);
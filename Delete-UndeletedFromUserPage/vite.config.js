import buildViteConfig from '../vite-config-builder';


export default buildViteConfig(
    'Delete-UndeleteFromUserPage',
    `// ==UserScript==
// @name         Inline delete/undelete post buttons
// @description  Adds delete/undelete buttons on the questions and answers tabs in user profile
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.8
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/Delete-UndeletedFromUserPage/dist/Delete-UndeleteFromUserPage.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/Delete-UndeletedFromUserPage/dist/Delete-UndeleteFromUserPage.user.js
//
// @match        *://*.stackoverflow.com/users/*/*?tab=answers*
// @match        *://*.stackoverflow.com/users/*/*?tab=questions*
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */`
);
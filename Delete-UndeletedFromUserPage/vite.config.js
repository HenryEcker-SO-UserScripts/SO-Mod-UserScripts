import path from 'path';
import banner from 'vite-plugin-banner';

const fileNameBase = 'Delete-UndeleteFromUserPage';

export default {
    plugins: [
        banner(`// ==UserScript==
// @name         Inline delete/undelete post buttons
// @description  Adds delete/undelete buttons on the questions and answers tabs in user profile
// @homepage     https://github.com/HenryEcker/SO-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.7
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/Delete-UndeletedFromUserPage/dist/Delete-UndeleteFromUserPage.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/Delete-UndeletedFromUserPage/dist/Delete-UndeleteFromUserPage.user.js
//
// @match        *://*.stackoverflow.com/users/*/*?tab=answers*
// @match        *://*.stackoverflow.com/users/*/*?tab=questions*
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */`)
    ],
    build: {
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, `${fileNameBase}.user.ts`)
            },
            output: {
                banner: '(function() {"use strict";',
                footer: '})();',
                manualChunks: undefined,
                entryFileNames: `${fileNameBase}.user.js`
            }
        },
        minify: false,
        outDir: './dist',
        assetsDir: '',
        sourcemap: false,
        target: ['ESNext'],
        reportCompressedSize: false
    }
};
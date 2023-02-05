import path from 'path';
import banner from 'vite-plugin-banner';


const fileNameBase = 'BanEvasionAccountDeleteHelper';

export default {
    plugins: [
        banner(`// ==UserScript==
// @name         Ban Evasion Account Delete Helper
// @description  Adds streamlined interface to deleting, annotating, and messaging accounts
// @homepage     https://github.com/HenryEcker/SO-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.3
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/dist/BanEvasionAccountDeleteHelper.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/dist/BanEvasionAccountDeleteHelper.user.js
//
// @match        *://*.stackoverflow.com/users/account-info/*
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, Stacks, $ */`)
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
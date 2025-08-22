import {buildMatchPatterns} from '../banner-build-util';
import banner from 'vite-plugin-banner';


function indentString(str, count) {
    return str.replace(/^/gm, ' '.repeat(count));
}

const fileNameBase = 'ModMessageHelper';

const bannerText = `// ==UserScript==
// @name         Custom Mod Message Templates V2
// @description  Adds mod message templates with default configurations to the mod message drop-down
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.2.5
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/ModMessageHelper/dist/ModMessageHelper.user.js
//
${buildMatchPatterns('// @match        ', '/users/message/create/*')}
//
// @grant        GM_getValue
// @grant        GM_setValue
//
// ==/UserScript==
/* globals StackExchange, $ */`;

// noinspection JSUnusedGlobalSymbols
const modOnlyReadyWrapPlugin = {
    name: 'wrap-in-StackExchange-ready',
    generateBundle(outputOptions, bundle) {
        Object.keys(bundle).forEach((fileName) => {
            const file = bundle[fileName];
            if (fileName === 'ModMessageHelper.user.js' && 'code' in file) {
                file.code = `(function() {
  "use strict";      
          
  StackExchange.ready(function () {
    if (!StackExchange?.options?.user?.isModerator) {
        return;
    }
${indentString(file.code, 4).trimEnd()}
  });
})();`;
            }
        });
    }
};

export default {
    plugins: [
        banner(bannerText),
        modOnlyReadyWrapPlugin
    ],
    build: {
        rollupOptions: {
            input: {
                main: `${fileNameBase}.user.ts`
            },
            output: {
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
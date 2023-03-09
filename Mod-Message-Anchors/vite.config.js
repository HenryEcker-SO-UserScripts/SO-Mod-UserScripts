import buildViteConfig from '../vite-config-builder';
import {buildMatchPatterns} from '../banner-build-util';
import beautifyPlugin from '../vite-plugin-beautify-output';

const config = buildViteConfig(
    'ModMessageAnchors',
    `// ==UserScript==
// @name         Mod Message Anchors
// @description  Adds anchor links to specific mod messages and CM escalation messages
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.3
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/Mod-Message-Anchors/dist/ModMessageAnchors.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/Mod-Message-Anchors/dist/ModMessageAnchors.user.js
//
${buildMatchPatterns('// @match        ', '/admin/cm-message/*', '/users/message/*')}
//
// @grant        none
//
// ==/UserScript==
/* globals $ */`);

config.plugins.push(
    beautifyPlugin({
        brace_style: 'collapse,preserve-inline',
        break_chained_methods: true
    })
);
export default config;
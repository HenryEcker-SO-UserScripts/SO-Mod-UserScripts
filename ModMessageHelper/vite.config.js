import buildViteConfig from '../vite-config-builder';
import {buildMatchPatterns} from '../banner-build-util';


export default buildViteConfig(
    'ModMessageHelper',
    `// ==UserScript==
// @name         Custom Mod Message Templates V2
// @description  Adds mod message templates with default configurations to the mod message drop-down
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.12
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/ModMessageHelper/dist/ModMessageHelper.user.js
//
${buildMatchPatterns('// @match        ', '/users/message/create/*')}
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */`
);
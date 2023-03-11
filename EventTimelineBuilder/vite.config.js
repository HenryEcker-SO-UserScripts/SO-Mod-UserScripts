import buildViteConfig from '../vite-config-builder';
import {buildMatchPatterns} from '../banner-build-util';

const config = buildViteConfig(
    'EventTimelineBuilder',
    `// ==UserScript==
// @name         Event Timeline Builder
// @description  TBD
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.1
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/EventTimelineBuilder/dist/EventTimelineBuilder.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/EventTimelineBuilder/dist/EventTimelineBuilder.user.js
//
${buildMatchPatterns('// @match        ', '/posts/*/timeline*')}
//
// @grant        GM_getValue
// @grant        GM_setValue
//
// ==/UserScript==
/* globals StackExchange, $ */`);


config.define = {
    DATA_CONTROLLER: 'etb-timeline-event',
    DATA_ACTION_POST_TIMELINE_TIMESTAMP_CLICK: 'handlePostTimelineTimestampClick',
};

export default config;
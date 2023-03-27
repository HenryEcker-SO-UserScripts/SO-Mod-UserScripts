import buildViteConfig from '../vite-config-builder';
import stimulusNWFHtmlDefineObj from './fadh-stimulus-components/prebuildable-stimulus-components';
import beautifyPlugin from '../vite-plugin-beautify-output';
import {buildMatchPatterns} from '../banner-build-util';
import filterReplace from 'vite-plugin-filter-replace';

const postButtonLabel = 'Flag and remove';

const banner = `// ==UserScript==
// @name         SE post flag and delete helper 
// @description  Adds a "${postButtonLabel}" button to all posts that assists in raising text flags and immediately handling them
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.2
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/FlagAndDeleteHelper/dist/FlagAndDeleteHelper.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/FlagAndDeleteHelper/dist/FlagAndDeleteHelper.user.js
//
${buildMatchPatterns('// @match        ', '/questions/*')}
//
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
//
// ==/UserScript==
/* globals StackExchange, Stacks, $ */`;

export default () => {
    const config = buildViteConfig('FlagAndDeleteHelper', banner);

    config.plugins.push(
        // Strip away namespace name
        filterReplace(
            [
                {
                    replace: {
                        from: 'FADHNS.',
                        to: ''
                    }
                }
            ],
            {enforce: 'pre'}
        ),
        beautifyPlugin({
            brace_style: 'collapse,preserve-inline'
        })
    );

    config.define = {
        ...stimulusNWFHtmlDefineObj,
        SUPPORTS_PLAGIARISM_FLAG_TYPE: [1],
        POST_BUTTON_LABEL: postButtonLabel
    };
    return config;
};
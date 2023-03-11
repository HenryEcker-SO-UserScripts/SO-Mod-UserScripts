// ==UserScript==
// @name         Event Timeline Builder
// @description  TBD
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.1
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/EventTimelineBuilder/dist/EventTimelineBuilder.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/EventTimelineBuilder/dist/EventTimelineBuilder.user.js
//
// @match        *://*.askubuntu.com/posts/*/timeline*
// @match        *://*.mathoverflow.net/posts/*/timeline*
// @match        *://*.serverfault.com/posts/*/timeline*
// @match        *://*.stackapps.com/posts/*/timeline*
// @match        *://*.stackexchange.com/posts/*/timeline*
// @match        *://*.stackoverflow.com/posts/*/timeline*
// @match        *://*.superuser.com/posts/*/timeline*
//
// @grant        GM_getValue
// @grant        GM_setValue
//
// ==/UserScript==
/* globals StackExchange, $ */
(function() {
  "use strict";
  function attachControllerToElements(elements, clickFn) {
    elements.each((i, n) => {
      const e = $(n);
      e.attr("data-controller", "etb-timeline-event");
      e.attr("data-action", `click->etb-timeline-event#${clickFn}`);
    });
  }
  function handlePostTimelineTimestampClick(ev) {
    console.log(ev.target);
  }
  function attachControllerToPostTimelineElements() {
    attachControllerToElements($(".relativetime"), "handlePostTimelineTimestampClick");
  }
  function buildStacksController() {
    const controllerConfig = {
      handlePostTimelineTimestampClick
    };
    Stacks.addController("etb-timeline-event", controllerConfig);
  }
  function main() {
    buildStacksController();
    const pathname = window.location.pathname;
    if (pathname.endsWith("/timeline")) {
      attachControllerToPostTimelineElements();
    }
  }
  StackExchange.ready(main);
})();

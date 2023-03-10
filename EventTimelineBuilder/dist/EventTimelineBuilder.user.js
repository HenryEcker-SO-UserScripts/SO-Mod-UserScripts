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
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */
(function() {
  "use strict";
  function addControllerAttributes(e, timestamp) {
    e.attr("data-controller", "etb-timeline-event");
    e.attr("data-action", "click->etb-timeline-event#handleTimestampClick");
    e.attr("data-etb-timeline-event-timestamp-param", timestamp);
  }
  function handleTimelinePage() {
    $(".relativetime").each((i, n) => {
      const e = $(n);
      addControllerAttributes(
        e,
        e.attr("title")
      );
    });
  }
  function buildStacksController() {
    Stacks.addController(
      "etb-timeline-event",
      {
        handleTimestampClick(ev) {
          console.log(ev.params);
        }
      }
    );
  }
  function main() {
    buildStacksController();
    const pathname = window.location.pathname;
    if (pathname.endsWith("/timeline")) {
      handleTimelinePage();
    }
  }
  StackExchange.ready(main);
})();

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
  function addControllerAttributes(e, timestamp, typeOfEvent, eventInitiator, linkToEvent, additionalEventDetails) {
    e.attr("data-controller", "etb-timeline-event");
    e.attr("data-action", "click->etb-timeline-event#handleTimestampClick");
    e.attr("data-etb-timeline-event-timestamp-param", timestamp);
    e.attr("data-etb-timeline-event-event-param", typeOfEvent);
    e.attr("data-etb-timeline-event-initiator-param", eventInitiator);
    e.attr("data-etb-timeline-event-link-param", linkToEvent);
    if (additionalEventDetails !== void 0) {
      e.attr("data-etb-timeline-event-details-param", additionalEventDetails);
    }
  }
  function parseTr(tr) {
    const typeOfEvent = tr.find("td:eq(1)").text().trim();
    const linkToEvent = tr.find("td:eq(2) a").attr("href");
    const eventInitiator = tr.find("td:eq(3)").html().trim();
    const details = tr.find("td:eq(5) span").html().trim();
    return {
      typeOfEvent,
      linkToEvent,
      eventInitiator,
      details
    };
  }
  function handleTimelinePage() {
    const timeElements = $(".relativetime");
    for (let i = 0; i < timeElements.length; i++) {
      const e = $(timeElements[i]);
      const timestamp = e.attr("title");
      const currentTr = e.closest("tr");
      const parsedTr = parseTr(currentTr);
      if ((parsedTr.typeOfEvent === void 0 || parsedTr.typeOfEvent.length === 0) && (parsedTr.linkToEvent === void 0 || parsedTr.linkToEvent.length === 0)) {
        const prevTr = $(timeElements[i - 1]).closest("tr");
        const { typeOfEvent: prevTypeOfEvent, linkToEvent: prevLinkToEvent } = parseTr(prevTr);
        parsedTr.typeOfEvent = `${prevTypeOfEvent} ${currentTr.find("td:eq(2)").text().trim()}`;
        parsedTr.linkToEvent = prevLinkToEvent;
      }
      addControllerAttributes(
        e,
        timestamp,
        parsedTr.typeOfEvent,
        parsedTr.eventInitiator,
        parsedTr.linkToEvent,
        parsedTr.details
      );
    }
  }
  function buildStacksController() {
    const controllerConfig = {
      handleTimestampClick(ev) {
        console.log(ev.params);
      }
    };
    Stacks.addController("etb-timeline-event", controllerConfig);
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

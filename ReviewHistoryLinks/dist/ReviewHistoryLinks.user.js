// ==UserScript==
// @name         Review History Links
// @description  Adds direct links to individual user review history from the review result notice
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.2
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/ReviewHistoryLinks/dist/ReviewHistoryLinks.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/ReviewHistoryLinks/dist/ReviewHistoryLinks.user.js
//
// @match        *://*.askubuntu.com/review/*
// @match        *://*.serverfault.com/review/*
// @match        *://*.stackapps.com/review/*
// @match        *://*.stackexchange.com/review/*
// @match        *://*.stackoverflow.com/review/*
// @match        *://*.superuser.com/review/*
// @match        *://*.mathoverflow.net/review/*
//
// @exclude      /^https?:\/\/.*((askubuntu|serverfault|stackapps|stackexchange|stackoverflow|superuser)\.com|mathoverflow\.net)\/review\/.*\/(stats|history)/
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */
(function() {
  "use strict";
  function fetchUserIdFromHref(href, convertToNumber = true) {
    let match = href.match(/\/users\/(\d+)\/.*/i);
    if (match === null) {
      match = href.match(/users\/account-info\/(\d+)/i);
    }
    if (match === null || match.length < 2) {
      return void 0;
    }
    if (!convertToNumber) {
      return match[1];
    }
    return Number(match[1]);
  }
  function getUserLinksFromNotice() {
    return $(".s-notice.s-notice__info").find('a[href^="/users"]');
  }
  function getReviewQueueBaseURL() {
    return window.location.pathname.split("/").slice(0, 3).join("/");
  }
  function getUserReviewQueueHistoryURL(userId) {
    return `${getReviewQueueBaseURL()}/history?${new URLSearchParams({ userId }).toString()}`;
  }
  function addHistoryLinks() {
    getUserLinksFromNotice().after(function() {
      const n = $(this);
      const userId = fetchUserIdFromHref(n.attr("href"), false);
      if (userId === void 0) {
        return document.createDocumentFragment();
      }
      return `<span> (<a href="${getUserReviewQueueHistoryURL(userId)}" target="_blank">Review History</a>)</span>`;
    });
  }
  function main() {
    $(document).on("ajaxComplete", (event, { responseJSON }, { url }) => {
      if ((url.startsWith("/review/next-task") || url.startsWith("/review/task-reviewed/")) && responseJSON?.reviewTaskId !== void 0) {
        addHistoryLinks();
      }
    });
  }
  StackExchange.ready(() => {
    if (!StackExchange.options.user.isModerator) {
      return;
    }
    main();
  });
})();

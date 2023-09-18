// ==UserScript==
// @name         Pending Flags By Deleted User
// @description  Searches timelines for any pending flags on posts by deleted users
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.6
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/PendingFlagsByDeletedUser/dist/PendingFlagsByDeletedUser.user.js
//
// @match        *://*.askubuntu.com/admin/posts-by-deleted-user/*
// @match        *://*.mathoverflow.net/admin/posts-by-deleted-user/*
// @match        *://*.serverfault.com/admin/posts-by-deleted-user/*
// @match        *://*.stackapps.com/admin/posts-by-deleted-user/*
// @match        *://*.stackexchange.com/admin/posts-by-deleted-user/*
// @match        *://*.stackoverflow.com/admin/posts-by-deleted-user/*
// @match        *://*.superuser.com/admin/posts-by-deleted-user/*
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */
(function() {
  "use strict";
  function getPostIds() {
    return $(".question-hyperlink,.answer-hyperlink").map((i, n) => {
      const $link = $(n);
      const match = $link.attr("href").match(/.*?#(?<answerid>\d+)$|^\/questions\/(?<questionid>\d+)\/.*/);
      return {
        $link,
        postId: match.groups.answerid ?? match.groups.questionid
      };
    }).toArray();
  }
  function fetchTimelinePage(postId) {
    return $.get(`/posts/${postId}/timeline`).then((resText) => {
      return resText;
    });
  }
  function hasOutstandingFlags(timelineContent) {
    return $(".event-type.flag", timelineContent).closest("tr:not(.deleted-event)").length !== 0;
  }
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  function* loopWithProgressBar(arr, $progressBarMountPoint) {
    if (arr.length === 0) {
      return;
    }
    const $wrapper = $('<div class="s-progress"></div>');
    const $progressBar = $(`<div class="s-progress--bar" role="progressbar" aria-valuemin="${0}" aria-valuemax="${arr.length}" aria-label="current progress"></div>`);
    $progressBarMountPoint.append($wrapper.append($progressBar));
    for (let i = 0; i < arr.length; i++) {
      $progressBar.attr("aria-valuenow", i);
      $progressBar.css("width", `${i / arr.length * 100}%`);
      yield arr[i];
    }
    $wrapper.remove();
  }
  async function main($buttonContainer) {
    let atLeastOneOutstandingFlag = false;
    for (const postData of loopWithProgressBar(getPostIds(), $buttonContainer)) {
      const timelineText = await fetchTimelinePage(postData.postId);
      if (hasOutstandingFlags(timelineText)) {
        postData.$link.addClass("bg-green-500");
        atLeastOneOutstandingFlag = true;
      }
      await sleep(500);
    }
    if (!atLeastOneOutstandingFlag) {
      StackExchange.helpers.showToast("No pending flags found!", {
        type: "info",
        transient: true,
        transientTimeout: 3e3
      });
    }
  }
  StackExchange.ready(() => {
    const $buttonContainer = $('<div class="clear-both" style="max-width: max-content"></div>');
    const $button = $('<button type="button" class="s-btn s-btn__outlined my8">Search post timelines for pending flags</button>');
    $button.on("click", () => {
      void main($buttonContainer);
    });
    $("#mainbar").append($buttonContainer.append($button));
  });
})();

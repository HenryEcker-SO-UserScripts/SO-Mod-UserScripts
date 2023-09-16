// ==UserScript==
// @name         Pending Flags By Deleted User
// @description  Searches timelines for any pending flags on posts by deleted users
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.2
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/PendingFlagsByDeletedUser/dist/PendingFlagsByDeletedUser.user.js
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
    return [
      ...$(".answer-hyperlink").map((i, n) => {
        const $link = $(n);
        const url = new URL($link.attr("href"), window.location.origin);
        return { $link, postId: url.hash.slice(1) };
      }).toArray(),
      ...$(".question-hyperlink").map((i, n) => {
        const $link = $(n);
        const match = $link.attr("href").match(/questions\/(\d+)\/.*/);
        return { $link, postId: match[1] };
      }).toArray()
    ];
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
  class ProgressBar {
    $progressBar;
    $wrapper;
    min;
    max;
    constructor($mountPoint, min, max) {
      this.min = min;
      this.max = max;
      this.$progressBar = $(`<div class="s-progress--bar" role="progressbar" aria-valuemin="${this.min}" aria-valuemax="${this.max}" aria-label="current progress"></div>`);
      this.$wrapper = $('<div class="s-progress"></div>');
      $mountPoint.append(
        this.$wrapper.append(this.$progressBar)
      );
    }
    update(currentValue) {
      this.$progressBar.attr("aria-valuenow", currentValue);
      this.$progressBar.css("width", `${(currentValue - this.min) / this.max * 100}%`);
    }
    destroy() {
      this.$wrapper.remove();
    }
  }
  function* loopWithProgressBar(arr, $progressBarMountPoint) {
    const bar = new ProgressBar($progressBarMountPoint, 0, arr.length);
    for (let i = 0; i < arr.length; i++) {
      bar.update(i);
      yield arr[i];
    }
    bar.destroy();
  }
  async function main($buttonContainer) {
    let atLeastOneOutstandingFlag = false;
    for (const postData of loopWithProgressBar(getPostIds(), $buttonContainer)) {
      const timelineText = await fetchTimelinePage(postData.postId);
      if (hasOutstandingFlags(timelineText)) {
        postData.$link.addClass("bg-green-500");
        atLeastOneOutstandingFlag = true;
      }
      await sleep(300);
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
    const $buttonContainer = $('<div class="clear-both" style="max-width: 25vw;"></div>');
    const $button = $('<button type="button" class="s-btn s-btn__outlined my8">Search post timelines for pending flags</button>');
    $button.on("click", () => {
      void main($buttonContainer);
    });
    $("#mainbar").append($buttonContainer.append($button));
  });
})();

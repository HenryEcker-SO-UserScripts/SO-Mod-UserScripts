// ==UserScript==
// @name         Suggested Edit Queue Status Checker
// @description  Adds button to post menu which sends an anonymous edit request to determine if suggested edits are current available or not.
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.1
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/SuggestedEditStatusChecker/dist/SuggestedEditQueueStatusChecker.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/SuggestedEditStatusChecker/dist/SuggestedEditQueueStatusChecker.user.js
//
// @match        *://*.askubuntu.com/questions/*
// @match        *://*.serverfault.com/questions/*
// @match        *://*.stackapps.com/questions/*
// @match        *://*.stackexchange.com/questions/*
// @match        *://*.stackoverflow.com/questions/*
// @match        *://*.superuser.com/questions/*
// @match        *://*.mathoverflow.net/questions/*
//
// ==/UserScript==
/* globals $, StackExchange */
(function() {
  "use strict";
  function isSuggestedEditQueueFull(postId) {
    return fetch(
      `/posts/${postId}/edit`,
      {
        method: "GET",
        credentials: "omit"
        // Send without credentials
      }
    ).then(({ status }) => {
      return status !== 200;
    });
  }
  function buildCheckEditQueueButton(postId, editHref) {
    const checkButton = $('<a title="Check if it is possible to suggest edits">Edit Queue</a>');
    checkButton.attr("href", editHref);
    checkButton.on("click", (ev) => {
      ev.preventDefault();
      void isSuggestedEditQueueFull(postId).then((isFull) => {
        StackExchange.helpers.showToast(
          isFull ? "Suggested Edit Queue is full." : "Suggested Edit Queue is not full.",
          {
            type: isFull ? "danger" : "success",
            transient: true,
            transientTimeout: 3e3
          }
        );
      });
    });
    return checkButton;
  }
  function main() {
    const jPostMenu = $(".js-post-menu");
    const postId = jPostMenu.data("post-id");
    const editButton = jPostMenu.find(".js-edit-post");
    editButton.parent().after(
      $('<div class="flex--item"></div>').append(buildCheckEditQueueButton(postId, editButton.attr("href")))
    );
  }
  StackExchange.ready(main);
})();

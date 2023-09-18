// ==UserScript==
// @name         Update Post Votes From User Page
// @description  Adds button to fetch vote count for all posts to update counts (e.g. after invalidation)
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.1
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/ForceUpdatePostVoteCounts/dist/ForceUpdatePostVoteCounts.user.js
// @updateURL    https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/ForceUpdatePostVoteCounts/dist/ForceUpdatePostVoteCounts.user.js
//
// @match        *://*.askubuntu.com/users/*/*?tab=answers*
// @match        *://*.askubuntu.com/users/*/*?tab=questions*
// @match        *://*.mathoverflow.net/users/*/*?tab=answers*
// @match        *://*.mathoverflow.net/users/*/*?tab=questions*
// @match        *://*.serverfault.com/users/*/*?tab=answers*
// @match        *://*.serverfault.com/users/*/*?tab=questions*
// @match        *://*.stackapps.com/users/*/*?tab=answers*
// @match        *://*.stackapps.com/users/*/*?tab=questions*
// @match        *://*.stackexchange.com/users/*/*?tab=answers*
// @match        *://*.stackexchange.com/users/*/*?tab=questions*
// @match        *://*.stackoverflow.com/users/*/*?tab=answers*
// @match        *://*.stackoverflow.com/users/*/*?tab=questions*
// @match        *://*.superuser.com/users/*/*?tab=answers*
// @match        *://*.superuser.com/users/*/*?tab=questions*
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */
(function() {
  "use strict";
  function ajaxGet(endPoint) {
    return new Promise((resolve, reject) => {
      void $.ajax({
        type: "GET",
        url: endPoint
      }).done((resData) => {
        resolve(resData);
      }).fail((res) => {
        reject(res.responseText ?? "An unknown error occurred");
      });
    });
  }
  function getVoteCounts(postId) {
    return ajaxGet(`/posts/${postId}/vote-counts`);
  }
  function getMessageFromCaughtElement(e) {
    if (e instanceof Error) {
      return e.message;
    } else if (typeof e === "string") {
      return e;
    } else {
      console.error(e);
      return e.toString();
    }
  }
  async function disableSubmitButtonAndToastErrors(jSubmitButton, handleActions) {
    jSubmitButton.prop("disabled", true).addClass("is-loading");
    try {
      await handleActions();
    } catch (error) {
      StackExchange.helpers.showToast(getMessageFromCaughtElement(error), { type: "danger" });
    } finally {
      jSubmitButton.prop("disabled", false).removeClass("is-loading");
    }
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function updateValue(baseElem, newScore) {
    const voteValueSpan = baseElem.find(".s-post-summary--stats-item-number:eq(0)");
    voteValueSpan.text(newScore);
    voteValueSpan.parent().addClass("bg-yellow-400");
  }
  async function updateVoteCounts(tabName) {
    let summaryElements = void 0;
    switch (tabName) {
      case "answers":
        summaryElements = $('div[id^="answer-id-"]');
        break;
      case "questions":
        summaryElements = $('div[id^="question-summary-"]');
        break;
    }
    if (summaryElements === void 0) {
      return;
    }
    for (const elem of summaryElements) {
      const postId = $(elem).data("post-id");
      while (true) {
        try {
          const result = await getVoteCounts(postId);
          updateValue(
            $(elem),
            Number(result.up) + Number(result.down)
            /* Addition because down comes as string like -2 */
          );
          await sleep(2e3);
          break;
        } catch (e) {
          continue;
        }
      }
    }
  }
  function main() {
    const tabName = new URLSearchParams(window.location.search).get("tab");
    const button = $('<button class="s-btn ml-auto s-btn__outlined s-btn__danger">Update All Votes</button>');
    button.on("click", () => {
      void disableSubmitButtonAndToastErrors(
        button,
        () => {
          return updateVoteCounts(tabName);
        }
      );
    });
    $("#js-post-summaries").next().addClass("d-flex ai-center").append(button);
  }
  if (StackExchange.options.user.isModerator === true) {
    main();
  }
})();

// ==UserScript==
// @name         Inline delete/undelete post buttons
// @description  Adds delete/undelete buttons on the questions and answers tabs in user profile
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.1.2
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/Delete-UndeletedFromUserPage/dist/Delete-UndeleteFromUserPage.user.js
// @updateURL    https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/Delete-UndeletedFromUserPage/dist/Delete-UndeleteFromUserPage.user.js
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
  function ajaxPostWithData(endPoint, data, shouldReturnData = true) {
    return new Promise((resolve, reject) => {
      void $.ajax({
        type: "POST",
        url: endPoint,
        data
      }).done((resData, textStatus, xhr) => {
        resolve(
          shouldReturnData ? resData : {
            status: xhr.status,
            statusText: textStatus
          }
        );
      }).fail((res) => {
        reject(res.responseText ?? "An unknown error occurred");
      });
    });
  }
  function castPostsVote(postId, voteType) {
    return ajaxPostWithData(
      `/posts/${postId}/vote/${voteType}`,
      {
        fkey: StackExchange.options.user.fkey
      }
    );
  }
  const config = {
    deleteVoteCode: 10,
    undeleteVoteCode: 11
  };
  function makeButton(btnVoteType, postId, jSummary, jSummaryParent) {
    const btn = $('<button class="s-btn ml-auto s-btn__outlined"></button>');
    if (btnVoteType === config.undeleteVoteCode) {
      btn.text("Undelete");
      btn.on("click", undeleteBtnClickHandler(postId, jSummary, jSummaryParent, btn));
    } else {
      btn.text("Delete");
      btn.addClass("s-btn__danger");
      btn.on("click", deleteBtnClickHandler(postId, jSummary, jSummaryParent, btn));
    }
    return btn;
  }
  function toggleVoteType(voteType) {
    if (voteType === config.undeleteVoteCode) {
      return config.deleteVoteCode;
    } else {
      return config.undeleteVoteCode;
    }
  }
  function makeBtnClickHandler(postId, voteType, jSummary, jSummaryParent, btn, updatePostStyle) {
    return (ev) => {
      ev.preventDefault();
      void castPostsVote(postId, voteType).then(
        (res) => {
          if (res.Success) {
            updatePostStyle();
            btn.replaceWith(
              makeButton(
                toggleVoteType(voteType),
                postId,
                jSummary,
                jSummaryParent
              )
            );
          }
        }
      );
    };
  }
  function undeleteBtnClickHandler(postId, jSummary, jSummaryParent, btn) {
    return makeBtnClickHandler(
      postId,
      config.undeleteVoteCode,
      jSummary,
      jSummaryParent,
      btn,
      () => {
        jSummaryParent.removeClass("s-post-summary__deleted");
        jSummaryParent.find(".s-post-summary--stats-item.is-deleted").remove();
      }
    );
  }
  function deleteBtnClickHandler(postId, jSummary, jSummaryParent, btn) {
    return makeBtnClickHandler(
      postId,
      config.deleteVoteCode,
      jSummary,
      jSummaryParent,
      btn,
      () => {
        jSummaryParent.addClass("s-post-summary__deleted");
        jSummary.prepend($(`<div class="s-post-summary--stats-item is-deleted">
                            <svg aria-hidden="true" class="svg-icon iconTrashSm" width="14" height="14" viewBox="0 0 14 14">
                                <path d="M11 2a1 1 0 0 1 1 1v1H2V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h2Zm0 3H3v6c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V5Z"/>
                            </svg>Deleted</div>`));
      }
    );
  }
  function main() {
    for (const summary of $(".s-post-summary--stats.js-post-summary-stats")) {
      const jSummary = $(summary);
      const jSummaryParent = jSummary.parent();
      const isPostDeleted = jSummaryParent.hasClass("s-post-summary__deleted");
      jSummary.append(
        makeButton(
          isPostDeleted ? config.undeleteVoteCode : config.deleteVoteCode,
          jSummaryParent.attr("data-post-id"),
          jSummary,
          jSummaryParent
        )
      );
    }
  }
  if (StackExchange.options.user.isModerator === true) {
    StackExchange.ready(() => {
      main();
      $(document).on("ajaxComplete", (_0, _1, { url }) => {
        if (url.match(/users\/tab\/\d+\?tab=(answers|questions)/gi)) {
          main();
        }
      });
    });
  }
})();

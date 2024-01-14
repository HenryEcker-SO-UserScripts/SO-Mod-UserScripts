// ==UserScript==
// @name         Markdown From Suspicious Votes Table
// @description  Creates an easy way to build a markdown table from a suspicious votes query
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.1
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/MarkdownFromSuspicousVotesTable/dist/MarkdownFromSuspicousVotesTable.user.js
// @updateURL    https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/MarkdownFromSuspicousVotesTable/dist/MarkdownFromSuspicousVotesTable.user.js
//
// @match        *://*.askubuntu.com/admin/show-suspicious-votes*
// @match        *://*.mathoverflow.net/admin/show-suspicious-votes*
// @match        *://*.serverfault.com/admin/show-suspicious-votes*
// @match        *://*.stackapps.com/admin/show-suspicious-votes*
// @match        *://*.stackexchange.com/admin/show-suspicious-votes*
// @match        *://*.stackoverflow.com/admin/show-suspicious-votes*
// @match        *://*.superuser.com/admin/show-suspicious-votes*
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */
(function() {
  "use strict";
  function processUserCardTd($td) {
    const userDisplayName = getTextFromJQueryElem($td.find(".user-details .s-btn"));
    const userLink = $td.find('a.s-block-link[href^="/users"]').attr("href");
    return `[${userDisplayName}](${userLink})`;
  }
  function getTextFromJQueryElem($e) {
    return $e.text().trim();
  }
  function* getTableRowElements($table) {
    for (const n of $table.find("tbody tr")) {
      const $e = $(n);
      yield {
        voter: processUserCardTd($e.find("td:eq(0)")),
        targetUser: processUserCardTd($e.find("td:eq(1)")),
        votesGiven: getTextFromJQueryElem($e.find("td:eq(2)")),
        fraudSignal: getTextFromJQueryElem($e.find("td:eq(5)"))
      };
    }
  }
  function buildTableMarkdown() {
    const $votesTable = $("table");
    const markdown = ["| Voter | Target User | Votes Given | Fraud Signal |"];
    markdown.push("|:---|:---|:---|:---|");
    for (const { voter, targetUser, votesGiven, fraudSignal } of getTableRowElements($votesTable)) {
      markdown.push(`| ${voter} | ${targetUser} | ${votesGiven} | ${fraudSignal} |`);
    }
    return {
      rows: markdown.length + 4,
      markdown: `

${markdown.join("\n")}

`
    };
  }
  function main() {
    const modalId = "mfsvt-markdown-table";
    const $modalController = $('<div class="float-right" data-controller="s-modal"></div>');
    const $btn = $('<button class="s-btn s-btn__filled" data-action="s-modal#show">Create Markdown For Escalation</button>');
    $btn.on("click", () => {
      const { rows, markdown } = buildTableMarkdown();
      const $textarea = $(`#${modalId}-textarea`);
      $textarea.addClass("w100");
      $textarea.css("max-height", "65vh");
      $textarea.attr("rows", rows);
      $textarea.val(markdown);
    });
    const $modal = $(`<aside class="s-modal" data-s-modal-target="modal" id="${modalId}" tabindex="-1" role="dialog" aria-labelledby="${modalId}-title" aria-describedby="${modalId}-description" aria-hidden="true">
        <div class="s-modal--dialog w70" role="document">
            <h1 class="s-modal--header" id="${modalId}-title">Table Markdown</h1>
            <p class="s-modal--body" id="${modalId}-description"><textarea id="${modalId}-textarea"></textarea></p>
            <div class="d-flex gx8 s-modal--footer">
                <button class="flex--item s-btn" type="button" data-action="s-modal#hide">Close</button>
            </div>
            <button class="s-modal--close s-btn s-btn__muted" type="button" data-action="s-modal#hide">
                X
            </button>
        </div>
    </aside>`);
    $modalController.append($btn).append($modal);
    $("#content").prepend($modalController);
  }
  StackExchange.ready(main);
})();

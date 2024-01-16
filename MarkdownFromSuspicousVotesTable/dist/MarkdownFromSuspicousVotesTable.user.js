// ==UserScript==
// @name         Markdown From Suspicious Votes Table
// @description  Creates an easy way to build a markdown table from a suspicious votes query
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.3
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
  function createLinkMd(text, href) {
    return `[${text.replace("[", "\\[").replace("]", "\\]")}](${href})`;
  }
  function processUserCardTd($td) {
    const userDisplayName = getTextFromJQueryElem($td.find(".user-details .s-btn"));
    const userLink = $td.find('a.s-block-link[href^="/users"]').attr("href");
    return createLinkMd(userDisplayName, userLink);
  }
  function getTextFromJQueryElem($e) {
    return $e.text().trim();
  }
  function getTableRowElements($table) {
    return $table.find("tbody tr").map((_0, n) => {
      const $e = $(n);
      return {
        "Voter": processUserCardTd($e.find("td:eq(0)")),
        "Target User": processUserCardTd($e.find("td:eq(1)")),
        "Votes Given": getTextFromJQueryElem($e.find("td:eq(2)")),
        "Fraud Signal": getTextFromJQueryElem($e.find("td:eq(5)"))
      };
    }).toArray();
  }
  function buildTableMarkdown() {
    const $votesTable = $("table");
    function makeMdRow(trData, withWhitespace = true) {
      if (withWhitespace) {
        return `| ${trData.join(" | ")} |`;
      } else {
        return `|${trData.join("|")}|`;
      }
    }
    const headers = ["Voter", "Target User", "Votes Given", "Fraud Signal"];
    const markdown = [
      makeMdRow(headers),
      makeMdRow(headers.map(({ length }) => Array.from({ length }).map((_, i) => i === 0 ? ":" : "-").join(""))),
      ...getTableRowElements($votesTable).map((tbodyRow) => makeMdRow(headers.map((v) => tbodyRow[v])))
    ];
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
      $textarea.attr("rows", rows);
      $textarea.val(markdown);
    });
    const $modal = $(`<aside class="s-modal" data-s-modal-target="modal" id="${modalId}" tabindex="-1" role="dialog" aria-labelledby="${modalId}-title" aria-describedby="${modalId}-description" aria-hidden="true">
        <div class="s-modal--dialog w60" style="max-width: unset;" role="document">
            <h1 class="s-modal--header" id="${modalId}-title">Table Markdown</h1>
            <p class="s-modal--body" id="${modalId}-description">
                <textarea id="${modalId}-textarea" class="w100" style="max-height: 65vh;font-family: monospace;white-space: pre;"></textarea>
            </p>
            <div class="d-flex gx8 s-modal--footer">
                <button class="flex--item s-btn" type="button" data-action="s-modal#hide">Close</button>
            </div>
            <button class="s-modal--close s-btn s-btn__muted" type="button" aria-label="Close" data-action="s-modal#hide">
                <svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14"><path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path></svg>
            </button>
        </div>
    </aside>`);
    $modalController.append($btn).append($modal);
    $("#content").prepend($modalController);
  }
  StackExchange.ready(main);
})();

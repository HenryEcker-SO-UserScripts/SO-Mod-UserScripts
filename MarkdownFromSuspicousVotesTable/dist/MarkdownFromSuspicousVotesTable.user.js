// ==UserScript==
// @name         Markdown From Suspicious Votes Table
// @description  Creates an easy way to build a markdown table from a suspicious votes query
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.5
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
  function getTableCellFromSection($table, tableSectionHtmlTag, cellHtmlTag, config, fnAttr) {
    return $table.find(`${tableSectionHtmlTag} tr`).toArray().map((n) => {
      const $e = $(n);
      return config.map(({ idx, [fnAttr]: fn }) => {
        return fn($e.find(`${cellHtmlTag}:eq(${idx})`));
      });
    });
  }
  function getTableHeaderRowElements($table, config) {
    return getTableCellFromSection($table, "thead", "th", config, "headFn")[0];
  }
  function getTableBodyRowElements($table, config) {
    return getTableCellFromSection($table, "tbody", "td", config, "bodyFn");
  }
  function makeMdRow(trData, withWhitespace = true) {
    if (withWhitespace) {
      return `| ${trData.join(" | ")} |`;
    } else {
      return `|${trData.join("|")}|`;
    }
  }
  function buildTableMarkdown() {
    const tableConfiguration = [
      { idx: 0, headFn: getTextFromJQueryElem, bodyFn: processUserCardTd },
      { idx: 1, headFn: getTextFromJQueryElem, bodyFn: processUserCardTd },
      { idx: 2, headFn: getTextFromJQueryElem, bodyFn: getTextFromJQueryElem },
      { idx: 5, headFn: getTextFromJQueryElem, bodyFn: getTextFromJQueryElem }
    ];
    const $votesTable = $("table");
    const headers = getTableHeaderRowElements($votesTable, tableConfiguration);
    const markdown = [
      makeMdRow(headers),
      makeMdRow(headers.map(({ length }) => Array.from({ length }).map((_, i) => i === 0 ? ":" : "-").join(""))),
      ...getTableBodyRowElements($votesTable, tableConfiguration).map((tbodyRow) => makeMdRow(tbodyRow))
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

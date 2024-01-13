// ==UserScript==
// @name         Discussions Beta Flag Stats
// @description  Adds statistics about flag counts and users in discussions
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.5
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/DiscussionsBetaFlagStats/dist/DiscussionsBetaFlagStats.user.js
// @updateURL    https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/DiscussionsBetaFlagStats/dist/DiscussionsBetaFlagStats.user.js
//
// @match        *://stackoverflow.com/beta/discussions/flags*
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */
(function() {
  "use strict";
  function pluralise(count, base) {
    return count === 1 ? base : `${base}s`;
  }
  function* jQueryGen($jqueryElem) {
    for (const node of $jqueryElem) {
      yield $(node);
    }
  }
  function computeStats($postContainers) {
    const summaryStats = {};
    const flaggedUserSummaryStats = {};
    const flaggerSummaryStats = {};
    function getPostFlagDetails($postFlagGroup) {
      const flagCount = Number(
        $postFlagGroup.find(".iconFlagSm").parent().text().trim()
      );
      const $flagDetailElem = $postFlagGroup.find(".flex--item");
      let [flagType] = $flagDetailElem.text().split(" – ");
      flagType = flagType.trim();
      if (flagType.startsWith("Something else:")) {
        flagType = "Something else";
      }
      return {
        flagCount,
        flagType,
        $flaggers: $flagDetailElem.find('a[href^="/users/"]')
      };
    }
    function getUserInfo($userAnchor) {
      return {
        displayName: $userAnchor.text().trim(),
        userId: Number($userAnchor.attr("href").match(/^\/users\/(\d+)\//i)[1])
      };
    }
    function accumulateUserSummaryStats(uss, userInfo, flagType, flagCount) {
      if (uss?.[userInfo.userId] === void 0) {
        uss[userInfo.userId] = {
          displayName: userInfo.displayName
        };
      }
      if (uss[userInfo.userId]?.[flagType] === void 0) {
        uss[userInfo.userId][flagType] = {
          unduplicatedCount: 0,
          count: 0
        };
      }
      uss[userInfo.userId][flagType].unduplicatedCount += 1;
      uss[userInfo.userId][flagType].count += flagCount;
    }
    for (const $postContainer of jQueryGen($postContainers)) {
      for (const $postFlagGroup of jQueryGen($postContainer.find(".js-post-flag-group"))) {
        const { flagType, flagCount, $flaggers } = getPostFlagDetails($postFlagGroup);
        if (summaryStats?.[flagType] === void 0) {
          summaryStats[flagType] = {
            unduplicatedCount: 0,
            count: 0
          };
        }
        summaryStats[flagType].unduplicatedCount += 1;
        summaryStats[flagType].count += flagCount;
        accumulateUserSummaryStats(flaggedUserSummaryStats, getUserInfo($postContainer.find(".s-user-card--link")), flagType, flagCount);
        for (const $flagger of jQueryGen($flaggers)) {
          accumulateUserSummaryStats(flaggerSummaryStats, getUserInfo($flagger), flagType, 1);
        }
      }
    }
    return {
      summaryStats,
      flaggedUserSummaryStats,
      flaggerSummaryStats
    };
  }
  function main() {
    const $postContainers = $(".js-post-container");
    const uniquePostCount = $postContainers.length;
    if (uniquePostCount === 0) {
      return;
    }
    $("#mainbar header .s-page-title--header").append(` (on ${uniquePostCount} Posts)`);
    const { summaryStats, flaggedUserSummaryStats, flaggerSummaryStats } = computeStats($postContainers);
    const $userScriptMasterContainer = $('<div id="dbfs-summary" class="mb24"></div>');
    $("#mainbar header").after($userScriptMasterContainer);
    function formatCountRecord(cr) {
      if (cr === void 0) {
        return "0";
      } else {
        return `${cr.count} ${pluralise(cr.count, "flag")} (on ${cr.unduplicatedCount} ${pluralise(cr.unduplicatedCount, "post")})`;
      }
    }
    function buildTable(tableTitle, theadData, tbodyData, tableContainerStyles) {
      const $summaryContainer = $('<div class="s-table-container"></div>');
      if (tableContainerStyles !== void 0) {
        for (const style of tableContainerStyles) {
          $summaryContainer.addClass(style);
        }
      }
      const $table = $('<table class="s-table"></table>');
      {
        const $thead = $("<thead></thead>");
        for (const trData of theadData) {
          const $tr = $("<tr></tr>");
          for (const thData of trData) {
            $tr.append($(`<th>${thData}</th>`));
          }
          $thead.append($tr);
        }
        $table.append($thead);
      }
      {
        const $tbody = $('<tbody class="ws-nowrap"></tbody>');
        for (const trData of tbodyData) {
          const $tr = $("<tr></tr>");
          for (const tdData of trData) {
            $tr.append($(`<td>${tdData}</td>`));
          }
          $tbody.append($tr);
        }
        $table.append($tbody);
      }
      $summaryContainer.append($table);
      return $(`<div class="my12"><h2>${tableTitle}</h2></div>`).append($summaryContainer);
    }
    function buildSummaryTable(ss) {
      return buildTable(
        "Flag Summary Statistics",
        [["Flag Type", "Count"]],
        Object.entries(ss).sort(([_0, crA], [_1, crB]) => crB.count - crA.count).map(([flagType, flagCountRecord]) => {
          return [flagType, formatCountRecord(flagCountRecord)];
        })
      );
    }
    $userScriptMasterContainer.append(buildSummaryTable(summaryStats));
    function buildUserTable(title, flagTypes, uss, linkSuffix = "", useDetailCount = true) {
      const tbodyData = Object.entries(uss).map((e) => {
        e[1].total = 0;
        for (const ft of flagTypes) {
          e[1].total += e[1]?.[ft]?.count || 0;
        }
        return e;
      }).sort(
        ([_0, a], [_1, b]) => b.total - a.total
      ).map(([userId, userStats]) => {
        return [
          `<a href="/users/${userId}/${linkSuffix}" target="_blank">${userStats.displayName}</a>`,
          ...flagTypes.map((ft) => {
            if (useDetailCount) {
              return formatCountRecord(userStats?.[ft]);
            } else {
              return `${userStats?.[ft]?.count || 0}`;
            }
          }),
          userStats.total.toString()
        ];
      });
      return buildTable(
        `${tbodyData.length} ${pluralise(tbodyData.length, title)}`,
        [["User", ...flagTypes, "Total"]],
        tbodyData,
        ["hmx4"]
      );
    }
    const filteredFlagTypes = Object.entries(summaryStats).sort(([_0, a], [_1, b]) => b.count - a.count).map(([e, _0]) => e);
    $userScriptMasterContainer.append(buildUserTable("Flagged User", filteredFlagTypes, flaggedUserSummaryStats, "?tab=activity&sort=discussions")).append(buildUserTable("Flagger", filteredFlagTypes, flaggerSummaryStats, void 0, false));
  }
  StackExchange.ready(main);
})();

// ==UserScript==
// @name         Admin Dashboard Discussion Flag Link
// @description  Adds a link to admin dashboard sidebar to the discussion flag page
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.1
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/AdminDashboardDiscussionFlagsLink/AdminDashboardDiscussionFlagsLink.user.js
//
// @match        https://stackoverflow.com/admin/dashboard*
//
// @grant none
//
// ==/UserScript==
/* globals StackExchange, $ */


(function () {

    StackExchange.ready(() => {
        const discussionFlagAggregatePage = '/beta/discussions/flags';
        const discussionFlagLinkLabel = 'Discussion Flags'
        $.ajax('/beta/discussions/flags', {
            dataType: 'html',
            success: (data) => {
                // Get Flag count from page HTML
                const flagCount = $('header.s-page-title p:contains("Discussion")', data).text().trim().match(/(\d+)\s+flags?/i)[1]

                // Add link after suspicious votes sidebar
                $('#flag-table-of-contents ~ .s-sidebarwidget:eq(0)').after(
                    `<div class="s-sidebarwidget mb16">
                        <div class="s-sidebarwidget--header d-flex ai-center">
                            <div class="flex--item mr8 bounty-indicator-tab supernovabg" title="${flagCount}">${flagCount}</div>
                            <div class="flex--item fl1">
                                <a href="${discussionFlagAggregatePage}">${discussionFlagLinkLabel} <svg aria-hidden="true" class="va-middle svg-icon iconShareSm" width="14" height="14" viewBox="0 0 14 14"><path d="M5 1H3a2 2 0 0 0-2 2v8c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V9h-2v2H3V3h2V1Zm2 0h6v6h-2V4.5L6.5 9 5 7.5 9.5 3H7V1Z"></path></svg></a>
                            </div>
                        </div>
                    </div>`);
            }
        })
    });
})();
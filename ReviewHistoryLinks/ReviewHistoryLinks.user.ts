// ==UserScript==
// @name         Review History Links
// @description  Adds direct links to individual user review history from the review result notice
// @homepage     https://github.com/HenryEcker/SO-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.1
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/ReviewHistoryLinks/ReviewHistoryLinks.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/ReviewHistoryLinks/ReviewHistoryLinks.user.js
//
// @match        *://*.askubuntu.com/review/*
// @match        *://*.serverfault.com/review/*
// @match        *://*.stackapps.com/review/*
// @match        *://*.stackexchange.com/review/*
// @match        *://*.stackoverflow.com/review/*
// @match        *://*.superuser.com/review/*
// @match        *://*.mathoverflow.net/review/*
//
// @exclude      /^https?:\/\/.*((askubuntu|serverfault|stackapps|stackexchange|stackoverflow|superuser)\.com|mathoverflow\.net)\/review\/.*\/(stats|history)/
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */


(function () {
    'use strict';

    function getUserLinksFromNotice(): JQuery<HTMLAnchorElement> {
        return $('.s-notice.s-notice__info').find('a[href^="/users"]') as JQuery<HTMLAnchorElement>;
    }

    function fetchUserIdFromHref(href: string): undefined | string {
        const match = href.match(/\/users\/(\d+)\/.*/i);
        if (match === null || match.length < 2) {
            return undefined;
        }
        return match[1];
    }

    function getReviewQueueBaseURL(): string {
        return window.location.pathname.split('/').slice(0, 3).join('/');
    }

    function getUserReviewQueueHistoryURL(userId: string): string {
        return `${getReviewQueueBaseURL()}/history?${new URLSearchParams({userId: userId}).toString()}`;
    }

    function addHistoryLinks(): void {
        getUserLinksFromNotice().after(function () {
            const n = $(this);
            const userId = fetchUserIdFromHref(n.attr('href'));
            if (userId === undefined) {
                return document.createDocumentFragment();
            }
            return `<span> (<a href="${getUserReviewQueueHistoryURL(userId)}" target="_blank">Review History</a>)</span>`;
        });
    }

    function main(): void {
        // Attach after review loads
        $(document).on('ajaxComplete', (event, {responseJSON}, {url}) => {
            if ((
                    url.startsWith('/review/next-task') || url.startsWith('/review/task-reviewed/')
                ) &&
                responseJSON?.reviewTaskId !== undefined
            ) {
                addHistoryLinks();
            }
        });
    }

    StackExchange.ready(() => {
        // Run Function
        if (!StackExchange.options.user.isModerator) {
            return; // cannot run if not a moderator
        }
        main();
    });
}());
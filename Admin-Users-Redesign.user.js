// ==UserScript==
// @name         Redesign Admin Users Page
// @description  Makes /admin/users a bit less busy
// @homepage     https://github.com/HenryEcker/SO-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.1
// @downloadURL  https://github.com/HenryEcker/SO-UserScripts/raw/main/Admin-Users-Redesign.user.js
// @updateURL    https://github.com/HenryEcker/SO-UserScripts/raw/main/Admin-Users-Redesign.user.js
//
// @match        *://*.stackoverflow.com/admin/users
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */


(function () {
    'use strict';

    const config = {
        'selfActionClass': 'bg-black-075',
        'bodyId': 'auru-main-content',
        'route': '/admin/users',
        'defaultTab': 'messages',
        'tabInfo': {
            'messages': {
                tabNavName: 'Messages',
                tabTitle: 'Latest User Messages',
                dataLoadFromUrl: '/admin/users/messages',
                highlightSelf: true
            },
            'annotated': {
                tabNavName: 'Annotations',
                tabTitle: 'Latest User Annotations',
                dataLoadFromUrl: '/admin/users/annotated',
                highlightSelf: true
            },
            'escalations': {
                tabNavName: 'Escalations',
                tabTitle: 'Latest CM-Team Escalations',
                dataLoadFromUrl: '/admin/users/cm-contacted',
                highlightSelf: true
            },
            'suspended': {
                tabNavName: 'Timed Suspension',
                tabTitle: 'Latest User Messages)',
                dataLoadFromUrl: '/admin/users/suspended',
                highlightSelf: false
            },
            'flagged-posts-recent': {
                tabNavName: 'Flagged Posts (recent)',
                tabTitle: 'Users with Flagged Posts (last 30 days)',
                dataLoadFromUrl: '/admin/users/flagged-posts',
                urlSearchParams: 'recent=1',
                highlightSelf: false
            },
            'flagged-posts': {
                tabNavName: 'Flagged Posts (all time)',
                tabTitle: 'Users with Flagged Posts (all time)',
                dataLoadFromUrl: '/admin/users/flagged-posts',
                highlightSelf: false
            }
        }
    };


    function attachOnDataLoadTasks(currentTab, displayName) {
        $(document).on('ajaxComplete', (_0, _1, {url}) => {
            if (url.startsWith(config.route)) {
                addListenerToPaginationItems();
                if (config.tabInfo[currentTab].highlightSelf) {
                    highlightOwnItems(displayName);
                }
            }
        });
    }

    function addListenerToPaginationItems() {
        $('.js-ajax .s-pagination--item').on('click', (ev) => {
            const href = ev.target.getAttribute('href');
            updateURLSearchParamPage(
                new URLSearchParams(href.split('?').at(-1)).get('page')
            );
        });
    }


    function updateURLSearchParamPage(newPage) {
        const usp = new URLSearchParams(window.location.search);
        if (newPage === null || newPage === undefined) {
            return;
        } else if (newPage === '1') {
            usp.delete('page');
        } else {
            usp.set('page', newPage);
        }

        // Using replace state because backwards navigation is a huge pain (would require manually fetching the page), 
        // but this at least allows page refreshes, share links, and some navigation between tabs
        // TODO Add back button support
        history.replaceState(null, '', `${config.route}?${usp.toString()}`);
    }

    function highlightOwnItems(displayName) {
        $(`.annotime:contains("${displayName}")`)
            .closest('tr')
            .addClass(config.selfActionClass);
    }

    // Build HTML for the page
    function rebuildPage(currentTab, currentPage) {
        return $('<div class="d-flex mb48"></div>')
            .append(buildNav(currentTab))
            .append(buildMainBody(currentTab, currentPage));
    }


    // Build Nav (Sidebar)
    function buildNav(currentTab) {
        return $('<nav class="flex--item fl-shrink0 mr32 wmn1 md:d-none" role="navigation"></nav>')
            .append($('<ul class="ps-sticky t64 s-navigation s-navigation__muted s-navigation__vertical"></ul>')
                .append(buildNavLiString(currentTab)));
    }

    function buildNavLiString(currentTab) {
        return Object.entries(config.tabInfo)
            .map(([queryLocation, {
                tabNavName, tabTitle
            }]) => {
                return buildNavLi(tabNavName, tabTitle, queryLocation, currentTab);
            }).join('');

    }

    function buildNavLi(tabText, tabTitle, queryLocation, currentTab) {
        return `<li><a class="s-navigation--item pr48 ps-relative${currentTab === queryLocation ? ' is-selected' : ''}" href="${config.route}?tab=${queryLocation}" title="${tabTitle}">${tabText}</a></li>`;
    }

    // Build main container for data
    function buildMainBody(currentTab, currentPage) {
        const currentConfig = config.tabInfo[currentTab];
        const usp = new URLSearchParams(currentConfig.urlSearchParams);
        usp.set('page', currentPage);
        return $(`<div id="${config.bodyId}"></div>`)
            .append(`<h2>${currentConfig.tabTitle}</h2>`)
            .append($(`<div class="js-auto-load" data-load-from="${currentConfig.dataLoadFromUrl}?${usp.toString()}" aria-live="polite"><div class="d-flex fd-row g8"><div class="s-spinner s-spinner__sm"><div class="v-visible-sr">Loading...</div></div>Loading...</div></div>`));
    }


    // Helper to get various information from page/URL
    function fetchInformationFromPage() {
        const usp = new URLSearchParams(window.location.search);
        return {
            currentTab: usp.get('tab') ?? config.defaultTab,
            currentPage: usp.get('page') ?? 1,
            displayName: $('.s-topbar--item.s-user-card .s-avatar').first().attr('title')
        };
    }

    StackExchange.ready(() => {
        const {currentTab, currentPage, displayName} = fetchInformationFromPage();
        $('.content-page').replaceWith(
            rebuildPage(currentTab, currentPage)
        );
        attachOnDataLoadTasks(currentTab, displayName);
    });

}());
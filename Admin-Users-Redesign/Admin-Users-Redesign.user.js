// ==UserScript==
// @name         Redesign Admin Users Page
// @description  Makes /admin/users a bit less busy
// @homepage     https://github.com/HenryEcker/SO-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.4
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/Admin-Users-Redesign/Admin-Users-Redesign.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/Admin-Users-Redesign/Admin-Users-Redesign.user.js
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
        'defaultTab': {
            'main': 'messages',
            'meta': 'flagged-posts'
        },
        'loadingComponent': '<div class="d-flex fd-row g8"><div class="s-spinner s-spinner__sm"><div class="v-visible-sr">Loading...</div></div>Loading...</div>',
        'tabInfo': {
            'messages': {
                tabNavName: 'Messages',
                tabTitle: 'Latest User Messages',
                dataLoadFromUrl: '/admin/users/messages',
                highlightSelf: true,
                mainOnly: true
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
                highlightSelf: false,
                mainOnly: true
            },
            'flagged-posts-recent': {
                tabNavName: 'Flagged Posts (last 30 days)',
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
    function buildURL(relativePath, baseURLSearchParamString, searchParams) {
        const url = new URL(relativePath, window.location.origin);
        if (baseURLSearchParamString !== undefined || searchParams !== undefined) {
            const usp = new URLSearchParams(baseURLSearchParamString);
            Object.entries(searchParams ?? {}).forEach(([key, value]) => {
                if (value === undefined) {
                    usp.delete(key);
                }
                else {
                    usp.set(key, value);
                }
            });
            url.search = usp.toString();
        }
        return url;
    }
    // Build HTML for the page
    function rebuildPage(currentTab, currentPage, displayName) {
        return $('<div class="d-flex mb48"></div>')
            .append(buildNav(currentTab))
            .append(buildMainBody(currentTab, currentPage, displayName));
    }
    // Build Nav (Sidebar)
    function buildNav(currentTab) {
        return $('<nav class="flex--item fl-shrink0 mr32 wmn1 md:d-none" role="navigation"></nav>')
            .append(buildNavUl(currentTab));
    }
    function buildNavUl(currentTab) {
        const ul = $('<ul class="ps-sticky t64 s-navigation s-navigation__muted s-navigation__vertical"></ul>');
        for (const [queryLocation, { tabNavName, tabTitle, mainOnly }] of Object.entries(config.tabInfo)) {
            ul.append(buildNavLi(tabNavName, tabTitle, queryLocation, currentTab, mainOnly));
        }
        return ul;
    }
    function buildNavLi(tabText, tabTitle, queryLocation, currentTab, mainOnly) {
        if (mainOnly === true && StackExchange.options.site.isChildMeta) {
            return null;
        }
        return $(`<li><a class="s-navigation--item pr48 ps-relative${currentTab === queryLocation ? ' is-selected' : ''}" href="${buildURL(config.route, '', { tab: queryLocation }).toString()}" title="${tabTitle}">${tabText}</a></li>`);
    }
    // Build main container for data
    function buildMainBody(currentTab, currentPage, displayName) {
        const { tabTitle, dataLoadFromUrl, urlSearchParams } = config.tabInfo[currentTab];
        const jsAutoLoadDiv = $(`<div class="js-auto-load" data-load-from="${buildURL(dataLoadFromUrl, urlSearchParams, { page: currentPage }).toString()}" aria-live="polite">${config.loadingComponent}</div>`);
        attachLoadListenerToDiv(jsAutoLoadDiv[0], currentTab, displayName);
        return $(`<div id="${config.bodyId}"></div>`)
            .append(`<h2>${tabTitle}</h2>`)
            .append(jsAutoLoadDiv);
    }
    // Attach mutation observer to monitor for when the DOM elements have been added
    function attachLoadListenerToDiv(node, currentTab, displayName) {
        const dataObserver = new MutationObserver((mutationList, observer) => {
            for (const mutation of mutationList) {
                if (mutation.type === 'childList' &&
                    mutation.addedNodes.length === 5 && // This is a set number of elements
                    mutation.target.classList.contains('js-auto-load-target')) {
                    addListenerToPaginationItems();
                    if (config.tabInfo[currentTab].highlightSelf) {
                        highlightOwnItems(displayName);
                    }
                    break; // We've found what we need don't look through any more mutations
                }
            }
            observer.disconnect(); // Don't care about any future DOM updates
        });
        const observerConfig = { childList: true };
        dataObserver.observe(node, observerConfig);
        // Re-attach observer on next ajax call
        $(document).on('ajaxSend', (_0, _1, { url }) => {
            if (url.startsWith(config.route)) {
                dataObserver.observe(node, observerConfig);
            }
        });
    }
    function addListenerToPaginationItems() {
        $('.js-ajax .s-pagination--item').on('click', (ev) => {
            updateURLSearchParamPage(new URLSearchParams(buildURL(ev.target.href).search).get('page'));
        });
    }
    function updateURLSearchParamPage(newPage) {
        if (newPage === null || newPage === undefined) {
            return;
        }
        const newLocation = buildURL(config.route, window.location.search, { 'page': newPage === '1' ? undefined : newPage }).toString();
        history.pushState(null, '', newLocation);
    }
    // Highlight items that contain your display name as the author
    function highlightOwnItems(displayName) {
        $(`.annotime:contains("${displayName}")`)
            .closest('tr')
            .addClass(config.selfActionClass);
    }
    // Allow back and forward navigation to update page values
    function attachOnPopStateTasks() {
        window.addEventListener('popstate', (ev) => {
            ev.preventDefault();
            const { currentTab, currentPage } = fetchInformationFromPage();
            const { dataLoadFromUrl, urlSearchParams } = config.tabInfo[currentTab];
            $(`#${config.bodyId} .js-auto-load-target`)
                .html(config.loadingComponent) // Replace with loading component because it's more confusing to not show any indication something's happening
                .load(buildURL(dataLoadFromUrl, urlSearchParams, { 'page': currentPage }).toString());
        });
    }
    // Helper to get various information from page/URL
    function fetchInformationFromPage() {
        const usp = new URLSearchParams(window.location.search);
        return {
            currentTab: usp.get('tab') ?? config.defaultTab[StackExchange.options.site.isChildMeta ? 'meta' : 'main'],
            currentPage: usp.get('page') ?? '1',
            displayName: $('.s-topbar--item.s-user-card .s-avatar').first().attr('title')
        };
    }
    StackExchange.ready(() => {
        const { currentTab, currentPage, displayName } = fetchInformationFromPage();
        $('.content-page').replaceWith(rebuildPage(currentTab, currentPage, displayName));
        attachOnPopStateTasks();
    });
}());

// ==UserScript==
// @name         Redesign Admin Users Page
// @description  Makes /admin/users a bit less busy
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.7
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
                tabTitle: 'Latest User Messages',
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
    class AdminUsersPage {
        mountPoint;
        currentTab;
        currentPage;
        displayName;
        constructor(mountPoint) {
            this.mountPoint = mountPoint;
            this.updatePageInformation();
            this.displayName = $('.s-topbar--item.s-user-card .s-avatar').first().attr('title');
            this.attachOnPopStateTasks();
        }
        updatePageInformation() {
            const usp = new URLSearchParams(window.location.search);
            this.currentTab = usp.get('tab') ?? config.defaultTab[StackExchange.options.site.isChildMeta ? 'meta' : 'main'];
            this.currentPage = usp.get('page') ?? '1';
        }
        updateURLSearchParamPage() {
            const newLocation = buildURL(config.route, window.location.search, {
                tab: this.currentTab,
                page: this.currentPage === '1' ? undefined : this.currentPage
            }).toString();
            history.pushState(null, '', newLocation);
        }
        // Allow back and forward navigation to update page values
        attachOnPopStateTasks() {
            window.addEventListener('popstate', (ev) => {
                ev.preventDefault();
                this.mountPoint.html(config.loadingComponent); // Replace with loading component because it's more confusing to not show any indication something's happening
                this.updatePageInformation();
                this.render(true);
            });
        }
        render(manualLoad = false) {
            this.mountPoint
                .empty()
                .append(this.rebuildPage(manualLoad));
        }
        rebuildPage(manualLoad) {
            return $('<div class="d-flex mb48"></div>')
                .append(this.buildNav())
                .append(this.buildMainBody(manualLoad));
        }
        // Build Nav (Sidebar)
        buildNav() {
            return $('<nav class="flex--item fl-shrink0 mr32 wmn1 md:d-none" role="navigation"></nav>')
                .append(this.buildNavUl());
        }
        buildNavUl() {
            const ul = $('<ul class="ps-sticky t64 s-navigation s-navigation__muted s-navigation__vertical"></ul>');
            for (const [queryLocation, { tabNavName, tabTitle, mainOnly }] of Object.entries(config.tabInfo)) {
                ul.append(this.buildNavLi(tabNavName, tabTitle, queryLocation, mainOnly));
            }
            return ul;
        }
        buildNavLi(tabText, tabTitle, queryLocation, mainOnly) {
            if (mainOnly === true && StackExchange.options.site.isChildMeta) {
                return null;
            }
            return $('<li></li>').append(this.buildNavAnchor(tabText, tabTitle, queryLocation));
        }
        buildNavAnchor(tabText, tabTitle, queryLocation) {
            const href = buildURL(config.route, '', { tab: queryLocation }).toString();
            const a = $(`<a class="s-navigation--item pr48 ps-relative${this.currentTab === queryLocation ? ' is-selected' : ''}" href="${href}" title="${tabTitle}">${tabText}</a>`);
            a.on('click', (ev) => {
                ev.preventDefault();
                this.currentPage = '1';
                this.currentTab = queryLocation;
                this.updateURLSearchParamPage();
                this.render(true);
            });
            return a;
        }
        // Build main container for data
        buildMainBody(manualLoad) {
            const { tabTitle, dataLoadFromUrl, urlSearchParams } = config.tabInfo[this.currentTab];
            const loadFrom = buildURL(dataLoadFromUrl, urlSearchParams, { page: this.currentPage }).toString();
            const dataBody = $(`<div class="js-auto-load" data-load-from="${loadFrom}" aria-live="polite">${config.loadingComponent}</div>`);
            this.attachLoadListenerToDiv(dataBody[0]);
            if (manualLoad) {
                dataBody
                    .load(loadFrom)
                    .removeClass('js-auto-load')
                    // Important! attachLoadListenerToDiv (and stock SE code) relies on the 'js-auto-load-target' class to attach listeners and perform pagination
                    .addClass('js-auto-load-target');
            }
            return $(`<div id="${config.bodyId}"></div>`)
                .append(`<h2>${tabTitle}</h2>`)
                .append(dataBody);
        }
        // Attach mutation observer to monitor for when the DOM elements have been added
        attachLoadListenerToDiv(node) {
            const dataObserver = new MutationObserver((mutationList, observer) => {
                for (const mutation of mutationList) {
                    if (mutation.type === 'childList' &&
                        mutation.addedNodes.length === 5 && // This is a set number of elements
                        mutation.target.classList.contains('js-auto-load-target')) {
                        this.addListenerToPaginationItems();
                        if (config.tabInfo[this.currentTab].highlightSelf) {
                            this.highlightOwnItems();
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
        addListenerToPaginationItems() {
            $('.js-ajax .s-pagination--item').on('click', (ev) => {
                this.currentPage = new URLSearchParams(buildURL(ev.target.href).search).get('page');
                this.updateURLSearchParamPage();
            });
        }
        // Highlight items that contain your display name as the author
        highlightOwnItems() {
            $(`.annotime:contains("${this.displayName}")`)
                .closest('tr')
                .addClass(config.selfActionClass);
        }
    }
    function main() {
        const mountPoint = $('.content-page');
        mountPoint.empty();
        const newPage = new AdminUsersPage(mountPoint);
        StackExchange.ready(() => {
            newPage.render();
        });
    }
    main();
}());

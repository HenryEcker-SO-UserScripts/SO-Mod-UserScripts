// ==UserScript==
// @name         Redesign Admin Users Page
// @description  Makes /admin/users a bit less busy
// @homepage     https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.7
// @downloadURL  https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/Admin-Users-Redesign/Admin-Users-Redesign.user.js
// @updateURL    https://github.com/HenryEcker-SO-UserScripts/SO-Mod-UserScripts/raw/master/Admin-Users-Redesign/Admin-Users-Redesign.user.js
//
// @match        *://*.stackoverflow.com/admin/users
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, $ */
(function () {
    'use strict';
    var config = {
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
        var url = new URL(relativePath, window.location.origin);
        if (baseURLSearchParamString !== undefined || searchParams !== undefined) {
            url.search = baseURLSearchParamString;
            Object.entries(searchParams !== null && searchParams !== void 0 ? searchParams : {}).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                if (value === undefined) {
                    url.searchParams.delete(key);
                }
                else {
                    url.searchParams.set(key, value);
                }
            });
        }
        return url;
    }
    var AdminUsersPage = /** @class */ (function () {
        function AdminUsersPage(mountPoint) {
            this.mountPoint = mountPoint;
            this.updatePageInformation();
            this.displayName = $('.s-topbar--item.s-user-card .s-avatar').first().attr('title');
            this.attachOnPopStateTasks();
        }
        AdminUsersPage.prototype.updatePageInformation = function () {
            var _a, _b;
            var usp = new URLSearchParams(window.location.search);
            this.currentTab = (_a = usp.get('tab')) !== null && _a !== void 0 ? _a : config.defaultTab[StackExchange.options.site.isChildMeta ? 'meta' : 'main'];
            this.currentPage = (_b = usp.get('page')) !== null && _b !== void 0 ? _b : '1';
        };
        AdminUsersPage.prototype.updateURLSearchParamPage = function () {
            var newLocation = buildURL(config.route, window.location.search, {
                tab: this.currentTab,
                page: this.currentPage === '1' ? undefined : this.currentPage
            }).toString();
            history.pushState(null, '', newLocation);
        };
        // Allow back and forward navigation to update page values
        AdminUsersPage.prototype.attachOnPopStateTasks = function () {
            var _this = this;
            window.addEventListener('popstate', function (ev) {
                ev.preventDefault();
                _this.mountPoint.html(config.loadingComponent); // Replace with loading component because it's more confusing to not show any indication something's happening
                _this.updatePageInformation();
                _this.render(true);
            });
        };
        AdminUsersPage.prototype.render = function (manualLoad) {
            if (manualLoad === void 0) { manualLoad = false; }
            this.mountPoint
                .empty()
                .append(this.rebuildPage(manualLoad));
        };
        AdminUsersPage.prototype.rebuildPage = function (manualLoad) {
            return $('<div class="d-flex mb48"></div>')
                .append(this.buildNav())
                .append(this.buildMainBody(manualLoad));
        };
        // Build Nav (Sidebar)
        AdminUsersPage.prototype.buildNav = function () {
            return $('<nav class="flex--item fl-shrink0 mr32 wmn1 md:d-none" role="navigation"></nav>')
                .append(this.buildNavUl());
        };
        AdminUsersPage.prototype.buildNavUl = function () {
            var ul = $('<ul class="ps-sticky t64 s-navigation s-navigation__muted s-navigation__vertical"></ul>');
            for (var _i = 0, _a = Object.entries(config.tabInfo); _i < _a.length; _i++) {
                var _b = _a[_i], queryLocation = _b[0], _c = _b[1], tabNavName = _c.tabNavName, tabTitle = _c.tabTitle, mainOnly = _c.mainOnly;
                ul.append(this.buildNavLi(tabNavName, tabTitle, queryLocation, mainOnly));
            }
            return ul;
        };
        AdminUsersPage.prototype.buildNavLi = function (tabText, tabTitle, queryLocation, mainOnly) {
            if (mainOnly === true && StackExchange.options.site.isChildMeta) {
                return null;
            }
            return $('<li></li>').append(this.buildNavAnchor(tabText, tabTitle, queryLocation));
        };
        AdminUsersPage.prototype.buildNavAnchor = function (tabText, tabTitle, queryLocation) {
            var _this = this;
            var href = buildURL(config.route, '', { tab: queryLocation }).toString();
            var a = $("<a class=\"s-navigation--item pr48 ps-relative".concat(this.currentTab === queryLocation ? ' is-selected' : '', "\" href=\"").concat(href, "\" title=\"").concat(tabTitle, "\">").concat(tabText, "</a>"));
            a.on('click', function (ev) {
                ev.preventDefault();
                _this.currentPage = '1';
                _this.currentTab = queryLocation;
                _this.updateURLSearchParamPage();
                _this.render(true);
            });
            return a;
        };
        // Build main container for data
        AdminUsersPage.prototype.buildMainBody = function (manualLoad) {
            var _a = config.tabInfo[this.currentTab], tabTitle = _a.tabTitle, dataLoadFromUrl = _a.dataLoadFromUrl, urlSearchParams = _a.urlSearchParams;
            var loadFrom = buildURL(dataLoadFromUrl, urlSearchParams, { page: this.currentPage }).toString();
            var dataBody = $("<div class=\"js-auto-load\" data-load-from=\"".concat(loadFrom, "\" aria-live=\"polite\">").concat(config.loadingComponent, "</div>"));
            this.attachLoadListenerToDiv(dataBody[0]);
            if (manualLoad) {
                dataBody
                    .load(loadFrom)
                    .removeClass('js-auto-load')
                    // Important! attachLoadListenerToDiv (and stock SE code) relies on the 'js-auto-load-target' class to attach listeners and perform pagination
                    .addClass('js-auto-load-target');
            }
            return $("<div id=\"".concat(config.bodyId, "\"></div>"))
                .append("<h2>".concat(tabTitle, "</h2>"))
                .append(dataBody);
        };
        // Attach mutation observer to monitor for when the DOM elements have been added
        AdminUsersPage.prototype.attachLoadListenerToDiv = function (node) {
            var _this = this;
            var dataObserver = new MutationObserver(function (mutationList, observer) {
                for (var _i = 0, mutationList_1 = mutationList; _i < mutationList_1.length; _i++) {
                    var mutation = mutationList_1[_i];
                    if (mutation.type === 'childList' &&
                        mutation.addedNodes.length === 5 && // This is a set number of elements
                        mutation.target.classList.contains('js-auto-load-target')) {
                        _this.addListenerToPaginationItems();
                        if (config.tabInfo[_this.currentTab].highlightSelf) {
                            _this.highlightOwnItems();
                        }
                        break; // We've found what we need don't look through any more mutations
                    }
                }
                observer.disconnect(); // Don't care about any future DOM updates
            });
            var observerConfig = { childList: true };
            dataObserver.observe(node, observerConfig);
            // Re-attach observer on next ajax call
            $(document).on('ajaxSend', function (_0, _1, _a) {
                var url = _a.url;
                if (url.startsWith(config.route)) {
                    dataObserver.observe(node, observerConfig);
                }
            });
        };
        AdminUsersPage.prototype.addListenerToPaginationItems = function () {
            var _this = this;
            $('.js-ajax .s-pagination--item').on('click', function (ev) {
                _this.currentPage = new URLSearchParams(buildURL(ev.target.href).search).get('page');
                _this.updateURLSearchParamPage();
            });
        };
        // Highlight items that contain your display name as the author
        AdminUsersPage.prototype.highlightOwnItems = function () {
            $(".annotime:contains(\"".concat(this.displayName, "\")"))
                .closest('tr')
                .addClass(config.selfActionClass);
        };
        return AdminUsersPage;
    }());
    function main() {
        var mountPoint = $('.content-page');
        mountPoint.empty();
        var newPage = new AdminUsersPage(mountPoint);
        StackExchange.ready(function () {
            newPage.render();
        });
    }
    main();
}());

// ==UserScript==
// @name         Mod Message Anchors
// @description  Adds anchor links to specific mod messages and CM escalation messages
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.4
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/Mod-Message-Anchors/dist/ModMessageAnchors.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/Mod-Message-Anchors/dist/ModMessageAnchors.user.js
//
// @match        *://*.askubuntu.com/admin/cm-message/*
// @match        *://*.askubuntu.com/users/message/*
// @match        *://*.mathoverflow.net/admin/cm-message/*
// @match        *://*.mathoverflow.net/users/message/*
// @match        *://*.serverfault.com/admin/cm-message/*
// @match        *://*.serverfault.com/users/message/*
// @match        *://*.stackapps.com/admin/cm-message/*
// @match        *://*.stackapps.com/users/message/*
// @match        *://*.stackexchange.com/admin/cm-message/*
// @match        *://*.stackexchange.com/users/message/*
// @match        *://*.stackoverflow.com/admin/cm-message/*
// @match        *://*.stackoverflow.com/users/message/*
// @match        *://*.superuser.com/admin/cm-message/*
// @match        *://*.superuser.com/users/message/*
//
// @grant        none
//
// ==/UserScript==
/* globals $ */
(function() {
    "use strict";
    if (window.location.search.includes("version=2")) {
        $(".thread-msg")
            .each((i, n) => {
                const header = $(n);
                const timestamp = $(n)
                    .find(".relativetime");
                timestamp.wrap(`<a href="#${header.attr("id")}"></a>`);
            });
    } else {
        $(".js-msg-body,.msg-body")
            .each((i, n) => {
                const message = $(n);
                const anchor = message.find("a[name]")
                    .first();
                const name = anchor.attr("name");
                message.find("div:eq(0)")
                    .append(`<span class="d-block w100"><a class="my2" href="#${name}">${name}</a></span>`);
            });
    }
})();

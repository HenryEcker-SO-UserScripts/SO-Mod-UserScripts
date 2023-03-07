// ==UserScript==
// @name         Mod Message Anchors
// @description  Adds anchor links to specific mod messages and CM escalation messages
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.1
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/Mod-Message-Anchors/ModMessageAnchors.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/Mod-Message-Anchors/ModMessageAnchors.user.js
//
// @match        *://*.askubuntu.com/admin/cm-message/*
// @match        *://*.askubuntu.com/users/message/*
//
// @match        *://*.serverfault.com/admin/cm-message/*
// @match        *://*.serverfault.com/users/message/*
//
// @match        *://*.stackapps.com/admin/cm-message/*
// @match        *://*.stackapps.com/users/message/*
//
// @match        *://*.stackexchange.com/admin/cm-message/*
// @match        *://*.stackexchange.com/users/message/*
//
// @match        *://*.stackoverflow.com/admin/cm-message/*
// @match        *://*.stackoverflow.com/users/message/*
//
// @match        *://*.superuser.com/admin/cm-message/*
// @match        *://*.superuser.com/users/message/*
//
// @match        *://*.mathoverflow.net/admin/cm-message/*
// @match        *://*.mathoverflow.net/users/message/*
//
// @grant        none
//
// ==/UserScript==
/* globals $ */
(function () {
    $('.js-msg-body,.msg-body')
        .each((i, message) => {
            const anchor = $(message).find('a[name]'); // assumes this is the only anchor with a name attribute
            const name = anchor.attr('name');
            anchor.attr('href', `#${name}`);
            anchor.text(name);
        });
})();

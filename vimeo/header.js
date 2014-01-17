// ==UserScript==
// @name         vimeoHTML5
// @description  Play Videos with html5 on vimeo.com
// @include      http://vimeo.com/*
// @include      https://vimeo.com/*
// @version      2.1
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @license      GPLv3
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

var uw = unsafeWindow,
    log = uw.console.log,
    error = uw.console.error;


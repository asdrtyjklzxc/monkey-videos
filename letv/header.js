// ==UserScript==
// @name         letvHTML5
// @description  Play Videos with html5 on letv.com
// @include      http://letv.com/*
// @include      http://*.letv.com/*
// @version      2.2
// @license      GPLv3
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @include      http://www.letv.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

var uw = unsafeWindow,
    log = uw.console.log,
    error = uw.console.error;


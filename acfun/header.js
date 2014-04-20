// ==UserScript==
// @name         acfunHTML5
// @description  Play Videos with html5 on acfun.tv
// @include      http://www.acfun.tv/v/*
// @include      http://www.acfun.com/v/*
// @version      2.3
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


// ==UserScript==
// @name        funshionHTML5 
// @description Play Videos with html5 on funshion.com
// @include     http://www.funshion.com/vplay/*
// @include     http://funshion.com/vplay/*
// @version     2.1
// @license     GPLv3
// @author      LiuLang
// @email       gsushzhsosgsu@gmail.com
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// @run-at      document-end
// ==/UserScript==

var uw = unsafeWindow,
    log = uw.console.log,
    error = uw.console.error;


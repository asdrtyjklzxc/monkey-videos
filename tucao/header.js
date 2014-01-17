// ==UserScript==
// @name         tucaoHTML5
// @version      2.1
// @include      http://www.tucao.cc/play/*
// @description  Get video links in tucao.cc
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


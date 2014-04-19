// ==UserScript==
// @name         iqiyiHTML5
// @description  play video with html5 in iqiyi.com
// @include      http://*.iqiyi.com/*
// @version      2.3
// @license      GPLv3
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var uw = unsafeWindow,
    log = uw.console.log,
    error = uw.console.error;


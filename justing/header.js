// ==UserScript==
// @name         justingHTML5
// @description  Get mp3 source link in justing.com
// @include      http://www.justing.com.cn/page/*
// @version      1.0
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


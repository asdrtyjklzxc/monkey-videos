// ==UserScript==
// @name         bilibiliHTML5
// @description  Get video link on bilibili.tv
// @include      http://www.bilibili.tv/video/*
// @version      2.2
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


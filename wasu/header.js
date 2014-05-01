// ==UserScript==
// @name         wasuHTML5
// @description  Get video source on wasu.cn
// @include      http://www.wasu.cn/Play/show/id/*
// @version      1.2
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


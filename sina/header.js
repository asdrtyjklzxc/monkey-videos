// ==UserScript==
// @name         sinaHTML5
// @description  Modify image path to display them directly.
// @version      2.1
// @include      http://video.sina.com.cn/*
// @include      http://open.sina.com.cn/course/*
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


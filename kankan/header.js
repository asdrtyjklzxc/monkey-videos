// ==UserScript==
// @name         kankanHTML5
// @description  Play videos with html5 on kankan.com
// @version      2.1
// @include      http://vod.kankan.com/v/*
// @include      http://vod.kankan.com/trailer/*
// @include      http://vod.kankan.com/1080p/*
// @license      GPLv3
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

var uw = unsafeWindow,
    log = uw.console.log,
    error = uw.console.error;


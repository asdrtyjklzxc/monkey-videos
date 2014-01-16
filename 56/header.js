// ==UserScript==
// @name         56HTML5
// @description  Play Videos with html5 on 56.com
// @version      2.1
// @license      GPLv3
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @include      http://www.56.com/u*
// @include      http://www.56.com/w*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

var uw = unsafeWindow,
    log = uw.console.log,
    error = uw.console.error;


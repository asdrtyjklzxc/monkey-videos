// ==UserScript==
// @name         115HTML5
// @version      1.0
// @description  Play Videos with html5 on 115.com
// @include      http://115.com/?ct=play&pickcode=*
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @license      GPLv3
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==


var uw = unsafeWindow,
    log = uw.console.log,
    error = uw.console.error;


// ==UserScript==
// @name        56HTML5
// @version     1.1
// @description Play Videos with html5 on 56.com
// @license     GPLv3
// @author      LiuLang
// @email       gsushzhsosgsu@gmail.com
// @include     http://www.56.com/u*
// @include     http://www.56.com/w*
// @grant       GM_xmlhttpRequest
// @run-at      document-end
// ==/UserScript==

/**
 * v1.1 - 2014.1.12
 * Support albums
 * v1.0 - 2014.1.11
 * Project inited.
 */

var uw = unsafeWindow,
    log = uw.console.log,
    error = uw.console.error;

var html56 = {

  title: '',
  id: '',
  json: [],
  videos: [],
  formats: {
    'normal': '标清',
    'clear': '高清',
    'super': '超清',
  },

  run: function() {
    log('run() --');
    this.getID();
    if (this.id.length > 0) {
      this.getPlaylist();
    } else {
      error('Failed to get video id!');
      return;
    }
  },

  getID: function() {
    log('getID() --');
    var url = uw.location.href,
        idReg = /\/v_(\w+)\.html/,
        idMatch = idReg.exec(url),
        albumIDReg = /_vid-(\w+)\.html/,
        albumIDMatch = albumIDReg.exec(url);

    log(idMatch);
    log(albumIDMatch);
    if (idMatch && idMatch.length === 2) {
      this.id = idMatch[1]; 
    } else if (albumIDMatch && albumIDMatch.length === 2) {
      this.id = albumIDMatch[1];
    }
    log(this);
  },

  getPlaylist: function() {
    log('getPlaylist() --');
    var url = 'http://vxml.56.com/json/' + this.id + '/?src=out',
        that = this;

    log('url: ', url);
    GM_xmlhttpRequest({
      method: 'get',
      url: url,
      onload: function(response) {
        log('response:', response);
        var txt = response.responseText,
            json = JSON.parse(txt);

        that.json = json;
        if (json.msg != 'ok' || json.status != '1') {
          error('Failed to parse responseText!');
          return;
        }
        that.title = json.info.Subject;
        that.videos = json.info.rfiles;
        that.createUI();
      },
    });
  },

  createUI: function() {
    log('createUI() --');
    var div = uw.document.createElement('div'),
        a
        video = '',
        title = '',
        i = 0;

    this.addStyle([
        '.download-wrap { ',
          'position: fixed; ',
          'left: 10px; ',
          'bottom: 10px; ',
          'border: 2px solid #ccc; ',
          'border-top-right-radius: 15px; ',
          'margin; 0; ',
          'padding: 10px; ',
          'background-color: #fff; ',
          'z-index: 9999; ',
          'font: 12px/1.5 tahoma, arial, sans-serif; ',
          '}',
        '.download-link { ',
          'display: block;',
          'text-decoration: none; ',
          '}',
        '.download-link:hover { ',
          'text-decoration: underline; ',
          '}',
        '.download-link:active {',
          'color: #e03434; ',
          'outline: none; ',
          '}',
        ].join(''));

    for (i = 0; i < this.videos.length; i += 1) {
      video = this.videos[i];
      title = this.title + '-' + this.formats[video.type];
      a = uw.document.createElement('a');
      a.href = video.url;
      a.innerHTML = title;
      a.title = title;
      a.className = 'download-link';
      div.appendChild(a);
    }

    div.className = 'download-wrap';
    uw.document.body.appendChild(div);
  },

  /**
   * Create a new <style> tag with str as its content.
   * @param string styleText
   *   - The <style> tag content.
   */
  addStyle: function(styleText) {
    var style = uw.document.createElement('style');
    if (uw.document.head) {
      uw.document.head.appendChild(style);
      style.innerHTML = styleText;
    }
  },

}

html56.run();

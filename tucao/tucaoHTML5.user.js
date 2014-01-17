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


var singleFile = {
  // videos is an object containing video info.
  //
  // @title, string, video title
  // @formats, string list, format name of each video
  // @links, string list, video link
  // @msg, string 
  // @ok, bool, is ok is false, @msg will be displayed on playlist-panel
  videos: null,

  run: function(videos) {
    log('run() -- ');
    this.videos = videos;
    this.createPanel();
    this.createPlaylist();
  },

  createPanel: function() {
    log('createPanel() --');
    var panel = uw.document.createElement('div'),
        playlist = uw.document.createElement('div'),
        playlistToggle = uw.document.createElement('div');

    this.addStyle([
      '.monkey-videos-panel {',
        'position: fixed;',
        'right: 10px;',
        'bottom: 0px;',
        'z-index: 99999;',
        'border: 2px solid #ccc;',
        'border-top-left-radius: 14px;',
        'margin: 10px 0px 0px 0px;',
        'padding: 10px 10px 0px 10px;',
        'background-color: #fff;',
        'overflow-y: hidden;',
        'max-height: 90%;',
        'min-width: 100px;',
      '}',
      '.monkey-videos-panel:hover {',
        'overflow-y: auto;',
      '}',
      '.monkey-videos-panel label {',
        'margin-right: 10px;',
      '}',
      '.monkey-videos-panel .playlist-item {',
        'display: block;',
      '}',
      '.monkey-videos-panel #playlist-toggle {',
        'height: 10px;',
        'width: 100%;',
        'margin-top: 10px;',
      '}',
      '.monkey-videos-panel #playlist-toggle:hover {',
        'cursor: pointer;',
      '}',
      '.monkey-videos-panel .playlist-show {',
        'background-color: #8b82a2;',
        //'border-radius: 0px 0px 5px 5px;',
      '}',
      '.monkey-videos-panel .playlist-hide {',
        'background-color: #462093;',
        //'border-radius: 5px 5px 0px 0px;',
      '}',
    ].join(''));

    panel.className = 'monkey-videos-panel';
    uw.document.body.appendChild(panel);

    playlist= uw.document.createElement('div');
    playlist.className = 'playlist-wrap';
    panel.appendChild(playlist);

    playlistToggle = uw.document.createElement('div');
    playlistToggle.id = 'playlist-toggle';
    playlistToggle.title = '隐藏';
    playlistToggle.className = 'playlist-show';
    panel.appendChild(playlistToggle);
    playlistToggle.addEventListener('click', function(event) {
      var wrap = uw.document.querySelector(
            '.monkey-videos-panel .playlist-wrap');

      if (wrap.style.display === 'none') {
        wrap.style.display = 'block';
        event.target.className = 'playlist-show';
        event.target.title = '隐藏';
        GM_setValue('hidePlaylist', false);
      } else {
        wrap.style.display = 'none';
        event.target.title = '显示';
        event.target.className = 'playlist-hide';
        GM_setValue('hidePlaylist', true);
      }
    }, false);

    if (GM_getValue('hidePlaylist', false)) {
      playlistToggle.click();
    }
  },

  createPlaylist: function() {
    log('createPlayList() -- ');
    var playlist = uw.document.querySelector(
          '.monkey-videos-panel .playlist-wrap'),
        a,
        i;

    if (!this.videos.ok) {
      error(this.videos.msg);
      a = uw.document.createElement('span');
      a.title = this.videos.msg;
      a.innerHTML = this.videos.msg;
      playlist.appendChild(a);
      return;
    }

    for (i = 0; i < this.videos.links.length; i += 1) {
      a = uw.document.createElement('a');
      a.className = 'playlist-item';
      a.innerHTML = this.videos.title + '(' + this.videos.formats[i] + ')';
      a.title = a.innerHTML;
      a.href = this.videos.links[i];
      playlist.appendChild(a);
    }
  },

  /**
   * Create a new <style> tag with str as its content.
   * @param string styleText
   *   - The <style> tag content.
   */
  addStyle: function(styleText) {
    log('addStyle() --');
    var style = uw.document.createElement('style');
    if (uw.document.head) {
      uw.document.head.appendChild(style);
      style.innerHTML = styleText;
    }
  },
};


var monkey = {

  url: '',
  title: '',
  playerId: '',
  vid: '',
  vids: [],
  pos: 0,
  videos: [],
  formats: [],
  redirect: false,
  types: {
    sina: 'sina.php',
    tudou: false,  // redirect to original url
    youku: false,  // redirect to original url
  },

  run: function() {
    log('run()');
    this.getVid();
  },

  /**
   * Get video id
   */
  getVid: function() {
    log('getVid() -- ');
    var playerCode = uw.document.querySelectorAll('ul#player_code li');

    if (playerCode && playerCode.length === 2) {
      this.vids = playerCode[0].firstChild.nodeValue.split('**');
      if (this.vids[this.vids.length - 1] == '') {
        // remove empty vid
        this.vids.pop();
      }
      this.playerId = playerCode[1].innerHTML;
      this.getTitle();
    }
  },

  /**
   * Get video title
   */
  getTitle: function() {
    log('getTitle()');
    if (this.vids.length === 1 || uw.location.hash === '') {
      this.pos = 0;
      this.url = uw.location.href;
    } else {
      // hash starts with 1, not 0
      this.pos = parseInt(uw.location.hash.replace('#', '')) - 1;
      this.url = uw.location.href.replace(uw.location.hash, '');
    }
    this.vid = this.vids[this.pos].split('|')[0];
    if (this.vids.length === 1) {
      this.title = uw.document.title.substr(0, uw.document.title.length - 16);
    } else {
      this.title = this.vids[this.pos].split('|')[1];
    }
    this.getUrl();
  },

  /**
   * Get original url
   */
  getUrl: function(type) {
    log('getUrl()');
    var url,
        params,
        that = this;

    params = this.getQueryVariable(this.vid);
    if (this.types[params.type] === false) {
      this.redirectTo(params);
      return;
    }

    url = [
      'http://www.tucao.cc/api/',
      this.types[params.type],
      '?vid=',
      params.vid,
      ].join('');

    log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log(response);
        var xml = that.parseXML(response.responseText),
            durl = xml.querySelector('durl'),
            urls = durl.querySelectorAll('url'),
            url,
            i;

        for (i = 0; url = urls[i]; i += 1) {
          that.videos.push(
            url.innerHTML.replace('<![CDATA[', '').replace(']]>', ''));
          that.formats.push(' ');
        }

        log(that);
        that.createUI();
      },
    });
  },

  /**
   * Redirect to original url
   */
  redirectTo: function(params) {
    log('redirectTo() --');
    var urls = {
          tudou: function(vid) {
            return 'http://www.tudou.com/programs/view/' + vid + '/';
          },
          youku: function(vid) {
            return 'http://v.youku.com/v_show/id_' + vid + '.html';
          },
        };

    this.redirect = true;
    this.videos.push(urls[params.type](params.vid));
    this.formats.push('原始地址');
    this.createUI();
  },

  /**
   * Construct ui widgets
   */
  createUI: function() {
    log('createUI() -- ');
    log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
          ok: true,
          msg: '',
        },
        video,
        i;

    for (i = 0; i < this.videos.length; i += 1) {
      videos.links.push(this.videos[i]);
      videos.formats.push(this.formats[i]);
    }
    singleFile.run(videos);
  },

  /**
   * Convert string to xml
   * @param string str
   *  - the string to be converted.
   * @return object xml
   *  - the converted xml object.
   */
  parseXML: function(str) {
    if (uw.document.implementation &&
        uw.document.implementation.createDocument) {
      xmlDoc = new DOMParser().parseFromString(str, 'text/xml');
    } else {
      log('parseXML() error: not support current web browser!');
      return null;
    }
    return xmlDoc;
  },

  /**
   * Split query parameters in url and convert to object
   */
  getQueryVariable: function(query) {
    var vars = query.split('&'),
        params = {},
        param,
        i;

    for (i = 0; i < vars.length; i += 1) {
      param = vars[i].split('=');
      params[param[0]] = param[1];
    }
    return params;
  },
}

monkey.run();


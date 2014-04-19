// ==UserScript==
// @name         letvHTML5
// @description  Play Videos with html5 on letv.com
// @include      http://letv.com/*
// @include      http://*.letv.com/*
// @version      2.2
// @license      GPLv3
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @include      http://www.letv.com/*
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
  pid: '',
  vid: '',   // video id
  title: '',
  stime: 0, // server timestamp
  tkey: 0,  // time key

  videoUrl: {
    '350': null,
    '1000': null,
    '1300': null,
    '720p': null,
    '1080p': null,
  },
  videoFormats: {
    '350': '流畅',
    '1000': '标清',
    '1300': '高清',
    '720p': '720P',
    '1080p': '1080P',
  },

  run: function() {
    log('run() -- ');
    var url = uw.location.href;

    if (url.search('yuanxian.letv') !== -1) {
      // movie info page.
      this.addLinkToYuanxian();
    } else if (url.search('ptv/pplay/') > 1 ||
               url.search('ptv/vplay/' > 1)) {
      this.getVid();
    } else {
      error('I do not know what to do!');
    }
  },

  /**
   * Show original video link in video index page.
   */
  addLinkToYuanxian: function() {
    log('addLinkToYuanxian() --');
    var pid = uw.__INFO__.video.pid,
        url = 'http://www.letv.com/ptv/pplay/' + pid + '.html',
        titleLink = uw.document.querySelector('dl.w424 dt a');

    titleLink.href = url;
  },

  /**
   * Get video id
   */
  getVid: function() {
    log('getVid() --')
    var input = uw.document.querySelector('.add input'),
        vidReg = /\/(\d+)\.html$/,
        vidMatch;

    log(input);
    if (input && input.hasAttribute('value')) {
      vidMatch = vidReg.exec(input.getAttribute('value'));
    } else {
      error('Failed to get input element');
      return;
    }

    log('vidMatch: ', vidMatch);
    if (vidMatch && vidMatch.length === 2) {
      this.vid = vidMatch[1];
      this.getTimestamp();
    } else {
      error('Failed to get video ID!');
      return;
    }
  },

  /**
   * Get timestamp from server
   */
  getTimestamp: function() {
    log('getTimestamp() --');
    var tn = Math.random(),
        url = 'http://api.letv.com/time?tn=' + tn.toString(),
        that = this;

    log('url:', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response:', response);
        var obj = JSON.parse(response.responseText);
        that.stime = parseInt(obj.stime);
        that.tkey = that.getKey(that.stime);
        that.getVideoXML();
      },
    });
  },

  /**
   * Get time key
   * @param integer t, server time
   */
  getKey: function(t) {
    log('getKey() --', t);
    for(var e = 0, s = 0; s < 8; s += 1){
            e = 1 & t;
            t >>= 1;
            e <<= 31;
            t += e;
    }
    return t ^ 185025305;
  },

  /**
   * Get video info from an xml file
   */
  getVideoXML: function() {
    log('getVideoXML() --');
    var url = [
          'http://api.letv.com/mms/out/video/play?',
          'id=', this.vid,
          '&platid=1&splatid=101&format=1',
          '&tkey=', this.tkey,
          '&domain=http%3A%2F%2Fwww.letv.com'
          ].join(''),
        that = this;

    log('videoXML url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);
        var txt = response.responseText,
            //xml = that.parseXML(txt);
            jsonReg = /<playurl><!\[CDATA\[([\s\S]+)\]\]><\/playurl/,
            match = jsonReg.exec(txt),
            jsonTxt = '',
            json = '';

        log('match: ', match);
        if (match && match.length == 2) {
          jsonTxt = match[1];
          json = JSON.parse(jsonTxt);
          log('json: ', json);
          that.title = json.title;
          that.getVideoUrl(json);
        } else {
          error('Failed to get video json');
        }
      },
    });
  },

  /**
   * Remove useless parameters in video link.
   */
  escapeUrl: function(url) {
    log('escapeUrl() --', url);
    var index = url.search('&platid');

    if (index > -1) {
      return url.substr(0, index);
    } else {
      error('Failed to escape url:', url);
    }
  },

  /**
   * Parse video url
   */
  getVideoUrl: function(json) {
    log('getVideoUrl() --');
    for (var key in this.videoUrl) {
      if (key in json.dispatch) {
        this.videoUrl[key] = this.escapeUrl(json.dispatch[key][0]);
      }
    }
    this.createUI();
  },

  /**
   * construct ui widgets.
   */
  createUI: function() {
    log('createUI() --');
    log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
          ok: true,
          msg: '',
        },
        type;
  
    for (type in this.videoFormats) {
      if (this.videoUrl[type]) {
        videos.links.push(this.videoUrl[type]);
        videos.formats.push(this.videoFormats[type]);
      }
    }

    singleFile.run(videos);
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
}

monkey.run();


// ==UserScript==
// @name        funshionHTML5 
// @description Play Videos with html5 on funshion.com
// @include     http://www.funshion.com/vplay/*
// @include     http://funshion.com/vplay/*
// @version     2.2
// @license     GPLv3
// @author      LiuLang
// @email       gsushzhsosgsu@gmail.com
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// @run-at      document-end
// ==/UserScript==

var uw = unsafeWindow,
    log = uw.console.log,
    error = uw.console.error;


/**
 * base64 function wrap
 * usage: base64.encode(str); base64.decode(base64_str);
 */
var base64 = {
  encodeChars : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrs' +
    'tuvwxyz0123456789+/',
  decodeChars : [
　　-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
　　-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
　　-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
　　52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
　　-1,　0,　1,　2,　3,  4,　5,　6,　7,　8,　9, 10, 11, 12, 13, 14,
　　15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
　　-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
　　41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1],

  encodeFunction: function(str) {
  　　var out = '',
      len = str.length,
      i = 0,
      c1,
      c2,
      c3;
  
    while(i < len) {
      c1 = str.charCodeAt(i++) & 0xff;
      if(i === len) {
        out += this.encodeChars.charAt(c1 >> 2);
        out += this.encodeChars.charAt((c1 & 0x3) << 4);
        out += "==";
        break;
      }
      c2 = str.charCodeAt(i++);
      if(i === len) {
        out += this.encodeChars.charAt(c1 >> 2);
        out += this.encodeChars.charAt(((c1 & 0x3)<< 4) | 
            ((c2 & 0xF0) >> 4));
        out += this.encodeChars.charAt((c2 & 0xF) << 2);
        out += "=";
        break;
      }
      c3 = str.charCodeAt(i++);
      out += this.encodeChars.charAt(c1 >> 2);
      out += this.encodeChars.charAt(((c1 & 0x3)<< 4) |
          ((c2 & 0xF0) >> 4));
      out += this.encodeChars.charAt(((c2 & 0xF) << 2) |
          ((c3 & 0xC0) >>6));
      out += this.encodeChars.charAt(c3 & 0x3F);
    }
    return out;
  },

  decodeFunction: function(str) {
    var c1,
      c2,
      c3,
      c4,
      len = str.length,
      out = '',
      i = 0;

    while(i < len) {
      do {
        c1 = this.decodeChars[str.charCodeAt(i++) & 0xff];
      } while(i < len && c1 === -1);
      if(c1 === -1) {
        break;
      }

      do {
        c2 = this.decodeChars[str.charCodeAt(i++) & 0xff];
      } while(i < len && c2 === -1);
      if(c2 === -1) {
        break;
      }
      out += String.fromCharCode((c1 << 2) |
          ((c2 & 0x30) >> 4));
      
      do { 
        c3 = str.charCodeAt(i++) & 0xff;
        if(c3 === 61) {
          return out;
        }
        c3 = this.decodeChars[c3];
      } while(i < len && c3 === -1);
      if(c3 === -1) {
        break;
      }
      out += String.fromCharCode(((c2 & 0XF) << 4) |
          ((c3 & 0x3C) >> 2));

      do { 
        c4 = str.charCodeAt(i++) & 0xff;
        if(c4 === 61) {
          return out;
        }
        c4 = this.decodeChars[c4];
      } while(i < len && c4 === -1);
      if(c4 === -1) {
        break;
      }
      out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    };
    return out;
  },

  utf16to8: function(str) {
    var out = '',
      len = str.length,
      i,
      c;

    for(i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if ((c >= 0x0001) && (c <= 0x007F)) {
        out += str.charAt(i);
      } else if (c > 0x07FF) {
        out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
        out += String.fromCharCode(0x80 | ((c >>　6) & 0x3F));
        out += String.fromCharCode(0x80 | ((c >>　0) & 0x3F));
      } else {
        out += String.fromCharCode(0xC0 | ((c >>　6) & 0x1F));
        out += String.fromCharCode(0x80 | ((c >>　0) & 0x3F));
      }
    }
    return out;
  },

  utf8to16: function(str) {
  　　var out = '',
      len = str.length,
      i = 0,
      c,
      char2,
      char3;
  
    while(i < len) {
      c = str.charCodeAt(i++);
      switch(c >> 4) {
      // 0xxxxxxx
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        out += str.charAt(i - 1);
        break;
      // 110x xxxx　 10xx xxxx
      case 12: case 13:
        char2 = str.charCodeAt(i++);
        out += String.fromCharCode(((c & 0x1F) << 6) |
            (char2 & 0x3F));
        break;
      // 1110 xxxx　10xx xxxx　10xx xxxx
      case 14:
        char2 = str.charCodeAt(i++);
        char3 = str.charCodeAt(i++);
        out += String.fromCharCode(((c & 0x0F) << 12) |
          ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
        break;
      }
    }
    return out;
  },

  // This is encode/decode wrap, which convert chars between UTF-8
  // and UTF-16;
  encode: function(str) {
    return this.encodeFunction(this.utf16to8(str));
  },

  decode: function(str) {
    return this.utf8to16(this.decodeFunction(str));
  },
};


/**
 * UI functions.
 * create UI which has multiples files per video.
 */
var multiFiles = {

  // videos is an object containing these fields:
  // title, video title
  // formats, title of each video format
  // links, list containing video links of each duration
  videos: null,

  run: function(videos) {
    log('multiFiles.run() --');
    this.videos = videos;
    if ((!videos.formats) || (videos.formats.length === 0)) {
      error('Error: no video formats specified!');
      return;
    }
    this.removeOldPanels();
    this.createPanel();
  },

  removeOldPanels: function() {
    log('removeOldPanels() --');
    var panels = uw.document.querySelectorAll('.monkey-videos-panel'),
        panel,
        i;

    for (i = 0; panel = panels[i]; i += 1) {
      panel.parentElement.removeChild(panel);
    }
  },

  /**
   * Create the control panel.
   */
  createPanel: function() {
    log('createPanel() --');
    var panel = uw.document.createElement('div'),
        div,
        form,
        label,
        input,
        span,
        a,
        i,
        playlistWrap,
        playlistToggle,
        that = this;

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
        'text-align: left;',
      '}',
      '.monkey-videos-panel:hover {',
        'overflow-y: auto;',
      '}',
      '.monkey-videos-panel label {',
        'margin-right: 10px;',
      '}',
      '.monkey-videos-panel .playlist-item {',
        'display: block;',
        'margin-top: 8px;',
      '}',
      '.monkey-videos-panel #playlist-toggle {',
        'height: 10px;',
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

    playlistWrap = uw.document.createElement('div');
    playlistWrap.className = 'playlist-wrap';
    panel.appendChild(playlistWrap);

    div = uw.document.createElement('div');
    div.className = 'playlist-nav';
    playlistWrap.appendChild(div);

    form = uw.document.createElement('form');
    form.className = 'playlist-format';
    playlistWrap.appendChild(form);
    for (i = 0; i < this.videos.formats.length; i += 1) {
      label = uw.document.createElement('label');
      form.appendChild(label);
      input = uw.document.createElement('input');
      label.appendChild(input);
      input.type = 'radio';
      input.name = 'monkey-videos-format';
      span = uw.document.createElement('span');
      label.appendChild(span);
      span.innerHTML = this.videos.formats[i];

      (function(input, pos) {
        input.addEventListener('change', function() {
          that.modifyList(pos);
          GM_setValue('format', pos);
        }, false);
      })(input, i);
    }
    
    // playlist m3u (with url data schema)
    a = uw.document.createElement('a');
    a.className = 'playlist-m3u';
    a.innerHTML = '播放列表';
    a.title = a.innerHTML;
    a.href = '';
    form.appendChild(a);

    div = uw.document.createElement('div');
    div.className = 'playlist';
    playlistWrap.appendChild(div);

    playlistToggle = uw.document.createElement('div');
    playlistToggle.id = 'playlist-toggle';
    playlistToggle.title = '隐藏';
    playlistToggle.className = 'playlist-show';
    panel.appendChild(playlistToggle);
    playlistToggle.addEventListener('click', function(event) {
      var wrap = uw.document.querySelector('.monkey-videos-panel .playlist-wrap');
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

    this.loadDefault();
  },

  loadDefault: function() {
    log('loadDefault() --');
    // Load default type of playlist.
    var currPos = GM_getValue('format', 0),
        formats = this.videos.formats,
        currPlaylist;

    log('currPos: ', currPos);
    if (formats.length <= currPos) {
      currPos = formats.length - 1;
    }
    log('currPos: ', currPos);

    currPlaylist = uw.document.querySelectorAll(
        '.monkey-videos-panel .playlist-format input')[currPos];

    if (currPlaylist) {
      currPlaylist.checked = true;
      this.modifyList(currPos);
    }
  },

  /**
   * Modify the playlist content.
   *
   * Empty playlist first, and add new links of specific video format.
   */
  modifyList: function(pos) {
    log('modifyList(), pos = ', pos);
    var playlist = uw.document.querySelector('.monkey-videos-panel .playlist'),
        url,
        a,
        i;
    
    // Clear its content first
    playlist.innerHTML = '';

    for (i = 0; url = this.videos.links[pos][i]; i += 1) {
      a = uw.document.createElement('a');
      playlist.appendChild(a);
      a.className = 'playlist-item',
      a.href = url;
      if (this.videos.links[pos].length == 1) {
        a.innerHTML = this.videos.title;
      }
      else if (i < 9) {
        a.innerHTML = this.videos.title + '(0' + String(i + 1) + ')';
      } else {
        a.innerHTML = this.videos.title + '(' + String(i + 1) + ')';
      }
      a.title = a.innerHTML;
    }

    // Refresh m3u playlist file.
    uw.document.querySelector('.playlist-m3u').href = this.plsDataScheme();
  },

  /**
   * Generate Playlist using base64 and Data URI scheme.
   * So that we can download directly and same it as a pls file using HTML.
   * URL:http://en.wikipedia.org/wiki/Data_URI_scheme
   * @return string
   *  - Data scheme containting playlist.
   */
  plsDataScheme: function() {
    log('plsDataSchema() --');
    return 'data:audio/x-m3u;charset=UTF-8;base64,' +
      base64.encode(this.generatePls());
  },

  /**
   * Generate pls - a multimedia playlist file, like m3u.
   * @return string
   * - playlist content.
   */
  generatePls: function() {
    log('generatePls() --');
    var output = [],
        links = uw.document.querySelectorAll('.monkey-videos-panel .playlist-item'),
        a,
        i;

    output.push('#EXTM3U');
    for (i = 0; a = links[i]; i += 1) {
      output.push('#EXTINF:81, ' + a.innerHTML);
      output.push(a.href);
    }
    return output.join('\n');
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
};


var monkey = {
  title: '',
  mediaid: '',       // 专辑ID;
  number: '',        // 第几集, 从1计数;
  jobs: 0,

  formats: {
    327680: '标清版',
    491520: '高清版',
    737280: '超清版',
  },
  videos: {
    327680: '',
    491520: '',
    737280: '',
  },

  run: function() {
    log('run() --');
    this.router();
  },
  
  /**
   * router control
   */
  router: function() {
    var url = uw.location.href;

    if (url.search('subject/play/') > 1 ||
        url.search('/vplay/') > 1 ) {
      this.getVid();
    } else if (url.search('subject/') > 1) {
      this.addLinks();
    } else if (url.search('uvideo/play/') > 1) {
      this.getUGCID();
    } else {
      error('Error: current page is not supported!');
    }
  },

  /**
   * Get UGC video ID.
   * For uvideo/play/'.
   */
  getUGCID: function() {
    log('getUGCID() --');
    var urlReg = /uvideo\/play\/(\d+)$/,
        urlMatch = urlReg.exec(uw.location.href);

    log('urlMatch: ', urlMatch);
    if (urlMatch.length === 2) {
      this.mediaid = urlMatch[1];
      this.getUGCVideoInfo();
    } else {
      error('Failed to parse video ID!');
    }
  },

  getUGCVideoInfo: function() {
    log('getUGCVideoInfo() --');
    var url = 'http://api.funshion.com/ajax/get_media_data/ugc/' + this.mediaid,
        that = this;

    log('url: ', url);
    GM_xmlhttpRequest({
      url: url,
      method: 'GET',
      onload: function(response) {
        log('response: ', response);
        that.json = JSON.parse(response.responseText);
        log('json: ', that.json);
        that.decodeUGCVideoInfo();
      },
    });
  },

  decodeUGCVideoInfo: function() {
    log('decodeUGCVideoInfo() --');
    var url = [
          'http://jobsfe.funshion.com/query/v1/mp4/',
          this.json.data.hashid,
          '.json?file=',
          this.json.data.filename,
        ].join(''),
        that = this;

    log('url: ', url);
    GM_xmlhttpRequest({
      url: url,
      method: 'GET',
      onload: function(response) {
        log('response: ', response);
        that.appendUGCVideo(JSON.parse(response.responseText));
      },
    });
  },

  appendUGCVideo: function(videoJson) {
    log('appendUGCVideo() --');
    log('this: ', this);
    log('videoJson:', videoJson);
    var fileformat = this.fileformats[videoJson.playlist[0].bits];

    info = {
      title: this.json.data.name_cn,
      href: videoJson.playlist[0].urls[0],
    };
    log('info: ', info);

    this._appendVideo(info);
  },


  /**
   * Get video ID.
   * For subject/play/'.
   */
  getVid: function() {
    log('getVid() --');
    var url = uw.location.href,
        urlReg = /subject\/play\/(\d+)\/(\d+)$/,
        urlMatch = urlReg.exec(url),
        urlReg2 = /\/vplay\/m-(\d+)/,
        urlMatch2 = urlReg2.exec(url);

    log('urlMatch: ', urlMatch);
    log('urlMatch2: ', urlMatch2);
    if (urlMatch && urlMatch.length === 3) {
      this.mediaid = urlMatch[1];
      this.number = parseInt(urlMatch[2]);
    } else if (urlMatch2 && urlMatch2.length === 2) {
      this.mediaid = urlMatch2[1];
      this.number = 1;
    } else {
      error('Failed to parse video ID!');
      return;
    }
    this.getVideoInfo();
  },

  /**
   * Download a json file containing video info
   */
  getVideoInfo: function() {
    log('getVideoInfo() --');
    var url = [
          'http://api.funshion.com/ajax/get_web_fsp/',
          this.mediaid,
          '/mp4',
        ].join(''),
        that = this;

    log('url: ', url);
    GM_xmlhttpRequest({
      url: url,
      method: 'GET',
      onload: function(response) {
        log('response: ', response);
        var json = JSON.parse(response.responseText),
            format;
        log('json: ', json);
        that.title = json.data.name_cn || that.getTitle();
        if ((! json.data.fsps) || (! json.data.fsps.mult) ||
            (json.data.fsps.mult.length === 0) ||
            (! json.data.fsps.mult[0].cid)) {
          that.createUI();
        }

        that.mediaid = json.data.fsps.mult[0].cid;
        for (format in that.formats) {
          that.jobs = that.jobs + 1;
          that.getVideoLink(format);
        }
      },
    });
  },

  /**
   * Get title from document.tiel
   */
  getTitle: function() {
    log('getTitle() --');
    var title = uw.document.title,
        online = title.search(' - 在线观看');

    if (online > -1) {
      return title.substr(0, online);
    } else {
      return title.substr(0, 12) + '..';
    }
  },

  /**
   * Get Video source link.
   */
  getVideoLink: function(format) {
    log('getVideoLink() --');
    var url = [
      'http://jobsfe.funshion.com/query/v1/mp4/',
      this.mediaid,
      '.json?bits=',
      format,
      ].join(''),
      that = this;

    log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);
        var json = JSON.parse(response.responseText);
        log('json: ', json);
        that.videos[format] = json.playlist[0].urls[0];
        that.jobs = that.jobs - 1;
        if (that.jobs === 0) {
          that.createUI();
        }
      },
    });
  },

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
        format;

    if (this.videos[327680].length > 0) {
      videos.links.push([this.videos[327680]]);
      videos.formats.push(this.formats[327680]);
    }
    if (this.videos[491520].length > 0) {
      videos.links.push([this.videos[491520]]);
      videos.formats.push(this.formats[491520]);
    }
    if (this.videos[737280].length > 0) {
      videos.links.push([this.videos[737280]]);
      videos.formats.push(this.formats[737280]);
    }

    if (videos.links.length === 0) {
      videos.ok = false;
      videos.msg = 'Video source is not available.';
    }
    multiFiles.run(videos);
  },
}

monkey.run();


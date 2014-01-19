// ==UserScript==
// @name         sohuHTML5
// @description  Play Videos with html5 on sohu.com
// @include      http://my.tv.sohu.com/*
// @include      http://tv.sohu.com/*
// @version      2.1
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
      if (i < 9) {
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
  vid: '',
  plid: '',
  referer: '',
  jobs: 0,
  formats: {
    p1: '标清',
    p2: '高清',
    p3: '超清',
    p4: '原画质'
  },

  p1: {
    json: [],
    su: [],
    clipsURL: [],
    ip: '',
    vid: 0,
    reserveIp: [],
    videos: [],
    params: [],
  },

  p2: {
    json: [],
    su: [],
    vid: 0,
    clipsURL: [],
    ip: '',
    reserveIp: [],
    videos: [],
    params: [],
  },

  p3: {
    json: [],
    su: [],
    clipsURL: [],
    vid: 0,
    ip: '',
    reserveIp: [],
    videos: [],
    params: [],
  },

  p4: {
    json: [],
    su: [],
    clipsURL: [],
    vid: 0,
    ip: '',
    reserveIp: [],
    videos: [],
    params: [],
  },

  run: function() {
    log('run() --');
    this.router();
  },

  router: function() {
    log('router() -- ');
    var host = uw.document.location.hostname;
    if (host === 'my.tv.sohu.com') {
      this.getUGCId();
    } else if (host === 'tv.sohu.com') {
      this.getId();
    } else {
      error('Error: this page is not supported');
    }
  },

  /**
   * Get video id for UGC video
   */
  getUGCId: function() {
    log('getUGCId() -- ');
    var scripts = uw.document.querySelectorAll('script'),
        script,
        vidReg = /var vid\s+=\s+'(\d+)'/,
        vidMatch,
        titleReg = /,title:\s+'([^']+)'/,
        titleMatch,
        txt,
        i;

    for (i = 0; script = scripts[i]; i += 1) {
      if (script.innerHTML.search('var vid') > -1) {
        txt = script.innerHTML;
        vidMatch = vidReg.exec(txt);
        log('vidMatch: ', vidMatch);
        if (vidMatch && vidMatch.length === 2) {
          this.vid = vidMatch[1];
        }
        log('titleMatch: ', titleMatch);
        titleMatch = titleReg.exec(txt);
        if (titleMatch && titleMatch.length === 2) {
          this.title = titleMatch[1];
        }
        break;
      }
    }
    if (this.vid.length > 0) {
      this.referer = uw.escape(uw.location.href);
      this.p2.vid = this.vid;
      this.getUGCVideoJSON('p2');
    } else {
      error('Error: failed to get video id!');
    }
  },

  /**
   * Get UGC video info
   */
  getUGCVideoJSON: function(fmt) {
    log('getUGCVideoJSON() -- ');
    var that = this,
        url = 'http://my.tv.sohu.com/videinfo.jhtml?m=viewtv&vid=' + this.vid;

    log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);
        var json = JSON.parse(response.responseText);

        log('json: ', json);
        that[fmt].json = json;
        that[fmt].su = json.data.su;
        that[fmt].clipsURL = json.data.clipsURL;

        if (fmt === 'p2') {
          if (json.data.norVid) {
            that.p1.vid = json.data.norVid;
            that.getUGCVideoJSON('p1');
          }
          if (json.data.superVid) {
            that.p3.vid = json.data.superVid;
            that.getUGCVideoJSON('p3');
          }
          if (json.data.oriVid) {
            that.p4.vid = json.data.oriVid;
            that.getUGCVideoJSON('p4');
          }
        }
        that.decUGCVideo(fmt);
      },
    });
  },

  /**
   * Decode UGC video url
   */
  decUGCVideo: function(fmt) {
    log('decUGCVideo() -- ');
    var url,
        json = this[fmt].json,
        i;

    for (i = 0; i < json.data.clipsURL.length; i += 1) {
      url = [
        'http://',
        json.allot,
        '?prot=',
        json.prot, 
        '&file=',
        json.data.clipsURL[i],
        '&new=',
        json.data.su[i],
      ].join('');
      log('url: ', url);
      this[fmt].videos.push('');
      this.jobs += 1;
      this.decUGCVideo2(fmt, url, i);
    }
  },

  decUGCVideo2: function(fmt, url, i) {
    log('decUGCVideo2() -- ');
    var that = this;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response:', response);
        var params = response.responseText.split('|');

        that[fmt].params = params;
        that[fmt].videos[i] = [
          params[0],
          that[fmt].su[i],
          '?key=',
          params[3],
        ].join('');
        
        that.jobs -= 1;
        if (that.jobs === 0) {
          that.createUI();
        }
      },
    });
  },

  /**
   * Get video id
   */
  getId: function() {
    log('getId() --');
    this.vid = uw.vid;
    this.p2.vid = uw.vid;
    this.plid = uw.playlistId;
    this.title = uw.document.title.split('-')[0].trim();
    this.referer = uw.escape(uw.location.href);
    this.jobs += 1;
    this.getVideoJSON('p2');
  },

  /**
   * Get video info.
   * e.g. http://hot.vrs.sohu.com/vrs_flash.action?vid=1109268&plid=5028903&referer=http%3A//tv.sohu.com/20130426/n374150509.shtml
   */
  getVideoJSON: function(fmt) {
    log('getVideoJSON() --');
    log('fmt: ', fmt);
    var pref = 'http://hot.vrs.sohu.com/vrs_flash.action',
        url = '',
        that = this;

    // If vid is unset, just return it.
    if (this[fmt].vid === 0) {
      return;
    }

    url = [
      pref, 
      '?vid=', this[fmt].vid,
      '&plid=', this.plid,
      '&out=0',
      '&g=8',
      '&referer=', this.referer,
      '&r=1',
      ].join('');
    log('url: ', url);

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);
        var i = 0;

        log(that);
        that.jobs -= 1;
        that[fmt].json = JSON.parse(response.responseText);
        //that.title = that[fmt].json.data.tvName;
        that[fmt].clipsURL = that[fmt].json.data.clipsURL;
        that[fmt].su = that[fmt].json.data.su;
        that.p1.vid = that[fmt].json.data.norVid;
        that.p2.vid = that[fmt].json.data.highVid;
        that.p3.vid = that[fmt].json.data.superVid;
        that.p4.vid = that[fmt].json.data.oriVid;
        that[fmt].ip = that[fmt].json.allot;
        that[fmt].reserveIp = that[fmt].json.reserveIp.split(';');
        for (i in that[fmt].clipsURL) {
          url = [
            'http://', that[fmt].ip,
            '/?prot=', that[fmt].clipsURL[i],
            '&new=', that[fmt].su[i],
            ].join('');
          that[fmt].videos.push(url);
        }

        if (fmt === 'p2') {
          if (that.p1.vid > 0) {
            that.jobs += 1;
            that.getVideoJSON('p1');
          }
          if (that.p3.vid > 0) {
            that.jobs += 1;
            that.getVideoJSON('p3');
          }
          if (that.p4.vid > 0) {
            that.jobs += 1;
            that.getVideoJSON('p4');
          }
        }

        // Display UI when all processes ended
        if (that.jobs === 0) {
          that.createUI();
        }
      },
    });
  },

  /**
   * Construct UI widgets
   */
  createUI: function() {
    log('createUI() --');
    log(this);
    var videos = {
          title: this.title,
          links: [],
          formats: [],
        },
        type,
        i;

    for (type in this.formats) {
      log('type: ', type);
      if (this[type].videos.length > 0) {
        videos.links.push(this[type].videos);
        videos.formats.push(this.formats[type]);
      }
    }
    if (videos.formats.length > 0) {
      multiFiles.run(videos);
    }
  },
};

monkey.run();


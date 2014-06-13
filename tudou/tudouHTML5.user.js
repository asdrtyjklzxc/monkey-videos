// ==UserScript==
// @name         tudouHTML5
// @description  Play Videos with html5 on tudou.com
// @include      http://www.tudou.com/albumplay/*
// @include      http://www.tudou.com/listplay/*
// @include      http://www.tudou.com/programs/view/*
// @version      2.2
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @license      GPLv3
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==


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
    console.log('multiFiles.run() --');
    this.videos = videos;
    if ((!videos.formats) || (videos.formats.length === 0)) {
      console.error('Error: no video formats specified!');
      return;
    }
    this.removeOldPanels();
    this.createPanel();
  },

  removeOldPanels: function() {
    console.log('removeOldPanels() --');
    var panels = unsafeWindow.document.querySelectorAll(
          '.monkey-videos-panel'),
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
    console.log('createPanel() --');
    var panel = unsafeWindow.document.createElement('div'),
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
    unsafeWindow.document.body.appendChild(panel);

    playlistWrap = unsafeWindow.document.createElement('div');
    playlistWrap.className = 'playlist-wrap';
    panel.appendChild(playlistWrap);

    div = unsafeWindow.document.createElement('div');
    div.className = 'playlist-nav';
    playlistWrap.appendChild(div);

    form = unsafeWindow.document.createElement('form');
    form.className = 'playlist-format';
    playlistWrap.appendChild(form);
    for (i = 0; i < this.videos.formats.length; i += 1) {
      label = unsafeWindow.document.createElement('label');
      form.appendChild(label);
      input = unsafeWindow.document.createElement('input');
      label.appendChild(input);
      input.type = 'radio';
      input.name = 'monkey-videos-format';
      span = unsafeWindow.document.createElement('span');
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
    a = unsafeWindow.document.createElement('a');
    a.className = 'playlist-m3u';
    a.innerHTML = '播放列表';
    a.title = a.innerHTML;
    a.download = this.videos.title + '.m3u';
    a.href = '';
    form.appendChild(a);

    div = unsafeWindow.document.createElement('div');
    div.className = 'playlist';
    playlistWrap.appendChild(div);

    playlistToggle = unsafeWindow.document.createElement('div');
    playlistToggle.id = 'playlist-toggle';
    playlistToggle.title = '隐藏';
    playlistToggle.className = 'playlist-show';
    panel.appendChild(playlistToggle);
    playlistToggle.addEventListener('click', function(event) {
      var wrap = unsafeWindow.document.querySelector(
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

    this.loadDefault();
  },

  loadDefault: function() {
    console.log('loadDefault() --');
    // Load default type of playlist.
    var currPos = GM_getValue('format', 0),
        formats = this.videos.formats,
        currPlaylist;

    console.log('currPos: ', currPos);
    if (formats.length <= currPos) {
      currPos = formats.length - 1;
    }
    console.log('currPos: ', currPos);

    currPlaylist = unsafeWindow.document.querySelectorAll(
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
    console.log('modifyList(), pos = ', pos);
    var playlist = unsafeWindow.document.querySelector(
          '.monkey-videos-panel .playlist'),
        url,
        a,
        i;
    
    // Clear its content first
    playlist.innerHTML = '';

    for (i = 0; url = this.videos.links[pos][i]; i += 1) {
      a = unsafeWindow.document.createElement('a');
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
    unsafeWindow.document.querySelector(
      '.playlist-m3u').href = this.plsDataScheme();
  },

  /**
   * Generate Playlist using base64 and Data URI scheme.
   * So that we can download directly and same it as a pls file using HTML.
   * URL:http://en.wikipedia.org/wiki/Data_URI_scheme
   * @return string
   *  - Data scheme containting playlist.
   */
  plsDataScheme: function() {
    console.log('plsDataSchema() --');
    return 'data:audio/x-m3u;charset=UTF-8;base64,' +
      base64.encode(this.generatePls());
  },

  /**
   * Generate pls - a multimedia playlist file, like m3u.
   * @return string
   * - playlist content.
   */
  generatePls: function() {
    console.log('generatePls() --');
    var output = [],
        links = unsafeWindow.document.querySelectorAll(
            '.monkey-videos-panel .playlist-item'),
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
    var style = unsafeWindow.document.createElement('style');
    if (unsafeWindow.document.head) {
      unsafeWindow.document.head.appendChild(style);
      style.innerHTML = styleText;
    }
  },
};


var monkey = {

  url:'',   // document.location.href
  title: '',
  iid: '',
  vcode: '',
  segs: {},
  totalJobs: 0,
  formats: {
    2: '240P',       // 流畅
    3: '360P',       // 清晰
    4: '480P',       // 高清
    5: '720P',       // 超清
    52: '240P(mp4)',
    53: '360P(mp4)',
    54: '480P(mp4)',
    99: '原画质'     // 原画质
  },
  links: {
  },

  run: function() {
    console.log('run() --');
    this.router();
  },

  /**
   * Page router control
   */
  router: function() {
    console.log('router() --');
    var scripts = unsafeWindow.document.querySelectorAll('script'),
        script,
        titleReg = /kw:\s*['"]([^'"]+)['"]/,
        titleMatch,
        iidReg = /iid\s*[:=]\s*(\d+)/,
        iidMatch,
        vcodeReg = /vcode: '([^']+)'/,
        vcodeMatch,
        i;

    for (i = 0; script = scripts[i]; i += 1) {
      if (this.vcode.length === 0) {
        vcodeMatch = vcodeReg.exec(script.innerHTML);
        console.log('vcodeMatch:', vcodeMatch);
        if (vcodeMatch && vcodeMatch.length > 1) {
          this.vcode = vcodeMatch[1];
          this.redirectToYouku();
          return;
        }
      }

      if (this.title.length === 0) {
        titleMatch = titleReg.exec(script.innerHTML);
        console.log('titleMatch:', titleMatch);
        if (titleMatch) {
          this.title = titleMatch[1];
        }
      }

      if (this.iid.length === 0) {
        iidMatch = iidReg.exec(script.innerHTML);
        console.log('iidMatch:', iidMatch);
        if (iidMatch) {
          this.iid = iidMatch[1];
          this.getByIid();
          return;
        }
      }
    }
    //this.getPlayList();
  },

  /**
   * Get video info by vid
   */
  getByIid: function() {
    console.log('getByIid()');
    console.log(this);

    var that = this,
        url = 'http://www.tudou.com/outplay/goto/getItemSegs.action?iid=' +
            this.iid;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        console.log('respone:', response);
        that.segs = JSON.parse(response.responseText);
        that.getAllVideos();
      },
    });
  },

//  getPlayList: function() {
//    console.log('getPlayList()');
//    console.log(this);
//  },

  /**
   * Get all video links
   */
  getAllVideos: function() {
    console.log('getAllVideos() --');
    console.log(this);
    var key,
        videos,
        video,
        i;

    for (key in this.segs) {
      videos = this.segs[key];
      for (i = 0; video = videos[i]; i += 1) {
        console.log(key, video);
        this.links[key] = [];
        this.totalJobs += 1;
        this.getVideoUrl(key, video['k'], video['no']);
      }
    }
  },


  /**
   * Get video url
   */
  getVideoUrl: function(key, k, num) {
    console.log('getVideoUrl() --');
    var url = 'http://ct.v2.tudou.com/f?id=' + k,
        that = this;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) { 
        console.log('response:', response);
        var reg = /<f[^>]+>([^<]+)</,
            match = reg.exec(response.responseText);

        if (match && match.length > 1) {
          that.links[key][num] = match[1];
          that.totalJobs -= 1;
          if (that.totalJobs === 0) {
            that.createUI();
          }
        }
      },
    });
  },

  /**
   * Redirect url to youku.com.
   * Because tudou.com use youku.com as video source on /albumplay/ page.
   */
  redirectToYouku: function() {
    var url = 'http://v.youku.com/v_show/id_' + this.vcode + '.html';
    this.redirect(url);
  },

  /**
   * Construct UI widgets
   */
  createUI: function() {
    console.log('createUI()');
    console.log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
        },
        type,
        i;

    for (type in this.links) {
      videos.links.push(this.links[type]);
      videos.formats.push(this.formats[type]);
    }

    console.log('videos: ', videos);
    multiFiles.run(videos);
  },

  /**
   * Convert string to xml
   * @param string str
   *  - the string to be converted.
   * @return object xml
   *  - the converted xml object.
   */
  parseXML: function(str) {
    if (unsafeWindow.document.implementation &&
        unsafeWindow.document.implementation.createDocument) {
      xmlDoc = (new unsafeWindow.DOMParser()).parseFromString(str, 'text/xml');
    } else {
      console.error('parseXML() error: not support current web browser!');
      return null;
    }
    return xmlDoc;
  },

  /**
   * Redirect window location.
   */
  redirect: function(url) {
    unsafeWindow.location = url;
  },
};

monkey.run();


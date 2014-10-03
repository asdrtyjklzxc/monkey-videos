// ==UserScript==
// @name         pptvHTML5
// @description  Play videos with html5 on pptv.com
// @include      http://v.pptv.com/*
// @version      2.2
// @license      GPLv3
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
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
    var panels = document.querySelectorAll('.monkey-videos-panel'),
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
    var panel = document.createElement('div'),
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
    document.body.appendChild(panel);

    playlistWrap = document.createElement('div');
    playlistWrap.className = 'playlist-wrap';
    panel.appendChild(playlistWrap);

    div = document.createElement('div');
    div.className = 'playlist-nav';
    playlistWrap.appendChild(div);

    form = document.createElement('form');
    form.className = 'playlist-format';
    playlistWrap.appendChild(form);
    for (i = 0; i < this.videos.formats.length; i += 1) {
      label = document.createElement('label');
      form.appendChild(label);
      input = document.createElement('input');
      label.appendChild(input);
      input.type = 'radio';
      input.name = 'monkey-videos-format';
      span = document.createElement('span');
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
    a = document.createElement('a');
    a.className = 'playlist-m3u';
    a.innerHTML = '播放列表';
    a.title = a.innerHTML;
    a.download = this.videos.title + '.m3u';
    a.href = '';
    form.appendChild(a);

    div = document.createElement('div');
    div.className = 'playlist';
    playlistWrap.appendChild(div);

    playlistToggle = document.createElement('div');
    playlistToggle.id = 'playlist-toggle';
    playlistToggle.title = '隐藏';
    playlistToggle.className = 'playlist-show';
    panel.appendChild(playlistToggle);
    playlistToggle.addEventListener('click', function(event) {
      var wrap = document.querySelector('.monkey-videos-panel .playlist-wrap');
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

    currPlaylist = document.querySelectorAll(
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
    var playlist = document.querySelector('.monkey-videos-panel .playlist'),
        url,
        a,
        i;
    
    // Clear its content first
    playlist.innerHTML = '';

    for (i = 0; url = this.videos.links[pos][i]; i += 1) {
      a = document.createElement('a');
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
    document.querySelector('.playlist-m3u').href = this.plsDataScheme();
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
        links = document.querySelectorAll('.monkey-videos-panel .playlist-item'),
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
    var style = document.createElement('style');
    if (document.head) {
      document.head.appendChild(style);
      style.innerHTML = styleText;
    }
  },
};


var monkey = {
  id: '',        // 存放页面id;
  jobs: 0,

  title: '',     // 标题;
  formats: {0: '标清', 1: '高清', 2: '起清'},
  videos: {0: [], 1: [], 2: []},

  run: function() {
    console.log('run()--');
    this.getId();
  },

  /**
   * Get video id
   */
  getId: function() {
    console.log('getId()--');
    var scripts = document.querySelectorAll('script'),
        script,
        reg = /"id":(\d+),/,
        i,
        match,
        id;

    for (i = 0; script = scripts[i]; i += 1) {
      match = reg.exec(script.innerHTML);
      if (match && match.length > 1) {
        this.id= match[1];
        break;
      }
    }

    if (this.id.length > 0) {
      this.jobs = this.jobs + 1;
      this.getPlaylistUrl(0);

      this.jobs = this.jobs + 1;
      this.getPlaylistUrl(1);

      this.jobs = this.jobs + 1;
      this.getPlaylistUrl(2);
    } else {
      console.error('Failed to get video id');
    }
  },

  /**
   * Get video playlist
   * 标清http://web-play.pptv.com/webplay3-0-16840115.xml?type=web.fpp&ft=0
   * 高清http://web-play.pptv.com/webplay3-0-16840115.xml?type=web.fpp&ft=1
   */
  getPlaylistUrl: function(format) {
    console.log('getPlaylistUrl() --');
    var pref = 'http://web-play.pptv.com/webplay3-0-',
        that = this,
        url = pref + this.id + '.xml?type=web.fpp&ft=' + format;

    console.log('url:', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        that.createPlaylist(format, response.responseText);
      },
    });
  },

  createPlaylist: function(format, txt) {
    console.log('createPlaylist() --', format);
    console.log(this);
    var 
        xml = this.parseXML(txt),
        channel = xml.querySelector('channel'),
        items = channel.querySelectorAll('file item'),
        rid = channel.getAttribute('rid'),
        sgms = xml.querySelectorAll('dragdata sgm'),
        server = xml.querySelector('dt sh').innerHTML,
        k = xml.querySelector('dt key').innerHTML,
        st = xml.querySelector('st').innerHTML,
        key = this.constructKey(st),
        i;

    this.title = channel.getAttribute('nm');
    if (format < items.length) {
      for (i = 0; i < sgms.length; i += 1) {
        this.videos[format].push([
          'http://', server, '/', i, '/', rid,
          '?key=', key,
          '&k=', k,
          '&type=web.fpp',
          ].join(''));
      }
    }

    this.jobs = this.jobs - 1;
    if (this.jobs === 0) {
      this.createUI();
    }
  },

  constructKey:  function(arg) {
    var MAX_INT32 = Math.pow(2, 32);

    function str2hex(s) {
      var r = '',
          i,
          t;

      for (i = 0; i < 8; i += 1) {
        t = String.charCodeAt(s[i]).toString(16);
        if (t.length === 1) {
            t = "0" + t;
        }
        r += t;
      }
      for (i = 0; i < 16; i += 1) {
        r += parseInt(15 * Math.random()).toString(16);
      }
      return r;
    }

    function getkey(s) {
      return 1896220160;
    }

    /**
     * XOR of two positive integers.
     * ^ operator in js might be overflow
     */
    function xor(a, b) {
      var sa = a.toString(2).split('').reverse(),
          sb = b.toString(2).split('').reverse(),
          arr_b,
          arr_s,
          length,
          i,
          result = [];
      if (a > b) {
        arr_b = sa;
        arr_s = sb;
      } else {
        arr_b = sb;
        arr_s = sa;
      }
      length = arr_s.length;
      for (i = 0; i < length; i += 1) {
        if (arr_s[i] == arr_b[i]) {
          result.push('0');
        } else {
          result.push('1');
        }
      }
      result = result.concat(arr_b.slice(length));
      return parseInt(result.reverse().join(''), 2);
    }

    function rot(k, b) {
      if (k >= 0) {
        //return k >> b;
        return Math.floor(k / Math.pow(2, b));
      } else {
        return (MAX_INT32 + k) >> b;
      }
    }

    function lot(k, b) {
      return k * Math.pow(2, b) % MAX_INT32;
    }

    function ord(c) {
      return String.charCodeAt(c);
    }

    function chr(n) {
      return String.fromCharCode(n);
    }

    function encrypt(arg1, arg2) {
      var delta = 2654435769,
          l3 = 16,
          l4 = 1896220160,
          l8 = arg1.split(''),
          l10 = l4,
          l9 = arg2.split(''),
          l5 = 101056625,
          l6 = 100692230,
          l7 = 7407110,
          l11 = [],
          l12 = 0,
          l13 = ord(l8[l12]) << 0,
          l14 = ord(l8[l12 + 1]) << 8,
          l15 = ord(l8[l12 + 2]) << 16,
          l16 = ord(l8[l12 + 3]) << 24,
          l17 = ord(l8[l12 + 4]) << 0,
          l18 = ord(l8[l12 + 5]) << 8,
          l19 = ord(l8[l12 + 6]) << 16,
          l20 = ord(l8[l12 + 7]) << 24,
          l21 = (((0 | l13)| l14) | l15) | l16,
          l22 = (((0 | l17)| l18) | l19) | l20,
          l23 = 0,
          l24 = 0;

      while (l24 < 32) {
        l23 = (l23 + delta) % MAX_INT32;
        l33 = (lot(l22, 4) + l4) % MAX_INT32;
        l34 = (l22 + l23) % MAX_INT32;
        l35 = (rot(l22, 5) + l5) % MAX_INT32;
        l36 = xor(xor(l33, l34), l35);
        l21 = (l21 + l36) % MAX_INT32;
        l37 = (lot(l21, 4) + l6) % MAX_INT32;
        l38 = (l21 + l23) % MAX_INT32;
        l39 = (rot(l21, 5)) % MAX_INT32;
        l40 = (l39 + l7) % MAX_INT32;
        l41 = xor(xor(l37, l38) % MAX_INT32, l40) % MAX_INT32;
        l22 = (l22 + l41) % MAX_INT32;

        l24 += 1;
      }

      l11.push(chr(rot(l21, 0) & 0xff));
      l11.push(chr(rot(l21, 8) & 0xff));
      l11.push(chr(rot(l21, 16) & 0xff));
      l11.push(chr(rot(l21, 24) & 0xff));
      l11.push(chr(rot(l22, 0) & 0xff));
      l11.push(chr(rot(l22, 8) & 0xff));
      l11.push(chr(rot(l22, 16) & 0xff));
      l11.push(chr(rot(l22, 24) & 0xff));
      return l11;
    }

    arg = arg.replace(' UTC', '');
    arg = Date.parse(arg) / 1000 - 60;
    arg = arg.toString(16);
    var loc1 = arg + Array(16 - arg.length + 1).join('\x00'),
        SERVER_KEY = 'qqqqqww' + Array(9).join('\x00'),
        res = encrypt(loc1, SERVER_KEY);
    return str2hex(res);
  },


  createUI: function() {
    console.log('createUI() --');
    console.log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
        },
        format;

    for (format in this.formats) {
      if (this.videos[format].length > 0) {
        videos.formats.push(this.formats[format]);
        videos.links.push(this.videos[format]);
      }
    }
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
      xmlDoc = new DOMParser().parseFromString(str, 'text/xml');
    } else {
      console.log('parseXML() error: not support current web browser!');
      return null;
    }
    return xmlDoc;
  },
};


monkey.run();

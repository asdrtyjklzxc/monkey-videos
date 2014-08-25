// ==UserScript==
// @name         youkuHTML5
// @description  Play Videos with html5 on youku.com
// @include      http://v.youku.com/v_show/id_*
// @include      http://v.youku.com/v_playlist/*
// @version      2.5
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

/**
 * monkey object.
 *
 * get video links for youku.com
 */
var monkey = {
  // store xhr result, with json format
  json: null,

  // store video formats and its urls
  formats: {
    'flv': [],
    'flvhd': [],
    'mp4': [],
    'hd2': [],
    'hd3': [],
  },

  stream_types: [
      {id: 'hd3', container: 'flv', name: '1080P', size: 0},
      {id: 'hd2', container: 'flv', name: '超清', size: 0},
      {id: 'mp4', container: 'mp4', name: '高清', size: 0},
      {id: 'flvhd', container: 'flv', name: '高清', size: 0},
      {id: 'flv', container: 'flv', name: '标清', size: 0},
      {id: '3gphd', container: '3gp', name: '高清(3GP)', size: 0}
  ],

  // video title
  title: '',
  // store video id
  videoId: '',

  ep: '',
  ip: '',

  run: function() {
    this.getVideoId();
  },

  /**
   * Get video id, and stored in yk.videoId.
   *
   * Page url for playing page almost like this:
   *   http://v.youku.com/v_show/id_XMjY1OTk1ODY0.html
   *   http://v.youku.com/v_playlist/f17273995o1p0.html
   */
  getVideoId: function() {
    console.log('getVideoId() --');
    var url = location.href,
        idReg = /(?:id_)(.*)(?:.html)/, 
        idMatch = idReg.exec(url),
        idReg2 = /(?:v_playlist\/f)(.*)(?:o1p\d.html)/,
        idMatch2 = idReg2.exec(url);

    console.log('idMatch: ', idMatch);
    console.log('idMatch2: ', idMatch2);
    if (idMatch && idMatch.length === 2) {
      this.videoId = idMatch[1];
      this.getPlayListMeta();
    } else if (idMatch2 && idMatch2.length === 2) {
      this.videoId = idMatch2[1];
      this.getPlayListMeta();
    } else {
      error('Failed to get video id!');
    }
  },

  /**
   * Get metadata of video playlist
   */
  getPlayListMeta: function() {
    console.log('getPlaylistMeta() --');
    var url = [
          'http://v.youku.com/player/getPlayList/VideoIDS/',
          this.videoId,
          '/Pf/4/ctype/12/ev/1'
        ].join(''),
        that = this;

    console.log('url:', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        console.log('response:', response);
        var json = JSON.parse(response.responseText),
            meta,
            stream_type,
            stream_id,
            i;
        console.log('json:', json);
        if (json.data.length === 0) {
          console.error('Error: video not found!');
          return;
        }
        meta = json.data[0];
        that.title = meta.title;
        that.ep = meta.ep;
        that.ip = meta.ip;
        for (i = 0; stream_type = that.stream_types[i]; i = i + 1) {
          stream_id = stream_type.id;
          if (stream_id in meta.streamsizes) {
            that.stream_types[i].size = parseInt(meta.streamsizes[stream_id]);
            that.getM3U8(stream_id);
          }
        }
      }
    });
  },

  getM3U8: function(stream_id) {
    console.log('getM3U8() --', stream_id);
    var [new_ep, sid, token] = this.generate_ep(this.videoId, this.ep); 
    var url = [
          'http://pl.youku.com/playlist/m3u8?',
          'ctype=12',
          '&ep=', new_ep,
          '&ev=1&keyframe=1',
          '&oip=', this.ip,
          '&sid=', sid,
          '&token=', token,
          '&ts=', parseInt((new Date()).getTime() / 1000),
          '&type=', stream_id,
          '&vid=', this.vedioId,
          '&password=',
        ].join('');

    console.log('url:', url);
  },

  generate_ep: function(vid, ep) {
    console.log('generate_ep() --');
    var f_code_1 = 'becaf9be',
        f_code_2 = 'bf7e5f01';

    function trans_e(a, c) {
      var f = 0,
          h = 0,
          b = new Array(256),
          i,
          q = 0,
          tmp,
          result = '';

      for (i = 0; i < 256; i = i + 1) {
        b[i] = i;
      }

      while (h < 256) {
        //f = (f + b[h] + a[h % a.length].charCodeAt(0)) % 256; 
        f = (f + b[h] + a.charCodeAt(h % a.length)) % 256; 
        tmp = b[f];
        b[f] = b[h];
        b[h] = tmp;
        h = h + 1
      }

      h = 0;
      f = 0;
      while (q < c.length) {
        h = (h + 1) % 256;
        f = (f + b[h]) % 256;
        tmp = b[f];
        b[f] = b[h];
        b[h] = tmp;
        if (typeof c[q] === 'number') {
          result += String.fromCharCode(c[q] ^ b[(b[h] + b[f]) % 256])
        } else {
          result += String.fromCharCode((c[q]).charCodeAt() ^ b[(b[h] + b[f]) % 256])
        }
        q += 1
      }
      return result
    }

    var e_code = trans_e(f_code_1, base64.decode(ep));
    var [sid, token] = e_code.split('_');
    var new_ep = trans_e(f_code_2, [sid, vid, token].join('_'));
    return [base64.encode(new_ep), sid, token];
  },

  /**
   * Get video playlist.
   */
  getPlayList: function() {
    console.log('getPlayList() --');
    var url = 'http://v.youku.com/player/getPlayList/VideoIDS/' +
          this.videoId,
        that = this;
    
    console.log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        console.log('response:', response);
        that.json = JSON.parse(response.responseText);
        if (that.json) {
          that.decodeURL();
        }
      },
    });
  },


  /**
   * Decrypted the video link from json object.
   */
  decodeURL: function() {
    console.log('decodeURL() --');
    var urlPrefix = 'http://f.youku.com/player/getFlvPath/sid/00_00/st/',
        url,
        title,
        fileId,
        format,
        formats = [],
        json,
        tmp,
        i,
        j;
    
    json = this.json.data[0];
    // 设定视频的标题;
    this.title = json.title;
    // 检测可用的格式;
    if (json.segs.flv && json.segs.flv.length) {
      formats.push('flv');
    }

    if (json.segs.mp4 && json.segs.mp4.length) {
      formats.push('mp4');
    }

    if (json.segs.hd2 && json.segs.hd2.length) {
      formats.push('hd2');
    }

    if (json.segs.hd3 && json.segs.hd3.length) {
      formats.push('hd3');
    }

    for (i = 0; format = formats[i]; i += 1) {
      fileId = this.getFileId(json.seed, json.streamfileids[format]);
      for (j = 0; j < json.segs[format].length; j += 1) {
        // 修正了编码问题, 应该用十六进制的序号;
        if (j < 16) {
          fileId = fileId.slice(0, 9) + j.toString(16).toUpperCase() + 
                   fileId.slice(10);
        } else {
          fileId = fileId.slice(0, 8) + j.toString(16).toUpperCase() + 
                   fileId.slice(10);
        }
        // 修正hd2|hd3的格式命名问题;
        tmp = format;
        if (tmp === 'hd2' || tmp == 'hd3') {
          tmp = 'flv';
        }
        url = [
            urlPrefix,
            tmp,
            '/fileid/',
            fileId,
            '?K=',
            json.segs[format][j].k,
            ',k2:',
            json.segs[format][j].k2
            ].join('');

        this.formats[format][j] = url;
      }
    }
    // 调用UI函数;
    this.createUI();
  },

  /**
   * Get file id of each video file.
   *
   * @param string seed
   *  - the file seed number.
   * @param string fileId
   *  - file Id.
   * @return string
   *  - return decrypted file id.
   */
  getFileId: function(seed, fileId) {
    console.log('getFileId() --');
    function getFileIdMixed(seed) {
      var mixed = [],
          source = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP' +
            'QRSTUVWXYZ/\\:._-1234567890',
          len = source.length,
          index,
          i;
    
      for (i = 0; i < len; i += 1) {
          seed = (seed * 211 + 30031) % 65536;
          index = Math.floor(seed / 65536 * source.length);
          mixed.push(source.charAt(index));
          source = source.replace(source.charAt(index), '');
      }
      return mixed;
    }

    var mixed = getFileIdMixed(seed),
        ids = fileId.split('\*'),
        len = ids.length - 1,
        realId = '',
        idx,
        i;

    for (i = 0; i < len; i += 1) {
      idx = parseInt(ids[i]);
      realId += mixed[idx];
    }
    return realId;
  },

  /**
   * Timestamp
   */
  getSid: function() {
    return String((new Date()).getTime()) + '01';
  },

  /**
   * Decryption
   */
  yk_d: function(s) {
    var len = s.length,
        i = 0,
        result = [],
        e = 0,
        g = 0,
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    if (len === 0) {
      return '';
    }

    while (i < len) {
      e = s.charCodeAt(i) & 255;
      i = i + 1;
      if (i === len) {
        result.push(chars.charAt(e >> 2));
        result.push(chars.charAt((e & 3) << 4));
        result.push('==');
        break
      }
      g = s.charCodeAt(i);
      i = i + 1;
      if (i === len) {
        result.push(chars.charAt(e >> 2));
      }
    }

  },


  /**
   * construct video data and create UI widgets.
   */
  createUI: function() {
    console.log('createUI() --');
    var videos = {
          title: this.title,
          formats: [],
          links: [],
        },
        types = {
          flv: '标清',
          flvhd: '高清Flv',
          mp4: '高清',
          hd2: '超清',
          hd3: '1080P'
        },
        type;

    for (type in types) {
      if (this.formats[type].length > 0) {
        videos.formats.push(types[type]);
        videos.links.push(this.formats[type]);
      }
    }

    multiFiles.run(videos);
  },
};

monkey.run();



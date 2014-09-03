/**
 * monkey object.
 *
 * get video links for youku.com
 */
var monkey = {
  // store xhr result, with json format
  rs: null,
  brs: null,

  // store video formats and its urls
  data: null,
  title: '',
  videoId: '',

  run: function() {
    console.log('run() --');
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
    var url = 'http://v.youku.com/player/getPlayList/VideoIDS/' + this.videoId,
        url2 = url + '/Pf/4/ctype/12/ev/1',
        that = this;

    console.log('url2:', url2);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url2,
      onload: function(response) {
        var json = JSON.parse(response.responseText);
        if (json.data.length === 0) {
          console.error('Error: video not found!');
          return;
        }
        that.rs = json.data[0];
        that.title = that.rs.title;
        that.parseVideo();
      }
    });

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        var json = JSON.parse(response.responseText);
        if (json.data.length === 0) {
          console.error('Error: video not found!');
          return;
        }
        that.brs = json.data[0];
        that.parseVideo();
      }
    });
  },

  parseVideo: function() {
    console.log('parseVideo() --');
    if (! this.rs || ! this.brs) {
      return;
    }

    var streamtypes = this.rs.streamtypes,
        streamfileids = this.rs.streamfileids,
        data = {},
        seed = this.rs.seed,
        segs = this.rs.segs,
        key,
        value,
        k,
        v,
        ip = this.rs.ip,
        bsegs = this.brs.segs,
        sid,
        token,
        i,
        k,
        number,
        fileId0,
        fileId,
        ep,
        pass1 = 'becaf9be',
        pass2 = 'bf7e5f01',
        typeArray = {
          'flv': 'flv', 'mp4': 'mp4', 'hd2': 'flv', '3gphd': 'mp4',
          '3gp': 'flv', 'hd3': 'flv'
          },
        sharpness = {
          'flv': 'normal', 'flvhd': 'normal', 'mp4': 'high',
          'hd2': 'super', '3gphd': 'high', '3g': 'normal',
          'hd3': 'original'
        },
        filetype;

    [sid, token] = this.yk_e(pass1, this.yk_na(this.rs.ep)).split('_');
    
    for (key in segs) {
      value = segs[key];
      if (streamtypes.indexOf(key) > -1) {
        for (i in value) {
          v = value[i];
          number = parseInt(v.no, 10).toString(16).toUpperCase();
          if (number.length === 1) {
            number = '0'.concat(number);
          }
          // 构建视频地址K值
          k = v.k;
          if (!k || k === -1) {
            console.log(bsegs, bsegs[key], bsegs[key][i]);
            k = bsegs[key][i]['k'];
          }
          fileId0 = this.getFileId(streamfileids[key], seed);
          fileId = fileId0.substr(0, 8) + number + fileId0.substr(10);
          ep = encodeURIComponent(this.yk_d(
                this.yk_e(pass2, [sid, fileId, token].join('_'))));

          // 判断后缀类型, 获得后缀
          filetype = typeArray[key];
          data[key] = data[key] || [];
          data[key].push([
            'http://k.youku.com/player/getFlvPath/sid/', sid,
            '_00/st/', filetype,
            '/fileid/', fileId,
            '?K=', k,
            '&ctype=12&ev=1&token=', token,
            '&oip=', ip,
            '&ep=', ep,
            ].join(''));
        }
      }
    }
    this.data = data;
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
  getFileId: function(fileId, seed) {
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
        h,
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
        result.push(chars.charAt((e & 3) << 4 | (g & 240) >> 4));
        result.push(chars.charAt((g & 15) << 2));
        result.push('=');
        break
      }
      h = s.charCodeAt(i);
      i = i + 1;
      result.push(chars.charAt(e >> 2));
      result.push(chars.charAt((e & 3) << 4 | (g & 240) >> 4));
      result.push(chars.charAt((g & 15) << 2 | (h & 192) >> 6));
      result.push(chars.charAt(h & 63));
    }
    return result.join('');
  },

  yk_na: function(a) {
    if (! a) {
      return '';
    }

    var h = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,62,-1,-1,-1,63,52,53,54,55,56,57,58,59,60,61,-1,-1,-1,-1,-1,-1,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,-1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,-1,-1,-1,-1,-1],
        i = a.length,
        e = [],
        f = 0,
        b,
        c;

    while (f < i) {
      do {
        c = h[a.charCodeAt(f++) & 255];
      } while (f < i && c === -1);
      if (c === -1) {
        break;
      }

      do {
        b = h[a.charCodeAt(f++) & 255];
      } while (f < i && b === -1);
      if (b === -1) {
        break;
      }
      e.push(String.fromCharCode(c << 2 | (b & 48) >> 4));

      do {
        c = a.charCodeAt(f++) & 255;
        if (c === 61) {
          return e.join('');
        }
        c = h[c];
      } while (f < i && c === -1);
      if (c === -1) {
        break;
      }
      e.push(String.fromCharCode((b & 15) << 4 | (c & 60) >> 2));

      do {
        b = a.charCodeAt(f) & 255;
        f = f + 1;
        if (b === 61) {
          return e.join('');
        }
        b = h[b];
      } while (f < i && b === -1);
      if (b === -1) {
        break;
      }
      e.push(String.fromCharCode((c & 3) << 6 | b));
    }

    return e.join('');
  },

  yk_e: function(a, c) {
    var f = 0,
        i = '',
        e = [],
        q = 0,
        h = 0,
        b = {};
    for (h = 0; h < 256; h = h + 1) {
      b[h] = h;
    }
    for (h = 0; h < 256; h = h + 1) {
      f = ((f + b[h]) + a.charCodeAt(h % a.length)) % 256;
      i = b[h];
      b[h] = b[f];
      b[f] = i;
    }
    for (q = 0, f = 0, h = 0; q < c.length; q = q + 1) {
      h = (h + 1) % 256;
      f = (f + b[h]) % 256;
      i = b[h];
      b[h] = b[f];
      b[f] = i;
      e.push(String.fromCharCode(c.charCodeAt(q) ^ b[(b[h] + b[f]) % 256]));
    }
    return e.join('');
  },

  /**
   * construct video data and create UI widgets.
   */
  createUI: function() {
    console.log('createUI() --');
    console.log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
        },
        types = {
          '3gp': '3G',
          '3gphd': '3G高清',
          flv: '标清',
          flvhd: '高清Flv',
          mp4: '高清',
          hd2: '超清',
          hd3: '1080P',
        },
        type;

    for(type in types) {
      if (type in this.data) {
        videos.formats.push(types[type]);
        videos.links.push(this.data[type]);
      }
    }

    multiFiles.run(videos);
  },
};

monkey.run();

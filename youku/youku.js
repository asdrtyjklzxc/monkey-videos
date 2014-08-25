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
    var url = 'http://v.youku.com/player/getPlayList/VideoIDS/' + this.videoId,
        url2 = url + '/Pf/4/ctype/12/ev/1',
        that = this;

    console.log('url2:', url2);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url2,
      onload: function(response) {
        console.log('response:', response);
        var json = JSON.parse(response.responseText);
        console.log('json:', json);
        if (json.data.length === 0) {
          console.error('Error: video not found!');
          return;
        }
        that.rs = json.data[0];
        that.title = that.rs.title;
        that.parseVideo();
    });

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        console.log('response:', response);
        var json = JSON.parse(response.responseText);
        console.log('json:', json);
        if (json.data.length === 0) {
          console.error('Error: video not found!');
          return;
        }
        that.brs = json.data[0];
        that.parseVideo();
    });
  },

  parseVideo: function() {
    console.log('parseVideo() --');
    if (! this.brs || ! this.rs) {
      return;
    }
    var streamtypes = this.rs.streamtypes,  // 清晰度
        streamfileids = this.rs.streamfileids,
        seed = this.rs.seed,
        segs = this.rs.segs,
        ip = this.rs.ip,
        bsegs = this.brs.segs,
        [sid, token] = this.yk_e('becaf9be', this.yk_na(this.rs.ep)),
        seg,
        ep,
        val,
        key,
        k,
        k2,
        num,
        fileId,
        filetypes = {
          'flv': 'normal',
          '
        },
        filetype;

        for (key in meta.segs) {
          if (key in meta.streamtypes) {
            val = meta.segs[key];
            for (k in val) {
              // 转为16进制, num 为每段视频的序号
              num = parseInt(val[k].no).toString(16);
              if (num.length === 1) {
                num = '0' + num;
              }

              // 构建视频地址的K值
              k2 = val.k;
              if (!k2 || k2 === '' || k2 === '-1') {
                k2 = bsegs[key][k].k;
              }

              fileId = this.getFileId(streamfileids[key], seed);
              // 修正了编码问题, 应该用十六进制的序号;
              fileId = fileId.slice(0, 8) + num + fileId.slice(10);
//              if (j < 16) {
//                fileId = fileId.slice(0, 9) + j.toString(16).toUpperCase() + 
//                         fileId.slice(10);
//              } else {
//                fileId = fileId.slice(0, 8) + j.toString(16).toUpperCase() + 
//                         fileId.slice(10);
//              }
                ep = encodeURI(
                    this.yk_d(
                      this.yk_e('bf7e5f01', sid + '_' + fileId + '_'),
                      token));
                // 根据后缀, 确定清析度
                filetype = filetypes[key];
            }
          }
        }
      }
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

      fileId = this.getFileId(json.seed, json.streamfileids[format]);
      for (j = 0; j < json.segs[format].length; j += 1) {
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



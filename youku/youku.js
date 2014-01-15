
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
    'mp4': [],
    'hd2': [],
  },

  // video title
  title: '',
  // store video id
  videoId: '',

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
    log('getVideoId() --');
    var url = uw.location.href,
        idReg = /(?:id_)(.*)(?:.html)/, 
        idMatch = idReg.exec(url),
        idReg2 = /(?:v_playlist\/f)(.*)(?:o1p\d.html)/,
        idMatch2 = idReg2.exec(url);

    log('idMatch: ', idMatch);
    log('idMatch2: ', idMatch2);
    if (idMatch && idMatch.length === 2) {
      this.videoId = idMatch[1];
      this.getPlayList();
    } else if (idMatch2 && idMatch2.length === 2) {
      this.videoId = idMatch2[1];
      this.getPlayList();
    } else {
      error('Failed to get video id!');
    }
  },

  /**
   * Get video playlist.
   */
  getPlayList: function() {
    log('getPlayList() --');
    var url = 'http://v.youku.com/player/getPlayList/VideoIDS/' +
          this.videoId,
        that = this;
    
    log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response:', response);
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
    log('decodeURL() --');
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
        // 修正hd2的格式命名问题;
        tmp = format;
        if (tmp === 'hd2') {
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
   * This function is the key to decode youku video source.
   * @param string seed
   *  - the file seed number.
   * @param string fileId
   *  - file Id.
   * @return string
   *  - return decrypted file id.
   */
  getFileId: function(seed, fileId) {
    log('getFileId() --');
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
   * construct video data and create UI widgets.
   */
  createUI: function() {
    log('createUI() --');
    var videos = {
          title: this.title,
          formats: [],
          links: [],
        };

    if (this.formats.flv.length > 0) {
      videos.formats.push('标清');
      videos.links.push(this.formats.flv);
    }
    if (this.formats.mp4.length > 0) {
      videos.formats.push('高清');
      videos.links.push(this.formats.mp4);
    }
    if (this.formats.hd2.length > 0) {
      videos.formats.push('超清');
      videos.links.push(this.formats.hd2);
    }

    multiFiles.run(videos);
  },
};

monkey.run();


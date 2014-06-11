
/**
 * monkey object.
 *
 * get video links for youku.com
 */
var monkey = {
  // store xhr result, with json format
  json: null,

  // store video formats and its urls
  videos: {
    'flv': [],
    'mp4': [],
    'hd2': [],
  },

  // video title
  title: '',
  // store video id
  videoId: '',
  // background jobs
  jobs: 0,

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
    var url = unsafeWindow.location.href,
        idReg = /(?:id_)(.*)(?:.html)/, 
        idMatch = idReg.exec(url),
        idReg2 = /(?:v_playlist\/f)(.*)(?:o1p\d.html)/,
        idMatch2 = idReg2.exec(url);

    console.log('idMatch: ', idMatch);
    console.log('idMatch2: ', idMatch2);
    if (idMatch && idMatch.length === 2) {
      this.videoId = idMatch[1];
      this.getPlayList();
    } else if (idMatch2 && idMatch2.length === 2) {
      this.videoId = idMatch2[1];
      this.getPlayList();
    } else {
      console.error('Failed to get video id!');
    }
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
        console.log('response:', response && response.finalUrl);
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
    var json = this.json.data[0];

    // 设定视频的标题;
    this.title = json.title;
    // 检测可用的格式;
    if (json.segs.flv && json.segs.flv.length) {
      this.jobs += 1;
      this.getM3U8('flv');
    }
    if (json.segs.mp4 && json.segs.mp4.length) {
      this.jobs += 1;
      this.getM3U8('mp4');
    }
    if (json.segs.hd2 && json.segs.hd2.length) {
      this.jobs += 1;
      this.getM3U8('hd2');
    }
  },

  /**
   * Get m3u8 playlist for specific video format.
   */
  getM3U8: function(format) {
    console.log('getM3U8() -- ', format);
    var url,
        that = this;
    
    url = [
      'http://v.youku.com/player/getM3U8/vid/',
      this.videoId,
      '/type/',
      format,
      '/ts/v.m3u8',
      ].join('');
    console.log(url);
    GM_xmlhttpRequest({
      url: url,
      method: 'GET',
      onload: function(response) {
        console.log('response:', response);

        var txt = response.responseText,
            video_reg = /^(http.+)\.ts.+$/gm,
            m = video_reg.exec(txt);
        old_link = '';
        new_link = '';
        while (m && m.length === 2) {
          new_link = m[1];
          if (new_link !== old_link) {
            that.videos[format].push(new_link);
            old_link = new_link;
          }
          m = video_reg.exec(txt);
        }
        that.jobs -= 1;

        if (that.jobs === 0) {
          that.createUI();
        }
      },
    });
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
        };

    if (this.videos.flv.length > 0) {
      videos.formats.push('标清');
      videos.links.push(this.videos.flv);
    }
    if (this.videos.mp4.length > 0) {
      videos.formats.push('高清');
      videos.links.push(this.videos.mp4);
    }
    if (this.videos.hd2.length > 0) {
      videos.formats.push('超清');
      videos.links.push(this.videos.hd2);
    }

    multiFiles.run(videos);
  },
};

monkey.run();


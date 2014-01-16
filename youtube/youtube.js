
var monkey = {
  videoId: '',
  videoInfoUrl: '',
  videoTitle: '',
  stream: '',
  urlInfo: false,

  run: function() {
    log('run() --');
    this.getURLInfo();
    this.hideAlert();
    this.showThumb();
    this.getVideo();
  },

  /**
   * parse location.href
   */
  getURLInfo: function() {
    this.urlInfo = this.parseURI(uw.location.href);
  },

  /**
   * Show image thumb of videos.
   */
  showThumb: function() {
    log('showThumb() --');
    var imgs = uw.document.querySelectorAll('img'),
        watchMore = uw.document.querySelector('#watch-more-related'),
        img,
        i;

    if (watchMore) {
      watchMore.style.display = 'block';
    }
    for (i = 0; img = imgs[i]; i += 1) {
      if (img.hasAttribute('data-thumb')) {
        img.src = img.getAttribute('data-thumb');
      }
    } 
  }, 

  /**
   * Hide the alert info.
   */
  hideAlert: function() {
    var alerts = uw.document.querySelectorAll('.yt-alert'),
        oo = uw.document.querySelector('#oo'),
        alert,
        i;
    for (i = 0; alert = alerts[i]; i += 1) {
      alert.style.display = 'none';
    }
    if (oo) {
      oo.style.display = 'none';
    }
  },

  /**
   * Get video url info:
   */
  getVideo: function () {
    log('getVideo()--');
    var that = this;

    if (!this.urlInfo.params['v']) {
      return;
    }

    this.videoId = this.urlInfo.params['v'];
    this.videoInfoUrl = '/get_video_info?video_id=' + this.videoId;
    this.videoTitle = uw.document.title.substr(0, uw.document.title.length - 10);

    GM_xmlhttpRequest({
      method: 'GET',
      url: this.videoInfoUrl,
      onload: function(response) {
        log('xhr response: ', response);
        that.parseStream(response.responseText);
      },
    });
  },

  /**
   * Parse stream info from xhr text:
   */
  parseStream: function(rawVideoInfo) {
    log('parseStream() ---');
    var that = this;

    /**
     * Parse the stream text to Object
     */
    function _parseStream(rawStream){
      var a = decodeURIComponent(rawStream).split(',');
      return a.map(that.urlHashToObject);
    }

    this.videoInfo = this.urlHashToObject(rawVideoInfo);
    this.stream = _parseStream(this.videoInfo.url_encoded_fmt_stream_map);
    this.createUI();
  },

  /**
   * Create download list:
   */
  createUI: function() {
    log('createUI() -- ');
    log('this: ', this);
    var types = {
          'webm': 'webm',
          'mp4%': 'mp4',
          'x-fl': 'flv',
          '3gpp': '3gp',
        },
        videos = {
          title: this.videoTitle,
          formats: [],
          links: [],
          ok: true,
          msg: '',
        },
        video,
        i;

    if (this.stream.length === 0) {
      videos.ok = false;
      videos.msg = 'This video does not allowed to download';
    } else {
      for (i = 0; i < this.stream.length; i += 1) {
        video = this.stream[i];
        videos.formats.push(
            video.quality + '-' + types[video.type.substr(8, 4)]);
        videos.links.push(
          decodeURIComponent(video.url) + '&signature=' + video.sig);
      }
    }

    singleFile.run(videos);
  },

  /**
   * Parse URL hash and convert to Object.
   */
  urlHashToObject: function(hashText) {
    var list = hashText.split('&'),
        output = {},
        len = list.length,
        i = 0,
        tmp = '';

    for (i = 0; i < len; i += 1) {
      tmp = list[i].split('=')
      output[tmp[0]] = tmp[1];
    }
    return output;
  },

  /**
   * FROM: http://james.padolsey.com/javascript/parsing-urls-with-the-dom/
   * This function creates a new anchor element and uses location
   * properties (inherent) to get the desired URL data. Some String
   * operations are used (to normalize results across browsers).
   */
  parseURI: function(url) {
    var a =  uw.document.createElement('a');
    a.href = url;
    return {
      source: url,
      protocol: a.protocol.replace(':',''),
      host: a.hostname,
      port: a.port,
      query: a.search,
      params: (function(){
        var ret = {},
            seg = a.search.replace(/^\?/,'').split('&'),
            len = seg.length,
            i = 0,
            s;

        for (i = 0; i< len; i += 1) {
          if (seg[i]) {
            s = seg[i].split('=');
            ret[s[0]] = s[1];
          }
        }
        return ret;
      })(),
      file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
      hash: a.hash.replace('#',''),
      path: a.pathname.replace(/^([^\/])/,'/$1'),
      relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
      segments: a.pathname.replace(/^\//,'').split('/')
    };
  },
};

monkey.run();


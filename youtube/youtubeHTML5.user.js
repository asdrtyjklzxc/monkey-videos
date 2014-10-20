// ==UserScript==
// @name         youtubeHTML5
// @description  Adds links to download flv, mp4 and webm from YouTube
// @include      http://www.youtube.com/watch?v=*
// @include      https://www.youtube.com/watch?v=*
// @version      2.4
// @license      GPLv3
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @updateURL     https://raw.githubusercontent.com/LiuLang/monkey-videos/master/youtube/youtubeHTML5.user.js
// ==/UserScript==


var singleFile = {
  // videos is an object containing video info.
  //
  // @title, string, video title
  // @formats, string list, format name of each video
  // @links, string list, video link
  // @msg, string 
  // @ok, bool, is ok is false, @msg will be displayed on playlist-panel
  videos: null,

  run: function(videos) {
    console.log('run() -- ');
    this.videos = videos;
    this.createPanel();
    this.createPlaylist();
  },

  createPanel: function() {
    console.log('createPanel() --');
    var panel = document.createElement('div'),
        playlist = document.createElement('div'),
        playlistToggle = document.createElement('div');

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
        'width: 100%;',
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

    playlist= document.createElement('div');
    playlist.className = 'playlist-wrap';
    panel.appendChild(playlist);

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
  },

  createPlaylist: function() {
    console.log('createPlayList() -- ');
    var playlist = document.querySelector('.monkey-videos-panel .playlist-wrap'),
        a,
        i;

    if (!this.videos.ok) {
      console.error(this.videos.msg);
      a = document.createElement('span');
      a.title = this.videos.msg;
      a.innerHTML = this.videos.msg;
      playlist.appendChild(a);
      return;
    }

    for (i = 0; i < this.videos.links.length; i += 1) {
      a = document.createElement('a');
      a.className = 'playlist-item';
      a.innerHTML = this.videos.title + '(' + this.videos.formats[i] + ')';
      a.title = a.innerHTML;
      a.href = this.videos.links[i];
      playlist.appendChild(a);
    }
  },

  /**
   * Create a new <style> tag with str as its content.
   * @param string styleText
   *   - The <style> tag content.
   */
  addStyle: function(styleText) {
    console.log('addStyle() --');
    var style = document.createElement('style');
    if (document.head) {
      document.head.appendChild(style);
      style.innerHTML = styleText;
    }
  },
};


var monkey = {
  videoId: '',
  videoInfoUrl: null,
  videoTitle: '',
  stream: null,
  adaptive_fmts: null,
  urlInfo: false,

  // format list comes from https://github.com/rg3/youtube-dl
  formats:  {
    '5': {ext: 'flv', width: 400, height: 240, resolution: '240p'},
    '6': {ext: 'flv', width: 450, height: 270, resolution: '270p'},
    '13': {ext: '3gp', resolution: 'unknown'},
    '17': {ext: '3gp', width: 176, height: 144, resolution: '144p'},
    '18': {ext: 'mp4', width: 640, height: 360, resolution: '360p'},
    '22': {ext: 'mp4', width: 1280, height: 720, resolution: '720p'},
    '34': {ext: 'flv', width: 640, height: 360, resolution: '360p'},
    '35': {ext: 'flv', width: 854, height: 480, resolution: '720p'},
    '36': {ext: '3gp', width: 320, height: 240, resolution: '240p'},
    '37': {ext: 'mp4', width: 1920, height: 1080, resolution: '1080p'},
    '38': {ext: 'mp4', width: 4096, height: 3072, resolution: '4k'},
    '43': {ext: 'webm', width: 640, height: 360, resolution: '360p'},
    '44': {ext: 'webm', width: 854, height: 480, resolution: '480p'},
    '45': {ext: 'webm', width: 1280, height: 720, resolution: '720p'},
    '46': {ext: 'webm', width: 1920, height: 1080, resolution: '1080p'},


    // 3d videos
    '82': {'ext': 'mp4', 'height': 360, 'resolution': '360p', 'format_note': '3D', 'preference': -20},
    '83': {'ext': 'mp4', 'height': 480, 'resolution': '480p', 'format_note': '3D', 'preference': -20},
    '84': {'ext': 'mp4', 'height': 720, 'resolution': '720p', 'format_note': '3D', 'preference': -20},
    '85': {'ext': 'mp4', 'height': 1080, 'resolution': '1080p', 'format_note': '3D', 'preference': -20},
    '100': {'ext': 'webm', 'height': 360, 'resolution': '360p', 'format_note': '3D', 'preference': -20},
    '101': {'ext': 'webm', 'height': 480, 'resolution': '480p', 'format_note': '3D', 'preference': -20},
    '102': {'ext': 'webm', 'height': 720, 'resolution': '720p', 'format_note': '3D', 'preference': -20},

    // Apple HTTP Live Streaming
    '92': {'ext': 'mp4', 'height': 240, 'resolution': '240p', 'format_note': 'HLS', 'preference': -10},
    '93': {'ext': 'mp4', 'height': 360, 'resolution': '360p', 'format_note': 'HLS', 'preference': -10},
    '94': {'ext': 'mp4', 'height': 480, 'resolution': '480p', 'format_note': 'HLS', 'preference': -10},
    '95': {'ext': 'mp4', 'height': 720, 'resolution': '720p', 'format_note': 'HLS', 'preference': -10},
    '96': {'ext': 'mp4', 'height': 1080, 'resolution': '1080p', 'format_note': 'HLS', 'preference': -10},
    '132': {'ext': 'mp4', 'height': 240, 'resolution': '240p', 'format_note': 'HLS', 'preference': -10},
    '151': {'ext': 'mp4', 'height': 72, 'resolution': '72p', 'format_note': 'HLS', 'preference': -10},

    // DASH mp4 video
    '133': {'ext': 'mp4', 'width': 400, 'height': 240, 'resolution': '240p', 'format_note': 'DASH video', 'preference': -40},
    '134': {'ext': 'mp4', 'width': 640, 'height': 360, 'resolution': '360p', 'format_note': 'DASH video', 'preference': -40},
    '135': {'ext': 'mp4', 'width': 854, 'height': 480, 'resolution': '480p', 'format_note': 'DASH video', 'preference': -40},
    '136': {'ext': 'mp4', 'width': 1280, 'height': 720, 'resolution': '720p', 'format_note': 'DASH video', 'preference': -40},
    '137': {'ext': 'mp4', 'width': 1920, 'height': 1080, 'resolution': '1080p', 'format_note': 'DASH video', 'preference': -40},
    '138': {'ext': 'mp4', 'width': 1921, 'height': 1081, 'resolution': '>1080p', 'format_note': 'DASH video', 'preference': -40},
    '160': {'ext': 'mp4', 'width': 256, 'height': 192, 'resolution': '192p', 'format_note': 'DASH video', 'preference': -40},
    '264': {'ext': 'mp4', 'width': 1920, 'height': 1080, 'resolution': '1080p', 'format_note': 'DASH video', 'preference': -40},

    // Dash mp4 audio
    '139': {'ext': 'm4a', 'format_note': 'DASH audio', 'vcodec': 'none', 'abr': 48, 'preference': -50},
    '140': {'ext': 'm4a', 'format_note': 'DASH audio', 'vcodec': 'none', 'abr': 128, 'preference': -50},
    '141': {'ext': 'm4a', 'format_note': 'DASH audio', 'vcodec': 'none', 'abr': 256, 'preference': -50},

    // Dash webm
    '167': {'ext': 'webm', 'height': 360, 'width': 640, 'format_note': 'DASH video', 'container': 'webm', 'vcodec': 'VP8', 'acodec': 'none', 'preference': -40, resolution: '360p'},
    '168': {'ext': 'webm', 'height': 480, 'width': 854, 'format_note': 'DASH video', 'container': 'webm', 'vcodec': 'VP8', 'acodec': 'none', 'preference': -40, resolution: '480p'},
    '169': {'ext': 'webm', 'height': 720, 'width': 1280, 'format_note': 'DASH video', 'container': 'webm', 'vcodec': 'VP8', 'acodec': 'none', 'preference': -40, resolution: '720p'},
    '170': {'ext': 'webm', 'height': 1080, 'width': 1920, 'format_note': 'DASH video', 'container': 'webm', 'vcodec': 'VP8', 'acodec': 'none', 'preference': -40, resolution: '1080p'},
    '218': {'ext': 'webm', 'height': 480, 'width': 854, 'format_note': 'DASH video', 'container': 'webm', 'vcodec': 'VP8', 'acodec': 'none', 'preference': -40, resolution: '480p'},
    '219': {'ext': 'webm', 'height': 480, 'width': 854, 'format_note': 'DASH video', 'container': 'webm', 'vcodec': 'VP8', 'acodec': 'none', 'preference': -40, resolution: '480p'},
    '242': {'ext': 'webm', 'height': 240, 'resolution': '240p', 'format_note': 'DASH webm', 'preference': -40},
    '243': {'ext': 'webm', 'height': 360, 'resolution': '360p', 'format_note': 'DASH webm', 'preference': -40},
    '244': {'ext': 'webm', 'height': 480, 'resolution': '480p', 'format_note': 'DASH webm', 'preference': -40},
    '245': {'ext': 'webm', 'height': 480, 'resolution': '480p', 'format_note': 'DASH webm', 'preference': -40},
    '246': {'ext': 'webm', 'height': 480, 'resolution': '480p', 'format_note': 'DASH webm', 'preference': -40},
    '247': {'ext': 'webm', 'height': 720, 'resolution': '720p', 'format_note': 'DASH webm', 'preference': -40},
    '248': {'ext': 'webm', 'height': 1080, 'resolution': '1080p', 'format_note': 'DASH webm', 'preference': -40},

    // Dash webm audio
    '171': {'ext': 'webm', 'vcodec': 'none', 'format_note': 'DASH webm audio', 'abr': 48, 'preference': -50},
    '172': {'ext': 'webm', 'vcodec': 'none', 'format_note': 'DASH webm audio', 'abr': 256, 'preference': -50},

    // RTMP (unnamed)
    '_rtmp': {'protocol': 'rtmp'},
  },

  run: function() {
    console.log('run() --');
    this.getURLInfo();
    this.hideAlert();
    this.showThumb();
    this.getVideo();
  },

  /**
   * parse location.href
   */
  getURLInfo: function() {
    this.urlInfo = this.parseURI(unsafeWindow.location.href);
  },

  /**
   * Show image thumb of videos.
   */
  showThumb: function() {
    console.log('showThumb() --');
    var imgs = unsafeWindow.document.querySelectorAll('img'),
        watchMore = unsafeWindow.document.querySelector(
            '#watch-more-related'),
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
    var alerts = unsafeWindow.document.querySelectorAll('.yt-alert'),
        oo = unsafeWindow.document.querySelector('#oo'),
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
    console.log('getVideo()--');
    var that = this;

    if (!this.urlInfo.params['v']) {
      return;
    }

    this.videoId = this.urlInfo.params['v'];
    this.videoInfoUrl = [
      '/get_video_info',
      '?video_id=', this.videoId,
      //'&el=player_embeded&hl=en&gl=US',
      '&el=html5&hl=en&gl=US',
      '&eurl=https://youtube.googleapis.com/v/', this.videoId,
      ].join('');
    this.videoTitle = unsafeWindow.document.title.substr(
        0, unsafeWindow.document.title.length - 10);

    GM_xmlhttpRequest({
      method: 'GET',
      url: this.videoInfoUrl,
      onload: function(response) {
        console.log('xhr response: ', response);
        that.parseStream(response.responseText);
      },
    });
  },

  /**
   * Parse stream info from xhr text:
   */
  parseStream: function(rawVideoInfo) {
    console.log('parseStream() ---');
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
    this.adaptive_fmts = _parseStream(this.videoInfo.adaptive_fmts)
    this.createUI();
  },

  /**
   * Create download list:
   */
  createUI: function() {
    console.log('createUI() -- ');
    console.log('this: ', this);
    var videos = {
          title: this.videoTitle,
          formats: [],
          links: [],
          ok: true,
          msg: '',
        },
        video,
        format,
        formatName,
        url,
        streams = this.stream.concat(this.adaptive_fmts),
        i;

    for (i = 0; video = streams[i]; i += 1) {
      format = this.formats[video['itag']];
      if (! format) {
        console.error('current format not supported: ', video);
        continue;
      }
      formatName = []
      if ('format_note' in format) {
        formatName.push(format.format_note);
      }
      if ('resolution' in format) {
        if (formatName.length > 0) {
          formatName.push('-');
        }
        formatName.push(format.resolution);
      }
      if ('ext' in format) {
        formatName.push('.');
        formatName.push(format.ext);
      }
      formatName = formatName.join('');
      if (videos.formats.indexOf(formatName) >= 0) {
        continue;
      }
      videos.formats.push(formatName);
      url = decodeURIComponent(video.url);
      if ('sig' in video) {
        url = url + '&signature=' + video.sig
      }
      videos.links.push(url);
    }

    if (videos.links.length === 0) {
      videos.ok = false;
      videos.msg = 'This video does not allowed to download';
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
    var a =  unsafeWindow.document.createElement('a');
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


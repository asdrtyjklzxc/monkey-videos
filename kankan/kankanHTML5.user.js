// ==UserScript==
// @name         kankanHTML5
// @description  Play videos with html5 on kankan.com
// @version      2.1
// @include      http://vod.kankan.com/v/*
// @include      http://vod.kankan.com/trailer/*
// @include      http://vod.kankan.com/1080p/*
// @license      GPLv3
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

var uw = unsafeWindow,
    log = uw.console.log,
    error = uw.console.error;


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
    log('run() -- ');
    this.videos = videos;
    this.createPanel();
    this.createPlaylist();
  },

  createPanel: function() {
    log('createPanel() --');
    var panel = uw.document.createElement('div'),
        playlist = uw.document.createElement('div'),
        playlistToggle = uw.document.createElement('div');

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
    uw.document.body.appendChild(panel);

    playlist= uw.document.createElement('div');
    playlist.className = 'playlist-wrap';
    panel.appendChild(playlist);

    playlistToggle = uw.document.createElement('div');
    playlistToggle.id = 'playlist-toggle';
    playlistToggle.title = '隐藏';
    playlistToggle.className = 'playlist-show';
    panel.appendChild(playlistToggle);
    playlistToggle.addEventListener('click', function(event) {
      var wrap = uw.document.querySelector(
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
  },

  createPlaylist: function() {
    log('createPlayList() -- ');
    var playlist = uw.document.querySelector(
          '.monkey-videos-panel .playlist-wrap'),
        a,
        i;

    if (!this.videos.ok) {
      error(this.videos.msg);
      a = uw.document.createElement('span');
      a.title = this.videos.msg;
      a.innerHTML = this.videos.msg;
      playlist.appendChild(a);
      return;
    }

    for (i = 0; i < this.videos.links.length; i += 1) {
      a = uw.document.createElement('a');
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
    log('addStyle() --');
    var style = uw.document.createElement('style');
    if (uw.document.head) {
      uw.document.head.appendChild(style);
      style.innerHTML = styleText;
    }
  },
};


var monkey = {
  types: ['流畅', '标清', '高清'],
  gcids: ['', '', ''],
  videos: ['', '', ''],
  gcidsGot: false,
  title: '',
  jobs: 0,

  run: function() {
    log('run() --');
    this.getGCID();
  },

  /**
   * Get global content ID(GCD)
   */
  getGCID: function() {
    log('getGCID() --');
    var scripts = uw.document.querySelectorAll('script'),
        script,
        titleReg = /G_MOVIE_TITLE = '([^']+)'/,
        titleMatch,
        surlsReg = /surls:\[([^\]]+)\]/,
        surlsMatch,
        surls,
        surl,
        gcidReg = /http:\/\/.+?\/.+?\/(.+?)\//,
        gcidMatch,
        i,
        j;

    for (i = 0; script = scripts[i]; i += 1) {
      if (this.title.length === 0) {
        titleMatch = titleReg.exec(script.innerHTML);
        if (titleMatch) {
          this.title = titleMatch[1];
        }
      }

      if (this.gcidsGot === false) {
        surlsMatch = surlsReg.exec(script.innerHTML);
        if (! surlsMatch) {
          continue;
        }

        this.gcidsGot = true;
        surls = surlsMatch[1].split(',');
        log('surls:', surls);
        for (j = 0; surl = surls[j]; j += 1) {
          gcidMatch = gcidReg.exec(surl);

          if (gcidMatch) {
            this.gcids[j] = gcidMatch[1];
          }
        }
        this.getVideosByGCID();
        return;
      }
    }
  },

  /**
   * Get videos
   */
  getVideosByGCID: function() {
    log('getVideosByGCID()');
    var gcid,
        gcids = this.gcids,
        i;

    for (i = 0; gcid = gcids[i]; i += 1) {
      if (gcid.length === 0) {
        continue;
      }
      this.jobs += 1;
      this.getVideoByGCID(gcid, i);
    }
  },

  /**
   * Get video specified by gcid
   */
  getVideoByGCID: function(gcid, i) {
    log('getVideoByGCID() --', gcid, i);
    var url = 'http://p2s.cl.kankan.com/getCdnresource_flv?gcid=' + gcid,
        that = this;

    log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);
        var reg = /ip:"([^"]+)",port:8080,path:"([^"]+)"/,
            match = reg.exec(response.responseText);

        if (match && match.length === 3) {
          that.videos[i] = 'http://' + match[1] + match[2];
        }

        that.jobs -= 1;
        if (that.jobs === 0) {
          that.createUI();
        }
      },
    });
  },

  /**
   * Display UI widgets
   */
  createUI: function() {
    log('createUI() --');
    log('this: ', this);
  },
};

monkey.run();


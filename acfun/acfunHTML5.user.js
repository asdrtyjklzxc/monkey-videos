// ==UserScript==
// @name         acfunHTML5
// @description  Play Videos with html5 on acfun.tv
// @include      http://www.acfun.tv/v/*
// @version      2.2
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @license      GPLv3
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
  vid: '',
  origUrl: '',

  run: function() {
    this.getVid();
    if (this.vid.length === 0) {
      error('Failed to get video id!');
      this.createUI();
    } else {
      this.getVideoLink();
    }
  },

  getVid: function() {
    log('getVid()');
    var videos = uw.document.querySelectorAll('div#area-part-view div.l a'),
        video,
        i;

    log('videos: ', videos);
    for (i = 0; video = videos[i]; i += 1) {
      if (video.className.search('active') > 0) {
        this.vid = video.getAttribute('data-vid');
        return;
      }
    }
    error('Failed to get vid');
  },

  /**
   * Get video link from a json object
   */
  getVideoLink: function() {
    log('getVideoLink()');
    log(this);
    //var url = 'http://www.acfun.tv/api/getVideoByID.aspx?vid=' + this.vid,
    var url = 'http://www.acfun.tv/video/getVideo.aspx?id=' + this.vid,
        that = this;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response:', response);
        var json = JSON.parse(response.responseText);

        if (json.success) {
          that.origUrl = json.sourceUrl;
        }
        that.createUI();
      },
    });
  },

  createUI: function() {
    log('createUI() --');
    log(this);
    var videos = {
          title: '原始地址',
          formats: [],
          links: [],
          ok: true,
          msg: '',
        };

    if (this.origUrl.length === 0) {
      videos.ok = false;
      videos.msg = '视频已被删除';
      singleFile.run(videos);
    } else {
      videos.formats.push(' ');
      videos.links.push(this.origUrl);
      singleFile.run(videos);
    }
  },
}

monkey.run();


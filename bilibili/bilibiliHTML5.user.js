// ==UserScript==
// @name         bilibiliHTML5
// @description  Get video link on bilibili.tv
// @include      http://www.bilibili.tv/video/*
// @version      2.4
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @license      GPLv3
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
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
    var panel = unsafeWindow.document.createElement('div'),
        playlist = unsafeWindow.document.createElement('div'),
        playlistToggle = unsafeWindow.document.createElement('div');

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
    unsafeWindow.document.body.appendChild(panel);

    playlist= unsafeWindow.document.createElement('div');
    playlist.className = 'playlist-wrap';
    panel.appendChild(playlist);

    playlistToggle = unsafeWindow.document.createElement('div');
    playlistToggle.id = 'playlist-toggle';
    playlistToggle.title = '隐藏';
    playlistToggle.className = 'playlist-show';
    panel.appendChild(playlistToggle);
    playlistToggle.addEventListener('click', function(event) {
      var wrap = unsafeWindow.document.querySelector(
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
    console.log('createPlayList() -- ');
    var playlist = unsafeWindow.document.querySelector(
          '.monkey-videos-panel .playlist-wrap'),
        a,
        i;

    if (!this.videos.ok) {
      console.error(this.videos.msg);
      a = unsafeWindow.document.createElement('span');
      a.title = this.videos.msg;
      a.innerHTML = this.videos.msg;
      playlist.appendChild(a);
      return;
    }

    for (i = 0; i < this.videos.links.length; i += 1) {
      a = unsafeWindow.document.createElement('a');
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
    var style = unsafeWindow.document.createElement('style');
    if (unsafeWindow.document.head) {
      unsafeWindow.document.head.appendChild(style);
      style.innerHTML = styleText;
    }
  },
};


var monkey = {
  cid: '',
  title: '',
  oriurl: '',

  run: function() {
    console.log('run() --');
    this.getTitle();
    this.getCid();
  },

  /**
   * Get video title
   */
  getTitle: function() {
    console.log('getTitle()');
    var metas = unsafeWindow.document.querySelectorAll('meta'),
        meta,
        i;

    for (i = 0; meta = metas[i]; i += 1) {
      if (meta.hasAttribute('name') &&
          meta.getAttribute('name') === 'title') {
        this.title = meta.getAttribute('content');
        return;
      }
    }
    this.title = unsafeWindow.document.title;
  },

  /**
   * 获取 content ID.
   */
  getCid: function() {
    console.log('getCid()');
    var iframe = unsafeWindow.document.querySelector('iframe'),
        flashvar = unsafeWindow.document.querySelector('div#bofqi embed'),
        reg = /cid=(\d+)&aid=(\d+)/,
        match;


    if (iframe) {
      match = reg.exec(iframe.src);
    } else if (flashvar) {
      console.log(flashvar.getAttribute('flashvars'));
      match = reg.exec(flashvar.getAttribute('flashvars'));
    }
    console.log('match:', match);
    if (match && match.length === 3) {
      this.cid = match[1];
      this.getVideos();
    } else {
      console.error('Failed to get cid!');
    }
  },

  /**
   * Get original video links from interface.bilibili.cn
   */
  getVideos: function() {
    console.log('getVideos() -- ');
    var url = 'http://interface.bilibili.cn/player?cid=' + this.cid,
        url = 'http://interface.bilibili.cn/playurl?cid=' + this.cid,
        that = this;

    console.log('url:', url);
    console.log('url2:', url2);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        var reg = /<oriurl>(.+)<\/oriurl>/g,
            txt = response.responseText,
            match = reg.exec(txt);

        if (match && match.length === 2) {
          that.oriurl = match[1];
          that.createUI();
        }
      },
    });
  },

  createUI: function() {
    console.log('createUI() --');
    console.log(this);
    var videos = {
          title: '视频的原始地址',
          formats: [''],
          links: [],
          ok: true,
          msg: '',
        };

    videos.formats.push('');
    videos.links.push(this.oriurl);

    singleFile.run(videos);
  },
}

monkey.run();


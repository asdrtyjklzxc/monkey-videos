// ==UserScript==
// @name         BaiduPanHTML5
// @version      1.0
// @description  Play Videos with html5 on pan.baidu.com
// @include      http://pan.baidu.com/play/video*
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @license      GPLv3
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
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

  title: '',
  path: '',
  m3u8: '',
  origin: '',

  run: function() {
    console.log('run() --');
    this.getPath();
  },

  /**
   * Get video absolute path
   */
  getPath: function() {
    console.log('getPath() --');
    var regexp = /video\/path=([^&]+)&/,
        match = regexp.exec(location.href);

    if (match && match.length === 2) {
      this.path = decodeURIComponent(match[1]);
      this.title = this.getFileName(this.path)[1];
      this.getStreaming();
    } else {
      console.error('Failed to get video Path!');
    }
  },

  getStreaming: function() {
    console.log('getStreaming() --');
    var url = [
      'http://pcs.baidu.com/rest/2.0/pcs/file?method=streaming',
      '&path=', encodeURIComponent(this.path),
      '&type=M3U8_AUTO_480&app_id=250528',
      ].join('');

    console.log('url:', url);
    this.m3u8 = url;
    this.createUI();
  },

  createUI: function() {
    console.log('createUI() --');
    var videos = {
          title: this.title,
          formats: ['M3U8'],
          links: [this.m3u8],
          ok: true,
          msg: '',
        };
    singleFile.run(videos);
  },

  /**
   * Parse and split file path
   */
  getFileName: function(path) {
    console.log('getFileName() --');
    var parts = path.split('/'),
        result = [];
    if (parts.length === 1) {
      result = [parts[0], ''];
    } else if (parts.length === 2 && parts[0] === '') {
      result = ['/', parts[1]];
    } else {
      result = [parts.slice(0, -1).join('/'), parts[parts.length-1]];
    }
    return result;
  },
}

monkey.run();

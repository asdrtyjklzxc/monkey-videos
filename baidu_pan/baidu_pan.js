
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

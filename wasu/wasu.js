
/**
 * wasu.cn
 */
var monkey_wasu = {

  id: '',
  key: '',
  url: '',
  title: '',
  link: '',
  format: '高清',

  run: function() {
    console.log('run() --');
    this.getTitle();
  },

  getTitle: function() {
    console.log('getTitle() --');
    var h3 = document.querySelector('div.play_movie div.play_site div.l h3');
    if (h3) {
      this.title = h3.innerHTML;
    } else {
      this.title = document.title.replace(
          '高清电影全集在线观看-正版高清电影-华数TV', '').replace(
          ' 正版高清电影', '');
    }
    this.getVid();
  },

  /**
   * Get video id
   */
  getVid: function() {
    console.log('getVid()--');
    var reg = /show\/id\/(\d+)/,
        match = reg.exec(location.href),
        url,
        that = this;

    if (!match || match.length !== 2) {
      console.error('Failed to get vid!');
      return
    }
    this.vid = match[1];
    url = 'http://www.wasu.cn/wap/play/show/id/' + this.vid,

    console.log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        var txt = response.responseText,
            keyReg = /'key'\s*:\s*'([^']+)'/,
            urlReg = /'url'\s*:\s*'([^']+)'/,
            keyMatch,
            urlMatch;

        keyMatch = keyReg.exec(txt);
        if (! keyMatch || keyMatch.length !== 2) {
          console.error('Failed to get key: ', keyMatch);
          return;
        }
        that.key = keyMatch[1];
        urlMatch = urlReg.exec(txt);
        that.url = urlMatch[1];
        that.getVideoInfo();
      },
    });
  },

  /**
   * Get video information
   */
  getVideoInfo: function() {
    console.log('getVideoInfo() --');
    var url = [
          'http://www.wasu.cn/wap/Api/getVideoUrl/id/', this.vid,
          '/key/', this.key,
          '/url/', this.url,
          '/type/txt',
        ].join(''),
        that = this;

    console.log('video info link: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        that.link = response.responseText;
        that.createUI();
      },
    });
  },

  createUI: function() {
    console.log('createUI() --');
    console.log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
          ok: true,
          msg: '',
        };

    if (this.link.length === 0) {
      videos.ok = false;
      videos.msg = 'Failed to get video link';
    } else {
      videos.formats.push(this.format);
      videos.links.push([this.link]);
    }
    multiFiles.run(videos);
  },

};

monkey.extend('www.wasu.cn', [
  'http://www.wasu.cn/Play/show/id/',
  'http://www.wasu.cn/wap/Play/show/id/',
], monkey_wasu);


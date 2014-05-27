
var monkey = {
  cid: '',
  title: '',
  oriurl: '',

  run: function() {
    log('run() --');
    this.getTitle();
    this.getCid();
  },

  /**
   * Get video title
   */
  getTitle: function() {
    log('getTitle()');
    var metas = uw.document.querySelectorAll('meta'),
        meta,
        i;

    for (i = 0; meta = metas[i]; i += 1) {
      if (meta.hasAttribute('name') &&
          meta.getAttribute('name') === 'title') {
        this.title = meta.getAttribute('content');
        return;
      }
    }
    this.title = uw.document.title;
  },

  /**
   * 获取 content ID.
   */
  getCid: function() {
    log('getCid()');
    var iframe = uw.document.querySelector('iframe'),
        flashvar = uw.document.querySelector('div#bofqi embed'),
        reg = /cid=(\d+)&aid=(\d+)/,
        match;


    if (iframe) {
      match = reg.exec(iframe.src);
    } else if (flashvar) {
      log(flashvar.getAttribute('flashvars'));
      match = reg.exec(flashvar.getAttribute('flashvars'));
    }
    log('match:', match);
    if (match && match.length === 3) {
      this.cid = match[1];
      this.getVideos();
    } else {
      error('Failed to get cid!');
    }
  },

  /**
   * Get original video links from interface.bilibili.cn
   */
  getVideos: function() {
    log('getVideos() -- ');
    var url = 'http://interface.bilibili.cn/player?cid=' + this.cid,
        url = 'http://interface.bilibili.cn/playurl?cid=' + this.cid,
        that = this;

    log('url:', url);
    log('url2:', url2);
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
    log('createUI() --');
    log(this);
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


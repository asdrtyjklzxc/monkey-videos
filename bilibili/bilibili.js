
var monkey = {
  cid: '',
  title: '',

  videos: [],

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

  getCid: function() {
    log('getCid()');
    var iframe = uw.document.querySelector('iframe'),
        reg = /cid=(\d+)&aid=(\d+)/,
        match;


    if (iframe) {
      match = reg.exec(iframe.src);
      if (match && match.length === 3) {
        this.cid = match[1];
        this.getVideos();
      }
    }
    this.createUI();
  },

  /**
   * Get video links from interface.bilibili.tv
   */
  getVideos: function() {
    log('getVideos() -- ');
    var url = 'http://interface.bilibili.tv/playurl?cid=' + this.cid,
        that = this;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);
        var reg = /<url>.{9}([^\]]+)/g,
            txt = response.responseText,
            match = reg.exec(txt);

        while (match) {
          that.videos.push(match[1]);
          match = reg.exec(txt);
        }
        that.createUI();
      },
    });
  },

  createUI: function() {
    log('createUI() --');
    log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
          ok: true,
          msg: '',
        };

    if (this.cid.length === 0) {
      videos.ok = false;
      videos.msg = 'Failed to get cid';
    } else {
      videos.formats.push('标清');
      videos.links.push(this.videos);
    }

    log('videos: ', videos);
    multiFiles.run(videos);
  },
}

monkey.run();


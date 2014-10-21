
/**
 * bilibili.tv
 */
var monkey_bili = {
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
    var metas = document.querySelectorAll('meta'),
        meta,
        i;

    for (i = 0; meta = metas[i]; i += 1) {
      if (meta.hasAttribute('name') &&
          meta.getAttribute('name') === 'title') {
        this.title = meta.getAttribute('content');
        return;
      }
    }
    this.title = document.title;
  },

  /**
   * 获取 content ID.
   */
  getCid: function() {
    console.log('getCid()');
    var iframe = document.querySelector('iframe'),
        flashvar = document.querySelector('div#bofqi embed'),
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
        that = this;

    console.log('url:', url);
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

monkey.extend('www.bilibili.com', [
  'http://www.bilibili.com/video/',
], monkey_bili);

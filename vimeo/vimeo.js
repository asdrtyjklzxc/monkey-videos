
var monkey = {

  vid: '',
  title: '',
  videos: ['', '', ''],
  types: ['mobile', 'hd', 'sd'],

  run: function() {
    log('run() -- ');
    this.getVid();
  },

  /**
   * Get current video id
   */
  getVid: function() {
    log('getVid() --');
    var reg = /vimeo\.com\/(\d+)/,
        url = uw.document.location.href;
    this.vid = reg.exec(url)[1];
    this.getVideoById();
  },

  /**
   * Get video links
   */
  getVideoById: function() {
    log('getVideoById() --');
    var url = 'http://player.vimeo.com/video/' + this.vid,
        that = this;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);
        var txt = response.responseText,
            titleReg = /<title>([^<]+)</,
            titleMatch = titleReg.exec(txt),
            mobileReg = /mobile":\{.+?url":"([^"]+)"/,
            mobileMatch = mobileReg.exec(txt),
            sdReg = /sd":\{.+?url":"([^"]+)"/,
            sdMatch = sdReg.exec(txt),
            hdReg = /hd":\{.+?url":"([^"]+)"/,
            hdMatch = hdReg.exec(txt);

        if (titleMatch && titleMatch.length === 2) {
          that.title = titleMatch[1];
        } else {
          that.title = uw.document.title;
        }

        if (mobileMatch && mobileMatch.length === 2) {
          that.videos[0]= mobileMatch[1];
        }
        if (hdMatch && hdMatch.length === 2) {
          that.videos[1]= hdMatch[1];
        }
        if (sdMatch && sdMatch.length === 2) {
          that.videos[2] = sdMatch[1];
        }
        that.createUI();
      },
    });
  },

  createUI: function() {
    log('createUI() --');
    log('this: ', this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
          ok: true,
          msg: '',
        },
        video,
        i;

    for (i = 0; video = this.videos[i]; i += 1) {
      if (video.length > 0) {
        videos.links.push([video]);
        videos.formats.push(this.types[i]);
      }
    }

    multiFiles.run(videos);
  },
}

monkey.run();


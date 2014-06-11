
var monkey = {
  title: '',
  mediaid: '',       // 专辑ID;
  number: '',        // 第几集, 从1计数;
  jobs: 0,

  formats: {
    327680: '标清版',
    491520: '高清版',
    737280: '超清版',
  },
  videos: {
    327680: '',
    491520: '',
    737280: '',
  },

  run: function() {
    console.log('run() --');
    this.router();
  },
  
  /**
   * router control
   */
  router: function() {
    var url = unsafeWindow.location.href;

    if (url.search('subject/play/') > 1 ||
        url.search('/vplay/') > 1 ) {
      this.getVid();
    } else if (url.search('subject/') > 1) {
      this.addLinks();
    } else if (url.search('uvideo/play/') > 1) {
      this.getUGCID();
    } else {
      console.error('Error: current page is not supported!');
    }
  },

  /**
   * Get UGC video ID.
   * For uvideo/play/'.
   */
  getUGCID: function() {
    console.log('getUGCID() --');
    var urlReg = /uvideo\/play\/(\d+)$/,
        urlMatch = urlReg.exec(unsafeWindow.location.href);

    console.log('urlMatch: ', urlMatch);
    if (urlMatch.length === 2) {
      this.mediaid = urlMatch[1];
      this.getUGCVideoInfo();
    } else {
      console.error('Failed to parse video ID!');
    }
  },

  getUGCVideoInfo: function() {
    console.log('getUGCVideoInfo() --');
    var url = 'http://api.funshion.com/ajax/get_media_data/ugc/' + this.mediaid,
        that = this;

    console.log('url: ', url);
    GM_xmlhttpRequest({
      url: url,
      method: 'GET',
      onload: function(response) {
        console.log('response: ', response);
        that.json = JSON.parse(response.responseText);
        console.log('json: ', that.json);
        that.decodeUGCVideoInfo();
      },
    });
  },

  decodeUGCVideoInfo: function() {
    console.log('decodeUGCVideoInfo() --');
    var url = [
          'http://jobsfe.funshion.com/query/v1/mp4/',
          this.json.data.hashid,
          '.json?file=',
          this.json.data.filename,
        ].join(''),
        that = this;

    console.log('url: ', url);
    GM_xmlhttpRequest({
      url: url,
      method: 'GET',
      onload: function(response) {
        console.log('response: ', response);
        that.appendUGCVideo(JSON.parse(response.responseText));
      },
    });
  },

  appendUGCVideo: function(videoJson) {
    console.log('appendUGCVideo() --');
    console.log('this: ', this);
    console.log('videoJson:', videoJson);
    var fileformat = this.fileformats[videoJson.playlist[0].bits];

    info = {
      title: this.json.data.name_cn,
      href: videoJson.playlist[0].urls[0],
    };
    console.log('info: ', info);

    this._appendVideo(info);
  },


  /**
   * Get video ID.
   * For subject/play/'.
   */
  getVid: function() {
    console.log('getVid() --');
    var url = unsafeWindow.location.href,
        urlReg = /subject\/play\/(\d+)\/(\d+)$/,
        urlMatch = urlReg.exec(url),
        urlReg2 = /\/vplay\/m-(\d+)/,
        urlMatch2 = urlReg2.exec(url);

    console.log('urlMatch: ', urlMatch);
    console.log('urlMatch2: ', urlMatch2);
    if (urlMatch && urlMatch.length === 3) {
      this.mediaid = urlMatch[1];
      this.number = parseInt(urlMatch[2]);
    } else if (urlMatch2 && urlMatch2.length === 2) {
      this.mediaid = urlMatch2[1];
      this.number = 1;
    } else {
      console.error('Failed to parse video ID!');
      return;
    }
    this.getVideoInfo();
  },

  /**
   * Download a json file containing video info
   */
  getVideoInfo: function() {
    console.log('getVideoInfo() --');
    var url = [
          'http://api.funshion.com/ajax/get_web_fsp/',
          this.mediaid,
          '/mp4',
        ].join(''),
        that = this;

    console.log('url: ', url);
    GM_xmlhttpRequest({
      url: url,
      method: 'GET',
      onload: function(response) {
        console.log('response: ', response);
        var json = JSON.parse(response.responseText),
            format;
        console.log('json: ', json);
        that.title = json.data.name_cn || that.getTitle();
        if ((! json.data.fsps) || (! json.data.fsps.mult) ||
            (json.data.fsps.mult.length === 0) ||
            (! json.data.fsps.mult[0].cid)) {
          that.createUI();
        }

        that.mediaid = json.data.fsps.mult[0].cid;
        for (format in that.formats) {
          that.jobs = that.jobs + 1;
          that.getVideoLink(format);
        }
      },
    });
  },

  /**
   * Get title from document.tiel
   */
  getTitle: function() {
    console.log('getTitle() --');
    var title = unsafeWindow.document.title,
        online = title.search(' - 在线观看');

    if (online > -1) {
      return title.substr(0, online);
    } else {
      return title.substr(0, 12) + '..';
    }
  },

  /**
   * Get Video source link.
   */
  getVideoLink: function(format) {
    console.log('getVideoLink() --');
    var url = [
      'http://jobsfe.funshion.com/query/v1/mp4/',
      this.mediaid,
      '.json?bits=',
      format,
      ].join(''),
      that = this;

    console.log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        console.log('response: ', response);
        var json = JSON.parse(response.responseText);
        console.log('json: ', json);
        that.videos[format] = json.playlist[0].urls[0];
        that.jobs = that.jobs - 1;
        if (that.jobs === 0) {
          that.createUI();
        }
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
        },
        format;

    if (this.videos[327680].length > 0) {
      videos.links.push([this.videos[327680]]);
      videos.formats.push(this.formats[327680]);
    }
    if (this.videos[491520].length > 0) {
      videos.links.push([this.videos[491520]]);
      videos.formats.push(this.formats[491520]);
    }
    if (this.videos[737280].length > 0) {
      videos.links.push([this.videos[737280]]);
      videos.formats.push(this.formats[737280]);
    }

    if (videos.links.length === 0) {
      videos.ok = false;
      videos.msg = 'Video source is not available.';
    }
    multiFiles.run(videos);
  },
}

monkey.run();


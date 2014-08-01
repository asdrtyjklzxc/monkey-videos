
var monkey = {

  url:'',   // document.location.href
  title: '',
  iid: '',
  vcode: '',
  segs: {},
  totalJobs: 0,
  formats: {
    2: '240P',       // 流畅
    3: '360P',       // 清晰
    4: '480P',       // 高清
    5: '720P',       // 超清
    52: '240P(mp4)',
    53: '360P(mp4)',
    54: '480P(mp4)',
    99: '原画质'     // 原画质
  },
  links: {
  },

  run: function() {
    console.log('run() --');
    this.router();
  },

  /**
   * Page router control
   */
  router: function() {
    console.log('router() --');
    var scripts = document.querySelectorAll('script'),
        script,
        titleReg = /kw:\s*['"]([^'"]+)['"]/,
        titleMatch,
        iidReg = /iid\s*[:=]\s*(\d+)/,
        iidMatch,
        vcodeReg = /vcode: '([^']+)'/,
        vcodeMatch,
        i;

    for (i = 0; script = scripts[i]; i += 1) {
      if (this.vcode.length === 0) {
        vcodeMatch = vcodeReg.exec(script.innerHTML);
        console.log('vcodeMatch:', vcodeMatch);
        if (vcodeMatch && vcodeMatch.length > 1) {
          this.vcode = vcodeMatch[1];
          this.redirectToYouku();
          return;
        }
      }

      if (this.title.length === 0) {
        titleMatch = titleReg.exec(script.innerHTML);
        console.log('titleMatch:', titleMatch);
        if (titleMatch) {
          this.title = titleMatch[1];
        }
      }

      if (this.iid.length === 0) {
        iidMatch = iidReg.exec(script.innerHTML);
        console.log('iidMatch:', iidMatch);
        if (iidMatch) {
          this.iid = iidMatch[1];
          this.getByIid();
          return;
        }
      }
    }
    //this.getPlayList();
  },

  /**
   * Get video info by vid
   */
  getByIid: function() {
    console.log('getByIid()');
    console.log(this);

    var that = this,
        url = 'http://www.tudou.com/outplay/goto/getItemSegs.action?iid=' +
            this.iid;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        console.log('respone:', response);
        that.segs = JSON.parse(response.responseText);
        that.getAllVideos();
      },
    });
  },

//  getPlayList: function() {
//    console.log('getPlayList()');
//    console.log(this);
//  },

  /**
   * Get all video links
   */
  getAllVideos: function() {
    console.log('getAllVideos() --');
    console.log(this);
    var key,
        videos,
        video,
        i;

    for (key in this.segs) {
      videos = this.segs[key];
      for (i = 0; video = videos[i]; i += 1) {
        console.log(key, video);
        this.links[key] = [];
        this.totalJobs += 1;
        this.getVideoUrl(key, video['k'], video['no']);
      }
    }
  },


  /**
   * Get video url
   */
  getVideoUrl: function(key, k, num) {
    console.log('getVideoUrl() --');
    var url = 'http://ct.v2.tudou.com/f?id=' + k,
        that = this;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) { 
        console.log('response:', response);
        var reg = /<f[^>]+>([^<]+)</,
            match = reg.exec(response.responseText);

        if (match && match.length > 1) {
          that.links[key][num] = match[1];
          that.totalJobs -= 1;
          if (that.totalJobs === 0) {
            that.createUI();
          }
        }
      },
    });
  },

  /**
   * Redirect url to youku.com.
   * Because tudou.com use youku.com as video source on /albumplay/ page.
   */
  redirectToYouku: function() {
    var url = 'http://v.youku.com/v_show/id_' + this.vcode + '.html';
    this.redirect(url);
  },

  /**
   * Construct UI widgets
   */
  createUI: function() {
    console.log('createUI()');
    console.log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
        },
        type,
        i;

    for (type in this.links) {
      videos.links.push(this.links[type]);
      videos.formats.push(this.formats[type]);
    }

    console.log('videos: ', videos);
    multiFiles.run(videos);
  },

  /**
   * Convert string to xml
   * @param string str
   *  - the string to be converted.
   * @return object xml
   *  - the converted xml object.
   */
  parseXML: function(str) {
    if (document.implementation && document.implementation.createDocument) {
      xmlDoc = (new DOMParser()).parseFromString(str, 'text/xml');
    } else {
      console.error('parseXML() error: not support current web browser!');
      return null;
    }
    return xmlDoc;
  },

  /**
   * Redirect window location.
   */
  redirect: function(url) {
    location = url;
  },
};

monkey.run();


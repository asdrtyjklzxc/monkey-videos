
var monkey = {
  types: ['流畅', '标清', '高清'],
  gcids: ['', '', ''],
  videos: ['', '', ''],
  gcidsGot: false,
  title: '',
  jobs: 0,

  run: function() {
    log('run() --');
    this.getGCID();
  },

  /**
   * Get global content ID(GCD)
   */
  getGCID: function() {
    log('getGCID() --');
    var scripts = uw.document.querySelectorAll('script'),
        script,
        titleReg = /G_MOVIE_TITLE = '([^']+)'/,
        titleMatch,
        surlsReg = /surls:\[([^\]]+)\]/,
        surlsMatch,
        surls,
        surl,
        gcidReg = /http:\/\/.+?\/.+?\/(.+?)\//,
        gcidMatch,
        i,
        j;

    for (i = 0; script = scripts[i]; i += 1) {
      if (this.title.length === 0) {
        titleMatch = titleReg.exec(script.innerHTML);
        if (titleMatch) {
          this.title = titleMatch[1];
        }
      }

      if (this.gcidsGot === false) {
        surlsMatch = surlsReg.exec(script.innerHTML);
        if (! surlsMatch) {
          continue;
        }

        this.gcidsGot = true;
        surls = surlsMatch[1].split(',');
        log('surls:', surls);
        for (j = 0; surl = surls[j]; j += 1) {
          gcidMatch = gcidReg.exec(surl);

          if (gcidMatch) {
            this.gcids[j] = gcidMatch[1];
          }
        }
        this.getVideosByGCID();
        return;
      }
    }
  },

  /**
   * Get videos
   */
  getVideosByGCID: function() {
    log('getVideosByGCID()');
    var gcid,
        gcids = this.gcids,
        i;

    for (i = 0; gcid = gcids[i]; i += 1) {
      if (gcid.length === 0) {
        continue;
      }
      this.jobs += 1;
      this.getVideoByGCID(gcid, i);
    }
  },

  /**
   * Get video specified by gcid
   */
  getVideoByGCID: function(gcid, i) {
    log('getVideoByGCID() --', gcid, i);
    var url = 'http://p2s.cl.kankan.com/getCdnresource_flv?gcid=' + gcid,
        that = this;

    log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);
        var reg = /ip:"([^"]+)",port:8080,path:"([^"]+)"/,
            match = reg.exec(response.responseText);

        if (match && match.length === 3) {
          that.videos[i] = 'http://' + match[1] + match[2];
        }

        that.jobs -= 1;
        if (that.jobs === 0) {
          that.createUI();
        }
      },
    });
  },

  /**
   * Display UI widgets
   */
  createUI: function() {
    log('createUI() --');
    log('this: ', this);
  },
};

monkey.run();


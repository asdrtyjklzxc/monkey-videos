
var monkey = {
  title: '',
  vid: '', // default vid, data-player-videoid
  aid: '', // album id, data-player-albumid
  tvid: '', // data-player-tvid
  type: 0, // default type
  rcOrder: [96, 1, 4, 5, 10],
  rc: {
    96: {
      vid: '',
      key: '',
      name: '320P',
      links: [],
    },
    1: {
      vid: '',
      key: '',
      name: '480P',
      links: [],
    },
    // 2, 3
    4: {
      vid: '',
      key: '',
      name: '720P',
      links: [],
    },
    5: {
      vid: '',
      key: '',
      name: '1080P',
      links: [],
    },
    10: {
      vid: '',
      key: '',
      name: '4K',
      links: [],
    },
  },
  jobs: 0,

  run: function() {
    log('run() --');
    this.getTitle();
    this.getVid();
  },

  getTitle: function() {
    log('getTitle() --');
    var nav = uw.document.querySelector('#navbar em'),
        id,
        title;

    if (nav) {
      title = nav.innerHTML;
    } else {
      title = uw.document.title.split('-')[0];
    }
    this.title = title.trim();
  },

  getVid: function() {
    log('getVid() --');
    var videoPlay = uw.document.querySelector('div#flashbox');
    if (videoPlay && videoPlay.hasAttribute('data-player-videoid')) {
      this.vid = videoPlay.getAttribute('data-player-videoid');
      this.aid = videoPlay.getAttribute('data-player-aid');
      this.tvid = videoPlay.getAttribute('data-player-tvid');
      this.getVideoUrls();
    } else {
      error('Error: failed to get video id');
      return;
    }
  },

  getVideoUrls: function() {
    log('getVideoUrls() --');
    var url = ['http://cache.video.qiyi.com/vj', this.tvid, this.vid].join('/'),
        that = this;


    log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);

        var json = JSON.parse(response.responseText),
            title,
            vid_elemes,
            vid_elem,
            type,
            container,
            i,
            j,
            files,
            file;

        log('json: ', json);

//        vid_elems = xml.querySelectorAll('relative data');
//        for (i = 0; vid_elem = vid_elems[i]; i += 1) {
//          type = vid_elem.getAttribute('version');
//          if (! that.rc[type]) {
//            error('Current video type not supported: ', type);
//            continue;
//          }
//          container = that.rc[type];
//          if (container.vid.length === 0) {
//            container.vid = vid_elem.innerHTML;
//            if (container.vid != vid && that.vid === vid) {
//              that.getVideoUrls(container.vid);
//            }
//            if (vid === that.vid) {
//              that.type = type;
//            }
//          }
//          if (container.vid === vid) {
//            files = xml.querySelectorAll('fileUrl file');
//            for (j = 0; file = files[j]; j += 1) {
//              container.links.push(file.innerHTML);
//            }
//            that.jobs += 1;
//            that.getKey(container);
//          }
//        }
      },
    });
  },

  /**
   * Get video authority key
   */
  getKey: function(container) {
    log('getKey()', container);
    var hash = container.links[0].split('/'),
        url = [
          'http://data.video.qiyi.com/',
          hash[hash.length - 1].substr(0, 32),
          '.ts',
        ].join(''),
        that = this;

    log('getKey: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);
        var finalUrl = response.finalUrl;

        log('finalUrl:', finalUrl);
        container.key = finalUrl.substr(finalUrl.search('key='));
        that.jobs -= 1;
        log('jobs: ', that.jobs, that);
        if (that.jobs === 0) {
          that.createUI();
        }
      },
      onerror: function(response) {
        log('onerror:', response);
      },
    });
  },

  createUI: function() {
    log('createUI() --');
    log(this);
    var i,
        video,
        videos = {
          title: this.title,
          formats: [],
          links: [],
        },
        links,
        link,
        j;

    for (i = 0; i < this.rcOrder.length; i += 1) {
      video = this.rc[this.rcOrder[i]];
      if (video.links.length > 0) {
        videos.formats.push(video.name);

        // append KEY/UUID string to end of each video link
        links = [];
        for (j = 0; j < video.links.length; j += 1) {
          link = [video.links[j], '?', video.key].join(''); 
          links.push(link);
        }
        videos.links.push(links);
      }
    }
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
    if (uw.document.implementation &&
        uw.document.implementation.createDocument) {
      xmlDoc = new DOMParser().parseFromString(str, 'text/xml');
    } else {
      log('parseXML() error: not support current web browser!');
      return null;
    }
    return xmlDoc;
  },
};

monkey.run();


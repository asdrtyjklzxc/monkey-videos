
var monkey = {
  title: '',
  vid: '', // default vid
  type: 0, // default type
  rcOrder: [96, 1, 2, 3, 4, 5],
  rc: {
    96: {
      vid: '',
      key: '',
      name: '极速',
      links: [],
    },
    1: {
      vid: '',
      key: '',
      name: '流畅',
      links: [],
    },
    2: {
      vid: '',
      key: '',
      name: '高清',
      links: [],
    },
    3: {
      vid: '',
      key: '',
      name: '超清',
      links: [],
    },
    4: {
      vid: '',
      key: '',
      name: '超清(分段)',
      links: [],
    },
    5: {
      vid: '',
      key: '',
      name: '1080P',
      links: [],
    },
  },
  jobs: 0,

  run: function() {
    log('run() --');
    this.getTitle();
    this.getVid();
    if (this.vid.length === 0) {
      error('Error: failed to get video id');
      return;
    }
    this.getVideoUrls(this.vid);
    this.createPanel();
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
    var videoPlay = uw.document.querySelector('div.videoPlay div');
    if (videoPlay && videoPlay.hasAttribute('data-player-videoid')) {
      this.vid = videoPlay.getAttribute('data-player-videoid');
    }
  },

  getVideoUrls: function(vid) {
    log('getVideoUrls()', vid);
    var url = 'http://cache.video.qiyi.com/v/' + vid,
        that = this;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);

        var xml = that.parseXML(response.responseText),
            title,
            vid_elemes,
            vid_elem,
            type,
            container,
            i,
            j,
            files,
            file;

        if (that.title.length === 0) {
          title = xml.querySelector('title').innerHTML;
          that.title = title.substring(9, title.length - 3);
        }

        vid_elems = xml.querySelectorAll('relative data');
        if (that.jobs === 0) {
          that.jobs = vid_elems.length;
          log('that.job is: ', that.jobs, that, url);
        }
        for (i = 0; vid_elem = vid_elems[i]; i += 1) {
          type = vid_elem.getAttribute('version');
          container = that.rc[type];
          if (container.vid.length === 0) {
            container.vid = vid_elem.innerHTML;
            if (container.vid != vid && that.vid === vid) {
              that.getVideoUrls(container.vid);
            }
            if (vid === that.vid) {
              that.type = type;
            }
          }
          if (container.vid === vid) {
            files = xml.querySelectorAll('fileUrl file');
            for (j = 0; file = files[j]; j += 1) {
              container.links.push(file.innerHTML);
            }
            that.getKey(container);
          }
        }
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


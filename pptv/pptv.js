
var monkey = {
  id: '',        // 存放页面id;
  jobs: 0,

  title: '',      // 标题;
  formats: {
    0: '标清',
    1: '高清',
    2: '起清',
  },
  videos: {
    0: [],
    1: [],
    2: [],
  },

  run: function() {
    log('run()--');
    this.getId();
  },

  /**
   * Get video id
   */
  getId: function() {
    log('getId()--');
    var scripts = document.querySelectorAll('script'),
        script,
        reg = /"id":(\d+),/,
        i,
        match,
        id;

    for (i = 0; script = scripts[i]; i += 1) {
      match = reg.exec(script.innerHTML);
      if (match && match.length > 1) {
        this.id= match[1];
        break;
      }
    }

    if (this.id.length > 0) {
      this.jobs = this.jobs + 1;
      this.getPlaylistUrl(0);

      this.jobs = this.jobs + 1;
      this.getPlaylistUrl(1);

      this.jobs = this.jobs + 1;
      this.getPlaylistUrl(2);
    }
  },

  /**
   * Get video playlist
   * 标清http://web-play.pptv.com/webplay3-0-16840115.xml?type=web.fpp&ft=0
   * 高清http://web-play.pptv.com/webplay3-0-16840115.xml?type=web.fpp&ft=1
   */
  getPlaylistUrl: function(format) {
    log('getPlaylistUrl() --');
    var pref = 'http://web-play.pptv.com/webplay3-0-',
        that = this,
        url = pref + this.id + '.xml?type=web.fpp&ft=' + format;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);
        that.createPlaylist(format, response.responseText);
      },
    });
  },

  createPlaylist: function(format, txt) {
    log('createPlaylist() --', format);
    log(this);
    var parser = new uw.DOMParser(),
        xml = parser.parseFromString(txt, 'text/xml'),
        channel = xml.querySelector('channel'),
        items = channel.querySelectorAll('file item'),
        rid = channel.getAttribute('rid'),
        sgms = xml.querySelectorAll('dragdata sgm'),
        server = xml.querySelector('dt sh').innerHTML,
        key = xml.querySelector('dt key').innerHTML,
        i;

    this.title = channel.getAttribute('nm');
    if (format < items.length) {
      for (i = 0; i < sgms.length; i += 1) {
        this.videos[format].push([
          'http://',
          server,
          '/',
          String(i),
          '/',
          rid,
          '?k=',
          key,
          '&type=web.fpp',
          ].join(''));
      }
    }

    this.jobs = this.jobs - 1;
    if (this.jobs === 0) {
      this.createUI();
    }
  },

  createUI: function() {
    log('createUI() --');
    log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
        },
        format;

    for (format in this.formats) {
      if (this.videos[format].length > 0) {
        videos.formats.push(this.formats[format]);
        videos.links.push(this.videos[format]);
      }
    }
    multiFiles.run(videos);
  },
};


monkey.run();

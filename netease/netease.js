
var monkey = {
  videos: {
    sd: '',
    hd: '',
    shd: '',
  },
  types: {
    sd: '标清',
    hd: '高清',
    shd: '超清',
  },
  title: '',
  subs: {
  },

  run: function() {
    log('run() --');

    this.getTitle();
    if (uw.document.title.search('网易公开课') > -1) {
      this.getOpenCourseSource();
    } else {
      this.getSource();
    }
  },

  getTitle: function() {
    log('getTitle() --');
    this.title = uw.document.title;
  },

  getOpenCourseSource: function() {
    log('getOpenCourseSource() --');
    var url = uw.document.location.href.split('/'),
        length = url.length,
        xmlUrl,
        that = this;

    xmlUrl = [
      'http://live.ws.126.net/movie',
      url[length - 3],
      url[length - 2],
      '2_' + url[length - 1].replace('html', 'xml'),
      ].join('/');
    log('xmlUrl: ', xmlUrl);

    GM_xmlhttpRequest({
      method: 'GET',
      url: xmlUrl,
      onload: function(response) {
        log('response: ', response);
        var xml = that.parseXML(response.responseText),
            type,
            video,
            subs,
            sub,
            subName,
            i;

        //that.title = xml.querySelector('all title').innerHTML;
        that.title = that.title.replace('_网易公开课', '');
        for (type in that.videos) {
          video = xml.querySelector('playurl ' + type +' mp4');
          if (video) {
            that.videos[type] = video.firstChild.data;
            continue;
          }
          video = xml.querySelector('playurl ' + type.toUpperCase() +' mp4');
          if (video) {
            that.videos[type] = video.firstChild.data;
          }
        }
        subs = xml.querySelectorAll('subs sub');
        for (i = 0; sub = subs[i]; i += 1) {
          subName = sub.querySelector('name').innerHTML + '字幕';
          that.subs[subName] = sub.querySelector('url').innerHTML;
        }
        that.createUI();
      },
    });
  },

  getSource: function() {
    log('getSource() --');
    var scripts = uw.document.querySelectorAll('script'),
        script,
        reg = /<source[\s\S]+src="([^"]+)"/,
        match,
        m3u8Reg = /appsrc\:\s*'([\s\S]+)\.m3u8'/,
        m3u8Match,
        i;

    for (i = 0; script = scripts[i]; i += 1) {
      match = reg.exec(script.innerHTML);
      log(match);
      if (match && match.length > 1) {
        this.videos.sd = match[1].replace('-mobile.mp4', '.flv');
        this.createUI();
        return true;
      }
      m3u8Match = m3u8Reg.exec(script.innerHTML);
      log(m3u8Match);
      if (m3u8Match && m3u8Match.length > 1) {
        this.videos.sd = m3u8Match[1].replace('-list', '') + '.mp4';
        this.createUI();
        return true;
      }
    }
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
        },
        format;

    for (format in this.videos) {
      if (this.videos[format].length > 0) {
        videos.formats.push(this.types[format]);
        videos.links.push(this.videos[format]);
      }
    }
    // TODO: add subtitle
    if (videos.links.length === 0) {
      videos.ok = false;
      videos.msg = 'Failed to parse video source';
    }
    singleFile.run(videos);
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

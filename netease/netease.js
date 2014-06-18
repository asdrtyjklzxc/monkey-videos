
var monkey = {

  plid: '',  // playlist id
  mid: '',   // video id
  raw_vid: '',
  title: '',
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
  subs: {
  },

  run: function() {
    console.log('run() --');

    this.getTitle();
    if (unsafeWindow.document.title.search('网易公开课') > -1) {
      this.getOpenCourseSource();
    } else {
      this.getSource();
    }
  },

  getTitle: function() {
    console.log('getTitle() --');
    this.title = unsafeWindow.document.title;
  },

  getOpenCourseSource: function() {
    console.log('getOpenCourseSource() --');
    var url = unsafeWindow.document.location.href.split('/'),
        length = url.length,
        xmlUrl,
        that = this;

    this.raw_vid = url[length - 1].replace('.html', '');
    this.plid = this.raw_vid.split('_')[0];
    this.mid = this.raw_vid.split('_')[1];
    xmlUrl = [
      'http://live.ws.126.net/movie',
      url[length - 3],
      url[length - 2],
      '2_' + this.raw_vid + '.xml',
      ].join('/');
    console.log('xmlUrl: ', xmlUrl);

    GM_xmlhttpRequest({
      method: 'GET',
      url: xmlUrl,
      onload: function(response) {
        console.log('response: ', response);
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
        that.getMobileOpenCourse();
      },
    });
  },

  /**
   * AES ECB decrypt is too large to embed, so use another way.
   */
  getMobileOpenCourse: function() {
    console.log('getMobileOpenCourse() --');
    var url = 'http://mobile.open.163.com/movie/' + this.plid + '/getMoviesForAndroid.htm',
        that = this;

    console.log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        console.log('response: ', response);
        var json = JSON.parse(response.responseText),
            video,
            i;

        console.log('json: ', json);
        that.title = json.title;
        for (i = 0; i < json.videoList.length; i += 1) {
          if (json.videoList[i].mid === that.mid) {
            video = json.videoList[i].repovideourl;
            break;
          }
        }
        console.log(video);
        if (that.videos.sd.length > 0) {
          that.videos.sd = video.replace('mobilev', 'movieMP4');
        }
        if (that.videos.hd.length > 0) {
          that.videos.hd = video.replace('mobilev', 'movieMP4');
        }
        //if (that.videos.shd.length > 0) {
          //that.videos.shd = video.replace('_sd.', '_shd.');
        //}
        that.createUI();
      },
    });
  },

  getSource: function() {
    console.log('getSource() --');
    var scripts = unsafeWindow.document.querySelectorAll('script'),
        script,
        reg = /<source[\s\S]+src="([^"]+)"/,
        match,
        m3u8Reg = /appsrc\:\s*'([\s\S]+)\.m3u8'/,
        m3u8Match,
        i;

    for (i = 0; script = scripts[i]; i += 1) {
      match = reg.exec(script.innerHTML);
      console.log(match);
      if (match && match.length > 1) {
        this.videos.sd = match[1].replace('-mobile.mp4', '.flv');
        this.createUI();
        return true;
      }
      m3u8Match = m3u8Reg.exec(script.innerHTML);
      console.log(m3u8Match);
      if (m3u8Match && m3u8Match.length > 1) {
        this.videos.sd = m3u8Match[1].replace('-list', '') + '.mp4';
        this.createUI();
        return true;
      }
    }
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
        formats = ['sd', 'hd', 'shd'],
        format,
        url,
        subName,
        i;

    for (i = 0; format = formats[i]; i += 1) {
      url = this.videos[format];
      if (url.length > 0) {
        videos.links.push([url]);
        videos.formats.push(this.types[format]);
      }
    }
    for (subName in this.subs) {
      videos.links.push([this.subs[subName]]);
      videos.formats.push(subName);
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
    if (unsafeWindow.document.implementation &&
        unsafeWindow.document.implementation.createDocument) {
      xmlDoc = new DOMParser().parseFromString(str, 'text/xml');
    } else {
      console.log('parseXML() error: not support current web browser!');
      return null;
    }
    return xmlDoc;
  },

};

monkey.run();

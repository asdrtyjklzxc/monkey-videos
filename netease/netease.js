
/**
 * 163.com
 */
var monkey_netease = {

  plid: '',  // playlist id
  mid: '',   // video id
  raw_vid: '',
  title: '',
  pl_title: '', // playlist title
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
    if (document.title.search('网易公开课') > -1) {
      this.getOpenCourseSource();
    } else {
      this.getSource();
    }
  },

  getTitle: function() {
    console.log('getTitle() --');
    this.title = document.title;
  },

  getOpenCourseSource: function() {
    console.log('getOpenCourseSource() --');
    var url = document.location.href.split('/'),
        urlMatch = /([A-Z0-9]{9})_([A-Z0-9]{9})/,
        match = urlMatch.exec(url),
        length = url.length,
        xmlUrl,
        that = this;

    if (! match || match.length !== 3) {
      console.error('Failed to get mid!', match);
      return;
    }
    this.raw_vid = match[0];
    this.plid = match[1];
    this.mid = match[2];
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
        var xml = parseXML(response.responseText),
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
        var json = JSON.parse(response.responseText),
            video,
            i;

        for (i = 0; i < json.videoList.length; i += 1) {
          video = json.videoList[i];
          console.log('video:', video);
          if (video.mid === that.mid) {
            that.videos.sd = video.repovideourlmp4Origin;
            that.videos.hd = video.repovideourl;
            that.title = video.title;
            that.pl_title = json.title;
            break;
          }
        }
        that.createUI();
      },
    });
  },

  getSource: function() {
    console.log('getSource() --');
    var scripts = document.querySelectorAll('script'),
        script,
        reg = /<source[\s\S]+src="([^"]+)"/,
        match,
        m3u8Reg = /appsrc\s*\:\s*'([\s\S]+)\.m3u8'/,
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

    if (this.pl_title.length > 0) {
      videos.title = this.title;
    }

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
};


monkey.extend('v.163.com', [
  'http://v.163.com/',
], monkey_netease);

monkey.extend('open.163.com', [
  'http://open.163.com/',
], monkey_netease);


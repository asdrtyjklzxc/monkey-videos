
/**
 * weiqitv.com
 */
var monkey_weiqitv = {
  sid: '',
  vid: '',
  title: '',
  videos: {},
  formats: {
    'default': '标清flv',  // 640x360
          '2': '高清flv',  // 960x540
          '3': '超清flv',  // 1280x720
          '4': '高清mp4',  // 850x480
          '5': '超清mp4',  // 1280x720
  },

  run: function() {
    console.log('run() -- ');
    this.title = document.title.replace('围棋TV - ', '');
    this.getVid();
  },

  getVid: function() {
    console.log('getVid() --');
    var vidReg = /vid:(\d+),/,
        vidMatch,
        sidReg = /sid:(\d+)\s*/,
        sidMatch,
        scripts = document.querySelectorAll('script'),
        script,
        i;

    for (i = 0; i < scripts.length; i += 1) {
      script = scripts[i];
      vidMatch = vidReg.exec(script.innerHTML);
      if (vidMatch && vidMatch.length === 2) {
        this.vid = vidMatch[1];
        sidMatch = sidReg.exec(script.innerHTML);
        this.sid = sidMatch[1];
        break;
      }
    }
    if (this.vid.length === 0) {
      console.error('Failed to get vid!');
    } else {
      this.getVideoInfo();
    }
  },

  getVideoInfo: function() {
    var that = this,
        url = [
          'http://www.yunsp.com.cn:8080/dispatch/videoPlay/getInfo?',
          'vid=', this.vid,
          '&sid=', this.sid,
          '&isList=0&ecode=notexist',
        ].join('');

    console.log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        var json = JSON.parse(response.responseText),
            videoInfo = json[0].videoInfo,
            format;

        for (format in that.formats) {
          if (format in videoInfo) {
            that.videos[format] = videoInfo[format].url;
          }
        }
        that.createUI();
      },
    });
  },

  /**
   * construct ui widgets.
   */
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
        types = ['default', '4', '2', '5', '3'],
        type,
        url,
        i;
  
    for (i = 0; type = types[i]; i += 1) {
      url = this.videos[type];
      if (url && url.length > 0) {
        videos.links.push([url]);
        videos.formats.push(this.formats[type]);
      }
    }

    multiFiles.run(videos);
  },
};

monkey.extend('www.weiqitv.com', [
  'http://www.weiqitv.com/index/live_back?videoId=',
  'http://www.weiqitv.com/index/video_play?videoId=',
], monkey_weiqitv);


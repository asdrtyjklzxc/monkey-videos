
/**
 * weiqitv.com
 */
var monkey_weiqitv = {
  sid: '',
  vid: '',
  title: '',
  videos: {},
  formats: {
    '2': '高清',
    '3': '超清',
    '5': '高清2',
    '4': '标清',
    'default': 'flv',
  },

  run: function() {
    console.log('run() -- ');
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
    this.title = document.title;
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

        that.title = videoInfo.name;
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
        types = ['default', '4', '5', '2', '3'],
        type,
        url,
        i;
  
    for (i = 0; type = types[i]; i += 1) {
      url = this.videos[type];
      if (url && url.length > 0) {
        videos.links.push(url);
        videos.formats.push(this.formats[type]);
      }
    }

    singleFile.run(videos);
  },
};

monkey.extend('www.weiqitv.com', [
  'http://www.weiqitv.com/index/live_back?videoId=',
], monkey_weiqitv);


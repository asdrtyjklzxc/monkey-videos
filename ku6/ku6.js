
var monkey = {

  vid: '',
  title: '',
  links: [],
  type: '标清',

  run: function() {
    log('run() --');
    this.getVid();
  },

  /**
   * 获取video id, 用于构建下载链接.
   */
  getVid: function() {
    log('getVid() --');
    var url = uw.location.href,
        vid_reg = /\/([^\/]+)\.html/,
        vid_match = vid_reg.exec(url);

    log(vid_match);
    if (vid_match && vid_match.length == 2) {
      this.vid = vid_match[1];
      this.getVideo();
    }
  },

  getVideo: function() {
    log('getVideo() --');
    var url = 'http://v.ku6.com/fetchVideo4Player/' + this.vid + '.html',
        that = this;

    log('url:', url);
    GM_xmlhttpRequest({
      url: url,
      method: 'GET',
      onload: function(response) {
        log('response:', response);
        var video_obj = JSON.parse(response.responseText);
        log(video_obj);
        that.title = video_obj.data.t;
        that.links = video_obj.data.f.split(',');
        that.createUI();
      },
    });
  },

  createUI: function() {
    log('createUI() --');
    log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
        };

    if (this.links.length > 0) {
      videos.formats.push(this.type);
      videos.links.push(this.links);
      multiFiles.run(videos);
    } else {
      error('this.video is empty');
    }
  },
};

monkey.run();


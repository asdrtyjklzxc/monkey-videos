
/**
 * ku6.com
 */
var monkey_ku6 = {

  vid: '',
  title: '',
  links: [],
  type: '标清',

  run: function() {
    console.log('run() --');
    this.getVid();
  },

  /**
   * 获取video id, 用于构建下载链接.
   */
  getVid: function() {
    console.log('getVid() --');
    var url = location.href,
        vid_reg = /\/([^\/]+)\.html/,
        vid_match = vid_reg.exec(url);

    console.log(vid_match);
    if (vid_match && vid_match.length == 2) {
      this.vid = vid_match[1];
      this.getVideo();
    }
  },

  getVideo: function() {
    console.log('getVideo() --');
    var url = 'http://v.ku6.com/fetchVideo4Player/' + this.vid + '.html',
        that = this;

    console.log('url:', url);
    GM_xmlhttpRequest({
      url: url,
      method: 'GET',
      onload: function(response) {
        console.log('response:', response);
        var video_obj = JSON.parse(response.responseText);
        console.log(video_obj);
        that.title = video_obj.data.t;
        that.links = video_obj.data.f.split(',');
        that.createUI();
      },
    });
  },

  createUI: function() {
    console.log('createUI() --');
    console.log(this);
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
      console.error('this.video is empty');
    }
  },
};

monkey.extend('v.ku6.com', [
  'http://v.ku6.com/',
], monkey_ku6);

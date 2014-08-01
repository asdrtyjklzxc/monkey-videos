
var monkey = {
  vid: '',
  origUrl: '',

  run: function() {
    this.getVid();
    if (this.vid.length === 0) {
      console.error('Failed to get video id!');
      this.createUI();
    } else {
      this.getVideoLink();
    }
  },

  getVid: function() {
    console.log('getVid()');
    var videos = document.querySelectorAll(
          'div#area-part-view div.l a'),
        video,
        i;

    console.log('videos: ', videos);
    for (i = 0; video = videos[i]; i += 1) {
      if (video.className.search('active') > 0) {
        this.vid = video.getAttribute('data-vid');
        return;
      }
    }
    console.error('Failed to get vid');
  },

  /**
   * Get video link from a json object
   */
  getVideoLink: function() {
    console.log('getVideoLink()');
    console.log(this);
    //var url = 'http://www.acfun.tv/api/getVideoByID.aspx?vid=' + this.vid,
    var url = 'http://www.acfun.tv/video/getVideo.aspx?id=' + this.vid,
        that = this;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        console.log('response:', response);
        var json = JSON.parse(response.responseText);

        if (json.success) {
          that.origUrl = json.sourceUrl;
        }
        that.createUI();
      },
    });
  },

  createUI: function() {
    console.log('createUI() --');
    console.log(this);
    var videos = {
          title: '原始地址',
          formats: [],
          links: [],
          ok: true,
          msg: '',
        };

    if (this.origUrl.length === 0) {
      videos.ok = false;
      videos.msg = '视频已被删除';
      singleFile.run(videos);
    } else {
      videos.formats.push(' ');
      videos.links.push(this.origUrl);
      singleFile.run(videos);
    }
  },
}

monkey.run();


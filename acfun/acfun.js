
var monkey = {
  vid: '',
  origUrl: '',

  run: function() {
    this.getVid();
    if (this.vid.length === 0) {
      error('Failed to get video id!');
      this.createUI();
    } else {
      this.getVideoLink();
    }
  },

  getVid: function() {
    log('getVid()');
    var videos = uw.document.querySelectorAll('div#area-part-view div.l a'),
        video,
        i;

    log('videos: ', videos);
    for (i = 0; video = videos[i]; i += 1) {
      if (video.className.search('active') > 0) {
        this.vid = video.getAttribute('data-vid');
        return;
      }
    }
    error('Failed to get vid');
  },

  /**
   * Get video link from a json object
   */
  getVideoLink: function() {
    log('getVideoLink()');
    log(this);
    //var url = 'http://www.acfun.tv/api/getVideoByID.aspx?vid=' + this.vid,
    var url = 'http://www.acfun.tv/video/getVideo.aspx?id=' + this.vid,
        that = this;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response:', response);
        var json = JSON.parse(response.responseText);

        if (json.success) {
          that.origUrl = json.sourceUrl;
        }
        that.createUI();
      },
    });
  },

  createUI: function() {
    log('createUI() --');
    log(this);
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


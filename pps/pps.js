
var monkey = {
  vid: '',
  title: '',
  types: {
    1: '高清',
    2: '标清',
    3: '流畅',
  },
  videoUrl: {
    1: '',
    2: '',
    3: '',
  },
  jobs: 3,
  fromIqiyi: false,

  run: function() {
    log('run()');
    if (uw.location.href.search('pps.tv/play_') !== -1) {
      this.getId();
    } else {
      error('Failed to get vid!');
    }
  },

  getId: function() {
    log('getId() -- ');
    var vidReg = /play_([\s\S]+)\.html/,
        vidMatch = vidReg.exec(uw.document.location.href),
        titleReg = /([\s\S]+)-在线观看/,
        titleMatch = titleReg.exec(uw.document.title);
    if (vidMatch) {
      this.vid = vidMatch[1];
    }
    if (titleMatch) {
      this.title = titleMatch[1];
    }
    if (this.vid.length > 0) {
      this.getUrl(1); // 高清
      this.getUrl(2); // 标清
      this.getUrl(3); // 流畅
    }
  },

  getUrl: function(type) {
    log('getUrl()');
    var url = [
      'http://dp.ppstv.com/get_play_url_cdn.php?sid=',
      this.vid,
      '&flash_type=1&type=',
      type,
      ].join(''),
      that = this;

    log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log(response);
        var txt = response.responseText;

        if (txt.search('.pfv?') > 0) {
          that.videoUrl[type] = txt.substr(0, txt.search('.pfv?') + 4);
        }
        that.jobs -= 1;
        if (that.jobs === 0) {
          that.createUI();
        }
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
        },
        types = [3, 2, 1],
        type,
        i;

    for (i = 0; type = types[i]; i += 1) {
      if (this.videoUrl[type]) {
        videos.links.push([this.videoUrl[type]]);
        videos.formats.push(this.types[type]);
      }
    }

    multiFiles.run(videos);
  },
}

monkey.run();

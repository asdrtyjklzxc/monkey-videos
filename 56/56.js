
var monkey = {
  title: '',
  id: '',
  json: null,
  videos: null,
  formats: {
    'normal': '标清',
    'clear': '高清',
    'super': '超清',
  },

  run: function() {
    log('run() --');
    this.getID();
    if (this.id.length > 0) {
      this.getPlaylist();
    } else {
      error('Failed to get video id!');
      return;
    }
  },

  /**
   * Get video id
   */
  getID: function() {
    log('getID() --');
    var url = uw.location.href,
        idReg = /\/v_(\w+)\.html/,
        idMatch = idReg.exec(url),
        albumIDReg = /_vid-(\w+)\.html/,
        albumIDMatch = albumIDReg.exec(url);

    log(idMatch);
    log(albumIDMatch);
    if (idMatch && idMatch.length === 2) {
      this.id = idMatch[1]; 
    } else if (albumIDMatch && albumIDMatch.length === 2) {
      this.id = albumIDMatch[1];
    }
    log(this);
  },

  /**
   * Get video playlist from a json object
   */
  getPlaylist: function() {
    log('getPlaylist() --');
    var url = 'http://vxml.56.com/json/' + this.id + '/?src=out',
        that = this;

    log('url: ', url);
    GM_xmlhttpRequest({
      method: 'get',
      url: url,
      onload: function(response) {
        log('response:', response);
        var txt = response.responseText,
            json = JSON.parse(txt);

        that.json = json;
        if (json.msg == 'ok' && json.status == '1') {
          that.title = json.info.Subject;
          that.videos = json.info.rfiles;
        }
        that.createUI();
      },
    });
  },

  createUI: function() {
    log('createUI() --');
    var videos = {
          title: this.title,
          formats: [],
          links: [],
          ok: true,
          msg: '',
        },
        video = '',
        video,
        a,
        i;

    if (this.title.length === 0) {
      videos.ok = false;
      videos.msg = 'Failed to get playlist';
      singleFile.run(videos);
      return;
    }

    for (i = 0; i < this.videos.length; i += 1) {
      video = this.videos[i];
      videos.links.push(video.url);
      videos.formats.push(this.formats[video.type]);
    }
    singleFile.run(videos);
  },
}

monkey.run();


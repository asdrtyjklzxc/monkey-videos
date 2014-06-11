
var monkey = {
  title: '',
  id: '',
  json: null,
  videos: {
    'normal': '',
    'clear': '',
    'super': '',
  },

  run: function() {
    console.log('run() --');
    this.getID();
    if (this.id.length > 0) {
      this.getPlaylist();
    } else {
      console.error('Failed to get video id!');
      return;
    }
  },

  /**
   * Get video id
   */
  getID: function() {
    console.log('getID() --');
    var url = unsafeWindow.location.href,
        idReg = /\/v_(\w+)\.html/,
        idMatch = idReg.exec(url),
        albumIDReg = /_vid-(\w+)\.html/,
        albumIDMatch = albumIDReg.exec(url);

    console.log(idMatch);
    console.log(albumIDMatch);
    if (idMatch && idMatch.length === 2) {
      this.id = idMatch[1]; 
    } else if (albumIDMatch && albumIDMatch.length === 2) {
      this.id = albumIDMatch[1];
    }
    console.log(this);
  },

  /**
   * Get video playlist from a json object
   */
  getPlaylist: function() {
    console.log('getPlaylist() --');
    var url = 'http://vxml.56.com/json/' + this.id + '/?src=out',
        that = this;

    console.log('url: ', url);
    GM_xmlhttpRequest({
      method: 'get',
      url: url,
      onload: function(response) {
        console.log('response:', response);
        var txt = response.responseText,
            json = JSON.parse(txt),
            video,
            i;

        that.json = json;
        if (json.msg == 'ok' && json.status == '1') {
          that.title = json.info.Subject;
          for (i = 0; video = json.info.rfiles[i]; i = i + 1) {
            that.videos[video.type] = video.url;
          }
        }
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
          ok: true,
          msg: '',
        },
        formats = ['normal', 'clear', 'super'],
        format_names = ['标清', '高清', '超清'],
        format,
        link,
        i;

    for (i = 0; format = formats[i]; i += 1) {
      if (format in this.videos && this.videos[format].length > 0) {
        videos.links.push([this.videos[format]]);
        videos.formats.push(format_names[i]);
      } else {
        console.error('This video type is not supported: ', format);
      }
    }
    console.log(videos);
    multiFiles.run(videos);
  },
}

monkey.run();


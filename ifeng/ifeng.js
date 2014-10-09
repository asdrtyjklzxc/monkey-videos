
var monkey = {
  id: '',
  title: '',
  links: [],

  run: function() {
    console.log('run() --');
    this.getId();
  },

  getId: function() {
    console.log('getId() --');
    var reg = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/,
        match = reg.exec(location.href);

    if (match && match.length === 2) {
      this.id = match[1];
      this.downloadById();
    } else {
      console.error('Failed to get video id');
    }
  },

  downloadById: function() {
    console.log('downloadById() --');
    var length = this.id.length,
        url = [
          'http://v.ifeng.com/video_info_new/',
          this.id[length-2],
          '/',
          this.id.substr(length-2),
          '/',
          this.id,
          '.xml'
         ].join(''),
         that = this;

    console.log('url:', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        var xml = new DOMParser().parseFromString(response.responseText,
                                                  'text/xml'),
            item = xml.querySelector('item');

        that.title = item.getAttribute('Name');
        that.links.push(item.getAttribute('VideoPlayUrl'));
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
        };
    videos.formats.push('标清');
    videos.links = this.links;
    singleFile.run(videos);
  },
};

monkey.run();

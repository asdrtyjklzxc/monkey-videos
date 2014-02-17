
var monkey = {
  title: '',
  link: '',

  run: function() {
    log('run() --');
    this.getTitle();
    this.createUI();
  },

  getTitle: function() {
    var titleElem = uw.document.querySelector('div#title');
    if (titleElem) {
      this.title = titleElem.innerHTML;
      this.link = encodeURI([
          'http://dl.justing.com.cn/page/',
          this.title,
          '.mp3'].join(''));
    }
  },

  createUI: function() {
    log('createUI() --');
    log(this);
    var videos = {
          title: this.title,
          links: [],
          formats: [],
          ok: true,
          msg: '',
        };
    if (this.title.length === 0) {
      videos.ok = false;
      videos.msg = 'Failed to get mp3 link';
    } else {
      videos.links.push(this.link);
      videos.formats.push('mp3');
    }
    singleFile.run(videos);
  },


};

monkey.run();


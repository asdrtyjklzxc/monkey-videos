
/**
 * justing.com.cn
 */
var monkey_justing = {
  title: '',
  link: '',

  run: function() {
    console.log('run() --');
    this.getTitle();
    this.createUI();
  },

  getTitle: function() {
    var titleElem = unsafeWindow.document.querySelector('div#title');
    if (titleElem) {
      this.title = titleElem.innerHTML;
      this.link = encodeURI([
          'http://dl.justing.com.cn/page/',
          this.title,
          '.mp3'].join(''));
    }
  },

  createUI: function() {
    console.log('createUI() --');
    console.log(this);
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
      videos.links.push([this.link]);
      videos.formats.push('mp3');
    }
    multiFiles.run(videos);
  },


};

monkey.extend('www.justing.com.cn', [
  'http://www.justing.com.cn/page/',
], monkey_justing);

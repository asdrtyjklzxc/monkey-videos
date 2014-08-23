
var monkey = {

  title: '',
  download_url: null,
  intervalId: 0,
  formats: {
    800000: '标清',
    1200000: '高清',
  },

  run: function() {
    var that = this;
    console.log('run() --');
    this.intervalId = window.setInterval( function() {
      console.log('getDownloadUrl() --');

      console.log(unsafeWindow.download_url);
      console.log(that);
      if (unsafeWindow.download_url && unsafeWindow.download_url['800000']) {
        window.clearInterval(that.intervalId);
        that.download_url = unsafeWindow.download_url;
        that.title = document.title;
        that.createUI();
      } else {
        console.error('Failed to get `download_url`!');
      }
    }, 1000);
  },
  createUI: function() {
    console.log('createUI() --');
    console.log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
        },
        format,
        i;

    for (format in this.download_url) {
      if (format in this.formats) {
        videos.formats.push(this.formats[format]);
      } else {
        videos.formats.push('Unkown');
      }
      videos.links.push([this.download_url[format]]);
    }

    multiFiles.run(videos);
  },

}

monkey.run();

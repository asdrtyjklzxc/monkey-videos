
var monkey = {

  title: '',
  download_url: null,
  formats: {
    800000: '标清',
    1200000: '高清',
  },

  run: function() {
    log('run() --');
    this.getTitle();
  },

  getTitle: function() {
    log('getTitle() --');
    var scripts = uw.document.querySelectorAll('script'),
        script,
        content,
        i,
        url_reg = /var download_url = eval([^;]+);/m,
        url_match,
        download_url;

    this.title = uw.document.title;
    for (i = 0; script = scripts[i]; i += 1) {
      content = script.innerHTML;
      if (content.search('var download_url')) {
        url_match = url_reg.exec(content);
        log(url_match);
        if (url_match && url_match.length === 2) {
          download_url = url_match[0];
          eval(download_url); // will override download_url
          this.download_url = download_url;
          break;
        } else {
          error('Failed to match download url!');
        }
      }
    }

    if (this.download_url != null) {
      this.createUI();
    } else {
      error('Will not create UI!');
    }
  },

  createUI: function() {
    log('createUI() --');
    log(this);
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

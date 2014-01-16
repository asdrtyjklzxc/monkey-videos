
var monkey = {
  pid: '',
  vid: '',
  title: '',

  // '350': 标清.
  // '1000': 高清.
  videoUrl: {
    '350': null,
    '1000': null,
  },

  run: function() {
    log('run() -- ');
    this.showImages();

    var url = uw.location.href;
    log('url:', url);

    if (url.search('yuanxian.letv') !== -1) {
      // movie info page.
      this.addLinkToYuanxian();
    } else if (url.search('ptv/pplay/') > 1 ||
               url.search('ptv/vplay/' > 1)) {
      this.getVid();
    } else {
      error('I do not know what to do!');
    }
  },

  showImages: function() {
    log('showImages() --');
    var imgs = uw.document.getElementsByTagName('img'),
        img,
        i;

    for (i = 0; img = imgs[i]; i += 1) {
      if (img.hasAttribute('data-src')) {
        img.src = img.getAttribute('data-src');
      }
    }
  },

  /**
   * Show original video link in video index page.
   */
  addLinkToYuanxian: function() {
    log('addLinkToYuanxian() --');
    var pid = uw.__INFO__.video.pid,
        url = 'http://www.letv.com/ptv/pplay/' + pid + '.html',
        titleLink = uw.document.querySelector('dl.w424 dt a');

    titleLink.href = url;
  },

  /**
   * Get video id
   */
  getVid: function() {
    log('getVid() --')
    var input = uw.document.querySelector('.add input'),
        vidReg = /\/(\d+)\.html$/,
        vidMatch;

    log(input);
    if (input && input.hasAttribute('value')) {
      vidMatch = vidReg.exec(input.getAttribute('value'));
    } else {
      error('Failed to get input element');
      return;
    }

    log('vidMatch: ', vidMatch);
    if (vidMatch && vidMatch.length === 2) {
      this.vid = vidMatch[1];
      this.getVideoXML();
    } else {
      error('Failed to get video ID!');
      return;
    }
  },

  /**
   * Get video info from an xml file
   */
  getVideoXML: function() {
    log('getVideoXML() --');
    var url = 'http://www.letv.com/v_xml/' + this.vid + '.xml',
        that = this;

    log('videoXML url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);
        var txt = response.responseText,
            //xml = that.parseXML(txt);
            jsonReg = /<playurl><!\[CDATA\[([\s\S]+)\]\]><\/playurl/,
            match = jsonReg.exec(txt),
            jsonTxt = '',
            json = '';

        log('match: ', match);
        if (match && match.length == 2) {
          jsonTxt = match[1];
          json = JSON.parse(jsonTxt);
          log('json: ', json);
          that.title = json.title;
          that.getVideoUrl(json);
        } else {
          error('Failed to get video json');
        }
      },
    });
  },

  /**
   * Parse video url
   */
  getVideoUrl: function(json) {
    log('getVideoUrl() --');
    log('json.dispatch: ', json.dispatch);
    this.videoUrl['350'] = json.dispatch && json.dispatch['350'] && json.dispatch['350'][0];
    this.videoUrl['1000'] = json.dispatch && json.dispatch['1000'] && json.dispatch['1000'][0];
    this.createUI();
  },

  /**
   * construct ui widgets.
   */
  createUI: function() {
    log('createUI() --');
    log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
          ok: true,
          msg: '',
        };


    // 标清:
    if (this.videoUrl['350']) {
      videos.links.push(this.videoUrl['350']);
      videos.formats.push('标清');
    }

    // 高清:
    if (this.videoUrl['1000']) {
      videos.links.push(this.videoUrl['1000']);
      videos.formats.push('高清');
    }

    singleFile.run(videos);
  },

  /**
   * Create a new <style> tag with str as its content.
   * @param string styleText
   *   - The <style> tag content.
   */
  addStyle: function(styleText) {
    var style = uw.document.createElement('style');
    if (uw.document.head) {
      uw.document.head.appendChild(style);
      style.innerHTML = styleText;
    }
  },

  /**
   * Convert string to xml
   * @param string str
   *  - the string to be converted.
   * @return object xml
   *  - the converted xml object.
   */
  parseXML: function(str) {
    if (uw.document.implementation &&
        uw.document.implementation.createDocument) {
      xmlDoc = new DOMParser().parseFromString(str, 'text/xml');
    } else {
      log('parseXML() error: not support current web browser!');
      return null;
    }
    return xmlDoc;
  },
}

monkey.run();


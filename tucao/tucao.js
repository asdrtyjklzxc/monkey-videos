
var monkey = {

  url: '',
  title: '',
  playerId: '',
  vid: '',
  vids: [],
  pos: 0,
  videos: [],
  formats: [],
  redirect: false,
  types: {
    sina: 'sina.php',
    tudou: false,  // redirect to original url
    youku: false,  // redirect to original url
  },

  run: function() {
    log('run()');
    this.getVid();
  },

  /**
   * Get video id
   */
  getVid: function() {
    log('getVid() -- ');
    var playerCode = uw.document.querySelectorAll('ul#player_code li');

    if (playerCode && playerCode.length === 2) {
      this.vids = playerCode[0].firstChild.nodeValue.split('**');
      if (this.vids[this.vids.length - 1] == '') {
        // remove empty vid
        this.vids.pop();
      }
      this.playerId = playerCode[1].innerHTML;
      this.getTitle();
    }
  },

  /**
   * Get video title
   */
  getTitle: function() {
    log('getTitle()');
    if (this.vids.length === 1 || uw.location.hash === '') {
      this.pos = 0;
      this.url = uw.location.href;
    } else {
      // hash starts with 1, not 0
      this.pos = parseInt(uw.location.hash.replace('#', '')) - 1;
      this.url = uw.location.href.replace(uw.location.hash, '');
    }
    this.vid = this.vids[this.pos].split('|')[0];
    if (this.vids.length === 1) {
      this.title = uw.document.title.substr(0, uw.document.title.length - 16);
    } else {
      this.title = this.vids[this.pos].split('|')[1];
    }
    this.getUrl();
  },

  /**
   * Get original url
   */
  getUrl: function(type) {
    log('getUrl()');
    var url,
        params,
        that = this;

    params = this.getQueryVariable(this.vid);
    if (this.types[params.type] === false) {
      this.redirectTo(params);
      return;
    }

    url = [
      'http://www.tucao.cc/api/',
      this.types[params.type],
      '?vid=',
      params.vid,
      ].join('');

    log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log(response);
        var xml = that.parseXML(response.responseText),
            durl = xml.querySelector('durl'),
            urls = durl.querySelectorAll('url'),
            url,
            i;

        for (i = 0; url = urls[i]; i += 1) {
          that.videos.push(
            url.innerHTML.replace('<![CDATA[', '').replace(']]>', ''));
          that.formats.push(' ');
        }

        log(that);
        that.createUI();
      },
    });
  },

  /**
   * Redirect to original url
   */
  redirectTo: function(params) {
    log('redirectTo() --');
    var urls = {
          tudou: function(vid) {
            return 'http://www.tudou.com/programs/view/' + vid + '/';
          },
          youku: function(vid) {
            return 'http://v.youku.com/v_show/id_' + vid + '.html';
          },
        };

    this.redirect = true;
    this.videos.push(urls[params.type](params.vid));
    this.formats.push('原始地址');
    this.createUI();
  },

  /**
   * Construct ui widgets
   */
  createUI: function() {
    log('createUI() -- ');
    log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
          ok: true,
          msg: '',
        },
        video,
        i;

    for (i = 0; i < this.videos.length; i += 1) {
      videos.links.push(this.videos[i]);
      videos.formats.push(this.formats[i]);
    }
    singleFile.run(videos);
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

  /**
   * Split query parameters in url and convert to object
   */
  getQueryVariable: function(query) {
    var vars = query.split('&'),
        params = {},
        param,
        i;

    for (i = 0; i < vars.length; i += 1) {
      param = vars[i].split('=');
      params[param[0]] = param[1];
    }
    return params;
  },
}

monkey.run();


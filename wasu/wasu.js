
var monkey = {

  id: '',
  title: '',
  rawLink: '',
  link: '',
  format: '高清',

  run: function() {
    log('run() --');
    this.getVid();
  },

  /**
   * Get video id
   */
  getVid: function() {
    log('getVid() --');
    var idReg = /show\/id\/(\d+)/,
        idMatch = idReg.exec(uw.document.location.href);

    if (idMatch && idMatch.length === 2) {
      this.id = idMatch[1];
      this.getVideoInfo();
    } else {
      this.createUI();
    }
  },

  /**
   * Get video information from an xml file.
   */
  getVideoInfo: function() {
    log('getVideoInfo() --');
    var url = 'http://www.wasu.cn/Api/getPlayInfoById/id/' + this.id + '/datatype/xml',
        that = this;

    GM_xmlhttpRequest({
      url: url,
      method: 'GET',
      onload: function(response) {
        log('response: ', response);
        var xmlObj = that.parseXML(response.responseText);
        if (! xmlObj) {
          that.createUI();
          return;
        }
        that.title = xmlObj.querySelector('title').textContent;
        that.rawLink = xmlObj.querySelector('video').innerHTML;
        that.modifyLink();
        that.createUI();
      },
    });
  },

  modifyLink: function() {
    log('modifyLink() --');
    if (this.rawLink.length === 0) {
      return;
    }
    this.link = this.rawLink.replace('vodipad', 'p2pvod');
  },

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

    if (this.link.length === 0) {
      videos.ok = false;
      videos.msg = 'Failed to get video link';
    } else {
      videos.formats.push(this.format);
      videos.links.push(this.link);
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

};

monkey.run();


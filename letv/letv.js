
var monkey = {
  pid: '',
  vid: '',   // video id
  title: '',
  stime: 0, // server timestamp
  tkey: 0,  // time key

  videoUrl: {
    '350': null,
    '1000': null,
    '1300': null,
    '720p': null,
    '1080p': null,
  },
  videoFormats: {
    '350': '流畅',
    '1000': '标清',
    '1300': '高清',
    '720p': '720P',
    '1080p': '1080P',
  },

  run: function() {
    log('run() -- ');
    var url = uw.location.href;

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
      this.getTimestamp();
    } else {
      error('Failed to get video ID!');
      return;
    }
  },

  /**
   * Get timestamp from server
   */
  getTimestamp: function() {
    log('getTimestamp() --');
    var tn = Math.random(),
        url = 'http://api.letv.com/time?tn=' + tn.toString(),
        that = this;

    log('url:', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response:', response);
        var obj = JSON.parse(response.responseText);
        that.stime = parseInt(obj.stime);
        that.tkey = that.getKey(that.stime);
        that.getVideoXML();
      },
    });
  },

  /**
   * Get time key
   * @param integer t, server time
   */
  getKey: function(t) {
    log('getKey() --', t);
    for(var e = 0, s = 0; s < 8; s += 1){
            e = 1 & t;
            t >>= 1;
            e <<= 31;
            t += e;
    }
    return t ^ 185025305;
  },

  /**
   * Get video info from an xml file
   */
  getVideoXML: function() {
    log('getVideoXML() --');
    var url = [
          'http://api.letv.com/mms/out/video/play?',
          'id=', this.vid,
          '&platid=1&splatid=101&format=1',
          '&tkey=', this.tkey,
          '&domain=http%3A%2F%2Fwww.letv.com'
          ].join(''),
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
   * Remove useless parameters in video link.
   */
  escapeUrl: function(url) {
    log('escapeUrl() --', url);
    var index = url.search('&platid');

    if (index > -1) {
      return url.substr(0, index);
    } else {
      error('Failed to escape url:', url);
    }
  },

  /**
   * Parse video url
   */
  getVideoUrl: function(json) {
    log('getVideoUrl() --');
    for (var key in this.videoUrl) {
      if (key in json.dispatch) {
        this.videoUrl[key] = this.escapeUrl(json.dispatch[key][0]);
      }
    }
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
        },
        types = ['350', '1000', '1300', '720p', '1080p'],
        type,
        i;
  
    for (i = 0; type = types[i]; i += 1) {
      if (this.videoUrl[type].length > 0) {
        videos.links.push([this.videoUrl[type]]);
        videos.formats.push(this.videoFormats[type]);
      }
    }

    multiFiles.run(videos);
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


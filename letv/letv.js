
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
    '1000': '高清',
    '1300': '超清',
    '720p': '720P',
    '1080p': '1080P',
    '4k': '4K', // does not support yet.
  },

  run: function() {
    console.log('run() -- ');
    var url = location.href;

    if (url.search('yuanxian.letv') !== -1) {
      // movie info page.
      this.addLinkToYuanxian();
    } else if (url.search('ptv/pplay/') > 1 ||
               url.search('ptv/vplay/' > 1)) {
      this.getVid();
    } else {
      console.error('I do not know what to do!');
    }
  },

  /**
   * Show original video link in video index page.
   */
  addLinkToYuanxian: function() {
    console.log('addLinkToYuanxian() --');
    var pid = __INFO__.video.pid,
        url = 'http://www.letv.com/ptv/pplay/' + pid + '.html',
        titleLink = document.querySelector('dl.w424 dt a');

    titleLink.href = url;
  },

  /**
   * Get video id
   */
  getVid: function() {
    console.log('getVid() --')
    var input = document.querySelector('.add input'),
        vidReg = /\/(\d+)\.html$/,
        vidMatch;

    console.log(input);
    if (input && input.hasAttribute('value')) {
      vidMatch = vidReg.exec(input.getAttribute('value'));
    } else {
      console.error('Failed to get input element');
      return;
    }

    console.log('vidMatch: ', vidMatch);
    if (vidMatch && vidMatch.length === 2) {
      this.vid = vidMatch[1];
      this.getTimestamp();
    } else {
      console.error('Failed to get video ID!');
      return;
    }
  },

  /**
   * Get timestamp from server
   */
  getTimestamp: function() {
    console.log('getTimestamp() --');
    var tn = Math.random(),
        url = 'http://api.letv.com/time?tn=' + tn.toString(),
        that = this;

    console.log('url:', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        console.log('response:', response);
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
    console.log('getKey() --', t);
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
    console.log('getVideoXML() --');
    var url = [
          'http://api.letv.com/mms/out/video/play?',
          'id=', this.vid,
          '&platid=1&splatid=101&format=1',
          '&tkey=', this.tkey,
          '&domain=http%3A%2F%2Fwww.letv.com'
          ].join(''),
        that = this;

    console.log('videoXML url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        console.log('response: ', response);
        var txt = response.responseText,
            //xml = that.parseXML(txt);
            jsonReg = /<playurl><!\[CDATA\[([\s\S]+)\]\]><\/playurl/,
            match = jsonReg.exec(txt),
            jsonTxt = '',
            json = '';

        console.log('match: ', match);
        if (match && match.length == 2) {
          jsonTxt = match[1];
          json = JSON.parse(jsonTxt);
          console.log('json: ', json);
          that.title = json.title;
          that.getVideoUrl(json);
        } else {
          console.error('Failed to get video json');
        }
      },
    });
  },

  /**
   * Parse video url
   */
  getVideoUrl: function(json) {
    console.log('getVideoUrl() --');
    var key,
        url;

    for (key in this.videoUrl) {
      if (key in json.dispatch) {
        url = json.dispatch[key][0] + '&termid=1&format=0&hwtype=un&ostype=Windows7&tag=letv&sign=letv&expect=1&pay=0&rateid=' + key;
        this.videoUrl[key] = url;
      }
    }
    this.createUI();
  },

  /**
   * construct ui widgets.
   */
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
        types = ['350', '1000', '1300', '720p', '1080p'],
        type,
        url,
        i;
  
    for (i = 0; type = types[i]; i += 1) {
      url = this.videoUrl[type];
      if (url) {
        videos.links.push([this.videoUrl[type]]);
        videos.formats.push(this.videoFormats[type]);
      }
    }

    multiFiles.run(videos);
  },

  /**
   * Convert string to xml
   * @param string str
   *  - the string to be converted.
   * @return object xml
   *  - the converted xml object.
   */
  parseXML: function(str) {
    if (document.implementation &&
        document.implementation.createDocument) {
      xmlDoc = new DOMParser().parseFromString(str, 'text/xml');
    } else {
      console.log('parseXML() error: not support current web browser!');
      return null;
    }
    return xmlDoc;
  },
}

monkey.run();


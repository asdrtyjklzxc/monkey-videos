
var monkey = {
  pid: '',
  title: '',
  json: [],
  videos: {
    chapters: [],
    chapters2: [],
  },

  run: function() {
    console.log('run() --');
    this.router();
  },

  router: function() {
    console.log('router() --');
    var href = location.href,
        schema;
    if (href.search('search.cctv.com/playVideo.php?') > -1) {
      schema = this.hashToObject(location.search.substr(1));
      this.pid = schema.detailsid;
      this.title = decodeURI(schema.title);
      this.getVideoInfo();
    } else if (href.search('tv.cntv.cn/video/') > -1) {
      this.pid = href.match(/\/([^\/]+)$/)[1];
      this.title = document.title.substring(0, document.title.length - 8);
      this.getVideoInfo();
    } else {
      this.getPidFromSource();
    }
  },

  /**
   * Get video pid from html source file
   */
  getPidFromSource: function() {
    console.log('getPidFromSource() --');
    var that = this;

    GM_xmlhttpRequest({
      url: location.href,
      method: 'GET',
      onload: function(response) {
        console.log('response:', response);
        that.parsePid(response.responseText);
      },
    });
  },

  /**
   * Parse txt and get pid of video
   */
  parsePid: function(txt) {
    console.log('parsePid() --');
    var pidReg = /code\.begin-->([^<]+)/,
        pidMatch = pidReg.exec(txt),
        titleReg = /title\.begin-->([^<]+)/,
        titleMatch = titleReg.exec(txt);

    if (titleMatch && titleMatch.length === 2) {
      this.title = titleMatch[1];
    } else {
      this.title = document.title;
    }

    console.log('pidMatch:', pidMatch);
    if (pidMatch && pidMatch.length === 2) {
      this.pid = pidMatch[1];
      this.getVideoInfo();
    } else {
      console.error('Failed to get Pid');
      return;
    }
  },

  /**
   * Get video info, including formats and uri
   */
  getVideoInfo: function() {
    console.log('getVideoInfo() --');
    var url = [
          'http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?',
          'tz=-8&from=000tv&idlr=32&modified=false&idl=32&pid=',
          this.pid,
          '&url=',
          location.href,
        ].join(''),
        that = this;

    console.log('url:', url);
    GM_xmlhttpRequest({
      url: url,
      method: 'GET',
      onload: function(response) {
        console.log('response: ', response);
        that.json = JSON.parse(response.responseText);
        console.log('that: ', that);
        that.parseVideos();
      },
    });
  },

  /**
   * Parse video info from json object.
   */
  parseVideos: function() {
    console.log('parseVideos() --');
    var chapter;

    for (chapter in this.json.video) {
      if (chapter.startsWith('chapters')) {
        this.parseChapter(chapter);
      }
    }

    this.createUI();
  },

  /**
   * Parse specified chapter, list of video links.
   */
  parseChapter: function(chapter) {
    console.log('parseChapter() --');
    var item,
        i;

    for (i = 0; item = this.json.video[chapter][i]; i += 1) {
      if (this.videos[chapter] === undefined) {
        this.videos[chapter] = [];
      }
      this.videos[chapter].push(item.url);
    }
  },

  /**
   * Call multiFiles.js to construct UI widgets.
   */
  createUI: function() {
    console.log('createUI() --');
    console.log('this: ', this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
      };

    if (this.videos.chapters.length > 0) {
      videos.formats.push('标清');
      videos.links.push(this.videos.chapters);
    }
    if (this.videos.chapters2.length > 0) {
      videos.formats.push('高清');
      videos.links.push(this.videos.chapters2);
    }

    multiFiles.run(videos);
  },

  /**
   * Create a new <style> tag with str as its content.
   * @param string styleText
   *   - The <style> tag content.
   */
  addStyle: function(styleText) {
    var style = document.createElement('style');
    if (document.head) {
      document.head.appendChild(style);
      style.innerHTML = styleText;
    }
  },

  /**
   * 将URL中的hash转为了个对象/字典, 用于解析链接;
   */
  hashToObject: function(hashTxt) {
    var list = hashTxt.split('&'),
        output = {},
        len = list.length,
        i = 0,
        tmp = '';

    for (i = 0; i < len; i += 1) {
      tmp = list[i].split('=')
      output[tmp[0]] = tmp[1];
    }
    return output;
  },
}

monkey.run();



/**
 * letv.com
 */
var monkey_letv = {
  pid: '',
  vid: '',   // video id
  title: '',
  stime: 0, // server timestamp
  tkey: 0,  // time key
  jobs: 0,

  videoUrl: {
    '9': '',
    '21': '',
    '13': '',
  },
  videoFormats: {
    '9': '流畅',
    '13': '超清',
    '21': '高清',
  },

  run: function() {
    console.log('run() -- ');
    var url = location.href;
    this.title = document.title.substr(0, document.title.length-12);

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
          'http://api.letv.com/mms/out/common/geturl?',
          'platid=3&splatid=301&playid=0&vtype=9,13,21,28&version=2.0',
          '&tss=no',
          '&vid=', this.vid,
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
        var json = JSON.parse(response.responseText);
        that.getVideoUrl(json.data[0].infos);
      },
    });
  },

  /**
   * Parse video url
   */
  getVideoUrl: function(videos) {
    console.log('getVideoUrl() --');
    var video,
        i,
        url;


    for (i = 0; video = videos[i]; i = i + 1) {
      url = [
        video.mainUrl,
        '&ctv=pc&m3v=1&termid=1&format=1&hwtype=un&ostype=Linux&tag=letv',
        '&sign=letv&expect=3&pay=0&iscpn=f9051&rateid=1300',
        '&tn=', Math.random()
        ].join('');
      this.getFinalUrl(url, video.vtype);
      this.jobs += 1;
    }
  },

  /**
   * Get final video links
   * @param url, video link,
   * @param type, video type
   */
  getFinalUrl: function(url, type) {
    console.log('getFinalUrl() --', type);
    var that = this;

    GM_xmlhttpRequest({
      url: url,
      method: 'GET',
      onload: function(response) {
        var json = JSON.parse(response.responseText);
        that.videoUrl[type] = json.location;
        that.jobs -= 1;
        if (that.jobs === 0) {
          that.createUI();
        }
      },
    });
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
        types = ['9', '21', '13'],
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
};

monkey.extend('www.letv.com', [
  'http://www.letv.com/ptv/vplay/',
], monkey_letv);


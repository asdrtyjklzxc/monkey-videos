
/**
 * iqiyi.com
 */
var monkey_iqiyi = {
  title: '',
  vid: '',  // default vid, data-player-videoid
  uid: '',  // generated uuid/user id
  aid: '',  // album id, data-player-albumid
  tvid: '', // data-player-tvid
  type: 0,  // default type
  rcOrder: [96, 1, 2, 3, 4, 5, 10],
  vip: false, // this video is for VIP only
  rc: {
    96: {name: '240P', links: []},
    1: {name: '320P', links: []},
    2: {name: '480P', links: []},
    3: {name: 'super', links: []},
    4: {name: '720P', links: []},
    5: {name: '1080P', links: []},
    10: {name: '4K', links: []},
  },
  jobs: 0,

  run: function() {
    console.log('run() --');
    this.getTitle();
    this.getVid();
  },

  getTitle: function() {
    console.log('getTitle() --');
    var nav = unsafeWindow.document.querySelector('#navbar em'),
        id,
        title;

    if (nav) {
      title = nav.innerHTML;
    } else {
      title = unsafeWindow.document.title.split('-')[0];
    }
    this.title = title.trim();
  },

  getVid: function() {
    console.log('getVid() --');
    var videoPlay = unsafeWindow.document.querySelector('div#flashbox');
    if (videoPlay && videoPlay.hasAttribute('data-player-videoid')) {
      this.vid = videoPlay.getAttribute('data-player-videoid');
      this.aid = videoPlay.getAttribute('data-player-aid');
      this.tvid = videoPlay.getAttribute('data-player-tvid');
      this.uid = this.hex_guid();
      this.getVideoUrls();
    } else {
      console.error('Error: failed to get video id');
      return;
    }
  },

  getVideoUrls: function() {
    console.log('getVideoUrls() --');
    var tm = this.randint(1000, 2000),
        enc = md5('ts56gh' + tm + this.tvid),
        url = [
          'http://cache.video.qiyi.com/vms?key=fvip&src=p',
          '&tvId=', this.tvid,
          '&vid=', this.vid,
          '&vinfo=1&tm=', tm,
          '&enc=', enc,
          '&qyid=', this.uid,
          '&tn=', Math.random(),
        ].join(''),
        that = this;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        var json = JSON.parse(response.responseText),
            formats,
            format,
            vlink,
            vlink_parts,
            key,
            url,
            i,
            j;

        that.title = json.data.vi.vn;
        if (! json.data.vp.tkl) {
          that.vip = true;
          that.createUI();
        }

        formats = json.data.vp.tkl[0].vs;
        for (i = 0; format = formats[i]; i += 1) {
          if (! that.rc[format.bid]) {
            console.error('Current video type not supported: ', format.bid);
            continue;
          }
          for (j = 0; j < format.fs.length; j += 1) {
            vlink = format.fs[j].l;
            if (! vlink.startsWith('/')) {
              vlink = that.getVrsEncodeCode(vlink);
            }
            vlink_parts = vlink.split('/');
            that.getDispathKey(
                vlink_parts[vlink_parts.length - 1].split('.')[0],
                format.bid, vlink, j);
          }
        }
      },
    });
  },

  getVrsEncodeCode: function(vlink) {
    var loc6 = 0,
        loc2 = [],
        loc3 = vlink.split('-'),
        loc4 = loc3.length,
        i;

    for (i = loc4 - 1; i >= 0; i -= 1) {
      loc6 = this.getVRSXORCode(parseInt(loc3[loc4 - i - 1], 16), i);
      loc2.push(String.fromCharCode(loc6));
    }
    return loc2.reverse().join('');
  },

  getVRSXORCode: function(arg1, arg2) {
    var loc3 = arg2 % 3;
    if (loc3 === 1) {
      return arg1 ^ 121;
    } else if (loc3 === 2) {
      return arg1 ^ 72
    } else {
      return arg1 ^ 103;
    }
  },

  getDispathKey: function(rid, bid, vlink, i) {
    var tp =  ")(*&^flash@#$%a",
        that = this;

    GM_xmlhttpRequest({
      method: 'GET',
      url: 'http://data.video.qiyi.com/t?tn=' + Math.random(),
      onload: function(response) {
        var json = JSON.parse(response.responseText),
            time = json.t,
            t = Math.floor(parseInt(time) / 600.0).toString(),
            key = md5(t + tp + rid),
            url = [
              'http://data.video.qiyi.com/', key, '/videos', vlink,
              '?su=', that.uid,
              '&client=&z=&bt=&ct=&tn=', that.randint(10000, 20000),
              ].join('');

          that.rc[bid].links.push('');
          that.jobs += 1;
          that.getFinalURL(bid, i, url);
      },
    });
  },

  getFinalURL: function(bid, i, url) {
    var that = this;
    
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        var json = JSON.parse(response.responseText);

        that.rc[bid].links[i] = json.l;
        that.jobs -= 1;
        if (that.jobs === 0) {
          that.createUI();
        }
      },
    });
  },

  createUI: function() {
    console.log('createUI() --');
    console.log(this);
    var i,
        video,
        videos = {
          title: this.title,
          formats: [],
          links: [],
        },
        links,
        link,
        j;

    if (this.vip) {
      unsafeWindow.alert('VIP only!');
      return;
    }
    for (i = 0; i < this.rcOrder.length; i += 1) {
      video = this.rc[this.rcOrder[i]];
      if (video.links.length > 0) {
        videos.formats.push(video.name);

        // append KEY/UUID string to end of each video link
        links = [];
        for (j = 0; j < video.links.length; j += 1) {
          link = [video.links[j], '?', video.key].join(''); 
          links.push(link);
        }
        videos.links.push(links);
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
    if (unsafeWindow.document.implementation &&
        unsafeWindow.document.implementation.createDocument) {
      xmlDoc = new DOMParser().parseFromString(str, 'text/xml');
    } else {
      console.log('parseXML() error: not support current web browser!');
      return null;
    }
    return xmlDoc;
  },

  /**
   * Generate a UUID string
   */
  hex_guid: function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    }
    return [s4(), s4(), s4(), s4(), s4(), s4(), s4(), s4()].join('');
  },

  randint: function(start, stop) {
    return parseInt(Math.random() * (stop - start)) + start;
  },
};

monkey.extend('www.iqiyi.com', [
  'http://www.iqiyi.com/v_',
  'http://www.iqiyi.com/jilupian/',
], monkey_iqiyi);

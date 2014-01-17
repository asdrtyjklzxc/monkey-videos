
var monkey = {
  title: '',
  vid: 0,
  plid: '',
  referer: '',
  jobs: 0,
  formats: {
    p1: '标清',
    p2: '高清',
    p3: '超清',
    p4: '原画质'
  },

  p1: {
    done: false,
    json: [],
    su: [],
    clipsURL: [],
    ip: '',
    vid: 0,
    reserveIp: [],
    videos: [],
  },

  p2: {
    done: false,
    json: [],
    su: [],
    vid: 0,
    clipsURL: [],
    ip: '',
    reserveIp: [],
    videos: [],
  },

  p3: {
    done: false,
    json: [],
    su: [],
    clipsURL: [],
    vid: 0,
    ip: '',
    reserveIp: [],
    videos: [],
  },

  p4: {
    done: false,
    json: [],
    su: [],
    clipsURL: [],
    vid: 0,
    ip: '',
    reserveIp: [],
    videos: [],
  },

  run: function() {
    log('run() --');
    this.getId();
  },

  /**
   * Get video id
   */
  getId: function() {
    log('getId() --');
    this.vid = uw.vid;
    this.p2.vid = uw.vid;
    this.plid = uw.playlistId;
    this.title = uw.document.title.split('-')[0].trim();
    this.referer = uw.escape(uw.location.href);
    log(this);
    this.jobs += 1;
    this.getVideoJSON('p2');
  },

  /**
   * Get video info.
   * e.g. http://hot.vrs.sohu.com/vrs_flash.action?vid=1109268&plid=5028903&referer=http%3A//tv.sohu.com/20130426/n374150509.shtml
   */
  getVideoJSON: function(fmt) {
    log('getVideoJSON() --');
    log('fmt: ', fmt);
    var pref = 'http://hot.vrs.sohu.com/vrs_flash.action',
        url = '',
        that = this;

    // If vid is unset, just return it.
    if (this[fmt].vid === 0) {
      this[fmt].done = true;
      return;
    }

    url = [
      pref, 
      '?vid=', this[fmt].vid,
      '&plid=', this.plid,
      '&out=0',
      '&g=8',
      '&referer=', this.referer,
      '&r=1',
      ].join('');
    log('url: ', url);

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        log('response: ', response);
        var i = 0;

        log(that);
        that.jobs -= 1;
        that[fmt].json = JSON.parse(response.responseText);
        //that.title = that[fmt].json.data.tvName;
        that[fmt].clipsURL = that[fmt].json.data.clipsURL;
        that[fmt].su = that[fmt].json.data.su;
        that.p1.vid = that[fmt].json.data.norVid;
        that.p2.vid = that[fmt].json.data.highVid;
        that.p3.vid = that[fmt].json.data.superVid;
        that.p4.vid = that[fmt].json.data.oriVid;
        that[fmt].ip = that[fmt].json.allot;
        that[fmt].reserveIp = that[fmt].json.reserveIp.split(';');
        that[fmt].done = true;
        for (i in that[fmt].clipsURL) {
          url = [
            'http://', that[fmt].ip,
            '/?prot=', that[fmt].clipsURL[i],
            '&new=', that[fmt].su[i],
            ].join('');
          that[fmt].videos.push(url);
        }

        if (fmt === 'p2') {
          if (that.p1.vid > 0) {
            that.jobs += 1;
            that.getVideoJSON('p1');
          }
          if (that.p3.vid > 0) {
            that.jobs += 1;
            that.getVideoJSON('p3');
          }
          if (that.p4.vid > 0) {
            that.jobs += 1;
            that.getVideoJSON('p4');
          }
        }

        // Display UI when all processes ended
        if (that.jobs === 0) {
          that.createUI();
        }
      },
    });
  },

  /**
   * Construct UI widgets
   */
  createUI: function() {
    log('createUI() --');
    log(this);
    var videos = {
          title: this.title,
          links: [],
          formats: [],
        },
        type,
        i;

    for (type in this.formats) {
      if (this[type].vid > 0 && this[type].done) {
        videos.links.push(this[type].videos);
        videos.formats.push(this.formats[type]);
      }
    }

    multiFiles.run(videos);
  },
};

monkey.run();


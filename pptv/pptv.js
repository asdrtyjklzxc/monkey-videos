
var monkey = {
  id: '',        // 存放页面id;
  jobs: 0,

  title: '',     // 标题;
  formats: {0: '标清', 1: '高清', 2: '起清'},
  videos: {0: [], 1: [], 2: []},

  run: function() {
    console.log('run()--');
    this.getId();
  },

  /**
   * Get video id
   */
  getId: function() {
    console.log('getId()--');
    var scripts = document.querySelectorAll('script'),
        script,
        reg = /"id":(\d+),/,
        i,
        match,
        id;

    for (i = 0; script = scripts[i]; i += 1) {
      match = reg.exec(script.innerHTML);
      if (match && match.length > 1) {
        this.id= match[1];
        break;
      }
    }

    if (this.id.length > 0) {
      this.jobs = this.jobs + 1;
      this.getPlaylistUrl(0);

      this.jobs = this.jobs + 1;
      this.getPlaylistUrl(1);

      this.jobs = this.jobs + 1;
      this.getPlaylistUrl(2);
    } else {
      console.error('Failed to get video id');
    }
  },

  /**
   * Get video playlist
   * 标清http://web-play.pptv.com/webplay3-0-16840115.xml?type=web.fpp&ft=0
   * 高清http://web-play.pptv.com/webplay3-0-16840115.xml?type=web.fpp&ft=1
   */
  getPlaylistUrl: function(format) {
    console.log('getPlaylistUrl() --');
    var pref = 'http://web-play.pptv.com/webplay3-0-',
        that = this,
        url = pref + this.id + '.xml?type=web.fpp&ft=' + format;

    console.log('url:', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        that.createPlaylist(format, response.responseText);
      },
    });
  },

  createPlaylist: function(format, txt) {
    console.log('createPlaylist() --', format);
    console.log(this);
    var 
        xml = this.parseXML(txt),
        channel = xml.querySelector('channel'),
        items = channel.querySelectorAll('file item'),
        rid = channel.getAttribute('rid'),
        sgms = xml.querySelectorAll('dragdata sgm'),
        server = xml.querySelector('dt sh').innerHTML,
        k = xml.querySelector('dt key').innerHTML,
        st = xml.querySelector('st').innerHTML,
        key = this.constructKey(st),
        i;

    this.title = channel.getAttribute('nm');
    if (format < items.length) {
      for (i = 0; i < sgms.length; i += 1) {
        this.videos[format].push([
          'http://', server, '/', i, '/', rid,
          '?key=', key,
          '&k=', k,
          '&type=web.fpp',
          ].join(''));
      }
    }

    this.jobs = this.jobs - 1;
    if (this.jobs === 0) {
      this.createUI();
    }
  },

  constructKey:  function(arg) {
    var MAX_INT32 = Math.pow(2, 32);

    function str2hex(s) {
      var r = '',
          i,
          t;

      for (i = 0; i < 8; i += 1) {
        t = String.charCodeAt(s[i]).toString(16);
        if (t.length === 1) {
            t = "0" + t;
        }
        r += t;
      }
      for (i = 0; i < 16; i += 1) {
        r += parseInt(15 * Math.random()).toString(16);
      }
      return r;
    }

    function getkey(s) {
      return 1896220160;
    }

    /**
     * XOR of two positive integers.
     * ^ operator in js might be overflow
     */
    function xor(a, b) {
      var sa = a.toString(2).split('').reverse(),
          sb = b.toString(2).split('').reverse(),
          arr_b,
          arr_s,
          length,
          i,
          result = [];
      if (a > b) {
        arr_b = sa;
        arr_s = sb;
      } else {
        arr_b = sb;
        arr_s = sa;
      }
      length = arr_s.length;
      for (i = 0; i < length; i += 1) {
        if (arr_s[i] == arr_b[i]) {
          result.push('0');
        } else {
          result.push('1');
        }
      }
      result = result.concat(arr_b.slice(length));
      return parseInt(result.reverse().join(''), 2);
    }

    function rot(k, b) {
      if (k >= 0) {
        //return k >> b;
        return Math.floor(k / Math.pow(2, b));
      } else {
        return (MAX_INT32 + k) >> b;
      }
    }

    function lot(k, b) {
      return k * Math.pow(2, b) % MAX_INT32;
    }

    function ord(c) {
      return String.charCodeAt(c);
    }

    function chr(n) {
      return String.fromCharCode(n);
    }

    function encrypt(arg1, arg2) {
      var delta = 2654435769,
          l3 = 16,
          l4 = 1896220160,
          l8 = arg1.split(''),
          l10 = l4,
          l9 = arg2.split(''),
          l5 = 101056625,
          l6 = 100692230,
          l7 = 7407110,
          l11 = [],
          l12 = 0,
          l13 = ord(l8[l12]) << 0,
          l14 = ord(l8[l12 + 1]) << 8,
          l15 = ord(l8[l12 + 2]) << 16,
          l16 = ord(l8[l12 + 3]) << 24,
          l17 = ord(l8[l12 + 4]) << 0,
          l18 = ord(l8[l12 + 5]) << 8,
          l19 = ord(l8[l12 + 6]) << 16,
          l20 = ord(l8[l12 + 7]) << 24,
          l21 = (((0 | l13)| l14) | l15) | l16,
          l22 = (((0 | l17)| l18) | l19) | l20,
          l23 = 0,
          l24 = 0;

      while (l24 < 32) {
        l23 = (l23 + delta) % MAX_INT32;
        l33 = (lot(l22, 4) + l4) % MAX_INT32;
        l34 = (l22 + l23) % MAX_INT32;
        l35 = (rot(l22, 5) + l5) % MAX_INT32;
        l36 = xor(xor(l33, l34), l35);
        l21 = (l21 + l36) % MAX_INT32;
        l37 = (lot(l21, 4) + l6) % MAX_INT32;
        l38 = (l21 + l23) % MAX_INT32;
        l39 = (rot(l21, 5)) % MAX_INT32;
        l40 = (l39 + l7) % MAX_INT32;
        l41 = xor(xor(l37, l38) % MAX_INT32, l40) % MAX_INT32;
        l22 = (l22 + l41) % MAX_INT32;

        l24 += 1;
      }

      l11.push(chr(rot(l21, 0) & 0xff));
      l11.push(chr(rot(l21, 8) & 0xff));
      l11.push(chr(rot(l21, 16) & 0xff));
      l11.push(chr(rot(l21, 24) & 0xff));
      l11.push(chr(rot(l22, 0) & 0xff));
      l11.push(chr(rot(l22, 8) & 0xff));
      l11.push(chr(rot(l22, 16) & 0xff));
      l11.push(chr(rot(l22, 24) & 0xff));
      return l11;
    }

    arg = arg.replace(' UTC', '');
    arg = Date.parse(arg) / 1000 - 60;
    arg = arg.toString(16);
    var loc1 = arg + Array(16 - arg.length + 1).join('\x00'),
        SERVER_KEY = 'qqqqqww' + Array(9).join('\x00'),
        res = encrypt(loc1, SERVER_KEY);
    return str2hex(res);
  },


  createUI: function() {
    console.log('createUI() --');
    console.log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
        },
        format;

    for (format in this.formats) {
      if (this.videos[format].length > 0) {
        videos.formats.push(this.formats[format]);
        videos.links.push(this.videos[format]);
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
};


monkey.run();

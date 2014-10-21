
/**
 * sina.com.cn
 */
var monkey_sina = {
  title: '',
  jobs: 0,
  video: {
    format: '标清',
    vid: '',
    url: '',
    links: [],
  },
  hdVideo: {
    format: '高清',
    vid: '',
    url: '',
    links: [],
  },

  run: function() {
    var loc = location.href;
    if (loc.search('/vlist/') > -1) {
      this.getVlist();
    } else if (loc.search('video.sina.com.cn') > -1 ||
               loc.search('open.sina.com.cn') > -1) {
      this.getVid(loc);
    } else {
      console.error('This page is not supported!');
      return;
    }
  },

  /**
   * e.g.
   * http://video.sina.com.cn/vlist/news/zt/topvideos1/?opsubject_id=top12#118295074
   * http://video.sina.com.cn/news/vlist/zt/chczlj2013/?opsubject_id=top12#109873117
   */
  getVlist: function() {
    console.log('getVlist() --');
    var h4s = document.querySelectorAll('h4.video_btn'),
        h4,
        i,
        lis = document.querySelectorAll('ul#video_list li'),
        li,
        As,
        A,
        j,
        that = this;

    if (h4s && h4s.length > 0) {
      this.getVlistItem(h4s[0].parentElement);
      for (i = 0; i < h4s.length; i += 1) {
        h4 = h4s[i];
        h4.addEventListener('click', function(event) {
          that.getVlistItem(event.target.parentElement);
        }, false);
      }

    } else if (lis && lis.length > 0) {
      this.getVlistItem(lis[0]);
      for (i = 0; i < lis.length; i += 1) {
        li = lis[i];
        As = li.querySelectorAll('a.btn_play');
        for (j = 0; A = As[j]; j += 1) {
          A.href= li.getAttribute('vurl');
        }
        li.addEventListener('click', function(event) {
          that.getVlistItem(event.target);
          event.preventDefault();
          return;
        }, false);
      }
    }
  },

  getVlistItem: function(div) {
    console.log('getVlistItem() --', div);
    if (div.hasAttribute('data-url')) {
      this.getVid(div.getAttribute('data-url'));
    } else if (div.nodeName === 'A' && div.className === 'btn_play') {
      this.getVid(div.parentElement.parentElement.parentElement.getAttribute('vurl'));
    } else if (div.nodeName === 'IMG') {
      this.getVid(div.parentElement.parentElement.parentElement.parentElement.getAttribute('vurl'));
    } else if (div.hasAttribute('vurl')) {
      this.getVid(div.getAttribute('vurl'));
    } else {
      console.error('Failed to get vid!', div);
      return;
    }
  },

  /**
   * Get Video vid and hdVid.
   */
  getVid: function(url) {
    console.log('getVid() --', url);
    var that = this;

    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        console.log(response);
        var reg = /vid:['"](\d{5,})['"]/,
            txt = response.responseText,
            match = reg.exec(txt),
            hdReg = /hd_vid:'(\d{5,})'/,
            hdMatch = hdReg.exec(txt),
            titleReg = /\s+title:'([^']+)'/,
            titleMatch = titleReg.exec(txt);
            title2Reg = /VideoTitle : "([^"]+)"/,
            title2Match = title2Reg.exec(txt);

        if (titleMatch) {
          that.title = titleMatch[1];
        } else if (title2Match) {
          that.title = title2Match[1];
        }
        if (hdMatch && hdMatch.length > 1) {
          that.hdVideo.vid = hdMatch[1];
          that.jobs += 1;
          that.getVideoByVid(that.hdVideo);
        }
        if (match && match.length > 1) {
          that.video.vid = match[1];
          that.jobs += 1;
          that.getVideoByVid(that.video);
        }
      },
    });
  },

  /**
   * Calcuate video information url
   */
  getURLByVid: function(vid) {
    console.log('getURLByVid() -- ', vid);
    var randInt = parseInt(Math.random() * 1000),
        time = parseInt(Date.now() / 1000) >> 6,
        key = '';

    key = [
      vid,
      'Z6prk18aWxP278cVAH',
      time,
      randInt,
      ].join('');
    key = md5(key);
    console.log('key: ', key);
    key = key.substring(0, 16) + time;
    console.log('key: ', key);

    return [
      'http://v.iask.com/v_play.php?',
      'vid=', vid,
      '&uid=null',
      '&pid=null',
      '&tid=undefined',
      '&plid=4001',
      '&prid=ja_7_4993252847',
      '&referer=',
      '&ran=', randInt,
      '&r=video.sina.com.cn',
      '&v=4.1.42.35',
      '&p=i',
      '&k=', key,
      ].join('');
  },

  /**
   * Get video info specified by vid.
   */
  getVideoByVid: function(container) {
    console.log('getVideoByVid() --', container);
    console.log(this);
    var that = this;
    container.url = this.getURLByVid(container.vid),

    GM_xmlhttpRequest({
      method: 'GET',
      url: container.url,
      onload: function(response) {
        console.log('response: ', response);
        var reg = /<url>.{9}([^\]]+)/g,
            txt = response.responseText,
            match = reg.exec(txt);

        while (match) {
          container.links.push(match[1]);
          match = reg.exec(txt);
        }

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
    var videos = {
          formats: [],
          links: [],
          title: this.title,
        };

    if (this.video.links.length > 0) {
      videos.formats.push(this.video.format);
      videos.links.push(this.video.links);
    }
    if (this.hdVideo.links.length > 0) {
      videos.formats.push(this.hdVideo.format);
      videos.links.push(this.hdVideo.links);
    }
    console.log('videos: ', videos);
    multiFiles.run(videos);
  },
}


monkey.extend('video.sina.com.cn', [
  'http://video.sina.com.cn/',
], monkey_sina);

monkey.extend('open.sina.com.cn', [
  'http://open.sina.com.cn/course/',
], monkey_sina);

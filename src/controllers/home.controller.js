const ctrl = {};
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const request = require('request-promise');
const ytdl = require('ytdl-core');
const urlParams = require('url');
const FormData = require('form-data');
const https = require('https');
const m3u8stream = require('m3u8stream');
const m3u8 = require('m3u8');
const path = require('path');
const fs = require('fs');
const downloadHlsNode = require("node-hls-downloader").download;
const puppeteer = require('puppeteer-extra');
const got = require('got');
// const fbvid = require('fbvideos');
const axios = require('axios');
const tiktokSearch = require('tiktok-search');
const converter = require("node-m3u8-to-mp4");
const m3u8downloader = require('m3u8downloader');
var m3u8ToMp4 = require("m3u8-to-mp4");
var converterM3u8 = new m3u8ToMp4();
const userAgent = require('user-agents');
const _eval = require('eval');
const vidl = require('vimeo-downloader');
// var HLSDownloader = require('hlsdownloader').downloader;
// const Downloader = require('../libs/m3u8-downloader');


// Add adblocker plugin, which will transparently block ads in all pages you
// create using puppeteer.
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin());
// const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
// puppeteer.use(
//   RecaptchaPlugin({
//     provider: {
//       id: '2captcha',
//       token: process.env.TOKEN_RECAPTCHA, // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
//     },
//     visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
//   })
// );
// const StealthPlugin = require('puppeteer-extra-plugin-stealth')
// puppeteer.use(StealthPlugin());
// const tvd = require('twitter-video-downloader');

// AUX SCRAPPING PROXY
// http-proxy-middleware

const randomUseragent = require('random-useragent');
const youtubedl = require('youtube-dl');

ctrl.index = (req, res) => {
  res.render('index');
}

ctrl.download = async (req, res) => {
  // console.log(req.query, req.params, req.body);
  // console.log(req.query);
 try {
  let server = req.query.server.toLowerCase();
  let url = req.query.url;
  if(server == 'fembed') {
    if(!url.includes('fembed') && !url.includes('femax20')) {
      return res.json({
        data: [],
        enlacesActive: true
      })
    }
    let enlacesActive = true;
    let results = await getFembedUrl(url);
    if(results.length == 0) {
      results = await getUrlDownloadVideo(url).catch(() => {
        return res.json({
          data: [],
          enlacesActive: true
        })
      });
      enlacesActive = false;
    }
    res.json({
      data: results,
      enlacesActive
    });
  } else if(server == 'youtube') {
    if(!url.includes('youtube') && !url.includes('youtu')) {
      return res.json({
        data: [],
        enlacesActive: true
      })
    }
    var urlString=url;
    var parseObj= urlParams.parse(urlString, true);
    var params = parseObj.query;
    let data = await convertYoutube(params.v);
    // console.log(data);
    // let filterData = data.videos[2].k;
    // let resultData = await downloadYoutube(filterData, data.vid);
    
    let newResult = [];
    let responseData = await fetch(url);
    let resData = await responseData.text();
    const $ = cheerio.load(resData);
    let name = $('title').text();

    newResult.push({
      url: `/youtube?url=${url}&name=${name}`,
      quality: 'BACKUP - 480p',
      type: 'MP4'
    })
    data.videos.forEach((item) => {
      newResult.push({
        url: `/download/youtube?id=${item.k}&vid=${data.vid}`,
        quality: item.q,
        type: item.f
      });
    })
    
    // let videoExtend = await getUrlYoutubeExtend(params.v);
    // let urlExtend = videoExtend.qualities[0].url;
    // let qualityExtend = videoExtend.qualities[0].qualityInfo.qualityLabel;
    // let typeExtend = videoExtend.qualities[0].qualityInfo.format;
    // newResult.push({
    //   url: urlExtend,
    //   quality: qualityExtend,
    //   type: typeExtend
    // })
    res.json({
      data: newResult,
      enlacesActive: true
    })
    // let responseData = await fetch(url);
    // let resData = await responseData.text();
    // const $ = cheerio.load(resData);
    // let name = $('title').text();
    // res.json({
    //   data: [{
    //     url: `/youtube?url=${url}&name=${name}`,
    //     quality: '480p'
    //   }],
    //   enlacesActive: true
    // });
  } else if(server == 'uqload')  {
    if(!url.includes('uqload')) {
      return res.json({
        data: [],
        enlacesActive: true
      })
    }
    // let responseData = await fetch(url);
    // console.log(responseData);
    // let resData = await responseData.text();
    // const $ = cheerio.load(resData);
    // let name = $('title').text();
    let data = await getUqloadUrl(url);
    let nameFile = data.title;
    let urlData = data.src;
    res.json({
      data: [{
        url: `/uqload?url=${urlData}&name=${nameFile}`,
        quality: '480p'
      }],
      enlacesActive: true
    })
  } else if(server == 'videos') {
    if(!url.includes('videos')) {
      return res.json({
        data: [],
        enlacesActive: true
      })
    }
    let hlsVideo = await getVideoShUrl(url);
    res.json({
      data: hlsVideo,
      enlacesActive: true
    });
  } else if(server == 'mystream')  {
    if(!url.includes('mystream')) {
      return res.json({
        data: [],
        enlacesActive: true
      })
    }
    let dataUrl = await getUrlMyStream(url); 
    let enlace = dataUrl.src;
    let nameFile = dataUrl.name;
    res.json({
      data: [{
        url: `/mystream?url=${enlace}&name=${nameFile}`,
        quality: '480p'
      }],
      enlacesActive: true
    });
  } else if(server == 'doodstream') {
    if(!url.includes('dood')) {
      return res.json({
        data: [],
        enlacesActive: true
      })
    }
    let dataUrl = await getDoodStreamUrl(url);
    let enlace = dataUrl.src;
    let nameFile = dataUrl.name;
    res.json({
      data: [{
        url: `/doodstream?url=${enlace}&name=${nameFile}`,
        quality: '480p'
      }],
      enlacesActive: true
    });
  } else if(server == 'upfast') {
    if(!url.includes('upstream')) {
      return res.json({
        data: [],
        enlacesActive: true
      })
    }
    let dataUrl = await getUrlUpStream(url);
    // let domain = dataUrl.domain;
    res.json({
      data: dataUrl,
      enlacesActive: true
    });
  } else if(server == 'facebook') {
    if(!url.includes('facebook')) {
      return res.json({
        data: [],
        enlacesActive: true
      })
    }
    let idFb = url.split('/').pop();
    if(idFb == '') {
      idFb = url.split('/');
      idFb.pop();
      idFb = idFb.pop();
      idFb = idFb.toString();
    }
    let tokenFb = process.env.TOKEN_FB;
    let enlaceFb = `https://graph.facebook.com/v10.0/${idFb}?fields=source&access_token=${tokenFb}`;
    let responseEnlaces = await fetch(enlaceFb);
    let resEnlaces = await responseEnlaces.json();
    if(!resEnlaces.source) {
      return res.json({
        data: [],
        enlacesActive: true
      })
    }
    let enlaceDownlaod = `${resEnlaces.source}&dl=1`;
    res.json({
      data: [{
        url: `${enlaceDownlaod}`,
        quality: 'SD'
      }],
      enlacesActive: true
    });
  } else if(server == 'instagram') {
     if(!url.includes('instagram')) {
      return res.json({
        data: [],
        enlacesActive: true
      });
     }
    //  await getInstaVideo(url);
     let dataUrl = await forceDownloadInstagram(url);
     let enlace = dataUrl.playlist[0].id;
    //  let newUrl = createNewUrl(url);
    //  let metaData = await downloadMetaData(newUrl);
    //  console.log(metaData);
    //  const getType = getMediaType(metaData);
    //  if(getType == "image") {
    //   res.json({
    //     data: [
    //     //   {
    //     //   url: `${metaData.shortcode_media.display_url}&dl=1`,
    //     //   quality: 'HD',
    //     //   type: 'JPG'
    //     // }
    //   ],
    //     enlacesActive: true
    //   });
    //  } else {
    //   res.json({
    //     data: [{
    //       url: `${metaData.shortcode_media.video_url}&dl=1`,
    //       quality: 'SD',
    //       type: 'MP4'
    //     }, 
    //     // {
    //     //   url: `${metaData.shortcode_media.display_url}&dl=1`,
    //     //   quality: 'HD',
    //     //   type: 'JPG'
    //     // }
    //   ],
    //     enlacesActive: true
    //   });
    //  }
    // console.log(metaData);
    // if(!metaData) {
    //   return res.json({
    //     data: [],
    //     enlacesActive: true
    //   });
    // }
    //  else {
      res.json({
        data: [{
          url: enlace,
          quality: 'HD',
          type: 'MP4'
        }],
        enlacesActive: true
      });
    // }
    
    //  console.log(metaData);
  } else if(server == 'tiktok') {
    if(!url.includes('tiktok')) {
      return res.json({
        data: [],
        enlacesActive: true
      })
    }
    let enlaces = await getUrlTiktok(url);
    res.json({
      data: enlaces,
      enlacesActive: true
    });
    // console.log(`https://vm.tiktok.com/${url.split('/video/')[1].split('?')[0]}/`);
    // tiktokSearch.getInfo(url.split('?')[0]).then((data) => {
    //   console.log(data);
    // });
  } else if(server == 'streamtape') {
    if(!url.includes('strtape')) {
      return res.json({
        data: [],
        enlacesActive: true
      })
    }
    let dataUrl = await getUrlStreamtape(url);
    let enlace = dataUrl.src;
    let name = dataUrl.name;
    res.json({
      data: [{
        url: `${enlace}`,
        quality: '480P'
      }],
      enlacesActive: true
    });
  } else if(server == 'vimeo') {
    if(!url.includes('vimeo')) {
      return res.json({
        data: [],
        enlacesActive: true
      })
    }
    let enlaces = await getUrlVimeo(url);
    res.json({
      data: enlaces,
      enlacesActive: true
    })
  } else if(server == 'twitter') {
    if(!url.includes('twitter')) {
      return res.json({
        data: [],
        enlacesActive: true
      });
    }
    let enlaces = await getUrlTweet(url);
    res.json({
      data: enlaces,
      enlacesActive: true
    });
  } else if(server == 'dailymotion') {
    if(!url.includes('dailymotion')) {
      return res.json({
        data: [],
        enlacesActive: true
      });
    }
    let enlaces = await getUrlDailyMotion(url);
    enlaces.forEach((item, i) => {
      if(i == 0) {
        item.url = 'https://www.videosdownloader.world/es/dl.php?source=dailymotion&dl=MA==';
      } else if(i == 1) {
        item.url = 'https://www.videosdownloader.world/es/dl.php?source=dailymotion&dl=MQ==';
      } else if(i == 2) {
        item.url = 'https://www.videosdownloader.world/es/dl.php?source=dailymotion&dl=Mg==';
      } else if(i == 3) {
        item.url = 'https://www.videosdownloader.world/es/dl.php?source=dailymotion&dl=Mw==';
      } else if(i == 4) {
        item.url = 'https://www.videosdownloader.world/es/dl.php?source=dailymotion&dl=NA==';
      } else if(i == 5) {
        item.url = 'https://www.videosdownloader.world/es/dl.php?source=dailymotion&dl=NQ==';
      }
      if(item.quality == '144p') {
        item.url = 'https://www.videosdownloader.world/es/dl.php?source=dailymotion&dl=MA==';
      } else if(item.quality == '240p') {
        item.url = 'https://www.videosdownloader.world/es/dl.php?source=dailymotion&dl=MQ==';
      } else if(item.quality == '380p') {
        item.url = 'https://www.videosdownloader.world/es/dl.php?source=dailymotion&dl=Mg==';
      } else if(item.quality == '480p') {
        item.url = 'https://www.videosdownloader.world/es/dl.php?source=dailymotion&dl=Mw==';
      } else if(item.quality == '720p') {
        item.url = 'https://www.videosdownloader.world/es/dl.php?source=dailymotion&dl=NA==';
      } else if(item.quality == '1080p') {
        item.url = 'https://www.videosdownloader.world/es/dl.php?source=dailymotion&dl=NQ==';
      }
    });
    res.json({
      data: enlaces,
      enlacesActive: true
    });
  } else if(server == 'imdb') {
    if(!url.includes('imdb')) {
      return res.json({
        data: [],
        enlacesActive: true
      });
    }
    let imdbVideo = await getUrlImdb(url);
    res.json({
      data: [{
        url: imdbVideo,
        quality: 'HD'
      }],
      enlacesActive: true
    });
  } else if(server == 'streamable') {
    if(!url.includes('streamable')) {
      return res.json({
        data: [],
        enlacesActive: true
      });
    }
    let enlace = await getUrlStreamable(url);
    res.json({
      data: [{
        url: enlace,
        quality: '400p'
      }],
      enlacesActive: true
    });
  } else if(server == 'linkedin') {
    if(!url.includes('linkedin')) {
      return res.json({
        data: [],
        enlacesActive: true
      });
    }
    let enlaces = await getUrlLinkedIn(url).catch(() => {
      return null;
    });
    if(enlaces == null) {
      return res.json({
        data: [],
        enlacesActive: true
      });
    }
    res.json({
      data: enlaces,
      enlacesActive: true
    });
  } else if(server == 'tumblr') {
    if(!url.includes('tumblr')) {
      return res.json({
        data: [],
        enlacesActive: true
      });
    }
    let enlace = await getUrlStreamable(url);
    res.json({
      data: [{
        url: enlace,
        quality: 'HD'
      }],
      enlacesActive: true
    });
  } else if(server == 'espn') {
    if(!url.includes('espn')) {
      return res.json({
        data: [],
        enlacesActive: true
      });
    }
    let enlace = await getUrlEspn(url);
    res.json({
      data: [{
        url: enlace,
        quality: 'HD'
      }],
      enlacesActive: true
    });
  } else if(server == 'liveleak') {
    if(!url.includes('liveleak')) {
      return res.json({
        data: [],
        enlacesActive: true
      });
    }
    let enlaces = await getUrlLiveLeak(url);
    res.json({
      data: enlaces,
      enlacesActive: true
    });
  } else if(server == 'twitch') {
    let enlaces = await forceDownlaodTwitch(url);

    // let enlaces = await getDownloadTwitch(url);
    res.json({
      data: enlaces,
      enlacesActive: true
    })
  } else {
    res.json({
      data: [],
      enlacesActive: true
    })
  }
 } catch(err) {
   console.log(err);
   res.json({
    data: [],
    enlacesActive: true
  });
 }
}

ctrl.youtubeDownload = async (req, res) => {
  let id = req.query.id.replace(/ /g, '+');
  // console.log(id);
  let vid = req.query.vid;
  let resultData = await downloadYoutube(id, vid);
  // console.log(resultData);
  res.redirect(resultData.dlink);
  // res.json(resultData);
}

ctrl.youtube = (req, res) => {
  let url = req.query.url;
  res.setHeader('content-disposition', `attachment; filename=${req.query.name}.mp4`);
  const video = youtubedl(url, ['--format=18']);
  video.on('info', function(info) {
    console.log('Download started')
    console.log('filename: ' + info._filename)
    console.log('size: ' + info.size)
    res.setHeader('content-length', info.size);
  });
  video.pipe(res);
  // ytdl(url, {format: 'mp4'}).pipe(res);
}

ctrl.uqload = (req, res) => {
  let url = req.query.url;
  res.setHeader('content-disposition', `attachment; filename=${req.query.name}.mp4`);
  https.get(url, {
    headers: {
      "cookie": "c_user=**; xs=****;",
      "sec-ch-ua": `" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"`,
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
      "x-requested-with": "XMLHttpRequest",
      "Access-Control-Allow-Origin": "*",
      "Accept": "application/json",
      "Access-Control-Request-Headers": "*",
      "Access-Control-Request-Method": "*",
      "Accept-Encoding": "identity;q=1, *;q=0",
      "referer": "https://uqload.com/",
      "host": "m50.uqload.org"
    }
  }, function(file) {
    if(file.headers['content-length']) {
      res.setHeader('content-length', file.headers['content-length']);
    }
    file.pipe(res);
  });
}

ctrl.videosExtend = (req, res) => {
  let url = req.query.url;
  res.render('stream_video', {
    title: req.query.name,
    url
  })
}

ctrl.videos = async (req, res) => {
  let url = req.query.url;
  let contentLength = req.query.contentLength * 10;
  // res.setHeader('content-length', contentLength);
  res.setHeader('content-disposition', `attachment; filename=${req.query.name}.mp4`);
  // var writer = fs.createWriteStream(path.resolve(`src/temps/${req.query.name}.m3u8`));
  // https.get(url, function(file) {
  //   file.pipe(writer);
  //   var parser = m3u8.createStream();
  //   // var fileRead   = fs.createReadStream(path.resolve(`src/temps/${req.query.name}.m3u8`));
  //   // fileRead.pipe(parser);
  // });
  

  // console.log(encontrados);
  // var parser = m3u8.createStream();
  m3u8stream(url).on('progress', (e) => {
    console.log(e);
  }).once('error', (e) => {
    console.log(e);
  }).once('close', (e) => {
    console.log(e);
  }).once('data', (e) => {
    console.log(e);
  }).once('end', (e) => {
    console.log(e);
  }).once('pause', (e) => {
    console.log(e);
  })
  .pipe(res)
  // .on('response', (r) => {
  //   mStream.unpipe(res);
  // });
  // await downloadHlsNode({
  //   quality: "best",
  //   concurrency: 5,
  //   outputFile: "video.mp4",
  //   streamUrl: url,
  // });
}

ctrl.mystream = (req, res) => {
  let url = req.query.url;
  res.redirect(url);
  // res.setHeader('content-disposition', `attachment; filename=${req.query.name.replace('—', '')}.mp4`);
  // https.get(url, {
  //   headers: {
  //     'accept': '*/*',
  //     'accept-encoding': 'identity;q=1, *;q=0',
  //     'accept-language': 'es-Es,es;q=0.9,en;q=0.8',
  //     'cache-control': 'no-cache',
  //     'pragma': 'no-cache',
  //     'referer': url,
  //     'host': 'fvis0foohy.mscontent.net',
  //     'sec-ch-ua': `" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"`,
  //     'sec-ch-ua-mobile': '?0',
  //     'sec-fetch-dest': 'video',
  //     'sec-fetch-mode': 'no-cors',
  //     'sec-fetch-site': 'same-origin',
  //     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
  //   }
  // }, function(file) {
  //   if(file.headers['content-length']) {
  //     res.setHeader('content-length', file.headers['content-length']);
  //   }
  //   file.pipe(res);
  // });
}

ctrl.doodstream = (req, res) => {
  let url = req.query.url;
  res.setHeader('content-disposition', `attachment; filename=${req.query.name}.mp4`);
  https.get(url, {
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "identity;q=1, *;q=0",
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      "Connection": "keep-alive",
      "Host": "y186gs.dood.video",
      "Range": "bytes=0-",
      "Referer": "https://dood.to/",
      "sec-ch-ua": `" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"`,
      "sec-ch-ua-mobile": "?1",
      "Sec-Fetch-Dest": "video",
      "Sec-Fetch-Mode": "no-cors",
      "Sec-Fetch-Site": "cross-site",
      "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Mobile Safari/537.36"
    }
  }, function(file) {
    if(file.headers['content-length']) {
      res.setHeader('content-length', file.headers['content-length']);
    }
    file.pipe(res);
  });
}

ctrl.upfast = async (req, res) => {
  let url = req.query.url;
  let contentLength = req.query.contentLength * 10;
  // res.setHeader('content-length', contentLength);
  res.setHeader('content-disposition', `attachment; filename=${req.query.name}.mp4`);
  m3u8stream(url, {
    requestOptions: {
      headers: {
        "Connection": "keep-alive",
        "Host": `s26.upstreamcdn.co`,
        "Origin": "https://upstream.to",
        "Referer": "https://upstream.to/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36"
      }
    }
  }).on('progress', (e) => {
    console.log(e);
  }).once('error', (e) => {
    console.log(e);
  }).once('close', (e) => {
    console.log(e);
  }).once('data', (e) => {
    console.log(e);
  }).once('end', (e) => {
    console.log(e);
  }).once('pause', (e) => {
    console.log(e);
  })
  .pipe(res);
}

ctrl.tiktok = (req, res) => {
  let url = req.path;
  let token = req.query.token;
  res.redirect(`https://snaptik.app${url}?token=${token}`)
}

ctrl.streamtape = (req, res) => {
  let url = req.query.url;
  // let name = req.query.name;
  // res.setHeader('content-disposition', `attachment; filename=${name}.mp4`);
  res.redirect(url);
}

ctrl.vimeo = (req, res) => {
  let url = req.query.url;
  vidl(url, {
    // headers: {

    // }
  }).pipe(res);
}

ctrl.twitch = (req, res) => {
  let url = req.query.url;
  let name = req.query.name;
  res.setHeader('content-disposition', `attachment; filename=${name}.mp4`);
  m3u8stream(url, {
    requestOptions: {
      // headers: {
      //   "Connection": "keep-alive",
      //   "Host": `s26.upstreamcdn.co`,
      //   "Origin": "https://upstream.to",
      //   "Referer": "https://upstream.to/",
      //   "Sec-Fetch-Dest": "empty",
      //   "Sec-Fetch-Mode": "cors",
      //   "Sec-Fetch-Site": "cross-site",
      //   "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36"
      // }
    }
  }).on('progress', (e) => {
    console.log(e);
  }).once('error', (e) => {
    console.log(e);
  }).once('close', (e) => {
    console.log(e);
  }).once('data', (e) => {
    console.log(e);
  }).once('end', (e) => {
    console.log(e);
  }).once('pause', (e) => {
    console.log(e);
  })
  .pipe(res);
}

// ctrl.facebook = (req, res) => {
//   let url = req.query.url;
//   res.redirect(url);
// }

// TIMEOUT PUPPETER 
// await page.setDefaultNavigationTimeout(0); 

async function convertYoutube(id) {
  let formData = new FormData();
  let url = `https://www.youtube.com/watch?v=${id}`;
  const urlRemot = `https://yt1s.com/api/ajaxSearch/index`;
  // console.time('mp4');
  formData.append('q', url);
  formData.append('vt', 'home');
  let response = await fetch(urlRemot, {
    method: 'POST',
    body: formData
  });
  let res = await response.json();
  // console.log(Object.values(res.links.mp4));
  // console.timeEnd('mp4');
  return {
    videos: Object.values(res.links.mp4),
    vid: res.vid
  };
}

async function downloadYoutube(key, vid) {
  let formData = new FormData();
  formData.append('k', key);
  formData.append('vid', vid);
  // console.log(key);
  const urlRemot = `https://yt1s.com/api/ajaxConvert/convert`;
  let response = await fetch(urlRemot, {
    method: 'POST',

    body: formData,
  });
  // console.log(response.status);
  let res = await response.json();
  // console.log(res);
  return res;
}

async function getUrlDownloadVideo(url) {
  url = `https://tool.baoxinh.com/fembed.cg?url=${url}`;
  let $ = await request({
    uri: url,
    transform: (body) => cheerio.load(body),
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "es-ES,es;q=0.9,en;q=0.8",
      "cache-control": "max-age=0",
      cookie:
        "__cfduid=de7f73458fccd1bf123f4dc2f065890aa1612643413; dsq__=2esg9cv2iantj6; cf_clearance=e6008800092958fd622a780c16b7a8e685c24bc1-1612655173-0-150; XSRF-TOKEN=eyJpdiI6IlwvMXFcL1wvdzVnejRBMjFyVVNRaXhFcGc9PSIsInZhbHVlIjoiYnV3akxZT2sraTRlczlPaUJmRVV4K3p4UzQ0c09POFhTU0ZwdVlSTlVnMHU1aWZsZDd2M0xqZ05sOFhTVzM5QSIsIm1hYyI6IjgxNzM3Y2VhYmU5MDUyNTIyYzdjZWMyNDQxNzI0ZmVlZWMzZDQxY2FmYjIxYTEwNzcyN2M5YjRkODFjYWJjYmMifQ%3D%3D; pelisplus_session=eyJpdiI6InpjeFpBZHFIYjdqcUhNU25Db05MXC9RPT0iLCJ2YWx1ZSI6ImVcL1FEQkpvVXMycHY5bGtIaFRFYUIzSjc3OCs1S0lvQmczQXdSb2lXekdBa1hJd2ZKUDBMXC82OEtzdVlzbjFVSSIsIm1hYyI6ImEzZTMyN2MwYmE1ZWMwZjM2ZWQyMjQ4OWExZTRhMzEyMTI4ZDhjYzEwNDkxN2EwNGVmYzA2M2MzMmI1ZWUyZDYifQ%3D%3D; __cf_bm=b7c077b2be6eb0d91659a4c7ee839b941bfa40f9-1612655182-1800-AQ4MwPUEz56jCyJhmVbNPsUKjyu6vY9RUnWkDOZg6FZAGriETEF/AthXrUXk9++YHjX8yBwvCJN4RksaYWqtZoI=; cf_chl_2=56977b031eebf20; cf_chl_prog=F15",
      referer: `${url}`,
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
    },
  });
  let dataUrls = '';
  let dataScript = `${$('body > script').html().split('document[')[0]}window.dataUrls=${$('body > script').html().split(')]=')[1]}`.replace('(function(){', '').replace('})();', '');
  return dataScript;
}

async function getFembedUrl(url) {
  let response = await fetch('https://sundrama.org/', {
    method: 'POST',
    referrerPolicy: 'origin-when-cross-origin',
    credentials: 'same-origin',
    cache: 'default',
    redirect: 'follow',
    integrity: '',
    keepalive: true,
    signal: undefined,
    window: null,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "cookie": "c_user=**; xs=****;",
      "sec-ch-ua": `" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"`,
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
      "x-requested-with": "XMLHttpRequest",
      "Access-Control-Allow-Origin": "*",
      "Accept": "application/json",
      "Access-Control-Request-Headers": "*",
      "Access-Control-Request-Method": "*",
      "Accept-Encoding": "gzip, deflate"
    },
    body: `id=${url}&aid=&lang=es&sub=&poster=http://sundrama.com/wp-content/uploads/2020/02/sundrama.jpeg&captcha-reponse=`,
    
  });
  let res = await response.text();
  const $ = cheerio.load(res);
  let newUrl = $('#txtDl').text();
  let fetchDownload = await fetch(newUrl, {
    method: 'GET'
  });
  let resDownload = await fetchDownload.text();
  // console.log(resDownload);
  const $$ = cheerio.load(resDownload);
  let enlaces = [];
  $$('.btn-download').each(function() {
    // console.log($$(this).attr('href'));
    enlaces.push({
      quality: $$(this).text().split(' ').pop(),
      url: $$(this).attr('href')
    });
  });
  return enlaces;
  // console.log(enlaces);
  // console.log($('#txtDl').text());
}


async function getUqloadUrl(url) {
  let response = await fetch(url);
  let res = await response.text();
  const $ = cheerio.load(res);
  // console.log($('video').attr('src'));
  let dataScript = $('body > script:nth-child(2)').html();
  let titleVideo = dataScript.split('media: {title: "')[1].split('"}')[0];
  // console.log(titleVideo);
  let srcVideo = dataScript.split('sources: ["')[1].split('"')[0];
  return {
    src: srcVideo,
    title: titleVideo
  };
}

async function getVideoShUrl(url) {
  let response = await fetch(url);
  let res = await response.text();
  // console.log(res);
  let $ = cheerio.load(res);
  let scriptData = $('body > script:nth-child(2)').html();
  let fileSrc = scriptData.split('[{file:"')[1].split('"')[0];
  let dataFetch = await fetch(fileSrc);
  let resFetch = await dataFetch.text();
  var re = /http([^"'\s]+)/g,
  text = resFetch,
  encontrados = text.match(re);
  let enlaces = [];
  let nameFile = 'video - videoS';
  let indXEje = 0;
  text.split('\n').forEach((item, i, vec) => {
    if(i < vec.length) {
      if(item.includes('#EXT-X-STREAM-INF') && vec[i + 1].includes('index-v1-a1')) {
        enlaces.push({
          contentLength: item.split(',BANDWIDTH=')[1].split(',')[0],
          quality: 'Opcion '+ '1' + ' - ' + item.split(',RESOLUTION=')[1].split(',')[0].split('x')[1] + 'p',
          url: `/videos?url=${vec[i + 1]}&name=${nameFile}&contentLength=${item.split(',BANDWIDTH=')[1].split(',')[0]}`
        });
        enlaces.push({
          contentLength: item.split(',BANDWIDTH=')[1].split(',')[0],
          quality: 'Opcion '+ '2' + ' - ' + item.split(',RESOLUTION=')[1].split(',')[0].split('x')[1] + 'p',
          url: `/videosExtend?url=${vec[i + 1]}&name=${nameFile}&contentLength=${item.split(',BANDWIDTH=')[1].split(',')[0]}`
        })
      }
    }
  });
  return enlaces;
}

async function getUrlMyStream(url) {
  const browser = await puppeteer.launch({ headless: true,args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
    // set user agent (override the default headless User Agent)
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36');
  await page.setDefaultNavigationTimeout(0); 
  await page.goto(url, {waitUntil: 'load', timeout: 0});
  // await page.click('#loading > div > svg');

  // await page.evaluate(() => {
  //   const myConfirm = document.querySelector('.myConfirm');
  //   if(myConfirm) {
  //     await page.click('#resume_no');
  //   }
  // });
  // await page.waitFor(2000);
  await page.waitForSelector('#videoPlayer > button');

  await page.click('div:last-child');
  // await page.click('div:last-child');
  await page.click('#videoPlayer > div.vjs-poster');
  await page.click('#videoPlayer > div.vjs-poster');

  await page.waitForSelector('#videoPlayer_html5_api source');
  // await page.waitFor(5000);

  let video = await page.evaluate(async () => {
    let videoElement = document.querySelector('#videoPlayer_html5_api source');
    let titleElement = document.querySelector('title');
    if(videoElement) {
      return {
        src: videoElement.src,
        name: titleElement.textContent
      };
    } else {
      return {
        src: '',
        name: titleElement.textContent
      };
    }
  });
  // await page.goto(video);
  await browser.close();
  return video;
}

async function getDoodStreamUrl(url) {
  // url = url.replace('/e/', '/d/');
  const browser = await puppeteer.launch({ headless: true,args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36');
  await page.setDefaultNavigationTimeout(0); 
  await page.goto(url, {waitUntil: 'load', timeout: 0});
  const pages = await browser.pages(); // get all open pages by the browser
  const popup = pages[pages.length - 1];
  // console.log(popup);
  if(popup !== page) {
    await popup.close();
  }
  // await page.click('#video_player > button > span');
  // await page.waitForSelector('[title="reCAPTCHA"]');
  // await Promise.all([
  //   page.waitForNavigation(),
  //   page.solveRecaptchas(),
  // ])
  // await page.click('#loading > div > svg');

  // await page.evaluate(() => {
  //   const myConfirm = document.querySelector('.myConfirm');
  //   if(myConfirm) {
  //     await page.click('#resume_no');
  //   }
  // });

  await page.waitForSelector('video');

  let enlace = await page.evaluate(() => {
    let video = document.querySelector('video');
    let title = document.querySelector('title');
    return {
      src: video.src,
      name: title.textContent
    };
  });
  // await page.goto(video);
    await browser.close();
    return enlace;
}

async function getUrlUpStream(url) {
  let response = await fetch(url, {
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
      'cache-control': 'max-age=0',
      'cookie': '__ddg1=vS5KTbTxDV6QJXyfu27v; __ddgid=5unhIUIOHb9rjdEe; __ddgmark=tJdrFQRIfcUsOaQG; file_id=10520880; aff=12575; _ga=GA1.2.1850447118.1619420123; _gid=GA1.2.433298985.1619420123; __ddg2=eaStqd9k7ma3fdSm',
      'sec-ch-ua': `" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"`,
      'sec-ch-ua-mobile': '?1',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Mobile Safari/537.36'
    }
  });
  let res = await response.text();
  const $ = cheerio.load(res);
  let dataScript = $('body > script:nth-child(3)').html();
  // console.log($('body').html());
  // console.log(dataScript);
  let srcUrl = dataScript.split('|urlset|')[1].split('|')[0];
  let domainS = dataScript.split('|hls|')[1].split('|')[0];
  // console.log(`https://${domainS}.upstreamcdn.co/hls/,${srcUrl},.urlset/master.m3u8`);
  let dataFetch = await fetch(`https://${domainS}.upstreamcdn.co/hls/,${srcUrl},.urlset/master.m3u8`, {
    headers: {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Connection': 'keep-alive',
      'Host': `${domainS}.upstreamcdn.co`,
      'Origin': 'https://upstream.to',
      'Referer': 'https://upstream.to/',
      'sec-ch-ua': `" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"`,
      'sec-ch-ua-mobile': '?1',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Mobile Safari/537.36'
    }
  });
  let resFetch = await dataFetch.text();
  var re = /http([^"'\s]+)/g,
  text = resFetch,
  encontrados = text.match(re);
  // console.log(encontrados);
  let enlaces = [];
  let nameFile = 'video - UpFast';
  text.split('\n').forEach((item, i, vec) => {
    if(i < vec.length) {
      if(item.includes('#EXT-X-STREAM-INF') && vec[i + 1].includes('index-v1-a1')) {
        enlaces.push({
          contentLength: item.split(',BANDWIDTH=')[1].split(',')[0],
          quality: item.split(',RESOLUTION=')[1].split(',')[0].split('x')[1] + 'p',
          url: `/upfast?url=${vec[i + 1]}&name=${nameFile}&contentLength=${item.split(',BANDWIDTH=')[1].split(',')[0]}`
        });
      }
    }
  });
  return enlaces;
  // return {
  //   src: `https://${domainS}.upstreamcdn.co/hls/${srcUrl}/index-v1-a1.m3u8`,
  //   domain: domainS
  // };
}



const getLinkSD = (link) => {
    return got(link).then(res => {

        const link = res.body.split('sd_src:"')[1].split('",hd_tag')[0];
        return {
            url: link
        };
    }).catch(error => {
        if (error) {
            error.message = msg;
        }
        return error.message;
    })
}

const getLinkHD = (link) => {
    return got(link).then(res => {

        const link = res.body.split('hd_src:"')[1].split('",sd_src:"')[0];
        return {
            url: link
        };
    }).catch(error => {
        if (error) {
            error.message = msg;
        }
        return error.message;
    })
}

function createNewUrl(oriUrl) {
  if (oriUrl.slice(-1) != "/") {
    oriUrl += "/";
  }
  return oriUrl + "?__a=1";
}

async function forceDownloadInstagram(url) {
  let response = await fetch(`https://server10.workerserverbl.com/online/PreDownload.php?url=${url}&format=MP4&quality=sd&statBeh=0&speed=d2ed4fb2aeaf49b147c74f217c82045e`, {
    headers: {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Host': 'server10.workerserverbl.com',
      'Origin': 'https://www.downloadvideosfrom.com',
      'Pragma': 'no-cache',
      'Referer': 'https://www.downloadvideosfrom.com/',
      'sec-ch-ua': `" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"`,
      'sec-ch-ua-mobile': '?1',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Mobile Safari/537.36'
    }
  });
  let res = await response.json();
  return res;
}

async function downloadMetaData(url) {
  try {
    const metaData = await axios({
      method: "get",
      url: url,
    });
    const $ = cheerio.load(metaData.data);

    // console.log(metaData.data);
    let enlaceReal = $("meta[property='og:video']").attr("content");
    if(!enlaceReal) {
      enlaceReal = metaData.data.graphql.shortcode_media.video_url;
    }
    return enlaceReal;
  } catch (error) {
    throw error;
  }
}

function getMediaType(mediaData) {
  if (mediaData.shortcode_media.is_video === true) {
    return "video";
  }
  return "image";
}

async function getInstaVideo(url) {
  const formData  = new FormData();
  formData.append('action', 'gamaMedia');
  formData.append('lang', 'es');
  formData.append('instagram_url', url.split('?')[0]);
  let response = await fetch('https://www.save-insta.com/wp-admin/admin-ajax.php', {
    method: 'POST',

    body: formData
  });
  let res = await response.text();
  console.log(res);
}

async function getUrlTiktok(url) {
  const formData  = new FormData();
  formData.append('url', url);

  // console.time('mp4');
  // formData.append('locale', 'es');
  // formData.append('tt', 0);
  // formData.append('ts', 0);
  // let dataStik = await fetch('https://ssstik.io/es');
  // let resStik = await dataStik.text();
  // let $a = cheerio.load(resStik);
  // let targetForm = $a('#splash > div > form').attr('data-hx-post');
  let response = await fetch(`https://snaptik.app/action.php?lang=es`, {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
      // 'content-type': 'multipart/form-data; boundary=----WebKitFormBoundarySq1g2mV8XbBKaBFO',
      'cookie': '__cflb=04dToWzoGizosSfQDdYpHiA1N6PrThY3EAgBjuvbMD; __cfduid=d74dbad3c06a23f2c773766b7ce53632e1619477511; d-khons=a42e47d93b69937cad371e3a6a23751a; current_language=es; _ga=GA1.2.626648099.1619477513; _gid=GA1.2.508639647.1619477513; _gat=1',
      'origin': 'https://snaptik.app',
      'referer': 'https://snaptik.app/es',
      'sec-ch-ua': `" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"`,
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36'
    },
    body: formData
  });
  let res = await response.text();
  const $ = cheerio.load(res);
  let enlaces = [];
  let indEnl = 0;
  $('#download-block > div > a').each(function() {
    indEnl ++;
    let urlExt = $(this).attr('href');
    // if(indEnl == 1) {
    //   urlExt = `https://snaptik.app/${$(this).attr('href')}`
    // }
    enlaces.push({
      url: urlExt,
      name: `video - Tiktok${indEnl}`,
      quality: `Opcion ${indEnl} - 480p`
    })
  });
  return enlaces;
  // console.log(res, response);
}

async function getUrlYoutubeExtend(id) {
  let response = await fetch(`https://downloader.freemake.com/api/videoinfo/${id}`, {
    headers: {
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
      'origin': 'https://www.freemake.com',
      'referer': 'https://www.freemake.com/es/free_video_downloader/',
      'sec-ch-ua': `" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"`,
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36',
      'x-analytics-header': 'UA-18256617-1',
      'x-cf-country': 'PE',
      'x-user-browser': 'Chrome',
      'x-user-id': '2894f65b-c29d-29fc-eaaa-bee1469bae19',
      'x-user-platform': 'Win32'
    }
  });
  let res = await response.json();
  return res;
}

async function getUrlStreamtape(url) {
  let response = await fetch(url);
  let res = await response.text();
  const $ = cheerio.load(res);
  let dataScript = $('body > script:nth-child(11)').html();
  if(dataScript == null) {
    dataScript = $('body > script:nth-child(10)').html();
  }
  if(dataScript == null) {
    dataScript = $('body > script:nth-child(12)').html();
  }
  let videoSrc = `let srcFile = ${dataScript.split("document.getElementById('vid'+'eolink').innerHTML = ")[1]} exports.srcFile = srcFile`;
  let realSrc = await _eval(videoSrc);
  // console.log(realSrc);
  let finalSrc = realSrc.srcFile.replace('stream=1', 'dl=1');
  if(!finalSrc.includes('dl=1')) {
    finalSrc = finalSrc + '&dl=1';
  }
  return {
    src: `https:${finalSrc}`,
    name: $('[name="og:title"]').attr('content')
  };
}

async function getUrlVimeo(url) {
  let response = await fetch(url);
  let res = await response.text();
  const $ = cheerio.load(res);
  let dataScript = $('#wrap > div.wrap_content.variant-v2 > script:nth-child(2)').html();
  let srcVideo = dataScript.split('config_url":"')[1].split('"')[0].replace(/[/]/g, '');
  let dataFetch = await fetch(srcVideo);
  let resFetch = await dataFetch.json();
  return resFetch.request.files.progressive;
}

async function getUrlTweet(url) {
  let formData = new FormData();
  // console.time('mp4');
  formData.append('url', url);
  let response = await fetch('https://www.savetweetvid.com/es/downloader', {
    method: 'POST',
    body: formData
  });
  let res = await response.text();
  const $ = cheerio.load(res);
  let enlaces = [];
 
  $('tbody').find('tr').each(function() {
    let indiceTd = 0;
    let qualities = [];
    let types = [];
    let urls = [];
    $(this).find('td').each(function(i) {
      indiceTd ++;
      if(indiceTd == 1) {
        qualities.push($(this).html().trim());
      }
      if(indiceTd == 2) {
        types.push($(this).html().trim());
      }
      if(indiceTd == 4) {
        urls.push($(this).find('a').attr('href'));
      }
      // console.log($(this).html());
    });
    qualities.forEach((item, i) => {
      enlaces.push({
        quality: item,
        type: types[i],
        url: urls[i]
      });
    });
  });
  // console.log(enlaces);
  // console.log(res);
  return enlaces;
}

async function getUrlDailyMotion(url) {
  let formData = new FormData();
  let responseToken = await fetch(`https://www.videosdownloader.world/es/dailymotion-video-downloader#${url}`, {
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'cookie': '__cfduid=dc9ffd95bca7c229f37327542dba2984e1619549855; _ga=GA1.2.26675558.1619549857; _gid=GA1.2.1644471526.1619549857; __cf_bm=2f4abfe6e9aa68e97d898475fc349c4f7fad9cc4-1619549859-1800-ASZKMGfjuQqlo8JR3eZXlMxXCltYdUq42l4FR56ieaaegvfWBQMVuMTIKomdxogitBkjuivq8j5x2J0luF1aFEKRnLQt+WwJ64ApMFQ8qmYyfWayq5c4plMCw7aKfM9qcQ==; PHPSESSID=7to53vnair0kjcth08badr4550',
      'sec-ch-ua': `" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"`,
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
    }
  });
  let resToken = await responseToken.text();
  const $ = cheerio.load(resToken);
  let tokenValue = $('#token').attr('value');
  formData.append('url', url);
  formData.append('token', tokenValue);
  let responseData = await fetch('https://www.videosdownloader.world/es/system/action.php', {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
      // 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'cookie': '__cfduid=dc9ffd95bca7c229f37327542dba2984e1619549855; _ga=GA1.2.26675558.1619549857; _gid=GA1.2.1644471526.1619549857; __cf_bm=2f4abfe6e9aa68e97d898475fc349c4f7fad9cc4-1619549859-1800-ASZKMGfjuQqlo8JR3eZXlMxXCltYdUq42l4FR56ieaaegvfWBQMVuMTIKomdxogitBkjuivq8j5x2J0luF1aFEKRnLQt+WwJ64ApMFQ8qmYyfWayq5c4plMCw7aKfM9qcQ==; PHPSESSID=7to53vnair0kjcth08badr4550; _gat_gtag_UA_156975142_13=1',
      'origin': 'https://www.videosdownloader.world',
      'referer': 'https://www.videosdownloader.world/es/dailymotion-video-downloader',
      'sec-ch-ua': `" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"`,
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
      'x-requested-with': 'XMLHttpRequest'
    },
    body: formData
  });
  let resData = await responseData.json();
  let enlaces = resData.links;
  return enlaces;
}

async function getUrlImdb(url) {
  // #a-page > script:nth-child(17)
  let response = await fetch(url);
  let res = await response.text();
  const $ = cheerio.load(res);
  let dataScript = $('#a-page > script:nth-child(17)').html();
  let videoData = dataScript.split('args = [')[1].split('];')[0];
  var re = /http([^"'\s]+)/g,
  text = videoData,
  encontrados = text.match(re);
  let realVideo = encontrados.find((v) => v.includes('mp4'));
  realVideo = realVideo.substring(0, realVideo.length - 1);
  // let realData = videoData.replace('')
  return realVideo;
}

async function getUrlStreamable(url) {
  let response = await fetch(url);
  let res = await response.text();
  const $ = cheerio.load(res);
  let enlace = $('[property="og:video"]').attr('content');
  return enlace;
}

async function getUrlLinkedIn(url) {
  let response = await fetch(url);
  let res = await response.text();
  const $ = cheerio.load(res);
  let enlaces;
  enlaces = JSON.parse($('video').attr('data-sources'));
  enlaces.forEach((item) => {
    item.url = item.src.replace(/amp;/g);
    item.type = item.type.replace('video/', '');
    let quality;
    if(item.url.includes('mp4-')) {
      quality = item.src.split('mp4-')[1].split('-')[0];
    } else {
      quality = '480p';
    }
    item.quality = quality;
  });
  return enlaces;
}

async function getUrlEspn(url) {
  let response = await fetch(url);
  let res = await response.text();
  const $ = cheerio.load(res);
  let idToken = $('#main-container > div > div > section.col-b > article > a > figure').attr('data-cerebro-id');
  let urlData = `https://watch.auth.api.espn.com/video/auth/getclip/${idToken}?apikey=uiqlbgzdwuru14v627vdusswb`;
  let responseJson = await fetch(urlData);
  let resJson = await responseJson.json();
  let realUrl = resJson.clip.transcodes.brightcove;
  // console.log(resJson);
  return realUrl;
}

async function getUrlLiveLeak(url) {
  let response = await fetch(url);
  let res = await response.text();
  const $ = cheerio.load(res);
  let enlaces = [];
  $('video').find('source').each(function() {
    enlaces.push({
      url: $(this).attr('src'),
      quality: $(this).attr('label')
    });
  });
  return enlaces;
}

async function forceDownlaodTwitch(url) {
  let formData = new FormData();
  // console.time('mp4');
  formData.append('url', url);
  formData.append('action', 'homePure');
  let response = await fetch('https://es.fetchfile.net/fetch/', {
    method: 'POST',
    body: formData
  });
  let res = await response.json();
  if(res.status == 'wait') {
    return await forceDownlaodTwitch(url);
  }
  let enlaces = res.formats;
  let realEnlaces = [];
  enlaces.forEach((item) => {
    if(item.format_id.toLowerCase() != 'audio_only') {
      realEnlaces.push({
        url: `/twitch?url=${item.url}&name=${res.title}`,
        type: item.ext,
        quality: item.format_id
      });
    }
  });
  return realEnlaces;
}

async function getDownloadTwitch(url) {
  let targetUrl = `https://untwitch.com/?url=${url}`;
  let response = await fetch(targetUrl, {
    headers: {
      'Referer': targetUrl,
      'sec-ch-ua': `" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"`,
      'sec-ch-ua-mobile': '?0',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
    }
  });
  let res = await response.text();
  const $ = cheerio.load(res);
  let enlaces = [];
  console.log(res);
  $('form').find('option').each(function() {
    console.log('dasd');
    let urlFormat = $(this).attr('value');
    if(urlFormat.includes('p')) {
      enlaces.push({
        url: `/twitch?url=${targetUrl}&type=${urlFormat}`,
        quality: urlFormat
      });
    }
  });
  console.log(enlaces);
  return enlaces;
}

async function getUrlTwitch(url) {
  let targetUrl = `https://keepv.id/?url=${url}`;
  let response = await fetch(targetUrl, {
    // headers: {
    //   'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    //   'cookie': 'PHPSESSID=0is6laav1bufd8iqu81o6kjpa6; _gid=GA1.2.1745428404.1619562227; _ga=GA1.2.1714765813.1619562226; _ga_RZYTG6REG8=GS1.1.1619562226.1.1.1619563321.0',
    //   'referer': 'https://keepv.id/download-twitch-videos',
    //   'upgrade-insecure-requests': '1',
    //   'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
    // }
  });
  let res = await response.text();
  const $ = cheerio.load(res);
  let dataScript = $('#page-top > main > script:nth-child(18)').html();
  let Sid = dataScript.split('sid=')[1].split(';')[0];
  let realSid = await _eval(`let dataSid = ${Sid}; exports.dataSid = dataSid;`);
  let finalSid = realSid.dataSid;
  let formData = new FormData();
  // console.time('mp4');
  formData.append('url', url);
  formData.append('sid', finalSid);
  let postData = await fetch('https://keepv.id/', {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
      // 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'cookie': 'PHPSESSID=0is6laav1bufd8iqu81o6kjpa6; _gid=GA1.2.1745428404.1619562227; _ga_RZYTG6REG8=GS1.1.1619562226.1.1.1619562275.0; _ga=GA1.2.1714765813.1619562226',
      'origin': 'https://keepv.id',
      'referer': targetUrl,
      'sec-ch-ua': `" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"`,
      'sec-ch-ua-mobile': '?1',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Mobile Safari/537.36',
      'x-requested-with': 'XMLHttpRequest'
    },
    body: formData
  });
  let resPost = await postData.text();
  console.log(resPost);
}

module.exports = ctrl;
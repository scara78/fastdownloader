let inputSearchLink = document.querySelector('.input-search');
let btnSendLink = document.querySelector('.btn-send-link');
let selectedServer = document.querySelector('.selected-server');
let bodyDownloadTable = document.querySelector('.body-download-table');
let msgIncorrectLink = document.querySelector('.msg-incorrect-link');
let autoComplete = document.querySelector('.autocomplete-keys');

function validateURL(textval) {
  var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return urlregex.test(textval);
}

function isUrl(s) {   
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(s);
}

let dataHistory = [];
if(localStorage.getItem('history-words')) {
  dataHistory = JSON.parse(localStorage.getItem('history-words'));
}

function saveWordInHistory(inputValue) {
  let verifyRepeatWord = dataHistory.find((v) => v == inputValue);
  if(!verifyRepeatWord && inputValue != '') {
    if(inputValue != null) {
      dataHistory.push(inputValue);
      localStorage.setItem('history-words', JSON.stringify(dataHistory));
    }
  }
}

async function getUrlDownload(inputValue) {
  saveWordInHistory(inputValue);
  if(inputValue == '' || !isUrl(inputValue)) {
    msgIncorrectLink.classList.remove('d-none');
    return;
  }
  loadActive();
  if(inputValue.includes('fembed.php')) {
    var paramsString = inputValue;
    var searchParams = new URLSearchParams(paramsString);
    let target;
    //Itera los parámetros de búsqueda.
    for (let p of searchParams) {
      target = p;
    }
    inputValue = `https://femax20.com/v/${target[1]}`;
  }
  if(inputValue.includes('pelispop.net')) {
    inputValue = inputValue.replace('pelispop.net', 'femax20.com');
  }
  // console.log(inputValue);
  let thisValue = inputValue;
  let response = await fetch(`/download?server=${selectedServer.value}&url=${thisValue}`);
  let res = await response.json();
  let dataResult = res.data;
  // console.log(dataResult);
  if(!res.enlacesActive) {
    dataResult = await executeScriptEnlaces(dataResult);
    let newData = [];
    dataResult.forEach((item) => {
      let srcVideo = 'https://tool.baoxinh.com' + aesCrypto.decrypt(item.url.split('=')[1], "root");
      newData.push({
        url: srcVideo,
        quality: item.quality
      })
    });
    dataResult = newData
  }
  let htmlDownload = '';
  dataResult.forEach((item) => {
    htmlDownload += `<div class="item-download">
    <div class="format-download">
      ${item.type || 'MP4'}
    </div>
    <div class="quality-download">
      ${item.quality}
    </div>
    <a href="${item.url}" target="_blank" class="enlace-url-download">
      Descargar ahora
    </a>
  </div>`;
  });
  if(htmlDownload == '') {
    htmlDownload = `<div class="msg-not-data">
    No se encontraron enlaces
  </div>`;
  }
  bodyDownloadTable.innerHTML = htmlDownload;
  msgIncorrectLink.classList.add('d-none');
  loadInactive();
  
  // console.log(dataResult);
}

function emptyData() {
  bodyDownloadTable.innerHTML = `<div class="msg-not-data">
  No se encontraron enlaces
</div>`;
}

function loadActive() {
  btnSendLink.innerHTML = `Cargando...`;
  bodyDownloadTable.innerHTML = `<div class="msg-loading-data"><div class="spinner"></div></div>`;
  btnSendLink.style.pointerEvents = 'none';
  inputSearchLink.disabled = true;
}

function loadInactive() {
  btnSendLink.innerHTML = `Convertir`;
  btnSendLink.style.pointerEvents = 'auto';
  inputSearchLink.disabled = false;
  inputSearchLink.focus();
}

function getOffsetLeft( elem )
  {
         var offsetLeft = 0;
         do {
           if ( !isNaN( elem.offsetLeft ) )
           {
               offsetLeft += elem.offsetLeft;
           }
         } while( elem = elem.offsetParent );
         return offsetLeft;
  }

  function getOffsetTop( elem )
  {
         var offsetTop = 0;
         do {
           if ( !isNaN( elem.offsetTop ) )
           {
               offsetTop += elem.offsetTop;
           }
         } while( elem = elem.offsetParent );
         return offsetTop;
  }

  function resizeAutocomplete() {
    autoComplete.style.position = 'absolute';
    autoComplete.style.top = parseFloat(getOffsetTop(inputSearchLink) + 57) + 'px';
    autoComplete.style.left = parseFloat(getOffsetLeft(inputSearchLink)) + 'px';
    autoComplete.style.width = `${inputSearchLink.offsetWidth}px`;
  }

  resizeAutocomplete();

  window.onresize = () => {
    resizeAutocomplete();
  }

// inputSearchLink.addEventListener('paste', async (e) => {
//   setTimeout(async () => {
//     await getUrlDownload(e.target.value);
//   }, 50);
// });

function initCompleteWords() {
  let htmlComplete = '';
  dataHistory.forEach((item) => {
    htmlComplete += `<div class="item-autocomplete">
    ${item}
  </div>`;
  });
  autoComplete.innerHTML = htmlComplete;
}

initCompleteWords();

function removeCompleteWord() {
  autoComplete.classList.add('d-none');
}

function reactiveCompleteWord() {
  autoComplete.classList.remove('d-none');
}

function checkCompleteWord(e) {
  // if(e.target.value == '') {
  //   removeCompleteWord();
  //   return;
  // }
  if(dataHistory.length <= 0 || e.keyCode == 27) {
    removeCompleteWord();
    return;
  }
  let htmlComplete = '';
  let dataFilter = dataHistory.filter((v) => v.lastIndexOf(e.target.value, 0) === 0 && v != e.target.value);
  dataFilter.forEach((item) => {
    htmlComplete += `<div class="item-autocomplete">
    ${item}
  </div>`;
  });
  autoComplete.innerHTML = htmlComplete;
  if(htmlComplete != '') {
    reactiveCompleteWord();
  } else {
    removeCompleteWord();
  }
}

let indiceComplete = 0;

function downItemComplete(e) {
  //Abajo
  let selectedItem = document.querySelector('.selected-complete');
  let allItemsSearch = document.querySelectorAll('.item-autocomplete');
  let newIndex = 0;
  allItemsSearch.forEach((v, i, vec) => {
    if(i < vec.length - 1) {
      if(v == selectedItem) {
        newIndex = i + 1;
      }
    }
  });
  let firstItemSearch = allItemsSearch[0];
  if(!selectedItem) {
    firstItemSearch.classList.add('selected-complete');
    e.currentTarget.value = firstItemSearch.textContent.trim();
    autoComplete.scroll({
      top: firstItemSearch.offsetTop,
      behavior: "smooth",
    });
  } else {
    selectedItem.classList.remove('selected-complete');
    allItemsSearch[newIndex].classList.add('selected-complete');
    e.currentTarget.value =  allItemsSearch[newIndex].textContent.trim();
    autoComplete.scroll({
      top: allItemsSearch[newIndex].offsetTop,
      behavior: "smooth",
    });
  }
}

function upItemComplete(e) {
   //Arriba
      // e.preventDefault();
      let selectedItem = document.querySelector('.selected-complete');
      let allItemsSearch = document.querySelectorAll('.item-autocomplete');
      let newIndex = 0;
      allItemsSearch.forEach((v, i, vec) => {
        if(i > 0) {
          if(v == selectedItem) {
            newIndex = i - 1;
          }
        }
      });
      // let firstItemSearch = allItemsSearch[0];
      if(!selectedItem) {
        // firstItemSearch.classList.add('selected-item-search');
      } else {
        selectedItem.classList.remove('selected-complete');
        allItemsSearch[newIndex].classList.add('selected-complete');
        e.currentTarget.value =  allItemsSearch[newIndex].textContent.trim();
        autoComplete.scroll({
          top: allItemsSearch[newIndex].offsetTop,
          behavior: "smooth",
        });
      }
}

document.body.addEventListener('click', async (e) => {
  if(e.target.classList.contains('item-autocomplete')) {
    inputSearchLink.value = e.target.textContent.trim();
    removeCompleteWord();
    await getUrlDownload(inputSearchLink.value);
    inputSearchLink.focus();
  }
  if(!e.target.classList.contains('input-search')) {
    removeCompleteWord();
  }
});

inputSearchLink.addEventListener('keydown', (e) => {
  // 40 - DOWN
  // 38 - UP
  if(e.keyCode == 40) {
    downItemComplete(e);
    return;
  }
  if(e.keyCode == 38) {
    upItemComplete(e);
    return;
  }
  if(e.keyCode == 27) {
    removeCompleteWord();
  } else {
    checkCompleteWord(e);
  }
});

inputSearchLink.addEventListener('blur', (e) => {
  // setTimeout(() => {
  //   removeCompleteWord();
  // }, 100);
});

inputSearchLink.addEventListener('focus', (e) => {
  if(dataHistory.length > 0 && document.querySelector('.item-autocomplete')) {
    checkCompleteWord(e.target.value);
    reactiveCompleteWord();
  }
});

selectedServer.addEventListener('change', (e) => {
  // switch(e.target.value) {
  //   case 'Youtube':
  //     inputSearchLink.placeholder = 'Ingrese link parecido a https://www.youtube.com/watch?v=id_video'
  //     break;
  // }
});

inputSearchLink.addEventListener('keyup', async (e) => {
  if(e.keyCode == 40 || e.keyCode == 38) {
    // e.preventDefault();
    return;
  }
  checkCompleteWord(e);

  if(e.target.value.includes('femax20.com') || e.target.value.includes('fembed.php') || e.target.value.includes('pelispop.net')) {
    selectedServer.value = 'Fembed';
  } else if(e.target.value.includes('youtube.com') || e.target.value.includes('youtu.be')) {
    selectedServer.value = 'Youtube';
  } else if(e.target.value.includes('videos.sh')) {
    selectedServer.value = 'VideoS';
  } else if(e.target.value.includes('upstream.to')) {
    selectedServer.value = 'Upfast';
  } else if(e.target.value.includes('dood.to') || e.target.value.includes('dood.so')) {
    selectedServer.value = 'DoodStream';
  } else if(e.target.value.includes('uqload.com')) {
    selectedServer.value = 'Uqload';
  } else if(e.target.value.includes('mystream.to')) {
    selectedServer.value = 'MyStream';
  } else if(e.target.value.includes('facebook.com')) {
    selectedServer.value = 'Facebook';
  } else if(e.target.value.includes('instagram.com')) {
    selectedServer.value = 'Instagram';
  } else if(e.target.value.includes('tiktok.com')) {
    selectedServer.value = 'TikTok';
  } else if(e.target.value.includes('strtape')) {
    selectedServer.value = 'Streamtape';
  } else if(e.target.value.includes('vimeo.com')) {
    selectedServer.value = 'Vimeo';
  } else if(e.target.value.includes('twitter.com')) {
    selectedServer.value = 'Twitter';
  } else if(e.target.value.includes('dailymotion.com')) {
    selectedServer.value = 'Dailymotion';
  } else if(e.target.value.includes('imdb.com')) {
    selectedServer.value = 'Imdb';
  } else if(e.target.value.includes('streamable.com')) {
    selectedServer.value = 'Streamable';
  } else if(e.target.value.includes('linkedin.com')) {
    selectedServer.value = 'Linkedin';
  } else if(e.target.value.includes('tumblr.com')) {
    selectedServer.value = 'Tumblr';
  } else if(e.target.value.includes('espn.com')) {
    selectedServer.value = 'Espn';
  } else if(e.target.value.includes('liveleak.com')) {
    selectedServer.value = 'Liveleak';
  } else if(e.target.value.includes('twitch.tv')) {
    selectedServer.value = 'Twitch';
  }
  if(e.keyCode == 13) { 
    e.preventDefault();
    let selectedComplete = document.querySelector('.selected-complete');
    if(!autoComplete.classList.contains('d-none') && selectedComplete) {
      // e.target.value = selectedComplete.textContent.trim();
    } else {
      await getUrlDownload(e.target.value);
    }
  }
  // console.log(e.target.value);
});

btnSendLink.addEventListener('click', async () => {
  await getUrlDownload(inputSearchLink.value);
});

async function executeScriptEnlaces(url) {
  await eval(url);
  // console.log(window.dataUrls);
  let enlaces = [];
  // console.log($(window.dataUrls).find('.btn-download-gg'), $(window.dataUrls).find('.btn-download-gg').prevObject);
  $(window.dataUrls).find('.btn-download-gg').prevObject.each(function() {
    // console.log(this.href);
    if(!this.href.includes('skachat')) {
      enlaces.push({
        url: `https://tool.baoxinh.com${this.href}`,
        quality: this.querySelector('b').textContent.trim().split(' ').pop()
      });
    }
  });
  return enlaces;
}

$('.loader-page-content').addClass('d-none');
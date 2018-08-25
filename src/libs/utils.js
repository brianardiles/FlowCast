const config = require('./src/libs/config.js');

var socket = io.connect('http://localhost:3000');
socket.on('deviceFound', (device) => {
  console.log('device found:', device.name);
  $('.avaliables-chromecasts').append(
    `<li onclick='selecetChromeCast(this)' device='${JSON.stringify(device)}'>${
      device.name
    }</li>`
  );
});

socket.on('playingStatus', (data) => {
  $('.current-time').html(data.currentTime);
  $('.total-time').html(data.duration);
  $('.progress').css('width', `${data.percent.toFixed(2)}%`);
});

socket.on('resetControllers', () => {
  $('.current-time').html('0:00:00');
  $('.total-time').html('0:00:00');
  $('.progress').css('width', 0);
  $('.play-btn').show();
  $('.pause-btn').hide();
});

const playVideo = (data) => {
  const videoPath = $(data).attr('path');
  const title = $(data).attr('title');
  const subsPath = $(data).attr('subs');
  let videoObjet = {videoPath: videoPath, title: title};

  $('.list li').each(() => {
    $(this).removeClass('active');
    $(this).attr('playing', 'false');
  });

  $(data).addClass('active');
  $(data).attr('playing', 'true');

  $('.play-btn').hide();
  $('.pause-btn').show();

  if (subsPath !== 'false') {
    videoObjet.subsPath = subsPath;
  }

  socket.emit('play', videoObjet);
};

const changeSubColor = (data, emit = false) => {
  try {
    $('.subtitles-ctl').removeClass('subtitles-selected');
    $(data).addClass('subtitles-selected');
    const color = $(data).attr('subtitles-color');
    if (emit) {
      socket.emit('changeSubColor', color);
    }
  } catch (error) {
    console.log(error);
  }
};

const changeSubSize = (size, emit = false) => {
  try {
    console.log('holaa');
    $('.subtitles-size').html(`x${size}`);
    $('#subtitlesRange').val(size);
    setSubtitleRangeColor($('#subtitlesRange'));
    if (emit) {
      socket.emit('changeSubSize', size);
    }
  } catch (error) {
    console.log(error);
  }
};

const saveInConfig = (data) => config.saveInConfig(data);

const searchChromeCasts = () => {
  $('.avaliables-chromecasts li').remove();
  socket.emit('searchChromeCasts');
  $('#chromeCastList').fadeIn('fast');
};

const selecetChromeCast = (data) => {
  const device = JSON.parse($(data).attr('device'));
  socket.emit('selectDevice', device.host);
  $('.chromecast-name').html(device.name);
  console.log('Device selected from list: ', device.name);
  $('#chromeCastList').fadeOut('fast');
};

const addToPlayList = (fileName, filePath, subsPath) =>
  $('.list').append(`
      <li title='${fileName}'
        path='${filePath}'
        subs=${subsPath}
        onclick="addActive(this)"
        ondblclick=playVideo(this)>
        ${fileName}
        <span class="video-options">
          <label for="select-sub"><img class="subs-icon" src="./src/imgs/subtitles.svg"></label>
          <img class="close-icon" onclick="deleteFromPlayList(this)" src="./src/imgs/close.svg">
        </span>
        </li>`);

document.addEventListener('dragover', (event) => {
  event.preventDefault();
  $('.welcome').addClass('drop-style');
  $('.playlist').addClass('drop-style');
});

document.addEventListener('dragleave', (event) => {
  event.preventDefault();
  $('.welcome').removeClass('drop-style');
  $('.playlist').removeClass('drop-style');
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  for (let f of e.dataTransfer.files) {
    const fileExt = f.path.split('.').pop();
    const fileName = f.path
      .split('\\')
      .pop()
      .split('/')
      .pop();
    if (fileExt === 'mp4') {
      console.log('File(s) dragged:', f.path);
      addToPlayList(fileName, f.path, false);
      $('.welcome').removeClass('drop-style');
      $('.playlist').removeClass('drop-style');
      $('.welcome').fadeOut('fast');
    }
  }
});

const callCtlAction = (data) => {
  const action = $(data).attr('action');
  if (action === 'play-btn') {
    $(data).hide();
    $('.pause-btn').show();
  } else if (action === 'pause-btn') {
    $(data).hide();
    $('.play-btn').show();
  }

  socket.emit(action);
};

const deleteFromPlayList = (data) => {
  $(data)
    .parent()
    .parent()
    .fadeOut('fast', () => {
      $(data)
        .parent()
        .parent()
        .remove();
    });
  let videosLeft = 0;
  $('.list li').each(() => {
    videosLeft++;
  });

  if (videosLeft === 1) {
    $('.welcome').fadeIn('fast');
  }
};

const addSubs = (data) => {
  const element = $(data)
    .parent()
    .parent();
};

const addActive = (data) => {
  $('.list li').each(() => {
    $(this).removeClass('active');
  });

  $(data).addClass('active');
};

const addsubtoplaylist = (subsPath) => {
  $('.active').attr('subs', subsPath);
  checkSubtitleIconStatus();
};

const showSettings = (selector) => {
  $(selector).fadeIn('fast');
  config.setSubtitlesCheck();
};

$(() => {
  $('input:file').change(() => {
    const subsPath = $(this)[0].files[0].path;
    console.log(subsPath);
    if (subsPath.split('.').pop() == 'srt') {
      // $('#noti').html("subtitle added!");
      addsubtoplaylist(subsPath);
    }
  });

  $('input[type="range"]').on('change mousemove', (e) => {
    setSubtitleRangeColor(e.target);
  });
});

const setSubtitleRangeColor = (data) => {
  let val =
    ($(data).val() - $(data).attr('min')) /
    ($(data).attr('max') - $(data).attr('min'));
  $(data).css(
    'background-image',
    '-webkit-gradient(linear, left top, right top, ' +
      'color-stop(' +
      val +
      ', #50E3C2), ' +
      'color-stop(' +
      val +
      ', #242424)' +
      ')'
  );
};

const checkSubtitleIconStatus = () =>
  $('.list li').each(() => {
    if ($(this).attr('subs') !== 'false') {
      $(this)
        .children()
        .children()
        .children()
        .css('opacity', '1');
    }
  });

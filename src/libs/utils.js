var socket = io.connect('http://localhost:3000');
socket.on('deviceFound', (device) => {
  console.log('device found:', device.name);
  $('.avaliables-chromecasts').append(`<li onclick='selecetChromeCast(this)' device='${JSON.stringify(device)}'>${device.name}</li>`);
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

function playVideo(data) {
  const videoPath = $(data).attr('path');
  const title = $(data).attr('title');
  const subsPath = $(data).attr('subs');
  let videoObjet = {videoPath: videoPath, title: title};

  $('.list li').each(function() {
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
}

function changeSubColor(color) {
  socket.emit('changeSubColor', color);
}

function changeSubSize(size) {
  socket.emit('changeSubSize', size);
}

function searchChromeCasts() {
    $('.avaliables-chromecasts li').remove();
    socket.emit('searchChromeCasts');
    $('#chromeCastList').fadeIn('fast');
}

function selecetChromeCast(data) {
    const device = JSON.parse($(data).attr('device'));
    socket.emit('selectDevice', device.host);
    $('.chromecast-name').html(device.name);
    console.log('Device selected from list: ', device.name);
    $('#chromeCastList').fadeOut('fast');
}

function addToPlayList(fileName, filePath, subsPath) {
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
        </li>`
      );
}

document.addEventListener('dragover', (event) => {
event.preventDefault();
});
document.addEventListener('drop', (e) => {
    e.preventDefault();
    for (let f of e.dataTransfer.files) {
        const fileExt = f.path.split('.').pop();
        const fileName = f.path.split('\\').pop().split('/').pop();
        if (fileExt === 'mp4') {
            console.log('File(s) dragged:', f.path);
            addToPlayList(fileName, f.path, false);
        }
    }
});

function callCtlAction(data) {
  const action = $(data).attr('action');
  if (action === 'play-btn') {
    $(data).hide();
    $('.pause-btn').show();
  } else if (action === 'pause-btn') {
    $(data).hide();
    $('.play-btn').show();
  }

  socket.emit(action);
}

function deleteFromPlayList(data) {
  $(data).parent().parent().fadeOut('fast', () => {
    $(data).parent().parent().remove();
  });
}

function addSubs(data) {
  const element = $(data).parent().parent();
}

function addActive(data) {
  $('.list li').each(function() {
    $(this).removeClass('active');
  });

  $(data).addClass('active');
}

function addsubtoplaylist(subsPath) {
    $('.active').attr('subs', subsPath);
    checkSubtitleIconStatus();
}

$(function() {
  $('input:file').change(function() {
    const subsPath = $(this)[0].files[0].path;
    console.log(subsPath);
    if (subsPath.split('.').pop() == 'srt') {
        // $('#noti').html("subtitle added!");
        addsubtoplaylist(subsPath);
    }
  });

$('input[type="range"]').on('change mousemove', function() {
    console.log('hola');
    let val = ($(this).val() - $(this).attr('min')) / ($(this).attr('max') - $(this).attr('min'));
    console.log(val);
    $(this).css('background-image',
                '-webkit-gradient(linear, left top, right top, '
                + 'color-stop(' + val + ', #50E3C2), '
                + 'color-stop(' + val + ', #242424)'
                + ')'
    );
});

const val2 = $('input[type="range"]');
const val = (val2.val() - val2.attr('min')) / (val2.attr('max') - val2.attr('min'));

val2.css('background-image',
            '-webkit-gradient(linear, left top, right top, '
            + 'color-stop(' + val + ', #50E3C2), '
            + 'color-stop(' + val + ', #242424)'
            + ')'
  );
});

function checkSubtitleIconStatus() {
    $('.list li').each(function() {
        if ($(this).attr('subs') !== 'false') {
            $(this).children().children().children().css('opacity', '1');
        }
    });
}

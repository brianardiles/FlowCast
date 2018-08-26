// Chromecast things
const chromecasts = require('chromecasts');
const server = require('./server');
const subtitles = require('./subtitles');
const configFile = require('../../config.json');

// RC
const rc = server.hostRC();

let d = null;
let deviceList = [];
let subStyle;
let resume;
let iosocket;

let duration = 0;
let currentTime = 0;

/**
 * Search chromecasts in the LAN
 * and emit and event to show them
 * and put all devices in an asosiative array with
 * the host as key
 * @param io socket
 */
const searchChromeCasts = (io) => {
  iosocket = io;
  console.log('Searching chromecasts');
  deviceList = [];
  let listOfChromeCasts = chromecasts();
  listOfChromeCasts.on('update', (device) => {
    /**
     * The chromecast show double devices
     * one external and one intertal. For this case only need
     * the external device(s)
     */
    if (!device.host.includes('local')) {
      console.log({
        name: device.name,
        host: device.host
      });
      iosocket.emit('deviceFound', {
        name: device.name,
        host: device.host
      });
      deviceList[device.host] = device;
    }
  });
};

module.exports.searchChromeCasts = searchChromeCasts;

/**
 * Select player by host
 * @param string host
 */
const selectDevice = (host) => {
  console.log('Devie selected: ', host);
  d = deviceList[host];
  this.setBackground('./src/imgs/background.png');
};

module.exports.selectDevice = selectDevice;

/**
 * Host the video and the subs in local
 * to send the chromecasts streaming
 * @param {string} videoPath the video path in the disk
 * @param {string} title The title of the video
 * @param {string} subsPath The path of the subs
 */
const play = async (videoPath, title, subsPath = false) => {
  console.log('aver los subs', subsPath);
  const videoUrl = await server.hostVideo(videoPath);
  let subtitleUrl;

  if (subsPath) {
    let subsPathVtt = subtitles.srtToVtt(subsPath);
    subtitleUrl = await server.hostSubs(subsPathVtt);

    // subconfig
    subStyle = {
      backgroundColor: '#FFFFFF00',
      foregroundColor: configFile.subtitleColor,
      edgeType: 'DROP_SHADOW',
      edgeColor: '#00000073',
      fontScale: configFile.subtitleSize,
      fontStyle: 'NORMAL',
      fontFamily: 'Helvetica',
      fontGenericFamily: 'SANS_SERIF',
      windowColor: 'NONE',
      windowRoundedCornerRadius: 0,
      windowType: 'NONE'
    };

    d.play(videoUrl, {
      title: title,
      type: 'video/mp4',
      subtitles: [subtitleUrl],
      autoSubtitles: true,
      textTrackStyle: subStyle
    });
  } else {
    d.play(videoUrl, {
      title: title,
      type: 'video/mp4'
    });
  }
  this.checkPlaying();
  console.log('Playing', d, title);
};

module.exports.play = play;

const changeSubColor = (color) => {
  subStyle.foregroundColor = color;
  console.log(subStyle);
  d.changeSubtitlesColor(subStyle, function(err, status) {
    console.log(status);
  });

  console.log('Color changed for: ', color);
};

module.exports.changeSubColor = changeSubColor;

/**
 * Change subtitle size on the fly :D
 * @param {int} size size of the subtitles
 */
const changeSubSize = (size) => {
  subStyle.fontScale = size;
  console.log(subStyle);
  d.changeSubtitlesSize(subStyle, function(err, status) {
    console.log(status);
  });

  console.log('Size change for: ', size);
};

module.exports.changeSubSize = changeSubSize;

/**
 * Set backgroud
 * @param {string} imgPath
 */
const setBackground = async (imgPath) => {
  const imgUrl = await server.hostImage(imgPath);
  d.play(imgUrl, {
    type: 'image/png'
  });

  console.log('Background seted', d);
};

module.exports.setBackground = setBackground;

/**
 * To start
 */
const toStart = () => {
  d.seek(0);

  console.log('Going to start');
};

module.exports.toStart = toStart;

/**
 * 30 seconds back
 */
const fastBack = () => {
  d.seek(currentTime - 30);

  console.log('Fast back');
};

module.exports.fastBack = fastBack;

/**
 * Pause
 */
const pauseBtn = () => {
  d.pause();
  d.status((err, status) => {
    console.log(status);
  });

  console.log('Pause');
};

module.exports.pauseBtn = pauseBtn;

/**
 * Resume
 */
const resumeBtn = () => {
  d.resume();

  console.log('Resume');
};

module.exports.resumeBtn = resumeBtn;

/**
 * +30 seconds
 */
const fastForward = () => {
  d.seek(currentTime + 30);

  console.log('Fast Forward');
};

module.exports.fastForward = fastForward;

/**
 * To end
 */
const toEnd = () => {
  d.seek(duration);

  console.log('Going to end');
};

module.exports.toEnd = toEnd;

const seekFromProgressBar = (percent) => {
  const seekTime = (percent * duration) / 100;
  d.seek(seekTime);

  console.log('seek from progress bar');
};

module.exports.seekFromProgressBar = seekFromProgressBar;

const checkPlaying = () => {
  const refreshStatus = setInterval(() => {
    d.status((err, status) => {
      if (status) {
        console.log(status);
        if (status.playerState !== 'PAUSED') {
          duration = status.media.duration;
          currentTime = status.currentTime;
          percent = (currentTime * 100) / duration;
          iosocket.emit('playingStatus', {
            duration: this.secondsToHHMMSS(duration).split('.')[0],
            currentTime: this.secondsToHHMMSS(currentTime).split('.')[0],
            percent: percent
          });
        }
      } else {
        this.resetControllers();
        this.checkIfNextVideoExists();
        clearInterval(refreshStatus);
      }
    });
  }, 1000);
};

module.exports.checkPlaying = checkPlaying;

const secondsToHHMMSS = (s) => {
  let h = Math.floor(s / 3600);
  s -= h * 3600;
  let m = Math.floor(s / 60);
  s -= m * 60;

  return h + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
};

module.exports.secondsToHHMMSS = secondsToHHMMSS;

const resetControllers = () => {
  iosocket.emit('resetControllers');
  this.setBackground('./src/imgs/background.png');
};

module.exports.resetControllers = resetControllers;

const checkIfNextVideoExists = () => {
  iosocket.emit('checkIfNextVideoExists');
};

module.exports.checkIfNextVideoExists = checkIfNextVideoExists;

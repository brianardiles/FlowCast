// Chromecast things
const chromecasts = require('chromecasts');
const server = require('./server');
const subtitles = require('./subtitles');

let d = null;
let deviceList = []

/**
 * Search chromecasts in the LAN
 * and emit and event to show them
 * and put all devices in an asosiative array with
 * the host as key
 * @param io socket
 */
const searchChromeCasts = (io) => {
  console.log('Searching chromecasts');
  let listOfChromeCasts = chromecasts()
  listOfChromeCasts.on('update', (device) => {
    /**
     * The chromecast show double devices
     * one external and one intertal. For this case only need
     * the local device(s)
     */
    if (device.host.includes('local')) {
      console.log({name: device.name, host: device.host})
      io.emit('deviceFound', {name: device.name, host: device.host})
      deviceList[device.host] = device
    }
  })
}

module.exports.searchChromeCasts = searchChromeCasts;

/**
 * Select player by host
 * @param player
 */
const selectDevice = (host) => {
  console.log('Devie selected: ', host);
  d = deviceList[host];
  this.play('/Users/brian/Downloads/LIKE .mp4', 'like dislike', '/Users/brian/Downloads/prueba.srt')
}

module.exports.selectDevice = selectDevice;

/**
 * Pass video + subs autohost
 * and play on the device
 */
const play = async (videoPath, title, subsPath) => {
  console.log('playing', d)
  const videoUrl = await server.hostFile(videoPath, 'video/mp4', 8559);
  const subsPathVtt = subtitles.srtToVtt(subsPath)
  const subtitleUrl = await server.hostFile(subsPathVtt, 'text/vtt', 8560);

  d.play(videoUrl,
    {
      title: title,
      type: 'video/mp4'
    }
  )
}

module.exports.play = play;
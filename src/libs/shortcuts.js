const device = require('./device.js');
const Mousetrap = require('mousetrap');

// Handle shorcuts

Mousetrap.bind(['command+left', 'ctrl+left'], async () => {
  device.toStart();
});

Mousetrap.bind('left', async () => {
  device.fastBack();
});

Mousetrap.bind('space', async () => {
  const deviceStatus = await device.getPlayerStatus();
  if (deviceStatus.playerState == 'PLAYING') {
    device.pauseBtn();
  } else if (deviceStatus.playerState == 'PAUSED') {
    device.resumeBtn();
  }
});

Mousetrap.bind('right', async () => {
  device.fastForward();
});

Mousetrap.bind(['command+right', 'ctrl+right'], async () => {
  device.toEnd();
});

// WebSocket things
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3000);

// device
let device = require('./device.js');

// vars
let initiate = false;

/**
 * When a client is conected for the websocket
 * only the firsts time serach chromecasts
 */
io.on('connection', (socket) => {
  if (!initiate) {
    console.log('Client connected');
    device.searchChromeCasts(io);
    initiate = true;
  }

  socket.on('searchChromeCasts', () => {
    device.searchChromeCasts(io);
  });

  socket.on('selectDevice', (host) => {
    device.selectDevice(host);
  });

  socket.on('play', (data) => {
    device.play(data.videoPath, data.title, data.subsPath);
  });

  socket.on('changeSubColor', (color) => {
    device.changeSubColor(color);
  });

  socket.on('changeSubSize', (size) => {
    device.changeSubSize(size);
  });

  socket.on('to-start', () => {
    device.toStart();
  });

  socket.on('fast-back', () => {
    device.fastBack();
  });

  socket.on('play-btn', () => {
    device.resumeBtn();
  });

  socket.on('pause-btn', () => {
    device.pauseBtn();
  });

  socket.on('fast-forward', () => {
    device.fastForward();
  });

  socket.on('to-end', () => {
    device.toEnd();
  });
});

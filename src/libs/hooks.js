// WebSocket things
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(3000);

// device
let device = require('./device.js');

// vars
let initiate = false;
let s = null;

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

  socket.on('selectDevice', (host) => {
    device.selectDevice(host);
  });
});
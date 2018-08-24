const http = require('http');
const fs = require('fs');
const ipFinder = require('ip');
const ip = ipFinder.address();
const net = require('net');

const listen = require('listen-random-port');

/**
 * Host the mp4 file and return the url
 */
const hostVideo = async (videoPath) => {
  const hosting = http.createServer(function(req, res) {
    const stat = fs.statSync(videoPath);
    const total = stat.size;
    if (req.headers['range']) {
      const range = req.headers.range;
      const parts = range.replace(/bytes=/, '').split('-');
      const partialstart = parts[0];
      const partialend = parts[1];

      const start = parseInt(partialstart, 10);
      const end = partialend ? parseInt(partialend, 10) : total - 1;
      const chunksize = (end - start) + 1;
      console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

      const file = fs.createReadStream(videoPath, {
        start: start,
        end: end
      });

      res.writeHead(206, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
        'Access-Control-Allow-Origin': '*'
      });
      file.pipe(res);
    } else {
      console.log('ALL: ' + total);
      res.writeHead(200, {
        'Content-Length': total,
        'Content-Type': 'video/mp4'
      });
      fs.createReadStream(videoPath).pipe(res);
    }
  }).listen();

  const server = `http://${ip}:${hosting.address().port}`;
  console.log(`Server video listen: ${server}/`);

  return server;
};

module.exports.hostVideo = hostVideo;

/**
 * Host the vtt file and return the url
 */
const hostSubs = (subsPath) => {
  const port = 8561;
  const hosting = http.createServer(function(req, res) {
    const stat = fs.statSync(subsPath);
    const total = stat.size;
    const file = fs.createReadStream(subsPath);
    res.writeHead(206, {
      'Content-Type': 'text/vtt',
      'Access-Control-Allow-Origin': '*'
    });
    file.pipe(res);
    }).listen(port, ip);

  const server = `http://${ip}:${port}`;
  console.log(`Server subtitles listen: ${server}/`);

  return server;
};

module.exports.hostSubs = hostSubs;

/**
 * Host imgage file and return the url
 */
const hostImage = (imgPath) => {
  const port = 8562;
  http.createServer(function(req, res) {
    const stat = fs.statSync(imgPath);
    const total = stat.size;
    const file = fs.createReadStream(imgPath);
    res.writeHead(206, {
      'Content-Type': 'image/png',
      'Access-Control-Allow-Origin': '*'
    });
    file.pipe(res);
    }).listen(port, ip);

  const server = `http://${ip}:${port}`;
  console.log(`Server image listen: ${server}/`);

  return server;
};

module.exports.hostImage = hostImage;

/**
 * Host imgage file and return the url
 */
const hostRC = () => {
  const port = 8563;
  const host = http.createServer(function(request, res) {
    fs.readFile('rc.html',
    function(err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }

      res.writeHead(200);
      res.end(data);
    });
  });

  host.listen(port);
  const server = `http://${ip}:${port}`;
  console.log(`Server RC listen: ${server}/`);
};

module.exports.hostRC = hostRC;

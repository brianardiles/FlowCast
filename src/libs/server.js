const http = require("http")
const fs = require('fs')
const ipFinder = require('ip')

const hostFile = async (path, type, port) => {
  const ip = ipFinder.address();
  http.createServer(function(req, res) {
    const stat = fs.statSync(path);
    const total = stat.size;
    if (req.headers['range']) {
      const range = req.headers.range;
      const parts = range.replace(/bytes=/, "").split("-");
      const partialstart = parts[0];
      const partialend = parts[1];

      const start = parseInt(partialstart, 10);
      const end = partialend ? parseInt(partialend, 10) : total - 1;
      const chunksize = (end - start) + 1;
      console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

      const file = fs.createReadStream(path, {
        start: start,
        end: end
      });

      res.writeHead(206, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': type,
        'Access-Control-Allow-Origin': '*'
      });
      file.pipe(res);

    } else {
      console.log('ALL: ' + total);
      res.writeHead(200, {
        'Content-Length': total,
        'Content-Type': type
      });
      fs.createReadStream(path).pipe(res);
    }
  }).listen(port, ip);
  const server = `http://${ip}:${port}`
  console.log(`Server video listen: ${server}/`);

  return server;
}

module.exports.hostFile = hostFile;
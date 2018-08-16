const fs = require('fs');
const srt2vtt = require('srt2vtt');
const uniqid = require('uniqid');

const subsDir = '../subs';
 
const srtToVtt = (subsPath) => {
    const srtData = fs.readFileSync(subsPath);
    const subsPathVtt = `${subsDir}/${uniqid()}.vtt`;
    srt2vtt(srtData, function(err, vttData) {
      if (err) throw new Error(err);
      fs.writeFileSync(`${subsPathVtt}`, vttData);
    });

    return subsPathVtt;
}

module.exports.srtToVtt = srtToVtt;
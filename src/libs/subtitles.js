const fs = require('fs');
const srt2vtt = require('srt2vtt');

const subsDir = 'src/subs';

const srtToVtt = (subsPath) => {
    const srtData = fs.readFileSync(subsPath);
    const subsPathVtt = `${subsDir}/sub.vtt`;
    srt2vtt(srtData, function(err, vttData) {
      if (err) throw new Error(err);
      fs.writeFileSync(`${subsPathVtt}`, vttData);
    });

    return subsPathVtt;
};

module.exports.srtToVtt = srtToVtt;

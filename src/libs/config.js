const updateJsonFile = require('update-json-file');
const CONFIG_FILE = `${process.cwd()}/config.json`;
const configFile = window.require(CONFIG_FILE);

const setSubtitlesCheck = () => {
  changeSubSize(configFile.subtitleSize);
  if (configFile.subtitleColor === '#FFFFFFFF') {
    changeSubColor($('.subtitles-white'), false);
    console.log('holalaa');
  } else if (configFile.subtitleColor === '#FFFF00FF') {
    changeSubColor($('.subtitles-yellow'), false);
  }
};

module.exports.setSubtitlesCheck = setSubtitlesCheck;

const saveInConfig = (params) => {
  updateJsonFile(CONFIG_FILE, (data) => {
    console.log(data[params.key]);
    data[params.key] = params.value;
    return data;
  });
};

module.exports.saveInConfig = saveInConfig;

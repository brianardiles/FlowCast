const APP_DATA_DIR = require('electron').remote.getGlobal('appData').dir;
const updateJsonFile = require('update-json-file');
const createIfNotExist = require('create-if-not-exist');

const fileObj = {
  subtitleColor: '#FFFFFFFF',
  subtitleSize: '1.5',
  language: 'en'
};

createIfNotExist(`${APP_DATA_DIR}/config.json`, JSON.stringify(fileObj));
const CONFIG_FILE = `${APP_DATA_DIR}/config.json`;
const configFile = require(CONFIG_FILE);

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

var remoteVersion,
  localVersion,
  autoupdate,
  localDev = false;

debug(localDev);

function debug(localDev) {
  if (localDev == true) {
    throw new('[INFO]: DEBUG MODE');
  }
}

var gitrepo = "FlowCast";

var request = require("request"),
  getpkg = require('../package.json');

localVersion = getpkg.version;
var url = "https://raw.githubusercontent.com/brai4u/" + gitrepo + "/master/package.json";

requestUpdate();
var checkUpdate = setInterval(function(){ requestUpdate() }, 5000);

function requestUpdate(){
  request({
    url: url,
    json: true
  }, function(error, response, json) {

    if (!error && response.statusCode === 200) {
      if (json.developerMode == true) {
        console.log("developer mode");
        return 1;
      }
      autoupdate = json.autoupdate;
      if (json.version != localVersion) {
        remoteVersion = json.version;
        updateFlow();
      } else {
        console.log("No need a update");
        clearInterval(checkUpdate);
      }
    }
  })
}

function updateFlow() {
  var fileSize,
    size = 0;
  console.log('https://github.com/brai4u/' + gitrepo + '/archive/v' + autoupdate + '.zip')
  request('https://github.com/brai4u/' + gitrepo + '/archive/v' + autoupdate + '.zip')
    .on('response', function(response) {
      fileSize = response.headers['content-length'];
      clearInterval(checkUpdate);
    })

  .on('data', function(data) {
    size += data.length;
    var porcentaje = size * 100 / fileSize;

    if (isNaN(porcentaje)) {
      $("#noti").hide();
    } else {
      $("#noti").show();
    }

    $("#noti").html("Updating: " + porcentaje.toFixed(0) + "%")
    console.log(porcentaje.toFixed(0))
    if(porcentaje == "100"){
     $("#noti").html("Installing...");
    }
  })

  .pipe(fs.createWriteStream('autoupdate.zip'))
    .on('close', function() {
      console.log('Dowloaded: v' + autoupdate);
      installUpdate();
    });
}

function installUpdate() {
  var AdmZip = require('adm-zip');
  var zip = new AdmZip("./autoupdate.zip");
  console.log(gitrepo + "-" + autoupdate)
  zip.extractEntryTo(gitrepo + "-" + autoupdate + "/app/", "./app", false, true);
  zip.extractEntryTo(gitrepo + "-" + autoupdate + "/node_modules/", "./node_modules", false, true);
  zip.extractEntryTo(gitrepo + "-" + autoupdate + "/package.json", "./", false, true);
  $("#noti").html("Please restart FlowCast!");
}
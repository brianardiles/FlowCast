var remoteVersion,
    localVersion;

var request = require("request"),
    getpkg = require('../package.json');

localVersion = getpkg.version;
var url = "https://raw.githubusercontent.com/brai4u/FCautoUpdate/master/package.json"

request({
    url: url,
    json: true
}, function (error, response, json) {

    if (!error && response.statusCode === 200) {
      if(json.version != localVersion){
        remoteVersion = json.version;
        updateFlow();
      }
      else{
        console.log("Actualizado")
      }
    }
})

function updateFlow(){
var fileSize,
    size = 0;

request('https://rawgit.com/brai4u/FCautoUpdate/master/updates/update.zip')
  .on('response', function(response) {
      fileSize = response.headers['content-length'];
    })

  .on('data', function (data){
    size +=data.length;
    var porcentaje = size * 100 / fileSize;
    $("#noti").show()
    $("#noti").html("Updating: " + porcentaje.toFixed(0) + "%")
    console.log(porcentaje.toFixed(0))
  })

  .pipe(fs.createWriteStream('autoupdate.zip'))
  .on('close', function () {
    console.log('descarga completa');
    installUpdate();
  });
}

function installUpdate(){
  console.log("Installing new update...");
  var zip = new AdmZip("./autoupdate.zip");
  var zipEntries = zip.getEntries();
  zip.extractAllTo("./probando", true)
  console.log("Installed")
}
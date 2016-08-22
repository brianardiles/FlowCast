var remoteVersion,
    localVersion,
    autoupdate;

var gitrepo = "FCautoUpdate";

var request = require("request"),
    getpkg = require('../package.json');

localVersion = getpkg.version;
var url = "https://raw.githubusercontent.com/brai4u/"+gitrepo+"/master/package.json"

request({
    url: url,
    json: true
}, function (error, response, json) {

    if (!error && response.statusCode === 200) {
      if(json.developerMode){
        console.log("developer mode");
        return 1;
      }
      autoupdate = json.autoupdate;
      if(json.version != localVersion){
        remoteVersion = json.version;
        updateFlow();
      }
      else{
        console.log("Updated!")
      }
    }
})

function updateFlow(){
var fileSize,
    size = 0;
console.log('https://github.com/brai4u/'+gitrepo+'/archive/v'+autoupdate+'.zip')
request('https://github.com/brai4u/'+gitrepo+'/archive/v'+autoupdate+'.zip')
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
    console.log('Dowloaded: v' + autoupdate);
    installUpdate();
  });
}
function installUpdate(){
    $("#noti").html("Installing update");
    var AdmZip = require('adm-zip');
    var zip = new AdmZip("./autoupdate.zip");
    console.log(gitrepo + "-" +autoupdate)
    zip.extractEntryTo(gitrepo + "-" +autoupdate+"/app/", "./app", false, true);
    zip.extractEntryTo(gitrepo + "-" +autoupdate+"/node_modules/", "./node_modules", false, true);
    zip.extractEntryTo(gitrepo + "-" +autoupdate+"/package.json", "./", false, true);
    $("#noti").html("Update complete!");

    //restart
    gui.Window.get().reloadIgnoringCache();
}
if(!fileExists('app/config.json')){
	var obj = {subtitleColor: '#FFFFFFFF', subtitleSize: '1.5', language: 'en'}	 
	jsonfile.writeFile('app/config.json', obj, {spaces: 2}, function(err) {
	  console.error(err)
	})
}

function getConfig(){
	var pathconfig = process.cwd() + '\\app\\config.json';
	getconfig = require(pathconfig);
	subtitlesSize = getconfig.subtitleSize;
	subtitlesColor = getconfig.subtitleColor;

	$("#subtitlesRange").attr("value", subtitlesSize);
	$("#subtitleInput").attr("value", subtitlesSize);
	
	if(subtitlesColor == "#FFFFFFFF"){
		$("#whiteCheck").show();
	}else if(subtitlesColor == "#FFFF00FF"){
		$("#yellowCheck").show();
	}
}

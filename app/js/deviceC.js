function startStreaming(status) {
    if (!dropVideo) {
        alert("No se puede dar play sin video");
        return;
    }
    $("#ChromecastDevice").html("Creating video server...");
    ServerVideo(dropVideo);

    if (dropSubs) {
        $("#ChromecastDevice").html("Creating subtitles server...");
        ServerSubs(dropSubs);
        media = {
            url: 'http://' + ipLocal + ':8659/',
            subtitles: [{
                language: 'en-US',
                url: 'http://' + ipLocal + ':8658/',
                name: 'English',
            }],
            cover: {
                title: FileName
            },
            subtitles_style: {
                backgroundColor: '#FFFFFF00', // see http://dev.w3.org/csswg/css-color/#hex-notation
                foregroundColor: '#FFFFFFFF', // see http://dev.w3.org/csswg/css-color/#hex-notation
                edgeType: 'DROP_SHADOW', // can be: "NONE", "OUTLINE", "DROP_SHADOW", "RAISED", "DEPRESSED"
                edgeColor: '#00000073', // see http://dev.w3.org/csswg/css-color/#hex-notation
                fontScale: 1.5, // transforms into "font-size: " + (fontScale*100) +"%"
                fontStyle: 'NORMAL', // can be: "NORMAL", "BOLD", "BOLD_ITALIC", "ITALIC",
                fontFamily: 'Helvetica',
                fontGenericFamily: 'SANS_SERIF', // can be: "SANS_SERIF", "MONOSPACED_SANS_SERIF", "SERIF", "MONOSPACED_SERIF", "CASUAL", "CURSIVE", "SMALL_CAPITALS",
                windowColor: 'NONE', // see http://dev.w3.org/csswg/css-color/#hex-notation
                windowRoundedCornerRadius: 0, // radius in px
                windowType: 'NONE' // can be: "NONE", "NORMAL", "ROUNDED_CORNERS"
            }
        }
    } else {
        media = {
            url: 'http://' + ipLocal + ':8659/',
            cover: {
                title: FileName
            }
        }
    }

    //always force a fresh conection

    chromecastjs = require('chromecast-js')
    var browser = new chromecastjs.Browser()

    browser.on('deviceOn', function(_device) {
        device = _device;
        device.connect()
        device.on('connected', function() {

            if (resume) {
                device.play(media, resume, function() {
                    $('#play').attr('class', 'fa fa-pause fa-3x');
                    $('#play').attr('id', 'pause');
                    console.log("playing at: " + resume);
                    $("#ChromecastDevice").html(device.config.name);
                    setDuration();
                    statusBar();
                    resume = null;
                    dropSubs = null;
                    deviceStatus = true;
                });
            } else {
                device.play(media, 0, function() {
                    console.log("ChromeCast IP: " + device.host);
                    $("#ChromecastDevice").html(device.config.name);
                    setDuration();
                    statusBar();
                    $('#play').attr('class', 'fa fa-pause fa-3x');
                    $('#play').attr('id', 'pause');
                    pause = false
                    resume = null;
                    dropSubs = null;
                    deviceStatus = true;
                });
            }
        })
    })
}

function SelectData(select) {
    if (select.value == "nosubs") {
        device.subtitlesOff(function(err, status) {
            if (err) console.log("error setting subtitles off...")
            console.log("subtitles removed.")
        });
    } else {
        CreateSubs(select.value);
    }
}

function CreateSubs(fullpath) {
    dropSubs = fullpath
    var srtData = fs.readFileSync(dropSubs);
    srt2vtt(srtData, function(err, vttData) {
        if (err) throw new Error(err);
        fs.writeFileSync(name + '.vtt', vttData);
        dropSubs = fullpath.replace('.srt', '.vtt');

        if (deviceStatus) {
            device.getStatus(function(newStatus) {
                resume = newStatus.currentTime
            });

            startStreaming();
        }

    });
}

function setDuration() {
    device.getStatus(function(status) {
        timeFinal = secondsTimeSpanToHMS(status.media.duration).split('.')
        $("#timeEnd").html(timeFinal[0]);
        duration = status.media.duration;
    });
}

function statusBar() {
    timerInterval = setInterval(function() {
        device.getStatus(function(newStatus) {
            tiempoCrudo = newStatus.currentTime;
            currentT = secondsTimeSpanToHMS(newStatus.currentTime).split('.')
                //console.log(tiempoCrudo * 100 / duration); // porcentaje debug
            $("#timeStart").html(currentT[0]);
            porciento = tiempoCrudo * 100 / duration;
            $('#progress').attr('style', "width:" + porciento + "%");
            if (porciento >= 98) {
                device.close();
                CleanControlls();
            }
        });
    }, 1000);
}

//http://stackoverflow.com/a/11792861
function secondsTimeSpanToHMS(s) {
    var h = Math.floor(s / 3600);
    s -= h * 3600;
    var m = Math.floor(s / 60);
    s -= m * 60;
    return h + ":" + (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s);
}
//http://stackoverflow.com/a/11792861

function CleanControlls() {
    clearInterval(timerInterval);
    $("#timeStart").html("0:00:00");
    $("#timeEnd").html("0:00:00");
    $("filename").html("Drag & drop a video here :)");
    $('#pause').attr('class', 'fa fa-play fa-3x');
    $("#pause").attr("id", "play");
    $('#progress').attr('style', "width:0%");
    $("#filename").html("Drag & drop a video here :)");
    $('#subSelect').html('<option value="nosubs">No subs</option>');
}

function stopStreaming() {
    device.stop(function() {
        //device.close();
        device = undefined;
        deviceStatus = false;
        dropSubs = null;
        dropVideo = null;
        pause = false;
        $('#filename').html('');
        CleanControlls();
    });
}

function backTo() {
    device.getStatus(function(status) {
        device.seekTo(-status.media.duration, function() {
            device.pause(function() {
                pause = true
                $('#pause').attr('class', 'fa fa-play fa-3x');
                $("#pause").attr("id", "play");
            });
        });
    });
}

function seekTo(where) {
    if (where == "go") {
        device.seek(30, function() {
            console.log('seeking forward!')
        });
    } else {
        device.seek(-30, function() {
            console.log('seeking back!')
        });
    }
}

function loadchromecast() {
    ServerImage();
    loadingChrome();

    //view
    $('#oops').fadeOut("fast");
    $('#status').fadeIn();
    //view

    chromecastjs = require('chromecast-js')
    var browser = new chromecastjs.Browser()

    browser.on('deviceOn', function(_device) {
        $("#ChromecastDevice").html("Searching devices");
        device = _device;
        console.log(device.host);
        device.connect()
        $("#ChromecastDevice").html("Conecting at device");
        device.on('connected', function() {
            $("#ChromecastDevice").html(device.config.name);
            device.background('http://192.168.0.16:8660/', function() {
                loadingEnd();
                background = true;
            });
        })
    })
}

function loadingChrome() {
    var rot = 0
    loading = setInterval(function() {
        rot += 6
        $("#chromecastIcon-big").css('-webkit-transform', 'rotate(' + rot + 'deg)')
    }, 30);
}

function startUpTime() {
    timerun = 0
    startup = setInterval(function() {
        timerun++
        console.log(timerun);

        if (timerun >= 20) {
            console.log("se cierra");
            clearInterval(startup);
            clearInterval(loading);
            $("#pop").fadeIn();
            $("#status").fadeOut("");
            $("#oops").fadeIn();
        }
    }, 1000);
}

function loadingEnd() {
    clearInterval(loading);
    $("#chromecastIcon-big").css('-webkit-transform', 'rotate(0deg)');
    $("#pop").fadeOut();
    $("#status").attr("class", "status-loaded");
    $("#chromecastIcon-big").attr("id", "chromecastIcon");
    clearInterval(startup);
}

//debug
console.log("deviceC.js loaded");
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
    chromecastjs = require('chromecast-js')
    var browser = new chromecastjs.Browser()

    browser.on('deviceOn', function(_device) {
        $("#ChromecastDevice").html("Searching devices");
        device = _device;
        device.connect()
        $("#ChromecastDevice").html("Conecting at device");
        device.on('connected', function() {
            deviceStatus = true;

            if (resume) {
                device.play(media, resume, function() {
                    $('#play').attr('class', 'fa fa-pause fa-3x');
                    $('#play').attr('id', 'pause');
                    console.log("playing at: " + resume);
                    $("#ChromecastDevice").html('Chromecast: ' + device.host);
                    setDuration();
                    statusBar();
                    resume = null;
                    dropSubs = null;
                });
            } else {
                device.play(media, 0, function() {
                    console.log("ChromeCast IP: " + device.host);
                    $("#ChromecastDevice").html('Chromecast: ' + device.host);
                    setDuration();
                    statusBar();
                    $('#play').attr('class', 'fa fa-pause fa-3x');
                    $('#play').attr('id', 'pause');
                    pause = false
                    resume = null;
                    dropSubs = null;
                });
            }
        })
    })
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
                CleanCorntrol();
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


function CleanCorntrol() {
    $("#timeStart").html("0:00:00");
    $("#timeEnd").html("0:00:00");
    $("filename").html("Drag & drop a video here :)");
    $('#pause').attr('class', 'fa fa-play fa-3x');
    $("#pause").attr("id", "play");
    $('#progress').attr('style', "width:0%");
    $("#ChromecastDevice").html("No device conected");
    $("#filename").html("Drag & drop a video here :)");
}

function stopStreaming() {
    device.stop(function() {
        device.close();
        device = undefined;
        deviceStatus = false;
        dropSubs = null;
        dropVideo = null;
        pause = false;
        $('#filename').html('');
        clearInterval(timerInterval);
        CleanCorntrol();
    });
}

function backTo() {
    device.getStatus(function(status) {
        device.seekTo(-status.media.duration, function() {
            device.pause();
            console.log('back to back');
        });
    });
}

//debug
console.log("main loaded");
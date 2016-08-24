function startStreaming(status) {
    if (!dropVideo) {
        alert("Load any video");
        return;
    }

    $("li").each(function() {
        if ($(this).attr("pathFile") == dropVideo) {
            $(this).addClass("selected")
            $(this).attr("playing", "true")
        } else {
            $(this).removeClass("selected")
            $(this).attr("playing", "false")
        }
    });

    FileName = dropVideo.split('\\').pop();
    $("#ChromecastDevice").html("Streaming video...");
    ServerVideo(dropVideo);
    if (dropSubs) {
        $("#ChromecastDevice").html("Streaming subtitles...");
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
                    changeSub = false;
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
                    changeSub = false;
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
        changeSub = true
        CreateSubs(select.value);
    }
}

function CreateSubs(fullpath) {
    dropSubs = fullpath
    filesubtmp = fullpath.split('\\').pop().replace('.srt', '.vtt')
    var srtData = fs.readFileSync(dropSubs);
    srt2vtt(srtData, function(err, vttData) {
        if (err) throw new Error(err);
        var destSub = process.cwd() + '\\app\\temp\\subs\\' + filesubtmp;
        fs.writeFileSync(destSub, vttData);
        dropSubs = destSub;
    });
    var fileVideo = $(".selected").attr("pathFile")
    if (changeSub && dropVideo == fileVideo) {
        device.getStatus(function(newStatus) {
            resume = newStatus.currentTime
        });

        startStreaming();
    }
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
                nextPlayList();
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
    $('#pause').attr('class', 'fa fa-play fa-3x');
    $("#pause").attr("id", "play");
    $('#progress').attr('style', "width:0%");
}

function stopStreaming() {
    deviceStatus = false;
    device.stop(function() {
        device.close();
        device = undefined;
        deviceStatus = false;
        dropSubs = null;
        dropVideo = null;
        pause = false;
        $('#filename').html('');
        CleanControlls();
    });
}

function setnosub() {
    $('#subSelect').html('<option value="nosubs">No subs</option>');
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

function goTo() {
    device.getStatus(function(status) {
        device.seekTo(status.media.duration - 1);
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
            device.background('http://' + ipLocal + ':8660/', function() {
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

function addtoplaylist(nameF, pathfullFile, pathfullSubs) {
    $('#filename').hide();
    $('#videoFile').hide();
    $('#list').append(
        '<li onclick="selectItem(this)" ondblclick="playList(this);" pathFile="' + pathfullFile + '" pathSubs="' + pathfullSubs + '">' + nameF + '<i onclick="delfromplaylist(this);" class="fa fa-times delfromplaylist" aria-hidden="true"></i></li>'
    );
}

function delfromplaylist(data) {
    $(data).parent().remove();
}

function playList(data) {
    var file = $(data).attr("pathFile");
    var subs = $(data).attr("pathSubs");
    FileName = file.split('\\').pop();
    console.log(FileName);
    if (subs == "0") {
        dropSubs = null
        dropVideo = file
        setnosub();
        startStreaming()
    } else {
        var subname = subs.split('\\').pop();
        setnosub();
        $('#subSelect').prepend('<option selected value="' + subs + '">' + subname + '</option>');
        CreateSubs(subs)
        dropVideo = file
        startStreaming()
    }
}

function selectItem(data) {
    $('li').removeClass("selected")
    $(data).addClass("selected");
    var subs = $(data).attr("pathSubs");

    if (subs == "0") {
        setnosub();
    } else {
        var subname = subs.split('\\').pop();
        setnosub();
        $('#subSelect').prepend('<option selected value="' + subs + '">' + subname + '</option>');
    }
}

function reloadvalues() {
    var subs = $('.selected').attr("pathSubs");
    if (subs == "0") {
        setnosub();
    } else {
        var subname = subs.split('\\').pop();
        setnosub();
        $('#subSelect').prepend('<option selected value="' + subs + '">' + subname + '</option>');
        $('#noti').html("subtitle added!");
        $('#noti').show();
        changeSub = true;
        CreateSubs(subs)
        setTimeout(
            function() {
                $('#noti').fadeOut();
            }, 1000);
    }
}

function nextPlayList() {
    var nextitem = $('li[playing=true]').next()
    if (nextitem.is('li')) {
        $(nextitem).dblclick();
    }
}

function addsubtoplaylist(fullpath) {
    $(".selected").attr("pathSubs", fullpath)
}

function loadingEnd() {
    clearInterval(loading);
    $("#chromecastIcon-big").css('-webkit-transform', 'rotate(0deg)');
    $("#pop").fadeOut();
    $("#status").attr("class", "status-loaded");
    $("#chromecastIcon-big").attr("id", "chromecastIcon");
    clearInterval(startup);
}

//original function @guybedford
function ClearSubsFolder(){
    var dirPath = process.cwd() + '\\app\\temp\\subs';
    try { var files = fs.readdirSync(dirPath); }
    catch(e) { return; }
    if (files.length > 0)
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
    }
}

//debug
console.log("deviceC.js loaded");
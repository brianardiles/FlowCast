var subsStyle

function startStreaming(status) {
    
    // no video file = no play
    if (!dropVideo) {
        $("#noti").fadeIn(100)
        $("#noti").html("Load any video before hit play button").delay(2000).fadeOut(100);
        visitor.event("UX", "Play with out video").send()
        return;
    }

    // searh li item selected to set class an atributtes
    $("li").each(function() {
        if ($(this).attr("pathFile") == dropVideo) {
            $(this).addClass("selected")
            $(this).attr("playing", "true")
        } else {
            $(this).removeClass("selected")
            $(this).attr("playing", "false")
        }
    });

    // name of video to chromecast, remove extension
    FileName = dropVideo.split('\\').pop();
    $("#ChromecastDevice").html("Streaming video...");
    ServerVideo(dropVideo);
    
    //subconfig
    subsStyle = {
                backgroundColor: '#FFFFFF00', // see http://dev.w3.org/csswg/css-color/#hex-notation
                foregroundColor: subtitlesColor, // see http://dev.w3.org/csswg/css-color/#hex-notation
                edgeType: 'DROP_SHADOW', // can be: "NONE", "OUTLINE", "DROP_SHADOW", "RAISED", "DEPRESSED"
                edgeColor: '#00000073', // see http://dev.w3.org/csswg/css-color/#hex-notation
                fontScale: subtitlesSize, // transforms into "font-size: " + (fontScale*100) +"%"
                fontStyle: 'NORMAL', // can be: "NORMAL", "BOLD", "BOLD_ITALIC", "ITALIC",
                fontFamily: 'Helvetica',
                fontGenericFamily: 'SANS_SERIF', // can be: "SANS_SERIF", "MONOSPACED_SANS_SERIF", "SERIF", "MONOSPACED_SERIF", "CASUAL", "CURSIVE", "SMALL_CAPITALS",
                windowColor: 'NONE', // see http://dev.w3.org/csswg/css-color/#hex-notation
                windowRoundedCornerRadius: 0, // radius in px
                windowType: 'NONE' // can be: "NONE", "NORMAL", "ROUNDED_CORNERS"
            }

    // if subtitles
    if (dropSubs) {
        visitor.event("UX", "Play with subtitles").send()
        $("#ChromecastDevice").html("Streaming subtitles...");
        ServerSubs(dropSubs);
        if(!resume){
            device.play('http://' + ipLocal + ':8659/', {
              title: FileName,
              type: 'video/mp4',
              subtitles: ['http://' + ipLocal + ':8658/'],
              textTrackStyle:subsStyle,
              autoSubtitles: true
            });
        }
        else{
            device.play('http://' + ipLocal + ':8659/', {
              title: FileName,
              type: 'video/mp4',
              subtitles: ['http://' + ipLocal + ':8658/'],
              textTrackStyle:subsStyle,
              autoSubtitles: true,
              seek: resume
            });
        }
    } else{
        device.play('http://' + ipLocal + ':8659/', {tile: FileName, type: 'video/mp4'});
    }

    console.log("ChromeCast IP: " + device.host);
    $("#ChromecastDevice").html(device.name);
    setDuration();
    statusBar();
    $('#play').attr('src', 'image/pause.svg');
    $('#play').attr('id', 'pause');
    pause = false
    dropSubs = null;
    deviceStatus = true;
    changeSub = false;   
}

// Call from one click over on item
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

// .str to vtt
function CreateSubs(fullpath) {
    dropSubs = fullpath
    filesubtmp = fullpath.split('\\').pop().replace('.srt', '.vtt')
    var srtData = fs.readFileSync(dropSubs);
    
    var jschardet = require("jschardet")
    console.log(jschardet.detect(srtData).encoding)

    if(jschardet.detect(srtData).encoding === "UTF-8"){
        srt2vtt(srtData, 65001, function(err, vttData) {
            if (err) throw new Error(err);
            var destSub = process.cwd() + '\\app\\temp\\subs\\' + filesubtmp;
            fs.writeFileSync(destSub, vttData, 'utf8');
            dropSubs = destSub;
        })
    }else{
        srt2vtt(srtData, function(err, vttData) {
            if (err) throw new Error(err);
            var destSub = process.cwd() + '\\app\\temp\\subs\\' + filesubtmp;
            fs.writeFileSync(destSub, vttData);
            dropSubs = destSub;
        })
    }
    var fileVideo = $(".selected").attr("pathFile")

    // if playing same video, load las time
    if (changeSub && dropVideo == fileVideo) {
        device.status(function(err, newStatus) {
            resume = newStatus.currentTime;
            startStreaming();
        });
    }


    checkSubtitleIconStatus()
    visitor.event("UX", "Create a vtt file").send()
}

// set duration of video
function setDuration() {
    device.status(function(err, status) {
        timeFinal = secondsTimeSpanToHMS(status.media.duration).split('.')
        $("#timeEnd").html(timeFinal[0]);
        duration = status.media.duration;
    });
}

// update status bar
function statusBar() {
    timerInterval = setInterval(function() {
        device.status(function(err, newStatus) {
            tiempoCrudo = newStatus.currentTime;
            currentT = secondsTimeSpanToHMS(newStatus.currentTime).split('.')
            $("#timeStart").html(currentT[0]);
            porciento = tiempoCrudo * 100 / duration;
            $("#progress").animate({width: porciento + "%"})
            if (porciento >= 98) {
                CleanControlls();
                nextPlayList();
            }
        });
    }, 1000);
}

// seconds to HH:MM:SS
//http://stackoverflow.com/a/11792861
function secondsTimeSpanToHMS(s) {
    var h = Math.floor(s / 3600);
    s -= h * 3600;
    var m = Math.floor(s / 60);
    s -= m * 60;
    return h + ":" + (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s);
}
//http://stackoverflow.com/a/11792861

// reset controlls
function CleanControlls() {
    clearInterval(timerInterval);
    $("#timeStart").html("0:00:00");
    $("#timeEnd").html("0:00:00");
    $('#pause').attr('src', 'image/play.svg')
    $("#pause").attr("id", "play");
    $('#progress').attr('style', "width:0%!important");
}

// stop streaming :P
function stopStreaming() {
    deviceStatus = false;
    device.stop()
    device = undefined;
    deviceStatus = false;
    dropSubs = null;
    dropVideo = null;
    pause = false;
    $('#filename').html('');
    CleanControlls();
    visitor.event("UX", "Stop streaming").send()
}

// Set options no subtitle
function setnosub() {
    $('#subSelect').html('<option value="nosubs">No Subtitles</option>');
}

//back to start and pause
function backTo() {
    device.status(function(err, status) {
        device.seek(-status.media.duration, function() {
            device.pause(function() {
                pause = true
                $('#pause').attr('src', 'image/play.svg');
                $("#pause").attr("id", "play");
            });
        });
    });
}

// next video of playlist manual
function goTo() {
    device.status(function(err, status) {
        device.seek(status.media.duration - 1);
    });
}

// seek to, -30segs / +30seg
function seekTo(where) {
    if (where == "go") {
        device.status(function(err, status) {
            device.seek(status.currentTime + 30, function() {
                console.log('forward')
            });
        });
    } else {
        device.status(function(err, status) {
            device.seek(status.currentTime - 30, function() {
                console.log('back')
            });
        });
    }
}

// function to load chromecast
function loadchromecast() {
    visitor.event("UX", "Loading ChromeCast").send()
    //background server
    ServerImage();

    //effect loading
    loadingChrome();

    //view
    $('#oops').fadeOut("fast");
    $('#status').fadeIn();
    //view


    //set background
    setbackground()
}

function setbackground(){
        var chromecasts = require('chromecasts')()
        chromecasts.on('update', function (_device) {
            device = _device
            device.play('http://' + ipLocal + ':8660/', {type: 'image/png'});
            $("#ChromecastDevice").html(device.name);
            loadingEnd();
            background = true;
        })
}

// effects chrome logo roting :P
function loadingChrome() {
    var rot = 0
    loading = setInterval(function() {
        rot += 6
        $("#chromecastIcon-big").css('-webkit-transform', 'rotate(' + rot + 'deg)')
    }, 30);
}

// if in 25secons not found any chromecast, stop and show mensaje
function startUpTime() {
    timerun = 0
    startup = setInterval(function() {
        timerun++
        console.log(timerun);

        if (timerun >= 25) {
            console.log("se cierra");
            visitor.event("UX", "Error finding chromecast").send()
            clearInterval(startup);
            clearInterval(loading);
            $("#pop").fadeIn();
            $("#status").fadeOut("");
            $("#oops").fadeIn();
        }
    }, 1000);
}


// add video to playlist
function addtoplaylist(nameF, pathfullFile, pathfullSubs) {
    $('#filename').hide();
    $('#videoFile').hide();
    $('#list').append(
        '<li onclick="selectItem(this)" ondblclick="playList(this);" pathFile="' + pathfullFile + '" pathSubs="' + pathfullSubs + '">' + nameF + '<label for="load-subtitles"><img id="svg" src="image/subtitles.svg" class="subtitlefromplaylist" /></i></label> <img id="svg" onclick="delfromplaylist(this);" src="image/close.svg" class="delfromplaylist" /></li>'
    );

    setTimeout(
        function() {
            Sortable.create(list);
            checkSubtitleIconStatus();
        }, 1000);

    visitor.event("UX", "Loaded new video").send()
    //imgtosvg();
}

// delete video from playlist
function delfromplaylist(data) {
    $(data).parent().remove();
}

// calling from doble click event on playlist item
function playList(data) {
    var file = $(data).attr("pathFile");
    var subs = $(data).attr("pathSubs");
    FileName = file.split('\\').pop();
    console.log(FileName);

    // if subtitles set if not, no set :P
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

// calling from one click subtitle to select, and load subtitles
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

//when one .srt is droped, reload values
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

// check if next video exist, and play
function nextPlayList() {
    var nextitem = $('li[playing=true]').next()
    if (nextitem.is('li')) {
        $(nextitem).dblclick();
    }else{
        CleanControlls();
    }

    visitor.event("UX", "AutoPlay from PlayList").send()
}

// dropsubtitle set to select video
function addsubtoplaylist(fullpath) {
    $(".selected").attr("pathSubs", fullpath)

    var subtitleName = fullpath.split('\\').pop().replace('.srt', '');

    // if no selected but has a same name of the video, set them
    $("li").each(function() {
        var videopath = $(this).attr("pathFile").substr(0, $(this).attr("pathFile").length - 4);;
        var videofileName = videopath.split('\\').pop();
        console.log("video name:" +videofileName)
        console.log("sub name:" +subtitleName)
        if (videofileName == subtitleName) {
            $(this).attr("pathSubs", fullpath)
        }
    });
}

// stop event and counter when chomecast appears
function loadingEnd() {
    clearInterval(loading);
    $("#chromecastIcon-big").css('-webkit-transform', 'rotate(0deg)');
    $("#pop").fadeOut();
    $("#status").attr("class", "status-loaded");
    $("#chromecastIcon-big").attr("id", "chromecastIcon");
    $("#ChromecastDevice").addClass("ChromecastName");
    clearInterval(startup);
}

//clear sub .vtt folder
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

    fs.closeSync(fs.openSync(process.cwd() + '\\app\\temp\\subs\\empty', 'w'));
}

function ChangeSubtitlesSize(n){
    subsStyle.fontScale = n
    $("#subtitleInput").attr("value", n);
    subtitlesSize = n
    device.changeSubtitlesSize(subsStyle, function(err, status){
        if(err) console.log("error")
    });

    visitor.event("UX", "Change Subtitle Size").send()
}

function SaveInConfig(type, value){
    json = require('json-update');

    if(type == "subs"){
        json.update(process.cwd() + '\\app\\config.json',{subtitleSize:value})
        visitor.event("UX", "Subtitles Size:" + value).send()
    }else if(type == "color"){
        json.update(process.cwd() + '\\app\\config.json',{subtitleColor:value + 'FF'})
        visitor.event("UX", "Subtitles Color:" + value).send()
    }

}

function ChangeSubtitlesColor(DataC){

    var c = $(DataC).attr("color")
    SaveInConfig('color', c)
    $('img.colorset').fadeOut(100);
    $(DataC).children().fadeIn(100);
    subsStyle.foregroundColor = c + 'FF'
    device.changeSubtitlesColor(subsStyle, function(err, status){
        if(err) console.log("error")
    });

    visitor.event("UX", "Change Subtitle Color").send()
}

// detect input change status
$(function() {
     $("input:file").change(function (){
            var fileSubPath = $(this).val();

            if(fileSubPath.split('.').pop() == 'srt'){
                $('#noti').html("subtitle added!");
                addsubtoplaylist(fileSubPath);
                reloadvalues();
            }
     });

     $("#progressbar").on('mousemove', function (e) {
        if(deviceStatus){
                device.status(function(err, status) {
                    var percent = e.pageX / $(this).width() * 100;
                    var timeMouseMove = percent * status.media.duration / 100
                    var timeT = secondsTimeSpanToHMS(timeMouseMove).split('.');
                    $("#timeStart").html(timeT[0]);
             });
        }
    })

    $('input[type="range"]').on("change mousemove", function () {
        var val = ($(this).val() - $(this).attr('min')) / ($(this).attr('max') - $(this).attr('min'));

        $(this).css('background-image',
                    '-webkit-gradient(linear, left top, right top, '
                    + 'color-stop(' + val + ', #50E3C2), '
                    + 'color-stop(' + val + ', #242424)'
                    + ')'
        );
    });
    
    // a little hack :D
    $(document).ready(function (){
    var val2 = $('input[type="range"]');
    var val = (val2.val() - val2.attr('min')) / (val2.attr('max') - val2.attr('min'));

        val2.css('background-image',
                    '-webkit-gradient(linear, left top, right top, '
                    + 'color-stop(' + val + ', #50E3C2), '
                    + 'color-stop(' + val + ', #242424)'
                    + ')'
        );
    })
});

function ChangeTimeFromBar(p){
    //porcentaje * total / 100

    device.status(function(err, status) {
        var NewTime = p * status.media.duration / 100
        device.seek(NewTime);
    });
}


function checkSubtitleIconStatus(){
    $("li").each(function (){
        if($(this).attr("pathsubs") !=0){
            $(this).children().children().css("opacity", "1")
        }
    })
}

//debug
console.log("deviceC.js loaded");
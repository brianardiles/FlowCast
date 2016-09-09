$(document).on("click", "#play", function() {
    if (pause) {
        device.resume();
        $('#play').attr('src', 'image/pause.svg');
        $('#play').attr('id', 'pause');
        return 1;
    }
    startStreaming();
});

$(document).on("click", "#pause", function() {
    device.pause(function() {
        pause = true
        $('#pause').attr('src', 'image/play.svg');
        $("#pause").attr("id", "play");
    });
});

$(document).on("click", "#stop", function() {
    stopStreaming();
});

$(document).on("click", "#go", function() {
    seekTo("go");
});

$(document).on("click", "#back", function() {
    seekTo("back");
});

$(document).on("click", "#tryagain", function() {
    console.log("tray again")
    startUpTime()
    loadchromecast();
    visitor.event("UX", "Trying again").send()
});

$(document).on("click", "#backtoback", function() {
    backTo();
});

$(document).on("click", "#gotogo", function() {
    goTo();
});

$(document).on("click", "#close", function() {
    win.close();
});

$(document).on("click", "#min", function() {
    win.minimize();
});

$(document).on("click", "#close-config", function() {
    $("#config").animate({
        height: "0px",
        opacity: "0"
    })

    $("#config").css("visibility", "hidden");
});

$(document).on("click", "#open-config", function() {
    $("#config").animate({
        height: "58.6%",
        opacity: "1",
    })

    $("#config").css("visibility", "visible");
});

$(document).on("click", "#checkupdates", function() {
    if(!updating){
        updating = true
        requestUpdate();
    }
});

$(document).on("click", "#progressbar", function(e) {
    var percent = e.pageX / $(this).width() * 100;
    $("#progress").animate({
        width: percent + "%"
    })

    ChangeTimeFromBar(percent);
});


//debug
console.log("hook.js loaded");
$(document).on("click", "#play", function() {
    if (pause) {
        device.unpause();
        $('#play').attr('class', 'fa fa-pause fa-3x');
        $('#play').attr('id', 'pause');
        return 1;
    }
    startStreaming();
});

$(document).on("click", "#pause", function() {
    device.pause(function() {
        pause = true
        $('#pause').attr('class', 'fa fa-play fa-3x');
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

//debug
console.log("hook.js loaded");
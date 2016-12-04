var device,
	playStatus,
	ipLocal,
	path,
	pathSub,
	dropVideo,
	dropSubs,
	resume,
	checkSubs,
	ext,
	fullpath,
	name,
	FileName,
	pause,
	duration,
	timerInterval,
	tiempoCrudo,
	porciento,
	chromecastjs,
	loading,
	startup,
	timerun,
	changeSub,
	updating = false,
	chromecasts;

var deviceStatus = false;
var background = false;
var media = null;
var firstTime = true;

//config
var subtitlesSize,
	subtitlesColor;

// node requieres
var http = require("http"),
    fs = require('fs'),
    util = require('util'),
    srt2vtt = require('srt2vtt'),
    fileExists = require('file-exists'),
    jsonfile = require('jsonfile'),
    ua = require('universal-analytics');

var visitor = ua('UA-83263370-1', {https: true});

var gui = require('nw.gui');

// Get the current window
var win = gui.Window.get();

// get and set localip for video and sub servers
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        ipLocal = add;
})
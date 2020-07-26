//can be removed if imgDir is removed
const electron = require('electron');
const app = electron.remote.app;

const path = require('path');
const fs = require('fs');
const {desktopCapturer} = require('electron');
const imageUtils = require('./imageUtils');

module.exports = {screenshot: captureScreenshot, toggleTimelapse: toggleTimelapse, toggleRecording: record};

//Wrapper with sane defaults
function captureScreenshot(options) {
    let defaultOptions = {
        childDirectory: ''
    };

    if(options === null || Object.prototype.toString.call(options) !== '[object Object]') {
        console.log('Options for screenshot is invalid; proceeding with defaults');
        options = defaultOptions;
    }
    options.mode = 'screenshot';

    imageUtils.captureScreenshot(options);
}

//Wrapper with sane defaults
function toggleTimelapse(options) {
    let defaultOptions = {
        childDirectory: 'timelapse'
    };

    if(options === null || Object.prototype.toString.call(options) !== '[object Object]') {
        console.log('Options for screenshot is invalid; proceeding with defaults');
        options = defaultOptions;
    }
    options.mode = 'timelapse';

    imageUtils.toggleTimelapse(options);
}

document.onreadystatechange = () => {
    if (document.readyState == 'complete') {

        //Add key bindings for screenshot
        document.onkeyup = function(event) {
            var key = event.key || event.keyCode;
            //Ctrl + Shift + M to capture screenshot
            if((key == 'm' || key == 'M' || key == 77) && event.ctrlKey == true && event.shiftKey == true) {
                captureScreenshot();
            }
            //Ctrl + Shift + N to record screen
            if((key == 'n' || key == 'N' || key == 78) && event.ctrlKey == true && event.shiftKey == true) {
                record();
            }
            //Ctrl + Shift + B to record timelapse
            if((key == 'b' || key == 'B' || key == 79) && event.ctrlKey == true && event.shiftKey == true) {
                toggleTimelapse();
            }
        };

        initRecording();
    }
};

var isRecording = false;
function record() {
    if(!isRecording) {
        console.log('Going to start recording');
        startRecording();
        isRecording = true;
    } else {
        console.log('Going to stop recording');
        stopRecording();
        isRecording = false;
    }
}

var videoMimeType = 'video/webm';
var blobs = [];
var mediaRecorder;

async function initRecording() {
    var title = document.title;
    console.log('initiated recording stream for ' + title);
    var sources = await desktopCapturer.getSources({types: ['window', 'screen']});
    sources.forEach(async (src) => {
        if (src.name == title) {
            navigator.webkitGetUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: src.id,
                        minWidth: 1280*12,
                        minHeight: 720*12
                    }
                }
            }, handleStream, (err) => {console.log(err);});
        }
    });
}
let continuePingingBlobs = false;

async function startRecording() {
    blobs = [];
    mediaRecorder.start();
    continuePingingBlobs = true;
    pingDom();
}

/*
 * A function to ensure that blobs[] is written to correctly.
 * Without this, file size is very small and only few secs are recorded,
 * since without this mediaRecorder.ondataavailable exhibits unexpected behavior
 * Refer: https://github.com/CatalanCabbage/electron-vlog/issues/4
*/
let pingDomFrequency = 10;
var dummyElem = document.createElement('div');
dummyElem.style.cssText = 'opacity: 0.01; position: fixed; font-size: 1px; z-index: 10000';
document.body.appendChild(dummyElem); //Won't work if element is not rendered in the DOM
async function pingDom() {
    if(continuePingingBlobs == true) {
        mediaRecorder.requestData();
        dummyElem.innerHTML = '.';
        setTimeout(pingDom, pingDomFrequency);
    }
}

async function stopRecording() {
    continuePingingBlobs = false;
    mediaRecorder.requestData();
    mediaRecorder.stop();
    console.log('Total size from dataavailable events is: ' + (totalSize / 1000) + 'kb');
    setTimeout(saveVideo, 1000); //Timeout to wait for last blob to be captured. Can be improved
}

let totalSize = 0;
async function handleStream(stream) {
    //Init mediarecorder
    mediaRecorder = new MediaRecorder(stream, {
        mimeType: videoMimeType,
    });
    mediaRecorder.ondataavailable = e => {
        totalSize += e.data.size;
        if (e.data && e.data.size > 0) {
            blobs.push(e.data);
        }
    };
}

var imgDir = path.join(app.getPath('pictures'), 'electron-vlog', 'screenshots');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, {recursive: true});
}

async function saveVideo() {
    var blob = new Blob(blobs, {type: videoMimeType});
    var buffer = Buffer.from(await blob.arrayBuffer());

    console.log('File size: ' + buffer.length/1000 + 'kb');

    var vidPath = path.join(imgDir, new Date().getTime() + '.webm');
    console.log('Saving video to ' + vidPath);

    fs.writeFileSync(vidPath, buffer);
}
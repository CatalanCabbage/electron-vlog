//can be removed if imgDir is removed
const electron = require('electron');
const app = electron.remote.app;

const path = require('path');
const fs = require('fs');
const {desktopCapturer} = require('electron');
var utils = require('./utils');

let videoExports = {initRecording: initRecording, toggleRecording: toggleRecording};
module.exports = videoExports;

let timerControlVar;
function toggleRecording(options) {
    //If timer is active or recording is active, clear and stop recording
    if (timerControlVar != null) {
        clearTimeout(timerControlVar);
        timerControlVar = null;
        stopRecording();
    } else if ((mediaRecorder != null && mediaRecorder.state == 'recording')) {
        stopRecording();
    } else {
        startRecording();
        //After starting, automatically stop recording after options.timeout ms
        if(options.timeout > 0) {
            timerControlVar = setTimeout(() => {
                stopRecording();
                utils.debug('Timer ended');
            }, options.timeout);
        }
    }
}

var videoMimeType = 'video/webm';
var blobs = [];
var mediaRecorder;

async function initRecording() {
    var title = document.title;
    utils.debug('Initiated recording stream for title: "' + title + '"');
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
            }, handleStream, (err) => {utils.log(err);});
        }
    });
}
let continuePingingBlobs = false;

async function startRecording() {
    blobs = [];
    mediaRecorder.start();
    utils.log('Started recording');
    continuePingingBlobs = true;
    pingDom();
    utils.debug('Started pinging dom');
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
        dummyElem.innerHTML = '.';
        setTimeout(pingDom, pingDomFrequency);
    } else {
        utils.debug('Stopped pinging dom');
    }
}

async function stopRecording() {
    continuePingingBlobs = false;
    mediaRecorder.requestData();
    mediaRecorder.stop();
    utils.log('Stopped recording');
    setTimeout(()=> {
        utils.debug('Total size from dataavailable events is: ' + (totalSize / 1000) + 'kb');
        totalSize = 0;
        saveVideo();
    }, 1000); //Timeout to wait for last blob to be captured. Can be improved
}

let totalSize = 0;
async function handleStream(stream) {
    mediaRecorder = new MediaRecorder(stream, {
        mimeType: videoMimeType,
    });
    mediaRecorder.ondataavailable = e => {
        totalSize += e.data.size;
        if (e.data && e.data.size > 0) {
            utils.debug('dataavailable event triggered with blob size ' + e.data.size/1000 + 'kb');
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

    var vidPath = path.join(imgDir, new Date().getTime() + '.webm');

    fs.writeFileSync(vidPath, buffer);
    utils.log('Video of size ' + buffer.length/1000 + 'kb saved as ' + vidPath);
}
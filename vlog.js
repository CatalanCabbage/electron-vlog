//can be removed if imgDir is removed
const electron = require('electron');
const app = electron.remote.app;


const path = require('path');
const fs = require('fs');
const {desktopCapturer} = require('electron');
const imageUtils = require('./imageUtils');

document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
        setCurrentTime();

        //Add key bindings for screenshot
        document.onkeyup = function(event) {
            var key = event.key || event.keyCode;
            //Ctrl + Shift + M to capture screenshot
            if((key == 'm' || key == 'M' || key == 77) && event.ctrlKey == true && event.shiftKey == true) {
                let options = {
                    mode: 'screenshot',
                    childDirectory: ''
                };
                imageUtils.captureScreenshot(options);
            }
            //Ctrl + Shift + N to record screen
            if((key == 'n' || key == 'N' || key == 78) && event.ctrlKey == true && event.shiftKey == true) {
                record();
            }
            //Ctrl + Shift + B to record timelapse
            if((key == 'b' || key == 'B' || key == 79) && event.ctrlKey == true && event.shiftKey == true) {
                let options = {
                    mode: 'timelapse',
                    childDirectory: 'timelapse'
                };
                imageUtils.toggleTimelapse(options);
            }

        };

        initRecording();
    }
};


//Populate time in test webpage
function setCurrentTime() {
    var timeElem = document.getElementById('time');
    var d = new Date();
    var dateStr = d.getHours() + ':' +d.getMinutes() + ':' + d.getSeconds();
    timeElem.innerHTML = dateStr;
    setTimeout(setCurrentTime, 1000);
}


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
    mediaRecorder.start(100);
    continuePingingBlobs = true;
    pingBlobsArray();
}

/*
 * A function to ensure that blobs[] is written to correctly.
 *
 * Weird behavior, initial observation: If video isn't streamed to an HTML <video> element,
 *  file size is very small and only few secs are recorded.
 *  Also, `document.getElementById('video')` works but `document.createElement('video')` doesn't work
 * Inference: If blobs[] isn't accessed frequently, the writes stagnate and very few blob elements are present finally
 *  Repeatedly accessing blobs[] seems to induce the same behavior as streaming to <video>
 * Eg: For a video of 5s:
 *   When <video> is used,       blobs.length 42,    size 833kb
 *   When <video> is not used,   blobs.length 6,     size 157kb
 * So try replacing <video> with frequent blobs.length calls
 *   When timeout 10ms,          blobs.length 45,    size 930kb
 *   When timeout 20ms,          blobs.length 43,    size 840kb
 *   When timeout 100ms,         blobs.length 32,    size 467kb
 *   When timeout 1000ms,        blobs.length 10,    size 193kb
*/
async function pingBlobsArray() {
    if(continuePingingBlobs == true) {
        console.log(blobs.length);
        setTimeout(pingBlobsArray, 20);
    }
}

async function stopRecording() {
    mediaRecorder.stop();
    continuePingingBlobs = false;
    saveVideo();
    console.log(blobs.length)
}

async function handleStream(stream) {
    showVideo(stream);
    //Init mediarecorder
    mediaRecorder = new MediaRecorder(stream, {
        mimeType: videoMimeType,
    });
    mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
            blobs.push(e.data);
        }
    };
}

//var video = document.getElementById('video');
var video = document.createElement('video');

async function showVideo(stream) {
    video.srcObject = stream;
    video.play();
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
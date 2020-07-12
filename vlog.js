
const electron = require('electron');
const app = electron.remote.app;
const path = require('path');
var fs = require('fs');
const {desktopCapturer} = require('electron');


document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
        setCurrentTime();

        //Add key bindings for screenshot
        document.onkeyup = function(event) {
            var key = event.key || event.keyCode;
            //Ctrl + Shift + M to capture screenshot
            if((key == 'm' || key == 'M' || key == 77) && event.ctrlKey == true && event.shiftKey == true) {
                //captureScreen();
            }
            //Ctrl + Shift + N to record screen
            if((key == 'n' || key == 'N' || key == 78) && event.ctrlKey == true && event.shiftKey == true) {
                record();
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

var imgDir = path.join(app.getPath('pictures'), 'electron-vlog', 'screenshots');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, {recursive: true});
}




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

var isRecording = false;
var videoMimeType = 'video/webm';
var blobs = [];
var video = document.getElementById('video');
var download = document.getElementById('download');
var mediaRecorder;
var allBlobsWritten = false; 

async function initRecording() {
    var title = document.title;
    var sources = await desktopCapturer.getSources({types: ['window', 'screen']});
    //Get stream
    sources.forEach(async (src) => {
        if (src.name == title) {
            navigator.webkitGetUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: src.id,
                        minWidth: 800,
                        maxWidth: 1280,
                        minHeight: 500,
                        maxHeight: 720
                    }
                }
            }, handleStream, (err) => {console.log(err);});
        }
    });
    
}

async function startRecording() {
    blobs = [];
    mediaRecorder.start(10);
}

async function stopRecording() {
    console.log('Stopping');
    allBlobsWritten = false;
    mediaRecorder.stop();
    saveVideo();
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
        allBlobsWritten = true;
    };
}

async function showVideo(stream) {
    video.srcObject = stream;
    video.play();
}

async function waitForBlobs() {
    if(!allBlobsWritten) {
        console.log('...');
        setTimeout(waitForBlobs(), 5000);
    }
    else {
        console.log('Written!');
        saveVideo();
    }
}

async function saveVideo() {
    //await waitForBlobs();
    console.log('Saving Video now');
    var blob = new Blob(blobs, {type: videoMimeType});
    var buffer = Buffer.from(await blob.arrayBuffer());

    console.log(buffer.length);
    
    //var videoURL = window.URL.createObjectURL(blob);
    //download.href = videoURL;

    var vidPath = path.join(imgDir, new Date().getTime() + '.webm');

    console.log('Before filewrite');
    fs.writeFileSync(vidPath, buffer, function(err) {
        if(err) {console.log(err);}
        console.log('Saved video: ' + vidPath);
    });
    console.log('After filewrite');
}
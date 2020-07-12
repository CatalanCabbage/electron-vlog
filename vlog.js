
const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow; 
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

var timelapseDir = path.join(imgDir, 'timelapse');
if (!fs.existsSync(timelapseDir)) {
    fs.mkdirSync(timelapseDir, {recursive: true});
}

var isTimelapseActive = false;
function toggleTimelapse() {
    if(!isTimelapseActive) {
        console.log('Starting tlapse');
        isTimelapseActive = true;
        startTimelapse('timelapse');
    } else {
        console.log('Stopping tlapse');
        isTimelapseActive = false;
    }
}

var timelapseInterval = 2000;
function startTimelapse(childDirectory) {
    if(!isTimelapseActive) {
        console.log('Quitting tlapse');
        return;
    }
    captureScreenshot(childDirectory);
    setTimeout(() => {
        startTimelapse(childDirectory);
    }, timelapseInterval);
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

var captureFullWindow = false;
function captureScreenshot(childDirectory) {
    if(captureFullWindow) {
        console.log('Capturing full screen');
        captureWindow(childDirectory);
    } else {
        console.log('Capturing visible');
        captureVisibleArea(childDirectory);
    }
}

async function captureWindow(childDirectory) {
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
                        minWidth: 1280*12,
                        minHeight: 720*12
                    }
                }
            }, (stream) => {
                handleStreamForScreenshot(stream, childDirectory);
            }, (err) => {
                console.log(err);
            });
        }
    });
}

async function handleStreamForScreenshot(stream, childDirectory) {
    var video = document.createElement('video');
    video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';
    video.srcObject = stream;
    document.body.appendChild(video);

    video.onloadedmetadata = function () {
        // Set video ORIGINAL height (screenshot)
        //video.style.height = videoHeight + 'px'; // videoHeight
        //video.style.width = videoWidth + 'px'; // videoWidth

        video.play();

        // Create canvas
        var canvas = document.createElement('canvas');
        canvas.width = this.videoWidth;
        canvas.height = this.videoHeight;
        var ctx = canvas.getContext('2d');
        // Draw video on canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        var image = canvas.toDataURL('image/jpeg');
        var imageParsedBase64 = image.replace(/^data:image\/jpeg;base64,/, '');
        var imageBuffer = Buffer.from(imageParsedBase64, 'base64');
        var filePrefix = 'window';
        if(childDirectory != null && childDirectory != '') {
            filePrefix = path.join(childDirectory, 'window');
        }
        saveScreenshot(imageBuffer, filePrefix);

        // Remove hidden video tag
        video.remove();

        try {
            // Destroy connect to stream
            stream.getTracks()[0].stop();
        } catch (e) {
            console.log('No stream to stop');
        }
    };
}

function saveScreenshot(data, fileNamePrefix) {
    var imgPath = path.join(imgDir, fileNamePrefix + '-' + new Date().getTime() + '.jpeg');
    console.log('Saving image to ' + imgPath);
    fs.writeFileSync(imgPath, data, 'base64'); 
}

async function captureVisibleArea(childDirectory) {
    let win = BrowserWindow.getFocusedWindow();
    if(win == null) {
        console.log('No focussed window');
        return;
    }
    var img = await win.webContents.capturePage()
        .catch(err => {
            console.log(err);
        });

    var filePrefix = 'visible';
    if(childDirectory != null && childDirectory != '') {
        filePrefix = path.join(childDirectory, 'visible');
    }
    saveScreenshot(img.toJPEG(100), filePrefix);
}

var videoMimeType = 'video/webm';
var blobs = [];
var video = document.getElementById('video');
var mediaRecorder;

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
                        minWidth: 1280*12,
                        minHeight: 720*12
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
    };
}

async function showVideo(stream) {
    video.srcObject = stream;
    video.play();
}

async function saveVideo() {
    var blob = new Blob(blobs, {type: videoMimeType});
    var buffer = Buffer.from(await blob.arrayBuffer());

    console.log('File size: ' + buffer.length/1000 + 'kb');

    var vidPath = path.join(imgDir, new Date().getTime() + '.webm');
    console.log('Saving video to ' + vidPath);

    fs.writeFileSync(vidPath, buffer);
}
const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow; 
const {desktopCapturer} = require('electron');
const app = electron.remote.app;
const path = require('path');
var fs = require('fs');

let imageUtils = {captureScreenshot: captureScreenshot, toggleTimelapse: toggleTimelapse};
module.exports = imageUtils;

var imgBaseDir = path.join(app.getPath('pictures'), 'electron-vlog', 'screenshots');

var isTimelapseActive = false;
function toggleTimelapse(options) {
    if(!isTimelapseActive) {
        console.log('Starting tlapse');
        isTimelapseActive = true;
        startTimelapse(options);
    } else {
        console.log('Stopping tlapse');
        isTimelapseActive = false;
    }
}

var captureFullWindow = false;
function captureScreenshot(options) {
    if(captureFullWindow) {
        console.log('Capturing full screen');
        captureWindow(options);
    } else {
        console.log('Capturing visible');
        captureVisibleArea(options);
    }
}


var timelapseInterval = 2000;
function startTimelapse(options) {
    //Get Screenshot data - captureScreenshot needs to return img, size, full path
    //Compare
    //Save to directory if different
    if(!isTimelapseActive) {
        console.log('Quitting tlapse');
        return;
    }
    
    captureScreenshot(options);
    setTimeout(() => {
        startTimelapse(options);
    }, timelapseInterval);
}

async function captureWindow(options) {
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
                handleStreamForScreenshot(stream, options);
            }, (err) => {
                console.log(err);
            });
        }
    });
}

async function handleStreamForScreenshot(stream, options) {
    var video = document.createElement('video');
    video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';
    video.srcObject = stream;
    document.body.appendChild(video);

    video.onloadedmetadata = function () {
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
        options.fileNamePrefix = 'window';
        if(options.mode == 'timelapse') {
            //Cache this image
            //Compare with cache. If cache is empty, save this.
            if(isImageDifferent()) {
                saveScreenshot(imageBuffer, options);
            } else {
                console.log('Same as previous image, not saving');
            }
        } else {
            saveScreenshot(imageBuffer, options);
        }


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

//Compare with previous
function isImageDifferent() {
    return true;
}

//Create directory if not present, return complete path
function getImgPath(options) {
    let childDirectory = options.childDirectory;
    let fileNamePrefix = options.fileNamePrefix;

    var imgDir = path.join(imgBaseDir, childDirectory);
    //Create Directory
    if (!fs.existsSync(imgDir)) {
        fs.mkdirSync(imgDir, {recursive: true});
    }
    //Generate complete path
    var imgPath = path.join(imgDir, fileNamePrefix + '-' + new Date().getTime() + '.jpeg');
    return imgPath;
}

function saveScreenshot(data, options) {
    var imgPath = getImgPath(options);

    console.log('Saving image to ' + imgPath);
    fs.writeFileSync(imgPath, data, 'base64'); 
}

async function captureVisibleArea(options) {
    let win = BrowserWindow.getFocusedWindow();
    if(win == null) {
        console.log('No focussed window');
        return;
    }
    var img = await win.webContents.capturePage()
        .catch(err => {
            console.log(err);
        });

    options.fileNamePrefix = 'visible';
    if(options.mode == 'timelapse') {
        //Save this image
        //Compare with previous; if previous is empty, save this.
        if(isImageDifferent()) {
            saveScreenshot(img.toJPEG(100), options);
        } else {
            console.log('Same as previous image, not saving');
        }
    } else {
        saveScreenshot(img.toJPEG(100), options);
    }
}
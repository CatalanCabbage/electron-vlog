const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
const {desktopCapturer} = require('electron');
const app = electron.remote.app;
const path = require('path');
var fs = require('fs');

let imageExports = {captureScreenshot: captureScreenshot, toggleTimelapse: toggleTimelapse};
module.exports = imageExports;

var imgBaseDir = path.join(app.getPath('pictures'), 'electron-vlog', 'screenshots');

var isTimelapseActive = false;
function toggleTimelapse(options) {
    if(!isTimelapseActive) {
        isTimelapseActive = true;
        startTimelapse(options);
        console.log('Started timelapse');
    } else {
        isTimelapseActive = false;
    }
}

/**
 * @param {Object} options
 * @param {Boolean} [options.captureFullWindow]
 * @param {String} [options.childDirectory]
 * @param {String} [options.fileNamePrefix]
 * @param {'timelapse'|'screenshot'} [options.mode]
 */
function captureScreenshot(options) {
    if(options.captureFullWindow) {
        console.debug('Capturing full screen');
        captureWindow(options);
    } else {
        console.debug('Capturing visible');
        captureVisibleArea(options);
    }
}


/**
 * @param {Object} options
 * @param {Boolean} [options.captureFullWindow]
 * @param {String} [options.childDirectory]
 * @param {String} [options.fileNamePrefix]
 * @param {Number} [options.timelapseInterval]
 * @param {'timelapse'|'screenshot'} [options.mode]
 */
function startTimelapse(options) {
    if(!isTimelapseActive) {
        console.log('Stopped timelapse; total images captured: ' + timelapseImageCount);
        timelapseImageCache = ''; //When quitting, clear previous cache
        timelapseImageCount = 0; //When quitting, clear count
        return;
    }

    captureScreenshot(options);
    setTimeout(() => {
        startTimelapse(options);
    }, options.timelapseInterval);
}

/**
 * @param {Object} options
 * @param {String} [options.childDirectory]
 * @param {String} [options.fileNamePrefix]
 * @param {'timelapse'|'screenshot'} [options.mode]
 */
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

/**
 *
 * @param stream
 * @param {Object} options
 * @param {String} [options.fileNamePrefix]
 * @param {'timelapse'|'screenshot'} [options.mode]
 * @return {Promise<void>}
 */
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

        var image = canvas.toDataURL('image/png');
        var imageParsedBase64 = image.replace(/^data:image\/png;base64,/, '');
        var imageBuffer = Buffer.from(imageParsedBase64, 'base64');
        options.fileNamePrefix = 'window';
        if(options.mode == 'timelapse') {
            if(shouldTimelapseImageBeSaved(imageBuffer)) {
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

/**
 * Create directory if not present and return complete path
 * @param {Object} options
 * @param {String} options.childDirectory
 * @param {String} options.fileNamePrefix
 * @return {string} complete path
 */
function getImgPath(options) {
    let childDirectory = options.childDirectory;
    let fileNamePrefix = options.fileNamePrefix;

    var imgDir = path.join(imgBaseDir, childDirectory);
    //Create Directory
    if (!fs.existsSync(imgDir)) {
        fs.mkdirSync(imgDir, {recursive: true});
    }
    //Generate complete path
    var imgPath = path.join(imgDir, fileNamePrefix + '-' + new Date().getTime() + '.png');
    return imgPath;
}

let timelapseImageCache = '';
function shouldTimelapseImageBeSaved(image) {

    //If first time, persist to cache and save image too
    if(timelapseImageCache == '') {
        timelapseImageCache = image;
        return true;
    }
    if(isImageSame(timelapseImageCache, image)) {
        return false;
    }
    timelapseImageCache = image;
    return true;
}

//A very crude compare; just compare length of the images
function isImageSame(image1, image2) {
    console.debug('Old cache:' + image1.length + ' current image: ' + image2.length + ' and result: ' + (image1.length == image2.length));
    return (image1.length == image2.length);
}

let timelapseImageCount = 0;
/**
 * @param imgData
 * @param {Object} options
 * @param {String} [options.childDirectory]
 * @param {String} [options.fileNamePrefix]
 * @param {'timelapse'|'screenshot'} [options.mode]
 * */
function saveScreenshot(imgData, options) {
    var imgPath = getImgPath(options);

    fs.writeFileSync(imgPath, imgData, 'base64');
    console.log('Saved image to ' + imgPath);
    if(options.mode == 'timelapse') {
        timelapseImageCount++;
    }
}

/**
 * @param {Object} options
 * @param {String} [options.childDirectory]
 * @param {String} [options.fileNamePrefix]
 * @param {'timelapse'|'screenshot'} [options.mode]
 */
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
    let imgArray = img.toPNG(1); //Type: Uint8Array

    if(options.mode == 'timelapse') {
        if(shouldTimelapseImageBeSaved(imgArray)) {
            saveScreenshot(imgArray, options);
        } else {
            console.log('Same as previous image, not saving');
        }
    } else {
        saveScreenshot(imgArray, options);
    }
}
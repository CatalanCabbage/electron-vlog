const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
const {desktopCapturer} = require('electron');
const app = electron.remote.app;
const path = require('path');
var fs = require('fs');
var utils = require('./utils');

let imageExports = {captureScreenshot: captureScreenshot, toggleTimelapse: toggleTimelapse};
module.exports = imageExports;

var isTimelapseActive = false;
let timerControlVar;
let captureFullWindowText = {
    true: 'Full window',
    false: 'Visible area'
};
function toggleTimelapse(options) {
    if(!isTimelapseActive && timerControlVar == null) {
        isTimelapseActive = true;
        startTimelapse(options);
        utils.log('Started timelapse, area to be captured: ' + captureFullWindowText[options.captureFullWindow]);
        //Set timer if present
        if(options.timeout > 0) {
            timerControlVar = setTimeout(() => {
                utils.debug('Timelapse Timer expired');
                stopTimelapse();
            }, options.timeout);
        }
    } else {
        stopTimelapse();
    }
}

function stopTimelapse() {
    if(timerControlVar != null) {
        clearTimeout(timerControlVar);
        timerControlVar = null;
    }
    isTimelapseActive = false;
}

/**
 * @param {Object} options
 * @param {Boolean} [options.captureFullWindow]
 * @param {String} [options.directory]
 * @param {String} [options.fileNamePrefix]
 * @param {'timelapse'|'screenshot'} [options.mode]
 */
function captureScreenshot(options) {
    if(options.captureFullWindow) {
        if (options.mode != 'timelapse') {
            utils.debug('Capturing full screen');
        }
        captureWindow(options);
    } else {
        if (options.mode != 'timelapse') {
            utils.debug('Capturing visible area');
        }
        captureVisibleArea(options);
    }
}


/**
 * @param {Object} options
 * @param {Boolean} [options.captureFullWindow]
 * @param {String} [options.directory]
 * @param {String} [options.fileNamePrefix]
 * @param {Number} [options.timelapseInterval]
 * @param {'timelapse'|'screenshot'} [options.mode]
 */
function startTimelapse(options) {
    if(!isTimelapseActive) {
        utils.log('Stopped timelapse; total images captured: ' + timelapseImageCount + ', directory: ' + imgDir);
        //When quitting, clear previous cache and count
        timelapseImageCache = '';
        timelapseImageCount = 0;
        return;
    }

    captureScreenshot(options);
    setTimeout(() => {
        startTimelapse(options);
    }, options.timelapseInterval);
}

/**
 * @param {Object} options
 * @param {String} [options.directory]
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
                utils.log(err);
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
                utils.debug('Same as previous image, not saving');
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
            utils.log('No stream to stop');
        }
    };
}

/**
 * Create directory if not present and return complete path
 * @param {Object} options
 * @param {String} options.directory
 * @param {String} options.fileNamePrefix
 * @return {string} complete path
 */
function getImgPathProps(options) {
    let directory = options.directory;
    let fileNamePrefix = options.fileNamePrefix;

    //Create Directory
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, {recursive: true});
    }
    //Generate name with date to make it unique. Do millis %10 to make it readable(with the accepted risk of collision)
    let d = new Date();
    let dateTime = d.getDate() + '-' + (d.getMonth() + 1) + '_' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ':' + (d.getMilliseconds()%10);

    //Generate complete path
    let imgName = fileNamePrefix + '_' + dateTime + '.png';
    var imgPath = path.join(directory, imgName);
    return {imgPath: imgPath, imgName: imgName};
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
    //utils.debug('Previous image vs current image: ' + image1.length + ' and ' + image2.length + '. Is same = ' + (image1.length == image2.length));
    return (image1.length == image2.length);
}

let timelapseImageCount = 0;
/**
 * @param imgData
 * @param {Object} options
 * @param {String} [options.directory]
 * @param {String} [options.fileNamePrefix]
 * @param {'timelapse'|'screenshot'} [options.mode]
 * */
function saveScreenshot(imgData, options) {
    let imgProps = getImgPathProps(options);
    let imgPath = imgProps.imgPath;
    let imgName = imgProps.imgName;

    fs.writeFileSync(imgPath, imgData, 'base64');
    if (options.mode == 'timelapse') {
        utils.log('#' + (timelapseImageCount + 1) + ' Saved image ' + imgName);
    } else {
        utils.log('Saved image to ' + imgPath);
    }

    if(options.mode == 'timelapse') {
        timelapseImageCount++;
    }
}

/**
 * @param {Object} options
 * @param {String} [options.directory]
 * @param {String} [options.fileNamePrefix]
 * @param {'timelapse'|'screenshot'} [options.mode]
 */
async function captureVisibleArea(options) {
    let win = BrowserWindow.getFocusedWindow();
    if(win == null) {
        utils.debug('No focussed window');
        return;
    }
    var img = await win.webContents.capturePage()
        .catch(err => {
            utils.log(err);
        });

    options.fileNamePrefix = 'visible';
    let imgArray = img.toPNG(1); //Type: Uint8Array

    if(options.mode == 'timelapse') {
        if(shouldTimelapseImageBeSaved(imgArray)) {
            saveScreenshot(imgArray, options);
        } else {
            utils.debug('Same as previous image, not saving');
        }
    } else {
        saveScreenshot(imgArray, options);
    }
}
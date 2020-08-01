const image = require('./image');
const video = require('./video');
var utils = require('./utils');

/**
 * @module electron-vlog
 */

const vlogExports = {captureScreenshot: captureScreenshot,
    toggleTimelapse: toggleTimelapse, toggleRecording: toggleRecording, setConfig: setConfig};
module.exports = vlogExports;


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
                toggleRecording();
            }
            //Ctrl + Shift + B to record timelapse
            if((key == 'b' || key == 'B' || key == 79) && event.ctrlKey == true && event.shiftKey == true) {
                toggleTimelapse();
            }
        };

        video.initRecording();
    }
};

function setConfig(configOptions) {
    if (isObject(configOptions)) {
        setLogLevel(configOptions.logLevel);
    }
}

/**
 * Wrapper with sane defaults
 * @param {Object} options
 * @param {String} [options.childDirectory]
 * @param {String} [options.fileNamePrefix]
 * @param {Boolean} [options.captureFullWindow]
 */
function captureScreenshot(options) {
    let defaultOptions = {
        childDirectory: ''
    };

    if (!isObject(options)) {
        options = defaultOptions;
    } else {
        if (options.captureFullWindow == null) {
            options.captureFullWindow = false;
        }
    }

    options.mode = 'screenshot';

    image.captureScreenshot(options);
}

/**
 * Wrapper with sane defaults
 * @param {Object} options
 * @param {String} [options.childDirectory]
 * @param {String} [options.fileNamePrefix]
 * @param {Number} [options.timelapseInterval]
 * @param {Boolean} [options.captureFullWindow]
 * @param {Number} [options.timeout]
 */
function toggleTimelapse(options) {
    let minutes = 0.5;
    let defaultOptions = {
        childDirectory: 'timelapse',
        timelapseInterval: 2000,
        timeout: 1000 * 60 * minutes
    };

    if (!isObject(options)) {
        options = defaultOptions;
    } else {
        if (!isTlapseIntervalValid(options)) {
            options.timelapseInterval = 2000;
        }
        if (!isTimeoutValid(options)) {
            options.timeout = 1000 * 60 * minutes;
        }
        if (options.captureFullWindow == null) {
            options.captureFullWindow = false;
        }
    }

    options.mode = 'timelapse';
    image.toggleTimelapse(options);
}

/**
 * Wrapper with sane defaults
 * @param {Object} options
 * @param {Number} [options.timeout]
 */
function toggleRecording(options) {
    let minutes = 0.5;
    let defaultOptions = {
        timeout : 1000 * 60 * minutes
    };

    if(!isObject(options)) {
        options = defaultOptions;
    } else {
        if (!isTimeoutValid(options)) {
            options.timeout = 1000 * 60 * minutes;
        }
    }
    video.toggleRecording(options);
}

/**
 * @return {true|false}
 */
function isObject(options) {
    if(options == null) {
        utils.debug('options param is empty');
        return false;
    } else if (Object.prototype.toString.call(options) !== '[object Object]') {
        utils.warn('options is not an Object');
        return false;
    }
    return true;
}

/**
 * @return {true|false}
 */
function isTlapseIntervalValid(options) {
    if (options.timelapseInterval == null) {
        utils.debug('options.timelapseInterval is empty, proceeding with defaults');
        return false;
    } else if (isNaN(options.timelapseInterval)) {
        utils.log('options.timelapseInterval is NaN, proceeding with defaults');
        return false;
    }
    return true;
}

/**
 * @return {true|false}
 */
function isTimeoutValid(options) {
    if (options.timeout == null) {
        utils.debug('options.timeout is empty, proceeding with defaults');
        return false;
    } else if (isNaN(options.timeout)) {
        utils.log('options.timeout is NaN, proceeding with defaults');
        return false;
    }
    return true;
}

/**
 * @param {DEBUG, INFO, ERROR, OFF} inputLogLevel
 */
function setLogLevel(inputLogLevel) {
    if (inputLogLevel != null) {
        utils.setLogLevel(inputLogLevel);
    }
}
const image = require('./image');
const video = require('./video');

const vlogExports = {captureScreenshot: captureScreenshot, toggleTimelapse: toggleTimelapse, toggleRecording: toggleRecording};
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

    if (!isOptionsValid(options)) {
        options = defaultOptions;
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

    if (!isOptionsValid(options)) {
        options = defaultOptions;
    } else {
        if (!isTlapseIntervalValid(options)) {
            options.timelapseInterval = 2000;
        }
        if (!isTimeoutValid(options)) {
            options.timeout = 1000 * 60 * minutes;
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

    if(!isOptionsValid(options)) {
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
function isOptionsValid(options) {
    if(options == null) {
        console.debug('options param is empty, proceeding with defaults');
        return false;
    } else if (Object.prototype.toString.call(options) !== '[object Object]') {
        console.log('options is not an Object, proceeding with defaults');
        return false;
    }
    return true;
}

/**
 * @return {true|false}
 */
function isTlapseIntervalValid(options) {
    if (options.timelapseInterval == null) {
        console.debug('options.timelapseInterval is empty, proceeding with defaults');
        return false;
    } else if (isNaN(options.timelapseInterval)) {
        console.log('options.timelapseInterval is NaN, proceeding with defaults');
        return false;
    }
    return true;
}

/**
 * @return {true|false}
 */
function isTimeoutValid(options) {
    if (options.timeout == null) {
        console.debug('options.timeout is empty, proceeding with defaults');
        return false;
    } else if (isNaN(options.timeout)) {
        console.log('options.timeout is NaN, proceeding with defaults');
        return false;
    }
    return true;
}

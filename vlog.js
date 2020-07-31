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
 * @param {'timelapse'|'screenshot'} [options.mode]
 */
function captureScreenshot(options) {
    let defaultOptions = {
        childDirectory: ''
    };

    if(options === null || Object.prototype.toString.call(options) !== '[object Object]') {
        console.log('Options for screenshot is invalid; proceeding with defaults');
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
 * @param {'timelapse'|'screenshot'} [options.mode]
 */
function toggleTimelapse(options) {
    let defaultOptions = {
        childDirectory: 'timelapse'
    };

    if(options === null || Object.prototype.toString.call(options) !== '[object Object]') {
        console.log('Options for screenshot is invalid; proceeding with defaults');
        options = defaultOptions;
    }
    options.mode = 'timelapse';

    image.toggleTimelapse(options);
}

function toggleRecording() {
    video.toggleRecording();
}
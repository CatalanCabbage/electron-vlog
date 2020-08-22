const image = require('./image');
const video = require('./video');
var utils = require('./utils');
var options = require('./options');

/**
 * @module electron-vlog
 */

//Only these should be exposed externally
const vlogExports = {
    captureScreenshot: captureScreenshot,
    toggleTimelapse: toggleTimelapse,
    toggleRecording: toggleRecording,
    setOptions: setOptions};

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

//Set all options
function setOptions(inputOptions) {
    options.setMediaOptions(inputOptions);
}


function captureScreenshot() {
    let activeOptions = options.screenshot;
    activeOptions.mode = 'screenshot';
    image.captureScreenshot(activeOptions);
}


function toggleTimelapse() {
    let activeOptions = options.timelapse;
    activeOptions.mode = 'timelapse';
    image.toggleTimelapse(activeOptions);
}


function toggleRecording() {
    let activeOptions = options.recording;
    video.toggleRecording(activeOptions);
}
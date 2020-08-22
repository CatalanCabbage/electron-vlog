const optionsExports = {};
var utils = require('./utils');
const electron = require('electron');
const app = electron.remote.app;
const path = require('path');

let defaultOptions = {
    screenshot: {
        captureFullWindow: false,
        directory: path.join(app.getPath('pictures'), 'electron-vlog', 'screenshots'),
        fileNamePrefix: (() => {console.log('Title computed!'); return document.title;})() //TODO: Test and remove log
    },
    timelapse: {
        captureFullWindow: false,
        timeoutMillis: (20 * 60 * 1000),
        directory: path.join(app.getPath('pictures'), 'electron-vlog', 'timelapse'),
        fileNamePrefix: (() => {return document.title;})(),
        screenshotIntervalMillis: (2 * 1000)
    },
    recording: {
        directory: path.join(app.getPath('pictures'), 'electron-vlog', 'recording'),
        fileNamePrefix: (() => {return document.title;})(),
        timeoutMillis: (2 * 60 * 1000)
    }
};

let options = defaultOptions;

/**
 * Options format:
 * {
 *     logLevel: 'DEBUG'|'INFO'|'ERROR'|'OFF',
 *     screenshot: {
 *         captureFullWindow: boolean,
 *         directory: String,
 *         fileNamePrefix: String
 *     },
 *     timelapse: {
 *         captureFullWindow: boolean,
 *         timeoutMillis: int,
 *         directory: String,
 *         fileNamePrefix: String,
 *         timelapseInterval: int
 *     },
 *     recording: {
 *         directory: String,
 *         fileNamePrefix: String,
 *         timeoutMillis: int
 *     }
 * }
 */

optionsExports.setMediaOptions = function setMediaOptions(inputOptions) {
    if (inputOptions == null) {
        utils.error('options is undefined; needs to be of type Object');
    }

    if(isObject(inputOptions, 'options')) {
        options = defaultOptions; //Reset whatever options were stored previously
        setLogLevel(inputOptions.logLevel);
        setScreenshotOptions(inputOptions);
        setTimelapseOptions(inputOptions);
        setRecordingOptions(inputOptions);
    }
};

optionsExports.screenshot = options.screenshot;
optionsExports.timelapse = options.timelapse;
optionsExports.recording = options.recording;

/**
 * @param {DEBUG, INFO, ERROR, OFF} inputLogLevel
 */
function setLogLevel(inputLogLevel) {
    if (inputLogLevel != null) {
        utils.setLogLevel(inputLogLevel);
    }
}

/**
 * @return {true|false}
 */
function isObject(inputOptions, displayName) {
    if(Object.prototype.toString.call(inputOptions) !== '[object Object]') {
        utils.warn(displayName + ' is ' + typeof (inputOptions) + ', required: Object');
        return false;
    }
    return true;
}

let keys = {captureFullWindow: 'captureFullWindow', directory: 'directory',
    fileNamePrefix: 'fileNamePrefix', timelapse: 'timelapse', screenshot: 'screenshot',
    recording: 'recording', timeoutSeconds: 'timeoutSeconds', timeoutMinutes: 'timeoutMinutes',
    timeoutMillis: 'timeoutMillis', screenshotIntervalSeconds: 'screenshotIntervalSeconds',
    screenshotIntervalMillis: 'screenshotIntervalMillis'};

function setCaptureFullWindow(value, optionsObject) {
    if (value != null) {
        if (typeof value == 'boolean') {
            optionsObject[keys.captureFullWindow] = value;
        } else {
            utils.warn(keys.captureFullWindow + ' is ' + typeof value + ', required: Boolean');
        }
    }
}

function setDirectory(value, optionsObject) {
    if (value != null) {
        if (typeof value == 'string') {
            optionsObject[keys.directory] = value;
            //Create directory
        } else {
            utils.warn(keys.directory + ' is ' + typeof value + ', required: String');
        }
    }
}

function setFileNamePrefix(value, optionsObject) {
    if (value != null) {
        if (typeof value == 'string') {
            optionsObject[keys.fileNamePrefix] = value;
        } else {
            utils.warn(keys.fileNamePrefix + ' is ' + typeof value + ', required: String');
        }
    }
}

//If seconds is given, take seconds; if not present, take minutes
function setTimeout(timeoutSeconds, timeoutMinutes, optionsObject) {
    if (timeoutSeconds != null) {
        if (typeof timeoutSeconds == 'number') {
            optionsObject[keys.timeoutMillis] = timeoutSeconds * 1000;
        } else {
            utils.warn(keys.timeoutSeconds + ' is ' + typeof valueSeconds + ', required: Number');
        }
    } else if (timeoutMinutes != null) {
        if (typeof valueMinutes == 'number') {
            optionsObject[keys.timeoutMillis] = timeoutMinutes * 60 * 1000;
        } else {
            utils.warn(keys.timeoutMinutes + ' is ' + typeof valueMinutes + ', required: Number');
        }
    }
}

function setTimelapseInterval(value, optionsObject) {
    if (value != null) {
        if (typeof valueSeconds == 'number') {
            optionsObject[keys.screenshotIntervalMillis] = value * 1000;
        } else {
            utils.warn(keys.screenshotIntervalSeconds + ' is ' + typeof valueSeconds + ', required: Number');
        }
    }
}

function setScreenshotOptions(inputOptions) {
    if (isObject(inputOptions[keys.screenshot], 'options.screenshot')) {
        setCaptureFullWindow(inputOptions[keys.captureFullWindow], options[keys.screenshot]);
        setDirectory(inputOptions[keys.directory], options[keys.screenshot]);
        setFileNamePrefix(inputOptions[keys.fileNamePrefix], options[keys.screenshot]);
    }
}

function setTimelapseOptions(inputOptions) {
    if (isObject(inputOptions[keys.timelapse], 'options.timelapse')) {
        setCaptureFullWindow(inputOptions[keys.captureFullWindow], options[keys.timelapse]);
        setDirectory(inputOptions[keys.directory], options[keys.timelapse]);
        setFileNamePrefix(inputOptions[keys.fileNamePrefix], options[keys.timelapse]);
        setTimeout(inputOptions[keys.timeoutSeconds], inputOptions[keys.timeoutMinutes], options[keys.timelapse]);
        setTimelapseInterval(inputOptions[keys.screenshotIntervalSeconds], options[keys.timelapse]);
    }
}

function setRecordingOptions(inputOptions) {
    if (isObject(inputOptions[keys.recording], 'options.recording')) {
        setDirectory(inputOptions[keys.directory], options[keys.recording]);
        setFileNamePrefix(inputOptions[keys.fileNamePrefix], options[keys.recording]);
        setTimeout(inputOptions[keys.timeoutSeconds], inputOptions[keys.timeoutMinutes], options[keys.recording]);
    }
}


module.exports = optionsExports;
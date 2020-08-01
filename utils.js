let utilExports = {};

//INFO: console.log and console.info, ERROR: console.warn and console.error, DEBUG: console.error
let levels = {
    DEBUG: 0,
    INFO: 1,
    ERROR: 2,
    OFF: 3
};

let logLevel = levels.DEBUG;

/**
 * @param {DEBUG, INFO, ERROR, OFF} inputLevel
 */
utilExports.setLogLevel = function setLogLevel(inputLevel) {
    // eslint-disable-next-line no-prototype-builtins
    if(!levels.hasOwnProperty(inputLevel)) {
        console.warn('logLevel must be one of: ' + Object.keys(levels));
    }
    logLevel = levels[inputLevel];
};


utilExports.error = function error(message) {
    if(logLevel <= levels.ERROR) {
        console.error(message);
    }
};

utilExports.warn = function warn(message) {
    if(logLevel <= levels.ERROR) {
        console.warn(message);
    }
};

utilExports.log = function log(message) {
    if(logLevel <= levels.INFO) {
        console.log(message);
    }
};


utilExports.debug = function debug(message) {
    if(logLevel <= levels.DEBUG) {
        console.debug(message);
    }
};

module.exports = utilExports;
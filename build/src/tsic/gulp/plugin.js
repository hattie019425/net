'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var pp = require('preprocess');
var exec = require('child_process').exec;
var mkdirp = require('mkdirp');
var Q = require('q');
const Vinyl = require('vinyl');

/**
 * Compile the interface source files into interface defination files.
 * 
 * @param {*} srcFiles the interface source files.
 */
function compileInterfaces(srcFiles) {
    var deffered = Q.defer();
    // gutil.log('Start CMD ' + srcFilesCMD);
    exec('`npm bin`/ts-interface-builder ' + constructFileListStr(srcFiles), (error) => {
        if (error) {
            deffered.reject(error);
        } else {
            deffered.resolve(srcFiles);
        }
    });
    return deffered.promise;
}

/**
 * 
 * @param {Array | Vinyl.File} files 
 */
function constructFileListStr(files) {
    var fileListStr = '';
    if (Array.isArray(files)) {
        files.forEach((file) => {
            if (file.path) {
                fileListStr += file.path + ' ';
            } else {
                unsupportError(file);
            }
        });
    } else {
        var file = files;
        if (file.path) {
            fileListStr += file.path;
        } else {
            unsupportError(files);
        }
    }
    return fileListStr;
}

/**
 * Notify unsupport error.
 * @param {Object} unsupportChunk 
 */
function unsupportError(unsupportChunk) {
    gutil.log('TS interface compiler plugin doesn\'t support this input ',
        unsupportChunk,
        ' Only file or file list is supported');
    //TODO notify error occurs
}

module.exports = function (options, finalCb) {
    var allFiles = [];
    return through.obj(function (chunk, enc, cb) {
        compileInterfaces(chunk).then((file) => {
            // gutil.log('Done : ', file);
            cb();
        });
    }, function (flushCB) {
        flushCB();
    });
};
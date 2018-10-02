'use strict';
const gutil = require('gulp-util');
const through = require('through2');
const pp = require('preprocess');
const exec = require('child_process').exec;
const mkdirp = require('mkdirp');
const Q = require('q');
const Vinyl = require('vinyl');
const chalk = require('chalk');

/**
 * Compile the interface source files into interface defination files.
 * 
 * @param {*} srcFiles the interface source files.
 */
function compileInterfaces(srcFiles) {
    const deffered = Q.defer();
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
        // gutil.log('chunk', chunk);
        compileInterfaces(chunk).then((files) => {
            if (Array.isArray(files)) {
                gutil.log('There are', chalk.yellow(files.length), 'typescript interface defination files generated');
            } else {
                gutil.log('Typescript interface defination file',
                    chalk.cyan('\'' + files.relative + '\''), 'generated');
            }
            cb();
        }).catch((error) => {
            cb(error);
        });
    }, function (flushCB) {
        flushCB();
    });
};
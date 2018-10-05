'use strict';
const gutil = require('gulp-util');
const through = require('through2');
const exec = require('child_process').exec;
const Q = require('q');
const Vinyl = require('vinyl');
const chalk = require('chalk');
const PluginError = require('plugin-error');
const Compiler = require('ts-interface-builder').Compiler;
const Merge = require('merge');
const Buffer = require('buffer').Buffer;

const DEFAULT_OPTIONS = {
    compiler: 'native',
    suffix: '-ti'
}

/**
 * Compile the interface source files into interface defination files via command line.
 * 
 * @param {*} srcFiles the interface source files.
 * @param {*} options the options for the compiler.
 * @returns {Promise} the promise of distination files.
 */
function compileInterfaces(srcFiles, options) {
    if (options.compiler === 'native') {
        return compileInterfacesByNativeCompiler(srcFiles, options);
    } else if (options.compiler === 'CMD') {
        return compileInterfacesByCMD(srcFiles, options);
    }
}

/**
 * Compile the interface source files into interface defination files via command line.
 * 
 * @param {*} srcFiles the interface source files.
 * @param {*} options the options for the compiler
 */
function compileInterfacesByCMD(srcFiles, options) {
    const deffered = Q.defer();
    // gutil.log('Start CMD ' + srcFilesCMD);
    exec('`npm bin`/ts-interface-builder ' + constructFileListStr(srcFiles), (error) => {
        if (error) {
            deffered.reject(error);
        } else {
            let distFiles = [];
            srcFiles.forEach(srcFile => {
                const distFilePath = srcFile.path.replace('.ts', '-ti.ts');
                // gutil.log('distFilePath', distFilePath);
                const distFile = new Vinyl({
                    cwd: srcFile.cwd,
                    base: srcFile.base,
                    path: distFilePath
                });

                // gutil.log(distFile);
                distFiles.push(distFile);
            });
            deffered.resolve(distFiles);
        }
    });
    return deffered.promise;
}

/**
 * Compile the interface source files into interface defination files via native compiler.
 * 
 * @param {*} srcFiles the interface source files.
 * @param {*} options the options for the compiler
 */
function compileInterfacesByNativeCompiler(srcFiles, options) {
    let distFiles = [];
    srcFiles.forEach(srcFile => {
        const generatedCode = Compiler.compile(srcFile.path, options);
        const distFilePath = srcFile.path.replace('.ts', options.suffix + '.ts');
        // gutil.log('distFilePath', distFilePath);
        const distFile = new Vinyl({
            cwd: srcFile.cwd,
            base: srcFile.base,
            path: distFilePath,
            contents: Buffer.from(generatedCode)
        });

        // gutil.log(distFile);
        distFiles.push(distFile);
    });
    return Q(distFiles);
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
        unsupportError(files);
    }
    return fileListStr;
}

/**
 * Notify unsupport error.
 * @param {Object} unsupportChunk 
 */
function unsupportError(unsupportChunk) {
    // gutil.log('TS interface compiler plugin doesn\'t support this input ',
    //     unsupportChunk,
    //     ' Only file or file list is supported');

    this.emit('error', new PluginError('ti-define-generator',
        'The typescript interface generator doesn\'t support the input "' + filepath + '.'));

    //TODO notify error occurs
}

module.exports = function (options) {
    options = Merge(DEFAULT_OPTIONS, options);

    return through.obj(function (srcFile, enc, cb) {
        // gutil.log('srcFile', srcFile);
        let that = this;
        compileInterfaces(Array.isArray(srcFile) ? srcFile : [srcFile], options)
            .then(distFiles => {
                // gutil.log('ti-define-generator - ', chalk.yellow(distFiles.length),
                //     'typescript interface defination files generated');
                distFiles.forEach(
                    distFile => {
                        that.push(distFile);
                    });
                cb();
            }).catch((error) => {
                cb(error);
            });
    }, function (flushCB) {
        flushCB();
    });
};
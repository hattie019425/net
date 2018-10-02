const gulp = require('gulp');
const debug = require('gulp-debug');
const shell = require('gulp-shell');
const gutil = require('gulp-util');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const tsiDefineGen = require('../plugin/tsi-define-generator');
const merge = require('merge');

const DEFAULT_OPTIONS = merge(require('./options'), { taskName: 'net-tic-all' })

/**
 * Create the typescript interface compile task.
 * 
 * @param {*} taskName The name of the task. Default is 'net-tic'.
 * @param {*} src The source file pattern of the typescript interfaces. Default is '**\/*.i.ts'.
 * @param {*} dist The dist folder of the compile result. Default is 'dist/ti'
 * @param {*} temp The temp folder to keep the temp files during the compiling process.
 * Default is 'temp/ti'.
 * @param {*} subTaskNamespace The name space of the sub task. Default is 'net-tic'. 
 *  Specify it when there's a conflict with other gulp tasks.
 */

module.exports = function (ops) {
    // Use default parameters if not provided

    ops = merge(DEFAULT_OPTIONS, ops);
    console.log('options', ops);
    // let src = optionValue('src');
    // let dist = optionValue('dist');
    // let temp = optionValue('temp');
    // let taskName = optionValue('taskName');
    // let subTaskNamespace = optionValue('subTaskNamespace');
    // Copy typescript interface source files to temp folder
    gulp.task(fullName('cp-ti'), function (cb) {
        gulp.src([ops.src, '!' + ops.temp + '/**/*', '!' + ops.dist + '/**/*'], { read: true })
            // .pipe(debug())
            .pipe(gulp.dest(ops.temp))
            .on('finish', () => { cb(); });
    });

    // Generate typescript interface defination 
    gulp.task(fullName('gen-ti-define'), function (cb) {
        gulp.src(ops.temp + '/**/*.ts', { read: false })
            // .pipe(debug())
            .pipe(gutil.buffer())
            .pipe(tsiDefineGen())
            .on('finish', () => { cb(); });
    });

    // Compile typescript interface defination into javascript and output to dist folder
    gulp.task(fullName('compile-ti-define'), function (cb) {
        gulp.src(ops.temp + '/**/*-ti.ts', { read: true })
            // .pipe(debug())
            .pipe(ts())
            .pipe(gulp.dest(ops.dist))
            .on('finish', () => { cb(); });
    });

    // Clean the dist folder
    gulp.task(fullName('clean-dist'), function (cb) {
        gulp.src(ops.dist, { read: false })
            .pipe(clean({ force: true }))
            .on('finish', () => { cb() });
    });

    // Clean the temp folder
    gulp.task(fullName('clean-temp'), function (cb) {
        gulp.src(ops.temp, { read: false })
            .pipe(clean({ force: true }))
            .on('finish', () => { cb() });
    });

    // The main task
    gulp.task(ops.taskName, function () {
        runSequence(
            fullName('clean-dist'),
            fullName('clean-temp'),
            fullName('cp-ti'),
            fullName('gen-ti-define'),
            fullName('compile-ti-define'),
            fullName('clean-temp')
        );
    });

    /**
     * Get the full name of a sub task
     * @param {*} stemName the stem name of the sub task
     */
    function fullName(stemName) {
        return ops.subTaskNamespace + '-' + stemName;
    }

}

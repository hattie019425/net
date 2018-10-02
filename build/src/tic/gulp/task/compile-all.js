const gulp = require('gulp');
const debug = require('gulp-debug');
const gutil = require('gulp-util');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const tsiDefineGen = require('../plugin/ti-define-generator');
const merge = require('merge');

const DEFAULT_OPTIONS = module.exports = {
    src: '**/*.i.ts', 
    dist: 'dist/ti',
    temp: 'tmp/ti',
    taskName: 'net-tic-all',
    subTaskNamespace: 'net-tic-all-sub'
}
/**
 * Create a function to initiate a gulp task to compile all of the provided typescript interfaces.
 * 
 * @param {*} ops options to run the task
 * {
 * // The source files of the typescript interfaces to be compiled.
 * src: '**\/*.i.ts', 
 * // The destination folder of the compiled typescript interfaces defination.
 * dist: 'dist/ti', 
 * // The temp folder to keep the temporary files generated during the compiling.
 * temp: 'tmp/ti', 
 * // The gulp task name with which you can invoke the main gulp task
 * taskName: 'net-tic', 
 * // The namespace of the sub tasks used during the compiling. 
 * // All sub task names are supposed to start with the namespace provided.
 * // Change it when there's a naming conflict with other the gulp tasks.
 * subTaskNamespace: 'net-tic-sub' 
 * }
 * @returns function to initiate the compile all task
 */

module.exports = function (ops) {
    // Use default parameters if not provided

    ops = merge(DEFAULT_OPTIONS, ops);
    gutil.log('run with options: \n', ops);
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

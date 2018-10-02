const gulp = require('gulp');
const debug = require('gulp-debug');
const shell = require('gulp-shell');
const gutil = require('gulp-util');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const tsic = require('./plugin');

const DEFAULT_SRC = '**/*.i.ts';
const DEFAULT_DIST = 'dist/ti';
const DEFAULT_TEMP = 'tmp/ti';
const DEFAULT_TASK_NAME = 'net-tsic';
const DEFAULT_SUB_TASK_NAMESPACE = 'net-tsic';
/**
 * Create the typescript interface compile task.
 * 
 * @param {*} taskName The name of the task. Default is 'net-tsic'.
 * @param {*} src The source file pattern of the typescript interfaces. Default is '**\/*.i.ts'.
 * @param {*} dist The dist folder of the compile result. Default is 'dist/ti'
 * @param {*} temp The temp folder to keep the temp files during the compiling process.
 * Default is 'temp/ti'.
 * @param {*} subTaskNamespace The name space of the sub task. Default is 'net-tsic'. 
 *  Specify it when there's a conflict with other gulp tasks.
 */
export function tsicTask(src, dist, temp, taskName, subTaskNamespace) {
    // Use default parameters if not provided
    src = src ? src : DEFAULT_SRC;
    dist = dist ? dist : DEFAULT_DIST;
    temp = temp ? temp : DEFAULT_TEMP;
    taskName = taskName ? taskName : DEFAULT_TASK_NAME;
    subTaskNamespace = subTaskNamespace ? subTaskNamespace : DEFAULT_SUB_TASK_NAMESPACE;

    // Copy typescript interface source files to temp folder
    gulp.task(fullName('cp-ti'), function (cb) {
        gulp.src([src, '!' + temp + '/**/*'], { read: true })
            .pipe(debug())
            .pipe(gulp.dest(temp))
            .on('finish', () => { cb(); });
    });

    // Generate typescript interface defination 
    gulp.task(fullName('gen-ti-define'), function (cb) {
        gulp.src('.tmp/ti/**/*.i.ts', { read: false })
            .pipe(debug())
            .pipe(gutil.buffer())
            .pipe(tsic())
            .on('finish', () => { cb(); });
    });

    // Compile typescript interface defination into javascript and output to dist folder
    gulp.task(fullName('compile-ti-define'), function (cb) {
        gulp.src('.tmp/ti/**/*-ti.ts', { read: true })
            .pipe(debug())
            .pipe(ts())
            .pipe(gulp.dest('dist'))
            .on('finish', () => { cb(); });
    });

    // Clean the dist folder
    gulp.task(fullName('clean-dist'), function (cb) {
        gulp.src(['dist'], { read: false })
            .pipe(clean({ force: true }))
            .on('finish', () => { cb() });
    });

    // Clean the temp folder
    gulp.task(fullName('clean-tmp'), function (cb) {
        gulp.src('.tmp/ti', { read: false })
            .pipe(clean({ force: true }))
            .on('finish', () => { cb() });
    });

    // The main task
    gulp.task(taskName, function () {
        runSequence(
            fullName('clean-dist'),
            fullName('clean-tmp'),
            fullName('ti'),
            fullName('gen-ti-define'),
            fullName('compile-ti-define'),
            fullName('clean-tmp')
        );
    });

    /**
     * Get the full name of a sub task
     * @param {*} stemName the stem name of the sub task
     */
    function fullName(stemName) {
        return subTaskNamespace + '-' + stemName;
    }
}

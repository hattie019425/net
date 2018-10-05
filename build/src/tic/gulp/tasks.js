const gulp = require('gulp');
const dest = gulp.dest;
const gutil = require('gulp-util');
const tsc = require('gulp-typescript');
const clean = require('gulp-clean');
const tidg = require('./plugin/ti-define-generator');
const merge = require('merge');
const watch = require('gulp-watch');
const File = require('vinyl');
const Path = require('path');

const DEFAULT_OPTIONS = module.exports = {
    src: '**/*.i.ts',
    dist: 'dist/ti',
    base: process.cwd()
}
/**
 * Create a function to initiate a set of gulp tasks for typescript interfaces compiling.
 * 
 * @param {*} opts options for the task
 * {
 * // The source files of the typescript interfaces to be compiled.
 * src: '**\/*.i.ts', 
 * // The destination folder of the compiled typescript interfaces defination.
 * dist: 'dist/ti', 
 * base: 'process.cwd'
 * }
 * @returns function to initiate the gulp tasks
 */

module.exports = function (opts) {
    // Use default parameters if not provided

    opts = merge(DEFAULT_OPTIONS, opts);
    gutil.log('Init net typescript interfaces compiler with options: \n', opts);

    // Task to compile all interface
    gulp.task('net-tic-compile', ['net-tic-clean'], function (cb) {
        gulp.src(opts.src)
            .pipe(tidg())
            .pipe(tsc())
            .pipe(dest(opts.dist))
            .on('finish', () => { cb(); });
    });

    // Task to clean the dist folder
    gulp.task('net-tic-clean', function (cb) {
        gulp.src(opts.dist, { read: false })
            .pipe(clean({ force: true }))
            .on('finish', () => { cb() });
    });

    gulp.task('net-tic-watch', ['net-tic-compile'], function () {
        // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event
        let watcher = watch(opts.src, function (event) {
            gulp.src('**/' + event.basename, { read: true })
                .pipe(tidg())
                .pipe(tsc())
                .pipe(dest(opts.dist))
        });

        watcher.on('unlink', function (filepath) {
            // Get the changed source file
            let srcFile = new File({ path: filepath, base: opts.base });
            gutil.log('Source file deleted:', filepath,
                'Relative path:' + srcFile.relative);
            // Get the dist file
            let distFileRelative = Path.join(opts.dist, srcFile.relative).replace('.ts', '-ti.js');
            gutil.log('Dist file to be deleted:', distFileRelative)
            // Remove the dist file
            gulp.src(distFileRelative)
                .pipe(clean());
        });
    });
}
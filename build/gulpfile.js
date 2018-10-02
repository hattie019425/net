var gulp = require('gulp');
var debug = require('gulp-debug');
var shell = require('gulp-shell');
var gutil = require('gulp-util');
var ts = require('gulp-typescript');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var tsic = require('./src/plugin/gulp-ts-interface-compiler');
gulp.task('watch-compile-interface', function () {
    gulp.watch('src/**/*.i.ts', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        exec('`npm bin`/ts-interface-builder ' + event.path, function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
});

gulp.task('compile-interface', function () {
    gulp.src('test/**/*.i.ts', { read: false }).pipe(debug()).pipe(shell([
        'echo out folder: <%=outFolder = file.path.slice(0,file.path.lastIndexOf(\'\/\')+1).replace(\'src\', \'dist\') %>',
        'echo source file name: <%=srcFileName = file.path.slice(file.path.lastIndexOf(\'\/\') + 1) %>',
        'echo file stem: <%=srcFileStem = srcFileName.slice(0, srcFileName.lastIndexOf(\'.i.ts\')) %>',
        'echo out ts file name: <%=outTSFileName = srcFileStem + \'.i-ti.ts\' %>',
        '`npm bin`/ts-interface-builder <%= file.path %> -o <%=outFolder %>',
        'tsc <%=outFolder + outTSFileName%>',
        'rm <%=outFolder + outTSFileName%>'
    ]));
});

gulp.task('gen-ti-define', function (cb) {
    gulp.src('.tmp/ti/**/*.i.ts', { read: false })
        .pipe(debug())
        .pipe(gutil.buffer())
        .pipe(tsic())
        .on('finish', () => { cb(); });
});

gulp.task('cp-ti', function (cb) {
    gulp.src(['**/*.i.ts', '!.tmp/ti/**/*.i.ts'], { read: true })
        .pipe(debug())
        .pipe(gulp.dest('.tmp/ti'))
        .on('finish', () => { cb(); });
});


gulp.task('compile-ti-define', function (cb) {
    gulp.src('.tmp/ti/**/*-ti.ts', { read: true })
        .pipe(debug())
        .pipe(ts())
        .pipe(gulp.dest('dist'))
        .on('finish', () => { cb(); });
});

gulp.task('clean-dist', function (cb) {
    gulp.src(['dist'], { read: false })
        .pipe(clean({ force: true }))
        .on('finish', () => { cb() });
});

gulp.task('clean-ti', function (cb) {
    gulp.src('.tmp/ti', { read: false })
        .pipe(clean({ force: true }))
        .on('finish', () => { cb() });
});

gulp.task('compile-ti', function () {
    runSequence('clean-dist', 'clean-ti', 'cp-ti', 'gen-ti-define', 'compile-ti-define', 'clean-ti');
});



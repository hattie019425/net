var gulp = require('gulp');
var exec = require('child_process').exec;
var shell = require('gulp-shell');
var clean = require('gulp-clean');
var debug = require('gulp-debug');
var mkdirp = require('mkdirp');

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
    gulp.src('src/**/*.i.ts', { read: false }).pipe(shell([
        'echo out folder: <%=outFolder = file.path.slice(0,file.path.lastIndexOf(\'\/\')+1).replace(\'src\', \'dist\') %>',
        'echo source file name: <%=srcFileName = file.path.slice(file.path.lastIndexOf(\'\/\') + 1) %>',
        'echo file stem: <%=srcFileStem = srcFileName.slice(0, srcFileName.lastIndexOf(\'.i.ts\')) %>',
        'echo out ts file name: <%=outTSFileName = srcFileStem + \'.i-ti.ts\' %>',
        '`npm bin`/ts-interface-builder <%= file.path %> -o <%=outFolder %>',
        'tsc <%=outFolder + outTSFileName%>',
        'rm <%=outFolder + outTSFileName%>'
    ]));
});

gulp.task('test', function () {

});

gulp.src('src/**/*.i.ts', { read: false }).pipe(
    (stream) => {
        console.log(123);
        return (stream) => { console.log(123) };
    });
gulp.task('compile-typescript', function () {
    gulp.src('src/**/*.ts', { read: false }).pipe(shell([
        'tsc'
    ]));
});

gulp.task('clean', function () {
    gulp.src(['dist/**/**'], { read: false })
        .pipe(clean({ force: true }))
});


gulp.task('watch-compile-typescript', function () {
    gulp.src('src/**/*.ts', { read: false }).pipe(shell([
        'tsc -w'
    ]));
});


gulp.task('auto-restart', function () {
    exec('nodemon --inspect ./dist/server.js');
});

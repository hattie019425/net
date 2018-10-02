'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var pp = require('preprocess');
var exec = require('child_process').exec;

module.exports = function (options) {
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }
        exec('`npm bin`/ts-interface-builder '+ file.path);
        console.log('path: '+ file.path);
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return cb();
        }

        var content = pp.preprocess(file.contents.toString(), options || {});
        file.contents = new Buffer(content);

        this.push(file);

        cb();
    });
};
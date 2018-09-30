'use strict';
import * as gutil from 'gulp-util';
var gutil = require('gulp-util');
var through = require('through2');
var pp = require('preprocess');
module.exports = function (options) {
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }
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
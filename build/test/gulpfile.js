const gulp = require('gulp');
const ticTask = require('../src/tic/gulp/task/compile-all');
ticTask(
    {
        src: './**/*.i.ts',
        dist: './dist',
        temp: './tmp/ti'
    }
);

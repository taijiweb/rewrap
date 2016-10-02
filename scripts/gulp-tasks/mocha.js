const gulp = require('gulp');
const mocha = require('gulp-mocha');

gulp.task('mocha', () =>{
    "use strict";
    gulp.src('test/mocha-index.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'nyan'}));
});
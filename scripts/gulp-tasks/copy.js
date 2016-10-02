const {gulp, task, CombineStream} = require('gulp-task-helper');

task('copy', () => {
    "use strict";
    const streamList = [];
    streamList.push(gulp.src(['test/**/*.html', 'test/**/*.json', 'test/**/*.css'], {cache:'copy'})
        .pipe(gulp.dest('test-build')));
    streamList.push(gulp.src(['demo/**/*.html', 'demo/**/*.json', 'demo/**/*.css'], {cache:'copy'})
        .pipe(gulp.dest('demo-build')));
    return new CombineStream(streamList);
});
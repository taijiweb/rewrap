const {gulp, task, watch} = require('gulp-task-helper');

task('watch', function() {
    let copyFiles = ['src/**/*.*', 'test/**/*.*', 'demo/**/*.*'];
    gulp.watch(copyFiles, ['copy', 'now']);
});

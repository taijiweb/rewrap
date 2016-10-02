const {task} = require('gulp-task-helper');

const tasks = 'now clean copy mocha watch build webpack'.split(/\s+/);
for (const tsk of tasks) {
    require('./scripts/gulp-tasks/' + tsk);
}

task('default', ['build-watch']);
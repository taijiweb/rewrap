const {task} = require('gulp-task-helper');
task('now', () => console.log('build time: ' + new Date()));

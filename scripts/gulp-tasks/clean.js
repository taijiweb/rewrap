const {task} = require('gulp-task-helper'),
    del = require('del');

task('clean', (cb) => {
    const delFiles = ['dist', 'test-build', 'demo-build'];
    return del(delFiles, cb);
});

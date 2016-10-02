const runSequence = require('run-sequence');

const {task} = require('gulp-task-helper');

const argv = require('../argv');

task('build', callback => {
    if (argv.target === 'web') {
        return runSequence('clean', ['copy'], 'webpack-dist', 'now', callback);
    }
});

task('build-watch', callback => {
    argv.target = 'web';
    return runSequence('clean', ['copy'], ['watch'], 'webpack-dev', 'webpack-server', callback);
});
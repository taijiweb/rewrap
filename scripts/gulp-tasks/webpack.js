const {task, logTime} = require("gulp-task-helper"),
    webpack = require('webpack');

const {makeConfig, makeWebpackDevServer} = require('../webpack-config');

const onTaskDone = function() {
    return function(err, stats) {
        if (err) {
            console.log('Error', err);
        } else {
            console.log(stats.toString());
        }
        logTime("finished 'webpack'");
    };
};

const rewrapEntry = {
    'rewrap': './lib/rewrap'
};

const runWebPack = function(entry, filename, options) {
    var config, webpackCompiler;
    config = makeConfig(entry, filename, options);
    //console.log(config.module.loaders[0].query.presets);
    //console.log(config.module.loaders[0].include);
    webpackCompiler = webpack(config);
    return webpackCompiler.run(onTaskDone());
};

const webpackDistribute = function(mode) {
    var plugins;
    plugins = [new webpack.NoErrorsPlugin()];
    runWebPack(rewrapEntry, '[name].js', {
        path: '../dist',
        pathinfo: true,
        libraryTarget: 'umd',
        library: 'rewrap',
        plugins: plugins
    });
    runWebPack('./test/index', 'mocha-index.js', {
        path: '../test-build',
        pathinfo: true,
        plugins: plugins
    });
    //runWebPack('./demo/index', 'demo-index.js', {
    //    path: '../demo-build',
    //    pathinfo: true,
    //    plugins: plugins
    //});
    if (mode === 'dist') {
        plugins.push(new webpack.optimize.UglifyJsPlugin({
            minimize: true
        }));
        return runWebPack(rewrapEntry, '[name].min.js', {
            path: '../dist',
            pathinfo: false,
            libraryTarget: 'umd',
            library: 'rewrap',
            plugins: plugins
        });
    }
};

task('webpack-dist', function() {
    return webpackDistribute('dist');
});

task('webpack-dev', function() {
    return webpackDistribute('dev');
});

task('webpack-server', function() {
    var webServerPlugins;
    webServerPlugins = [new webpack.HotModuleReplacementPlugin(), new webpack.NoErrorsPlugin()];
    makeWebpackDevServer(["webpack/hot/dev-server", './lib/rewrap'], 'rewrap.js', {
        port: 8102,
        inline: true,
        plugins: webServerPlugins
    });
    makeWebpackDevServer(["webpack/hot/dev-server", './test/index'], 'mocha-index.js', {
        port: 8100,
        plugins: webServerPlugins
    });
    //return makeWebpackDevServer(["webpack/hot/dev-server", './demo/index'], 'demo-index.js', {
    //    port: 8101,
    //    plugins: webServerPlugins
    //});
});
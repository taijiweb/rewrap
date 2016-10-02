const _ =require('lodash');
const path = require('path');
const webpack = require('webpack');

const makeConfig = exports.makeConfig = function(entry, filename, options, makingServer) {
    options = options || {};

    const plugins = options.plugins || [new webpack.NoErrorsPlugin()];

    const config = {
        entry: entry,
        output: {
            path: path.join(__dirname, options.path || '../public'),
            filename: filename,
            pathinfo: options.pathinfo != null ? options.pathinfo : true,
            publicPath: options.publicPath || "/assets/"
        },

        resolve: {
            extensions: ['', '.js']
        },
        externals: {
            chai: "chai"
        },
        node: {
            fs: "empty"
        },

        cache: true,
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    include: [path.resolve(__dirname, '../test'), path.resolve(__dirname, '../src'), path.resolve(__dirname, '../demo')],
                    exclude: [
                        path.resolve(__dirname, "node_modules")
                    ],
                    loader: 'babel',
                    query: {
                        presets: ['modern-browsers']
                    }
                }
            ],
            resolve: {
                extensions: ['', '.js']
            }
        },
        extensions: ['.js'],
        plugins: plugins,
        quiet: true,
        silent: false
    };

    if (makingServer) {
        config.devServer = {
            contentBase: "http://localhost/",
            noInfo: false,
            hot: true,
            inline: true
        };
    }

    return config;
};

const WebpackDevServer = require("webpack-dev-server");

exports.makeWebpackDevServer = function(entry, filename, options) {
    options = options || {};
    options.plugins = options.plugins || [new webpack.HotModuleReplacementPlugin(), new webpack.NoErrorsPlugin()];
    const compilerConfig = makeConfig(entry, filename, options);
    const webpackCompiler = webpack(compilerConfig);
    const serverConfig = {
        contentBase: "http://localhost/",
        publicPath: options.publicPath || "/assets/",
        hot: true,
        quiet: false,
        silent: false,
        noInfo: false,
        lazy: false,
        filename: filename,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        },
        headers: {
            "X-Custom-Header": "yes"
        },
        inline: options.inline
    };
    const webpackDevServer = new WebpackDevServer(webpackCompiler, serverConfig);
    return webpackDevServer.listen(options.port || 8080, "localhost", function() {});
};
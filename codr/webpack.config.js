const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        bundle: './assets/js/bundle.js',
        modules: './assets/js/modules.js',
        "admin/main": './assets/js/admin/main.js',
        "exercise/main": './assets/js/exercise/main.js',
        "course/main": './assets/js/course/main.js',
        "project/main": './assets/js/project/main.js',
        "project/file": './assets/js/project/file/file-view.js',
        "module/main": './assets/js/module/main.js',
        "profile/main": './assets/js/profile/main.js',
        "navbar/main" : './assets/js/navbar/main.js',
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/public/js/'
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader" // translates CSS into CommonJS
            }, {
                loader: "sass-loader" // compiles Sass to CSS
            }]
        },
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env','@babel/preset-react']
            }
          }
        }]
    },
    resolve: {
        alias: {
            "bower-jquery": path.resolve(__dirname, 'bower_components/jquery/src/jquery.js'),
            "bootstrap-treeview": path.resolve(__dirname, 'bower_components/bootstrap-treeview/src/js/bootstrap-treeview.js')
        }
    }
};

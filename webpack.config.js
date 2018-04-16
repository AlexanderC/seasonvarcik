const path = require('path');
const webpack = require('webpack');

const isDev = !!process.env.npm_package_scripts_watch_ui;
const plugins = [];

if (!isDev) {
  plugins.push(new webpack.DefinePlugin(
    {
      'process.env': {
        NODE_ENV: '"production"',
      },
    }
  ));
}

module.exports = {
  plugins,
  mode: isDev ? 'development': 'production',
  entry: './src/ui/index.js',
  output: {
    path: path.resolve(__dirname, './src/window/view'),
    filename: 'ui.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: [ 'es2017' ],
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000',
      }
    ],
  },
  resolve: {
    extensions: [ '.js', '.vue' ],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    },
  },
  target: 'electron-main',
  node: {
    __dirname: false,
    __filename: false,
  },
};

const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const nodeModules = {
  zmq: 'commonjs zmq',
  jmp: 'commonjs jmp',
  github: 'commonjs github',
  canvas: 'commonjs canvas',
};

module.exports = {
  entry: './src/notebook/index.js',
  target: 'electron-renderer',
  output: {
    path: path.join(__dirname, 'lib'),
    filename: 'webpacked-notebook.js'
  },
  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        loader: 'json-loader',
        test: /\.json$/
      },
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  externals: nodeModules,
  plugins: [
    new LodashModuleReplacementPlugin(),
    new webpack.IgnorePlugin(/\.(css|less)$/),
  ],
};

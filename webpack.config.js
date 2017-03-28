const path = require('path');
const webpack = require('webpack');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const production = process.env.NODE_ENV === 'production';

const nodeModules = {
  zmq: 'commonjs zmq',
  jmp: 'commonjs jmp',
  github: 'commonjs github',
  canvas: 'commonjs canvas',
};

// plugins for development builds only
const devPlugins = [
  // HMR 🎉
  new webpack.HotModuleReplacementPlugin(),

  // prevent webpack from killing watch on build error
  new webpack.NoEmitOnErrorsPlugin(),
];

// base plugins for all builds
const plugins = [
  // remove build/client dir before compile time
  new CleanWebpackPlugin(path.join(__dirname, 'lib')),

  new LodashModuleReplacementPlugin(),

  // build vendor bundle (including common code chunks used in other bundles)
  new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.[hash].js' }),

  // define env vars for application (shim for process.env)
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }
  }),

  new webpack.LoaderOptionsPlugin({
    debug: !production,
    eslint: {
      configFile: '.eslintrc',
    },
    minimize: production,
  }),
];

// plugins for production builds only
const prodPlugins = [
  // make sure we don't create too small chunks, merge together chunks smaller than 10kb
  new webpack.optimize.MinChunkSizePlugin({ minChunkSize: 10240 }), // ~10kb

  // minify the crap out of this thing
  new webpack.optimize.UglifyJsPlugin({
    mangle: true,
    compress: {
      comparisons: true,
      conditionals: true,
      dead_code: true,
      evaluate: true,
      if_return: true,
      join_vars: true,
      screw_ie8: true,
      sequences: true,
      unused: true,
      warnings: false,
    },
    output: {
      comments: false,
    },
    sourceMap: false,
  })
];

module.exports = {

  // inline-source-map makes devtools point to source files
  devtool: production ? false : 'inline-source-map',

  entry: {
    app: './src/notebook/index.js',
    vendor: [
      'react',
      'react-dnd',
      'react-dnd-html5-backend',
      'react-dom',
      'redux',
      'redux-logger',
      'redux-observable',
      'immutable',
      'rxjs'
    ]
  },

  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      },

      // import images as compressed data URIs
      {
        test: /\.(png|jpg|svg)$/,
        use: [
          { loader: 'image-webpack-loader' },
          { loader: 'url-loader' },
        ],
      },

      // css files. TODO: remove after converting to css-in-js
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ]
  },

  output: {
    path: path.join(__dirname, 'lib'),
    chunkFilename: '[name].[hash].js',
    filename: '[name].[hash].js',
  },

  devServer: {
    contentBase: path.join(__dirname, 'lib'),
    compress: true,
    port: 8080,
    hot: true
  },

  resolve: {
    mainFields: ['browser', 'module', 'main'],
    alias: {
      'global.console': 'console',
    },
    extensions: ['', '.js', '.jsx']
  },

  node: {
    global: true,
  },

  externals: nodeModules,

  // load plugins
  plugins: production ? plugins.concat(prodPlugins) : plugins.concat(devPlugins),

  target: 'electron-renderer'
};

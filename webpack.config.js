const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
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

  // better messages in the console for HMR
  new webpack.NamedModulesPlugin(),

  // prevent webpack from killing watch on build error
  new webpack.NoEmitOnErrorsPlugin(),

  // for analyzing the bundle w/ a cool graph
  // new BundleAnalyzerPlugin(),
];

// base plugins for all builds
const plugins = [
  // remove lib/app dir before compile time
  new CleanWebpackPlugin(path.join(__dirname, 'lib/app')),

  new LodashModuleReplacementPlugin(),

  // define env vars for application (shim for process.env)
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  }),

  // bundle html file for splash screen
  new HtmlWebpackPlugin({
    title: 'nteract',
    template: 'src/assets/splash.html',
    inject: false,
    filename: 'splash.html',
  }),

  // interpolate index.ejs to index.html, add assets to html file
  new HtmlWebpackPlugin({
    title: 'nteract',
    template: 'src/assets/index.ejs',
    inject: 'body',
    filename: 'index.html',
  }),

  new webpack.LoaderOptionsPlugin({
    debug: !production,
    minimize: production,
  }),

  // build vendor bundle (including common code chunks used in other bundles)
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    filename: 'vendor.[hash].js',
    children: true,
    minChunks: 6,
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
  }),
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
      'rxjs',
      'codemirror',
    ],
  },

  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/,
      },

      // import images as compressed data URIs
      {
        test: /\.(png|jpg|svg)$/,
        use: [
          {
            loader: 'image-webpack-loader',
            query: {
              bypassOnDebug: true,
            },
          },
          { loader: 'url-loader' },
        ],
      },

      // import css files
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },

      // import all our font files
      {
        test: /\.(woff|woff2|otf|ttf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/fonts/[name].[ext]',
            },
          },
        ],
      },
    ],
  },

  output: {
    path: path.join(__dirname, 'lib', 'app'),
    chunkFilename: '[name].[hash].js',
    filename: '[name].[hash].js',
  },

  devServer: {
    contentBase: path.join(__dirname, 'lib', 'app'),
    compress: true,
    port: 8080,
    hot: true,
  },

  resolve: {
    mainFields: ['browser', 'module', 'main'],
    alias: {
      'global.console': 'console',
    },
    extensions: ['.js', '.jsx'],
    modules: [
      'node_modules',
      path.join(__dirname, 'packages', 'display-area', 'node_modules'),
      path.join(__dirname, 'packages', 'transforms-full', 'node_modules'),
    ],
  },

  node: {
    global: true,
  },

  externals: nodeModules,

  // load plugins
  plugins: production ? plugins.concat(prodPlugins) : plugins.concat(devPlugins),

  target: 'electron-renderer',
};

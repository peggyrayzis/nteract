const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const production = process.env.NODE_ENV === 'production'

// plugins for development builds only
const devPlugins = [
  // prevent webpack from killing watch on build error
  new webpack.NoEmitOnErrorsPlugin(),
]

// base plugins
const plugins = [
  new webpack.NamedModulesPlugin(),

  // remove build/client dir before compile time
  new CleanWebpackPlugin('lib/electron'),

  // define env vars for application (shim for process.env)
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    },
  }),

  new webpack.LoaderOptionsPlugin({
    debug: !production,
    eslint: {
      configFile: '.eslintrc',
    },
    minimize: production,
  }),
]

// plugins for production builds only
const prodPlugins = []

module.exports = {
  entry: './src/electron/index.js',

  devtool: production ? false : 'source-map',

  module: {
    // set module loaders
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        enforce: 'pre',
        use: [{ loader: 'eslint-loader', options: { rules: { semi: 0 } } }],
      },

      // import es6 and convert to commonJS, also transpile React components and flow typing
      // see babel section of package.json for config
      {
        exclude: /node_modules/,
        loader: 'babel-loader',
        test: /\.js$/,
      },

      // glslify
      {
        test: /\.(glsl|frag|vert)$/,
        loader: 'raw-loader',
        exclude: /node_modules/,
      },
    ],
  },

  node: {
    __dirname: false,
    __filename: true
  },

  output: {
    path: path.resolve('build/electron'),
    filename: 'index.js',
  },

  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.js', '.jsx', '.json'],
    modules: [
      path.join(__dirname, 'src', 'electron'),
      'node_modules',
    ]
  },

  // load plugins
  plugins: production ? plugins.concat(prodPlugins) : plugins.concat(devPlugins),

  target: 'electron-main'
}

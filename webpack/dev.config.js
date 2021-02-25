const webpack = require('webpack')
const paths = require('./paths')
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  // Please remember that setting NODE_ENV doesn't automatically set mode (see https://webpack.js.org/concepts/mode/).
  mode: 'development',

  // Control how source maps are generated
  devtool: 'inline-source-map',

  // Spin up a server for quick development
  devServer: {
    compress: true,
    contentBase: [paths.build],
    disableHostCheck: true,
    historyApiFallback: true,
    // host: '0.0.0.0',
    open: true,
    hot: true
  },

  plugins: [
    // Only update what has changed on hot reload
    new webpack.HotModuleReplacementPlugin()
  ]
})

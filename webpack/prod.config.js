const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

const CompressionPlugin = require('compression-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  stats: {
    logging: true
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles.[contenthash:8].css'
    }),
    new CompressionPlugin({
      deleteOriginalAssets: true,
      test: /\.js$|\.css$|\.html$/
    }),
    new DuplicatePackageCheckerPlugin()
  ],
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
})

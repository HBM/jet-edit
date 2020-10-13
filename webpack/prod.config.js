/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const CompressionPlugin = require('compression-webpack-plugin')
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
const packagejson = require('../package.json')

const basePath = path.join(__dirname, '..')
const hash = execSync('git rev-parse --short HEAD').toString()

module.exports = {
  mode: 'production',

  context: path.join(basePath, '/app'),
  entry: {
    app: './index.tsx'
  },
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json']
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.join(basePath, '/dist')
  },
  plugins: [
    new webpack.DefinePlugin({
      __WEBPACK_HASH__: JSON.stringify(hash),
      __WEBPACK_PACKAGEJSON_VERSION: JSON.stringify(packagejson.version)
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      hash: true,
      template: path.join(basePath, 'app', 'index.html'),
      favicon: 'favicon.ico',
      minify: {
        removeComments: true,
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    // new CompressionPlugin({
    //   deleteOriginalAssets: true,
    //   test: /\.js$|\.css$|\.html$/
    // }),
    new DuplicatePackageCheckerPlugin()
  ]
}

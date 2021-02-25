const paths = require('./paths')

const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const StyleLintPlugin = require('stylelint-webpack-plugin')
const packagejson = require('../package.json')

const hash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()

const isDevMode = process.env.NODE_ENV === 'development'

module.exports = {
  context: paths.src,
  // Where webpack looks to start building the bundle
  entry: {
    app: './index.tsx'
  },
  // Where webpack outputs the assets and bundles
  output: {
    path: paths.build,
    filename: '[name].[contenthash:8].js'
  },

  // Customize the webpack build process
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process'
    }),
    new StyleLintPlugin({
      fix: true
    }),
    // Removes/cleans build folders and unused assets when rebuilding
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      __WEBPACK_HASH__: JSON.stringify(hash),
      __WEBPACK_PACKAGEJSON_VERSION: JSON.stringify(packagejson.version)
    }),

    // Generates an HTML file from a template
    // Generates deprecation warning: https://github.com/jantimon/html-webpack-plugin/issues/1501
    new HtmlWebpackPlugin({
      title: 'jet-edit',
      favicon: 'favicon.ico',
      template: 'index.html'
    })
  ],

  // Determine how modules within the project are treated
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        },
        exclude: /node_modules/
      },
      // Styles: Inject CSS into the head with source maps
      {
        test: /\.s[ac]ss$/i,
        use: [
          isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDevMode,
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: { sourceMap: isDevMode }
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: isDevMode }
          }
        ]
      },

      // Images: Copy image files to build folder
      { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },

      // Fonts and SVGs: Inline files
      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' }
    ]
  },
  // Module wurden entfernt in webpack 5
  // https://sanchit3b.medium.com/how-to-polyfill-node-core-modules-in-webpack-5-905c1f5504a0
  // https://github.com/webpack/webpack/blob/master/lib/ModuleNotFoundError.js
  resolve: {
    alias: {
      assert: require.resolve('assert/'),
      process: require.resolve('process/browser'),
      util: require.resolve('util/')
    },
    extensions: ['.tsx', '.ts', '.js', '.json']
  }
}

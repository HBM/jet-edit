/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const StyleLintPlugin = require('stylelint-webpack-plugin')

const basePath = path.join(__dirname, '..')

module.exports = {
  mode: 'development',

  context: path.join(basePath, '/app'),
  devtool: 'cheap-module-eval-source-map',
  entry: {
    app: './index.tsx'
  },
  devServer: {
    historyApiFallback: true,
    host: '0.0.0.0'
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
        use: { loader: 'ts-loader', options: { transpileOnly: true } },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(basePath, '/dist'),
    publicPath: '/'
  },
  plugins: [
    new StyleLintPlugin({
      fix: true
    }),
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html',
      favicon: 'favicon.ico'
    })
  ],
  performance: {
    hints: false
  },
  optimization: {
    usedExports: true
  }
}

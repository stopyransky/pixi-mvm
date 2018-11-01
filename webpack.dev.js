/* eslint-disable no-undef, no-unused-vars */
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
  mode: 'development',
  entry: {
    main: './main.js'
  },
  output: {
    path: path.resolve(__dirname, './docs'),
    filename: '[name]-bundle.js'
  },
  devServer: {
    contentBase: 'docs',
    overlay: true,
    stats: {
      color: true
    }
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendor',
          chunks: 'initial',
          minChunks: 2
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      },
      {
        test: /\.sass|scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].html'
            }
          },
          {
            loader: 'extract-loader'
          },
          {
            loader: 'html-loader',
            options: {
              attrs: ['img:src']
            }
          }
        ]
      },
      {
        test: /\.jpg$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name]-[hash:8].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './src/index.ejs',
      title: 'PIXI.js MVM'
    }),
    new BundleAnalyzerPlugin({
      generateStatsFile: true
    })
  ]
};

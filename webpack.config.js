const path = require('path');

// use html plugin to take template for index.html and extract it to /docs with all js loaded (including bundle.js)
module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'docs/js'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
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
            loader: 'html-loader'
          }
        ]
      }

    ]
  }
}

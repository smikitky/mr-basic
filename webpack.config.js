const path = require('path');

module.exports = {
  entry: {
    index: path.join(__dirname, 'src', 'index.tsx')
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.html$/,
        loader: 'file-loader',
        options: { name: '[name].[ext]' }
      },
      {
        test: /_redirects$/,
        loader: 'file-loader',
        options: { name: '_redirects' }
      }
    ]
  },
  devServer: {
    index: 'index.html',
    historyApiFallback: true,
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  resolve: { extensions: ['.tsx', '.ts', '.js'] }
};

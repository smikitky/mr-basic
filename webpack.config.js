const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (_, { mode }) => ({
  entry: {
    index: path.join(__dirname, 'src', 'index.tsx')
  },
  devtool: mode === 'production' ? false : 'inline-source-map',
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.(html)$/,
        loader: 'file-loader',
        options: { name: '[name].[ext]' }
      },
      {
        test: /\.(jpg)$/,
        loader: 'file-loader',
        options: { name: 'images/[name].[ext]' }
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
  resolve: { extensions: ['.tsx', '.ts', '.js'] },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzeMode:
        !process.env.NETLIFY && mode === 'production' ? 'server' : 'disabled'
    })
  ]
});

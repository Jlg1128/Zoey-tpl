const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'cheap-module-source-map',
  devServer: {
    proxy: {
      // '/api': {
      //   // target: 'http://localhost:8090',
      //   target: isEnvProduction ? 'http://todo.towardsky.top' : 'http://localhost:8089',
      // },
    },
    port: 8081,
    historyApiFallback: true,
  },
  mode: 'development',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.html?$/,
        use: {
          loader: 'html-loader',
        },
      },
      {
        test: /\.css$/,
        // loader: 'css-loader',
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.mcss$/,
        loader: 'style-loader!css-loader!mcss-loader',
      },
      {
        test: /\.js?$/,
        exclude: '/node_modules/',
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    new HtmlWebPackPlugin({
      title: 'my app',
      filename: 'index.html',
      template: './public/index.html',
    }),
  ],
};

// webpack.config.js
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import Dotenv from 'dotenv-webpack';  // Import dotenv-webpack plugin
import CopyWebpackPlugin from 'copy-webpack-plugin';

export default {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve('dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },

      {
        test: /\.(jpg|jpeg|png|gif|svg)$/i,
        type: 'asset/resource',  // Webpack 5 uses asset modules
        generator: {
          filename: 'assets/images/[name][hash][ext][query]',  // Save to dist/assets/images/
        },
      },

    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/assets',
            to: 'assets',  // This will copy everything from src/assets to dist/assets
          },
        ],
      }),
    new Dotenv(),  // Add dotenv-webpack to load environment variables
  ],
  mode: 'development',  // or 'production'
};

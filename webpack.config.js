import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import Dotenv from 'dotenv-webpack';  // Import dotenv-webpack plugin
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';  // Import MiniCssExtractPlugin

export default {
  entry: {
    index: './src/index.js',      // Entry point for index.html
    admin: './src/admin.js',      // Entry point for admin.html
  },
  output: {
    filename: '[name].bundle.js', // This will create index.bundle.js and admin.bundle.js
    path: path.resolve('dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,  // Extract CSS to separate file
          'css-loader',                 // Load the CSS files
        ],
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
    // HtmlWebpackPlugin for index.html
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',  // Output file for index page
      chunks: ['index'],       // Include the index.bundle.js
    }),

    // HtmlWebpackPlugin for admin.html
    new HtmlWebpackPlugin({
      template: './src/admin.html',
      filename: 'admin.html',  // Output file for admin page
      chunks: ['admin'],       // Include the admin.bundle.js
    }),

    // Copy assets to the dist directory
    new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/assets',
            to: 'assets',  // This will copy everything from src/assets to dist/assets
          },
        ],
      }),

    // Add dotenv-webpack to load environment variables
    new Dotenv(),

    // MiniCssExtractPlugin to extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: '[name].css',  // This will create index.css and admin.css
    }),
  ],
  mode: 'development',  // or 'production'
};

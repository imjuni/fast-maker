/* eslint-disable @typescript-eslint/no-var-requires */

const webpack = require('webpack');
const path = require('path');
const TsconfigPathsWebpackPlugin = require('tsconfig-paths-webpack-plugin');
const webpackNodeExternals = require('webpack-node-externals');
const developConfig = require('./webpack.config.dev');

const distPath = path.resolve(path.join(__dirname, 'dist'));

const config = {
  ...developConfig,
  externals: [
    webpackNodeExternals({
      allowlist: ['tslib'],
    }),
  ],
  mode: 'production',
  target: 'node',

  resolve: {
    ...developConfig.resolve,
    plugins: [
      new TsconfigPathsWebpackPlugin({
        configFile: 'tsconfig.prod.json',
      }),
    ],
  },

  optimization: {
    minimize: true, // <---- disables uglify.
  },
};

module.exports = config;

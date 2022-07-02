/* eslint-disable @typescript-eslint/no-var-requires */

const webpack = require('webpack');
const path = require('path');
const TsconfigPathsWebpackPlugin = require('tsconfig-paths-webpack-plugin');
const webpackNodeExternals = require('webpack-node-externals');
const { merge } = require('webpack-merge');

const distPath = path.resolve(path.join(__dirname, '..', 'dist'));

const appConfig = {
  devtool: 'inline-source-map',
  externals: [
    webpackNodeExternals({
      allowlist: ['tslib'],
    }),
  ],
  mode: 'development',
  target: 'node',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    plugins: [
      new TsconfigPathsWebpackPlugin({
        configFile: 'tsconfig.json',
      }),
    ],
    fallback: {
      __dirname: false,
      __filename: false,
      console: false,
      global: false,
      process: false,
    },
  },

  entry: {
    ['fast-maker']: ['./src/fast-maker.ts'],
  },

  output: {
    filename: 'fast-maker.js',
    libraryTarget: 'commonjs',
    path: distPath,
  },

  optimization: {
    minimize: false, // <---- disables uglify.
    // minimizer: [new UglifyJsPlugin()] if you want to customize it.
  },

  module: {
    rules: [
      {
        loader: 'json-loader',
        test: /\.json$/,
      },
      {
        exclude: /node_modules/,
        loader: 'ts-loader',
        test: /\.tsx?$/,
      },
    ],
  },
};

const cliConfig = merge(appConfig, {
  plugins: [new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })],

  entry: {
    ['fast-maker']: ['./src/cli.ts'],
  },

  output: {
    filename: 'cli.js',
    libraryTarget: 'commonjs',
    path: distPath,
  },
});

module.exports = [appConfig, cliConfig];

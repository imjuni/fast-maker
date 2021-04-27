/* eslint-disable @typescript-eslint/no-var-requires */

const webpack = require('webpack');
const path = require('path');
const tsconfigPathsWebpackPlugin = require('tsconfig-paths-webpack-plugin');
const webpackNodeExternals = require('webpack-node-externals');

const distPath = path.resolve(path.join(__dirname, 'dist'));

const config = {
  devtool: 'eval-source-map',
  externals: [
    webpackNodeExternals({
      allowlist: ['tslib'],
    }),
  ],
  mode: 'production',
  target: 'node',

  resolve: {
    fallback: {
      __dirname: false,
      __filename: false,
      console: false,
      global: false,
      process: false,
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    alias: {
      '@cli': path.resolve(__dirname, 'src/cli'),
      '@compilers': path.resolve(__dirname, 'src/compilers'),
      '@modules': path.resolve(__dirname, 'server/modules'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@tools': path.resolve(__dirname, 'src/tools'),
    },
    plugins: [
      new tsconfigPathsWebpackPlugin({
        configFile: 'tsconfig.prod.json',
      }),
    ],
  },

  plugins: [new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })],

  entry: {
    frm: ['./src/fast-maker.ts'],
  },

  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs',
    path: distPath,
  },

  optimization: {
    minimize: true, // <---- disables uglify.
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
        options: {
          configFile: 'tsconfig.prod.json',
        },
      },
      // {
      //   exclude: /node_modules/,
      //   loader: 'shebang-loader',
      //   test: /\.tsx?$/,
      // },
    ],
  },
};

module.exports = config;

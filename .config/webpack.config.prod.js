/* eslint-disable @typescript-eslint/no-var-requires */

const TsconfigPathsWebpackPlugin = require('tsconfig-paths-webpack-plugin');
const { merge } = require('webpack-merge');
const developConfig = require('./webpack.config.dev');

const appConfig = merge(developConfig[0], {
  mode: 'production',

  resolve: {
    plugins: [
      new TsconfigPathsWebpackPlugin({
        configFile: 'tsconfig.prod.json',
      }),
    ],
  },
});

const cliConfig = merge(developConfig[1], {
  mode: 'production',

  resolve: {
    plugins: [
      new TsconfigPathsWebpackPlugin({
        configFile: 'tsconfig.prod.json',
      }),
    ],
  },
});

module.exports = [appConfig, cliConfig];

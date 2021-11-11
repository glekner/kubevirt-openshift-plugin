/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */

import * as path from 'path';

import * as webpack from 'webpack';

import { ConsoleRemotePlugin } from '@openshift-console/dynamic-plugin-sdk-webpack';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const config: webpack.Configuration = {
  mode: 'development',
  context: path.resolve(__dirname, 'src'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]-bundle.js',
    chunkFilename: '[name]-chunk.js',
  },
  watchOptions: {
    ignored: ['node_modules', 'dist'],
  },
  devServer: {
    hot: true,
    liveReload: true,
    port: 9001,
    client: {
      progress: true,
      webSocketURL: {
        port: 9001,
      },
    },
    devMiddleware: {
      writeToDisk: true,
    },
    static: {
      directory: path.join(__dirname, 'dist'),
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      stream: 'stream-browserify',
      http: 'stream-http',
      path: 'path-browserify',
      os: 'os-browserify/browser',
      crypto: 'crypto-browserify',
      timers: 'timers-browserify',
      tty: 'tty-browserify',
      vm: 'vm-browserify',
      net: 'net-browserify',
      fs: 'browserify-fs',
      prettier: false,
      buffer: 'buffer',
    },
    plugins: [new TsconfigPathsPlugin()],
  },
  stats: {
    errorDetails: true,
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.(scss|css)$/,
        exclude: /node_modules\/(?!(@patternfly)\/)/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                outputStyle: 'compressed',
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff2?|ttf|eot|otf)(\?.*$|$)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].[ext]',
        },
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      },
    ],
  },
  plugins: [
    new ConsoleRemotePlugin(),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, 'tsconfig.json'),
        memoryLimit: 4096,
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
  ],
  devtool: 'source-map',
  optimization: {
    chunkIds: 'named',
    minimize: false,
  },
};

if (process.env.NODE_ENV === 'production') {
  config.mode = 'production';
  config.output.filename = '[name]-bundle-[hash].min.js';
  config.output.chunkFilename = '[name]-chunk-[chunkhash].min.js';
  config.optimization.chunkIds = 'deterministic';
  config.optimization.minimize = true;
}

export default config;

/* eslint-disable no-undef */
import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import type { SwcLoaderOptions } from '@rspack/core';
import HtmlRspackPlugin from 'html-rspack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import { resolve } from 'path';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import pkg from './package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const toPosixPath = (filepath: string) =>
  path.sep === '/' ? filepath : filepath.replace(/\\/g, '/');

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ['chrome >= 87', 'edge >= 88', 'firefox >= 78', 'safari >= 14'];

const sharedPkgs = {
  vue: {
    singleton: true,
    requiredVersion: '^3.0.0',
    eager: true,
  },
  'vue-i18n': {
    singleton: true,
    requiredVersion: pkg.dependencies['vue-i18n'],
    eager: true,
  },
}

// Pinia is only shared in development
process.env.NODE_ENV === 'development' && (sharedPkgs['pinia'] = {
  singleton: true,
  requiredVersion: pkg.dependencies.pinia,
  eager: true,
})

export default defineConfig({
  context: __dirname,
  devServer: {
    port: 8081,
    historyApiFallback: true,
    hot: true,
    liveReload: true,
    compress: true,
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: `${process.env.PUBLIC_PATH_URL}/`,
    filename: 'assets/js/[name]-[contenthash].js',
    chunkFilename: 'assets/js/[name]-[contenthash].js',
    assetModuleFilename: 'assets/[name]-[hash][ext]',
    devtoolModuleFilenameTemplate: (info) =>
      toPosixPath(info.absoluteResourcePath),
  },
  entry: {
    main: './src/main.ts',
  },
  stats: {
    warnings: false,
  },
  resolve: {
    extensions: ['...', '.ts', '.vue'],
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          experimentalInlineMatchResource: true,
        },
      },
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
        } satisfies SwcLoaderOptions,
        type: 'javascript/auto',
      },
      {
        test: /\.css$/,
        type: 'css',
      },
      {
        test: /\.(scss|sass)$/,
        loader: 'sass-loader',
        type: 'css',
        options: {
          additionalData: `@use '@weni/unnnic-system/src/assets/scss/unnnic.scss' as *; @use '@/styles/mixins.scss' as *;`,
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name]-[hash][ext]',
        },
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlRspackPlugin({
      template: './index.html',
      inject: 'head',
    }),
    new rspack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      'process.env': JSON.stringify(process.env),
      'import.meta.env': JSON.stringify({
        BASE_URL: '/',
        DEV: process.env.NODE_ENV === 'development' ? true : false,
      }),
    }),
    new rspack.container.ModuleFederationPlugin({
      name: 'bulk_send',
      filename: 'remoteEntry.js',
      exposes: {
        './main': './src/main.ts',
        './locales/pt_br': './src/locales/pt_br.json',
        './locales/en': './src/locales/en.json',
        './locales/es': './src/locales/es.json',
      },
      remotes: {
        connect: `connect@${process.env.MODULE_FEDERATION_CONNECT_URL}/remoteEntry.js`,
      },
      shared: sharedPkgs,
    }),
  ],
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
  },
  experiments: {
    css: true,
  },
});

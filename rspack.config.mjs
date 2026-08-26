/* eslint-disable no-undef */

import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { defineWeniConfig } from '@weni/rspack-config';
import UnpluginVueComponents from 'unplugin-vue-components/rspack';
import pkg from './package.json' with { type: 'json' };

dotenv.config();

const connectUrl = process.env.MODULE_FEDERATION_CONNECT_URL;

export default defineWeniConfig({
  dirname: import.meta.dirname,
  pkg,
  port: 8081,
  entry: './src/main.ts',
  postcss: {
    prefix: '.bulk-send-webapp',
    ignoredSelectors: ['html', 'body', '*'],
  },
  federation: {
    name: 'bulk_send',
    exposes: {
      './main': './src/main.ts',
      './locales/pt_br': './src/locales/pt_br.json',
      './locales/en': './src/locales/en.json',
      './locales/es': './src/locales/es.json',
      './locales/ro': './src/locales/ro.json',
    },
    remotes: {
      connect: connectUrl,
    },
  },
  sharedDeps: {
    pinia: {
      singleton: true,
      requiredVersion: pkg.dependencies.pinia,
      eager: true,
    },
    'vue-router': {
      singleton: true,
      requiredVersion: pkg.dependencies['vue-router'],
      eager: true,
    },
  },
  plugins: [
    UnpluginVueComponents({
      dirs: [resolve(import.meta.dirname, 'src/')],
      extensions: ['vue', 'ts'],
      dts: true,
      globs: ['src/**/*.vue', 'src/**/*.ts'],
      resolvers: [
        (componentName) => {
          if (componentName.startsWith('Unnnic')) {
            return {
              name: componentName,
              from: '@weni/unnnic-system',
            };
          }
          return null;
        },
      ],
    }),
  ],
  override: (config) => {
    for (const rule of config.module?.rules ?? []) {
      if (!rule || typeof rule !== 'object' || !('use' in rule)) continue;
      const uses = Array.isArray(rule.use) ? rule.use : [];
      for (const use of uses) {
        if (
          use &&
          typeof use === 'object' &&
          use.loader === 'sass-loader' &&
          use.options &&
          typeof use.options === 'object'
        ) {
          use.options.additionalData = `@use '@weni/unnnic-system/src/assets/scss/unnnic.scss' as *; @use '@/styles/mixins.scss' as *;`;
        }
      }
    }
    return config;
  },
});

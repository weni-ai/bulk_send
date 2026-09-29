import { coverageConfigDefaults, defineConfig } from 'vitest/config';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup/global-mocks.ts'],
    coverage: {
      enabled: true,
      reporter: ['text', 'json', 'html'],
      // localization-lock scripts are tooling (pre-commit / agent hooks), not app code
      exclude: ['scripts/localization-lock*.js', ...coverageConfigDefaults.exclude],
    },
  },
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '@': resolve(__dirname, 'src'),
    },
  },
});

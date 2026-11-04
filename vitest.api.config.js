import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/api/**/*.{test,spec}.js'],
    testTimeout: 20000,
    hookTimeout: 30000,
    fileParallelism: false,
    pool: 'forks',
  },
});

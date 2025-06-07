import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: ['./test/**/*_test.js'],
  nodeResolve: true,
  preserveSymlinks: true,
  browsers: [playwrightLauncher({ product: 'chromium' })],
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: 60000,
    },
  },
};

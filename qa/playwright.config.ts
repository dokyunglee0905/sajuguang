import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: false,
    viewport: { width: 390, height: 844 }, // iPhone 14 기준
    locale: 'ko-KR',
  },
  reporter: [['list'], ['html', { outputFolder: './report', open: 'never' }]],
});

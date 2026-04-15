import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuracao Playwright exclusiva para testes de API
 * Gera JSON report em test-results/api-results.json
 */
export default defineConfig({
  testDir: './tests/api',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['json', { outputFile: 'test-results/api-results.json' }],
    ['list']
  ],
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
  },
  outputDir: 'test-results',
});

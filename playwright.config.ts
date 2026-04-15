import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

/**
 * Configuracao Playwright para testes E2E (Cucumber)
 * Para testes de API, use playwright-api.config.ts
 */
export default defineConfig({
  // Diretorio com os testes E2E
  testDir: './tests/e2e',

  // Padrao de arquivo de teste
  testMatch: '**/*.spec.ts',

  // Número máximo de testes em paralelo
  fullyParallel: true,

  // Falhar se houver testes marcados com .only
  forbidOnly: !!process.env.CI,

  // Número de retentativas em caso de falha
  retries: process.env.CI ? 1 : 0,


  // Número de workers (workers = execução paralela)
  workers: process.env.CI ? 1 : 1,

  // Relatorios que serao gerados
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  // Configurações globais
  use: {
    // URL base para testes E2E
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',

    // Trace para debug (gravação de eventos)
    trace: 'on-first-retry',

    // Screenshot apenas se falhar
    screenshot: 'only-on-failure',

    // Vídeo apenas se falhar
    video: 'retain-on-failure',

    // Timeout padrão
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Configurações de cada projeto (browser)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // Descomente para testar em Safari também
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Descomente para testar em mobile
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Servidor web (se precisar)
  webServer: undefined,

  // Timeout global
  timeout: 30000,

  // Expect timeout
  expect: {
    timeout: 5000,
  },

  // Output folder para arquivos gerados
  outputDir: 'test-results',
});
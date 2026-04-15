import { test as base } from '@playwright/test';
import { ApiClient, createApiClient } from './api.client';
import dotenv from 'dotenv';

dotenv.config();

// Define os tipos de fixture que vamos usar nos testes
export type ApiTestFixtures = {
  apiClient: ApiClient;
};

// Estender o test do Playwright com nosso fixture personalizado
export const test = base.extend<ApiTestFixtures>({
  // Antes de cada teste, criar uma instância do cliente API
  apiClient: async ({}, use) => {
    const apiClient = createApiClient(
      process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com'
    );
    // Passar pro teste usar
    await use(apiClient);
  },
});

// Reexportar expect pra usar nos testes
export { expect } from '@playwright/test';
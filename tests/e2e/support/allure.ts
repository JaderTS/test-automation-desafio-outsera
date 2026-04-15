import { IWorld } from '@cucumber/cucumber';
import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class AllureSupport {
  static async captureScreenshot(page: Page, name: string) {
    const screenshotPath = path.join('allure-results', `${name}.png`);
    
    // Criar diretório se não existir
    if (!fs.existsSync('allure-results')) {
      fs.mkdirSync('allure-results', { recursive: true });
    }
    
    await page.screenshot({ path: screenshotPath });
  }
}
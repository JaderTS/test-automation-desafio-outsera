import { Before, After, IWorld } from '@cucumber/cucumber';
import { chromium, Browser, Page } from '@playwright/test';
import { CustomWorld } from './world';
import { AllureSupport } from '../support/allure';

let browser: Browser;

Before(async function (this: CustomWorld) {
  browser = await chromium.launch();
  this.page = await browser.newPage();
  console.log('Browser iniciado');
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === 'FAILED') {
    // Capturar screenshot em caso de falha
    const screenshotName = scenario.pickle.name.replace(/\s+/g, '_');
    await AllureSupport.captureScreenshot(this.page, screenshotName);
    console.log(`📸 Screenshot capturado: ${screenshotName}`);
  }
  
  await this.page.close();
  await browser.close();
  console.log('Browser finalizado');
});
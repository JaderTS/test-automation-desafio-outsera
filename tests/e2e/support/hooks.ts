import { Before, After } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { CustomWorld } from './world';
import { env } from '../support/env';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ headless: env.headless });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();

  this.loginPage = new LoginPage(this.page);
  this.inventoryPage = new InventoryPage(this.page);
  this.cartPage = new CartPage(this.page);
  this.checkoutPage = new CheckoutPage(this.page);
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === 'FAILED') {
    const screenshotName = scenario.pickle.name.replace(/\s+/g, '_');
    const screenshotPath = path.join('allure-results', `${screenshotName}.png`);
    if (!fs.existsSync('allure-results')) {
      fs.mkdirSync('allure-results', { recursive: true });
    }
    await this.page.screenshot({ path: screenshotPath });
  }

  await this.context.close();
  await this.browser.close();
});

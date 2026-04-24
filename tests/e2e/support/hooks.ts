import { Before, After } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { CustomWorld } from './world';
import { AllureSupport } from '../support/allure';
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
    await AllureSupport.captureScreenshot(this.page, screenshotName);
  }

  await this.context.close();
  await this.browser.close();
});

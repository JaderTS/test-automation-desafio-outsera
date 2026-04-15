const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { AllureSupport } = require('../support/allure');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.resolve(__dirname, '../../../test-results/e2e-screenshots');
const MAX_SCREENSHOT_FILENAME_LENGTH = 80;

async function captureStepScreenshot(page, stepName) {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  const safeName = stepName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, MAX_SCREENSHOT_FILENAME_LENGTH);
  const filePath = path.join(screenshotDir, `${Date.now()}_${safeName}.png`);
  await page.screenshot({ path: filePath });
}

Given('que o usuario esta logado e tem produto no carrinho', async function () {
  this.loginPage = new LoginPage(this.page);
  this.inventoryPage = new InventoryPage(this.page);
  this.cartPage = new CartPage(this.page);
  this.checkoutPage = new CheckoutPage(this.page);

  const env = require('../support/env').env;
  await this.loginPage.open();
  await captureStepScreenshot(this.page, 'login_page_open');
  await this.loginPage.login(env.username, env.password);
  await captureStepScreenshot(this.page, 'login_success');
  await this.inventoryPage.addFirstProductToCart();
  await captureStepScreenshot(this.page, 'product_added');
  await this.inventoryPage.openCart();
  await captureStepScreenshot(this.page, 'cart_open');
});

When('o usuario tenta finalizar sem primeiro nome', async function () {
  const env = require('../support/env').env;
  await this.cartPage.checkout();
  await captureStepScreenshot(this.page, 'checkout_page');
  await this.checkoutPage.fillInformation('', env.lastName, env.zipCode);
  await this.checkoutPage.continue();
  await captureStepScreenshot(this.page, 'checkout_sem_primeiro_nome');
});

When('o usuario tenta finalizar sem sobrenome', async function () {
  const env = require('../support/env').env;
  await this.cartPage.checkout();
  await captureStepScreenshot(this.page, 'checkout_page');
  await this.checkoutPage.fillInformation(env.firstName, '', env.zipCode);
  await this.checkoutPage.continue();
  await captureStepScreenshot(this.page, 'checkout_sem_sobrenome');
});

When('o usuario tenta finalizar sem CEP', async function () {
  const env = require('../support/env').env;
  await this.cartPage.checkout();
  await captureStepScreenshot(this.page, 'checkout_page');
  await this.checkoutPage.fillInformation(env.firstName, env.lastName, '');
  await this.checkoutPage.continue();
  await captureStepScreenshot(this.page, 'checkout_sem_cep');
});

When('o usuario tenta finalizar sem nenhum dado', async function () {
  await this.cartPage.checkout();
  await captureStepScreenshot(this.page, 'checkout_page');
  await this.checkoutPage.fillInformation('', '', '');
  await this.checkoutPage.continue();
  await captureStepScreenshot(this.page, 'checkout_sem_dados');
});

Then('a mensagem de erro {string} deve ser exibida no checkout', async function (mensagem) {
  await expect(this.checkoutPage.errorMessage()).toBeVisible();
  await expect(this.checkoutPage.errorMessage()).toContainText(mensagem);
  await captureStepScreenshot(this.page, 'erro_checkout_' + mensagem.replace(/[^a-zA-Z0-9]/g, '_'));
});

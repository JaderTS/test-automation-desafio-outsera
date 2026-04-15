import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { env } from '../support/env';

Given('possui um produto no carrinho', async function (this: CustomWorld) {
  await this.inventoryPage.addFirstProductToCart();
  await this.inventoryPage.openCart();
});

When('ele preenche os dados de checkout corretamente', async function (this: CustomWorld) {
  await this.cartPage.checkout();
  await this.checkoutPage.fillInformation(
    env.firstName,
    env.lastName,
    env.zipCode
  );
  await this.checkoutPage.continue();
});

When('finaliza a compra', async function (this: CustomWorld) {
  await this.checkoutPage.finish();
});

Then('deve visualizar a mensagem de compra concluída', async function (this: CustomWorld) {
  await expect(this.checkoutPage.successMessage()).toHaveText('Thank you for your order!');
});

When('ele tenta continuar o checkout sem preencher o nome', async function (this: CustomWorld) {
  await this.cartPage.checkout();
  await this.checkoutPage.fillInformation('', env.lastName, env.zipCode);
  await this.checkoutPage.continue();
});

When('ele tenta continuar o checkout sem preencher o CEP', async function (this: CustomWorld) {
  await this.cartPage.checkout();
  await this.checkoutPage.fillInformation(env.firstName, env.lastName, '');
  await this.checkoutPage.continue();
});

Then('deve visualizar uma mensagem de erro no checkout', async function (this: CustomWorld) {
  await expect(this.checkoutPage.errorMessage()).toBeVisible();
});
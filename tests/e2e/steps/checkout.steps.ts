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
  await this.checkoutPage.fillInformation(env.firstName, env.lastName, env.zipCode);
  await this.checkoutPage.continue();
});

When('finaliza a compra', async function (this: CustomWorld) {
  await this.checkoutPage.finish();
});

Then('deve visualizar a mensagem de compra concluída', async function (this: CustomWorld) {
  await expect(this.checkoutPage.successMessage()).toHaveText('Thank you for your order!');
});

When('ele tenta finalizar o checkout omitindo {string}', async function (this: CustomWorld, campo: string) {
  await this.cartPage.checkout();
  const omit = (field: string) => campo === field || campo === 'todos os campos';
  await this.checkoutPage.fillInformation(
    omit('primeiro nome') ? '' : env.firstName,
    omit('sobrenome') ? '' : env.lastName,
    omit('CEP') ? '' : env.zipCode
  );
  await this.checkoutPage.continue();
});

Then('deve visualizar a mensagem de erro no checkout contendo {string}', async function (this: CustomWorld, mensagem: string) {
  await expect(this.checkoutPage.errorMessage()).toBeVisible();
  await expect(this.checkoutPage.errorMessage()).toContainText(mensagem);
});

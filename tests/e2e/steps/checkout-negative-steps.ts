import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { env } from '../support/env';

When('ele tenta checkout sem preencher o primeiro nome', async function (this: CustomWorld) {
  await this.cartPage.checkout();
  await this.checkoutPage.fillInformation('', env.lastName, env.zipCode);
  await this.checkoutPage.continue();
});

When('ele tenta checkout sem preencher o sobrenome', async function (this: CustomWorld) {
  await this.cartPage.checkout();
  await this.checkoutPage.fillInformation(env.firstName, '', env.zipCode);
  await this.checkoutPage.continue();
});

When('ele tenta checkout sem preencher o CEP', async function (this: CustomWorld) {
  await this.cartPage.checkout();
  await this.checkoutPage.fillInformation(env.firstName, env.lastName, '');
  await this.checkoutPage.continue();
});

When('ele tenta checkout sem preencher nenhum campo', async function (this: CustomWorld) {
  await this.cartPage.checkout();
  await this.checkoutPage.fillInformation('', '', '');
  await this.checkoutPage.continue();
});

Then('deve visualizar a mensagem de erro no checkout contendo {string}', async function (this: CustomWorld, mensagem: string) {
  await expect(this.checkoutPage.errorMessage()).toBeVisible();
  await expect(this.checkoutPage.errorMessage()).toContainText(mensagem);
});

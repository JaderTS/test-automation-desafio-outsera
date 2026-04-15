import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { env } from '../support/env';

When('ele tenta login com senha incorreta', async function (this: CustomWorld) {
  await this.loginPage.login(env.username, env.invalidPassword);
});

When('ele tenta login com usuário inexistente', async function (this: CustomWorld) {
  await this.loginPage.login(env.invalidUser, env.password);
});

When('ele tenta login sem preencher o usuário', async function (this: CustomWorld) {
  await this.loginPage.fillPassword(env.password);
  await this.loginPage.clickLogin();
});

When('ele tenta login sem preencher a senha', async function (this: CustomWorld) {
  await this.loginPage.fillUsername(env.username);
  await this.loginPage.clickLogin();
});

Then('deve visualizar a mensagem de erro contendo {string}', async function (this: CustomWorld, mensagem: string) {
  await expect(this.loginPage.errorMessage()).toBeVisible();
  await expect(this.loginPage.errorMessage()).toContainText(mensagem);
});

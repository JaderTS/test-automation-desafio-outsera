import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CustomWorld } from '../support/world';
import { env } from '../support/env';

Given('que o usuário acessa a página de login', async function (this: CustomWorld) {
  this.loginPage = new LoginPage(this.page);
  this.inventoryPage = new InventoryPage(this.page);

  await this.loginPage.open();
});

When('ele preenche credenciais válidas', async function (this: CustomWorld) {
  await this.loginPage.login(env.username, env.password);
});

When('ele preenche usuário válido e senha inválida', async function (this: CustomWorld) {
  await this.loginPage.login(env.username, env.invalidPassword);
});

When('ele preenche um usuário inexistente e uma senha qualquer', async function (this: CustomWorld) {
  await this.loginPage.login(env.invalidUser, env.password);
});

When('ele clica em entrar sem preencher os campos', async function (this: CustomWorld) {
  await this.loginPage.clickLogin();
});

Then('deve ser redirecionado para a página de produtos', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/inventory/);
  await expect(this.inventoryPage.title()).toHaveText('Products');
});

Then('deve visualizar uma mensagem de erro de login', async function (this: CustomWorld) {
  await expect(this.loginPage.errorMessage()).toBeVisible();
});

Then('deve visualizar uma mensagem de erro de autenticação', async function (this: CustomWorld) {
  await expect(this.loginPage.errorMessage()).toBeVisible();
});

Then('deve visualizar uma mensagem de erro de campos obrigatórios', async function (this: CustomWorld) {
  await expect(this.loginPage.errorMessage()).toBeVisible();
});

When('clica em entrar', async function () {
  // já está sendo executado dentro do método login()
});
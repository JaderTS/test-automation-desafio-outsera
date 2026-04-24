import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { env } from '../support/env';

Given('que o usuário acessa a página de login', async function (this: CustomWorld) {
  await this.loginPage.open(env.baseUrl);
});

When('ele preenche credenciais válidas', async function (this: CustomWorld) {
  await this.loginPage.login(env.username, env.password);
});

When('ele tenta login com {string}', async function (this: CustomWorld, tipo: string) {
  const actions: Record<string, () => Promise<void>> = {
    'senha incorreta': () => this.loginPage.login(env.username, env.invalidPassword),
    'usuario inexistente': () => this.loginPage.login(env.invalidUser, env.password),
    'usuario vazio': async () => {
      await this.loginPage.fillPassword(env.password);
      await this.loginPage.clickLogin();
    },
    'senha vazia': async () => {
      await this.loginPage.fillUsername(env.username);
      await this.loginPage.clickLogin();
    },
  };
  const action = actions[tipo];
  if (!action) throw new Error(`Tipo de login não suportado: ${tipo}`);
  await action();
});

Then('deve ser redirecionado para a página de produtos', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/inventory/);
  await expect(this.inventoryPage.title()).toHaveText('Products');
});

Then('deve visualizar a mensagem de erro contendo {string}', async function (this: CustomWorld, mensagem: string) {
  await expect(this.loginPage.errorMessage()).toBeVisible();
  await expect(this.loginPage.errorMessage()).toContainText(mensagem);
});

When('ele realiza logout', async function (this: CustomWorld) {
  await this.inventoryPage.openMenu();
  await this.inventoryPage.logout();
});

Then('deve retornar para a tela de login', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/saucedemo/);
  await expect(this.loginPage.usernameField()).toBeVisible();
});

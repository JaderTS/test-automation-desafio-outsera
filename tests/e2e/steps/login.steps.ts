import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { env } from '../support/env';

Given('the user accesses the login page', async function (this: CustomWorld) {
  await this.loginPage.open(env.baseUrl);
});

When('they enter valid credentials', async function (this: CustomWorld) {
  await this.loginPage.login(env.username, env.password);
});

When('they try to login with {string}', async function (this: CustomWorld, type: string) {
  const actions: Record<string, () => Promise<void>> = {
    'wrong password': () => this.loginPage.login(env.username, env.invalidPassword),
    'nonexistent user': () => this.loginPage.login(env.invalidUser, env.password),
    'empty username': async () => {
      await this.loginPage.fillPassword(env.password);
      await this.loginPage.clickLogin();
    },
    'empty password': async () => {
      await this.loginPage.fillUsername(env.username);
      await this.loginPage.clickLogin();
    },
  };
  const action = actions[type];
  if (!action) throw new Error(`Unsupported login type: ${type}`);
  await action();
});

Then('they should be redirected to the products page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/inventory/);
  await expect(this.inventoryPage.title).toHaveText('Products');
});

Then('they should see an error message containing {string}', async function (this: CustomWorld, message: string) {
  await expect(this.loginPage.errorMessage).toBeVisible();
  await expect(this.loginPage.errorMessage).toContainText(message);
});

When('they log out', async function (this: CustomWorld) {
  await this.inventoryPage.openMenu();
  await this.inventoryPage.logout();
});

Then('they should return to the login page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/saucedemo/);
  await expect(this.loginPage.usernameInput).toBeVisible();
});

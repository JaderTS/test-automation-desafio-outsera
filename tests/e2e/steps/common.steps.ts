import { Given } from '@cucumber/cucumber';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CustomWorld } from '../support/world';
import { env } from '../support/env';

Given('que o usuário está autenticado no sistema', async function (this: CustomWorld) {
  this.loginPage = new LoginPage(this.page);
  this.inventoryPage = new InventoryPage(this.page);
  this.cartPage = new CartPage(this.page);
  this.checkoutPage = new CheckoutPage(this.page);

  await this.loginPage.open();
  await this.loginPage.login(env.username, env.password);
});
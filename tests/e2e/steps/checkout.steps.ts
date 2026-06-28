import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { env } from '../support/env';

Given('they have a product in the cart', async function (this: CustomWorld) {
  await this.inventoryPage.addFirstProductToCart();
  await this.inventoryPage.openCart();
});

When('they fill in the checkout information correctly', async function (this: CustomWorld) {
  await this.cartPage.checkout();
  await this.checkoutPage.fillInformation(env.firstName, env.lastName, env.zipCode);
  await this.checkoutPage.continue();
});

When('they complete the purchase', async function (this: CustomWorld) {
  await this.checkoutPage.finish();
});

Then('they should see the order completion message', async function (this: CustomWorld) {
  await expect(this.checkoutPage.successMessage).toHaveText('Thank you for your order!');
});

When('they try to complete the checkout omitting {string}', async function (this: CustomWorld, field: string) {
  await this.cartPage.checkout();
  const omit = (f: string) => field === f || field === 'all fields';
  await this.checkoutPage.fillInformation(
    omit('first name') ? '' : env.firstName,
    omit('last name') ? '' : env.lastName,
    omit('zip code') ? '' : env.zipCode
  );
  await this.checkoutPage.continue();
});

Then('they should see an error message in the checkout containing {string}', async function (this: CustomWorld, message: string) {
  await expect(this.checkoutPage.errorMessage).toBeVisible();
  await expect(this.checkoutPage.errorMessage).toContainText(message);
});

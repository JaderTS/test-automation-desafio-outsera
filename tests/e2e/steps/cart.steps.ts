import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

When('they access product details', async function (this: CustomWorld) {
  await this.inventoryPage.openFirstProduct();
});

Then('they should see product information', async function (this: CustomWorld) {
  await expect(this.inventoryPage.productNames).toBeVisible();
  await expect(this.inventoryPage.productPrices).toBeVisible();
  await expect(this.inventoryPage.addToCartButton).toBeVisible();
});

When('they add a product to the cart', async function (this: CustomWorld) {
  await this.inventoryPage.addFirstProductToCart();
});

Then('the cart should display {int} item', async function (this: CustomWorld, count: number) {
  await expect(this.inventoryPage.cartBadge).toBeVisible();
  await expect(this.inventoryPage.cartBadge).toHaveText(String(count));
});

Given('they added a product to the cart', async function (this: CustomWorld) {
  await this.inventoryPage.addFirstProductToCart();
  await expect(this.inventoryPage.cartBadge).toBeVisible();
});

When('they remove the product from listing', async function (this: CustomWorld) {
  await this.inventoryPage.removeFirstProduct();
});

Then('the cart should display no items', async function (this: CustomWorld) {
  await expect(this.inventoryPage.cartBadge).toHaveCount(0);
});

When('they add {int} products to the cart', async function (this: CustomWorld, count: number) {
  if (count === 2) {
    await this.inventoryPage.addTwoProductsToCart();
  } else {
    throw new Error(`Unsupported quantity in this step: ${count}`);
  }
});

Then('the cart should display {int} items', async function (this: CustomWorld, count: number) {
  await expect(this.inventoryPage.cartBadge).toBeVisible();
  await expect(this.inventoryPage.cartBadge).toHaveText(String(count));
});

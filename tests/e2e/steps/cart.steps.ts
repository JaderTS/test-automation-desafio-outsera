import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

When('ele acessa os detalhes de um produto', async function (this: CustomWorld) {
  await this.inventoryPage.openFirstProduct();
});

Then('deve visualizar as informações do produto', async function (this: CustomWorld) {
  await expect(this.inventoryPage.productNames()).toBeVisible();
  await expect(this.inventoryPage.productPrices()).toBeVisible();
  await expect(this.inventoryPage.addToCartButton()).toBeVisible();
});

When('ele adiciona um produto ao carrinho', async function (this: CustomWorld) {
  await this.inventoryPage.addFirstProductToCart();
});

Then('o carrinho deve exibir {int} item', async function (this: CustomWorld, quantidade: number) {
  await expect(this.inventoryPage.cartBadge()).toBeVisible();
  await expect(this.inventoryPage.cartBadge()).toHaveText(String(quantidade));
});

Given('ele adicionou um produto ao carrinho', async function (this: CustomWorld) {
  await this.inventoryPage.addFirstProductToCart();
  await expect(this.inventoryPage.cartBadge()).toBeVisible();
});

When('ele remove o produto pela listagem', async function (this: CustomWorld) {
  await this.inventoryPage.removeFirstProduct();
});

Then('o carrinho não deve exibir itens', async function (this: CustomWorld) {
  await expect(this.inventoryPage.cartBadge()).toHaveCount(0);
});

When('ele adiciona {int} produtos ao carrinho', async function (this: CustomWorld, quantidade: number) {
  if (quantidade === 2) {
    await this.inventoryPage.addTwoProductsToCart();
  } else {
    throw new Error(`Quantidade não suportada neste step: ${quantidade}`);
  }
});

Then('o carrinho deve exibir {int} itens', async function (this: CustomWorld, quantidade: number) {
  await expect(this.inventoryPage.cartBadge()).toBeVisible();
  await expect(this.inventoryPage.cartBadge()).toHaveText(String(quantidade));
});


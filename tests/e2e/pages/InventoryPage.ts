import { Page } from '@playwright/test';

export class InventoryPage {
  constructor(private page: Page) {}

  title() {
    return this.page.locator('.title');
  }

  productNames() {
    return this.page.locator('[data-test="inventory-item-name"]');
  }

  productPrices() {
    return this.page.locator('[data-test="inventory-item-price"]');
  }

  cartBadge() {
    return this.page.locator('.shopping_cart_badge');
  }

  cartLink() {
    return this.page.locator('[data-test="shopping-cart-link"]');
  }

  addToCartButtons() {
    return this.page.locator('[data-test^="add-to-cart-"]');
  }

  addToCartButton() {
    return this.page.locator('[data-test="add-to-cart"]');
  }

  removeButtons() {
    return this.page.locator('[data-test^="remove-"]');
  }

  async openFirstProduct() {
    await this.productNames().first().click();
  }

  async addFirstProductToCart() {
    await this.addToCartButtons().first().click();
  }

  async addTwoProductsToCart() {
    await this.addToCartButtons().nth(0).click();
    await this.addToCartButtons().nth(1).click();
  }

  async removeFirstProduct() {
    await this.removeButtons().first().click();
  }

  async openCart() {
    await this.cartLink().click();
  }

  async openMenu() {
    await this.page.locator('#react-burger-menu-btn').click();
  }

  async logout() {
    await this.page.locator('#logout_sidebar_link').click();
  }
}
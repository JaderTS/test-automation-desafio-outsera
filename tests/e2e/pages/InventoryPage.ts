import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly title: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly addToCartButtons: Locator;
  readonly addToCartButton: Locator;
  readonly removeButtons: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.title = page.locator('.title');
    this.productNames = page.locator('[data-test="inventory-item-name"]');
    this.productPrices = page.locator('[data-test="inventory-item-price"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.addToCartButtons = page.locator('[data-test^="add-to-cart-"]');
    this.addToCartButton = page.locator('[data-test="add-to-cart"]');
    this.removeButtons = page.locator('[data-test^="remove-"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  async openFirstProduct() {
    await this.productNames.first().click();
  }

  async addFirstProductToCart() {
    await this.addToCartButtons.first().click();
  }

  async addTwoProductsToCart() {
    await this.addToCartButtons.nth(0).click();
    await this.addToCartButtons.nth(1).click();
  }

  async removeFirstProduct() {
    await this.removeButtons.first().click();
  }

  async openCart() {
    await this.cartLink.click();
  }

  async openMenu() {
    await this.menuButton.click();
  }

  async logout() {
    await this.logoutLink.click();
  }
}

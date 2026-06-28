import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly cartItem: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.cartItem = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  cartItems() {
    return this.cartItem;
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
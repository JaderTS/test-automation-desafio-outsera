import { Page } from '@playwright/test';

export class CartPage {
  constructor(private page: Page) {}

  cartItems() {
    return this.page.locator('.cart_item');
  }

  async checkout() {
    await this.page.locator('[data-test="checkout"]').click();
  }
}
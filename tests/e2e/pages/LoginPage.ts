import { Page } from '@playwright/test';
import { env } from '../support/env';

export class LoginPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto(env.baseUrl);
  }

  async fillUsername(username: string) {
    await this.page.locator('[data-test="username"]').fill(username);
  }

  async fillPassword(password: string) {
    await this.page.locator('[data-test="password"]').fill(password);
  }

  async clickLogin() {
    await this.page.locator('[data-test="login-button"]').click();
  }

  async login(username: string, password: string) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  errorMessage() {
    return this.page.locator('[data-test="error"]');
  }

  usernameField() {
    return this.page.locator('[data-test="username"]');
  }
}
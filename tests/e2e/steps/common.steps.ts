import { Given } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { env } from '../support/env';

Given('the user is authenticated in the system', async function (this: CustomWorld) {
  await this.loginPage.open(env.baseUrl);
  await this.loginPage.login(env.username, env.password);
});

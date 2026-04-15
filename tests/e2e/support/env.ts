import * as dotenv from 'dotenv';

dotenv.config();

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variável de ambiente não encontrada: ${name}`);
  }

  return value;
}

export const env = {
  baseUrl: getEnv('BASE_URL'),
  username: getEnv('VALID_USERNAME'),
  password: getEnv('VALID_PASSWORD'),
  invalidUser: getEnv('INVALID_USERNAME'),
  invalidPassword: getEnv('INVALID_PASSWORD'),
  firstName: getEnv('FIRST_NAME'),
  lastName: getEnv('LAST_NAME'),
  zipCode: getEnv('ZIP_CODE'),
  headless: getEnv('HEADLESS') === 'true',
};
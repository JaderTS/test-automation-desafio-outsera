module.exports = {
  default: {
    require: [
      'tests/e2e/support/**/*.ts',     
      'tests/e2e/steps/**/*.ts',
      'tests/e2e/step_definitions/**/*.js',
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'json:allure-results/cucumber-report.json'
    ],
    paths: ['tests/e2e/features/**/*.feature'],
    parallel: 1,
  },
};
const fs = require('fs');
const path = require('path');

const playwrightReportPath = './test-results.json';
const allureResultsDir = './allure-results';

if (!fs.existsSync(playwrightReportPath)) {
  console.log('test-results.json não encontrado, pulando conversão de API');
  process.exit(0);
}

if (!fs.existsSync(allureResultsDir)) {
  fs.mkdirSync(allureResultsDir, { recursive: true });
}

const report = JSON.parse(fs.readFileSync(playwrightReportPath, 'utf8'));
let testIndex = 0;

function getStatus(status) {
  switch (status) {
    case 'passed': return 'passed';
    case 'failed': return 'failed';
    case 'timedOut': return 'broken';
    case 'skipped': return 'skipped';
    default: return 'unknown';
  }
}

function processSpecs(suites, parentLabels) {
  if (!suites) return;

  suites.forEach((suite) => {
    const labels = [...parentLabels];
    if (suite.title) {
      labels.push({ name: 'suite', value: suite.title });
    }

    if (suite.specs) {
      suite.specs.forEach((spec) => {
        spec.tests.forEach((test) => {
          test.results.forEach((result) => {
            const startTime = new Date(result.startTime).getTime() || Date.now();
            const duration = result.duration || 0;

            const allureResult = {
              uuid: `api-test-${testIndex}`,
              historyId: `api-${suite.title}-${spec.title}`.replace(/\s+/g, '-'),
              name: spec.title,
              fullName: `API Tests - ${suite.title} - ${spec.title}`,
              status: getStatus(test.status),
              stage: 'finished',
              start: startTime,
              stop: startTime + duration,
              duration: duration,
              description: spec.file ? `Arquivo: ${spec.file}` : '',
              labels: [
                ...labels,
                { name: 'parentSuite', value: 'API Tests' },
                { name: 'severity', value: 'normal' },
              ],
              steps: (result.steps || []).map((step, idx) => ({
                name: step.title || `Step ${idx + 1}`,
                status: getStatus(step.status || test.status),
                stage: 'finished',
                start: startTime + idx * 100,
                stop: startTime + idx * 100 + (step.duration || 0),
                duration: step.duration || 0,
              })),
            };

            if (test.status === 'failed' && result.error) {
              allureResult.statusDetails = {
                message: result.error.message || 'Test failed',
                trace: result.error.stack || '',
              };
            }

            fs.writeFileSync(
              path.join(allureResultsDir, `api-${testIndex}-result.json`),
              JSON.stringify(allureResult, null, 2)
            );

            testIndex++;
          });
        });
      });
    }

    if (suite.suites) {
      processSpecs(suite.suites, labels);
    }
  });
}

if (report.suites) {
  processSpecs(report.suites, []);
}

console.log(`Convertidos ${testIndex} testes de API (Playwright) para Allure`);

const fs = require('fs');
const path = require('path');

let k6ResultsPath = './test-results/load-test-500vu-results.json';
if (!fs.existsSync(k6ResultsPath)) {
  k6ResultsPath = './test-results/load-test-results.json';
}

console.log(`Procurando testes K6 em: ${k6ResultsPath}`);

if (!fs.existsSync(k6ResultsPath)) {
  console.log(`K6 results nao encontrado: ${k6ResultsPath}`);
  process.exit(0);
}

try {
  const fileContent = fs.readFileSync(k6ResultsPath, 'utf8');

  let results;
  try {
    results = JSON.parse(fileContent);
  } catch (parseErr) {
    console.log(`Erro ao parsear JSON: ${parseErr.message}`);
    process.exit(0);
  }

  const allureResultsDir = './allure-results';

  if (!fs.existsSync(allureResultsDir)) {
    fs.mkdirSync(allureResultsDir, { recursive: true });
  }

  const startTime = Date.now();
  const metrics = results.metrics || {};

  // Extract check results from metrics (handleSummary format)
  const checksMetric = metrics.checks || {};
  const passedChecks = checksMetric.values ? checksMetric.values.passes || 0 : 0;
  const failedChecks = checksMetric.values ? checksMetric.values.fails || 0 : 0;

  // Extract HTTP metrics
  const httpReqs = metrics.http_reqs ? (metrics.http_reqs.values.count || 0) : 0;
  const httpReqFailedRate = metrics.http_req_failed ? (metrics.http_req_failed.values.rate || 0) : 0;
  const httpDuration = metrics.http_req_duration ? (metrics.http_req_duration.values || {}) : {};

  // Extract individual checks from root_group
  const checks = [];
  function extractChecks(group) {
    if (group && group.checks) {
      group.checks.forEach(function (check) {
        checks.push({
          name: check.name,
          passes: check.passes || 0,
          fails: check.fails || 0,
        });
      });
    }
    if (group && group.groups) {
      group.groups.forEach(function (g) { extractChecks(g); });
    }
  }
  if (results.root_group) {
    extractChecks(results.root_group);
  }

  const status = failedChecks === 0 ? 'passed' : 'failed';

  // Create steps from individual checks
  const steps = checks.map(function (check, idx) {
    return {
      name: check.name + ' (' + check.passes + ' passed, ' + check.fails + ' failed)',
      status: check.fails === 0 ? 'passed' : 'failed',
      stage: 'finished',
      start: startTime + idx * 100,
      stop: startTime + idx * 100 + 100,
      duration: 100,
    };
  });

  // Add HTTP metrics step
  steps.push({
    name: 'HTTP Requests: ' + httpReqs + ' total, ' + (httpReqFailedRate * 100).toFixed(2) + '% failed, avg ' + (httpDuration.avg || 0).toFixed(2) + 'ms, p99 ' + (httpDuration['p(99)'] || 0).toFixed(2) + 'ms',
    status: httpReqFailedRate < 0.01 ? 'passed' : 'failed',
    stage: 'finished',
    start: startTime + checks.length * 100,
    stop: startTime + checks.length * 100 + 100,
    duration: 100,
  });

  const description = [
    'K6 Load Test Results:',
    '- Passed Checks: ' + passedChecks,
    '- Failed Checks: ' + failedChecks,
    '- Total HTTP Requests: ' + httpReqs,
    '- HTTP Failure Rate: ' + (httpReqFailedRate * 100).toFixed(2) + '%',
    '- Avg Duration: ' + (httpDuration.avg || 0).toFixed(2) + 'ms',
    '- P95 Duration: ' + (httpDuration['p(95)'] || 0).toFixed(2) + 'ms',
  ].join('\n');

  const allureResult = {
    uuid: 'k6-load-test-0',
    historyId: 'k6-load-test',
    name: 'K6 Load Test',
    fullName: 'Load Testing :: K6 Load Test',
    status: status,
    stage: 'finished',
    start: startTime,
    stop: startTime + 1000,
    duration: 1000,
    description: description,
    labels: [
      { name: 'suite', value: 'Load Tests' },
      { name: 'type', value: 'load' },
      { name: 'severity', value: 'normal' },
    ],
    steps: steps,
  };

  fs.writeFileSync(
    path.join(allureResultsDir, 'k6-load-test-result.json'),
    JSON.stringify(allureResult, null, 2)
  );

  console.log(`Convertido K6 Load Test para Allure`);
  console.log(`   - Passed: ${passedChecks}`);
  console.log(`   - Failed: ${failedChecks}`);
  console.log(`   - Total Requests: ${httpReqs}`);
} catch (error) {
  console.error(`Erro ao converter K6: ${error.message}`);
  process.exit(0);
}
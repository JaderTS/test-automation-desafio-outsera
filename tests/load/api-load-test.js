import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 },    // Ramp-up para 100 usuários
    { duration: '1m', target: 500 },    // Suba para 500 usuários
    { duration: '3m', target: 500 },    // Mantenha 500 usuários
    { duration: '1m', target: 0 },      // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(99)<1000'],  // 99% das requisições devem ser < 1000ms
    http_req_failed: ['rate<0.01'],     // Taxa de erro < 1%
  },
};

export default function () {
  // Testar GET /posts
  let response = http.get('https://jsonplaceholder.typicode.com/posts');
  check(response, {
    'GET /posts status é 200': (r) => r.status === 200,
    'GET /posts tempo < 1000ms': (r) => r.timings.duration < 1000,
  });

  // Testar POST /posts
  let postResponse = http.post('https://jsonplaceholder.typicode.com/posts', {
    userId: 1,
    title: 'Load Test Post',
    body: 'Testing with K6',
  });
  check(postResponse, {
    'POST /posts status é 201': (r) => r.status === 201,
  });

  sleep(1);
}

export function handleSummary(data) {
  const checks = data.metrics.checks ? data.metrics.checks.values : { passes: 0, fails: 0, rate: 0 };
  const httpReqs = data.metrics.http_reqs ? data.metrics.http_reqs.values : { count: 0, rate: 0 };
  const httpDuration = data.metrics.http_req_duration ? data.metrics.http_req_duration.values : {};
  const httpFailed = data.metrics.http_req_failed ? data.metrics.http_req_failed.values : { rate: 0 };

  const summary = [
    '',
    '=== K6 Load Test Summary ===',
    '',
    '  Checks:',
    '    Passed: ' + checks.passes,
    '    Failed: ' + checks.fails,
    '    Rate:   ' + (checks.rate * 100).toFixed(2) + '%',
    '',
    '  HTTP Requests: ' + httpReqs.count + ' (' + httpReqs.rate.toFixed(2) + '/s)',
    '  HTTP Failures: ' + (httpFailed.rate * 100).toFixed(2) + '%',
    '',
    '  Duration:',
    '    Avg: ' + (httpDuration.avg || 0).toFixed(2) + 'ms',
    '    P90: ' + (httpDuration['p(90)'] || 0).toFixed(2) + 'ms',
    '    P95: ' + (httpDuration['p(95)'] || 0).toFixed(2) + 'ms',
    '    P99: ' + (httpDuration['p(99)'] || 0).toFixed(2) + 'ms',
    '    Max: ' + (httpDuration.max || 0).toFixed(2) + 'ms',
    '',
  ].join('\n');

  return {
    './test-results/load-test-results.json': JSON.stringify(data),
    stdout: summary,
  };
}
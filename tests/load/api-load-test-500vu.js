import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const getPostsTrend = new Trend('get_posts_duration');
const getPostsFilterTrend = new Trend('get_posts_filter_duration');
const getPostByIdTrend = new Trend('get_post_by_id_duration');
const createPostTrend = new Trend('create_post_duration');
const getUsersTrend = new Trend('get_users_duration');
const getCommentsTrend = new Trend('get_comments_duration');
const getTodosTrend = new Trend('get_todos_duration');

export let options = {
  stages: [
    { duration: '1m', target: 500 },   // Ramp-up: 1 minuto ate 500 VUs
    { duration: '3m', target: 500 },   // Sustentacao: 3 minutos com 500 VUs
    { duration: '1m', target: 0 },     // Ramp-down: 1 minuto reduzindo para 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export default function () {
  // GET /posts
  group('GET /posts', function () {
    let res = http.get(`${BASE_URL}/posts`);
    getPostsTrend.add(res.timings.duration);
    let passed = check(res, {
      'GET /posts status 200': (r) => r.status === 200,
      'GET /posts tem dados': (r) => r.json().length > 0,
      'GET /posts tempo < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(!passed);
  });

  // GET /posts?userId=1
  group('GET /posts?userId=1', function () {
    let res = http.get(`${BASE_URL}/posts?userId=1`);
    getPostsFilterTrend.add(res.timings.duration);
    let passed = check(res, {
      'GET /posts?userId=1 status 200': (r) => r.status === 200,
      'GET /posts?userId=1 retorna posts do user 1': (r) => {
        let body = r.json();
        return body.length > 0 && body.every((p) => p.userId === 1);
      },
      'GET /posts?userId=1 tempo < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(!passed);
  });

  // GET /posts/:id
  group('GET /posts/:id', function () {
    let postId = Math.floor(Math.random() * 100) + 1;
    let res = http.get(`${BASE_URL}/posts/${postId}`);
    getPostByIdTrend.add(res.timings.duration);
    let passed = check(res, {
      'GET /posts/:id status 200': (r) => r.status === 200,
      'GET /posts/:id tem id correto': (r) => r.json().id === postId,
      'GET /posts/:id tempo < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(!passed);
  });

  // POST /posts
  group('POST /posts', function () {
    let payload = JSON.stringify({
      title: 'Load Test Post',
      body: 'Post criado durante teste de carga com K6',
      userId: 1,
    });
    let params = { headers: { 'Content-Type': 'application/json' } };
    let res = http.post(`${BASE_URL}/posts`, payload, params);
    createPostTrend.add(res.timings.duration);
    let passed = check(res, {
      'POST /posts status 201': (r) => r.status === 201,
      'POST /posts retorna id': (r) => r.json().id !== undefined,
      'POST /posts tempo < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(!passed);
  });

  // GET /users
  group('GET /users', function () {
    let res = http.get(`${BASE_URL}/users`);
    getUsersTrend.add(res.timings.duration);
    let passed = check(res, {
      'GET /users status 200': (r) => r.status === 200,
      'GET /users tem dados': (r) => r.json().length > 0,
      'GET /users tempo < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(!passed);
  });

  // GET /comments
  group('GET /comments', function () {
    let res = http.get(`${BASE_URL}/comments`);
    getCommentsTrend.add(res.timings.duration);
    let passed = check(res, {
      'GET /comments status 200': (r) => r.status === 200,
      'GET /comments tem dados': (r) => r.json().length > 0,
      'GET /comments tempo < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(!passed);
  });

  // GET /todos
  group('GET /todos', function () {
    let res = http.get(`${BASE_URL}/todos`);
    getTodosTrend.add(res.timings.duration);
    let passed = check(res, {
      'GET /todos status 200': (r) => r.status === 200,
      'GET /todos tem dados': (r) => r.json().length > 0,
      'GET /todos tempo < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(!passed);
  });

  sleep(1);
}

export function handleSummary(data) {
  const metrics = data.metrics || {};
  const checks = metrics.checks ? metrics.checks.values : { passes: 0, fails: 0, rate: 0 };
  const httpReqs = metrics.http_reqs ? metrics.http_reqs.values : { count: 0, rate: 0 };
  const httpDuration = metrics.http_req_duration ? metrics.http_req_duration.values : {};
  const httpFailed = metrics.http_req_failed ? metrics.http_req_failed.values : { rate: 0 };

  const customMetrics = [
    'get_posts_duration',
    'get_posts_filter_duration',
    'get_post_by_id_duration',
    'create_post_duration',
    'get_users_duration',
    'get_comments_duration',
    'get_todos_duration',
  ];

  let endpointSummary = '\n  Endpoint Durations:\n';
  customMetrics.forEach((m) => {
    if (metrics[m] && metrics[m].values) {
      const v = metrics[m].values;
      endpointSummary +=
        '    ' +
        m +
        ': Avg=' +
        (v.avg || 0).toFixed(2) +
        'ms P90=' +
        (v['p(90)'] || 0).toFixed(2) +
        'ms P95=' +
        (v['p(95)'] || 0).toFixed(2) +
        'ms P99=' +
        (v['p(99)'] || 0).toFixed(2) +
        'ms Max=' +
        (v.max || 0).toFixed(2) +
        'ms\n';
    }
  });

  const summary = [
    '',
    '=== K6 Load Test 500 VUs Summary ===',
    '',
    '  Checks:',
    '    Passed: ' + checks.passes,
    '    Failed: ' + checks.fails,
    '    Rate:   ' + (checks.rate * 100).toFixed(2) + '%',
    '',
    '  HTTP Requests: ' + httpReqs.count + ' (' + httpReqs.rate.toFixed(2) + '/s)',
    '  HTTP Failures: ' + (httpFailed.rate * 100).toFixed(2) + '%',
    '',
    '  Overall Duration:',
    '    Avg: ' + (httpDuration.avg || 0).toFixed(2) + 'ms',
    '    P90: ' + (httpDuration['p(90)'] || 0).toFixed(2) + 'ms',
    '    P95: ' + (httpDuration['p(95)'] || 0).toFixed(2) + 'ms',
    '    P99: ' + (httpDuration['p(99)'] || 0).toFixed(2) + 'ms',
    '    Max: ' + (httpDuration.max || 0).toFixed(2) + 'ms',
    endpointSummary,
  ].join('\n');

  return {
    './test-results/load-test-500vu-results.json': JSON.stringify(data),
    stdout: summary,
  };
}

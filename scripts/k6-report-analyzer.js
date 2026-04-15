const fs = require('fs');
const path = require('path');

const RESULTS_PATH = './test-results/load-test-500vu-results.json';
const REPORT_PATH = './test-results/load-test-report.html';

function loadResults() {
  if (!fs.existsSync(RESULTS_PATH)) {
    console.error(`Arquivo de resultados nao encontrado: ${RESULTS_PATH}`);
    console.error('Execute primeiro: npm run test:load:500vu');
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(RESULTS_PATH, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Erro ao ler resultados: ${err.message}`);
    process.exit(1);
  }
}

function extractMetrics(data) {
  const metrics = data.metrics || {};
  const httpDuration = metrics.http_req_duration ? metrics.http_req_duration.values : {};
  const httpReqs = metrics.http_reqs ? metrics.http_reqs.values : { count: 0, rate: 0 };
  const httpFailed = metrics.http_req_failed ? metrics.http_req_failed.values : { rate: 0 };
  const checks = metrics.checks ? metrics.checks.values : { passes: 0, fails: 0, rate: 0 };

  const endpointMetrics = {};
  const endpointKeys = [
    'get_posts_duration',
    'get_posts_filter_duration',
    'get_post_by_id_duration',
    'create_post_duration',
    'get_users_duration',
    'get_comments_duration',
    'get_todos_duration',
  ];

  const endpointLabels = {
    get_posts_duration: 'GET /posts',
    get_posts_filter_duration: 'GET /posts?userId=1',
    get_post_by_id_duration: 'GET /posts/:id',
    create_post_duration: 'POST /posts',
    get_users_duration: 'GET /users',
    get_comments_duration: 'GET /comments',
    get_todos_duration: 'GET /todos',
  };

  endpointKeys.forEach((key) => {
    if (metrics[key] && metrics[key].values) {
      endpointMetrics[endpointLabels[key]] = metrics[key].values;
    }
  });

  return {
    overall: {
      avg: httpDuration.avg || 0,
      p90: httpDuration['p(90)'] || 0,
      p95: httpDuration['p(95)'] || 0,
      p99: httpDuration['p(99)'] || 0,
      max: httpDuration.max || 0,
      min: httpDuration.min || 0,
      med: httpDuration.med || 0,
    },
    requests: {
      total: httpReqs.count || 0,
      rate: httpReqs.rate || 0,
    },
    errors: {
      rate: httpFailed.rate || 0,
    },
    checks: {
      passed: checks.passes || 0,
      failed: checks.fails || 0,
      rate: checks.rate || 0,
    },
    endpoints: endpointMetrics,
  };
}

function identifyBottlenecks(metrics) {
  const bottlenecks = [];
  const P95_THRESHOLD = 500;
  const P99_THRESHOLD = 1000;
  const ERROR_THRESHOLD = 0.01;

  if (metrics.overall.p95 > P95_THRESHOLD) {
    bottlenecks.push({
      type: 'latency',
      severity: 'high',
      message: `P95 geral (${metrics.overall.p95.toFixed(2)}ms) acima do limiar de ${P95_THRESHOLD}ms`,
    });
  }

  if (metrics.overall.p99 > P99_THRESHOLD) {
    bottlenecks.push({
      type: 'latency',
      severity: 'critical',
      message: `P99 geral (${metrics.overall.p99.toFixed(2)}ms) acima do limiar de ${P99_THRESHOLD}ms`,
    });
  }

  if (metrics.errors.rate > ERROR_THRESHOLD) {
    bottlenecks.push({
      type: 'errors',
      severity: 'critical',
      message: `Taxa de erro (${(metrics.errors.rate * 100).toFixed(2)}%) acima do limiar de ${ERROR_THRESHOLD * 100}%`,
    });
  }

  Object.entries(metrics.endpoints).forEach(([name, values]) => {
    if (values['p(95)'] > P95_THRESHOLD) {
      bottlenecks.push({
        type: 'endpoint_latency',
        severity: 'medium',
        message: `Endpoint ${name}: P95 (${values['p(95)'].toFixed(2)}ms) acima de ${P95_THRESHOLD}ms`,
      });
    }
    if (values['p(99)'] > P99_THRESHOLD) {
      bottlenecks.push({
        type: 'endpoint_latency',
        severity: 'high',
        message: `Endpoint ${name}: P99 (${values['p(99)'].toFixed(2)}ms) acima de ${P99_THRESHOLD}ms`,
      });
    }
  });

  return bottlenecks;
}

function generateRecommendations(metrics, bottlenecks) {
  const recommendations = [];

  if (bottlenecks.some((b) => b.type === 'latency')) {
    recommendations.push(
      'Considere implementar cache (Redis/Memcached) para reduzir latencia em endpoints de leitura.'
    );
    recommendations.push(
      'Avalie o uso de CDN para distribuir a carga geograficamente.'
    );
  }

  if (bottlenecks.some((b) => b.type === 'errors')) {
    recommendations.push(
      'Investigue os erros HTTP - pode indicar limite de rate limiting ou instabilidade do servidor.'
    );
    recommendations.push(
      'Implemente retry com backoff exponencial no cliente para lidar com falhas transitorias.'
    );
  }

  if (metrics.overall.max > 5000) {
    recommendations.push(
      'Latencia maxima muito alta (' +
        metrics.overall.max.toFixed(0) +
        'ms). Verifique se ha timeouts ou conexoes lentas.'
    );
  }

  const slowEndpoints = Object.entries(metrics.endpoints)
    .filter(([, v]) => v.avg > 300)
    .map(([name]) => name);

  if (slowEndpoints.length > 0) {
    recommendations.push(
      'Endpoints com latencia media alta: ' +
        slowEndpoints.join(', ') +
        '. Considere otimizar queries ou paginacao.'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Performance dentro dos parametros aceitaveis. Continue monitorando em producao.'
    );
  }

  return recommendations;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateHtml(metrics, bottlenecks, recommendations) {
  const endpointLabels = Object.keys(metrics.endpoints);
  const endpointAvg = endpointLabels.map((k) => (metrics.endpoints[k].avg || 0).toFixed(2));
  const endpointP95 = endpointLabels.map((k) => (metrics.endpoints[k]['p(95)'] || 0).toFixed(2));
  const endpointP99 = endpointLabels.map((k) => (metrics.endpoints[k]['p(99)'] || 0).toFixed(2));

  const severityColors = { critical: '#dc3545', high: '#fd7e14', medium: '#ffc107', low: '#28a745' };

  const bottleneckRows = bottlenecks.length > 0
    ? bottlenecks
        .map(
          (b) =>
            `<tr>
              <td><span style="color:${severityColors[b.severity] || '#6c757d'};font-weight:bold">${escapeHtml(b.severity.toUpperCase())}</span></td>
              <td>${escapeHtml(b.type)}</td>
              <td>${escapeHtml(b.message)}</td>
            </tr>`
        )
        .join('')
    : '<tr><td colspan="3" style="text-align:center;color:#28a745">Nenhum gargalo identificado</td></tr>';

  const recommendationItems = recommendations
    .map((r) => `<li>${escapeHtml(r)}</li>`)
    .join('');

  const endpointRows = endpointLabels
    .map(
      (name) =>
        `<tr>
          <td>${escapeHtml(name)}</td>
          <td>${(metrics.endpoints[name].avg || 0).toFixed(2)}</td>
          <td>${(metrics.endpoints[name]['p(90)'] || 0).toFixed(2)}</td>
          <td>${(metrics.endpoints[name]['p(95)'] || 0).toFixed(2)}</td>
          <td>${(metrics.endpoints[name]['p(99)'] || 0).toFixed(2)}</td>
          <td>${(metrics.endpoints[name].max || 0).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const statusClass = bottlenecks.some((b) => b.severity === 'critical')
    ? 'status-fail'
    : bottlenecks.length > 0
      ? 'status-warn'
      : 'status-pass';
  const statusText = bottlenecks.some((b) => b.severity === 'critical')
    ? 'FALHA'
    : bottlenecks.length > 0
      ? 'ATENCAO'
      : 'APROVADO';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>K6 Load Test Report - 500 VUs</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { text-align: center; margin-bottom: 10px; color: #2c3e50; }
    .subtitle { text-align: center; color: #7f8c8d; margin-bottom: 30px; }
    .status-badge { text-align: center; margin-bottom: 30px; }
    .status-badge span { padding: 8px 24px; border-radius: 20px; font-weight: bold; font-size: 18px; color: white; }
    .status-pass { background: #28a745; }
    .status-warn { background: #ffc107; color: #333 !important; }
    .status-fail { background: #dc3545; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .card h3 { font-size: 14px; color: #7f8c8d; margin-bottom: 8px; }
    .card .value { font-size: 28px; font-weight: bold; color: #2c3e50; }
    .card .unit { font-size: 14px; color: #95a5a6; }
    .section { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .section h2 { margin-bottom: 15px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; color: #495057; }
    .chart-container { position: relative; height: 350px; margin: 15px 0; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; line-height: 1.5; }
    .footer { text-align: center; color: #95a5a6; margin-top: 30px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>K6 Load Test Report</h1>
    <p class="subtitle">500 Virtual Users - JSONPlaceholder API</p>
    <div class="status-badge"><span class="${statusClass}">${statusText}</span></div>

    <div class="cards">
      <div class="card">
        <h3>Total Requisicoes</h3>
        <div class="value">${metrics.requests.total.toLocaleString()}</div>
      </div>
      <div class="card">
        <h3>Req/s</h3>
        <div class="value">${metrics.requests.rate.toFixed(2)}</div>
      </div>
      <div class="card">
        <h3>Taxa de Erro</h3>
        <div class="value">${(metrics.errors.rate * 100).toFixed(2)}<span class="unit">%</span></div>
      </div>
      <div class="card">
        <h3>Checks Passed</h3>
        <div class="value">${(metrics.checks.rate * 100).toFixed(2)}<span class="unit">%</span></div>
      </div>
      <div class="card">
        <h3>Latencia Media</h3>
        <div class="value">${metrics.overall.avg.toFixed(0)}<span class="unit">ms</span></div>
      </div>
      <div class="card">
        <h3>P95</h3>
        <div class="value">${metrics.overall.p95.toFixed(0)}<span class="unit">ms</span></div>
      </div>
      <div class="card">
        <h3>P99</h3>
        <div class="value">${metrics.overall.p99.toFixed(0)}<span class="unit">ms</span></div>
      </div>
      <div class="card">
        <h3>Max</h3>
        <div class="value">${metrics.overall.max.toFixed(0)}<span class="unit">ms</span></div>
      </div>
    </div>

    <div class="section">
      <h2>Latencia por Endpoint</h2>
      <table>
        <thead>
          <tr><th>Endpoint</th><th>Avg (ms)</th><th>P90 (ms)</th><th>P95 (ms)</th><th>P99 (ms)</th><th>Max (ms)</th></tr>
        </thead>
        <tbody>${endpointRows}</tbody>
      </table>
    </div>

    <div class="section">
      <h2>Grafico de Latencia por Endpoint</h2>
      <div class="chart-container">
        <canvas id="latencyChart"></canvas>
      </div>
    </div>

    <div class="section">
      <h2>Metricas Gerais de Latencia</h2>
      <div class="chart-container">
        <canvas id="overallChart"></canvas>
      </div>
    </div>

    <div class="section">
      <h2>Taxa de Erro e Throughput</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div class="chart-container">
          <canvas id="errorRateChart"></canvas>
        </div>
        <div class="chart-container">
          <canvas id="throughputChart"></canvas>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Gargalos Identificados</h2>
      <table>
        <thead><tr><th>Severidade</th><th>Tipo</th><th>Descricao</th></tr></thead>
        <tbody>${bottleneckRows}</tbody>
      </table>
    </div>

    <div class="section">
      <h2>Recomendacoes</h2>
      <ul>${recommendationItems}</ul>
    </div>

    <div class="footer">
      <p>Gerado em ${new Date().toISOString()} | K6 Load Test Analyzer</p>
    </div>
  </div>

  <script>
    const endpointLabels = ${JSON.stringify(endpointLabels)};
    const avgData = [${endpointAvg.join(',')}];
    const p95Data = [${endpointP95.join(',')}];
    const p99Data = [${endpointP99.join(',')}];

    new Chart(document.getElementById('latencyChart'), {
      type: 'bar',
      data: {
        labels: endpointLabels,
        datasets: [
          { label: 'Avg (ms)', data: avgData, backgroundColor: 'rgba(54,162,235,0.7)' },
          { label: 'P95 (ms)', data: p95Data, backgroundColor: 'rgba(255,206,86,0.7)' },
          { label: 'P99 (ms)', data: p99Data, backgroundColor: 'rgba(255,99,132,0.7)' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Latencia por Endpoint (ms)' } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'ms' } } }
      }
    });

    new Chart(document.getElementById('overallChart'), {
      type: 'bar',
      data: {
        labels: ['Min', 'Avg', 'Med', 'P90', 'P95', 'P99', 'Max'],
        datasets: [{
          label: 'Latencia (ms)',
          data: [
            ${metrics.overall.min.toFixed(2)},
            ${metrics.overall.avg.toFixed(2)},
            ${metrics.overall.med.toFixed(2)},
            ${metrics.overall.p90.toFixed(2)},
            ${metrics.overall.p95.toFixed(2)},
            ${metrics.overall.p99.toFixed(2)},
            ${metrics.overall.max.toFixed(2)}
          ],
          backgroundColor: [
            'rgba(75,192,192,0.7)',
            'rgba(54,162,235,0.7)',
            'rgba(153,102,255,0.7)',
            'rgba(255,206,86,0.7)',
            'rgba(255,159,64,0.7)',
            'rgba(255,99,132,0.7)',
            'rgba(220,53,69,0.7)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Distribuicao de Latencia Geral (ms)' } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'ms' } } }
      }
    });

    const errorPct = ${(metrics.errors.rate * 100).toFixed(2)};
    const successPct = ${(100 - metrics.errors.rate * 100).toFixed(2)};

    new Chart(document.getElementById('errorRateChart'), {
      type: 'doughnut',
      data: {
        labels: ['Sucesso', 'Erro'],
        datasets: [{
          data: [successPct, errorPct],
          backgroundColor: ['rgba(40,167,69,0.8)', 'rgba(220,53,69,0.8)']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Taxa de Erro (%)' },
          legend: { position: 'bottom' }
        }
      }
    });

    new Chart(document.getElementById('throughputChart'), {
      type: 'bar',
      data: {
        labels: ['Throughput'],
        datasets: [{
          label: 'Req/s',
          data: [${metrics.requests.rate.toFixed(2)}],
          backgroundColor: ['rgba(54,162,235,0.8)']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Throughput (Requisicoes/segundo)' }
        },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'req/s' } } }
      }
    });
  </script>
</body>
</html>`;
}

// Main
console.log('=== K6 Report Analyzer ===\n');
console.log(`Lendo resultados de: ${RESULTS_PATH}`);

const data = loadResults();
const metrics = extractMetrics(data);
const bottlenecks = identifyBottlenecks(metrics);
const recommendations = generateRecommendations(metrics, bottlenecks);

console.log('\n--- Resumo ---');
console.log(`Total de requisicoes: ${metrics.requests.total}`);
console.log(`Requisicoes/s: ${metrics.requests.rate.toFixed(2)}`);
console.log(`Taxa de erro: ${(metrics.errors.rate * 100).toFixed(2)}%`);
console.log(`Checks passaram: ${(metrics.checks.rate * 100).toFixed(2)}%`);
console.log(`\nLatencia geral:`);
console.log(`  Avg: ${metrics.overall.avg.toFixed(2)}ms`);
console.log(`  P90: ${metrics.overall.p90.toFixed(2)}ms`);
console.log(`  P95: ${metrics.overall.p95.toFixed(2)}ms`);
console.log(`  P99: ${metrics.overall.p99.toFixed(2)}ms`);
console.log(`  Max: ${metrics.overall.max.toFixed(2)}ms`);

console.log('\nLatencia por endpoint:');
Object.entries(metrics.endpoints).forEach(([name, values]) => {
  console.log(
    `  ${name}: Avg=${(values.avg || 0).toFixed(2)}ms P95=${(values['p(95)'] || 0).toFixed(2)}ms P99=${(values['p(99)'] || 0).toFixed(2)}ms`
  );
});

if (bottlenecks.length > 0) {
  console.log('\nGargalos identificados:');
  bottlenecks.forEach((b) => console.log(`  [${b.severity.toUpperCase()}] ${b.message}`));
} else {
  console.log('\nNenhum gargalo identificado.');
}

console.log('\nRecomendacoes:');
recommendations.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));

// Generate HTML report
const dir = path.dirname(REPORT_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const html = generateHtml(metrics, bottlenecks, recommendations);
fs.writeFileSync(REPORT_PATH, html);
console.log(`\nRelatorio HTML gerado: ${REPORT_PATH}`);

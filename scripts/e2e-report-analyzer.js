const fs = require('fs');
const path = require('path');

const CUCUMBER_REPORT_PATH = './allure-results/cucumber-report.json';
const REPORT_OUTPUT_PATH = './test-results/e2e-report.html';
const SCREENSHOTS_DIR = './allure-results';

function loadResults() {
  if (!fs.existsSync(CUCUMBER_REPORT_PATH)) {
    console.error(`Arquivo de resultados nao encontrado: ${CUCUMBER_REPORT_PATH}`);
    console.error('Execute primeiro: npm run test:e2e');
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(CUCUMBER_REPORT_PATH, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Erro ao ler resultados: ${err.message}`);
    process.exit(1);
  }
}

function extractScenarios(data) {
  const scenarios = [];

  data.forEach((feature) => {
    const featureName = feature.name || 'Unknown Feature';
    const elements = feature.elements || [];

    elements.forEach((element) => {
      if (element.type === 'scenario') {
        const steps = (element.steps || []).map((step) => {
          const result = step.result || {};
          return {
            keyword: step.keyword || '',
            name: step.name || '',
            status: result.status || 'undefined',
            duration: result.duration ? (result.duration / 1e6).toFixed(2) : '0.00',
            error: result.error_message || null,
          };
        });

        const allPassed = steps.every(
          (s) => s.status === 'passed' || s.status === 'skipped'
        );
        const hasFailed = steps.some((s) => s.status === 'failed');

        scenarios.push({
          feature: featureName,
          name: element.name || 'Unknown Scenario',
          tags: (element.tags || []).map((t) => t.name),
          status: hasFailed ? 'failed' : allPassed ? 'passed' : 'undefined',
          steps,
        });
      }
    });
  });

  return scenarios;
}

function findScreenshots() {
  const screenshots = {};
  if (!fs.existsSync(SCREENSHOTS_DIR)) return screenshots;

  const files = fs.readdirSync(SCREENSHOTS_DIR);
  files
    .filter((f) => f.endsWith('.png'))
    .forEach((f) => {
      const name = path.parse(f).name.replace(/_/g, ' ');
      try {
        const data = fs.readFileSync(path.join(SCREENSHOTS_DIR, f));
        screenshots[name] = data.toString('base64');
      } catch (err) {
        console.warn(`Aviso: nao foi possivel ler screenshot ${f}: ${err.message}`);
      }
    });

  return screenshots;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateHtml(scenarios, screenshots) {
  const totalScenarios = scenarios.length;
  const passedScenarios = scenarios.filter((s) => s.status === 'passed').length;
  const failedScenarios = scenarios.filter((s) => s.status === 'failed').length;
  const undefinedScenarios = totalScenarios - passedScenarios - failedScenarios;

  const positiveScenarios = scenarios.filter(
    (s) =>
      !s.tags.some((t) => t.includes('negativo') || t.includes('negative')) &&
      !s.name.toLowerCase().includes('negativ') &&
      !s.feature.toLowerCase().includes('negativ')
  );
  const negativeScenarios = scenarios.filter(
    (s) =>
      s.tags.some((t) => t.includes('negativo') || t.includes('negative')) ||
      s.name.toLowerCase().includes('negativ') ||
      s.feature.toLowerCase().includes('negativ')
  );

  const featureGroups = {};
  scenarios.forEach((s) => {
    if (!featureGroups[s.feature]) featureGroups[s.feature] = [];
    featureGroups[s.feature].push(s);
  });

  const statusColors = { passed: '#28a745', failed: '#dc3545', undefined: '#6c757d', skipped: '#ffc107' };
  const statusIcons = { passed: '&#10004;', failed: '&#10008;', undefined: '&#63;', skipped: '&#8594;' };

  let scenarioCards = '';
  Object.entries(featureGroups).forEach(([featureName, featureScenarios]) => {
    const featurePassed = featureScenarios.filter((s) => s.status === 'passed').length;
    const featureTotal = featureScenarios.length;

    scenarioCards += `
    <div class="section">
      <h2>${escapeHtml(featureName)} <span class="feature-stats">(${featurePassed}/${featureTotal} passed)</span></h2>`;

    featureScenarios.forEach((scenario) => {
      const isNegative =
        scenario.tags.some((t) => t.includes('negativo') || t.includes('negative')) ||
        scenario.name.toLowerCase().includes('negativ') ||
        scenario.feature.toLowerCase().includes('negativ');

      const badge = isNegative ? '<span class="badge badge-negative">NEGATIVO</span>' : '<span class="badge badge-positive">POSITIVO</span>';

      scenarioCards += `
      <div class="scenario ${scenario.status === 'passed' ? 'scenario-pass' : 'scenario-fail'}">
        <div class="scenario-header">
          <span style="color:${statusColors[scenario.status] || '#6c757d'};font-weight:bold;font-size:18px">${statusIcons[scenario.status] || '?'}</span>
          <strong>${escapeHtml(scenario.name)}</strong>
          ${badge}
        </div>
        <table class="steps-table">
          <thead><tr><th>Status</th><th>Step</th><th>Duracao (ms)</th></tr></thead>
          <tbody>`;

      scenario.steps.forEach((step) => {
        scenarioCards += `
            <tr>
              <td><span style="color:${statusColors[step.status] || '#6c757d'}">${statusIcons[step.status] || '?'}</span></td>
              <td>${escapeHtml(step.keyword)}${escapeHtml(step.name)}</td>
              <td>${step.duration}</td>
            </tr>`;
        if (step.error) {
          scenarioCards += `
            <tr><td colspan="3" class="error-msg">${escapeHtml(step.error)}</td></tr>`;
        }
      });

      scenarioCards += `
          </tbody>
        </table>`;

      // Check for screenshot
      const screenshotKey = scenario.name.replace(/\s+/g, '_');
      if (screenshots[scenario.name] || screenshots[screenshotKey]) {
        const imgData = screenshots[scenario.name] || screenshots[screenshotKey];
        scenarioCards += `
        <div class="screenshot">
          <h4>Screenshot</h4>
          <img src="data:image/png;base64,${imgData}" alt="Screenshot ${escapeHtml(scenario.name)}" />
        </div>`;
      }

      scenarioCards += `
      </div>`;
    });

    scenarioCards += `
    </div>`;
  });

  // Screenshots gallery
  let screenshotGallery = '';
  const screenshotEntries = Object.entries(screenshots);
  if (screenshotEntries.length > 0) {
    screenshotGallery = `
    <div class="section">
      <h2>Evidencias Visuais (Screenshots)</h2>
      <div class="screenshots-grid">`;
    screenshotEntries.forEach(([name, data]) => {
      screenshotGallery += `
        <div class="screenshot-card">
          <img src="data:image/png;base64,${data}" alt="${escapeHtml(name)}" />
          <p>${escapeHtml(name)}</p>
        </div>`;
    });
    screenshotGallery += `
      </div>
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E2E Test Report - Cucumber + Playwright</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { text-align: center; margin-bottom: 10px; color: #2c3e50; }
    .subtitle { text-align: center; color: #7f8c8d; margin-bottom: 30px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .card h3 { font-size: 14px; color: #7f8c8d; margin-bottom: 8px; }
    .card .value { font-size: 28px; font-weight: bold; color: #2c3e50; }
    .section { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .section h2 { margin-bottom: 15px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; }
    .feature-stats { font-size: 14px; color: #7f8c8d; font-weight: normal; }
    .scenario { border: 1px solid #eee; border-radius: 6px; padding: 15px; margin-bottom: 15px; }
    .scenario-pass { border-left: 4px solid #28a745; }
    .scenario-fail { border-left: 4px solid #dc3545; }
    .scenario-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: bold; color: white; }
    .badge-positive { background: #3498db; }
    .badge-negative { background: #e67e22; }
    .steps-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .steps-table th, .steps-table td { padding: 6px 10px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    .steps-table th { background: #f8f9fa; font-weight: 600; }
    .error-msg { color: #dc3545; font-size: 12px; font-family: monospace; white-space: pre-wrap; background: #fff5f5; padding: 8px; }
    .screenshot img { max-width: 100%; border: 1px solid #ddd; border-radius: 4px; margin-top: 8px; }
    .screenshot h4 { color: #7f8c8d; margin-top: 10px; }
    .screenshots-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
    .screenshot-card { text-align: center; }
    .screenshot-card img { max-width: 100%; border: 1px solid #ddd; border-radius: 4px; }
    .screenshot-card p { font-size: 12px; color: #7f8c8d; margin-top: 5px; }
    .chart-container { position: relative; height: 300px; margin: 15px 0; }
    .footer { text-align: center; color: #95a5a6; margin-top: 30px; font-size: 12px; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
  <div class="container">
    <h1>E2E Test Report</h1>
    <p class="subtitle">Cucumber + Playwright - Cenarios Positivos e Negativos</p>

    <div class="cards">
      <div class="card">
        <h3>Total Cenarios</h3>
        <div class="value">${totalScenarios}</div>
      </div>
      <div class="card">
        <h3>Passou</h3>
        <div class="value" style="color:#28a745">${passedScenarios}</div>
      </div>
      <div class="card">
        <h3>Falhou</h3>
        <div class="value" style="color:#dc3545">${failedScenarios}</div>
      </div>
      <div class="card">
        <h3>Indefinido</h3>
        <div class="value" style="color:#6c757d">${undefinedScenarios}</div>
      </div>
      <div class="card">
        <h3>Positivos</h3>
        <div class="value" style="color:#3498db">${positiveScenarios.length}</div>
      </div>
      <div class="card">
        <h3>Negativos</h3>
        <div class="value" style="color:#e67e22">${negativeScenarios.length}</div>
      </div>
    </div>

    <div class="section">
      <h2>Resultado por Feature</h2>
      <div class="chart-container">
        <canvas id="featureChart"></canvas>
      </div>
    </div>

    ${scenarioCards}

    ${screenshotGallery}

    <div class="footer">
      <p>Gerado em ${new Date().toISOString()} | E2E Report Analyzer</p>
    </div>
  </div>

  <script>
    const featureLabels = ${JSON.stringify(Object.keys(featureGroups))};
    const featurePassed = [${Object.values(featureGroups)
      .map((s) => s.filter((sc) => sc.status === 'passed').length)
      .join(',')}];
    const featureFailed = [${Object.values(featureGroups)
      .map((s) => s.filter((sc) => sc.status === 'failed').length)
      .join(',')}];

    new Chart(document.getElementById('featureChart'), {
      type: 'bar',
      data: {
        labels: featureLabels,
        datasets: [
          { label: 'Passed', data: featurePassed, backgroundColor: 'rgba(40,167,69,0.7)' },
          { label: 'Failed', data: featureFailed, backgroundColor: 'rgba(220,53,69,0.7)' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Resultado por Feature' } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  </script>
</body>
</html>`;
}

// Main
console.log('=== E2E Report Analyzer ===\n');
console.log(`Lendo resultados de: ${CUCUMBER_REPORT_PATH}`);

const data = loadResults();
const scenarios = extractScenarios(data);
const screenshots = findScreenshots();

console.log(`\n--- Resumo ---`);
console.log(`Total de cenarios: ${scenarios.length}`);
console.log(`Passed: ${scenarios.filter((s) => s.status === 'passed').length}`);
console.log(`Failed: ${scenarios.filter((s) => s.status === 'failed').length}`);
console.log(`Screenshots encontrados: ${Object.keys(screenshots).length}`);

console.log('\nCenarios:');
scenarios.forEach((s) => {
  const icon = s.status === 'passed' ? '✅' : s.status === 'failed' ? '❌' : '⚠️';
  console.log(`  ${icon} [${s.feature}] ${s.name}`);
});

// Generate HTML
const outputDir = path.dirname(REPORT_OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const html = generateHtml(scenarios, screenshots);
fs.writeFileSync(REPORT_OUTPUT_PATH, html);
console.log(`\nRelatorio HTML gerado: ${REPORT_OUTPUT_PATH}`);

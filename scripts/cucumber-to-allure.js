const fs = require('fs');
const path = require('path');

const cucumberReportPath = './allure-results/cucumber-report.json';

if (!fs.existsSync(cucumberReportPath)) {
  console.log('cucumber-report.json não encontrado');
  process.exit(0);
}

const cucumberReport = JSON.parse(fs.readFileSync(cucumberReportPath, 'utf8'));
const allureResultsDir = './allure-results';

if (!fs.existsSync(allureResultsDir)) {
  fs.mkdirSync(allureResultsDir, { recursive: true });
}

let scenarioIndex = 0;

cucumberReport.forEach((feature) => {
  feature.elements.forEach((scenario) => {
    const startTime = Date.now();
    const steps = scenario.steps
      .filter(s => s.keyword !== 'Before' && s.keyword !== 'After')
      .map((step, idx) => ({
        name: step.name,
        status: step.result.status,
        stage: 'finished',
        start: startTime + idx * 1000,
        stop: startTime + idx * 1000 + (step.result.duration || 0),
        duration: step.result.duration || 0,
      }));

    const allureResult = {
      uuid: `scenario-${scenarioIndex}`,
      historyId: `${feature.name}-${scenario.name}`.replace(/\s+/g, '-'),
      name: scenario.name,
      fullName: `${feature.name} - ${scenario.name}`,
      status: steps.every(s => s.status === 'passed') ? 'passed' : 'failed',
      stage: 'finished',
      start: startTime,
      stop: startTime + (scenario.steps.reduce((acc, s) => acc + (s.result.duration || 0), 0)),
      duration: scenario.steps.reduce((acc, s) => acc + (s.result.duration || 0), 0),
      description: scenario.description || '',
      labels: [
        { name: 'feature', value: feature.name },
        { name: 'suite', value: feature.name },
      ],
      steps,
    };

    fs.writeFileSync(
      path.join(allureResultsDir, `${scenarioIndex}-result.json`),
      JSON.stringify(allureResult, null, 2)
    );

    scenarioIndex++;
  });
});

console.log(`Convertidos ${scenarioIndex} cenários para Allure`);
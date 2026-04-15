const fs = require('fs');
const path = require('path');

try {
  const cucumberReportPath = './allure-results/cucumber-report.json';
  
  if (!fs.existsSync(cucumberReportPath)) {
    console.log('Arquivo cucumber-report.json não encontrado');
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
      const allureResult = {
        uuid: `scenario-${scenarioIndex}`,
        historyId: `${feature.name}-${scenario.name}`.replace(/\s+/g, '-'),
        name: scenario.name,
        fullName: `${feature.name} - ${scenario.name}`,
        status: scenario.steps.every(step => step.result.status === 'passed') ? 'passed' : 'failed',
        stage: 'finished',
        start: Date.now(),
        stop: Date.now() + 1000,
        duration: scenario.steps.reduce((acc, step) => acc + (step.result.duration || 0), 0),
        description: scenario.description || '',
        descriptionHtml: scenario.description || '',
        steps: scenario.steps
          .filter(step => step.keyword !== 'Before' && step.keyword !== 'After')
          .map((step, idx) => ({
            name: step.name,
            status: step.result.status,
            stage: 'finished',
            start: Date.now() + idx * 100,
            stop: Date.now() + idx * 100 + (step.result.duration || 0),
            duration: step.result.duration || 0,
          })),
        labels: [
          { name: 'feature', value: feature.name },
          { name: 'suite', value: feature.name },
          { name: 'severity', value: 'normal' },
        ],
      };

      const fileName = `${scenarioIndex}-result.json`;
      fs.writeFileSync(
        path.join(allureResultsDir, fileName),
        JSON.stringify(allureResult, null, 2)
      );

      scenarioIndex++;
    });
  });

  console.log(`Convertido ${scenarioIndex} cenários para Allure Results`);
} catch (error) {
  console.error('Erro ao converter:', error.message);
  process.exit(1);
}
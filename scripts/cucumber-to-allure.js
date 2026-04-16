const fs = require('fs');
const path = require('path');

console.log('Iniciando conversão de Cucumber para Allure...\n');

const cucumberReportPath = './allure-results/cucumber-report.json';

// VALIDAR SE ARQUIVO EXISTE
if (!fs.existsSync(cucumberReportPath)) {
  console.error(`Erro: Arquivo não encontrado: ${cucumberReportPath}`);
  console.error('\nDicas:');
  console.error('1. Verifique se cucumber.js está gerando JSON');
  console.error('2. Execute primeiro: npm run test:e2e');
  console.error('3. Confirme que existe: allure-results/cucumber-report.json\n');
  process.exit(1);
}

console.log(`Arquivo encontrado: ${cucumberReportPath}`);

// PARSEAR JSON
let cucumberReport;

try {
  const rawContent = fs.readFileSync(cucumberReportPath, 'utf8');
  console.log(`Tamanho do arquivo: ${rawContent.length} bytes`);
  
  cucumberReport = JSON.parse(rawContent);
  console.log(`JSON parseado com sucesso\n`);
} catch (error) {
  console.error('Erro ao fazer parse do JSON:');
  console.error(`${error.message}\n`);
  process.exit(1);
}

// VALIDAR ESTRUTURA DO JSON
if (!Array.isArray(cucumberReport)) {
  console.error(' Erro: cucumber-report.json não é um array');
  console.error(`Tipo recebido: ${typeof cucumberReport}`);
  console.error('Estrutura esperada: Array de features\n');
  process.exit(1);
}

console.log(` Features encontradas: ${cucumberReport.length}`);

// PREPARAR DIRETÓRIO DE SAÍDA
const allureResultsDir = './allure-results';

if (!fs.existsSync(allureResultsDir)) {
  fs.mkdirSync(allureResultsDir, { recursive: true });
  console.log(` Diretório criado: ${allureResultsDir}`);
} else {
  console.log(` Usando diretório: ${allureResultsDir}`);
}

// PROCESSAR CENÁRIOS
let scenarioIndex = 0;
let totalScenarios = 0;
let successCount = 0;
let errorCount = 0;
const errors = [];

console.log('\nProcessando cenários...\n');

cucumberReport.forEach((feature, featureIdx) => {
  // Validar feature
  if (!feature || typeof feature !== 'object') {
 const errorMsg = `Feature ${featureIdx}: Tipo inválido (${typeof feature})`;
 errors.push(errorMsg);
 console.error(` ${errorMsg}`);
 return;
  }

  const featureName = feature.name || `Feature ${featureIdx}`;
  
  // Validar elements/scenarios
  if (!feature.elements || !Array.isArray(feature.elements)) {
 console.warn(`  Feature "${featureName}": Nenhum cenário encontrado (elements não é array)`);
 return;
  }

  console.log(`Feature: ${featureName}`);
  console.log(`Cenários: ${feature.elements.length}`);

  feature.elements.forEach((scenario, scenarioIdx) => {
 try {
// Validar scenario
if (!scenario || typeof scenario !== 'object') {
  throw new Error(`Tipo inválido para scenario: ${typeof scenario}`);
}

totalScenarios++;

const scenarioName = scenario.name || `Scenario ${scenarioIdx}`;
const stepsList = scenario.steps || [];

if (!Array.isArray(stepsList)) {
  throw new Error('Steps não é um array');
}

// Processar steps
const steps = stepsList
  .filter(s => {
 // Validar step
 if (!s || typeof s !== 'object') return false;
 if (!s.keyword) return false;
 // Filtrar Before/After
 return s.keyword.trim() !== 'Before' && s.keyword.trim() !== 'After';
  })
  .map((step, idx) => {
 const stepResult = step.result || {};
 return {
name: step.name || 'Step sem nome',
status: stepResult.status || 'unknown',
stage: 'finished',
start: Date.now() + idx * 100,
stop: Date.now() + idx * 100 + (stepResult.duration || 0),
duration: stepResult.duration || 0,
 };
  });

// Calcular status do cenário
const scenarioStatus = steps.length > 0 
  ? (steps.every(s => s.status === 'passed') ? 'passed' : 'failed')
  : 'skipped';

// Calcular durações
const totalDuration = steps.reduce((acc, s) => acc + s.duration, 0);
const startTime = Date.now();
const stopTime = startTime + totalDuration;

// Criar resultado Allure
const allureResult = {
  uuid: `scenario-${scenarioIndex}`,
  historyId: `${featureName}-${scenarioName}`.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase(),
  name: scenarioName,
  fullName: `${featureName} - ${scenarioName}`,
  status: scenarioStatus,
  stage: 'finished',
  start: startTime,
  stop: stopTime,
  duration: totalDuration,
  description: scenario.description || '',
  descriptionHtml: scenario.description || '',
  labels: [
 { name: 'feature', value: featureName },
 { name: 'suite', value: featureName },
 { name: 'severity', value: 'normal' },
  ],
  steps: steps,
};

// Salvar arquivo
const fileName = `${scenarioIndex}-result.json`;
const filePath = path.join(allureResultsDir, fileName);

fs.writeFileSync(filePath, JSON.stringify(allureResult, null, 2));

// Log de sucesso
const statusEmoji = scenarioStatus === 'passed' ? 'yes' : 'no';
console.log(`${statusEmoji} ${scenarioName} [${steps.length} steps]`);

successCount++;
scenarioIndex++;

 } catch (error) {
errorCount++;
const errorMsg = `Scenario ${scenarioIdx}: ${error.message}`;
errors.push(errorMsg);
console.error(errorMsg);
 }
  });
});

// RELATÓRIO FINAL
console.log('\n' + '='.repeat(70));
console.log('RELATÓRIO DE CONVERSÃO');
console.log('='.repeat(70));

console.log(`\nEstatísticas:`);
console.log(`Total de cenários encontrados: ${totalScenarios}`);
console.log(`Cenários processados com sucesso: ${successCount}`);
console.log(`Cenários com erro: ${errorCount}`);
console.log(`Taxa de sucesso: ${totalScenarios > 0 ? ((successCount / totalScenarios) * 100).toFixed(2) : 0}%`);

console.log(`\n📁 Arquivos gerados:`);
console.log(`Diretório: ${allureResultsDir}/`);
console.log(`Quantidade: ${successCount} arquivo(s) JSON`);

// VALIDAÇÃO FINAL
if (successCount === 0) {
  console.error('\nFALHA: Nenhum cenário foi convertido!');
  console.error('\nPróximos passos:');
  console.error('1. Verifique o arquivo cucumber-report.json manualmente');
  console.error('2. Confirme que os testes E2E executaram e passaram');
  console.error('3. Verifique a estrutura do JSON com: cat allure-results/cucumber-report.json\n');
  process.exit(1);
}

if (errorCount > 0) {
  console.warn(`\nAVISO: ${errorCount} cenário(s) com erro durante o processamento`);
  if (errors.length > 0 && errors.length <= 5) {
 console.warn('\nErros encontrados:');
 errors.forEach(err => console.warn(`${err}`));
  }
}

console.log('\nSUCESSO: Conversão concluída!');
console.log('Próximo passo: npm run test:allure:generate\n');

if (errorCount > 0) {
  process.exit(1);
}

process.exit(0);
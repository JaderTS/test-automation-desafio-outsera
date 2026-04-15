const fs = require('fs');
const path = require('path');

const testResultsPath = './test-results/api-results.json';

console.log(`Procurando em: ${testResultsPath}`);

if (!fs.existsSync(testResultsPath)) {
  console.log(`Arquivo nao encontrado: ${testResultsPath}`);
  process.exit(0);
}

try {
  const fileContent = fs.readFileSync(testResultsPath, 'utf8');
  console.log(`Tamanho do arquivo: ${fileContent.length} bytes`);

  const results = JSON.parse(fileContent);
  
  const allureResultsDir = './allure-results';

  if (!fs.existsSync(allureResultsDir)) {
    fs.mkdirSync(allureResultsDir, { recursive: true });
  }

  let testIndex = 0;

  // Funcao recursiva para processar suites aninhadas
  function processSuites(suites, parentTitle = '') {
    suites.forEach((suite) => {
      const suiteTitle = suite.title;
      console.log(`Suite: ${suiteTitle}`);

      // Processar specs dentro desta suite
      if (suite.specs && suite.specs.length > 0) {
        console.log(`  Specs: ${suite.specs.length}`);
        
        suite.specs.forEach((spec) => {
          const specTitle = spec.title;
          
          if (!spec.tests || spec.tests.length === 0) {
            return;
          }

          spec.tests.forEach((test) => {
            if (!test.results || test.results.length === 0) {
              return;
            }

            test.results.forEach((result) => {
              try {
                const startTime = result.startTime 
                  ? new Date(result.startTime).getTime() 
                  : Date.now();
                
                const duration = result.duration || 0;
                const status = result.status === 'passed' ? 'passed' : 'failed';

                console.log(`    - ${specTitle}: ${status} (${duration}ms)`);

                const allureResult = {
                  uuid: `api-test-${testIndex}`,
                  historyId: `${suiteTitle}::${specTitle}`.replace(/\s+/g, '-').toLowerCase(),
                  name: specTitle,
                  fullName: `${suiteTitle} :: ${specTitle}`,
                  status: status,
                  stage: 'finished',
                  start: startTime,
                  stop: startTime + duration,
                  duration: duration,
                  description: '',
                  labels: [
                    { name: 'suite', value: suiteTitle },
                    { name: 'type', value: 'api' },
                    { name: 'severity', value: 'normal' },
                  ],
                  steps: [
                    {
                      name: specTitle,
                      status: status,
                      stage: 'finished',
                      start: startTime,
                      stop: startTime + duration,
                      duration: duration,
                    },
                  ],
                  attachments: result.attachments || [],
                };

                fs.writeFileSync(
                  path.join(allureResultsDir, `api-${testIndex}-result.json`),
                  JSON.stringify(allureResult, null, 2)
                );

                testIndex++;
              } catch (err) {
                console.error(`Erro processando: ${err.message}`);
              }
            });
          });
        });
      }

      // Processar suites aninhadas recursivamente
      if (suite.suites && suite.suites.length > 0) {
        processSuites(suite.suites, suiteTitle);
      }
    });
  }

  if (!results.suites || results.suites.length === 0) {
    console.log(`Nenhuma suite encontrada`);
    process.exit(0);
  }

  processSuites(results.suites);

  console.log(`\nConvertidos ${testIndex} testes de API para Allure`);
  
  if (testIndex === 0) {
    console.warn(`AVISO: Nenhum teste foi convertido!`);
  }
} catch (error) {
  console.error(`Erro ao converter: ${error.message}`);
  process.exit(1);
}
# Arquitetura do Projeto

Este documento descreve a arquitetura e as decisoes tecnicas do projeto de automacao de testes.

---

## Visao Geral

O projeto esta organizado em tres pilares de teste, cada um com sua propria estrutura e ferramentas:

```
Testes de API (Playwright + Axios + Rest Assured)
    |
    v
Testes E2E (Cucumber + Playwright)
    |
    v
Testes de Carga (K6)
    |
    v
Relatorios (HTML + Allure)
    |
    v
GitHub Pages (publicacao automatica)
```

---

## Testes de API

**Diretorio:** `tests/api/`

### Estrutura

```
tests/api/
├── endpoints/
│   ├── posts.spec.ts       # 16 testes (GET, POST, PUT, DELETE)
│   ├── users.spec.ts       # 19 testes (CRUD completo)
│   ├── comments.spec.ts    # Testes de comentarios
│   └── todos.spec.ts       # Testes de tarefas
├── support/
│   ├── api.client.ts        # Cliente HTTP com Axios
│   └── test.fixtures.ts     # Fixtures do Playwright
└── rest-assured-api-tests.js  # Testes REST Assured (Node.js + Axios)
```

### Decisoes Tecnicas

- **Playwright como runner:** Aproveitamos o Playwright como framework de teste mesmo para API, usando suas capacidades de assertion, paralelismo e report.

- **Axios como cliente HTTP:** O Axios fornece uma interface simples e robusta para chamadas HTTP, com suporte a interceptors e configuracao de timeout.

- **Cliente API reutilizavel:** A classe `ApiClient` encapsula todas as chamadas HTTP com tratamento de erros padronizado e logging. A opcao `validateStatus: () => true` permite capturar respostas de erro sem lancar excecoes, facilitando testes negativos.

- **Fixtures do Playwright:** Os testes usam fixtures para injetar uma instancia do `ApiClient` automaticamente, mantendo os testes limpos.

- **Rest Assured (Node.js):** Testes de API standalone usando Axios diretamente, equivalente ao Rest Assured do Java. Permite execucao independente do Playwright com validacao de status codes, headers e corpo de resposta.

### Cobertura de Cenarios

Cada endpoint possui:
- Testes positivos (resposta correta com dados validos)
- Testes negativos (IDs inexistentes, payloads vazios, dados invalidos)
- Validacao de status code, headers e corpo da resposta

---

## Testes E2E

**Diretorio:** `tests/e2e/`

### Estrutura

```
tests/e2e/
├── features/                              # Arquivos .feature em Gherkin
│   ├── login.feature                      # Fluxos de login e logout
│   ├── login-negative.feature             # Cenarios negativos de login
│   ├── cart.feature                        # Adicionar/remover produtos
│   ├── checkout.feature                   # Finalizar compra
│   ├── checkout-negative.feature          # Cenarios negativos de checkout
│   └── checkout-negative-scenarios.feature # Cenarios negativos com evidencias
├── pages/                                 # Page Objects
│   ├── LoginPage.ts                       # Pagina de login
│   ├── InventoryPage.ts                   # Pagina de produtos
│   ├── CartPage.ts                        # Pagina do carrinho
│   └── CheckoutPage.ts                    # Pagina de checkout
├── steps/                                 # Step definitions do Cucumber (TypeScript)
│   ├── login.steps.ts
│   ├── login-negative-steps.ts
│   ├── cart.steps.ts
│   ├── checkout.steps.ts
│   ├── checkout-negative-steps.ts
│   └── common.steps.ts
├── step_definitions/                      # Step definitions adicionais (JavaScript)
│   └── checkout-negative.steps.js         # Cenarios negativos com captura de screenshots
└── support/
    ├── env.ts                             # Variaveis de ambiente
    ├── hooks.ts                           # Hooks do Cucumber (Before/After)
    ├── world.ts                           # World do Cucumber
    └── allure.ts                          # Integracao com Allure
```

### Decisoes Tecnicas

- **Page Object Pattern:** Cada pagina da aplicacao tem uma classe dedicada que encapsula os seletores e acoes. Isso facilita manutencao - se um seletor mudar, so precisa atualizar em um lugar.

- **Cucumber (BDD):** Os cenarios sao escritos em linguagem natural (Gherkin), permitindo que qualquer pessoa entenda o que esta sendo testado. Os step definitions fazem a ponte entre o texto e o codigo.

- **Playwright como motor de browser:** O Playwright controla o navegador (Chromium) por baixo do Cucumber, executando as acoes definidas nos steps.

- **Hooks (Before/After):** Os hooks garantem que cada cenario comeca com o navegador aberto e termina com a limpeza de recursos. Screenshots sao capturadas automaticamente em caso de falha.

- **Captura de screenshots em cada passo:** Os step definitions em `step_definitions/` capturam screenshots em cada passo do cenario, gerando evidencias visuais completas.

- **Variaveis de ambiente:** Credenciais e URLs sao carregadas do `.env`, mantendo dados sensiveis fora do codigo.

### Fluxos Testados

- **Login:** Cenarios de sucesso, erro de credenciais, campos vazios e logout
- **Login Negativo:** Senha incorreta, usuario inexistente, campo usuario vazio, campo senha vazio (com validacao de mensagens de erro)
- **Carrinho:** Adicionar produto, remover, visualizar detalhes, multiplos itens
- **Checkout:** Fluxo completo, validacao de campos obrigatorios
- **Checkout Negativo:** Sem primeiro nome, sem sobrenome, sem CEP, todos os campos vazios (com validacao de mensagens de erro e captura de screenshots)

---

## Testes de Carga

**Diretorio:** `tests/load/`

### Estrutura

```
tests/load/
├── api-load-test.js        # Script K6 basico
└── api-load-test-500vu.js  # Teste de carga 500 VUs (7 endpoints)
```

### Decisoes Tecnicas

- **K6:** Ferramenta de performance testing que permite definir cenarios de carga de forma programatica em JavaScript.

- **Estagios de carga:** O teste simula um cenario realista com ramp-up gradual ate 500 usuarios, sustentacao da carga e ramp-down controlado.

- **Thresholds:** Limites automaticos de performance (p95 abaixo de 500ms, taxa de erro abaixo de 0.1%) que determinam se o teste passou ou falhou.

- **handleSummary:** O K6 exporta um resumo estruturado em JSON ao final da execucao, que e utilizado pelo script de conversao para gerar o resultado no formato Allure.

### Configuracao dos Estagios (500 VUs)

| Estagio | Duracao | Usuarios |
|---|---|---|
| Ramp-up | 1min | 0 a 500 |
| Sustentacao | 3min | 500 |
| Ramp-down | 1min | 500 a 0 |

---

## Scripts e Relatorios

**Diretorio:** `scripts/`

### Scripts de Conversao (Allure)

- **playwright-api-to-allure.js** - Le o JSON gerado pelo Playwright (`test-results/api-results.json`) e cria arquivos Allure individuais para cada teste. Navega a estrutura `suites > specs > tests > results` do Playwright.

- **k6-to-allure.js** - Le o JSON de sumario do K6 (`test-results/load-test-results.json`) e cria um resultado Allure com os checks e metricas HTTP como steps.

- **cucumber-to-allure.js** - Le o JSON do Cucumber (`allure-results/cucumber-report.json`) e converte cada cenario em um resultado Allure com os steps correspondentes.

### Analisadores de Relatorio (HTML)

- **k6-report-analyzer.js** - Le resultados do K6 e gera relatorio HTML profissional com graficos de latencia (Avg, P90, P95, P99), grafico de taxa de erro, grafico de throughput, analise de gargalos e recomendacoes de otimizacao. Saida: `test-results/load-test-report.html`.

- **e2e-report-analyzer.js** - Le resultados do Cucumber e gera relatorio HTML com resultado de cada cenario, screenshots de cada passo, testes positivos e negativos, falhas esperadas e evidencias visuais. Saida: `test-results/e2e-report.html`.

---

## CI/CD

**Arquivo:** `.github/workflows/test.yml`

### Fluxo do Pipeline

```
Push/PR
  |
  v
Setup (Node.js, K6, Playwright)
  |
  v
Testes API --> Conversao Allure
  |
  v
Testes Carga --> Conversao Allure
  |
  v
Testes E2E --> Conversao Allure
  |
  v
Geracao do Allure Report
  |
  v
Deploy GitHub Pages (apenas main)
  |
  v
Comentario no PR (apenas PRs)
```

### Configuracao

- **Runner:** Ubuntu latest
- **Node.js:** 18.x
- **K6:** Instalado via `grafana/setup-k6-action@v1`
- **Playwright:** Navegadores instalados com `--with-deps`
- **continue-on-error:** Cada etapa de teste permite falha sem bloquear as demais etapas
- **Allure Report:** Gerado e publicado no GitHub Pages automaticamente

---

## Configuracoes

### playwright-api.config.ts

Configuracao dedicada para testes de API:
- Gera relatorio JSON em `test-results/api-results.json`
- Timeout de 30 segundos por teste
- Retry de 1 tentativa no CI

### cucumber.js

Configuracao do Cucumber:
- Gera relatorio JSON em `allure-results/cucumber-report.json`
- Carrega step definitions de `tests/e2e/steps/` e `tests/e2e/step_definitions/`
- Carrega suporte de `tests/e2e/support/`

### tsconfig.json

Configuracao do TypeScript:
- Target ES2020 com CommonJS
- Modo strict ativado
- Resolve JSON modules

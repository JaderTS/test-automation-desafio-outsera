# Arquitetura do Projeto

Este documento descreve a arquitetura e as decisoes tecnicas do projeto de automacao de testes.

---

## Visao Geral

```text
┌─────────────────────────────────────────────────────────┐
│                 TESTES ISOLADOS E AGENDADOS             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ API Tests Scheduled              E2E Tests Scheduled    │
│ (8 AM UTC) ~5-10 min             (12 PM UTC) ~15-20 min │
│                                                         │
│        v                               v                │
│ Playwright (request fixture)   Cucumber + Playwright    │
│ Page Objects                   BDD + Scenario Outline   │
│                                                         │
│ Load Tests Scheduled            Fast Tests (PR/Push)    │
│ (3 PM UTC) ~20-30 min           ~2-3 min                │
│                                                         │
│        v                               v                │
│ K6 (500 VUs, 7 endpoints)       API Tests + Comentario  │
├─────────────────────────────────────────────────────────┤
│                 CONVERSAO E PUBLICACAO                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Allure Report (Unificado ou Isolado)                    │
│        |                                                │
│        v                                                │
│ GitHub Pages (/api-tests, /e2e-tests, /load-tests)      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Testes de API

**Diretorio:** `tests/api/`

### Estrutura

```text
tests/api/
└── endpoints/
    ├── posts.spec.ts       # CRUD de posts (GET, POST, PUT, DELETE)
    ├── users.spec.ts       # CRUD de usuarios
    ├── comments.spec.ts    # Testes de comentarios
    └── todos.spec.ts       # Testes de tarefas
```

### Decisoes Tecnicas

- **Playwright como runner:** Aproveitamos o Playwright como framework de teste mesmo para API, usando suas capacidades de assertion, paralelismo e report.
- **`request` fixture nativo:** Todos os testes usam o fixture `request` do proprio Playwright para chamadas HTTP, mantendo um unico modelo de teste sem dependencias externas.

### Cobertura de Cenarios

Cada endpoint possui:
- Testes positivos (resposta correta com dados validos)
- Testes negativos (IDs inexistentes, payloads invalidos)
- Validacao de status code, headers e corpo da resposta

### Execucao

- **Localmente:** `npm run test:api`
- **Agendada:** Workflow `api-scheduled.yml` dispara diariamente as 8 AM UTC
- **Em PR:** Workflow `fast-tests-on-pr.yml` executa versao rapida

---

## Testes E2E

**Diretorio:** `tests/e2e/`

### Estrutura

```text
tests/e2e/
├── features/                   # Arquivos .feature em Gherkin
│   ├── login.feature           # Login, logout e cenarios negativos
│   ├── cart.feature            # Adicionar/remover produtos
│   └── checkout.feature        # Finalizar compra e cenarios negativos
├── pages/                      # Page Objects
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── steps/                      # Step definitions do Cucumber (TypeScript)
│   ├── login.steps.ts
│   ├── cart.steps.ts
│   ├── checkout.steps.ts
│   └── common.steps.ts
└── support/
    ├── env.ts
    ├── hooks.ts
    └── world.ts
```

### Decisoes Tecnicas

- **Page Object Pattern:** Cada pagina tem uma classe dedicada que encapsula seletores e acoes. Os steps nunca referenciam seletores diretamente.
- **Cucumber (BDD):** Cenarios escritos em Gherkin, acessiveis a qualquer pessoa da equipe. Os step definitions fazem a ponte entre texto e codigo.
- **Scenario Outline:** Cenarios negativos de login e checkout usam `Scenario Outline + Examples`, eliminando arquivos duplicados e concentrando variacoes em uma unica tabela de dados.
- **Playwright como motor de browser:** Controla o navegador (Chromium) por baixo do Cucumber.
- **Hooks (Before/After):** O hook Before abre o browser; o hook After captura screenshot em caso de falha e fecha o browser. A responsabilidade de screenshot esta centralizada nos hooks, nao nos steps.
- **Variaveis de ambiente:** Credenciais e URLs carregadas do `.env`.

### Fluxos Testados

- **Login:** sucesso, logout e cenarios negativos (senha incorreta, usuario inexistente, campos vazios) com validacao de mensagem especifica
- **Carrinho:** adicionar produto, remover, visualizar detalhes, multiplos itens
- **Checkout:** fluxo completo e cenarios negativos (sem primeiro nome, sem sobrenome, sem CEP, todos os campos vazios) com validacao de mensagem especifica

### Execucao

- **Localmente:** `npm run test:e2e`
- **Agendada:** Workflow `e2e-scheduled.yml` dispara diariamente as 12 PM UTC
- **Em PR:** Workflow `fast-tests-on-pr.yml` comenta resultado no PR

---

## Testes de Carga

**Diretorio:** `tests/load/`

### Estrutura

```text
tests/load/
└── api-load-test-500vu.js  # Teste de carga 500 VUs (7 endpoints)
```

### Decisoes Tecnicas

- **K6:** Ferramenta de performance testing programatica em JavaScript. Suporta testes distribuidos e coleta de metricas detalhadas.
- **Estagios de carga:** Simula cenario realista com ramp-up gradual, sustentacao e ramp-down controlado.
- **Thresholds:** Limites automaticos (P95 < 500ms, P99 < 1000ms, erro < 1%) que determinam pass/fail do teste.
- **handleSummary:** K6 exporta JSON ao final da execucao, usado pelo script de conversao para gerar resultado no formato Allure.
- **7 endpoints testados:** `GET /posts`, `GET /posts?userId=1`, `GET /posts/:id`, `POST /posts`, `GET /users`, `GET /comments`, `GET /todos`

### Configuracao dos Estagios (500 VUs)

| Estagio | Duracao | Usuarios | Proposito |
|---|---|---|---|
| Ramp-up | 1min | 0 a 500 | Aumento gradual de carga |
| Sustentacao | 3min | 500 | Teste de estresse |
| Ramp-down | 1min | 500 a 0 | Reducao controlada |

### Execucao

- **Localmente:** `npm run test:load`
- **Agendada:** Workflow `load-tests-scheduled.yml` dispara diariamente as 3 PM UTC
- **Com relatorio HTML:** `npm run test:load:full`

---

## Scripts e Relatorios

**Diretorio:** `scripts/`

### Scripts de Conversao (Allure)

- **playwright-api-to-allure.js** - Le o JSON gerado pelo Playwright (`test-results/api-results.json`) e cria arquivos Allure individuais para cada teste. Navega a estrutura `suites > specs > tests`.
- **k6-to-allure.js** - Le o JSON de sumario do K6 e cria um resultado Allure com checks e metricas HTTP como steps.
- **cucumber-to-allure.js** - Le o JSON do Cucumber e converte cada cenario em um resultado Allure com steps e screenshots como attachments.

### Analisadores de Relatorio (HTML)

- **k6-report-analyzer.js** - Gera relatorio HTML com graficos de latencia (Avg, P90, P95, P99), taxa de erro, throughput, gargalos identificados e recomendacoes. Saida: `test-results/load-test-report.html`.
- **e2e-report-analyzer.js** - Gera relatorio HTML com resultado de cada cenario, screenshots de falha e evidencias. Saida: `test-results/e2e-report.html`.

---

## CI/CD: Workflows Profissionais

### 1. Fast Tests on PR (`fast-tests-on-pr.yml`)

**Quando executa:** Push em `develop` ou Pull Request para `main/develop`

**O que executa:** Testes de API (Playwright) — ~2-3 minutos

**Saida:** Comenta no PR com resultado dos testes

---

### 2. API Tests Scheduled (`api-scheduled.yml`)

**Quando executa:** Diariamente as 8:00 AM UTC

**O que executa:** Playwright API Tests — ~5-10 minutos

**Saida:** Allure Report em `/api-tests/` no GitHub Pages

---

### 3. E2E Tests Scheduled (`e2e-scheduled.yml`)

**Quando executa:** Diariamente as 12:00 PM UTC

**O que executa:** Cucumber + Playwright (cenarios positivos e negativos) — ~15-20 minutos

**Saida:** Allure Report em `/e2e-tests/` no GitHub Pages

---

### 4. Load Tests Scheduled (`load-tests-scheduled.yml`)

**Quando executa:** Diariamente as 3:00 PM UTC

**O que executa:** K6 com 500 VUs, 7 endpoints — ~20-30 minutos

**Saida:** Allure Report em `/load-tests/` no GitHub Pages

---

## Pipeline Detalhado

### Fast Tests on PR

```text
Setup Node.js → npm install → Playwright browsers → npm run test:api → Comenta no PR
```

### API Tests Scheduled

```text
Setup Node.js → npm install → Playwright browsers → npm run test:api
  → npm run playwright:api:convert → npm run test:allure:generate
  → Deploy em /api-tests/ no GitHub Pages
```

### E2E Tests Scheduled

```text
Setup Node.js → npm install → Playwright browsers → npm run test:e2e
  → npm run test:allure:convert → npm run test:allure:generate
  → Deploy em /e2e-tests/ no GitHub Pages
```

### Load Tests Scheduled

```text
Setup Node.js → npm install → Instalar K6 → npm run test:load
  → npm run k6:convert → npm run test:allure:generate
  → Deploy em /load-tests/ no GitHub Pages
```

---

## Configuracao de Timezone

| Horario Sao Paulo | UTC | Cron |
|---|---|---|
| 8:00 AM | 11:00 PM (dia anterior) | `0 23 * * *` |
| 12:00 PM | 3:00 PM | `0 15 * * *` |
| 3:00 PM | 6:00 PM | `0 18 * * *` |

---

## Configuracoes

### `playwright-api.config.ts`

- Gera relatorio JSON em `test-results/api-results.json`
- Timeout de 30 segundos por teste
- Retry de 1 tentativa no CI
- Roda em paralelo com workers

### `playwright.config.ts`

- Roda 1 worker de cada vez (E2E requer browser aberto)
- Timeout de 60 segundos por teste

### `cucumber.js`

- Gera relatorio JSON em `allure-results/cucumber-report.json`
- Carrega step definitions de `tests/e2e/steps/`
- Carrega suporte de `tests/e2e/support/`

### `tsconfig.json`

- Target ES2020 com CommonJS
- Modo strict ativado
- Resolve JSON modules
- Source maps para debugging

---

## Stack Tecnologico

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework API | Playwright | Setup unico, fixture request nativo |
| BDD/E2E | Cucumber + Playwright | Testes legiveis, automacao de browser |
| Performance | K6 | Load testing a nivel de protocolo, JavaScript |
| Relatorios | Allure | Unificado, visual, com historico |
| CI/CD | GitHub Actions | Nativo, sem custos adicionais |
| Linguagem | TypeScript | Type safety em toda a suite |

---

## Boas Praticas

### Testes de API
- Um arquivo por recurso (`posts.spec.ts`, `users.spec.ts`)
- Testes positivos e negativos para cada endpoint
- Validar status code, headers e corpo da resposta
- Usar o fixture `request` nativo do Playwright para chamadas HTTP

### Testes E2E
- Uma feature por fluxo de usuario
- Page Objects para cada pagina — nenhum seletor nos steps
- Scenario Outline para cenarios que variam apenas em entrada/saida
- Variaveis de ambiente para credenciais
- Screenshots centralizadas no hook After (somente em falha)

### Testes de Carga
- Thresholds realistas (P95 < 500ms, P99 < 1000ms)
- Ramp-up gradual (simula usuarios reais)
- Coletar metricas por endpoint
- Executar periodicamente (diariamente) para detectar degradacao

---

## Troubleshooting

### Workflow agendado nao dispara
- Verificar se o workflow esta ativo em Actions > Schedules
- Validar timezone da cron expression com o Crontab Guru
- Disparar manualmente: `gh workflow run api-scheduled.yml`

### Relatorios nao publicam no GitHub Pages
- Verificar se GitHub Pages esta ativado nas Settings
- Confirmar que a branch `gh-pages` foi criada
- Verificar permissoes de deploy

### Taxa de erro alta em Load Tests
- API JSONPlaceholder pode estar com rate limiting
- Usar mock server local: `npx json-server --watch mock-data/db.json`

### Testes E2E falham com timeout
- Aumentar timeout em `cucumber.js`
- Executar com `HEADLESS=false` para debug visual

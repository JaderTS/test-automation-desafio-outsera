# Arquitetura do Projeto

Este documento descreve a arquitetura e as decisões técnicas do projeto de automação de testes.

---

## Visão Geral

O projeto está organizado em três pilares de teste, cada um com sua própria estrutura e ferramentas, executados através de um pipeline CI/CD profissional e isolado:

```text
┌─────────────────────────────────────────────────────────┐
│                 TESTES ISOLADOS E AGENDADOS             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ API Tests Scheduled              E2E Tests Scheduled    │
│ (8 AM UTC)                       (12 PM UTC)            │
│ 5-10 minutos                     15-20 minutos          │
│                                                         │
│        v                               v                │
│ Playwright + Axios             Cucumber + Playwright    │
│ Rest Assured                   Page Objects             │
│                                                         │
│ Load Tests Scheduled            Fast Tests (on PR/Push) │
│ (3 PM UTC)                      2-3 minutos             │
│ 20-30 minutos                   Validação rápida        │
│                                                         │
│        v                               v                │
│ K6 (500 VUs)                    API Tests + Feedback    │
│ 7 endpoints                                             │
├─────────────────────────────────────────────────────────┤
│                 CONVERSÃO E PUBLICAÇÃO                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Allure Report (Unificado ou Isolado)                    │
│        |                                                │
│        v                                                │
│ GitHub Pages (Subdiretórios)                            │
│ /api-tests, /e2e-tests, /load-tests                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Testes de API

**Diretório:** `tests/api/`

### Estrutura

```text
tests/api/
├── endpoints/
│   ├── posts.spec.ts              # 16 testes (GET, POST, PUT, DELETE)
│   ├── users.spec.ts              # 19 testes (CRUD completo)
│   ├── comments.spec.ts           # Testes de comentários
│   └── todos.spec.ts              # Testes de tarefas
├── support/
│   ├── api.client.ts              # Cliente HTTP com Axios
│   └── test.fixtures.ts           # Fixtures do Playwright
└── rest-assured-api-tests.js      # Testes REST Assured (Node.js + Axios)
```

### Decisões Técnicas

- **Playwright como runner:** Aproveitamos o Playwright como framework de teste mesmo para API, usando suas capacidades de assertion, paralelismo e report.
- **Axios como cliente HTTP:** O Axios fornece uma interface simples e robusta para chamadas HTTP, com suporte a interceptors e configuração de timeout.
- **Cliente API reutilizável:** A classe `ApiClient` encapsula todas as chamadas HTTP com tratamento de erros padronizado e logging. A opção `validateStatus: () => true` permite capturar respostas com status code diferente de 2xx.
- **Fixtures do Playwright:** Os testes usam fixtures para injetar uma instância do `ApiClient` automaticamente, mantendo os testes limpos e reutilizáveis.
- **Rest Assured (Node.js):** Testes de API standalone usando Axios diretamente, equivalente ao Rest Assured do Java. Permite execução independente do Playwright com validação de status codes, headers e corpo da resposta.

### Cobertura de Cenários

Cada endpoint possui:
- Testes positivos (resposta correta com dados válidos)
- Testes negativos (IDs inexistentes, payloads vazios, dados inválidos)
- Validação de status code, headers e corpo da resposta
- Validação de estrutura JSON

### Execução

- **Localmente:** `npm run test:api` ou `npm run test:api:all`
- **Agendada:** Workflow `api-scheduled.yml` dispara diariamente as 8 AM UTC
- **Em PR:** Workflow `fast-tests-on-pr.yml` executa versão rápida

---

## Testes E2E

**Diretório:** `tests/e2e/`

### Estrutura

```text
tests/e2e/
├── features/                      # Arquivos .feature em Gherkin
│   ├── login.feature              # Fluxos de login e logout
│   ├── login-negative.feature     # Cenários negativos de login
│   ├── cart.feature               # Adicionar/remover produtos
│   ├── checkout.feature           # Finalizar compra
│   ├── checkout-negative.feature  # Cenários negativos de checkout
│   └── checkout-negative-scenarios.feature # Cenários negativos com evidências
├── pages/                         # Page Objects
│   ├── LoginPage.ts               # Página de login
│   ├── InventoryPage.ts           # Página de produtos
│   ├── CartPage.ts                # Página do carrinho
│   └── CheckoutPage.ts            # Página de checkout
├── steps/                         # Step definitions do Cucumber (TypeScript)
│   ├── login.steps.ts
│   ├── login-negative-steps.ts
│   ├── cart.steps.ts
│   ├── checkout.steps.ts
│   ├── checkout-negative-steps.ts
│   └── common.steps.ts
├── step_definitions/              # Step definitions adicionais (JavaScript)
│   └── checkout-negative.steps.js # Cenários negativos com captura de screenshots
└── support/
    ├── env.ts                     # Variáveis de ambiente
    ├── hooks.ts                   # Hooks do Cucumber (Before/After)
    ├── world.ts                   # World do Cucumber
    └── allure.ts                  # Integração com Allure
```

### Decisões Técnicas

- **Page Object Pattern:** Cada página da aplicação tem uma classe dedicada que encapsula os seletores e ações. Isso facilita manutenção - se um seletor mudar, só precisa atualizar em um lugar.
- **Cucumber (BDD):** Os cenários são escritos em linguagem natural (Gherkin), permitindo que qualquer pessoa entenda o que está sendo testado. Os step definitions fazem a ponte entre o texto e o código.
- **Playwright como motor de browser:** O Playwright controla o navegador (Chromium) por baixo do Cucumber, executando as ações definidas nos steps.
- **Hooks (Before/After):** Os hooks garantem que cada cenário começa com o navegador aberto e termina com a limpeza de recursos. Screenshots são capturadas automaticamente em caso de falha.
- **Captura de screenshots em cada passo:** Os step definitions em `step_definitions/` capturam screenshots em cada passo do cenário, gerando evidências visuais completas.
- **Variáveis de ambiente:** Credenciais e URLs são carregadas do `.env`, mantendo dados sensíveis fora do código.

### Fluxos Testados

- **Login:** Cenários de sucesso, erro de credenciais, campos vazios e logout
- **Login Negativo:** Senha incorreta, usuário inexistente, campo usuário vazio, campo senha vazio (com validação de mensagens de erro)
- **Carrinho:** Adicionar produto, remover, visualizar detalhes, múltiplos itens
- **Checkout:** Fluxo completo, validação de campos obrigatórios
- **Checkout Negativo:** Sem primeiro nome, sem sobrenome, sem CEP, todos os campos vazios (com validação de mensagens de erro e captura de screenshots)

### Execução

- **Localmente:** `npm run test:e2e` ou `npm run test:e2e:all`
- **Agendada:** Workflow `e2e-scheduled.yml` dispara diariamente as 12 PM UTC (15:00 Brasil)
- **Em PR:** Workflow `fast-tests-on-pr.yml` comenta resultado no PR

---

## Testes de Carga

**Diretório:** `tests/load/`

### Estrutura

```text
tests/load/
├── api-load-test.js         # Script K6 básico
└── api-load-test-500vu.js   # Teste de carga 500 VUs (7 endpoints)
```

### Decisões Técnicas

- **K6:** Ferramenta de performance testing que permite definir cenários de carga de forma programática em JavaScript. Suporta testes distribuídos e coleta de métricas detalhadas.
- **Estágios de carga:** O teste simula um cenário realista com ramp-up gradual até 500 usuários, sustentação da carga e ramp-down controlado.
- **Thresholds:** Limites automáticos de performance (p99 abaixo de 1000ms, taxa de erro abaixo de 1%) que determinam se o teste passou ou falhou.
- **handleSummary:** O K6 exporta um resumo estruturado em JSON ao final da execução, que é utilizado pelo script de conversão para gerar o resultado no formato Allure.
- **7 endpoints testados:** `GET /posts`, `GET /posts?userId=1`, `GET /posts/:id`, `POST /posts`, `GET /users`, `GET /comments`, `GET /todos`

### Configuração dos Estágios (500 VUs)

| Estágio | Duração | Usuários | Propósito |
|---|---|---|---|
| Ramp-up | 1min | 0 a 500 | Aumento gradual de carga |
| Sustentação | 3min | 500 | Teste de estresse |
| Ramp-down | 1min | 500 a 0 | Redução controlada |

### Métricas Coletadas

- **Latência:** Avg, P90, P95, P99 por endpoint
- **Taxa de erro:** % de requisições que falharam
- **Throughput:** Requisições por segundo
- **Connection time:** Tempo para estabelecer conexão
- **Time to first byte:** Tempo para primeira resposta

### Execução

- **Localmente:** `npm run test:load:500vu`
- **Agendada:** Workflow `load-tests-scheduled.yml` dispara diariamente as 3 PM UTC (18:00 Brasil)
- **Com relatório HTML:** `npm run test:load:full`

---

## Scripts e Relatórios

**Diretório:** `scripts/`

### Scripts de Conversão (Allure)

- **playwright-api-to-allure.js** - Lê o JSON gerado pelo Playwright (`test-results/api-results.json`) e cria arquivos Allure individuais para cada teste. Navega a estrutura `suites > specs > tests` e mapeia para o formato Allure com status, duração e attachments.
- **k6-to-allure.js** - Lê o JSON de sumário do K6 (`test-results/load-test-results.json`) e cria um resultado Allure com os checks e métricas HTTP como steps. Permite rastreabilidade de cada request no relatório visual.
- **cucumber-to-allure.js** - Lê o JSON do Cucumber (`allure-results/cucumber-report.json`) e converte cada cenário em um resultado Allure com os steps correspondentes. Captura screenshots como attachments.

### Analisadores de Relatório (HTML)

- **k6-report-analyzer.js** - Lê resultados do K6 e gera relatório HTML profissional com gráficos de latência (Avg, P90, P95, P99), gráfico de taxa de erro, gráfico de throughput, análise de gargalos identificados e recomendações de otimização.
- **e2e-report-analyzer.js** - Lê resultados do Cucumber e gera relatório HTML com resultado de cada cenário, screenshots de cada passo, testes positivos e negativos, falhas esperadas e evidências completas.

---

## CI/CD: Workflows Profissionais

A suite de automação possui **4 workflows separados** para execução profissional e isolada:

### 1. Fast Tests on PR (`fast-tests-on-pr.yml`)

**Quando executa:**
- Push em branch `develop`
- Pull Request para `main` ou `develop`

**O que executa:**
- Testes de API (Playwright)
- Tempo: ~2-3 minutos

**Propósito:**
- Validação rápida de código antes de merge
- Feedback imediato ao desenvolvedor

**Saída:**
- Comenta no PR com resultado dos testes
- Log detalhado em Actions

---

### 2. API Tests Scheduled (`api-scheduled.yml`)

**Quando executa:**
- Diariamente as 8:00 AM UTC
- Manual via `gh workflow run api-scheduled.yml`

**O que executa:**
- Playwright API Tests
- Rest Assured Tests (Node.js + Axios)
- Tempo: ~5-10 minutos

**Propósito:**
- Health check diário de endpoints de API
- Detecção de regressões

**Saída:**
- Allure Report em `/api-tests/` no GitHub Pages
- URL: `https://JaderTS.github.io/test-automation-desafio-outsera/api-tests/`

---

### 3. E2E Tests Scheduled (`e2e-scheduled.yml`)

**Quando executa:**
- Diariamente as 12:00 PM UTC
- Manual via `gh workflow run e2e-scheduled.yml`

**O que executa:**
- Cucumber + Playwright (fluxos completos)
- Cenários positivos e negativos
- Tempo: ~15-20 minutos

**Propósito:**
- Monitoramento de fluxos de usuário
- Validação de regras de negócio

**Saída:**
- Allure Report em `/e2e-tests/` no GitHub Pages
- URL: `https://JaderTS.github.io/test-automation-desafio-outsera/e2e-tests/`
- Screenshots de cada passo em caso de falha

---

### 4. Load Tests Scheduled (`load-tests-scheduled.yml`)

**Quando executa:**
- Diariamente as 3:00 PM UTC
- Manual via `gh workflow run load-tests-scheduled.yml`

**O que executa:**
- K6 com 500 VUs (usuários virtuais)
- 7 endpoints testados sob carga
- Tempo: ~20-30 minutos

**Propósito:**
- Monitoramento contínuo de performance
- Detecção de degradação de latência
- Detecção de rate limiting

**Saída:**
- Allure Report em `/load-tests/` no GitHub Pages
- URL: `https://JaderTS.github.io/test-automation-desafio-outsera/load-tests/`
- Gráficos de latência, throughput, taxa de erro

---

## Pipeline Detalhado

### Fast Tests on PR (a cada push/PR)

```text
Setup Node.js
  ↓
npm install
  ↓
Playwright browsers
  ↓
npm run test:api
  ↓
Comenta no PR
```

### API Tests Scheduled (diariamente 8 AM)

```text
Setup Node.js
  ↓
npm install
  ↓
Playwright browsers
  ↓
npm run test:api
  ↓
npm run test:api:rest
  ↓
npm run playwright:api:convert
  ↓
npm run test:allure:generate
  ↓
Deploy em /api-tests/ no GitHub Pages
```

### E2E Tests Scheduled (diariamente 12 PM)

```text
Setup Node.js
  ↓
npm install
  ↓
Playwright browsers
  ↓
npm run test:e2e
  ↓
npm run test:allure:convert
  ↓
npm run test:allure:generate
  ↓
Deploy em /e2e-tests/ no GitHub Pages
```

### Load Tests Scheduled (diariamente 3 PM)

```text
Setup Node.js
  ↓
npm install
  ↓
Instalar K6
  ↓
npm run test:load:500vu
  ↓
npm run k6:convert
  ↓
npm run test:allure:generate
  ↓
Deploy em /load-tests/ no GitHub Pages
```

---

## Configuração de Timezone

Os workflows usam **cron expressions em UTC**. Para ajustar para seu timezone:

### Conversão para Brasil (UTC-3)

| Horário São Paulo | UTC | Cron |
|---|---|---|
| 8:00 AM | 11:00 PM (dia anterior) | `0 11 * * *` |
| 12:00 PM (meio-dia) | 3:00 PM | `0 15 * * *` |
| 3:00 PM | 6:00 PM | `0 18 * * *` |

**Para ajustar:** edite `.github/workflows/[workflow].yml` e altere a linha `cron`.

Exemplo:

```yaml
schedule:
  - cron: '0 1 * * *'  # 10 AM São Paulo
```

Use o Crontab Guru para validar expressões cron.

### Executar workflows manualmente

```bash
# Via GitHub CLI
gh workflow run api-scheduled.yml
gh workflow run e2e-scheduled.yml
gh workflow run load-tests-scheduled.yml

# Via UI: Actions → Workflow → Run workflow
```

### Secrets configurados

| Secret | Descrição |
|---|---|
| BASE_URL | URL da aplicação E2E (Swag Labs) |
| VALID_USERNAME | Usuário para testes |
| VALID_PASSWORD | Senha para testes |
| INVALID_USERNAME | Usuário inválido (testes negativos) |
| INVALID_PASSWORD | Senha inválida (testes negativos) |
| FIRST_NAME | Primeiro nome (checkout) |
| LAST_NAME | Sobrenome (checkout) |
| ZIP_CODE | CEP (checkout) |
| HEADLESS | Modo headless do navegador |

---

## Relatórios e Publicação

### Allure Report Unificado

Combina resultados de todos os tipos de teste em uma única interface:

- Visão geral com % de testes passando
- Detalhe de cada suite e teste individual
- Tempo de execução por teste
- Logs e capturas de tela em caso de falha
- Histórico de execuções (quando executado repetidamente)
- Gráficos de tendência de performance

**URL:** `https://JaderTS.github.io/test-automation-desafio-outsera/`

### Relatórios Isolados (Subdiretórios)

Cada workflow publica seu relatório em um subdiretório do GitHub Pages:

- **API Tests:** `/api-tests/` - Allure Report dos testes de API
- **E2E Tests:** `/e2e-tests/` - Allure Report dos testes E2E
- **Load Tests:** `/load-tests/` - Allure Report dos testes de carga

Esta abordagem permite:
- Rastreabilidade de falhas por tipo de teste
- Análise isolada de cada componente
- Facilita debugging de problemas específicos

---

## Configurações

### `playwright-api.config.ts`

Configuração dedicada para testes de API:
- Gera relatório JSON em `test-results/api-results.json`
- Timeout de 30 segundos por teste
- Retry de 1 tentativa no CI
- Roda em paralelo com workers

### `playwright.config.ts`

Configuração para testes E2E:
- Roda 1 worker de cada vez (E2E requer browser aberto)
- Timeout de 60 segundos por teste
- Suporte a screenshots automáticas

### `cucumber.js`

Configuração do Cucumber:
- Gera relatório JSON em `allure-results/cucumber-report.json`
- Carrega step definitions de `tests/e2e/steps/` e `tests/e2e/step_definitions/`
- Carrega suporte de `tests/e2e/support/`
- Paralelização configurável

### `tsconfig.json`

Configuração do TypeScript:
- Target ES2020 com CommonJS
- Modo strict ativado
- Resolve JSON modules
- Source maps para debugging

---

## Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework API | Playwright + Axios | Setup único, flexibilidade HTTP |
| BDD/E2E | Cucumber + Playwright | Readable tests, browser automation |
| Performance | K6 | Protocol-level load testing, JavaScript |
| Relatórios | Allure | Unificado, visual, historiado |
| CI/CD | GitHub Actions | Nativo, sem custos adicionais |
| Linguagem | TypeScript (90%), JavaScript (10%) | Type safety + flexibilidade |

---

## Fluxo Recomendado de Desenvolvimento

```text
1. Escrever feature em .feature (Gherkin)
   ↓
2. Executar localmente: npm run test:e2e
   ↓
3. Implementar steps/pages até passar
   ↓
4. Push para develop
   ↓
5. Fast tests executam (2-3 min)
   ↓
6. Abre PR para main
   ↓
7. Code review + mais testes
   ↓
8. Merge para main
   ↓
9. Testes agendados executam (5-20 min cada)
   ↓
10. Relatórios publicam em GitHub Pages
```

---

## Boas Práticas

### Testes de API
- Um arquivo por recurso (`posts.spec.ts`, `users.spec.ts`)
- Testes positivos e negativos para cada endpoint
- Validar status code, headers e corpo
- Usar fixtures para injeção de dependências

### Testes E2E
- Uma feature por fluxo de usuário
- Page Objects para cada página
- Step definitions reutilizáveis
- Variáveis de ambiente para credenciais
- Screenshots em cada passo (negativos)

### Testes de Carga
- Thresholds realistas (não muito restritivos)
- Ramp-up gradual (simula usuários reais)
- Coletar métricas por endpoint
- Testar periodicidade (diária)

### Relatórios
- Nomes descritivos de testes
- Attachments de screenshots/logs
- Status correto (pass/fail)
- Duração razoável (< 5 min por teste unitário)

---

## Troubleshooting

### Workflow agendado não dispara
- Verificar se branch está protegida
- Validar timezone da cron expression no Crontab Guru
- Disparar manualmente: `gh workflow run api-scheduled.yml`

### Relatórios não publicam no GitHub Pages
- Verificar se GitHub Pages está ativado nas Settings
- Confirmar que branch `gh-pages` foi criada
- Verificar permissões de deploy

### Taxa de erro alta em Load Tests
- API JSONPlaceholder pode estar com rate limiting
- Usar mock server local: `npx json-server --watch mock-data/db.json`

### Testes E2E falham com timeout
- Aumentar timeout em `cucumber.js`
- Executar com `HEADLESS=false` para debug visual

---

## Métricas Recomendadas para Monitoramento

- **Taxa de sucesso:** manter acima de 95%
- **Tempo de execução:** API <10min, E2E <20min, Load <30min
- **P99 de latência:** manter abaixo de 1000ms
- **Taxa de erro em Load:** manter abaixo de 1%
- **Flakiness:** investigar testes que falham intermitentemente
- **Cobertura de testes:** manter acima de 80%
- **Performance trend:** monitorar degradação ao longo do tempo

---

## Como usar

1. Abra o arquivo `ARCHITECTURE.md` na raiz do repositório.
2. Copie todo o markdown acima.
3. Cole substituindo o conteúdo atual.
4. Salve o arquivo.
5. Comite e faça push:

```bash
git add ARCHITECTURE.md
git commit -m "docs: atualizar ARCHITECTURE.md com documentação completa de workflows"
git push origin main
```
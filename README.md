# Projeto de Automacao de Testes

Projeto completo de automacao de testes cobrindo API, E2E e Carga, com integracao CI/CD e relatorios unificados via Allure Report.

**Autor:** JaderTS
**Tecnologias principais:** Playwright, Cucumber, K6, GitHub Actions

---

## Sumario

1. [Descricao do Projeto](#descricao-do-projeto)
2. [Tecnologias e Versoes](#tecnologias-e-versoes)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Pre-requisitos](#pre-requisitos)
5. [Instalacao](#instalacao)
6. [Execucao dos Testes](#execucao-dos-testes)
7. [Relatorios](#relatorios)
8. [CI/CD](#cicd)
9. [Evidencias de Testes](#evidencias-de-testes)
10. [Troubleshooting](#troubleshooting)

---

## Descricao do Projeto

Este projeto implementa uma suite completa de testes automatizados dividida em tres categorias:

- **Testes de API** - Validacao de endpoints REST da API JSONPlaceholder utilizando Playwright com Axios. Cobre operacoes GET, POST, PUT e DELETE com cenarios positivos e negativos.

- **Testes E2E (End-to-End)** - Fluxos completos de usuario na aplicacao Swag Labs (SauceDemo) utilizando Cucumber com Playwright. Cobre login, carrinho de compras e checkout, com cenarios positivos e negativos via Scenario Outline.

- **Testes de Carga** - Teste de performance com K6 simulando ate 500 usuarios simultaneos contra a API JSONPlaceholder, com thresholds de tempo de resposta (P99 < 1000ms) e taxa de erro (< 1%).

---

## Tecnologias e Versoes

| Tecnologia | Versao | Uso |
|---|---|---|
| Node.js | >= 16.0.0 | Runtime |
| Playwright | ^1.48.0 | Testes de API e suporte E2E |
| Cucumber | ^9.6.0 | Testes E2E (BDD) |
| K6 | (instalado separadamente) | Testes de Carga |
| TypeScript | ^5.6.0 | Linguagem de desenvolvimento |
| Allure | ^2.38.1 | Geracao de relatorios |
| GitHub Actions | - | Pipeline CI/CD |

---

## Estrutura de Pastas

```text
test-automation-desafio/
├── .github/
│   └── workflows/
│       ├── test.yml                    # Pipeline CI/CD principal
│       ├── api-scheduled.yml           # Testes API agendados (diariamente)
│       ├── e2e-scheduled.yml           # Testes E2E agendados (diariamente)
│       ├── load-tests-scheduled.yml    # Testes de carga agendados (diariamente)
│       └── fast-tests-on-pr.yml        # Testes rapidos em PR/Push
├── tests/
│   ├── api/
│   │   ├── endpoints/                  # Testes de API por recurso
│   │   │   ├── posts.spec.ts           # CRUD de posts (GET, POST, PUT, DELETE)
│   │   │   ├── users.spec.ts           # CRUD de usuarios
│   │   │   ├── comments.spec.ts        # Endpoints de comentarios
│   │   │   └── todos.spec.ts           # Endpoints de tarefas
│   │   └── support/
│   │       ├── api.client.ts           # Cliente HTTP reutilizavel (Axios)
│   │       └── test.fixtures.ts        # Fixtures do Playwright para API
│   ├── e2e/
│   │   ├── features/                   # Cenarios BDD em Gherkin
│   │   │   ├── login.feature           # Login, logout e cenarios negativos
│   │   │   ├── cart.feature            # Adicionar/remover produtos
│   │   │   └── checkout.feature        # Finalizar compra e cenarios negativos
│   │   ├── pages/                      # Page Objects
│   │   │   ├── LoginPage.ts
│   │   │   ├── InventoryPage.ts
│   │   │   ├── CartPage.ts
│   │   │   └── CheckoutPage.ts
│   │   ├── steps/                      # Step definitions do Cucumber (TypeScript)
│   │   │   ├── login.steps.ts
│   │   │   ├── cart.steps.ts
│   │   │   ├── checkout.steps.ts
│   │   │   └── common.steps.ts
│   │   └── support/
│   │       ├── env.ts
│   │       ├── hooks.ts
│   │       └── world.ts
│   └── load/
│       ├── api-load-test.js            # Teste de carga basico com K6
│       └── api-load-test-500vu.js      # Teste de carga 500 VUs (7 endpoints)
├── scripts/
│   ├── playwright-api-to-allure.js
│   ├── k6-to-allure.js
│   ├── k6-report-analyzer.js
│   ├── e2e-report-analyzer.js
│   └── cucumber-to-allure.js
├── docs/
│   ├── ARCHITECTURE.md
│   ├── LOAD_TESTING.md
│   └── evidencias/
│       └── EVIDENCIAS.md
├── mock-data/
│   └── db.json
├── playwright-api.config.ts
├── playwright.config.ts
├── cucumber.js
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Pre-requisitos

- Node.js versao 16 ou superior
- npm versao 7 ou superior
- K6 instalado (para testes de carga)
- Java JDK (para Allure CLI, caso queira gerar relatorios localmente)

---

## Instalacao

1. Clonar o repositorio:

```bash
git clone https://github.com/JaderTS/test-automation-desafio-outsera.git
cd test-automation-desafio-outsera
```

2. Instalar dependencias:

```bash
npm install
```

3. Instalar navegadores do Playwright:

```bash
npx playwright install --with-deps
```

4. Configurar variaveis de ambiente:

```bash
cp .env.example .env
```

As variaveis principais sao:

| Variavel | Descricao | Valor padrao |
|---|---|---|
| BASE_URL | URL da aplicacao E2E (Swag Labs) | https://www.saucedemo.com |
| API_BASE_URL | URL da API para testes | https://jsonplaceholder.typicode.com |
| VALID_USERNAME | Usuario valido para login | standard_user |
| VALID_PASSWORD | Senha valida para login | secret_sauce |
| HEADLESS | Executar sem interface grafica | true |

5. Instalar K6 (para testes de carga):

No Ubuntu/Debian:

```bash
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6-stable-focal.list
sudo apt-get update && sudo apt-get install -y k6
```

No macOS:

```bash
brew install k6
```

---

## Execucao dos Testes

### Testes de API

Executa os testes de API contra a JSONPlaceholder usando Playwright:

```bash
npm run test:api
```

Endpoints testados:

- `GET /posts` - Listar posts, filtrar por userId, buscar por ID
- `POST /posts` - Criar post com dados validos e invalidos
- `PUT /posts/:id` - Atualizar post, atualizacao parcial
- `DELETE /posts/:id` - Remover post
- `GET /users` - Listar usuarios, buscar por ID, validar estrutura
- `GET /comments` - Listar comentarios, filtrar por postId
- `GET /todos` - Listar tarefas, buscar por ID

Cada endpoint possui testes positivos (resposta esperada) e negativos (IDs inexistentes, payloads invalidos).

### Testes E2E

Executa todos os testes end-to-end com Cucumber:

```bash
npm run test:e2e
```

Fluxos cobertos:

- **Login:** sucesso, logout e cenarios negativos (senha incorreta, usuario inexistente, campos vazios) com validacao de mensagem especifica via Scenario Outline
- **Carrinho:** visualizar detalhes, adicionar produto, remover produto, multiplos produtos
- **Checkout:** fluxo completo de compra e cenarios negativos (sem primeiro nome, sem sobrenome, sem CEP, todos os campos vazios) com validacao de mensagem especifica via Scenario Outline

### Testes de Carga - 500 VUs

Executa o teste de carga completo com 500 VUs e 7 endpoints:

```bash
npm run test:load:500vu
```

Apos a execucao, gere o relatorio HTML:

```bash
npm run test:load:report
```

Ou execute ambos em sequencia:

```bash
npm run test:load:full
```

Configuracao do teste:

- Ramp-up: 1 minuto ate 500 usuarios
- Sustentacao: 3 minutos com 500 usuarios
- Ramp-down: 1 minuto
- Endpoints testados: `GET /posts`, `GET /posts?userId=1`, `GET /posts/:id`, `POST /posts`, `GET /users`, `GET /comments`, `GET /todos`

Thresholds definidos:

- 95% das requisicoes abaixo de 500ms (P95)
- 99% das requisicoes abaixo de 1000ms (P99)
- Taxa de erro abaixo de 1%

Para mais detalhes, consulte `docs/LOAD_TESTING.md`.

### Executar Todos os Testes

```bash
npm run test:full
```

---

## Relatorios

### Relatorio de Testes de Carga (HTML)

```bash
npm run test:load:report
```

Gerado em `test-results/load-test-report.html`, inclui graficos de latencia (Avg, P90, P95, P99), taxa de erro, throughput, gargalos identificados e recomendacoes.

### Relatorio de Testes E2E (HTML)

```bash
npm run test:e2e:report
```

Gerado em `test-results/e2e-report.html`, inclui resultado de cada cenario com duracao dos steps e screenshots em caso de falha.

### Relatorio Allure

```bash
npm run test:allure:convert   # Converte resultados para formato Allure
npm run test:allure:generate  # Gera relatorio HTML
npm run test:allure:open      # Abre no navegador
```

### Relatorio Online

Os relatorios da branch `main` sao publicados automaticamente no GitHub Pages:

- Combinado: `https://JaderTS.github.io/test-automation-desafio-outsera/`
- API: `https://JaderTS.github.io/test-automation-desafio-outsera/api-tests/`
- E2E: `https://JaderTS.github.io/test-automation-desafio-outsera/e2e-tests/`
- Load Tests: `https://JaderTS.github.io/test-automation-desafio-outsera/load-tests/`

---

## Exemplos de Uso

### Exemplo 1: Executar testes de API

```bash
npm install
npm run test:api
```

### Exemplo 2: Executar testes E2E com relatorio

```bash
cp .env.example .env
npx playwright install --with-deps
npm run test:e2e
npm run test:e2e:report
```

### Exemplo 3: Teste de carga com relatorio completo

```bash
npm run test:load:full
# Relatorio em test-results/load-test-report.html
```

### Exemplo 4: Suite completa com todos os relatorios

```bash
npm run test:full
npm run test:load:report
npm run test:e2e:report
npm run test:allure:convert
npm run test:allure:generate
```

---

## CI/CD

### Workflows Disponiveis

#### 1. Testes Rapidos no PR/Push (`fast-tests-on-pr.yml`)

- Trigger: Push em `develop` ou Pull Request para `main/develop`
- Testes: API (Playwright) — ~2-3 minutos
- Saida: Comenta no PR com resultado dos testes

#### 2. Testes de API Agendados (`api-scheduled.yml`)

- Trigger: Diariamente as 8:00 AM UTC
- Testes: Playwright API Tests — ~5-10 minutos
- Saida: Allure Report em `/api-tests/` no GitHub Pages

#### 3. Testes E2E Agendados (`e2e-scheduled.yml`)

- Trigger: Diariamente as 12:00 PM UTC
- Testes: Cucumber + Playwright — ~15-20 minutos
- Saida: Allure Report em `/e2e-tests/` no GitHub Pages

#### 4. Testes de Carga Agendados (`load-tests-scheduled.yml`)

- Trigger: Diariamente as 3:00 PM UTC
- Testes: K6 com 500 VUs — ~20-30 minutos
- Saida: Allure Report em `/load-tests/` no GitHub Pages

### Configuracao de Timezone (UTC)

| Horario Sao Paulo | UTC | Cron |
|---|---|---|
| 8:00 AM | 11:00 PM (dia anterior) | `0 23 * * *` |
| 12:00 PM | 3:00 PM | `0 15 * * *` |
| 3:00 PM | 6:00 PM | `0 18 * * *` |

### Executar Workflows Manualmente

```bash
gh workflow run api-scheduled.yml
gh workflow run e2e-scheduled.yml
gh workflow run load-tests-scheduled.yml
gh workflow run fast-tests-on-pr.yml
```

### Secrets Necessarios

| Secret | Descricao |
|---|---|
| BASE_URL | URL da aplicacao E2E |
| VALID_USERNAME | Usuario valido |
| VALID_PASSWORD | Senha valida |
| INVALID_USERNAME | Usuario invalido (testes negativos) |
| INVALID_PASSWORD | Senha invalida (testes negativos) |
| FIRST_NAME | Primeiro nome (checkout) |
| LAST_NAME | Sobrenome (checkout) |
| ZIP_CODE | CEP (checkout) |
| HEADLESS | Modo headless do navegador |

---

## Evidencias de Testes

- **Allure Report** - Resultado individual de cada teste, tempo de execucao e screenshots em caso de falha. Publicado automaticamente no GitHub Pages.
- **CI/CD Logs** - Logs detalhados de cada execucao na aba Actions do repositorio.
- **Relatorios HTML** - Relatorios visuais gerados em `test-results/` para E2E e testes de carga.
- **Documentacao** - Registro em `docs/evidencias/EVIDENCIAS.md`.

---

## Scripts Disponiveis

| Script | Descricao |
|---|---|
| `npm run test:api` | Executa testes de API (Playwright) |
| `npm run test:e2e` | Executa todos os testes E2E com Cucumber |
| `npm run test:e2e:all` | Alias para test:e2e |
| `npm run test:e2e:report` | Gera relatorio HTML dos testes E2E |
| `npm run test:load` | Executa teste de carga basico com K6 |
| `npm run test:load:500vu` | Executa teste de carga 500 VUs (7 endpoints) |
| `npm run test:load:report` | Gera relatorio HTML do teste de carga |
| `npm run test:load:full` | Executa teste 500 VUs e gera relatorio |
| `npm run test:full` | Executa todos os testes (API + E2E + Carga) |
| `npm run playwright:api:convert` | Converte resultados API para Allure |
| `npm run k6:convert` | Converte resultados K6 para Allure |
| `npm run test:allure:convert` | Converte todos os resultados para Allure |
| `npm run test:allure:generate` | Gera relatorio Allure HTML |
| `npm run test:allure:open` | Abre relatorio Allure no navegador |
| `npm run format` | Formata codigo com Prettier |
| `npm run clean` | Remove pastas temporarias |

---

## Troubleshooting

### Erro: API JSONPlaceholder nao responde

Use o Mock Server local:

```bash
# Terminal 1
npx json-server --watch mock-data/db.json --port 3001

# Terminal 2
API_BASE_URL=http://localhost:3001 npm run test:api
```

### Erro: Playwright browsers nao instalados

```bash
npx playwright install --with-deps
```

### Erro: K6 nao encontrado

Instale o K6 conforme instrucoes na secao de Instalacao.

### Erro: Testes E2E falham com timeout

- Verifique se o `.env` esta configurado corretamente
- Aumente o timeout em `cucumber.js`
- Execute com `HEADLESS=false` para depurar visualmente

### Erro: Variaveis de ambiente nao encontradas

```bash
cp .env.example .env
# Editar .env com os valores corretos
```

### Erro: Rate limiting no teste de carga

```bash
npx json-server --watch mock-data/db.json --port 3001
k6 run tests/load/api-load-test-500vu.js --env BASE_URL=http://localhost:3001
```

### Erro: Allure Report nao gera

```bash
npm install -g allure-commandline
# ou
npx allure generate allure-results --clean -o allure-report
```

### Workflow agendado nao dispara

- Verifique se o workflow esta ativo em Actions > Schedules
- Valide a cron expression com o Crontab Guru
- Dispare manualmente: `gh workflow run api-scheduled.yml`

---

## Arquitetura

Para detalhes sobre a arquitetura do projeto, consulte `docs/ARCHITECTURE.md`.

---

## Como Contribuir

1. Fazer fork do repositorio
2. Criar uma branch: `git checkout -b feature/minha-feature`
3. Commitar: `git commit -m 'feat: adicionar minha feature'`
4. Push: `git push origin feature/minha-feature`
5. Abrir um Pull Request

---

## Licenca

MIT

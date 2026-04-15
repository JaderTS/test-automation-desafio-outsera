# Projeto de Automacao de Testes

Projeto completo de automacao de testes cobrindo API, E2E e Carga, com integracao CI/CD e relatorios unificados via Allure Report.

**Autor:** JaderTS
**Tecnologias principais:** Playwright, Cucumber, K6, Axios (Rest Assured), GitHub Actions

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

- **Testes de API** - Validacao de endpoints REST da API JSONPlaceholder utilizando Playwright com Axios e Rest Assured (Node.js). Cobre operacoes GET, POST, PUT e DELETE com cenarios positivos e negativos.

- **Testes E2E (End-to-End)** - Fluxos completos de usuario na aplicacao Swag Labs (SauceDemo) utilizando Cucumber com Playwright. Cobre login, carrinho de compras e checkout, incluindo cenarios positivos e negativos com validacao de mensagens de erro especificas e captura de screenshots em cada passo.

- **Testes de Carga** - Teste de performance com K6 simulando ate 500 usuarios simultaneos contra a API JSONPlaceholder, com thresholds de tempo de resposta (P99 < 1000ms) e taxa de erro (< 1%).

---

## Tecnologias e Versoes

| Tecnologia | Versao | Uso |
|---|---|---|
| Node.js | >= 16.0.0 | Runtime |
| Playwright | ^1.48.0 | Testes API e suporte E2E |
| Cucumber | ^9.6.0 | Testes E2E (BDD) |
| K6 | (instalado separadamente) | Testes de Carga |
| TypeScript | ^5.6.0 | Linguagem de desenvolvimento |
| Axios | ^1.15.0 | Cliente HTTP para testes de API (Rest Assured) |
| Allure | ^2.38.1 | Geracao de relatorios |
| GitHub Actions | - | Pipeline CI/CD |

---

## Estrutura de Pastas

```
test-automation-desafio/
├── .github/
│   └── workflows/
│       └── test.yml                          # Pipeline CI/CD (GitHub Actions)
├── tests/
│   ├── api/
│   │   ├── endpoints/                        # Testes de API por recurso
│   │   │   ├── posts.spec.ts                 # CRUD de posts (GET, POST, PUT, DELETE)
│   │   │   ├── users.spec.ts                 # CRUD de usuarios
│   │   │   ├── comments.spec.ts              # Endpoints de comentarios
│   │   │   └── todos.spec.ts                 # Endpoints de tarefas
│   │   ├── support/
│   │   │   ├── api.client.ts                 # Cliente HTTP reutilizavel (Axios)
│   │   │   └── test.fixtures.ts              # Fixtures do Playwright para API
│   │   └── rest-assured-api-tests.js         # Testes REST Assured (Node.js + Axios)
│   ├── e2e/
│   │   ├── features/                         # Cenarios BDD em Gherkin
│   │   │   ├── login.feature                 # Fluxos de login e logout
│   │   │   ├── login-negative.feature        # Cenarios negativos de login
│   │   │   ├── cart.feature                  # Adicionar/remover produtos
│   │   │   ├── checkout.feature              # Finalizar compra
│   │   │   ├── checkout-negative.feature     # Cenarios negativos de checkout
│   │   │   └── checkout-negative-scenarios.feature # Cenarios negativos com evidencias
│   │   ├── pages/                            # Page Objects
│   │   │   ├── LoginPage.ts                  # Pagina de login
│   │   │   ├── InventoryPage.ts              # Pagina de produtos
│   │   │   ├── CartPage.ts                   # Pagina do carrinho
│   │   │   └── CheckoutPage.ts               # Pagina de checkout
│   │   ├── steps/                            # Step definitions do Cucumber (TS)
│   │   │   ├── login.steps.ts
│   │   │   ├── login-negative-steps.ts
│   │   │   ├── cart.steps.ts
│   │   │   ├── checkout.steps.ts
│   │   │   ├── checkout-negative-steps.ts
│   │   │   └── common.steps.ts
│   │   ├── step_definitions/                 # Step definitions adicionais (JS)
│   │   │   └── checkout-negative.steps.js    # Cenarios negativos com screenshots
│   │   └── support/                          # Configuracoes do E2E
│   │       ├── env.ts                        # Variaveis de ambiente
│   │       ├── hooks.ts                      # Hooks do Cucumber (Before/After)
│   │       ├── world.ts                      # World do Cucumber
│   │       └── allure.ts                     # Integracao com Allure
│   └── load/
│       ├── api-load-test.js                  # Teste de carga com K6
│       └── api-load-test-500vu.js            # Teste de carga 500 VUs (7 endpoints)
├── scripts/
│   ├── playwright-api-to-allure.js           # Converte resultados API para Allure
│   ├── playwright-to-allure.js               # Converte resultados Playwright para Allure
│   ├── k6-to-allure.js                       # Converte resultados K6 para Allure
│   ├── k6-report-analyzer.js                 # Analisador de resultados K6 (HTML)
│   ├── e2e-report-analyzer.js                # Analisador de resultados E2E (HTML)
│   └── cucumber-to-allure.js                 # Converte resultados Cucumber para Allure
├── docs/
│   ├── ARCHITECTURE.md                       # Arquitetura detalhada do projeto
│   ├── LOAD_TESTING.md                       # Documentacao dos testes de carga
│   └── evidencias/
│       └── EVIDENCIAS.md                     # Registro de evidencias de testes
├── mock-data/
│   └── db.json                               # Dados mock de referencia (JSONPlaceholder)
├── playwright-api.config.ts                  # Config Playwright para testes de API
├── playwright.config.ts                      # Config Playwright para testes E2E
├── cucumber.js                               # Configuracao do Cucumber
├── tsconfig.json                             # Configuracao do TypeScript
├── package.json                              # Dependencias e scripts
├── .env.example                              # Exemplo de variaveis de ambiente
├── .gitignore                                # Arquivos ignorados pelo Git
├── README.md                                 # Documentacao principal
└── ARCHITECTURE.md                           # Detalhes da arquitetura (raiz)
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
git clone https://github.com/JaderTS/test-automation-desafio.git
cd test-automation-desafio
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

Editar o arquivo `.env` conforme necessario. As variaveis principais sao:

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

### Testes de API (Playwright)

Executa os testes de API contra a JSONPlaceholder usando Playwright:

```bash
npm run test:api
```

### Testes de API (Rest Assured - Node.js + Axios)

Executa os testes de API usando Axios (equivalente ao Rest Assured do Java):

```bash
npm run test:api:rest
```

### Todos os Testes de API

Executa ambos os conjuntos de testes de API (Playwright + Rest Assured):

```bash
npm run test:api:all
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

### Testes E2E Negativos

Executa apenas os cenarios negativos (login invalido, checkout com campos vazios):

```bash
npm run test:e2e:negative
```

### Todos os Testes E2E

```bash
npm run test:e2e:all
```

Fluxos cobertos:
- **Login:** login com sucesso, senha invalida, usuario inexistente, campos vazios, logout
- **Login Negativo:** senha incorreta com validacao de mensagem, usuario inexistente com validacao, campo usuario vazio, campo senha vazio
- **Carrinho:** visualizar detalhes, adicionar produto, remover produto, multiplos produtos
- **Checkout:** checkout com sucesso, nome vazio, CEP vazio
- **Checkout Negativo:** sem primeiro nome, sem sobrenome, sem CEP, todos os campos vazios - todos com validacao de mensagem de erro especifica e captura de screenshots em cada passo

### Testes de Carga

Executa o teste de performance com K6:

```bash
npm run test:load
```

Configuracao do teste:
- Ramp-up: 1 minuto ate 100 usuarios
- Subida: 1 minuto ate 500 usuarios simultaneos
- Sustentacao: 3 minutos com 500 usuarios
- Ramp-down: 1 minuto

Thresholds definidos:
- 99% das requisicoes abaixo de 1000ms (padrao de mercado para P99)
- Taxa de erro abaixo de 1%

Justificativa dos thresholds: O valor de 1000ms para P99 e o padrao recomendado pela industria para APIs publicas sob carga. Valores mais restritivos como 500ms podem causar falsos positivos em ambientes compartilhados ou com latencia variavel.

### Testes de Carga - 500 VUs (Expandido)

Executa o teste de carga completo com 500 VUs e 7 endpoints:

```bash
npm run test:load:500vu
```

Apos a execucao, gere o relatorio HTML com analise de gargalos:

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

Endpoints testados: GET /posts, GET /posts?userId=1, GET /posts/:id, POST /posts, GET /users, GET /comments, GET /todos

O relatorio HTML e gerado em `test-results/load-test-report.html` com graficos de latencia, taxa de erro, throughput, gargalos identificados e recomendacoes.

Para mais detalhes, consulte [docs/LOAD_TESTING.md](docs/LOAD_TESTING.md).

### Executar Todos os Testes

Para executar tudo de uma vez (API + E2E + Carga):

```bash
npm run test:full
```

Ou executar individualmente:

```bash
npm run test:api:all
npm run test:e2e:all
npm run test:load:full
```

---

## Relatorios

### Relatorio de Testes de Carga (HTML)

Gera relatorio HTML profissional com graficos de latencia, taxa de erro, throughput e analise de gargalos:

```bash
npm run test:load:report
```

O relatorio e gerado em `test-results/load-test-report.html` e inclui:
- Graficos de latencia (Avg, P90, P95, P99) por endpoint
- Grafico de taxa de erro
- Grafico de throughput (requisicoes/segundo)
- Analise detalhada de gargalos identificados
- Recomendacoes especificas de otimizacao

### Relatorio de Testes E2E (HTML)

Gera relatorio HTML com resultado detalhado de cada cenario E2E:

```bash
npm run test:e2e:report
```

O relatorio e gerado em `test-results/e2e-report.html` e inclui:
- Resultado de cada cenario (passed/failed)
- Detalhes de cada step com duracao
- Screenshots de evidencia
- Classificacao de testes positivos vs negativos
- Falhas esperadas em cenarios negativos

### Gerar Relatorio Allure

Apos executar os testes, converter os resultados e gerar o relatorio:

```bash
# Converter resultados para formato Allure
npm run test:allure:convert

# Gerar relatorio HTML
npm run test:allure:generate

# Abrir relatorio no navegador
npm run test:allure:open
```

O relatorio Allure unifica os resultados de todos os tipos de teste (API, E2E e Carga) em uma unica interface, com detalhes de cada teste, tempo de execucao e eventuais erros.

### Relatorio Online

O relatorio mais recente da branch main e publicado automaticamente no GitHub Pages:

https://JaderTS.github.io/test-automation-desafio/

---

## Exemplos de Uso

### Exemplo 1: Executar apenas testes de API

```bash
# Instalar dependencias
npm install

# Executar testes Playwright
npm run test:api

# Executar testes Rest Assured
npm run test:api:rest
```

### Exemplo 2: Executar testes E2E negativos com relatorio

```bash
# Configurar variaveis de ambiente
cp .env.example .env

# Instalar browsers
npx playwright install --with-deps

# Executar cenarios negativos
npm run test:e2e:negative

# Gerar relatorio HTML
npm run test:e2e:report
```

### Exemplo 3: Teste de carga com relatorio completo

```bash
# Executar teste de 500 VUs e gerar relatorio
npm run test:load:full

# O relatorio estara em test-results/load-test-report.html
```

### Exemplo 4: Suite completa com todos os relatorios

```bash
# Executar todos os testes
npm run test:full

# Gerar relatorios
npm run test:load:report
npm run test:e2e:report
npm run test:allure:convert
npm run test:allure:generate
```

---

## CI/CD

O pipeline de CI/CD esta configurado no GitHub Actions (`.github/workflows/test.yml`) e executa automaticamente em:

- Push na branch `main` ou `develop`
- Pull requests para a branch `main`

### Etapas do Pipeline

1. Setup do ambiente (Node.js 18, K6, Playwright)
2. Instalacao de dependencias
3. Execucao dos testes de API (Playwright)
4. Execucao dos testes de API (Rest Assured)
5. Conversao dos resultados de API para Allure
6. Execucao dos testes de carga (K6)
7. Conversao dos resultados de K6 para Allure
8. Execucao dos testes E2E (Cucumber)
9. Conversao dos resultados E2E para Allure
10. Geracao do Allure Report
11. Deploy do relatorio no GitHub Pages (apenas na main)
12. Comentario automatico no PR com link do relatorio

### Variaveis de Ambiente no CI

As credenciais e configuracoes sensiveis sao armazenadas como Secrets no GitHub:

- `BASE_URL` - URL da aplicacao de testes
- `VALID_USERNAME` / `VALID_PASSWORD` - Credenciais validas
- `INVALID_USERNAME` / `INVALID_PASSWORD` - Credenciais invalidas
- `FIRST_NAME` / `LAST_NAME` / `ZIP_CODE` - Dados de checkout
- `HEADLESS` - Modo de execucao do navegador

---

## Evidencias de Testes

As evidencias de execucao dos testes sao registradas de tres formas:

1. **Allure Report** - Relatorio completo com resultado individual de cada teste, tempo de execucao, logs e capturas de tela em caso de falha. Publicado automaticamente no GitHub Pages.

2. **CI/CD Logs** - Cada execucao do pipeline gera logs detalhados na aba Actions do repositorio, com o resultado de cada etapa.

3. **Documentacao de Evidencias** - Registro em `docs/evidencias/EVIDENCIAS.md` com descricao dos testes executados e seus resultados.

4. **Screenshots** - Os cenarios negativos de checkout capturam screenshots em cada passo, armazenados em `test-results/e2e-screenshots/`.

Para mais detalhes sobre as evidencias, consulte o arquivo [docs/evidencias/EVIDENCIAS.md](docs/evidencias/EVIDENCIAS.md).

---

## Scripts Disponiveis

| Script | Descricao |
|---|---|
| `npm run test:api` | Executa testes de API (Playwright) |
| `npm run test:api:rest` | Executa testes de API (Rest Assured / Axios) |
| `npm run test:api:all` | Executa todos os testes de API |
| `npm run test:e2e` | Executa testes E2E com Cucumber |
| `npm run test:e2e:negative` | Executa apenas cenarios negativos E2E |
| `npm run test:e2e:all` | Executa todos os testes E2E |
| `npm run test:e2e:report` | Gera relatorio HTML dos testes E2E |
| `npm run test:load` | Executa testes de carga com K6 |
| `npm run test:load:500vu` | Executa teste de carga 500 VUs (7 endpoints) |
| `npm run test:load:report` | Gera relatorio HTML do teste de carga |
| `npm run test:load:full` | Executa teste 500 VUs e gera relatorio |
| `npm run test:full` | Executa todos os testes (API + E2E + Carga) |
| `npm run playwright:api:convert` | Converte resultados API para Allure |
| `npm run k6:convert` | Converte resultados K6 para Allure |
| `npm run test:allure:convert` | Converte todos os resultados para Allure |
| `npm run test:allure:generate` | Gera relatorio Allure HTML |
| `npm run test:allure:open` | Abre relatorio no navegador |
| `npm run format` | Formata codigo com Prettier |
| `npm run clean` | Remove pastas temporarias |

---

## Troubleshooting

### Erro: API JSONPlaceholder nao responde

A API JSONPlaceholder e publica e gratuita. Em horarios de pico pode ficar instavel ou aplicar rate limiting.

**Solucao:** Use o Mock Server local:

```bash
# Terminal 1: Iniciar mock server
npx json-server --watch mock-data/db.json --port 3001

# Terminal 2: Executar testes apontando para o mock
API_BASE_URL=http://localhost:3001 npm run test:api
```

### Erro: Playwright browsers nao instalados

```
Error: browserType.launch: Executable doesn't exist
```

**Solucao:** Instale os navegadores:

```bash
npx playwright install --with-deps
```

### Erro: K6 nao encontrado

```
k6: command not found
```

**Solucao:** Instale o K6 conforme instrucoes na secao [Instalacao](#instalacao).

### Erro: Testes E2E falham com timeout

Pode ocorrer se a aplicacao SauceDemo estiver lenta ou se o navegador nao carregar a tempo.

**Solucao:**
1. Verifique se o `.env` esta configurado corretamente
2. Aumente o timeout no `cucumber.js` ou nos hooks
3. Execute com `HEADLESS=false` para depurar visualmente

### Erro: Variaveis de ambiente nao encontradas

```
Error: Variavel de ambiente nao encontrada: BASE_URL
```

**Solucao:** Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env
# Editar .env com os valores corretos
```

### Erro: Rate limiting no teste de carga (500 VUs)

Ao executar 500 VUs contra a API publica, o servidor pode bloquear conexoes.

**Solucao:** Use o Mock Server:

```bash
npx json-server --watch mock-data/db.json --port 3001
k6 run tests/load/api-load-test-500vu.js --env BASE_URL=http://localhost:3001
```

### Erro: Allure Report nao gera

```
allure: command not found
```

**Solucao:** Instale o Allure CLI:

```bash
npm install -g allure-commandline
```

Ou use via npx:

```bash
npx allure generate allure-results --clean -o allure-report
```

---

## Arquitetura

Para detalhes sobre a arquitetura do projeto, consulte:

- [ARCHITECTURE.md](ARCHITECTURE.md) - Visao geral da arquitetura
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Documentacao detalhada

---

## Como Contribuir

1. Fazer fork do repositorio
2. Criar uma branch para a feature: `git checkout -b feature/minha-feature`
3. Fazer commit das alteracoes: `git commit -m 'feat: adicionar minha feature'`
4. Fazer push para a branch: `git push origin feature/minha-feature`
5. Abrir um Pull Request

Ao abrir um PR, o pipeline de CI/CD executara todos os testes automaticamente e postara um comentario com o link do relatorio Allure.

---

## Licenca

MIT

# Arquitetura do Projeto

Este documento descreve a arquitetura e as decisoes tecnicas do projeto de automacao de testes.

---

## Visao Geral

O projeto esta organizado em tres pilares de teste, cada um com sua propria estrutura e ferramentas:

```
Testes de API (Playwright + Axios)
    |
    v
Testes E2E (Cucumber + Playwright)
    |
    v
Testes de Carga (K6)
    |
    v
Conversao para Allure (scripts Node.js)
    |
    v
Allure Report (relatorio unificado)
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
└── support/
    ├── api.client.ts        # Cliente HTTP com Axios
    └── test.fixtures.ts     # Fixtures do Playwright
```

### Decisoes Tecnicas

- **Playwright como runner:** Aproveitamos o Playwright como framework de teste mesmo para API, usando suas capacidades de assertion, paralelismo e report.

- **Axios como cliente HTTP:** O Axios fornece uma interface simples e robusta para chamadas HTTP, com suporte a interceptors e configuracao de timeout.

- **Cliente API reutilizavel:** A classe `ApiClient` encapsula todas as chamadas HTTP com tratamento de erros padronizado e logging. A opcao `validateStatus: () => true` permite capturar respostas de erro sem lancar excecoes, facilitando testes negativos.

- **Fixtures do Playwright:** Os testes usam fixtures para injetar uma instancia do `ApiClient` automaticamente, mantendo os testes limpos.

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
├── features/            # Arquivos .feature em Gherkin
│   ├── login.feature    # 5 cenarios
│   ├── cart.feature     # 4 cenarios
│   └── checkout.feature # 3 cenarios
├── pages/               # Page Objects
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── steps/               # Step definitions
│   ├── login.steps.ts
│   ├── cart.steps.ts
│   ├── checkout.steps.ts
│   └── common.steps.ts
└── support/
    ├── env.ts           # Acesso a variaveis de ambiente
    ├── hooks.ts         # Before/After hooks
    ├── world.ts         # Contexto compartilhado
    └── allure.ts        # Integracao com relatorio
```

### Decisoes Tecnicas

- **Page Object Pattern:** Cada pagina da aplicacao tem uma classe dedicada que encapsula os seletores e acoes. Isso facilita manutencao - se um seletor mudar, so precisa atualizar em um lugar.

- **Cucumber (BDD):** Os cenarios sao escritos em linguagem natural (Gherkin), permitindo que qualquer pessoa entenda o que esta sendo testado. Os step definitions fazem a ponte entre o texto e o codigo.

- **Playwright como motor de browser:** O Playwright controla o navegador (Chromium) por baixo do Cucumber, executando as acoes definidas nos steps.

- **Hooks (Before/After):** Os hooks garantem que cada cenario comeca com o navegador aberto e termina com a limpeza de recursos. Screenshots sao capturadas automaticamente em caso de falha.

- **Variaveis de ambiente:** Credenciais e URLs sao carregadas do `.env`, mantendo dados sensiveis fora do codigo.

### Fluxos Testados

- **Login:** Cenarios de sucesso, erro de credenciais, campos vazios e logout
- **Carrinho:** Adicionar produto, remover, visualizar detalhes, multiplos itens
- **Checkout:** Fluxo completo, validacao de campos obrigatorios

---

## Testes de Carga

**Diretorio:** `tests/load/`

### Estrutura

```
tests/load/
└── api-load-test.js     # Script K6
```

### Decisoes Tecnicas

- **K6:** Ferramenta de performance testing que permite definir cenarios de carga de forma programatica em JavaScript.

- **Estagios de carga:** O teste simula um cenario realista com ramp-up gradual ate 500 usuarios, sustentacao da carga e ramp-down controlado.

- **Thresholds:** Limites automaticos de performance (p95 abaixo de 500ms, taxa de erro abaixo de 0.1%) que determinam se o teste passou ou falhou.

- **handleSummary:** O K6 exporta um resumo estruturado em JSON ao final da execucao, que e utilizado pelo script de conversao para gerar o resultado no formato Allure.

### Configuracao dos Estagios

| Estagio | Duracao | Usuarios |
|---|---|---|
| Ramp-up | 30s | 0 a 100 |
| Subida | 2min | 100 a 500 |
| Sustentacao | 2min | 500 |
| Ramp-down | 1min | 500 a 0 |

---

## Scripts de Conversao

**Diretorio:** `scripts/`

Os scripts convertem os resultados de cada ferramenta para o formato Allure:

- **playwright-api-to-allure.js** - Le o JSON gerado pelo Playwright (`test-results/api-results.json`) e cria arquivos Allure individuais para cada teste. Navega a estrutura `suites > specs > tests > results` do Playwright.

- **k6-to-allure.js** - Le o JSON de sumario do K6 (`test-results/load-test-results.json`) e cria um resultado Allure com os checks e metricas HTTP como steps.

- **cucumber-to-allure.js** - Le o JSON do Cucumber (`allure-results/cucumber-report.json`) e converte cada cenario em um resultado Allure com os steps correspondentes.

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

## Relatorios

### Allure Report

O Allure e um framework de relatorios que unifica os resultados de todas as ferramentas em uma interface web unica:

- Visao geral com porcentagem de testes passando
- Detalhe de cada suite e teste individual
- Tempo de execucao por teste
- Logs e capturas de tela em caso de falha
- Historico de execucoes (quando executado repetidamente)

O relatorio e publicado no GitHub Pages e acessivel em:
https://JaderTS.github.io/test-automation-desafio/

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
- Carrega step definitions de `tests/e2e/steps/`
- Carrega suporte de `tests/e2e/support/`

### tsconfig.json

Configuracao do TypeScript:
- Target ES2020 com CommonJS
- Modo strict ativado
- Resolve JSON modules

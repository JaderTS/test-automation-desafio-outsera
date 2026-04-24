# Testes de Carga com K6

Documentacao completa dos testes de carga implementados com K6 para avaliacao de performance da API JSONPlaceholder.

---

## Visao Geral

Os testes de carga simulam 500 usuarios virtuais (VUs) simultaneos durante 5 minutos, testando multiplos endpoints da API JSONPlaceholder para avaliar latencia, taxa de erros e throughput.

## Estrutura dos Arquivos

| Arquivo | Descricao |
|---|---|
| `tests/load/api-load-test-500vu.js` | Script K6 com 500 VUs e 7 endpoints |
| `scripts/k6-report-analyzer.js` | Analisador de resultados com geracao de relatorio HTML |
| `mock-data/db.json` | Dados mock de referencia (estrutura JSONPlaceholder) |
| `test-results/load-test-500vu-results.json` | Resultado JSON gerado pelo K6 (apos execucao) |
| `test-results/load-test-500vu-report.html` | Relatorio HTML com graficos (apos analise) |

## Pre-requisitos

- K6 instalado ([guia de instalacao](https://k6.io/docs/get-started/installation/))
- Node.js >= 16.0.0

### Instalar K6

**Ubuntu/Debian:**
```bash
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6-stable-focal.list
sudo apt-get update && sudo apt-get install -y k6
```

**macOS:**
```bash
brew install k6
```

## Execucao

### Executar teste de carga (500 VUs)

```bash
npm run test:load:500vu
```

### Gerar relatorio HTML

Apos executar o teste, gere o relatorio de analise:

```bash
npm run test:load:report
```

### Executar teste e gerar relatorio

```bash
npm run test:load:full
```

## Configuracao do Teste

### Estagios de Carga

| Estagio | Duracao | VUs | Descricao |
|---|---|---|---|
| Ramp-up | 1 minuto | 0 a 500 | Aumento gradual de usuarios |
| Sustentacao | 3 minutos | 500 | Carga maxima constante |
| Ramp-down | 1 minuto | 500 a 0 | Reducao gradual |

### Endpoints Testados

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/posts` | Listar todos os posts |
| GET | `/posts?userId=1` | Filtrar posts por usuario |
| GET | `/posts/:id` | Buscar post por ID (aleatorio 1-100) |
| POST | `/posts` | Criar novo post |
| GET | `/users` | Listar todos os usuarios |
| GET | `/comments` | Listar todos os comentarios |
| GET | `/todos` | Listar todas as tarefas |

### Thresholds

| Metrica | Limite | Descricao |
|---|---|---|
| `http_req_duration` P95 | < 500ms | 95% das requisicoes abaixo de 500ms |
| `http_req_duration` P99 | < 1000ms | 99% das requisicoes abaixo de 1000ms |
| `http_req_failed` | < 1% | Taxa de falha HTTP abaixo de 1% |
| `errors` (custom) | < 1% | Taxa de checks falhados abaixo de 1% |

## Captura de Erros

Os testes implementam captura centralizada de erros com a função `logErrorIfFailed()` em todos os 7 endpoints.

### Formato de Log

Quando um check falha, o seguinte é registrado:

```json
[ERRO] GET /users - Status: 500 | Esperado: 200 | Dados: 0 users | Duração: 1250ms`
```

**Componentes:**
- **Endpoint:** GET /users
- **Status retornado:** 500
- **Status esperado:** 200
- **Contexto:** Dados: 0 users (específico por endpoint)
- **Duração:** Tempo de execução em ms

### Endpoints com Captura

Todos os 7 endpoints possuem captura:

| Endpoint | Contexto Capturado |
|---|---|
| GET /posts | Número de posts retornados |
| GET /posts?userId=1 | Número de posts do usuário |
| GET /posts/:id | ID retornado vs esperado |
| POST /posts | Body completo da resposta |
| GET /users | Número de usuários retornados |
| GET /comments | Número de comentários retornados |
| GET /todos | Número de TODOs retornados |

### Como Interpretar Logs de Erro

Durante a execução, erros aparecem no console:

```bash
[ERRO] GET /posts - Status: 200 | Esperado: 200 | Dados: 0 posts | Duração: 1050ms
                    ↑ status ok   ↑ esperado      ↑ problema: sem dados!
```
## Metricas Rastreadas

### Metricas Globais

- **Latencia:** Avg, P90, P95, P99, Max
- **Taxa de sucesso/erro:** Percentual de requisicoes com sucesso vs falha
- **Requisicoes por segundo (RPS):** Throughput medio durante o teste
- **Checks:** Validacoes de resposta (status code, corpo, tempo)

### Metricas por Endpoint

Cada endpoint possui uma metrica custom (`Trend`) que rastreia:
- Media (avg)
- P90, P95, P99
- Maximo (max)

### Metricas de Erro

Cada erro capturado contém:
- **Endpoint:** Nome da rota testada
- **Status HTTP:** Código retornado vs esperado
- **Contexto:** Validação que falhou (dados, ID, etc)
- **Duração:** Tempo em milissegundos

**Exemplo de saída em caso de falha:**

```json
[ERRO] GET /users - Status: 500 | Esperado: 200 | Dados: 0 users | Duração: 1250ms
[ERRO] POST /posts - Status: 201 | Esperado: 201 | Body: {...} | Duração: 850ms
```
Todos os erros são consolidados no resumo final gerado pelo `handleSummary()`.

## Relatorio de Analise

O script `k6-report-analyzer.js` gera:

1. **Resumo no console** com metricas principais
2. **Relatorio HTML** (`test-results/load-test-500vu-report.html`) contendo:
   - Dashboard com cards de metricas
   - Tabela de latencia por endpoint
   - Grafico de barras comparando Avg, P95 e P99 por endpoint
   - Grafico de distribuicao de latencia geral
   - Lista de gargalos identificados com severidade
   - Recomendacoes de otimizacao

### Criterios de Identificacao de Gargalos

| Condicao | Severidade |
|---|---|
| P95 geral > 500ms | Alta |
| P99 geral > 1000ms | Critica |
| Taxa de erro > 1% | Critica |
| P95 de endpoint > 500ms | Media |
| P99 de endpoint > 1000ms | Alta |
| Latencia maxima > 5000ms | Media |

## Troubleshooting

### Executar teste capturando erros em arquivo

```bash
npm run test:load:500vu 2>&1 | tee load-test-errors.log
```
Isso salva erros em `load-test-errors.log` para análise posterior.

# Análise de Erros - Load Test Errors Log

Salve erros em `load-test-errors.log` para análise posterior.

## Interpretar erros comuns

| Erro | Causa | Solução |
|------|-------|--------|
| Status: 503 \| Esperado: 200 | API sobrecarregada | Reduzir VUs ou aguardar recuperação |
| Dados: 0 posts \| Duração: 185068s | Timeout na resposta | Verificar latência base ou limite de conexões |
| Status: 500 \| Expected: 201 | Erro do servidor | Verificar logs da API ou dados de entrada |
| [ERRO] em muitos endpoints | Falha crítica | Verificar conectividade e health da API |

## Notas Importantes

- O teste e executado **diariamente** pelo workflow `load-tests-scheduled.yml` (3 PM UTC) e tambem pode ser disparado manualmente
- O script nao interfere nos testes existentes (`api-load-test.js`)
- Os resultados sao salvos em `test-results/` (diretorio ja no `.gitignore`)
- A API JSONPlaceholder e publica e pode ter variacao de latencia conforme carga externa
- Todos os endpoints implementam captura de erro com `logErrorIfFailed()` para melhor observabilidade
- Logs de erro aparecem em tempo real durante execução (útil para debug de falhas)
- Os erros são consolidados no `allure-results/` via script `scripts/k6-to-allure.js`
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

## Notas Importantes

- O teste e executado **diariamente** pelo workflow `load-tests-scheduled.yml` (3 PM UTC) e tambem pode ser disparado manualmente
- O script nao interfere nos testes existentes (`api-load-test.js`)
- Os resultados sao salvos em `test-results/` (diretorio ja no `.gitignore`)
- A API JSONPlaceholder e publica e pode ter variacao de latencia conforme carga externa

# Evidencias de Testes

Este documento registra as evidencias de execucao dos testes automatizados do projeto.

---

## Relatorio Allure

O relatorio completo com todos os resultados esta disponivel online:

**URL:** https://JaderTS.github.io/test-automation-desafio-outsera/

O relatorio e atualizado automaticamente a cada push na branch `main` pelo pipeline de CI/CD.

---

## Testes de API

**Ferramenta:** Playwright
**API testada:** JSONPlaceholder (https://jsonplaceholder.typicode.com)

### Endpoints Cobertos

| Endpoint | Metodo | Cenarios Positivos | Cenarios Negativos |
|---|---|---|---|
| /posts | GET | Listar todos, buscar por ID, filtrar por userId | ID inexistente, userId invalido |
| /posts | POST | Criar com dados validos, validar campos retornados | Payload vazio, campos invalidos, campo faltando |
| /posts | PUT | Atualizar completo, atualizacao parcial | Post inexistente, payload nulo |
| /posts | DELETE | Deletar post existente | Post inexistente |
| /users | GET | Listar todos, buscar por ID, validar email, posts/albums/todos do usuario | ID inexistente, ID invalido, ID negativo |
| /users | POST | Criar usuario, validar ID gerado | Email invalido, nome vazio, sem campos |
| /users | PUT | Atualizar completo, atualizacao parcial | Usuario inexistente, payload nulo |
| /users | DELETE | Deletar usuario | ID inexistente, ID invalido |
| /comments | GET | Listar comentarios | - |
| /todos | GET | Listar tarefas | - |

### Validacoes Realizadas

- Status codes (200, 201, 404, 500)
- Headers (Content-Type: application/json)
- Corpo da resposta (campos obrigatorios, tipos de dados, valores)
- Comportamento com dados invalidos

---

## Testes E2E

**Ferramenta:** Cucumber com Playwright
**Aplicacao testada:** Swag Labs (https://www.saucedemo.com)

### Cenarios por Feature

**Login (5 cenarios):**
- Login com sucesso usando credenciais validas
- Login com senha invalida (mensagem de erro)
- Login com usuario inexistente (mensagem de erro)
- Login com campos vazios (mensagem de campos obrigatorios)
- Logout com sucesso (retorno para tela de login)

**Carrinho (4 cenarios):**
- Visualizar detalhes de um produto
- Adicionar um produto ao carrinho
- Remover produto da listagem
- Adicionar multiplos produtos ao carrinho

**Checkout (5 cenarios):**
- Checkout com sucesso (fluxo completo)
- Checkout sem primeiro nome (validacao de erro)
- Checkout sem sobrenome (validacao de erro)
- Checkout sem CEP (validacao de erro)
- Checkout sem nenhum campo (validacao de erro)

### Padroes Utilizados

- Page Object Pattern para encapsular seletores e acoes
- Gherkin para descricao de cenarios em linguagem natural
- Hooks para setup e teardown automaticos
- Captura de screenshot automatica em caso de falha

---

## Testes de Carga

**Ferramenta:** K6
**API testada:** JSONPlaceholder

### Configuracao do Teste

- Usuarios simultaneos: ate 500
- Duracao total: aproximadamente 5 minutos (1min ramp-up + 3min sustentacao + 1min ramp-down)
- Endpoints testados: GET /posts, GET /posts?userId=1, GET /posts/:id, POST /posts, GET /users, GET /comments, GET /todos

### Thresholds

| Metrica | Limite |
|---|---|
| Tempo de resposta (p95) | Abaixo de 500ms |
| Tempo de resposta (p99) | Abaixo de 1000ms |
| Taxa de erro HTTP | Abaixo de 1% |
| Taxa de erro customizada | Abaixo de 1% |

### Checks

- GET /posts retorna status 200 e tem dados
- GET /posts?userId=1 retorna status 200 e filtra por userId corretamente
- GET /posts/:id retorna status 200 e ID correto
- POST /posts retorna status 201 e retorna ID gerado
- GET /users retorna status 200 e tem dados
- GET /comments retorna status 200 e tem dados
- GET /todos retorna status 200 e tem dados
- Todos os endpoints respondem em menos de 1000ms

---

## Pipeline CI/CD

**Ferramenta:** GitHub Actions
**Arquivo:** `.github/workflows/test.yml`

### Execucao Automatica

O pipeline executa automaticamente em:
- Push nas branches `main` e `develop`
- Pull requests para a branch `main`

### Etapas

1. Setup do ambiente (Node.js 18, K6, Playwright com navegadores)
2. Execucao dos testes de API
3. Conversao dos resultados para Allure
4. Execucao dos testes de carga
5. Conversao dos resultados para Allure
6. Execucao dos testes E2E
7. Conversao dos resultados para Allure
8. Geracao do relatorio Allure unificado
9. Deploy do relatorio no GitHub Pages
10. Comentario automatico no PR com link do relatorio

### Resultados

Os resultados de cada execucao podem ser consultados em:
- **GitHub Actions:** Aba "Actions" do repositorio, com logs detalhados de cada etapa
- **Allure Report:** Relatorio publicado no GitHub Pages apos cada push na main
- **Comentarios no PR:** Link do relatorio e postado automaticamente em pull requests

---

## Como Consultar Evidencias

1. **Relatorio online:** Acessar https://JaderTS.github.io/test-automation-desafio-outsera/
2. **Logs do CI:** Ir na aba "Actions" do repositorio no GitHub
3. **Relatorio local:** Executar os testes e gerar o relatorio com `npm run test:allure:generate && npm run test:allure:open`

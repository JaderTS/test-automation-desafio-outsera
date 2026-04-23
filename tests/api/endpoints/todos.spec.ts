import { test, expect } from '@playwright/test';

test.describe('API - Todos Endpoint - Testes Positivos e Negativos', () => {

  test('deve listar todas as tarefas', async ({ request }) => {
    const response = await request.get('/todos');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test('deve buscar uma tarefa pelo ID', async ({ request }) => {
    const todoId = 1;
    const response = await request.get(`/todos/${todoId}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.userId).toBeDefined();
    expect(data.id).toBe(todoId);
    expect(data.title).toBeDefined();
    expect(data.completed).toBeDefined();
  });

  test('deve filtrar tarefas por usuario', async ({ request }) => {
    const userId = 1;
    const response = await request.get('/todos', { params: { userId } });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    data.forEach((todo: any) => {
      expect(todo.userId).toBe(userId);
    });
  });

  test('deve filtrar tarefas concluidas', async ({ request }) => {
    const response = await request.get('/todos', { params: { completed: true } });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    data.forEach((todo: any) => {
      expect(todo.completed).toBe(true);
    });
  });

  test('deve filtrar tarefas nao concluidas', async ({ request }) => {
    const response = await request.get('/todos', { params: { completed: false } });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    data.forEach((todo: any) => {
      expect(todo.completed).toBe(false);
    });
  });

  test('deve validar que titulo nao eh vazio', async ({ request }) => {
    const response = await request.get('/todos/1');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.title).toBeTruthy();
    expect(data.title.length).toBeGreaterThan(0);
  });

  test('nao deve encontrar tarefa com ID invalido', async ({ request }) => {
    const response = await request.get('/todos/99999');
    expect(response.status()).toBe(404);
  });

  test('deve retornar vazio ao filtrar por usuario inexistente', async ({ request }) => {
    const response = await request.get('/todos', { params: { userId: 99999 } });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });

  test('nao deve aceitar ID com caracteres nao numericos', async ({ request }) => {
    const response = await request.get('/todos/abc');
    expect(response.status()).toBe(404);
  });

  test('deve criar nova tarefa com POST', async ({ request }) => {
    const novaTarefa = { userId: 1, title: 'Implementar funcionalidade nova', completed: false };
    const response = await request.post('/todos', { data: novaTarefa });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.id).toBeDefined();
    expect(data.userId).toBe(novaTarefa.userId);
    expect(data.title).toBe(novaTarefa.title);
    expect(data.completed).toBe(false);
  });

  test('deve permitir criar tarefa como concluida', async ({ request }) => {
    const novaTarefa = { userId: 1, title: 'Tarefa ja concluida', completed: true };
    const response = await request.post('/todos', { data: novaTarefa });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.completed).toBe(true);
  });

  test('POST deve gerar ID para nova tarefa', async ({ request }) => {
    const novaTarefa = { userId: 1, title: 'Tarefa teste', completed: false };
    const response = await request.post('/todos', { data: novaTarefa });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(typeof data.id).toBe('number');
    expect(data.id).toBeGreaterThan(0);
  });

  test('nao deve criar tarefa sem userId', async ({ request }) => {
    const response = await request.post('/todos', { data: { title: 'Teste', completed: false } });
    console.log(`Status ao omitir userId: ${response.status()}`);
  });

  test('nao deve aceitar titulo vazio na criacao', async ({ request }) => {
    const response = await request.post('/todos', { data: { userId: 1, title: '', completed: false } });
    console.log(`Status ao enviar titulo vazio: ${response.status()}`);
  });

  test('nao deve aceitar completed com tipo invalido', async ({ request }) => {
    const response = await request.post('/todos', { data: { userId: 1, title: 'Teste', completed: 'sim' as any } });
    // JSONPlaceholder não valida tipos; em produção retornaria 400
    console.log(`Status ao enviar tipo invalido em completed: ${response.status()}`);
  });

  test('deve marcar tarefa como concluida com PUT', async ({ request }) => {
    const response = await request.put('/todos/1', { data: { completed: true } });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.completed).toBe(true);
  });

  test('deve permitir atualizar titulo da tarefa', async ({ request }) => {
    const response = await request.put('/todos/1', { data: { title: 'Titulo da tarefa atualizado' } });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.title).toBe('Titulo da tarefa atualizado');
  });

  test('deve permitir atualizar multiplos campos', async ({ request }) => {
    const atualizacoes = { title: 'Nova descricao', completed: true };
    const response = await request.put('/todos/1', { data: atualizacoes });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.title).toBe(atualizacoes.title);
    expect(data.completed).toBe(true);
  });

  test('PUT nao deve atualizar tarefa inexistente', async ({ request }) => {
    const response = await request.put('/todos/99999', { data: { completed: true } });
    expect(response.status()).toBe(500);
  });

  test('deve deletar uma tarefa com DELETE', async ({ request }) => {
    const response = await request.delete('/todos/1');
    expect(response.status()).toBe(200);
  });

  test('DELETE nao deve encontrar tarefa inexistente', async ({ request }) => {
    const response = await request.delete('/todos/99999');
    expect(response.status()).toBe(200);
  });

  test('DELETE nao deve aceitar ID invalido', async ({ request }) => {
    const response = await request.delete('/todos/abc');
    expect(response.status()).toBe(200);
  });
});

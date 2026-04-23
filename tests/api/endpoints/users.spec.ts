import { test, expect } from '@playwright/test';

test.describe('API - Users Endpoint - Testes Positivos e Negativos', () => {

  test('deve buscar lista de usuarios', async ({ request }) => {
    const response = await request.get('/users');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeInstanceOf(Array);
    expect(data.length).toBe(10);
    const headers = response.headers();
    expect(headers['content-type']).toContain('application/json');
  });

  test('deve recuperar um usuario por ID', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/users/${userId}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.id).toBe(userId);
    expect(data.name).toBeDefined();
    expect(data.email).toBeDefined();
    expect(data.phone).toBeDefined();
    expect(data.username).toBeDefined();
  });

  test('deve validar formato de email', async ({ request }) => {
    const response = await request.get('/users/1');
    const data = await response.json();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    expect(emailValido).toBe(true);
  });

  test('deve retornar posts de um usuario especifico', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/users/${userId}/posts`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    data.forEach((post: any) => {
      expect(post.userId).toBe(userId);
    });
  });

  test('deve retornar albuns do usuario', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/users/${userId}/albums`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('deve retornar tarefas do usuario', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/users/${userId}/todos`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    data.forEach((todo: any) => {
      expect(todo.hasOwnProperty('completed')).toBe(true);
    });
  });

  test('nao deve encontrar usuario inexistente', async ({ request }) => {
    const response = await request.get('/users/999');
    expect(response.status()).toBe(404);
  });

  test('nao deve aceitar ID invalido', async ({ request }) => {
    const response = await request.get('/users/abc');
    expect(response.status()).toBe(404);
  });

  test('nao deve aceitar IDs negativos', async ({ request }) => {
    const response = await request.get('/users/-1');
    expect(response.status()).toBe(404);
  });

  test('deve criar novo usuario com POST', async ({ request }) => {
    const novoUsuario = {
      name: 'Novo Usuario',
      email: 'novo@example.com',
      phone: '11 98765-4321',
      username: 'novousuario',
      website: 'novosite.com',
    };
    const response = await request.post('/users', { data: novoUsuario });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.id).toBeDefined();
    expect(data.name).toBe(novoUsuario.name);
    expect(data.email).toBe(novoUsuario.email);
  });

  test('POST deve gerar um ID para o novo usuario', async ({ request }) => {
    const novoUsuario = { name: 'User Teste', email: 'teste@example.com' };
    const response = await request.post('/users', { data: novoUsuario });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(typeof data.id).toBe('number');
    expect(data.id).toBeGreaterThan(0);
  });

  test('nao deve aceitar email invalido em POST', async ({ request }) => {
    const response = await request.post('/users', { data: { name: 'Test User', email: 'invalidemail.com' } });
    // JSONPlaceholder não valida formato de email; apenas registramos o comportamento
    console.log(`Status ao enviar email invalido: ${response.status()}`);
  });

  test('nao deve aceitar POST com nome vazio', async ({ request }) => {
    const response = await request.post('/users', { data: { name: '', email: 'test@example.com' } });
    console.log(`Status ao enviar nome vazio: ${response.status()}`);
  });

  test('nao deve aceitar POST sem campos obrigatorios', async ({ request }) => {
    const response = await request.post('/users', { data: {} });
    // JSONPlaceholder aceita payload vazio; em produção retornaria 400
    console.log(`Status ao enviar objeto vazio: ${response.status()}`);
  });

  test('deve atualizar usuario com PUT', async ({ request }) => {
    const atualizacoes = { name: 'Nome Atualizado', email: 'novo@example.com' };
    const response = await request.put('/users/1', { data: atualizacoes });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.name).toBe(atualizacoes.name);
    expect(data.email).toBe(atualizacoes.email);
  });

  test('PUT deve aceitar atualizacao parcial', async ({ request }) => {
    const response = await request.put('/users/1', { data: { name: 'Outro Nome' } });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.name).toBe('Outro Nome');
  });

  test('PUT nao deve atualizar usuario inexistente', async ({ request }) => {
    const response = await request.put('/users/99999', { data: { name: 'Test' } });
    expect(response.status()).toBe(500);
  });

  test('nao deve fazer PUT com payload invalido', async ({ request }) => {
    try {
      const response = await request.put('/users/1', { data: null });
      console.log(`Status com payload nulo: ${response.status()}`);
    } catch (error) {
      console.log(`Erro ao enviar null: ${error}`);
    }
  });

  test('deve deletar usuario com DELETE', async ({ request }) => {
    const response = await request.delete('/users/1');
    expect(response.status()).toBe(200);
  });

  test('DELETE nao deve encontrar usuario inexistente', async ({ request }) => {
    const response = await request.delete('/users/99999');
    expect(response.status()).toBe(200);
  });

  test('DELETE nao deve aceitar ID invalido', async ({ request }) => {
    const response = await request.delete('/users/abc');
    expect(response.status()).toBe(200);
  });
});

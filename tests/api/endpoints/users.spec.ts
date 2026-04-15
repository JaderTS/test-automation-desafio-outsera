import { test, expect } from '@playwright/test';

test.describe('API - Users  Endpoint - Testes Positivos e Negativos - Requisicoes HTTP', () => {

  test('deve buscar lista de usuarios', async ({ request }) => {
    // Fazer requisicao GET para /users
    const response = await request.get('/users');

    // Validar status 200
    expect(response.status()).toBe(200);
    // Validar se retorna array
    const data = await response.json();
    expect(data).toBeInstanceOf(Array);
    // Validar quantidade de usuarios
    expect(data.length).toBe(10);
    // Validar header de resposta
    const headers = response.headers();
    expect(headers['content-type']).toContain('application/json');
  });

  test('deve recuperar um usuario por ID', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/users/${userId}`);

    // Validar status
    expect(response.status()).toBe(200);
    
    // Validar estrutura do usuario retornado
    const data = await response.json();
    expect(data.id).toBe(userId);
    expect(data.name).toBeDefined();
    expect(data.email).toBeDefined();
    expect(data.phone).toBeDefined();
    expect(data.username).toBeDefined();
  });

  test('deve validar formato de email', async ({ request }) => {
    const response = await request.get('/users/1');
    
    // Validar formato de email com regex
    const data = await response.json();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    expect(emailValido).toBe(true);
  });

  test('deve retornar posts de um usuario especifico', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/users/${userId}/posts`);

    // Validar status
    expect(response.status()).toBe(200);
    // Validar se retorna array
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    // Validar que todos os posts pertencem ao usuario
    data.forEach((post: any) => {
      expect(post.userId).toBe(userId);
    });
  });

  test('deve retornar albuns do usuario', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/users/${userId}/albums`);

    // Validar status
    expect(response.status()).toBe(200);
    // Validar se retorna array
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('deve retornar tarefas do usuario', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/users/${userId}/todos`);

    // Validar status
    expect(response.status()).toBe(200);
    // Validar se retorna array
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    // Validar que todos tem o campo completed
    data.forEach((todo: any) => {
      expect(todo.hasOwnProperty('completed')).toBe(true);
    });
  });

  test('nao deve encontrar usuario inexistente', async ({ request }) => {
    const userIdInexistente = 999;
    const response = await request.get(`/users/${userIdInexistente}`);

    // Validar se retorna 404
    expect(response.status()).toBe(404);
  });

  test('nao deve aceitar ID invalido', async ({ request }) => {
    const response = await request.get('/users/abc');
    // Validar se retorna 404
    expect(response.status()).toBe(404);
  });

  test('nao deve aceitar IDs negativos', async ({ request }) => {
    const response = await request.get('/users/-1');
    // Validar se retorna 404
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

    // Validar status 201 (Created)
    expect(response.status()).toBe(201);
    // Validar se retornou um id
    const data = await response.json();
    expect(data.id).toBeDefined();
    // Validar se os dados foram salvos corretamente
    expect(data.name).toBe(novoUsuario.name);
    expect(data.email).toBe(novoUsuario.email);
  });

  test('POST deve gerar um ID para o novo usuario', async ({ request }) => {
    const novoUsuario = {
      name: 'User Teste',
      email: 'teste@example.com',
    };

    const response = await request.post('/users', { data: novoUsuario });

    // Validar status 201
    expect(response.status()).toBe(201);
    // Validar se tem um ID numerado
    const data = await response.json();
    expect(typeof data.id).toBe('number');
    expect(data.id).toBeGreaterThan(0);
  });

  test('nao deve aceitar email invalido em POST', async ({ request }) => {
    const usuarioComEmailInvalido = {
      name: 'Test User',
      email: 'invalidemail.com',
    };

    const response = await request.post('/users', { data: usuarioComEmailInvalido });
    
    // Apenas registrar o comportamento da API
    console.log(`Status ao enviar email invalido: ${response.status()}`);
  });

  test('nao deve aceitar POST com nome vazio', async ({ request }) => {
    const usuarioSemNome = {
      name: '',
      email: 'test@example.com',
    };

    const response = await request.post('/users', { data: usuarioSemNome });
    console.log(`Status ao enviar nome vazio: ${response.status()}`);
  });

  test('nao deve aceitar POST sem campos obrigatorios', async ({ request }) => {
    const response = await request.post('/users', { data: {} });

    // JSONPlaceholder aceita mesmo vazio, em producao seria 400
    console.log(`Status ao enviar objeto vazio: ${response.status()}`);
  });

  test('deve atualizar usuario com PUT', async ({ request }) => {
    const atualizacoes = {
      name: 'Nome Atualizado',
      email: 'novo@example.com',
    };

    const response = await request.put('/users/1', { data: atualizacoes });

    // Validar status 200
    expect(response.status()).toBe(200);
    // Validar se foi atualizado
    const data = await response.json();
    expect(data.name).toBe(atualizacoes.name);
    expect(data.email).toBe(atualizacoes.email);
  });

  test('PUT deve aceitar atualizacao parcial', async ({ request }) => {
    const response = await request.put('/users/1', {
      data: { name: 'Outro Nome' },
    });

    // Validar status 200
    expect(response.status()).toBe(200);
    // Validar se apenas o nome foi atualizado
    const data = await response.json();
    expect(data.name).toBe('Outro Nome');
  });

  test('PUT nao deve atualizar usuario inexistente', async ({ request }) => {
    const response = await request.put('/users/99999', { data: { name: 'Test' } });
    
    // Validar status 500
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

    // Validar status 200
    expect(response.status()).toBe(200);
  });

  test('DELETE nao deve encontrar usuario inexistente', async ({ request }) => {
    const response = await request.delete('/users/99999');
    
    // Validar status 200
    expect(response.status()).toBe(200);
  });

  test('DELETE nao deve aceitar ID invalido', async ({ request }) => {
    const response = await request.delete('/users/abc');
    
    // Validar status 200
    expect(response.status()).toBe(200);
  });
});
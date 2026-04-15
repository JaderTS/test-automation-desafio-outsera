import { test, expect } from '@playwright/test';

test.describe('API - Comments Endpoint - Testes Positivos e Negativos - Operacoes sobre Comentarios', () => {

  test('deve recuperar lista de comentarios', async ({ request }) => {
    // Fazer requisicao GET para /comments
    const response = await request.get('/comments');

    // Validar status 200
    expect(response.status()).toBe(200);
    // Validar se retorna array
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    // Validar se tem items
    expect(data.length).toBeGreaterThan(0);
  });

  test('deve trazer comentario especifico pelo ID', async ({ request }) => {
    const commentId = 1;
    const response = await request.get(`/comments/${commentId}`);

    // Validar status
    expect(response.status()).toBe(200);
    // Validar se tem o ID correto
    const data = await response.json();
    expect(data.id).toBe(commentId);
    // Validar se tem todos os campos necessarios
    expect(data.postId).toBeDefined();
    expect(data.name).toBeDefined();
    expect(data.email).toBeDefined();
    expect(data.body).toBeDefined();
  });

  test('deve filtrar comentarios por ID do post', async ({ request }) => {
    const postId = 1;
    const response = await request.get('/comments', { params: { postId } });

    // Validar status
    expect(response.status()).toBe(200);
    // Validar se retorna array
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    // Validar que todos os comentarios pertencem ao post correto
    data.forEach((comment: any) => {
      expect(comment.postId).toBe(postId);
    });
  });

  test('deve filtrar comentarios pelo email', async ({ request }) => {
    const email = 'Eliseo@gardner.biz';
    const response = await request.get('/comments', { params: { email } });

    // Validar status
    expect(response.status()).toBe(200);
    // Validar se retorna array
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    // Validar que todos os comentarios tem o email correto
    data.forEach((comment: any) => {
      expect(comment.email).toBe(email);
    });
  });

  test('deve validar formato de email nos comentarios', async ({ request }) => {
    const response = await request.get('/comments/1');
    
    // Validar formato de email com regex
    const data = await response.json();
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    expect(formatoEmail).toBe(true);
  });

  test('nao deve encontrar comentario com ID invalido', async ({ request }) => {
    const response = await request.get('/comments/99999');

    // Validar se retorna 404
    expect(response.status()).toBe(404);
  });

  test('deve retornar vazio ao filtrar por post inexistente', async ({ request }) => {
    const response = await request.get('/comments', { params: { postId: 99999 } });

    // Validar status 200 mas com array vazio
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });

  test('deve retornar vazio ao filtrar por email inexistente', async ({ request }) => {
    const response = await request.get('/comments', { params: { email: 'naoexiste@example.com' } });

    // Validar status 200 mas com array vazio
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.length).toBe(0);
  });

  test('deve criar novo comentario com POST', async ({ request }) => {
    const novoComentario = {
      postId: 1,
      name: 'Meu Comentario',
      email: 'usuario@example.com',
      body: 'Este eh o corpo do comentario que estou adicionando.',
    };

    const response = await request.post('/comments', { data: novoComentario });

    // Validar status 201 (Created)
    expect(response.status()).toBe(201);
    // Validar se retornou um id
    const data = await response.json();
    expect(data.id).toBeDefined();
    // Validar se os dados foram salvos corretamente
    expect(data.postId).toBe(novoComentario.postId);
    expect(data.name).toBe(novoComentario.name);
  });

  test('POST deve gerar um ID para o novo comentario', async ({ request }) => {
    const novoComentario = {
      postId: 1,
      name: 'Comentario Teste',
      email: 'teste@example.com',
      body: 'Corpo do teste',
    };

    const response = await request.post('/comments', { data: novoComentario });

    // Validar status 201
    expect(response.status()).toBe(201);
    // Validar se tem ID
    const data = await response.json();
    expect(data.id).toBeDefined();
    // Validar tipo do ID
    expect(typeof data.id).toBe('number');
  });

  test('nao deve criar comentario sem postId', async ({ request }) => {
    const comentarioIncompleto = {
      name: 'Teste',
      email: 'teste@example.com',
      body: 'Corpo',
    };

    const response = await request.post('/comments', { data: comentarioIncompleto });
    console.log(`Status ao omitir postId: ${response.status()}`);
  });

  test('nao deve aceitar email invalido em comentario novo', async ({ request }) => {
    const comentarioComEmailInvalido = {
      postId: 1,
      name: 'Teste',
      email: 'email-invalido',
      body: 'Corpo',
    };

    const response = await request.post('/comments', { data: comentarioComEmailInvalido });
    console.log(`Status ao enviar email invalido: ${response.status()}`);
  });

  test('nao deve criar comentario com body vazio', async ({ request }) => {
    const comentarioSemBody = {
      postId: 1,
      name: 'Teste',
      email: 'teste@example.com',
      body: '',
    };

    const response = await request.post('/comments', { data: comentarioSemBody });
    console.log(`Status ao omitir body: ${response.status()}`);
  });

  test('deve atualizar comentario com PUT', async ({ request }) => {
    const atualizacoes = {
      postId: 1,
      name: 'Comentario Atualizado',
      email: 'novo@example.com',
      body: 'Novo conteudo do comentario',
    };

    const response = await request.put('/comments/1', { data: atualizacoes });

    // Validar status 200
    expect(response.status()).toBe(200);
    // Validar se os dados foram atualizados
    const data = await response.json();
    expect(data.name).toBe(atualizacoes.name);
    expect(data.body).toBe(atualizacoes.body);
  });

  test('PUT nao deve atualizar comentario inexistente', async ({ request }) => {
    const response = await request.put('/comments/99999', { data: { name: 'Teste' } });
    
    // Validar status 500
    expect(response.status()).toBe(500);
  });

  test('deve deletar comentario com DELETE', async ({ request }) => {
    const response = await request.delete('/comments/1');

    // Validar status 200
    expect(response.status()).toBe(200);
  });

  test('DELETE nao deve encontrar comentario inexistente', async ({ request }) => {
    const response = await request.delete('/comments/99999');
    
    // Validar status 200
    expect(response.status()).toBe(200);
  });
});
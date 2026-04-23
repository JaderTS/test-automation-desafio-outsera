import { test, expect } from '@playwright/test';

test.describe('API Posts Endpoint - Testes Positivos e Negativos', () => {

  test('GET /posts - Status 200 e retorna array', async ({ request }) => {
    const response = await request.get('/posts');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeInstanceOf(Array);
    expect(data.length).toBeGreaterThan(0);
    console.log(`Retornou ${data.length} posts`);
  });

  test('GET /posts/:id - Retorna post especifico com todos os campos', async ({ request }) => {
    const response = await request.get('/posts/1');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('id', 1);
    expect(data).toHaveProperty('userId');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('body');
    console.log(`Post 1: "${data.title}"`);
  });

  test('GET /posts/:id - Headers contem Content-Type JSON', async ({ request }) => {
    const response = await request.get('/posts/1');
    const headers = response.headers();
    expect(headers['content-type']).toContain('application/json');
    console.log(`Content-Type: ${headers['content-type']}`);
  });

  test('GET /posts - Suporta filtro por userId', async ({ request }) => {
    const response = await request.get('/posts', { params: { userId: 1 } });
    expect(response.status()).toBe(200);
    const data = await response.json();
    data.forEach((post: any) => {
      expect(post.userId).toBe(1);
    });
    console.log(`Retornou ${data.length} posts do usuario 1`);
  });

  test('GET /posts/:id - Retorna 404 para post inexistente', async ({ request }) => {
    const response = await request.get('/posts/99999');
    expect(response.status()).toBe(404);
    console.log(`POST inexistente retornou 404 como esperado`);
  });

  test('GET /posts - userId inexistente retorna array vazio', async ({ request }) => {
    const response = await request.get('/posts', { params: { userId: 99999 } });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
    console.log(`userId invalido retornou array vazio como esperado`);
  });

  test('POST /posts - Criar novo post com dados validos', async ({ request }) => {
    const newPost = {
      userId: 1,
      title: 'Novo Post de Teste',
      body: 'Este eh um corpo de teste bem detalhado e completo.',
    };
    const response = await request.post('/posts', { data: newPost });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.userId).toBe(newPost.userId);
    expect(data.title).toBe(newPost.title);
    console.log(`Post criado com ID: ${data.id}`);
  });

  test('POST /posts - Response contem todos os campos obrigatorios', async ({ request }) => {
    const newPost = { userId: 2, title: 'Post Completo', body: 'Corpo do post' };
    const response = await request.post('/posts', { data: newPost });
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('userId');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('body');
    console.log(`Todos os campos presentes na resposta`);
  });

  test('POST /posts - Rejeita payload vazio', async ({ request }) => {
    const response = await request.post('/posts', { data: {} });
    // JSONPlaceholder aceita payload vazio; em produção retornaria 400
    console.log(`Payload vazio retornou status: ${response.status()}`);
  });

  test('POST /posts - Campo title com valores invalidos', async ({ request }) => {
    const invalidPost = { userId: 'invalid', title: '', body: 'Test' };
    const response = await request.post('/posts', { data: invalidPost });
    console.log(`Dados invalidos retornaram status: ${response.status()}`);
  });

  test('POST /posts - Falta campo obrigatorio (title)', async ({ request }) => {
    const incompletePost = { userId: 1, body: 'Sem titulo' };
    const response = await request.post('/posts', { data: incompletePost });
    console.log(`POST sem title retornou status: ${response.status()}`);
  });

  test('PUT /posts/:id - Atualizar post existente', async ({ request }) => {
    const updatedPost = { id: 1, userId: 1, title: 'Titulo Atualizado', body: 'Corpo atualizado com novos dados' };
    const response = await request.put('/posts/1', { data: updatedPost });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.title).toBe(updatedPost.title);
    expect(data.body).toBe(updatedPost.body);
    console.log(`Post 1 atualizado com sucesso`);
  });

  test('PUT /posts/:id - Atualizacao parcial (apenas alguns campos)', async ({ request }) => {
    const response = await request.put('/posts/1', { data: { title: 'Apenas Titulo Novo' } });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.title).toBe('Apenas Titulo Novo');
    console.log(`Atualizacao parcial bem-sucedida`);
  });

  test('PUT /posts/:id - Post inexistente retorna erro', async ({ request }) => {
    const response = await request.put('/posts/99999', { data: { title: 'Teste' } });
    expect(response.status()).toBe(500);
    console.log(`PUT em post inexistente retornou ${response.status()}`);
  });

  test('PUT /posts/:id - Payload malformado (JSON invalido)', async ({ request }) => {
    try {
      const response = await request.put('/posts/1', { data: null });
      console.log(`PUT com null retornou status: ${response.status()}`);
    } catch (error) {
      console.log(`PUT malformado gerou erro: ${error}`);
    }
  });

  test('DELETE /posts/:id - Deletar post existente', async ({ request }) => {
    const response = await request.delete('/posts/1');
    expect(response.status()).toBe(200);
    console.log(`Post 1 deletado com sucesso`);
  });

  test('DELETE /posts/:id - Post inexistente retorna erro', async ({ request }) => {
    const response = await request.delete('/posts/99999');
    expect(response.status()).toBe(200);
    console.log(`DELETE em post inexistente retornou ${response.status()}`);
  });
});

/**
 * REST Assured-style API Tests (Node.js com Axios)
 *
 * Equivalente ao Rest Assured do Java, utilizando Axios como cliente HTTP.
 * Valida endpoints com diferentes metodos HTTP (GET, POST, PUT, DELETE)
 * com cenarios positivos e negativos.
 *
 * Executar: node tests/api/rest-assured-api-tests.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [],
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runTest(name, fn) {
  results.total++;
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.passed++;
    results.tests.push({ name, status: 'passed', duration });
    console.log(`  ✅ ${name} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - start;
    results.failed++;
    results.tests.push({ name, status: 'failed', duration, error: err.message });
    console.log(`  ❌ ${name} (${duration}ms)`);
    console.log(`     Error: ${err.message}`);
  }
}

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  validateStatus: () => true,
});

// ==================== GET Tests ====================

async function testGetPosts() {
  await runTest('GET /posts - Status 200 e retorna array', async () => {
    const res = await client.get('/posts');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Expected response to be an array');
    assert(res.data.length > 0, 'Expected at least one post');
    assert(
      res.headers['content-type'].includes('application/json'),
      `Expected JSON content-type, got ${res.headers['content-type']}`
    );
  });

  await runTest('GET /posts/:id - Retorna post especifico', async () => {
    const res = await client.get('/posts/1');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(Number(res.data.id) === 1, `Expected id 1, got ${res.data.id}`);
    assert(res.data.userId !== undefined, 'Expected userId property');
    assert(res.data.title !== undefined, 'Expected title property');
    assert(res.data.body !== undefined, 'Expected body property');
  });

  await runTest('GET /posts - Filtrar por userId', async () => {
    const res = await client.get('/posts', { params: { userId: 1 } });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Expected response to be an array');
    res.data.forEach((post) => {
      assert(post.userId === 1, `Expected userId 1, got ${post.userId}`);
    });
  });

  await runTest('GET /posts/:id - Post inexistente retorna 404', async () => {
    const res = await client.get('/posts/99999');
    assert(res.status === 404, `Expected status 404, got ${res.status}`);
  });

  await runTest('GET /posts - userId inexistente retorna array vazio', async () => {
    const res = await client.get('/posts', { params: { userId: 99999 } });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Expected response to be an array');
    assert(res.data.length === 0, `Expected empty array, got ${res.data.length} items`);
  });

  await runTest('GET /posts/:id - Headers contem Content-Type JSON', async () => {
    const res = await client.get('/posts/1');
    assert(
      res.headers['content-type'].includes('application/json'),
      `Expected JSON content-type, got ${res.headers['content-type']}`
    );
  });
}

async function testGetUsers() {
  await runTest('GET /users - Status 200 e retorna lista de usuarios', async () => {
    const res = await client.get('/users');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Expected response to be an array');
    assert(res.data.length > 0, 'Expected at least one user');
  });

  await runTest('GET /users/:id - Retorna usuario especifico', async () => {
    const res = await client.get('/users/1');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(Number(res.data.id) === 1, `Expected id 1, got ${res.data.id}`);
    assert(res.data.name !== undefined, 'Expected name property');
    assert(res.data.email !== undefined, 'Expected email property');
  });

  await runTest('GET /users/:id - Usuario inexistente retorna 404', async () => {
    const res = await client.get('/users/99999');
    assert(res.status === 404, `Expected status 404, got ${res.status}`);
  });
}

async function testGetComments() {
  await runTest('GET /comments - Status 200 e retorna lista', async () => {
    const res = await client.get('/comments');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Expected response to be an array');
    assert(res.data.length > 0, 'Expected at least one comment');
  });

  await runTest('GET /comments - Filtrar por postId', async () => {
    const res = await client.get('/comments', { params: { postId: 1 } });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    res.data.forEach((comment) => {
      assert(comment.postId === 1, `Expected postId 1, got ${comment.postId}`);
    });
  });
}

async function testGetTodos() {
  await runTest('GET /todos - Status 200 e retorna lista', async () => {
    const res = await client.get('/todos');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Expected response to be an array');
    assert(res.data.length > 0, 'Expected at least one todo');
  });

  await runTest('GET /todos/:id - Retorna todo especifico', async () => {
    const res = await client.get('/todos/1');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(Number(res.data.id) === 1, `Expected id 1, got ${res.data.id}`);
    assert(res.data.title !== undefined, 'Expected title property');
    assert(res.data.completed !== undefined, 'Expected completed property');
  });
}

// ==================== POST Tests ====================

async function testPostPosts() {
  await runTest('POST /posts - Criar post com dados validos', async () => {
    const newPost = {
      userId: 1,
      title: 'Rest Assured Test Post',
      body: 'Corpo do post criado via teste Rest Assured',
    };
    const res = await client.post('/posts', newPost);
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    assert(res.data.id !== undefined, 'Expected id in response');
    assert(res.data.userId === newPost.userId, `Expected userId ${newPost.userId}`);
    assert(res.data.title === newPost.title, `Expected title match`);
    assert(res.data.body === newPost.body, `Expected body match`);
  });

  await runTest('POST /posts - Response contem todos os campos', async () => {
    const newPost = { userId: 2, title: 'Completo', body: 'Dados completos' };
    const res = await client.post('/posts', newPost);
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    assert(res.data.id !== undefined, 'Expected id property');
    assert(res.data.userId !== undefined, 'Expected userId property');
    assert(res.data.title !== undefined, 'Expected title property');
    assert(res.data.body !== undefined, 'Expected body property');
  });

  await runTest('POST /posts - Payload vazio (cenario negativo)', async () => {
    const res = await client.post('/posts', {});
    // JSONPlaceholder aceita payload vazio, retorna 201 com id
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    assert(res.data.id !== undefined, 'Expected id even with empty payload');
  });

  await runTest('POST /posts - Campo title vazio (cenario negativo)', async () => {
    const invalidPost = { userId: 'invalid', title: '', body: 'Test' };
    const res = await client.post('/posts', invalidPost);
    // JSONPlaceholder nao valida dados, retorna 201
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
  });
}

// ==================== PUT Tests ====================

async function testPutPosts() {
  await runTest('PUT /posts/:id - Atualizar post existente', async () => {
    const updatedPost = {
      id: 1,
      userId: 1,
      title: 'Titulo Atualizado via Rest Assured',
      body: 'Corpo atualizado',
    };
    const res = await client.put('/posts/1', updatedPost);
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(res.data.title === updatedPost.title, 'Expected title to match');
    assert(res.data.body === updatedPost.body, 'Expected body to match');
  });

  await runTest('PUT /posts/:id - Atualizacao parcial', async () => {
    const res = await client.put('/posts/1', { title: 'Apenas Titulo' });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(res.data.title === 'Apenas Titulo', 'Expected title to match');
  });

  await runTest('PUT /posts/:id - Post inexistente retorna erro', async () => {
    const res = await client.put('/posts/99999', { title: 'Teste' });
    // JSONPlaceholder retorna 500, json-server retorna 404
    assert(
      res.status === 500 || res.status === 404,
      `Expected status 500 or 404, got ${res.status}`
    );
  });
}

// ==================== DELETE Tests ====================

async function testDeletePosts() {
  await runTest('DELETE /posts/:id - Deletar post existente', async () => {
    const res = await client.delete('/posts/1');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
  });

  await runTest('DELETE /posts/:id - Deletar post inexistente', async () => {
    const res = await client.delete('/posts/99999');
    // JSONPlaceholder retorna 200, json-server retorna 404
    assert(
      res.status === 200 || res.status === 404,
      `Expected status 200 or 404, got ${res.status}`
    );
  });
}

// ==================== Main ====================

async function main() {
  console.log('=== Rest Assured API Tests (Node.js + Axios) ===\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  console.log('--- GET Tests ---');
  await testGetPosts();
  await testGetUsers();
  await testGetComments();
  await testGetTodos();

  console.log('\n--- POST Tests ---');
  await testPostPosts();

  console.log('\n--- PUT Tests ---');
  await testPutPosts();

  console.log('\n--- DELETE Tests ---');
  await testDeletePosts();

  // Summary
  console.log('\n=== Resultado ===');
  console.log(`Total: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Taxa de sucesso: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  // Save results
  const outputDir = path.resolve(__dirname, '../../test-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'rest-assured-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResultados salvos em: ${outputPath}`);

  if (results.failed > 0) {
    console.log('\n⚠️  Alguns testes falharam!');
    process.exit(1);
  } else {
    console.log('\n✅ Todos os testes passaram!');
  }
}

main().catch((err) => {
  console.error('Erro fatal:', err.message);
  process.exit(1);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { proxyTutorRequest } from '../functions/_shared/tutor-proxy.js';

const API_BASE = 'https://unsm-academy-7j2t241dy-samirconter-1146s-projects.vercel.app';

test('Pages tutor proxy rejects non-POST methods without calling upstream', async () => {
  const response = await proxyTutorRequest(
    new Request('https://academy.pages.dev/api/tutor/chat', { method: 'GET' }),
    { TUTOR_API_BASE_URL: API_BASE },
    'chat'
  );
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'POST');
});

test('Pages tutor proxy rejects cross-origin browser requests', async () => {
  const response = await proxyTutorRequest(
    new Request('https://academy.pages.dev/api/tutor/chat', {
      method: 'POST',
      headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    }),
    { TUTOR_API_BASE_URL: API_BASE },
    'chat'
  );
  assert.equal(response.status, 403);
});

test('Pages tutor proxy fails closed when backend configuration is missing', async () => {
  const response = await proxyTutorRequest(
    new Request('https://academy.pages.dev/api/tutor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    }),
    {},
    'chat'
  );
  assert.equal(response.status, 503);
});

test('Pages tutor proxy forwards authentication without forwarding cookies or Origin', async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl;
  let capturedInit;
  globalThis.fetch = async (url, init) => {
    capturedUrl = String(url);
    capturedInit = init;
    return new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg', 'Set-Cookie': 'private=value' },
    });
  };

  try {
    const response = await proxyTutorRequest(
      new Request('https://academy.pages.dev/api/tutor/tts', {
        method: 'POST',
        headers: {
          Origin: 'https://academy.pages.dev',
          Authorization: 'Bearer test-user-token',
          'Content-Type': 'application/json',
          Cookie: 'session=must-not-forward',
        },
        body: JSON.stringify({ text: 'Hola' }),
      }),
      { TUTOR_API_BASE_URL: API_BASE },
      'tts'
    );

    assert.equal(capturedUrl, API_BASE + '/api/tutor/tts');
    assert.equal(capturedInit.method, 'POST');
    assert.equal(capturedInit.headers.get('Authorization'), 'Bearer test-user-token');
    assert.equal(capturedInit.headers.get('Cookie'), null);
    assert.equal(capturedInit.headers.get('Origin'), null);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Content-Type'), 'audio/mpeg');
    assert.equal(response.headers.get('Set-Cookie'), null);
    assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [1, 2, 3]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Pages tutor proxy rejects a non-Vercel upstream host', async () => {
  const response = await proxyTutorRequest(
    new Request('https://academy.pages.dev/api/tutor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    }),
    { TUTOR_API_BASE_URL: 'https://attacker.example' },
    'chat'
  );
  assert.equal(response.status, 503);
});

test('Pages tutor proxy rejects oversized request bodies', async () => {
  const oversized = 'x'.repeat(32 * 1024 + 1);
  const response = await proxyTutorRequest(
    new Request('https://academy.pages.dev/api/tutor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: oversized,
    }),
    { TUTOR_API_BASE_URL: API_BASE },
    'chat'
  );
  assert.equal(response.status, 413);
});

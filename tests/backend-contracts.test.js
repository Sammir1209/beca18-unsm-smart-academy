import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('TTS quota policy is server-owned and cannot be widened by an RPC caller', async () => {
  const migration = await read('../supabase/migrations/20261121223000_harden_tts_quota_parameters.sql');
  assert.match(migration, /p_window_seconds is distinct from 60/i);
  assert.match(migration, /p_max_requests is distinct from 8/i);
  assert.match(migration, /p_max_chars is distinct from 9000/i);
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(migration, /security definer/i);
  assert.match(migration, /set search_path = ''/i);
});

test('Vercel tutor endpoints require POST and authenticated sessions', async () => {
  for (const path of ['../api/tutor/chat.js', '../api/tutor/tts.js', '../api/tutor/live-token.js']) {
    const source = await read(path);
    assert.match(source, /req\.method !== 'POST'/, path);
    assert.match(source, /Authorization|authorization/, path);
    assert.match(source, /auth\/v1\/user/, path);
  }
});

test('Vercel AI model IDs use an explicit provider prefix', async () => {
  const chat = await read('../api/tutor/chat.js');
  const live = await read('../api/tutor/live-token.js');
  assert.match(chat, /MODEL = 'openai\//);
  assert.match(live, /MODEL = 'openai\//);
});

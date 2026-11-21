import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('TTS quota policy is server-owned and cannot be widened by an RPC caller', async () => {
  const migration = await read('../supabase/migrations/20261121222809_harden_tts_quota_parameters.sql');
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

test('student progress sync validates batches and stores only user-owned practice correctness', async () => {
  const migration = await read('../supabase/migrations/20261121230005_harden_sync_student_progress_validation.sql');
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(migration, /jsonb_typeof\(p_events\) is distinct from 'array'/i);
  assert.match(migration, /jsonb_array_length\(p_events\) > 100/i);
  assert.match(migration, /selected_option_key, is_correct, is_doubt/i);
  assert.match(migration, /revoke all on function public\.sync_student_progress\(jsonb\) from public, anon/i);
  assert.match(migration, /grant execute on function public\.sync_student_progress\(jsonb\) to authenticated, service_role/i);
  assert.match(migration, /set search_path = ''/i);
});

test('live tutor quota is enforced before minting a client token', async () => {
  const source = await read('../api/tutor/live-token.js');
  assert.ok(source.indexOf('consume_tutor_live_quota') < source.indexOf('v1/realtime/client-secrets'));
});

test('local progress and mistakes are scoped to the active account', async () => {
  const sync = await read('../src/core/progress-sync.js');
  const engine = await read('../src/core/recommendation.js');
  const storage = await read('../src/core/storage.js');
  assert.match(sync, /owner_user_id: userId === 'guest' \? null : userId/);
  assert.match(sync, /event\.owner_user_id === session\.user\.id/);
  assert.match(sync, /userId: session\.user\.id/);
  assert.match(engine, /mistakes_by_user/);
  assert.match(engine, /attempt\.userId === ownerId/);
  assert.match(storage, /\['userId', 'questionId'\]/);
});

test('source inventory never presents missing document hashes as verified', async () => {
  const inventory = JSON.parse(await read('../research/sources/source-inventory.json'));
  for (const source of inventory.sources || []) {
    if (source.checksumStatus !== 'COMPUTED') {
      assert.equal(source.checksum, null, source.sourceId);
    } else {
      assert.match(source.checksum, /^[a-f0-9]{64}$/i, source.sourceId);
    }
  }
});

test('practice view escapes dynamic question content before HTML rendering', async () => {
  const source = await read('../src/ui/practice.js');
  assert.match(source, /const escapeHtml =/);
  assert.match(source, /escapeHtml\(questions\[currentIndex\]\.rawQuestion\)/);
  assert.match(source, /escapeHtml\(opt\.text\)/);
});

test('dashboard and navigation do not overstate the question bank as official', async () => {
  const dashboard = await read('../src/ui/dashboard.js');
  const main = await read('../src/main.js');
  assert.doesNotMatch(dashboard, /Simulacro Oficial|Preguntas Oficiales|FRECUENCIA MUY ALTA/);
  assert.match(main, /Fuentes & Trazabilidad/);
  assert.doesNotMatch(main, /Fuentes Oficiales & Auditoría/);
});

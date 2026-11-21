import { storage } from './storage.js';
import { supabase, supabaseConfigured } from './supabase.js';

const STORE = 'sync_outbox';
let syncing = false;
let listenersBound = false;

function uuid() {
  return crypto.randomUUID();
}

export async function queueProgressAttempt({ questionId, selectedAnswer, isDoubt, timeSpentSeconds, timestamp }) {
  const event = {
    id: uuid(),
    event_type: 'attempt_recorded',
    question_ref: String(questionId).slice(0, 160),
    selected_option_key: selectedAnswer == null ? null : String(selectedAnswer).slice(0, 20),
    is_doubt: Boolean(isDoubt),
    time_spent_seconds: Math.max(0, Math.min(86400, Number(timeSpentSeconds) || 0)),
    occurred_at: new Date(timestamp || Date.now()).toISOString(),
    queued_at: new Date().toISOString()
  };
  await storage.set(STORE, event);
  return event.id;
}

export async function syncPendingProgress() {
  if (syncing || !navigator.onLine || !supabaseConfigured || !supabase) return { synced: 0, pending: (await storage.getAll(STORE)).length };
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { synced: 0, pending: (await storage.getAll(STORE)).length };
  syncing = true;
  let synced = 0;
  try {
    const pending = (await storage.getAll(STORE)).sort((a,b) => a.queued_at.localeCompare(b.queued_at));
    for (let i=0; i<pending.length; i+=50) {
      const batch = pending.slice(i,i+50);
      const { error } = await supabase.rpc('sync_student_progress', { p_events: batch.map(({queued_at,...event}) => event) });
      if (error) throw error;
      for (const event of batch) {
        await storage.delete(STORE, event.id);
        synced++;
      }
    }
    await pullRemoteProgress();
    return { synced, pending: (await storage.getAll(STORE)).length };
  } finally {
    syncing = false;
  }
}

export function startProgressSync() {
  if (listenersBound) return;
  listenersBound = true;
  const run = () => syncPendingProgress().catch(error => console.warn('Progress sync deferred:', error.message));
  window.addEventListener('online', run);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') run(); });
  supabase?.auth.onAuthStateChange((_event, session) => { if (session) setTimeout(run, 0); });
  run();
}

export async function pullRemoteProgress() {
  if (!supabaseConfigured || !supabase || !navigator.onLine) return { pulled: 0 };
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { pulled: 0 };
  const { data, error } = await supabase
    .from('student_progress_events')
    .select('id,question_ref,selected_option_key,is_doubt,time_spent_seconds,occurred_at')
    .order('occurred_at', { ascending: true })
    .limit(5000);
  if (error) throw error;
  const local = await storage.getAll('attempts');
  const known = new Set(local.map(item => item.syncEventId).filter(Boolean));
  const missing = (data || []).filter(event => !known.has(event.id)).map(event => ({
    syncEventId: event.id,
    questionId: event.question_ref,
    selectedAnswer: event.selected_option_key,
    isCorrect: null,
    isDoubt: event.is_doubt,
    timeSpentSeconds: event.time_spent_seconds,
    timestamp: new Date(event.occurred_at).getTime(),
    restoredFromCloud: true
  }));
  if (missing.length) await storage.bulkPut('attempts', missing);
  return { pulled: missing.length };
}

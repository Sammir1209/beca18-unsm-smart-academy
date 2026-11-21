import { storage } from './storage.js';
import { supabase, supabaseConfigured } from './supabase.js';
import { repo } from './repository.js';

const STORE = 'sync_outbox';
let syncing = false;
let listenersBound = false;

function uuid() {
  return crypto.randomUUID();
}

export async function queueProgressAttempt({ userId = 'guest', questionId, selectedAnswer, isCorrect, isDoubt, timeSpentSeconds, timestamp }) {
  const event = {
    id: uuid(),
    owner_user_id: userId === 'guest' ? null : userId,
    event_type: 'attempt_recorded',
    question_ref: String(questionId).slice(0, 160),
    selected_option_key: selectedAnswer == null ? null : String(selectedAnswer).slice(0, 20),
    is_correct: typeof isCorrect === 'boolean' ? isCorrect : null,
    is_doubt: Boolean(isDoubt),
    time_spent_seconds: Math.max(0, Math.min(86400, Number(timeSpentSeconds) || 0)),
    occurred_at: new Date(timestamp || Date.now()).toISOString(),
    queued_at: new Date().toISOString()
  };
  await storage.set(STORE, event);
  return event.id;
}

export async function syncPendingProgress() {
  if (syncing || !navigator.onLine || !supabaseConfigured || !supabase) {
    return { synced: 0, pending: 0 };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { synced: 0, pending: 0 };

  syncing = true;
  let synced = 0;
  try {
    // Only upload events recorded by the currently authenticated account.
    // Anonymous/guest progress remains on this device and is never attributed
    // to whichever account happens to sign in later.
    const pending = (await storage.getAll(STORE))
      .filter(event => event.owner_user_id === session.user.id)
      .sort((a, b) => a.queued_at.localeCompare(b.queued_at));

    for (let i = 0; i < pending.length; i += 50) {
      const batch = pending.slice(i, i + 50);
      const { error } = await supabase.rpc('sync_student_progress', {
        p_events: batch.map(({ queued_at, owner_user_id, ...event }) => event)
      });
      if (error) throw error;
      for (const event of batch) {
        await storage.delete(STORE, event.id);
        synced += 1;
      }
    }

    await pullRemoteProgress();
    return { synced, pending: pending.length - synced };
  } finally {
    syncing = false;
  }
}

export function startProgressSync() {
  if (listenersBound) return;
  listenersBound = true;
  const run = () => syncPendingProgress().catch(error => console.warn('Progress sync deferred:', error.message));
  window.addEventListener('online', run);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') run();
  });
  supabase?.auth.onAuthStateChange((_event, session) => {
    if (session) setTimeout(run, 0);
  });
  run();
}

export async function pullRemoteProgress() {
  if (!supabaseConfigured || !supabase || !navigator.onLine) return { pulled: 0 };
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { pulled: 0 };

  const { data, error } = await supabase
    .from('student_progress_events')
    .select('id,question_ref,selected_option_key,is_correct,is_doubt,time_spent_seconds,occurred_at')
    .order('occurred_at', { ascending: true })
    .limit(5000);
  if (error) throw error;

  const local = await storage.getAll('attempts');
  const known = new Set(
    local
      .filter(item => item.userId === session.user.id)
      .map(item => item.syncEventId)
      .filter(Boolean)
  );

  const missing = (data || []).filter(event => !known.has(event.id)).map(event => ({
    syncEventId: event.id,
    userId: session.user.id,
    questionId: event.question_ref,
    selectedAnswer: event.selected_option_key,
    isCorrect: event.is_correct,
    isDoubt: event.is_doubt,
    timeSpentSeconds: event.time_spent_seconds,
    timestamp: new Date(event.occurred_at).getTime(),
    restoredFromCloud: true
  }));

  if (missing.length) {
    await storage.bulkPut('attempts', missing);

    // Rebuild the local mistake view from newly imported, user-owned progress events.
    // The correctness value is a practice diagnostic, not an official admission result.
    for (const event of (data || []).filter(item => !known.has(item.id))) {
      const questionId = event.question_ref;
      const question = repo.questions.find(item => item.id === questionId);
      const key = [session.user.id, questionId];
      const existing = await storage.get('mistakes_by_user', key);

      if (event.is_doubt || event.is_correct === false) {
        const mistake = existing || {
          userId: session.user.id,
          questionId,
          topic: question?.topic || 'Tema por identificar',
          failCount: 0,
          doubtCount: 0,
          firstFailedAt: new Date(event.occurred_at).getTime(),
          mastered: false
        };
        if (event.is_doubt) mistake.doubtCount += 1;
        if (event.is_correct === false && !event.is_doubt) mistake.failCount += 1;
        mistake.lastFailedAt = new Date(event.occurred_at).getTime();
        mistake.mastered = false;
        await storage.set('mistakes_by_user', mistake);
      } else if (event.is_correct === true && existing) {
        existing.mastered = true;
        existing.masteredAt = new Date(event.occurred_at).getTime();
        await storage.set('mistakes_by_user', existing);
      }
    }
  }
  return { pulled: missing.length };
}

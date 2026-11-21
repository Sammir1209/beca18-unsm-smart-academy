// ==========================================================================
 // ADAPTIVE RECOMMENDATION ENGINE
 // ==========================================================================

import { storage } from './storage.js';
import { queueProgressAttempt } from './progress-sync.js';
import { supabase } from './supabase.js';
import { buildRecommendations } from './recommendation-rules.js';

async function getOwnerId() {
  try {
    if (!supabase) return 'guest';
    const { data, error } = await supabase.auth.getSession();
    if (error) return 'guest';
    return data?.session?.user?.id || 'guest';
  } catch {
    return 'guest';
  }
}

export class RecommendationEngine {
  static async recordAnswer({ questionId, selectedAnswer, correctAnswer, timeSpentSeconds, topic, isDoubt }) {
    const userId = await getOwnerId();
    const isCorrect = selectedAnswer !== null && selectedAnswer !== undefined && selectedAnswer === correctAnswer;
    const timestamp = Date.now();

    // Keep local attempts isolated per signed-in account or the separate guest profile.
    const localAttemptId = await storage.set('attempts', {
      userId,
      questionId,
      selectedAnswer,
      correctAnswer,
      isCorrect,
      isDoubt: Boolean(isDoubt),
      timeSpentSeconds,
      timestamp
    });

    const syncEventId = await queueProgressAttempt({
      userId,
      questionId,
      selectedAnswer,
      isCorrect: isDoubt ? null : isCorrect,
      isDoubt,
      timeSpentSeconds,
      timestamp
    });
    const localAttempt = await storage.get('attempts', localAttemptId);
    if (localAttempt) await storage.set('attempts', { ...localAttempt, syncEventId });

    // Mistake keys now include userId so accounts on the same browser never share them.
    if (!isCorrect || isDoubt) {
      const key = [userId, questionId];
      let existing = await storage.get('mistakes_by_user', key);
      if (!existing && userId === 'guest') {
        const legacyGuestMistake = await storage.get('mistakes', questionId);
        if (legacyGuestMistake) existing = { ...legacyGuestMistake, userId: 'guest' };
      }
      existing ||= {
        userId,
        questionId,
        topic,
        failCount: 0,
        doubtCount: 0,
        firstFailedAt: timestamp,
        mastered: false
      };

      existing.topic = topic || existing.topic;
      if (!isCorrect && !isDoubt) existing.failCount += 1;
      if (isDoubt) existing.doubtCount += 1;
      existing.lastFailedAt = timestamp;
      existing.mastered = false;
      await storage.set('mistakes_by_user', existing);
    } else {
      const existing = await storage.get('mistakes_by_user', [userId, questionId]);
      if (existing) {
        existing.mastered = true;
        existing.masteredAt = timestamp;
        await storage.set('mistakes_by_user', existing);
      }
    }
  }

  static async getDiagnosticSummary(questions) {
    const ownerId = await getOwnerId();
    const [allAttempts, userMistakes, legacyGuestMistakes] = await Promise.all([
      storage.getAll('attempts'),
      storage.getAll('mistakes_by_user'),
      ownerId === 'guest' ? storage.getAll('mistakes') : Promise.resolve([])
    ]);

    const attempts = allAttempts.filter((attempt) =>
      attempt.userId === ownerId || (ownerId === 'guest' && !attempt.userId)
    );
    const mistakesMap = new Map();
    for (const mistake of userMistakes.filter((item) => item.userId === ownerId)) {
      mistakesMap.set(mistake.questionId, mistake);
    }
    for (const mistake of legacyGuestMistakes) {
      if (!mistakesMap.has(mistake.questionId)) {
        mistakesMap.set(mistake.questionId, { ...mistake, userId: 'guest' });
      }
    }

    // Cloud-restored events can lack an answer key; never count them as wrong or right.
    const scoredAttempts = attempts.filter((attempt) =>
      typeof attempt.isCorrect === 'boolean' && !attempt.isDoubt
    );
    const total = scoredAttempts.length;
    const correct = scoredAttempts.filter((attempt) => attempt.isCorrect).length;
    const doubts = attempts.filter((attempt) => attempt.isDoubt).length;
    const errors = scoredAttempts.filter((attempt) => !attempt.isCorrect).length;

    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const activeMistakes = [...mistakesMap.values()].filter((mistake) => !mistake.mastered);

    return {
      total,
      correct,
      doubts,
      errors,
      accuracy,
      unresolvedMistakesCount: activeMistakes.length,
      recommendations: buildRecommendations(activeMistakes, questions)
    };
  }
}

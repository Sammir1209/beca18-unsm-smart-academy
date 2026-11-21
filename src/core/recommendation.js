// ==========================================================================
// ADAPTIVE RECOMMENDATION ENGINE
// ==========================================================================

import { storage } from './storage.js';
import { queueProgressAttempt } from './progress-sync.js';
import { buildRecommendations } from './recommendation-rules.js';

export class RecommendationEngine {
  static async recordAnswer({ questionId, selectedAnswer, correctAnswer, timeSpentSeconds, topic, isDoubt }) {
    const isCorrect = selectedAnswer === correctAnswer;

    // 1. Record Attempt in history
    const localAttemptId = await storage.set('attempts', {
      questionId,
      selectedAnswer,
      correctAnswer,
      isCorrect,
      isDoubt: !!isDoubt,
      timeSpentSeconds,
      timestamp: Date.now()
    });

    // Encola solo la selección del estudiante; nunca se sincroniza la clave correcta.
    const syncEventId = await queueProgressAttempt({ questionId, selectedAnswer, isDoubt, timeSpentSeconds, timestamp: Date.now() });
    const localAttempt = await storage.get('attempts', localAttemptId);
    if (localAttempt) await storage.set('attempts', { ...localAttempt, syncEventId });

    // 2. Intelligent Mistake Tracking ("Mis Errores")
    if (!isCorrect || isDoubt) {
      const existing = (await storage.get('mistakes', questionId)) || {
        questionId,
        topic,
        failCount: 0,
        doubtCount: 0,
        firstFailedAt: Date.now(),
        mastered: false
      };

      if (!isCorrect) existing.failCount += 1;
      if (isDoubt) existing.doubtCount += 1;
      existing.lastFailedAt = Date.now();
      existing.mastered = false;

      await storage.set('mistakes', existing);
    } else {
      // If student answered correctly, evaluate if mastered in mistakes bank
      const existing = await storage.get('mistakes', questionId);
      if (existing) {
        existing.mastered = true;
        existing.masteredAt = Date.now();
        await storage.set('mistakes', existing);
      }
    }
  }

  static async getDiagnosticSummary(questions) {
    const attempts = await storage.getAll('attempts');
    const mistakes = await storage.getAll('mistakes');

    // Cloud-restored events intentionally do not contain answer keys. Exclude
    // those records from accuracy rather than counting them as incorrect.
    const scoredAttempts = attempts.filter(a => typeof a.isCorrect === 'boolean');
    const total = scoredAttempts.length;
    const correct = scoredAttempts.filter(a => a.isCorrect && !a.isDoubt).length;
    const doubts = attempts.filter(a => a.isDoubt).length;
    const errors = scoredAttempts.filter(a => a.isCorrect === false && !a.isDoubt).length;

    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const activeMistakes = mistakes.filter(m => !m.mastered);

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

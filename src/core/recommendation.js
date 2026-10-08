// ==========================================================================
// ADAPTIVE RECOMMENDATION ENGINE
// ==========================================================================

import { storage } from './storage.js';

export class RecommendationEngine {
  static async recordAnswer({ questionId, selectedAnswer, correctAnswer, timeSpentSeconds, topic, isDoubt }) {
    const isCorrect = selectedAnswer === correctAnswer;

    // 1. Record Attempt in history
    await storage.set('attempts', {
      questionId,
      selectedAnswer,
      correctAnswer,
      isCorrect,
      isDoubt: !!isDoubt,
      timeSpentSeconds,
      timestamp: Date.now()
    });

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

    const total = attempts.length;
    const correct = attempts.filter(a => a.isCorrect && !a.isDoubt).length;
    const doubts = attempts.filter(a => a.isDoubt).length;
    const errors = attempts.filter(a => !a.isCorrect && !a.isDoubt).length;

    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const activeMistakes = mistakes.filter(m => !m.mastered);

    return {
      total,
      correct,
      doubts,
      errors,
      accuracy,
      unresolvedMistakesCount: activeMistakes.length,
      recommendations: [
        {
          topic: 'Regla de Tres y Porcentajes',
          subject: 'Aritmetica',
          priority: 'ALTA',
          action: 'Revisar Ficha: Variaciones Comerciales y Descuentos Sucesivos',
          fichaId: 'FICHA-MAT-PORCENTAJES'
        },
        {
          topic: 'Ecuaciones e Inecuaciones',
          subject: 'Algebra',
          priority: 'MEDIA',
          action: 'Practicar Teorema de Cardano-Vieta y Raíces Cuadráticas',
          fichaId: 'FICHA-ALG-ECUACIONES-CUADRATICAS'
        }
      ]
    };
  }
}

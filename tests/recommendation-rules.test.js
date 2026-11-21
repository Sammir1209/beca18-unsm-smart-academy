import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRecommendations } from '../src/core/recommendation-rules.js';

const questions = [
  { id: 'q-1', subject: 'Aritmetica', topic: 'Porcentajes' },
  { id: 'q-2', subject: 'Aritmetica', topic: 'Porcentajes' },
  { id: 'q-3', subject: 'Algebra', topic: 'Ecuaciones' },
];

test('no recommendations are fabricated when the student has no active mistakes', () => {
  assert.deepEqual(buildRecommendations([], questions), []);
});

test('recommendations are generated only from actual active mistakes', () => {
  const recommendations = buildRecommendations([
    { questionId: 'q-1', topic: 'Porcentajes', failCount: 2, doubtCount: 1, mastered: false },
    { questionId: 'q-2', topic: 'Porcentajes', failCount: 1, doubtCount: 0, mastered: false },
    { questionId: 'q-3', topic: 'Ecuaciones', failCount: 0, doubtCount: 1, mastered: false },
    { questionId: 'q-3', topic: 'Ecuaciones', failCount: 8, doubtCount: 0, mastered: true },
  ], questions);

  assert.equal(recommendations.length, 2);
  assert.equal(recommendations[0].topic, 'Porcentajes');
  assert.equal(recommendations[0].subject, 'Aritmetica');
  assert.equal(recommendations[0].priority, 'ALTA');
  assert.match(recommendations[0].action, /3 fallos y 1 duda registradas/);
  assert.equal(recommendations[1].topic, 'Ecuaciones');
  assert.equal(recommendations[1].priority, 'MEDIA');
});

test('unknown question references remain transparent and do not invent a course', () => {
  const [recommendation] = buildRecommendations([
    { questionId: 'not-in-bank', topic: 'Tema antiguo', failCount: 1, doubtCount: 0, mastered: false },
  ], questions);
  assert.equal(recommendation.subject, 'Curso general');
  assert.equal(recommendation.topic, 'Tema antiguo');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const questions = JSON.parse(await readFile(new URL('../data/questions/questions.json', import.meta.url), 'utf8'));

test('question bank is a valid non-empty array', () => {
  assert.ok(Array.isArray(questions));
  assert.ok(questions.length > 0);
});

test('question identifiers are unique', () => {
  const ids = questions.map((question) => question.id);
  assert.ok(ids.every((id) => typeof id === 'string' && id.length > 0));
  assert.equal(new Set(ids).size, ids.length);
});

test('every question has complete answer structure', () => {
  for (const [index, question] of questions.entries()) {
    assert.ok(question.institution, `question[${index}] institution`);
    assert.ok(question.examType, `question[${index}] examType`);
    assert.ok(typeof question.rawQuestion === 'string' && question.rawQuestion.trim(), `question[${index}] statement`);
    assert.ok(Array.isArray(question.options) && question.options.length >= 2, `question[${index}] options`);
    const optionIds = question.options.map((option) => option.id);
    assert.equal(new Set(optionIds).size, optionIds.length, `question[${index}] duplicate options`);
    assert.ok(optionIds.includes(question.correctAnswer), `question[${index}] answer key not in options`);
    assert.ok(question.explanation && typeof question.explanation === 'object', `question[${index}] explanation`);
  }
});

test('unverified content is never silently promoted to published', () => {
  const allowed = new Set(['DRAFT', 'EXTRACTED', 'CLASSIFIED', 'REVIEW_REQUIRED', 'VALIDATED', 'PUBLISHED', 'REJECTED']);
  for (const [index, question] of questions.entries()) {
    assert.ok(allowed.has(question.status), `question[${index}] unknown status: ${question.status}`);
    if (['VALIDATED', 'PUBLISHED'].includes(question.status)) {
      assert.ok(question.sourceReference?.document, `question[${index}] missing source document`);
      assert.ok(Number.isInteger(question.sourceReference?.page) && question.sourceReference.page > 0, `question[${index}] missing source page`);
      assert.ok(Number.isInteger(question.sourceReference?.questionNumber) && question.sourceReference.questionNumber > 0, `question[${index}] missing source question number`);
    }
  }
});

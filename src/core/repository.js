// ==========================================================================
// DATA REPOSITORY: Central In-Memory & Cache Store
// ==========================================================================

import { storage } from './storage.js';

class DataRepository {
  constructor() {
    this.questions = [];
    this.fichas = [];
    this.materials = [];
    this.flashcards = [];
    this.taxonomy = null;
    this.sources = [];
    this.initialized = false;
  }

  async loadInitialData() {
    if (this.initialized) return;

    try {
      // 1. Load from pre-packaged data JSON files
      const [qRes, fRes, mRes, fcRes, taxRes, srcRes] = await Promise.all([
        fetch('/data/questions/questions.json').then(r => r.json()).catch(() => []),
        fetch('/data/fichas/fichas.json').then(r => r.json()).catch(() => []),
        fetch('/data/materials/materials.json').then(r => r.json()).catch(() => []),
        fetch('/data/flashcards/flashcards.json').then(r => r.json()).catch(() => []),
        fetch('/data/taxonomy/taxonomy.json').then(r => r.json()).catch(() => null),
        fetch('/research/sources/source-inventory.json').then(r => r.json()).catch(() => ({ sources: [] }))
      ]);

      this.questions = qRes || [];
      this.fichas = fRes || [];
      this.materials = mRes || [];
      this.flashcards = fcRes || [];
      this.taxonomy = taxRes;
      this.sources = srcRes?.sources || [];

      // 2. Sync to IndexedDB for offline persistence
      if (this.questions.length > 0) await storage.bulkPut('questions', this.questions);
      if (this.fichas.length > 0) await storage.bulkPut('fichas', this.fichas);
      if (this.materials.length > 0) await storage.bulkPut('materials', this.materials);
      if (this.flashcards.length > 0) await storage.bulkPut('flashcards', this.flashcards);

      // 3. Initialize student profile if not exists
      let profile = await storage.get('profile', 'student_profile');
      if (!profile) {
        profile = {
          id: 'student_profile',
          name: 'Postulante 2027',
          target: 'BOTH', // 'BECA18' | 'UNSM' | 'BOTH'
          unsmModality: 'ORDINARIO',
          streakDays: 4,
          dailyGoal: 20,
          completedToday: 8,
          masteryRate: 72,
          weakTopics: ['Álgebra: Propiedades de las Raíces', 'Física: Caída Libre Vertical']
        };
        await storage.set('profile', profile);
      }

      this.initialized = true;
    } catch (err) {
      console.warn('Repository online fetch fallback to local storage:', err);
      // Offline fallback: load directly from IndexedDB
      this.questions = await storage.getAll('questions');
      this.fichas = await storage.getAll('fichas');
      this.materials = await storage.getAll('materials');
      this.flashcards = await storage.getAll('flashcards');
      this.initialized = true;
    }
  }

  getQuestionsByFilters({ institution, subject, difficulty, examType } = {}) {
    return this.questions.filter(q => {
      if (institution && institution !== 'ALL' && q.institution !== institution) return false;
      if (subject && subject !== 'ALL' && q.subject !== subject) return false;
      if (difficulty && difficulty !== 'ALL' && q.difficulty !== difficulty) return false;
      if (examType && examType !== 'ALL' && q.examType !== examType) return false;
      return true;
    });
  }

  getFichaById(id) {
    return this.fichas.find(f => f.id === id);
  }

  getMaterialById(id) {
    return this.materials.find(m => m.id === id);
  }
}

export const repo = new DataRepository();

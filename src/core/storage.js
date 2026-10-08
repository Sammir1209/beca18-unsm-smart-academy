// ==========================================================================
// STORAGE SERVICE: IndexedDB (SmartAcademyDB) & Local Backup
// ==========================================================================

const DB_NAME = 'SmartAcademyDB';
const DB_VERSION = 1;

class StorageService {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // User Profile & Preferences
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }

        // Questions Master Cache
        if (!db.objectStoreNames.contains('questions')) {
          const qStore = db.createObjectStore('questions', { keyPath: 'id' });
          qStore.createIndex('institution', 'institution', { unique: false });
          qStore.createIndex('subject', 'subject', { unique: false });
          qStore.createIndex('topic', 'topic', { unique: false });
        }

        // Fichas Temáticas
        if (!db.objectStoreNames.contains('fichas')) {
          db.createObjectStore('fichas', { keyPath: 'id' });
        }

        // Materials & Summaries
        if (!db.objectStoreNames.contains('materials')) {
          db.createObjectStore('materials', { keyPath: 'id' });
        }

        // Flashcards (Spaced Repetition)
        if (!db.objectStoreNames.contains('flashcards')) {
          db.createObjectStore('flashcards', { keyPath: 'id' });
        }

        // Exam & Practice Attempts
        if (!db.objectStoreNames.contains('attempts')) {
          const aStore = db.createObjectStore('attempts', { keyPath: 'id', autoIncrement: true });
          aStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Intelligent Mistakes Bank ("Mis Errores")
        if (!db.objectStoreNames.contains('mistakes')) {
          db.createObjectStore('mistakes', { keyPath: 'questionId' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.errorCode);
        reject(event.target.error);
      };
    });
  }

  async set(storeName, data) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async get(storeName, key) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async getAll(storeName) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async bulkPut(storeName, items) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach(item => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const storage = new StorageService();

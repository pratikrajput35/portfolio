/**
 * Simple JSON file-based data store
 * Data is stored in /data/*.json files at the project root
 * This replaces MongoDB for local development
 */
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(collection: string) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection<T = any>(collection: string): T[] {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCollection<T = any>(collection: string, data: T[]) {
  fs.writeFileSync(getFilePath(collection), JSON.stringify(data, null, 2), 'utf-8');
}

function readSingle<T = any>(collection: string): T | null {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function writeSingle<T = any>(collection: string, data: T) {
  fs.writeFileSync(getFilePath(collection), JSON.stringify(data, null, 2), 'utf-8');
}

// Generic CRUD operations
export const db = {
  // Find all documents with optional filter
  find<T extends { _id?: string }>(
    collection: string,
    filter?: Partial<T> | ((item: T) => boolean)
  ): T[] {
    const docs = readCollection<T>(collection);
    if (!filter) return docs;
    if (typeof filter === 'function') return docs.filter(filter);
    return docs.filter(doc =>
      Object.entries(filter).every(([key, val]) => (doc as any)[key] === val)
    );
  },

  // Find one document
  findOne<T extends { _id?: string }>(
    collection: string,
    filter: Partial<T> | ((item: T) => boolean)
  ): T | null {
    const results = this.find(collection, filter);
    return results[0] ?? null;
  },

  // Find by ID
  findById(collection: string, id: string): Record<string, any> | null {
    const docs = readCollection<any>(collection);
    return docs.find(d => d._id === id) ?? null;
  },

  // Insert a document
  create(collection: string, data: Record<string, any>): Record<string, any> {
    const docs = readCollection<any>(collection);
    const newDoc = { ...data, _id: randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    docs.push(newDoc);
    writeCollection(collection, docs);
    return newDoc;
  },

  // Update a document by ID
  updateById<T extends { _id?: string }>(collection: string, id: string, update: Partial<T>): T | null {
    const docs = readCollection<T>(collection);
    const idx = docs.findIndex(d => d._id === id);
    if (idx === -1) return null;
    docs[idx] = { ...docs[idx], ...update, updatedAt: new Date().toISOString() } as T;
    writeCollection(collection, docs);
    return docs[idx];
  },

  // Delete a document by ID
  deleteById(collection: string, id: string): boolean {
    const docs = readCollection(collection);
    const filtered = docs.filter(d => d._id !== id);
    if (filtered.length === docs.length) return false;
    writeCollection(collection, filtered);
    return true;
  },

  // Settings (single object store)
  getSettings<T>(collection: string, defaults: T): T {
    const data = readSingle<T>(collection);
    return data ? { ...defaults, ...data } : defaults;
  },

  setSettings<T>(collection: string, data: T) {
    writeSingle(collection, { ...data, updatedAt: new Date().toISOString() });
  },
};

export default db;

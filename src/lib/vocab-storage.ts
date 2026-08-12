"use client";

export interface VocabEntry {
  word: string;
  addedAt: string;
  sourcePartId: string;
}

const VOCAB_KEY = "cefr_vocab";

export function getVocab(): VocabEntry[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(VOCAB_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveToVocab(word: string, sourcePartId: string) {
  if (typeof window === "undefined") return;
  const current = getVocab();
  
  // Avoid duplicates
  if (current.some(entry => entry.word.toLowerCase() === word.toLowerCase())) {
    return;
  }

  const newEntry: VocabEntry = {
    word,
    addedAt: new Date().toISOString(),
    sourcePartId,
  };

  localStorage.setItem(VOCAB_KEY, JSON.stringify([...current, newEntry]));
}

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface VocabularyItem {
  word: string;
  timestamp: number;
}

interface VocabularyContextType {
  words: VocabularyItem[];
  addWord: (word: string) => void;
  removeWord: (word: string) => void;
  clearVocabulary: () => void;
  isVocabularyModeActive: boolean;
  setIsVocabularyModeActive: (active: boolean) => void;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

export function VocabularyProvider({ children }: { children: React.ReactNode }) {
  const [words, setWords] = useState<VocabularyItem[]>([]);
  const [isVocabularyModeActive, setIsVocabularyModeActive] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cefr_vocabulary');
    if (saved) {
      try {
        setWords(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse vocabulary from localStorage');
      }
    }
  }, []);

  // Save to localStorage whenever words change
  useEffect(() => {
    localStorage.setItem('cefr_vocabulary', JSON.stringify(words));
  }, [words]);

  const addWord = (word: string) => {
    const cleanWord = word.trim().toLowerCase();
    if (!cleanWord) return;
    
    setWords(prev => {
      // Don't add duplicates
      if (prev.some(w => w.word.toLowerCase() === cleanWord)) {
        return prev;
      }
      return [{ word: cleanWord, timestamp: Date.now() }, ...prev];
    });
  };

  const removeWord = (wordToRemove: string) => {
    setWords(prev => prev.filter(w => w.word !== wordToRemove));
  };

  const clearVocabulary = () => {
    setWords([]);
  };

  return (
    <VocabularyContext.Provider value={{
      words,
      addWord,
      removeWord,
      clearVocabulary,
      isVocabularyModeActive,
      setIsVocabularyModeActive
    }}>
      {children}
    </VocabularyContext.Provider>
  );
}

export function useVocabulary() {
  const context = useContext(VocabularyContext);
  if (context === undefined) {
    throw new Error('useVocabulary must be used within a VocabularyProvider');
  }
  return context;
}

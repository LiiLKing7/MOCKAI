export interface HighlightData {
  partId: string;
  questionId: string;
  blockId?: string;
  text: string;
  startOffset: number;
  endOffset: number;
}

const STORAGE_KEY = "cefr_test_highlights";

export function saveHighlight(highlight: HighlightData) {
  const highlights = getAllHighlights();
  const filtered = highlights.filter(h => h.partId !== highlight.partId || h.questionId !== highlight.questionId);
  filtered.push(highlight);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function removeHighlight(partId: string, questionId: string) {
  const highlights = getAllHighlights();
  const filtered = highlights.filter(h => h.partId !== partId || h.questionId !== questionId);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getHighlightsForPart(partId: string): HighlightData[] {
  return getAllHighlights().filter(h => h.partId === partId);
}

export function getAllHighlights(): HighlightData[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function clearHighlights() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

// Utility to find the exact offset in a raw string based on a DOM selection
export function getRawStringOffset(container: HTMLElement, range: Range, selectedText: string, rawString: string): { start: number, end: number } | null {
  // Get text before the selection within the container
  const rangeBefore = document.createRange();
  rangeBefore.setStart(container, 0);
  rangeBefore.setEnd(range.startContainer, range.startOffset);
  const textBefore = rangeBefore.toString();
  
  // Count occurrences of the selected text in the text before it
  let occurrenceCount = 0;
  let pos = 0;
  while (true) {
    pos = textBefore.indexOf(selectedText, pos);
    if (pos >= 0) {
      occurrenceCount++;
      pos += selectedText.length;
    } else {
      break;
    }
  }
  
  // Now find the (occurrenceCount + 1)-th occurrence in the raw string
  let rawPos = -1;
  for (let i = 0; i <= occurrenceCount; i++) {
    rawPos = rawString.indexOf(selectedText, rawPos + 1);
    if (rawPos === -1) return null;
  }
  
  return {
    start: rawPos,
    end: rawPos + selectedText.length
  };
}

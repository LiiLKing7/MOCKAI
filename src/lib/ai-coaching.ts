import { ReadingPart } from "@/data/reading-test-1";

export interface Mistake {
  questionId: string;
  partId: string;
  questionIndex: number;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export interface MistakeGroup {
  taskType: string;
  mistakes: Mistake[];
}

export interface AICoachingPattern {
  title: string;
  explanation: string;
  exampleQuestionId: string;
}

export function groupMistakesByTaskType(parts: ReadingPart[], answers: Record<string, string>): MistakeGroup[] {
  const groups: Record<string, Mistake[]> = {};

  parts.forEach((part) => {
    const taskType = part.taskType;
    if (!groups[taskType]) {
      groups[taskType] = [];
    }

    if (part.taskType === "short-text-mc") {
      part.items.forEach((item, index) => {
        const userAnswer = answers[item.id]?.toLowerCase().trim() || "";
        const correctAnswer = item.correctAnswer.toLowerCase().trim();
        if (userAnswer !== correctAnswer) {
          groups[taskType].push({
            questionId: item.id,
            partId: part.id,
            questionIndex: index,
            prompt: item.question,
            userAnswer: answers[item.id] || "No answer",
            correctAnswer: item.correctAnswer,
            explanation: item.explanation
          });
        }
      });
    } else if (part.taskType === "matching-headings") {
      part.questions.forEach((q, index) => {
        const userAnswer = answers[q.id]?.toLowerCase().trim() || "";
        const correctAnswer = q.correctAnswer.toLowerCase().trim();
        if (userAnswer !== correctAnswer) {
          const para = part.paragraphs.find(p => p.id === q.paragraphId);
          groups[taskType].push({
            questionId: q.id,
            partId: part.id,
            questionIndex: index,
            prompt: para ? para.text : "Match heading",
            userAnswer: answers[q.id] || "No answer",
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          });
        }
      });
    } else if (part.taskType === "matching") {
      part.questions.forEach((q, index) => {
        const userAnswer = answers[q.id]?.toLowerCase().trim() || "";
        const correctAnswer = q.correctAnswer.toLowerCase().trim();
        if (userAnswer !== correctAnswer) {
          const person = part.people.find(p => p.id === q.personId);
          groups[taskType].push({
            questionId: q.id,
            partId: part.id,
            questionIndex: index,
            prompt: person ? person.description : "Match information",
            userAnswer: answers[q.id] || "No answer",
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          });
        }
      });
    } else {
      // For long-text-mc, gapped-text, cloze-mc, inline-gap-fill
      part.questions.forEach((q, index) => {
        const userAnswer = answers[q.id]?.toLowerCase().trim() || "";
        const correctAnswer = q.correctAnswer.toLowerCase().trim();
        if (userAnswer !== correctAnswer) {
          let promptStr = "Question";
          if ("prompt" in q) promptStr = (q as any).prompt;
          else if ("gapNumber" in q) promptStr = `Gap ${(q as any).gapNumber}`;

          groups[taskType].push({
            questionId: q.id,
            partId: part.id,
            questionIndex: index,
            prompt: promptStr,
            userAnswer: answers[q.id] || "No answer",
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          });
        }
      });
    }
  });

  // Only return groups with 2 or more mistakes
  return Object.keys(groups)
    .filter(taskType => groups[taskType].length >= 2)
    .map(taskType => ({
      taskType,
      mistakes: groups[taskType]
    }));
}

const PART_TYPE_GUIDELINES: Record<string, string> = {
  "inline-gap-fill": "common real mistakes here are picking a word with the wrong grammatical form (wrong part of speech, wrong verb tense, singular/plural mismatch) even when the meaning seems close, or misreading the tone/purpose of a short notice (missing a negation like 'do not...' or misunderstanding formal/informal register). Look for these specifically.",
  "matching": "common real mistakes are getting misled by a distractor statement that reuses vocabulary from a text but doesn't actually match its meaning, or forcing a match for a statement that's actually one of the intentional non-matching distractors, or missing a paraphrase/synonym connection between the statement and the text.",
  "matching-headings": "common real mistakes are picking a heading that reflects a small supporting detail rather than the paragraph's overall main idea, or being misled by a distractor heading that reuses paragraph vocabulary out of context, or not reading the paragraph's opening/closing sentences where the main idea is usually concentrated.",
  "long-text-mc": "common real mistakes are confusing 'False' with 'Not Given' (marking something false when the text simply never mentions it), or picking a multiple-choice distractor that closely paraphrases the text but subtly changes its meaning, or answering based on an isolated keyword match instead of the sentence's actual meaning.",
};

export async function analyzeMistakePattern(group: MistakeGroup): Promise<AICoachingPattern> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not set.");
  }

  const guideline = PART_TYPE_GUIDELINES[group.taskType] || "Identify a specific pattern from the mistakes given.";

  const mistakesData = group.mistakes.map(m => `
Question ID: ${m.questionId}
Prompt/Context: ${m.prompt}
User's Answer: ${m.userAnswer}
Correct Answer: ${m.correctAnswer}
Explanation: ${m.explanation}
  `).join("\n---");

  const promptText = `
You are an expert English teacher coaching a student in English on their CEFR Multilevel Reading test.
The user made the following mistakes in the "${group.taskType}" section.

GUIDELINES FOR THIS SECTION: ${guideline}

Analyze these mistakes to find a recurring strategic pattern. DO NOT just say "you got these wrong". 
Find the specific reason (e.g., falling for distractors, ignoring context, grammar form mismatch, confusing False with Not Given).
If there is no clear pattern, explain the most prominent mistake gracefully.

Output ONLY a JSON object with the following structure, and nothing else (no markdown fences, no extra text):
{
  "title": "Short title of the mistake pattern in English (e.g. 'Ignoring Distractor Words')",
  "explanation": "A 2-3 sentence explanation and general tip in English. Keep it encouraging and coaching.",
  "exampleQuestionId": "The Question ID of one specific mistake that best exemplifies this pattern (e.g. '${group.mistakes[0].questionId}')"
}

Mistakes:
${mistakesData}
  `;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: promptText }]
      }],
      generationConfig: {
        temperature: 0.2,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // 1. Safe JSON Parsing: Clean markdown fences
  text = text.trim();
  if (text.startsWith("```json")) {
    text = text.substring(7);
  } else if (text.startsWith("```")) {
    text = text.substring(3);
  }
  if (text.endsWith("```")) {
    text = text.substring(0, text.length - 3);
  }
  text = text.trim();

  try {
    const parsed = JSON.parse(text) as AICoachingPattern;
    
    // 2. Validate exampleQuestionId
    const isValidId = group.mistakes.some(m => m.questionId === parsed.exampleQuestionId);
    if (!isValidId) {
      console.warn(`AI returned invalid exampleQuestionId: ${parsed.exampleQuestionId}. Falling back to first mistake.`);
      parsed.exampleQuestionId = group.mistakes[0].questionId;
    }
    
    return parsed;
  } catch (error) {
    console.error("Failed to parse AI response:", text);
    throw new Error("Failed to parse AI response as JSON.");
  }
}

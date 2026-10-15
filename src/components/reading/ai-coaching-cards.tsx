import { useState, useEffect } from "react";
import { ReadingPart } from "@/data/reading-test-1";
import { BilimIcon } from "@/components/ui/bilim-icon";
import { groupMistakesByTaskType, analyzeMistakePattern, AICoachingPattern, MistakeGroup } from "@/lib/ai-coaching";

interface AICoachingCardsProps {
  parts: ReadingPart[];
  answers: Record<string, string>;
  onReviewQuestion: (partId: string, questionIndex: number) => void;
}

export function AICoachingCards({ parts, answers, onReviewQuestion }: AICoachingCardsProps) {
  const [loading, setLoading] = useState(true);
  const [coachingResults, setCoachingResults] = useState<{ group: MistakeGroup; pattern: AICoachingPattern }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const groups = groupMistakesByTaskType(parts, answers);
  const totalMistakes = parts.reduce((acc, part) => {
    let wrong = 0;
    if (part.taskType === "short-text-mc") {
      part.items.forEach((i) => {
        if ((answers[i.id]?.toLowerCase().trim() || "") !== i.correctAnswer.toLowerCase().trim()) wrong++;
      });
    } else {
      part.questions.forEach((q) => {
        if ((answers[q.id]?.toLowerCase().trim() || "") !== q.correctAnswer.toLowerCase().trim()) wrong++;
      });
    }
    return acc + wrong;
  }, 0);

  useEffect(() => {
    async function fetchCoaching() {
      if (groups.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await Promise.allSettled(groups.map((g) => analyzeMistakePattern(g)));
        const successfulResults: { group: MistakeGroup; pattern: AICoachingPattern }[] = [];
        let anyFailed = false;

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            successfulResults.push({ group: groups[index], pattern: result.value });
          } else {
            console.error("Failed to analyze group:", groups[index].taskType, result.reason);
            anyFailed = true;
          }
        });

        setCoachingResults(successfulResults);

        if (successfulResults.length === 0 && anyFailed) {
          setError("Tahlil jarayonida xatolik yuz berdi.");
        }
      } catch (err: any) {
        setError(err.message || "Tahlil jarayonida xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    }

    fetchCoaching();
  }, []);

  const getTaskTypeName = (taskType: string) => {
    const names: Record<string, string> = {
      "inline-gap-fill": "Part 1: Gap Fill",
      matching: "Part 2: Matching Information",
      "matching-headings": "Part 3: Matching Headings",
      "long-text-mc": "Part 4 & 5: Reading Comprehension",
    };
    return names[taskType] || taskType;
  };

  if (totalMistakes === 0) {
    return (
      <div className="paper-box p-6 bg-[var(--paper-g)] text-[var(--paper-on)] flex flex-col items-center text-center gap-2">
        <BilimIcon name="star" size={36} />
        <h3 className="text-xl font-black">Ajoyib Natija!</h3>
        <p className="text-sm font-bold opacity-90 max-w-md">
          Barcha savollarga to'g'ri javob berdingiz. Shunday davom eting!
        </p>
      </div>
    );
  }

  if (groups.length === 0 && totalMistakes > 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="paper-box p-6 bg-[var(--paper-soft)] flex items-center justify-center gap-3">
        <BilimIcon name="bulb" size={28} />
        <span className="font-extrabold text-sm text-[var(--paper-ink)]">
          AI Murabbiy xatolaringizni tahlil qilmoqda...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <BilimIcon name="bulb" size={24} />
        <h3 className="text-xl font-black text-[var(--paper-ink)]">
          AI Murabbiy Tavsiyalari:
        </h3>
      </div>

      {error && coachingResults.length === 0 && (
        <div className="p-4 rounded-xl border-2 border-[var(--paper-ink)] bg-[var(--paper-r)] text-[var(--paper-on)] font-bold text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {coachingResults.map((result, idx) => {
          const { group, pattern } = result;
          const mistakeObj =
            group.mistakes.find((m) => m.questionId === pattern.exampleQuestionId) || group.mistakes[0];

          return (
            <div
              key={idx}
              className="paper-box p-5 bg-[var(--paper-card)] flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="paper-badge paper-badge-purple text-xs font-black mb-2">
                  {getTaskTypeName(group.taskType)}
                </span>
                <h4 className="text-lg font-black text-[var(--paper-ink)] mt-1 mb-2">
                  {pattern.title}
                </h4>
                <p className="text-sm font-semibold leading-relaxed text-[var(--paper-mut)]">
                  {pattern.explanation}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onReviewQuestion(mistakeObj.partId, mistakeObj.questionIndex)}
                className="paper-btn paper-btn-out paper-btn-sm w-full font-black mt-2"
              >
                Misolni ko'rish →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

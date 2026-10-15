import { useEffect, useRef } from "react";
import { ReadingPart } from "@/data/reading-test-1";
import { BilimIcon } from "@/components/ui/bilim-icon";
import { ViewState } from "../../App";
import { AICoachingCards } from "@/components/reading/ai-coaching-cards";
import { saveTestResult } from "@/lib/storage";

interface ResultsSummaryProps {
  parts: ReadingPart[];
  answers: Record<string, string>;
  onNavigate: (view: ViewState) => void;
  onReview?: () => void;
  onReviewQuestion?: (partId: string, questionIndex: number) => void;
}

export function ResultsSummary({
  parts,
  answers,
  onNavigate,
  onReview,
  onReviewQuestion,
}: ResultsSummaryProps) {
  const hasSavedRef = useRef(false);
  let totalOverallQuestions = 0;
  let totalOverallCorrect = 0;

  const partScores = parts.map((part) => {
    let partTotal = 0;
    let partCorrect = 0;

    if (part.taskType === "short-text-mc") {
      partTotal = part.items.length;
      part.items.forEach((item) => {
        const userAnswer = answers[item.id]?.toLowerCase().trim() || "";
        const correctAnswer = item.correctAnswer.toLowerCase().trim();
        if (userAnswer === correctAnswer) partCorrect++;
      });
    } else {
      partTotal = part.questions.length;
      part.questions.forEach((q) => {
        const userAnswer = answers[q.id]?.toLowerCase().trim() || "";
        const correctAnswer = q.correctAnswer.toLowerCase().trim();
        if (userAnswer === correctAnswer) partCorrect++;
      });
    }

    totalOverallQuestions += partTotal;
    totalOverallCorrect += partCorrect;

    return {
      partNumber: part.partNumber,
      title: part.title,
      correct: partCorrect,
      total: partTotal,
    };
  });

  const percentage =
    totalOverallQuestions > 0 ? Math.round((totalOverallCorrect / totalOverallQuestions) * 100) : 0;

  useEffect(() => {
    if (!hasSavedRef.current && totalOverallQuestions > 0) {
      hasSavedRef.current = true;
      saveTestResult({
        testType: "reading",
        title: "CEFR Reading Mock Test",
        score: totalOverallCorrect,
        total: totalOverallQuestions,
        percentage,
        details: {
          breakdown: partScores.map((ps) => ({
            partNumber: ps.partNumber,
            title: ps.title,
            correct: ps.correct,
            total: ps.total,
          })),
        },
      });
    }
  }, [percentage, totalOverallCorrect, totalOverallQuestions]);

  return (
    <div className="reading-paper-container min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 py-12">
      <div className="w-full max-w-3xl paper-box p-6 sm:p-10 space-y-8 bg-[var(--paper-card)]">
        
        {/* Top Header & Logo */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2">
            <span className="paper-badge paper-badge-yellow">
              <BilimIcon name="trophy" size={18} />
              <span>CEFR Reading Mock Natijalari</span>
            </span>
          </div>

          <div className="relative mt-2">
            <div className="w-28 h-28 rounded-full border-3 border-[var(--paper-ink)] bg-[var(--paper-y)] shadow-[5px_5px_0_var(--paper-ink)] flex flex-col items-center justify-center rotate-[-3deg] hover:rotate-[3deg] transition-transform">
              <span className="text-4xl font-black text-[var(--paper-on)]">{percentage}%</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-[var(--paper-mut)]">
                Aniqlik
              </span>
            </div>
            <img src="/logo.svg" alt="MockAi" className="absolute -top-3 -right-5 w-10 h-10 select-none" />
          </div>

          <div className="space-y-1.5 pt-2">
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--paper-ink)] paper-scribble inline-block">
              Test Muvaffaqiyatli Yakunlandi!
            </h1>
            <p className="text-lg font-bold text-[var(--paper-mut)]">
              Umumiy natijangiz: <span className="text-[var(--paper-ink)]">{totalOverallCorrect}</span> / {totalOverallQuestions} ta to'g'ri
            </p>
          </div>
        </div>

        {/* Results by Part */}
        <div className="space-y-4 pt-2 border-t-2 border-[var(--paper-ink)]">
          <h2 className="text-lg font-black text-[var(--paper-ink)] flex items-center gap-2">
            <BilimIcon name="bar" size={20} />
            <span>Bo'limlar bo'yicha tahlil:</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {partScores.map((score) => (
              <div
                key={score.partNumber}
                className="p-4 rounded-2xl border-2 border-[var(--paper-ink)] bg-[var(--paper-soft)] shadow-[2px_2px_0_var(--paper-ink)] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="paper-badge paper-badge-yellow text-xs font-black">
                    Part {score.partNumber}
                  </span>
                  <span className="font-extrabold text-sm text-[var(--paper-ink)] truncate max-w-[140px]">
                    {score.title}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs font-black text-emerald-700">
                    <BilimIcon name="check" size={16} />
                    <span>{score.correct}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-black text-rose-600">
                    <BilimIcon name="close" size={16} />
                    <span>{score.total - score.correct}</span>
                  </div>
                  <span className="text-xs font-black text-[var(--paper-mut)] ml-1">
                    {Math.round((score.correct / score.total) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Coaching Cards */}
        {onReviewQuestion && (
          <div className="pt-2">
            <AICoachingCards parts={parts} answers={answers} onReviewQuestion={onReviewQuestion} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-6 border-t-2 border-[var(--paper-ink)] flex flex-col sm:flex-row items-center gap-4">
          {onReview && (
            <button
              type="button"
              onClick={onReview}
              className="paper-btn paper-btn-yellow w-full sm:flex-1 h-12 text-base font-black shadow-[4px_4px_0_var(--paper-ink)] flex items-center justify-center gap-2"
            >
              <BilimIcon name="pencil" size={20} />
              <span>Javoblarni ko'rib chiqish</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="paper-btn paper-btn-out w-full sm:flex-1 h-12 text-base font-black shadow-[4px_4px_0_var(--paper-ink)] flex items-center justify-center gap-2"
          >
            <BilimIcon name="home" size={20} />
            <span>Bosh sahifaga qaytish</span>
          </button>
        </div>

      </div>
    </div>
  );
}

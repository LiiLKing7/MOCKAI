"use client";

import React from "react";
import { ReadingPart } from "@/data/reading-test-1";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { BilimIcon } from "@/components/ui/bilim-icon";
import { cn } from "@/lib/utils";

interface QuestionPanelProps {
  part: ReadingPart;
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  isReviewMode?: boolean;
  reviewQuestionIndex?: number;
  setReviewQuestionIndex?: (index: number) => void;
  activeQuestionIndex?: number;
  setActiveQuestionIndex?: (index: number) => void;
}

export function QuestionPanel({
  part,
  answers,
  onAnswerChange,
  isReviewMode = false,
  reviewQuestionIndex = 0,
  activeQuestionIndex = 0,
  setActiveQuestionIndex,
}: QuestionPanelProps) {
  const getQuestions = () => {
    if (part.taskType === "short-text-mc") return part.items;
    if (part.taskType === "matching") return part.questions;
    if (part.taskType === "matching-headings") return part.questions;
    return (part as any).questions || [];
  };

  const allQuestions = getQuestions();
  const visibleQuestions = isReviewMode ? [allQuestions[reviewQuestionIndex]] : allQuestions;
  const questionRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    if (isReviewMode || !setActiveQuestionIndex) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let mostVisibleIndex = -1;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleIndex = Number(entry.target.getAttribute("data-index"));
          }
        });
        if (mostVisibleIndex !== -1) {
          setActiveQuestionIndex(mostVisibleIndex);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -40% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    questionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [visibleQuestions, isReviewMode, setActiveQuestionIndex]);

  const renderReviewFeedback = (question: any, answer: string) => {
    if (!isReviewMode) return null;
    const isCorrect = answer === question.correctAnswer;
    const isUnanswered = !answer;

    return (
      <div className="mt-8 space-y-4">
        <div
          className={cn(
            "p-4 rounded-2xl border-3 border-[var(--paper-ink)] shadow-[3px_3px_0_var(--paper-ink)] flex items-start gap-3",
            isCorrect
              ? "bg-[var(--paper-g)] text-[var(--paper-ink)]"
              : isUnanswered
              ? "bg-[var(--paper-soft)] text-[var(--paper-mut)]"
              : "bg-[var(--paper-r)] text-[var(--paper-ink)]"
          )}
        >
          <div className="shrink-0 mt-0.5">
            {isCorrect ? (
              <BilimIcon name="check" size={24} />
            ) : isUnanswered ? (
              <BilimIcon name="quiz" size={24} />
            ) : (
              <BilimIcon name="close" size={24} />
            )}
          </div>
          <div>
            <p className="font-extrabold text-base">
              {isCorrect
                ? "To'g'ri javob!"
                : isUnanswered
                ? `Javob berilmagan (To'g'ri javob: ${question.correctAnswer})`
                : `Noto'g'ri (To'g'ri javob: ${question.correctAnswer})`}
            </p>
          </div>
        </div>

        {question.explanation && (
          <div className="paper-box p-5 bg-[var(--paper-card)] space-y-2">
            <div className="flex items-center gap-2">
              <BilimIcon name="bulb" size={22} />
              <span className="font-black text-sm uppercase tracking-wide text-[var(--paper-ink)]">
                Tushuntirish / Explanation:
              </span>
            </div>
            <p className="text-base font-semibold leading-relaxed text-[var(--paper-ink)]">
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    );
  };

  const getOptionClasses = (q: any, opt: string, isSelected: boolean) => {
    if (!isReviewMode) {
      return isSelected ? "selected" : "";
    }
    if (opt === q.correctAnswer) {
      return "ok";
    }
    if (isSelected && opt !== q.correctAnswer) {
      return "no";
    }
    return "opacity-40 grayscale pointer-events-none";
  };

  return (
    <div className={cn(isReviewMode ? "w-full" : "space-y-4")}>
      {/* Inline Gap Fill (Part 1 - cloze gap filling) */}
      {part.taskType === "inline-gap-fill" && (
        <div className="paper-box p-5 sm:p-7 md:p-8 bg-[var(--paper-card)] h-full flex flex-col justify-center overflow-y-auto">
          <div className="text-[15px] sm:text-[16px] lg:text-[17px] leading-[2.1] text-[var(--paper-ink)] font-semibold select-text">
            {(part as any).textWithGaps.split(/(\[GAP-\d+\])/).map((segment: string, i: number) => {
              const match = segment.match(/\[GAP-(\d+)\]/);
              if (match) {
                const gapNum = parseInt(match[1], 10);
                const q = (part as any).questions.find((x: any) => x.gapNumber === gapNum);
                if (!q) return segment;
                const val = answers[q.id] || "";

                if (isReviewMode) {
                  const isCorrect = val.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
                  return (
                    <span key={i} className="inline-flex flex-col items-center relative align-middle mx-1 my-0.5">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-2 sm:border-3 border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)] bg-[var(--paper-card)]">
                        <span className={cn("font-black text-sm", isCorrect ? "text-emerald-700" : "text-rose-600 line-through")}>
                          {val || "—"}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-[var(--paper-y)] border border-[var(--paper-ink)]">
                          {gapNum}
                        </span>
                      </span>
                      {!isCorrect && (
                        <span className="text-[11px] font-black text-emerald-700 mt-0.5">
                          ✓ {q.correctAnswer}
                        </span>
                      )}
                    </span>
                  );
                }

                return (
                  <span key={i} className="inline-flex items-center gap-1 align-middle mx-1.5 my-0.5">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => onAnswerChange(q.id, e.target.value)}
                      placeholder="..."
                      className="w-28 sm:w-36 h-9 sm:h-10 px-2.5 py-1 rounded-xl border-2 sm:border-3 border-[var(--paper-ink)] bg-[var(--paper)] text-[var(--paper-ink)] font-black text-center text-sm sm:text-base shadow-[2px_2px_0_var(--paper-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--paper-o)] transition-all"
                    />
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[var(--paper-y)] border border-[var(--paper-ink)] shadow-[1px_1px_0_var(--paper-ink)]">
                      {gapNum}
                    </span>
                  </span>
                );
              }
              return <span key={i}>{segment}</span>;
            })}
          </div>

          {isReviewMode && (
            <div className="mt-8 space-y-4 pt-6 border-t-2 border-[var(--paper-ink)]">
              <h4 className="font-black text-lg text-[var(--paper-ink)] flex items-center gap-2">
                <BilimIcon name="bulb" size={20} />
                <span>Barcha javoblar va tushuntirishlar:</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(part as any).questions.map((q: any) => {
                  const val = answers[q.id] || "";
                  const isCorrect = val.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "p-4 rounded-xl border-2 border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)]",
                        isCorrect ? "bg-[var(--paper-g)]" : "bg-[var(--paper-r)]"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-sm">Gap #{q.gapNumber}:</span>
                        <span className="font-black text-base">{q.correctAnswer}</span>
                      </div>
                      <p className="text-xs font-semibold opacity-90">{q.explanation}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Matching Headings (Part 3) */}
      {part.taskType === "matching-headings" && (
        <div className="space-y-6">
          <div className="paper-box p-5 bg-[var(--paper-soft)] space-y-3">
            <h4 className="font-black text-sm uppercase tracking-wide text-[var(--paper-ink)] flex items-center gap-2">
              <BilimIcon name="target" size={20} />
              <span>Mavjud sarlavhalar ro'yxati (Headings):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(part as any).headings.map((h: any) => (
                <div
                  key={h.letter}
                  className="p-2.5 rounded-xl border-2 border-[var(--paper-ink)] bg-[var(--paper-card)] flex items-center gap-2.5 shadow-[2px_2px_0_var(--paper-ink)]"
                >
                  <span className="paper-badge paper-badge-yellow text-xs font-black px-2 py-0.5">
                    {h.letter}
                  </span>
                  <span className="text-sm font-bold text-[var(--paper-ink)]">{h.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {(part as any).paragraphs.map((para: any, index: number) => {
              const q = allQuestions.find((x: any) => x.paragraphId === para.id);
              if (!q) return null;
              if (isReviewMode && reviewQuestionIndex !== undefined && reviewQuestionIndex !== index) return null;

              return (
                <div key={para.id} className="paper-box p-6 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="paper-badge paper-badge-purple">
                      <BilimIcon name="quiz" size={16} />
                      <span>Paragraf {para.paragraphNumber} uchun sarlavha</span>
                    </span>
                  </div>

                  <div className="text-base sm:text-lg text-[var(--paper-ink)] font-semibold leading-relaxed">
                    {para.text}
                  </div>

                  <div className="pt-4 border-t-2 border-[var(--paper-ink)]">
                    <label className="block text-sm font-black mb-2 text-[var(--paper-ink)]">
                      Mos sarlavhani tanlang:
                    </label>
                    <Select
                      value={answers[q.id] || ""}
                      onValueChange={(val) => val !== null && onAnswerChange(q.id, val)}
                      disabled={isReviewMode}
                    >
                      <SelectTrigger className="paper-box h-12 text-base w-full max-w-md font-extrabold cursor-pointer">
                        <SelectValue placeholder="Sarlavhani tanlang..." />
                      </SelectTrigger>
                      <SelectContent className="paper-box bg-[var(--paper-card)] border-3 border-[var(--paper-ink)] shadow-[4px_4px_0_var(--paper-ink)]">
                        {(part as any).headings.map((h: any) => (
                          <SelectItem key={h.letter} value={h.letter} className="text-base py-2.5 font-bold cursor-pointer hover:bg-[var(--paper-y)]">
                            <span className="font-black mr-2">[{h.letter}]</span> {h.text}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {renderReviewFeedback(q, answers[q.id] || "")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sentences list for Gapped Text */}
      {part.taskType === "gapped-text" && (
        <div className="paper-box p-5 bg-[var(--paper-soft)] mb-6 space-y-3">
          <h4 className="font-black text-sm uppercase tracking-wide text-[var(--paper-ink)] flex items-center gap-2">
            <BilimIcon name="pencil" size={20} />
            <span>Mavjud jumlalar (Sentences):</span>
          </h4>
          <div className="space-y-2">
            {part.sentences.map((s) => (
              <div
                key={s.letter}
                className="p-3 rounded-xl border-2 border-[var(--paper-ink)] bg-[var(--paper-card)] flex items-start gap-3 shadow-[2px_2px_0_var(--paper-ink)]"
              >
                <span className="paper-badge paper-badge-yellow text-xs font-black px-2.5 py-0.5 mt-0.5 shrink-0">
                  {s.letter}
                </span>
                <span className="text-sm font-bold text-[var(--paper-ink)] leading-snug">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Multiple Choice & Matching Questions */}
      {part.taskType !== "inline-gap-fill" &&
        part.taskType !== "matching-headings" &&
        visibleQuestions.map((q, index) => {
          const absoluteIndex = allQuestions.findIndex((x) => x.id === q.id);
          const promptNode =
            (q as any).question ||
            (q as any).prompt ||
            (part.taskType === "matching"
              ? (part as any).people.find((p: any) => p.id === (q as any).personId)?.description
              : null);

          const isActive = !isReviewMode && activeQuestionIndex === index;

          return (
            <div
              key={q.id}
              data-index={index}
              ref={(el) => {
                questionRefs.current[index] = el;
              }}
              className={cn(
                "paper-box p-6 mb-6 transition-all duration-200",
                isActive && "ring-3 ring-[var(--paper-o)] scale-[1.01]"
              )}
            >
              <div className="flex items-start gap-3.5 mb-5">
                <span className="paper-badge paper-badge-orange text-sm font-black px-3 py-1 shrink-0">
                  #{part.taskType === "gapped-text" ? (q as any).gapNumber : absoluteIndex + 1}
                </span>
                {promptNode && (
                  <h3 className="font-extrabold text-base sm:text-lg text-[var(--paper-ink)] leading-snug pt-0.5">
                    {promptNode}
                  </h3>
                )}
              </div>

              {/* Options for Multiple Choice */}
              {(q as any).options ? (
                <div className="space-y-3">
                  {(q as any).options.map((opt: string, i: number) => {
                    const isSelected = answers[q.id] === opt;
                    const optClass = getOptionClasses(q, opt, isSelected);

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => !isReviewMode && onAnswerChange(q.id, opt)}
                        disabled={isReviewMode}
                        className={cn("paper-opt flex items-center justify-between gap-4", optClass)}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "w-7 h-7 rounded-full border-2 border-[var(--paper-ink)] flex items-center justify-center font-black text-xs shrink-0 shadow-[1px_1px_0_var(--paper-ink)]",
                              isSelected ? "bg-[var(--paper-o)] text-white" : "bg-[var(--paper-soft)]"
                            )}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-sm sm:text-base font-bold text-[var(--paper-ink)] text-left">
                            {opt}
                          </span>
                        </div>

                        {isReviewMode && opt === (q as any).correctAnswer && (
                          <BilimIcon name="check" size={22} className="shrink-0" />
                        )}
                        {isReviewMode && isSelected && opt !== (q as any).correctAnswer && (
                          <BilimIcon name="close" size={22} className="shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : part.taskType === "matching" ? (
                /* Matching Select (Part 5) */
                <div className="mt-4 p-4 rounded-2xl bg-[var(--paper-soft)] border-2 border-[var(--paper-ink)]">
                  <label className="block text-sm font-extrabold text-[var(--paper-ink)] mb-2">
                    Mos keluvchi matn harfini tanlang:
                  </label>
                  <Select
                    value={answers[q.id] || ""}
                    onValueChange={(val) => val !== null && onAnswerChange(q.id, val)}
                    disabled={isReviewMode}
                  >
                    <SelectTrigger className="paper-box h-12 text-base font-black cursor-pointer bg-[var(--paper-card)]">
                      <SelectValue placeholder="Matnni tanlang..." />
                    </SelectTrigger>
                    <SelectContent className="paper-box bg-[var(--paper-card)] border-3 border-[var(--paper-ink)] shadow-[4px_4px_0_var(--paper-ink)]">
                      {(part as any).texts.map((t: any) => (
                        <SelectItem key={t.id} value={t.letter} className="text-base py-2.5 font-bold cursor-pointer hover:bg-[var(--paper-y)]">
                          <span className="font-black mr-2">[{t.letter}]</span> {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : part.taskType === "gapped-text" ? (
                /* Gapped Text Select (Part 4) */
                <div className="mt-4 p-4 rounded-2xl bg-[var(--paper-soft)] border-2 border-[var(--paper-ink)]">
                  <label className="block text-sm font-extrabold text-[var(--paper-ink)] mb-2">
                    Bo'sh o'ringa mos jumla harfini tanlang:
                  </label>
                  <Select
                    value={answers[q.id] || ""}
                    onValueChange={(val) => val !== null && onAnswerChange(q.id, val)}
                    disabled={isReviewMode}
                  >
                    <SelectTrigger className="paper-box h-12 text-base font-black cursor-pointer bg-[var(--paper-card)]">
                      <SelectValue placeholder="Jumlani tanlang..." />
                    </SelectTrigger>
                    <SelectContent className="paper-box bg-[var(--paper-card)] border-3 border-[var(--paper-ink)] shadow-[4px_4px_0_var(--paper-ink)]">
                      {(part as any).sentences.map((s: any) => (
                        <SelectItem key={s.letter} value={s.letter} className="text-base py-2.5 font-bold cursor-pointer hover:bg-[var(--paper-y)]">
                          <span className="font-black mr-2">[{s.letter}]</span> {s.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                /* One Word / Number Input */
                <div className="mt-4 space-y-2">
                  <input
                    type="text"
                    value={answers[q.id] || ""}
                    onChange={(e) => onAnswerChange(q.id, e.target.value)}
                    placeholder="Bitta so'z yoki raqam yozing..."
                    disabled={isReviewMode}
                    className="w-full h-12 px-4 rounded-xl border-3 border-[var(--paper-ink)] bg-[var(--paper-card)] text-[var(--paper-ink)] font-black shadow-[3px_3px_0_var(--paper-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--paper-o)]"
                  />
                </div>
              )}

              {renderReviewFeedback(q, answers[q.id] || "")}
            </div>
          );
        })}
    </div>
  );
}

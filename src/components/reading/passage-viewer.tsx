"use client";

import type React from "react";
import { useRef } from "react";
import { ReadingPart } from "@/data/reading-test-1";
import { renderGappedTextWithHighlights } from "@/lib/highlight-parser";
import { BilimIcon } from "@/components/ui/bilim-icon";
import { cn } from "@/lib/utils";

interface PassageViewerProps {
  part: ReadingPart;
  isReviewMode?: boolean;
  reviewQuestionIndex?: number;
  activeQuestionIndex?: number;
  userAnswers?: Record<string, string>;
}

export function PassageViewer({
  part,
  isReviewMode,
  reviewQuestionIndex,
  activeQuestionIndex,
  userAnswers,
}: PassageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderContent = () => {
    switch (part.taskType) {
      case "short-text-mc": {
        return (
          <div className="space-y-6">
            {part.items.map((item, index) => {
              if (isReviewMode && index !== reviewQuestionIndex) return null;
              const isActive = !isReviewMode && activeQuestionIndex === index;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "paper-box p-5 transition-all duration-200",
                    isActive
                      ? "ring-2 ring-[var(--paper-o)] scale-[1.01]"
                      : "opacity-90 hover:opacity-100"
                  )}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="paper-badge paper-badge-yellow">
                      <BilimIcon name="book" size={16} />
                      <span>Matn #{index + 1}</span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--paper-mut)]">
                      Part 1 · Savol {index + 1}
                    </span>
                  </div>
                  <div className="text-base sm:text-lg leading-relaxed text-[var(--paper-ink)] font-semibold">
                    {renderGappedTextWithHighlights(item.text, [])}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      case "matching-headings": {
        return (
          <div className="space-y-6">
            {(part as any).paragraphs.map((para: any) => (
              <div key={para.id} className="paper-box p-6 transition-all duration-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="paper-badge paper-badge-purple">
                    <BilimIcon name="quiz" size={16} />
                    <span>Paragraf {para.paragraphNumber}</span>
                  </span>
                </div>
                <div className="text-base sm:text-lg text-[var(--paper-ink)] leading-relaxed font-semibold whitespace-pre-wrap">
                  {renderGappedTextWithHighlights(para.text, [])}
                </div>
              </div>
            ))}
          </div>
        );
      }

      case "matching": {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {part.texts.map((text) => (
              <div
                key={text.id}
                className="paper-box p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-3 border-b-2 border-[var(--paper-ink)] pb-2">
                  <span className="paper-badge paper-badge-yellow text-base font-black px-3 py-1">
                    {text.letter}
                  </span>
                  <h4 className="font-extrabold uppercase text-sm text-[var(--paper-ink)] tracking-tight">
                    {text.title}
                  </h4>
                </div>
                <div className="text-sm sm:text-base leading-relaxed text-[var(--paper-ink)] font-medium">
                  {text.text}
                </div>
              </div>
            ))}
          </div>
        );
      }

      case "long-text-mc": {
        return (
          <div className="paper-box p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 border-b-2 border-[var(--paper-ink)] pb-3">
              <span className="paper-badge paper-badge-green">
                <BilimIcon name="book" size={18} />
                <span>Asosiy Matn</span>
              </span>
              <span className="text-xs font-bold text-[var(--paper-mut)] ml-auto uppercase tracking-wider">
                Comprehension Passage
              </span>
            </div>
            <div className="text-base sm:text-lg text-[var(--paper-ink)] leading-relaxed font-medium whitespace-pre-wrap">
              {renderGappedTextWithHighlights(part.passage, [])}
            </div>
          </div>
        );
      }

      case "gapped-text":
      case "cloze-mc": {
        return (
          <div className="paper-box p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 border-b-2 border-[var(--paper-ink)] pb-3">
              <span className="paper-badge paper-badge-blue">
                <BilimIcon name="pencil" size={18} />
                <span>Bo'sh o'rinli matn</span>
              </span>
              <span className="text-xs font-bold text-[var(--paper-mut)] ml-auto uppercase tracking-wider">
                Gapped Passage
              </span>
            </div>
            <div className="text-base sm:text-lg text-[var(--paper-ink)] leading-relaxed font-medium">
              {renderGappedTextWithHighlights(part.passageWithGaps, [])}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div translate="no" className="relative h-full" ref={containerRef}>
      {renderContent()}
    </div>
  );
}

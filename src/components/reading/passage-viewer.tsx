"use client";

import type React from "react";
import { useRef } from "react";
import { ReadingPart } from "@/data/reading-test-1";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { renderGappedTextWithHighlights } from "@/lib/highlight-parser";
import { cn } from "@/lib/utils";

interface PassageViewerProps {
  part: ReadingPart;
  isReviewMode?: boolean;
  reviewQuestionIndex?: number;
  activeQuestionIndex?: number;
  userAnswers?: Record<string, string>;
}

export function PassageViewer({ part, isReviewMode, reviewQuestionIndex, activeQuestionIndex, userAnswers }: PassageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderContent = () => {
    switch (part.taskType) {
      case "short-text-mc": {
        return (
          <div className="space-y-6">
            {part.items.map((item, index) => {
              if (isReviewMode && index !== reviewQuestionIndex) return null;
              return (
                <Card key={item.id} className={cn(
                  "p-4 transition-all duration-300", 
                  (!isReviewMode && activeQuestionIndex === index) ? "bg-muted/50 ring-1 ring-border shadow-sm" : "bg-muted/10 opacity-70"
                )}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-sm text-muted-foreground">Text {index + 1}</div>
                  </div>
                  <div className="text-base leading-relaxed">
                    {renderGappedTextWithHighlights(item.text, [])}
                  </div>
                </Card>
              );
            })}
          </div>
        );
      }
      case "matching-headings": {
        return (
          <div className="space-y-6">
            {(part as any).paragraphs.map((para: any) => (
              <Card key={para.id} className="p-4 transition-all duration-300 bg-card shadow-sm border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="outline" className="text-sm font-semibold px-3 py-1 bg-muted/50 border-border/50">
                    Paragraph {para.paragraphNumber}
                  </Badge>
                </div>
                <div className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                  {renderGappedTextWithHighlights(para.text, [])}
                </div>
              </Card>
            ))}
          </div>
        );
      }
      case "matching": {
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {part.texts.map((text) => (
              <Card key={text.id} className="border-[1.5px] border-black dark:border-white rounded-none bg-white dark:bg-zinc-950 text-black dark:text-white shadow-none transition-all duration-300 relative">
                <div className="flex h-full min-h-[140px]">
                  <div className="w-8 flex-shrink-0 flex justify-center">
                    <span className="font-bold text-lg leading-none mt-1">{text.letter}</span>
                  </div>
                  <div className="w-px bg-black dark:bg-white flex-shrink-0" />
                  <div className="flex-1 p-3 flex flex-col items-center justify-center text-center whitespace-pre-wrap break-words w-[calc(100%-33px)]">
                    <h4 className="font-bold uppercase text-sm mb-1">{text.title}</h4>
                    <div className="text-sm leading-snug">{text.text}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );
      }
      case "long-text-mc": {
        return (
          <Card className="p-6">
            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
              {renderGappedTextWithHighlights(part.passage, [])}
            </div>
          </Card>
        );
      }
      case "gapped-text":
      case "cloze-mc": {
        return (
          <Card className="p-6">
            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed">
              {renderGappedTextWithHighlights(part.passageWithGaps, [])}
            </div>
          </Card>
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

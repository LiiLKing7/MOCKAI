"use client";

import React from "react";
import { ReadingPart } from "@/data/reading-test-1";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CheckCircle2, XCircle, AlertCircle, MinusCircle, HelpCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SmoothInput } from "@/components/ui/skiper-ui/skiper106";

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
  setReviewQuestionIndex,
  activeQuestionIndex = 0,
  setActiveQuestionIndex
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
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleIndex = Number(entry.target.getAttribute('data-index'));
          }
        });
        if (mostVisibleIndex !== -1) {
          setActiveQuestionIndex(mostVisibleIndex);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -40% 0px", // Focus on items near the upper middle
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    questionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [visibleQuestions, isReviewMode, setActiveQuestionIndex]);

  const renderReviewNavigation = () => {
    return null;
  };

  const renderReviewFeedback = (question: any, answer: string) => {
    if (!isReviewMode) return null;
    const isCorrect = answer === question.correctAnswer;
    const isUnanswered = !answer;
    
    return (
      <div className="mt-10">
        <div className="flex items-start gap-3 p-4 rounded-lg mb-8 border-l-4 shadow-sm bg-background border border-border/50">
          <div className="mt-0.5 shrink-0">
            {isCorrect ? <CheckCircle2 className="w-5 h-5 text-success" /> : 
             isUnanswered ? <MinusCircle className="w-5 h-5 text-muted-foreground" /> : 
             <XCircle className="w-5 h-5 text-destructive" />}
          </div>
          <div>
            <p className="font-semibold text-base">
              {isCorrect ? "To'g'ri javob!" : 
               isUnanswered ? `Javob berilmagan (To'g'ri: ${question.correctAnswer})` : 
               `Noto'g'ri (To'g'ri: ${question.correctAnswer})`}
            </p>
          </div>
        </div>
        
        <div className="mb-4 flex items-center gap-2 text-muted-foreground font-semibold border-b pb-2">
          <Lightbulb className="w-5 h-5" />
          <span className="uppercase tracking-wider text-sm">Tushuntirish</span>
        </div>
        <div className="p-6 rounded-xl border border-border/50 bg-muted/10 shadow-sm">
          <p className="text-lg md:text-xl text-foreground leading-relaxed font-medium">{question.explanation}</p>
        </div>
      </div>
    );
  };

  const getOptionClass = (q: any, opt: string, isSelected: boolean) => {
    if (!isReviewMode) {
      return isSelected ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50 border-transparent';
    }
    if (opt === q.correctAnswer) {
      return 'bg-success/10 border-success/50 text-success-foreground ring-2 ring-success shadow-sm';
    }
    if (isSelected && opt !== q.correctAnswer) {
      return 'bg-destructive/10 border-destructive/50 text-destructive-foreground ring-2 ring-destructive shadow-sm';
    }
    return 'opacity-40 border-transparent pointer-events-none grayscale';
  };

  const getSelectClass = (q: any, answer: string) => {
    if (!isReviewMode) return '';
    if (!answer) return 'border-dashed border-muted-foreground/50 opacity-70';
    if (answer === q.correctAnswer) return 'border-success bg-success/10 text-success-foreground font-semibold ring-1 ring-success';
    return 'border-destructive bg-destructive/10 text-destructive-foreground font-semibold ring-1 ring-destructive';
  };

  return (
    <div className={cn(isReviewMode ? "w-full" : "space-y-2")}>
      <div className={cn(isReviewMode ? "space-y-12" : "space-y-2")}>
      {part.taskType === "inline-gap-fill" && (
        <div className={cn(isReviewMode ? "px-0" : "px-2 md:px-4")}>
          <div className="text-xl md:text-2xl leading-[2.5] text-foreground">
            {(part as any).textWithGaps.split(/(\[GAP-\d+\])/).map((segment: string, i: number) => {
              const match = segment.match(/\[GAP-(\d+)\]/);
              if (match) {
                const gapNum = parseInt(match[1], 10);
                const q = (part as any).questions.find((q: any) => q.gapNumber === gapNum);
                if (!q) return segment;
                const val = answers[q.id] || "";
                
                let inputClass = "mx-2 px-3 py-1 border-b-2 outline-none w-36 md:w-40 text-center bg-transparent transition-all font-medium text-primary placeholder:text-muted-foreground/40 focus:border-primary";
                if (isReviewMode) {
                  const isCorrect = val.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
                  inputClass += isCorrect ? " border-success text-success bg-success/5" : " border-destructive text-destructive bg-destructive/5";
                  return (
                    <span key={i} className="inline-flex flex-col items-center relative align-middle -mt-1">
                      <span className="flex items-center gap-1">
                        <input disabled value={val} className={inputClass} />
                        <span className="font-bold text-sm text-foreground">({gapNum})</span>
                      </span>
                      {isReviewMode && !isCorrect && (
                        <span className="absolute -bottom-6 text-xs text-success font-bold whitespace-nowrap">
                          {q.correctAnswer}
                        </span>
                      )}
                    </span>
                  );
                }

                return (
                  <span key={i} className="inline-flex items-center gap-1 align-middle -mt-1">
                    <SmoothInput 
                      type="text" 
                      placeholder=""
                      wrapperClassName="inline-flex mx-2 p-0 w-36 md:w-40 bg-transparent rounded-none shadow-none has-[:focus-visible]:outline-none"
                      className="px-2 py-0 h-8 border-b-2 border-black dark:border-white transition-all font-medium text-foreground placeholder:text-muted-foreground/40 focus:border-foreground outline-none w-full bg-transparent"
                      value={val}
                      onChange={(e) => onAnswerChange(q.id, e.target.value)}
                    />
                    <span className="font-bold text-sm text-muted-foreground">({gapNum})</span>
                  </span>
                );
              }
              return <span key={i}>{segment}</span>;
            })}
          </div>
          
          {isReviewMode && (
            <div className="mt-12 space-y-4">
              <h4 className="font-bold text-lg border-b pb-2">Explanations</h4>
              {(part as any).questions.map((q: any) => {
                const val = answers[q.id] || "";
                const isCorrect = val.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
                return (
                  <div key={q.id} className="p-4 rounded-xl border bg-muted/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold">Gap {q.gapNumber}:</span>
                      {isCorrect ? <CheckCircle2 className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
                      <span className={isCorrect ? "text-success font-medium" : "text-destructive font-medium"}>
                        {val || "No answer"} {!isCorrect && `(Correct: ${q.correctAnswer})`}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{q.explanation}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {part.taskType === "gapped-text" && (
        <div className="bg-muted/30 p-5 rounded-xl mb-6 text-sm border border-border/50">
          <strong className="text-base block mb-3">Sentences:</strong>
          <ul className="space-y-3">
            {part.sentences.map(s => (
              <li key={s.letter} className="flex gap-3 leading-relaxed">
                <Badge variant="outline" className="font-bold flex-shrink-0">{s.letter}</Badge>
                <span>{s.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {part.taskType === "matching-headings" && (
        <div className="space-y-6">
          <div className="bg-muted/30 p-5 rounded-xl text-sm border border-border/50">
            <strong className="text-base block mb-3">Headings:</strong>
            <ul className="space-y-3">
              {(part as any).headings.map((h: any) => (
                <li key={h.letter} className="flex gap-3 leading-relaxed">
                  <Badge variant="outline" className="font-bold flex-shrink-0">{h.letter}</Badge>
                  <span>{h.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            {(part as any).paragraphs.map((para: any, index: number) => {
              const q = allQuestions.find((x: any) => x.paragraphId === para.id);
              if (!q) return null;
              if (isReviewMode && reviewQuestionIndex !== undefined && reviewQuestionIndex !== index) return null;

              return (
                <div key={para.id} className="p-6 bg-card shadow-sm border border-border/50 rounded-xl space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="text-sm font-semibold px-3 py-1 bg-muted/50 border-border/50">
                      Paragraph {para.paragraphNumber}
                    </Badge>
                  </div>
                  <div className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                    {para.text}
                  </div>
                  
                  <div className="pt-6 border-t border-border/50 mt-4">
                    <Label className="mb-3 block text-base font-medium">Select matching heading:</Label>
                    <Select
                      value={answers[q.id] || ""}
                      onValueChange={(val) => val !== null && onAnswerChange(q.id, val)}
                      disabled={isReviewMode}
                    >
                      <SelectTrigger className={cn("h-12 text-base w-full max-w-md", getSelectClass(q, answers[q.id] || ""))}>
                        <SelectValue placeholder={isReviewMode && !answers[q.id] ? "Javob berilmagan" : "Choose a heading..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {(part as any).headings.map((h: any) => (
                          <SelectItem key={h.letter} value={h.letter} className="text-base py-3">
                            <span className="font-bold mr-2">{h.letter}</span> - {h.text}
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

      {part.taskType !== "inline-gap-fill" && part.taskType !== "matching-headings" && visibleQuestions.map((q, index) => {
        const absoluteIndex = allQuestions.findIndex(x => x.id === q.id);
        
        let promptNode = null;
        if (part.taskType === "short-text-mc" || part.taskType === "long-text-mc") {
          promptNode = (q as any).question || (q as any).prompt;
        } else if (part.taskType === "matching") {
          const person = (part as any).people.find((p: any) => p.id === (q as any).personId);
          promptNode = person?.description;
        } else if (part.taskType === "matching-headings") {
          promptNode = `Choose the correct heading for Paragraph ${absoluteIndex + 1}`;
        } else if (part.taskType === "gapped-text" || part.taskType === "cloze-mc") {
          promptNode = null;
        }

        return (
          <div key={q.id} className={cn(isReviewMode ? "" : "mb-6")}>
            {isReviewMode && (
              <div className="mb-4 flex items-center gap-2 text-muted-foreground font-semibold border-b pb-2">
                <HelpCircle className="w-5 h-5" />
                <span className="uppercase tracking-wider text-sm">Savol</span>
              </div>
            )}
            <Card 
              data-index={index}
              ref={(el) => { questionRefs.current[index] = el; }}
              className={cn(
                "border-border/50",
                isReviewMode ? "p-0 border-0 shadow-none bg-transparent" : "p-4 md:p-5 shadow-sm",
                !isReviewMode && activeQuestionIndex === index && "ring-2 ring-primary/50 shadow-md transition-all duration-300"
              )}
            >
            <div className={cn("flex gap-4 items-start", isReviewMode ? "mb-8" : "mb-6")}>
              <Badge variant="default" className={cn("rounded-full flex-shrink-0 flex items-center justify-center", isReviewMode ? "w-12 h-12 text-xl" : "w-10 h-10 text-lg")}>
                {part.taskType === "gapped-text" || part.taskType === "cloze-mc" ? (q as any).gapNumber : absoluteIndex + 1}
              </Badge>
              {promptNode && (
                <h3 className={cn("font-medium leading-snug pt-1.5", isReviewMode ? "text-xl font-bold" : "text-base", part.taskType === "matching" && "text-muted-foreground")}>
                  {promptNode}
                </h3>
              )}
            </div>
            
            {(part.taskType === "short-text-mc" || part.taskType === "long-text-mc" || part.taskType === "cloze-mc") && (
              (q as any).options ? (
                <RadioGroup
                  value={answers[q.id] || ""}
                  onValueChange={(val) => onAnswerChange(q.id, val)}
                  className="space-y-4"
                  disabled={isReviewMode}
                >
                  {(q as any).options.map((opt: string, i: number) => {
                    const isSelected = answers[q.id] === opt;
                    const isCorrectOption = isReviewMode && opt === (q as any).correctAnswer;
                    const isWrongSelected = isReviewMode && isSelected && opt !== (q as any).correctAnswer;
                    
                    return (
                      <Label
                        key={i}
                        htmlFor={`${q.id}-${i}`}
                        className={cn(
                          `flex items-center justify-between p-3 border rounded-xl transition-all duration-200`,
                          getOptionClass(q, opt, isSelected),
                          isReviewMode ? "cursor-default" : "cursor-pointer"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <RadioGroupItem value={opt} id={`${q.id}-${i}`} disabled={isReviewMode} className="w-5 h-5" />
                          <span className={cn("text-sm font-normal", isReviewMode && "font-medium text-base")}>{opt}</span>
                        </div>
                        {isCorrectOption && <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />}
                        {isWrongSelected && <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />}
                      </Label>
                    );
                  })}
                </RadioGroup>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center px-1 mb-2">
                    <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border/50 uppercase tracking-widest">ONE WORD / NUMBER</Badge>
                  </div>
                  <input 
                    placeholder="Type ONE word or a number..." 
                    value={answers[q.id] || ""}
                    onChange={(e) => onAnswerChange(q.id, e.target.value)}
                    disabled={isReviewMode}
                    className={cn(
                      "w-full h-12 rounded-xl text-base px-4 bg-muted/20 border-2 transition-all focus:border-primary/50 outline-none", 
                      isReviewMode && ((answers[q.id]||"").toLowerCase().trim() === (q as any).correctAnswer.toLowerCase().trim() ? "border-success bg-success/10 text-success" : "border-destructive bg-destructive/10 text-destructive")
                    )}
                  />
                  {isReviewMode && (answers[q.id]||"").toLowerCase().trim() !== (q as any).correctAnswer.toLowerCase().trim() && (
                    <div className="text-sm font-medium text-destructive mt-1 px-1">Correct answer: {(q as any).correctAnswer}</div>
                  )}
                </div>
              )
            )}

            {part.taskType === "matching" && (
              <div className="mt-4 bg-muted/10 p-5 rounded-xl border border-border/30">
                <Label className="mb-3 block text-base font-medium">Select matching text:</Label>
                <Select
                  value={answers[q.id] || ""}
                  onValueChange={(val) => val !== null && onAnswerChange(q.id, val)}
                  disabled={isReviewMode}
                >
                  <SelectTrigger className={cn("h-12 text-base", getSelectClass(q, answers[q.id] || ""))}>
                    <SelectValue placeholder={isReviewMode && !answers[q.id] ? "Javob berilmagan" : "Choose a letter..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {(part as any).texts.map((t: any) => (
                      <SelectItem key={t.id} value={t.letter} className="text-base py-3">
                        <span className="font-bold mr-2">{t.letter}</span> - {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {part.taskType === "gapped-text" && (
              <div className="w-full sm:w-64 mt-4">
                <Select
                  value={answers[q.id] || ""}
                  onValueChange={(val) => val !== null && onAnswerChange(q.id, val)}
                  disabled={isReviewMode}
                >
                  <SelectTrigger className={cn("h-12 text-base", getSelectClass(q, answers[q.id] || ""))}>
                    <SelectValue placeholder={isReviewMode && !answers[q.id] ? "Javob berilmagan" : "Select..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {(part as any).sentences.map((s: any) => (
                      <SelectItem key={s.letter} value={s.letter} className="text-base py-3">
                        {s.letter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}



            {renderReviewFeedback(q, answers[q.id] || "")}
            </Card>
          </div>
        );
      })}
      </div>
    </div>
  );
}

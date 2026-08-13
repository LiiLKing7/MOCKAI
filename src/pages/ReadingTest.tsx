import { useState, useEffect } from "react";
import { BookOpen, Moon, Sun, ArrowLeft, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { readingTest1 } from "@/data/reading-test-1";
import { PassageViewer } from "@/components/reading/passage-viewer";
import { QuestionPanel } from "@/components/reading/question-panel";
import { ResultsSummary } from "@/components/reading/results-summary";
import { PartTransitionOverlay } from "@/components/reading/part-transition-overlay";
import { StartTestOverlay } from "@/components/reading/start-test-overlay";
import { ViewState, PageProps } from "../App";
import { cn } from "@/lib/utils";

const TEST_DURATION_MS = 35 * 60 * 1000; // 35 minutes

export default function ReadingTestPage({ onNavigate, theme, toggleTheme }: PageProps) {
  const [activeTab, setActiveTab] = useState("part-1");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  
  // Header state
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  
  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionLabels, setTransitionLabels] = useState({ old: "", new: "" });
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  
  // Timer state (seconds remaining)
  const [timeLeft, setTimeLeft] = useState<number>(() => TEST_DURATION_MS / 1000);

  const parts = readingTest1;
  const currentIndex = parts.findIndex((p) => p.id === activeTab);
  const progressPercentage = ((currentIndex + 1) / parts.length) * 100;


  useEffect(() => {
    if (isFinished || isReviewMode) return;

    let endTimeStr = sessionStorage.getItem("cefr_test_timer");
    let endTime = endTimeStr ? parseInt(endTimeStr, 10) : 0;

    if (!endTime || endTime < Date.now()) {
      endTime = Date.now() + TEST_DURATION_MS;
      sessionStorage.setItem("cefr_test_timer", endTime.toString());
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        handleFinish();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isFinished, isReviewMode]);

  const handleFinish = () => {
    setIsFinished(true);
    sessionStorage.removeItem("cefr_test_timer");
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (!isReviewMode) {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    }
  };

  const handleTabChange = (newTabId: string) => {
    if (newTabId === activeTab || isTransitioning) return;
    
    if (isReviewMode) {
      setActiveTab(newTabId);
      setReviewQuestionIndex(0);
      setActiveQuestionIndex(0);
      return;
    }

    const oldPart = parts.find(p => p.id === activeTab);
    const newPart = parts.find(p => p.id === newTabId);
    
    if (oldPart && newPart) {
      setTransitionLabels({ old: `Part ${oldPart.partNumber}`, new: `Part ${newPart.partNumber}` });
      setPendingTab(newTabId);
      setActiveQuestionIndex(0);
      setIsTransitioning(true);
    } else {
      setActiveTab(newTabId);
      setReviewQuestionIndex(0);
    }
  };

  const handleTransitionCovered = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      setReviewQuestionIndex(0);
    }
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    setPendingTab(null);
  };

  const handleNext = () => {
    if (currentIndex < parts.length - 1) {
      handleTabChange(parts[currentIndex + 1].id);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleTabChange(parts[currentIndex - 1].id);
    }
  };

  if (isFinished && !isReviewMode) {
    return (
      <ResultsSummary 
        parts={parts} 
        answers={answers} 
        onNavigate={onNavigate}
        onReview={() => {
          setIsReviewMode(true);
          setActiveTab(parts[0].id);
          setReviewQuestionIndex(0);
        }}
        onReviewQuestion={(partId, questionIndex) => {
          setIsReviewMode(true);
          setActiveTab(partId);
          setReviewQuestionIndex(questionIndex);
        }}
      />
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  
  let timerColor = "text-muted-foreground";
  if (timeLeft <= 60) timerColor = "text-destructive font-bold animate-pulse";
  else if (timeLeft <= 300) timerColor = "text-warning font-semibold";

  return (
    <>
      <PartTransitionOverlay 
        isActive={isTransitioning}
        oldLabel={transitionLabels.old}
        newLabel={transitionLabels.new}
        onCovered={handleTransitionCovered}
        onComplete={handleTransitionComplete}
      />
      <Tabs value={activeTab} onValueChange={handleTabChange} className={cn("flex-1 flex flex-col bg-background min-h-0")}>
        <header className="border-b px-6 py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-6 bg-background z-50 shrink-0 sticky top-0 shadow-sm relative">
          <div 
            className="flex items-center gap-2 cursor-pointer w-full md:w-auto z-10" 
            onClick={() => onNavigate("dashboard")}
          >
            <BookOpen className="w-6 h-6 text-primary shrink-0" />
            <h1 className="text-xl font-heading font-semibold text-foreground truncate hidden md:block">
              CEFR Multilevel Mock Platform
            </h1>
            {isReviewMode && (
              <Button variant="ghost" size="icon" onClick={() => setIsReviewMode(false)} className="ml-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          <div className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex justify-center w-full md:w-auto order-last md:order-none z-0">
            <h2 className="text-xl font-heading font-semibold text-foreground">
              {isReviewMode ? "Javoblarni ko'rib chiqish" : "Reading"}
            </h2>
          </div>

          <div className="flex items-center justify-end gap-3 md:gap-6 w-full md:w-auto z-10">
            {!isReviewMode && (
              <div className={`flex items-center gap-2 ${timerColor} transition-colors duration-300`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{timeString}</span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
          
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-md w-8 h-8 absolute -bottom-4 left-1/2 -translate-x-1/2 bg-background hover:bg-muted z-50 border border-border flex items-center justify-center opacity-100 dark:bg-background dark:hover:bg-muted"
            onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
          >
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 text-foreground", isHeaderExpanded ? "rotate-180" : "")} />
          </Button>
        </header>

        <main className={cn("flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex flex-col", isReviewMode ? "min-h-0" : "h-full overflow-hidden")}>
          {parts.map((part) => {
            let partTotal = 0;
            let partCorrect = 0;
            if (isReviewMode) {
              if (part.taskType === "short-text-mc") {
                partTotal = part.items.length;
                part.items.forEach(i => { if (answers[i.id] === i.correctAnswer) partCorrect++; });
              } else if (part.taskType === "inline-gap-fill") {
                partTotal = part.questions.length;
                part.questions.forEach(q => { if (answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) partCorrect++; });
              } else if (part.taskType === "matching") {
                partTotal = part.questions.length;
                part.questions.forEach(q => { if (answers[q.id] === q.correctAnswer) partCorrect++; });
              } else {
                partTotal = part.questions.length;
                part.questions.forEach(q => { if (answers[q.id] === q.correctAnswer) partCorrect++; });
              }
            }

            return (
              <TabsContent
                key={part.id}
                value={part.id}
                className={cn("flex-1 mt-0 outline-none flex flex-col", isReviewMode ? "" : "h-full overflow-hidden")}
              >
                <div className={cn("relative transition-all duration-300", isHeaderExpanded ? "mb-2 lg:mb-4" : "mb-0")}>
                  <div 
                    className={cn(
                      "flex flex-col lg:flex-row lg:items-center justify-between gap-4 overflow-hidden transition-all duration-300 ease-in-out w-full",
                      isHeaderExpanded ? "max-h-[500px] opacity-100 pb-2" : "max-h-0 opacity-0 pb-0"
                    )}
                  >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-foreground">
                      {part.title}
                    </h2>
                    <div className="p-3 md:p-4 bg-muted/30 border border-border/50 rounded-xl max-w-2xl shadow-sm">
                      <p className="text-sm md:text-base font-medium text-muted-foreground">{part.instructions}</p>
                    </div>
                  </div>
                </div>

                {isReviewMode ? (
                  <div className="max-w-[760px] mx-auto w-full pb-8">
                    <div className="flex justify-center mb-12">
                      <div className="px-4 py-1.5 text-sm font-medium rounded-full bg-muted/50 border border-border/50 text-muted-foreground flex items-center shadow-sm">
                        Qism natijasi: <span className="font-bold text-foreground ml-1.5">{partCorrect} / {partTotal} to'g'ri</span>
                      </div>
                    </div>

                    {part.taskType !== "inline-gap-fill" && part.taskType !== "matching-headings" && (
                      <div className="mb-12">
                        <div className="flex items-center gap-2 mb-4 text-muted-foreground font-semibold border-b pb-2">
                          <BookOpen className="w-5 h-5" />
                          <span className="uppercase tracking-wider text-sm">Matn</span>
                        </div>
                        <div className="p-6 rounded-xl border border-border/50 bg-background shadow-sm">
                          <PassageViewer 
                            part={part} 
                            isReviewMode={isReviewMode}
                            reviewQuestionIndex={reviewQuestionIndex}
                            activeQuestionIndex={activeQuestionIndex}
                            userAnswers={answers}
                          />
                        </div>
                      </div>
                    )}

                    <QuestionPanel
                      part={part}
                      answers={answers}
                      onAnswerChange={handleAnswerChange}
                      isReviewMode={isReviewMode}
                      reviewQuestionIndex={reviewQuestionIndex}
                      setReviewQuestionIndex={setReviewQuestionIndex}
                      activeQuestionIndex={activeQuestionIndex}
                      setActiveQuestionIndex={setActiveQuestionIndex}
                    />
                  </div>
                ) : (
                  <div className={cn("grid gap-8 items-start h-full min-h-0", (part.taskType === 'inline-gap-fill' || part.taskType === 'matching-headings') ? "grid-cols-1 w-full" : "grid-cols-1 lg:grid-cols-2")}>
                    {part.taskType !== 'inline-gap-fill' && part.taskType !== 'matching-headings' && (
                      <div 
                        onScroll={(e) => {
                          if (e.currentTarget.scrollTop > 100 && isHeaderExpanded) setIsHeaderExpanded(false);
                        }}
                        className={cn(
                          "pb-4 scroll-column transition-all duration-300 lg:overflow-y-auto lg:h-full lg:min-h-0",
                          part.id === "part-2" ? "lg:order-last lg:border-l lg:pl-8" : "lg:border-r lg:pr-8"
                        )}
                      >
                        <div>
                          <PassageViewer 
                            part={part} 
                            isReviewMode={isReviewMode}
                            reviewQuestionIndex={reviewQuestionIndex}
                            activeQuestionIndex={activeQuestionIndex}
                            userAnswers={answers}
                          />
                        </div>
                      </div>
                    )}
                    <div 
                      className={cn(
                        "pb-4 px-2 transition-all duration-300 w-full scroll-column",
                        "lg:overflow-y-auto lg:h-full lg:min-h-0",
                        part.id === "part-2" ? "lg:order-first lg:pr-8 lg:border-r-0" : ""
                      )}
                    >
                      <QuestionPanel
                        part={part}
                        answers={answers}
                        onAnswerChange={handleAnswerChange}
                        isReviewMode={isReviewMode}
                        reviewQuestionIndex={reviewQuestionIndex}
                        setReviewQuestionIndex={setReviewQuestionIndex}
                        activeQuestionIndex={activeQuestionIndex}
                        setActiveQuestionIndex={setActiveQuestionIndex}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </main>

        <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => {
                if (isReviewMode) {
                  if (reviewQuestionIndex > 0) {
                    setReviewQuestionIndex(reviewQuestionIndex - 1);
                  } else if (currentIndex > 0) {
                    handleTabChange(parts[currentIndex - 1].id);
                  }
                } else {
                  handlePrev();
                }
              }}
              disabled={isTransitioning || (currentIndex === 0 && (!isReviewMode || reviewQuestionIndex === 0))}
              className={(!isReviewMode && currentIndex === 0) ? "invisible" : ""}
            >
              Oldingi
            </Button>

            <div className="flex flex-col items-center flex-1 mx-4">
              <TabsList className="h-11 shrink-0 overflow-x-auto max-w-[calc(100vw-60px)] md:max-w-[calc(100vw-250px)]">
                {parts.map((part) => (
                  <TabsTrigger 
                    key={part.id} 
                    value={part.id} 
                    className="text-base px-6"
                    disabled={isTransitioning}
                  >
                    Part {part.partNumber}
                  </TabsTrigger>
                ))}
              </TabsList>
              {isReviewMode && (
                <span className="text-sm font-medium text-foreground mt-2 md:mt-3">
                  Savol {reviewQuestionIndex + 1} / {parts[currentIndex]?.taskType === "short-text-mc" ? (parts[currentIndex] as any).items.length : (parts[currentIndex] as any).questions.length}
                </span>
              )}
            </div>

            <Button
              onClick={() => {
                if (isReviewMode) {
                  const maxQ = (parts[currentIndex]?.taskType === "short-text-mc" ? (parts[currentIndex] as any).items.length : (parts[currentIndex] as any).questions.length) - 1;
                  if (reviewQuestionIndex < maxQ) {
                    setReviewQuestionIndex(reviewQuestionIndex + 1);
                  } else if (currentIndex < parts.length - 1) {
                    handleTabChange(parts[currentIndex + 1].id);
                  }
                } else {
                  handleNext();
                }
              }}
              disabled={isTransitioning || (isReviewMode && currentIndex === parts.length - 1 && reviewQuestionIndex === ((parts[currentIndex]?.taskType === "short-text-mc" ? (parts[currentIndex] as any).items.length : (parts[currentIndex] as any).questions.length) - 1))}
            >
              {!isReviewMode && currentIndex === parts.length - 1 ? "Tugatish" : "Keyingi"}
            </Button>
          </div>
        </div>
      </Tabs>
    </>
  );
}

import { useState, useEffect } from "react";
import { Headphones, Moon, Sun, ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { listeningTest1 } from "@/data/listening-test-1";
import { AudioPlayer } from "@/components/listening/audio-player";
import { ViewState, PageProps } from "../App";
import { cn } from "@/lib/utils";

const TEST_DURATION_MS = 40 * 60 * 1000; // 40 minutes for listening

export default function ListeningTestPage({ onNavigate, theme, toggleTheme }: PageProps) {
  const [activeTab, setActiveTab] = useState("part-1");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(() => TEST_DURATION_MS / 1000);

  const parts = listeningTest1;
  const currentPartIndex = parts.findIndex((p) => p.id === activeTab);
  const currentPart = parts[currentPartIndex];
  const progressPercentage = ((Object.keys(answers).length) / parts.reduce((acc, p) => acc + p.questions.length, 0)) * 100;

  useEffect(() => {
    if (isFinished || !isStarted) return;

    let endTimeStr = sessionStorage.getItem("cefr_listening_timer");
    let endTime = endTimeStr ? parseInt(endTimeStr, 10) : 0;

    if (!endTime || endTime < Date.now()) {
      endTime = Date.now() + TEST_DURATION_MS;
      sessionStorage.setItem("cefr_listening_timer", endTime.toString());
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
  }, [isFinished, isStarted]);

  const handleFinish = () => {
    setIsFinished(true);
    sessionStorage.removeItem("cefr_listening_timer");
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    let score = 0;
    let total = 0;
    parts.forEach(part => {
      part.questions.forEach(q => {
        total++;
        if (answers[q.id] === q.correctAnswer) {
          score++;
        }
      });
    });
    return { score, total, percentage: Math.round((score / total) * 100) };
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!isStarted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Headphones className="w-10 h-10 text-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold">Listening Test</h1>
          <p className="text-muted-foreground text-lg">
            This test takes about 40 minutes. You will hear each recording only once.
          </p>
          <div className="pt-6 border-t border-border space-y-4 text-left bg-muted/30 p-6 rounded-xl">
            <h3 className="font-semibold text-foreground">Instructions:</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
              <li>Listen to the audio carefully.</li>
              <li>Answer all questions.</li>
              <li>You can play the audio when you are ready.</li>
            </ul>
          </div>
          <div className="pt-4 flex gap-4">
            <Button variant="outline" className="w-full" onClick={() => onNavigate("dashboard")}>
              Go Back
            </Button>
            <Button size="lg" className="w-full" onClick={() => setIsStarted(true)}>
              Start Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const { score, total, percentage } = calculateScore();
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="max-w-2xl w-full space-y-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-foreground">Test Complete!</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 bg-card border rounded-2xl shadow-sm">
              <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Total Score</p>
              <p className="text-4xl font-black text-foreground">{score}/{total}</p>
            </div>
            <div className="p-6 bg-card border rounded-2xl shadow-sm">
              <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Percentage</p>
              <p className="text-4xl font-black text-foreground">{percentage}%</p>
            </div>
            <div className="p-6 bg-card border rounded-2xl shadow-sm">
              <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Time Spent</p>
              <p className="text-4xl font-black text-foreground">{formatTime((TEST_DURATION_MS / 1000) - timeLeft)}</p>
            </div>
          </div>

          <div className="space-y-6 text-left max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
            {parts.map(part => (
              <div key={part.id} className="space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">Part {part.partNumber}</h3>
                {part.questions.map(q => {
                  const isCorrect = answers[q.id] === q.correctAnswer;
                  return (
                    <div key={q.id} className={cn("p-4 border rounded-xl", isCorrect ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20")}>
                      <div className="flex gap-3 mb-2">
                        {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                        <p className="font-medium text-foreground">{q.number}. {q.question}</p>
                      </div>
                      <div className="pl-8 text-sm space-y-1">
                        <p><span className="text-muted-foreground">Your answer:</span> {answers[q.id] || "No answer"}</p>
                        {!isCorrect && <p><span className="text-muted-foreground">Correct answer:</span> <span className="font-semibold text-green-500">{q.correctAnswer}</span></p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <Button size="lg" className="w-full max-w-sm" onClick={() => onNavigate("dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-foreground" />
              <h1 className="text-lg font-semibold hidden sm:inline-block">Listening Test</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
              <Clock className={cn("w-4 h-4", timeLeft < 300 ? "text-destructive animate-pulse" : "text-muted-foreground")} />
              <span className={cn("font-mono font-medium", timeLeft < 300 ? "text-destructive" : "text-foreground")}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button variant="default" size="sm" onClick={handleFinish}>
              Finish Test
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:inline-flex">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-1 rounded-none" />
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Part {currentPart.partNumber}: {currentPart.title}</h2>
          <p className="text-muted-foreground">{currentPart.instructions}</p>
        </div>

        <div className="mb-10">
          <AudioPlayer src={currentPart.audioSrc} />
        </div>

        <div className="space-y-8">
          {currentPart.questions.map((q) => (
            <div key={q.id} className="bg-card border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-4 flex items-start gap-3">
                <span className="flex items-center justify-center bg-primary/10 text-foreground rounded-full w-8 h-8 shrink-0 text-sm font-bold">
                  {q.number}
                </span>
                <span className="mt-1">{q.question}</span>
              </h3>
              
              {q.type === "multiple_choice" && q.options && (
                <div className="space-y-3 pl-11">
                  {q.options.map((option, i) => (
                    <label 
                      key={i} 
                      onClick={() => handleAnswerChange(q.id, option)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                        answers[q.id] === option 
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                          : "border-border hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                        answers[q.id] === option ? "border-primary" : "border-input"
                      )}>
                        {answers[q.id] === option && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                      </div>
                      <span className={cn(
                        "text-base", 
                        answers[q.id] === option ? "font-medium text-foreground" : "text-muted-foreground"
                      )}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

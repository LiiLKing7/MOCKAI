import { useState, useEffect, useRef } from "react";
import { listeningTest1 } from "@/data/listening-test-1";
import { AudioPlayer } from "@/components/listening/audio-player";
import { PageProps } from "../App";
import { BilimIcon } from "@/components/ui/bilim-icon";
import { saveTestResult } from "@/lib/storage";
import { cn } from "@/lib/utils";

const TEST_DURATION_MS = 40 * 60 * 1000; // 40 minutes for listening

export default function ListeningTestPage({ onNavigate, theme, toggleTheme }: PageProps) {
  const [activeTab, setActiveTab] = useState("part-1");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const hasSavedRef = useRef(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(() => TEST_DURATION_MS / 1000);

  const parts = listeningTest1;
  const currentPartIndex = parts.findIndex((p) => p.id === activeTab);
  const currentPart = parts[currentPartIndex] || parts[0];

  const totalQuestions = parts.reduce((acc, p) => acc + p.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (isFinished && !hasSavedRef.current) {
      hasSavedRef.current = true;
      const { score, total, percentage } = calculateScore();
      if (total > 0) {
        saveTestResult({
          testType: "listening",
          title: "CEFR Listening Practice Test",
          score,
          total,
          percentage,
          timeSpentSeconds: Math.max(0, Math.floor(TEST_DURATION_MS / 1000 - timeLeft)),
        });
      }
    }
  }, [isFinished]);

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
    parts.forEach((part) => {
      part.questions.forEach((q) => {
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

  // Start Screen
  if (!isStarted) {
    return (
      <div className="reading-paper-container min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[var(--paper)] text-[var(--paper-ink)]">
        <div className="max-w-lg w-full paper-box p-8 sm:p-10 space-y-6 text-center bg-[var(--paper-card)] shadow-[8px_8px_0_var(--paper-ink)]">
          <div className="w-20 h-20 rounded-2xl bg-[var(--paper-p)] border-3 border-[var(--paper-ink)] shadow-[4px_4px_0_var(--paper-ink)] flex items-center justify-center mx-auto mb-2 rotate-[-4deg]">
            <BilimIcon name="volume" size={44} />
          </div>

          <div className="flex flex-col items-center gap-2.5">
            <span className="paper-badge paper-badge-purple text-xs font-black">
              ✦ CEFR AUDIO MOCK
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-heading text-[var(--paper-ink)]">
              Listening Test
            </h1>
            <p className="text-sm sm:text-base font-bold text-[var(--paper-mut)] leading-relaxed max-w-sm mx-auto">
              Ushbu test 40 daqiqa davom etadi. Har bir audio yozuv faqat bir marta ijro etiladi.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--paper-soft)] border-2 border-[var(--paper-ink)] text-left space-y-2 shadow-[2px_2px_0_var(--paper-ink)]">
            <h3 className="font-black text-sm uppercase tracking-wide text-[var(--paper-ink)] flex items-center gap-1.5">
              <BilimIcon name="target" size={16} />
              <span>Ko'rsatmalar:</span>
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-[var(--paper-ink)] opacity-90 pl-1">
              <li>• Audioni diqqat bilan eshiting va savollarni o'qing.</li>
              <li>• Har bir savol uchun to'g'ri deb bilgan variantni belgilang.</li>
              <li>• Tayyor bo'lganingizda "Testni Boshlash" tugmasini bosing.</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="paper-btn paper-btn-out flex-1 h-12 text-base font-black"
            >
              ← Orqaga
            </button>
            <button
              type="button"
              onClick={() => setIsStarted(true)}
              className="paper-btn flex-1 h-12 text-base font-black shadow-[4px_4px_0_var(--paper-ink)]"
            >
              Testni Boshlash →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Finished Screen
  if (isFinished) {
    const { score, total, percentage } = calculateScore();
    return (
      <div className="reading-paper-container min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-[var(--paper)] text-[var(--paper-ink)]">
        <div className="max-w-3xl w-full paper-box p-6 sm:p-10 space-y-8 text-center bg-[var(--paper-card)] shadow-[8px_8px_0_var(--paper-ink)]">
          <div className="flex flex-col items-center space-y-3">
            <span className="paper-badge paper-badge-purple">
              <BilimIcon name="trophy" size={18} />
              <span>Listening Mock Natijalari</span>
            </span>

            <div className="relative mt-2">
              <div className="w-28 h-28 rounded-full border-3 border-[var(--paper-ink)] bg-[var(--paper-p)] shadow-[5px_5px_0_var(--paper-ink)] flex flex-col items-center justify-center rotate-[-3deg]">
                <span className="text-4xl font-black text-[var(--paper-ink)]">{percentage}%</span>
                <span className="text-[10px] font-black uppercase text-[var(--paper-mut)]">
                  Aniqlik
                </span>
              </div>
              <img src="/logo.svg" alt="MockAi" className="absolute -top-3 -right-5 w-10 h-10 select-none" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-heading text-[var(--paper-ink)] paper-scribble inline-block pt-1">
              Test Muvaffaqiyatli Yakunlandi!
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="paper-box p-4 bg-[var(--paper-soft)]">
              <p className="text-xs font-black text-[var(--paper-mut)] uppercase">To'g'ri javob</p>
              <p className="text-2xl sm:text-3xl font-black text-[var(--paper-ink)] mt-1">
                {score}/{total}
              </p>
            </div>
            <div className="paper-box p-4 bg-[var(--paper-soft)]">
              <p className="text-xs font-black text-[var(--paper-mut)] uppercase">Foiz</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                {percentage}%
              </p>
            </div>
            <div className="paper-box p-4 bg-[var(--paper-soft)]">
              <p className="text-xs font-black text-[var(--paper-mut)] uppercase">Sarflangan vaqt</p>
              <p className="text-2xl sm:text-3xl font-black text-[var(--paper-ink)] mt-1 font-mono">
                {formatTime(TEST_DURATION_MS / 1000 - timeLeft)}
              </p>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-4 text-left max-h-[45vh] overflow-y-auto pr-2 scroll-column pt-2 border-t-2 border-[var(--paper-ink)]">
            {parts.map((part) => (
              <div key={part.id} className="space-y-3 mb-6">
                <h3 className="font-black text-lg text-[var(--paper-ink)] flex items-center gap-2">
                  <span className="paper-badge paper-badge-yellow text-xs font-black">
                    Part {part.partNumber}
                  </span>
                  <span>Audio qism {part.partNumber} natijalari</span>
                </h3>

                {part.questions.map((q) => {
                  const isCorrect = answers[q.id] === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "p-4 rounded-2xl border-2 border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)]",
                        isCorrect ? "bg-[var(--paper-g)]" : "bg-[var(--paper-r)]"
                      )}
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        {isCorrect ? (
                          <BilimIcon name="check" size={20} className="shrink-0" />
                        ) : (
                          <BilimIcon name="close" size={20} className="shrink-0" />
                        )}
                        <p className="font-extrabold text-sm sm:text-base text-[var(--paper-ink)]">
                          {q.number}. {q.question}
                        </p>
                      </div>
                      <div className="pl-7 text-xs sm:text-sm font-semibold space-y-0.5">
                        <p>
                          <span className="opacity-80">Sizning javobingiz:</span>{" "}
                          <span className="font-black">{answers[q.id] || "Javob berilmagan"}</span>
                        </p>
                        {!isCorrect && (
                          <p className="text-emerald-900 font-bold">
                            To'g'ri javob: {q.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t-2 border-[var(--paper-ink)] flex justify-center">
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="paper-btn paper-btn-out h-12 px-8 text-base font-black shadow-[4px_4px_0_var(--paper-ink)]"
            >
              Bosh sahifaga qaytish →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Listening Test Screen
  return (
    <div className="reading-paper-container min-h-screen flex flex-col bg-[var(--paper)] text-[var(--paper-ink)]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-3 border-[var(--paper-ink)] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <i className="paper-logo-mark">✦</i>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-[var(--paper-ink)] group-hover:text-[var(--paper-o)] transition-colors">
              bilim<span className="text-[var(--paper-o)]">box</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--paper-mut)] -mt-1">
              CEFR Listening Mock
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="paper-badge paper-badge-purple">
            <BilimIcon name="volume" size={16} />
            <span>Part {currentPart.partNumber}: Audio Tinglash</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "paper-badge text-sm font-black px-3 py-1 flex items-center gap-2",
              timeLeft <= 180
                ? "paper-badge-red bg-[var(--paper-r)] animate-pulse"
                : "paper-badge-paper bg-[var(--paper-card)]"
            )}
          >
            <BilimIcon name="clock" size={16} />
            <span className="font-mono text-base">{formatTime(timeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0"
            title="Rejimni almashtirish"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="paper-btn paper-btn-out paper-btn-sm h-9 px-3 gap-1.5"
            title="Chiqish"
          >
            <BilimIcon name="home" size={16} />
            <span className="hidden sm:inline-block">Chiqish</span>
          </button>
        </div>
      </header>

      {/* Part Navigation Tabs Strip */}
      <div className="bg-[var(--paper-soft)] border-b-3 border-[var(--paper-ink)] px-4 sm:px-6 pt-3 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-end gap-1.5 min-w-max">
          {parts.map((p) => {
            const isActive = p.id === activeTab;
            const isCompleted = p.questions.every((q) => answers[q.id]?.trim());

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveTab(p.id)}
                className={cn("paper-tab-btn flex items-center gap-2", isActive && "active")}
              >
                <span>Part {p.partNumber}</span>
                {isCompleted && !isActive && (
                  <BilimIcon name="check" size={14} className="shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 pb-2 text-xs font-black text-[var(--paper-mut)]">
          <span>Javoblar:</span>
          <span className="paper-badge paper-badge-green text-xs py-0.5 px-2">
            {answeredCount} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Question Quick-Jump Bar */}
      <div className="bg-[var(--paper)] px-4 sm:px-6 py-2.5 border-b-2 border-dashed border-[var(--paper-ink)] flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-black uppercase tracking-wider text-[var(--paper-mut)] mr-1 shrink-0 flex items-center gap-1">
          <BilimIcon name="quiz" size={14} />
          <span>Savollar:</span>
        </span>
        <div className="flex items-center gap-1.5">
          {currentPart.questions.map((q) => {
            const isAnswered = !!answers[q.id]?.trim();

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  const el = document.getElementById(`q-${q.id}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className={cn("paper-pg-btn", isAnswered && "answered")}
                title={`Savol ${q.number}`}
              >
                {q.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Audio Player Card */}
        <div className="space-y-2">
          <span className="paper-badge paper-badge-yellow text-xs font-black">
            <BilimIcon name="volume" size={14} />
            <span>Audio Yozuv</span>
          </span>
          <AudioPlayer src={currentPart.audioSrc} />
        </div>

        {/* Questions List */}
        <div className="space-y-5">
          {currentPart.questions.map((q) => {
            return (
              <div
                key={q.id}
                id={`q-${q.id}`}
                className="paper-box p-6 bg-[var(--paper-card)] space-y-4"
              >
                <div className="flex items-start gap-3">
                  <span className="paper-badge paper-badge-orange text-sm font-black px-3 py-1 shrink-0">
                    #{q.number}
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-[var(--paper-ink)] leading-snug pt-0.5">
                    {q.question}
                  </h3>
                </div>

                {/* Option Choices */}
                <div className="space-y-2.5 pt-1">
                  {q.options.map((opt, i) => {
                    const isSelected = answers[q.id] === opt;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={cn(
                          "paper-opt flex items-center justify-between gap-4",
                          isSelected && "selected"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "w-7 h-7 rounded-full border-2 border-[var(--paper-ink)] flex items-center justify-center font-black text-xs shrink-0 shadow-[1px_1px_0_var(--paper-ink)]",
                              isSelected
                                ? "bg-[var(--paper-o)] text-white"
                                : "bg-[var(--paper-soft)] text-[var(--paper-ink)]"
                            )}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-sm sm:text-base font-bold text-[var(--paper-ink)] text-left">
                            {opt}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Actions Bar */}
      <footer className="sticky bottom-0 left-0 right-0 z-40 bg-[var(--paper)] border-t-3 border-[var(--paper-ink)] p-3 sm:p-4 shadow-[0_-4px_0_var(--paper-ink)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (currentPartIndex > 0) {
                setActiveTab(parts[currentPartIndex - 1].id);
              }
            }}
            disabled={currentPartIndex === 0}
            className={cn(
              "paper-btn paper-btn-out w-full sm:w-auto h-11 px-5 gap-2",
              currentPartIndex === 0 ? "invisible" : ""
            )}
          >
            <BilimIcon name="back" size={18} />
            <span>Oldingi Bo'lim</span>
          </button>

          <div className="flex flex-col items-center w-full max-w-xs px-2">
            <div className="w-full paper-progress-bar">
              <i
                className="paper-progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between w-full mt-1 text-xs font-black text-[var(--paper-mut)]">
              <span>Javoblar: {progressPercentage}%</span>
              <span>{answeredCount} / {totalQuestions}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (currentPartIndex < parts.length - 1) {
                setActiveTab(parts[currentPartIndex + 1].id);
              } else {
                handleFinish();
              }
            }}
            className={cn(
              "paper-btn w-full sm:w-auto h-11 px-6 gap-2",
              currentPartIndex === parts.length - 1
                ? "paper-btn-green"
                : "paper-btn-yellow"
            )}
          >
            <span>
              {currentPartIndex === parts.length - 1 ? "Testni Yakunlash" : "Keyingi Bo'lim"}
            </span>
            <BilimIcon
              name={currentPartIndex === parts.length - 1 ? "check" : "next"}
              size={18}
            />
          </button>
        </div>
      </footer>
    </div>
  );
}

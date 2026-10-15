import { useState, useEffect, useRef } from "react";
import { readingTest1, ReadingPart } from "@/data/reading-test-1";
import { ResultsSummary } from "@/components/reading/results-summary";
import { PartTransitionOverlay } from "@/components/reading/part-transition-overlay";
import { BilimIcon } from "@/components/ui/bilim-icon";
import { MockAiLogo } from "@/components/MockAiLogo";
import { PageProps } from "../App";
import { cn } from "@/lib/utils";

const TEST_DURATION_MS = 35 * 60 * 1000; // 35 minutes

export default function ReadingTestPage({ onNavigate, theme, toggleTheme }: PageProps) {
  const [activeTab, setActiveTab] = useState("part-1");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string>("q1-1");

  // Transition state (kept as requested)
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionLabels, setTransitionLabels] = useState({ old: "", new: "" });
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(() => TEST_DURATION_MS / 1000);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const parts = readingTest1;
  const currentIndex = parts.findIndex((p) => p.id === activeTab);
  const currentPart = parts[currentIndex] || parts[0];

  // Calculate overall answered count
  let totalQuestionsCount = 0;
  let answeredCount = 0;
  parts.forEach((p) => {
    const qList = (p as any).questions || [];
    totalQuestionsCount += qList.length;
    qList.forEach((q: any) => {
      if (answers[q.id]?.trim()) answeredCount++;
    });
  });

  const overallProgressPercentage =
    totalQuestionsCount > 0 ? Math.round((answeredCount / totalQuestionsCount) * 100) : 0;

  // Countdown timer
  useEffect(() => {
    if (isFinished || isReviewMode || isTimerPaused) return;

    let endTimeStr = sessionStorage.getItem("cefr_reading_timer");
    let endTime = endTimeStr ? parseInt(endTimeStr, 10) : 0;

    if (!endTime || endTime < Date.now()) {
      endTime = Date.now() + timeLeft * 1000;
      sessionStorage.setItem("cefr_reading_timer", endTime.toString());
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
  }, [isFinished, isReviewMode, isTimerPaused]);

  const handleFinish = () => {
    setIsFinished(true);
    sessionStorage.removeItem("cefr_reading_timer");
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (!isReviewMode) {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    }
  };

  const handleTabChange = (newTabId: string) => {
    if (newTabId === activeTab || isTransitioning) return;

    const oldPart = parts.find((p) => p.id === activeTab);
    const newPart = parts.find((p) => p.id === newTabId);

    if (oldPart && newPart) {
      setTransitionLabels({ old: `Part ${oldPart.partNumber}`, new: `Part ${newPart.partNumber}` });
      setPendingTab(newTabId);
      setIsTransitioning(true);
    } else {
      setActiveTab(newTabId);
    }
  };

  const handleTransitionCovered = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      // set active question id to first question in new part
      const newPart = parts.find((p) => p.id === pendingTab);
      if (newPart && (newPart as any).questions?.[0]) {
        setActiveQuestionId((newPart as any).questions[0].id);
      }
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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // If test finished and not reviewing, show ResultsSummary
  if (isFinished && !isReviewMode) {
    return (
      <ResultsSummary
        parts={parts}
        answers={answers}
        onNavigate={onNavigate}
        onReview={() => {
          setIsReviewMode(true);
          setActiveTab(parts[0].id);
        }}
      />
    );
  }

  // Render inline cloze input slot for Part 1 matching reading.html
  const renderClozeSlot = (qId: string, slotNum: number) => {
    const val = answers[qId] || "";
    const isFilled = val.trim() !== "";
    const isFocused = activeQuestionId === qId;
    return (
      <span
        key={qId}
        className={cn("cloze-slot", isFilled && "is-filled", isFocused && "is-focused")}
        onClick={() => setActiveQuestionId(qId)}
      >
        <span className="cloze-badge">{slotNum}</span>
        <span className="cloze-inp-wrap">
          <input
            type="text"
            className="cloze-input"
            value={val}
            onFocus={() => setActiveQuestionId(qId)}
            onChange={(e) => handleAnswerChange(qId, e.target.value)}
            placeholder="so'z yozing..."
            aria-label={`Bo'sh joy ${slotNum}`}
            autoComplete="off"
          />
          <span className="cloze-icon-end">
            <BilimIcon name="pencil" size={15} />
          </span>
          <button
            type="button"
            className="cloze-clear"
            title="Tozalash"
            onClick={(e) => {
              e.stopPropagation();
              handleAnswerChange(qId, "");
            }}
          >
            ×
          </button>
        </span>
      </span>
    );
  };

  // Part 2 Used Course Mapping
  const part2UsedMap: Record<string, number> = {};
  if (currentPart.id === "part-2" && (currentPart as any).questions) {
    (currentPart as any).questions.forEach((q: any, idx: number) => {
      const val = answers[q.id];
      if (val) part2UsedMap[val] = idx + 1;
    });
  }

  // Part 3 Used Heading Mapping
  const part3UsedMap: Record<string, number> = {};
  if (currentPart.id === "part-3" && (currentPart as any).questions) {
    (currentPart as any).questions.forEach((q: any, idx: number) => {
      const val = answers[q.id];
      if (val) part3UsedMap[val] = idx + 1;
    });
  }

  return (
    <div className="exam-app select-none">
      {/* 0. PART TRANSITION OVERLAY (ANIMATION KEPT AS REQUESTED) */}
      <PartTransitionOverlay
        isActive={isTransitioning}
        oldLabel={transitionLabels.old}
        newLabel={transitionLabels.new}
        onCovered={handleTransitionCovered}
        onComplete={handleTransitionComplete}
      />

      {/* 1. YUQORI HEADER */}
      <header className="exam-header">
        <div className="hdr-brand">
          <div
            onClick={() => onNavigate("dashboard")}
            className="logo cursor-pointer"
            title="Bosh sahifaga qaytish"
          >
            <MockAiLogo size={36} withText={true} textSize="md" />
          </div>
        </div>

        {/* Part 1 .. Part 5 Tabs */}
        <nav className="part-tabs" role="tablist" aria-label="Reading bo'limlari">
          {parts.map((p) => {
            const qList = (p as any).questions || [];
            const doneCnt = qList.filter((q: any) => answers[q.id]?.trim()).length;
            const totalCnt = qList.length;
            const isAllDone = totalCnt > 0 && doneCnt === totalCnt;
            const isActive = p.id === activeTab;

            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                disabled={isTransitioning}
                onClick={() => handleTabChange(p.id)}
                className={cn("part-tab", isAllDone && "done-part")}
              >
                <span>Part {p.partNumber}</span>
                <span className="pt-cnt">{doneCnt}/{totalCnt}</span>
              </button>
            );
          })}
        </nav>

        {/* O'ng tarafdagi asboblar */}
        <div className="hdr-tools">
          <div className="score-pill" title="Belgilangan savollar soni">
            <BilimIcon name="check" size={17} />
            <span>
              {answeredCount} / {totalQuestionsCount}
            </span>
          </div>

          {!isReviewMode ? (
            <button
              type="button"
              className={cn("timer-pill", isTimerPaused && "paused")}
              onClick={() => {
                const next = !isTimerPaused;
                setIsTimerPaused(next);
                showToast(next ? "⏸️ Taymer vaqtincha to'xtatildi" : "▶️ Taymer davom etmoqda");
              }}
              title="Vaqtni to'xtatish / davom ettirish"
            >
              <BilimIcon name="clock" size={18} />
              <span>{timeString}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsReviewMode(false)}
              className="btn gold sm"
            >
              Natijalarga qaytish
            </button>
          )}
        </div>
      </header>

      {/* 2. SUB-BAR (BO'LIM NOMI VA KO'RSATMA) */}
      <div className="sub-bar">
        <div className="sub-info">
          <span className="badge by font-black">Part {currentPart.partNumber}</span>
          <span className="sub-part-title font-black">{currentPart.title}</span>
          <span className="sub-instr">
            ({currentPart.instructions.split("\n")[0].replace("Exercise 1: ", "")})
          </span>
        </div>

        {isReviewMode && (
          <span className="badge bp font-black text-xs">
            Tekshirish rejimi (Review Mode)
          </span>
        )}
      </div>

      {/* 3. ASOSIY ISHCHI MAYDON (WORKSPACE) */}
      <main className="workspace">
        {/* ==================== PART 1: THE MYSTERY OF MARS ==================== */}
        {currentPart.id === "part-1" && (
          <div className="w-full max-w-6xl mx-auto overflow-y-auto py-6 px-2 sm:px-6 flex flex-col items-center">
            <div className="paper-box w-full p-8 sm:p-12 lg:p-14 rounded-[28px] sm:rounded-[36px] shadow-[8px_8px_0_var(--paper-ink)] border-[3.5px] border-[var(--paper-ink)]">
              {/* Header row: Asosiy Matn + Title on left, Instruction badge on right */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b-2.5 border-dashed border-[var(--paper-line)]">
                <div className="flex items-center gap-3.5 flex-wrap">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c8e6c9] text-[#1a1a1a] border-2 border-[#1a1a1a] text-xs sm:text-sm font-black shadow-[2px_2px_0_#1a1a1a]">
                    <BilimIcon name="book" size={16} />
                    <span>Asosiy Matn</span>
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] tracking-tight">
                    The Mystery of Mars
                  </h2>
                </div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffd84d] text-[#1a1a1a] border-2 border-[#1a1a1a] text-xs sm:text-sm font-black shadow-[2px_2px_0_#1a1a1a] shrink-0">
                  <BilimIcon name="pencil" size={15} />
                  <span>Bo'sh joylarni to'ldiring (1-6)</span>
                </span>
              </div>

              {/* Text with inline cloze slots matching reading.html */}
              <div className="passage-text px-2 sm:px-6">
                <p>
                  Mars is the fourth planet from the Sun and is often called the Red Planet. The{" "}
                  {renderClozeSlot("q1-1", 1)}{" "}
                  is covered in iron oxide, which gives it a reddish appearance. Scientists have been
                  studying Mars for many years, hoping to find signs of{" "}
                  {renderClozeSlot("q1-2", 2)}{" "}
                  . Although no living creatures have been discovered yet, there is evidence that{" "}
                  {renderClozeSlot("q1-3", 3)}{" "}
                  once flowed on the planet. Several rovers have been sent to explore the{" "}
                  {renderClozeSlot("q1-4", 4)}{" "}
                  and take photographs. In the future, humans might even build a{" "}
                  {renderClozeSlot("q1-5", 5)}{" "}
                  on Mars. However, surviving there will be difficult because the{" "}
                  {renderClozeSlot("q1-6", 6)}{" "}
                  is very thin and composed mostly of carbon dioxide.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PART 2: MATCHING COURSES ==================== */}
        {currentPart.id === "part-2" && (
          <div className="split-view">
            {/* Left Pane: Courses A–H */}
            <div className="pane">
              <div className="courses-grid">
                {(currentPart as any).texts.map((c: any) => {
                  const usedBy = part2UsedMap[c.letter];
                  return (
                    <article
                      key={c.id}
                      onClick={() => {
                        handleAnswerChange(activeQuestionId, c.letter);
                        showToast(`📌 "${c.letter}" varianti tanlandi`);
                      }}
                      className={cn("course-card", usedBy && "used-course")}
                      title="Bosib tanlangan savolga biriktiring"
                    >
                      <div className="course-head">
                        <span className="letter-blob">{c.letter}</span>
                        <h3 className="course-title">{c.title}</h3>
                        {usedBy && (
                          <span className="badge bg font-black text-xs px-2 py-0.5">
                            ✓ #{usedBy}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-black text-[var(--paper-o)] tracking-wider">
                        $100 · 6 WEEKS · SATURDAYS
                      </div>
                      <div className="course-body whitespace-pre-line">{c.text}</div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Right Pane: 5 People (#1–#5) */}
            <div className="pane">
              {(currentPart as any).questions.map((q: any, qIdx: number) => {
                const person = (currentPart as any).people.find((p: any) => p.id === q.personId);
                const cur = answers[q.id] || "";
                const isActive = activeQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuestionId(q.id)}
                    className={cn("q-card cursor-pointer", isActive && "active-q")}
                  >
                    <div className="q-head">
                      <span className="q-num-pill">#{qIdx + 1}</span>
                      <div className="q-text flex-1 font-black">{person?.description}</div>
                    </div>

                    <div className="pick-well">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <label className="text-xs font-black">Mos keluvchi kurs harfini tanlang:</label>
                        <div className="ltr-strip">
                          {["A", "B", "C", "D", "E", "F", "G", "H"].map((ltr) => (
                            <button
                              key={ltr}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveQuestionId(q.id);
                                handleAnswerChange(q.id, ltr);
                              }}
                              className={cn("ltr-btn", cur === ltr && "on")}
                            >
                              {ltr}
                            </button>
                          ))}
                        </div>
                      </div>

                      <select
                        className="paper-select"
                        value={cur}
                        onChange={(e) => {
                          setActiveQuestionId(q.id);
                          handleAnswerChange(q.id, e.target.value);
                        }}
                      >
                        <option value="">Kursni tanlang...</option>
                        {(currentPart as any).texts.map((t: any) => (
                          <option key={t.id} value={t.letter}>
                            {t.letter} — {t.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== PART 3: MATCHING HEADINGS ==================== */}
        {currentPart.id === "part-3" && (
          <div className="split-view ratio-42-58">
            {/* Left Pane: Available Headings */}
            <div className="pane">
              <div className="paper-box p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BilimIcon name="target" size={22} />
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                    MAVJUD SARLAVHALAR RO'YXATI (HEADINGS):
                  </h3>
                </div>
                <p className="text-xs font-bold text-[var(--paper-mut)] mb-3">
                  Sarlavha ustiga bossangiz, hozirgi faol paragrafga biriktiriladi:
                </p>
                <div className="flex flex-col gap-2">
                  {(currentPart as any).headings.map((h: any) => {
                    const usedBy = part3UsedMap[h.letter];
                    return (
                      <div
                        key={h.letter}
                        onClick={() => {
                          handleAnswerChange(activeQuestionId, h.letter);
                          showToast(`📌 "${h.letter}" sarlavhasi biriktirildi`);
                        }}
                        className={cn("heading-item", usedBy && "used-hd")}
                      >
                        <span className="letter-blob">{h.letter}</span>
                        <span className="flex-1 text-xs sm:text-sm font-bold">{h.text}</span>
                        {usedBy && (
                          <span className="badge bp text-xs font-black px-2 py-0.5">
                            P-{usedBy}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Pane: 6 Paragraphs */}
            <div className="pane">
              {(currentPart as any).questions.map((q: any, qIdx: number) => {
                const para = (currentPart as any).paragraphs.find((p: any) => p.id === q.paragraphId);
                const cur = answers[q.id] || "";
                const isActive = activeQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuestionId(q.id)}
                    className={cn("q-card cursor-pointer", isActive && "active-q")}
                  >
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="badge bp font-black text-xs px-3 py-1 flex items-center gap-1.5">
                        <BilimIcon name="quiz" size={15} />
                        <span>Paragraf {qIdx + 1}</span>
                      </span>
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed font-bold text-[var(--paper-ink)]">
                      {para?.text}
                    </p>

                    <div className="border-t-2 border-[var(--paper-ink)] pt-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-xs font-black">Mos sarlavhani tanlang:</span>
                        <div className="ltr-strip">
                          {["A", "B", "C", "D", "E", "F", "G", "H"].map((ltr) => (
                            <button
                              key={ltr}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveQuestionId(q.id);
                                handleAnswerChange(q.id, ltr);
                              }}
                              className={cn("ltr-btn", cur === ltr && "on")}
                            >
                              {ltr}
                            </button>
                          ))}
                        </div>
                      </div>

                      <select
                        className="paper-select"
                        value={cur}
                        onChange={(e) => {
                          setActiveQuestionId(q.id);
                          handleAnswerChange(q.id, e.target.value);
                        }}
                      >
                        <option value="">Sarlavhani tanlang...</option>
                        {(currentPart as any).headings.map((h: any) => (
                          <option key={h.letter} value={h.letter}>
                            {h.letter} — {h.text}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== PART 4: THE MYSTERIES OF THE DEEP OCEAN ==================== */}
        {currentPart.id === "part-4" && (
          <div className="split-view">
            {/* Left Pane: Comprehension Passage */}
            <div className="pane">
              <div className="paper-box p-4 sm:p-6">
                <div className="passage-hero">
                  <span className="badge bg font-black text-xs px-3 py-1 flex items-center gap-1.5">
                    <BilimIcon name="book" size={16} />
                    <span>Asosiy Matn</span>
                  </span>
                  <span className="text-xs font-black tracking-widest text-[var(--paper-mut)] uppercase">
                    COMPREHENSION PASSAGE
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black mb-3">
                  {currentPart.title}
                </h2>

                <div className="passage-text text-sm sm:text-base leading-relaxed space-y-3.5">
                  {(currentPart as any).passage.split("\n\n").map((para: string, idx: number) => (
                    <p key={idx}>
                      <span className="badge b-paper font-black text-[11px] px-2 py-0.5 mr-2">
                        ¶{idx + 1}
                      </span>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Pane: Questions (MCQ & TFN) */}
            <div className="pane">
              {(currentPart as any).questions.map((q: any, qIdx: number) => {
                const cur = answers[q.id] || "";
                const isTFN = q.options?.includes("True") && q.options?.includes("False");
                const isActive = activeQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuestionId(q.id)}
                    className={cn("q-card cursor-pointer", isActive && "active-q")}
                  >
                    <div className="q-head">
                      <span className="q-num-pill">#{qIdx + 1}</span>
                      <div className="q-text flex-1 font-black text-sm sm:text-base">{q.prompt}</div>
                    </div>

                    {isTFN ? (
                      <div className="tfn-row">
                        {["True", "False", "Not Given"].map((val) => (
                          <button
                            key={val}
                            type="button"
                            role="radio"
                            aria-checked={cur === val}
                            onClick={() => {
                              setActiveQuestionId(q.id);
                              handleAnswerChange(q.id, val);
                            }}
                            className="opt justify-center font-black py-2.5 text-xs sm:text-sm"
                          >
                            <span>{val}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {q.options?.map((optTxt: string, oIdx: number) => {
                          const ltr = ["A", "B", "C", "D"][oIdx];
                          return (
                            <button
                              key={optTxt}
                              type="button"
                              role="radio"
                              aria-checked={cur === optTxt}
                              onClick={() => {
                                setActiveQuestionId(q.id);
                                handleAnswerChange(q.id, optTxt);
                              }}
                              className="opt font-bold text-xs sm:text-sm"
                            >
                              <span className="opt-ltr font-black">{ltr}</span>
                              <span>{optTxt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== PART 5: WHITE STORKS IN BRITAIN ==================== */}
        {currentPart.id === "part-5" && (
          <div className="split-view">
            {/* Left Pane: Passage */}
            <div className="pane">
              <div className="paper-box p-4 sm:p-6">
                <div className="passage-hero">
                  <span className="badge bg font-black text-xs px-3 py-1 flex items-center gap-1.5">
                    <BilimIcon name="book" size={16} />
                    <span>Asosiy Matn</span>
                  </span>
                  <span className="text-xs font-black tracking-widest text-[var(--paper-mut)] uppercase">
                    COMPREHENSION PASSAGE
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black mb-3">
                  {currentPart.title}
                </h2>

                <div className="passage-text text-sm sm:text-base leading-relaxed space-y-3.5">
                  {(currentPart as any).passage.split("\n\n").map((para: string, idx: number) => (
                    <p key={idx}>
                      <span className="badge b-paper font-black text-[11px] px-2 py-0.5 mr-2">
                        ¶{idx + 1}
                      </span>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Pane: Questions (Q30..33 Short text, Q34..35 MCQ) */}
            <div className="pane">
              {(currentPart as any).questions.map((q: any, qIdx: number) => {
                const cur = answers[q.id] || "";
                const isMCQ = !!q.options;
                const isActive = activeQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuestionId(q.id)}
                    className={cn("q-card cursor-pointer", isActive && "active-q")}
                  >
                    <div className="q-head">
                      <span className="q-num-pill">#{qIdx + 1}</span>
                      <div className="q-text flex-1 font-black text-sm sm:text-base">{q.prompt}</div>
                    </div>

                    {isMCQ ? (
                      <div className="flex flex-col gap-2">
                        {q.options.map((optTxt: string, oIdx: number) => {
                          const ltr = ["A", "B", "C", "D"][oIdx];
                          return (
                            <button
                              key={optTxt}
                              type="button"
                              role="radio"
                              aria-checked={cur === optTxt}
                              onClick={() => {
                                setActiveQuestionId(q.id);
                                handleAnswerChange(q.id, optTxt);
                              }}
                              className="opt font-bold text-xs sm:text-sm"
                            >
                              <span className="opt-ltr font-black">{ltr}</span>
                              <span>{optTxt}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={cn("ig-card", cur.trim() && "filled-q")}>
                        <div className="ig-num">{30 + qIdx}</div>
                        <div className="ig-body">
                          <div className="ig-input-row py-1">
                            <BilimIcon name="pencil" size={18} />
                            <input
                              type="text"
                              className="ig-input"
                              value={cur}
                              placeholder="Bitta so'z yoki raqam yozing..."
                              onFocus={() => setActiveQuestionId(q.id)}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 4. PASTKI FOOTER PANEL */}
      <footer className="exam-footer">
        <div>
          {currentIndex > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isTransitioning}
              className="btn out flex items-center gap-2"
            >
              <BilimIcon name="back" size={18} />
              <span>Oldingi</span>
            </button>
          ) : (
            <div className="w-20"></div>
          )}
        </div>

        <div className="foot-prog-wrap">
          <div className="bar" title="Umumiy bajarilish ko'rsatkichi">
            <i style={{ width: `${overallProgressPercentage}%` }}></i>
          </div>
          <span className="font-black text-xs sm:text-sm min-w-[40px]">
            {overallProgressPercentage}%
          </span>
        </div>

        <div>
          {currentIndex < parts.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isTransitioning}
              className="btn gold flex items-center gap-2"
            >
              <span>Keyingi</span>
              <BilimIcon name="next" size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="btn green flex items-center gap-2"
            >
              <span>Yakunlash</span>
              <BilimIcon name="check" size={18} />
            </button>
          )}
        </div>
      </footer>

      {/* Toast Alert */}
      {toastMessage && (
        <div id="toasts" aria-live="polite">
          <div className="toast">{toastMessage}</div>
        </div>
      )}
    </div>
  );
}

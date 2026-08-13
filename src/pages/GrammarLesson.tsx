import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Check, X, CornerDownRight, Loader2, Mic, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageProps } from "../App";

// ─── Types ────────────────────────────────────────────────────────────────────
type BoardBlockType = "heading" | "text" | "highlight" | "bold" | "underline" | "icon" | "diagram-note";

interface BoardBlock {
  type: BoardBlockType;
  content: string;
  style?: Record<string, string>;
}

interface LessonStep {
  id: string;
  boardContent: BoardBlock[];
  speechText: string;
}

type LessonState =
  | "idle"
  | "generating-plan"
  | "playing"
  | "paused-for-question"
  | "generating-answer"
  | "answering"
  | "done";

// ─── Grammar Topics ───────────────────────────────────────────────────────────
const GRAMMAR_TOPICS = [
  { id: "to-be", label: "To Be (am/is/are)" },
  { id: "present-simple", label: "Present Simple" },
  { id: "present-continuous", label: "Present Continuous" },
  { id: "past-simple", label: "Past Simple" },
  { id: "past-continuous", label: "Past Continuous" },
  { id: "present-perfect", label: "Present Perfect" },
  { id: "future-will", label: "Future (will)" },
  { id: "articles", label: "Articles (a/an/the)" },
  { id: "conditionals", label: "Conditionals (0, 1st, 2nd)" },
  { id: "passive-voice", label: "Passive Voice" },
];

const VOICE_MODELS = [
  { id: "aura-asteria-en", name: "Asteria (Female)" },
  { id: "aura-luna-en", name: "Luna (Female)" },
  { id: "aura-zeus-en", name: "Zeus (Male)" },
  { id: "aura-orion-en", name: "Orion (Male)" },
];

// ─── BoardBlock Renderer ──────────────────────────────────────────────────────
function BoardBlockRenderer({ block, baseWordIndex, activeWordIndex }: { block: BoardBlock; baseWordIndex: number; activeWordIndex: number }) {
  const words = block.content.split(" ");
  
  const textContent = (
    <span>
      {words.map((word, i) => {
        const absoluteIdx = baseWordIndex + i;
        const isRevealed = activeWordIndex === -1 || absoluteIdx <= activeWordIndex;
        const isHighlighted = absoluteIdx === activeWordIndex;
        
        return (
          <span key={i}>
            <span 
              className={`inline-block transition-all duration-300 ${isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"} ${isHighlighted ? "bg-amber-200/50 dark:bg-amber-500/30 rounded" : ""}`}
            >
              {word}
            </span>
            {i < words.length - 1 && " "}
          </span>
        );
      })}
    </span>
  );

  if (block.type === "heading") {
    return (
      <h3 className="text-xl font-bold text-foreground mt-4 mb-2 flex items-center gap-2">
        <span className="w-1 h-6 rounded-full bg-primary inline-block" />
        {textContent}
      </h3>
    );
  }
  if (block.type === "highlight") {
    const color = block.style?.color === "info"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
      : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
    return (
      <span className={`inline-block px-2 py-0.5 rounded font-medium mx-0.5 ${color}`}>
        {textContent}
      </span>
    );
  }
  if (block.type === "bold") {
    return <strong className="font-bold text-foreground">{textContent}</strong>;
  }
  if (block.type === "underline") {
    return <span className="underline decoration-2 decoration-primary">{textContent}</span>;
  }
  if (block.type === "icon") {
    const isCheck = block.content.toLowerCase().includes("correct") || block.content.startsWith("✓");
    const isX = block.content.toLowerCase().includes("wrong") || block.content.includes("✗");
    return (
      <span className="inline-flex items-center gap-1.5 my-1">
        {isCheck && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
        {isX && <X className="w-4 h-4 text-red-500 shrink-0" />}
        {!isCheck && !isX && <CornerDownRight className="w-4 h-4 text-muted-foreground shrink-0" />}
        <span className="text-sm text-foreground">{textContent}</span>
      </span>
    );
  }
  if (block.type === "diagram-note") {
    return (
      <div className="flex items-start gap-2 pl-4 border-l-2 border-dashed border-muted-foreground/40 my-2">
        <CornerDownRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <span className="text-sm text-muted-foreground italic">{textContent}</span>
      </div>
    );
  }
  // default: "text"
  return <p className="text-base text-foreground leading-relaxed my-1">{textContent}</p>;
}

// ─── Board Step Renderer ──────────────────────────────────────────────────────
function BoardStep({ blocks, activeWordIndex }: { blocks: BoardBlock[]; activeWordIndex: number }) {
  let currentBaseIndex = 0;
  return (
    <div className="space-y-1 mb-6">
      {blocks.map((block, i) => {
        const wordCount = block.content.split(" ").length;
        const baseIndex = currentBaseIndex;
        currentBaseIndex += wordCount;
        return (
          <div key={i} className="animate-in fade-in duration-300">
            <BoardBlockRenderer block={block} baseWordIndex={baseIndex} activeWordIndex={activeWordIndex} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GrammarLesson({ onNavigate, theme, toggleTheme }: PageProps) {
  const [selectedTopic, setSelectedTopic] = useState(GRAMMAR_TOPICS[0].id);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_MODELS[0].id);
  const [lessonState, setLessonState] = useState<LessonState>("idle");
  const [steps, setSteps] = useState<LessonStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [boardActiveWordIndex, setBoardActiveWordIndex] = useState(-1);
  const [statusText, setStatusText] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const boardScrollRef = useRef<HTMLDivElement>(null);
  const prefetchAbortRef = useRef<AbortController | null>(null);
  const prefetchedAudioRef = useRef<{ index: number; url: string } | null>(null);
  const lessonStateRef = useRef<LessonState>("idle");
  const currentStepRef = useRef(0);
  const stepsRef = useRef<LessonStep[]>([]);

  // STT
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const utteranceRef = useRef("");
  const silenceTimerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync refs with state
  useEffect(() => { lessonStateRef.current = lessonState; }, [lessonState]);
  useEffect(() => { currentStepRef.current = currentStepIndex; }, [currentStepIndex]);
  useEffect(() => { stepsRef.current = steps; }, [steps]);

  // ── TTS ──────────────────────────────────────────────────────────────────────
  const fetchAudio = async (text: string, signal?: AbortSignal): Promise<string> => {
    const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY || "";
    const res = await fetch(`https://api.deepgram.com/v1/speak?model=${selectedVoice}`, {
      method: "POST",
      headers: { 
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ text }),
      signal,
    });
    if (!res.ok) throw new Error("TTS failed");
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  };



  // ── Play step ─────────────────────────────────────────────────────────────────
  const playStep = useCallback(async (index: number, audioUrl?: string) => {
    const step = stepsRef.current[index];
    if (!step) return;

    setCurrentStepIndex(index);
    setBoardActiveWordIndex(-1);
    setLessonState("playing");
    setStatusText(`Step ${index + 1} of ${stepsRef.current.length}`);

    let url = audioUrl;
    if (!url) {
      try {
        url = await fetchAudio(step.speechText);
      } catch (e) {
        console.error("TTS error", e);
        return;
      }
    }

    // Play audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(url);
    
    // Slow down playback for teaching pace, and preserve pitch
    audio.playbackRate = 0.85;
    (audio as any).preservesPitch = true;
    if ("mozPreservesPitch" in audio) (audio as any).mozPreservesPitch = true;

    audioRef.current = audio;
    
    const totalWords = step.boardContent.reduce((sum, block) => sum + block.content.split(" ").length, 0);

    audio.onplay = () => {
      setBoardActiveWordIndex(0);
      if (boardScrollRef.current) {
        boardScrollRef.current.scrollTop = boardScrollRef.current.scrollHeight;
      }
    };

    audio.ontimeupdate = () => {
      if (!audio.duration || audio.duration === Infinity) return;
      const progress = audio.currentTime / audio.duration;
      const currentWord = Math.floor(progress * totalWords);
      setBoardActiveWordIndex(Math.min(currentWord, totalWords - 1));
      
      if (boardScrollRef.current) {
        boardScrollRef.current.scrollTop = boardScrollRef.current.scrollHeight;
      }
    };

    audio.onended = () => {
      URL.revokeObjectURL(url!);
      setBoardActiveWordIndex(-1);

      const nextIndex = index + 1;
      if (nextIndex < stepsRef.current.length) {
        // Check if prefetch is ready
        const prefetched = prefetchedAudioRef.current;
        if (prefetched && prefetched.index === nextIndex) {
          prefetchedAudioRef.current = null;
          playStep(nextIndex, prefetched.url);
        } else {
          playStep(nextIndex);
        }
      } else {
        setLessonState("done");
        setStatusText("Dars tugadi!");
        stopSTT();
      }
    };

    audio.play().catch(console.error);

    // Prefetch next step audio
    if (index + 1 < stepsRef.current.length) {
      prefetchedAudioRef.current = null;
      if (prefetchAbortRef.current) prefetchAbortRef.current.abort();
      const ctrl = new AbortController();
      prefetchAbortRef.current = ctrl;
      const nextStep = stepsRef.current[index + 1];
      fetchAudio(nextStep.speechText, ctrl.signal)
        .then(nextUrl => {
          prefetchedAudioRef.current = { index: index + 1, url: nextUrl };
        })
        .catch(() => {}); // ignore abort errors
    }
  }, [selectedVoice]);

  // ── Interrupt / barge-in ──────────────────────────────────────────────────────
  const handleInterrupt = useCallback(async (question: string) => {
    // 1. Pause audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // 2. Cancel prefetch
    if (prefetchAbortRef.current) prefetchAbortRef.current.abort();
    if (prefetchedAudioRef.current) {
      URL.revokeObjectURL(prefetchedAudioRef.current.url);
      prefetchedAudioRef.current = null;
    }

    setLessonState("generating-answer");
    setStatusText("AI javob tayyorlamoqda...");

    const currentStep = stepsRef.current[currentStepRef.current];
    const contextBoard = currentStep?.boardContent
      .map(b => `${b.type}: ${b.content}`)
      .join("\n") || "";

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || "";
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an AI grammar teacher giving a lesson. The current lesson step board content is:\n${contextBoard}\n\nThe teacher just said: "${currentStep?.speechText}"\n\nAnswer the student's question concisely (2-4 sentences). Stay on topic, be encouraging and clear. Use plain text only, no markdown.`
            },
            { role: "user", content: question }
          ],
        }),
      });

      const data = await res.json();
      const answerText = data.choices?.[0]?.message?.content || "Men javob bera olmadim.";

      setLessonState("answering");
      const answerUrl = await fetchAudio(answerText);
      const audio = new Audio(answerUrl);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(answerUrl);
        // Resume with transition
        const transitionText = "Xo'p, davom etamiz.";
        fetchAudio(transitionText).then(transUrl => {
          const transAudio = new Audio(transUrl);
          audioRef.current = transAudio;
          transAudio.onended = () => {
            URL.revokeObjectURL(transUrl);
            // Resume current step from paused position
            playStep(currentStepRef.current);
          };
          transAudio.play().catch(console.error);
        });
      };
      audio.play().catch(console.error);

    } catch (e) {
      console.error("Answer generation failed", e);
      playStep(currentStepRef.current);
    }
  }, [playStep]);

  // ── STT via temp token ────────────────────────────────────────────────────────
  const startSTT = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY || "";
      const socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en&endpointing=500&interim_results=true`,
        ["token", apiKey]
      );
      socketRef.current = socket;

      socket.onopen = () => {
        const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
        mr.addEventListener("dataavailable", (e) => {
          if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(e.data);
          }
        });
        mr.start(250);
        mediaRecorderRef.current = mr;
      };

      socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        if (!transcript) return;

        const state = lessonStateRef.current;
        if (state === "generating-answer" || state === "answering" || state === "generating-plan" || state === "idle") return;

        if (data.is_final) {
          utteranceRef.current += transcript + " ";
        } else {
          setLiveTranscript(transcript);
        }

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const utterance = utteranceRef.current.trim();
          if (utterance.length > 3) {
            utteranceRef.current = "";
            setLiveTranscript("");
            handleInterrupt(utterance);
          }
        }, 1500);
      };

      socket.onclose = () => {};
    } catch (e) {
      console.error("STT start failed", e);
    }
  }, [handleInterrupt]);

  const stopSTT = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  // ── Start Lesson ──────────────────────────────────────────────────────────────
  const startLesson = async () => {
    setError(null);
    setLessonState("generating-plan");
    setStatusText("Dars rejasi tayyorlanmoqda...");
    setSteps([]);
    setCurrentStepIndex(0);
    setBoardActiveWordIndex(-1);

    const topic = GRAMMAR_TOPICS.find(t => t.id === selectedTopic)?.label || selectedTopic;

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || "";
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an English grammar teacher creating an interactive lesson. Generate a lesson plan as a JSON array of steps. Each step has:
- id: unique string
- boardContent: array of board blocks (each with type and content)
- speechText: what the teacher says while this board content appears

Board block types: "heading", "text", "highlight" (colored background), "bold", "underline", "icon" (prefix content with ✓ for correct or ✗ for wrong examples), "diagram-note" (annotation/connection note)

Make 6-8 steps. Be educational, clear, and use real English grammar examples. Use variety in block types to keep the board visually interesting.

Output ONLY a valid JSON array, no markdown fences, no extra text.`
            },
            {
              role: "user",
              content: `Create a complete grammar lesson about: ${topic}`
            }
          ],
        }),
      });

      const data = await res.json();
      let text = (data.choices?.[0]?.message?.content || "").trim();

      // Strip markdown fences if present
      if (text.startsWith("```json")) text = text.slice(7);
      else if (text.startsWith("```")) text = text.slice(3);
      if (text.endsWith("```")) text = text.slice(0, -3);
      text = text.trim();

      const parsed: LessonStep[] = JSON.parse(text);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid lesson plan");

      setSteps(parsed);
      stepsRef.current = parsed;

      // Start STT
      await startSTT();

      // Begin playing step 0
      await playStep(0);

    } catch (e: any) {
      console.error("Lesson generation failed", e);
      setError("Darsni yaratishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
      setLessonState("idle");
    }
  };

  const handleRepeat = () => {
    if (audioRef.current) audioRef.current.pause();
    if (prefetchAbortRef.current) prefetchAbortRef.current.abort();
    prefetchedAudioRef.current = null;
    playStep(currentStepIndex);
  };

  const handleStop = () => {
    if (audioRef.current) audioRef.current.pause();
    if (prefetchAbortRef.current) prefetchAbortRef.current.abort();
    stopSTT();
    setLessonState("idle");
    setSteps([]);
    setCurrentStepIndex(0);
    setBoardActiveWordIndex(-1);
    setStatusText("");
  };

  // Cleanup
  useEffect(() => {
    return () => {
      handleStop();
    };
  }, []);

  const isActive = lessonState !== "idle" && lessonState !== "done";
  const currentStep = steps[currentStepIndex];

  // ─── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-background z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { handleStop(); onNavigate("dashboard"); }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg text-foreground">AI Grammar Teacher</h1>
            {isActive && (
              <p className="text-xs text-muted-foreground">{statusText}</p>
            )}
          </div>
        </div>
        {isActive && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentStepIndex + 1} / {steps.length}
            </span>
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${((currentStepIndex) / Math.max(steps.length - 1, 1)) * 100}%` }}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={handleRepeat} title="Takrorlab bering" className="gap-1.5">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Takror</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleStop}>To'xtat</Button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Idle / Topic Selector */}
        {lessonState === "idle" && (
          <div className="max-w-lg w-full space-y-6 text-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Grammatika Darsi</h2>
              <p className="text-muted-foreground">Mavzuni tanlang va AI o'qituvchingiz doska yozib tushuntiradi</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {GRAMMAR_TOPICS.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`p-3 rounded-xl border text-sm font-medium text-left transition-all
                    ${selectedTopic === topic.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                >
                  {topic.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 justify-center">
              <span className="text-sm text-muted-foreground">Ovoz:</span>
              <select
                value={selectedVoice}
                onChange={e => setSelectedVoice(e.target.value)}
                className="text-sm rounded-lg border border-border bg-card px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {VOICE_MODELS.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2 border border-destructive/20">
                {error}
              </p>
            )}

            <Button size="lg" className="w-full h-12 text-base" onClick={startLesson}>
              Darsni boshlash
            </Button>
          </div>
        )}

        {/* Generating Plan */}
        {lessonState === "generating-plan" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <p className="text-lg font-medium text-foreground">Dars rejasi tayyorlanmoqda...</p>
            <p className="text-sm text-muted-foreground">Bu bir necha soniya oladi</p>
          </div>
        )}

        {/* Active Lesson — Whiteboard */}
        {(lessonState === "playing" || lessonState === "paused-for-question" || lessonState === "generating-answer" || lessonState === "answering") && currentStep && (
          <div className="w-full max-w-3xl space-y-4">
            {/* AI Status Indicator */}
            {(lessonState === "generating-answer" || lessonState === "answering") && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                <span className="text-sm text-amber-700 dark:text-amber-400">
                  {lessonState === "generating-answer" ? "AI javob tayyorlamoqda..." : "AI javob bermoqda..."}
                </span>
              </div>
            )}

            {/* Live Transcript */}
            {liveTranscript && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Mic className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="text-sm text-blue-700 dark:text-blue-300 italic">"{liveTranscript}"</span>
              </div>
            )}

            {/* Whiteboard */}
            <div className="bg-[#FDFDF9] dark:bg-neutral-800 border border-border/50 rounded-2xl shadow-xl overflow-hidden mb-6 mx-auto w-full max-w-4xl relative">
              {/* Board content */}
              <div className="p-8 sm:p-12 min-h-[400px] font-sans text-slate-800 dark:text-neutral-100 leading-relaxed text-lg flex flex-col justify-end">
                {/* Auto-scroll container */}
                <div className="max-h-[500px] overflow-y-auto pr-4 scroll-smooth" ref={boardScrollRef}>
                  {steps.slice(0, currentStepIndex + 1).map((step, idx) => {
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <BoardStep 
                        key={step.id}
                        blocks={step.boardContent}
                        activeWordIndex={isCurrent ? boardActiveWordIndex : -1}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Speech text */}
            <div className="flex items-start gap-3 px-4 py-3 bg-card rounded-xl border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">AI</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{currentStep.speechText}</p>
            </div>

            {/* Hint */}
            {lessonState === "playing" && (
              <p className="text-center text-xs text-muted-foreground">
                💬 Savol bor bo'lsa, istalgan vaqt gapiring — AI eshitib turadi
              </p>
            )}
          </div>
        )}

        {/* Done */}
        {lessonState === "done" && (
          <div className="max-w-md text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Dars tugadi!</h2>
              <p className="text-muted-foreground">
                {GRAMMAR_TOPICS.find(t => t.id === selectedTopic)?.label} mavzusini muvaffaqiyatli o'rgandingiz.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleStop}>Yangi mavzu</Button>
              <Button onClick={() => { handleStop(); onNavigate("dashboard"); }}>Dashboard</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

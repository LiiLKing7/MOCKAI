import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Check, Loader2, Mic, RotateCcw } from "lucide-react";
import { PageProps } from "../App";
import { BilimIcon } from "@/components/ui/bilim-icon";

// ─── Types ────────────────────────────────────────────────────────────────────
type TextSpan = {
  text: string;
  emphasis?: "bold" | "highlight" | "none";
};

type BoardBlock =
  | { type: "heading"; content: string }
  | { type: "paragraph"; spans: TextSpan[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "example-badge"; content: string }
  | { type: "icon-note"; icon: string; content: string };

interface LessonStep {
  id: string;
  speechText: string;
  boardContent: BoardBlock[];
}

// ─── TTS Sanitizer ────────────────────────────────────────────────────────────
function sanitizeForTTS(text: string): string {
  return text
    .replace(/[*#_~`]/g, '')      // strip markdown symbols
    .replace(/\//g, ' or ')       // "am/is/are" → "am or is or are"
    .replace(/\s{2,}/g, ' ')      // collapse double spaces
    .replace(/<[^>]+>/g, '')       // strip any stray HTML/SSML
    .trim();
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
  { id: "to-be", label: "To Be (am/is/are)", level: "A1" },
  { id: "present-simple", label: "Present Simple", level: "A1-A2" },
  { id: "present-continuous", label: "Present Continuous", level: "A2" },
  { id: "past-simple", label: "Past Simple", level: "A2" },
  { id: "past-continuous", label: "Past Continuous", level: "B1" },
  { id: "present-perfect", label: "Present Perfect", level: "B1" },
  { id: "future-will", label: "Future (will / going to)", level: "A2-B1" },
  { id: "articles", label: "Articles (a/an/the)", level: "A1-B1" },
  { id: "conditionals", label: "Conditionals (0, 1st, 2nd)", level: "B1-B2" },
  { id: "passive-voice", label: "Passive Voice", level: "B2" },
];

const VOICE_MODELS = [
  { id: "aura-asteria-en", name: "Asteria (Female)" },
  { id: "aura-luna-en", name: "Luna (Female)" },
  { id: "aura-zeus-en", name: "Zeus (Male)" },
  { id: "aura-orion-en", name: "Orion (Male)" },
];

// ─── Board Block Renderers ────────────────────────────────────────────────────

function ParagraphBlock({ spans, baseWordIndex, activeWordIndex }: { spans: TextSpan[]; baseWordIndex: number; activeWordIndex: number }) {
  let wordOffset = 0;
  return (
    <p className="text-base sm:text-lg leading-relaxed my-3 font-medium text-[var(--paper-ink)]">
      {spans.map((span, si) => {
        const words = span.text.split(/\s+/).filter(Boolean);
        const spanStart = baseWordIndex + wordOffset;
        const result = (
          <span key={si} className={`${span.emphasis === 'bold' ? 'font-black' : ''} ${span.emphasis === 'highlight' ? 'bg-[var(--paper-y)] px-1 rounded border border-[var(--paper-ink)] font-bold' : ''}`}>
            {words.map((word, wi) => {
              const absIdx = spanStart + wi;
              const isRevealed = activeWordIndex === -1 || absIdx <= activeWordIndex;
              const isKaraoke = absIdx === activeWordIndex;
              return (
                <span key={wi}>
                  <span className={`inline-block transition-all duration-200 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'} ${isKaraoke ? 'bg-[var(--paper-y)] text-[var(--paper-ink)] font-black scale-105 rounded px-1 border border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)]' : ''}`}>
                    {word}
                  </span>
                  {wi < words.length - 1 && ' '}
                </span>
              );
            })}
            {si < spans.length - 1 && ' '}
          </span>
        );
        wordOffset += words.length;
        return result;
      })}
    </p>
  );
}

function HeadingBlock({ content }: { content: string }) {
  return (
    <div className="flex items-center gap-2.5 mt-6 mb-3">
      <div className="w-3 h-7 bg-[var(--paper-o)] rounded-md border-2 border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)]" />
      <h3 className="text-xl sm:text-2xl font-black text-[var(--paper-ink)] tracking-tight">
        {content}
      </h3>
    </div>
  );
}

function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border-3 border-[var(--paper-ink)] shadow-[4px_4px_0_var(--paper-ink)] bg-[var(--paper)]">
      <table className="w-full border-collapse text-sm sm:text-base">
        <thead>
          <tr className="bg-[var(--paper-y)] border-b-3 border-[var(--paper-ink)] text-[var(--paper-on)] font-black">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-2.5 border-r-2 last:border-r-0 border-[var(--paper-ink)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b-2 last:border-b-0 border-[var(--paper-ink)] hover:bg-[var(--paper-card)]">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 border-r-2 last:border-r-0 border-[var(--paper-ink)] text-[var(--paper-ink)] font-semibold">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExampleBadge({ content }: { content: string }) {
  return (
    <span className="inline-block px-3 py-1 rounded-lg bg-[var(--paper-p)] text-white text-xs sm:text-sm font-black border-2 border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)] mr-2 mb-2">
      {content}
    </span>
  );
}

function IconNote({ icon, content }: { icon: string; content: string }) {
  return (
    <div className="flex items-start gap-3 my-3 p-3.5 rounded-xl bg-[var(--paper-card)] border-2 border-[var(--paper-ink)] shadow-[3px_3px_0_var(--paper-ink)]">
      <span className="text-xl shrink-0">{icon}</span>
      <span className="text-xs sm:text-sm font-bold text-[var(--paper-ink)] leading-snug">{content}</span>
    </div>
  );
}

// ─── Board Step Renderer ──────────────────────────────────────────────────────
function BoardStepView({ step, activeWordIndex }: { step: LessonStep; activeWordIndex: number }) {
  // Only paragraph blocks participate in karaoke — count words to compute per-block base offset
  let paragraphWordOffset = 0;
  
  return (
    <div className="mb-8">
      {step.boardContent.map((block, i) => {
        if (block.type === 'heading') {
          return <HeadingBlock key={i} content={block.content} />;
        }
        if (block.type === 'paragraph') {
          const totalWordsInBlock = block.spans.reduce((sum, s) => sum + s.text.split(/\s+/).filter(Boolean).length, 0);
          const base = paragraphWordOffset;
          paragraphWordOffset += totalWordsInBlock;
          return <ParagraphBlock key={i} spans={block.spans} baseWordIndex={base} activeWordIndex={activeWordIndex} />;
        }
        if (block.type === 'table') {
          return <TableBlock key={i} headers={block.headers} rows={block.rows} />;
        }
        if (block.type === 'example-badge') {
          return <ExampleBadge key={i} content={block.content} />;
        }
        if (block.type === 'icon-note') {
          return <IconNote key={i} icon={block.icon} content={block.content} />;
        }
        return null;
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
    const cleanText = sanitizeForTTS(text);
    const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY || "";
    const res = await fetch(`https://api.deepgram.com/v1/speak?model=${selectedVoice}`, {
      method: "POST",
      headers: { 
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ text: cleanText }),
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
    
    // Natural teaching pace should be handled by LLM punctuation now
    audio.playbackRate = 1.0;

    audioRef.current = audio;
    
    const cleanText = sanitizeForTTS(step.speechText);
    const totalWords = cleanText.split(/\s+/).filter(Boolean).length;

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
              content: `You are an AI grammar teacher giving a lesson. The current lesson text on the board is:\n"${currentStep?.speechText}"\n\nAnswer the student's question concisely (2-4 sentences). Stay on topic, be encouraging and clear. Use plain text only, no markdown.`
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
              content: `You are an English grammar teacher creating an interactive whiteboard lesson. Generate a lesson plan as a JSON array of steps.

Each step has:
- "id": unique string
- "speechText": clean narration the teacher speaks aloud. MUST contain ONLY natural words and standard punctuation (. , ? ! ... —). NEVER use symbols like * # _ / or markdown formatting. Write out words instead (e.g. "am, is, or are" NOT "am/is/are").
- "boardContent": array of visual board blocks. Block types:
  {"type":"heading","content":"..."}
  {"type":"paragraph","spans":[{"text":"...","emphasis":"bold|highlight|none"},...]}  — the paragraph text should closely mirror speechText so karaoke word-highlighting works. Use emphasis for key grammar terms.
  {"type":"table","headers":[...],"rows":[[...],...]}  — for conjugation tables, comparisons, etc. NOT read by TTS.
  {"type":"example-badge","content":"..."}  — short reference chips. NOT read by TTS.
  {"type":"icon-note","icon":"emoji","content":"..."}  — brief supporting notes. NOT read by TTS.

IMPORTANT RULES:
1. speechText is ONLY for spoken narration. Never put table data, badge text, or symbols in it.
2. paragraph spans mirror speechText for visual word-sync. Tables and badges are supplementary visuals.
3. Use shorter sentences with natural pauses (commas, periods, ellipses).
4. Make 4-6 steps. Be educational, clear, use real examples.
5. Output ONLY a valid JSON array, no markdown fences.`
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
    <div className="reading-paper-container min-h-screen flex flex-col bg-[var(--paper)] text-[var(--paper-ink)]">
      {/* Top Header - MockAi Style */}
      <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-3 border-[var(--paper-ink)] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { handleStop(); onNavigate("dashboard"); }}
            className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0 flex items-center justify-center font-black"
            title="Dashboardga qaytish"
          >
            ←
          </button>
          
          <div
            onClick={() => { handleStop(); onNavigate("dashboard"); }}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <i className="paper-logo-mark">✦</i>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-[var(--paper-ink)] group-hover:text-[var(--paper-o)] transition-colors">
                bilim<span className="text-[var(--paper-o)]">box</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--paper-mut)] -mt-1">
                Grammar Teacher
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isActive && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[var(--paper-y)] text-[var(--paper-on)] border-2 border-[var(--paper-ink)]">
                {currentStepIndex + 1} / {steps.length}
              </span>

              <div className="w-20 sm:w-28 h-2.5 bg-[var(--paper-card)] border-2 border-[var(--paper-ink)] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-[var(--paper-o)] rounded-full transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / Math.max(steps.length, 1)) * 100}%` }}
                />
              </div>

              <button
                type="button"
                onClick={handleRepeat}
                className="paper-btn paper-btn-out paper-btn-sm font-black flex items-center gap-1.5 text-xs"
                title="Qaytadan eshitish"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Takror</span>
              </button>

              <button
                type="button"
                onClick={handleStop}
                className="paper-btn paper-btn-sm font-black text-xs text-white bg-[var(--paper-r)]"
              >
                To'xtatish
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0"
            title="Rejimni almashtirish"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto">
        {/* Idle / Topic Selector */}
        {lessonState === "idle" && (
          <div className="max-w-2xl w-full space-y-6 my-auto py-6">
            <div className="paper-box p-8 bg-[var(--paper-y)] text-[var(--paper-on)] text-center relative overflow-hidden">
              <span className="inline-block px-3 py-1 rounded-full bg-white/90 text-[var(--paper-ink)] text-xs font-black uppercase tracking-wider mb-3 border-2 border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)]">
                ✦ Interaktiv AI O'qituvchi
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mb-2">Grammatika Darsi</h2>
              <p className="text-sm font-bold opacity-85 max-w-lg mx-auto">
                O'rganmoqchi bo'lgan mavzuni tanlang. AI o'qituvchi doskada tushuntirib, ovoz orqali jonli savol-javob qiladi!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GRAMMAR_TOPICS.map((topic) => {
                const isSelected = selectedTopic === topic.id;
                return (
                  <div
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`paper-box p-4 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[var(--paper-y)] translate-x-1 translate-y-1 shadow-[2px_2px_0_var(--paper-ink)]"
                        : "bg-[var(--paper-card)] hover:translate-x-0.5 hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full border-2 border-[var(--paper-ink)] ${isSelected ? "bg-[var(--paper-o)]" : "bg-transparent"}`} />
                      <span className="font-black text-sm text-[var(--paper-ink)]">{topic.label}</span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[var(--paper)] text-[var(--paper-ink)] border border-[var(--paper-ink)]">
                      {topic.level}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="paper-box p-4 bg-[var(--paper-card)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎙️</span>
                <span className="text-xs font-black uppercase tracking-wider text-[var(--paper-mut)]">O'qituvchi Ovozi:</span>
              </div>
              <select
                value={selectedVoice}
                onChange={e => setSelectedVoice(e.target.value)}
                className="bg-[var(--paper)] text-xs font-black border-2 border-[var(--paper-ink)] rounded-xl px-3 py-2 text-[var(--paper-ink)] focus:outline-none shadow-[2px_2px_0_var(--paper-ink)]"
              >
                {VOICE_MODELS.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="paper-box p-4 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-2 border-red-500 font-bold text-sm">
                {error}
              </div>
            )}

            <button 
              type="button"
              onClick={startLesson}
              className="paper-btn paper-btn-p w-full py-4 text-base font-black flex items-center justify-center gap-2 shadow-[4px_4px_0_var(--paper-ink)]"
            >
              <BilimIcon name="pencil" size={20} />
              <span>Darsni Boshlash</span>
            </button>
          </div>
        )}

        {/* Generating Plan */}
        {lessonState === "generating-plan" && (
          <div className="paper-box p-12 max-w-md w-full bg-[var(--paper-card)] text-center space-y-4 my-auto">
            <img src="/logo.svg" alt="MockAi" className="w-16 h-16 animate-bounce mx-auto" />
            <h3 className="text-2xl font-black text-[var(--paper-ink)]">Dars rejasi tuzilmoqda...</h3>
            <p className="text-xs font-bold text-[var(--paper-mut)] leading-relaxed">
              AI o'qituvchi tanlangan mavzu bo'yicha interaktiv doska qadamlarini tayyorlayapti. Bir necha soniya kuting...
            </p>
            <div className="w-16 h-16 rounded-full border-4 border-[var(--paper-ink)] border-t-[var(--paper-o)] animate-spin mx-auto mt-4" />
          </div>
        )}

        {/* Active Lesson — Whiteboard */}
        {(lessonState === "playing" || lessonState === "paused-for-question" || lessonState === "generating-answer" || lessonState === "answering") && currentStep && (
          <div className="w-full max-w-3xl space-y-4 my-auto py-4">
            {/* AI Status Indicator */}
            {(lessonState === "generating-answer" || lessonState === "answering") && (
              <div className="paper-box p-3 bg-[var(--paper-y)] text-[var(--paper-on)] flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs font-black uppercase tracking-wider">
                  {lessonState === "generating-answer" ? "AI javob tayyorlamoqda..." : "AI javob bermoqda..."}
                </span>
              </div>
            )}

            {/* Live Transcript */}
            {liveTranscript && (
              <div className="paper-box p-3.5 bg-[var(--paper-b)] text-white flex items-center gap-3 shadow-[3px_3px_0_var(--paper-ink)]">
                <Mic className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-black italic">"{liveTranscript}"</span>
              </div>
            )}

            {/* Whiteboard Canvas */}
            <div className="paper-box bg-[#FFFDF7] dark:bg-[#1a1b1e] border-4 border-[var(--paper-ink)] shadow-[8px_8px_0_var(--paper-ink)] overflow-hidden relative min-h-[60vh] flex flex-col">
              {/* Tape Graphic Top */}
              <div className="w-28 h-6 bg-amber-200/90 dark:bg-amber-900/40 border-2 border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)] mx-auto -mt-3 rotate-[-1deg] rounded-sm z-10" />

              {/* Board content */}
              <div className="p-6 sm:p-10 text-[var(--paper-ink)] flex-1 flex flex-col justify-end">
                {/* Auto-scroll container */}
                <div className="overflow-y-auto pr-2 scroll-smooth max-h-[55vh]" ref={boardScrollRef}>
                  {steps.slice(0, currentStepIndex + 1).map((step, idx) => {
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <BoardStepView 
                        key={step.id}
                        step={step}
                        activeWordIndex={isCurrent ? boardActiveWordIndex : -1}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hint */}
            {lessonState === "playing" && (
              <div className="text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--paper-card)] border-2 border-[var(--paper-ink)] text-xs font-bold text-[var(--paper-mut)] shadow-[2px_2px_0_var(--paper-ink)]">
                  💬 Savolingiz bo'lsa, istalgan vaqtda gapiring — AI eshitib turadi
                </span>
              </div>
            )}
          </div>
        )}

        {/* Done */}
        {lessonState === "done" && (
          <div className="paper-box p-8 sm:p-12 max-w-md w-full bg-[var(--paper-card)] text-center space-y-6 my-auto">
            <div className="text-6xl animate-bounce">🎉</div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[var(--paper-g)] text-white text-xs font-black uppercase tracking-wider mb-2 border-2 border-[var(--paper-ink)]">
                ✦ Muvaffaqiyatli
              </span>
              <h2 className="text-3xl font-black text-[var(--paper-ink)]">Dars Yakunlandi!</h2>
              <p className="text-xs font-bold text-[var(--paper-mut)] mt-2 leading-relaxed">
                {GRAMMAR_TOPICS.find(t => t.id === selectedTopic)?.label} mavzusidagi darsni muvaffaqiyatli tugatdingiz.
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button 
                type="button"
                onClick={handleStop}
                className="paper-btn paper-btn-out font-black text-sm px-5 py-2.5"
              >
                Yangi Mavzu
              </button>
              <button 
                type="button"
                onClick={() => { handleStop(); onNavigate("dashboard"); }}
                className="paper-btn paper-btn-p font-black text-sm px-5 py-2.5"
              >
                Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

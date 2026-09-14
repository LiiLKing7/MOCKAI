import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Volume2, User, Bot, ChevronLeft, ChevronRight, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Strands from "@/components/ui/strands";
import { GlassButton } from "@/components/ui/glass-button";
import Teleprompter, { TeleprompterItem } from "@/components/ui/Teleprompter";
import TextReveal from "@/components/ui/TextReveal";
import AutoTextReveal from "@/components/ui/AutoTextReveal";
import LiveSubtitle from "@/components/ui/LiveSubtitle";
import { DebugOverlay } from "@/components/ui/DebugOverlay";
import { ViewState } from "../App";

import { PageProps } from "../App";
import { BookOpen, Moon, Sun } from "lucide-react";

const DEEPGRAM_API_KEY = (import.meta as any).env.VITE_DEEPGRAM_API_KEY || "";
const OPENROUTER_API_KEY = (import.meta as any).env.VITE_OPENROUTER_API_KEY || "";
const TAVILY_API_KEY = (import.meta as any).env.VITE_TAVILY_API_KEY || "";

type Message = { role: "user" | "assistant" | "tool"; content: string; feedback?: string; name?: string; tool_call_id?: string; tool_calls?: any[] };

const AI_MODELS = [
  { id: "meta-llama/llama-3.1-8b-instruct", name: "Llama 3.1 8B (Fast & Cheap)", supportsTools: true },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B (Smart)", supportsTools: true },
  { id: "google/gemini-2.0-flash-lite-preview-02-05:free", name: "Gemini Flash Lite (Free & Fast)", supportsTools: false },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash (Super Fast)", supportsTools: true },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", supportsTools: true },
  { id: "openai/gpt-4o", name: "GPT-4o (Premium)", supportsTools: true },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", supportsTools: true },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet (Best)", supportsTools: true },
  { id: "mistralai/mistral-nemo", name: "Mistral Nemo", supportsTools: false },
  { id: "qwen/qwen-2.5-7b-instruct", name: "Qwen 2.5 7B", supportsTools: true }
];

const VOICE_MODELS = [
  { id: "aura-2-helena-en", name: "Helena (Aura 2 - Female)" },
  { id: "aura-asteria-en", name: "Asteria (Female)" },
  { id: "aura-luna-en", name: "Luna (Female)" },
  { id: "aura-stella-en", name: "Stella (Female)" },
  { id: "aura-athena-en", name: "Athena (Female)" },
  { id: "aura-hera-en", name: "Hera (Female)" },
  { id: "aura-orion-en", name: "Orion (Male)" },
  { id: "aura-arcas-en", name: "Arcas (Male)" },
  { id: "aura-perseus-en", name: "Perseus (Male)" },
  { id: "aura-angus-en", name: "Angus (Male)" },
  { id: "aura-orpheus-en", name: "Orpheus (Male)" },
  { id: "aura-helios-en", name: "Helios (Male)" },
  { id: "aura-zeus-en", name: "Zeus (Male)" }
];

export default function SpeakingTest({ onNavigate, theme, toggleTheme }: PageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [finalizedTranscript, setFinalizedTranscript] = useState("");
  const [liveInterimText, setLiveInterimText] = useState("");
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_MODELS[0].id);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mode, setMode] = useState<"selection" | "practice_setup" | "practice" | "mock_setup" | "mock" | "practice_summary">("selection");
  const [practiceTopic, setPracticeTopic] = useState("");
  const [practiceDifficulty, setPracticeDifficulty] = useState<"natural" | "slow">("natural");
  const [mockPhase, setMockPhase] = useState<"part1.1_intro" | "part1.1_q_think" | "part1.1_q_speak" | "part1.2_intro" | "part1.2_images_think" | "part1.2_images_speak" | "part1.2_followup_think" | "part1.2_followup_speak" | "part2_intro" | "part2_prep" | "part2_speak" | "part3_intro" | "part3_prep" | "part3_speak" | "completed" | "assessment">("part1.1_intro");
  const [mockQuestionIndex, setMockQuestionIndex] = useState(0);
  const [mockTimeLeft, setMockTimeLeft] = useState(0);
  const [mockIsTimerRunning, setMockIsTimerRunning] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [practiceStats, setPracticeStats] = useState<any>(null);
  const [mockCurrentSubtitle, setMockCurrentSubtitle] = useState("");

  const MOCK_DATA = {
    part1_1: [
      "Where do you like to go to in your free time?",
      "Do you work or study?",
      "Do you like listening to music?"
    ],
    part1_2_images: [
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800"
    ],
    part1_2_task: "What do you see in these pictures?",
    part1_2_followups: [
      "Why do some people like to eat fast food?",
      "Do you think breakfast is important?"
    ],
    part2: [
      "Tell me about a skill you have learned recently.",
      "Why is it important nowadays?",
      "Give an example of when you use this skill."
    ],
    part3_image: "/part3_table.png",
    part3_task: "Discuss the advantages and disadvantages of video games on children based on the table provided."
  };

  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  const mockPhaseRef = useRef(mockPhase);
  useEffect(() => { mockPhaseRef.current = mockPhase; }, [mockPhase]);
  const mockQuestionIndexRef = useRef(mockQuestionIndex);
  useEffect(() => { mockQuestionIndexRef.current = mockQuestionIndex; }, [mockQuestionIndex]);
  const mockIsTimerRunningRef = useRef(mockIsTimerRunning);
  useEffect(() => { mockIsTimerRunningRef.current = mockIsTimerRunning; }, [mockIsTimerRunning]);

  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [teleprompterItems, setTeleprompterItems] = useState<TeleprompterItem[]>([]);

  // Refs for callbacks to access latest state
  const isThinkingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const utteranceRef = useRef("");
  const audioVolumeRef = useRef(0);
  const messagesRef = useRef<Message[]>([]);
  const selectedModelRef = useRef(AI_MODELS[0].id);
  const selectedVoiceRef = useRef(VOICE_MODELS[0].id);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<{ id: string, url: string | null, ready: boolean, text?: string }[]>([]);
  const isPlayingAudioRef = useRef(false);
  const isGeneratingRef = useRef(false);
  const mockPartTurnCountRef = useRef(0);
  const sessionStartTimeRef = useRef(0);
  const silenceTimeoutRef = useRef<any>(null);

  // Debug & Reconnect states
  const [micReadyState, setMicReadyState] = useState("");
  const [socketReadyState, setSocketReadyState] = useState(3);
  const [isReconnectingStt, setIsReconnectingStt] = useState(false);
  const isRecordingRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const SHOW_DEBUG = false;

  const handleModelChange = (val: string) => {
    setSelectedModel(val);
    selectedModelRef.current = val;
  };

  const handleVoiceChange = (val: string) => {
    setSelectedVoice(val);
    selectedVoiceRef.current = val;
  };
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Helpers to update both state and ref
  const setThinking = (val: boolean) => {
    isThinkingRef.current = val;
    setIsThinking(val);
  };
  const setSpeaking = (val: boolean) => {
    isSpeakingRef.current = val;
    setIsSpeaking(val);
  };

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const handleTimerEnd = () => {
    const phase = mockPhaseRef.current;
    if (phase === "part1.1_q_think") {
      mockPhaseRef.current = "part1.1_q_speak";
      setMockPhase("part1.1_q_speak");
      setMockTimeLeft(30);
    } else if (phase === "part1.1_q_speak") {
      const nextIdx = mockQuestionIndexRef.current + 1;
      if (nextIdx < MOCK_DATA.part1_1.length) {
        mockQuestionIndexRef.current = nextIdx;
        setMockQuestionIndex(nextIdx);
        mockPhaseRef.current = "part1.1_q_think";
        setMockPhase("part1.1_q_think");
        setMockTimeLeft(5);
        if (handleUserMessageRef.current) handleUserMessageRef.current("", null, true);
      } else {
        mockPhaseRef.current = "part1.2_intro";
        setMockPhase("part1.2_intro");
        setMockIsTimerRunning(false);
        if (handleUserMessageRef.current) handleUserMessageRef.current("", null, true);
      }
    } else if (phase === "part1.2_images_think") {
      mockPhaseRef.current = "part1.2_images_speak";
      setMockPhase("part1.2_images_speak");
      setMockTimeLeft(45);
    } else if (phase === "part1.2_images_speak") {
      mockPhaseRef.current = "part1.2_followup_think";
      setMockPhase("part1.2_followup_think");
      mockQuestionIndexRef.current = 0;
      setMockQuestionIndex(0);
      setMockTimeLeft(5);
      if (handleUserMessageRef.current) handleUserMessageRef.current("", null, true);
    } else if (phase === "part1.2_followup_think") {
      mockPhaseRef.current = "part1.2_followup_speak";
      setMockPhase("part1.2_followup_speak");
      setMockTimeLeft(30);
    } else if (phase === "part1.2_followup_speak") {
      const nextIdx = mockQuestionIndexRef.current + 1;
      if (nextIdx < MOCK_DATA.part1_2_followups.length) {
        mockQuestionIndexRef.current = nextIdx;
        setMockQuestionIndex(nextIdx);
        mockPhaseRef.current = "part1.2_followup_think";
        setMockPhase("part1.2_followup_think");
        setMockTimeLeft(5);
        if (handleUserMessageRef.current) handleUserMessageRef.current("", null, true);
      } else {
        mockPhaseRef.current = "part2_intro";
        setMockPhase("part2_intro");
        setMockIsTimerRunning(false);
        if (handleUserMessageRef.current) handleUserMessageRef.current("", null, true);
      }
    } else if (phase === "part2_prep") {
      mockPhaseRef.current = "part2_speak";
      setMockPhase("part2_speak");
      setMockTimeLeft(120);
    } else if (phase === "part2_speak") {
      mockPhaseRef.current = "part3_intro";
      setMockPhase("part3_intro");
      setMockIsTimerRunning(false);
      if (handleUserMessageRef.current) handleUserMessageRef.current("", null, true);
    } else if (phase === "part3_prep") {
      mockPhaseRef.current = "part3_speak";
      setMockPhase("part3_speak");
      setMockTimeLeft(120);
    } else if (phase === "part3_speak") {
      setMockIsTimerRunning(false);
      stopSession();
      mockPhaseRef.current = "assessment";
      setMockPhase("assessment");
      generateAssessment(messagesRef.current);
    }
  };

  useEffect(() => {
    let interval: any;
    if (mode === "mock" && mockIsTimerRunning && mockTimeLeft > 0) {
      interval = setInterval(() => {
        setMockTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (mode === "mock" && mockIsTimerRunning && mockTimeLeft === 0) {
      handleTimerEnd();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, mockIsTimerRunning, mockTimeLeft]);

  const handleUserMessageRef = useRef<any>(null);

  useEffect(() => {
    // Auto scroll to bottom
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, finalizedTranscript, isThinking]);

  const fetchAndQueueAudio = async (textToSpeak: string) => {
    const id = Date.now().toString() + Math.random().toString();
    const queueItem = { id, url: null as string | null, ready: false, text: textToSpeak };
    audioQueueRef.current.push(queueItem);

    try {
      const ttsRes = await fetch(`https://api.deepgram.com/v1/speak?model=${selectedVoiceRef.current}`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${DEEPGRAM_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: textToSpeak })
      });

      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      queueItem.url = audioUrl;
      queueItem.ready = true;

      if (!isPlayingAudioRef.current) {
        playNextAudioUrl();
      }
    } catch (e) {
      console.error("TTS Fetch Error", e);
      queueItem.ready = true;
      if (!isPlayingAudioRef.current) {
        playNextAudioUrl();
      }
    }
  };

  const checkFinishedSpeaking = () => {
    if (audioQueueRef.current.length === 0 && !isPlayingAudioRef.current && !isGeneratingRef.current) {
      setSpeaking(false);
      setTeleprompterItems(prev => {
        const oldCurrent = prev.find(i => i.status === 'current');
        if (oldCurrent) {
          setTimeout(() => {
            setTeleprompterItems(curr => curr.filter(i => i.id !== oldCurrent.id));
          }, 1500);
          return [{ ...oldCurrent, status: 'past' }];
        }
        return [];
      });
      if (modeRef.current === "mock") {
        const phase = mockPhaseRef.current;
        if (phase === "part1.1_intro") {
          mockPhaseRef.current = "part1.1_q_think";
          setMockPhase("part1.1_q_think");
          mockQuestionIndexRef.current = 0;
          setMockQuestionIndex(0);
          setMockTimeLeft(5);
          setMockIsTimerRunning(false);
          setMockCurrentSubtitle("");
          if (handleUserMessageRef.current) handleUserMessageRef.current("", null, true);
        } else if (phase === "part1.1_q_think" || phase === "part1.2_images_think" || phase === "part1.2_followup_think") {
          setMockCurrentSubtitle("");
          setMockIsTimerRunning(true);
        } else if (phase === "part1.2_intro") {
          mockPhaseRef.current = "part1.2_images_think";
          setMockPhase("part1.2_images_think");
          setMockTimeLeft(15);
          setMockIsTimerRunning(false);
          setMockCurrentSubtitle("");
          if (handleUserMessageRef.current) handleUserMessageRef.current("", null, true);
        } else if (phase === "part2_intro") {
          mockPhaseRef.current = "part2_prep";
          setMockPhase("part2_prep");
          setMockTimeLeft(60);
          setMockIsTimerRunning(false);
          setMockCurrentSubtitle("");
          if (handleUserMessageRef.current) handleUserMessageRef.current("", null, true);
        } else if (phase === "part3_intro") {
          mockPhaseRef.current = "part3_prep";
          setMockPhase("part3_prep");
          setMockTimeLeft(60);
          setMockIsTimerRunning(false);
          setMockCurrentSubtitle("");
          if (handleUserMessageRef.current) handleUserMessageRef.current("", null, true);
        } else if (phase === "part2_prep" || phase === "part3_prep") {
          setMockCurrentSubtitle("");
          setMockIsTimerRunning(true);
        }
      }
    }
  };

  const playNextAudioUrl = () => {
    if (isPlayingAudioRef.current || audioQueueRef.current.length === 0) return;

    const nextItem = audioQueueRef.current[0];
    if (!nextItem.ready) return; // Wait until downloaded

    audioQueueRef.current.shift(); // Remove from queue
    if (!nextItem.url) {
      checkFinishedSpeaking();
      playNextAudioUrl(); // Skip failed chunks
      return;
    }

    isPlayingAudioRef.current = true;
    const currentId = nextItem.id;
    
    setTeleprompterItems(prev => {
      const oldCurrent = prev.find(i => i.status === 'current');
      const nextItems: TeleprompterItem[] = [{ id: currentId, text: nextItem.text || "", status: 'current' }];
      if (oldCurrent) {
        nextItems.push({ ...oldCurrent, status: 'past' });
        setTimeout(() => {
          setTeleprompterItems(curr => curr.filter(i => i.id !== oldCurrent.id));
        }, 1500);
      }
      return nextItems;
    });
    
    const audio = new Audio(nextItem.url);
    audioRef.current = audio;

    audio.onended = () => {
      isPlayingAudioRef.current = false;
      URL.revokeObjectURL(nextItem.url!);

      if (audioQueueRef.current.length > 0) {
        playNextAudioUrl();
      } else {
        checkFinishedSpeaking();
      }
    };

    audio.play().catch(e => {
      console.error("Audio Play Error", e);
      isPlayingAudioRef.current = false;
      checkFinishedSpeaking();
      playNextAudioUrl();
    });
  };

  const getSystemPrompt = () => {
    const selectedVoiceModel = VOICE_MODELS.find(v => v.id === selectedVoiceRef.current);
    const aiName = selectedVoiceModel ? selectedVoiceModel.name.split(" ")[0] : "the Examiner";

    if (mode === "practice") {
      let prompt = `You are a friendly conversational partner named ${aiName}. Speak naturally like a native speaker. Keep replies short and conversational (1-2 sentences). You MUST strictly speak ONLY in English.`;
      if (practiceDifficulty === "slow") {
        prompt = `You are an English teacher named ${aiName} practicing with a beginner. Speak VERY simply, use basic vocabulary, and keep sentences very short (1 sentence max). You MUST strictly speak ONLY in English.`;
      }
      if (practiceTopic) {
        prompt += ` The current topic or roleplay scenario is: ${practiceTopic}. Play along naturally.`;
      }
      return prompt;
    }
    return `You are a casual English speaking partner for a CEFR Multilevel test. Give very short, conversational replies (1-2 sentences). Never use markdown, emojis, or lists.`;
  };

  const CEFR_SYSTEM_PROMPT = `You are a certified CEFR (Common European Framework of Reference for Languages) speaking examiner with 15+ years of experience assessing English speaking proficiency, trained on the same standards used by Cambridge English exams, IELTS Speaking, and official CEFR calibration frameworks.

## YOUR TASK

You will receive a transcript of a candidate's spoken English response (from a speech-to-text system), possibly with metadata such as response duration, pause count, or filler-word count. Your task is to assess their speaking proficiency and output a structured result.

## CEFR SPEAKING LEVEL DESCRIPTORS (reference for your judgment)

- **A1**: Can produce simple, isolated phrases about people and places. Very limited vocabulary. Frequent pauses, false starts, reformulation. Relies on memorized patterns.
- **A2**: Can describe in simple terms family, living conditions, daily routines. Uses basic connectors (and, but, because). Noticeable pauses for grammar/vocabulary search.
- **B1**: Can connect phrases to describe experiences, events, dreams, ambitions. Copes with most situations. Some hesitation but maintains flow. Makes noticeable errors but is generally understood.
- **B2**: Can interact with a degree of fluency and spontaneity. Can explain a viewpoint, give clear detailed descriptions. Good range of vocabulary, occasional errors that don't impede communication.
- **C1**: Can express ideas fluently and spontaneously without much obvious searching for expressions. Flexible and effective language use for social, academic, professional purposes. Well-structured, clear arguments.
- **C2**: Can express themselves spontaneously, very fluently and precisely, differentiating finer shades of meaning. Near-native command, no noticeable strain in communicating complex ideas.

## ASSESSMENT CRITERIA (score each 1-6, corresponding to A1-C2)

1. **Fluency & Coherence** - speech flow, pausing, hesitation, logical linking of ideas, discourse markers.
2. **Lexical Resource (Vocabulary)** - range, appropriateness, precision, idiomatic usage, paraphrasing ability.
3. **Grammatical Range & Accuracy** - variety of structures, tense control, error frequency and severity.
4. **Pronunciation** - (only assess if audio features/phonetic data are provided; if only text transcript is available, state this limitation explicitly and exclude or estimate cautiously).
5. **Task Achievement / Interaction** - how fully and relevantly the candidate answered the actual question/task, ability to develop and sustain a response.

## SCORING METHODOLOGY

- Score each criterion from 1 (A1) to 6 (C2), allowing half-points (e.g., 3.5) for "strong within level, approaching next level."
- Calculate the overall level as a weighted judgment (not a simple average) - an examiner's holistic call, similar to real CEFR/Cambridge speaking exams, where one weak area can cap the overall level, but do not let a single weak criterion override otherwise clear evidence of a higher level in the rest of the response.
- Map final score to overall CEFR level with sub-band: e.g., "B1", "B1+", "B2-", "B2".
- Always ground the score in specific evidence from the candidate's actual words - never assign a level generically.

## OUTPUT FORMAT - RETURN ONLY VALID JSON, NOTHING ELSE

Do not include any text before or after the JSON. Do not use markdown code fences. Return raw JSON only, matching this exact schema:

{
  "overall_level": "B1+",
  "overall_score_100": 62,
  "criteria": {
    "fluency_coherence": {
      "level": "B1",
      "score_1to6": 3.5,
      "justification": "2-3 sentence explanation citing specific moments from the response"
    },
    "lexical_resource": {
      "level": "B1",
      "score_1to6": 3,
      "justification": "..."
    },
    "grammar_accuracy": {
      "level": "B2",
      "score_1to6": 4,
      "justification": "..."
    },
    "pronunciation": {
      "level": "not_assessed",
      "score_1to6": null,
      "justification": "No audio data provided; pronunciation was not evaluated."
    },
    "task_achievement": {
      "level": "B1",
      "score_1to6": 3.5,
      "justification": "..."
    }
  },
  "strengths": [
    "Specific strength #1 with a short example from the candidate's speech",
    "Specific strength #2",
    "Specific strength #3"
  ],
  "errors": [
    {
      "type": "grammar | vocabulary | fluency | coherence",
      "candidate_said": "the exact or paraphrased problematic phrase",
      "correction": "the corrected version",
      "explanation": "brief explanation of the rule or why it matters"
    }
  ],
  "priority_improvement": {
    "area": "the single most important area to work on",
    "why": "why this is the highest-leverage area to fix first",
    "how": "2-3 concrete, actionable steps the learner can take this week"
  },
  "summary": "A warm, encouraging 3-4 sentence overall summary an average learner can understand, mentioning their current level and what the next level requires."
}

## RULES

- Base every judgment strictly on the actual transcript provided - never invent or assume content the candidate didn't say.
- Be honest and calibrated: do not inflate scores to be "nice," and do not be harsher than a real CEFR examiner would be.
- If the response is too short or off-topic to assess fairly, still return the JSON but note this clearly in "summary" and lower confidence accordingly.
- Quote or closely paraphrase the candidate's own words in "errors" and "strengths" so the feedback feels specific and personal, not generic.
- Keep "justification" fields concise (2-3 sentences max) but evidence-based.
- Write all feedback text in clear, simple English suitable for a language learner (B1 reading level).
- Output must be parseable JSON - validate structure mentally before responding (matching quotes, commas, brackets).`;

  const generateAssessment = async (history: Message[]) => {
    setIsAssessing(true);
    try {
      // Extract only user messages as transcript
      const userTranscripts = history
        .filter(m => m.role === "user")
        .map(m => m.content)
        .join("\n\n");

      const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          max_tokens: 2000,
          messages: [
            {
              role: "system",
              content: CEFR_SYSTEM_PROMPT
            },
            {
              role: "user",
              content: `Here is the candidate's spoken transcript from a CEFR speaking test:\n\n${userTranscripts}`
            }
          ]
        })
      });
      const data = await orRes.json();
      const content = data.choices[0].message.content;
      const cleaned = content.replace(/```json|```/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAssessmentResult(JSON.parse(jsonMatch[0]));
      }
    } catch (e) {
      console.error("Assessment Error", e);
    }
    setIsAssessing(false);
  };

  const generateMicroFeedback = async (userText: string, messageIndex: number) => {
    if (mode !== "practice") return;
    try {
      const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are an English tutor. The user just said a sentence. Provide ONE brief suggestion (grammar correction, better vocabulary, or 'Perfect!' if flawless). Keep it under 10 words."
            },
            { role: "user", content: userText }
          ]
        })
      });
      const data = await orRes.json();
      const feedback = data.choices[0].message.content;
      setMessages(prev => {
        const next = [...prev];
        if (next[messageIndex]) {
          next[messageIndex] = { ...next[messageIndex], feedback };
        }
        return next;
      });
    } catch (e) { }
  };

  const handleUserMessage = async (text?: string, overrideMessages?: Message[], isAutoTrigger = false) => {
    let newMessages = overrideMessages || messagesRef.current;
    if (text) {
      const msgIndex = newMessages.length;
      newMessages = [...messagesRef.current, { role: "user" as const, content: text }];
      setMessages(newMessages);

      if (mode === "practice") {
        generateMicroFeedback(text, msgIndex);
      }


    }

    if (mode === "mock") {
      if (!isAutoTrigger && text) {
        return;
      }
      
      const phase = mockPhaseRef.current;
      let textToSpeak = "";
      
      if (phase === "part1.1_intro") {
        textToSpeak = "Welcome to the test. Let's begin with Part 1. I will ask you some simple questions.";
      } else if (phase === "part1.1_q_think") {
        textToSpeak = MOCK_DATA.part1_1[mockQuestionIndexRef.current];
      } else if (phase === "part1.2_intro") {
        textToSpeak = "Now let's move to Part 1.2. Please describe what you see in these two pictures.";
      } else if (phase === "part1.2_images_think") {
        textToSpeak = MOCK_DATA.part1_2_task;
      } else if (phase === "part1.2_followup_think") {
        textToSpeak = MOCK_DATA.part1_2_followups[mockQuestionIndexRef.current];
      } else if (phase === "part2_intro") {
        textToSpeak = "Now let's move to Part 2. I will give you a topic card. You will have 1 minute to prepare, and then you will speak for 2 minutes covering all the questions.";
      } else if (phase === "part2_prep") {
        textToSpeak = "Here is your topic card. Your one minute preparation time begins now.";
      } else if (phase === "part3_intro") {
        textToSpeak = "Let's move on to Part 3. Please look at the table showing the advantages and disadvantages of video games on children.";
      } else if (phase === "part3_prep") {
        textToSpeak = "You have one minute to prepare, and then you will speak for two minutes. Your preparation time begins now.";
      }
      
      if (textToSpeak) {
        setThinking(false);
        setSpeaking(true);
        setMockIsTimerRunning(false);
        isGeneratingRef.current = true;
        setMockCurrentSubtitle(textToSpeak);
        await fetchAndQueueAudio(textToSpeak);
        isGeneratingRef.current = false;
        // Don't call checkFinishedSpeaking here — audio onended will handle it
        // Only check if audio already finished (edge case: very short text)
        if (!isPlayingAudioRef.current && audioQueueRef.current.length === 0) {
          checkFinishedSpeaking();
        }
      }
      return;
    }

    setThinking(true);
    setFinalizedTranscript("");
    setLiveInterimText("");

    audioQueueRef.current = [];
    isPlayingAudioRef.current = false;
    isGeneratingRef.current = true;

    let openRouterKey = OPENROUTER_API_KEY;
    if (!openRouterKey) {
      openRouterKey = localStorage.getItem("openrouter_api_key") || prompt("OpenRouter API kalitini kiriting:") || "";
      if (openRouterKey) {
        localStorage.setItem("openrouter_api_key", openRouterKey);
      } else {
        setThinking(false);
        return;
      }
    }

    try {
      const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.href,
          "X-Title": "CEFR Mock AI",
        },
        body: JSON.stringify({
          model: selectedModelRef.current,
          stream: true,
          tools: AI_MODELS.find(m => m.id === selectedModelRef.current)?.supportsTools ? [
            {
              type: "function",
              function: {
                name: "web_search",
                description: "Search the web for current or specific factual information the assistant isn't confident about.",
                parameters: {
                  type: "object",
                  properties: { query: { type: "string", description: "The search query" } },
                  required: ["query"]
                }
              }
            }
          ] : undefined,
          messages: [
            {
              role: "system",
              content: getSystemPrompt()
            },
            ...newMessages.map(m => {
              // Strip internal fields before sending to API
              const { feedback, ...rest } = m;
              return rest;
            })
          ]
        })
      });

      if (!orRes.ok) throw new Error(`OpenRouter Error: ${orRes.status}`);

      const reader = orRes.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let currentSentence = "";
      let isFirstChunk = true;
      let toolCallName = "";
      let toolCallArgs = "";
      let toolCallId = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                
                const toolCalls = data.choices[0]?.delta?.tool_calls;
                if (toolCalls && toolCalls.length > 0) {
                  const tc = toolCalls[0];
                  if (tc.id) toolCallId = tc.id;
                  if (tc.function?.name) toolCallName += tc.function.name;
                  if (tc.function?.arguments) toolCallArgs += tc.function.arguments;
                  
                  if (isFirstChunk) {
                    setThinking(false);
                    setIsSearching(true);
                    isFirstChunk = false;
                  }
                  
                  if (toolCallArgs.endsWith('"}') || toolCallArgs.endsWith('"} ')) {
                    try {
                      const parsed = JSON.parse(toolCallArgs + (toolCallArgs.endsWith('}') ? '' : '"}'));
                      if (parsed.query) setSearchQuery(parsed.query);
                    } catch(e) {}
                  }
                  continue;
                }

                const token = data.choices[0]?.delta?.content || "";
                if (!token) continue;

                if (isFirstChunk) {
                  setThinking(false);
                  setSpeaking(true);
                  isFirstChunk = false;
                }

                fullText += token;
                currentSentence += token;

                setMessages(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant" && !last.tool_calls) {
                    last.content = fullText;
                  } else {
                    updated.push({ role: "assistant", content: fullText });
                  }
                  return updated;
                });

                const splitMatch = currentSentence.match(/^(.*?[.!?\n])(\s+.*)?$/);
                if (splitMatch && splitMatch[1].trim().length > 3) {
                  const sentenceToSpeak = splitMatch[1].trim().replace(/<function[^>]*>.*?<\/function>/gs, "");
                  if (sentenceToSpeak.length > 3) {
                    fetchAndQueueAudio(sentenceToSpeak);
                  }
                  currentSentence = splitMatch[2] ? splitMatch[2].trimStart() : "";
                }
              } catch (e) { }
            }
          }
        }
      }

      if (toolCallName === "web_search" && toolCallArgs) {
         try {
            const parsedArgs = JSON.parse(toolCallArgs);
            setSearchQuery(parsedArgs.query);
            
            let tavilyKey = TAVILY_API_KEY;
            if (!tavilyKey) {
              tavilyKey = localStorage.getItem("tavily_api_key") || prompt("Tavily API kalitini kiriting:") || "";
              if (tavilyKey) localStorage.setItem("tavily_api_key", tavilyKey);
            }
            
            if (tavilyKey) {
                const searchRes = await fetch("https://api.tavily.com/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ api_key: tavilyKey, query: parsedArgs.query, search_depth: "basic" })
                });
                const searchData = await searchRes.json();
                
                newMessages.push({ role: "assistant", content: "", tool_calls: [{ id: toolCallId, type: "function", function: { name: "web_search", arguments: toolCallArgs } }] });
                newMessages.push({ role: "tool", tool_call_id: toolCallId, name: "web_search", content: JSON.stringify(searchData.results || searchData) });
                
                messagesRef.current = newMessages;
                setMessages(newMessages);
                
                setIsSearching(false);
                return handleUserMessage(undefined, newMessages);
            } else {
                throw new Error("Tavily Key missing");
            }
         } catch(e) {
            console.error("Tool execution failed", e);
            newMessages.push({ role: "assistant", content: "", tool_calls: [{ id: toolCallId, type: "function", function: { name: "web_search", arguments: toolCallArgs } }] });
            newMessages.push({ role: "tool", tool_call_id: toolCallId, name: "web_search", content: "Search failed due to API error or missing key." });
            messagesRef.current = newMessages;
            setMessages(newMessages);
            setIsSearching(false);
            return handleUserMessage(undefined, newMessages);
         }
      }

      const finalSentenceToSpeak = currentSentence.trim().replace(/<function[^>]*>.*?<\/function>/gs, "");
      if (finalSentenceToSpeak.length > 0) {
        fetchAndQueueAudio(finalSentenceToSpeak);
      }

      isGeneratingRef.current = false;
      if (isFirstChunk) setThinking(false);
      checkFinishedSpeaking();

    } catch (error: any) {
      console.error("Error in AI loop:", error);
      setThinking(false);
      setSpeaking(false);
      isGeneratingRef.current = false;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
        mediaRecorderRef.current.resume();
      }
    }
  };

  useEffect(() => {
    handleUserMessageRef.current = handleUserMessage;
  });

  const failsafeIntervalRef = useRef<any>(null);

  const startSession = async () => {
    try {
      setMessages([]);
      setTeleprompterItems([]);
      setFinalizedTranscript("");
      setLiveInterimText("");
      utteranceRef.current = "";
      mockPartTurnCountRef.current = 0;
      sessionStartTimeRef.current = Date.now();
      setAssessmentResult(null);
      if (failsafeIntervalRef.current) clearInterval(failsafeIntervalRef.current);
      failsafeIntervalRef.current = setInterval(() => {
        if (isSpeakingRef.current && !isPlayingAudioRef.current && !isGeneratingRef.current && audioQueueRef.current.length === 0) {
          setSpeaking(false);
        }
      }, 2000);
      if (mode === "mock") {
        setMockPhase("part1.1_intro");
        setMockQuestionIndex(0);
        setMockTimeLeft(0);
        setMockIsTimerRunning(false);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;
        analyser.getByteFrequencyData(dataArray);
        let maxVal = 0;
        for (let i = 0; i < dataArray.length; i++) {
          if (dataArray[i] > maxVal) maxVal = dataArray[i];
        }
        audioVolumeRef.current = Math.min(maxVal / 150, 1.0);
        requestAnimationFrame(updateVolume);
      };

      const connectDeepgram = () => {
        let currentKey = DEEPGRAM_API_KEY;
        if (!currentKey) {
          currentKey = localStorage.getItem("deepgram_api_key") || prompt("Deepgram API kalitini kiriting (xavfsiz, faqat brauzer xotirasida saqlanadi):") || "";
          if (currentKey) {
            localStorage.setItem("deepgram_api_key", currentKey);
          } else {
            alert("Deepgram kaliti yo'q. Ovozni aniqlash ishlamaydi.");
            setMicReadyState(0 as any);
            return;
          }
        }

        const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en&endpointing=250&interim_results=true`, [
          "token",
          currentKey,
        ]);

        socket.onopen = () => {
          console.log("WebSocket connection opened");
          setSocketReadyState(1);
          setIsReconnectingStt(false);
          reconnectAttemptsRef.current = 0;

          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
          }

          const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
          mediaRecorder.addEventListener("dataavailable", (event) => {
            if (event.data.size > 0 && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
              socketRef.current.send(event.data);
            }
          });
          mediaRecorder.start(250);
          mediaRecorderRef.current = mediaRecorder;

          if (messagesRef.current.length === 0) {
            handleUserMessage();
          }
        };

        socket.onmessage = (message) => {
          if (isThinkingRef.current || isSpeakingRef.current) return;

          const received = JSON.parse(message.data);
          const transcript = received.channel?.alternatives[0]?.transcript;

          if (transcript) {
            if (isThinkingRef.current || isSpeakingRef.current) {
              utteranceRef.current = "";
              return;
            }

            if (received.is_final) {
              utteranceRef.current += transcript + " ";
            } else {
              setLiveInterimText(transcript);
            }

            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = setTimeout(() => {
              if (utteranceRef.current.trim().length > 0 && !isThinkingRef.current && !isSpeakingRef.current) {
                const finalUtterance = utteranceRef.current.trim();
                utteranceRef.current = "";
                setFinalizedTranscript("");
                setLiveInterimText("");

                if (modeRef.current === "mock") {
                  const p = mockPhaseRef.current;
                  if (p.endsWith("_speak")) {
                    setMessages(prev => [...prev, { role: "user" as const, content: finalUtterance }]);
                  }
                } else if (handleUserMessageRef.current) {
                  handleUserMessageRef.current(finalUtterance);
                }
              }
            }, 2000);
          }

          if (received.speech_final && utteranceRef.current.trim().length > 0) {
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            if (isThinkingRef.current || isSpeakingRef.current) {
              utteranceRef.current = "";
              return;
            }

            const finalUtterance = utteranceRef.current.trim();
            utteranceRef.current = "";
            setFinalizedTranscript("");
            setLiveInterimText("");

            if (modeRef.current === "mock") {
              const p = mockPhaseRef.current;
              if (p.endsWith("_speak")) {
                setMessages(prev => [...prev, { role: "user" as const, content: finalUtterance }]);
              }
            } else if (handleUserMessageRef.current) {
              handleUserMessageRef.current(finalUtterance);
            }
          }
        };

        socket.onclose = () => {
          console.log("WebSocket connection closed");
          setSocketReadyState(3);
          if (isRecordingRef.current) {
            setIsReconnectingStt(true);
            const delay = Math.min(500 * Math.pow(2, reconnectAttemptsRef.current), 5000);
            reconnectAttemptsRef.current += 1;
            setTimeout(() => connectDeepgram(), delay);
          }
        };

        socketRef.current = socket;
      };

      setIsRecording(true);
      isRecordingRef.current = true;
      setMicReadyState(stream.getTracks()[0].readyState);
      requestAnimationFrame(updateVolume);

      connectDeepgram();
    } catch (error) {
      console.error("Error accessing microphone", error);
      alert("Error accessing microphone. Please check permissions.");
    }
  };

  const stopSession = () => {
    if (failsafeIntervalRef.current) clearInterval(failsafeIntervalRef.current);
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (socketRef.current) {
      socketRef.current.close();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsRecording(false);
    isRecordingRef.current = false;
    setMicReadyState("closed");
    setThinking(false);
    setSpeaking(false);
    setTeleprompterItems([]);
  };

  const finishPractice = () => {
    stopSession();
    const endTime = Date.now();
    const durationMins = (endTime - (sessionStartTimeRef.current || endTime)) / 60000;

    let totalWords = 0;
    let fillerCount = 0;
    const fillerRegex = /\b(um|uh|like|you know|hmm)\b/gi;

    const userMsgs = messagesRef.current.filter(m => m.role === "user");
    userMsgs.forEach(m => {
      const words = m.content.split(/\s+/).length;
      totalWords += words;
      const matches = m.content.match(fillerRegex);
      if (matches) fillerCount += matches.length;
    });

    const wpm = durationMins > 0 ? Math.round(totalWords / durationMins) : 0;

    const stats = {
      durationMins: durationMins.toFixed(1),
      wpm,
      fillerCount,
      date: new Date().toISOString()
    };

    setPracticeStats(stats);

    try {
      const history = JSON.parse(localStorage.getItem("speaking_practice_history") || "[]");
      history.push({ stats, topic: practiceTopic, transcript: messagesRef.current });
      localStorage.setItem("speaking_practice_history", JSON.stringify(history));
    } catch (e) { }

    setMode("practice_summary");
  };

  if (mode === "selection") {
    return (
      <div className="flex-1 flex flex-col p-6 items-center justify-center h-full">
        <div className="w-full max-w-4xl">
          <Button variant="ghost" onClick={() => onNavigate("dashboard")} className="mb-8">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-heading mb-4">Speaking Module</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Choose how you want to improve your speaking skills today. Practice freely or take a timed mock test.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border rounded-2xl p-8 hover:shadow-lg transition-all cursor-pointer group" onClick={() => setMode("practice_setup")}>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mic className="w-8 h-8 text-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Practice</h2>
              <p className="text-muted-foreground mb-8">Free conversation, grammar tips, and flexible difficulty. Work on your speaking by talking about any topic.</p>
              <Button className="w-full group-hover:bg-primary/90">Practice</Button>
            </div>

            <div className="bg-card border rounded-2xl p-8 hover:shadow-lg transition-all cursor-pointer group" onClick={() => setMode("mock_setup")}>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Square className="w-8 h-8 text-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Mock Test</h2>
              <p className="text-muted-foreground mb-8">3-part real IELTS/CEFR Multilevel exam format. Preparation time, timers, and detailed assessment at the end.</p>
              <Button variant="secondary" className="w-full group-hover:bg-secondary/80">Start Test</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "practice_setup") {
    return (
      <div className="flex-1 flex flex-col p-6 items-center justify-center h-full">
        <div className="w-full max-w-2xl bg-card border rounded-2xl p-8 shadow-lg">
          <Button variant="ghost" onClick={() => setMode("selection")} className="mb-6 -ml-4">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h2 className="text-3xl font-bold font-heading mb-6">Practice Settings</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty Level</label>
              <div className="flex gap-4">
                <Button
                  variant={practiceDifficulty === "natural" ? "default" : "outline"}
                  onClick={() => setPracticeDifficulty("natural")}
                  className="flex-1"
                >
                  Natural speed
                </Button>
                <Button
                  variant={practiceDifficulty === "slow" ? "default" : "outline"}
                  onClick={() => setPracticeDifficulty("slow")}
                  className="flex-1"
                >
                  Slow and simple
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Topic or Roleplay</label>
              <input
                type="text"
                value={practiceTopic}
                onChange={e => setPracticeTopic(e.target.value)}
                placeholder="E.g., Hobbies, Travel, Job interview..."
                className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {["Travel", "Technology", "Ordering at a restaurant", "Job interview", "Self-introduction"].map(t => (
                  <span
                    key={t}
                    onClick={() => setPracticeTopic(t)}
                    className="text-xs px-3 py-1 rounded-full bg-muted cursor-pointer hover:bg-primary/20 transition-colors border"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <Button size="lg" className="w-full mt-4" onClick={() => {
              setMode("practice");
            }}>
              Start
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "mock_setup") {
    return (
      <div className="flex-1 flex flex-col p-6 items-center justify-center h-full">
        <div className="w-full max-w-2xl bg-card border rounded-2xl p-8 shadow-lg">
          <Button variant="ghost" onClick={() => setMode("selection")} className="mb-6 -ml-4">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h2 className="text-3xl font-bold font-heading mb-4">CEFR Multilevel Mock Test</h2>
          <p className="text-muted-foreground mb-6">Structured evaluation of your speaking skills. The AI will guide you through the phases and automatically record your responses when the timer starts.</p>

          <div className="space-y-4 mb-8">
            <div className="p-4 border-l-4 border-primary rounded-lg bg-primary/5">
              <h3 className="font-bold mb-1">Part 1</h3>
              <div className="ml-4 mt-2 space-y-2">
                <div>
                  <p className="text-sm font-medium">Task 1.1 (A1-A2)</p>
                  <p className="text-xs text-muted-foreground">3 simple questions. 5s to think, 30s to speak per question.</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Task 1.2 (B1)</p>
                  <p className="text-xs text-muted-foreground">Describe 2 images (15s prep, 45s speak) and answer 2 follow-ups.</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-l-4 border-primary rounded-lg bg-primary/5">
              <h3 className="font-bold mb-1">Part 2 (B2)</h3>
              <p className="text-sm text-muted-foreground">Topic card with 3 questions. 1 minute to prepare, 2 minutes to speak.</p>
            </div>
            <div className="p-4 border-l-4 border-muted rounded-lg bg-muted/30">
              <h3 className="font-bold mb-1 text-muted-foreground">Part 3 (Coming Soon)</h3>
              <p className="text-sm text-muted-foreground">Discussion and deeper analysis questions.</p>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={() => {
            setMockPhase("part1.1_intro");
            setMode("mock");
          }}>
            Start Test
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "practice_summary") {
    return (
      <div className="flex-1 flex flex-col p-6 items-center justify-center h-full overflow-y-auto">
        <div className="w-full max-w-4xl bg-card border rounded-2xl p-8 shadow-lg">
          <Button variant="ghost" onClick={() => setMode("selection")} className="mb-6 -ml-4">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
          <h2 className="text-4xl font-bold font-heading mb-8">Practice Results</h2>

          {practiceStats && (
            <div className="grid md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
              <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl text-center">
                <p className="text-muted-foreground mb-2">Time (minutes)</p>
                <h3 className="text-4xl font-bold text-foreground">{practiceStats.durationMins}</h3>
              </div>
              <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl text-center">
                <p className="text-muted-foreground mb-2">Speed (WPM)</p>
                <h3 className="text-4xl font-bold text-foreground">{practiceStats.wpm}</h3>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-xl text-center">
                <p className="text-muted-foreground mb-2">Filler Words</p>
                <h3 className="text-4xl font-bold text-amber-500">{practiceStats.fillerCount}</h3>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === "mock" && (mockPhase === "completed" || mockPhase === "assessment")) {
    const LEVEL_COLORS: Record<string, string> = {
      'A1': 'from-red-500 to-red-600', 'A2': 'from-orange-500 to-orange-600',
      'B1': 'from-yellow-500 to-amber-500', 'B1+': 'from-yellow-400 to-amber-500',
      'B2': 'from-emerald-500 to-green-600', 'B2-': 'from-emerald-400 to-green-500', 'B2+': 'from-emerald-600 to-green-700',
      'C1': 'from-blue-500 to-indigo-600', 'C2': 'from-violet-500 to-purple-600',
    };
    const levelColor = assessmentResult ? (LEVEL_COLORS[assessmentResult.overall_level] || 'from-primary to-primary') : 'from-primary to-primary';

    const CRITERIA_LABELS: Record<string, string> = {
      fluency_coherence: 'Fluency & Coherence',
      lexical_resource: 'Vocabulary',
      grammar_accuracy: 'Grammar',
      pronunciation: 'Pronunciation',
      task_achievement: 'Task Achievement',
    };

    return (
      <div className="flex-1 flex flex-col p-6 items-center h-full overflow-y-auto">
        <div className="w-full max-w-4xl space-y-6 pb-12">
          <Button variant="ghost" onClick={() => { setMode("selection"); setAssessmentResult(null); }} className="mb-2 -ml-4">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>

          {(isAssessing || !assessmentResult) ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 text-foreground">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold mb-2">Analyzing your performance...</p>
                <p className="text-muted-foreground">AI examiner is evaluating your speaking test</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-700">
              {/* Overall Score Hero */}
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${levelColor} p-8 text-white shadow-2xl`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-center gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                      <span className="text-4xl font-black">{assessmentResult.overall_level}</span>
                    </div>
                    <span className="mt-3 text-lg font-semibold text-white/90">{assessmentResult.overall_score_100}/100</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-3">CEFR Speaking Assessment</h2>
                    <p className="text-white/80 text-lg leading-relaxed">{assessmentResult.summary}</p>
                  </div>
                </div>
              </div>

              {/* Criteria Scores */}
              <div className="bg-card border rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-5">Detailed Scores</h3>
                <div className="space-y-4">
                  {assessmentResult.criteria && Object.entries(assessmentResult.criteria).map(([key, val]: [string, any]) => {
                    const score = val.score_1to6;
                    const pct = score != null ? (score / 6) * 100 : 0;
                    const isNotAssessed = val.level === 'not_assessed';
                    return (
                      <div key={key} className={`p-4 rounded-xl border ${isNotAssessed ? 'bg-muted/30 border-muted' : 'bg-background border-border'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{CRITERIA_LABELS[key] || key}</span>
                          <div className="flex items-center gap-3">
                            {!isNotAssessed && <span className="text-sm text-muted-foreground">{score}/6</span>}
                            <span className={`text-sm font-bold px-2 py-0.5 rounded ${isNotAssessed ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                              {isNotAssessed ? 'N/A' : val.level}
                            </span>
                          </div>
                        </div>
                        {!isNotAssessed && (
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">{val.justification}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths & Priority Improvement */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-green-500/20 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                    <span className="text-xl">💪</span> Strengths
                  </h3>
                  <ul className="space-y-3">
                    {assessmentResult.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm"><span className="text-green-500 mt-0.5 shrink-0">✓</span> <span>{s}</span></li>
                    ))}
                  </ul>
                </div>

                {assessmentResult.priority_improvement && (
                  <div className="bg-card border border-blue-500/20 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                      <span className="text-xl">🎯</span> Priority: {assessmentResult.priority_improvement.area}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{assessmentResult.priority_improvement.why}</p>
                    <p className="text-sm font-medium">{assessmentResult.priority_improvement.how}</p>
                  </div>
                )}
              </div>

              {/* Errors */}
              {assessmentResult.errors && assessmentResult.errors.length > 0 && (
                <div className="bg-card border rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
                    <span className="text-xl">📝</span> Errors & Corrections
                  </h3>
                  <div className="space-y-4">
                    {assessmentResult.errors.map((err: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">{err.type}</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <div className="flex-1">
                            <p className="text-destructive line-through mb-1">"{err.candidate_said}"</p>
                            <p className="text-green-600 dark:text-green-400 font-medium">"{err.correction}"</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{err.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Return Button */}
              <div className="flex justify-center pt-4">
                <Button size="lg" onClick={() => { setMode("selection"); setAssessmentResult(null); }} className="px-12">
                  Return Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Helper: get max time for current phase
  const getMaxTime = () => {
    if (mockPhase.endsWith("speak") && (mockPhase.includes("part2") || mockPhase.includes("part3"))) return 120;
    if (mockPhase.endsWith("speak") && mockPhase.includes("images")) return 45;
    if (mockPhase.endsWith("speak")) return 30;
    if (mockPhase.includes("prep")) return 60;
    if (mockPhase.includes("images_think")) return 15;
    return 5;
  };

  // Helper: get task text for current phase
  const getTaskText = () => {
    if (mockPhase.includes("part1.1_q")) return MOCK_DATA.part1_1[mockQuestionIndex];
    if (mockPhase.includes("images")) return MOCK_DATA.part1_2_task;
    if (mockPhase.includes("followup")) return MOCK_DATA.part1_2_followups[mockQuestionIndex];
    if (mockPhase.includes("part3")) return MOCK_DATA.part3_task;
    return "";
  };

  // Helper: get part label
  const getPartLabel = () => {
    if (mockPhase.includes("part1.1")) return "Part 1 — Task 1.1";
    if (mockPhase.includes("part1.2")) return "Part 1 — Task 1.2";
    if (mockPhase.includes("part2")) return "Part 2";
    if (mockPhase.includes("part3")) return "Part 3";
    return "";
  };

  const isMockActive = mode === "mock" && mockPhase !== "completed" && mockPhase !== "assessment";

  return (
    <div className="flex-1 flex flex-col items-center w-full h-full overflow-hidden relative">
      {/* Progress Bar — top */}
      {isMockActive && (
        <div className="w-full p-4 z-40 flex items-center justify-center gap-2 shrink-0">
          <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${mockPhase.startsWith("part1") ? "bg-primary" : "bg-muted"}`}></div>
          <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${mockPhase.startsWith("part2") ? "bg-primary" : "bg-muted"}`}></div>
          <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${mockPhase.startsWith("part3") ? "bg-primary" : "bg-muted"}`}></div>
        </div>
      )}

      {SHOW_DEBUG && (
        <DebugOverlay
          micReadyState={micReadyState}
          socketReadyState={socketReadyState}
          isThinking={isThinking}
          isSpeaking={isSpeaking}
          audioVolumeRef={audioVolumeRef}
        />
      )}

      {isReconnectingStt && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-500/90 text-black px-4 py-2 rounded-full font-medium shadow-xl flex items-center gap-2 animate-in slide-in-from-top-10">
          <Loader2 className="w-4 h-4 animate-spin" />
          STT qayta ulanmoqda...
        </div>
      )}

      {mode === "practice" && (
        <div className="w-full flex items-center justify-between mb-8 max-w-5xl mx-auto relative z-20 px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold font-heading shrink-0">Voice Agent Test</h2>
            <Select value={selectedModel} onValueChange={(val) => handleModelChange(val as string)} disabled={isRecording}>
              <SelectTrigger className="w-[220px]" aria-label="Choose AI Brain">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedVoice} onValueChange={(val) => handleVoiceChange(val as string)} disabled={isRecording}>
              <SelectTrigger className="w-[180px]" aria-label="Choose AI Voice">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOICE_MODELS.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => onNavigate("dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      )}

      {/* ==================== MOCK MODE LAYOUT ==================== */}
      {isMockActive && (
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto items-center justify-between py-4 px-6 relative">

          {/* TOP SECTION: Timer (when running) or AI subtitle (when speaking) */}
          <div className="w-full flex flex-col items-center shrink-0 min-h-[160px] justify-center">
            {/* Timer */}
            {mockIsTimerRunning && !isSpeaking && (
              <div className="flex flex-col items-center animate-in zoom-in duration-300">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * mockTimeLeft) / getMaxTime()}
                      className={`transition-all duration-1000 linear ${mockPhase.endsWith("speak") ? "text-destructive" : "text-primary"}`}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold">{Math.floor(mockTimeLeft / 60)}:{(mockTimeLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
                <p className={`mt-2 font-bold tracking-widest uppercase text-sm ${mockPhase.endsWith("speak") ? "text-destructive animate-pulse" : "text-primary"}`}>
                  {mockPhase.endsWith("speak") ? "Speaking" : "Thinking"}
                </p>
              </div>
            )}

            {/* AI Speaking subtitle */}
            {isSpeaking && mockCurrentSubtitle && (
              <div className="flex justify-center px-6 animate-in fade-in duration-300">
                <LiveSubtitle
                  text={mockCurrentSubtitle}
                  wordDelay={200}
                  className="text-foreground/90 text-xl font-semibold text-center leading-relaxed max-w-2xl"
                />
              </div>
            )}

            {/* Waiting for AI / not started yet */}
            {!mockIsTimerRunning && !isSpeaking && isRecording && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm">Preparing...</span>
              </div>
            )}
          </div>

          {/* MIDDLE SECTION: Content (images, task card, topic card) */}
          <div className="flex-1 flex flex-col items-center justify-center w-full gap-6 overflow-hidden">
            {/* Part 1.2 Images */}
            {mockPhase.includes("part1.2_images") && (
              <div className="flex gap-4 animate-in fade-in duration-500 w-full max-w-3xl justify-center">
                <img src={MOCK_DATA.part1_2_images[0]} className="flex-1 max-w-[48%] h-[240px] object-cover rounded-xl shadow-lg" />
                <img src={MOCK_DATA.part1_2_images[1]} className="flex-1 max-w-[48%] h-[240px] object-cover rounded-xl shadow-lg" />
              </div>
            )}

            {/* Task Instructions Card */}
            {mockIsTimerRunning && !isSpeaking && (
              <div className="w-full max-w-2xl animate-in slide-in-from-bottom-6 fade-in duration-500">
                <div className="px-8 py-5 bg-white/5 dark:bg-white/[0.03] backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-2xl">
                  <h3 className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider text-center">
                    {getPartLabel()}
                  </h3>
                  {mockPhase.includes("part2") ? (
                    <div>
                      <p className="text-foreground text-xl font-semibold text-center mb-4">Cover all 3 questions in your presentation.</p>
                      <ul className="space-y-3 text-foreground/80">
                        {MOCK_DATA.part2.map((q, i) => (
                          <li key={i} className="flex gap-3 text-base">
                            <span className="text-muted-foreground shrink-0">•</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-foreground text-xl font-semibold text-center leading-relaxed">
                      {getTaskText()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Part 3 Table Image */}
            {mockPhase.includes("part3") && (mockPhase === "part3_prep" || mockPhase === "part3_speak") && (
              <div className="bg-white p-3 rounded-xl shadow-xl max-w-2xl animate-in fade-in duration-500">
                <img src={MOCK_DATA.part3_image} className="w-full object-contain rounded-lg" />
              </div>
            )}
          </div>

          {/* BOTTOM SECTION: Start/Stop Button — always visible */}
          <div className="w-full flex justify-center shrink-0 py-6">
            {!isRecording ? (
              <GlassButton onClick={startSession}>
                <Mic className="w-5 h-5 text-foreground" />
                Start
              </GlassButton>
            ) : (
              <GlassButton
                onClick={() => {
                  stopSession();
                  mockPhaseRef.current = "assessment";
                  setMockPhase("assessment");
                  generateAssessment(messagesRef.current);
                }}
                active={!isThinking && !isSpeaking}
              >
                <Square className="w-5 h-5 text-destructive" />
                Stop
              </GlassButton>
            )}
          </div>
        </div>
      )}

      {/* ==================== PRACTICE MODE LAYOUT ==================== */}
      {mode === "practice" && (
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto relative justify-center items-center">
          {/* Visualizer Area */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-80 flex items-center justify-center"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
            }}
          >
            <Strands
              colors={["#FF4242", "#7C3AED", "#06B6D4", "#EAB308"]}
              count={3}
              speed={isRecording ? 0.8 : 0.4}
              amplitude={isRecording ? 0.8 : 0.4}
              waviness={1}
              thickness={0.5}
              glow={isRecording ? 2.5 : 2.0}
              isAiSpeaking={isSpeaking}
              audioVolumeRef={audioVolumeRef}
            />
          </div>

          {teleprompterItems.length > 0 && (
            <div className="absolute bottom-32 left-0 right-0 z-20 flex justify-center pointer-events-none px-6">
              <Teleprompter items={teleprompterItems} />
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            {!isRecording ? (
              <GlassButton onClick={startSession}>
                <Mic className="w-5 h-5 text-foreground" />
                Start
              </GlassButton>
            ) : (
              <GlassButton
                onClick={finishPractice}
                active={!isThinking && !isSpeaking}
              >
                <Square className="w-5 h-5 text-destructive" />
                Stop
              </GlassButton>
            )}
          </div>
        </div>
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-[500px] bg-background/50 backdrop-blur-2xl border-l border-border/50 z-50 transition-transform duration-300 shadow-2xl flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="absolute -left-10 top-1/2 -translate-y-1/2 w-10 h-16 bg-background/50 backdrop-blur-2xl border border-r-0 border-border/50 rounded-l-xl flex items-center justify-center shadow-md hover:bg-muted/50 transition-colors z-50 cursor-pointer text-foreground"
          title="Toggle Transcript"
        >
          {isDrawerOpen ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>

        <div className="p-6 border-b border-border/50 shrink-0">
          <h3 className="text-xl font-bold font-heading">Transcript</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.filter(m => m.role !== "tool" && (m.role !== "assistant" || m.content)).map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-foreground" />
                </div>
              )}
              <div className={`p-4 rounded-xl max-w-[85%] ${msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-muted text-foreground rounded-tl-none"
                }`}>
                <p className="leading-relaxed text-sm">
                  {msg.content.replace(/<function[^>]*>.*?<\/function>/gs, "")}
                </p>
                {msg.feedback && (
                  <div className="mt-2 text-xs bg-black/10 dark:bg-black/30 p-2 rounded border border-border italic text-foreground">
                    💡 {msg.feedback}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {(finalizedTranscript || liveInterimText) && (
            <div className="flex gap-3 justify-end">
              <div className="p-4 rounded-xl max-w-[85%] bg-primary/20 text-foreground rounded-tr-none border border-primary/30">
                <p className="leading-relaxed text-sm">
                  {finalizedTranscript}
                  <span className="opacity-60 italic">{liveInterimText}</span>
                </p>
                <div className="flex gap-1 mt-2 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          )}

          {isThinking && (
            <div className="flex gap-3 justify-start items-center text-muted-foreground p-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Loader2 className="w-5 h-5 text-foreground animate-spin" />
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          )}

          {isSearching && (
            <div className="flex gap-3 justify-start items-center text-foreground p-2 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm italic">
                🔍 "{searchQuery || 'Searching...'}" bo'yicha internetdan qidiryapman...
              </span>
            </div>
          )}

          {isSpeaking && (
            <div className="flex gap-3 justify-start items-center text-foreground p-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 animate-pulse">
                <Volume2 className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm font-medium">Speaking...</span>
            </div>
          )}

          <div ref={chatEndRef} className="h-1 shrink-0" />
        </div>
      </div>
    </div>
  );
}

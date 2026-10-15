import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Volume2, User, Bot, ChevronLeft, ChevronRight, Clock, Search, BookOpen, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Strands from "@/components/ui/strands";
import { GlassButton } from "@/components/ui/glass-button";
import Teleprompter, { TeleprompterItem } from "@/components/ui/Teleprompter";
import TextReveal from "@/components/ui/TextReveal";
import AutoTextReveal from "@/components/ui/AutoTextReveal";
import LiveSubtitle from "@/components/ui/LiveSubtitle";
import { DebugOverlay } from "@/components/ui/DebugOverlay";
import { ViewState, PageProps } from "../App";
import { BilimIcon } from "@/components/ui/bilim-icon";

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
    part2: {
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
      questions: [
        "What are the main challenges shown in this situation?",
        "How might technology help solve this issue?",
        "What are the potential long-term consequences of this problem?"
      ]
    },
    part3: {
      title: "Technological change means progress",
      task: "Discuss the advantages and disadvantages of technological change based on the table provided.",
      for: [
        "Easier life due to advanced machinery",
        "Better communication across the world",
        "Improved healthcare and medical treatments"
      ],
      against: [
        "Technology is used for weapons and war",
        "Loss of traditional jobs to automation",
        "Decreased face-to-face social interactions"
      ]
    }
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
      if (!data.choices || !data.choices[0]) {
        console.error("Invalid API response format", data);
        throw new Error("Invalid API response format");
      }
      const content = data.choices[0].message.content;
      const cleaned = content.replace(/```json|```/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAssessmentResult(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (e) {
      console.error("Assessment Error", e);
      // Fallback result so UI doesn't hang indefinitely
      setAssessmentResult({
        overall_level: "B2",
        overall_score_100: 75,
        criteria: {
          fluency_coherence: { level: "B2", score: 4, justification: "Good flow but occasional hesitation." },
          lexical_resource: { level: "B1", score: 3, justification: "Basic vocabulary used adequately." },
          grammar_accuracy: { level: "B2", score: 4, justification: "Good control of simple grammar." },
          pronunciation: { level: "not_assessed", score: 0, justification: "N/A" },
          task_achievement: { level: "B2", score: 4, justification: "Answered most parts well." }
        },
        strengths: ["Clear delivery", "Answered the prompt directly"],
        priority_improvement: {
          area: "Vocabulary",
          why: "Using more advanced words will boost your score to C1.",
          how: "Learn synonyms for common words like 'good' and 'bad'."
        },
        errors: [
          { type: "grammar", candidate_said: "I goes to school", correction: "I go to school", explanation: "Use base verb form for first person 'I'." }
        ],
        summary: "Notice: This is a fallback result due to an API error. Please check your OpenRouter API key and internet connection."
      });
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
      if (!data.choices || !data.choices[0]) return;
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
      <div className="reading-paper-container min-h-screen flex flex-col bg-[var(--paper)] text-[var(--paper-ink)]">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-3 border-[var(--paper-ink)] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0 flex items-center justify-center font-black"
              title="Dashboardga qaytish"
            >
              ←
            </button>
            <div
              onClick={() => onNavigate("dashboard")}
              className="flex items-center gap-2 cursor-pointer select-none group"
            >
              <i className="paper-logo-mark"></i>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-[var(--paper-ink)] group-hover:text-[var(--paper-o)] transition-colors">
                  Mock<span className="text-[var(--paper-o)]">Ai</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--paper-mut)] -mt-1">
                  Speaking Studio
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0"
            title="Rejimni almashtirish"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto flex flex-col justify-center space-y-8 my-auto">
          {/* Welcome Banner */}
          <div className="paper-box p-8 bg-[var(--paper-y)] text-[var(--paper-on)] text-center relative overflow-hidden">
            <span className="inline-block px-3 py-1 rounded-full bg-white/90 text-[var(--paper-ink)] text-xs font-black uppercase tracking-wider mb-3 border-2 border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)]">
              ✦ CEFR Multilevel Speaking
            </span>
            <h1 className="text-3xl sm:text-4xl font-black mb-2">Speaking Moduli</h1>
            <p className="text-sm font-bold opacity-85 max-w-xl mx-auto">
              Nutqiy ko'nikmalaringizni qanday formatda sinamoqchisiz? Erkin AI suhbatdosh bilan mashq qiling yoki rasmiy imtihon formatida topshiring.
            </p>
          </div>

          {/* 2 Mode Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div 
              className="paper-box p-7 bg-[var(--paper-card)] flex flex-col justify-between hover:translate-x-1 hover:-translate-y-1 transition-all cursor-pointer group"
              onClick={() => setMode("practice_setup")}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[var(--paper-y)] border-3 border-[var(--paper-ink)] flex items-center justify-center mb-5 shadow-[3px_3px_0_var(--paper-ink)] group-hover:scale-105 transition-transform">
                  <BilimIcon name="mic" size={28} />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-[var(--paper)] text-[var(--paper-ink)] text-[11px] font-black border border-[var(--paper-ink)] mb-2">
                  Interaktiv Suhbat
                </div>
                <h2 className="text-2xl font-black text-[var(--paper-ink)] mb-2">Erkin Mashq (Practice)</h2>
                <p className="text-xs font-bold text-[var(--paper-mut)] leading-relaxed mb-6">
                  AI suhbatdosh bilan xohlagan mavzuda erkin gaplashing. Jonli grammatika tavsiyalari va so'z tezligi tahlili beriladi.
                </p>
              </div>
              <button 
                type="button" 
                className="paper-btn paper-btn-p w-full py-3 font-black text-sm flex items-center justify-center gap-2"
              >
                <span>Mashqni Boshlash</span>
                <span>→</span>
              </button>
            </div>

            <div 
              className="paper-box p-7 bg-[var(--paper-card)] flex flex-col justify-between hover:translate-x-1 hover:-translate-y-1 transition-all cursor-pointer group"
              onClick={() => setMode("mock_setup")}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[var(--paper-o)] text-white border-3 border-[var(--paper-ink)] flex items-center justify-center mb-5 shadow-[3px_3px_0_var(--paper-ink)] group-hover:scale-105 transition-transform">
                  <BilimIcon name="clock" size={28} />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-[var(--paper)] text-[var(--paper-ink)] text-[11px] font-black border border-[var(--paper-ink)] mb-2">
                  Rasmiy Format
                </div>
                <h2 className="text-2xl font-black text-[var(--paper-ink)] mb-2">CEFR Mock Test</h2>
                <p className="text-xs font-bold text-[var(--paper-mut)] leading-relaxed mb-6">
                  3 ta qismdan iborat real imtihon simulyatsiyasi. Tayyorgarlik taymeri, rasmlar tahlili va yakunda 5 mezonli AI ekspert bahosi.
                </p>
              </div>
              <button 
                type="button" 
                className="paper-btn paper-btn-out w-full py-3 font-black text-sm flex items-center justify-center gap-2"
              >
                <span>Mock Testni Boshlash</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (mode === "practice_setup") {
    return (
      <div className="reading-paper-container min-h-screen flex flex-col bg-[var(--paper)] text-[var(--paper-ink)]">
        <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-3 border-[var(--paper-ink)] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode("selection")}
              className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0 flex items-center justify-center font-black"
            >
              ←
            </button>
            <span className="font-black text-lg text-[var(--paper-ink)]">Mashq Sozlamalari</span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-2xl w-full mx-auto flex flex-col justify-center my-auto">
          <div className="paper-box p-6 sm:p-8 bg-[var(--paper-card)] space-y-6">
            <div>
              <span className="paper-badge paper-badge-yellow text-xs font-black mb-2">
                Qadam 1 / 2
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--paper-ink)]">Mashq Sozlamalari</h2>
              <p className="text-xs font-bold text-[var(--paper-mut)] mt-1">
                Suhbat tezligi va mavzuni tanlang
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[var(--paper-mut)] mb-2">
                  Suhbat Tezligi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPracticeDifficulty("natural")}
                    className={`paper-btn font-black text-sm py-2.5 ${
                      practiceDifficulty === "natural" ? "paper-btn-p" : "paper-btn-out"
                    }`}
                  >
                    Tabiiy Tezlik
                  </button>
                  <button
                    type="button"
                    onClick={() => setPracticeDifficulty("slow")}
                    className={`paper-btn font-black text-sm py-2.5 ${
                      practiceDifficulty === "slow" ? "paper-btn-p" : "paper-btn-out"
                    }`}
                  >
                    Sekin va Sodda
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[var(--paper-mut)] mb-2">
                  Mavzu yoki Rolli O'yin
                </label>
                <input
                  type="text"
                  value={practiceTopic}
                  onChange={e => setPracticeTopic(e.target.value)}
                  placeholder="Masalan: Travel, Hobbies, Job Interview..."
                  className="w-full p-3 rounded-xl border-2 border-[var(--paper-ink)] bg-[var(--paper)] text-[var(--paper-ink)] font-bold text-sm focus:outline-none focus:shadow-[2px_2px_0_var(--paper-ink)]"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Travel", "Technology", "Ordering at a restaurant", "Job interview", "Self-introduction"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPracticeTopic(t)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--paper)] text-[var(--paper-ink)] border-2 border-[var(--paper-ink)] text-xs font-black hover:bg-[var(--paper-y)] transition-colors shadow-[1px_1px_0_var(--paper-ink)]"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setMode("practice")}
                className="paper-btn paper-btn-p w-full py-3.5 font-black text-base flex items-center justify-center gap-2 mt-2"
              >
                <BilimIcon name="play" size={18} />
                <span>Mashqni Boshlash</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (mode === "mock_setup") {
    return (
      <div className="reading-paper-container min-h-screen flex flex-col bg-[var(--paper)] text-[var(--paper-ink)]">
        <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-3 border-[var(--paper-ink)] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode("selection")}
              className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0 flex items-center justify-center font-black"
            >
              ←
            </button>
            <span className="font-black text-lg text-[var(--paper-ink)]">Mock Test Yo'riqnomasi</span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-2xl w-full mx-auto flex flex-col justify-center my-auto">
          <div className="paper-box p-6 sm:p-8 bg-[var(--paper-card)] space-y-6">
            <div>
              <span className="paper-badge paper-badge-orange text-xs font-black mb-2">
                CEFR Multilevel Standard
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--paper-ink)]">Imtihon Strukturasi</h2>
              <p className="text-xs font-bold text-[var(--paper-mut)] mt-1">
                AI imtihon oluvchi sizni 3 ta qism bo'yicha olib boradi va javoblaringizni avtomatik yozib oladi.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="paper-box p-4 bg-[var(--paper)] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-[var(--paper-ink)]">Part 1 (A1 - B1)</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[var(--paper-y)] border border-[var(--paper-ink)]">
                    Oddiy Savollar & Rasmlar
                  </span>
                </div>
                <p className="text-xs font-bold text-[var(--paper-mut)]">
                  • Task 1.1: 3 ta qisqa savol (har biri uchun 5s o'ylash, 30s gapirish).<br />
                  • Task 1.2: 2 ta rasm taqqoslash (15s tayyorgarlik, 45s gapirish) va 2 ta davomiy savol.
                </p>
              </div>

              <div className="paper-box p-4 bg-[var(--paper)] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-[var(--paper-ink)]">Part 2 (B2)</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[var(--paper-o)] text-white border border-[var(--paper-ink)]">
                    Mavzu Kartochkasi
                  </span>
                </div>
                <p className="text-xs font-bold text-[var(--paper-mut)]">
                  Bitta rasm va 3 ta savolli kartochka. 1 daqiqa tayyorgarlik, 2 daqiqa to'xtovsiz nutq.
                </p>
              </div>

              <div className="paper-box p-4 bg-[var(--paper)] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-[var(--paper-ink)]">Part 3 (C1)</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[var(--paper-b)] text-white border border-[var(--paper-ink)]">
                    Munozara & Tahlil
                  </span>
                </div>
                <p className="text-xs font-bold text-[var(--paper-mut)]">
                  Texnologiya va jamiyat mavzusidagi jadval asosida afzallik va kamchiliklarni muhokama qilish.
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => {
                setMockPhase("part1.1_intro");
                setMode("mock");
              }}
              className="paper-btn paper-btn-p w-full py-4 font-black text-base flex items-center justify-center gap-2"
            >
              <BilimIcon name="play" size={20} />
              <span>Imtihonni Boshlash</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (mode === "practice_summary") {
    return (
      <div className="reading-paper-container min-h-screen flex flex-col bg-[var(--paper)] text-[var(--paper-ink)]">
        <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-3 border-[var(--paper-ink)] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode("selection")}
              className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0 flex items-center justify-center font-black"
            >
              ←
            </button>
            <span className="font-black text-lg text-[var(--paper-ink)]">Mashq Natijalari</span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-3xl w-full mx-auto flex flex-col justify-center my-auto">
          <div className="paper-box p-8 bg-[var(--paper-card)] space-y-8 text-center">
            <div>
              <span className="paper-badge paper-badge-green text-xs font-black mb-2">
                Mashq Yakunlandi
              </span>
              <h2 className="text-3xl font-black text-[var(--paper-ink)]">Ajoyib Nutq Mashg'uloti!</h2>
              <p className="text-xs font-bold text-[var(--paper-mut)] mt-1">
                Bugungi sessiya bo'yicha asosiy ko'rsatkichlaringiz:
              </p>
            </div>

            {practiceStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="paper-box p-6 bg-[var(--paper-y)] text-[var(--paper-on)] text-center">
                  <p className="text-xs font-black uppercase tracking-wider mb-2 opacity-80">Davomiyligi</p>
                  <h3 className="text-4xl font-black">{practiceStats.durationMins} <span className="text-sm">daq</span></h3>
                </div>
                <div className="paper-box p-6 bg-[var(--paper-b)] text-white text-center">
                  <p className="text-xs font-black uppercase tracking-wider mb-2 opacity-80">Tezlik (WPM)</p>
                  <h3 className="text-4xl font-black">{practiceStats.wpm}</h3>
                </div>
                <div className="paper-box p-6 bg-[var(--paper-o)] text-white text-center">
                  <p className="text-xs font-black uppercase tracking-wider mb-2 opacity-80">To'ldiruvchi so'zlar</p>
                  <h3 className="text-4xl font-black">{practiceStats.fillerCount}</h3>
                </div>
              </div>
            )}

            <button 
              type="button"
              onClick={() => setMode("selection")}
              className="paper-btn paper-btn-p px-8 py-3 font-black text-sm mx-auto"
            >
              Bosh Sahifaga Qaytish
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (mode === "mock" && (mockPhase === "completed" || mockPhase === "assessment")) {
    const CRITERIA_LABELS: Record<string, string> = {
      fluency_coherence: 'Ravonlik va Mantiq (Fluency)',
      lexical_resource: 'Lug\'at Boyligi (Vocabulary)',
      grammar_accuracy: 'Grammatik To\'g\'rilik (Grammar)',
      pronunciation: 'Talaffuz (Pronunciation)',
      task_achievement: 'Vazifani Bajarish (Task Achievement)',
    };

    return (
      <div className="reading-paper-container min-h-screen flex flex-col bg-[var(--paper)] text-[var(--paper-ink)]">
        <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-3 border-[var(--paper-ink)] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setMode("selection"); setAssessmentResult(null); }}
              className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0 flex items-center justify-center font-black"
            >
              ←
            </button>
            <span className="font-black text-lg text-[var(--paper-ink)]">Speaking Natijasi</span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">
          {(isAssessing || !assessmentResult) ? (
            <div className="paper-box p-12 max-w-md mx-auto my-16 bg-[var(--paper-card)] text-center space-y-5">
              <img src="/logo.svg" alt="MockAi" className="w-16 h-16 animate-bounce" />
              <h2 className="text-2xl font-black text-[var(--paper-ink)]">Nutqingiz baholanmoqda...</h2>
              <p className="text-xs font-bold text-[var(--paper-mut)] leading-relaxed">
                AI ekspert CEFR mezonlari (fluency, grammar, vocab, pronunciation) asosida javoblaringizni chuqur tekshiryapti.
              </p>
              <div className="w-14 h-14 rounded-full border-4 border-[var(--paper-ink)] border-t-[var(--paper-o)] animate-spin mx-auto mt-4" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Score Hero Card */}
              <div className="paper-box p-6 sm:p-8 bg-[var(--paper-y)] text-[var(--paper-on)] flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white text-[var(--paper-ink)] border-4 border-[var(--paper-ink)] flex flex-col items-center justify-center shadow-[4px_4px_0_var(--paper-ink)] shrink-0">
                  <span className="text-3xl sm:text-4xl font-black">{assessmentResult.overall_level}</span>
                  <span className="text-[11px] font-black text-[var(--paper-mut)] -mt-1">{assessmentResult.overall_score_100}/100</span>
                </div>
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-white text-[var(--paper-ink)] text-xs font-black uppercase tracking-wider mb-2 border-2 border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)]">
                    ✦ CEFR Baholash Sertifikati
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black mb-1">CEFR Speaking Imtihon Natijasi</h2>
                  <p className="text-xs sm:text-sm font-bold opacity-85 leading-relaxed">
                    {assessmentResult.summary}
                  </p>
                </div>
              </div>

              {/* Criteria Scores */}
              <div className="paper-box p-6 sm:p-8 bg-[var(--paper-card)] space-y-5">
                <h3 className="text-xl font-black text-[var(--paper-ink)] flex items-center gap-2">
                  <BilimIcon name="target" size={20} />
                  <span>Mezonlar Bo'yicha Ballar</span>
                </h3>

                <div className="space-y-3.5">
                  {assessmentResult.criteria && Object.entries(assessmentResult.criteria).map(([key, val]: [string, any]) => {
                    const score = val.score_1to6;
                    const pct = score != null ? (score / 6) * 100 : 0;
                    const isNotAssessed = val.level === 'not_assessed';
                    return (
                      <div key={key} className="paper-box p-4 bg-[var(--paper)] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-[var(--paper-ink)]">
                            {CRITERIA_LABELS[key] || key}
                          </span>
                          <div className="flex items-center gap-2">
                            {!isNotAssessed && (
                              <span className="text-xs font-black text-[var(--paper-mut)]">{score}/6 ball</span>
                            )}
                            <span className="text-xs font-black px-2 py-0.5 rounded bg-[var(--paper-y)] text-[var(--paper-on)] border border-[var(--paper-ink)]">
                              {isNotAssessed ? 'N/A' : val.level}
                            </span>
                          </div>
                        </div>

                        {!isNotAssessed && (
                          <div className="w-full h-3 bg-[var(--paper-card)] border-2 border-[var(--paper-ink)] rounded-full overflow-hidden p-0.5">
                            <div 
                              className="h-full bg-[var(--paper-o)] rounded-full transition-all duration-700" 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        )}
                        <p className="text-xs font-semibold text-[var(--paper-mut)] leading-relaxed">{val.justification}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths & Priority Improvement */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="paper-box p-6 bg-[var(--paper-card)] space-y-3">
                  <h3 className="text-base font-black text-[var(--paper-g)] flex items-center gap-2">
                    <span className="text-xl">💪</span> Kuchli Tomonlaringiz
                  </h3>
                  <ul className="space-y-2">
                    {assessmentResult.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2 text-xs font-bold text-[var(--paper-ink)]">
                        <span className="text-[var(--paper-g)] shrink-0 font-black">✓</span> 
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {assessmentResult.priority_improvement && (
                  <div className="paper-box p-6 bg-[var(--paper-card)] space-y-3">
                    <h3 className="text-base font-black text-[var(--paper-b)] flex items-center gap-2">
                      <span className="text-xl">🎯</span> Yaxshilash Kerak: {assessmentResult.priority_improvement.area}
                    </h3>
                    <p className="text-xs font-semibold text-[var(--paper-mut)]">{assessmentResult.priority_improvement.why}</p>
                    <p className="text-xs font-black text-[var(--paper-ink)] bg-[var(--paper)] p-2.5 rounded-lg border-2 border-[var(--paper-ink)]">
                      {assessmentResult.priority_improvement.how}
                    </p>
                  </div>
                )}
              </div>

              {/* Errors & Corrections */}
              {assessmentResult.errors && assessmentResult.errors.length > 0 && (
                <div className="paper-box p-6 bg-[var(--paper-card)] space-y-4">
                  <h3 className="text-base font-black text-[var(--paper-r)] flex items-center gap-2">
                    <span className="text-xl">📝</span> Aniqlangan Xatolar va To'g'ri Varianti
                  </h3>
                  <div className="space-y-3">
                    {assessmentResult.errors.map((err: any, i: number) => (
                      <div key={i} className="paper-box p-3.5 bg-[var(--paper)] space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/40 text-red-600 border border-red-500">
                            {err.type}
                          </span>
                        </div>
                        <div className="text-xs font-bold space-y-1">
                          <p className="text-red-500 line-through">"{err.candidate_said}"</p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-black">"{err.correction}"</p>
                        </div>
                        <p className="text-[11px] font-semibold text-[var(--paper-mut)]">{err.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Return Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => { setMode("selection"); setAssessmentResult(null); }}
                  className="paper-btn paper-btn-p px-10 py-3.5 font-black text-sm"
                >
                  Bosh Sahifaga Qaytish
                </button>
              </div>
            </div>
          )}
        </main>
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
    if (mockPhase.includes("part3")) return MOCK_DATA.part3.task;
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

  const handleSkipPhase = () => {
    const phase = mockPhaseRef.current;
    
    // Clear any playing audio
    if (audioQueueRef.current.length > 0) audioQueueRef.current = [];
    if (audioRef.current) {
      audioRef.current.pause();
      isPlayingAudioRef.current = false;
    }

    if (phase.startsWith("part1.1")) {
      mockPhaseRef.current = "part1.2_intro";
      setMockPhase("part1.2_intro");
    } else if (phase.startsWith("part1.2")) {
      mockPhaseRef.current = "part2_intro";
      setMockPhase("part2_intro");
    } else if (phase.startsWith("part2")) {
      mockPhaseRef.current = "part3_intro";
      setMockPhase("part3_intro");
    } else if (phase.startsWith("part3")) {
      stopSession();
      mockPhaseRef.current = "assessment";
      setMockPhase("assessment");
      generateAssessment(messagesRef.current);
      return;
    }
    handleUserMessage("", undefined, true);
  };

  return (
    <div className="reading-paper-container min-h-screen flex flex-col bg-[var(--paper)] text-[var(--paper-ink)] overflow-hidden relative">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-3 border-[var(--paper-ink)] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isRecording) stopSession();
              onNavigate("dashboard");
            }}
            className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0 flex items-center justify-center font-black"
            title="Dashboardga qaytish"
          >
            ←
          </button>
          
          <div
            onClick={() => {
              if (isRecording) stopSession();
              onNavigate("dashboard");
            }}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <i className="paper-logo-mark"></i>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-[var(--paper-ink)] group-hover:text-[var(--paper-o)] transition-colors">
                Mock<span className="text-[var(--paper-o)]">Ai</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--paper-mut)] -mt-1">
                {mode === "practice" ? "Practice Mode" : "CEFR Mock Test"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {mode === "practice" && (
            <div className="hidden md:flex items-center gap-2">
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                disabled={isRecording}
                className="bg-[var(--paper)] text-xs font-black border-2 border-[var(--paper-ink)] rounded-lg px-2.5 py-1.5 focus:outline-none shadow-[2px_2px_0_var(--paper-ink)] disabled:opacity-50"
              >
                {AI_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>

              <select
                value={selectedVoice}
                onChange={(e) => handleVoiceChange(e.target.value)}
                disabled={isRecording}
                className="bg-[var(--paper)] text-xs font-black border-2 border-[var(--paper-ink)] rounded-lg px-2.5 py-1.5 focus:outline-none shadow-[2px_2px_0_var(--paper-ink)] disabled:opacity-50"
              >
                {VOICE_MODELS.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          {isMockActive && (
            <span className="paper-badge paper-badge-yellow text-xs font-black">
              {getPartLabel() || "Mock Test"}
            </span>
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

      {/* Progress Bar for Mock Test */}
      {isMockActive && (
        <div className="w-full max-w-2xl mx-auto px-4 pt-4 z-30 flex items-center justify-center gap-2 shrink-0">
          <div className={`h-2.5 flex-1 rounded-full border-2 border-[var(--paper-ink)] transition-colors duration-300 ${mockPhase.startsWith("part1") ? "bg-[var(--paper-o)]" : "bg-[var(--paper-card)]"}`}></div>
          <div className={`h-2.5 flex-1 rounded-full border-2 border-[var(--paper-ink)] transition-colors duration-300 ${mockPhase.startsWith("part2") ? "bg-[var(--paper-o)]" : "bg-[var(--paper-card)]"}`}></div>
          <div className={`h-2.5 flex-1 rounded-full border-2 border-[var(--paper-ink)] transition-colors duration-300 ${mockPhase.startsWith("part3") ? "bg-[var(--paper-o)]" : "bg-[var(--paper-card)]"}`}></div>
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
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 paper-box px-4 py-2 bg-[var(--paper-y)] text-[var(--paper-on)] font-black text-xs flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          STT qayta ulanmoqda...
        </div>
      )}

      {/* ==================== MOCK MODE LAYOUT ==================== */}
      {isMockActive && (
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto items-center justify-between py-4 px-4 sm:px-6 relative">
          {/* TOP SECTION: Timer or AI subtitle */}
          <div className="w-full flex flex-col items-center shrink-0 min-h-[140px] justify-center">
            {mockIsTimerRunning && !isSpeaking && (
              <div className="flex flex-col items-center animate-in zoom-in duration-300">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="9" className="text-[var(--paper-card)]" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="9"
                      strokeDasharray="276"
                      strokeDashoffset={276 - (276 * mockTimeLeft) / getMaxTime()}
                      className={`transition-all duration-1000 linear ${mockPhase.endsWith("speak") ? "text-[var(--paper-r)]" : "text-[var(--paper-o)]"}`}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-[var(--paper-ink)]">
                      {Math.floor(mockTimeLeft / 60)}:{(mockTimeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <span className={`mt-2 font-black uppercase text-xs tracking-wider px-3 py-0.5 rounded-full border-2 border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)] ${mockPhase.endsWith("speak") ? "bg-[var(--paper-r)] text-white animate-pulse" : "bg-[var(--paper-y)] text-[var(--paper-on)]"}`}>
                  {mockPhase.endsWith("speak") ? "Gapirish vaqti" : "O'ylash vaqti"}
                </span>
              </div>
            )}

            {isSpeaking && mockCurrentSubtitle && (
              <div className="paper-box p-4 bg-[var(--paper-card)] text-center max-w-2xl mx-auto shadow-[4px_4px_0_var(--paper-ink)]">
                <LiveSubtitle
                  text={mockCurrentSubtitle}
                  wordDelay={200}
                  className="text-[var(--paper-ink)] text-lg sm:text-xl font-black text-center leading-relaxed"
                />
              </div>
            )}

            {!mockIsTimerRunning && !isSpeaking && isRecording && (
              <div className="paper-box px-6 py-3 bg-[var(--paper-card)] flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-[var(--paper-o)] animate-spin" />
                <span className="text-xs font-black text-[var(--paper-mut)] uppercase tracking-wider">Navbatdagi savol tayyorlanmoqda...</span>
              </div>
            )}
          </div>

          {/* MIDDLE SECTION: Content (images, task card, topic card) */}
          <div className="flex-1 flex flex-col items-center justify-center w-full gap-5 overflow-hidden">
            {mockPhase.includes("part1.2_images") && (
              <div className="flex gap-4 animate-in fade-in duration-500 w-full max-w-3xl justify-center">
                <img src={MOCK_DATA.part1_2_images[0]} className="flex-1 max-w-[48%] h-[220px] object-cover rounded-2xl border-3 border-[var(--paper-ink)] shadow-[4px_4px_0_var(--paper-ink)]" />
                <img src={MOCK_DATA.part1_2_images[1]} className="flex-1 max-w-[48%] h-[220px] object-cover rounded-2xl border-3 border-[var(--paper-ink)] shadow-[4px_4px_0_var(--paper-ink)]" />
              </div>
            )}

            {mockIsTimerRunning && !isSpeaking && (
              <div className="w-full max-w-2xl animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="paper-box p-6 bg-[var(--paper-card)] shadow-[6px_6px_0_var(--paper-ink)]">
                  <span className="inline-block px-3 py-1 rounded-full bg-[var(--paper-y)] text-[var(--paper-on)] text-[11px] font-black uppercase tracking-wider mb-3 border-2 border-[var(--paper-ink)]">
                    {getPartLabel()}
                  </span>
                  {mockPhase.includes("part2") ? (
                    <div>
                      <p className="text-[var(--paper-ink)] text-lg sm:text-xl font-black text-center mb-3">Taqdimotingizda quyidagi 3 ta savolga to'liq javob bering:</p>
                      <ul className="space-y-2 text-[var(--paper-ink)] font-bold text-sm">
                        {MOCK_DATA.part2.questions.map((q, i) => (
                          <li key={i} className="flex gap-2.5 items-start">
                            <span className="w-5 h-5 rounded-md bg-[var(--paper-o)] text-white flex items-center justify-center text-xs font-black shrink-0 border border-[var(--paper-ink)]">
                              {i + 1}
                            </span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-[var(--paper-ink)] text-lg sm:text-xl font-black text-center leading-relaxed">
                      {getTaskText()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {mockPhase.includes("part2") && (mockPhase === "part2_prep" || mockPhase === "part2_speak") && (
              <div className="flex justify-center animate-in fade-in duration-500 w-full max-w-md">
                <img src={MOCK_DATA.part2.image} className="w-full h-[220px] object-cover rounded-2xl border-3 border-[var(--paper-ink)] shadow-[4px_4px_0_var(--paper-ink)]" />
              </div>
            )}

            {mockPhase.includes("part3") && (mockPhase === "part3_prep" || mockPhase === "part3_speak") && (
              <div className="paper-box p-6 bg-[var(--paper-card)] shadow-[6px_6px_0_var(--paper-ink)] max-w-3xl w-full animate-in fade-in duration-500">
                <h3 className="text-xl font-black text-center mb-4 text-[var(--paper-ink)]">{MOCK_DATA.part3.title}</h3>
                <div className="grid grid-cols-2 rounded-xl border-3 border-[var(--paper-ink)] overflow-hidden shadow-[2px_2px_0_var(--paper-ink)]">
                  <div className="bg-[var(--paper-g)] text-white p-3 text-center font-black text-sm border-b-2 border-r-2 border-[var(--paper-ink)]">
                    FOR (Afzalliklari)
                  </div>
                  <div className="bg-[var(--paper-r)] text-white p-3 text-center font-black text-sm border-b-2 border-[var(--paper-ink)]">
                    AGAINST (Kamchiliklari)
                  </div>
                  {MOCK_DATA.part3.for.map((forItem, i) => (
                    <div key={i} className="contents">
                      <div className={`p-3 text-xs sm:text-sm font-bold text-[var(--paper-ink)] bg-[var(--paper)] border-r-2 border-[var(--paper-ink)] ${i !== MOCK_DATA.part3.for.length - 1 ? 'border-b-2' : ''}`}>
                        • {forItem}
                      </div>
                      <div className={`p-3 text-xs sm:text-sm font-bold text-[var(--paper-ink)] bg-[var(--paper)] ${i !== MOCK_DATA.part3.for.length - 1 ? 'border-b-2 border-[var(--paper-ink)]' : ''}`}>
                        • {MOCK_DATA.part3.against[i]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM SECTION: Start/Stop/Skip Buttons */}
          <div className="w-full flex justify-center shrink-0 py-4 gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={startSession}
                className="paper-btn paper-btn-p px-8 py-3.5 text-base font-black flex items-center gap-2 shadow-[4px_4px_0_var(--paper-ink)]"
              >
                <BilimIcon name="mic" size={20} />
                <span>Imtihonni Boshlash</span>
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    stopSession();
                    mockPhaseRef.current = "assessment";
                    setMockPhase("assessment");
                    generateAssessment(messagesRef.current);
                  }}
                  className="paper-btn font-black text-sm px-6 py-3 bg-[var(--paper-r)] text-white flex items-center gap-2"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Tugatish</span>
                </button>
                <button
                  type="button"
                  onClick={handleSkipPhase}
                  className="paper-btn paper-btn-out font-black text-sm px-6 py-3 flex items-center gap-1.5"
                >
                  <span>Qismni O'tkazib Yuborish →</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== PRACTICE MODE LAYOUT ==================== */}
      {mode === "practice" && (
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto relative justify-center items-center p-6">
          {/* Strands Visualizer */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-80 flex items-center justify-center"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
            }}
          >
            <Strands
              colors={["#FFB800", "#FF6B00", "#4D7CFF", "#10B981"]}
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
          <div className="relative z-20 flex flex-col items-center gap-4">
            {!isRecording ? (
              <button
                type="button"
                onClick={startSession}
                className="paper-btn paper-btn-p px-10 py-4 text-lg font-black flex items-center gap-3 shadow-[6px_6px_0_var(--paper-ink)]"
              >
                <BilimIcon name="mic" size={24} />
                <span>Suhbatni Boshlash</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={finishPractice}
                className="paper-btn font-black text-base px-8 py-3.5 bg-[var(--paper-r)] text-white flex items-center gap-2 shadow-[6px_6px_0_var(--paper-ink)]"
              >
                <Square className="w-5 h-5 fill-white" />
                <span>Suhbatni To'xtatish</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-[450px] max-w-[90vw] bg-[var(--paper)] border-l-4 border-[var(--paper-ink)] z-50 transition-transform duration-300 shadow-2xl flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="absolute -left-11 top-1/2 -translate-y-1/2 w-11 h-14 bg-[var(--paper-y)] border-3 border-r-0 border-[var(--paper-ink)] rounded-l-xl flex items-center justify-center shadow-[-3px_3px_0_var(--paper-ink)] cursor-pointer text-[var(--paper-ink)] font-black"
          title="Transkriptni ochish/yopish"
        >
          {isDrawerOpen ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>

        <div className="p-5 border-b-3 border-[var(--paper-ink)] bg-[var(--paper-card)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BilimIcon name="pencil" size={18} />
            <h3 className="text-lg font-black text-[var(--paper-ink)]">Jonli Transkript</h3>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[var(--paper-y)] border border-[var(--paper-ink)]">
            AI & User
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5">
          {messages.filter(m => m.role !== "tool" && (m.role !== "assistant" || m.content)).map((msg, idx) => (
            <div key={idx} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-[var(--paper-y)] border-2 border-[var(--paper-ink)] flex items-center justify-center shrink-0 text-sm font-black shadow-[2px_2px_0_var(--paper-ink)]">
                  🤖
                </div>
              )}
              <div className={`paper-box p-3.5 max-w-[85%] text-xs font-semibold ${msg.role === "user"
                  ? "bg-[var(--paper-y)] text-[var(--paper-on)]"
                  : "bg-[var(--paper-card)] text-[var(--paper-ink)]"
                }`}>
                <p className="leading-relaxed">
                  {msg.content.replace(/<function[^>]*>.*?<\/function>/gs, "")}
                </p>
                {msg.feedback && (
                  <div className="mt-2 text-[11px] bg-white/60 dark:bg-black/20 p-2 rounded-lg border border-[var(--paper-ink)] italic text-[var(--paper-ink)] font-bold">
                    💡 {msg.feedback}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-[var(--paper-o)] text-white border-2 border-[var(--paper-ink)] flex items-center justify-center shrink-0 text-sm font-black shadow-[2px_2px_0_var(--paper-ink)]">
                  👤
                </div>
              )}
            </div>
          ))}

          {(finalizedTranscript || liveInterimText) && (
            <div className="flex gap-2.5 justify-end">
              <div className="paper-box p-3.5 max-w-[85%] bg-[var(--paper-y)]/80 text-[var(--paper-on)] text-xs font-semibold">
                <p className="leading-relaxed">
                  {finalizedTranscript}
                  <span className="opacity-60 italic">{liveInterimText}</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[var(--paper-o)] text-white border-2 border-[var(--paper-ink)] flex items-center justify-center shrink-0 text-sm font-black">
                👤
              </div>
            </div>
          )}

          {isThinking && (
            <div className="flex gap-2 items-center text-xs font-bold text-[var(--paper-mut)] p-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--paper-o)]" />
              <span>AI o'ylamoqda...</span>
            </div>
          )}

          {isSpeaking && (
            <div className="flex gap-2 items-center text-xs font-bold text-[var(--paper-mut)] p-2">
              <Volume2 className="w-4 h-4 text-[var(--paper-g)] animate-pulse" />
              <span>AI gapirmoqda...</span>
            </div>
          )}

          <div ref={chatEndRef} className="h-1 shrink-0" />
        </div>
      </div>
    </div>
  );
}

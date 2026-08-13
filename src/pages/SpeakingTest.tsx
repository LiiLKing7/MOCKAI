import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Volume2, User, Bot, ChevronLeft, ChevronRight, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Strands from "@/components/ui/strands";
import { GlassButton } from "@/components/ui/glass-button";
import Teleprompter, { TeleprompterItem } from "@/components/ui/Teleprompter";
import TextReveal from "@/components/ui/TextReveal";
import { DebugOverlay } from "@/components/ui/DebugOverlay";
import { ViewState } from "../App";

import { PageProps } from "../App";
import { BookOpen, Moon, Sun } from "lucide-react";



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
  const [mockPart, setMockPart] = useState<1 | 2 | 3 | "assessment">(1);
  const [mockPart2State, setMockPart2State] = useState<"intro" | "prep" | "speaking" | "none">("none");
  const [mockTimeLeft, setMockTimeLeft] = useState(0);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [practiceStats, setPracticeStats] = useState<any>(null);

  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  const mockPartRef = useRef(mockPart);
  useEffect(() => { mockPartRef.current = mockPart; }, [mockPart]);
  const mockPart2StateRef = useRef(mockPart2State);
  useEffect(() => { mockPart2StateRef.current = mockPart2State; }, [mockPart2State]);

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

  useEffect(() => {
    let interval: any;
    if (mode === "mock" && mockPart === 2 && mockTimeLeft > 0) {
      interval = setInterval(() => {
        setMockTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, mockPart, mockTimeLeft]);

  const handleUserMessageRef = useRef<any>(null);

  useEffect(() => {
    if (mode === "mock" && mockPart === 2 && mockTimeLeft === 0 && mockPart2State !== "none" && mockPart2State !== "intro") {
      if (mockPart2State === "prep") {
        setMockPart2State("speaking");
        setMockTimeLeft(120);
      } else if (mockPart2State === "speaking") {
        setMockPart(3);
        setMockPart2State("none");
        if (handleUserMessageRef.current) handleUserMessageRef.current();
      }
    }
  }, [mockTimeLeft, mode, mockPart, mockPart2State]);

  useEffect(() => {
    // Auto scroll to bottom
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, finalizedTranscript, isThinking]);

  const fetchAndQueueAudio = async (textToSpeak: string) => {
    const id = Date.now().toString() + Math.random().toString();
    const queueItem = { id, url: null as string | null, ready: false, text: textToSpeak };
    audioQueueRef.current.push(queueItem);

    try {
      const ttsRes = await fetch(`/api/tts-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: textToSpeak, model: selectedVoiceRef.current })
      });

      if (!ttsRes.ok) throw new Error("TTS failed");


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
      if (modeRef.current === "mock" && mockPart2StateRef.current === "intro") {
        setMockPart2State("prep");
        setMockTimeLeft(60);
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

  const getSystemPrompt = (overrideMockPart?: any, overrideMockPart2State?: any) => {
    const selectedVoiceModel = VOICE_MODELS.find(v => v.id === selectedVoiceRef.current);
    const aiName = selectedVoiceModel ? selectedVoiceModel.name.split(" ")[0] : "the Examiner";
    const activeMockPart = overrideMockPart || mockPart;
    const activeMockPart2State = overrideMockPart2State || mockPart2State;

    const hour = new Date().getHours();
    let timeGreeting = "Hello";
    if (hour >= 5 && hour < 12) timeGreeting = "Good morning";
    else if (hour >= 12 && hour < 18) timeGreeting = "Good afternoon";
    else if (hour >= 18 && hour < 22) timeGreeting = "Good evening";

    if (mode === "practice") {
      let prompt = `You are a friendly conversational partner named ${aiName}. Speak naturally like a native speaker. Keep replies short and conversational (1-2 sentences). You MUST strictly speak ONLY in English.`;
      if (practiceDifficulty === "slow") {
        prompt = `You are an English teacher named ${aiName} practicing with a beginner. Speak VERY simply, use basic vocabulary, and keep sentences very short (1 sentence max). You MUST strictly speak ONLY in English.`;
      }
      if (practiceTopic) {
        prompt += ` The current topic or roleplay scenario is: ${practiceTopic}. Play along naturally.`;
      }
      return prompt;
    } else if (mode === "mock") {
      if (activeMockPart === 1) {
        return `You are an IELTS/CEFR Multilevel examiner named ${aiName} conducting Part 1 of the speaking test.
Follow this exact flow:
1. First, start the conversation by saying EXACTLY: "${timeGreeting}, my name is ${aiName}. Can you tell me your full name, please?"
2. When the candidate answers, say EXACTLY: "Now, in this first part of the test, I'd like to ask you some questions about yourself." and immediately introduce the first topic (e.g., "Let's talk about [Topic]...").
3. Randomly select 2 topics from this pool for this session: Hometown, Work/Studies, Hobbies, Family/Friends, Daily routine, Food, Technology/Media.
4. For each topic, ask 3-4 connected questions, one at a time. React naturally to their answers.
IMPORTANT RULES:
- NEVER include parentheticals like (please tell me your name), instructions, or notes to the user in your output! Speak ONLY the exact words you are supposed to say out loud as the examiner.
- Only ask ONE question per turn. Do not ask multiple questions at once. Keep your responses brief.`;
      } else if (activeMockPart === 2) {
        if (activeMockPart2State === "intro") {
          return `You are an IELTS examiner named ${aiName}. Acknowledge the candidate's last answer briefly. Then say exactly: "Now I'm going to give you a topic, and I'd like you to talk about it for one to two minutes. Before you talk, you'll have one minute to think about what you're going to say. Your topic is to describe a memorable trip you took." Do not ask any other questions.`;
        }
        return `You are an IELTS examiner named ${aiName}. The candidate has just given a 1-2 minute long turn speech on a topic. Acknowledge what they said with one brief sentence, then tell them we will now move to Part 3 and ask ONE follow up question.`;
      } else if (activeMockPart === 3) {
        if (mockPartTurnCountRef.current === 2) {
          return `You are an IELTS examiner named ${aiName}. The candidate has just finished their 2-minute speech. Acknowledge their speech briefly, tell them we will now move to Part 3, and ask ONE follow-up abstract question related to travel or holidays.`;
        }
        return `You are an IELTS examiner named ${aiName} conducting Part 3. Ask ONE follow-up, abstract, or analytical question related to their previous topic. Keep it strictly to one question.`;
      }
    }
    return `You are a casual English speaking partner for a CEFR Multilevel test. Give very short, conversational replies (1-2 sentences). Never use markdown, emojis, or lists.`;
  };

  const generateAssessment = async (history: Message[]) => {
    setThinking(true);
    try {
      const orRes = await fetch("/api/chat-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            {
              role: "system",
              content: "You are an expert IELTS/CEFR Multilevel examiner. Review the following transcript of a candidate's speaking test. Estimate their CEFR Multilevel score (A2-C2). Then list 2 strengths and 2 areas to improve based strictly on the transcript. Return ONLY a JSON object in this format: {\"cefr\": \"B2\", \"strengths\": [\"...\"], \"improvements\": [\"...\"]}"
            },
            {
              role: "user",
              content: JSON.stringify(history)
            }
          ]
        })
      });
      const data = await orRes.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAssessmentResult(JSON.parse(jsonMatch[0]));
      }
    } catch (e) {
      console.error("Assessment Error", e);
    }
    setThinking(false);
  };

  const generateMicroFeedback = async (userText: string, messageIndex: number) => {
    if (mode !== "practice") return;
    try {
      const orRes = await fetch("/api/chat-proxy", {
        method: "POST",
        headers: {
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

  const handleUserMessage = async (text?: string, overrideMessages?: Message[]) => {
    let newMessages = overrideMessages || messagesRef.current;
    if (text) {
      const msgIndex = newMessages.length;
      newMessages = [...messagesRef.current, { role: "user" as const, content: text }];
      setMessages(newMessages);

      if (mode === "practice") {
        generateMicroFeedback(text, msgIndex);
      }

      if (mode === "mock" && mockPart !== 2) {
        mockPartTurnCountRef.current += 1;
      }
    }

    let nextMockPart = mockPart;
    let nextMockPart2State = mockPart2State;

    if (mode === "mock") {
      if (mockPart === 1 && mockPartTurnCountRef.current >= 8) {
        nextMockPart = 2;
        nextMockPart2State = "intro";
        setMockPart(2);
        setMockPart2State("intro");
      } else if (mockPart === 3 && mockPartTurnCountRef.current >= 6) {
        setMockPart("assessment");
        stopSession();
        generateAssessment(newMessages);
        return;
      }
    }
    setThinking(true);
    setFinalizedTranscript("");
    setLiveInterimText("");

    audioQueueRef.current = [];
    isPlayingAudioRef.current = false;
    isGeneratingRef.current = true;

    try {
      const orRes = await fetch("/api/chat-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
              content: getSystemPrompt(nextMockPart, nextMockPart2State)
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
            
            const searchRes = await fetch("/api/web-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: parsedArgs.query })
            });
            
            if (!searchRes.ok) throw new Error("Search failed");
                const searchData = await searchRes.json();
                
                newMessages.push({ role: "assistant", content: "", tool_calls: [{ id: toolCallId, type: "function", function: { name: "web_search", arguments: toolCallArgs } }] });
                newMessages.push({ role: "tool", tool_call_id: toolCallId, name: "web_search", content: JSON.stringify(searchData.results || searchData) });
                
                messagesRef.current = newMessages;
                setMessages(newMessages);
                
                setIsSearching(false);
                return handleUserMessage(undefined, newMessages);
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
        setMockPart(1);
        setMockPart2State("none");
        setMockTimeLeft(0);
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

      const connectDeepgram = async () => {
        try {
          const tokenRes = await fetch('/api/get-deepgram-token');
          if (!tokenRes.ok) throw new Error("Failed to get deepgram token");
          const { token } = await tokenRes.json();

          const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en&endpointing=250&interim_results=true`, [
            "token",
            token,
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

                if (modeRef.current === "mock" && mockPartRef.current === 2 && mockPart2StateRef.current === "speaking") {
                  setMessages(prev => [...prev, { role: "user" as const, content: finalUtterance }]);
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

            if (modeRef.current === "mock" && mockPartRef.current === 2 && mockPart2StateRef.current === "speaking") {
              setMessages(prev => [...prev, { role: "user" as const, content: finalUtterance }]);
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
        } catch (err) {
          console.error("Deepgram connection error", err);
          setMicReadyState(0 as any);
        }
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
          <h2 className="text-3xl font-bold font-heading mb-4">Mock Test (IELTS/CEFR Multilevel)</h2>
          <p className="text-muted-foreground mb-6">This test consists of 3 parts and will evaluate your CEFR Multilevel speaking ability.</p>

          <div className="space-y-4 mb-8">
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-bold mb-1">Part 1: Interview</h3>
              <p className="text-sm text-muted-foreground">Short questions on familiar topics. (No preparation)</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-bold mb-1">Part 2: Long Turn (Cue Card)</h3>
              <p className="text-sm text-muted-foreground">You will be given a topic to speak about for 1-2 minutes. You have 1 minute to prepare.</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-bold mb-1">Part 3: Discussion</h3>
              <p className="text-sm text-muted-foreground">Deeper, analytical questions related to the topic in Part 2.</p>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={() => {
            setMockPart(1);
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

  if (mode === "mock" && mockPart === "assessment") {
    return (
      <div className="flex-1 flex flex-col p-6 items-center justify-center h-full overflow-y-auto">
        <div className="w-full max-w-4xl bg-card border rounded-2xl p-8 shadow-lg">
          <Button variant="ghost" onClick={() => setMode("selection")} className="mb-6 -ml-4">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
          <h2 className="text-4xl font-bold font-heading mb-8">Test Results (Assessment)</h2>

          {!assessmentResult ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-foreground">
              <Loader2 className="w-12 h-12 animate-spin" />
              <p className="text-xl font-medium">Evaluating results (Claude 3.5 Sonnet)...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="flex items-center gap-6 p-6 bg-primary/10 rounded-xl border border-primary/20">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-bold">
                  {assessmentResult.cefr}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Estimated CEFR Multilevel Score</h3>
                  <p className="text-muted-foreground">This is an estimated score evaluated by AI and cannot replace an official certificate.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                    <span className="text-2xl">💪</span> Strengths
                  </h3>
                  <ul className="space-y-3">
                    {assessmentResult.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2"><span className="text-green-500 mt-1">•</span> <span>{s}</span></li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📈</span> Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {assessmentResult.improvements?.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2"><span className="text-amber-500 mt-1">•</span> <span>{s}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 items-center w-full h-full overflow-hidden relative">
      {/* Background Part Label */}
      {mode === "mock" && mockPart !== "assessment" && (
        <div className="absolute top-8 left-8 text-muted-foreground/40 font-bold tracking-widest uppercase text-sm z-0 select-none">
          PART {mockPart} {mockPart === 1 ? "— INTERVIEW" : mockPart === 2 ? "— LONG TURN" : "— DISCUSSION"}
        </div>
      )}

      {mode === "mock" && mockPart === 2 && mockPart2State !== "none" && mockPart2State !== "intro" && (
        <div className={`transition-all duration-700 z-30 flex flex-col items-center
          ${mockPart2State === "prep"
            ? "absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center p-8"
            : "absolute top-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur shadow-lg border rounded-xl p-4 max-w-2xl"
          }`}
        >
          {mockPart2State === "prep" ? (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="flex items-center justify-center gap-3 text-foreground mb-4">
                <Clock className="w-10 h-10" />
                <h2 className="text-5xl font-bold">00:{mockTimeLeft.toString().padStart(2, '0')}</h2>
              </div>
              <p className="text-xl text-muted-foreground mb-8">Preparation Time</p>
              <div className="bg-card border rounded-2xl p-8 max-w-2xl text-left shadow-2xl">
                <h3 className="font-bold text-xl mb-4">Describe a memorable trip you took.</h3>
                <ul className="list-disc pl-6 space-y-2 text-lg">
                  <li>where you went</li>
                  <li>who you went with</li>
                  <li>what you did</li>
                  <li>and explain why it was memorable.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex gap-8 items-center animate-in slide-in-from-top-10 fade-in duration-500">
              <div className="flex flex-col items-center">
                <div className={`flex items-center gap-2 text-3xl font-bold mb-1 ${mockTimeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
                  <Clock className="w-6 h-6" />
                  <span>0{Math.floor(mockTimeLeft / 60)}:{(mockTimeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
                <p className="text-xs text-muted-foreground">Speaking Time</p>
              </div>
              <div className="border-l border-border pl-6">
                <h3 className="font-bold text-md mb-1">Describe a memorable trip you took.</h3>
                <p className="text-sm text-muted-foreground">You should say: where you went, who you went with, what you did, and why it was memorable.</p>
              </div>
            </div>
          )}
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

      <div className="w-full flex items-center justify-between mb-8 max-w-5xl mx-auto relative z-20">
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

        {teleprompterItems.length > 0 && mode === "practice" && (
          <div className="absolute bottom-32 left-0 right-0 z-20 flex justify-center pointer-events-none px-6">
            <Teleprompter items={teleprompterItems} />
          </div>
        )}

        {/* Task Instructions Card for all parts */}
        {mode === "mock" && mockPart !== "assessment" && (
          <div className="absolute bottom-8 flex flex-col items-center text-center z-10 w-full max-w-2xl px-6 pointer-events-none">
            <div className="p-4">
              <h3 className="text-3xl font-bold text-foreground uppercase tracking-widest mb-4">
                PART {mockPart}: {mockPart === 1 ? "INTERVIEW" : mockPart === 2 ? "LONG TURN" : "DISCUSSION"}
              </h3>
                <div className="text-foreground/90 text-lg leading-relaxed font-medium">
                  <TextReveal enableBlur={true} baseOpacity={0} blurStrength={10}>
                    {mockPart === 1 ? "Imtihonchi sizga tanish mavzular (uy-joy, ish/o'qish, qiziqishlar va h.k.) bo'yicha bir necha savol beradi. Bu qism taxminan 4-5 daqiqa davom etadi. Tabiiy va erkin javob bering — tayyorgarlik vaqti kerak emas." : (mockPart === 2 ? "Sizga bitta mavzu beriladi va uni yoritish uchun bir necha nuqta ko'rsatiladi. Tayyorlanish uchun 1 daqiqa, so'ngra 1-2 daqiqa davomida shu mavzuda gapirishingiz kerak bo'ladi." : "Imtihonchi Part 2'dagi mavzu bilan bog'liq, chuqurroq fikr-mulohaza talab qiladigan savollar beradi. Bu yerda o'z fikringizni asoslab tushuntirish muhim.")}
                  </TextReveal>
                </div>
            </div>
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
              onClick={mode === "practice" ? finishPractice : stopSession}
              active={!isThinking && !isSpeaking}
            >
              <Square className="w-5 h-5 text-destructive" />
              Stop
            </GlassButton>
          )}
        </div>
      </div>

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

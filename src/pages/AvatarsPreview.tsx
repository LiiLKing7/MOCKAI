import { useState } from "react";
import { ArrowLeft, Check, Copy, Sparkles, Sliders, RefreshCw, Eye, Smile, Pause, Play, Moon, Sun, Info } from "lucide-react";
import { PaperBotAvatar, BotType, BotState } from "../components/paper-bot-avatars/PaperBotAvatar";
import "../components/paper-bot-avatars/paper-bot-avatars.css";
import { PageProps } from "../App";

const ALL_BOT_TYPES: { type: BotType; name: string; category: "geometric" | "character" | "organic" }[] = [
  { type: "clover", name: "Clover (Beda)", category: "organic" },
  { type: "flower", name: "Flower (Gul)", category: "organic" },
  { type: "triangle", name: "Triangle (Uchburchak)", category: "geometric" },
  { type: "square", name: "Square (Kvadrat)", category: "geometric" },
  { type: "blob", name: "Blob (Tomchi-shakl)", category: "organic" },
  { type: "ghost", name: "Ghost (Sharpacha)", category: "character" },
  { type: "circle", name: "Circle (Doira)", category: "geometric" },
  { type: "drop", name: "Drop (Suv tomchisi)", category: "organic" },
  { type: "star", name: "Star (Yulduzcha)", category: "organic" },
  { type: "droid", name: "Droid (Kichik robot)", category: "character" },
  { type: "mech", name: "Mech (Katta mexa-bot)", category: "character" },
  { type: "alien", name: "Alien (O'zga sayyoralik)", category: "character" },
  { type: "hexagon", name: "Hexagon (Oltiburchak)", category: "geometric" },
  { type: "cat", name: "Cat (Mushukcha)", category: "character" },
  { type: "cloud", name: "Cloud (Bulutcha)", category: "organic" },
  { type: "pill", name: "Pill (Kapsula)", category: "geometric" },
  { type: "pebble", name: "Pebble (Toshcha)", category: "organic" },
  { type: "puddle", name: "Puddle (Ko'lmak)", category: "organic" },
];

const PRESET_COLORS = [
  { label: "Standart", value: "" },
  { label: "Yalpiz", value: "#b6ef88" },
  { label: "Pushti", value: "#ff8fa3" },
  { label: "Moviy", value: "#82caff" },
  { label: "Quyosh", value: "#ffd84d" },
  { label: "Binafsha", value: "#c995ff" },
  { label: "Apelsin", value: "#ff9b42" },
  { label: "Qor", value: "#fffef8" },
  { label: "Grafit", value: "#525252" },
];

export default function AvatarsPreview({ onNavigate, theme, toggleTheme }: PageProps) {
  // Playground State
  const [selectedType, setSelectedType] = useState<BotType>("clover");
  const [selectedState, setSelectedState] = useState<BotState>("default");
  const [selectedFace, setSelectedFace] = useState<"eyes" | "mouth">("mouth");
  const [size, setSize] = useState<number>(84);
  const [customColor, setCustomColor] = useState<string>("");
  const [seed, setSeed] = useState<number>(0.35);
  const [paused, setPaused] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Gallery filters
  const [categoryFilter, setCategoryFilter] = useState<"all" | "geometric" | "character" | "organic">("all");
  const [galleryGlobalState, setGalleryGlobalState] = useState<BotState>("default");
  const [galleryFace, setGalleryFace] = useState<"eyes" | "mouth">("eyes");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBots = ALL_BOT_TYPES.filter((bot) => {
    const matchesCategory = categoryFilter === "all" || bot.category === categoryFilter;
    const matchesSearch = bot.type.toLowerCase().includes(searchQuery.toLowerCase()) || bot.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const generateCodeSnippet = () => {
    const props: string[] = [`type="${selectedType}"`];
    if (selectedState !== "default") props.push(`state="${selectedState}"`);
    if (size !== 64) props.push(`size={${size}}`);
    if (selectedFace !== "eyes") props.push(`face="${selectedFace}"`);
    if (customColor) props.push(`color="${customColor}"`);
    if (seed !== 0) props.push(`seed={${seed}}`);
    if (paused) props.push(`paused={true}`);

    return `<PaperBotAvatar\n  ${props.join("\n  ")}\n/>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRandomize = () => {
    const randomBot = ALL_BOT_TYPES[Math.floor(Math.random() * ALL_BOT_TYPES.length)].type;
    const states: BotState[] = ["default", "working", "sleeping"];
    const randomState = states[Math.floor(Math.random() * states.length)];
    const faces: ("eyes" | "mouth")[] = ["eyes", "mouth"];
    const randomFace = faces[Math.floor(Math.random() * faces.length)];
    const randomSeed = Math.round(Math.random() * 100) / 100;

    setSelectedType(randomBot);
    setSelectedState(randomState);
    setSelectedFace(randomFace);
    setSeed(randomSeed);
  };

  return (
    <div className="reading-paper-container min-h-screen flex flex-col bg-[var(--paper)] text-[var(--paper-ink)] pb-16">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-3 border-[var(--paper-ink)] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="paper-btn paper-btn-out paper-btn-sm gap-1.5 font-black text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Bosh sahifaga</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl border-2 border-[var(--paper-ink)] bg-[var(--paper-y)] flex items-center justify-center font-black text-lg shadow-[2px_2px_0_var(--paper-ink)]">
              🤖
            </div>
            <div>
              <h1 className="font-black text-base sm:text-lg leading-tight tracking-tight">
                Paper Bot Avatarlar Preview
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-[var(--paper-mut)] -mt-0.5">
                Vaqtincha ko'rish sahifasi (18 ta avatar shakli)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex px-2.5 py-1 text-xs font-black rounded-lg bg-[var(--paper-p)] border border-[var(--paper-ink)]">
            ⚡ Standalone SVG/CSS
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0"
            title="Rejimni almashtirish"
            aria-label="Rejimni almashtirish"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* NOTICE BANNER */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5">
        <div className="border-2 border-[var(--paper-ink)] bg-[var(--paper-y)]/40 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm font-bold shadow-[4px_4px_0_var(--paper-ink)]">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎨</span>
            <div>
              <span className="font-black">Yangilangan versiya:</span> Ushbu avatarlar{" "}
              <code className="text-xs bg-[var(--paper)] px-1.5 py-0.5 rounded border border-[var(--paper-ink)]">
                paper-bot-avatars (2).zip
              </code>{" "}
              ichidagi eng so'nggi SVG/CSS paper-cutout to'plamidir.
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 font-black">
              ✓ 18 ta unikal idle sikli & squash-hover effekti
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-10">
        {/* 2. INTERACTIVE STUDIO / PLAYGROUND */}
        <section className="border-3 border-[var(--paper-ink)] rounded-3xl bg-[var(--paper-card)] shadow-[6px_6px_0_var(--paper-ink)] overflow-hidden">
          <div className="border-b-3 border-[var(--paper-ink)] bg-[var(--paper-b)]/20 px-5 py-3.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[var(--paper-ink)]" />
              <h2 className="font-black text-lg tracking-tight">Interaktiv Sinov Studiyasi (Playground)</h2>
            </div>
            <button
              type="button"
              onClick={handleRandomize}
              className="paper-btn paper-btn-out paper-btn-sm text-xs font-black gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tasodifiy avatar
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-3 lg:divide-y-0 lg:divide-x-3 divide-[var(--paper-ink)]">
            {/* Live Preview Canvas */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col items-center justify-center bg-[var(--paper)] relative overflow-hidden min-h-[320px]">
              {/* Background dot pattern */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(var(--paper-ink) 1.5px, transparent 1.5px)",
                  backgroundSize: "16px 16px",
                }}
              />

              <div className="relative z-10 flex flex-col items-center">
                <div className="p-8 rounded-3xl border-2 border-dashed border-[var(--paper-ink)]/50 bg-[var(--paper-card)]/60 flex items-center justify-center min-w-[200px] min-h-[200px] shadow-inner transition-all">
                  <PaperBotAvatar
                    type={selectedType}
                    state={selectedState}
                    face={selectedFace}
                    size={size}
                    color={customColor || undefined}
                    seed={seed}
                    paused={paused}
                    interactive={true}
                  />
                </div>

                <div className="mt-4 text-center">
                  <span className="font-black text-sm uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--paper-y)] border border-[var(--paper-ink)]">
                    {selectedType} • {selectedState}
                  </span>
                  <p className="text-xs font-bold text-[var(--paper-mut)] mt-2">
                    💡 Ustiga sichqonchani olib boring (squash effekti) yoki bosing (sakraydi)!
                  </p>
                </div>
              </div>
            </div>

            {/* Customizer Controls */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-5 bg-[var(--paper-card)]">
              {/* Type Select */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  1. Avatar Shakli ({ALL_BOT_TYPES.length} ta variant):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border-2 border-[var(--paper-ink)] rounded-xl bg-[var(--paper)]">
                  {ALL_BOT_TYPES.map((bot) => (
                    <button
                      key={bot.type}
                      type="button"
                      onClick={() => setSelectedType(bot.type)}
                      className={`px-2.5 py-1 text-xs font-black rounded-lg border transition-all ${
                        selectedType === bot.type
                          ? "bg-[var(--paper-o)] text-white border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)]"
                          : "border-transparent hover:border-[var(--paper-ink)] hover:bg-[var(--paper-b)]/20"
                      }`}
                    >
                      {bot.type}
                    </button>
                  ))}
                </div>
              </div>

              {/* State and Face Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5">
                    2. Holati (State):
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["default", "working", "sleeping"] as BotState[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedState(st)}
                        className={`py-1.5 px-2 text-xs font-black rounded-xl border-2 capitalize transition-all ${
                          selectedState === st
                            ? "bg-[var(--paper-g)] text-[var(--paper-ink)] border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)] font-black"
                            : "border-[var(--paper-ink)]/30 hover:border-[var(--paper-ink)] bg-[var(--paper)]"
                        }`}
                      >
                        {st === "default" ? "Oddiy" : st === "working" ? "Ishlamoqda" : "Uyquda"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Face */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5">
                    3. Yuz ifodasi (Face):
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedFace("eyes")}
                      className={`py-1.5 px-2 text-xs font-black rounded-xl border-2 flex items-center justify-center gap-1.5 transition-all ${
                        selectedFace === "eyes"
                          ? "bg-[var(--paper-b)] text-[var(--paper-ink)] border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)] font-black"
                          : "border-[var(--paper-ink)]/30 hover:border-[var(--paper-ink)] bg-[var(--paper)]"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Faqat ko'z
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFace("mouth")}
                      className={`py-1.5 px-2 text-xs font-black rounded-xl border-2 flex items-center justify-center gap-1.5 transition-all ${
                        selectedFace === "mouth"
                          ? "bg-[var(--paper-b)] text-[var(--paper-ink)] border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)] font-black"
                          : "border-[var(--paper-ink)]/30 hover:border-[var(--paper-ink)] bg-[var(--paper)]"
                      }`}
                    >
                      <Smile className="w-3.5 h-3.5" />
                      Og'iz bilan
                    </button>
                  </div>
                </div>
              </div>

              {/* Size Slider & Color Preset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Size */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-black uppercase tracking-wider">
                      4. O'lchami: {size}px
                    </label>
                  </div>
                  <input
                    type="range"
                    min="36"
                    max="140"
                    step="4"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full accent-[var(--paper-o)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-[var(--paper-mut)]">
                    <span>36px (kichik)</span>
                    <span>84px (standart)</span>
                    <span>140px (katta)</span>
                  </div>
                </div>

                {/* Animation Pause */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5">
                    5. Animatsiya:
                  </label>
                  <button
                    type="button"
                    onClick={() => setPaused(!paused)}
                    className={`w-full py-1.5 px-3 text-xs font-black rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                      paused
                        ? "bg-amber-100 text-amber-900 border-[var(--paper-ink)]"
                        : "bg-[var(--paper-p)] text-[var(--paper-ink)] border-[var(--paper-ink)]"
                    }`}
                  >
                    {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    {paused ? "Pauzada (Davom ettirish)" : "Harakatlanmoqda (To'xtatish)"}
                  </button>
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1.5">
                  6. Rang palitrasi:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setCustomColor(c.value)}
                      className={`px-2 py-1 text-xs font-bold rounded-lg border-2 flex items-center gap-1.5 transition-all ${
                        customColor === c.value
                          ? "border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)] scale-105"
                          : "border-transparent hover:border-[var(--paper-ink)]/50"
                      }`}
                      style={{
                        backgroundColor: c.value || "var(--paper)",
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: c.value || "#bbb" }} />
                      <span className="text-[11px] font-black">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generated Code Bar */}
          <div className="border-t-3 border-[var(--paper-ink)] bg-slate-900 text-slate-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="font-mono text-xs overflow-x-auto w-full sm:w-auto">
              <span className="text-pink-400 font-bold">&lt;PaperBotAvatar</span>{" "}
              <span className="text-sky-300">type</span>=<span className="text-amber-300">"{selectedType}"</span>{" "}
              {selectedState !== "default" && (
                <>
                  <span className="text-sky-300">state</span>=<span className="text-amber-300">"{selectedState}"</span>{" "}
                </>
              )}
              {selectedFace !== "eyes" && (
                <>
                  <span className="text-sky-300">face</span>=<span className="text-amber-300">"{selectedFace}"</span>{" "}
                </>
              )}
              {size !== 64 && (
                <>
                  <span className="text-sky-300">size</span>={<span className="text-emerald-400">{size}</span>}{" "}
                </>
              )}
              {customColor && (
                <>
                  <span className="text-sky-300">color</span>=<span className="text-amber-300">"{customColor}"</span>{" "}
                </>
              )}
              <span className="text-pink-400 font-bold">/&gt;</span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 font-black text-xs flex items-center gap-1.5 hover:bg-slate-200 active:scale-95 transition-all shadow shrink-0"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? "Nusxalandi!" : "Kodni nusxalash"}
            </button>
          </div>
        </section>

        {/* 3. FULL 18 AVATARS GALLERY */}
        <section className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--paper-o)]" />
                <h2 className="font-black text-xl sm:text-2xl tracking-tight">
                  Barcha 18 ta Avatar Galereyasi
                </h2>
              </div>
              <p className="text-xs font-bold text-[var(--paper-mut)] mt-0.5">
                Istalgan avatarni tanlash uchun ustiga bosing — yuqoridagi studiyada ochiladi
              </p>
            </div>

            {/* Global Gallery State Switcher */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black uppercase text-[var(--paper-mut)] mr-1">
                Galereya holati:
              </span>
              {(["default", "working", "sleeping"] as BotState[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setGalleryGlobalState(st)}
                  className={`px-2.5 py-1 text-xs font-black rounded-lg border-2 capitalize transition-all ${
                    galleryGlobalState === st
                      ? "bg-[var(--paper-ink)] text-[var(--paper)] border-[var(--paper-ink)]"
                      : "bg-[var(--paper)] border-[var(--paper-ink)]/30 hover:border-[var(--paper-ink)]"
                  }`}
                >
                  {st === "default" ? "Oddiy" : st === "working" ? "Ishlash" : "Uyqu"}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setGalleryFace(galleryFace === "eyes" ? "mouth" : "eyes")}
                className={`px-2.5 py-1 text-xs font-black rounded-lg border-2 transition-all ${
                  galleryFace === "mouth"
                    ? "bg-[var(--paper-o)] text-white border-[var(--paper-ink)]"
                    : "bg-[var(--paper)] border-[var(--paper-ink)]/30 hover:border-[var(--paper-ink)]"
                }`}
              >
                {galleryFace === "mouth" ? "Og'iz bilan: ON" : "Og'iz bilan: OFF"}
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "Hammasi (18)" },
              { id: "organic", label: "Tabiat & Organik (8)" },
              { id: "character", label: "Qahramon & Robotlar (5)" },
              { id: "geometric", label: "Geometrik shakllar (5)" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-3 py-1 text-xs font-black rounded-xl border-2 transition-all ${
                  categoryFilter === cat.id
                    ? "bg-[var(--paper-y)] text-[var(--paper-ink)] border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)]"
                    : "border-[var(--paper-ink)]/30 hover:border-[var(--paper-ink)] bg-[var(--paper)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredBots.map((bot, index) => {
              const isSelected = selectedType === bot.type;
              return (
                <div
                  key={bot.type}
                  onClick={() => {
                    setSelectedType(bot.type);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                  className={`border-2 rounded-2xl p-4 flex flex-col items-center justify-between text-center cursor-pointer transition-all hover:scale-105 group relative ${
                    isSelected
                      ? "border-[var(--paper-ink)] bg-[var(--paper-y)]/40 shadow-[4px_4px_0_var(--paper-ink)] ring-2 ring-[var(--paper-o)]"
                      : "border-[var(--paper-ink)] bg-[var(--paper-card)] hover:border-[var(--paper-ink)] hover:shadow-[3px_3px_0_var(--paper-ink)]"
                  }`}
                >
                  <div className="w-full flex justify-end">
                    <span className="text-[9px] font-black uppercase text-[var(--paper-mut)]">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="my-2 p-2">
                    <PaperBotAvatar
                      type={bot.type}
                      state={galleryGlobalState}
                      face={galleryFace}
                      size={60}
                      seed={index * 0.05}
                    />
                  </div>

                  <div className="w-full pt-2 border-t border-[var(--paper-ink)]/20">
                    <div className="font-black text-xs text-[var(--paper-ink)] truncate">
                      {bot.type}
                    </div>
                    <div className="text-[10px] font-bold text-[var(--paper-mut)] truncate">
                      {bot.name.split(" ")[0]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. COMPARISON MATRIX (STATES OVERVIEW) */}
        <section className="border-3 border-[var(--paper-ink)] rounded-3xl bg-[var(--paper-card)] p-5 sm:p-6 shadow-[5px_5px_0_var(--paper-ink)] space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[var(--paper-b)]" />
            <h3 className="font-black text-lg tracking-tight">Holatlar taqqosi (States & Expressions)</h3>
          </div>
          <p className="text-xs font-bold text-[var(--paper-mut)]">
            Har bir avatar turi 3 xil holat (Oddiy, Ishlamoqda tebranuvchi va Uyqudagi Zzz) hamda tabassum og'iz ifodasini qo'llab-quvvatlaydi:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-[var(--paper-ink)] bg-[var(--paper)]">
                  <th className="p-3 font-black">Avatar</th>
                  <th className="p-3 font-black text-center">1. Default (Oddiy)</th>
                  <th className="p-3 font-black text-center">2. Working (Ish jarayoni)</th>
                  <th className="p-3 font-black text-center">3. Sleeping (Uyqu)</th>
                  <th className="p-3 font-black text-center">4. Mouth (Tabassum)</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b border-[var(--paper-ink)]/30 font-bold">
                {(["star", "clover", "droid", "cat", "ghost", "mech"] as BotType[]).map((type) => (
                  <tr key={type} className="hover:bg-[var(--paper-y)]/10 transition-colors">
                    <td className="p-3 font-black capitalize flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--paper-o)]"></span>
                      {type}
                    </td>
                    <td className="p-3 text-center">
                      <PaperBotAvatar type={type} state="default" size={44} />
                    </td>
                    <td className="p-3 text-center">
                      <PaperBotAvatar type={type} state="working" size={44} />
                    </td>
                    <td className="p-3 text-center">
                      <PaperBotAvatar type={type} state="sleeping" size={44} />
                    </td>
                    <td className="p-3 text-center">
                      <PaperBotAvatar type={type} state="default" face="mouth" size={44} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. QUICK USAGE INSTRUCTIONS */}
        <section className="border-2 border-dashed border-[var(--paper-ink)] rounded-2xl p-5 bg-[var(--paper-p)]/20 space-y-3">
          <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
            <span>📦</span> MockAI loyihasida ishlatish bo'yicha qo'llanma:
          </h3>
          <div className="bg-[var(--paper)] border-2 border-[var(--paper-ink)] rounded-xl p-4 font-mono text-xs overflow-x-auto text-[var(--paper-ink)]">
            <span className="text-[var(--paper-mut)]">// 1. Import qilish:</span><br />
            import &#123; PaperBotAvatar &#125; from '../components/paper-bot-avatars/PaperBotAvatar';<br />
            import '../components/paper-bot-avatars/paper-bot-avatars.css';<br /><br />
            <span className="text-[var(--paper-mut)]">// 2. CEFR AI Speaking yoki Listening da ishlatish:</span><br />
            &lt;PaperBotAvatar type="star" state="working" face="mouth" size=&#123;64&#125; /&gt;
          </div>
        </section>
      </main>
    </div>
  );
}

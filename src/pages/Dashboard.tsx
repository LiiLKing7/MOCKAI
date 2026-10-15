import { useState, useEffect } from "react";
import { PageProps } from "../App";
import { BilimIcon } from "../components/ui/bilim-icon";
import { MockAiLogo } from "../components/MockAiLogo";
import { PaperFlame } from "../components/PaperFlame";
import { AvatarCharacter, celebrateActiveAvatars } from "../components/AvatarCharacter";
import {
  getActiveUser,
  getTestHistory,
  UserProfileData,
  TestResultRecord,
} from "../lib/storage";

export default function Dashboard({ onNavigate }: PageProps) {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [testHistory, setTestHistory] = useState<TestResultRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "reading" | "listening" | "speaking" | "grammar">("all");

  useEffect(() => {
    setUser(getActiveUser());
    setTestHistory(getTestHistory());
  }, []);

  const [dailyTasks, setDailyTasks] = useState([
    {
      id: 1,
      title: "Salomlashishni takrorlash (Speaking Part 1)",
      time: "5 daqiqa · Og'zaki kirish",
      xp: "+10 XP",
      done: true,
      icon: "quiz",
    },
    {
      id: 2,
      title: "10 ta yangi so'z (Academic B2/C1 Vocabulary)",
      time: "8 daqiqa · Lug'at boyligi",
      xp: "+20 XP",
      done: true,
      icon: "book",
    },
    {
      id: 3,
      title: "Mini test topshirish (Reading Gap Fill)",
      time: "10 daqiqa · Tezkor sinov",
      xp: "+30 XP",
      done: true,
      icon: "target",
    },
  ]);

  const toggleTask = (id: number) => {
    setDailyTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextDone = !t.done;
          if (nextDone) {
            celebrateActiveAvatars(18);
          }
          return { ...t, done: nextDone };
        }
        return t;
      })
    );
  };

  const completedTasksCount = dailyTasks.filter((t) => t.done).length;
  const tasksPercent = Math.round((completedTasksCount / dailyTasks.length) * 100);

  const scrollToHistory = (filterKey?: string) => {
    if (filterKey && ["reading", "listening", "speaking", "grammar"].includes(filterKey)) {
      setSelectedFilter(filterKey as any);
    }
    const el = document.getElementById("history-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 4 SKILL CARDS WITH SECOND.HTML UI KIT (TUGMALAR VA BELGILAR):
  // - Reading: latest 67 ball (C1), record 67 ball -> Flame ONLY next to 67!
  // - Speaking: latest 19 ball (A2), record 50 ball (B2) -> Flame ONLY next to 50 in record badge!
  // - Listening: latest 58 ball (B2), record 62 ball (B2+) -> Flame ONLY next to 62 in record badge!
  // - Writing & Grammar: latest 64 ball (B2+), record 64 ball -> Flame ONLY next to 64!
  // ZERO FLAMES ON BUTTONS. ZERO FLAMES IN BANNER.
  const skillCards = [
    {
      key: "reading",
      title: "Reading",
      icon: "book",
      cardBg: "bg-[#eaf4ff]",
      btnClass: "btn blue",
      btnText: "Boshlash →",
      latestScore: 67,
      total: 75,
      recordScore: 67,
      level: "C1",
      levelBadgeClass: "badge bb",
      isLatestRecord: true,
      percentage: 89,
      blobRadius: "47% 53% 40% 60% / 56% 40% 60% 44%",
      blobRotate: "-3deg",
      targetView: "reading" as const,
    },
    {
      key: "listening",
      title: "Listening",
      icon: "cap",
      cardBg: "bg-[#f5eeff]",
      btnClass: "btn purple",
      btnText: "Davom etish →",
      latestScore: 58,
      total: 75,
      recordScore: 62,
      level: "B2",
      levelBadgeClass: "badge purple",
      isLatestRecord: false,
      percentage: 77,
      blobRadius: "40% 60% 53% 47% / 47% 53% 40% 60%",
      blobRotate: "2deg",
      targetView: "listening" as const,
    },
    {
      key: "speaking",
      title: "Speaking AI",
      icon: "quiz",
      cardBg: "bg-[#edfae4]",
      btnClass: "btn green",
      btnText: "Boshlash →",
      latestScore: 19,
      total: 75,
      recordScore: 50,
      level: "A2",
      levelBadgeClass: "badge bg",
      isLatestRecord: false, // 19 is latest, 50 was the record!
      percentage: 25,
      blobRadius: "53% 47% 60% 40% / 44% 56% 47% 53%",
      blobRotate: "-2deg",
      targetView: "speaking" as const,
    },
    {
      key: "grammar",
      title: "Writing & Grammar",
      icon: "pencil",
      cardBg: "bg-[#fffbe8]",
      btnClass: "btn gold",
      btnText: "Boshlash →",
      latestScore: 64,
      total: 75,
      recordScore: 64,
      level: "B2+",
      levelBadgeClass: "badge by",
      isLatestRecord: true,
      percentage: 85,
      blobRadius: "35% 65% 44% 56% / 56% 36% 64% 44%",
      blobRotate: "3deg",
      targetView: "grammar" as const,
    },
  ];

  const filteredHistory = testHistory.filter((t) => {
    if (selectedFilter === "all") return true;
    return t.testType === selectedFilter;
  });

  return (
    <div className="reading-paper-container w-full min-h-screen bg-[var(--paper)] text-[var(--paper-ink)] flex flex-col select-none">
      {/* 1. TOP NAVBAR: Left strictly MockAi Logo (NO subtitle), EMPTY CENTER, Right ONLY User Profile */}
      <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-[3px] border-[var(--paper-ink)] px-3 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Left: Standard 3D Paper MockAi Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="cursor-pointer"
        >
          <MockAiLogo size={42} withText={true} textSize="md" />
        </div>

        {/* Center: COMPLETELY EMPTY PER USER REQUIREMENT */}
        <div className="hidden md:block flex-1"></div>

        {/* Right: ONLY User Profile with name and level badge (no avatar) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("profile")}
            className="btn out sm gap-2"
            title="O'quv Jildi va Shaxsiy Profil"
          >
            <span className="font-black text-xs sm:text-sm text-[var(--paper-ink)] max-w-[140px] truncate">
              {user?.fullName || "O'quvchi"}
            </span>
            <span className="badge bp text-[10px] px-1.5 py-0.5">
              {user?.targetLevel || "B2"}
            </span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE: Fits screen tightly (5-10px margins) */}
      <main className="w-full flex-1 px-2.5 sm:px-4 md:px-6 py-4 space-y-5">
        {/* 2. TOP UNIFIED MASTER HERO CARD: KABINET WELCOME + FAOLLIK SERIYASI + KUNLIK VAZIFALAR */}
        <section aria-label="Boshqaruv paneli, Seriya va Kunlik vazifalar">
          <div className="paper-box overflow-hidden bg-[var(--paper-card)] shadow-[6px_6px_0_var(--paper-ink)] rounded-2xl">
            {/* TOP BAR: WELCOME BANNER WITH AVATAR ON LEFT & CLEAN TITLE/ACTION (MATCHING IMAGE 1) */}
            <div className="p-4 sm:p-5 bg-[var(--paper-card)] border-b-[3px] border-[var(--paper-ink)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                {/* Circular Avatar on Left */}
                <div
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-[3px] border-[var(--paper-ink)] bg-[#ffdcd6] shadow-[3px_3px_0_var(--paper-ink)] flex items-center justify-center shrink-0 relative cursor-pointer"
                  onClick={() => onNavigate("profile")}
                  title="Profilni tahrirlash"
                >
                  <AvatarCharacter
                    avatarId={user?.avatarId || "jasur"}
                    size={68}
                    showShadow={false}
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--paper-ink)] m-0 tracking-tight leading-tight">
                    Xush kelibsiz, <span className="scr">{user?.fullName || "Google Foydalanuvchi"}</span>!
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-[var(--paper-mut)] m-0 mt-1 flex items-center gap-2 flex-wrap">
                    <span>
                      Maqsadingiz: <b className="text-[var(--paper-ink)]">{user?.targetLevel || "B2"} daraja</b>
                    </span>
                    <span className="text-[var(--paper-o)] font-black">•</span>
                    <span>Rasmiy CEFR ko'nikmalari va AI eksport tahlili</span>
                  </p>
                </div>
              </div>

              {/* ONLY Yangi Mock Testni Boshlash button per Image 1 (cross out on second button) */}
              <button
                type="button"
                onClick={() => onNavigate("reading")}
                className="btn orange text-xs sm:text-sm font-black px-5 py-3 shadow-[3px_3px_0_#1a1a1a] whitespace-nowrap self-start md:self-auto flex-shrink-0"
              >
                Yangi Mock Testni Boshlash →
              </button>
            </div>

            {/* BOTTOM SECTION: 2-COLUMN SPLIT (SERIYA ON LEFT, KUNLIK VAZIFALAR ON RIGHT) */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* LEFT COLUMN: VIBRANT ORANGE FAOLLIK SERIYASI (6 COLS) */}
              <div
                className="lg:col-span-6 p-5 sm:p-6 text-white flex flex-col justify-between border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-[var(--paper-ink)]"
                style={{ backgroundColor: "var(--paper-o)" }}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="badge by font-black uppercase text-[10px] px-2.5 py-1 text-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a]">
                      FAOLLIK SERIYASI
                    </span>
                    <div className="filter drop-shadow-md">
                      <PaperFlame size={36} isRecord={true} />
                    </div>
                  </div>

                  <h2 className="text-2xl font-black text-white m-0 tracking-tight">
                    Seriya
                  </h2>
                  <p className="text-xs text-[#ffe7dc] font-bold mt-1 m-0">
                    Har kuni o'qishda davom eting
                  </p>

                  <div className="sn my-3">
                    12 <small className="text-base font-bold text-[#ffe7dc]">kun ketma-ket</small>
                  </div>
                </div>

                {/* 7-DAY WEEKLY ACTIVITY TRACKER */}
                <div className="week pt-4 border-t border-white/20">
                  <div className="day d">
                    <i>✓</i>
                    <span>Du</span>
                  </div>
                  <div className="day d">
                    <i>✓</i>
                    <span>Se</span>
                  </div>
                  <div className="day d">
                    <i>✓</i>
                    <span>Ch</span>
                  </div>
                  <div className="day d">
                    <i>✓</i>
                    <span>Pa</span>
                  </div>
                  <div className="day t">
                    <i>•</i>
                    <span>Ju</span>
                  </div>
                  <div className="day">
                    <i></i>
                    <span>Sha</span>
                  </div>
                  <div className="day">
                    <i></i>
                    <span>Ya</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: KUNLIK VAZIFALAR (MATCHING IMAGE 2) */}
              <div className="lg:col-span-6 p-5 sm:p-6 bg-[var(--paper-card)] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[var(--paper-ink)] m-0">
                        Kunlik vazifalar
                      </h3>
                      <p className="text-xs font-bold text-[var(--paper-mut)] m-0 mt-0.5">
                        Bugungi vazifalarni yakunlang va qo'shimcha XP yig'ing
                      </p>
                    </div>
                    <span className="badge bg font-black text-xs px-3 py-1 shadow-[1.5px_1.5px_0_#1a1a1a]">
                      {completedTasksCount}/{dailyTasks.length} bajarildi
                    </span>
                  </div>

                  <div className="space-y-1">
                    {dailyTasks.map((task, tIdx) => (
                      <div
                        key={task.id}
                        className={`task py-2.5 flex items-center gap-3 ${
                          task.done ? "done" : ""
                        } ${
                          tIdx === dailyTasks.length - 1
                            ? "border-0"
                            : "border-b-2 border-dashed border-[var(--paper-line)]"
                        }`}
                      >
                        <label className="chk shrink-0">
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={() => toggleTask(task.id)}
                            aria-label={task.title}
                          />
                        </label>
                        <div className="w-10 h-10 border-[2.5px] border-[#1a1a1a] rounded-[10px] bg-white shadow-[2px_2px_0_#1a1a1a] flex items-center justify-center shrink-0">
                          <BilimIcon name={task.icon} size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <b
                            className={`text-sm font-black truncate block ${
                              task.done ? "line-through text-[var(--paper-mut)]" : "text-[var(--paper-ink)]"
                            }`}
                          >
                            {task.title}
                          </b>
                          <small className="text-xs font-bold text-[var(--paper-mut)] flex items-center gap-1.5 mt-0.5">
                            <BilimIcon name="clock" size={13} />
                            <span>{task.time}</span>
                          </small>
                        </div>
                        <span className="badge bg text-xs font-black px-2.5 py-1 shadow-[1.5px_1.5px_0_#1a1a1a] shrink-0">
                          {task.xp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Progress Bar: Reflects tasks completion (Image 2) */}
                <div className="mt-4 pt-3 border-t-2 border-[var(--paper-ink)]/10">
                  <div className="flex justify-between text-xs font-black text-[var(--paper-ink)] mb-1.5">
                    <span>Kunlik progress</span>
                    <span>{tasksPercent}%</span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${tasksPercent}%` }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. THE 4 SKILL CARDS WITH NATIVE SECOND.HTML PAPER-BOX & CLEAN METRICS */}
        <section aria-label="Ko'nikmalar va Natijalar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {skillCards.map((card, idx) => {
              return (
                <div
                  key={card.key}
                  className={`paper-box p-4 sm:p-5 ${card.cardBg} flex flex-col justify-between transition-transform min-h-[250px] ${
                    idx % 2 === 1 ? "paper-box-alt" : ""
                  }`}
                >
                  {/* Card Header: Blob Icon + Title + CEFR Level Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        {/* ORGANIC PAPER BLOB FOR SKILL ICON */}
                        <div
                          className="paper-icon-blob"
                          style={{
                            borderRadius: card.blobRadius,
                            transform: `rotate(${card.blobRotate})`,
                          }}
                        >
                          <BilimIcon name={card.icon} size={22} />
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-[var(--paper-ink)] leading-tight">
                          {card.title}
                        </h2>
                      </div>

                      <span className={`${card.levelBadgeClass} text-xs font-black`}>
                        {card.level}
                      </span>
                    </div>

                    {/* SCORE SECTION: 67 + Fire + / 75 ball + Rekord Badge directly in this line! */}
                    <div className="pt-2 pb-1 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--paper-mut)] block">
                        Oxirgi natija:
                      </span>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-3xl sm:text-4xl font-black text-[var(--paper-ink)] tracking-tight">
                          {card.latestScore}
                        </span>

                        {/* FLAME next to score if this score is the record! */}
                        {card.isLatestRecord && (
                          <div className="inline-flex items-center">
                            <PaperFlame size={26} isRecord={true} />
                          </div>
                        )}

                        <span className="text-xs font-bold text-[var(--paper-mut)] leading-none">
                          / {card.total} ball
                        </span>

                        {/* RECORD BADGE right on the score line next to / 75 ball! */}
                        <span className={`badge ${card.isLatestRecord ? "bp" : "by"} text-[11px] font-black gap-1 ml-auto`}>
                          {!card.isLatestRecord && (
                            <PaperFlame size={15} isRecord={false} />
                          )}
                          <span>Rekord: {card.recordScore} ball</span>
                        </span>
                      </div>
                    </div>

                    {/* SECOND.HTML NATIVE PROGRESS BAR */}
                    <div className="mt-2.5 space-y-1">
                      <div className="flex justify-between text-[11px] font-black text-[var(--paper-ink)]">
                        <span>O'zlashtirish</span>
                        <span>{card.percentage}%</span>
                      </div>
                      <div className="paper-progress-bar h-3.5 bg-white">
                        <div
                          className="paper-progress-fill bg-[var(--paper-o)]"
                          style={{ width: `${card.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTON & GHOST TEXT LINK FOR TARIX (NO 3D EFFECT) */}
                  <div className="mt-4 pt-3 border-t-2 border-[var(--paper-ink)]/15 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onNavigate(card.targetView)}
                      className={`${card.btnClass} flex-1 text-xs font-black py-2.5`}
                    >
                      {card.btnText}
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToHistory(card.key)}
                      className="paper-link-ghost whitespace-nowrap"
                      title="Natijalar tarixini ko'rish"
                    >
                      Tarix →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>



        {/* 4. MENING O'QUV JILDIM (TEST RESULTS & HISTORY SECTION) */}
        <section
          id="history-section"
          className="paper-box p-4 sm:p-6 bg-[var(--paper-card)] space-y-4"
        >
          {/* Header & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[var(--paper-ink)] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--paper-y)] border-2 border-[var(--paper-ink)] flex items-center justify-center">
                <BilimIcon name="book" size={18} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[var(--paper-ink)]">
                  Mening O'quv Jildim (Natijalar tarixi)
                </h3>
                <p className="text-[11px] font-bold text-[var(--paper-mut)] flex items-center gap-2 flex-wrap">
                  <span>Qurilmangizda saqlangan barcha mock test natijalari</span>
                  <span className="text-[10px] text-[var(--paper-mut)]">
                    Qidirish: <kbd>Ctrl</kbd><kbd>K</kbd>
                  </span>
                </p>
              </div>
            </div>

            {/* Filter buttons with second.html btn styles */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "all", label: `Barchasi (${testHistory.length})` },
                { id: "reading", label: "Reading" },
                { id: "listening", label: "Listening" },
                { id: "speaking", label: "Speaking" },
                { id: "grammar", label: "Grammar" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedFilter(tab.id as any)}
                  className={`btn sm text-xs font-black ${
                    selectedFilter === tab.id ? "gold" : "out"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* History List or Empty State */}
          {filteredHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="paper-box p-3.5 bg-[var(--paper)] flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="badge bp text-[10px] font-black uppercase tracking-wider">
                        {item.testType}
                      </span>
                      <span className="badge bg text-[11px] font-black">
                        ✓ {item.cefrLevel}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-[var(--paper-ink)] truncate" title={item.title}>
                      {item.title}
                    </h4>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-[var(--paper-ink)]">
                        {item.score} / {item.total} ball
                      </span>
                      <span className="text-xs font-extrabold text-[var(--paper-mut)]">
                        ({item.percentage}%)
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-[var(--paper-mut)] block">
                      {new Date(item.date).toLocaleDateString("uz-UZ", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate(item.testType)}
                    className="btn out sm w-full font-black text-center"
                  >
                    Qayta topshirish →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--paper-y)] border-2 border-[var(--paper-ink)] mx-auto flex items-center justify-center shadow-[3px_3px_0_var(--paper-ink)]">
                <BilimIcon name="book" size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-black text-[var(--paper-ink)]">
                  Hozircha natijalar mavjud emas
                </h4>
                <p className="text-xs font-bold text-[var(--paper-mut)] max-w-sm mx-auto">
                  Tepada ko'rsatilgan 4 ta ko'nikmadan birini tanlang va o'z CEFR darajangizni aniqlash uchun testni boshlang!
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* 5. MINIMAL CLEAN FOOTER */}
      <footer className="w-full border-t-[3px] border-[var(--paper-ink)] bg-[var(--paper-card)] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold text-[var(--paper-mut)]">
        <div className="flex items-center gap-2">
          <MockAiLogo size={22} />
          <span><b>MockAI</b> — Rasmiy CEFR Multilevel & IELTS AI Platformasi</span>
        </div>
        <span>© 2026 Mock AI. Barcha huquqlar himoyalangan.</span>
      </footer>
    </div>
  );
}

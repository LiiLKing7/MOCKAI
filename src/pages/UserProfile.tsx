import React, { useEffect, useState } from "react";
import { PageProps } from "../App";
import { BilimIcon } from "../components/ui/bilim-icon";
import { PaperFlame } from "../components/PaperFlame";
import { AvatarCharacter, AvatarId } from "../components/AvatarCharacter";
import {
  getActiveUser,
  updateUserProfile,
  logoutUser,
  getTestHistory,
  calculateStats,
  deleteTestResult,
  clearTestHistory,
  seedSampleTestHistory,
  exportAllCache,
  importAllCache,
  TestResultRecord,
  PlatformStats,
  UserProfileData,
} from "../lib/storage";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export default function UserProfile({ onNavigate }: PageProps) {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [history, setHistory] = useState<TestResultRecord[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalTests: 0,
    estimatedLevel: "B1",
    accuracy: 0,
    byType: { reading: 0, listening: 0, speaking: 0, grammar: 0 },
  });
  const [activeTab, setActiveTab] = useState<"all" | "reading" | "listening" | "speaking" | "grammar">("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editTargetLevel, setEditTargetLevel] = useState<"A1" | "A2" | "B1" | "B2" | "C1" | "C2">("B2");
  const [editGender, setEditGender] = useState<"male" | "female">("male");
  const [editAvatar, setEditAvatar] = useState<AvatarId>("jasur");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = () => {
    const active = getActiveUser();
    setUser(active);
    if (active) {
      setEditName(active.fullName);
      setEditTargetLevel(active.targetLevel);
      setEditGender(active.gender || "male");
      setEditAvatar((active.avatarId as AvatarId) || "jasur");
      const defaultUser = active.email
        ? `@${active.email.split("@")[0].toLowerCase()}`
        : `@${active.fullName.toLowerCase().replace(/\s+/g, ".")}`;
      setEditUsername(defaultUser);
    }
    const currentHistory = getTestHistory();
    setHistory(currentHistory);
    setStats(calculateStats());
  };

  useEffect(() => {
    loadData();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    const updated = updateUserProfile({
      fullName: editName.trim(),
      targetLevel: editTargetLevel,
      gender: editGender,
      avatarId: editAvatar,
    });
    if (updated) {
      setUser(updated);
      setIsEditing(false);
      showNotification("Profil ma'lumotlari keshga saqlandi!");
    }
  };

  const handleSignOut = () => {
    logoutUser();
  };

  const handleDeleteRecord = (id: string) => {
    deleteTestResult(id);
    loadData();
    showNotification("Test natijasi keshdan o'chirildi.");
  };

  const handleClearHistory = () => {
    if (window.confirm("Barcha testlar tarixini keshdan tozalashni tasdiqlaysizmi?")) {
      clearTestHistory();
      loadData();
      showNotification("Testlar tarixi tozalandi.");
    }
  };

  const handleLoadSampleData = () => {
    seedSampleTestHistory();
    loadData();
    showNotification("Namunaviy test natijalari keshga yuklandi!");
  };

  const handleExportData = () => {
    const jsonStr = exportAllCache();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cefr_cache_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("Kesh ma'lumotlari JSON fayl sifatida yuklab olindi.");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importAllCache(content)) {
        loadData();
        showNotification("Ma'lumotlar keshga muvaffaqiyatli tiklandi!");
      } else {
        alert("Faylni o'qishda xatolik yuz berdi. JSON formatini tekshiring.");
      }
    };
    reader.readAsText(file);
  };

  if (!user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#fdfcf0] p-4 font-sans">
        <div className="text-center space-y-4">
          <p className="font-black text-lg text-[#706f64]">Foydalanuvchi ma'lumotlari topilmadi.</p>
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="paper-btn-ui paper-btn-ui-yellow"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  const filteredHistory = history.filter((item) => {
    if (activeTab === "all") return true;
    return item.testType === activeTab;
  });

  const getTestIcon = (type: string) => {
    switch (type) {
      case "reading":
        return <BilimIcon name="book" size={20} />;
      case "listening":
        return <BilimIcon name="cap" size={20} />;
      case "speaking":
        return <BilimIcon name="quiz" size={20} />;
      case "grammar":
        return <BilimIcon name="pencil" size={20} />;
      default:
        return <BilimIcon name="target" size={20} />;
    }
  };

  // User initials for second.html organic avatar chip
  const userInitials = user.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("") || "U";

  return (
    <div className="w-full min-h-screen bg-[#fdfcf0] text-[#1a1a1a] flex flex-col font-sans select-none px-2.5 sm:px-5 py-4 space-y-5">
      {/* 1. TOP NAVIGATION HEADER: Fits full width */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border-[3px] border-[#1a1a1a] bg-[#fffef8] shadow-[4px_4px_0_#1a1a1a]">
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className="paper-btn-ui paper-btn-ui-white"
        >
          <BilimIcon name="home" size={18} />
          <span>Bosh sahifaga qaytish</span>
        </button>

        <div className="flex items-center gap-2.5">
          <span className="paper-badge-ui paper-badge-ui-green">
            <BilimIcon name="shield" size={16} />
            <span>Offline Kesh Xotira</span>
          </span>

          <button
            type="button"
            onClick={handleSignOut}
            className="paper-btn-ui paper-btn-ui-salmon"
          >
            <span>Chiqish</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {statusMessage && (
        <div className="p-3.5 bg-[#b6ef88] border-[2.5px] border-[#1a1a1a] text-[#1a1a1a] rounded-2xl text-sm font-black flex items-center gap-2 shadow-[3px_3px_0_#1a1a1a]">
          <BilimIcon name="check" size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. USER PROFILE HERO CARD: Character Avatar from avatars.html */}
      <div className="w-full p-5 sm:p-7 rounded-3xl border-[3.5px] border-[#1a1a1a] bg-[#fffef8] shadow-[6px_6px_0_#1a1a1a] flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start relative">
        {/* CHARACTER AVATAR: Unconstrained, free physics jump without clipping */}
        <div className="shrink-0 relative z-20 cursor-pointer" title={user.fullName}>
          <AvatarCharacter
            avatarId={user.avatarId || "jasur"}
            size={96}
            interactive={true}
          />
          <span className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-xl bg-[#ff5722] text-[#fffef8] text-xs font-black border-2 border-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a] transform rotate-3 z-30 pointer-events-none">
            {user.targetLevel}
          </span>
        </div>

        {/* Profile Info & Edit Button */}
        <div className="flex-1 space-y-4 text-center md:text-left w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight">
                {user.fullName}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                <span className="paper-badge-ui paper-badge-ui-yellow">
                  Maqsadli Daraja: {user.targetLevel}
                </span>
                <span className="paper-badge-ui paper-badge-ui-white">
                  Jinsi: {user.gender === "female" ? "Qiz bola" : "O'g'il bola"}
                </span>
                <span className="paper-badge-ui paper-badge-ui-white">
                  ID: {user.id.slice(0, 12)}...
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="paper-btn-ui paper-btn-ui-yellow self-center sm:self-start"
            >
              <BilimIcon name="pencil" size={16} />
              <span>Profilni tahrirlash</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t-2 border-[#1a1a1a]/20 text-xs sm:text-sm font-bold text-[#706f64]">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <BilimIcon name="user" size={16} />
              <span className="truncate">{user.email || user.fullName}</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <BilimIcon name="clock" size={16} />
              <span>{stats.totalTests} ta topshirilgan test</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECOND.HTML SHEET MODAL DRAWER (PROFILNI TAHRIRLASH) */}
      <div
        className={`shbg ${isEditing ? "open" : ""}`}
        onClick={() => setIsEditing(false)}
        aria-hidden={!isEditing}
      />
      <aside
        className={`sheet ${isEditing ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sht"
      >
        <div className="sh-h">
          <h2 id="sht">Profilni tahrirlash</h2>
          <p>Ma'lumotlaringizni o'zgartiring va tugagach saqlang.</p>
        </div>

        <form onSubmit={handleSaveProfile} className="flex flex-col flex-1 min-h-0">
          <div className="sh-p">
            <div>
              <label htmlFor="sn">Ism</label>
              <input
                id="sn"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Aziza Karimova"
                required
              />
            </div>

            <div>
              <label htmlFor="su">Foydalanuvchi nomi</label>
              <input
                id="su"
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="@aziza.karimova"
              />
            </div>

            <div>
              <label htmlFor="st">Maqsadli CEFR darajasi</label>
              <select
                id="st"
                value={editTargetLevel}
                onChange={(e) => setEditTargetLevel(e.target.value as any)}
              >
                {CEFR_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* JINSI VA AVATAR */}
            <div>
              <label>Jinsingiz va Avataringiz</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditGender("male");
                    if (editAvatar !== "jasur" && editAvatar !== "sardor") {
                      setEditAvatar("jasur");
                    }
                  }}
                  className={`p-2.5 rounded-xl border-[2.5px] border-[#1a1a1a] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    editGender === "male"
                      ? "bg-[#a8d9ff] text-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] -translate-y-0.5"
                      : "bg-[#fffef8] text-[#555] shadow-[1.5px_1.5px_0_#1a1a1a] hover:bg-[#f5f2e4]"
                  }`}
                >
                  <span className="text-base">👦</span>
                  <span>O'g'il bola</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditGender("female");
                    if (editAvatar !== "madina" && editAvatar !== "dilnoza") {
                      setEditAvatar("madina");
                    }
                  }}
                  className={`p-2.5 rounded-xl border-[2.5px] border-[#1a1a1a] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    editGender === "female"
                      ? "bg-[#ffd84d] text-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] -translate-y-0.5"
                      : "bg-[#fffef8] text-[#555] shadow-[1.5px_1.5px_0_#1a1a1a] hover:bg-[#f5f2e4]"
                  }`}
                >
                  <span className="text-base">👧</span>
                  <span>Qiz bola</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(editGender === "male"
                  ? (["jasur", "sardor"] as const)
                  : (["madina", "dilnoza"] as const)
                ).map((avaId) => {
                  const isSelected = editAvatar === avaId;
                  return (
                    <button
                      key={avaId}
                      type="button"
                      onClick={() => setEditAvatar(avaId)}
                      className={`p-3 rounded-2xl border-[3px] border-[#1a1a1a] flex flex-col items-center justify-center transition-all relative ${
                        isSelected
                          ? "bg-[#fff8d6] shadow-[4px_4px_0_#1a1a1a] scale-[1.03] ring-2 ring-[#ff5722]"
                          : "bg-[#fffef8] shadow-[2.5px_2.5px_0_#1a1a1a] hover:shadow-[3.5px_3.5px_0_#1a1a1a] hover:-translate-y-0.5 hover:bg-[#fffdf0]"
                      }`}
                    >
                      <AvatarCharacter avatarId={avaId} size={62} interactive={true} />
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#b6ef88] border-2 border-[#1a1a1a] flex items-center justify-center text-xs font-black text-[#1a1a1a] shadow-[1px_1px_0_#1a1a1a]">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="sh-f">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setIsEditing(false)}
            >
              Bekor qilish
            </button>
            <button type="submit" className="btn-save">
              Saqlash
            </button>
          </div>
        </form>
      </aside>

      {/* 3. DYNAMIC STATS (4 ASYMMETRIC SECOND.HTML CARDS WITH VIBRANT COLORS & PAPER FLAME) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Tests */}
        <div className="paper-stat-card bg-[#a8d9ff]">
          <div className="w-10 h-10 rounded-xl bg-[#fffef8] border-2 border-[#1a1a1a] flex items-center justify-center shadow-[2px_2px_0_#1a1a1a]">
            <BilimIcon name="book" size={24} />
          </div>
          <span className="text-2xl sm:text-4xl font-black text-[#1a1a1a] block leading-none">
            {stats.totalTests}
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a]/80">
            Bajarilgan testlar
          </span>
        </div>

        {/* Card 2: Level */}
        <div className="paper-stat-card bg-[#ffd84d]">
          <div className="w-10 h-10 rounded-xl bg-[#fffef8] border-2 border-[#1a1a1a] flex items-center justify-center shadow-[2px_2px_0_#1a1a1a]">
            <BilimIcon name="target" size={24} />
          </div>
          <span className="text-2xl sm:text-4xl font-black text-[#1a1a1a] block leading-none">
            {stats.estimatedLevel}
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a]/80">
            Hisoblangan daraja
          </span>
        </div>

        {/* Card 3: Accuracy */}
        <div className="paper-stat-card bg-[#b6ef88]">
          <div className="w-10 h-10 rounded-xl bg-[#fffef8] border-2 border-[#1a1a1a] flex items-center justify-center shadow-[2px_2px_0_#1a1a1a]">
            <BilimIcon name="trophy" size={24} />
          </div>
          <span className="text-2xl sm:text-4xl font-black text-[#1a1a1a] block leading-none">
            {stats.accuracy}%
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a]/80">
            O'rtacha aniqlik
          </span>
        </div>

        {/* Card 4: Paper Flame Active Streak */}
        <div className="paper-stat-card bg-[#d9c3ff]">
          <div className="w-10 h-10 rounded-xl bg-[#fffef8] border-2 border-[#1a1a1a] flex items-center justify-center shadow-[2px_2px_0_#1a1a1a]">
            <PaperFlame size={26} isRecord={stats.totalTests > 0} />
          </div>
          <span className="text-2xl sm:text-4xl font-black text-[#1a1a1a] block leading-none">
            {stats.totalTests > 0 ? "Aktiv" : "0"}
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a]/80">
            Kunlik olov faolligi
          </span>
        </div>
      </div>

      {/* 4. LEARNING FOLDER (MENING O'QUV JILDIM) WITH SECOND.HTML BUTTONS & TABS */}
      <div className="w-full p-4 sm:p-6 rounded-3xl border-[3.5px] border-[#1a1a1a] bg-[#fffef8] shadow-[6px_6px_0_#1a1a1a] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#1a1a1a]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffd84d] border-2 border-[#1a1a1a] flex items-center justify-center shadow-[2px_2px_0_#1a1a1a]">
              <BilimIcon name="book" size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#1a1a1a]">
                Mening O'quv Jildim (Kesh xotira)
              </h2>
              <p className="text-xs font-bold text-[#706f64]">
                Qurilmangiz keshida saqlangan barcha mock test natijalari
              </p>
            </div>
          </div>

          {/* Action buttons with second.html paper styles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="paper-btn-ui paper-btn-ui-yellow text-xs"
            >
              <BilimIcon name="star" size={14} />
              <span>Namunaviy natijalarni yuklash</span>
            </button>

            <button
              type="button"
              onClick={handleExportData}
              className="paper-btn-ui paper-btn-ui-white text-xs"
            >
              <span>Eksport (JSON)</span>
            </button>

            <label className="paper-btn-ui paper-btn-ui-white text-xs cursor-pointer">
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>

            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="paper-btn-ui paper-btn-ui-salmon text-xs"
                title="Barchasini tozalash"
              >
                <span>Tozalash</span>
              </button>
            )}
          </div>
        </div>

        {/* Asymmetrical second.html Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap border-b-2 border-[#1a1a1a] pb-1">
          {[
            { id: "all", label: `Barchasi (${history.length})` },
            { id: "reading", label: `Reading (${stats.byType.reading})` },
            { id: "listening", label: `Listening (${stats.byType.listening})` },
            { id: "speaking", label: `Speaking (${stats.byType.speaking})` },
            { id: "grammar", label: `Grammar (${stats.byType.grammar})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`paper-filter-tab ${activeTab === tab.id ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* History Results List */}
        {filteredHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border-[2.5px] border-[#1a1a1a] bg-[#fdfcf0] shadow-[4px_4px_0_#1a1a1a] flex flex-col justify-between gap-3 hover:-translate-y-1 transition-transform duration-150"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase text-[#1a1a1a]">
                      {getTestIcon(item.testType)}
                      <span>{item.testType}</span>
                    </span>

                    <span className="px-2.5 py-0.5 rounded-lg bg-[#b6ef88] border-[1.5px] border-[#1a1a1a] text-xs font-black shadow-[1px_1px_0_#1a1a1a]">
                      CEFR {item.cefrLevel}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#1a1a1a] line-clamp-1" title={item.title}>
                    {item.title}
                  </h3>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#1a1a1a]">
                      {item.score} / {item.total} ball
                    </span>
                    <span className="text-xs font-extrabold text-[#706f64]">
                      ({item.percentage}%)
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-[#706f64] block">
                    {new Date(item.date).toLocaleDateString("uz-UZ", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t-2 border-[#1a1a1a]/15">
                  <button
                    type="button"
                    onClick={() => onNavigate(item.testType)}
                    className="flex-1 py-1.5 px-3 rounded-xl border-2 border-[#1a1a1a] bg-[#ffd84d] hover:bg-[#ffc800] text-xs font-black text-center shadow-[2px_2px_0_#1a1a1a] transition-colors cursor-pointer"
                  >
                    Qayta topshirish →
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteRecord(item.id)}
                    className="p-1.5 rounded-xl border-2 border-[#1a1a1a] bg-[#fffef8] hover:bg-[#ff8f85] text-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a] transition-colors cursor-pointer"
                    title="O'chirish"
                  >
                    <BilimIcon name="close" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#ffd84d] border-[2.5px] border-[#1a1a1a] mx-auto flex items-center justify-center shadow-[3px_3px_0_#1a1a1a]">
              <BilimIcon name="book" size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#1a1a1a]">
                Ushbu bo'limda natijalar yo'q
              </h3>
              <p className="text-xs font-bold text-[#706f64] max-w-sm mx-auto">
                Bosh sahifaga o'ting va o'z ko'nikmalaringizni sinash uchun yangi test topshiring!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECOND.HTML ASYMMETRICAL BUTTONS & CHIPS STYLES */}
      <style>{`
        :root {
          --w1: 16px 10px 14px 9px / 10px 15px 9px 14px;
          --w2: 10px 16px 9px 14px / 15px 9px 14px 10px;
          --b1: 24px 17px 26px 16px / 17px 24px 16px 26px;
          --b2: 17px 25px 16px 23px / 25px 16px 24px 17px;
          --c1: 8% 92% 12% 88% / 87% 11% 89% 13%;
          --c2: 92% 8% 88% 12% / 11% 87% 13% 89%;
          --spring: cubic-bezier(.175, .885, .32, 1.275);
        }

        /* SECOND.HTML ASYMMETRIC ORGANIC AVATAR CHIP */
        .paper-organic-avatar {
          width: 90px;
          height: 90px;
          display: grid;
          place-items: center;
          background: #ffd84d;
          border: 3.5px solid #1a1a1a;
          border-radius: var(--c1);
          box-shadow: 4px 4px 0 #1a1a1a;
          font-size: 32px;
          font-weight: 1000;
          color: #1a1a1a;
          transform: rotate(-3deg);
          transition: transform .3s var(--spring), border-radius .3s;
        }
        .paper-organic-avatar:hover {
          transform: scale(1.08) rotate(3deg);
          border-radius: var(--c2);
          background: #ff5722;
          color: #fffef8;
        }

        /* SECOND.HTML STAT CARDS */
        .paper-stat-card {
          padding: 18px 14px;
          border: 3px solid #1a1a1a;
          border-radius: var(--b1);
          box-shadow: 4px 4px 0 #1a1a1a;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          transition: transform .25s var(--spring), border-radius .2s;
        }
        .paper-stat-card:nth-child(even) {
          border-radius: var(--b2);
        }
        .paper-stat-card:hover {
          transform: translateY(-3px) rotate(-1deg);
          border-radius: var(--b2);
        }

        /* SECOND.HTML BUTTONS (NOTEKIS / ASYMMETRICAL) */
        .paper-btn-ui {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 900;
          color: #1a1a1a;
          border: 2.5px solid #1a1a1a;
          border-radius: var(--w1);
          box-shadow: 3px 3px 0 #1a1a1a;
          rotate: -0.5deg;
          cursor: pointer;
          transition: transform .25s var(--spring), box-shadow .2s, border-radius .2s;
        }
        .paper-btn-ui:hover {
          transform: translateY(-2px) rotate(-1.5deg) scale(1.03);
          box-shadow: 5px 5px 0 #1a1a1a;
          border-radius: var(--w2);
        }
        .paper-btn-ui:active {
          transform: translate(2px, 2px) scale(0.97);
          box-shadow: 1px 1px 0 #1a1a1a;
        }

        .paper-btn-ui-yellow { background: #ffd84d; }
        .paper-btn-ui-white { background: #fffef8; }
        .paper-btn-ui-salmon { background: #ff8f85; }
        .paper-btn-ui-orange { background: #ff5722; color: #fff; }

        /* BADGES FROM SECOND.HTML */
        .paper-badge-ui {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 11px;
          border: 2px solid #1a1a1a;
          border-radius: var(--w1);
          rotate: -1.5deg;
          font-size: 12px;
          font-weight: 900;
          box-shadow: 2.5px 2.5px 0 #1a1a1a;
          transition: transform .28s var(--spring), box-shadow .2s, border-radius .3s;
        }
        .paper-badge-ui:nth-child(even) {
          rotate: 1.3deg;
        }
        .paper-badge-ui:hover {
          transform: scale(1.1) rotate(3deg);
          border-radius: var(--w2);
          box-shadow: 3.5px 3.5px 0 #1a1a1a;
        }
        .paper-badge-ui-green { background: #b6ef88; }
        .paper-badge-ui-yellow { background: #ffd84d; }
        .paper-badge-ui-white { background: #fffef8; color: #706f64; }

        /* TABS */
        .paper-filter-tab {
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 900;
          border: 2.5px solid transparent;
          border-radius: var(--w1);
          background: transparent;
          color: #706f64;
          cursor: pointer;
          transition: all .2s var(--spring);
        }
        .paper-filter-tab:hover {
          color: #1a1a1a;
          background: #f4f0df;
        }
        .paper-filter-tab.active {
          background: #ffd84d;
          color: #1a1a1a;
          border-color: #1a1a1a;
          border-radius: var(--w2);
          box-shadow: 2.5px 2.5px 0 #1a1a1a;
          transform: rotate(-0.8deg);
        }
      `}</style>
    </div>
  );
}

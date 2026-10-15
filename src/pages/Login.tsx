import React, { useState } from "react";
import { loginUser, loginAsGuest, getSavedProfiles, UserProfileData } from "../lib/storage";
import { IconicIcon } from "../components/IconicIcon";
import { MockAiLogo } from "../components/MockAiLogo";
import { AvatarCharacter, AvatarId } from "../components/AvatarCharacter";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("sarvarumrzaqov@gmail.com");
  const [password, setPassword] = useState("••••••••");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedProfiles] = useState<UserProfileData[]>(() => getSavedProfiles());

  const handleGenderChange = (newGender: "male" | "female") => {
    setGender(newGender);
    if (newGender === "female") {
      if (selectedAvatar !== "madina" && selectedAvatar !== "dilnoza") {
        setSelectedAvatar("madina");
      }
    } else {
      if (selectedAvatar !== "jasur" && selectedAvatar !== "sardor") {
        setSelectedAvatar("jasur");
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Email manzilingizni kiriting.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const nameGuess = email.split("@")[0].replace(/[._-]/g, " ") || "Foydalanuvchi";
      loginUser({
        fullName: nameGuess.charAt(0).toUpperCase() + nameGuess.slice(1),
        email: email.trim(),
        targetLevel: "B2",
        gender: gender || "male",
        avatarId: selectedAvatar || "jasur",
      });
      setLoading(false);
    }, 150);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("Ism va familiyangizni kiriting.");
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      showToast("Parollar bir-biriga mos kelmadi.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      loginUser({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        targetLevel: "B2",
        gender: gender || "male",
        avatarId: selectedAvatar || (gender === "female" ? "madina" : "jasur"),
      });
      setLoading(false);
    }, 150);
  };

  const handleSelectProfile = (profile: UserProfileData) => {
    setLoading(true);
    setTimeout(() => {
      loginUser({
        fullName: profile.fullName,
        email: profile.email,
        targetLevel: profile.targetLevel,
        avatarUrl: profile.avatarUrl,
        gender: profile.gender || gender || "male",
        avatarId: profile.avatarId || selectedAvatar || "jasur",
      });
      setLoading(false);
    }, 150);
  };

  const handleSocialLogin = (provider: "Google" | "Telegram" | "Guest") => {
    setLoading(true);
    setTimeout(() => {
      if (provider === "Guest") {
        loginAsGuest();
      } else {
        const socialEmail = `${provider.toLowerCase()}.user@mockai.uz`;
        loginUser({
          fullName: `${provider} Foydalanuvchi`,
          email: socialEmail,
          targetLevel: "B2",
          gender: gender || "male",
          avatarId: selectedAvatar || "jasur",
        });
      }
      setLoading(false);
    }, 150);
  };

  return (
    <div className="login-paper-root">
      <main className="shell">
        {/* LEFT PANEL: Clean intro with brand & paper exam card */}
        <section className="panel intro-panel" aria-label="Mock AI platformasi">
          {/* Brandbar: strictly Logo + MockAi (NO subtitle) */}
          <div className="brandbar">
            <div className="brand">
              <MockAiLogo size={44} withText={true} textSize="lg" />
            </div>
          </div>

          {/* Hero Body */}
          <div className="hero-body">
            <div className="hero-copy">
              <span className="eyebrow">
                <IconicIcon name="cap" size={18} className="mr-1.5 inline-block" />
                ONLINE EXAM SIMULATOR
              </span>
              <h1>
                CEFR & IELTS
                <br />
                <span className="highlight">Mock Imtihonlari.</span>
              </h1>
              <p>
                Rasmiy standartlar asosida Reading, Listening va Speaking ko'nikmalaringizni sinang,
                xatolaringiz ustida ishlang va real ballingizni aniqlang.
              </p>
              <div className="hero-tags" aria-label="Platforma imkoniyatlari">
                <span className="tag tag-blue">
                  <IconicIcon name="book" size={16} />
                  CEFR A1–C2
                </span>
                <span className="tag tag-purple">
                  <IconicIcon name="target" size={16} />
                  IELTS mock
                </span>
                <span className="tag tag-green">
                  <IconicIcon name="star" size={16} />
                  AI baholash
                </span>
              </div>
            </div>

            {/* Hero Visual: Clean paper exam card (NO dashed orbit circles) */}
            <div className="hero-visual" aria-label="Mock test namunasi">
              <div className="visual-wrapper">
                {/* Asymmetric layered paper sheet */}
                <div className="back-sheet"></div>

                <div className="exam-card">
                  <div className="exam-head">
                    <span className="exam-book">
                      <IconicIcon name="book" size={24} />
                    </span>
                    <span className="exam-headcopy">
                      <small>YOUR NEXT STEP</small>
                      <b>English mock test</b>
                    </span>
                    <span className="live-label">START</span>
                  </div>

                  {/* B2 Paper blob badge */}
                  <div className="level-box">
                    <div className="level-blob">B2</div>
                    <div className="level-meta">
                      <small>CEFR LEVEL</small>
                      <b>Upper-Intermediate</b>
                      <p>Darajangizni aniqlang</p>
                    </div>
                  </div>

                  <div className="progress-label">
                    <span>Testga tayyorgarlik</span>
                    <span>74%</span>
                  </div>
                  <div className="progress-track">
                    <span></span>
                  </div>
                  <div className="exam-foot">
                    <span>
                      <IconicIcon name="target" size={16} />
                      Listening · Reading
                    </span>
                    <span>
                      <IconicIcon name="clock" size={16} />
                      25 min
                    </span>
                  </div>
                </div>

                {/* Floating notes */}
                <div className="float-note note-a">
                  <span className="mini-icon">
                    <IconicIcon name="trophy" size={20} />
                  </span>
                  <span>
                    <b>Natijani kuzating</b>
                    <small>Har bir urinish muhim</small>
                  </span>
                </div>
                <div className="float-note note-b">
                  <span className="mini-icon">
                    <IconicIcon name="quiz" size={20} />
                  </span>
                  <span>
                    <b>AI tahlili</b>
                    <small>Qayerda o‘sish kerak?</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: Auth panel with second.html asymmetrical buttons & custom checkbox */}
        <aside className="panel auth-panel" id="top" aria-label="Tizimga kirish">
          {/* TABS AT THE TOP: Asymmetrical second.html paper tabs */}
          <div className="mode-tabs" role="tablist" aria-label="Kirish yoki ro‘yxatdan o‘tish">
            <button
              type="button"
              id="loginTab"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => setMode("login")}
              className={`paper-tab-btn ${mode === "login" ? "active" : ""}`}
            >
              Kirish
            </button>
            <button
              type="button"
              id="registerTab"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => setMode("register")}
              className={`paper-tab-btn ${mode === "register" ? "active" : ""}`}
            >
              Ro‘yxatdan o‘tish
            </button>
          </div>

          {/* Heading */}
          <div className="auth-heading">
            <h2 id="authTitle">{mode === "register" ? "Hisob yaratish" : "Tizimga kirish"}</h2>
            <p id="authSubtitle">
              {mode === "register"
                ? "Bir necha soniyada profilingizni yarating va mock testlarni boshlang."
                : "Mock testlaringizni davom ettirish uchun profilingizga kiring."}
            </p>
          </div>

          {/* MODE 1: LOGIN FORM */}
          {mode === "login" ? (
            <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
              {/* Saved profiles quick continue (compact) */}
              {savedProfiles.length > 0 && (
                <div className="saved-profiles-box">
                  <span className="saved-title">Saqlangan profil:</span>
                  <div className="saved-list">
                    {savedProfiles.slice(0, 3).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectProfile(p)}
                        className="saved-item"
                        title={p.fullName}
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-[var(--paper-ink)] shrink-0 flex items-center justify-center bg-[var(--paper-card)]">
                          <AvatarCharacter avatarId={p.avatarId || "jasur"} size={26} showShadow={false} />
                        </div>
                        <span className="saved-name">{p.fullName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="field">
                <label htmlFor="email">Email manzilingiz</label>
                <div className="input-shell">
                  <IconicIcon name="mail" size={20} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="example@gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="password">Parol</label>
                <div className="input-shell">
                  <IconicIcon name="lock" size={20} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Parolingizni kiriting"
                    minLength={6}
                    required
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Parolni ko‘rsatish"
                  >
                    <IconicIcon name="eye" size={20} />
                  </button>
                </div>
              </div>

              {/* REMEMBER ME WITH SECOND.HTML CUSTOM PAPER CHECKBOX */}
              <div className="form-options">
                <div
                  className="paper-checkbox-wrapper"
                  onClick={() => setRememberMe(!rememberMe)}
                  role="checkbox"
                  aria-checked={rememberMe}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      setRememberMe(!rememberMe);
                    }
                  }}
                >
                  <div className={`paper-custom-checkbox ${rememberMe ? "checked" : ""}`}>
                    {rememberMe && <span className="check-icon">✓</span>}
                  </div>
                  <span className="checkbox-label">Meni eslab qol</span>
                </div>

                <a
                  className="text-link"
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast("Parolni tiklash so'rovi yuborildi.");
                  }}
                >
                  Parolni unutdingizmi?
                </a>
              </div>

              {/* GENDER & AVATAR PICKER IN LOGIN FORM */}
              <div className="space-y-3 pt-2 pb-1 border-t-2 border-dashed border-[var(--paper-line)]">
                <div>
                  <label className="flex items-center justify-between text-xs font-black uppercase text-[var(--paper-ink)] mb-1.5">
                    <span>Jinsingizni tanlang</span>
                    <span className="badge by text-[10px] py-0.5 px-2">
                      {gender === "male"
                        ? "O'g'il bola"
                        : gender === "female"
                        ? "Qiz bola"
                        : "Tanlanmagan"}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenderChange("male")}
                      className={`p-2.5 rounded-xl border-[2.5px] border-[#1a1a1a] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                        gender === "male"
                          ? "bg-[#a8d9ff] text-[#1a1a1a] shadow-[3.5px_3.5px_0_#1a1a1a] -translate-y-0.5"
                          : "bg-[#fffef8] text-[#555] shadow-[1.5px_1.5px_0_#1a1a1a] hover:bg-[#f5f2e4]"
                      }`}
                    >
                      <span className="text-base">👦</span>
                      <span>O'g'il bola</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenderChange("female")}
                      className={`p-2.5 rounded-xl border-[2.5px] border-[#1a1a1a] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                        gender === "female"
                          ? "bg-[#ffd84d] text-[#1a1a1a] shadow-[3.5px_3.5px_0_#1a1a1a] -translate-y-0.5"
                          : "bg-[#fffef8] text-[#555] shadow-[1.5px_1.5px_0_#1a1a1a] hover:bg-[#f5f2e4]"
                      }`}
                    >
                      <span className="text-base">👧</span>
                      <span>Qiz bola</span>
                    </button>
                  </div>
                </div>

                {/* AVATAR SELECTION: Only visible AFTER gender is selected */}
                {gender !== null && (
                  <div className="pt-1 transition-all duration-300">
                    <label className="text-xs font-black uppercase text-[var(--paper-ink)] block mb-2">
                      Avatarni tanlang:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(gender === "male"
                        ? (["jasur", "sardor"] as const)
                        : (["madina", "dilnoza"] as const)
                      ).map((avaId) => {
                        const isSelected = selectedAvatar === avaId;
                        return (
                          <button
                            key={avaId}
                            type="button"
                            onClick={() => setSelectedAvatar(avaId)}
                            className={`p-3 rounded-2xl border-[3px] border-[#1a1a1a] flex flex-col items-center justify-center transition-all relative ${
                              isSelected
                                ? "bg-[#fff8d6] shadow-[4px_4px_0_#1a1a1a] scale-[1.03] ring-2 ring-[#ff5722]"
                                : "bg-[#fffef8] shadow-[2.5px_2.5px_0_#1a1a1a] hover:shadow-[3.5px_3.5px_0_#1a1a1a] hover:-translate-y-0.5 hover:bg-[#fffdf0]"
                            }`}
                          >
                            <AvatarCharacter avatarId={avaId} size={66} interactive={true} />
                            {isSelected && (
                              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#b6ef88] border-2 border-[#1a1a1a] flex items-center justify-center text-xs font-black text-[#1a1a1a] shadow-[1.5px_1.5px_0_#1a1a1a]">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* SECOND.HTML ASYMMETRIC BUTTON (Kirish) */}
              <button className="paper-btn-main" type="submit" disabled={loading}>
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--ink)] border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>Kirish</span>
                    <IconicIcon name="check" size={20} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* MODE 2: REGISTER FORM */
            <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
              <div className="field">
                <label htmlFor="fullName">Ism va familiya</label>
                <div className="input-shell">
                  <IconicIcon name="user" size={20} />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    placeholder="Sardor Olimov"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="regEmail">Email manzilingiz</label>
                <div className="input-shell">
                  <IconicIcon name="mail" size={20} />
                  <input
                    id="regEmail"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sardor@example.com"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="regPassword">Parol</label>
                <div className="input-shell">
                  <IconicIcon name="lock" size={20} />
                  <input
                    id="regPassword"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Parol o'ylab toping"
                    minLength={6}
                    required
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Parolni ko‘rsatish"
                  >
                    <IconicIcon name="eye" size={20} />
                  </button>
                </div>
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Parolni tasdiqlang</label>
                <div className="input-shell">
                  <IconicIcon name="lock" size={20} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Parolni qayta kiriting"
                    minLength={6}
                    required
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Parolni tasdiqlashni ko‘rsatish"
                  >
                    <IconicIcon name="eye" size={20} />
                  </button>
                </div>
              </div>

              {/* GENDER & AVATAR PICKER IN REGISTER FORM */}
              <div className="space-y-3 pt-2 pb-1 border-t-2 border-dashed border-[var(--paper-line)]">
                <div>
                  <label className="flex items-center justify-between text-xs font-black uppercase text-[var(--paper-ink)] mb-1.5">
                    <span>Jinsingizni tanlang</span>
                    <span className="badge by text-[10px] py-0.5 px-2">
                      {gender === "male"
                        ? "O'g'il bola"
                        : gender === "female"
                        ? "Qiz bola"
                        : "Tanlanmagan"}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenderChange("male")}
                      className={`p-2.5 rounded-xl border-[2.5px] border-[#1a1a1a] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                        gender === "male"
                          ? "bg-[#a8d9ff] text-[#1a1a1a] shadow-[3.5px_3.5px_0_#1a1a1a] -translate-y-0.5"
                          : "bg-[#fffef8] text-[#555] shadow-[1.5px_1.5px_0_#1a1a1a] hover:bg-[#f5f2e4]"
                      }`}
                    >
                      <span className="text-base">👦</span>
                      <span>O'g'il bola</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenderChange("female")}
                      className={`p-2.5 rounded-xl border-[2.5px] border-[#1a1a1a] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                        gender === "female"
                          ? "bg-[#ffd84d] text-[#1a1a1a] shadow-[3.5px_3.5px_0_#1a1a1a] -translate-y-0.5"
                          : "bg-[#fffef8] text-[#555] shadow-[1.5px_1.5px_0_#1a1a1a] hover:bg-[#f5f2e4]"
                      }`}
                    >
                      <span className="text-base">👧</span>
                      <span>Qiz bola</span>
                    </button>
                  </div>
                </div>

                {/* AVATAR SELECTION: Only visible AFTER gender is selected */}
                {gender !== null && (
                  <div className="pt-1 transition-all duration-300">
                    <label className="text-xs font-black uppercase text-[var(--paper-ink)] block mb-2">
                      Avatarni tanlang:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(gender === "male"
                        ? (["jasur", "sardor"] as const)
                        : (["madina", "dilnoza"] as const)
                      ).map((avaId) => {
                        const isSelected = selectedAvatar === avaId;
                        return (
                          <button
                            key={avaId}
                            type="button"
                            onClick={() => setSelectedAvatar(avaId)}
                            className={`p-3 rounded-2xl border-[3px] border-[#1a1a1a] flex flex-col items-center justify-center transition-all relative ${
                              isSelected
                                ? "bg-[#fff8d6] shadow-[4px_4px_0_#1a1a1a] scale-[1.03] ring-2 ring-[#ff5722]"
                                : "bg-[#fffef8] shadow-[2.5px_2.5px_0_#1a1a1a] hover:shadow-[3.5px_3.5px_0_#1a1a1a] hover:-translate-y-0.5 hover:bg-[#fffdf0]"
                            }`}
                          >
                            <AvatarCharacter avatarId={avaId} size={66} interactive={true} />
                            {isSelected && (
                              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#b6ef88] border-2 border-[#1a1a1a] flex items-center justify-center text-xs font-black text-[#1a1a1a] shadow-[1.5px_1.5px_0_#1a1a1a]">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button className="paper-btn-main mt-1" type="submit" disabled={loading || !fullName.trim()}>
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--ink)] border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>Ro‘yxatdan o‘tish</span>
                    <IconicIcon name="check" size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-spacer"></div>

          {/* SECOND.HTML ASYMMETRICAL SOCIAL BUTTONS - NO MCHost */}
          <div className="social-area">
            <div className="divider">BOSHQA USULLAR ORQALI</div>
            <div className="social-buttons grid grid-cols-2 gap-2.5">
              <button
                className="paper-social-btn"
                type="button"
                onClick={() => handleSocialLogin("Google")}
              >
                <IconicIcon name="google" size={20} />
                <span>Google</span>
              </button>

              <button
                className="paper-social-btn"
                type="button"
                onClick={() => handleSocialLogin("Telegram")}
              >
                <IconicIcon name="telegram" size={20} />
                <span>Telegram</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSocialLogin("Guest")}
              className="paper-guest-btn"
              title="Sinov tariqasida kirish"
            >
              Mehmon sifatida sinovdan o'tish →
            </button>
          </div>

          {/* High Legibility Legal Section */}
          <div className="legal-section">
            <p className="terms-text">
              Tizimga kirish orqali siz{" "}
              <a
                href="#terms"
                onClick={(e) => {
                  e.preventDefault();
                  showToast("Foydalanish shartlari tasdiqlangan.");
                }}
              >
                foydalanish shartlari
              </a>{" "}
              va{" "}
              <a
                href="#privacy"
                onClick={(e) => {
                  e.preventDefault();
                  showToast("Maxfiylik siyosati: ma'lumotlar faqat qurilmangiz keshida saqlanadi.");
                }}
              >
                maxfiylik siyosati
              </a>{" "}
              bilan rozilik bildirasiz.
            </p>

            <div className="trust-shield">
              <span className="flex items-center gap-1.5">
                <IconicIcon name="shield" size={17} />
                <b>Ma'lumotlaringiz to'liq himoyalangan</b>
              </span>
              <span>© 2026 Mock AI</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast show" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}

      {/* 
        MOCKAI PAPER-CRAFT NEOBRUTALISM UI KIT (second.html)
        - Asymmetric organic border radii: --w1, --w2, --b1, --b2, --c1
        - Spring animated button pops & micro-rotations
        - Custom paper checkbox
      */}
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

        .login-paper-root {
          --paper: #fdfcf0;
          --card: #fffef8;
          --soft: #f4f0df;
          --ink: #1a1a1a;
          --muted: #6b695c;
          --line: #dedacb;
          --orange: #ff5722;
          --yellow: #ffd84d;
          --green: #b6ef88;
          --blue: #a8d9ff;
          --purple: #d9c3ff;
          --sh: 5px 5px 0 var(--ink);
          --sh-sm: 3px 3px 0 var(--ink);
          --sh-lg: 7px 7px 0 var(--ink);
          width: 100%;
          min-height: 100vh;
          background: var(--paper);
          color: var(--ink);
          font-family: ui-rounded, "Trebuchet MS", "Arial Rounded MT Bold", Arial, sans-serif;
          font-weight: 800;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 20px;
          box-sizing: border-box;
          user-select: none;
        }

        .login-paper-root *, .login-paper-root *::before, .login-paper-root *::after {
          box-sizing: border-box;
        }

        .shell {
          width: min(1500px, 100%);
          min-height: calc(100dvh - 36px);
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(380px, 1fr);
          gap: 24px;
          align-items: stretch;
        }

        @media (max-width: 960px) {
          .shell {
            grid-template-columns: 1fr;
            min-height: auto;
          }
        }

        .panel {
          border: 3.5px solid var(--ink);
          border-radius: var(--b1);
          background: var(--card);
          box-shadow: var(--sh-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .intro-panel {
          padding: 28px 32px;
          justify-content: space-between;
        }

        .brandbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hero-body {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 24px;
          align-items: center;
          margin: auto 0;
          padding: 24px 0;
        }

        @media (max-width: 1100px) {
          .hero-body {
            grid-template-columns: 1fr;
          }
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .5px;
          text-transform: uppercase;
          padding: 5px 12px;
          border: 2.5px solid var(--ink);
          border-radius: var(--w1);
          background: var(--soft);
          box-shadow: var(--sh-sm);
          margin-bottom: 14px;
          transform: rotate(-1deg);
          transition: transform .25s var(--spring);
        }
        .eyebrow:hover {
          transform: scale(1.04) rotate(1deg);
        }

        .hero-copy h1 {
          font-size: clamp(32px, 3.8vw, 48px);
          font-weight: 1000;
          line-height: 1.1;
          letter-spacing: -1.2px;
          margin: 0 0 14px;
          color: var(--ink);
        }

        .highlight {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .highlight::after {
          content: "";
          position: absolute;
          left: -4px;
          right: -4px;
          bottom: 2px;
          height: 12px;
          background: var(--yellow);
          z-index: -1;
          border-radius: 4px;
          transform: rotate(-0.5deg);
        }

        .hero-copy p {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.6;
          font-weight: 700;
          margin: 0 0 16px;
          max-width: 440px;
        }

        .hero-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--card);
          border: 2.5px solid var(--ink);
          border-radius: var(--w1);
          box-shadow: var(--sh-sm);
          font-size: 11px;
          font-weight: 900;
          transition: transform .25s var(--spring), box-shadow .2s;
        }
        .tag:hover {
          transform: translateY(-2px) scale(1.05) rotate(1deg);
          box-shadow: 4px 4px 0 var(--ink);
        }
        .tag-blue { background: var(--blue); }
        .tag-purple { background: var(--purple); }
        .tag-green { background: var(--green); }

        /* Asymmetric Exam Card without dashed orbits */
        .hero-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .visual-wrapper {
          position: relative;
          width: 100%;
          max-width: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .back-sheet {
          position: absolute;
          width: 90%;
          height: 94%;
          border: 3px solid var(--ink);
          border-radius: var(--b2);
          background: var(--purple);
          transform: rotate(6deg) translate(8px, 6px);
          box-shadow: var(--sh);
          z-index: 0;
          transition: transform .3s var(--spring);
        }
        .visual-wrapper:hover .back-sheet {
          transform: rotate(8deg) translate(10px, 8px);
        }

        .exam-card {
          position: relative;
          width: 92%;
          padding: 20px 18px;
          border: 3px solid var(--ink);
          border-radius: var(--b1);
          background: var(--card);
          box-shadow: var(--sh-lg);
          transform: rotate(-2deg);
          z-index: 1;
          transition: transform .3s var(--spring);
        }
        .visual-wrapper:hover .exam-card {
          transform: rotate(-1deg) translateY(-4px);
        }

        .exam-head {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 2.5px solid var(--line);
        }

        .exam-book {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border: 2px solid var(--ink);
          border-radius: var(--w1);
          background: var(--yellow);
          box-shadow: 2px 2px 0 var(--ink);
        }

        .exam-headcopy small {
          display: block;
          color: var(--muted);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .8px;
        }

        .exam-headcopy b {
          display: block;
          font-size: 14px;
          color: var(--ink);
        }

        .live-label {
          padding: 3px 8px;
          border: 2px solid var(--ink);
          border-radius: var(--w1);
          background: var(--green);
          font-size: 10px;
          font-weight: 1000;
          margin-left: auto;
        }

        .level-box {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 0 10px;
        }

        .level-blob {
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          background: var(--yellow);
          border: 3px solid var(--ink);
          border-radius: 43% 57% 45% 55% / 55% 45% 55% 45%;
          box-shadow: 3px 3px 0 var(--ink);
          font-size: 28px;
          font-weight: 1000;
          transform: rotate(-3deg);
          transition: transform .3s var(--spring);
        }
        .level-blob:hover {
          transform: scale(1.1) rotate(4deg);
        }

        .level-meta small {
          display: block;
          font-size: 9px;
          font-weight: 900;
          color: var(--muted);
        }

        .level-meta b {
          display: block;
          font-size: 15px;
          font-weight: 900;
          color: var(--ink);
        }

        .level-meta p {
          margin: 0;
          font-size: 11px;
          color: var(--muted);
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 900;
          margin-bottom: 5px;
        }

        .progress-track {
          height: 12px;
          border: 2.5px solid var(--ink);
          border-radius: 99px;
          background: #fff;
          overflow: hidden;
          padding: 1.5px;
        }

        .progress-track span {
          display: block;
          width: 74%;
          height: 100%;
          background: var(--green);
          border-radius: 99px;
        }

        .exam-foot {
          display: flex;
          justify-content: space-between;
          padding-top: 10px;
          font-size: 11px;
          font-weight: 800;
          color: var(--muted);
        }

        .exam-foot span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        /* Floating notes */
        .float-note {
          position: absolute;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border: 2.5px solid var(--ink);
          border-radius: var(--w1);
          background: var(--card);
          box-shadow: 4px 4px 0 var(--ink);
          transition: transform .25s var(--spring);
        }
        .float-note:hover {
          transform: scale(1.08) rotate(1deg);
        }

        .float-note.note-a {
          top: -12px;
          right: -10px;
          transform: rotate(3deg);
        }

        .float-note.note-b {
          bottom: -16px;
          left: -10px;
          transform: rotate(-4deg);
        }

        .float-note b {
          display: block;
          font-size: 11px;
          line-height: 1.2;
        }

        .float-note small {
          display: block;
          font-size: 9px;
          color: var(--muted);
        }

        /* RIGHT PANEL STYLES */
        .auth-panel {
          padding: 26px 30px;
          justify-content: space-between;
        }

        /* SECOND.HTML ASYMMETRICAL TABS */
        .mode-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 5px;
          border: 3px solid var(--ink);
          border-radius: var(--w1);
          background: var(--soft);
          margin-bottom: 20px;
        }

        .paper-tab-btn {
          padding: 10px 14px;
          border: 2.5px solid transparent;
          border-radius: var(--w1);
          background: transparent;
          color: var(--muted);
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          transition: transform .25s var(--spring), background .2s, box-shadow .2s;
        }

        .paper-tab-btn:hover {
          color: var(--ink);
          transform: translateY(-1px);
        }

        .paper-tab-btn.active {
          background: var(--yellow);
          color: var(--ink);
          border-color: var(--ink);
          border-radius: var(--w2);
          box-shadow: 3px 3px 0 var(--ink);
          transform: rotate(-0.8deg);
        }

        .auth-heading h2 {
          font-size: 26px;
          font-weight: 1000;
          margin: 0 0 6px;
          letter-spacing: -.6px;
        }

        .auth-heading p {
          margin: 0 0 16px;
          font-size: 13px;
          font-weight: 700;
          color: var(--muted);
          line-height: 1.4;
        }

        /* Saved profiles */
        .saved-profiles-box {
          padding: 8px 12px;
          border: 2.5px solid var(--ink);
          border-radius: var(--w1);
          background: var(--soft);
          box-shadow: 2px 2px 0 var(--ink);
          margin-bottom: 14px;
        }

        .saved-title {
          display: block;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .saved-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .saved-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border: 2px solid var(--ink);
          border-radius: var(--w1);
          background: var(--card);
          cursor: pointer;
          box-shadow: 2px 2px 0 var(--ink);
          transition: transform .2s var(--spring), background .2s;
        }

        .saved-item:hover {
          background: var(--yellow);
          transform: translateY(-2px) rotate(-1deg);
        }

        .saved-letter {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          background: var(--yellow);
          border: 1px solid var(--ink);
          display: grid;
          place-items: center;
          font-size: 10px;
          font-weight: 900;
        }

        .saved-name {
          font-size: 11px;
          font-weight: 800;
        }

        /* Form fields */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .field label {
          display: block;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: .4px;
        }

        .input-shell {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border: 3px solid var(--ink);
          border-radius: var(--w1);
          background: #fff;
          box-shadow: 3px 3px 0 var(--ink);
          transition: transform .2s var(--spring), box-shadow .2s;
        }

        .input-shell:focus-within {
          border-radius: var(--w2);
          box-shadow: 5px 5px 0 var(--orange);
          transform: translateY(-1px);
        }

        .input-shell input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
          font-weight: 800;
          color: var(--ink);
          background: transparent;
        }

        .password-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: grid;
          place-items: center;
          color: var(--muted);
          transition: transform .2s;
        }
        .password-toggle:hover {
          transform: scale(1.15);
        }

        /* SECOND.HTML CUSTOM PAPER CHECKBOX (REPLACES BROWSER DEFAULT) */
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          padding: 2px 0;
        }

        .paper-checkbox-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .paper-custom-checkbox {
          width: 22px;
          height: 22px;
          border: 2.5px solid var(--ink);
          border-radius: 6px 4px 6px 4px / 4px 6px 4px 6px;
          background: #fff;
          box-shadow: 2px 2px 0 var(--ink);
          display: grid;
          place-items: center;
          transition: transform .2s var(--spring), background .2s, box-shadow .2s;
        }

        .paper-checkbox-wrapper:hover .paper-custom-checkbox {
          transform: scale(1.12) rotate(-3deg);
          box-shadow: 3px 3px 0 var(--ink);
          background: var(--yellow);
        }

        .paper-custom-checkbox.checked {
          background: var(--orange);
          color: #fff;
          transform: rotate(2deg);
        }

        .check-icon {
          font-size: 14px;
          font-weight: 1000;
          line-height: 1;
        }

        .checkbox-label {
          font-weight: 900;
          font-size: 13px;
          color: var(--ink);
        }

        .text-link {
          color: var(--ink);
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 900;
          transition: color .2s;
        }
        .text-link:hover {
          color: var(--orange);
        }

        /* SECOND.HTML ASYMMETRIC MAIN BUTTON */
        .paper-btn-main {
          width: 100%;
          padding: 13px 18px;
          border: 3px solid var(--ink);
          border-radius: var(--w1);
          background: var(--yellow);
          color: var(--ink);
          font-size: 15px;
          font-weight: 1000;
          box-shadow: var(--sh);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          rotate: -0.6deg;
          transition: transform .25s var(--spring), box-shadow .2s, border-radius .2s, background .2s;
          margin-top: 4px;
        }

        .paper-btn-main:hover {
          transform: translateY(-2px) rotate(-1.5deg) scale(1.02);
          box-shadow: var(--sh-lg);
          border-radius: var(--w2);
          background: #ffd333;
        }

        .paper-btn-main:active {
          transform: translate(3px, 3px) scale(0.96);
          box-shadow: 1px 1px 0 var(--ink);
        }

        .auth-spacer {
          height: 14px;
        }

        /* Social Area with second.html paper buttons */
        .social-area {
          margin-top: auto;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .8px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .divider::before, .divider::after {
          content: "";
          flex: 1;
          height: 2px;
          background: var(--line);
        }

        .paper-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border: 3px solid var(--ink);
          border-radius: var(--w1);
          background: #fff;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: var(--sh-sm);
          transition: transform .25s var(--spring), box-shadow .2s, border-radius .2s, background .2s;
        }

        .paper-social-btn:hover {
          transform: translateY(-2px) rotate(-1.2deg) scale(1.03);
          box-shadow: var(--sh);
          border-radius: var(--w2);
          background: var(--soft);
        }

        .paper-social-btn:active {
          transform: translate(2px, 2px) scale(0.97);
          box-shadow: 1px 1px 0 var(--ink);
        }

        .paper-guest-btn {
          width: 100%;
          text-align: center;
          padding: 8px 10px;
          margin-top: 8px;
          background: none;
          border: none;
          font-size: 12px;
          font-weight: 900;
          color: var(--muted);
          text-decoration: underline;
          cursor: pointer;
          transition: color .2s;
        }
        .paper-guest-btn:hover {
          color: var(--orange);
        }

        /* High Legibility Legal Section */
        .legal-section {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 2.5px dashed var(--line);
        }

        .terms-text {
          font-size: 12px;
          font-weight: 700;
          color: var(--muted);
          line-height: 1.5;
          margin: 0 0 8px;
          text-align: center;
        }

        .terms-text a {
          color: var(--ink);
          font-weight: 900;
          text-decoration: underline;
        }

        .trust-shield {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 800;
          color: var(--ink);
          background: var(--soft);
          padding: 8px 14px;
          border-radius: var(--w1);
          border: 2px solid var(--ink);
        }

        /* Toast */
        .toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: var(--ink);
          color: #fff;
          padding: 10px 20px;
          border-radius: var(--w1);
          font-weight: 900;
          font-size: 13px;
          box-shadow: 4px 4px 0 var(--orange);
          transition: transform .3s var(--spring);
          z-index: 100;
        }

        .toast.show {
          transform: translateX(-50%) translateY(0);
        }
      `}</style>
    </div>
  );
}

/**
 * Offline-first Cache & LocalStorage Management System
 * CEFR Multilevel Mock Platform
 * 
 * Manages:
 * 1. User authentication & sessions in local cache
 * 2. Profile data (full name, target level, avatar, bio)
 * 3. Learning folder & test results history (Reading, Listening, Speaking, Grammar)
 * 4. Aggregated stats (total tests, estimated level, accuracy)
 * 5. Import/export and cache management
 */

export interface UserProfileData {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  avatarId?: "madina" | "dilnoza" | "jasur" | "sardor" | string;
  gender?: "female" | "male";
  targetLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestResultRecord {
  id: string;
  testType: "reading" | "listening" | "speaking" | "grammar";
  title: string;
  date: string; // ISO format
  score: number;
  total: number;
  percentage: number;
  cefrLevel: string; // "A1" | "A2" | "B1" | "B1+" | "B2" | "C1" | "C2"
  timeSpentSeconds?: number;
  details?: {
    breakdown?: Array<{ partNumber?: number | string; title?: string; correct: number; total: number }>;
    feedback?: string;
    notes?: string;
  };
}

export interface PlatformStats {
  totalTests: number;
  estimatedLevel: string;
  accuracy: number;
  byType: {
    reading: number;
    listening: number;
    speaking: number;
    grammar: number;
  };
}

const STORAGE_KEYS = {
  ACTIVE_USER: "cefr_cached_active_user",
  SAVED_PROFILES: "cefr_cached_user_profiles",
  TEST_HISTORY: "cefr_cached_test_history",
  APP_SETTINGS: "cefr_app_settings",
} as const;

// Event target for real-time reactivity within the same tab
const authEventEmitter = new EventTarget();
const AUTH_EVENT_KEY = "cefr_auth_change";

// ─── User & Authentication Storage ───────────────────────────────────────────

export function getActiveUser(): UserProfileData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfileData;
  } catch (err) {
    console.error("Error reading active user from cache:", err);
    return null;
  }
}

export function setActiveUser(user: UserProfileData | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    // Also save to profiles list
    saveProfileToList(user);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  }
  authEventEmitter.dispatchEvent(new CustomEvent(AUTH_EVENT_KEY, { detail: user }));
}

export function getSavedProfiles(): UserProfileData[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.SAVED_PROFILES);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as UserProfileData[];
  } catch {
    return [];
  }
}

function saveProfileToList(user: UserProfileData): void {
  const profiles = getSavedProfiles();
  const index = profiles.findIndex((p) => p.id === user.id);
  if (index >= 0) {
    profiles[index] = user;
  } else {
    profiles.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.SAVED_PROFILES, JSON.stringify(profiles));
}

export function loginUser({
  fullName,
  email,
  targetLevel = "B2",
  avatarUrl,
  avatarId,
  gender,
}: {
  fullName: string;
  email?: string;
  targetLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  avatarUrl?: string;
  avatarId?: "madina" | "dilnoza" | "jasur" | "sardor" | string;
  gender?: "female" | "male";
}): UserProfileData {
  const sanitizedName = fullName.trim() || "Student";
  const userEmail = email?.trim() || `${sanitizedName.toLowerCase().replace(/\s+/g, ".")}@local.cefr`;

  // Infer default avatar if not specified
  const effectiveGender = gender || "male";
  const effectiveAvatarId = avatarId || (effectiveGender === "female" ? "madina" : "jasur");

  // Check if profile exists with this email
  const existingProfiles = getSavedProfiles();
  const found = existingProfiles.find((p) => p.email.toLowerCase() === userEmail.toLowerCase());

  const now = new Date().toISOString();
  const user: UserProfileData = found
    ? {
        ...found,
        fullName: sanitizedName,
        targetLevel: targetLevel || found.targetLevel,
        avatarUrl: avatarUrl || found.avatarUrl,
        avatarId: avatarId || found.avatarId || effectiveAvatarId,
        gender: gender || found.gender || effectiveGender,
        updatedAt: now,
      }
    : {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        email: userEmail,
        fullName: sanitizedName,
        targetLevel,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(sanitizedName)}`,
        avatarId: effectiveAvatarId,
        gender: effectiveGender,
        createdAt: now,
        updatedAt: now,
      };

  setActiveUser(user);
  return user;
}

export function loginAsGuest(): UserProfileData {
  return loginUser({
    fullName: "Mehmon O'quvchi",
    email: "guest@cefr-mock.local",
    targetLevel: "B2",
    gender: "male",
    avatarId: "jasur",
  });
}

export function logoutUser(): void {
  setActiveUser(null);
}

export function updateUserProfile(updates: Partial<UserProfileData>): UserProfileData | null {
  const current = getActiveUser();
  if (!current) return null;

  const updated: UserProfileData = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  setActiveUser(updated);
  return updated;
}

export function subscribeAuth(callback: (user: UserProfileData | null) => void): () => void {
  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<UserProfileData | null>;
    callback(custom.detail);
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.ACTIVE_USER) {
      callback(getActiveUser());
    }
  };

  authEventEmitter.addEventListener(AUTH_EVENT_KEY, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    authEventEmitter.removeEventListener(AUTH_EVENT_KEY, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

// ─── Test History & Learning Folder Storage ───────────────────────────────────

export function getTestHistory(): TestResultRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.TEST_HISTORY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as TestResultRecord[];
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error("Error reading test history from cache:", err);
    return [];
  }
}

export function saveTestResult(
  record: Omit<TestResultRecord, "id" | "date" | "cefrLevel"> & {
    id?: string;
    date?: string;
    cefrLevel?: string;
  }
): TestResultRecord {
  const history = getTestHistory();
  const newRecord: TestResultRecord = {
    id: record.id || `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: record.date || new Date().toISOString(),
    testType: record.testType,
    title: record.title,
    score: record.score,
    total: record.total,
    percentage: record.percentage,
    cefrLevel: record.cefrLevel || calculateCefrLevel(record.percentage),
    timeSpentSeconds: record.timeSpentSeconds,
    details: record.details,
  };

  // Prepend new record
  const updatedHistory = [newRecord, ...history];
  localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify(updatedHistory));
  return newRecord;
}

export function deleteTestResult(id: string): void {
  const history = getTestHistory();
  const filtered = history.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify(filtered));
}

export function clearTestHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.TEST_HISTORY);
}

export function calculateCefrLevel(percentage: number): string {
  if (percentage >= 85) return "C1";
  if (percentage >= 70) return "B2";
  if (percentage >= 55) return "B1+";
  if (percentage >= 40) return "B1";
  if (percentage >= 25) return "A2";
  return "A1";
}

export function calculateStats(): PlatformStats {
  const history = getTestHistory();

  if (history.length === 0) {
    return {
      totalTests: 0,
      estimatedLevel: "B1",
      accuracy: 0,
      byType: {
        reading: 0,
        listening: 0,
        speaking: 0,
        grammar: 0,
      },
    };
  }

  const byType = {
    reading: 0,
    listening: 0,
    speaking: 0,
    grammar: 0,
  };

  let totalPercentage = 0;

  history.forEach((test) => {
    totalPercentage += test.percentage;
    if (test.testType in byType) {
      byType[test.testType]++;
    }
  });

  const avgPercentage = Math.round(totalPercentage / history.length);

  return {
    totalTests: history.length,
    estimatedLevel: calculateCefrLevel(avgPercentage),
    accuracy: avgPercentage,
    byType,
  };
}

// ─── Sample Data Generator for Demo & Testing ─────────────────────────────────

export function seedSampleTestHistory(): void {
  const sampleRecords: Array<Omit<TestResultRecord, "id" | "date">> = [
    {
      testType: "reading",
      title: "CEFR Reading Mock #1",
      score: 28,
      total: 35,
      percentage: 80,
      cefrLevel: "B2",
      details: {
        breakdown: [
          { partNumber: 1, title: "Short Texts", correct: 5, total: 6 },
          { partNumber: 2, title: "Matching Headings", correct: 7, total: 8 },
          { partNumber: 3, title: "Multiple Choice", correct: 8, total: 10 },
          { partNumber: 4, title: "Gapped Text", correct: 4, total: 5 },
          { partNumber: 5, title: "Multiple Matching", correct: 4, total: 6 },
        ],
      },
    },
    {
      testType: "listening",
      title: "CEFR Listening Practice Test",
      score: 24,
      total: 30,
      percentage: 80,
      cefrLevel: "B2",
    },
    {
      testType: "speaking",
      title: "Speaking Part 1 & 2 AI Simulation",
      score: 18,
      total: 20,
      percentage: 90,
      cefrLevel: "C1",
      details: {
        feedback: "Good fluency and lexical resource. Minor hesitation in complex conditionals.",
      },
    },
    {
      testType: "grammar",
      title: "Grammar Master: Conditionals & Tenses",
      score: 14,
      total: 15,
      percentage: 93,
      cefrLevel: "C1",
    },
  ];

  clearTestHistory();
  sampleRecords.forEach((record, index) => {
    const pastDate = new Date(Date.now() - (sampleRecords.length - index) * 86400000 * 2).toISOString();
    saveTestResult({
      ...record,
      date: pastDate,
    });
  });
}

// ─── Export, Import & Full Reset ─────────────────────────────────────────────

export function exportAllCache(): string {
  if (typeof window === "undefined") return "{}";
  const data = {
    activeUser: getActiveUser(),
    profiles: getSavedProfiles(),
    history: getTestHistory(),
    vocab: localStorage.getItem("cefr_vocab") ? JSON.parse(localStorage.getItem("cefr_vocab")!) : [],
    exportedAt: new Date().toISOString(),
    version: "2.0-cache",
  };
  return JSON.stringify(data, null, 2);
}

export function importAllCache(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.activeUser) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(data.activeUser));
    }
    if (Array.isArray(data.profiles)) {
      localStorage.setItem(STORAGE_KEYS.SAVED_PROFILES, JSON.stringify(data.profiles));
    }
    if (Array.isArray(data.history)) {
      localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify(data.history));
    }
    if (Array.isArray(data.vocab)) {
      localStorage.setItem("cefr_vocab", JSON.stringify(data.vocab));
    }
    // Dispatch auth update
    authEventEmitter.dispatchEvent(new CustomEvent(AUTH_EVENT_KEY, { detail: getActiveUser() }));
    return true;
  } catch (err) {
    console.error("Failed to import cache data:", err);
    return false;
  }
}

export function clearAllCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  localStorage.removeItem(STORAGE_KEYS.SAVED_PROFILES);
  localStorage.removeItem(STORAGE_KEYS.TEST_HISTORY);
  localStorage.removeItem("cefr_vocab");
  authEventEmitter.dispatchEvent(new CustomEvent(AUTH_EVENT_KEY, { detail: null }));
}

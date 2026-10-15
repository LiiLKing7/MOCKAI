import { useState, useEffect } from "react";
import { getActiveUser, subscribeAuth, UserProfileData } from "./lib/storage";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import Dashboard from "./pages/Dashboard";
import ReadingTest from "./pages/ReadingTest";
import SpeakingTest from "./pages/SpeakingTest";
import ListeningMaker from "./pages/ListeningMaker";
import ListeningTest from "./pages/ListeningTest";
import GrammarLesson from "./pages/GrammarLesson";
import AvatarsPreview from "./pages/AvatarsPreview";
import { VocabularyProvider } from "./lib/vocabulary-context";

export type ViewState = "dashboard" | "reading" | "speaking" | "listening" | "listening-maker" | "profile" | "grammar" | "avatars";

export interface PageProps {
  onNavigate: (view: ViewState) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize offline cache auth
  useEffect(() => {
    const active = getActiveUser();
    setUser(active);
    setAuthLoading(false);

    const unsubscribe = subscribeAuth((updatedUser) => {
      setUser(updatedUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Enforce light paper theme permanently (no dark mode)
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
  }, []);

  const toggleTheme = () => {
    // Dark mode is permanently disabled per project requirements
  };

  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
  };

  return (
    <VocabularyProvider>
      <div className="flex flex-col min-h-screen bg-background">
        {authLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !user ? (
          <Login />
        ) : (
          <>
            {currentView === "dashboard" && <Dashboard onNavigate={navigateTo} theme={theme} toggleTheme={toggleTheme} />}
            {currentView === "reading" && <ReadingTest onNavigate={navigateTo} theme={theme} toggleTheme={toggleTheme} />}
            {currentView === "speaking" && <SpeakingTest onNavigate={navigateTo} theme={theme} toggleTheme={toggleTheme} />}
            {currentView === "listening" && <ListeningTest onNavigate={navigateTo} theme={theme} toggleTheme={toggleTheme} />}
            {currentView === "listening-maker" && <ListeningMaker onNavigate={navigateTo} theme={theme} toggleTheme={toggleTheme} />}
            {currentView === "profile" && <UserProfile onNavigate={navigateTo} theme={theme} toggleTheme={toggleTheme} />}
            {currentView === "grammar" && <GrammarLesson onNavigate={navigateTo} theme={theme} toggleTheme={toggleTheme} />}
            {currentView === "avatars" && <AvatarsPreview onNavigate={navigateTo} theme={theme} toggleTheme={toggleTheme} />}
          </>
        )}
      </div>
    </VocabularyProvider>
  );
}

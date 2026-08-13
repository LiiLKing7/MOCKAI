import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import Dashboard from "./pages/Dashboard";
import ReadingTest from "./pages/ReadingTest";
import SpeakingTest from "./pages/SpeakingTest";
import ListeningMaker from "./pages/ListeningMaker";
import ListeningTest from "./pages/ListeningTest";
import GrammarLesson from "./pages/GrammarLesson";
import { BookOpen, Moon, Sun } from "lucide-react";
import { Button } from "./components/ui/button";
import { VocabularyProvider } from "./lib/vocabulary-context";

export type ViewState = "dashboard" | "reading" | "speaking" | "listening" | "listening-maker" | "profile" | "grammar";

export interface PageProps {
  onNavigate: (view: ViewState) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initialize theme
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  // Apply theme class
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
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
          </>
        )}
      </div>
    </VocabularyProvider>
  );
}

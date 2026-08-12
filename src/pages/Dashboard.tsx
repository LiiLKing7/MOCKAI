import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SkillSelector } from "@/components/skill-selector";
import { PageProps } from "../App";
import { BookOpen, Moon, Sun } from "lucide-react";

export default function Dashboard({ onNavigate, theme, toggleTheme }: PageProps) {
  const [isStarted, setIsStarted] = useState(false);
  return (
    <>
      <header className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-background z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate("dashboard")}
        >
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-heading font-semibold text-foreground">
            CEFR Multilevel Mock Platform
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      {!isStarted ? (
        <div className="space-y-6 max-w-md">
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Ingliz tili darajangizni sinab ko'ring
          </h2>
          <p className="text-muted-foreground">
            Haqiqiy CEFR Multilevel testiga o'xshash mashqlar orqali o'z bilmingizni oshiring.
          </p>
          <Button size="lg" className="w-full" onClick={() => setIsStarted(true)}>
            Mock testni boshlash
          </Button>
        </div>
      ) : (
        <div className="w-full">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-8 text-center">
            Bo'limni tanlang
          </h2>
          <SkillSelector onNavigate={onNavigate} />
        </div>
      )}
      </main>
    </>
  );
}

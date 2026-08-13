import { useState, useEffect } from "react";
import { ReadingPart } from "@/data/reading-test-1";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { groupMistakesByTaskType, analyzeMistakePattern, AICoachingPattern, MistakeGroup } from "@/lib/ai-coaching";
import { cn } from "@/lib/utils";

interface AICoachingCardsProps {
  parts: ReadingPart[];
  answers: Record<string, string>;
  onReviewQuestion: (partId: string, questionIndex: number) => void;
}

export function AICoachingCards({ parts, answers, onReviewQuestion }: AICoachingCardsProps) {
  const [loading, setLoading] = useState(true);
  const [coachingResults, setCoachingResults] = useState<{ group: MistakeGroup, pattern: AICoachingPattern }[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const groups = groupMistakesByTaskType(parts, answers);
  const totalMistakes = parts.reduce((acc, part) => {
    let wrong = 0;
    if (part.taskType === "short-text-mc") {
      part.items.forEach(i => { if ((answers[i.id]?.toLowerCase().trim() || "") !== i.correctAnswer.toLowerCase().trim()) wrong++; });
    } else {
      part.questions.forEach(q => { if ((answers[q.id]?.toLowerCase().trim() || "") !== q.correctAnswer.toLowerCase().trim()) wrong++; });
    }
    return acc + wrong;
  }, 0);

  useEffect(() => {
    async function fetchCoaching() {
      if (groups.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 3. Parallel Execution with Promise.allSettled
        const results = await Promise.allSettled(groups.map(g => analyzeMistakePattern(g)));
        
        const successfulResults: { group: MistakeGroup, pattern: AICoachingPattern }[] = [];
        let anyFailed = false;

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            successfulResults.push({ group: groups[index], pattern: result.value });
          } else {
            console.error("Failed to analyze group:", groups[index].taskType, result.reason);
            anyFailed = true;
          }
        });

        setCoachingResults(successfulResults);

        if (successfulResults.length === 0 && anyFailed) {
          setError("Tahlil qilishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring yoki API kalitini tekshiring.");
        }
      } catch (err: any) {
        setError(err.message || "Tahlil qilishda xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    }

    fetchCoaching();
  }, []);

  const getTaskTypeName = (taskType: string) => {
    const names: Record<string, string> = {
      "inline-gap-fill": "Part 1: Bo'shliqlarni to'ldirish",
      "matching": "Part 2: Ma'lumotlarni moslashtirish",
      "matching-headings": "Part 3: Sarlavhalarni moslashtirish",
      "long-text-mc": "Part 4 & 5: O'qib tushunish",
    };
    return names[taskType] || taskType;
  };

  if (totalMistakes === 0) {
    return (
      <div className="w-full mt-8 p-6 rounded-xl border border-success/30 bg-success/5 flex flex-col items-center text-center gap-3">
        <Sparkles className="w-10 h-10 text-success mb-2" />
        <h3 className="text-xl font-bold text-success-foreground">Ajoyib natija!</h3>
        <p className="text-muted-foreground max-w-md">
          Siz barcha savollarga to'g'ri javob berdingiz. Shunday ruhda davom eting!
        </p>
      </div>
    );
  }

  if (groups.length === 0 && totalMistakes > 0) {
    return (
      <div className="w-full mt-8 p-6 rounded-xl border bg-muted/20 flex flex-col items-center text-center gap-3">
        <BrainCircuit className="w-10 h-10 text-muted-foreground mb-2" />
        <h3 className="text-xl font-bold">Ma'lumot yetarli emas</h3>
        <p className="text-muted-foreground max-w-md">
          Xatolaringizda aniq bir qonuniyat (pattern) ni topish uchun bitta bo'limda kamida 2 ta xato bo'lishi kerak. Ko'proq mashq qiling va keyingi safar chuqurroq tahlil olasiz!
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full mt-8 p-8 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-primary">Sun'iy Intellekt Tahlili</h3>
          <p className="text-sm text-muted-foreground">Xatolaringiz strategiyasi tahlil qilinmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-8 space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <BrainCircuit className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">AI Strategiya Tahlili</h2>
      </div>

      {error && coachingResults.length === 0 && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {coachingResults.map((result, idx) => {
          const { group, pattern } = result;
          // Find the specific mistake to know its partId and questionIndex
          const mistakeObj = group.mistakes.find(m => m.questionId === pattern.exampleQuestionId) || group.mistakes[0];

          return (
            <Card key={idx} className="p-5 border-primary/20 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full bg-gradient-to-br from-background to-primary/5">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary/80 bg-primary/10 px-2 py-1 rounded-md">
                  {getTaskTypeName(group.taskType)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{pattern.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                {pattern.explanation}
              </p>
              
              <Button 
                variant="outline" 
                className="w-full mt-auto group border-primary/30 hover:bg-primary/10 hover:text-primary"
                onClick={() => onReviewQuestion(mistakeObj.partId, mistakeObj.questionIndex)}
              >
                Misolni ko'rish
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

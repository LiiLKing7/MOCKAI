import { ReadingPart } from "@/data/reading-test-1";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { ViewState } from "../../App";

interface ResultsSummaryProps {
  parts: ReadingPart[];
  answers: Record<string, string>;
  onNavigate: (view: ViewState) => void;
  onReview?: () => void;
}

export function ResultsSummary({ parts, answers, onNavigate, onReview }: ResultsSummaryProps) {
  let totalOverallQuestions = 0;
  let totalOverallCorrect = 0;

  const partScores = parts.map((part) => {
    let partTotal = 0;
    let partCorrect = 0;

    if (part.taskType === "short-text-mc") {
      partTotal = part.items.length;
      part.items.forEach(item => {
        const userAnswer = answers[item.id]?.toLowerCase().trim() || "";
        const correctAnswer = item.correctAnswer.toLowerCase().trim();
        if (userAnswer === correctAnswer) partCorrect++;
      });
    } else {
      partTotal = part.questions.length;
      part.questions.forEach(q => {
        const userAnswer = answers[q.id]?.toLowerCase().trim() || "";
        const correctAnswer = q.correctAnswer.toLowerCase().trim();
        if (userAnswer === correctAnswer) partCorrect++;
      });
    }

    totalOverallQuestions += partTotal;
    totalOverallCorrect += partCorrect;

    return {
      partNumber: part.partNumber,
      title: part.title,
      correct: partCorrect,
      total: partTotal
    };
  });

  const percentage = totalOverallQuestions > 0 ? Math.round((totalOverallCorrect / totalOverallQuestions) * 100) : 0;

  return (
    <div className="flex flex-col bg-background items-center justify-center p-6 py-12">
      <Card className="w-full max-w-2xl p-8">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <span className="text-5xl font-bold text-primary">{percentage}%</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-heading font-bold text-foreground">Test Yakunlandi!</h1>
            <p className="text-muted-foreground text-xl">
              Sizning umumiy natijangiz: {totalOverallCorrect} / {totalOverallQuestions} ta to'g'ri javob
            </p>
          </div>

          <div className="w-full mt-6 space-y-4">
            <h2 className="text-xl font-semibold text-left border-b pb-2">Qismlar bo'yicha natijalar</h2>
            <div className="space-y-3">
              {partScores.map((score) => (
                <div key={score.partNumber} className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center font-bold text-muted-foreground">
                      {score.partNumber}
                    </div>
                    <span className="font-medium text-lg">Part {score.partNumber}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="font-semibold text-success">{score.correct}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-destructive" />
                      <span className="font-semibold text-destructive">{score.total - score.correct}</span>
                    </div>
                    <div className="w-16 text-right font-bold text-muted-foreground">
                      {Math.round((score.correct / score.total) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 w-full space-y-3 pt-4 border-t">
            {onReview && (
              <Button className="w-full" size="lg" variant="default" onClick={onReview}>
                Javoblarni ko'rib chiqish
              </Button>
            )}
            <Button className="w-full" size="lg" variant={onReview ? "outline" : "default"} onClick={() => onNavigate("dashboard")}>
              Bosh sahifaga qaytish
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

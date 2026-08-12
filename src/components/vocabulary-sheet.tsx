import { useVocabulary } from "@/lib/vocabulary-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetPanel } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, BookOpenText } from "lucide-react";
import { useState } from "react";

interface VocabularySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VocabularySheet({ open, onOpenChange }: VocabularySheetProps) {
  const { words, removeWord, clearVocabulary } = useVocabulary();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <BookOpenText className="w-5 h-5 text-primary" />
            <SheetTitle>Vocabulary Bank</SheetTitle>
          </div>
          <SheetDescription>
            Matndan saqlab olingan so'zlar ro'yxati. Ularni takrorlash uchun ishlating.
          </SheetDescription>
        </SheetHeader>
        
        <SheetPanel className="flex flex-col gap-4">
          {words.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center space-y-3">
              <BookOpenText className="w-10 h-10 opacity-20" />
              <p>Lug'atingiz bo'sh. Matndagi so'zlarni belgilab, ularni qo'shishingiz mumkin.</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">Jami: {words.length} ta so'z</span>
                <Button variant="ghost" size="sm" onClick={clearVocabulary} className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Tozalash
                </Button>
              </div>
              <div className="grid gap-2">
                {words.map((item) => (
                  <div key={item.word} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <span className="font-medium">{item.word}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeWord(item.word)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetPanel>
      </SheetContent>
    </Sheet>
  );
}

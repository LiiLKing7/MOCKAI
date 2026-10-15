import { useVocabulary } from "@/lib/vocabulary-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetPanel } from "@/components/ui/sheet";
import { BilimIcon } from "@/components/ui/bilim-icon";

interface VocabularySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VocabularySheet({ open, onOpenChange }: VocabularySheetProps) {
  const { words, removeWord, clearVocabulary } = useVocabulary();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-[var(--paper)] text-[var(--paper-ink)] border-l-4 border-[var(--paper-ink)] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b-3 border-[var(--paper-ink)] bg-[var(--paper-card)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--paper-y)] border-2 border-[var(--paper-ink)] flex items-center justify-center shadow-[2px_2px_0_var(--paper-ink)]">
              <BilimIcon name="bookmark" size={20} />
            </div>
            <div>
              <SheetTitle className="text-xl font-black text-[var(--paper-ink)]">Vocabulary Bank</SheetTitle>
              <SheetDescription className="text-xs font-bold text-[var(--paper-mut)]">
                Matndan saqlab olingan so'zlar ro'yxati
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <SheetPanel className="flex-1 overflow-y-auto p-6 space-y-4">
          {words.length === 0 ? (
            <div className="paper-box p-8 text-center space-y-3 bg-[var(--paper-card)] border-dashed">
              <div className="text-4xl">📖</div>
              <p className="font-black text-sm text-[var(--paper-ink)]">Lug'atingiz hozircha bo'sh</p>
              <p className="text-xs font-bold text-[var(--paper-mut)] leading-relaxed">
                Reading matnlaridagi notanish so'zlarni belgilab, o'z lug'at daftaringizga qo'shib boring!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--paper-mut)]">
                  Jami: {words.length} ta so'z
                </span>
                <button 
                  type="button"
                  onClick={clearVocabulary} 
                  className="paper-btn paper-btn-out paper-btn-sm text-xs py-1 px-2.5 font-black text-[var(--paper-r)] border-[var(--paper-r)] hover:bg-[var(--paper-r)] hover:text-white"
                >
                  <BilimIcon name="trash" size={14} className="mr-1" />
                  Tozalash
                </button>
              </div>

              <div className="space-y-2.5">
                {words.map((item) => (
                  <div 
                    key={item.word} 
                    className="paper-box p-3.5 flex items-center justify-between gap-3 bg-[var(--paper-card)] hover:translate-x-1 transition-transform"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[var(--paper-o)] shrink-0" />
                      <span className="font-black text-base truncate text-[var(--paper-ink)]">{item.word}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeWord(item.word)}
                      className="p-1.5 rounded-lg border-2 border-[var(--paper-ink)] hover:bg-[var(--paper-r)] hover:text-white transition-colors"
                      title="O'chirish"
                    >
                      <BilimIcon name="trash" size={14} />
                    </button>
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

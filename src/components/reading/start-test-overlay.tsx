import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { TextMorph } from '@/components/ui/text-morph';

interface StartTestOverlayProps {
  onComplete: () => void;
}

export function StartTestOverlay({ onComplete }: StartTestOverlayProps) {
  const [phase, setPhase] = useState<'idle' | 'showing' | 'fading' | 'sliding' | 'done'>('idle');

  useEffect(() => {
    let t1: any, t2: any, t3: any;

    setPhase('showing');

    t1 = setTimeout(() => {
      setPhase('fading'); // subtexts fade out
      
      t2 = setTimeout(() => {
        setPhase('sliding'); // background slides up
        
        t3 = setTimeout(() => {
          setPhase('done');
          onComplete();
        }, 500);
      }, 300); // short wait after fade before sliding
    }, 1800); // showing time

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-auto">
      {/* Background slide up */}
      <div 
        className={cn(
          "absolute inset-0 bg-background transition-transform duration-500 ease-in-out z-0 border-b border-border shadow-2xl origin-top",
          phase === 'sliding' ? "scale-y-0" : "scale-y-100"
        )}
      />
      
      <div className={cn(
        "relative z-10 flex flex-col items-center justify-center transition-all duration-500 ease-in-out pointer-events-none",
        phase === 'sliding' ? "opacity-0 translate-y-[-50px]" : "opacity-100 translate-y-0"
      )}>
        <div className={cn("text-xl md:text-2xl text-muted-foreground font-medium mb-4 transition-opacity duration-500", phase === 'fading' || phase === 'sliding' ? "opacity-0" : "opacity-100")}>
          Reading
        </div>
        
        <div className="font-heading font-extrabold text-5xl md:text-8xl text-foreground tracking-tight mb-6 transition-all duration-500 text-center">
          <TextMorph words="Part 1\nShort Texts" delayMs={400} />
        </div>
        
        <div className={cn("flex items-center gap-4 text-lg md:text-xl font-medium text-muted-foreground bg-foreground/5 px-6 py-2 rounded-full border border-border transition-opacity duration-500", phase === 'fading' || phase === 'sliding' ? "opacity-0" : "opacity-100")}>
          5-Part <span className="opacity-50">|</span> 35 minutes
        </div>
      </div>
    </div>
  );
}

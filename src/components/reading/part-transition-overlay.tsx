import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { TextMorph } from '@/components/ui/text-morph';

interface PartTransitionOverlayProps {
  isActive: boolean;
  oldLabel: string;
  newLabel: string;
  onCovered: () => void;
  onComplete: () => void;
}

export function PartTransitionOverlay({ isActive, oldLabel, newLabel, onCovered, onComplete }: PartTransitionOverlayProps) {
  const [phase, setPhase] = useState<'idle' | 'covering' | 'holding' | 'uncovering'>('idle');
  
  const callbacks = useRef({ onCovered, onComplete });
  useEffect(() => {
    callbacks.current = { onCovered, onComplete };
  }, [onCovered, onComplete]);

  useEffect(() => {
    let t1: any, t2: any, t3: any;

    if (isActive) {
      setPhase('covering');
      
      t1 = setTimeout(() => {
        callbacks.current.onCovered();
        setPhase('holding');
        
        t2 = setTimeout(() => {
          setPhase('uncovering');
          
          t3 = setTimeout(() => {
            setPhase('idle');
            callbacks.current.onComplete();
          }, 500);
        }, 1600);
      }, 500);
    } else {
      setPhase('idle');
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isActive]);

  const isVisible = isActive || phase !== 'idle';
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-auto">
      {/* Background Curtain */}
      <div 
        className={cn(
          "absolute inset-0 bg-background transition-transform duration-500 ease-in-out z-0 border-b border-border shadow-2xl",
          (phase === 'covering' || phase === 'idle') ? 'origin-top' : 'origin-bottom',
          (phase === 'covering' || phase === 'holding') ? 'scale-y-100' : 'scale-y-0'
        )}
      />
      
      {/* Text Overlay */}
      <div 
        className={cn(
          "relative z-10 flex flex-col items-center justify-center pointer-events-none transition-all duration-500 ease-out",
          phase === 'holding' ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        )}
      >
        <div className="font-heading font-extrabold text-7xl md:text-9xl text-foreground tracking-tight mb-8">
          <TextMorph words={`${oldLabel}\n${newLabel}`} delayMs={1300} />
        </div>
        <div className="flex items-center gap-4 text-xl md:text-3xl font-medium text-foreground bg-foreground/5 px-6 py-3 rounded-full backdrop-blur-md border border-border shadow-lg">
          <span className="opacity-70">{oldLabel}</span>
          <ArrowRight className="w-6 h-6 md:w-8 md:h-8 opacity-50" />
          <span className="font-bold">{newLabel}</span>
        </div>
      </div>
    </div>
  );
}

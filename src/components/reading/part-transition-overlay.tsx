import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { TextMorph } from "@/components/ui/text-morph";
import { BilimIcon } from "@/components/ui/bilim-icon";

interface PartTransitionOverlayProps {
  isActive: boolean;
  oldLabel: string;
  newLabel: string;
  onCovered: () => void;
  onComplete: () => void;
}

export function PartTransitionOverlay({
  isActive,
  oldLabel,
  newLabel,
  onCovered,
  onComplete,
}: PartTransitionOverlayProps) {
  const [phase, setPhase] = useState<"idle" | "covering" | "holding" | "uncovering">("idle");

  const callbacks = useRef({ onCovered, onComplete });
  useEffect(() => {
    callbacks.current = { onCovered, onComplete };
  }, [onCovered, onComplete]);

  useEffect(() => {
    let t1: any, t2: any, t3: any;

    if (isActive) {
      setPhase("covering");

      t1 = setTimeout(() => {
        callbacks.current.onCovered();
        setPhase("holding");

        t2 = setTimeout(() => {
          setPhase("uncovering");

          t3 = setTimeout(() => {
            setPhase("idle");
            callbacks.current.onComplete();
          }, 450);
        }, 1600);
      }, 450);
    } else {
      setPhase("idle");
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isActive]);

  const isVisible = isActive || phase !== "idle";
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-auto">
      {/* Background Curtain with Paper Texture & Grid */}
      <div
        className={cn(
          "absolute inset-0 bg-[var(--paper)] transition-transform duration-500 ease-in-out z-0 border-b-4 border-[var(--paper-ink)]",
          (phase === "covering" || phase === "idle") ? "origin-top" : "origin-bottom",
          (phase === "covering" || phase === "holding") ? "scale-y-100" : "scale-y-0"
        )}
        style={{
          backgroundImage: "radial-gradient(#1a1a1a20 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Center Hero Paper Card */}
      <div
        className={cn(
          "relative z-10 flex flex-col items-center justify-center p-4 max-w-2xl w-full mx-4 transition-all duration-500 ease-out",
          phase === "holding"
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-90 translate-y-6"
        )}
      >
        <div className="relative w-full paper-box p-8 sm:p-12 bg-[var(--paper-y)] text-[var(--paper-on)] shadow-[10px_10px_0_var(--paper-ink)] border-4 border-[var(--paper-ink)] rounded-[32px] rotate-[-1deg] hover:rotate-[1deg] transition-transform flex flex-col items-center text-center space-y-6 overflow-hidden">
          
          {/* Decorative Corner Watermark */}
          <div
            className="absolute -right-12 -bottom-16 w-48 h-48 border-4 border-[var(--paper-ink)] bg-white/20 rounded-[44%_56%_68%_32%/46%_50%_50%_54%] rotate-[-15deg] pointer-events-none"
            aria-hidden="true"
          />

          {/* Top Eyebrow Badge & Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <span className="paper-badge paper-badge-orange text-xs sm:text-sm font-black px-4 py-1.5 shadow-[3px_3px_0_var(--paper-ink)]">
              ✦ NAVBATDAGI BO'LIM / NEXT PART
            </span>
            <img src="/logo.svg" alt="MockAi" className="w-10 h-10 sm:w-12 sm:h-12 select-none animate-bounce" />
          </div>

          {/* Large Title with Text Morph (PRESERVED AS REQUESTED) */}
          <div className="relative z-10 font-heading font-black text-6xl sm:text-8xl md:text-9xl text-[var(--paper-ink)] tracking-tight leading-none py-2 my-2 drop-shadow-[2px_2px_0_rgba(255,255,255,0.6)]">
            <TextMorph words={`${oldLabel}\n${newLabel}`} delayMs={1100} />
          </div>

          {/* Transfer Pill (Old Part -> New Part) */}
          <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-5 text-base sm:text-2xl font-black bg-[var(--paper-card)] text-[var(--paper-ink)] px-6 sm:px-8 py-3 rounded-2xl border-3 border-[var(--paper-ink)] shadow-[5px_5px_0_var(--paper-ink)]">
            <span className="text-[var(--paper-mut)] line-through decoration-2 opacity-80">
              {oldLabel}
            </span>
            <BilimIcon name="next" size={24} className="shrink-0 animate-pulse" />
            <span className="text-[var(--paper-ink)] bg-[var(--paper-g)] px-3 py-0.5 rounded-xl border-2 border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)]">
              {newLabel}
            </span>
          </div>

          {/* Cheering Footnote */}
          <div className="relative z-10 pt-1 text-xs sm:text-sm font-black text-[var(--paper-ink)] tracking-wide opacity-90">
            ⚡ Zo'r ketmoqdasiz! Diqqatni jamlang va davom eting 💪
          </div>
        </div>
      </div>
    </div>
  );
}

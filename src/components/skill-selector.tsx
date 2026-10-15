import { BilimIcon } from "@/components/ui/bilim-icon";
import { cn } from "@/lib/utils";
import { ViewState } from "../App";

const skills = [
  {
    id: "reading",
    title: "Reading",
    subtitle: "5 ta bo'lim · 35 ta savol",
    desc: "Qisqa xabarlar, moslashtirish, asosiy matn va bo'sh o'rinlar",
    iconName: "book",
    bgColor: "bg-[var(--paper-b)]",
    badge: "CEFR Mock #1",
    enabled: true,
  },
  {
    id: "listening",
    title: "Listening",
    subtitle: "Audioni tinglash va javob berish",
    desc: "Dialoglar, e'lonlar va monologlar asosida testlar",
    iconName: "volume",
    bgColor: "bg-[var(--paper-p)]",
    badge: "Audio Test",
    enabled: true,
  },
  {
    id: "speaking",
    title: "Speaking AI",
    subtitle: "AI Intervyu simulyatori",
    desc: "Jonli ovozli suhbat, Part 1-3 va lahzalik fikr-mulohazalar",
    iconName: "flame",
    bgColor: "bg-[var(--paper-g)]",
    badge: "AI Coach",
    enabled: true,
  },
  {
    id: "grammar",
    title: "Grammar Master",
    subtitle: "Darslar va mashqlar",
    desc: "Zamonlar, passiv nisbat, shart gaplar va amaliy qoidalar",
    iconName: "pencil",
    bgColor: "bg-[var(--paper-y)]",
    badge: "Interactive",
    enabled: true,
  },
];

interface SkillSelectorProps {
  onNavigate: (view: ViewState) => void;
}

export function SkillSelector({ onNavigate }: SkillSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-4xl mx-auto text-left">
      {skills.map((skill) => {
        const isDisabled = !skill.enabled;

        return (
          <div
            key={skill.id}
            onClick={() => !isDisabled && onNavigate(skill.id as ViewState)}
            className={cn(
              "paper-box p-6 flex flex-col justify-between transition-all duration-200 select-none",
              isDisabled
                ? "opacity-60 cursor-not-allowed bg-[var(--paper-soft)]"
                : "cursor-pointer hover:-translate-y-1 hover:rotate-[-0.7deg] hover:shadow-[7px_7px_0_var(--paper-ink)] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_var(--paper-ink)]"
            )}
          >
            {/* Top header row */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl border-3 border-[var(--paper-ink)] flex items-center justify-center shadow-[3px_3px_0_var(--paper-ink)] shrink-0",
                  skill.bgColor
                )}
              >
                <BilimIcon name={skill.iconName} size={32} />
              </div>

              <span className="paper-badge paper-badge-paper text-xs font-black">
                {skill.badge}
              </span>
            </div>

            {/* Content */}
            <div className="space-y-1.5 mb-5 flex-1">
              <h3 className="text-2xl font-black font-heading text-[var(--paper-ink)]">
                {skill.title}
              </h3>
              <p className="text-xs font-bold text-[var(--paper-mut)] uppercase tracking-wider">
                {skill.subtitle}
              </p>
              <p className="text-sm font-semibold text-[var(--paper-ink)] leading-snug pt-1">
                {skill.desc}
              </p>
            </div>

            {/* Bottom action button */}
            <div className="pt-3 border-t-2 border-[var(--paper-ink)] flex items-center justify-between">
              <span className="text-xs font-black text-[var(--paper-ink)] flex items-center gap-1.5">
                <span>Boshlash</span>
                <BilimIcon name="next" size={16} />
              </span>

              <span className="text-xs font-bold text-[var(--paper-mut)]">
                {skill.id === "speaking" ? "AI Ovozli" : "Daraja: B1-C1"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

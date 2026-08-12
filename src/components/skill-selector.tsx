import { BookOpen, Headphones, PenLine, Mic } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ViewState } from "../App";

const skills = [
  {
    id: "reading",
    label: "O'qish",
    icon: BookOpen,
    href: "/test/reading",
    enabled: true,
  },
  {
    id: "listening",
    label: "Tinglash",
    icon: Headphones,
    href: "/test/listening",
    enabled: true,
  },
  {
    id: "writing",
    label: "Yozish",
    icon: PenLine,
    href: "#",
    enabled: false,
  },
  {
    id: "speaking",
    label: "Gapirish",
    icon: Mic,
    href: "#",
    enabled: true,
  },
];

interface SkillSelectorProps {
  onNavigate: (view: ViewState) => void;
}

export function SkillSelector({ onNavigate }: SkillSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
      {skills.map((skill) => {
        const Icon = skill.icon;
        const isDisabled = !skill.enabled;

        const cardContent = (
          <Card
            className={cn(
              "relative h-32 flex flex-col items-center justify-center transition-all duration-200",
              isDisabled
                ? "opacity-60 cursor-not-allowed bg-muted/50"
                : "hover:border-primary hover:shadow-sm cursor-pointer"
            )}
          >
            {isDisabled && (
              <Badge variant="secondary" className="absolute top-3 right-3 text-xs">
                Tez orada
              </Badge>
            )}
            <Icon className={cn("h-8 w-8 mb-2", isDisabled ? "text-muted-foreground" : "text-primary")} />
            <span className={cn("font-medium text-lg", isDisabled ? "text-muted-foreground" : "text-foreground")}>
              {skill.label}
            </span>
          </Card>
        );

        if (isDisabled) {
          return <div key={skill.id}>{cardContent}</div>;
        }

        return (
          <div 
            key={skill.id} 
            onClick={() => onNavigate(skill.id as ViewState)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl cursor-pointer"
          >
            {cardContent}
          </div>
        );
      })}
    </div>
  );
}

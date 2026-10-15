import React from "react";

interface MockAiLogoProps {
  size?: number | string;
  className?: string;
  withText?: boolean;
  textSize?: "sm" | "md" | "lg" | "xl";
}

export function MockAiLogo({
  size = 40,
  className = "",
  withText = false,
  textSize = "md",
}: MockAiLogoProps) {
  const fontSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none group cursor-pointer ${className}`}>
      {/* 3D Paper organic blob with centered sparkle star */}
      <div
        style={{ width: size, height: size }}
        className="relative shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
        >
          {/* Paper-style 3D shadow offset */}
          <path
            d="M48 8 C76 6, 94 24, 94 48 C94 76, 76 94, 48 94 C20 94, 6 76, 6 48 C6 24, 20 10, 48 8 Z"
            transform="translate(4, 4)"
            fill="#1a1a1a"
            stroke="#1a1a1a"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Main bold organic paper blob - NO inner concentric ring */}
          <path
            d="M48 8 C76 6, 94 24, 94 48 C94 76, 76 94, 48 94 C20 94, 6 76, 6 48 C6 24, 20 10, 48 8 Z"
            fill="#ff5722"
            stroke="#1a1a1a"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          {/* Centered 4-pointed sparkle star */}
          <path
            d="M50 20 C50 37 38 49 20 49 C38 49 50 61 50 78 C50 61 62 49 80 49 C62 49 50 37 50 20 Z"
            fill="#ffffff"
            stroke="#1a1a1a"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* STRICTLY "MockAi" with Mock in black and Ai in orange - NO SUBTITLE TEXT */}
      {withText && (
        <span
          className={`font-black tracking-tight leading-none text-[#1a1a1a] ${fontSizes[textSize]}`}
          style={{ fontFamily: 'ui-rounded, "Trebuchet MS", Arial, sans-serif' }}
        >
          Mock<span style={{ color: "#ff5722" }}>Ai</span>
        </span>
      )}
    </div>
  );
}

export default MockAiLogo;

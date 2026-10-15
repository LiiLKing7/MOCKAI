import { useState, useEffect } from "react";

interface PaperFlameProps {
  size?: number | string;
  className?: string;
  isRecord?: boolean;
}

// 6 distinct hand-drawn paper flame frame paths (outer body and inner yellow core)
const FLAME_FRAMES = [
  // Frame 1: Standard upright flame
  {
    outer: "M24 3 C27 11 36 15 36 27 C36 36 30 43 24 43 C18 43 12 36 12 27 C12 20 16 16 18 13 C18 16 20 18 22 18 C20 12 20 7 24 3 Z",
    inner: "M24 23 C26 27 28 29 28 33 C28 37 26 39 24 39 C22 39 20 37 20 33 C20 30 22 29 23 27 C23 29 24 30 24.5 30 C24 28 23.5 25 24 23 Z",
  },
  // Frame 2: Flickering right
  {
    outer: "M24 2 C28 9 37 13 37 26 C37 35 31 43 24 43 C17 43 11 37 11 28 C11 21 15 17 19 15 C18 18 21 20 23 20 C22 13 22 7 24 2 Z",
    inner: "M25 22 C27 26 29 28 29 32 C29 36 27 39 25 39 C23 39 21 37 21 33 C21 30 23 29 24 27 C24 29 25 30 25.5 30 C25 27 24.5 24 25 22 Z",
  },
  // Frame 3: Dual tongue top
  {
    outer: "M22 3 C25 10 32 12 32 19 C35 17 37 21 37 28 C37 36 30 43 24 43 C18 43 12 36 12 28 C12 22 15 16 19 12 C18 15 20 18 21 18 C21 12 20 8 22 3 Z",
    inner: "M23 23 C25 27 28 28 28 33 C28 37 26 39 24 39 C22 39 20 37 20 33 C20 30 21 29 22 27 C22 29 23 30 23.5 30 C23 27 22.5 25 23 23 Z",
  },
  // Frame 4: Leaning left with higher tip
  {
    outer: "M25 2 C24 8 20 12 20 17 C17 15 11 20 11 28 C11 36 17 43 24 43 C31 43 37 36 37 27 C37 19 32 15 29 11 C29 14 27 16 25 16 C27 11 27 6 25 2 Z",
    inner: "M23 22 C22 26 20 28 20 32 C20 36 22 39 24 39 C26 39 28 37 28 33 C28 30 26 29 25 27 C25 29 24 30 23.5 30 C24 27 23.5 24 23 22 Z",
  },
  // Frame 5: Broad crackling flame
  {
    outer: "M24 3 C28 11 38 16 38 29 C38 37 31 43 24 43 C17 43 10 37 10 29 C10 21 15 17 18 13 C18 17 21 19 23 19 C21 13 21 8 24 3 Z",
    inner: "M24 24 C27 28 29 30 29 34 C29 38 27 40 24 40 C21 40 19 38 19 34 C19 31 21 30 22 28 C22 30 23 31 24 31 C23.5 28 23 26 24 24 Z",
  },
  // Frame 6: Dynamic spark crest
  {
    outer: "M23 2 C27 9 35 14 35 26 C35 35 30 43 24 43 C18 43 12 36 12 27 C12 19 17 15 19 12 C19 15 22 17 23 17 C22 11 21 7 23 2 Z",
    inner: "M24 23 C26 27 28 29 28 33 C28 37 26 39 24 39 C22 39 20 37 20 33 C20 29 22 28 23 26 C23 28 24 29 24.5 29 C24 27 23.5 25 24 23 Z",
  },
];

export function PaperFlame({ size = 26, className = "", isRecord = false }: PaperFlameProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    // 140ms cadence creates a hand-drawn cartoon paper flipbook effect
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % FLAME_FRAMES.length);
    }, 140);
    return () => clearInterval(timer);
  }, []);

  const currentFrame = FLAME_FRAMES[frameIndex];

  return (
    <div
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center select-none shrink-0 ${
        isRecord ? "scale-110 drop-shadow-[0_0_8px_rgba(255,87,34,0.4)]" : ""
      } ${className}`}
      title={isRecord ? "Yangi Shaxsiy Rekord! 🔥" : "Maksimal Rekord Olovi 🔥"}
      aria-label="Paper style jonli olov"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="w-full h-full overflow-visible"
      >
        {/* Paper-style black drop shadow offset */}
        <path
          d={currentFrame.outer}
          transform="translate(2.5, 2.5)"
          fill="#1a1a1a"
          stroke="#1a1a1a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Outer flame body - Vibrant paper orange */}
        <path
          d={currentFrame.outer}
          fill="#ff5722"
          stroke="#1a1a1a"
          strokeWidth="2.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Inner flame core - Warm golden yellow */}
        <path
          d={currentFrame.inner}
          fill="#ffd84d"
          stroke="#1a1a1a"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default PaperFlame;

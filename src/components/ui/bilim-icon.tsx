import React from "react";

// Icon definition palette
const COLOR_MAP: Record<string, string> = {
  w: "#fffef8",
  r: "#ff8f85",
  y: "#ffd84d",
  g: "#b6ef88",
  b: "#a8d9ff",
  p: "#d9c3ff",
  o: "#ff5722",
  k: "#1a1a1a",
  n: "#d6d1c0",
};

export const ICON_DEFINITIONS: Record<string, { name: string; colors: string; svg: string }> = {
  book: {
    name: "Darslar",
    colors: "bw",
    svg: `<path class="a" d="M4 12c7-2 14-1 20 3 6-4 13-5 20-3v26c-7-2-14-1-20 3-6-4-13-5-20-3z"/><path class="b" d="M8 15c6-1 12 0 16 3 4-3 10-4 16-3v20c-6-1-12 0-16 3-4-3-10-4-16-3z"/><path class="d" d="M24 18v20"/>`,
  },
  clock: {
    name: "Vaqt",
    colors: "bw",
    svg: `<circle class="a" cx="24" cy="24" r="19"/><circle class="b" cx="24" cy="24" r="13.5"/><path class="d" d="M24 15v10l7 4"/>`,
  },
  check: {
    name: "Tayyor",
    colors: "g",
    svg: `<circle class="a" cx="24" cy="24" r="19"/><path class="l" d="M14 25l7 7 13-15"/>`,
  },
  close: {
    name: "Yopish",
    colors: "r",
    svg: `<circle class="a" cx="24" cy="24" r="19"/><path class="l" d="M16 16l16 16M32 16L16 32"/>`,
  },
  next: {
    name: "Keyingi",
    colors: "b",
    svg: `<circle class="a" cx="24" cy="24" r="19"/><path class="l" d="M14 24h19M25 15l9 9-9 9"/>`,
  },
  back: {
    name: "Orqaga",
    colors: "b",
    svg: `<circle class="a" cx="24" cy="24" r="19"/><path class="l" d="M34 24H15M23 15l-9 9 9 9"/>`,
  },
  trophy: {
    name: "Kubok",
    colors: "yo",
    svg: `<path class="d" d="M14 11H7c0 7 3 11 8 12M34 11h7c0 7-3 11-8 12"/><path class="a" d="M12 6h24v13c0 7-5 12-12 12S12 26 12 19z"/><rect class="b" x="20" y="30" width="8" height="7"/><rect class="b" x="13" y="36" width="22" height="7" rx="3"/><path class="l" d="M18 12v7"/>`,
  },
  podium: {
    name: "Reyting",
    colors: "ybo",
    svg: `<rect class="b" x="4" y="22" width="13" height="21" rx="3"/><rect class="a" x="17" y="11" width="14" height="32" rx="3"/><rect class="c" x="31" y="28" width="13" height="15" rx="3"/><path class="l" d="M21 19l3-3v12"/>`,
  },
  star: {
    name: "Yulduz",
    colors: "y",
    svg: `<path class="a q" transform="translate(24 24) scale(.88) translate(-24 -24)" d="M24 4l6.3 13.3 14.2 2-10.2 9.9 2.4 14.1L24 36.7 11.3 43.3l2.4-14.1L3.5 19.3l14.2-2z"/>`,
  },
  bulb: {
    name: "Maslahat",
    colors: "yn",
    svg: `<path class="a" d="M24 4c-8.5 0-15 6.5-15 14 0 5 3 8 5.5 11V34h19v-5c2.5-3 5.5-6 5.5-11 0-7.5-6.5-14-15-14z"/><rect class="b" x="17" y="37" width="14" height="6" rx="3"/><path class="l" d="M16 18c1-4 4-7 8-7"/>`,
  },
  pencil: {
    name: "Yozish",
    colors: "ywr",
    svg: `<g transform="rotate(45 24 24)"><rect class="a" x="18" y="3" width="12" height="30"/><path class="b" d="M18 33h12l-6 12z"/><rect class="c" x="18" y="3" width="12" height="7" rx="2"/><path class="g" d="M22.5 41.5 24 45l1.5-3.5z"/></g>`,
  },
  quiz: {
    name: "Savol",
    colors: "p",
    svg: `<path class="a" d="M8 6h32a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H27l-9 8v-8H8a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z"/><path class="l" d="M19 16c0-3 2-5 5-5s5 2 5 5c0 4-5 4-5 7"/><circle class="dt" cx="24" cy="29" r="2"/>`,
  },
  target: {
    name: "Maqsad",
    colors: "rw",
    svg: `<circle class="a" cx="24" cy="24" r="19"/><circle class="b" cx="24" cy="24" r="12.5"/><circle class="a" cx="24" cy="24" r="6"/><path class="d" d="M24 24L38 10M32 9l1 7 7 1"/>`,
  },
  home: {
    name: "Bosh sahifa",
    colors: "yro",
    svg: `<path class="a" d="M9 23v16a3 3 0 0 0 3 3h24a3 3 0 0 0 3-3V23L24 11z"/><path class="b q" d="M5 26 24 8l19 18-3 3L24 14 8 29z"/><rect class="c" x="19" y="29" width="10" height="13" rx="3"/>`,
  },
  user: {
    name: "Profil",
    colors: "b",
    svg: `<circle class="a" cx="24" cy="15" r="10"/><path class="a" d="M6 43c0-10 8-17 18-17s18 7 18 17z"/>`,
  },
  flame: {
    name: "Seriya",
    colors: "oy",
    svg: `<path class="a" d="M24 3c1 8 10 12 10 23 0 8-4 15-10 15s-10-7-10-15c0-4 2-7 3-10 1 3 3 5 5 5 0-6-1-11 2-18z"/><path class="b" d="M24 24c3 4 6 6 6 10.5 0 3.5-2.5 5-6 5s-6-1.5-6-5c0-3 2-5 3-7 1 1 2 2 3 2z"/>`,
  },
  flag: {
    name: "Bayroq",
    colors: "gwn",
    svg: `<rect class="c" x="9" y="5" width="6" height="38" rx="3"/><path class="a" d="M15 8c8-4 12 4 20 0 3-1 5-1 7 0v18c-2-1-4-1-7 0-8 4-12-4-20 0z"/>`,
  },
  cap: {
    name: "Ta'lim",
    colors: "bw",
    svg: `<path class="a q" d="M24 7 3 17.5 24 28l21-10.5z"/><path class="b" d="M11 24v9c0 3.5 6 7 13 7s13-3.5 13-7v-9l-13 6z"/><path class="d" d="M43 20v13"/>`,
  },
  eye: {
    name: "Ko'z",
    colors: "bw",
    svg: `<path class="a" d="M3 24C8 15 15 11 24 11s16 4 21 13c-5 9-12 13-21 13S8 33 3 24z"/><circle class="b" cx="24" cy="24" r="9"/><circle class="g" cx="24" cy="24" r="4"/><circle class="dt" cx="21.5" cy="21.5" r="1.8"/>`,
  },
  search: {
    name: "Qidiruv",
    colors: "bw",
    svg: `<rect class="a" x="29" y="25" width="19" height="9" rx="4.5" transform="rotate(45 29 29)"/><circle class="a" cx="20" cy="20" r="15"/><circle class="b" cx="20" cy="20" r="9.5"/>`,
  },
  shield: {
    name: "Himoya",
    colors: "b",
    svg: `<path class="a q" d="M24 4l16 6v12c0 10-7 17-16 22C15 39 8 32 8 22V10z"/><path class="l" d="M16 24l6 6 11-12"/>`,
  },
  bolt: {
    name: "XP",
    colors: "y",
    svg: `<path class="a q" d="M28 4 10 27h12l-4 17 20-25H26z"/>`,
  },
  gem: {
    name: "Olmos",
    colors: "bw",
    svg: `<path class="a q" d="M14 8h20l9 11-19 22L5 19z"/><path class="b" style="opacity:.5" d="M14 8h20l9 11H5z"/><path class="l" d="M19 19l5 20 5-20"/>`,
  },
  crown: {
    name: "Toj",
    colors: "yo",
    svg: `<path class="a q" d="M6 15l9 9 9-14 9 14 9-9-4 22H10z"/><rect class="b" x="10" y="35" width="28" height="7" rx="3"/>`,
  },
  bar: {
    name: "Ustunli",
    colors: "bgo",
    svg: `<rect class="a" x="6" y="26" width="10" height="17" rx="3"/><rect class="b" x="19" y="15" width="10" height="28" rx="3"/><rect class="c" x="32" y="5" width="10" height="38" rx="3"/>`,
  },
};

export type BilimIconName = keyof typeof ICON_DEFINITIONS;

interface BilimIconProps {
  name: BilimIconName | string;
  size?: number | string;
  className?: string;
  overrideColors?: string;
}

export function BilimIcon({ name, size = 32, className = "", overrideColors }: BilimIconProps) {
  const def = ICON_DEFINITIONS[name] || ICON_DEFINITIONS["book"];
  const colorStr = overrideColors || def.colors;
  const chars = colorStr.split("");

  // Build paper style SVG parts:
  // Ink stroke: #1a1a1a, stroke width: 2.2px
  // Shadow offset: (2.5px, 2.5px) with ink fill
  const ink = "#1a1a1a";

  const renderSvgContent = (isShadow: boolean) => {
    return def.svg.replace(/class="([^"]+)"/g, (_, cl) => {
      const parts = cl.split(" ");
      const tag = parts[0];
      const idx = "abceh".indexOf(tag);

      if (idx >= 0) {
        const fill = isShadow ? ink : COLOR_MAP[chars[idx]] || COLOR_MAP.w;
        const strokeAttr = isShadow ? ` stroke="${ink}" stroke-width="2.2"` : ` stroke="${ink}" stroke-width="2.2"`;
        return `fill="${fill}"${strokeAttr} stroke-linejoin="round"`;
      }
      if (tag === "dt" || tag === "g") {
        return `fill="${ink}"`;
      }
      // 'l' or 'd' lines
      return `fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
    });
  };

  const shadowContent = renderSvgContent(true);
  const mainContent = renderSvgContent(false);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={`inline-block shrink-0 select-none ${className}`}
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      {/* Offset drop shadow layer */}
      <g transform="translate(2.5, 2.5)" opacity="0.9" dangerouslySetInnerHTML={{ __html: shadowContent }} />
      {/* Front colored layer */}
      <g dangerouslySetInnerHTML={{ __html: mainContent }} />
    </svg>
  );
}

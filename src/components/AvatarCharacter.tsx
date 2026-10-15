import React, { useEffect, useRef } from "react";

export type AvatarId = "madina" | "dilnoza" | "jasur" | "sardor";

export interface AvatarOption {
  id: AvatarId;
  name: string;
  gender: "female" | "male";
  genderLabel: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "madina", name: "Madina", gender: "female", genderLabel: "Qiz bola" },
  { id: "dilnoza", name: "Dilnoza", gender: "female", genderLabel: "Qiz bola" },
  { id: "jasur", name: "Jasur", gender: "male", genderLabel: "O'g'il bola" },
  { id: "sardor", name: "Sardor", gender: "male", genderLabel: "O'g'il bola" },
];

export function celebrateActiveAvatars(cnt = 14) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("avatar-celebrate", { detail: { count: cnt } }));
}

interface CharacterConfig {
  name: string;
  gender: "female" | "male";
  bg: string;
  skin: string;
  hair: string;
  top: string;
  tt: "tee" | "hoodie" | "collar";
  ear?: boolean;
  fr?: boolean;
  gl?: boolean;
  ac?: string;
  st: "f1" | "f2" | "m1" | "m2";
}

const CHARACTERS: Record<AvatarId, CharacterConfig> = {
  madina: {
    name: "Madina",
    gender: "female",
    bg: "#ffd84d",
    skin: "#ffd9b8",
    hair: "#2b2118",
    st: "f1",
    top: "#ff5722",
    tt: "tee",
    ear: true,
  },
  dilnoza: {
    name: "Dilnoza",
    gender: "female",
    bg: "#b6ef88",
    skin: "#e9b48a",
    hair: "#c0572b",
    st: "f2",
    top: "#a8d9ff",
    tt: "hoodie",
    fr: true,
    ac: "#ff5722",
  },
  jasur: {
    name: "Jasur",
    gender: "male",
    bg: "#ff9a90",
    skin: "#f2b98c",
    hair: "#4a2c1a",
    st: "m1",
    top: "#ffd84d",
    tt: "tee",
  },
  sardor: {
    name: "Sardor",
    gender: "male",
    bg: "#a8d9ff",
    skin: "#ffd9b8",
    hair: "#1f1712",
    st: "m2",
    top: "#d9c3ff",
    tt: "collar",
    gl: true,
  },
};

const PAL = ["#ff5722", "#ffd84d", "#b6ef88", "#a8d9ff", "#d9c3ff", "#ff9a90"];
const G = 900;

interface Spring {
  x: number;
  v: number;
}

interface AvatarState {
  el: HTMLElement;
  rt: SVGGElement | null;
  hd: SVGGElement | null;
  hb: SVGGElement | null;
  hf: SVGGElement | null;
  fc: SVGGElement | null;
  ey: SVGGElement | null;
  b1: SVGGElement | null;
  b2: SVGGElement | null;
  gs: SVGEllipseElement | null;
  zz: SVGGElement | null;
  bl: SVGGElement[];
  ck: SVGCircleElement[];
  sq: Spring;
  hr: Spring;
  hs: Spring;
  hx: Spring;
  hy: Spring;
  ln: Spring;
  lx: number;
  ly: number;
  tx: number;
  ty: number;
  y: number;
  vy: number;
  air: number;
  crouch: number;
  fp: { t0: number; dur: number; turns: number } | null;
  hold: number;
  holdT: number;
  charge: number;
  hover: number;
  bsh: number;
  mood: { e: string; m: string; b?: number; shy?: number; until: number } | null;
  wob: { t0: number; dur: number; amp: number; f: number } | null;
  q: [number, () => void][];
  e: string;
  m: string;
  ci: number;
  near: boolean;
  sd: number;
  nb: number;
  b0: number;
  nh: number;
  nw: number;
}

const cl = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const n = (v: number) => v.toFixed(2);
const sp = (s: Spring, t: number, k: number, c: number, dt: number) => {
  s.v += ((t - s.x) * k - s.v * c) * dt;
  s.x += s.v * dt;
};
const ez = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function triggerConfetti(el: HTMLElement, cnt: number) {
  if (typeof window === "undefined") return;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height * 0.4;
  for (let i = 0; i < cnt; i++) {
    const e = document.createElement("i");
    const s = 6 + Math.random() * 6;
    e.className = "cf";
    e.style.left = `${cx}px`;
    e.style.top = `${cy}px`;
    e.style.width = `${s}px`;
    e.style.height = `${s}px`;
    e.style.background = PAL[i % PAL.length];
    e.style.borderRadius = Math.random() < 0.4 ? "50%" : "2px";
    document.body.appendChild(e);
    const g = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
    const v = 120 + Math.random() * 180;
    const vx = Math.cos(g) * v;
    const vy = Math.sin(g) * v;
    e.animate(
      [
        { transform: "translate(0,0) rotate(0)", opacity: 1 },
        {
          transform: `translate(${vx * 0.5}px,${vy * 0.5}px) rotate(${
            180 + Math.random() * 180
          }deg)`,
          opacity: 1,
          offset: 0.4,
        },
        {
          transform: `translate(${vx}px,${vy + 260}px) rotate(${
            400 + Math.random() * 300
          }deg)`,
          opacity: 0,
        },
      ],
      { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.3,.6,.5,1)" }
    ).onfinish = () => e.remove();
  }
}

function hop(
  a: AvatarState,
  h: number,
  o: { mood?: any; dur?: number; crouch?: number; turns?: number; n?: number } = {}
) {
  if (o.mood) a.mood = { ...o.mood, until: performance.now() + (o.dur || 900) };
  if (a.air) return;
  a.crouch = 1;
  const crouchMs = o.crouch ?? 110;
  a.q.push([
    performance.now() + crouchMs,
    () => {
      a.crouch = 0;
      a.air = 1;
      a.vy = Math.sqrt(2 * G * h);
      a.sq.x = 0.2;
      a.sq.v = 0;
      if (o.turns) {
        a.fp = { t0: performance.now(), dur: ((2 * a.vy) / G) * 1000 * 0.94, turns: o.turns };
      }
      if (o.n) triggerConfetti(a.el, o.n);
    },
  ]);
}

const laugh = { e: "happy", m: "grin", b: 1 };
const REACTIONS = [
  (a: AvatarState) => hop(a, 28, { n: 8, mood: laugh, dur: 1000 }),
  (a: AvatarState) =>
    hop(a, 34, { turns: 1, n: 10, mood: { e: "open", m: "grin", b: 1 }, dur: 1100 }),
  (a: AvatarState) => {
    const t = performance.now();
    a.mood = { e: "happy", m: "smile", b: 0, shy: 1, until: t + 1500 };
    a.wob = { t0: t, dur: 1100, amp: 0.2, f: 34 };
    hop(a, 9, { crouch: 60 });
  },
  (a: AvatarState) => {
    a.mood = { e: "open", m: "o", b: 2, until: performance.now() + 500 };
    a.sq.x = 0.16;
    a.sq.v = 0;
    a.q.push([
      performance.now() + 480,
      () => hop(a, 24, { n: 6, mood: laugh, dur: 900 }),
    ]);
  },
];

function clickReact(a: AvatarState) {
  let i: number;
  do {
    i = (Math.random() * REACTIONS.length) | 0;
  } while (i === a.ci && REACTIONS.length > 1);
  a.ci = i;
  REACTIONS[i](a);
}

function launch(a: AvatarState, c: number) {
  hop(a, 30 + c * 42, {
    crouch: 30,
    turns: c > 0.7 ? 2 : 1,
    n: 8 + Math.round(c * 16),
    mood: laugh,
    dur: 1300,
  });
}

function step(a: AvatarState, now: number, dt: number, lastMove: number) {
  for (let i = a.q.length; i--; ) {
    if (now >= a.q[i][0]) {
      const f = a.q[i][1];
      a.q.splice(i, 1);
      f();
    }
  }

  const asleep = now - lastMove > 25000 && !a.hold && !a.air;
  if (a.mood && now > a.mood.until) a.mood = null;
  if (!asleep && !a.air && !a.crouch && !a.hold && !a.mood && !a.hover && now > a.nh) {
    a.nh = now + 8000 + Math.random() * 8000;
    hop(a, 16, { mood: laugh, dur: 800 });
  }
  if (!a.near && now > a.nw) {
    a.tx = (Math.random() * 2 - 1) * 0.8;
    a.ty = (Math.random() * 2 - 1) * 0.5;
    a.nw = now + 1300 + Math.random() * 2400;
  }
  if (asleep) {
    a.tx = 0;
    a.ty = 0.6;
  }

  const k = Math.min(1, dt * 9);
  a.lx += (a.tx - a.lx) * k;
  a.ly += (a.ty - a.ly) * k;

  if (a.hold) a.holdT += dt;
  const hd = a.hold && a.holdT > 0.2;
  const chg = hd ? cl((a.holdT - 0.2) / 0.9, 0, 1) : 0;
  a.charge = chg;

  let sqT =
    Math.sin((now / 1000) * (asleep ? 1.1 : 2.1) + a.sd * 6) *
    (asleep ? 0.02 : 0.011);
  let hrT = a.lx * 0.12;
  let hxT = a.lx * 2.2;
  let hyT = a.ly * 1.4;
  let shake = 0;

  if (hd) {
    sqT = -0.26 * chg;
    shake = Math.sin(now / 22) * chg * 1.9;
    hrT += Math.sin(now / 38) * 0.05 * chg;
  }
  if (a.crouch) sqT = -0.26;
  if (asleep) {
    hrT = 0.15;
    hyT = 4;
    hxT = 2;
  }
  if (a.air) sqT = cl(a.vy / 1100, -0.14, 0.22);
  if (a.wob) {
    const p = (now - a.wob.t0) / a.wob.dur;
    if (p >= 1) a.wob = null;
    else hrT += Math.sin(p * a.wob.f) * a.wob.amp * (1 - p);
  }

  sp(a.sq, sqT, 230, 13, dt);
  sp(a.hr, hrT, 160, 12, dt);
  sp(a.hs, a.hr.x, 70, 6, dt);
  sp(a.hx, hxT, 160, 16, dt);
  sp(a.hy, hyT, 160, 16, dt);
  sp(a.ln, a.lx * 0.025, 120, 12, dt);

  if (a.air) {
    a.vy -= G * dt;
    a.y += a.vy * dt;
    if (a.y <= 0 && a.vy < 0) {
      const im = -a.vy;
      a.y = 0;
      a.vy = 0;
      a.air = 0;
      a.sq.x = -cl(im / 650, 0.1, 0.34);
      a.sq.v = 0;
      a.hs.v += (Math.random() < 0.5 ? -1 : 1) * 3;
    }
  }

  let fa = 0;
  if (a.fp) {
    const p = (now - a.fp.t0) / a.fp.dur;
    if (p >= 1) a.fp = null;
    else fa = a.fp.turns * 6.2832 * ez(p);
  }

  // Face expression
  let e = "open";
  let m = "smile";
  let brow = 0;

  if (asleep) {
    e = "sleep";
    m = "flat";
  } else if (hd) {
    e = "squeeze";
    m = "o";
  } else if (a.mood) {
    e = a.mood.e;
    m = a.mood.m;
    brow = a.mood.b || 0;
  } else if (a.hover) {
    brow = 1;
  }

  if (a.e !== e) {
    a.el.dataset.e = a.e = e;
  }
  if (a.m !== m) {
    a.el.dataset.m = a.m = m;
  }

  if (now > a.nb) {
    a.b0 = now;
    a.nb = now + 2200 + Math.random() * 3200;
  }
  const bp = (now - a.b0) / 150;
  const bs =
    e === "open" && bp >= 0 && bp < 1 ? 1 - Math.sin(bp * Math.PI) * 0.92 : 1;
  a.bl.forEach((g) => g.setAttribute("transform", `scale(1 ${n(bs)})`));

  a.bsh +=
    (Math.max(a.mood && a.mood.shy ? 1 : 0, chg, a.hover ? 0.45 : 0) - a.bsh) *
    Math.min(1, dt * 8);
  a.ck.forEach((c) => {
    c.setAttribute("opacity", n(0.18 + 0.75 * a.bsh));
    c.setAttribute("r", n(4.6 * (1 + chg * 0.4)));
  });

  const up = brow * 3.5;
  const sl = hd ? 10 : 0;
  if (a.b1)
    a.b1.setAttribute("transform", `translate(0 ${-up}) rotate(${sl} 51 47)`);
  if (a.b2)
    a.b2.setAttribute("transform", `translate(0 ${-up}) rotate(${-sl} 69 47)`);
  if (a.fc)
    a.fc.setAttribute("transform", `translate(${n(a.lx * 2.2)} ${n(a.ly * 1.5)})`);
  if (a.ey)
    a.ey.setAttribute("transform", `translate(${n(a.lx * 1.8)} ${n(a.ly * 1.4)})`);
  if (a.hd)
    a.hd.setAttribute(
      "transform",
      `translate(${n(a.hx.x)} ${n(a.hy.x)}) rotate(${n(a.hr.x * 57.3)} 60 82)`
    );
  if (a.hf)
    a.hf.setAttribute("transform", `rotate(${n((a.hs.x - a.hr.x) * 57.3)} 60 28)`);
  if (a.hb)
    a.hb.setAttribute("transform", `rotate(${n(a.hs.x * 57.3)} 60 40)`);

  const sy = 1 + a.sq.x;
  const sx = 1 - a.sq.x * 0.7;
  if (a.rt) {
    a.rt.setAttribute(
      "transform",
      `translate(${n(60 + shake)} ${n(112 - a.y)}) rotate(${n(
        a.ln.x * 57.3
      )}) scale(${(sx * Math.cos(fa)).toFixed(3)} ${sy.toFixed(
        3
      )}) translate(-60 -112)`
    );
  }
  if (a.gs) {
    a.gs.setAttribute(
      "transform",
      `translate(60 119) scale(${n(Math.max(0.3, 1 - a.y / 110) * sx)} 1) translate(-60 -119)`
    );
    a.gs.setAttribute("opacity", n(0.2 * Math.max(0, 1 - a.y / 80)));
  }
  if (a.zz) {
    a.zz.setAttribute(
      "opacity",
      asleep ? n(0.55 + 0.45 * Math.sin(now / 500)) : "0"
    );
  }

  // Elevate z-index so character and jump are always in front of background/cards
  if (a.el) {
    a.el.style.zIndex = a.air || a.hold || a.hover ? "50" : "20";
  }
}

// Global active avatars manager
const activeAvatars: Set<AvatarState> = new Set();
let globalRafId: number | null = null;
let lastTime = performance.now();
let lastPointerMove = performance.now();

function handleWindowPointerMove(e: PointerEvent) {
  const now = performance.now();
  const wasAsleep = now - lastPointerMove > 25000;
  lastPointerMove = now;

  for (const a of activeAvatars) {
    if (!a.el || !a.el.isConnected) continue;
    const r = a.el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height * 0.42);
    const d = Math.hypot(dx, dy);
    a.near = d < 480;
    if (a.near) {
      const mg = Math.max(0, Math.min(1, d / 110));
      a.tx = (dx / (d || 1)) * mg;
      a.ty = (dy / (d || 1)) * mg * 0.85;
    }
    if (wasAsleep) {
      hop(a, 8, { crouch: 0, mood: { e: "open", m: "o", b: 2 }, dur: 700 });
    }
  }
}

function globalLoop(now: number) {
  const dt = Math.max(0, Math.min(0.033, (now - lastTime) / 1000));
  lastTime = now;

  for (const a of activeAvatars) {
    if (!a.el || !a.el.isConnected) {
      activeAvatars.delete(a);
      continue;
    }
    step(a, now, dt, lastPointerMove);
  }

  if (activeAvatars.size > 0) {
    globalRafId = requestAnimationFrame(globalLoop);
  } else {
    globalRafId = null;
    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", handleWindowPointerMove);
    }
  }
}

function registerAvatar(a: AvatarState) {
  activeAvatars.add(a);
  if (globalRafId === null && typeof window !== "undefined") {
    lastTime = performance.now();
    lastPointerMove = performance.now();
    window.addEventListener("pointermove", handleWindowPointerMove, { passive: true });
    globalRafId = requestAnimationFrame(globalLoop);
  }
}

function unregisterAvatar(a: AvatarState) {
  activeAvatars.delete(a);
  if (activeAvatars.size === 0 && globalRafId !== null) {
    cancelAnimationFrame(globalRafId);
    globalRafId = null;
    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", handleWindowPointerMove);
    }
  }
}

interface AvatarCharacterProps {
  avatarId?: AvatarId | string;
  size?: number | string;
  className?: string;
  showShadow?: boolean;
  interactive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function AvatarCharacter({
  avatarId = "jasur",
  size = 64,
  className = "",
  showShadow = true,
  interactive = true,
  onClick,
}: AvatarCharacterProps) {
  const normId = (avatarId?.toLowerCase() || "jasur") as AvatarId;
  const char = CHARACTERS[normId] || CHARACTERS.jasur;
  const clipId = `clip-${normId}-${Math.random().toString(36).substring(2, 7)}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<AvatarState | null>(null);

  useEffect(() => {
    if (!interactive || !containerRef.current) return;
    const el = containerRef.current;
    const q = (sel: string) => el.querySelector<SVGGElement | SVGEllipseElement>(sel);

    const now = performance.now();
    const a: AvatarState = {
      el,
      rt: q(".rt") as SVGGElement | null,
      hd: q(".hd") as SVGGElement | null,
      hb: q(".hb") as SVGGElement | null,
      hf: q(".hf") as SVGGElement | null,
      fc: q(".fc") as SVGGElement | null,
      ey: q(".ey") as SVGGElement | null,
      b1: q(".br1") as SVGGElement | null,
      b2: q(".br2") as SVGGElement | null,
      gs: q(".gs") as SVGEllipseElement | null,
      zz: q(".zz") as SVGGElement | null,
      bl: Array.from(el.querySelectorAll<SVGGElement>(".bl")),
      ck: Array.from(el.querySelectorAll<SVGCircleElement>(".ck")),
      sq: { x: 0, v: 0 },
      hr: { x: 0, v: 0 },
      hs: { x: 0, v: 0 },
      hx: { x: 0, v: 0 },
      hy: { x: 0, v: 0 },
      ln: { x: 0, v: 0 },
      lx: 0,
      ly: 0,
      tx: 0,
      ty: 0,
      y: 0,
      vy: 0,
      air: 0,
      crouch: 0,
      fp: null,
      hold: 0,
      holdT: 0,
      charge: 0,
      hover: 0,
      bsh: 0,
      mood: null,
      wob: null,
      q: [],
      e: "",
      m: "",
      ci: -1,
      near: false,
      sd: Math.random(),
      nb: now + Math.random() * 3000,
      b0: 0,
      nh: now + 4000 + Math.random() * 9000,
      nw: 0,
    };

    stateRef.current = a;
    registerAvatar(a);

    const onCelebrate = (ev: Event) => {
      const customEv = ev as CustomEvent<{ count?: number }>;
      const cnt = customEv?.detail?.count ?? 14;
      hop(a, 34, {
        turns: 1,
        n: cnt,
        mood: { e: "open", m: "grin", b: 1 },
        dur: 1100,
      });
    };
    window.addEventListener("avatar-celebrate", onCelebrate);

    return () => {
      window.removeEventListener("avatar-celebrate", onCelebrate);
      unregisterAvatar(a);
      stateRef.current = null;
    };
  }, [interactive, normId]);

  // Pointer event handlers for the interactive avatar
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive || e.button !== 0) return;
    const a = stateRef.current;
    if (!a) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    a.hold = 1;
    a.holdT = 0;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!interactive) return;
    const a = stateRef.current;
    if (!a || !a.hold) return;
    a.hold = 0;
    const t = a.holdT;
    const c = a.charge;
    a.charge = 0;
    if (t < 0.2) {
      clickReact(a);
    } else {
      launch(a, c);
    }
  };

  const handlePointerCancel = () => {
    if (!interactive) return;
    const a = stateRef.current;
    if (!a) return;
    a.hold = 0;
    a.charge = 0;
  };

  const handlePointerEnter = () => {
    if (!interactive) return;
    const a = stateRef.current;
    if (!a) return;
    a.hover = 1;
    a.mood = { e: "open", m: "grin", b: 1, until: performance.now() + 650 };
    a.sq.v += 3.5;
  };

  const handlePointerLeave = () => {
    if (!interactive) return;
    const a = stateRef.current;
    if (!a) return;
    a.hover = 0;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e);
  };

  return (
    <div
      ref={containerRef}
      className={`ava-live inline-block relative select-none shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        aspectRatio: "120/124",
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      aria-label="Avatar"
    >
      <svg
        viewBox="0 0 120 124"
        className="w-full h-full block overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx="60" cy="60" r="56" />
          </clipPath>
        </defs>

        {/* Floor Shadow */}
        {showShadow && (
          <ellipse
            className="gs"
            cx="60"
            cy="119"
            rx="30"
            ry="4.5"
            fill="#1a1a1a"
            opacity="0.2"
          />
        )}

        {/* Animated Root Group */}
        <g className="rt">
          {/* Neobrutalist Hard Offset Shadow */}
          <circle cx="64" cy="64" r="56" fill="#1a1a1a" />
          {/* Main Background Circle */}
          <circle
            className="k"
            cx="60"
            cy="60"
            r="56"
            fill={char.bg}
            stroke="#1a1a1a"
            strokeWidth="3"
          />

          {/* Body and Hair Under Clip */}
          <g clipPath={`url(#${clipId})`}>
            {/* Back Hair */}
            <g className="hb">
              {char.st === "f1" && (
                <path
                  className="k"
                  fill={char.hair}
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  d="M36 50C33 28 46 21 60 21C74 21 87 28 84 50L89 97C89 102 82 103 78 98L72 84H48L42 98C38 103 31 102 31 97Z"
                />
              )}
              {char.st === "f2" && (
                <circle
                  className="k"
                  cx="60"
                  cy="19"
                  r="10"
                  fill={char.hair}
                  stroke="#1a1a1a"
                  strokeWidth="3"
                />
              )}
            </g>

            {/* Dilnoza Hoodie Back */}
            {char.tt === "hoodie" && (
              <path
                className="k"
                fill={char.top}
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M30 102C27 84 40 77 60 77C80 77 93 84 90 102Z"
              />
            )}

            {/* Neck */}
            <path
              className="k"
              fill={char.skin}
              stroke="#1a1a1a"
              strokeWidth="3"
              d="M52 70V96H68V70Z"
            />
            <path
              fill="rgba(26,26,26,.16)"
              d="M52 78Q60 90 68 78V70H52Z"
            />

            {/* Top / Clothes */}
            <path
              className="k"
              fill={char.top}
              stroke="#1a1a1a"
              strokeWidth="3"
              d="M8 124C8 100 28 91 60 91C92 91 112 100 112 124Z"
            />

            {/* Neckline */}
            {char.tt === "collar" ? (
              <>
                <path
                  className="k"
                  fill={char.skin}
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  d="M51 91.5L60 106L69 91.5Z"
                />
                <path
                  className="k"
                  fill="#fffef8"
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  d="M49 90L60 106L51 99Z"
                />
                <path
                  className="k"
                  fill="#fffef8"
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  d="M71 90L60 106L69 99Z"
                />
              </>
            ) : char.tt === "hoodie" ? (
              <>
                <path
                  className="k"
                  fill={char.skin}
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  d="M49 91.5Q60 103 71 91.5Z"
                />
                <path
                  d="M54 99V113M66 99V113"
                  stroke="#1a1a1a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <path
                className="k"
                fill={char.skin}
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M49 91.5Q60 103 71 91.5Z"
              />
            )}
          </g>

          {/* Border line */}
          <circle
            className="k"
            cx="60"
            cy="60"
            r="56"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="3"
          />

          {/* Head Group */}
          <g className="hd">
            {/* Ears */}
            <circle
              className="k"
              cx="39"
              cy="57"
              r="5.5"
              fill={char.skin}
              stroke="#1a1a1a"
              strokeWidth="3"
            />
            <circle
              className="k"
              cx="81"
              cy="57"
              r="5.5"
              fill={char.skin}
              stroke="#1a1a1a"
              strokeWidth="3"
            />

            {/* Face shape */}
            <path
              className="k"
              fill={char.skin}
              stroke="#1a1a1a"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              d="M39 52C39 36 48 27 60 27C72 27 81 36 81 52C81 68 73 80 60 80C47 80 39 68 39 52Z"
            />

            {/* Face Features Group */}
            <g className="fc">
              {/* Cheeks */}
              <circle className="ck" cx="44.5" cy="63.5" r="4.6" fill="#ff8f85" />
              <circle className="ck" cx="75.5" cy="63.5" r="4.6" fill="#ff8f85" />

              {/* Eyebrows */}
              <g className="br1">
                <path
                  className="k"
                  d="M45 48Q51 44.5 57 48"
                  fill="none"
                  stroke="#1a1a1a"
                  style={{ strokeWidth: 2.4 }}
                  strokeLinecap="round"
                />
              </g>
              <g className="br2">
                <path
                  className="k"
                  d="M63 48Q69 44.5 75 48"
                  fill="none"
                  stroke="#1a1a1a"
                  style={{ strokeWidth: 2.4 }}
                  strokeLinecap="round"
                />
              </g>

              {/* Eyes with expressions */}
              <g className="ey">
                {/* Open eyes */}
                <g className="eo">
                  <g transform="translate(51 55)">
                    <g className="bl">
                      <ellipse rx="3.3" ry="4.5" fill="#1a1a1a" />
                      <circle cx="-1" cy="-1.7" r="1.2" fill="#fffef8" />
                    </g>
                  </g>
                  <g transform="translate(69 55)">
                    <g className="bl">
                      <ellipse rx="3.3" ry="4.5" fill="#1a1a1a" />
                      <circle cx="-1" cy="-1.7" r="1.2" fill="#fffef8" />
                    </g>
                  </g>
                </g>

                {/* Happy closed eyes */}
                <g
                  className="ec k"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M46.5 57Q51 51.5 55.5 57" />
                  <path d="M64.5 57Q69 51.5 73.5 57" />
                </g>

                {/* Sleep eyes */}
                <g
                  className="es k"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M46.5 55Q51 59 55.5 55" />
                  <path d="M64.5 55Q69 59 73.5 55" />
                </g>

                {/* Squeeze / squint eyes */}
                <g
                  className="ex k"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M46 51L55 55L46 59" />
                  <path d="M74 51L65 55L74 59" />
                </g>
              </g>

              {/* Nose */}
              <path
                className="k"
                d="M59 60Q60.5 62.5 62.5 61"
                fill="none"
                stroke="#1a1a1a"
                style={{ strokeWidth: 2 }}
                strokeLinecap="round"
              />

              {/* Mouth expressions */}
              <path
                className="m m-smile k"
                d="M53 67Q60 74 67 67"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <g className="m m-grin">
                <path
                  className="k"
                  fill="#1a1a1a"
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M52 66Q60 65 68 66Q67 78 60 78Q53 78 52 66Z"
                />
                <path d="M54 67H66V69.5H54Z" fill="#fffef8" />
                <path
                  d="M56 75Q60 71.5 64 75Q62 77.5 60 77.5Q58 77.5 56 75Z"
                  fill="#ff8f85"
                />
              </g>
              <ellipse
                className="m m-o"
                cx="60"
                cy="71"
                rx="3.6"
                ry="4.6"
                fill="#1a1a1a"
              />
              <path
                className="m m-flat k"
                d="M55.5 70H64.5"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Freckles for Dilnoza */}
            {char.fr && (
              <>
                <circle cx="45" cy="62" r="1" fill="rgba(110,55,25,.6)" />
                <circle cx="48" cy="65" r="1" fill="rgba(110,55,25,.6)" />
                <circle cx="72" cy="65" r="1" fill="rgba(110,55,25,.6)" />
                <circle cx="75" cy="62" r="1" fill="rgba(110,55,25,.6)" />
              </>
            )}

            {/* Glasses for Sardor */}
            {char.gl && (
              <g
                className="k"
                fill="rgba(255,255,255,.35)"
                stroke="#1a1a1a"
                style={{ strokeWidth: 2.6 }}
              >
                <circle cx="51" cy="55" r="8.5" />
                <circle cx="69" cy="55" r="8.5" />
                <path d="M59.5 55H60.5" fill="none" />
              </g>
            )}

            {/* Front Hair */}
            <g className="hf">
              {char.st === "f1" && (
                <path
                  className="k"
                  fill={char.hair}
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  d="M38 54C36 33 47 23 60 23C73 23 84 33 82 54C80 46 76 40 70 36C62 44 50 46 41 48C40 50 39 52 38 54Z"
                />
              )}
              {char.st === "f2" && (
                <>
                  <path
                    className="k"
                    fill={char.hair}
                    stroke="#1a1a1a"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    d="M38 54C36 33 47 24 60 24C73 24 84 33 82 54C78 44 70 38 62 37C56 40 46 46 38 54Z"
                  />
                  <path
                    d="M62 37Q65 31 63 25"
                    fill="none"
                    stroke="#1a1a1a"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M51 26Q60 30 69 26"
                    fill="none"
                    stroke="#1a1a1a"
                    strokeWidth="8.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M51 26Q60 30 69 26"
                    fill="none"
                    stroke="#ff5722"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                </>
              )}
              {char.st === "m1" && (
                <>
                  <path
                    className="k"
                    fill={char.hair}
                    stroke="#1a1a1a"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    d="M38 52C33 33 43 19 60 19C79 19 89 33 82 52C80 43 75 38 69 36C61 38 50 36 45 40C41 43 39 48 38 52Z"
                  />
                  <path
                    className="k"
                    fill={char.hair}
                    stroke="#1a1a1a"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    d="M60 20C62 10 72 10 77 17C70 17 66 19 64 23Z"
                  />
                </>
              )}
              {char.st === "m2" && (
                <path
                  className="k"
                  fill={char.hair}
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  d="M38 52C35 33 46 22 61 22C76 22 85 33 82 52C80 42 72 35 62 35C52 36 43 42 38 52Z"
                />
              )}
            </g>

            {/* Earrings for Madina */}
            {char.ear && (
              <>
                <circle
                  className="k"
                  cx="39"
                  cy="65"
                  r="2.4"
                  fill="#ffd84d"
                  stroke="#1a1a1a"
                  style={{ strokeWidth: 1.8 }}
                />
                <circle
                  className="k"
                  cx="81"
                  cy="65"
                  r="2.4"
                  fill="#ffd84d"
                  stroke="#1a1a1a"
                  style={{ strokeWidth: 1.8 }}
                />
              </>
            )}
          </g>

          {/* Sleeping z z */}
          <g className="zz" opacity="0" fontWeight="900" fill="#1a1a1a">
            <text x="84" y="30" fontSize="15">
              z
            </text>
            <text x="95" y="17" fontSize="10">
              z
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}

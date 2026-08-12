"use client"
import { useId } from "react"

export function TextMorph({ words, className, delayMs = 1000 }: { words: string, className?: string, delayMs?: number }) {
    const wordList = words.split(/\r?\n|,/).map(w => w.trim()).filter(Boolean)
    const rawId = useId()
    const filterId = `tm-thr-${rawId.replace(/[:]/g, "")}`

    const word0 = wordList[0] || ""
    const word1 = wordList[1] || ""

    return (
        <div className={className} style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", userSelect: "none" }}>
            <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} aria-hidden>
                <defs>
                    <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -9" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>

            <div style={{ position: "relative", filter: `url(#${filterId})`, width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ position: "relative", display: "grid", placeItems: "center", lineHeight: 1.2 }}>
                    {/* Invisible placeholders force container to take max width/height of both words */}
                    <span style={{ visibility: "hidden", whiteSpace: "nowrap", gridArea: "1/1" }}>
                        {word0}
                    </span>
                    <span style={{ visibility: "hidden", whiteSpace: "nowrap", gridArea: "1/1" }}>
                        {word1}
                    </span>
                    
                    {/* First word: starts visible, morphs out */}
                    <span
                        style={{
                            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                            whiteSpace: "nowrap",
                            animation: `tm-morph-out 500ms forwards ease-in-out ${delayMs}ms`,
                            willChange: "opacity, filter, transform",
                        }}
                    >
                        {word0}
                    </span>
                    
                    {/* Second word: starts invisible, morphs in */}
                    <span
                        style={{
                            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                            opacity: 0, whiteSpace: "nowrap",
                            animation: `tm-morph-in 500ms forwards ease-in-out ${delayMs}ms`,
                            willChange: "opacity, filter, transform",
                        }}
                    >
                        {word1}
                    </span>
                </div>
            </div>
        </div>
    )
}

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface CurtainTransitionProps {
  part: number;
  onMidpoint: () => void;
  onComplete: () => void;
}

export const CurtainTransition: React.FC<CurtainTransitionProps> = ({ part, onMidpoint, onComplete }) => {
  const curtainRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const midpointFired = useRef(false);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(curtainRef.current, 
        { yPercent: -100 }, 
        { 
          yPercent: 0, 
          duration: 0.8, 
          ease: "power3.inOut",
          onComplete: () => {
            if (!midpointFired.current) {
              midpointFired.current = true;
              onMidpoint();
            }
          }
        }
      )
      .fromTo(textRef.current, 
        { scale: 0.5, opacity: 0, filter: 'blur(20px)' }, 
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: "elastic.out(1, 0.7)" }
      )
      .to({}, { duration: 2.5 })
      .to(textRef.current, { opacity: 0, scale: 1.5, filter: 'blur(10px)', duration: 0.6, ease: "power2.in" })
      .to(curtainRef.current, { yPercent: 100, duration: 0.8, ease: "power3.inOut", onComplete });

    return () => {
      tl.kill();
    };
  }, [onMidpoint, onComplete]);

  return (
    <div ref={curtainRef} className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 border-y-8 border-primary">
      <div ref={textRef} className="text-center max-w-5xl">
         <h1 className="text-6xl md:text-8xl font-black text-primary mb-8 tracking-widest">PART {part}</h1>
         <p className="text-2xl md:text-4xl font-medium text-white/90 leading-relaxed drop-shadow-2xl">
            {part === 1 && "Imtihonchi sizga tanish mavzular (uy-joy, ish/o'qish, qiziqishlar va h.k.) bo'yicha bir necha savol beradi. Bu qism taxminan 4-5 daqiqa davom etadi. Tabiiy va erkin javob bering — tayyorgarlik vaqti kerak emas."}
            {part === 2 && "Sizga bitta mavzu beriladi va uni yoritish uchun bir necha nuqta ko'rsatiladi. Tayyorlanish uchun 1 daqiqa, so'ngra 1-2 daqiqa davomida shu mavzuda gapirishingiz kerak bo'ladi."}
            {part === 3 && "Imtihonchi Part 2'dagi mavzu bilan bog'liq, chuqurroq fikr-mulohaza talab qiladigan savollar beradi. Bu yerda o'z fikringizni asoslab tushuntirish muhim."}
         </p>
      </div>
    </div>
  );
};

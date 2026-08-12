import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';

interface TextRevealProps {
  children: React.ReactNode;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
}

const TextReveal = ({
  children,
  enableBlur = true,
  baseOpacity = 0,
  baseRotation = 3,
  blurStrength = 10,
  containerClassName = '',
  textClassName = ''
}: TextRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="inline-block opacity-0 will-change-[opacity,filter]" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Optional rotation on the entire container
    if (baseRotation > 0) {
      gsap.fromTo(
        el,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          ease: 'power2.out',
          rotate: 0,
          duration: 1.2
        }
      );
    }

    const wordElements = el.querySelectorAll('span');

    // Combine opacity and blur animation on individual words
    gsap.fromTo(
      wordElements,
      { opacity: baseOpacity, filter: enableBlur ? `blur(${blurStrength}px)` : 'none' },
      {
        ease: 'power2.out',
        opacity: 1,
        filter: 'blur(0px)',
        stagger: 0.04,
        duration: 0.8
      }
    );
  }, [children, enableBlur, baseRotation, baseOpacity, blurStrength]);

  return (
    <div ref={containerRef} className={containerClassName}>
      <div className={textClassName}>{splitText}</div>
    </div>
  );
};

export default TextReveal;

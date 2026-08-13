import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import './ScrollReveal.css';

interface AutoTextRevealProps {
  children: React.ReactNode;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
}

const AutoTextReveal = ({
  children,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = ''
}: AutoTextRevealProps) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    if (!text) return null;
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="word inline-block" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !children) return;

    // Reset styles before animation
    gsap.killTweensOf(el);
    gsap.killTweensOf(el.querySelectorAll('.word'));

    gsap.fromTo(
      el,
      { transformOrigin: '0% 50%', rotate: baseRotation },
      {
        ease: 'power2.out',
        rotate: 0,
        duration: 0.8
      }
    );

    const wordElements = el.querySelectorAll('.word');

    gsap.fromTo(
      wordElements,
      { opacity: baseOpacity, filter: enableBlur ? `blur(${blurStrength}px)` : 'none' },
      {
        ease: 'power2.out',
        opacity: 1,
        filter: 'blur(0px)',
        stagger: 0.05,
        duration: 0.5
      }
    );
  }, [children, enableBlur, baseRotation, baseOpacity, blurStrength]);

  if (!children) return null;

  return (
    <h2 ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </h2>
  );
};

export default AutoTextReveal;

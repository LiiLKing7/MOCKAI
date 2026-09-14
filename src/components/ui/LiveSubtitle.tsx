import { useState, useEffect, useRef } from 'react';

interface LiveSubtitleProps {
  text: string;
  /** Milliseconds per word reveal. Default ~220ms ≈ natural speech pace */
  wordDelay?: number;
  className?: string;
}

const LiveSubtitle = ({ text, wordDelay = 220, className = '' }: LiveSubtitleProps) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const words = useRef<string[]>([]);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    // Reset on new text
    words.current = text.split(/\s+/).filter(w => w.length > 0);
    setVisibleCount(0);

    if (intervalRef.current) clearInterval(intervalRef.current);

    let count = 0;
    intervalRef.current = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= words.current.length) {
        clearInterval(intervalRef.current);
      }
    }, wordDelay);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, wordDelay]);

  return (
    <p className={className}>
      {words.current.map((word, i) => (
        <span
          key={`${text}-${i}`}
          style={{
            display: 'inline-block',
            marginRight: '0.3em',
            opacity: i < visibleCount ? 1 : 0,
            filter: i < visibleCount ? 'blur(0px)' : 'blur(8px)',
            transform: i < visibleCount ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.25s ease-out, filter 0.3s ease-out, transform 0.3s ease-out',
          }}
        >
          {word}
        </span>
      ))}
    </p>
  );
};

export default LiveSubtitle;

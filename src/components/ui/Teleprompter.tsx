import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export interface TeleprompterItem {
  id: string;
  text: string;
  status: 'past' | 'current' | 'future';
}

interface TeleprompterProps {
  items: TeleprompterItem[];
}

const Teleprompter = ({ items }: TeleprompterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Keep track of rendered items to handle exit animations
  const [renderedItems, setRenderedItems] = useState<TeleprompterItem[]>([]);
  const prevItemsRef = useRef<TeleprompterItem[]>([]);

  useEffect(() => {
    // Merge new items with old items that are fading out
    const merged = [...items];
    const newIds = new Set(items.map(i => i.id));
    
    prevItemsRef.current.forEach(oldItem => {
      if (!newIds.has(oldItem.id)) {
        // This item was removed from the list (likely a 'past' item that expired).
        // We'll keep it in the DOM temporarily to animate its removal if needed, 
        // but for now, we'll just let React remove it. 
        // GSAP handles the 3-second fade out while it's in the 'past' state before it gets removed from the array by the parent.
      }
    });
    
    setRenderedItems(merged);
    prevItemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const elements = containerRef.current.querySelectorAll('.sentence-block');
    
    elements.forEach((el) => {
      const status = el.getAttribute('data-status');
      const animatedStatus = el.getAttribute('data-animated-status');
      
      if (status === animatedStatus) return; // Already animated to this state
      
      el.setAttribute('data-animated-status', status || '');
      
      if (status === 'current') {
        // Animate the current sentence words
        const words = el.querySelectorAll('.word');
        gsap.fromTo(
          words,
          { opacity: 0.1, filter: 'blur(8px)' },
          {
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.3,
            duration: 0.4,
            ease: 'power2.out'
          }
        );
        
        gsap.to(el, {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'power2.out'
        });
      } else if (status === 'past') {
        // Move up slightly, blur, and fade out
        gsap.to(el, {
          y: -20,
          opacity: 0,
          filter: 'blur(4px)',
          duration: 1.0,
          ease: 'power2.out'
        });
      } else if (status === 'future') {
        // Future sentences sit below, blurry and low opacity
        if (!animatedStatus) {
          gsap.set(el, { y: 40, opacity: 0.3, filter: 'blur(8px)' });
        } else {
          gsap.to(el, {
            y: 40,
            opacity: 0.3,
            filter: 'blur(8px)',
            duration: 0.6,
            ease: 'power2.out'
          });
        }
      }
    });
    
  }, [renderedItems]);

  return (
    <div ref={containerRef} className="relative w-full flex flex-col items-center justify-center pointer-events-none">
      {renderedItems.map((item) => (
        <div 
          key={item.id}
          data-status={item.status}
          className="sentence-block absolute text-center w-full transition-all duration-500"
          style={{ transformOrigin: 'center center' }}
        >
          <p className="font-heading text-2xl md:text-4xl font-bold leading-relaxed text-foreground">
            {item.text.split(/(\s+)/).map((word, i) => (
              <span key={i} className={word.match(/^\s+$/) ? '' : 'word inline-block'}>
                {word}
              </span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Teleprompter;

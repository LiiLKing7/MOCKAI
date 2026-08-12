import React from 'react';

interface DebugOverlayProps {
  micReadyState: string;
  socketReadyState: number;
  isThinking: boolean;
  isSpeaking: boolean;
  audioVolumeRef: React.MutableRefObject<number>;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({
  micReadyState,
  socketReadyState,
  isThinking,
  isSpeaking,
  audioVolumeRef
}) => {
  const barRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let req: number;
    const loop = () => {
      if (barRef.current) {
        barRef.current.style.width = `${audioVolumeRef.current * 100}%`;
      }
      req = requestAnimationFrame(loop);
    };
    req = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(req);
  }, [audioVolumeRef]);

  const getSocketStateStr = (state: number) => {
    switch(state) {
      case 0: return "CONNECTING";
      case 1: return "OPEN";
      case 2: return "CLOSING";
      case 3: return "CLOSED";
      default: return "UNKNOWN";
    }
  };

  let turnState = "idle";
  if (isThinking) turnState = "ai_thinking";
  else if (isSpeaking) turnState = "ai_speaking";
  else turnState = "user_turn";

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-md border border-white/20 p-4 rounded-xl text-xs font-mono text-white/90 shadow-2xl w-64 pointer-events-none">
      <h4 className="font-bold text-red-400 mb-2 border-b border-white/20 pb-1">Debug Overlay</h4>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-white/60">Mic State:</span>
          <span className={micReadyState === 'live' ? 'text-green-400' : 'text-red-400'}>{micReadyState || 'none'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-white/60">STT Socket:</span>
          <span className={socketReadyState === 1 ? 'text-green-400' : 'text-yellow-400'}>{getSocketStateStr(socketReadyState)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-white/60">Turn State:</span>
          <span className="text-blue-300">{turnState}</span>
        </div>
        
        <div className="mt-3">
          <span className="text-white/60 mb-1 block">Live Raw Mic Level:</span>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden w-full">
            <div ref={barRef} className="h-full bg-green-500 transition-all duration-75" style={{ width: '0%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

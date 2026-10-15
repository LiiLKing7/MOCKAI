import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { BilimIcon } from "@/components/ui/bilim-icon";

interface AudioPlayerProps {
  src: string;
}

export function AudioPlayer({ src }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    const handleError = () => {
      console.warn("Audio file could not be loaded:", src);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [src]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Audio playback failed:", error);
            setIsPlaying(false);
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const restart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="paper-box p-5 bg-[var(--paper-card)] flex flex-col gap-4 shadow-[5px_5px_0_var(--paper-ink)]">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="paper-btn paper-btn-yellow w-12 h-12 p-0 rounded-2xl flex items-center justify-center shadow-[3px_3px_0_var(--paper-ink)] cursor-pointer"
            title={isPlaying ? "To'xtatish" : "Tinglash"}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={restart}
            className="paper-btn paper-btn-out w-10 h-10 p-0 rounded-xl flex items-center justify-center shadow-[2px_2px_0_var(--paper-ink)] cursor-pointer"
            title="Qayta boshlash"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="paper-badge paper-badge-paper font-mono font-black text-sm px-3 py-1">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="paper-btn paper-btn-out w-10 h-10 p-0 rounded-xl flex items-center justify-center shadow-[2px_2px_0_var(--paper-ink)] cursor-pointer"
          title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-600" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Chunky Progress Bar */}
      <div
        className="paper-progress-bar w-full h-4 cursor-pointer"
        onClick={(e) => {
          if (audioRef.current && duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = percent * duration;
          }
        }}
      >
        <div
          className="paper-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

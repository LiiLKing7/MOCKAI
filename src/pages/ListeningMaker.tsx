import React, { useState } from 'react';
import { PageProps } from '../App';
import { BilimIcon } from '@/components/ui/bilim-icon';
import { 
  AudioBlock, 
  voices, 
  fetchDeepgramAudio, 
  decodeAudioBuffer, 
  mergeAudioBlocks, 
  encodeAudioBufferToWav 
} from '../lib/audio-utils';

export default function ListeningMaker({ onNavigate, theme, toggleTheme }: PageProps) {
  const apiKey = (import.meta as any).env.VITE_DEEPGRAM_API_KEY || "";
  const [blocks, setBlocks] = useState<AudioBlock[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTtsBlock = () => {
    setBlocks([...blocks, { 
      id: crypto.randomUUID(), 
      type: 'tts', 
      text: '', 
      voice: voices[0].id 
    }]);
  };

  const addGapBlock = () => {
    setBlocks([...blocks, { 
      id: crypto.randomUUID(), 
      type: 'gap', 
      duration: 3 
    }]);
  };

  const updateBlock = (id: string, updates: Partial<AudioBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const duplicateBlock = (blockToDuplicate: AudioBlock) => {
    const newBlock = { ...blockToDuplicate, id: crypto.randomUUID() };
    const index = blocks.findIndex(b => b.id === blockToDuplicate.id);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      setBlocks(newBlocks);
    } else if (direction === 'down' && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
      setBlocks(newBlocks);
    }
  };

  const generateAudioForBlock = async (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block || block.type !== 'tts' || !block.text) return;
    
    setError(null);
    try {
      updateBlock(id, { audioBuffer: undefined });
      const arrayBuffer = await fetchDeepgramAudio(block.text, block.voice || voices[0].id, apiKey);
      const audioBuffer = await decodeAudioBuffer(arrayBuffer);
      updateBlock(id, { audioBuffer });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Audio yaratishda xatolik yuz berdi');
    }
  };

  const playPreview = (audioBuffer: AudioBuffer, speed: number = 1) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    if (speed !== 1) {
      source.playbackRate.value = speed;
      source.preservesPitch = true;
    }
    source.connect(audioContext.destination);
    source.start(0);
  };

  const handleExportWav = async () => {
    const missingAudio = blocks.some(b => b.type === 'tts' && !b.audioBuffer);
    if (missingAudio) {
      setError('Iltimos, eksport qilishdan oldin barcha matn bloklari uchun audio yarating.');
      return;
    }
    if (blocks.length === 0) {
      setError('Avval biror audio blok qo\'shing.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    try {
      const mergedBuffer = await mergeAudioBlocks(blocks);
      const wavBlob = encodeAudioBufferToWav(mergedBuffer);
      
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `listening-test-${Date.now()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'WAV eksport qilishda xatolik yuz berdi');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="reading-paper-container min-h-screen flex flex-col bg-[var(--paper)] text-[var(--paper-ink)]">
      {/* Top Header - MockAi Style */}
      <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-3 border-[var(--paper-ink)] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0 flex items-center justify-center font-black"
            title="Dashboardga qaytish"
          >
            ←
          </button>

          <div
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <i className="paper-logo-mark">✦</i>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-[var(--paper-ink)] group-hover:text-[var(--paper-o)] transition-colors">
                bilim<span className="text-[var(--paper-o)]">box</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--paper-mut)] -mt-1">
                Listening Studio
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="paper-btn paper-btn-out paper-btn-sm h-9 w-9 p-0"
            title="Rejimni almashtirish"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            type="button"
            onClick={handleExportWav}
            disabled={isProcessing}
            className="paper-btn paper-btn-p paper-btn-sm font-black flex items-center gap-2 disabled:opacity-50"
          >
            <BilimIcon name="download" size={16} />
            <span>{isProcessing ? 'Yaratilmoqda...' : 'Export WAV'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">
        {/* Banner */}
        <div className="paper-box p-6 bg-[var(--paper-y)] text-[var(--paper-on)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🎙️</span>
              <h2 className="text-xl font-black">Listening Audio Konstruktori</h2>
            </div>
            <p className="text-xs font-bold opacity-80 max-w-xl">
              Natijaviy audio faylni bir nechta spikerlar ovozi va oraliq pauzalar bilan qadamma-qadam yarating.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={addTtsBlock}
              className="paper-btn paper-btn-sm bg-white text-[var(--paper-ink)] font-black flex items-center gap-1.5"
            >
              + Nutq bloki
            </button>
            <button
              type="button"
              onClick={addGapBlock}
              className="paper-btn paper-btn-sm bg-white text-[var(--paper-ink)] font-black flex items-center gap-1.5"
            >
              + Pauza
            </button>
          </div>
        </div>

        {error && (
          <div className="paper-box p-4 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-2 border-red-500 font-bold text-sm flex items-center justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="font-black ml-4">✕</button>
          </div>
        )}

        {/* Blocks List */}
        <div className="space-y-4">
          {blocks.length === 0 ? (
            <div className="paper-box p-12 text-center bg-[var(--paper-card)] border-dashed space-y-4">
              <div className="text-5xl">🎧</div>
              <h3 className="text-xl font-black text-[var(--paper-ink)]">Hali audio bloklar qo'shilmadi</h3>
              <p className="text-xs font-bold text-[var(--paper-mut)] max-w-md mx-auto">
                Test audio yaratish uchun yuqoridagi tugmalar orqali nutq yoki sukunat bloklarini qo'shing.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={addTtsBlock}
                  className="paper-btn paper-btn-p font-black flex items-center gap-2"
                >
                  <BilimIcon name="volume" size={18} />
                  <span>Nutq bloki qo'shish</span>
                </button>
                <button
                  type="button"
                  onClick={addGapBlock}
                  className="paper-btn paper-btn-out font-black flex items-center gap-2"
                >
                  <BilimIcon name="clock" size={18} />
                  <span>Sukunat (pauza)</span>
                </button>
              </div>
            </div>
          ) : (
            blocks.map((block, index) => (
              <div 
                key={block.id} 
                className="paper-box p-5 bg-[var(--paper-card)] flex flex-col sm:flex-row gap-4 items-stretch relative group"
              >
                {/* Reorder Buttons */}
                <div className="flex sm:flex-col gap-1.5 justify-center items-center pb-2 sm:pb-0 sm:border-r-2 sm:border-[var(--paper-ink)]/15 sm:pr-4">
                  <button 
                    type="button"
                    disabled={index === 0} 
                    onClick={() => moveBlock(index, 'up')}
                    className="p-1.5 rounded-lg border-2 border-[var(--paper-ink)] hover:bg-[var(--paper-y)] disabled:opacity-30 disabled:hover:bg-transparent font-black text-xs"
                    title="Yuqoriga surish"
                  >
                    ▲
                  </button>
                  <span className="text-xs font-black text-[var(--paper-mut)] px-1">
                    #{index + 1}
                  </span>
                  <button 
                    type="button"
                    disabled={index === blocks.length - 1} 
                    onClick={() => moveBlock(index, 'down')}
                    className="p-1.5 rounded-lg border-2 border-[var(--paper-ink)] hover:bg-[var(--paper-y)] disabled:opacity-30 disabled:hover:bg-transparent font-black text-xs"
                    title="Pastga surish"
                  >
                    ▼
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  {block.type === 'tts' ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--paper-o)] text-white text-xs font-black border border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)]">
                          <BilimIcon name="volume" size={14} />
                          Nutq (TTS)
                        </span>

                        <div className="flex items-center gap-2">
                          <select
                            value={block.speed || 1}
                            onChange={(e) => updateBlock(block.id, { speed: parseFloat(e.target.value) })}
                            className="bg-[var(--paper)] text-xs font-bold border-2 border-[var(--paper-ink)] rounded-lg px-2 py-1 focus:outline-none"
                            title="Tezlik"
                          >
                            <option value={1.2}>1.2x (Tez)</option>
                            <option value={1}>1.0x (Normal)</option>
                            <option value={0.9}>0.9x (Sekin)</option>
                            <option value={0.85}>0.85x (Sekinroq)</option>
                            <option value={0.8}>0.8x (Juda sekin)</option>
                          </select>

                          <select 
                            value={block.voice} 
                            onChange={(e) => updateBlock(block.id, { voice: e.target.value })}
                            className="bg-[var(--paper)] text-xs font-bold border-2 border-[var(--paper-ink)] rounded-lg px-2 py-1 focus:outline-none"
                          >
                            {voices.map(v => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                          </select>

                          <button 
                            type="button"
                            onClick={() => duplicateBlock(block)}
                            className="p-1.5 rounded-lg border-2 border-[var(--paper-ink)] hover:bg-[var(--paper-y)] transition-colors"
                            title="Nusxa olish"
                          >
                            <BilimIcon name="pencil" size={14} />
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={block.text || ''}
                        onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                        placeholder="Spiker gapirishi kerak bo'lgan inglizcha matnni kiriting..."
                        className="w-full min-h-[85px] p-3 rounded-xl border-2 border-[var(--paper-ink)] bg-[var(--paper)] text-[var(--paper-ink)] font-medium text-sm focus:outline-none focus:shadow-[2px_2px_0_var(--paper-ink)] resize-y"
                      />

                      <div className="flex flex-wrap justify-between items-center gap-2 pt-1">
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => generateAudioForBlock(block.id)}
                            disabled={!block.text}
                            className="paper-btn paper-btn-sm paper-btn-p font-black text-xs disabled:opacity-40"
                          >
                            Audio yaratish
                          </button>

                          {block.audioBuffer && (
                            <button 
                              type="button"
                              onClick={() => playPreview(block.audioBuffer!, block.speed)}
                              className="paper-btn paper-btn-sm paper-btn-out font-black text-xs flex items-center gap-1.5"
                            >
                              <BilimIcon name="play" size={14} />
                              Eshitish
                            </button>
                          )}
                        </div>

                        {block.audioBuffer && (
                          <span className="text-xs font-black text-[var(--paper-g)] bg-emerald-100 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-500">
                            ✓ Tayyor ({(block.audioBuffer.duration).toFixed(1)}s)
                          </span>
                        )}
                        {!block.audioBuffer && block.text && (
                          <span className="text-xs font-black text-[var(--paper-o)] bg-amber-100 dark:bg-amber-950/40 px-2 py-1 rounded-md border border-amber-500">
                            Audio kutilmoqda
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--paper-mut)] text-white text-xs font-black border border-[var(--paper-ink)] shadow-[2px_2px_0_var(--paper-ink)]">
                          <BilimIcon name="clock" size={14} />
                          Sukunat (Pauza)
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="text-xs font-black text-[var(--paper-ink)]">Davomiyligi (soniya):</label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={block.duration || 3}
                          onChange={(e) => updateBlock(block.id, { duration: parseFloat(e.target.value) || 0 })}
                          className="w-24 p-2 rounded-lg border-2 border-[var(--paper-ink)] bg-[var(--paper)] text-[var(--paper-ink)] font-black text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <div className="flex sm:flex-col justify-end sm:justify-center items-center pt-2 sm:pt-0 sm:border-l-2 sm:border-[var(--paper-ink)]/15 sm:pl-4">
                  <button 
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="p-2 rounded-lg border-2 border-[var(--paper-ink)] hover:bg-[var(--paper-r)] hover:text-white transition-colors"
                    title="Blokni o'chirish"
                  >
                    <BilimIcon name="trash" size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Add Actions */}
        {blocks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={addTtsBlock}
              className="paper-btn paper-btn-out font-black flex items-center gap-2"
            >
              <BilimIcon name="volume" size={18} />
              <span>+ Nutq bloki</span>
            </button>
            <button
              type="button"
              onClick={addGapBlock}
              className="paper-btn paper-btn-out font-black flex items-center gap-2"
            >
              <BilimIcon name="clock" size={18} />
              <span>+ Sukunat bloki</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

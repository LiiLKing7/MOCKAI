import React, { useState, useEffect } from 'react';
import { PageProps } from '../App';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Play, Download, Trash2, ArrowUp, ArrowDown, Settings, Mic, Timer, Copy, X, Clock } from 'lucide-react';
import { 
  AudioBlock, 
  voices, 
  fetchDeepgramAudio, 
  decodeAudioBuffer, 
  mergeAudioBlocks, 
  encodeAudioBufferToWav 
} from '../lib/audio-utils';

export default function ListeningMaker({ onNavigate, theme, toggleTheme }: PageProps) {
  const [apiKey, setApiKey] = useState('');
  const [blocks, setBlocks] = useState<AudioBlock[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('deepgram_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('deepgram_api_key', val);
  };

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
      updateBlock(id, { audioBuffer: undefined }); // clear existing
      const arrayBuffer = await fetchDeepgramAudio(block.text, block.voice || voices[0].id, apiKey);
      const audioBuffer = await decodeAudioBuffer(arrayBuffer);
      updateBlock(id, { audioBuffer });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate audio');
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
      setError('Please generate audio for all TTS blocks before exporting.');
      return;
    }
    if (blocks.length === 0) {
      setError('Add some blocks first.');
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
      setError(err.message || 'Failed to export WAV');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-background z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-heading font-semibold flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            Listening Maker
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <Settings className="w-4 h-4 absolute left-3 text-muted-foreground" />
            <input 
              type="password" 
              placeholder="Deepgram API Key" 
              value={apiKey}
              onChange={handleSaveKey}
              className="pl-9 pr-3 py-1.5 text-sm bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-64"
            />
          </div>
          <Button variant="default" onClick={handleExportWav} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export WAV
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl w-full mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {blocks.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-xl text-muted-foreground">
              <p className="mb-4">No audio blocks added yet.</p>
              <div className="flex justify-center gap-4">
                <Button onClick={addTtsBlock} variant="secondary">
                  <Mic className="w-4 h-4 mr-2" /> Add Speech
                </Button>
                <Button onClick={addGapBlock} variant="secondary">
                  <Timer className="w-4 h-4 mr-2" /> Add Silence
                </Button>
              </div>
            </div>
          ) : (
            blocks.map((block, index) => (
              <div key={block.id} className="p-4 border border-border rounded-xl bg-card shadow-sm flex gap-4 transition-all hover:border-primary/50">
                <div className="flex flex-col gap-1 border-r pr-4 border-border justify-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => moveBlock(index, 'up')}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === blocks.length - 1} onClick={() => moveBlock(index, 'down')}>
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1">
                  {block.type === 'tts' ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                          <Mic className="w-4 h-4" /> Speech Block
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateBlock(block)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <select
                            value={block.speed || 1}
                            onChange={(e) => updateBlock(block.id, { speed: parseFloat(e.target.value) })}
                            className="bg-muted text-sm border-none rounded px-2 py-1 focus:ring-0"
                            title="Playback Speed"
                          >
                            <option value={1.2}>1.2x (Fast)</option>
                            <option value={1}>1.0x (Normal)</option>
                            <option value={0.9}>0.9x (Slow)</option>
                            <option value={0.85}>0.85x (Slower)</option>
                            <option value={0.8}>0.8x (Very Slow)</option>
                          </select>
                          <select 
                            value={block.voice} 
                            onChange={(e) => updateBlock(block.id, { voice: e.target.value })}
                            className="bg-muted text-sm border-none rounded px-2 py-1 focus:ring-0"
                          >
                            {voices.map(v => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <textarea
                        value={block.text || ''}
                        onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                        placeholder="Type the text for the speaker..."
                        className="w-full min-h-[80px] p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                      />
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => {
                              if (!apiKey) {
                                setError('Deepgram API kaliti kiritilmagan! Iltimos, yuqoridagi maydonga kalitni kiriting.');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                return;
                              }
                              generateAudioForBlock(block.id);
                            }}
                            disabled={!block.text}
                          >
                            Generate Audio
                          </Button>
                          {block.audioBuffer && (
                            <Button variant="outline" size="sm" onClick={() => playPreview(block.audioBuffer!, block.speed)}>
                              <Play className="w-4 h-4 mr-1" /> Preview
                            </Button>
                          )}
                        </div>
                        {block.audioBuffer && (
                          <span className="text-xs text-green-500 font-medium">✓ Ready ({(block.audioBuffer.duration).toFixed(1)}s)</span>
                        )}
                        {!block.audioBuffer && block.text && (
                          <span className="text-xs text-yellow-500 font-medium">Needs generation</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 h-full flex flex-col justify-center">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Timer className="w-4 h-4" /> Silence Block
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-foreground">Duration (seconds):</label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={block.duration || 3}
                          onChange={(e) => updateBlock(block.id, { duration: parseFloat(e.target.value) || 0 })}
                          className="w-24 p-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pl-4 border-l border-border flex items-center">
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeBlock(block.id)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {blocks.length > 0 && (
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={addTtsBlock} variant="outline" className="border-dashed">
              <Plus className="w-4 h-4 mr-2" /> Add Speech Block
            </Button>
            <Button onClick={addGapBlock} variant="outline" className="border-dashed">
              <Plus className="w-4 h-4 mr-2" /> Add Silence Block
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

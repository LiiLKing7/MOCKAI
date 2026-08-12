

export interface AudioBlock {
  id: string;
  type: 'tts' | 'gap';
  text?: string;
  voice?: string;
  duration?: number; // duration in seconds (for gap)
  audioBuffer?: AudioBuffer;
  speed?: number; // playback speed modifier (e.g., 0.85)
}

export const voices = [
  { id: 'aura-asteria-en', name: 'Asteria (Female)' },
  { id: 'aura-luna-en', name: 'Luna (Female)' },
  { id: 'aura-stella-en', name: 'Stella (Female)' },
  { id: 'aura-hera-en', name: 'Hera (Female)' },
  { id: 'aura-orion-en', name: 'Orion (Male)' },
  { id: 'aura-arcas-en', name: 'Arcas (Male)' },
  { id: 'aura-perseus-en', name: 'Perseus (Male)' },
  { id: 'aura-angus-en', name: 'Angus (Male)' },
  { id: 'aura-orpheus-en', name: 'Orpheus (Male)' },
  { id: 'aura-helios-en', name: 'Helios (Male)' },
  { id: 'aura-zeus-en', name: 'Zeus (Male)' },
];

export async function fetchDeepgramAudio(text: string, voice: string, apiKey: string): Promise<ArrayBuffer> {
  if (!apiKey) {
    throw new Error('Deepgram API key is required');
  }
  
  const response = await fetch(`https://api.deepgram.com/v1/speak?model=${voice}`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Deepgram API error: ${response.status} - ${errorText}`);
  }

  return await response.arrayBuffer();
}

export async function decodeAudioBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  return await audioContext.decodeAudioData(arrayBuffer);
}

export async function mergeAudioBlocks(blocks: AudioBlock[]): Promise<AudioBuffer> {
  // First, calculate total duration
  let totalDuration = 0;
  for (const block of blocks) {
    if (block.type === 'gap' && block.duration) {
      totalDuration += block.duration;
    } else if (block.type === 'tts' && block.audioBuffer) {
      totalDuration += block.audioBuffer.duration / (block.speed || 1);
    }
  }

  // Use a standard sample rate, e.g., 44100
  const sampleRate = 44100;
  
  // Create offline context with 2 channels
  const offlineContext = new OfflineAudioContext(2, Math.ceil(sampleRate * totalDuration) || 1, sampleRate);
  
  let currentTime = 0;
  
  for (const block of blocks) {
    if (block.type === 'gap' && block.duration) {
      currentTime += block.duration;
    } else if (block.type === 'tts' && block.audioBuffer) {
      // Create a buffer source
      const source = offlineContext.createBufferSource();
      source.buffer = block.audioBuffer;
      if (block.speed && block.speed !== 1) {
        source.playbackRate.value = block.speed;
        source.preservesPitch = true;
      }
      source.connect(offlineContext.destination);
      source.start(currentTime);
      const actualDuration = block.audioBuffer.duration / (block.speed || 1);
      currentTime += actualDuration;
    }
  }

  // Render the final audio buffer
  return await offlineContext.startRendering();
}

export function encodeAudioBufferToWav(audioBuffer: AudioBuffer): Blob {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(audioBuffer.sampleRate);
  setUint32(audioBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit
  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

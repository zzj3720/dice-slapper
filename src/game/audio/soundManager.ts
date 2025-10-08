import { Howl } from 'howler';

interface SoundLibrary {
  slap: Howl | null;
  collision: Howl | null;
}

const sounds: SoundLibrary = {
  slap: null,
  collision: null,
};

let initialized = false;

// Initialize sounds with procedurally generated audio
export const initSounds = () => {
  if (initialized) return;
  
  try {
    // Create simple slap sound
    sounds.slap = new Howl({
      src: [createSlapSound()],
      volume: 0.3,
    });
    
    // Create simple collision sound
    sounds.collision = new Howl({
      src: [createCollisionSound()],
      volume: 0.2,
    });
    
    initialized = true;
  } catch (error) {
    console.warn('Failed to initialize sounds:', error);
  }
};

// Create a simple slap sound using Web Audio API
const createSlapSound = (): string => {
  const audioContext = new AudioContext();
  const sampleRate = audioContext.sampleRate;
  const duration = 0.2;
  const length = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 20);
    const noise = (Math.random() * 2 - 1) * envelope;
    const tone = Math.sin(2 * Math.PI * 150 * t) * envelope * 0.3;
    data[i] = noise * 0.7 + tone;
  }
  
  return bufferToWav(buffer);
};

// Create a simple collision sound
const createCollisionSound = (): string => {
  const audioContext = new AudioContext();
  const sampleRate = audioContext.sampleRate;
  const duration = 0.1;
  const length = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 30);
    const noise = (Math.random() * 2 - 1) * envelope * 0.5;
    data[i] = noise;
  }
  
  return bufferToWav(buffer);
};

// Convert AudioBuffer to WAV data URL
const bufferToWav = (buffer: AudioBuffer): string => {
  const length = buffer.length * buffer.numberOfChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);
  const channels = [buffer.getChannelData(0)];
  const sampleRate = buffer.sampleRate;
  let offset = 0;
  
  const writeString = (str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset++, str.charCodeAt(i));
    }
  };
  
  const writeUint32 = (val: number) => {
    view.setUint32(offset, val, true);
    offset += 4;
  };
  
  const writeUint16 = (val: number) => {
    view.setUint16(offset, val, true);
    offset += 2;
  };
  
  // WAV header
  writeString('RIFF');
  writeUint32(36 + length);
  writeString('WAVE');
  writeString('fmt ');
  writeUint32(16);
  writeUint16(1);
  writeUint16(1);
  writeUint32(sampleRate);
  writeUint32(sampleRate * 2);
  writeUint16(2);
  writeUint16(16);
  writeString('data');
  writeUint32(length);
  
  // Write audio data
  for (let i = 0; i < buffer.length; i++) {
    const sample = Math.max(-1, Math.min(1, channels[0][i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }
  
  // Convert to base64 data URL
  const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

export const playSound = (soundName: keyof SoundLibrary, volume: number = 1) => {
  if (!initialized) {
    initSounds();
  }
  
  const sound = sounds[soundName];
  if (sound) {
    sound.volume(volume * (soundName === 'slap' ? 0.3 : 0.2));
    sound.play();
  }
};

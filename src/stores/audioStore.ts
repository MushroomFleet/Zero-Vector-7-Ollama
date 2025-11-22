import { create } from 'zustand';

interface AudioState {
  currentAudio: HTMLAudioElement | null;
  isPlaying: boolean;
  currentMessageId: string | null;
  generatingAudio: Set<string>;
  
  setCurrentAudio: (audio: HTMLAudioElement | null, messageId?: string) => void;
  setIsPlaying: (playing: boolean) => void;
  setGeneratingAudio: (messageId: string, generating: boolean) => void;
  stopCurrentAudio: () => void;
  cleanup: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentAudio: null,
  isPlaying: false,
  currentMessageId: null,
  generatingAudio: new Set(),

  setCurrentAudio: (audio: HTMLAudioElement | null, messageId?: string) => {
    const { currentAudio } = get();
    
    // Stop and cleanup previous audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    
    set({ 
      currentAudio: audio, 
      currentMessageId: messageId || null,
      isPlaying: false 
    });
  },

  setIsPlaying: (playing: boolean) => {
    const { currentAudio } = get();
    
    if (currentAudio && playing) {
      currentAudio.play().catch(console.error);
    } else if (currentAudio && !playing) {
      currentAudio.pause();
    }
    
    set({ isPlaying: playing });
  },

  setGeneratingAudio: (messageId: string, generating: boolean) => {
    set((state) => {
      const newGeneratingAudio = new Set(state.generatingAudio);
      if (generating) {
        newGeneratingAudio.add(messageId);
      } else {
        newGeneratingAudio.delete(messageId);
      }
      return { generatingAudio: newGeneratingAudio };
    });
  },

  stopCurrentAudio: () => {
    const { currentAudio } = get();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    set({ isPlaying: false });
  },

  cleanup: () => {
    const { currentAudio } = get();
    if (currentAudio) {
      currentAudio.pause();
      // Revoke object URL if it exists to prevent memory leaks
      if (currentAudio.src.startsWith('blob:')) {
        URL.revokeObjectURL(currentAudio.src);
      }
    }
    set({ 
      currentAudio: null, 
      isPlaying: false, 
      currentMessageId: null,
      generatingAudio: new Set()
    });
  }
}));
import { create } from 'zustand';
import { HolographicWaveEngine } from '../holographic/HolographicWaveEngine';
import { HolographicConfig, WaveType } from '../types/holographic';

interface HolographicState {
  waveEngine: HolographicWaveEngine | null;
  isEnabled: boolean;
  config: HolographicConfig;
  systemState: any;
  initializeEngine: (config: HolographicConfig) => void;
  propagateWave: (sourceRegion: string, content: any, waveType: WaveType, amplitude?: number) => string;
  updateSystemState: () => void;
  setEnabled: (enabled: boolean) => void;
  updateConfig: (updates: Partial<HolographicConfig>) => void;
  flushMemory: () => void;
}

const defaultHolographicConfig: HolographicConfig = {
  frequencies: {
    [WaveType.CONTEXT]: 0.5,
    [WaveType.INTENT]: 1.0,
    [WaveType.CONFIDENCE]: 2.0,
    [WaveType.TEMPORAL]: 0.8,
    [WaveType.MEMORY]: 0.3,
    [WaveType.PERSONA]: 0.2,
    [WaveType.REASONING]: 1.2,
    [WaveType.VISUAL]: 1.5
  },
  interference: {
    constructiveThreshold: 0.6,
    destructiveThreshold: 0.3,
    emergentThreshold: 0.8,
    coherenceDecayRate: 0.1
  },
  memory: {
    maxFragmentsPerRegion: 100,
    reconstructionThreshold: 0.6,
    fragmentPersistence: 0.8,
    crossSessionEnabled: true
  },
  degradation: {
    enabled: true,
    reconstructionAttempts: 3,
    minimumCoherence: 0.4,
    fallbackRegions: ['InnerBrain', 'FrontalLobe']
  }
};

export const useHolographicStore = create<HolographicState>((set, get) => ({
  waveEngine: null,
  isEnabled: false,
  config: defaultHolographicConfig,
  systemState: null,

  initializeEngine: (config: HolographicConfig) => {
    const engine = new HolographicWaveEngine(config);
    set({ waveEngine: engine, config, isEnabled: true });
  },

  propagateWave: (sourceRegion: string, content: any, waveType: WaveType, amplitude = 1.0) => {
    const { waveEngine, isEnabled } = get();
    if (!waveEngine || !isEnabled) {
      console.warn('Wave propagation attempted but holographic system not enabled');
      return '';
    }
    
    console.log(`Propagating ${waveType} wave from ${sourceRegion} with amplitude ${amplitude}`);
    const waveId = waveEngine.propagateHolographicWave(sourceRegion, content, waveType, amplitude);
    
    // Update system state after wave propagation
    setTimeout(() => get().updateSystemState(), 100);
    
    return waveId;
  },

  updateSystemState: () => {
    const { waveEngine } = get();
    if (!waveEngine) return;
    
    try {
      const systemState = waveEngine.getSystemState();
      set({ systemState });
      console.log('Updated system state:', systemState); // Debug logging
    } catch (error) {
      console.warn('Failed to update system state:', error);
    }
  },

  setEnabled: (enabled: boolean) => set({ isEnabled: enabled }),

  updateConfig: (updates: Partial<HolographicConfig>) => {
    const { config } = get();
    const newConfig = { ...config, ...updates };
    set({ config: newConfig });
    
    // Reinitialize engine with new config
    get().initializeEngine(newConfig);
  },

  flushMemory: () => {
    const { waveEngine } = get();
    if (waveEngine) {
      waveEngine.flushAllMemory();
      // Update system state to reflect the flush
      setTimeout(() => get().updateSystemState(), 100);
    }
  }
}));
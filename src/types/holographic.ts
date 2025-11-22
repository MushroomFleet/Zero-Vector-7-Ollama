export interface HolographicFragment {
  id: string;
  content: string;
  sourceRegion: string;
  waveType: WaveType;
  frequency: number;
  amplitude: number;
  phase: number;
  timestamp: Date;
  importance: number;
  coherenceSignature: string;
  sessionId: string;
}

export interface HolographicWave {
  id: string;
  sourceRegion: string;
  targetRegions: string[];
  waveType: WaveType;
  frequency: number;
  phase: number;
  amplitude: number;
  content: any;
  memoryFragmentIds: string[];
  timestamp: Date;
  interferencePatterns?: InterferencePattern[];
}

export interface InterferencePattern {
  id: string;
  waveIds: string[];
  resultantAmplitude: number;
  resultantFrequency: number;
  coherenceLevel: number;
  emergentContent?: string;
  constructive: boolean;
  timestamp: Date;
}

export interface EmergentBehavior {
  id: string;
  triggerPattern: InterferencePattern;
  behaviorType: string;
  confidence: number;
  insight: string;
  timestamp: Date;
}

export enum WaveType {
  CONTEXT = 'CONTEXT',
  INTENT = 'INTENT',
  CONFIDENCE = 'CONFIDENCE',
  TEMPORAL = 'TEMPORAL',
  MEMORY = 'MEMORY',
  PERSONA = 'PERSONA',
  REASONING = 'REASONING',
  VISUAL = 'VISUAL'
}

export const WaveFrequencies: Record<WaveType, number> = {
  [WaveType.CONTEXT]: 0.5,
  [WaveType.INTENT]: 1.0,
  [WaveType.CONFIDENCE]: 2.0,
  [WaveType.TEMPORAL]: 0.8,
  [WaveType.MEMORY]: 0.3,
  [WaveType.PERSONA]: 0.2,
  [WaveType.REASONING]: 1.2,
  [WaveType.VISUAL]: 1.5
};

export interface HolographicConfig {
  frequencies: Record<WaveType, number>;
  interference: {
    constructiveThreshold: number;
    destructiveThreshold: number;
    emergentThreshold: number;
    coherenceDecayRate: number;
  };
  memory: {
    maxFragmentsPerRegion: number;
    reconstructionThreshold: number;
    fragmentPersistence: number;
    crossSessionEnabled: boolean;
  };
  degradation: {
    enabled: boolean;
    reconstructionAttempts: number;
    minimumCoherence: number;
    fallbackRegions: string[];
  };
}
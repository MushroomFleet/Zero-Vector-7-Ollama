import { HolographicMemorySystem } from './HolographicMemorySystem';
import { InterferenceEngine } from './InterferenceEngine';
import { HolographicWave, WaveType, WaveFrequencies, HolographicConfig } from '../types/holographic';

export class HolographicWaveEngine {
  private holographicMemory: HolographicMemorySystem;
  private interferenceEngine: InterferenceEngine;
  private activeWaves: Map<string, HolographicWave> = new Map();
  private config: HolographicConfig;
  private currentPulse: number = 0;
  private isActive: boolean = false;

  constructor(config: HolographicConfig) {
    this.config = config;
    this.holographicMemory = new HolographicMemorySystem(config);
    this.interferenceEngine = new InterferenceEngine(config);
  }

  propagateHolographicWave(
    sourceRegion: string,
    content: any,
    waveType: WaveType,
    amplitude: number = 1.0,
    targetRegions: string[] = []
  ): string {
    const wave: HolographicWave = {
      id: this.generateWaveId(),
      sourceRegion,
      targetRegions: targetRegions.length > 0 ? targetRegions : ['all'],
      waveType,
      frequency: WaveFrequencies[waveType],
      phase: this.calculatePhase(content, sourceRegion),
      amplitude,
      content,
      memoryFragmentIds: [],
      timestamp: new Date()
    };

    // Store memory fragments for this wave
    const fragmentId = this.holographicMemory.storeFragment(
      this.extractTextContent(content),
      sourceRegion,
      waveType,
      amplitude,
      this.generateSessionId()
    );
    wave.memoryFragmentIds.push(fragmentId);

    // Add to active waves
    this.activeWaves.set(wave.id, wave);

    // Process wave interference
    const interferenceResult = this.processWaveInterference();

    // Store interference patterns as memory fragments
    if (interferenceResult.emergentPatterns.length > 0) {
      interferenceResult.emergentPatterns.forEach(pattern => {
        this.holographicMemory.storeFragment(
          pattern.insight,
          'InterferenceEngine',
          WaveType.MEMORY,
          pattern.confidence,
          this.generateSessionId()
        );
      });
    }

    return wave.id;
  }

  async enhanceWithHolographicReconstruction(
    targetContext: any,
    requiredCoherence: number = 0.6
  ): Promise<string | null> {
    return await this.holographicMemory.reconstructInformation(targetContext, requiredCoherence);
  }

  processWaveInterference() {
    const currentWaves = Array.from(this.activeWaves.values());
    return this.interferenceEngine.processWaveInterference(currentWaves);
  }

  getSystemState() {
    const interferenceResult = this.processWaveInterference();
    
    return {
      activeWaves: this.activeWaves.size,
      fragmentCount: this.holographicMemory.getFragmentCount(),
      systemCoherence: interferenceResult.systemCoherence,
      emergentBehaviors: interferenceResult.emergentPatterns.length,
      interferencePatterns: interferenceResult.interferenceResults.size
    };
  }

  async gracefulDegradation(fallbackContext: any): Promise<{
    success: boolean;
    method: string;
    confidence: number;
    reconstructed?: string;
  }> {
    try {
      // Attempt holographic reconstruction
      const reconstructed = await this.holographicMemory.reconstructInformation(
        fallbackContext,
        this.config.degradation.minimumCoherence
      );

      if (reconstructed) {
        return {
          success: true,
          method: 'holographic_reconstruction',
          confidence: 0.6,
          reconstructed
        };
      }

      // Fallback to emergency mode
      return {
        success: true,
        method: 'emergency_fallback',
        confidence: 0.3
      };

    } catch (error) {
      return {
        success: false,
        method: 'failed',
        confidence: 0.0
      };
    }
  }

  updateWaveDecay(deltaTime: number): void {
    for (const [waveId, wave] of this.activeWaves) {
      // Apply wave decay
      wave.amplitude *= Math.exp(-deltaTime / 10000); // 10-second decay constant

      // Remove weak waves
      if (wave.amplitude < 0.1) {
        this.activeWaves.delete(waveId);
      }
    }

    // Cleanup old interference patterns
    this.interferenceEngine.clearOldPatterns();
  }

  private calculatePhase(content: any, sourceRegion: string): number {
    const str = this.extractTextContent(content) + sourceRegion;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return (Math.abs(hash) % 628) / 100; // 0 to 2π
  }

  private extractTextContent(content: any): string {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      return JSON.stringify(content);
    }
    return String(content);
  }

  private generateWaveId(): string {
    return `wave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public accessors for memory system
  getFragmentsByRegion(region: string) {
    return this.holographicMemory.getFragmentsByRegion(region);
  }

  getFragmentCount() {
    return this.holographicMemory.getFragmentCount();
  }

  getAllFragments() {
    const regions = ['InnerBrain', 'FrontalLobe', 'TemporalLobe', 'OccipitalLobe', 'Cerebellum'];
    const allFragments: any[] = [];
    
    regions.forEach(region => {
      const regionFragments = this.holographicMemory.getFragmentsByRegion(region);
      allFragments.push(...regionFragments);
    });

    return allFragments;
  }

  flushAllMemory(): void {
    this.holographicMemory.flushAllMemory();
    this.activeWaves.clear();
  }

  cleanup(): void {
    this.activeWaves.clear();
    this.holographicMemory.clearCache();
  }
}
import { HolographicFragment, WaveType, WaveFrequencies, HolographicConfig } from '../types/holographic';

export class HolographicMemorySystem {
  private fragments: Map<string, HolographicFragment> = new Map();
  private coherenceMap: Map<string, number> = new Map();
  private reconstructionCache: Map<string, any> = new Map();
  private config: HolographicConfig;

  constructor(config: HolographicConfig) {
    this.config = config;
    this.loadPersistedFragments();
  }

  storeFragment(
    content: string,
    sourceRegion: string,
    waveType: WaveType,
    importance: number = 0.5,
    sessionId: string
  ): string {
    const fragment: HolographicFragment = {
      id: this.generateFragmentId(),
      content,
      sourceRegion,
      waveType,
      frequency: WaveFrequencies[waveType],
      amplitude: importance,
      phase: this.calculatePhase(content, sourceRegion),
      timestamp: new Date(),
      importance,
      coherenceSignature: this.generateCoherenceSignature(content),
      sessionId
    };

    this.fragments.set(fragment.id, fragment);
    this.updateCoherenceMap(fragment);
    
    // Persist if cross-session enabled
    if (this.config.memory.crossSessionEnabled) {
      this.persistFragment(fragment);
    }

    // Cleanup if too many fragments
    this.cleanupOldFragments(sourceRegion);

    return fragment.id;
  }

  async reconstructInformation(
    targetContext: any,
    requiredCoherence: number = 0.6
  ): Promise<string | null> {
    const cacheKey = JSON.stringify(targetContext);
    if (this.reconstructionCache.has(cacheKey)) {
      return this.reconstructionCache.get(cacheKey);
    }

    // Find relevant fragments
    const relevantFragments = this.findRelevantFragments(targetContext);
    
    if (relevantFragments.length === 0) {
      return null;
    }

    // Assess reconstruction viability
    const viability = this.assessReconstructionViability(relevantFragments);
    if (viability < requiredCoherence) {
      return null;
    }

    // Perform holographic reconstruction
    const reconstructed = this.performHolographicReconstruction(relevantFragments, targetContext);
    
    // Cache result
    this.reconstructionCache.set(cacheKey, reconstructed);
    
    return reconstructed;
  }

  private performHolographicReconstruction(
    fragments: HolographicFragment[],
    targetContext: any
  ): string {
    // Combine frequency domain representations
    const frequencyMap = new Map<number, number>();
    const contentFragments: string[] = [];

    fragments.forEach(fragment => {
      // Accumulate frequency components
      const existing = frequencyMap.get(fragment.frequency) || 0;
      frequencyMap.set(fragment.frequency, existing + fragment.amplitude);
      
      // Collect content fragments
      contentFragments.push(fragment.content);
    });

    // Weight by frequency coherence
    const sortedFrequencies = Array.from(frequencyMap.entries())
      .sort(([, a], [, b]) => b - a);

    // Reconstruct information based on dominant frequencies
    let reconstructed = '';
    const uniqueContent = [...new Set(contentFragments)];

    // Priority: highest amplitude frequencies
    for (const content of uniqueContent) {
      const relevantFragments = fragments.filter(f => f.content.includes(content.substring(0, 50)));
      const totalAmplitude = relevantFragments.reduce((sum, f) => sum + f.amplitude, 0);
      
      if (totalAmplitude > 0.3) { // Minimum threshold for inclusion
        reconstructed += content + ' ';
      }
    }

    return reconstructed.trim();
  }

  private findRelevantFragments(targetContext: any): HolographicFragment[] {
    const relevant: HolographicFragment[] = [];
    const contextString = JSON.stringify(targetContext).toLowerCase();

    for (const fragment of this.fragments.values()) {
      try {
        let relevanceScore = 0;

        // Content similarity
        const contentWords = fragment.content.toLowerCase().split(' ');
        const contextWords = contextString.split(' ');
        const commonWords = contentWords.filter(word => 
          contextWords.some(contextWord => contextWord.includes(word) || word.includes(contextWord))
        );
        relevanceScore += commonWords.length * 0.1;

        // Wave type relevance
        if (targetContext.type && targetContext.type === fragment.waveType) {
          relevanceScore += 0.3;
        }

        // Temporal relevance (recent fragments more relevant)
        // Ensure timestamp is a Date object
        const timestamp = fragment.timestamp instanceof Date ? fragment.timestamp : new Date(fragment.timestamp);
        if (!isNaN(timestamp.getTime())) {
          const ageHours = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
          const temporalBoost = Math.max(0, 1 - (ageHours / 24)); // Decay over 24 hours
          relevanceScore += temporalBoost * 0.2;
        }

        // Importance weighting
        relevanceScore *= fragment.importance;

        if (relevanceScore > 0.2) {
          relevant.push(fragment);
        }
      } catch (error) {
        console.warn('Error processing fragment for relevance:', fragment.id, error);
      }
    }

    return relevant.sort((a, b) => b.importance - a.importance);
  }

  private assessReconstructionViability(fragments: HolographicFragment[]): number {
    if (fragments.length === 0) return 0;

    // Calculate overall coherence
    let totalCoherence = 0;
    let pairCount = 0;

    for (let i = 0; i < fragments.length; i++) {
      for (let j = i + 1; j < fragments.length; j++) {
        const coherence = this.calculateFragmentCoherence(fragments[i], fragments[j]);
        totalCoherence += coherence;
        pairCount++;
      }
    }

    const averageCoherence = pairCount > 0 ? totalCoherence / pairCount : 0;
    
    // Boost for fragment count (more fragments = better reconstruction)
    const countBoost = Math.min(1, fragments.length / 5);
    
    return averageCoherence * 0.7 + countBoost * 0.3;
  }

  private calculateFragmentCoherence(frag1: HolographicFragment, frag2: HolographicFragment): number {
    // Frequency coherence
    const freqDiff = Math.abs(frag1.frequency - frag2.frequency);
    const freqCoherence = Math.exp(-freqDiff);

    // Phase coherence
    const phaseDiff = Math.abs(frag1.phase - frag2.phase);
    const phaseCoherence = Math.cos(phaseDiff);

    // Content similarity
    const content1Words = frag1.content.toLowerCase().split(' ');
    const content2Words = frag2.content.toLowerCase().split(' ');
    const commonWords = content1Words.filter(word => content2Words.includes(word));
    const contentCoherence = commonWords.length / Math.max(content1Words.length, content2Words.length);

    return (freqCoherence * 0.3 + phaseCoherence * 0.3 + contentCoherence * 0.4);
  }

  private generateFragmentId(): string {
    return `frag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculatePhase(content: string, sourceRegion: string): number {
    // Simple hash-based phase calculation
    let hash = 0;
    const str = content + sourceRegion;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return (Math.abs(hash) % 628) / 100; // 0 to 2π
  }

  private generateCoherenceSignature(content: string): string {
    // Generate signature for coherence matching
    const words = content.toLowerCase().split(' ').filter(w => w.length > 3);
    return words.slice(0, 5).sort().join('|');
  }

  private updateCoherenceMap(fragment: HolographicFragment): void {
    this.coherenceMap.set(fragment.id, fragment.amplitude);
  }

  private cleanupOldFragments(sourceRegion: string): void {
    try {
      const regionFragments = Array.from(this.fragments.values())
        .filter(f => f.sourceRegion === sourceRegion)
        .sort((a, b) => {
          // Ensure timestamps are Date objects for comparison
          const timestampA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
          const timestampB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
          return timestampB.getTime() - timestampA.getTime();
        });

      if (regionFragments.length > this.config.memory.maxFragmentsPerRegion) {
        const toRemove = regionFragments.slice(this.config.memory.maxFragmentsPerRegion);
        toRemove.forEach(fragment => {
          this.fragments.delete(fragment.id);
          this.coherenceMap.delete(fragment.id);
        });
      }
    } catch (error) {
      console.warn('Error during fragment cleanup:', error);
    }
  }

  private persistFragment(fragment: HolographicFragment): void {
    try {
      const persistedFragments = this.getPersistedFragments();
      persistedFragments[fragment.id] = fragment;
      
      // Keep only recent fragments for persistence
      const recentFragments = Object.values(persistedFragments)
        .filter(f => {
          try {
            const timestamp = f.timestamp instanceof Date ? f.timestamp : new Date(f.timestamp);
            return Date.now() - timestamp.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days
          } catch {
            return false; // Filter out fragments with invalid timestamps
          }
        })
        .reduce((acc, f) => ({ ...acc, [f.id]: f }), {});
      
      localStorage.setItem('zv6_holographic_fragments', JSON.stringify(recentFragments));
    } catch (error) {
      console.warn('Failed to persist holographic fragment:', error);
    }
  }

  private loadPersistedFragments(): void {
    if (!this.config.memory.crossSessionEnabled) return;

    try {
      const persistedFragments = this.getPersistedFragments();
      Object.values(persistedFragments).forEach(fragment => {
        try {
          // Convert timestamp string back to Date object if needed
          if (typeof fragment.timestamp === 'string') {
            fragment.timestamp = new Date(fragment.timestamp);
          }
          
          // Validate timestamp
          if (!(fragment.timestamp instanceof Date) || isNaN(fragment.timestamp.getTime())) {
            console.warn('Invalid timestamp for fragment:', fragment.id);
            return;
          }

          // Restore fragment with reduced amplitude (memory decay)
          const age = Date.now() - fragment.timestamp.getTime();
          const decayFactor = Math.exp(-age / (7 * 24 * 60 * 60 * 1000)); // 7-day decay
          
          fragment.amplitude *= decayFactor;
          if (fragment.amplitude > 0.1) {
            this.fragments.set(fragment.id, fragment);
            this.updateCoherenceMap(fragment);
          }
        } catch (fragmentError) {
          console.warn('Failed to process fragment:', fragment.id, fragmentError);
        }
      });
    } catch (error) {
      console.warn('Failed to load persisted fragments:', error);
    }
  }

  private getPersistedFragments(): Record<string, HolographicFragment> {
    try {
      const stored = localStorage.getItem('zv6_holographic_fragments');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  getFragmentCount(): number {
    return this.fragments.size;
  }

  getFragmentsByRegion(region: string): HolographicFragment[] {
    return Array.from(this.fragments.values()).filter(f => f.sourceRegion === region);
  }

  flushAllMemory(): void {
    console.log('Flushing all holographic memory...');
    
    // Clear in-memory storage
    this.fragments.clear();
    this.coherenceMap.clear();
    this.reconstructionCache.clear();
    
    // Clear localStorage
    if (this.config.memory.crossSessionEnabled) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('zv6_holographic_fragments')) {
            localStorage.removeItem(key);
          }
        });
        console.log('Cleared holographic fragments from localStorage');
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }

  clearCache(): void {
    this.reconstructionCache.clear();
  }
}

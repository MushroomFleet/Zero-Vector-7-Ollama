import { HolographicWave, InterferencePattern, EmergentBehavior, HolographicConfig } from '../types/holographic';

export class InterferenceEngine {
  private activePatterns: Map<string, InterferencePattern> = new Map();
  private emergentBehaviors: Map<string, EmergentBehavior> = new Map();
  private config: HolographicConfig;

  constructor(config: HolographicConfig) {
    this.config = config;
  }

  processWaveInterference(waves: HolographicWave[]): {
    interferenceResults: Map<string, InterferencePattern>;
    emergentPatterns: EmergentBehavior[];
    systemCoherence: number;
  } {
    const interferenceResults = new Map<string, InterferencePattern>();

    // Calculate pairwise interferences
    for (let i = 0; i < waves.length; i++) {
      for (let j = i + 1; j < waves.length; j++) {
        const interference = this.calculateInterference(waves[i], waves[j]);
        if (interference.coherenceLevel > this.config.interference.constructiveThreshold) {
          const patternId = `${waves[i].id}-${waves[j].id}`;
          interferenceResults.set(patternId, interference);
          this.activePatterns.set(patternId, interference);
        }
      }
    }

    // Detect emergent behaviors
    const emergentPatterns = this.detectEmergentPatterns(interferenceResults);

    // Calculate system coherence
    const systemCoherence = this.calculateSystemCoherence(interferenceResults);

    return {
      interferenceResults,
      emergentPatterns,
      systemCoherence
    };
  }

  private calculateInterference(wave1: HolographicWave, wave2: HolographicWave): InterferencePattern {
    const phaseDifference = Math.abs(wave1.phase - wave2.phase);
    const frequencyRatio = wave1.frequency / wave2.frequency;

    // Calculate resultant amplitude
    let resultantAmplitude = wave1.amplitude * wave2.amplitude;
    let constructive = false;

    if (phaseDifference < Math.PI / 4) {
      // Constructive interference
      resultantAmplitude *= Math.cos(phaseDifference);
      constructive = true;
    } else {
      // Destructive interference
      resultantAmplitude *= Math.sin(phaseDifference);
      constructive = false;
    }

    // Coherence calculation
    const phaseCoherence = Math.cos(phaseDifference);
    const frequencyCoherence = Math.exp(-Math.abs(frequencyRatio - 1));
    const coherenceLevel = (phaseCoherence + frequencyCoherence) / 2;

    // Generate emergent content
    const emergentContent = this.synthesizeContent(wave1.content, wave2.content, coherenceLevel);

    return {
      id: `interference_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      waveIds: [wave1.id, wave2.id],
      resultantAmplitude,
      resultantFrequency: (wave1.frequency + wave2.frequency) / 2,
      coherenceLevel,
      emergentContent,
      constructive,
      timestamp: new Date()
    };
  }

  private synthesizeContent(content1: any, content2: any, coherenceLevel: number): string | undefined {
    if (coherenceLevel < 0.5) return undefined;

    try {
      // Extract meaningful text from both contents
      const text1 = this.extractText(content1);
      const text2 = this.extractText(content2);

      if (!text1 || !text2) return undefined;

      // Find common themes or concepts
      const words1 = text1.toLowerCase().split(/\s+/);
      const words2 = text2.toLowerCase().split(/\s+/);
      const commonWords = words1.filter(word => 
        words2.includes(word) && word.length > 3
      );

      if (commonWords.length > 0) {
        const synthesis = `Emergent insight: Connection between "${text1.substring(0, 50)}" and "${text2.substring(0, 50)}" through common elements: ${commonWords.slice(0, 3).join(', ')}`;
        return synthesis;
      }

      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  private extractText(content: any): string {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      // Try to extract text from object
      if (content.text) return content.text;
      if (content.content) return content.content;
      if (content.message) return content.message;
      return JSON.stringify(content);
    }
    return String(content);
  }

  private detectEmergentPatterns(interferenceResults: Map<string, InterferencePattern>): EmergentBehavior[] {
    const patterns: EmergentBehavior[] = [];

    for (const [patternId, interference] of interferenceResults) {
      if (interference.coherenceLevel > this.config.interference.emergentThreshold && 
          interference.emergentContent) {
        
        const behavior: EmergentBehavior = {
          id: `emergent_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          triggerPattern: interference,
          behaviorType: this.classifyBehaviorType(interference),
          confidence: interference.coherenceLevel,
          insight: interference.emergentContent,
          timestamp: new Date()
        };

        patterns.push(behavior);
        this.emergentBehaviors.set(behavior.id, behavior);
      }
    }

    return patterns;
  }

  private classifyBehaviorType(interference: InterferencePattern): string {
    const { coherenceLevel, constructive, resultantAmplitude } = interference;

    if (coherenceLevel > 0.8 && constructive && resultantAmplitude > 0.7) {
      return 'SYNTHESIS';
    } else if (coherenceLevel > 0.7 && constructive) {
      return 'INSIGHT';
    } else if (!constructive && coherenceLevel > 0.6) {
      return 'CONTRADICTION';
    } else {
      return 'CORRELATION';
    }
  }

  private calculateSystemCoherence(interferenceResults: Map<string, InterferencePattern>): number {
    if (interferenceResults.size === 0) return 0.5;

    const coherenceValues = Array.from(interferenceResults.values())
      .map(pattern => pattern.coherenceLevel);

    const averageCoherence = coherenceValues.reduce((sum, val) => sum + val, 0) / coherenceValues.length;
    
    // Weight by number of patterns (more patterns = higher complexity)
    const complexityBoost = Math.min(0.2, interferenceResults.size * 0.05);
    
    return Math.min(1.0, averageCoherence + complexityBoost);
  }

  getActivePatterns(): InterferencePattern[] {
    return Array.from(this.activePatterns.values());
  }

  getEmergentBehaviors(): EmergentBehavior[] {
    return Array.from(this.emergentBehaviors.values());
  }

  clearOldPatterns(maxAge: number = 300000): void { // 5 minutes default
    const now = Date.now();
    
    for (const [id, pattern] of this.activePatterns) {
      if (now - pattern.timestamp.getTime() > maxAge) {
        this.activePatterns.delete(id);
      }
    }

    for (const [id, behavior] of this.emergentBehaviors) {
      if (now - behavior.timestamp.getTime() > maxAge) {
        this.emergentBehaviors.delete(id);
      }
    }
  }
}
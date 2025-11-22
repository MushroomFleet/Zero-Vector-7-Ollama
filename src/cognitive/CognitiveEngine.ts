import { InnerThoughts } from './lobes/InnerThoughts';
import { FrontalLobe } from './lobes/FrontalLobe';
import { TemporalLobe } from './lobes/TemporalLobe';
import { OccipitalLobe } from './lobes/OccipitalLobe';
import { Message, CognitiveTrace, SessionContext, SystemConfig } from '../types/cognitive';
import { useHolographicStore } from '../stores/holographicStore';
import { WaveType } from '../types/holographic';
import { ProviderFactory, IModelProvider, ProviderConfig } from '../services/providers';

export class CognitiveEngine {
  private innerThoughts: InnerThoughts;
  private frontalLobe: FrontalLobe;
  private temporalLobe: TemporalLobe;
  private occipitalLobe: OccipitalLobe;
  private config: SystemConfig;
  private provider: IModelProvider;
  private holographicEnabled: boolean = false;

  constructor(config: SystemConfig) {
    this.config = config;
    this.provider = this.createProvider(config);
    this.innerThoughts = new InnerThoughts(this.provider, config, config.perplexity.apiKey);
    this.frontalLobe = new FrontalLobe(this.provider);
    this.temporalLobe = new TemporalLobe(config.elevenlabs.apiKey);
    this.occipitalLobe = new OccipitalLobe(this.provider);
  }

  private createProvider(config: SystemConfig): IModelProvider {
    const providerConfig: ProviderConfig = {
      type: config.provider,
      apiKey: config.apiKey,
      baseUrl: config.ollama.baseUrl,
      timeout: config.ollama.timeout
    };

    return ProviderFactory.createProvider(providerConfig);
  }

  async processInput(
    input: string,
    conversationHistory: Message[],
    inputType: 'text' | 'image' = 'text',
    imageData?: string,
    forceWebSearch: boolean = false
  ): Promise<{ response: string; trace: CognitiveTrace }> {
    const startTime = new Date();
    const sessionContext: SessionContext = {
      conversationHistory,
      sessionId: this.generateSessionId(),
      timestamp: startTime
    };

    try {
      // Initialize holographic waves if enabled
      if (this.holographicEnabled) {
        this.propagateHolographicWave('UserInput', input, WaveType.INTENT, 1.0);
      }

      // Phase 1: Inner Thoughts Analysis with Holographic Enhancement
      console.log('🧠 Inner Thoughts: Analyzing input...');
      const innerThoughtsTrace = await this.enhancedInnerThoughtsAnalysis(
        input,
        sessionContext,
        inputType,
        forceWebSearch
      );

      // Phase 2: Visual Analysis (if image)
      let visualAnalysis;
      if (inputType === 'image' && imageData) {
        console.log('👁️ Occipital Lobe: Analyzing image...');
        visualAnalysis = await this.occipitalLobe.analyzeImage(imageData, input, this.config.lobes.occipital);
        
        if (this.holographicEnabled) {
          this.propagateHolographicWave('OccipitalLobe', visualAnalysis, WaveType.VISUAL, 0.8);
        }
      }

      // Phase 3: Enhanced System Prompt with Holographic Context
      const systemPrompt = await this.generateEnhancedSystemPrompt(innerThoughtsTrace);
      let guidance = `Based on the analysis, ${innerThoughtsTrace.plan}`;
      
      if (visualAnalysis) {
        guidance = this.occipitalLobe.generateVisualGuidance(visualAnalysis, input);
      }

      // Phase 4: Frontal Lobe Processing with Holographic Enhancement
      console.log('🎯 Frontal Lobe: Processing request...');
      const frontalLobeTrace = await this.enhancedFrontalLobeProcessing(
        input,
        sessionContext,
        guidance,
        systemPrompt,
        this.buildContextualData(innerThoughtsTrace, visualAnalysis)
      );

      // Phase 5: Speech Summary Generation via Inner Thoughts
      let speechSummary;
      if (this.config.features.speechSummaryEnabled) {
        console.log('🗣️ Inner Thoughts: Generating natural speech summary...');
        speechSummary = await this.innerThoughts.generateSpeechSummary(
          frontalLobeTrace.response,
          innerThoughtsTrace
        );

        if (this.holographicEnabled) {
          this.propagateHolographicWave('InnerThoughts-Speech', speechSummary, WaveType.TEMPORAL, 0.7);
        }
      }

      const endTime = new Date();
      
      // Capture holographic system state if enabled
      let holographicSystemState;
      if (this.holographicEnabled) {
        holographicSystemState = this.captureHolographicSystemState();
      }
      
      const trace: CognitiveTrace = {
        innerThoughts: innerThoughtsTrace,
        frontalLobe: frontalLobeTrace,
        visualAnalysis,
        speechSummary,
        speechSummaryGenerated: Boolean(speechSummary),
        ttsGenerated: false, // Will be set when audio is actually generated
        holographicSystemState,
        processing: {
          startTime,
          endTime,
          duration: endTime.getTime() - startTime.getTime()
        }
      };

      return {
        response: frontalLobeTrace.response,
        trace
      };

    } catch (error) {
      console.error('Cognitive processing error:', error);
      
      // Attempt graceful degradation through holographic reconstruction
      if (this.holographicEnabled) {
        return await this.attemptGracefulDegradation(input, sessionContext, error);
      }
      
      throw new Error(`Cognitive processing failed: ${error}`);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async generateAudio(
    text: string,
    messageId: string
  ): Promise<{ audioUrl: string; speechTrace: any }> {
    if (!this.config.elevenlabs.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const speechTrace = await this.temporalLobe.synthesizeText(
      text,
      this.config.elevenlabs.voiceId,
      {
        stability: this.config.elevenlabs.stability,
        similarity_boost: this.config.elevenlabs.similarityBoost
      }
    );

    if (!speechTrace.audioUrl) {
      throw new Error('Audio generation failed');
    }

    return {
      audioUrl: speechTrace.audioUrl,
      speechTrace
    };
  }

  private buildContextualData(innerThoughts: any, visualAnalysis?: any): string {
    let contextualData = '';

    if (innerThoughts.webSearchResults && innerThoughts.webSearchResults.length > 0) {
      const webResult = innerThoughts.webSearchResults[0];
      contextualData += `Web Search Results:\n${webResult.summary}\n\n`;
    }

    if (visualAnalysis) {
      contextualData += `Visual Analysis:\n${visualAnalysis.description}\n`;
      contextualData += `Objects: ${visualAnalysis.objects.join(', ')}\n`;
      contextualData += `Colors: ${visualAnalysis.colors.join(', ')}\n\n`;
    }

    return contextualData;
  }

  updateConfig(newConfig: SystemConfig): void {
    this.config = newConfig;
    this.provider = this.createProvider(newConfig);
    this.innerThoughts = new InnerThoughts(this.provider, newConfig, newConfig.perplexity.apiKey);
    this.frontalLobe = new FrontalLobe(this.provider);
    this.temporalLobe = new TemporalLobe(newConfig.elevenlabs.apiKey);
    this.occipitalLobe = new OccipitalLobe(this.provider);
    
    // Preload models if switching to Ollama for better performance
    if (newConfig.provider === 'ollama') {
      this.preloadOllamaModels(newConfig);
    }
  }

  private async preloadOllamaModels(config: SystemConfig): Promise<void> {
    if (config.provider !== 'ollama') return;
    
    try {
      const ollamaProvider = this.provider as any;
      if (ollamaProvider.preloadModel) {
        console.log('🚀 Preloading Ollama models for better performance...');
        
        // Preload the models used by different lobes
        const modelsToPreload = [
          config.model,
          config.lobes.frontal.model,
          config.lobes.temporal.model,
          config.lobes.occipital.model
        ];
        
        // Remove duplicates
        const uniqueModels = [...new Set(modelsToPreload)];
        
        // Preload models in parallel but don't wait for completion
        Promise.all(
          uniqueModels.map(async (modelId) => {
            try {
              await ollamaProvider.preloadModel(modelId);
            } catch (error) {
              console.warn(`⚠️ Failed to preload model "${modelId}":`, error);
            }
          })
        ).then(() => {
          console.log('✅ Model preloading completed');
        }).catch(() => {
          console.log('⚠️ Some models failed to preload, but system will continue');
        });
      }
    } catch (error) {
      console.warn('Model preloading failed:', error);
    }
  }

  private async enhancedInnerThoughtsAnalysis(
    input: string,
    context: SessionContext,
    inputType: 'text' | 'image',
    forceWebSearch: boolean = false
  ): Promise<any> {
    let baseTrace = await this.innerThoughts.analyzeUserInput(input, context, inputType, forceWebSearch);

    // Enhance with holographic reconstruction if enabled
    if (this.holographicEnabled) {
      const holographicContext = await this.attemptHolographicReconstruction({
        type: 'conversation_context',
        input,
        inputType
      });

      if (holographicContext) {
        // Enhance the trace with holographic insights
        baseTrace.context += ` [Holographic Context: ${holographicContext.substring(0, 200)}...]`;
        baseTrace.confidence = Math.min(1.0, baseTrace.confidence + 0.1);
        baseTrace.processingSteps.push('Enhanced with holographic memory reconstruction');
      }

      // Propagate context wave
      this.propagateHolographicWave('InnerBrain', baseTrace, WaveType.CONTEXT, baseTrace.confidence);
    }

    return baseTrace;
  }

  private async enhancedFrontalLobeProcessing(
    input: string,
    context: SessionContext,
    guidance: string,
    systemPrompt: string,
    contextualData?: string
  ): Promise<any> {
    try {
      // Primary processing
      const primaryResult = await this.frontalLobe.processThought(
        input,
        context,
        guidance,
        systemPrompt,
        contextualData,
        this.config.lobes.frontal
      );

      // Enhance with holographic insights if enabled
      if (this.holographicEnabled) {
        const holographicInsights = await this.attemptHolographicReconstruction({
          type: 'reasoning_enhancement',
          input,
          context: primaryResult.response
        });

        if (holographicInsights) {
          primaryResult.reasoning += ` [Holographic Enhancement: ${holographicInsights.substring(0, 100)}...]`;
          primaryResult.confidence = Math.min(1.0, primaryResult.confidence + 0.05);
        }

        // Propagate reasoning wave
        this.propagateHolographicWave('FrontalLobe', primaryResult, WaveType.REASONING, primaryResult.confidence);
      }

      return primaryResult;

    } catch (error) {
      // Graceful degradation through holographic reconstruction
      if (this.holographicEnabled) {
        const fallbackResponse = await this.attemptHolographicReconstruction({
          type: 'emergency_reasoning',
          input,
          error: error.message
        });

        if (fallbackResponse) {
          return {
            reasoning: 'Generated through holographic memory reconstruction',
            response: fallbackResponse,
            confidence: 0.4,
            usedContext: true,
            thinkingSteps: ['Holographic fallback processing']
          };
        }
      }

      throw error;
    }
  }

  private async generateEnhancedSystemPrompt(innerThoughtsTrace: any): Promise<string> {
    let basePrompt = this.innerThoughts.generateSystemPrompt(innerThoughtsTrace);

    // Enhance with holographic insights if enabled
    if (this.holographicEnabled) {
      const holographicGuidance = await this.attemptHolographicReconstruction({
        type: 'system_enhancement',
        trace: innerThoughtsTrace
      });

      if (holographicGuidance) {
        basePrompt += `\n\nHolographic Memory Context: ${holographicGuidance.substring(0, 300)}`;
      }
    }

    return basePrompt;
  }

  private async attemptHolographicReconstruction(targetContext: any): Promise<string | null> {
    if (!this.holographicEnabled) return null;

    try {
      const { waveEngine } = useHolographicStore.getState();
      if (!waveEngine) return null;

      return await waveEngine.enhanceWithHolographicReconstruction(targetContext, 0.5);
    } catch (error) {
      console.warn('Holographic reconstruction failed:', error);
      return null;
    }
  }

  private async attemptGracefulDegradation(
    input: string,
    context: SessionContext,
    originalError: any
  ): Promise<{ response: string; trace: CognitiveTrace }> {
    console.log('🔧 Attempting graceful degradation through holographic reconstruction...');

    const { waveEngine } = useHolographicStore.getState();
    if (!waveEngine) throw originalError;

    const degradationResult = await waveEngine.gracefulDegradation({
      input,
      context,
      error: originalError.message
    });

    if (degradationResult.success && degradationResult.reconstructed) {
      const fallbackTrace: CognitiveTrace = {
        innerThoughts: {
          intent: 'Fallback processing',
          context: 'Holographic reconstruction',
          plan: 'Emergency response generation',
          confidence: degradationResult.confidence,
          needsWebSearch: false,
          processingSteps: ['Holographic graceful degradation']
        },
        frontalLobe: {
          reasoning: 'Generated through holographic memory reconstruction',
          response: degradationResult.reconstructed,
          confidence: degradationResult.confidence,
          usedContext: true,
          thinkingSteps: ['Holographic fallback processing']
        },
        speechSummaryGenerated: false,
        ttsGenerated: false,
        processing: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 0
        }
      };

      return {
        response: degradationResult.reconstructed,
        trace: fallbackTrace
      };
    }

    throw originalError;
  }

  private propagateHolographicWave(sourceRegion: string, content: any, waveType: WaveType, amplitude: number): void {
    if (!this.holographicEnabled) return;

    const { propagateWave } = useHolographicStore.getState();
    propagateWave(sourceRegion, content, waveType, amplitude);
  }

  // Add this method to enable/disable holographic features
  setHolographicEnabled(enabled: boolean): void {
    this.holographicEnabled = enabled;
  }

  // Cleanup method
  cleanup(): void {
    this.temporalLobe.clearAudioCache();
  }

  // Get stored audio files for export
  getAudioFiles(): Map<string, string> {
    return this.temporalLobe.getStoredAudioFiles();
  }

  // Capture current holographic system state for traces
  private captureHolographicSystemState(): any {
    if (!this.holographicEnabled) return null;

    try {
      const { waveEngine } = useHolographicStore.getState();
      if (!waveEngine) return null;

      const systemState = waveEngine.getSystemState();
      const interferenceEngine = (waveEngine as any).interferenceEngine;
      
      if (!systemState || !interferenceEngine) return null;

      // Get emergent behaviors with full insight content
      const emergentBehaviors = interferenceEngine.getEmergentBehaviors().map((behavior: any) => ({
        id: behavior.id,
        behaviorType: behavior.behaviorType,
        confidence: behavior.confidence,
        insight: behavior.insight,
        timestamp: behavior.timestamp
      }));

      // Get active waves information (accessing the private activeWaves Map)
      const activeWaves: { [key: string]: number } = {};
      const activeWavesMap = (waveEngine as any).activeWaves;
      
      if (activeWavesMap && activeWavesMap instanceof Map) {
        for (const [waveId, wave] of activeWavesMap.entries()) {
          if (wave && wave.waveType && wave.frequency) {
            const waveTypeKey = `${wave.waveType}`;
            activeWaves[waveTypeKey] = wave.frequency;
          }
        }
      }

      return {
        activeWaves,
        totalFragments: systemState.fragmentCount || 0,
        systemCoherence: systemState.systemCoherence || 0,
        emergentBehaviors,
        interferencePatterns: systemState.interferencePatterns || 0
      };
    } catch (error) {
      console.warn('Failed to capture holographic system state:', error);
      return null;
    }
  }
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'image';
  cognitiveTrace?: CognitiveTrace;
  imageData?: string;
}

export interface CognitiveTrace {
  innerThoughts: InnerThoughtsTrace;
  frontalLobe: FrontalLobeTrace;
  visualAnalysis?: VisionAnalysis;
  refinement?: RefinementTrace;
  speechSummary?: string;
  speechSummaryGenerated: boolean;
  ttsGenerated: boolean;
  holographicReconstruction?: HolographicReconstruction;
  holographicSystemState?: HolographicSystemState;
  processing: {
    startTime: Date;
    endTime?: Date;
    duration?: number;
  };
}

export interface HolographicReconstruction {
  used: boolean;
  confidence: number;
  reconstructedFragments: number;
  emergentPatterns: string[];
  systemCoherence: number;
}

export interface HolographicSystemState {
  activeWaves: {
    [key: string]: number; // wave type -> frequency
  };
  totalFragments: number;
  systemCoherence: number;
  emergentBehaviors: Array<{
    id: string;
    behaviorType: string;
    confidence: number;
    insight: string;
    timestamp: Date;
  }>;
  interferencePatterns: number;
}

export interface InnerThoughtsTrace {
  intent: string;
  context: string;
  plan: string;
  webSearchQuery?: string;
  webSearchResults?: WebSearchResult[];
  confidence: number;
  needsWebSearch: boolean;
  processingSteps: string[];
}

export interface FrontalLobeTrace {
  reasoning: string;
  response: string;
  confidence: number;
  usedContext: boolean;
  thinkingSteps: string[];
}

export interface VisionAnalysis {
  description: string;
  objects: string[];
  colors: string[];
  mood: string;
  text?: string;
  confidence: number;
}

export interface RefinementTrace {
  originalResponse: string;
  refinedResponse: string;
  reason: string;
  improvementAreas: string[];
}

export interface WebSearchResult {
  summary: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
    date?: string;
  }>;
  citations: string[];
  searchQuery: string;
  timestamp: Date;
}

export interface SystemConfig {
  // Provider configuration
  provider: 'openrouter' | 'ollama';
  
  // OpenRouter configuration
  apiKey: string;
  model: string;
  
  // Ollama configuration
  ollama: {
    baseUrl: string;
    timeout: number;
    defaultModel: string;
  };
  
  lobes: {
    frontal: LobeConfig;
    temporal: LobeConfig;
    occipital: LobeConfig;
  };
  elevenlabs: {
    apiKey: string;
    voiceId: string;
    stability: number;
    similarityBoost: number;
    model: string;
  };
  perplexity: {
    apiKey: string;
    model: string;
  };
  features: {
    ttsEnabled: boolean;
    speechSummaryEnabled: boolean;
    autoSpeechEnabled: boolean;
    visualizeThinking: boolean;
    webSearchEnabled: boolean;
    holographicEnabled: boolean;
  };
  customInnerThoughtsPrompt?: string;
  innerThoughtsPromptEnabled: boolean;
}

export interface LobeConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface SessionContext {
  conversationHistory: Message[];
  userPreferences?: any;
  sessionId: string;
  timestamp: Date;
}

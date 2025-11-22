import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SystemConfig } from '../types/cognitive';
import { ModelInfo, ProviderType, ProviderStatus } from '../services/providers';

interface SettingsState {
  config: SystemConfig;
  // Provider-specific model lists
  openRouterModels: ModelInfo[];
  ollamaModels: ModelInfo[];
  loadingOpenRouterModels: boolean;
  loadingOllamaModels: boolean;
  // Provider status
  openRouterStatus: ProviderStatus | null;
  ollamaStatus: ProviderStatus | null;
  // Actions
  updateConfig: (updates: Partial<SystemConfig>) => void;
  resetConfig: () => void;
  isConfigValid: () => boolean;
  switchProvider: (provider: ProviderType) => void;
  // Model management
  setOpenRouterModels: (models: ModelInfo[]) => void;
  setOllamaModels: (models: ModelInfo[]) => void;
  setLoadingOpenRouterModels: (loading: boolean) => void;
  setLoadingOllamaModels: (loading: boolean) => void;
  // Status management
  setOpenRouterStatus: (status: ProviderStatus) => void;
  setOllamaStatus: (status: ProviderStatus) => void;
  // Utility functions
  getCurrentModels: () => ModelInfo[];
  getAvailableProviders: () => ProviderType[];
}

const defaultConfig: SystemConfig = {
  // Provider configuration
  provider: 'openrouter',
  
  // OpenRouter configuration
  apiKey: '',
  model: 'anthropic/claude-3.5-sonnet',
  
  // Ollama configuration
  ollama: {
    baseUrl: 'http://localhost:11434',
    timeout: 90000, // Increase to 90 seconds for local processing
    defaultModel: 'qwen3:4b'
  },
  
  lobes: {
    frontal: {
      model: 'anthropic/claude-3.5-sonnet',
      temperature: 0.7,
      maxTokens: 4000
    },
    temporal: {
      model: 'anthropic/claude-3.5-sonnet',
      temperature: 0.3,
      maxTokens: 1000
    },
    occipital: {
      model: 'anthropic/claude-3.5-sonnet',
      temperature: 0.5,
      maxTokens: 2000
    }
  },
  elevenlabs: {
    apiKey: '',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    stability: 0.5,
    similarityBoost: 0.5,
    model: 'eleven_monolingual_v1'
  },
  perplexity: {
    apiKey: '',
    model: 'sonar'
  },
  features: {
    ttsEnabled: false,
    speechSummaryEnabled: true,
    autoSpeechEnabled: false,
    visualizeThinking: true,
    webSearchEnabled: false,
    holographicEnabled: true
  },
  customInnerThoughtsPrompt: undefined,
  innerThoughtsPromptEnabled: false
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      // Provider-specific model lists
      openRouterModels: [],
      ollamaModels: [],
      loadingOpenRouterModels: false,
      loadingOllamaModels: false,
      // Provider status
      openRouterStatus: null,
      ollamaStatus: null,

      updateConfig: (updates: Partial<SystemConfig>) => set((state) => ({
        config: { ...state.config, ...updates }
      })),

      resetConfig: () => set({ config: defaultConfig }),

      isConfigValid: () => {
        const { config } = get();
        if (config.provider === 'openrouter') {
          return Boolean(config.apiKey);
        } else if (config.provider === 'ollama') {
          return Boolean(config.ollama.baseUrl);
        }
        return false;
      },

      switchProvider: (provider: ProviderType) => set((state) => {
        const updatedConfig = { ...state.config, provider };
        
        // Set default model based on provider
        if (provider === 'ollama') {
          // Use appropriate Ollama models based on lobe function
          const defaultModel = 'qwen3:4b'; // General model
          const reasoningModel = 'qwen3:4b-thinking-2507-q4_K_M'; // For reasoning tasks
          const instructModel = 'qwen3:4b-instruct-2507-q4_K_M'; // For instruction following
          const visionModel = 'blaifa/InternVL3_5:4b'; // For vision tasks (if available)
          
          updatedConfig.model = defaultModel;
          updatedConfig.lobes = {
            frontal: { ...updatedConfig.lobes.frontal, model: reasoningModel }, // Best for reasoning
            temporal: { ...updatedConfig.lobes.temporal, model: instructModel }, // Good for structured tasks
            occipital: { ...updatedConfig.lobes.occipital, model: visionModel } // Vision model for image analysis
          };
        } else {
          // Default to OpenRouter models
          const defaultModel = 'anthropic/claude-3.5-sonnet';
          updatedConfig.model = defaultModel;
          updatedConfig.lobes = {
            frontal: { ...updatedConfig.lobes.frontal, model: defaultModel },
            temporal: { ...updatedConfig.lobes.temporal, model: defaultModel },
            occipital: { ...updatedConfig.lobes.occipital, model: defaultModel }
          };
        }
        
        return { config: updatedConfig };
      }),

      // Model management
      setOpenRouterModels: (models: ModelInfo[]) => set({ openRouterModels: models }),

      setOllamaModels: (models: ModelInfo[]) => set({ ollamaModels: models }),

      setLoadingOpenRouterModels: (loading: boolean) => set({ loadingOpenRouterModels: loading }),

      setLoadingOllamaModels: (loading: boolean) => set({ loadingOllamaModels: loading }),

      // Status management
      setOpenRouterStatus: (status: ProviderStatus) => set({ openRouterStatus: status }),

      setOllamaStatus: (status: ProviderStatus) => set({ ollamaStatus: status }),

      // Utility functions
      getCurrentModels: () => {
        const { config, openRouterModels, ollamaModels } = get();
        return config.provider === 'openrouter' ? openRouterModels : ollamaModels;
      },

      getAvailableProviders: () => {
        const providers: ProviderType[] = ['openrouter'];
        const { ollamaStatus } = get();
        
        // Only include Ollama if it's available
        if (ollamaStatus?.connected) {
          providers.push('ollama');
        }
        
        return providers;
      }
    }),
    {
      name: 'zv6-settings',
      version: 2, // Increment version due to schema changes
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        // Handle migration from old config format
        if (version < 2) {
          return {
            ...persistedState,
            config: {
              ...defaultConfig,
              ...persistedState.config,
              provider: persistedState.config?.provider || 'openrouter',
              ollama: persistedState.config?.ollama || defaultConfig.ollama
            },
            ollamaModels: [],
            loadingOllamaModels: false,
            openRouterStatus: null,
            ollamaStatus: null
          };
        }
        return persistedState;
      }
    }
  )
);

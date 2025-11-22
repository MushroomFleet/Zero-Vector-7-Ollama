// Provider types and interfaces for the cognitive AI system

export type ProviderType = 'openrouter' | 'ollama';

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description?: string;
  contextLength: number;
  category: string;
  // Provider-specific metadata
  metadata?: {
    // OpenRouter specific
    promptPrice?: number;
    completionPrice?: number;
    // Ollama specific
    size?: number;
    quantization?: string;
    family?: string;
    parameterSize?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
  }>;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  model?: string;
}

export interface ProviderConfig {
  type: ProviderType;
  // OpenRouter config
  apiKey?: string;
  // Ollama config
  baseUrl?: string;
  timeout?: number;
}

export interface ProviderStatus {
  connected: boolean;
  healthy: boolean;
  error?: string;
  latency?: number;
  serverInfo?: {
    version?: string;
    [key: string]: any;
  };
}

export interface IModelProvider {
  readonly type: ProviderType;
  readonly config: ProviderConfig;
  
  // Connection management
  testConnection(): Promise<ProviderStatus>;
  getStatus(): Promise<ProviderStatus>;
  
  // Model management
  getAvailableModels(): Promise<ModelInfo[]>;
  
  // Chat completions
  generateCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  generateTextCompletion(
    messages: ChatMessage[],
    model: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<string>;
  
  // Utility methods
  validateModel(modelId: string): Promise<boolean>;
  estimateTokens?(text: string): number;
}

export interface ProviderError extends Error {
  providerType: ProviderType;
  code?: string;
  statusCode?: number;
  retryable?: boolean;
}

export class BaseProviderError extends Error implements ProviderError {
  constructor(
    message: string,
    public providerType: ProviderType,
    public code?: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

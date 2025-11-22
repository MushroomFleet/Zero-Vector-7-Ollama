import axios, { AxiosError } from 'axios';
import {
  IModelProvider,
  ProviderType,
  ProviderConfig,
  ProviderStatus,
  ModelInfo,
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  BaseProviderError
} from './types';

// Legacy types for backward compatibility
interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens?: number;
  };
  per_request_limits?: {
    prompt_tokens: string;
    completion_tokens: string;
  };
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

interface OpenRouterChatResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

export class OpenRouterProvider implements IModelProvider {
  readonly type: ProviderType = 'openrouter';
  readonly config: ProviderConfig;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor(config: ProviderConfig) {
    if (config.type !== 'openrouter') {
      throw new BaseProviderError('Invalid provider type for OpenRouterProvider', 'openrouter');
    }

    if (!config.apiKey) {
      throw new BaseProviderError('OpenRouter API key is required', 'openrouter');
    }

    this.config = config;
  }

  async testConnection(): Promise<ProviderStatus> {
    const startTime = Date.now();
    
    try {
      // Test connection by trying to fetch models
      await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
          'X-Title': 'Zero Vector 7 Ollama'
        },
        timeout: 10000
      });
      
      const latency = Date.now() - startTime;
      
      return {
        connected: true,
        healthy: true,
        latency,
        serverInfo: {
          version: 'v1'
        }
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = this.getErrorMessage(error);
      
      return {
        connected: false,
        healthy: false,
        error: errorMessage,
        latency
      };
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    return await this.testConnection();
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      const response = await axios.get<OpenRouterModelsResponse>(
        `${this.baseURL}/models`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
            'X-Title': 'Zero Vector 7 Ollama'
          }
        }
      );

      return this.processModels(response.data.data);
    } catch (error) {
      console.error('Failed to fetch OpenRouter models:', error);
      
      // Return fallback models if API fails
      return this.getFallbackModels();
    }
  }

  async generateCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const response = await axios.post<OpenRouterChatResponse>(
        `${this.baseURL}/chat/completions`,
        request,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
            'X-Title': 'Zero Vector 7 Ollama'
          }
        }
      );

      return {
        choices: response.data.choices,
        usage: response.data.usage,
        model: response.data.model
      };
    } catch (error) {
      console.error('OpenRouter completion error:', error);
      throw new BaseProviderError(
        `Completion failed: ${this.getErrorMessage(error)}`,
        'openrouter',
        'COMPLETION_ERROR',
        this.getStatusCode(error),
        this.isRetryableError(error)
      );
    }
  }

  async generateTextCompletion(
    messages: ChatMessage[],
    model: string,
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<string> {
    const request: ChatCompletionRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    };

    const response = await this.generateCompletion(request);
    return response.choices[0]?.message?.content || 'No response generated';
  }

  async validateModel(modelId: string): Promise<boolean> {
    try {
      const models = await this.getAvailableModels();
      return models.some(model => model.id === modelId);
    } catch (error) {
      console.warn('Failed to validate model:', error);
      return false;
    }
  }

  estimateTokens(text: string): number {
    // Simple token estimation (roughly 4 characters per token for English)
    return Math.ceil(text.length / 4);
  }

  private processModels(models: OpenRouterModel[]): ModelInfo[] {
    return models.map(model => {
      const provider = model.id.split('/')[0] || 'unknown';
      const promptPrice = this.parsePrice(model.pricing.prompt);
      const completionPrice = this.parsePrice(model.pricing.completion);
      
      return {
        id: model.id,
        name: model.name || model.id,
        provider: provider.charAt(0).toUpperCase() + provider.slice(1),
        description: model.description,
        contextLength: model.context_length,
        category: this.categorizeModel(model),
        metadata: {
          promptPrice,
          completionPrice
        }
      };
    }).sort((a, b) => a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name));
  }

  private parsePrice(priceString: string): number {
    // Convert price string like "$0.000002" to number
    return parseFloat(priceString.replace('$', '')) || 0;
  }

  private categorizeModel(model: OpenRouterModel): string {
    const id = model.id.toLowerCase();
    const name = model.name?.toLowerCase() || '';
    
    if (id.includes('claude') || id.includes('anthropic')) return 'Reasoning';
    if (id.includes('gpt-4') || id.includes('o1')) return 'Advanced';
    if (id.includes('gemini') || id.includes('google')) return 'Multimodal';
    if (id.includes('llama') || id.includes('mistral')) return 'Open Source';
    if (name.includes('fast') || id.includes('turbo')) return 'Fast';
    if (id.includes('vision') || name.includes('vision')) return 'Vision';
    return 'General';
  }

  private getFallbackModels(): ModelInfo[] {
    return [
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        description: 'Most intelligent model for complex reasoning',
        contextLength: 200000,
        category: 'Reasoning',
        metadata: {
          promptPrice: 0.000003,
          completionPrice: 0.000015
        }
      },
      {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Advanced multimodal model',
        contextLength: 128000,
        category: 'Advanced',
        metadata: {
          promptPrice: 0.000005,
          completionPrice: 0.000015
        }
      },
      {
        id: 'google/gemini-pro-1.5',
        name: 'Gemini Pro 1.5',
        provider: 'Google',
        description: 'Google\'s latest multimodal model',
        contextLength: 2000000,
        category: 'Multimodal',
        metadata: {
          promptPrice: 0.0000035,
          completionPrice: 0.0000105
        }
      }
    ];
  }

  private getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.status === 401) {
        return 'Invalid API key. Please check your OpenRouter API key.';
      }
      
      if (axiosError.response?.status === 429) {
        return 'Rate limit exceeded. Please try again later.';
      }
      
      if (axiosError.response?.status === 402) {
        return 'Insufficient credits. Please add credits to your OpenRouter account.';
      }
      
      if (axiosError.response?.data) {
        const data = axiosError.response.data as any;
        return data.error?.message || data.message || 'Unknown server error';
      }
      
      return axiosError.message;
    }
    
    return error?.message || 'Unknown error occurred';
  }

  private getStatusCode(error: any): number | undefined {
    if (axios.isAxiosError(error)) {
      return error.response?.status;
    }
    return undefined;
  }

  private isRetryableError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      // Retry on server errors (5xx) and rate limits, but not auth errors
      return !status || status >= 500 || status === 429;
    }
    return false;
  }
}

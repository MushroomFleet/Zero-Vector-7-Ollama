import axios, { AxiosInstance, AxiosError } from 'axios';
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

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

interface OllamaModelsResponse {
  models: OllamaModel[];
}

interface OllamaChatRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  stream?: boolean;
  options?: {
    temperature?: number;
    num_predict?: number; // max_tokens equivalent
    top_k?: number;
    top_p?: number;
  };
}

interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaServerInfo {
  version?: string;
  [key: string]: any;
}

export class OllamaProvider implements IModelProvider {
  readonly type: ProviderType = 'ollama';
  readonly config: ProviderConfig;
  private client: AxiosInstance;

  constructor(config: ProviderConfig) {
    if (config.type !== 'ollama') {
      throw new BaseProviderError('Invalid provider type for OllamaProvider', 'ollama');
    }

    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'http://localhost:11434',
      timeout: config.timeout || 30000
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async testConnection(): Promise<ProviderStatus> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.get('/api/version');
      const latency = Date.now() - startTime;
      
      return {
        connected: true,
        healthy: true,
        latency,
        serverInfo: response.data as OllamaServerInfo
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
      const response = await this.client.get<OllamaModelsResponse>('/api/tags');
      return this.processModels(response.data.models || []);
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      throw new BaseProviderError(
        `Failed to fetch models: ${this.getErrorMessage(error)}`,
        'ollama',
        'MODEL_FETCH_ERROR',
        this.getStatusCode(error),
        true
      );
    }
  }

  async generateCompletion(request: ChatCompletionRequest, retryCount: number = 0): Promise<ChatCompletionResponse> {
    const maxRetries = 2;
    const baseDelay = 1000; // 1 second base delay
    
    try {
      const ollamaRequest: OllamaChatRequest = {
        model: request.model,
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content : 
                   msg.content.map(part => part.text || '').join(' ')
        })),
        stream: false,
        options: {
          temperature: request.temperature,
          num_predict: request.max_tokens
        }
      };

      console.log(`🤖 Ollama: Using model "${request.model}" (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      const response = await this.client.post<OllamaChatResponse>('/api/chat', ollamaRequest);
      
      console.log(`✅ Ollama: Response received in ${response.data.total_duration ? Math.round(response.data.total_duration / 1000000) : 'unknown'}ms`);
      
      return {
        choices: [{
          message: {
            content: response.data.message.content,
            role: response.data.message.role
          },
          finish_reason: response.data.done ? 'stop' : 'length'
        }],
        usage: {
          prompt_tokens: response.data.prompt_eval_count,
          completion_tokens: response.data.eval_count,
          total_tokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
        },
        model: response.data.model
      };
    } catch (error) {
      console.error(`❌ Ollama completion error (attempt ${retryCount + 1}):`, error);
      
      // Implement smart retry logic
      if (this.isRetryableError(error) && retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.generateCompletion(request, retryCount + 1);
      }
      
      throw new BaseProviderError(
        `Completion failed: ${this.getErrorMessage(error)}`,
        'ollama',
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

  private processModels(models: OllamaModel[]): ModelInfo[] {
    return models.map(model => {
      const family = model.details?.family || 'unknown';
      const parameterSize = model.details?.parameter_size || 'unknown';
      
      return {
        id: model.name,
        name: this.formatModelName(model.name),
        provider: 'Ollama',
        description: `Local ${family} model (${parameterSize})`,
        contextLength: this.estimateContextLength(family, parameterSize),
        category: this.categorizeModel(model),
        metadata: {
          size: model.size,
          quantization: model.details?.quantization_level,
          family: model.details?.family,
          parameterSize: model.details?.parameter_size
        }
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  private formatModelName(modelName: string): string {
    // Convert model names like "llama2:7b" to "Llama 2 (7B)"
    const parts = modelName.split(':');
    const baseName = parts[0];
    const variant = parts[1];

    // Capitalize and format base name
    const formatted = baseName
      .replace(/llama(\d+)/i, 'Llama $1')
      .replace(/mistral/i, 'Mistral')
      .replace(/codellama/i, 'Code Llama')
      .replace(/vicuna/i, 'Vicuna')
      .replace(/orca/i, 'Orca')
      .replace(/wizard/i, 'Wizard')
      .replace(/nous-hermes/i, 'Nous Hermes')
      .replace(/phi/i, 'Phi')
      .replace(/qwen/i, 'Qwen')
      .replace(/deepseek/i, 'DeepSeek');

    if (variant) {
      const formattedVariant = variant.toUpperCase().replace('B', 'B');
      return `${formatted} (${formattedVariant})`;
    }

    return formatted || modelName;
  }

  private estimateContextLength(family: string, parameterSize: string): number {
    // Estimate context length based on model family and size
    const lowerFamily = family.toLowerCase();
    const lowerSize = parameterSize.toLowerCase();

    if (lowerFamily.includes('llama')) {
      if (lowerSize.includes('70b') || lowerSize.includes('65b')) return 4096;
      if (lowerSize.includes('13b')) return 4096;
      if (lowerSize.includes('7b')) return 4096;
    }

    if (lowerFamily.includes('mistral')) {
      return 8192; // Most Mistral models support 8k context
    }

    if (lowerFamily.includes('qwen')) {
      return 8192; // Qwen models typically support 8k
    }

    // Default fallback
    return 2048;
  }

  private categorizeModel(model: OllamaModel): string {
    const name = model.name.toLowerCase();
    const family = model.details?.family?.toLowerCase() || '';

    if (name.includes('code') || family.includes('code')) return 'Coding';
    if (name.includes('instruct') || name.includes('chat')) return 'Instruction';
    if (name.includes('wizard') || name.includes('orca')) return 'Reasoning';
    if (name.includes('llama')) return 'General';
    if (name.includes('mistral')) return 'Efficient';
    if (name.includes('phi')) return 'Small';
    if (name.includes('qwen')) return 'Multilingual';

    return 'General';
  }

  private getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNREFUSED') {
        return 'Connection refused. Is Ollama running on the specified port?';
      }
      
      if (axiosError.code === 'ENOTFOUND') {
        return 'Host not found. Check the Ollama server URL.';
      }
      
      if (axiosError.response?.data) {
        const data = axiosError.response.data as any;
        return data.error || data.message || 'Unknown server error';
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
      // Retry on network errors, server errors (5xx), and timeouts
      return !status || status >= 500 || error.code === 'ECONNRESET' || error.code === 'ECONNABORTED';
    }
    return false;
  }

  // Add model keep-alive functionality
  async keepModelAlive(modelId: string): Promise<void> {
    try {
      console.log(`🔄 Keeping model "${modelId}" alive...`);
      await this.client.post('/api/chat', {
        model: modelId,
        messages: [{ role: 'user', content: 'ping' }],
        stream: false,
        options: { num_predict: 1 }
      });
      console.log(`✅ Model "${modelId}" is kept alive`);
    } catch (error) {
      console.warn(`⚠️ Failed to keep model "${modelId}" alive:`, error);
    }
  }

  // Preload model to reduce cold start delays
  async preloadModel(modelId: string): Promise<boolean> {
    try {
      console.log(`🚀 Preloading model "${modelId}"...`);
      const response = await this.client.post('/api/chat', {
        model: modelId,
        messages: [{ role: 'user', content: 'Hello' }],
        stream: false,
        options: { num_predict: 5 }
      });
      console.log(`✅ Model "${modelId}" preloaded successfully`);
      return true;
    } catch (error) {
      console.warn(`⚠️ Failed to preload model "${modelId}":`, error);
      return false;
    }
  }
}

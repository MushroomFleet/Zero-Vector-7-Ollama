import axios from 'axios';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
  }>;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
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
}

export interface OpenRouterModel {
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

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

export interface ProcessedModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
  contextLength: number;
  promptPrice: number;
  completionPrice: number;
  category: string;
}

export class OpenRouterAPI {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCompletion(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        request,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Zero Vector 7 Ollama'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      throw new Error(`OpenRouter API failed: ${error}`);
    }
  }

  async generateTextCompletion(
    messages: OpenRouterMessage[],
    model: string,
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<string> {
    const request: OpenRouterRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    };

    const response = await this.generateCompletion(request);
    return response.choices[0]?.message?.content || 'No response generated';
  }

  async getAvailableModels(): Promise<ProcessedModel[]> {
    try {
      const response = await axios.get<OpenRouterModelsResponse>(
        `${this.baseURL}/models`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Zero Vector 7 Ollama'
          }
        }
      );

      return this.processModels(response.data.data);
    } catch (error) {
      console.error('Failed to fetch OpenRouter models:', error);
      return this.getFallbackModels();
    }
  }

  private processModels(models: OpenRouterModel[]): ProcessedModel[] {
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
        promptPrice,
        completionPrice,
        category: this.categorizeModel(model)
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

  private getFallbackModels(): ProcessedModel[] {
    return [
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        description: 'Most intelligent model for complex reasoning',
        contextLength: 200000,
        promptPrice: 0.000003,
        completionPrice: 0.000015,
        category: 'Reasoning'
      },
      {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Advanced multimodal model',
        contextLength: 128000,
        promptPrice: 0.000005,
        completionPrice: 0.000015,
        category: 'Advanced'
      },
      {
        id: 'google/gemini-pro-1.5',
        name: 'Gemini Pro 1.5',
        provider: 'Google',
        description: 'Google\'s latest multimodal model',
        contextLength: 2000000,
        promptPrice: 0.0000035,
        completionPrice: 0.0000105,
        category: 'Multimodal'
      }
    ];
  }
}

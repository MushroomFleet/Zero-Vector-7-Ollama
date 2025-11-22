import {
  IModelProvider,
  ProviderType,
  ProviderConfig,
  BaseProviderError
} from './types';
import { OpenRouterProvider } from './OpenRouterProvider';
import { OllamaProvider } from './OllamaProvider';

export class ProviderFactory {
  private static providers: Map<string, IModelProvider> = new Map();

  /**
   * Create a provider instance based on configuration
   */
  static createProvider(config: ProviderConfig): IModelProvider {
    const cacheKey = this.getCacheKey(config);
    
    // Return cached provider if it exists and config hasn't changed
    if (this.providers.has(cacheKey)) {
      const provider = this.providers.get(cacheKey)!;
      if (this.configMatches(provider.config, config)) {
        return provider;
      }
    }

    // Create new provider instance
    let provider: IModelProvider;

    switch (config.type) {
      case 'openrouter':
        provider = new OpenRouterProvider(config);
        break;
      
      case 'ollama':
        provider = new OllamaProvider(config);
        break;
      
      default:
        throw new BaseProviderError(
          `Unsupported provider type: ${config.type}`,
          config.type as ProviderType
        );
    }

    // Cache the provider
    this.providers.set(cacheKey, provider);
    return provider;
  }

  /**
   * Get provider instance for a specific type with configuration
   */
  static getProvider(type: ProviderType, config: Partial<ProviderConfig>): IModelProvider {
    const fullConfig: ProviderConfig = {
      type,
      ...config
    };

    return this.createProvider(fullConfig);
  }

  /**
   * Clear cached providers
   */
  static clearCache(): void {
    this.providers.clear();
  }

  /**
   * Remove specific provider from cache
   */
  static removeFromCache(config: ProviderConfig): void {
    const cacheKey = this.getCacheKey(config);
    this.providers.delete(cacheKey);
  }

  /**
   * Get all cached providers
   */
  static getCachedProviders(): IModelProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Test connection for multiple providers
   */
  static async testProviders(configs: ProviderConfig[]): Promise<Array<{
    config: ProviderConfig;
    provider: IModelProvider;
    status: any;
  }>> {
    const results = await Promise.allSettled(
      configs.map(async (config) => {
        const provider = this.createProvider(config);
        const status = await provider.testConnection();
        return { config, provider, status };
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          config: configs[index],
          provider: null as any,
          status: {
            connected: false,
            healthy: false,
            error: result.reason?.message || 'Unknown error'
          }
        };
      }
    });
  }

  /**
   * Get recommended provider based on requirements
   */
  static getRecommendedProvider(requirements: {
    privacy?: boolean;
    cost?: 'low' | 'medium' | 'high';
    performance?: 'fast' | 'balanced' | 'quality';
    multimodal?: boolean;
  }): ProviderType {
    // If privacy is a priority, recommend Ollama
    if (requirements.privacy) {
      return 'ollama';
    }

    // If cost is a concern and privacy isn't, recommend OpenRouter for variety
    if (requirements.cost === 'low') {
      return 'openrouter'; // Has access to cheaper models
    }

    // Default to OpenRouter for most use cases
    return 'openrouter';
  }

  /**
   * Validate provider configuration
   */
  static validateConfig(config: ProviderConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.type) {
      errors.push('Provider type is required');
    }

    switch (config.type) {
      case 'openrouter':
        if (!config.apiKey) {
          errors.push('OpenRouter API key is required');
        }
        break;
      
      case 'ollama':
        if (config.baseUrl && !this.isValidUrl(config.baseUrl)) {
          errors.push('Invalid Ollama base URL');
        }
        if (config.timeout && (config.timeout < 1000 || config.timeout > 300000)) {
          errors.push('Timeout must be between 1000ms and 300000ms');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static getCacheKey(config: ProviderConfig): string {
    // Create a unique cache key based on config
    const keyParts = [
      config.type,
      config.apiKey?.substring(0, 8) || '',
      config.baseUrl || '',
      config.timeout || ''
    ];
    
    return keyParts.join('|');
  }

  private static configMatches(config1: ProviderConfig, config2: ProviderConfig): boolean {
    return (
      config1.type === config2.type &&
      config1.apiKey === config2.apiKey &&
      config1.baseUrl === config2.baseUrl &&
      config1.timeout === config2.timeout
    );
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

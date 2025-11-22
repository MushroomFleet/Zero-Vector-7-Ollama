import axios from 'axios';
import { WebSearchResult } from '../types/cognitive';

export interface PerplexityResponse {
  id: string;
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
  citations?: string[];
}

export interface PerplexityModel {
  id: string;
  object: string;
  owned_by: string;
  context_length: number;
}

export class PerplexityService {
  private apiKey: string;
  private baseURL: string;
  private corsProxies = [
    'https://cors.lol/',
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?'
  ];

  // Static models - Perplexity doesn't provide a /models endpoint
  private static availableModels: PerplexityModel[] = [
    { id: 'sonar', object: 'model', owned_by: 'perplexity', context_length: 127072 },
    { id: 'sonar-pro', object: 'model', owned_by: 'perplexity', context_length: 127072 },
    { id: 'sonar-reasoning', object: 'model', owned_by: 'perplexity', context_length: 127072 },
    { id: 'sonar-reasoning-pro', object: 'model', owned_by: 'perplexity', context_length: 127072 },
    { id: 'sonar-deep-research', object: 'model', owned_by: 'perplexity', context_length: 127072 },
    { id: 'llama-3.1-sonar-small-128k-online', object: 'model', owned_by: 'perplexity', context_length: 127072 },
    { id: 'llama-3.1-sonar-large-128k-online', object: 'model', owned_by: 'perplexity', context_length: 127072 },
    { id: 'llama-3.1-sonar-huge-128k-online', object: 'model', owned_by: 'perplexity', context_length: 127072 }
  ];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = this.getApiBaseUrl();
  }

  private getApiBaseUrl(): string {
    // Use development proxy in dev mode, CORS proxy in production
    if (import.meta.env.DEV) {
      return '/api/perplexity';
    }
    return `${this.corsProxies[0]}https://api.perplexity.ai`;
  }

  getAvailableModels(): PerplexityModel[] {
    return PerplexityService.availableModels;
  }

  private async makeApiCall<T>(
    url: string,
    method: 'GET' | 'POST',
    data?: any,
    successHandler?: (response: any) => T,
    proxyIndex: number = 0
  ): Promise<T> {
    try {
      const response = await axios({
        method,
        url,
        data,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return successHandler ? successHandler(response) : response.data;
    } catch (error: any) {
      // If it's a CORS error and we're in production, try next proxy
      if (!import.meta.env.DEV && proxyIndex < this.corsProxies.length - 1 && 
          (error.code === 'ERR_NETWORK' || error.message?.includes('CORS'))) {
        console.warn(`Proxy ${proxyIndex} failed, trying next proxy...`);
        const nextProxyUrl = url.replace(this.corsProxies[proxyIndex], this.corsProxies[proxyIndex + 1]);
        return this.makeApiCall(nextProxyUrl, method, data, successHandler, proxyIndex + 1);
      }
      
      console.error('Perplexity API Error:', error);
      throw new Error(`Web search failed: ${error.message || error}`);
    }
  }

  async search(query: string, model: string = 'sonar'): Promise<WebSearchResult> {
    const requestData = {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful research assistant. Provide comprehensive, accurate information with proper citations. Focus on recent, reliable sources.'
        },
        {
          role: 'user',
          content: `Research and provide detailed information about: ${query}\n\nPlease include specific facts, recent developments, and cite your sources clearly.`
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    };

    try {
      const result = await this.makeApiCall(
        `${this.baseURL}/chat/completions`,
        'POST',
        requestData,
        (response) => response.data as PerplexityResponse
      );

      const content = result.choices[0]?.message?.content || 'No results found';
      
      return {
        summary: content,
        sources: this.extractSources(content),
        citations: result.citations || [],
        searchQuery: query,
        timestamp: new Date()
      };
    } catch (error) {
      // If the model is invalid, try with fallback model
      if (model !== 'sonar') {
        console.log('Retrying with fallback model: sonar');
        return this.search(query, 'sonar');
      }
      throw error;
    }
  }

  private extractSources(content: string): Array<{title: string; url: string; snippet: string; date?: string}> {
    const sources: Array<{title: string; url: string; snippet: string; date?: string}> = [];
    
    // Extract URL patterns and create sources
    const urlPattern = /https?:\/\/[^\s\)]+/g;
    const urls = content.match(urlPattern) || [];
    
    urls.forEach((url, index) => {
      // Extract context around URL for snippet
      const urlIndex = content.indexOf(url);
      const contextStart = Math.max(0, urlIndex - 100);
      const contextEnd = Math.min(content.length, urlIndex + 200);
      const snippet = content.substring(contextStart, contextEnd).trim();
      
      sources.push({
        title: `Source ${index + 1}`,
        url: url.replace(/[^\w\-\.\/\:\?=&]/g, ''),
        snippet: snippet.substring(0, 150) + '...',
        date: new Date().toISOString().split('T')[0]
      });
    });

    return sources;
  }

  optimizeSearchQuery(userInput: string, intent: string): string {
    // Create more effective search queries based on intent
    const currentYear = new Date().getFullYear();
    
    if (intent.toLowerCase().includes('recent') || intent.toLowerCase().includes('latest')) {
      return `${userInput} ${currentYear} latest news updates`;
    }
    
    if (intent.toLowerCase().includes('compare') || intent.toLowerCase().includes('versus')) {
      return `${userInput} comparison analysis differences`;
    }
    
    if (intent.toLowerCase().includes('how to') || intent.toLowerCase().includes('tutorial')) {
      return `${userInput} step by step guide tutorial`;
    }
    
    return userInput;
  }
}
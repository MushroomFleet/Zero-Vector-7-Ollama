import { IModelProvider } from '../../services/providers';
import { FrontalLobeTrace, SessionContext, LobeConfig } from '../../types/cognitive';

export class FrontalLobe {
  private provider: IModelProvider;

  constructor(provider: IModelProvider) {
    this.provider = provider;
  }

  async processThought(
    input: string,
    context: SessionContext,
    guidance: string,
    systemPrompt?: string,
    contextualData?: string,
    config?: LobeConfig
  ): Promise<FrontalLobeTrace> {
    const startTime = Date.now();
    
    const finalSystemPrompt = systemPrompt || this.getDefaultSystemPrompt();
    const conversationContext = this.buildConversationContext(context);
    
    let userPrompt = `${guidance}\n\nUser Request: "${input}"`;
    
    if (conversationContext) {
      userPrompt += `\n\nConversation Context:\n${conversationContext}`;
    }
    
    if (contextualData) {
      userPrompt += `\n\nAdditional Context:\n${contextualData}`;
    }

    const response = await this.provider.generateTextCompletion(
      [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: userPrompt }
      ],
      config?.model || 'qwen3:4b', // Use configured model with fallback
      config?.temperature || 0.7,
      config?.maxTokens || 4000
    );

    const processingTime = Date.now() - startTime;
    
    return {
      reasoning: this.extractReasoning(response),
      response: response,
      confidence: this.assessConfidence(response, processingTime),
      usedContext: Boolean(conversationContext || contextualData),
      thinkingSteps: this.extractThinkingSteps(response)
    };
  }

  private getDefaultSystemPrompt(): string {
    return `You are an advanced AI assistant with sophisticated reasoning capabilities. 

Your approach:
1. Analyze the request carefully
2. Consider all available context
3. Think through your response step-by-step
4. Provide clear, helpful, and accurate information
5. Be conversational but precise

Show your reasoning process when handling complex requests.`;
  }

  private buildConversationContext(context: SessionContext): string {
    // Use full conversation history, with smart truncation for very long conversations
    const allMessages = context.conversationHistory;
    if (allMessages.length === 0) return '';

    // For conversations over 20 messages, keep all recent messages but summarize older ones
    let messagesToInclude = allMessages;
    if (allMessages.length > 20) {
      const recentMessages = allMessages.slice(-15); // Keep last 15 messages in full
      const olderMessages = allMessages.slice(0, -15);
      const summary = `[Earlier conversation: ${olderMessages.length} messages covering topics like: ${olderMessages.slice(-3).map(m => m.content.substring(0, 50)).join(', ')}...]`;
      
      return [summary, ...recentMessages.map(msg => `${msg.role}: ${msg.content}`)].join('\n');
    }

    // For shorter conversations, include full context
    return messagesToInclude
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  private extractReasoning(response: string): string {
    const reasoningMarkers = [
      'Let me think through this',
      'My reasoning:',
      'Step by step:',
      'Analysis:',
      'Here\'s my thought process:'
    ];

    for (const marker of reasoningMarkers) {
      const index = response.toLowerCase().indexOf(marker.toLowerCase());
      if (index !== -1) {
        return response.substring(index, index + 500);
      }
    }

    const firstParagraph = response.split('\n\n')[0];
    return firstParagraph.length > 100 ? firstParagraph : 'Applied systematic reasoning to generate response';
  }

  private extractThinkingSteps(response: string): string[] {
    const steps: string[] = [];
    const lines = response.split('\n');

    for (const line of lines) {
      if (/^\d+\./.test(line.trim()) || line.includes('Step ') || line.includes('First,') || line.includes('Second,')) {
        steps.push(line.trim());
      }
    }

    return steps.length > 0 ? steps : ['Analyzed request', 'Generated comprehensive response'];
  }

  private assessConfidence(response: string, processingTime: number): number {
    let confidence = 0.7;

    if (response.length > 500) confidence += 0.1;
    if (response.length > 1000) confidence += 0.1;

    if (processingTime > 1000 && processingTime < 10000) confidence += 0.1;

    const uncertaintyIndicators = ['might', 'could be', 'possibly', 'not sure', 'unclear'];
    const uncertaintyCount = uncertaintyIndicators.reduce((count, indicator) => {
      return count + (response.toLowerCase().includes(indicator) ? 1 : 0);
    }, 0);

    confidence -= uncertaintyCount * 0.1;

    return Math.max(0.1, Math.min(1.0, confidence));
  }
}

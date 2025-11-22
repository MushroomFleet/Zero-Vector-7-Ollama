import { IModelProvider } from '../../services/providers';
import { PerplexityService } from '../../services/perplexityService';
import { Message, InnerThoughtsTrace, SessionContext, WebSearchResult, SystemConfig } from '../../types/cognitive';

export class InnerThoughts {
  private provider: IModelProvider;
  private perplexityService: PerplexityService | null = null;
  private config: SystemConfig;

  constructor(provider: IModelProvider, config: SystemConfig, perplexityKey?: string) {
    this.provider = provider;
    this.config = config;
    if (perplexityKey) {
      this.perplexityService = new PerplexityService(perplexityKey);
    }
  }

  async analyzeUserInput(
    input: string,
    context: SessionContext,
    inputType: 'text' | 'image' = 'text',
    forceWebSearch: boolean = false
  ): Promise<InnerThoughtsTrace> {
    // Use full conversation history for better context understanding
    const allMessages = context.conversationHistory;
    const conversationContext = this.buildConversationContext(allMessages);

    const systemPrompt = this.generateAnalysisPrompt(inputType);
    const analysisPrompt = this.formatAnalysisPrompt(input, conversationContext, inputType);

    const response = await this.provider.generateTextCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: analysisPrompt }
      ],
      this.config.model, // Use the configured default model
      0.3,
      1500
    );

    const baseTrace = this.parseAnalysisResponse(response);

    // Perform web search if forced or needed
    if ((forceWebSearch || baseTrace.needsWebSearch) && this.perplexityService) {
      const searchQuery = baseTrace.webSearchQuery || input;
      console.log(`🔍 Web search enabled, searching for: ${searchQuery}`);
      const webResults = await this.performWebSearch(searchQuery, baseTrace.intent);
      
      if (webResults) {
        baseTrace.webSearchResults = [webResults];
        baseTrace.processingSteps.push(`Performed web search: ${searchQuery}`);
        baseTrace.needsWebSearch = true; // Mark as performed
      }
    }

    return baseTrace;
  }

  async performWebSearch(query: string, intent: string): Promise<WebSearchResult | null> {
    if (!this.perplexityService) {
      console.log('Web search not available - no Perplexity API key');
      return null;
    }

    try {
      const optimizedQuery = this.perplexityService.optimizeSearchQuery(query, intent);
      console.log(`🔍 Searching web for: ${optimizedQuery}`);
      
      return await this.perplexityService.search(optimizedQuery);
    } catch (error) {
      console.error('Web search failed:', error);
      return null;
    }
  }

  private static readonly CORE_SYSTEM_FOOTER = `

CRITICAL: You must respond in this exact format for system compatibility:

INTENT: [user's intent]
CONTEXT: [contextual assessment] 
PLAN: [processing plan]
CONFIDENCE: [0.0-1.0]
WEB_SEARCH: [true/false]
STEPS: [numbered processing steps]

Failure to follow this format will cause system errors.`;

  private generateAnalysisPrompt(inputType: 'text' | 'image'): string {
    let userPrompt: string;

    // Check if custom prompt is enabled and available
    if (this.config.innerThoughtsPromptEnabled && this.config.customInnerThoughtsPrompt) {
      userPrompt = this.config.customInnerThoughtsPrompt;
    } else {
      // Default system prompt (user-customizable section)
      userPrompt = `You are the Inner Thoughts lobe of an advanced cognitive AI system. Your role is to analyze user input and plan the cognitive response.

Your analysis should include:
1. INTENT: What does the user want to accomplish?
2. CONTEXT: How does this relate to previous conversation?
3. PLAN: What cognitive approach should be used?
4. CONFIDENCE: How certain are you about this analysis? (0.0-1.0)
5. WEB_SEARCH: Does this require real-time information? (true/false)`;
    }

    // Add image processing note if needed
    if (inputType === 'image') {
      userPrompt += `\n\nNote: This is an image analysis request. Consider visual processing needs.`;
    }

    // Always append the core system footer to ensure proper parsing
    return userPrompt + InnerThoughts.CORE_SYSTEM_FOOTER;
  }

  private formatAnalysisPrompt(
    input: string,
    conversationContext: string,
    inputType: 'text' | 'image'
  ): string {
    return `User Input (${inputType}): "${input}"

Recent Conversation Context:
${conversationContext}

Analyze this input and provide your assessment:`;
  }

  private buildConversationContext(messages: Message[]): string {
    if (messages.length === 0) return 'No previous conversation';

    // For long conversations, use smart truncation to preserve important context
    if (messages.length > 15) {
      const recentMessages = messages.slice(-10); // Keep last 10 messages in full
      const olderMessages = messages.slice(0, -10);
      const summary = `[Earlier: ${olderMessages.length} messages with key topics: ${olderMessages.slice(-2).map(m => m.content.substring(0, 40)).join(', ')}...]`;
      
      const recentContext = recentMessages
        .map((msg, index) => {
          const timeInfo = msg.timestamp ? ` (${msg.timestamp.toLocaleTimeString()})` : '';
          return `${index + 1}. ${msg.role}${timeInfo}: ${msg.content}`;
        })
        .join('\n');
      
      return `${summary}\n${recentContext}`;
    }

    // For shorter conversations, include full context without truncation
    return messages
      .map((msg, index) => {
        const timeInfo = msg.timestamp ? ` (${msg.timestamp.toLocaleTimeString()})` : '';
        return `${index + 1}. ${msg.role}${timeInfo}: ${msg.content}`;
      })
      .join('\n');
  }

  private parseAnalysisResponse(response: string): InnerThoughtsTrace {
    const lines = response.split('\n');
    const trace: Partial<InnerThoughtsTrace> = {
      processingSteps: []
    };

    for (const line of lines) {
      if (line.startsWith('INTENT:')) {
        trace.intent = line.replace('INTENT:', '').trim();
      } else if (line.startsWith('CONTEXT:')) {
        trace.context = line.replace('CONTEXT:', '').trim();
      } else if (line.startsWith('PLAN:')) {
        trace.plan = line.replace('PLAN:', '').trim();
      } else if (line.startsWith('CONFIDENCE:')) {
        trace.confidence = parseFloat(line.replace('CONFIDENCE:', '').trim());
      } else if (line.startsWith('WEB_SEARCH:')) {
        trace.needsWebSearch = line.replace('WEB_SEARCH:', '').trim().toLowerCase() === 'true';
      } else if (line.startsWith('STEPS:')) {
        const stepsText = line.replace('STEPS:', '').trim();
        if (stepsText) {
          trace.processingSteps = [stepsText];
        }
      } else if (/^\d+\./.test(line.trim())) {
        trace.processingSteps?.push(line.trim());
      }
    }

    return {
      intent: trace.intent || 'Unknown intent',
      context: trace.context || 'No context available',
      plan: trace.plan || 'Standard processing',
      confidence: trace.confidence || 0.5,
      needsWebSearch: trace.needsWebSearch || false,
      processingSteps: trace.processingSteps || ['Analyze input', 'Generate response']
    };
  }

  generateSystemPrompt(analysis: InnerThoughtsTrace, contextualData?: string): string {
    let prompt = `You are the Frontal Lobe of an advanced cognitive AI system. You excel at reasoning, analysis, and generating thoughtful responses.

Current Task Analysis:
- Intent: ${analysis.intent}
- Context: ${analysis.context}
- Processing Plan: ${analysis.plan}

Your approach should be:
1. Think step-by-step through the problem
2. Use clear reasoning at each step
3. Provide a comprehensive, helpful response
4. Be direct and accurate`;

    // Add web search results if available
    if (analysis.webSearchResults && analysis.webSearchResults.length > 0) {
      const webData = analysis.webSearchResults[0];
      prompt += `\n\nWeb Search Results:
Query: ${webData.searchQuery}
Summary: ${webData.summary}
Sources: ${webData.sources.map(s => `${s.title}: ${s.url}`).join(', ')}

Use this current information to enhance your response, citing sources when relevant.`;
    }

    if (contextualData) {
      prompt += `\n\nAdditional Contextual Data:
${contextualData}

Integrate this information appropriately with your reasoning.`;
    }

    return prompt;
  }

  async generateSpeechSummary(
    finalResponse: string,
    analysis: InnerThoughtsTrace
  ): Promise<string> {
    const systemPrompt = `You are the Inner Thoughts lobe creating a natural speech summary. Convert the written response into conversational speech content.

Your task:
1. Extract the key insights and main points
2. Make it sound natural when spoken aloud
3. Remove technical jargon and complex formatting
4. Focus on what's most valuable for the listener
5. Keep it concise but complete (30-60 seconds when spoken)

Make it sound like a thoughtful person explaining the key points in conversation, not reading from a text.`;

    const summaryPrompt = `Original Response:
"${finalResponse}"

Context: ${analysis.intent}
Plan: ${analysis.plan}

Create a natural speech summary of the key points:`;

    try {
      console.log('🗣️ Generating speech summary...');
      const response = await this.provider.generateTextCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: summaryPrompt }
        ],
        this.config.model, // Use the configured default model
        0.4,
        200 // Reduced tokens for faster processing
      );

      console.log('✅ Speech summary generated successfully');
      return response.trim();
    } catch (error) {
      console.warn('⚠️ Speech summary generation failed, using fallback:', error);
      
      // For timeout errors, provide user-friendly message
      if (error.message?.includes('timeout')) {
        console.log('💡 Using fallback due to timeout - consider using faster model for speech summaries');
      }
      
      // Fallback to simple summarization
      return this.generateFallbackSpeechSummary(finalResponse);
    }
  }

  private generateFallbackSpeechSummary(text: string): string {
    // Remove markdown and complex formatting
    const cleaned = text
      .replace(/[#*`_]/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleaned.length <= 300) return cleaned;

    // Find natural breaking points
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 10);
    let summary = '';
    
    for (const sentence of sentences) {
      if (summary.length + sentence.length + 2 <= 300) {
        summary += sentence.trim() + '. ';
      } else {
        break;
      }
    }

    return summary.trim() || cleaned.substring(0, 297) + '...';
  }

  updatePerplexityKey(apiKey: string): void {
    this.perplexityService = new PerplexityService(apiKey);
  }

  updateConfig(config: SystemConfig): void {
    this.config = config;
  }
}

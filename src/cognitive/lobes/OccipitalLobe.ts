import { IModelProvider } from '../../services/providers';
import { VisionAnalysis } from '../../types/cognitive';

export class OccipitalLobe {
  private provider: IModelProvider;

  constructor(provider: IModelProvider) {
    this.provider = provider;
  }

  async analyzeImage(imageData: string, userQuery: string, lobeConfig?: any): Promise<VisionAnalysis> {
    const systemPrompt = `You are the Occipital Lobe of an advanced cognitive AI system, specialized in visual analysis and processing.

Your analysis should include:
1. DESCRIPTION: Detailed description of what you see
2. OBJECTS: List specific objects, people, or items identified
3. COLORS: Dominant colors and color schemes
4. MOOD: Overall mood, atmosphere, or emotional tone
5. TEXT: Any text visible in the image (if present)
6. CONFIDENCE: Your confidence in this analysis (0.0-1.0)

Provide thorough, accurate visual analysis that captures both obvious and subtle details.`;

    const userPrompt = `Analyze this image: "${userQuery}"

Please provide a comprehensive visual analysis following the format specified in your instructions.`;

    try {
      const response = await this.provider.generateCompletion({
        model: lobeConfig?.model || 'blaifa/InternVL3_5:4b', // Use configured model with fallback
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: imageData } }
            ]
          }
        ],
        temperature: lobeConfig?.temperature || 0.3,
        max_tokens: lobeConfig?.maxTokens || 2000
      });

      const analysis = response.choices[0]?.message?.content || '';
      return this.parseVisionAnalysis(analysis);

    } catch (error) {
      console.error('Image analysis failed:', error);
      return {
        description: 'Image analysis failed due to processing error',
        objects: [],
        colors: [],
        mood: 'Unable to determine',
        confidence: 0.0
      };
    }
  }

  private parseVisionAnalysis(response: string): VisionAnalysis {
    const lines = response.split('\n');
    const analysis: Partial<VisionAnalysis> = {
      objects: [],
      colors: []
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('DESCRIPTION:')) {
        analysis.description = trimmedLine.replace('DESCRIPTION:', '').trim();
      } else if (trimmedLine.startsWith('OBJECTS:')) {
        const objectsText = trimmedLine.replace('OBJECTS:', '').trim();
        analysis.objects = this.parseListItems(objectsText);
      } else if (trimmedLine.startsWith('COLORS:')) {
        const colorsText = trimmedLine.replace('COLORS:', '').trim();
        analysis.colors = this.parseListItems(colorsText);
      } else if (trimmedLine.startsWith('MOOD:')) {
        analysis.mood = trimmedLine.replace('MOOD:', '').trim();
      } else if (trimmedLine.startsWith('TEXT:')) {
        analysis.text = trimmedLine.replace('TEXT:', '').trim();
      } else if (trimmedLine.startsWith('CONFIDENCE:')) {
        analysis.confidence = parseFloat(trimmedLine.replace('CONFIDENCE:', '').trim());
      }
    }

    return {
      description: analysis.description || 'No description provided',
      objects: analysis.objects || [],
      colors: analysis.colors || [],
      mood: analysis.mood || 'Neutral',
      text: analysis.text,
      confidence: analysis.confidence || 0.5
    };
  }

  private parseListItems(text: string): string[] {
    // Parse comma-separated items or bullet points
    return text
      .split(/[,;]|•|\*|\-/)
      .map(item => item.trim())
      .filter(item => item.length > 0 && item !== 'None' && item !== 'N/A');
  }

  generateVisualGuidance(analysis: VisionAnalysis, userQuery: string): string {
    return `Based on visual analysis:
- Image contains: ${analysis.objects.join(', ') || 'various elements'}
- Dominant colors: ${analysis.colors.join(', ') || 'mixed palette'}
- Mood/Atmosphere: ${analysis.mood}
${analysis.text ? `- Text found: "${analysis.text}"` : ''}
- Analysis confidence: ${(analysis.confidence * 100).toFixed(0)}%

User query: "${userQuery}"

Use this visual context to inform your response about the image.`;
  }
}

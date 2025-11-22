import axios from 'axios';
import { stripMarkdownForSummary } from '../lib/markdownUtils';

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
}

export interface TTSResponse {
  audio: Blob;
  audioUrl: string;
}

export class ElevenLabsService {
  private apiKey: string;
  private baseURL = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async textToSpeech(
    text: string,
    voiceId: string,
    settings: VoiceSettings,
    model: string = 'eleven_monolingual_v1'
  ): Promise<TTSResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/text-to-speech/${voiceId}`,
        {
          text: text.substring(0, 2500), // ElevenLabs limit
          model_id: model,
          voice_settings: {
            stability: settings.stability,
            similarity_boost: settings.similarity_boost,
            style: settings.style || 0,
            use_speaker_boost: settings.use_speaker_boost || true
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          responseType: 'blob'
        }
      );

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      return { audio: audioBlob, audioUrl };
    } catch (error) {
      console.error('ElevenLabs API Error:', error);
      throw new Error(`Text-to-speech failed: ${error}`);
    }
  }

  async getVoices(): Promise<Voice[]> {
    try {
      const response = await axios.get(`${this.baseURL}/voices`, {
        headers: { 'xi-api-key': this.apiKey }
      });

      return response.data.voices || [];
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      return this.getFallbackVoices();
    }
  }

  private getFallbackVoices(): Voice[] {
    return [
      { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'premade' },
      { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'premade' },
      { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Antoni', category: 'premade' },
      { voice_id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', category: 'premade' }
    ];
  }

}
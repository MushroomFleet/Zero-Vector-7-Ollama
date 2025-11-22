import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Image, X, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { useChatStore } from '../stores/chatStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAudioStore } from '../stores/audioStore';
import { CognitiveEngine } from '../cognitive/CognitiveEngine';
import { Message } from '../types/cognitive';
import { generateId } from '../lib/utils';
import { cleanMarkdownForTTS } from '../lib/markdownUtils';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  cognitiveEngine: CognitiveEngine | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ cognitiveEngine }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const { messages, isLoading, addMessage, setLoading } = useChatStore();
  const { config } = useSettingsStore();
  const { 
    currentAudio, 
    currentMessageId,
    setCurrentAudio, 
    setIsPlaying, 
    setGeneratingAudio 
  } = useAudioStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Auto speech functionality
  useEffect(() => {
    if (!config.features.autoSpeechEnabled || !config.elevenlabs.apiKey || !cognitiveEngine) {
      return;
    }

    // Get the latest assistant message
    const latestMessage = messages[messages.length - 1];
    
    // Check if it's a new assistant message that hasn't been auto-played yet
    if (latestMessage && 
        latestMessage.role === 'assistant' && 
        latestMessage.id !== currentMessageId &&
        !isLoading) {
      
      // Auto-generate and play speech
      handleAutoSpeech(latestMessage);
    }
  }, [messages, config.features.autoSpeechEnabled, config.elevenlabs.apiKey, cognitiveEngine, isLoading]);

  const handleAutoSpeech = async (message: Message) => {
    // Stop any currently playing audio
    if (currentAudio) {
      setCurrentAudio(null);
    }

    const rawText = message.cognitiveTrace?.speechSummary || message.content;
    const textToSpeak = cleanMarkdownForTTS(rawText);
    
    setGeneratingAudio(message.id, true);
    
    try {
      const result = await cognitiveEngine!.generateAudio(textToSpeak, message.id);
      
      const audio = new Audio(result.audioUrl);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      
      setCurrentAudio(audio, message.id);
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Auto speech generation failed:', error);
    } finally {
      setGeneratingAudio(message.id, false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || !cognitiveEngine || isLoading) return;

    const messageContent = selectedImage ? 
      `[Image] ${input.trim() || 'Analyze this image'}` : 
      input.trim();

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      type: selectedImage ? 'image' : 'text',
      imageData: selectedImage || undefined
    };

    addMessage(userMessage);
    setInput('');
    setSelectedImage(null);
    setLoading(true);

    try {
      // Include the current user message in the conversation context
      const conversationContext = [...messages, userMessage];
      
      const result = await cognitiveEngine.processInput(
        userMessage.content,
        conversationContext,
        userMessage.type,
        userMessage.imageData,
        webSearchEnabled
      );

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        type: 'text',
        cognitiveTrace: result.trace
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('Processing error:', error);
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'I encountered an error processing your request. Please check your API configuration and try again.',
        timestamp: new Date(),
        type: 'text'
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    // Resize image to 1MP for processing
    const resizedImage = await resizeImageToMegapixel(file);
    setSelectedImage(resizedImage);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageSelect(imageFile);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-cognitive-border bg-card backdrop-blur-sm">
      {/* Image Preview */}
      {selectedImage && (
        <div className="p-4 border-b border-cognitive-border">
          <div className="relative inline-block">
            <img
              src={selectedImage}
              alt="Selected"
              className="h-20 w-20 object-cover rounded-lg border border-cognitive-border"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div
        className={`p-6 ${dragOver ? 'bg-neural-primary/5 border-2 border-dashed border-neural-primary/30' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedImage ? "Ask about this image..." : "Ask me anything... I'll think through it step by step."}
              className="w-full resize-none rounded-xl border-2 border-neural-primary/20 bg-background p-4 pr-4 text-sm focus:border-neural-primary focus:outline-none focus:ring-4 focus:ring-neural-primary/20 transition-all duration-300 min-h-[3rem] max-h-32"
              rows={1}
              disabled={isLoading || !config.apiKey}
            />
            {isLoading && (
              <div className="absolute right-3 top-3">
                <div className="h-5 w-5 border-2 border-neural-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              disabled={isLoading || !config.perplexity.apiKey}
              className={`h-12 px-4 transition-all duration-200 ${
                webSearchEnabled && config.perplexity.apiKey 
                  ? 'bg-neural-primary/10 border-neural-primary text-neural-primary' 
                  : 'opacity-60'
              }`}
              title={!config.perplexity.apiKey ? 'Configure Perplexity API key in settings to enable web search' : 'Toggle web search'}
            >
              <Globe className="h-5 w-5" />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="h-12 px-4"
            >
              <Image className="h-5 w-5" />
            </Button>
            
            <Button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || isLoading || !config.apiKey || !cognitiveEngine}
              variant="default"
              size="lg"
              className="h-12 px-6 gradient-neural"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageSelect(file);
          }}
          className="hidden"
        />
        
        {!config.apiKey && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              🔑 Please configure your OpenRouter API key in settings to start chatting.
            </p>
          </div>
        )}
        
        {dragOver && (
          <div className="mt-4 p-4 bg-neural-primary/5 border border-neural-primary/20 rounded-lg">
            <p className="text-sm text-neural-primary text-center">
              📁 Drop an image here to analyze it with the Occipital Lobe
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Utility function for image resizing
async function resizeImageToMegapixel(file: File): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = document.createElement('img') as HTMLImageElement;
    
    img.onload = () => {
      const { width, height } = img;
      const currentPixels = width * height;
      const targetPixels = 1000000; // 1 megapixel
      
      if (currentPixels <= targetPixels) {
        // Convert to base64 directly
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
        return;
      }
      
      // Calculate new dimensions
      const scale = Math.sqrt(targetPixels / currentPixels);
      const newWidth = Math.floor(width * scale);
      const newHeight = Math.floor(height * scale);
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

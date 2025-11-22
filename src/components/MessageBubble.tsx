import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronUp, Play, Pause, Volume2, VolumeX, Search, Eye, Brain, Zap, User, Bot, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Message } from '../types/cognitive';
import { formatTimestamp } from '../lib/utils';
import { cleanMarkdownForTTS } from '../lib/markdownUtils';
import { useSettingsStore } from '../stores/settingsStore';
import { useAudioStore } from '../stores/audioStore';
import { useHolographicStore } from '../stores/holographicStore';
import { CognitiveEngine } from '../cognitive/CognitiveEngine';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [showTrace, setShowTrace] = useState(false);
  const { config } = useSettingsStore();
  const { 
    currentAudio, 
    isPlaying, 
    currentMessageId, 
    generatingAudio,
    setCurrentAudio, 
    setIsPlaying, 
    setGeneratingAudio 
  } = useAudioStore();
  const { systemState, isEnabled: holographicEnabled } = useHolographicStore();
  const { toast } = useToast();
  
  const isSummaryPlaying = currentMessageId === message.id && isPlaying;
  const isFullTextPlaying = currentMessageId === `${message.id}-full` && isPlaying;
  const isSummaryGenerating = generatingAudio.has(message.id);
  const isFullTextGenerating = generatingAudio.has(`${message.id}-full`);

  const isUser = message.role === 'user';
  const trace = message.cognitiveTrace;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePlayAudio = async (useFullText = false) => {
    if (!config.elevenlabs.apiKey) {
      toast({
        title: "ElevenLabs API Key Required",
        description: "Please configure your ElevenLabs API key in settings to use text-to-speech.",
        variant: "destructive"
      });
      return;
    }

    const messageKey = useFullText ? `${message.id}-full` : message.id;
    const isThisAudioPlaying = currentMessageId === messageKey && isPlaying;

    // If this specific audio is already playing, pause it
    if (isThisAudioPlaying) {
      setIsPlaying(false);
      return;
    }

    // If another audio is playing, stop it first
    if (currentAudio && currentMessageId !== messageKey) {
      setCurrentAudio(null);
    }

    const rawText = useFullText ? message.content : (message.cognitiveTrace?.speechSummary || message.content);
    const textToSpeak = cleanMarkdownForTTS(rawText);
    
    setGeneratingAudio(messageKey, true);
    
    try {
      const cognitiveEngine = new CognitiveEngine(config);
      const result = await cognitiveEngine.generateAudio(textToSpeak, messageKey);
      
      const audio = new Audio(result.audioUrl);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        toast({
          title: "Audio Playback Error",
          description: "Failed to play the generated audio.",
          variant: "destructive"
        });
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      
      setCurrentAudio(audio, messageKey);
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Audio generation failed:', error);
      toast({
        title: "Audio Generation Failed",
        description: "Failed to generate speech. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingAudio(messageKey, false);
    }
  };

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-4xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-synapse-primary' 
            : 'gradient-neural'
        }`}>
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <Bot className="h-5 w-5 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block p-4 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-synapse-primary text-white'
              : 'bg-card border border-neural-primary/10'
          }`}>
            {/* Image Display */}
            {message.type === 'image' && message.imageData && (
              <div className="mb-3">
                <img
                  src={message.imageData}
                  alt="User uploaded"
                  className="max-w-full h-auto rounded-lg border border-neural-primary/20"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
            
            {isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <div className="prose prose-sm max-w-none prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit prose-code:text-inherit prose-pre:bg-muted prose-pre:rounded-md prose-pre:p-3">
                <ReactMarkdown 
                  components={{
                    code: ({ className, children, ...props }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className="block bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap" {...props}>
                          {children}
                        </code>
                      );
                    },
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-synapse-primary hover:underline">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              isUser ? 'text-white/70' : 'text-muted-foreground'
            }`}>
              <Clock className="h-3 w-3" />
              {formatTime(message.timestamp)}
            </div>
          </div>

          {/* AI Message Controls */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-3">
              {/* TTS Control Buttons */}
              {config.features.ttsEnabled && (
                <>
                  {/* Summary TTS Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePlayAudio(false)}
                    disabled={isSummaryGenerating}
                    className="h-7 px-2 text-xs"
                    title="Play Summary (TTS)"
                  >
                    {isSummaryGenerating ? (
                      <Volume2 className="h-3 w-3 animate-pulse" />
                    ) : isSummaryPlaying ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>

                  {/* Full Response TTS Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePlayAudio(true)}
                    disabled={isFullTextGenerating}
                    className="h-7 px-2 text-xs text-red-500 hover:text-red-600"
                    title="Play Full Response (TTS)"
                  >
                    {isFullTextGenerating ? (
                      <VolumeX className="h-3 w-3 animate-pulse" />
                    ) : isFullTextPlaying ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <VolumeX className="h-3 w-3" />
                    )}
                  </Button>
                </>
              )}

              {/* Trace Toggle */}
              {trace && config.features.visualizeThinking && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTrace(!showTrace)}
                  className="h-7 px-2 text-xs"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  Cognitive Trace
                  {showTrace ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                </Button>
              )}

              <span className="text-xs text-muted-foreground">
                {trace && trace.processing.duration ? `${trace.processing.duration}ms` : ''}
              </span>
            </div>
          )}

          {/* Cognitive Trace Display */}
          {trace && showTrace && config.features.visualizeThinking && (
            <div className="mt-3 p-4 bg-cognitive-bg border border-cognitive-border rounded-lg text-sm space-y-3">

              {/* Inner Thoughts */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-3 w-3 text-neural-primary" />
                  <span className="text-xs font-medium text-neural-primary uppercase tracking-wide">
                    Inner Thoughts
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div><strong>Intent:</strong> {trace.innerThoughts.intent}</div>
                  <div><strong>Context:</strong> {trace.innerThoughts.context}</div>
                  <div><strong>Plan:</strong> {trace.innerThoughts.plan}</div>
                  <div><strong>Confidence:</strong> {(trace.innerThoughts.confidence * 100).toFixed(0)}%</div>
                  
                  {trace.innerThoughts.processingSteps.length > 0 && (
                    <div>
                      <strong>Processing Steps:</strong>
                      <ul className="ml-4 mt-1">
                        {trace.innerThoughts.processingSteps.map((step, idx) => (
                          <li key={idx} className="text-xs">{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Web Search Results */}
              {trace.innerThoughts.webSearchResults && trace.innerThoughts.webSearchResults.length > 0 && (
                <div className="p-3 bg-synapse-primary/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-3 w-3 text-synapse-primary" />
                    <span className="text-xs font-medium text-synapse-primary uppercase tracking-wide">
                      Web Search
                    </span>
                  </div>
                  {trace.innerThoughts.webSearchResults.map((result, idx) => (
                    <div key={idx} className="text-xs space-y-1">
                      <div><strong>Query:</strong> {result.searchQuery}</div>
                      <div><strong>Summary:</strong> {result.summary.substring(0, 200)}...</div>
                      {result.sources.length > 0 && (
                        <div>
                          <strong>Sources:</strong>
                          <ul className="ml-4">
                            {result.sources.slice(0, 2).map((source, sourceIdx) => (
                              <li key={sourceIdx} className="text-xs">
                                <a href={source.url} target="_blank" rel="noopener noreferrer" 
                                   className="text-synapse-primary hover:underline">
                                  {source.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Visual Analysis */}
              {trace.visualAnalysis && (
                <div className="p-3 bg-electric-primary/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-3 w-3 text-electric-primary" />
                    <span className="text-xs font-medium text-electric-primary uppercase tracking-wide">
                      Visual Analysis
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div><strong>Description:</strong> {trace.visualAnalysis.description}</div>
                    {trace.visualAnalysis.objects.length > 0 && (
                      <div><strong>Objects:</strong> {trace.visualAnalysis.objects.join(', ')}</div>
                    )}
                    {trace.visualAnalysis.colors.length > 0 && (
                      <div><strong>Colors:</strong> {trace.visualAnalysis.colors.join(', ')}</div>
                    )}
                    <div><strong>Mood:</strong> {trace.visualAnalysis.mood}</div>
                    {trace.visualAnalysis.text && (
                      <div><strong>Text Found:</strong> {trace.visualAnalysis.text}</div>
                    )}
                    <div><strong>Confidence:</strong> {(trace.visualAnalysis.confidence * 100).toFixed(0)}%</div>
                  </div>
                </div>
              )}

              {/* Frontal Lobe */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                    Frontal Lobe
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div><strong>Reasoning:</strong> {trace.frontalLobe.reasoning}</div>
                  <div><strong>Confidence:</strong> {(trace.frontalLobe.confidence * 100).toFixed(0)}%</div>
                  
                  {trace.frontalLobe.thinkingSteps.length > 0 && (
                    <div>
                      <strong>Thinking Steps:</strong>
                      <ul className="ml-4 mt-1">
                        {trace.frontalLobe.thinkingSteps.map((step, idx) => (
                          <li key={idx} className="text-xs">{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Speech Summary */}
              {trace.speechSummary && (
                <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="h-3 w-3 text-accent" />
                    <span className="text-xs font-medium text-accent uppercase tracking-wide">
                      Speech Summary
                    </span>
                  </div>
                  <div className="text-xs text-accent/90">
                    {trace.speechSummary}
                  </div>
                </div>
              )}

              {/* Holographic Enhancement Trace */}
              {holographicEnabled && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-3 w-3 text-electric-600" />
                    <span className="text-xs font-medium text-electric-800 uppercase tracking-wide">
                      Holographic Enhancement
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs text-electric-700">
                    {/* Wave Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Active Waves:</strong>
                        <div className="text-xs text-electric-600">
                          Context: 0.5Hz | Intent: 1.0Hz | Reasoning: 1.2Hz
                        </div>
                      </div>
                      <div>
                        <strong>System Coherence:</strong>
                        <div className="text-xs text-electric-600">
                          {((systemState?.systemCoherence || 0) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Memory Fragments Used */}
                    <div>
                      <strong>Memory Fragments:</strong>
                      <div className="text-xs text-electric-600">
                        {systemState?.fragmentCount || 0} total fragments accessible
                      </div>
                    </div>

                    {/* Emergent Behaviors */}
                    {(systemState?.emergentBehaviors || 0) > 0 && (
                      <div>
                        <strong>Emergent Insights:</strong>
                        <div className="text-xs text-electric-600">
                          {systemState.emergentBehaviors} novel patterns detected
                        </div>
                      </div>
                    )}

                    {/* Holographic Reconstruction Used */}
                    {trace.holographicReconstruction && (
                      <div>
                        <strong>Holographic Reconstruction:</strong>
                        <div className="text-xs text-electric-600">
                          Confidence: {(trace.holographicReconstruction.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

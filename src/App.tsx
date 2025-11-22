import React, { useState, useEffect } from 'react';
import { Settings, Brain, Zap, Trash2, Download } from 'lucide-react';

import { Button } from './components/ui/button';
import { ChatInterface } from './components/ChatInterface';
import { MessageList } from './components/MessageList';
import { SettingsModal } from './components/SettingsModal';
import { CognitiveVisualizer } from './components/CognitiveVisualizer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable';
import { useChatStore } from './stores/chatStore';
import { useSettingsStore } from './stores/settingsStore';
import { useAudioStore } from './stores/audioStore';
import { useHolographicStore } from './stores/holographicStore';
import { CognitiveEngine } from './cognitive/CognitiveEngine';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import { SystemPromptUpload } from './components/SystemPromptUpload';
import { TopNavMenu } from './components/TopNavMenu';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [cognitiveEngine, setCognitiveEngine] = useState<CognitiveEngine | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { messages, clearMessages } = useChatStore();
  const { config, isConfigValid, updateConfig } = useSettingsStore();
  const { cleanup } = useAudioStore();
  const { initializeEngine, setEnabled } = useHolographicStore();
  const { toast } = useToast();

  // Initialize CognitiveEngine when API key first becomes available
  useEffect(() => {
    if (isConfigValid() && !cognitiveEngine) {
      const engine = new CognitiveEngine(config);
      setCognitiveEngine(engine);
      
      // Initialize holographic system if enabled
      if (config.features.holographicEnabled) {
        initializeEngine({
          frequencies: {
            CONTEXT: 0.5,
            INTENT: 1.0,
            CONFIDENCE: 2.0,
            TEMPORAL: 0.8,
            MEMORY: 0.3,
            PERSONA: 0.2,
            REASONING: 1.2,
            VISUAL: 1.5
          },
          interference: {
            constructiveThreshold: 0.6,
            destructiveThreshold: 0.3,
            emergentThreshold: 0.8,
            coherenceDecayRate: 0.1
          },
          memory: {
            maxFragmentsPerRegion: 100,
            reconstructionThreshold: 0.6,
            fragmentPersistence: 0.8,
            crossSessionEnabled: true
          },
          degradation: {
            enabled: true,
            reconstructionAttempts: 3,
            minimumCoherence: 0.4,
            fallbackRegions: ['InnerBrain', 'FrontalLobe']
          }
        });
        setEnabled(true);
        engine.setHolographicEnabled(true);
      }
    } else if (!isConfigValid()) {
      setCognitiveEngine(null);
      setEnabled(false);
    }
  }, [config.apiKey, isConfigValid, initializeEngine, setEnabled, cognitiveEngine]);

  // Update existing CognitiveEngine when configuration changes
  useEffect(() => {
    if (cognitiveEngine && isConfigValid()) {
      cognitiveEngine.updateConfig(config);
      
      // Update holographic settings
      if (config.features.holographicEnabled) {
        cognitiveEngine.setHolographicEnabled(true);
        setEnabled(true);
      } else {
        cognitiveEngine.setHolographicEnabled(false);
        setEnabled(false);
      }
    }
  }, [config, cognitiveEngine, isConfigValid, setEnabled]);

  // Handle system prompt toggle - SystemPromptUpload handles the actual logic
  const handleSystemPromptToggle = () => {
    // The SystemPromptUpload component handles all the logic internally
    // This is just here to satisfy the onToggle prop requirement
  };

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleExport = async () => {
    if (messages.length === 0) {
      toast({
        title: "No messages to export",
        description: "Start a conversation to export chat data.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Generate chat thread
      const chatContent = messages.map(msg => {
        if (msg.role === 'user') {
          if (msg.type === 'image') {
            return `Human: [Image uploaded${msg.content ? ': ' + msg.content : ''}]`;
          }
          return `Human: ${msg.content}`;
        } else {
          return `Assistant: ${msg.content}`;
        }
      }).join('\n\n');

      // Generate trace thread
      const traceContent = messages.map((msg, index) => {
        if (msg.role === 'assistant' && msg.cognitiveTrace) {
          const trace = msg.cognitiveTrace;
          let traceText = `=== Message ${index + 1} Cognitive Trace ===\n\n`;
          
          // Inner Thoughts
          if (trace.innerThoughts) {
            traceText += `INNER THOUGHTS:\n`;
            traceText += `Intent: ${trace.innerThoughts.intent}\n`;
            traceText += `Context: ${trace.innerThoughts.context}\n`;
            traceText += `Plan: ${trace.innerThoughts.plan}\n`;
            traceText += `Confidence: ${trace.innerThoughts.confidence}%\n`;
            traceText += `Needs Web Search: ${trace.innerThoughts.needsWebSearch}\n`;
            if (trace.innerThoughts.processingSteps.length > 0) {
              traceText += `Processing Steps: ${trace.innerThoughts.processingSteps.join(', ')}\n`;
            }
            traceText += '\n';
          }

          // Web Search Results
          if (trace.innerThoughts?.webSearchResults?.length) {
            traceText += `WEB SEARCH RESULTS:\n`;
            trace.innerThoughts.webSearchResults.forEach((result, i) => {
              traceText += `Search ${i + 1}: ${result.searchQuery}\n`;
              traceText += `Summary: ${result.summary}\n`;
              result.sources.forEach((source, j) => {
                traceText += `  Source ${j + 1}: ${source.title} - ${source.url}\n`;
              });
              traceText += '\n';
            });
          }

          // Frontal Lobe
          if (trace.frontalLobe) {
            traceText += `FRONTAL LOBE:\n`;
            traceText += `Reasoning: ${trace.frontalLobe.reasoning}\n`;
            traceText += `Response: ${trace.frontalLobe.response}\n`;
            traceText += `Confidence: ${trace.frontalLobe.confidence}%\n`;
            traceText += `Used Context: ${trace.frontalLobe.usedContext}\n`;
            if (trace.frontalLobe.thinkingSteps.length > 0) {
              traceText += `Thinking Steps: ${trace.frontalLobe.thinkingSteps.join(', ')}\n`;
            }
            traceText += '\n';
          }

          // Visual Analysis
          if (trace.visualAnalysis) {
            traceText += `VISUAL ANALYSIS:\n`;
            traceText += `Description: ${trace.visualAnalysis.description}\n`;
            traceText += `Objects: ${trace.visualAnalysis.objects.join(', ')}\n`;
            traceText += `Colors: ${trace.visualAnalysis.colors.join(', ')}\n`;
            traceText += `Mood: ${trace.visualAnalysis.mood}\n`;
            if (trace.visualAnalysis.text) {
              traceText += `Text Found: ${trace.visualAnalysis.text}\n`;
            }
            traceText += `Confidence: ${trace.visualAnalysis.confidence}%\n\n`;
          }

          // Holographic Enhancement
          if (trace.holographicReconstruction) {
            traceText += `HOLOGRAPHIC ENHANCEMENT:\n`;
            traceText += `Used: ${trace.holographicReconstruction.used}\n`;
            traceText += `Confidence: ${trace.holographicReconstruction.confidence}%\n`;
            traceText += `Reconstructed Fragments: ${trace.holographicReconstruction.reconstructedFragments}\n`;
            traceText += `System Coherence: ${trace.holographicReconstruction.systemCoherence}%\n`;
            if (trace.holographicReconstruction.emergentPatterns.length > 0) {
              traceText += `Emergent Patterns: ${trace.holographicReconstruction.emergentPatterns.join(', ')}\n`;
            }
            traceText += '\n';
          }

          // Holographic System State (Real-time)
          if (trace.holographicSystemState) {
            const holo = trace.holographicSystemState;
            traceText += `HOLOGRAPHIC SYSTEM STATE:\n`;
            
            // Active Waves
            if (Object.keys(holo.activeWaves).length > 0) {
              traceText += `Active Waves:\n`;
              Object.entries(holo.activeWaves).forEach(([waveType, frequency]) => {
                traceText += `  ${waveType}: ${frequency}Hz\n`;
              });
            } else {
              traceText += `Active Waves: None\n`;
            }
            
            traceText += `System Coherence: ${(holo.systemCoherence * 100).toFixed(1)}%\n`;
            traceText += `Memory Fragments: ${holo.totalFragments} total fragments accessible\n`;
            traceText += `Interference Patterns: ${holo.interferencePatterns} active patterns\n`;
            
            // Emergent Insights with full content
            if (holo.emergentBehaviors && holo.emergentBehaviors.length > 0) {
              traceText += `Emergent Insights (${holo.emergentBehaviors.length} detected):\n`;
              holo.emergentBehaviors.forEach((behavior, i) => {
                traceText += `  ${i + 1}. [${behavior.behaviorType}] (${(behavior.confidence * 100).toFixed(1)}%): ${behavior.insight}\n`;
              });
            } else {
              traceText += `Emergent Insights: No patterns detected\n`;
            }
            
            traceText += '\n';
          }

          // Speech Summary
          if (trace.speechSummary) {
            traceText += `SPEECH SUMMARY:\n`;
            traceText += `${trace.speechSummary}\n`;
            traceText += `TTS Generated: ${trace.ttsGenerated}\n\n`;
          }

          // Processing Time
          if (trace.processing) {
            traceText += `PROCESSING:\n`;
            traceText += `Start: ${trace.processing.startTime.toISOString()}\n`;
            if (trace.processing.endTime) {
              traceText += `End: ${trace.processing.endTime.toISOString()}\n`;
            }
            if (trace.processing.duration) {
              traceText += `Duration: ${trace.processing.duration}ms\n`;
            }
            traceText += '\n';
          }

          return traceText + '\n';
        }
        return '';
      }).filter(Boolean).join('\n');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      
      // Download helper function
      const downloadFile = (content: string | Blob, filename: string) => {
        const blob = content instanceof Blob ? content : new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      // Download text files
      downloadFile(chatContent, `zerovector6_chat_${timestamp}.txt`);
      downloadFile(traceContent, `zerovector6_trace_${timestamp}.txt`);
      
      // Download audio files if available
      let audioCount = 0;
      if (cognitiveEngine) {
        const audioCache = cognitiveEngine.getAudioFiles();
        
        for (const [messageId, blobUrl] of audioCache.entries()) {
          try {
            const response = await fetch(blobUrl);
            if (response.ok) {
              const blob = await response.blob();
              downloadFile(blob, `zerovector6_audio_${messageId}_${timestamp}.mp3`);
              audioCount++;
            }
          } catch (error) {
            console.warn(`Failed to download audio for message ${messageId}:`, error);
          }
        }
      }

      toast({
        title: "Export completed",
        description: audioCount > 0 
          ? `Chat, trace, and ${audioCount} audio files downloaded` 
          : "Chat and trace files downloaded",
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the conversation.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Show welcome screen if no API key is configured
  if (!config.apiKey) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-neural-primary/5 to-electric-primary/5">
        <div className="flex w-full flex-col">
          <header className="flex items-center justify-between border-b border-cognitive-border bg-card backdrop-blur-sm p-6 shadow-sm">
            {/* Logo - Clickable */}
            <a 
              href="https://www.scuffedepoch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-xl gradient-neural flex items-center justify-center neural-glow">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neural-primary">Zero Vector 7 Ollama</h1>
                <p className="text-sm text-cognitive-text/70">Advanced Cognitive AI Architecture</p>
              </div>
            </a>
            
            {/* Navigation Menu */}
            <TopNavMenu />
          </header>
          
          <WelcomeScreen onGetStarted={() => setShowSettings(true)} />
          
          <SettingsModal 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-neural-primary/5 to-electric-primary/5">
      <div className="flex w-full flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-cognitive-border bg-card backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-6">
            {/* Logo - Clickable */}
            <a 
              href="https://www.scuffedepoch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-xl gradient-neural flex items-center justify-center neural-glow">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neural-primary">
                  Zero Vector 7 Ollama
                </h1>
                <p className="text-sm text-cognitive-text/70">
                  Advanced Cognitive AI Architecture
                </p>
              </div>
            </a>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-synapse-primary">
                <Zap className="h-3 w-3" />
                <span>Inner Thoughts</span>
              </div>
              <div className="w-1 h-1 bg-neural-primary/30 rounded-full"></div>
              <div className="flex items-center gap-1 text-xs text-electric-primary">
                <Brain className="h-3 w-3" />
                <span>Frontal Lobe</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Navigation Menu */}
            <TopNavMenu />
            
            {/* Separator */}
            <div className="h-8 w-px bg-border"></div>
            
            {/* Existing Buttons */}
            <div className="flex items-center gap-3">
            {config.apiKey && (
              <div className="flex items-center gap-2 text-sm text-success bg-success/10 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>API Connected</span>
              </div>
            )}
            
            <SystemPromptUpload 
              isActive={config.innerThoughtsPromptEnabled}
              onToggle={handleSystemPromptToggle}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={messages.length === 0 || isExporting}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => clearMessages()}
              disabled={messages.length === 0}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {config.features.visualizeThinking ? (
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              {/* Chat Area */}
              <ResizablePanel defaultSize={70} minSize={50}>
                <div className="flex flex-col h-full">
                  <MessageList />
                  <ChatInterface cognitiveEngine={cognitiveEngine} />
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Cognitive Visualizer */}
              <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
                <CognitiveVisualizer />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            /* Chat Area Only */
            <div className="flex flex-1 flex-col">
              <MessageList />
              <ChatInterface cognitiveEngine={cognitiveEngine} />
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default App;

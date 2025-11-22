import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Clock, Activity } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useHolographicStore } from '../stores/holographicStore';
import { EnhancedCognitiveVisualizer } from './holographic/EnhancedCognitiveVisualizer';

export const CognitiveVisualizer: React.FC = () => {
  const { messages, isLoading } = useChatStore();
  const { isEnabled: holographicEnabled } = useHolographicStore();
  
  // Use enhanced visualizer when holographic processing is enabled
  if (holographicEnabled) {
    return <EnhancedCognitiveVisualizer />;
  }
  
  const lastAssistantMessage = messages
    .filter(m => m.role === 'assistant' && m.cognitiveTrace)
    .pop();

  const trace = lastAssistantMessage?.cognitiveTrace;

  return (
    <div className="h-full bg-cognitive-bg border-l border-cognitive-border p-4 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-5 w-5 text-neural-primary" />
          <h3 className="font-bold text-neural-primary">Cognitive Monitor</h3>
        </div>
        <p className="text-xs text-cognitive-text/70">
          Real-time neural processing insights
        </p>
      </div>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="p-4 bg-muted/50 rounded-lg border border-neural-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-synapse-primary animate-pulse" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-neural-primary/20 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-neural-primary"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <p className="text-xs text-cognitive-text/70">
                Inner Thoughts → Frontal Lobe
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {trace && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Processing Stats */}
          <div className="p-4 bg-white/50 rounded-lg border border-neural-primary/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Last Processing</span>
              <div className="flex items-center gap-1 text-xs text-cognitive-text/70">
                <Clock className="h-3 w-3" />
                {trace.processing.duration}ms
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-cognitive-text/70">Inner Thoughts</div>
                <div className="font-medium">{(trace.innerThoughts.confidence * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-cognitive-text/70">Frontal Lobe</div>
                <div className="font-medium">{(trace.frontalLobe.confidence * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Inner Thoughts */}
          <div className="p-4 bg-muted/50 rounded-lg border border-synapse-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-synapse-primary" />
              <span className="text-sm font-medium text-synapse-primary">Inner Thoughts</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="text-cognitive-text/70 uppercase tracking-wide">Intent</div>
                <div className="text-cognitive-text">{trace.innerThoughts.intent}</div>
              </div>
              <div>
                <div className="text-cognitive-text/70 uppercase tracking-wide">Strategy</div>
                <div className="text-cognitive-text">{trace.innerThoughts.plan}</div>
              </div>
              {trace.innerThoughts.processingSteps.length > 0 && (
                <div>
                  <div className="text-cognitive-text/70 uppercase tracking-wide">Steps</div>
                  <div className="space-y-1">
                    {trace.innerThoughts.processingSteps.slice(0, 3).map((step, i) => (
                      <div key={i} className="text-cognitive-text/80 text-xs">
                        {i + 1}. {step.length > 50 ? step.substring(0, 50) + '...' : step}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Frontal Lobe */}
          <div className="p-4 bg-muted/50 rounded-lg border border-electric-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-electric-primary" />
              <span className="text-sm font-medium text-electric-primary">Frontal Lobe</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="text-cognitive-text/70 uppercase tracking-wide">Reasoning</div>
                <div className="text-cognitive-text">
                  {trace.frontalLobe.reasoning.length > 100 
                    ? trace.frontalLobe.reasoning.substring(0, 100) + '...'
                    : trace.frontalLobe.reasoning
                  }
                </div>
              </div>
              <div>
                <div className="text-cognitive-text/70 uppercase tracking-wide">Context Used</div>
                <div className={`text-xs px-2 py-1 rounded ${
                  trace.frontalLobe.usedContext ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                }`}>
                  {trace.frontalLobe.usedContext ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {!trace && !isLoading && (
        <div className="flex items-center justify-center h-40 text-cognitive-text/50">
          <div className="text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Send a message to see<br />cognitive processing</p>
          </div>
        </div>
      )}
    </div>
  );
};

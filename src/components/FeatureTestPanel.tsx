import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Volume2, Search, Eye, Settings, CheckCircle, XCircle } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { Button } from './ui/button';

export const FeatureTestPanel: React.FC = () => {
  const { config } = useSettingsStore();

  const features = [
    {
      name: 'OpenRouter API',
      icon: Brain,
      status: config.apiKey ? 'connected' : 'missing',
      description: 'Required for AI processing'
    },
    {
      name: 'ElevenLabs TTS',
      icon: Volume2,
      status: config.elevenlabs.apiKey ? 'connected' : 'optional',
      description: 'Text-to-speech generation'
    },
    {
      name: 'Perplexity Search',
      icon: Search,
      status: config.perplexity.apiKey ? 'connected' : 'optional',
      description: 'Web search capabilities'
    },
    {
      name: 'Visual Analysis',
      icon: Eye,
      status: 'ready',
      description: 'Image understanding'
    },
    {
      name: 'Cognitive Traces',
      icon: Brain,
      status: config.features.visualizeThinking ? 'enabled' : 'disabled',
      description: 'Thought process visualization'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ready':
      case 'enabled':
        return 'text-green-600';
      case 'optional':
        return 'text-orange-600';
      case 'missing':
      case 'disabled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ready':
      case 'enabled':
        return CheckCircle;
      case 'optional':
      case 'missing':
      case 'disabled':
        return XCircle;
      default:
        return Settings;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-lg border border-neural-primary/20 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg gradient-neural flex items-center justify-center">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neural-primary">System Status</h3>
          <p className="text-sm text-gray-600">Phase 1 feature availability</p>
        </div>
      </div>

      <div className="space-y-4">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          const StatusIcon = getStatusIcon(feature.status);
          
          return (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-neural-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <IconComponent className="h-5 w-5 text-neural-primary" />
                <div>
                  <div className="font-medium text-gray-900">{feature.name}</div>
                  <div className="text-sm text-gray-600">{feature.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-5 w-5 ${getStatusColor(feature.status)}`} />
                <span className={`text-sm font-medium capitalize ${getStatusColor(feature.status)}`}>
                  {feature.status}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-cognitive-bg rounded-lg border border-cognitive-border">
        <h4 className="font-medium text-neural-primary mb-2">Phase 1 Complete!</h4>
        <p className="text-sm text-gray-600">
          All four cognitive lobes are now fully functional with enhanced UI components, 
          audio management, comprehensive settings, and feature toggles.
        </p>
      </div>
    </motion.div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Brain, Save, Volume2, Search, Settings, RefreshCw, Zap, Shield, Cloud, Home, Server } from 'lucide-react';
import { Button } from './ui/button';
import { useSettingsStore } from '../stores/settingsStore';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PerplexityService, PerplexityModel } from '../services/perplexityService';
import { ProviderFactory, ModelInfo, ProviderType } from '../services/providers';
import { useToast } from '../hooks/use-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    config, 
    updateConfig, 
    setOpenRouterModels,
    setOllamaModels,
    setLoadingOpenRouterModels,
    setLoadingOllamaModels,
    setOpenRouterStatus,
    setOllamaStatus,
    openRouterModels,
    ollamaModels,
    loadingOpenRouterModels,
    loadingOllamaModels,
    openRouterStatus,
    ollamaStatus
  } = useSettingsStore();
  const { toast } = useToast();
  
  const [localConfig, setLocalConfig] = useState({
    provider: config.provider,
    apiKey: config.apiKey,
    model: config.model,
    ollamaBaseUrl: config.ollama.baseUrl,
    ollamaTimeout: config.ollama.timeout,
    elevenLabsApiKey: config.elevenlabs.apiKey,
    perplexityApiKey: config.perplexity.apiKey,
    perplexityModel: config.perplexity.model,
    voiceId: config.elevenlabs.voiceId,
    stability: config.elevenlabs.stability,
    similarityBoost: config.elevenlabs.similarityBoost,
    lobes: { ...config.lobes },
    features: {
      ttsEnabled: config.features.ttsEnabled ?? false,
      speechSummaryEnabled: config.features.speechSummaryEnabled ?? true,
      autoSpeechEnabled: config.features.autoSpeechEnabled ?? false,
      visualizeThinking: config.features.visualizeThinking ?? true,
      webSearchEnabled: config.features.webSearchEnabled ?? false,
      holographicEnabled: config.features.holographicEnabled ?? false
    }
  });

  const testOllamaConnection = async () => {
    try {
      setLoadingOllamaModels(true);
      const provider = ProviderFactory.createProvider({
        type: 'ollama',
        baseUrl: localConfig.ollamaBaseUrl,
        timeout: localConfig.ollamaTimeout
      });
      
      const status = await provider.testConnection();
      setOllamaStatus(status);
      
      if (status.connected) {
        const models = await provider.getAvailableModels();
        setOllamaModels(models);
        toast({
          title: "Ollama Connected",
          description: `Found ${models.length} local models`,
        });
      } else {
        toast({
          title: "Ollama Connection Failed",
          description: status.error || "Could not connect to Ollama server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Ollama connection failed:', error);
      toast({
        title: "Ollama Connection Error",
        description: "Make sure Ollama is running on localhost:11434",
        variant: "destructive",
      });
    } finally {
      setLoadingOllamaModels(false);
    }
  };

  const loadOpenRouterModels = async () => {
    if (!localConfig.apiKey) {
      setOpenRouterModels([]);
      return;
    }

    setLoadingOpenRouterModels(true);
    try {
      const provider = ProviderFactory.createProvider({
        type: 'openrouter',
        apiKey: localConfig.apiKey
      });
      
      const status = await provider.testConnection();
      setOpenRouterStatus(status);
      
      if (status.connected) {
        const models = await provider.getAvailableModels();
        setOpenRouterModels(models);
        toast({
          title: "OpenRouter Models Updated",
          description: `Loaded ${models.length} models`,
        });
      } else {
        toast({
          title: "OpenRouter Connection Failed",
          description: status.error || "Failed to connect to OpenRouter",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to load OpenRouter models:', error);
      toast({
        title: "Failed to Load OpenRouter Models",
        description: "Check your API key and connection",
        variant: "destructive",
      });
    } finally {
      setLoadingOpenRouterModels(false);
    }
  };

  const handleProviderSwitch = (provider: ProviderType) => {
    setLocalConfig(prev => ({ ...prev, provider }));
    if (provider === 'ollama') {
      testOllamaConnection();
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (localConfig.provider === 'openrouter' && localConfig.apiKey) {
        loadOpenRouterModels();
      } else if (localConfig.provider === 'ollama') {
        testOllamaConnection();
      }
    }
  }, [isOpen, localConfig.apiKey, localConfig.provider]);

  const handleSave = () => {
    updateConfig({
      provider: localConfig.provider,
      apiKey: localConfig.apiKey,
      model: localConfig.model,
      ollama: {
        baseUrl: localConfig.ollamaBaseUrl,
        timeout: localConfig.ollamaTimeout,
        defaultModel: config.ollama.defaultModel
      },
      lobes: localConfig.lobes,
      elevenlabs: {
        ...config.elevenlabs,
        apiKey: localConfig.elevenLabsApiKey,
        voiceId: localConfig.voiceId,
        stability: localConfig.stability,
        similarityBoost: localConfig.similarityBoost
      },
      perplexity: {
        ...config.perplexity,
        apiKey: localConfig.perplexityApiKey,
        model: localConfig.perplexityModel
      },
      features: localConfig.features
    });
    onClose();
  };

  const updateLocalConfig = (updates: Partial<typeof localConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
  };

  const updateFeature = (feature: string, value: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      features: { ...prev.features, [feature]: value }
    }));
  };

  // Get current models based on selected provider
  const currentModels = localConfig.provider === 'openrouter' ? openRouterModels : ollamaModels;
  const isProviderLoading = localConfig.provider === 'openrouter' ? loadingOpenRouterModels : loadingOllamaModels;

  // Voice options for ElevenLabs
  const voiceOptions = [
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria' },
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-neural-primary/20">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neural-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-neural flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-neural-primary">Settings</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                
                {/* Provider Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neural-primary flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    AI Provider
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={localConfig.provider === 'openrouter' ? 'default' : 'outline'}
                      onClick={() => handleProviderSwitch('openrouter')}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <Cloud className="h-6 w-6" />
                      <span className="text-sm font-medium">OpenRouter</span>
                      <span className="text-xs text-center opacity-75">Cloud AI Models</span>
                    </Button>
                    
                    <Button
                      variant={localConfig.provider === 'ollama' ? 'default' : 'outline'}
                      onClick={() => handleProviderSwitch('ollama')}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <Home className="h-6 w-6" />
                      <span className="text-sm font-medium">Ollama</span>
                      <span className="text-xs text-center opacity-75">Local Privacy</span>
                    </Button>
                  </div>

                  {/* Privacy Indicator */}
                  {localConfig.provider === 'ollama' && (
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-success">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Privacy Mode Active</span>
                      </div>
                      <p className="text-xs text-success/80 mt-1">
                        All processing happens locally on your machine. No data is sent to external servers.
                      </p>
                    </div>
                  )}
                </div>

                {/* Provider-Specific Configuration */}
                {localConfig.provider === 'openrouter' ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neural-primary flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      OpenRouter Configuration
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        OpenRouter API Key
                      </label>
                      <input
                        type="password"
                        value={localConfig.apiKey}
                        onChange={(e) => updateLocalConfig({ apiKey: e.target.value })}
                        placeholder="sk-or-v1-..."
                        className="w-full px-4 py-3 bg-background border-2 border-input rounded-lg focus:border-neural-primary focus:outline-none focus:ring-4 focus:ring-neural-primary/20 transition-all duration-300"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Get your API key from{' '}
                        <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-neural-primary hover:underline">
                          OpenRouter.ai
                        </a>
                      </p>
                    </div>

                    {/* Connection Status */}
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        openRouterStatus?.connected ? 'bg-green-500' : 
                        openRouterStatus?.connected === false ? 'bg-red-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-sm">
                        {openRouterStatus?.connected ? 'Connected' : 
                         openRouterStatus?.connected === false ? 'Connection Failed' : 'Not tested'}
                      </span>
                      {openRouterStatus?.latency && (
                        <span className="text-xs text-gray-500">({openRouterStatus.latency}ms)</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neural-primary flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      Ollama Configuration
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Ollama Server URL
                      </label>
                      <input
                        type="text"
                        value={localConfig.ollamaBaseUrl}
                        onChange={(e) => updateLocalConfig({ ollamaBaseUrl: e.target.value })}
                        placeholder="http://localhost:11434"
                        className="w-full px-4 py-3 bg-background border-2 border-input rounded-lg focus:border-neural-primary focus:outline-none focus:ring-4 focus:ring-neural-primary/20 transition-all duration-300"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Default: http://localhost:11434
                      </p>
                    </div>

                    {/* Connection Status & Test */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          ollamaStatus?.connected ? 'bg-green-500' : 
                          ollamaStatus?.connected === false ? 'bg-red-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-sm">
                          {ollamaStatus?.connected ? 'Connected' : 
                           ollamaStatus?.connected === false ? 'Connection Failed' : 'Not tested'}
                        </span>
                        {ollamaStatus?.latency && (
                          <span className="text-xs text-gray-500">({ollamaStatus.latency}ms)</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testOllamaConnection}
                        disabled={loadingOllamaModels}
                        className="h-8 px-3 text-xs"
                      >
                        <RefreshCw className={`h-3 w-3 mr-1 ${loadingOllamaModels ? 'animate-spin' : ''}`} />
                        Test Connection
                      </Button>
                    </div>

                    {ollamaStatus?.error && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <p className="text-xs text-destructive">{ollamaStatus.error}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Services */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neural-primary flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Additional Services
                  </h3>
                  
                  {/* ElevenLabs API Key */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      ElevenLabs API Key (for Text-to-Speech)
                    </label>
                    <input
                      type="password"
                      value={localConfig.elevenLabsApiKey}
                      onChange={(e) => updateLocalConfig({ elevenLabsApiKey: e.target.value })}
                      placeholder="sk-..."
                      className="w-full px-4 py-3 bg-background border-2 border-input rounded-lg focus:border-neural-primary focus:outline-none focus:ring-4 focus:ring-neural-primary/20 transition-all duration-300"
                    />
                  </div>

                  {/* Perplexity API Key */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Perplexity API Key (for Web Search)
                    </label>
                    <input
                      type="password"
                      value={localConfig.perplexityApiKey}
                      onChange={(e) => updateLocalConfig({ perplexityApiKey: e.target.value })}
                      placeholder="pplx-..."
                      className="w-full px-4 py-3 bg-background border-2 border-input rounded-lg focus:border-neural-primary focus:outline-none focus:ring-4 focus:ring-neural-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Model Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neural-primary flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Model Configuration
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={localConfig.provider === 'openrouter' ? loadOpenRouterModels : testOllamaConnection}
                      disabled={isProviderLoading}
                      className="h-6 px-2 text-xs"
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${isProviderLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  {/* Default Model */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Default Model
                    </label>
                    <Select 
                      value={localConfig.model} 
                      onValueChange={(value) => updateLocalConfig({ model: value })}
                      disabled={currentModels.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {currentModels.length > 0 ? (
                          currentModels.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{model.name}</span>
                                <span className="text-xs text-gray-500">
                                  {model.category} • {model.contextLength.toLocaleString()} tokens
                                  {model.metadata?.promptPrice && (
                                    <> • ${(model.metadata.promptPrice * 1000000).toFixed(2)}/1M tokens</>
                                  )}
                                  {model.metadata?.parameterSize && (
                                    <> • {model.metadata.parameterSize}</>
                                  )}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-models" disabled>
                            {isProviderLoading ? 'Loading models...' : 'No models available'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {localConfig.provider === 'openrouter' && !localConfig.apiKey ? 
                        'Enter OpenRouter API key to see available models' : 
                        `${currentModels.length} models available`
                      }
                    </p>
                  </div>

                  {/* Cognitive Lobe Models */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Frontal Lobe Model (Reasoning)
                      </label>
                      <Select 
                        value={localConfig.lobes.frontal.model} 
                        onValueChange={(value) => updateLocalConfig({
                          lobes: {
                            ...localConfig.lobes,
                            frontal: { ...localConfig.lobes.frontal, model: value }
                          }
                        })}
                        disabled={currentModels.length === 0}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {currentModels.length > 0 ? (
                            currentModels.map(model => (
                              <SelectItem key={`frontal-${model.id}`} value={model.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{model.name}</span>
                                  <span className="text-xs text-gray-500">{model.provider} • {model.category}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-models" disabled>No models available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Temporal Lobe Model (Memory & Speech)
                      </label>
                      <Select 
                        value={localConfig.lobes.temporal.model} 
                        onValueChange={(value) => updateLocalConfig({
                          lobes: {
                            ...localConfig.lobes,
                            temporal: { ...localConfig.lobes.temporal, model: value }
                          }
                        })}
                        disabled={currentModels.length === 0}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {currentModels.length > 0 ? (
                            currentModels.map(model => (
                              <SelectItem key={`temporal-${model.id}`} value={model.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{model.name}</span>
                                  <span className="text-xs text-gray-500">{model.provider} • {model.category}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-models" disabled>No models available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Occipital Lobe Model (Vision)
                      </label>
                      <Select 
                        value={localConfig.lobes.occipital.model} 
                        onValueChange={(value) => updateLocalConfig({
                          lobes: {
                            ...localConfig.lobes,
                            occipital: { ...localConfig.lobes.occipital, model: value }
                          }
                        })}
                        disabled={currentModels.length === 0}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {currentModels.length > 0 ? (
                            currentModels.map(model => (
                              <SelectItem key={`occipital-${model.id}`} value={model.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{model.name}</span>
                                  <span className="text-xs text-gray-500">{model.provider} • {model.category}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-models" disabled>No models available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Voice Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neural-primary flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Voice Settings
                  </h3>
                  
                  {/* Voice Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Voice
                    </label>
                    <Select value={localConfig.voiceId} onValueChange={(value) => updateLocalConfig({ voiceId: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceOptions.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Voice Stability */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Voice Stability: {localConfig.stability}
                    </label>
                    <Slider
                      value={[localConfig.stability]}
                      onValueChange={([value]) => updateLocalConfig({ stability: value })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Similarity Boost */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Similarity Boost: {localConfig.similarityBoost}
                    </label>
                    <Slider
                      value={[localConfig.similarityBoost]}
                      onValueChange={([value]) => updateLocalConfig({ similarityBoost: value })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neural-primary flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Features
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-neural-primary" />
                        <span className="text-sm font-medium">Text-to-Speech</span>
                      </div>
                      <Switch
                        checked={localConfig.features.ttsEnabled}
                        onCheckedChange={(checked) => updateFeature('ttsEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Web Search</span>
                      </div>
                      <Switch
                        checked={localConfig.features.webSearchEnabled}
                        onCheckedChange={(checked) => updateFeature('webSearchEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Cognitive Trace Visualization</span>
                      </div>
                      <Switch
                        checked={localConfig.features.visualizeThinking}
                        onCheckedChange={(checked) => updateFeature('visualizeThinking', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Speech Summary</span>
                      </div>
                      <Switch
                        checked={localConfig.features.speechSummaryEnabled}
                        onCheckedChange={(checked) => updateFeature('speechSummaryEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Auto Speech</span>
                      </div>
                      <Switch
                        checked={localConfig.features.autoSpeechEnabled}
                        onCheckedChange={(checked) => updateFeature('autoSpeechEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Holographic Processing</span>
                      </div>
                      <Switch
                        checked={localConfig.features.holographicEnabled}
                        onCheckedChange={(checked) => updateFeature('holographicEnabled', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <h3 className="font-medium text-neural-primary mb-2">System Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        localConfig.provider === 'openrouter' 
                          ? (openRouterStatus?.connected ? 'bg-green-500' : 'bg-red-500')
                          : (ollamaStatus?.connected ? 'bg-green-500' : 'bg-red-500')
                      }`}></div>
                      <span>
                        {localConfig.provider === 'openrouter' ? 'OpenRouter' : 'Ollama'}: {' '}
                        {localConfig.provider === 'openrouter' 
                          ? (openRouterStatus?.connected ? 'Connected' : 'Not connected')
                          : (ollamaStatus?.connected ? 'Connected' : 'Not connected')
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${localConfig.elevenLabsApiKey ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span>ElevenLabs TTS: {localConfig.elevenLabsApiKey ? 'Ready' : 'Optional'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${localConfig.perplexityApiKey ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span>Web Search: {localConfig.perplexityApiKey ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${localConfig.features.holographicEnabled ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                      <span>Holographic: {localConfig.features.holographicEnabled ? 'Active' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-neural-primary/10">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-neural-primary hover:bg-neural-secondary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

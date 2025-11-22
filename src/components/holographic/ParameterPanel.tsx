import React, { useState, useEffect } from 'react';
import { useHolographicStore } from '../../stores/holographicStore';
import { HolographicConfig, WaveType } from '../../types/holographic';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Settings, RotateCcw, Save, AlertTriangle, Zap, Brain, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const ParameterPanel: React.FC = () => {
  const { config, updateConfig, isEnabled } = useHolographicStore();
  const [localConfig, setLocalConfig] = useState<HolographicConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync with store config
  useEffect(() => {
    setLocalConfig(config);
    setHasChanges(false);
  }, [config]);

  // Check for changes
  useEffect(() => {
    const configsEqual = JSON.stringify(localConfig) === JSON.stringify(config);
    setHasChanges(!configsEqual);
  }, [localConfig, config]);

  const handleFrequencyChange = (waveType: WaveType, value: number[]) => {
    setLocalConfig(prev => ({
      ...prev,
      frequencies: {
        ...prev.frequencies,
        [waveType]: value[0]
      }
    }));
  };

  const handleInterferenceChange = (key: keyof HolographicConfig['interference'], value: number[]) => {
    setLocalConfig(prev => ({
      ...prev,
      interference: {
        ...prev.interference,
        [key]: value[0]
      }
    }));
  };

  const handleMemoryChange = (key: keyof HolographicConfig['memory'], value: number[] | boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      memory: {
        ...prev.memory,
        [key]: Array.isArray(value) ? value[0] : value
      }
    }));
  };

  const handleDegradationChange = (key: keyof HolographicConfig['degradation'], value: number[] | boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      degradation: {
        ...prev.degradation,
        [key]: Array.isArray(value) ? value[0] : value
      }
    }));
  };

  const saveChanges = () => {
    updateConfig(localConfig);
    toast.success('Holographic parameters updated successfully!');
  };

  const resetToDefaults = () => {
    const defaultConfig: HolographicConfig = {
      frequencies: {
        [WaveType.CONTEXT]: 0.5,
        [WaveType.INTENT]: 1.0,
        [WaveType.CONFIDENCE]: 2.0,
        [WaveType.TEMPORAL]: 0.8,
        [WaveType.MEMORY]: 0.3,
        [WaveType.PERSONA]: 0.2,
        [WaveType.REASONING]: 1.2,
        [WaveType.VISUAL]: 1.5
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
    };

    setLocalConfig(defaultConfig);
    toast.info('Parameters reset to default values');
  };

  if (!isEnabled) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Parameter Panel
            <Badge variant="outline">Disabled</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enable holographic processing in settings to access parameter controls.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Holographic Parameters
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600 dark:text-orange-400">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button
              onClick={saveChanges}
              disabled={!hasChanges}
              size="sm"
              className="flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              Apply Changes
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="frequencies" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="frequencies" className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Frequencies
            </TabsTrigger>
            <TabsTrigger value="interference" className="flex items-center gap-1">
              <Brain className="w-4 h-4" />
              Interference
            </TabsTrigger>
            <TabsTrigger value="memory" className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Memory
            </TabsTrigger>
            <TabsTrigger value="degradation" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Degradation
            </TabsTrigger>
          </TabsList>

          {/* Wave Frequencies Tab */}
          <TabsContent value="frequencies" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Wave Type Frequencies</h3>
              {Object.entries(WaveType).map(([key, waveType]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{waveType}</Label>
                    <span className="text-sm text-muted-foreground">
                      {localConfig.frequencies[waveType].toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={[localConfig.frequencies[waveType]]}
                    onValueChange={(value) => handleFrequencyChange(waveType, value)}
                    max={3.0}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Interference Tab */}
          <TabsContent value="interference" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Interference Thresholds</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Constructive Threshold</Label>
                  <span className="text-sm text-muted-foreground">
                    {localConfig.interference.constructiveThreshold.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[localConfig.interference.constructiveThreshold]}
                  onValueChange={(value) => handleInterferenceChange('constructiveThreshold', value)}
                  max={1.0}
                  min={0.1}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Destructive Threshold</Label>
                  <span className="text-sm text-muted-foreground">
                    {localConfig.interference.destructiveThreshold.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[localConfig.interference.destructiveThreshold]}
                  onValueChange={(value) => handleInterferenceChange('destructiveThreshold', value)}
                  max={1.0}
                  min={0.1}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Emergent Threshold</Label>
                  <span className="text-sm text-muted-foreground">
                    {localConfig.interference.emergentThreshold.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[localConfig.interference.emergentThreshold]}
                  onValueChange={(value) => handleInterferenceChange('emergentThreshold', value)}
                  max={1.0}
                  min={0.1}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Coherence Decay Rate</Label>
                  <span className="text-sm text-muted-foreground">
                    {localConfig.interference.coherenceDecayRate.toFixed(3)}
                  </span>
                </div>
                <Slider
                  value={[localConfig.interference.coherenceDecayRate]}
                  onValueChange={(value) => handleInterferenceChange('coherenceDecayRate', value)}
                  max={0.5}
                  min={0.01}
                  step={0.01}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          {/* Memory Tab */}
          <TabsContent value="memory" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Memory Configuration</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Max Fragments Per Region</Label>
                  <span className="text-sm text-muted-foreground">
                    {localConfig.memory.maxFragmentsPerRegion}
                  </span>
                </div>
                <Slider
                  value={[localConfig.memory.maxFragmentsPerRegion]}
                  onValueChange={(value) => handleMemoryChange('maxFragmentsPerRegion', value)}
                  max={500}
                  min={10}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Reconstruction Threshold</Label>
                  <span className="text-sm text-muted-foreground">
                    {localConfig.memory.reconstructionThreshold.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[localConfig.memory.reconstructionThreshold]}
                  onValueChange={(value) => handleMemoryChange('reconstructionThreshold', value)}
                  max={1.0}
                  min={0.1}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Fragment Persistence</Label>
                  <span className="text-sm text-muted-foreground">
                    {localConfig.memory.fragmentPersistence.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[localConfig.memory.fragmentPersistence]}
                  onValueChange={(value) => handleMemoryChange('fragmentPersistence', value)}
                  max={1.0}
                  min={0.1}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label htmlFor="cross-session" className="text-sm">
                  Cross-Session Memory
                </Label>
                <Switch
                  id="cross-session"
                  checked={localConfig.memory.crossSessionEnabled}
                  onCheckedChange={(checked) => handleMemoryChange('crossSessionEnabled', checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Degradation Tab */}
          <TabsContent value="degradation" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Graceful Degradation</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="degradation-enabled" className="text-sm">
                  Enable Graceful Degradation
                </Label>
                <Switch
                  id="degradation-enabled"
                  checked={localConfig.degradation.enabled}
                  onCheckedChange={(checked) => handleDegradationChange('enabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Reconstruction Attempts</Label>
                  <span className="text-sm text-muted-foreground">
                    {localConfig.degradation.reconstructionAttempts}
                  </span>
                </div>
                <Slider
                  value={[localConfig.degradation.reconstructionAttempts]}
                  onValueChange={(value) => handleDegradationChange('reconstructionAttempts', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Minimum Coherence</Label>
                  <span className="text-sm text-muted-foreground">
                    {localConfig.degradation.minimumCoherence.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[localConfig.degradation.minimumCoherence]}
                  onValueChange={(value) => handleDegradationChange('minimumCoherence', value)}
                  max={1.0}
                  min={0.1}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Fallback Regions</Label>
                <div className="text-xs text-muted-foreground mb-2">
                  Comma-separated list of regions to use during system degradation
                </div>
                <Input
                  value={localConfig.degradation.fallbackRegions.join(', ')}
                  onChange={(e) => {
                    const regions = e.target.value.split(',').map(r => r.trim()).filter(Boolean);
                    setLocalConfig(prev => ({
                      ...prev,
                      degradation: {
                        ...prev.degradation,
                        fallbackRegions: regions
                      }
                    }));
                  }}
                  placeholder="InnerBrain, FrontalLobe, TemporalLobe"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
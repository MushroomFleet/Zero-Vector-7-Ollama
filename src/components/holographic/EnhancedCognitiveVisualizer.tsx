import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useHolographicStore } from '../../stores/holographicStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Brain, Activity, Zap, Settings, Clock, TrendingUp } from 'lucide-react';
import { MemoryFragmentBrowser } from './MemoryFragmentBrowser';
import { CoherenceDashboard } from './CoherenceDashboard';
import { ParameterPanel } from './ParameterPanel';
import { formatDistanceToNow } from 'date-fns';

export const EnhancedCognitiveVisualizer: React.FC = () => {
  const { messages, isLoading } = useChatStore();
  const { systemState, isEnabled, updateSystemState } = useHolographicStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Get the latest assistant message with cognitive trace
  const lastAssistantMessage = messages
    .filter(m => m.role === 'assistant')
    .pop();

  const trace = lastAssistantMessage?.cognitiveTrace;

  // Real-time system metrics
  const [systemMetrics, setSystemMetrics] = useState({
    processingTime: 0,
    confidence: 0,
    coherence: 0,
    activeWaves: 0,
    memoryFragments: 0
  });

  // Auto-refresh system state periodically
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      updateSystemState();
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isEnabled, updateSystemState]);

  useEffect(() => {
    if (!systemState) {
      console.log('No system state available for metrics');
      return;
    }

    console.log('Updating system metrics with state:', systemState);

    const processingTime = trace?.processing.duration || 0;
    const confidence = Math.max(
      trace?.innerThoughts?.confidence || 0,
      trace?.frontalLobe?.confidence || 0
    );
    
    // Fix: Get coherence from system state instead of trace
    const coherence = typeof systemState.systemCoherence === 'number' ? systemState.systemCoherence : 0;
    
    // Fix: activeWaves is a number, not an array
    const activeWaves = typeof systemState.activeWaves === 'number' ? systemState.activeWaves : 0;
    const memoryFragments = typeof systemState.fragmentCount === 'number' ? systemState.fragmentCount : 0;

    const newMetrics = {
      processingTime,
      confidence: confidence * 100,
      coherence: coherence * 100,
      activeWaves,
      memoryFragments
    };

    console.log('Setting new system metrics:', newMetrics);

    setSystemMetrics(newMetrics);
  }, [trace, systemState]);

  if (!isEnabled) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Enhanced Cognitive Visualizer
            <Badge variant="outline">Holographic System Disabled</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Enable holographic processing in settings to access enhanced cognitive visualization.
          </p>
          
          {/* Basic cognitive trace if available */}
          {trace && (
            <div className="space-y-4">
              <Separator />
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Basic Cognitive Trace
              </h3>
              
              {trace.innerThoughts && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Inner Thoughts</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <p><strong>Intent:</strong> {trace.innerThoughts.intent}</p>
                    <p><strong>Context:</strong> {trace.innerThoughts.context}</p>
                    <p><strong>Plan:</strong> {trace.innerThoughts.plan}</p>
                    <div className="mt-2">
                      <Progress 
                        value={trace.innerThoughts.confidence * 100} 
                        className="h-2"
                      />
                      <span className="text-xs text-muted-foreground">
                        Confidence: {(trace.innerThoughts.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {trace.frontalLobe && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Frontal Lobe Reasoning</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <p><strong>Reasoning:</strong> {trace.frontalLobe.reasoning}</p>
                    <div className="mt-2">
                      <Progress 
                        value={trace.frontalLobe.confidence * 100} 
                        className="h-2"
                      />
                      <span className="text-xs text-muted-foreground">
                        Confidence: {(trace.frontalLobe.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 animate-pulse" />
            Enhanced Cognitive Visualizer
            <Badge variant="outline" className="animate-pulse">Processing</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="w-4 h-4 animate-spin" />
              Neural networks are processing your request...
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Holographic Reconstruction</div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Wave Interference</div>
                <Progress value={92} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Memory Coherence</div>
                <Progress value={78} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* System Overview Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Enhanced Cognitive Visualizer
              <Badge variant="outline" className="text-green-600 dark:text-green-400">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            {trace?.processing.endTime && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDistanceToNow(trace.processing.endTime, { addSuffix: true })}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Real-time Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {systemMetrics.processingTime.toFixed(0)}ms
              </div>
              <div className="text-xs text-muted-foreground">Processing Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {systemMetrics.confidence.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {systemMetrics.coherence.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Coherence</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {systemMetrics.activeWaves}
              </div>
              <div className="text-xs text-muted-foreground">Active Waves</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {systemMetrics.memoryFragments}
              </div>
              <div className="text-xs text-muted-foreground">Memory Fragments</div>
            </div>
          </div>

          {/* Holographic Reconstruction Status */}
          {trace?.holographicReconstruction && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Holographic Reconstruction
                </h3>
                <Badge variant={trace.holographicReconstruction.used ? "default" : "outline"}>
                  {trace.holographicReconstruction.used ? "Active" : "Standby"}
                </Badge>
              </div>
              
              {trace.holographicReconstruction.used && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Reconstructed Fragments</div>
                    <div className="font-medium">{trace.holographicReconstruction.reconstructedFragments}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Emergent Patterns</div>
                    <div className="font-medium">{trace.holographicReconstruction.emergentPatterns.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">System Coherence</div>
                    <div className="font-medium">{(trace.holographicReconstruction.systemCoherence * 100).toFixed(1)}%</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabbed Visualization Interface */}
      <Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardHeader>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="memory" className="flex items-center gap-1">
              <Brain className="w-4 h-4" />
              Memory
            </TabsTrigger>
            <TabsTrigger value="coherence" className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Coherence
            </TabsTrigger>
            <TabsTrigger value="parameters" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Parameters
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cognitive Trace Summary */}
              {trace && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Brain className="w-4 h-4" />
                      Cognitive Processing Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {trace.innerThoughts && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Inner Thoughts</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Intent:</strong> {trace.innerThoughts.intent}</p>
                          <p><strong>Context:</strong> {trace.innerThoughts.context}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={trace.innerThoughts.confidence * 100} className="h-2 flex-1" />
                            <span className="text-xs">{(trace.innerThoughts.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {trace.frontalLobe && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Frontal Lobe Reasoning</h4>
                        <div className="text-sm text-muted-foreground">
                          <p>{trace.frontalLobe.reasoning}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={trace.frontalLobe.confidence * 100} className="h-2 flex-1" />
                            <span className="text-xs">{(trace.frontalLobe.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* System Health Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="w-4 h-4" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Memory System</span>
                      <span className="text-green-600 dark:text-green-400">Optimal</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Wave Interference</span>
                      <span className="text-blue-600 dark:text-blue-400">Active</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Holographic Engine</span>
                      <span className="text-green-600 dark:text-green-400">Running</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Coherence Level</span>
                      <span>{systemMetrics.coherence.toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Memory Browser Tab */}
          <TabsContent value="memory">
            <MemoryFragmentBrowser />
          </TabsContent>

          {/* Coherence Dashboard Tab */}
          <TabsContent value="coherence">
            <CoherenceDashboard />
          </TabsContent>

          {/* Parameters Tab */}
          <TabsContent value="parameters">
            <ParameterPanel />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>

    </div>
  );
};
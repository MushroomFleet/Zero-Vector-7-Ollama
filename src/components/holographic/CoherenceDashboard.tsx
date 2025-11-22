import React, { useState, useEffect } from 'react';
import { useHolographicStore } from '../../stores/holographicStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, Brain, Zap, Clock, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import { WaveType } from '../../types/holographic';

interface MetricData {
  timestamp: string;
  coherence: number;
  activeWaves: number;
  fragmentCount: number;
  interferencePatterns: number;
}

interface WaveTypeDistribution {
  waveType: string;
  count: number;
  color: string;
  [key: string]: any;
}

interface SystemHealth {
  overall: number;
  memory: number;
  interference: number;
  coherence: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const WAVE_COLORS: Record<WaveType, string> = {
  [WaveType.CONTEXT]: '#3b82f6',
  [WaveType.INTENT]: '#8b5cf6',
  [WaveType.CONFIDENCE]: '#10b981',
  [WaveType.TEMPORAL]: '#f59e0b',
  [WaveType.MEMORY]: '#ef4444',
  [WaveType.PERSONA]: '#06b6d4',
  [WaveType.REASONING]: '#f97316',
  [WaveType.VISUAL]: '#ec4899'
};

export const CoherenceDashboard: React.FC = () => {
  const { waveEngine, isEnabled, systemState, updateSystemState } = useHolographicStore();
  const [metricsHistory, setMetricsHistory] = useState<MetricData[]>([]);
  const [waveDistribution, setWaveDistribution] = useState<WaveTypeDistribution[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 0,
    memory: 0,
    interference: 0,
    coherence: 0,
    status: 'critical'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update system state and metrics
  const refreshMetrics = async () => {
    if (!waveEngine || !isEnabled) {
      console.log('Metrics refresh skipped - holographic system not enabled');
      return;
    }

    setIsRefreshing(true);
    
    try {
      // Force system state update
      updateSystemState();
      
      // Calculate current metrics
      const fragments = waveEngine.getAllFragments();
      console.log(`Refreshing metrics: ${fragments.length} fragments found`);
      
      const currentSystemState = waveEngine.getSystemState();
      console.log('Current system state:', currentSystemState);
      
      const activeWaves = typeof currentSystemState?.activeWaves === 'number' ? currentSystemState.activeWaves : 0;
      const interferencePatterns = typeof currentSystemState?.interferencePatterns === 'number' ? currentSystemState.interferencePatterns : 0;

      const currentCoherence = fragments.length > 0 
        ? fragments.reduce((sum, f) => sum + (f.importance || 0), 0) / fragments.length 
        : 0;

      const newMetric: MetricData = {
        timestamp: new Date().toLocaleTimeString(),
        coherence: currentCoherence * 100,
        activeWaves: activeWaves,
        fragmentCount: fragments.length,
        interferencePatterns: interferencePatterns
      };

      console.log('New metric data:', newMetric);

      setMetricsHistory(prev => {
        const updated = [...prev, newMetric];
        return updated.slice(-20); // Keep last 20 data points
      });

      // Calculate wave type distribution
      const distribution: Record<string, number> = {};
      fragments.forEach(fragment => {
        const waveType = fragment.waveType || 'UNKNOWN';
        distribution[waveType] = (distribution[waveType] || 0) + 1;
      });

      const distributionData: WaveTypeDistribution[] = Object.entries(distribution).map(([waveType, count]) => ({
        waveType,
        count,
        color: WAVE_COLORS[waveType as WaveType] || '#6b7280'
      }));

      setWaveDistribution(distributionData);

      // Calculate system health
      const memoryHealth = Math.min(100, (fragments.length / 100) * 100);
      const interferenceHealth = Math.min(100, (interferencePatterns / 10) * 100);
      const coherenceHealth = currentCoherence * 100;
      const overallHealth = (memoryHealth + interferenceHealth + coherenceHealth) / 3;

      let status: SystemHealth['status'] = 'critical';
      if (overallHealth >= 80) status = 'excellent';
      else if (overallHealth >= 60) status = 'good';
      else if (overallHealth >= 40) status = 'warning';

      setSystemHealth({
        overall: overallHealth,
        memory: memoryHealth,
        interference: interferenceHealth,
        coherence: coherenceHealth,
        status
      });

    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh metrics
  useEffect(() => {
    if (!isEnabled) return;

    refreshMetrics();
    const interval = setInterval(refreshMetrics, 3000);
    return () => clearInterval(interval);
  }, [waveEngine, isEnabled]);

  const getStatusColor = (status: SystemHealth['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
    }
  };

  const getStatusIcon = (status: SystemHealth['status']) => {
    switch (status) {
      case 'excellent': return <TrendingUp className="w-4 h-4" />;
      case 'good': return <Activity className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (!isEnabled) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Coherence Dashboard
            <Badge variant="outline">Disabled</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enable holographic processing in settings to view system coherence metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Health
              <Badge 
                variant="outline" 
                className={getStatusColor(systemHealth.status)}
              >
                {getStatusIcon(systemHealth.status)}
                {systemHealth.status.toUpperCase()}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshMetrics}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Health</span>
                <span className="text-sm text-muted-foreground">
                  {systemHealth.overall.toFixed(1)}%
                </span>
              </div>
              <Progress value={systemHealth.overall} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory System</span>
                <span className="text-sm text-muted-foreground">
                  {systemHealth.memory.toFixed(1)}%
                </span>
              </div>
              <Progress value={systemHealth.memory} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Interference</span>
                <span className="text-sm text-muted-foreground">
                  {systemHealth.interference.toFixed(1)}%
                </span>
              </div>
              <Progress value={systemHealth.interference} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Coherence</span>
                <span className="text-sm text-muted-foreground">
                  {systemHealth.coherence.toFixed(1)}%
                </span>
              </div>
              <Progress value={systemHealth.coherence} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              System Metrics Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {metricsHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="timestamp" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="coherence" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                      name="Coherence %"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="activeWaves" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={false}
                      name="Active Waves"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="fragmentCount" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={false}
                      name="Fragments"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No metrics yet - start a conversation to see data</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wave Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Wave Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {waveDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={waveDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ waveType, percent }: any) => 
                        `${waveType}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {waveDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No wave data available</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current System State */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Current System State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {typeof systemState?.activeWaves === 'number' ? systemState.activeWaves : 0}
              </div>
              <div className="text-sm text-muted-foreground">Active Waves</div>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {waveEngine?.getFragmentCount() || 0}
              </div>
              <div className="text-sm text-muted-foreground">Memory Fragments</div>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {typeof systemState?.interferencePatterns === 'number' ? systemState.interferencePatterns : 0}
              </div>
              <div className="text-sm text-muted-foreground">Interference Patterns</div>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {systemHealth.coherence.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">System Coherence</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
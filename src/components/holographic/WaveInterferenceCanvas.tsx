import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Circle, Line, Rect } from 'react-konva';
import { useHolographicStore } from '../../stores/holographicStore';
import { WaveType } from '../../types/holographic';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface WaveParticle {
  id: string;
  x: number;
  y: number;
  frequency: number;
  amplitude: number;
  phase: number;
  waveType: WaveType;
  color: string;
}

interface InterferencePoint {
  x: number;
  y: number;
  intensity: number;
  color: string;
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

export const WaveInterferenceCanvas: React.FC = () => {
  const { systemState, isEnabled } = useHolographicStore();
  const [isAnimating, setIsAnimating] = useState(true);
  const [time, setTime] = useState(0);
  const [waveParticles, setWaveParticles] = useState<WaveParticle[]>([]);
  const [interferencePoints, setInterferencePoints] = useState<InterferencePoint[]>([]);
  const animationRef = useRef<number>();

  const canvasWidth = 800;
  const canvasHeight = 500;

  // Initialize wave particles from system state
  useEffect(() => {
    if (!systemState?.activeWaves) return;

    const particles: WaveParticle[] = systemState.activeWaves.map((wave: any, index: number) => ({
      id: wave.id,
      x: (index * 150 + 100) % (canvasWidth - 100),
      y: (index * 80 + 100) % (canvasHeight - 100),
      frequency: wave.frequency,
      amplitude: wave.amplitude * 50,
      phase: wave.phase,
      waveType: wave.waveType,
      color: WAVE_COLORS[wave.waveType as WaveType] || '#6b7280'
    }));

    setWaveParticles(particles);
  }, [systemState]);

  // Calculate interference patterns
  useEffect(() => {
    if (waveParticles.length < 2) {
      setInterferencePoints([]);
      return;
    }

    const points: InterferencePoint[] = [];
    const gridSize = 40;

    for (let x = 0; x < canvasWidth; x += gridSize) {
      for (let y = 0; y < canvasHeight; y += gridSize) {
        let totalAmplitude = 0;
        let dominantColor = '#6b7280';
        let maxContribution = 0;

        waveParticles.forEach(particle => {
          const distance = Math.sqrt((x - particle.x) ** 2 + (y - particle.y) ** 2);
          const waveValue = particle.amplitude * Math.sin(
            particle.frequency * distance - time + particle.phase
          ) / (distance / 100 + 1); // Decay with distance

          totalAmplitude += waveValue;

          if (Math.abs(waveValue) > maxContribution) {
            maxContribution = Math.abs(waveValue);
            dominantColor = particle.color;
          }
        });

        if (Math.abs(totalAmplitude) > 5) {
          points.push({
            x,
            y,
            intensity: Math.abs(totalAmplitude),
            color: dominantColor
          });
        }
      }
    }

    setInterferencePoints(points);
  }, [waveParticles, time]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;

    const animate = () => {
      setTime(prevTime => prevTime + 0.1);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating]);

  const toggleAnimation = () => setIsAnimating(!isAnimating);
  const resetCanvas = () => setTime(0);

  if (!isEnabled) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted"></div>
            Wave Interference Canvas
            <Badge variant="outline">Disabled</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enable holographic processing in settings to view wave interference patterns.
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
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
            Wave Interference Canvas
            <Badge variant="outline">{waveParticles.length} Active Waves</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAnimation}
              className="flex items-center gap-1"
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isAnimating ? 'Pause' : 'Play'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetCanvas}
              className="flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-card">
          <Stage width={canvasWidth} height={canvasHeight}>
            <Layer>
              {/* Background */}
              <Rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill="hsl(var(--background))"
              />

              {/* Interference patterns */}
              {interferencePoints.map((point, index) => (
                <Circle
                  key={index}
                  x={point.x}
                  y={point.y}
                  radius={Math.max(1, point.intensity / 5)}
                  fill={point.color}
                  opacity={Math.min(0.6, point.intensity / 20)}
                />
              ))}

              {/* Wave sources */}
              {waveParticles.map(particle => (
                <React.Fragment key={particle.id}>
                  {/* Central source */}
                  <Circle
                    x={particle.x}
                    y={particle.y}
                    radius={8}
                    fill={particle.color}
                    stroke="hsl(var(--border))"
                    strokeWidth={2}
                  />
                  
                  {/* Ripple effect */}
                  <Circle
                    x={particle.x}
                    y={particle.y}
                    radius={particle.amplitude * Math.abs(Math.sin(time + particle.phase))}
                    stroke={particle.color}
                    strokeWidth={1}
                    opacity={0.3}
                  />
                </React.Fragment>
              ))}

              {/* Wave type labels */}
              {waveParticles.map(particle => (
                <React.Fragment key={`label-${particle.id}`}>
                  <Rect
                    x={particle.x - 30}
                    y={particle.y - 35}
                    width={60}
                    height={16}
                    fill="hsl(var(--popover))"
                    stroke="hsl(var(--border))"
                    strokeWidth={1}
                    cornerRadius={4}
                    opacity={0.9}
                  />
                </React.Fragment>
              ))}
            </Layer>
          </Stage>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(WaveType).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: WAVE_COLORS[value] }}
              />
              <span className="text-muted-foreground">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
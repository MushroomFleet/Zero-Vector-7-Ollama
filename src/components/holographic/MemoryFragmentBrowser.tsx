import React, { useState, useEffect, useMemo } from 'react';
import { useHolographicStore } from '../../stores/holographicStore';
import { HolographicFragment, WaveType } from '../../types/holographic';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Search, Filter, Brain, Clock, Zap, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '../ui/use-toast';

interface FragmentViewProps {
  fragment: HolographicFragment;
  onClick: (fragment: HolographicFragment) => void;
  isSelected: boolean;
}

const FragmentView: React.FC<FragmentViewProps> = ({ fragment, onClick, isSelected }) => {
  const getWaveTypeColor = (waveType: WaveType) => {
    const colors: Record<WaveType, string> = {
      [WaveType.CONTEXT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      [WaveType.INTENT]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      [WaveType.CONFIDENCE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      [WaveType.TEMPORAL]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      [WaveType.MEMORY]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      [WaveType.PERSONA]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      [WaveType.REASONING]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      [WaveType.VISUAL]: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
    };
    return colors[waveType] || 'bg-muted text-foreground';
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onClick(fragment)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge className={getWaveTypeColor(fragment.waveType)}>
            {fragment.waveType}
          </Badge>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="w-3 h-3" />
            {fragment.sourceRegion}
          </div>
        </div>
        
        <p className="text-sm mb-3 line-clamp-3">
          {fragment.content}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>{Math.round(fragment.importance * 100)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(fragment.timestamp, { addSuffix: true })}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div>Freq: {fragment.frequency.toFixed(2)}</div>
            <div>Amp: {fragment.amplitude.toFixed(2)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MemoryFragmentBrowser: React.FC = () => {
  const { waveEngine, isEnabled, flushMemory } = useHolographicStore();
  const [fragments, setFragments] = useState<HolographicFragment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWaveType, setSelectedWaveType] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedFragment, setSelectedFragment] = useState<HolographicFragment | null>(null);
  const [sortBy, setSortBy] = useState<'timestamp' | 'importance' | 'frequency'>('timestamp');

  // Load fragments from wave engine
  useEffect(() => {
    if (!waveEngine || !isEnabled) {
      setFragments([]);
      return;
    }

    const loadFragments = () => {
      const allFragments = waveEngine.getAllFragments();
      setFragments(allFragments);
    };

    loadFragments();
    
    // Refresh every 2 seconds to catch new fragments
    const interval = setInterval(loadFragments, 2000);
    return () => clearInterval(interval);
  }, [waveEngine, isEnabled]);

  const handleFlushMemory = () => {
    flushMemory();
    setFragments([]);
    setSelectedFragment(null);
    toast({
      title: "Memory Flushed",
      description: "All holographic memory fragments have been cleared.",
    });
  };

  // Filter and sort fragments
  const filteredFragments = useMemo(() => {
    let filtered = fragments.filter(fragment => {
      const matchesSearch = fragment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fragment.sourceRegion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWaveType = selectedWaveType === 'all' || fragment.waveType === selectedWaveType;
      const matchesRegion = selectedRegion === 'all' || fragment.sourceRegion === selectedRegion;
      
      return matchesSearch && matchesWaveType && matchesRegion;
    });

    // Sort fragments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'importance':
          return b.importance - a.importance;
        case 'frequency':
          return b.frequency - a.frequency;
        case 'timestamp':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

    return filtered;
  }, [fragments, searchTerm, selectedWaveType, selectedRegion, sortBy]);

  // Get unique regions for filter
  const uniqueRegions = useMemo(() => {
    const regions = [...new Set(fragments.map(f => f.sourceRegion))];
    return regions.sort();
  }, [fragments]);

  const handleFragmentClick = (fragment: HolographicFragment) => {
    setSelectedFragment(selectedFragment?.id === fragment.id ? null : fragment);
  };

  if (!isEnabled) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Memory Fragment Browser
            <Badge variant="outline">Disabled</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enable holographic processing in settings to browse memory fragments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Memory Fragment Browser
              <Badge variant="outline">{fragments.length} Fragments</Badge>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  disabled={!isEnabled || filteredFragments.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Flush Memory
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Flush All Memory?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {fragments.length} holographic memory fragments. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleFlushMemory} className="bg-destructive hover:bg-destructive/90">
                    Flush Memory
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fragments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedWaveType} onValueChange={setSelectedWaveType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by wave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wave Types</SelectItem>
                {Object.values(WaveType).map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {uniqueRegions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Latest First</SelectItem>
                <SelectItem value="importance">Importance</SelectItem>
                <SelectItem value="frequency">Frequency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fragment List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredFragments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No memory fragments found matching your criteria.</p>
                </div>
              ) : (
                filteredFragments.map(fragment => (
                  <FragmentView
                    key={fragment.id}
                    fragment={fragment}
                    onClick={handleFragmentClick}
                    isSelected={selectedFragment?.id === fragment.id}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected Fragment Details */}
      {selectedFragment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Fragment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Content</h4>
                <p className="text-sm bg-muted p-3 rounded">{selectedFragment.content}</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Properties</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div><strong>ID:</strong> {selectedFragment.id}</div>
                    <div><strong>Source Region:</strong> {selectedFragment.sourceRegion}</div>
                    <div><strong>Wave Type:</strong> {selectedFragment.waveType}</div>
                    <div><strong>Frequency:</strong> {selectedFragment.frequency.toFixed(3)}</div>
                    <div><strong>Amplitude:</strong> {selectedFragment.amplitude.toFixed(3)}</div>
                    <div><strong>Phase:</strong> {selectedFragment.phase.toFixed(3)}</div>
                    <div><strong>Importance:</strong> {(selectedFragment.importance * 100).toFixed(1)}%</div>
                    <div><strong>Session:</strong> {selectedFragment.sessionId}</div>
                    <div><strong>Timestamp:</strong> {selectedFragment.timestamp.toLocaleString()}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold">Coherence Signature</h4>
                  <p className="text-xs bg-muted p-2 rounded font-mono">
                    {selectedFragment.coherenceSignature}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

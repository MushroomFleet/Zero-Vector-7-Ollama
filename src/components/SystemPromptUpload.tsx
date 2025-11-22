import React, { useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { useSettingsStore } from '../stores/settingsStore';
import { useToast } from '@/hooks/use-toast';

interface SystemPromptUploadProps {
  isActive: boolean;
  onToggle: () => void;
}

export const SystemPromptUpload: React.FC<SystemPromptUploadProps> = ({ isActive, onToggle }) => {
  const { config, updateConfig } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      toast({
        title: "Invalid file type",
        description: "Please select a .txt or .md file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 50KB)
    if (file.size > 50 * 1024) {
      toast({
        title: "File too large",
        description: "System prompt must be less than 50KB",
        variant: "destructive"
      });
      return;
    }

    try {
      const content = await file.text();
      
      // Basic validation - ensure it's not empty
      if (!content.trim()) {
        toast({
          title: "Empty file",
          description: "System prompt cannot be empty",
          variant: "destructive"
        });
        return;
      }

      // Update configuration
      updateConfig({
        customInnerThoughtsPrompt: content.trim(),
        innerThoughtsPromptEnabled: true
      });

      toast({
        title: "System prompt uploaded",
        description: `Custom prompt loaded from ${file.name}. Core output format will be preserved.`,
      });

    } catch (error) {
      toast({
        title: "Failed to read file",
        description: "Could not read the selected file",
        variant: "destructive"
      });
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggle = () => {
    if (isActive) {
      // Disable and clear custom prompt
      updateConfig({
        innerThoughtsPromptEnabled: false,
        customInnerThoughtsPrompt: undefined
      });
      toast({
        title: "Custom prompt disabled and cleared",
        description: "Using default analysis prompt with core format requirements",
      });
    } else if (config.customInnerThoughtsPrompt) {
      // Enable existing custom prompt
      updateConfig({
        innerThoughtsPromptEnabled: true
      });
      toast({
        title: "Custom prompt enabled",
        description: "Using hybrid mode: custom prompt + core system requirements",
      });
    } else {
      // Upload new prompt
      fileInputRef.current?.click();
    }
    
    onToggle();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className={`gap-2 ${
          isActive 
            ? 'bg-neural-primary/10 border-neural-primary/30 text-neural-primary' 
            : ''
        }`}
        title={
          isActive 
            ? 'Disable and clear custom Inner Thoughts prompt (core output format preserved)' 
            : config.customInnerThoughtsPrompt 
              ? 'Enable custom Inner Thoughts prompt (hybrid mode with core requirements)'
              : 'Upload custom Inner Thoughts prompt - system will ensure proper output format'
        }
      >
        {isActive ? <X className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
        System
        {isActive && <div className="w-2 h-2 bg-neural-primary rounded-full ml-1" />}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
};
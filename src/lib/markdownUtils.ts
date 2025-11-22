/**
 * Utilities for processing markdown text for different use cases
 */

export function cleanMarkdownForTTS(text: string): string {
  let cleaned = text;

  // Remove markdown headers while preserving content
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  
  // Remove bold and italic markers
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
  
  // Handle lists - convert to natural speech
  cleaned = cleaned.replace(/^[-*+]\s+(.+)/gm, '$1. ');
  cleaned = cleaned.replace(/^\d+\.\s+(.+)/gm, '$1. ');
  
  // Remove code blocks and inline code
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ' code block ');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Handle links - convert to natural speech
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, 'link to $1');
  
  // Remove blockquotes
  cleaned = cleaned.replace(/^>\s+/gm, '');
  
  // Remove horizontal rules
  cleaned = cleaned.replace(/^[-*_]{3,}$/gm, '');
  
  // Clean up extra whitespace and line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();
  
  return cleaned;
}

export function stripMarkdownForSummary(text: string): string {
  let stripped = text;
  
  // Remove all markdown syntax but preserve the content structure
  stripped = stripped.replace(/#{1,6}\s+/g, '');
  stripped = stripped.replace(/\*\*([^*]+)\*\*/g, '$1');
  stripped = stripped.replace(/\*([^*]+)\*/g, '$1');
  stripped = stripped.replace(/__([^_]+)__/g, '$1');
  stripped = stripped.replace(/_([^_]+)_/g, '$1');
  stripped = stripped.replace(/```[\s\S]*?```/g, '');
  stripped = stripped.replace(/`([^`]+)`/g, '$1');
  stripped = stripped.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  stripped = stripped.replace(/^>\s+/gm, '');
  stripped = stripped.replace(/^[-*+]\s+/gm, '');
  stripped = stripped.replace(/^\d+\.\s+/gm, '');
  stripped = stripped.replace(/^[-*_]{3,}$/gm, '');
  
  // Clean up whitespace
  stripped = stripped.replace(/\n{2,}/g, ' ');
  stripped = stripped.replace(/\s+/g, ' ');
  stripped = stripped.trim();
  
  return stripped;
}
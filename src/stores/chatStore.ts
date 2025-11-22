import { create } from 'zustand';
import { Message } from '../types/cognitive';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentMessageId: string | null;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentMessageId: (id: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  currentMessageId: null,

  addMessage: (message: Message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  updateMessage: (id: string, updates: Partial<Message>) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    )
  })),

  clearMessages: () => set({ messages: [] }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setCurrentMessageId: (id: string | null) => set({ currentMessageId: id }),
}));
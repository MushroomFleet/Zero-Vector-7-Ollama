import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform information
  platform: process.platform,
  
  // Version information
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  
  // Example IPC methods (can be extended as needed)
  onUpdateAvailable: (callback: (version: string) => void) => {
    ipcRenderer.on('update-available', (_event, version) => callback(version));
  },
  
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update-downloaded', () => callback());
  },
  
  // Add more IPC methods here as needed for your app
});

// Declare the global type for TypeScript
declare global {
  interface Window {
    electronAPI: {
      platform: string;
      versions: {
        node: string;
        chrome: string;
        electron: string;
      };
      onUpdateAvailable: (callback: (version: string) => void) => void;
      onUpdateDownloaded: (callback: () => void) => void;
    };
  }
}

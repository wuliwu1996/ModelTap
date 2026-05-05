const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('llmDesktop', {
  isElectron: true,
  getProxyBaseUrl() {
    return ipcRenderer.invoke('proxy:getBaseUrl');
  },
  readPrompts() {
    return ipcRenderer.invoke('storage:read', 'prompt');
  },
  writePrompts(payload) {
    return ipcRenderer.invoke('storage:write', 'prompt', payload);
  },
  readHistory() {
    return ipcRenderer.invoke('storage:read', 'history');
  },
  writeHistory(payload) {
    return ipcRenderer.invoke('storage:write', 'history', payload);
  },
  readModels() {
    return ipcRenderer.invoke('storage:read', 'model');
  },
  writeModels(payload) {
    return ipcRenderer.invoke('storage:write', 'model', payload);
  },
  readAiPortal() {
    return ipcRenderer.invoke('storage:read', 'aiPortal');
  },
  writeAiPortal(payload) {
    return ipcRenderer.invoke('storage:write', 'aiPortal', payload);
  }
});

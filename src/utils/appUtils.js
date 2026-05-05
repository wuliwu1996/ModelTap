export function buildModelId(name) {
  return (name || 'model')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || `model-${Date.now()}`;
}

export function getCurrentTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatHistoryTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function getFileExtension(filename) {
  const parts = String(filename || '').split('.');
  if (parts.length < 2) return '';
  return parts.pop().toLowerCase();
}

export function formatFileSize(size) {
  const bytes = Number(size || 0);
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function getFileProgressValue(file) {
  const value = Number(file?.progress || 0);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getApiUrl(proxyBaseUrl) {
  if (proxyBaseUrl) {
    return `${proxyBaseUrl}/llmserver/v1/chat/completions`;
  }
  return '/llmserver/v1/chat/completions';
}

export function buildProxyTargetUrl(targetApiUrl, proxyBaseUrl) {
  const encodedTarget = encodeURIComponent(targetApiUrl);
  if (proxyBaseUrl) {
    return `${proxyBaseUrl}/proxy?target=${encodedTarget}`;
  }
  return targetApiUrl;
}

export function buildModelRequest(modelConfig, messages) {
  const extraBody = modelConfig.extraBody && typeof modelConfig.extraBody === 'object' && !Array.isArray(modelConfig.extraBody)
    ? modelConfig.extraBody
    : {};
  const base = {
    ...extraBody,
    model: modelConfig.model,
    stream: modelConfig.stream !== false
  };
  if (Number.isFinite(Number(modelConfig.temperature))) {
    base.temperature = Number(modelConfig.temperature);
  }
  if (Number.isFinite(Number(modelConfig.topP))) {
    base.top_p = Number(modelConfig.topP);
  }
  if (Number.isFinite(Number(modelConfig.maxTokens))) {
    base.max_tokens = Number(modelConfig.maxTokens);
  }

  return {
    ...base,
    messages: messages
  };
}

export function buildHeaders(modelConfig) {
  const headers = {
    'Content-Type': 'application/json'
  };
  const apiKey = String(modelConfig.apiKey || '').trim();
  if (modelConfig.protocol === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else {
    headers.Authorization = modelConfig.authMode === 'raw'
      ? apiKey
      : `Bearer ${apiKey}`;
  }
  return headers;
}

export function extractAnthropicEventData(line) {
  if (!line || !line.startsWith('data:')) return null;
  const dataStr = line.slice(5).trim();
  if (!dataStr || dataStr === '[DONE]') return null;
  try {
    return JSON.parse(dataStr);
  } catch (error) {
    console.error('Error parsing Anthropic SSE data:', error, dataStr);
    return null;
  }
}

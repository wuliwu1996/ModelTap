const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

let APP_DATA_DIR = '';
let PROMPT_FILE = '';
let HISTORY_FILE = '';
let MODEL_FILE = '';
let AI_PORTAL_FILE = '';
const DEFAULT_MODEL_FILE = path.join(__dirname, 'defaults', 'model.json');
const DEFAULT_AI_PORTAL_FILE = path.join(__dirname, 'defaults', 'ai-portal.json');

const DEFAULT_PROMPT_DATA = {
  categories: ['写作助手', '编程开发', '翻译', '效率工具'],
  prompts: [
    { id: '1', title: '文章润色', content: '请帮我润色以下文章，使其更加专业、流畅，并修正其中的语法错误：\n', category: '写作助手' },
    { id: '2', title: '代码解释', content: '请帮我逐行解释以下代码的逻辑和功能：\n', category: '编程开发' },
    { id: '3', title: '语言翻译', content: '请将以下内容翻译成英文，要求表达地道，符合英语母语者的习惯：\n', category: '翻译' },
    { id: '4', title: '总结摘要', content: '请帮我提取以下文章的核心观点，并生成一份简短的摘要：\n', category: '效率工具' }
  ]
};
const DEFAULT_HISTORY_DATA = [];
const DEFAULT_MODEL_DATA = readBundledJsonFile(DEFAULT_MODEL_FILE, { currentModelId: '', models: [] });
const DEFAULT_AI_PORTAL_DATA = readBundledJsonFile(DEFAULT_AI_PORTAL_FILE, []);

const TARGET_SERVER_BASE = process.env.LLM_TARGET_BASE_URL || 'http://127.0.0.1:9080';

let mainWindow = null;
let proxyServer = null;
let proxyPort = null;

function initStoragePaths() {
  APP_DATA_DIR = app.getPath('userData');
  PROMPT_FILE = path.join(APP_DATA_DIR, 'prompt.json');
  HISTORY_FILE = path.join(APP_DATA_DIR, 'history.json');
  MODEL_FILE = path.join(APP_DATA_DIR, 'model.json');
  AI_PORTAL_FILE = path.join(APP_DATA_DIR, 'ai-portal.json');
}

async function ensureJsonFile(filePath, defaultValue) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
  } catch {
    await fs.promises.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
  }
}

async function readJsonFile(filePath, defaultValue) {
  await ensureJsonFile(filePath, defaultValue);
  try {
    const raw = await fs.promises.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed == null ? defaultValue : parsed;
  } catch (error) {
    console.error('[storage] read failed, reset to default:', filePath, error);
    await fs.promises.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
    return defaultValue;
  }
}

function readBundledJsonFile(filePath, defaultValue) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed == null ? defaultValue : parsed;
  } catch (error) {
    console.error('[storage] bundled default read failed, fallback to in-memory default:', filePath, error);
    return defaultValue;
  }
}

async function writeJsonFile(filePath, value) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');
}

async function initializeStorageFiles() {
  await Promise.all([
    ensureJsonFile(PROMPT_FILE, DEFAULT_PROMPT_DATA),
    ensureJsonFile(HISTORY_FILE, DEFAULT_HISTORY_DATA),
    ensureJsonFile(MODEL_FILE, DEFAULT_MODEL_DATA),
    ensureJsonFile(AI_PORTAL_FILE, DEFAULT_AI_PORTAL_DATA)
  ]);
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, anthropic-version');
}

function createProxyRequestHandler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: 'Invalid request url' }));
    return;
  }

  const localUrl = new URL(req.url, 'http://127.0.0.1');
  let targetUrl = null;
  if (localUrl.pathname.startsWith('/llmserver/')) {
    targetUrl = new URL(req.url.replace('/llmserver', ''), TARGET_SERVER_BASE);
  } else if (localUrl.pathname === '/proxy') {
    const target = localUrl.searchParams.get('target');
    if (!target) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Missing target parameter' }));
      return;
    }
    try {
      targetUrl = new URL(target);
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Invalid target url', error: error.message }));
      return;
    }
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Unsupported target protocol' }));
      return;
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: 'Not found' }));
    return;
  }

  const requestClient = targetUrl.protocol === 'https:' ? https : http;
  const headers = { ...req.headers };
  delete headers.host;

  const proxyReq = requestClient.request(
    targetUrl,
    {
      method: req.method,
      headers
    },
    (proxyRes) => {
      const responseHeaders = {
        ...proxyRes.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, anthropic-version'
      };
      res.writeHead(proxyRes.statusCode || 500, responseHeaders);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (error) => {
    console.error('[proxy] request failed:', error);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    }
    res.end(JSON.stringify({ message: 'Proxy request failed', error: error.message }));
  });

  req.pipe(proxyReq);
}

function startProxyServer() {
  return new Promise((resolve, reject) => {
    proxyServer = http.createServer(createProxyRequestHandler);
    proxyServer.on('error', reject);
    proxyServer.listen(0, '127.0.0.1', () => {
      const address = proxyServer.address();
      proxyPort = address && typeof address === 'object' ? address.port : null;
      console.log(`[proxy] started at http://127.0.0.1:${proxyPort}, target=${TARGET_SERVER_BASE}`);
      resolve();
    });
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  mainWindow.loadFile(indexPath);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupIpcHandlers() {
  ipcMain.handle('proxy:getBaseUrl', () => {
    return proxyPort ? `http://127.0.0.1:${proxyPort}` : '';
  });

  ipcMain.handle('storage:read', async (_event, type) => {
    if (type === 'prompt') {
      return await readJsonFile(PROMPT_FILE, DEFAULT_PROMPT_DATA);
    }
    if (type === 'history') {
      return await readJsonFile(HISTORY_FILE, DEFAULT_HISTORY_DATA);
    }
    if (type === 'model') {
      return await readJsonFile(MODEL_FILE, DEFAULT_MODEL_DATA);
    }
    if (type === 'aiPortal') {
      return await readJsonFile(AI_PORTAL_FILE, DEFAULT_AI_PORTAL_DATA);
    }
    throw new Error(`Unknown storage type: ${type}`);
  });

  ipcMain.handle('storage:write', async (_event, type, payload) => {
    if (type === 'prompt') {
      await writeJsonFile(PROMPT_FILE, payload || DEFAULT_PROMPT_DATA);
      return true;
    }
    if (type === 'history') {
      await writeJsonFile(HISTORY_FILE, Array.isArray(payload) ? payload : DEFAULT_HISTORY_DATA);
      return true;
    }
    if (type === 'model') {
      const normalized = payload && typeof payload === 'object' ? payload : DEFAULT_MODEL_DATA;
      await writeJsonFile(MODEL_FILE, normalized);
      return true;
    }
    if (type === 'aiPortal') {
      const normalized = Array.isArray(payload) ? payload : DEFAULT_AI_PORTAL_DATA;
      await writeJsonFile(AI_PORTAL_FILE, normalized);
      return true;
    }
    throw new Error(`Unknown storage type: ${type}`);
  });
}

app.whenReady().then(async () => {
  initStoragePaths();
  await initializeStorageFiles();
  setupIpcHandlers();
  await startProxyServer();
  createMainWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (proxyServer) {
    proxyServer.close();
    proxyServer = null;
  }
});

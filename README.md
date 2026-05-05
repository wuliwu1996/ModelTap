# ModelTap

ModelTap 是一个基于 Vue 2 和 Electron 的大模型对话桌面客户端。项目提供类似 ChatGPT 的对话界面，并内置模型配置、提示词管理、附件解析、会话历史、本地代理和 AI 站点导航等能力，适合把多个大模型服务统一到一个轻量桌面入口中使用。

## 功能特性

- 多模型切换：支持维护多个模型配置，可配置供应商、协议、API 地址、鉴权方式、模型名、流式输出、温度、Top P、最大 token 和扩展请求体。
- 双协议适配：内置 OpenAI Chat Completions 兼容协议和 Anthropic Messages 协议的请求/流式响应处理。
- 本地代理：Electron 主进程启动 `127.0.0.1` 本地代理，用于转发 `/llmserver/*` 和指定目标 URL，降低前端跨域接入成本。
- 会话历史：按对话保存历史记录，支持新建、切换、删除对话。
- 提示词库：支持提示词分类、增删改、选择填充，常用提示可沉淀为可复用模板。
- 附件解析：支持上传并解析 `.docx`、`.pdf`、`.xls`、`.xlsx`、`.csv`，将解析内容拼接进用户问题。
- AI 首页：内置常见国内外 AI 工具入口，支持编辑、自定义和持久化。
- 桌面持久化：Electron 环境下使用用户数据目录保存 `prompt.json`、`history.json`、`model.json`、`ai-portal.json`；浏览器开发环境会降级到 `localStorage`。
- 深色模式：支持浅色/深色主题切换。

## 技术栈

- Vue 2 + Vue CLI
- Electron 34
- Tailwind CSS
- electron-builder
- markdown-it + DOMPurify
- mammoth、pdfjs-dist、xlsx

## 目录结构

```text
.
├── build/                     # Electron 打包图标
├── docs/                      # 打包说明文档
├── electron/
│   ├── defaults/              # AI 首页默认配置；模型默认配置仅本地保存
│   ├── main.js                # Electron 主进程、本地代理、文件存储
│   └── preload.js             # 安全暴露给渲染进程的 IPC API
├── public/                    # Vue 静态入口
├── src/
│   ├── App.vue                # 主界面与核心业务逻辑
│   ├── components/            # 模型配置、提示词弹窗等组件
│   ├── utils/                 # API URL 和流式响应工具
│   └── index.css              # Tailwind 与全局样式
├── package.json
└── vue.config.js
```

## 环境要求

- Node.js 18 或更高版本
- npm

## 安装依赖

```bash
npm install
```

## 开发运行

启动 Web 开发服务：

```bash
npm run serve
```

构建前端并以 Electron 方式启动：

```bash
npm run electron:start
```

## 构建

构建 Web 产物：

```bash
npm run build
```

打包 Windows NSIS 安装包：

```bash
npm run build:electron
```

打包 macOS DMG/ZIP：

```bash
npm run build:electron:mac
```

只生成未安装的 Electron 目录包：

```bash
npm run pack:electron
```

构建输出目录：

- `dist/`：Vue 前端构建产物
- `release/`：electron-builder 桌面应用产物

这两个目录已在 `.gitignore` 中忽略。

## 模型配置

模型默认配置是本地私有文件，不随仓库分发：

```text
electron/defaults/model.json
```

该文件已加入 `.gitignore`，用于在本地保存 API Key、服务地址、默认模型等敏感配置。运行后，Electron 会把本地默认配置复制到当前用户数据目录下的 `model.json`；之后用户在界面中修改的模型配置会写入用户数据目录，不会直接改动仓库里的本地默认文件。

如果首次拉取仓库后没有这个文件，应用仍可启动，模型列表会使用空配置。可以在界面中新增模型，或在本地自行创建 `electron/defaults/model.json`。

模型配置字段包括：

- `provider`：供应商名称
- `protocol`：`openai` 或 `anthropic`
- `authMode`：`bearer` 或 `raw`
- `apiUrl`：模型接口地址
- `apiKey`：接口密钥
- `model`：实际请求的模型名
- `stream`：是否启用流式响应
- `maxTokens`、`temperature`、`topP`
- `extraBody`：额外请求参数

> 不要把 `electron/defaults/model.json` 提交到 GitHub。若密钥曾经推送到公开仓库，请立即轮换或作废对应密钥，并根据需要清理 Git 历史。

## 本地代理

Electron 主进程会启动一个随机端口的本地 HTTP 代理，并通过 preload 暴露给渲染进程。

默认服务地址由 `LLM_TARGET_BASE_URL` 控制：

```bash
LLM_TARGET_BASE_URL=http://your-server:9080 npm run electron:start
```

未设置时会使用代码中的默认地址。代理支持：

- `/llmserver/*`：转发到 `LLM_TARGET_BASE_URL`
- `/proxy?target=...`：转发到指定 HTTP/HTTPS 目标地址

## 数据存储

Electron 环境下，数据保存在系统用户数据目录：

- `prompt.json`
- `history.json`
- `model.json`
- `ai-portal.json`

非 Electron 环境下，数据会写入浏览器 `localStorage`，便于 Web 模式调试。

## 代码检查

```bash
npm run lint
```

## 注意事项

- `node_modules/`、`dist/`、`release/` 和 `*.zip` 不提交到 Git。
- 当前构建可能产生 webpack 体积警告，主要来自依赖包较大；如需优化，可进一步做代码分割和按需加载。
- Windows 打包配置见 `package.json` 的 `build.nsis`，补充说明见 `docs/electron-builder-nsis-notes.md`。

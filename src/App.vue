<template>
  <div class="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors">
    <!-- Sidebar -->
    <aside class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-[transform,margin-left] duration-300 z-[1000] shrink-0" :class="{ '-ml-64': !isSidebarOpen }">
      <div class="p-4 pr-0 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50">
        <button class="flex items-center justify-center flex-1 gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-xl cursor-pointer text-sm text-gray-700 dark:text-gray-200 transition-colors" @click="createNewChat">
          <span class="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.375 2.625a1.5 1.5 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
            </svg>
          </span>
          开始新聊天
        </button>
        <button class="ml-2 bg-transparent border-none cursor-pointer p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all" @click="toggleSidebar">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="4.5" ry="4.5"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-3">
        <div class="flex flex-col">
          <div class="text-xs text-gray-400 dark:text-gray-500 mx-2 mt-3 mb-2">历史对话</div>
          <div v-for="chat in chatHistory" :key="chat.id" class="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer mb-1 transition-colors text-sm text-gray-700 dark:text-gray-300 group hover:bg-gray-100 dark:hover:bg-gray-700/50" :class="{ 'bg-indigo-50 !text-blue-700 font-medium dark:bg-blue-900/20 dark:!text-blue-400': chat.id === currentChatId }" @click="selectChat(chat.id)">
            <div class="flex-1 min-w-0 flex flex-col gap-0.5">
              <span class="whitespace-nowrap overflow-hidden text-ellipsis">{{ chat.title }}</span>
              <span class="text-xs scale-90 origin-left text-gray-400 dark:text-gray-500">{{ formatHistoryTime(chat.updatedAt || chat.createdAt) }}</span>
            </div>
            <button class="bg-transparent border-none text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 cursor-pointer p-1 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" @click.stop="deleteChat(chat.id)" title="删除对话">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div id="app" class="flex-1 flex flex-col bg-white dark:bg-gray-900 relative min-w-0" :class="{ 'justify-center items-center': messages.filter(m => m.role !== 'system').length === 0 }">
      <!-- Top header when sidebar is hidden -->
      <div v-if="!isSidebarOpen" class="absolute top-4 left-4 z-[101] flex items-center gap-1 h-9 px-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm">
        <button class="bg-transparent border-none cursor-pointer w-7 h-7 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-all shrink-0" @click="createNewChat" title="开始新聊天">
          <span class="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.375 2.625a1.5 1.5 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
            </svg>
          </span>
        </button>
        <button class="bg-transparent border-none cursor-pointer w-7 h-7 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-all shrink-0" @click="toggleSidebar" title="展开侧边栏">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="4.5" ry="4.5"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </button>
      </div>

      <!-- Model Switcher (Top Left) -->
      <div
        v-if="showModelSwitcher"
        class="absolute top-4 z-[100] flex items-center gap-2"
        :class="!isSidebarOpen ? 'left-24' : 'left-5'"
      >
        <select class="h-9 px-3 pr-8 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-gray-100 outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_0.75rem_top_50%] bg-[length:0.625rem_auto] transition-all hover:bg-white dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/15" style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');" v-model="currentModelId" @change="onModelChange">
          <option v-for="model in models" :key="model.id" :value="model.id">{{ model.name }}</option>
        </select>
        <button class="h-9 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 rounded-xl text-sm font-medium cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/15" @click="openModelModal">配置模型</button>
      </div>

      <!-- Top Right Actions -->
      <div class="absolute top-4 right-5 z-[100] flex items-center gap-2" v-if="showModelSwitcher">
        <button class="h-9 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 rounded-xl text-sm font-medium cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/15" @click="openAiPortalModal">AI首页</button>
        <button class="bg-transparent border-none cursor-pointer p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all" @click="toggleDarkMode" :title="isDarkMode ? '切换到浅色模式' : '切换到深色模式'">
          <svg v-if="!isDarkMode" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>

      <main class="flex-1 overflow-y-auto flex flex-col px-5 pb-56 relative scroll-smooth transition-[padding-bottom] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] w-full" :class="messages.filter(m => m.role !== 'system').length === 0 ? 'flex-none overflow-visible p-0 pt-0 !pb-0 justify-center h-auto mt-[-10vh]' : 'pt-24'" ref="chatMain">
        <div v-if="messages.filter(m => m.role !== 'system').length === 0" class="flex flex-col items-center justify-center text-center pb-4">
          <div class="flex items-center justify-center gap-3">
            <!-- <div class="w-12 h-12 shrink-0 rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800 overflow-hidden flex items-center justify-center shadow-sm animate-[float_3s_ease-in-out_infinite]">
              <img src="./assets/bot-avatar.png" alt="Bot Avatar" class="w-full h-auto self-center mt-[22%]" />
            </div> -->
            <h1 class="welcome-title anime-fade-in !mb-0">{{ currentModel.name }}，我们先从哪里开始呢？</h1>
          </div>
          <!-- <p class="text-sm text-gray-600 dark:text-gray-400 max-w-[600px] leading-relaxed animate-[slideUp_1s_ease-out]">{{ currentModel.description }}</p> -->
        </div>

        <div v-else class="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-5">
          <template v-for="(msg, index) in messages">
            <div v-if="msg.role !== 'system'" :key="index" class="flex gap-4" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
            <!-- <div class="w-12 h-12 shrink-0 rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800 overflow-hidden flex items-center justify-center shadow-sm">
              <img v-if="msg.role === 'assistant'" src="./assets/bot-avatar.png" alt="Bot" class="w-full h-auto self-center mt-[22%]" />
              <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="currentColor" class="text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 rounded-full p-1">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div> -->
            <div class="max-w-[calc(100%-5rem)] flex flex-col min-w-0 w-full" :class="msg.role === 'user' ? 'items-end ml-auto' : 'items-start mr-auto'">
              <div v-if="msg.role === 'user'" class="flex flex-col items-end max-w-full gap-2">
                <div class="bg-transparent rounded-none shadow-none max-w-full flex flex-col items-end min-w-[7.5rem]">
                  <div class="flex flex-row items-center gap-3 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100">
                    <button class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer flex items-center gap-1 text-xs p-1.5 rounded-md transition-all shadow-sm hover:bg-gray-50 hover:text-blue-500 dark:hover:bg-gray-700" @click="editMessage(msg.content)" title="编辑">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer flex items-center gap-1 text-xs p-1.5 rounded-md transition-all shadow-sm hover:bg-gray-50 hover:text-blue-500 dark:hover:bg-gray-700" @click="copyText(msg.content, $event)" title="复制">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                  </div>
                  <div class="bg-blue-50 text-gray-800 dark:bg-blue-900/30 dark:text-gray-200 px-4 py-3 rounded-2xl text-[15px] leading-relaxed break-words whitespace-pre-wrap max-w-full shadow-sm">{{ msg.content }}</div>
                </div>
              </div>
              <div v-else class="flex flex-col items-start max-w-full group">
                <div class="bg-transparent rounded-none shadow-none max-w-full flex flex-col">
                  <div class="prose dark:prose-invert max-w-none py-2 px-0 text-[15px] leading-relaxed break-words overflow-x-auto" v-html="renderMarkdown(msg.content)"></div>
                  <div class="opacity-100 pt-0.5 border-none flex justify-between items-center bg-transparent rounded-b-none mt-1">
                    <button class="bg-transparent border-none shadow-none px-2 py-1 text-gray-500 dark:text-gray-400 cursor-pointer flex items-center gap-1 text-xs rounded-md transition-all hover:bg-gray-100 dark:hover:bg-gray-800" @click="copyText(msg.content, $event)" title="复制">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      <span>复制</span>
                    </button>
                    <span class="text-xs text-gray-400 dark:text-gray-500" v-if="msg.time">{{ msg.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </template>
          <!-- Loading state -->
          <div v-if="isGenerating" class="flex gap-4">
             <!-- <div class="w-12 h-12 shrink-0 rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800 overflow-hidden flex items-center justify-center shadow-sm">
              <img src="./assets/bot-avatar.png" alt="Bot" class="w-full h-auto self-center mt-[22%]" />
            </div> -->
            <div class="max-w-[calc(100%-5rem)] flex flex-col min-w-0 w-full items-start mr-auto">
              <div class="flex flex-col items-start max-w-full">
                <div class="bg-transparent rounded-none shadow-none max-w-full flex flex-col min-w-[7.5rem]">
                  <div class="prose dark:prose-invert max-w-none py-2 px-0 text-[15px] leading-relaxed break-words overflow-x-auto">
                    <span v-if="currentStreamText" v-html="renderMarkdown(currentStreamText)"></span>
                    <span v-else class="text-gray-500 dark:text-gray-400 italic animate-pulse">思考中...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Input Area -->
      <footer class="w-full flex flex-col items-center absolute left-0 right-0 bottom-0 z-[120] px-5 pb-5 pt-2.5 bg-white dark:bg-gray-900 transition-[transform] duration-[0.45s] ease-[cubic-bezier(0.22,1,0.36,1)]"
              :class="messages.filter(m => m.role !== 'system').length === 0 ? '!static bottom-auto transform-none bg-transparent pt-3.5 w-full max-w-4xl' : 'translate-y-0'">
        <div v-if="uploadedFiles.length > 0" class="w-full flex flex-wrap gap-2 mb-2 max-w-4xl">
          <div
            v-for="file in uploadedFiles"
            :key="file.id"
            class="flex items-center gap-2 min-w-[11rem] max-w-xs bg-white dark:bg-gray-800 border rounded-xl py-2 px-2.5"
            :class="file.status === 'parsing' ? 'border-blue-300 dark:border-blue-700' : file.status === 'error' ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'"
          >
            <svg class="text-blue-500 shrink-0" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <div class="min-w-0 flex-1">
              <div class="text-[13px] text-gray-900 dark:text-gray-100 whitespace-nowrap overflow-hidden text-ellipsis" :title="file.name">{{ file.name }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ getAttachmentSubtext(file) }}</div>
              <div v-if="file.status === 'parsing'" class="mt-1.5 w-full h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div class="h-full bg-blue-500 rounded-full transition-[width] duration-200 ease-out" :style="{ width: `${getFileProgressValue(file)}%` }"></div>
              </div>
            </div>
            <button class="bg-transparent border-none text-gray-500 dark:text-gray-400 cursor-pointer flex items-center justify-center rounded-lg w-6 h-6 shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400 transition-colors" @click="removeUploadedFile(file.id)" title="删除文件">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="flex flex-col items-stretch bg-white dark:bg-gray-800 rounded-3xl py-2.5 px-3 w-full shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] gap-1.5 border border-black/10 dark:border-white/10 max-w-4xl">
          <textarea 
            class="w-full border-none outline-none resize-none bg-transparent p-2 text-[15px] leading-relaxed min-h-[5rem] max-h-48 font-inherit text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            v-model="inputText" 
            @keydown.enter.prevent="sendMessage"
            placeholder="请输入您想咨询的问题" 
            rows="3"
            ref="textarea"
            @input="resizeTextarea"
          ></textarea>
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <button class="bg-transparent border-none cursor-pointer flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 w-9 h-9 p-0 shrink-0 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400" @click="showPromptModal = true" title="常用提示词">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <line x1="9" y1="10" x2="15" y2="10"></line>
                  <line x1="9" y1="14" x2="15" y2="14"></line>
                </svg>
              </button>
              <button class="bg-transparent border-none cursor-pointer flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 w-9 h-9 p-0 shrink-0 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400" @click="triggerFileUpload" title="上传附件">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.44 11.05l-8.49 8.49a6 6 0 1 1-8.49-8.49l8.49-8.49a4 4 0 1 1 5.66 5.66l-8.49 8.49a2 2 0 1 1-2.83-2.83l7.78-7.78"></path>
                </svg>
              </button>
              <input
                ref="fileInput"
                class="hidden"
                type="file"
                multiple
                accept=".docx,.pdf,.xls,.xlsx,.csv"
                @change="handleFileUpload"
              />
            </div>
            <button class="bg-blue-700 border-none cursor-pointer flex items-center justify-center rounded-full text-white w-9 h-9 p-0 shrink-0 transition-[background,transform] duration-200 hover:not(:disabled):bg-blue-900 hover:not(:disabled):scale-105 disabled:bg-blue-300 disabled:cursor-not-allowed" :disabled="!canSendMessage" @click="sendMessage">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </div>

    <ModelConfigModal
      :show="showModelModal"
      :models="models"
      :editing-model-data="editingModelData"
      :provider-options="providerOptions"
      :model-form-error="modelFormError"
      :is-saving-model="isSavingModel"
      :show-api-key="showApiKey"
      @close="closeModelModal"
      @create-model="createModelConfig"
      @edit-model="editModelConfig"
      @delete-model="deleteModelConfig"
      @save-model="saveModelConfig"
      @provider-change="onProviderChange"
      @toggle-api-key-visibility="toggleApiKeyVisibility"
      @update-model-field="updateModelField"
    />

    <PromptModal
      :show="showPromptModal"
      :categories="categories"
      :current-prompt-category="currentPromptCategory"
      :category-editor="categoryEditor"
      :is-editing-prompt="isEditingPrompt"
      :editing-prompt-data="editingPromptData"
      :filtered-prompts="filteredPrompts"
      @close="closePromptModal"
      @update-current-category="currentPromptCategory = $event"
      @add-category="addCategory"
      @edit-category="editCategory"
      @delete-category="deleteCategory"
      @close-category-editor="closeCategoryEditor"
      @update-category-editor-name="updateCategoryEditorName"
      @submit-category-editor="submitCategoryEditor"
      @add-new-prompt="addNewPrompt"
      @cancel-edit-prompt="isEditingPrompt = false"
      @save-edit-prompt="saveEditPrompt"
      @update-prompt-field="updatePromptField"
      @select-prompt="selectPrompt"
      @edit-prompt="editPrompt"
      @delete-prompt="deletePrompt"
    />

    <div v-if="showAiPortalModal" class="fixed inset-0 bg-black/50 z-[2800] flex items-center justify-center backdrop-blur-sm" @click.self="closeAiPortalModal">
      <div class="bg-white dark:bg-gray-800 rounded-2xl w-[58rem] max-w-[94vw] max-h-[88vh] flex flex-col shadow-xl overflow-hidden animate-[modal-pop_0.3s_ease-out]">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center gap-3">
          <div class="min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">AI 首页集成</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">点击可直达各大 AI 首页，可编辑名称、链接和备注</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" @click="toggleAiPortalEditMode">
              {{ isAiPortalEditMode ? '取消编辑' : '编辑列表' }}
            </button>
            <button class="bg-transparent border-none text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 cursor-pointer rounded-lg p-1 flex items-center justify-center transition-all" @click="closeAiPortalModal">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section class="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">国内</h4>
              <button v-if="isAiPortalEditMode" class="px-2 py-1 text-xs rounded-md border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" @click="addCustomAiItem('国内')">新增自定义</button>
            </div>
            <div class="space-y-2.5">
              <div v-for="item in domesticAiItems" :key="item.id" class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/60 dark:bg-gray-800/50">
                <template v-if="isAiPortalEditMode">
                  <div class="grid grid-cols-1 gap-2">
                    <input class="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/15" :value="item.name" @input="updateAiItemField({ id: item.id, field: 'name', value: $event.target.value })" placeholder="名称" />
                    <input class="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/15" :value="item.url" @input="updateAiItemField({ id: item.id, field: 'url', value: $event.target.value })" placeholder="链接" />
                    <input class="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/15" :value="item.info" @input="updateAiItemField({ id: item.id, field: 'info', value: $event.target.value })" placeholder="备注信息（可选）" />
                    <button v-if="!item.isBuiltin" class="self-end px-2 py-1 rounded-md text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30" @click="removeAiItem(item.id)">删除</button>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ item.name }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 break-all mt-0.5">{{ item.url }}</div>
                      <div v-if="item.info" class="text-xs text-gray-600 dark:text-gray-300 mt-1">{{ item.info }}</div>
                    </div>
                    <button class="px-2.5 py-1.5 shrink-0 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors" @click="openAiHome(item.url)">打开</button>
                  </div>
                </template>
              </div>
            </div>
          </section>
          <section class="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">国外</h4>
              <button v-if="isAiPortalEditMode" class="px-2 py-1 text-xs rounded-md border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" @click="addCustomAiItem('国外')">新增自定义</button>
            </div>
            <div class="space-y-2.5">
              <div v-for="item in overseasAiItems" :key="item.id" class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/60 dark:bg-gray-800/50">
                <template v-if="isAiPortalEditMode">
                  <div class="grid grid-cols-1 gap-2">
                    <input class="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/15" :value="item.name" @input="updateAiItemField({ id: item.id, field: 'name', value: $event.target.value })" placeholder="名称" />
                    <input class="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/15" :value="item.url" @input="updateAiItemField({ id: item.id, field: 'url', value: $event.target.value })" placeholder="链接" />
                    <input class="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/15" :value="item.info" @input="updateAiItemField({ id: item.id, field: 'info', value: $event.target.value })" placeholder="备注信息（可选）" />
                    <button v-if="!item.isBuiltin" class="self-end px-2 py-1 rounded-md text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30" @click="removeAiItem(item.id)">删除</button>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ item.name }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 break-all mt-0.5">{{ item.url }}</div>
                      <div v-if="item.info" class="text-xs text-gray-600 dark:text-gray-300 mt-1">{{ item.info }}</div>
                    </div>
                    <button class="px-2.5 py-1.5 shrink-0 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors" @click="openAiHome(item.url)">打开</button>
                  </div>
                </template>
              </div>
            </div>
          </section>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <p class="text-xs text-gray-500 dark:text-gray-400">内置条目包含你要求的 AI，支持补充与自定义修改。</p>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg dark:text-gray-300 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors" @click="closeAiPortalModal">关闭</button>
            <button v-if="isAiPortalEditMode" class="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors" @click="saveAiPortalConfig">保存配置</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast.message" class="fixed top-5 left-0 right-0 flex justify-center z-[9999] pointer-events-none px-4">
      <div class="px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-[slideUp_0.3s_ease-out]" :class="toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800' : 'bg-white text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'">
        {{ toast.message }}
      </div>
    </div>

    <div v-if="confirmDialog.visible" class="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center backdrop-blur-sm" @click.self="handleConfirmCancel">
      <div class="bg-white dark:bg-gray-800 rounded-2xl w-[25rem] max-w-[90vw] flex flex-col shadow-xl overflow-hidden animate-[modal-pop_0.3s_ease-out]">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ confirmDialog.title }}</h3>
          <button class="bg-transparent border-none text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 cursor-pointer rounded-lg p-1 flex items-center justify-center transition-all" @click="handleConfirmCancel">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="p-6 text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">{{ confirmDialog.message }}</div>
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
          <button class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg dark:text-gray-300 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors" @click="handleConfirmCancel">取消</button>
          <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors" @click="handleConfirmOk">确定</button>
        </div>
      </div>
    </div>

    <div
      v-if="selectionActions.visible"
      class="fixed z-[3200] flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 shadow-lg backdrop-blur px-2 py-1"
      :style="{ top: `${selectionActions.top}px`, left: `${selectionActions.left}px` }"
      @mousedown.prevent
    >
      <button
        class="px-2 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        @click="copySelectionText"
      >复制</button>
      <button
        class="px-2 py-1 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
        @click="appendSelectionToInput"
      >添加到对话</button>
    </div>
  </div>
</template>

<script>
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import mammoth from 'mammoth/mammoth.browser';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';
import ModelConfigModal from './components/ModelConfigModal.vue';
import PromptModal from './components/PromptModal.vue';
import {
  buildModelId as makeModelId,
  getCurrentTime as formatCurrentTime,
  formatHistoryTime as formatChatHistoryTime,
  getFileExtension as getUploadFileExtension,
  formatFileSize as formatUploadFileSize,
  getFileProgressValue as normalizeFileProgress,
  getApiUrl as resolveApiUrl,
  buildProxyTargetUrl as resolveProxyTargetUrl,
  buildModelRequest as createModelRequest,
  buildHeaders as createModelHeaders,
  extractAnthropicEventData as parseAnthropicEventData
} from './utils/appUtils';

const md = new MarkdownIt({
  breaks: true,
  linkify: true
});

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const PROVIDER_MAP = {
  DeepSeek: { apiUrl: 'https://api.deepseek.com/v1/chat/completions', protocol: 'openai' },
  Qwen: { apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', protocol: 'openai' },
  Kimi: { apiUrl: 'https://api.moonshot.cn/v1/chat/completions', protocol: 'openai' },
  GLM: { apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', protocol: 'openai' },
  Anthropic: { apiUrl: 'https://api.anthropic.com/v1/messages', protocol: 'anthropic' },
  OpenAI: { apiUrl: 'https://api.openai.com/v1/chat/completions', protocol: 'openai' },
  自定义: { apiUrl: '', protocol: 'openai' }
};

const PROVIDER_OPTIONS = [
  { label: 'DeepSeek', value: 'DeepSeek' },
  { label: 'Qwen', value: 'Qwen' },
  { label: 'Kimi', value: 'Kimi' },
  { label: 'GLM', value: 'GLM' },
  { label: 'Anthropic', value: 'Anthropic' },
  { label: 'OpenAI', value: 'OpenAI' },
  { label: '自定义', value: '自定义' }
];

const AI_PORTAL_STORAGE_KEY = 'llm_wenda_ai_portal';

const DEFAULT_AI_PORTAL_ITEMS = [
  { id: 'cn_deepseek', name: 'DeepSeek', url: 'https://chat.deepseek.com/', info: '深度思考与通用问答', region: '国内', isBuiltin: true, order: 1 },
  { id: 'cn_qwen', name: '千问', url: 'https://chat.qwen.ai/', info: '阿里通义千问', region: '国内', isBuiltin: true, order: 2 },
  { id: 'cn_minimax', name: 'MiniMax', url: 'https://agent.minimaxi.com/', info: '支持 Agent 与多任务助手', region: '国内', isBuiltin: true, order: 3 },
  { id: 'cn_zai', name: 'Z.ai', url: 'https://chat.z.ai/', info: 'GLM 系列智能助手', region: '国内', isBuiltin: true, order: 4 },
  { id: 'cn_kimi', name: 'KIMI', url: 'https://www.kimi.com/', info: 'Moonshot 智能助手', region: '国内', isBuiltin: true, order: 5 },
  { id: 'cn_metaso', name: '秘塔AI', url: 'https://metaso.cn/', info: 'AI 搜索与研究', region: '国内', isBuiltin: true, order: 6 },
  { id: 'cn_doubao', name: '豆包', url: 'https://www.doubao.com/chat/', info: '字节系 AI 助手', region: '国内', isBuiltin: true, order: 7 },
  { id: 'cn_yiyan', name: '文心一言', url: 'https://yiyan.baidu.com/', info: '百度大模型对话助手', region: '国内', isBuiltin: true, order: 8 },
  { id: 'cn_chatglm', name: '智谱清言', url: 'https://chatglm.cn/', info: '智谱 AI 对话产品', region: '国内', isBuiltin: true, order: 9 },
  { id: 'global_chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/', info: 'OpenAI 对话助手', region: '国外', isBuiltin: true, order: 101 },
  { id: 'global_grok', name: 'Grok', url: 'https://grok.com/', info: 'xAI 智能助手', region: '国外', isBuiltin: true, order: 102 },
  { id: 'global_gemini', name: 'Gemini', url: 'https://gemini.google.com/app', info: 'Google AI 助手', region: '国外', isBuiltin: true, order: 103 },
  { id: 'global_claude', name: 'Claude', url: 'https://claude.ai/', info: 'Anthropic 智能助手', region: '国外', isBuiltin: true, order: 104 },
  { id: 'global_perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/', info: 'AI 搜索与问答', region: '国外', isBuiltin: true, order: 105 },
  { id: 'global_copilot', name: 'Copilot', url: 'https://copilot.microsoft.com/', info: 'Microsoft AI 助手', region: '国外', isBuiltin: true, order: 106 }
];

export default {
  name: 'App',
  components: {
    ModelConfigModal,
    PromptModal
  },
  data() {
    return {
      isDarkMode: false,
      // storageMode: "file" | "localStorage"
      // 默认使用更严谨的本地 JSON 持久化方案
      storageMode: 'file',
      proxyBaseUrl: '',
      showPromptModal: false,
      prompts: [],
      categories: [],
      currentPromptCategory: '全部',
      isEditingPrompt: false,
      editingPromptData: { id: null, title: '', content: '', category: '' },
      inputText: '',
      uploadedFiles: [],
      messages: [],
      isGenerating: false,
      currentStreamText: '',
      showModelSwitcher: true,
      currentModelId: '',
      chatHistory: [],
      currentChatId: null,
      isSidebarOpen: true,
      models: [],
      showModelModal: false,
      editingModelData: null,
      isSavingModel: false,
      modelFormError: '',
      showApiKey: false,
      providerOptions: PROVIDER_OPTIONS,
      showAiPortalModal: false,
      isAiPortalEditMode: false,
      aiPortalItems: [],
      toast: {
        message: '',
        type: 'success'
      },
      categoryEditor: {
        visible: false,
        mode: 'add',
        name: '',
        oldName: ''
      },
      confirmDialog: {
        visible: false,
        title: '请确认',
        message: '',
        resolver: null
      },
      selectionActions: {
        visible: false,
        text: '',
        top: 0,
        left: 0
      }
    };
  },
  computed: {
    currentModel() {
      return this.models.find(m => m.id === this.currentModelId) || this.models[0] || {
        id: '',
        name: '智能助手',
        description: '请选择或配置模型后开始对话'
      };
    },
    isElectronRuntime() {
      return typeof window !== 'undefined' && !!window.llmDesktop && window.llmDesktop.isElectron;
    },
    isUsingFileStorage() {
      return this.storageMode === 'file' && this.isElectronRuntime;
    },
    filteredPrompts() {
      if (this.currentPromptCategory === '全部') {
        return this.prompts;
      }
      return this.prompts.filter(p => p.category === this.currentPromptCategory);
    },
    parsedUploadedFiles() {
      return this.uploadedFiles.filter(file => file.status === 'ready' && file.content);
    },
    isParsingFiles() {
      return this.uploadedFiles.some(file => file.status === 'parsing');
    },
    canSendMessage() {
      return !!this.inputText.trim() && !this.isGenerating && !this.isParsingFiles;
    },
    domesticAiItems() {
      return this.aiPortalItems
        .filter(item => item.region === '国内')
        .sort((a, b) => (a.order || 9999) - (b.order || 9999));
    },
    overseasAiItems() {
      return this.aiPortalItems
        .filter(item => item.region === '国外')
        .sort((a, b) => (a.order || 9999) - (b.order || 9999));
    }
  },
  mounted() {
    this.initDarkMode();
    this.bootstrapApp();
    document.addEventListener('mouseup', this.handleDocumentMouseUp);
    document.addEventListener('selectionchange', this.handleSelectionChange);
    window.addEventListener('scroll', this.clearSelectionActions, true);
  },
  beforeDestroy() {
    if (this._toastTimer) {
      clearTimeout(this._toastTimer);
      this._toastTimer = null;
    }
    if (this.confirmDialog.resolver) {
      this.confirmDialog.resolver(false);
      this.confirmDialog.resolver = null;
    }
    document.removeEventListener('mouseup', this.handleDocumentMouseUp);
    document.removeEventListener('selectionchange', this.handleSelectionChange);
    window.removeEventListener('scroll', this.clearSelectionActions, true);
  },
  watch: {
    messages: {
      handler() {
        this.saveHistory().catch((error) => {
          console.error('saveHistory failed:', error);
        });
      },
      deep: true
    }
  },
  methods: {
    initDarkMode() {
      const isDark = localStorage.getItem('llm_wenda_dark_mode');
      if (isDark === '1') {
        this.isDarkMode = true;
        document.documentElement.classList.add('dark');
      } else if (isDark === '0') {
        this.isDarkMode = false;
        document.documentElement.classList.remove('dark');
      } else {
        // Optional: match system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.isDarkMode = true;
          document.documentElement.classList.add('dark');
        }
      }
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('llm_wenda_dark_mode', '1');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('llm_wenda_dark_mode', '0');
      }
    },
    async bootstrapApp() {
      await this.initRuntime();
      await this.loadAiPortalData();
      await this.loadModels();
      await this.loadCategories();
      await this.loadPrompts();
      this.loadSidebarState();
      await this.loadHistory();
      // Always create a new chat when opening the page
      this.createNewChat();
    },
    async initRuntime() {
      if (this.isElectronRuntime) {
        try {
          this.proxyBaseUrl = await window.llmDesktop.getProxyBaseUrl();
        } catch (error) {
          console.error('Failed to get proxy base url:', error);
        }
      } else if (this.storageMode === 'file') {
        console.warn('当前非 Electron 运行环境，file 存储将自动降级为 localStorage');
      }
    },
    getApiUrl() {
      return resolveApiUrl(this.proxyBaseUrl);
    },
    normalizeAiPortalItems(payload) {
      const incoming = Array.isArray(payload) ? payload : [];
      const incomingMap = incoming.reduce((acc, item) => {
        if (!item || typeof item !== 'object') return acc;
        const id = String(item.id || '').trim();
        if (!id) return acc;
        acc[id] = item;
        return acc;
      }, {});

      const normalizedBuiltin = DEFAULT_AI_PORTAL_ITEMS.map((base) => {
        const merged = incomingMap[base.id] ? { ...base, ...incomingMap[base.id] } : { ...base };
        return {
          ...merged,
          id: base.id,
          name: String(merged.name || base.name).trim() || base.name,
          url: this.normalizeAiUrl(String(merged.url || base.url)),
          info: String(merged.info || '').trim(),
          region: merged.region === '国外' ? '国外' : '国内',
          isBuiltin: true,
          order: Number.isFinite(Number(merged.order)) ? Number(merged.order) : base.order
        };
      });

      const customItems = incoming
        .filter(item => item && typeof item === 'object' && !DEFAULT_AI_PORTAL_ITEMS.some(base => base.id === String(item.id || '')))
        .map((item, index) => {
          const rawRegion = String(item.region || '国内').trim();
          return {
            id: String(item.id || `custom_${Date.now()}_${index}`),
            name: String(item.name || '').trim(),
            url: this.normalizeAiUrl(String(item.url || '')),
            info: String(item.info || '').trim(),
            region: rawRegion === '国外' ? '国外' : '国内',
            isBuiltin: false,
            order: Number.isFinite(Number(item.order)) ? Number(item.order) : 1000 + index
          };
        })
        .filter(item => item.name && item.url);

      return [...normalizedBuiltin, ...customItems];
    },
    normalizeAiUrl(rawUrl) {
      const value = String(rawUrl || '').trim();
      if (!value) return '';
      if (/^https?:\/\//i.test(value)) return value;
      return `https://${value}`;
    },
    async readAiPortalData() {
      if (this.isUsingFileStorage) {
        const payload = await window.llmDesktop.readAiPortal();
        return Array.isArray(payload) ? payload : [];
      }
      const raw = localStorage.getItem(AI_PORTAL_STORAGE_KEY);
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('readAiPortalData failed:', error);
        return [];
      }
    },
    async writeAiPortalData(payload) {
      const normalized = Array.isArray(payload) ? payload : [];
      if (this.isUsingFileStorage) {
        await window.llmDesktop.writeAiPortal(normalized);
        return;
      }
      localStorage.setItem(AI_PORTAL_STORAGE_KEY, JSON.stringify(normalized));
    },
    async loadAiPortalData() {
      try {
        const stored = await this.readAiPortalData();
        this.aiPortalItems = this.normalizeAiPortalItems(stored);
      } catch (error) {
        console.error('loadAiPortalData failed:', error);
        this.aiPortalItems = this.normalizeAiPortalItems(DEFAULT_AI_PORTAL_ITEMS);
      }
    },
    async persistAiPortalData() {
      await this.writeAiPortalData(this.aiPortalItems);
    },
    openAiPortalModal() {
      this.showAiPortalModal = true;
      this.isAiPortalEditMode = false;
    },
    async closeAiPortalModal() {
      if (this.isAiPortalEditMode) {
        await this.loadAiPortalData();
      }
      this.showAiPortalModal = false;
      this.isAiPortalEditMode = false;
      this.focusMainInputIfReady();
    },
    async toggleAiPortalEditMode() {
      if (!this.isAiPortalEditMode) {
        this.isAiPortalEditMode = true;
        return;
      }
      await this.loadAiPortalData();
      this.isAiPortalEditMode = false;
    },
    openAiHome(url) {
      const normalized = this.normalizeAiUrl(url);
      if (!normalized) {
        this.showToast('链接不能为空', 'error');
        return;
      }
      window.open(normalized, '_blank', 'noopener,noreferrer');
    },
    updateAiItemField(payload) {
      if (!payload || !payload.id || !payload.field) return;
      const index = this.aiPortalItems.findIndex(item => item.id === payload.id);
      if (index === -1) return;
      const next = { ...this.aiPortalItems[index] };
      next[payload.field] = String(payload.value || '');
      this.$set(this.aiPortalItems, index, next);
    },
    addCustomAiItem(region) {
      const safeRegion = region === '国外' ? '国外' : '国内';
      this.aiPortalItems.push({
        id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: '',
        url: '',
        info: '',
        region: safeRegion,
        isBuiltin: false,
        order: 1500 + this.aiPortalItems.length
      });
    },
    removeAiItem(itemId) {
      const target = this.aiPortalItems.find(item => item.id === itemId);
      if (!target) return;
      if (target.isBuiltin) {
        this.showToast('内置条目不能删除，可直接修改', 'error');
        return;
      }
      this.aiPortalItems = this.aiPortalItems.filter(item => item.id !== itemId);
    },
    async saveAiPortalConfig() {
      const invalid = this.aiPortalItems.find(item => !String(item.name || '').trim() || !String(item.url || '').trim());
      if (invalid) {
        this.showToast('请完整填写名称和链接后再保存', 'error');
        return;
      }
      this.aiPortalItems = this.aiPortalItems.map((item) => {
        const normalizedRegion = String(item.region || '').trim() === '国外' ? '国外' : '国内';
        return {
          ...item,
          name: String(item.name || '').trim(),
          url: this.normalizeAiUrl(item.url),
          info: String(item.info || '').trim(),
          region: normalizedRegion
        };
      });
      await this.persistAiPortalData();
      this.isAiPortalEditMode = false;
      this.showToast('AI 首页配置已保存', 'success');
    },
    getDefaultPromptData() {
      return {
        categories: ['写作助手', '编程开发', '翻译', '效率工具'],
        prompts: [
          { id: '1', title: '文章润色', content: '请帮我润色以下文章，使其更加专业、流畅，并修正其中的语法错误：\n', category: '写作助手' },
          { id: '2', title: '代码解释', content: '请帮我逐行解释以下代码的逻辑和功能：\n', category: '编程开发' },
          { id: '3', title: '语言翻译', content: '请将以下内容翻译成英文，要求表达地道，符合英语母语者的习惯：\n', category: '翻译' },
          { id: '4', title: '总结摘要', content: '请帮我提取以下文章的核心观点，并生成一份简短的摘要：\n', category: '效率工具' }
        ]
      };
    },
    normalizePromptData(data) {
      const defaults = this.getDefaultPromptData();
      const normalized = data && typeof data === 'object' ? data : {};
      return {
        categories: Array.isArray(normalized.categories) ? normalized.categories : defaults.categories,
        prompts: Array.isArray(normalized.prompts) ? normalized.prompts : defaults.prompts
      };
    },
    async readPromptData() {
      if (this.isUsingFileStorage) {
        const payload = await window.llmDesktop.readPrompts();
        return this.normalizePromptData(payload);
      }
      const categoriesRaw = localStorage.getItem('llm_wenda_categories');
      const promptsRaw = localStorage.getItem('llm_wenda_prompts');
      let categories = [];
      let prompts = [];
      try {
        categories = categoriesRaw ? JSON.parse(categoriesRaw) : [];
      } catch (error) {
        console.error(error);
      }
      try {
        prompts = promptsRaw ? JSON.parse(promptsRaw) : [];
      } catch (error) {
        console.error(error);
      }
      return this.normalizePromptData({ categories, prompts });
    },
    async writePromptData(payload) {
      const normalized = this.normalizePromptData(payload);
      if (this.isUsingFileStorage) {
        await window.llmDesktop.writePrompts(normalized);
        return;
      }
      localStorage.setItem('llm_wenda_categories', JSON.stringify(normalized.categories));
      localStorage.setItem('llm_wenda_prompts', JSON.stringify(normalized.prompts));
    },
    async readHistoryData() {
      if (this.isUsingFileStorage) {
        const payload = await window.llmDesktop.readHistory();
        return Array.isArray(payload) ? payload : [];
      }
      const saved = localStorage.getItem('llm_wenda_chat_history');
      if (!saved) {
        return [];
      }
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    async writeHistoryData(payload) {
      const normalized = Array.isArray(payload) ? payload : [];
      if (this.isUsingFileStorage) {
        await window.llmDesktop.writeHistory(normalized);
        return;
      }
      localStorage.setItem('llm_wenda_chat_history', JSON.stringify(normalized));
    },
    getDefaultModelData() {
      return {
        currentModelId: '',
        models: []
      };
    },
    normalizeModelItem(model, index = 0) {
      const safe = model && typeof model === 'object' ? model : {};
      const generatedId = safe.id || `model_${Date.now()}_${index}`;
      const rawExtraBody = safe.extraBody && typeof safe.extraBody === 'object' && !Array.isArray(safe.extraBody)
        ? safe.extraBody
        : {};
      const provider = String(safe.provider || '自定义');
      const normalizedProvider = PROVIDER_MAP[provider] ? provider : '自定义';
      return {
        id: generatedId,
        name: String(safe.name || generatedId),
        description: String(safe.description || ''),
        provider: normalizedProvider,
        protocol: safe.protocol === 'anthropic' ? 'anthropic' : 'openai',
        authMode: safe.authMode === 'raw' ? 'raw' : 'bearer',
        apiUrl: String(safe.apiUrl || ''),
        apiKey: String(safe.apiKey || ''),
        model: String(safe.model || ''),
        stream: safe.stream !== false,
        maxTokens: Number.isFinite(Number(safe.maxTokens)) ? Number(safe.maxTokens) : 4096,
        temperature: Number.isFinite(Number(safe.temperature)) ? Number(safe.temperature) : 0.7,
        topP: Number.isFinite(Number(safe.topP)) ? Number(safe.topP) : 1,
        extraBody: { ...rawExtraBody }
      };
    },
    normalizeModelData(data) {
      const defaults = this.getDefaultModelData();
      const normalized = data && typeof data === 'object' ? data : {};
      const models = Array.isArray(normalized.models) && normalized.models.length > 0
        ? normalized.models.map((item, index) => this.normalizeModelItem(item, index))
        : defaults.models.map((item, index) => this.normalizeModelItem(item, index));
      let currentModelId = '';
      if (models.length > 0) {
        currentModelId = models.some(item => item.id === normalized.currentModelId)
          ? normalized.currentModelId
          : models[0].id;
      }
      return { currentModelId, models };
    },
    async readModelData() {
      if (this.isUsingFileStorage) {
        const payload = await window.llmDesktop.readModels();
        return this.normalizeModelData(payload);
      }
      const raw = localStorage.getItem('llm_wenda_models');
      if (!raw) {
        return this.normalizeModelData(null);
      }
      try {
        return this.normalizeModelData(JSON.parse(raw));
      } catch (error) {
        console.error(error);
        return this.normalizeModelData(null);
      }
    },
    async writeModelData(payload) {
      const normalized = this.normalizeModelData(payload);
      if (this.isUsingFileStorage) {
        await window.llmDesktop.writeModels(normalized);
        return;
      }
      localStorage.setItem('llm_wenda_models', JSON.stringify(normalized));
    },
    async loadModels() {
      const payload = await this.readModelData();
      this.models = payload.models;
      this.currentModelId = payload.currentModelId;
      this.editingModelData = this.cloneModel(payload.models[0] || this.emptyModelConfig());
    },
    cloneModel(model) {
      return {
        ...this.normalizeModelItem(model || {})
      };
    },
    emptyModelConfig() {
      return {
        id: '',
        name: '',
        description: '',
        provider: '自定义',
        protocol: 'openai',
        authMode: 'bearer',
        apiUrl: '',
        apiKey: '',
        model: '',
        stream: true,
        maxTokens: 4096,
        temperature: 0.7,
        topP: 1,
        extraBody: {}
      };
    },
    async persistModelState() {
      await this.writeModelData({
        currentModelId: this.currentModelId,
        models: this.models
      });
    },
    onModelChange() {
      this.persistModelState().catch((error) => {
        console.error('persistModelState failed:', error);
      });
    },
    openModelModal() {
      if (!this.editingModelData) {
        this.editingModelData = this.cloneModel(this.models[0] || this.emptyModelConfig());
      }
      this.modelFormError = '';
      this.showApiKey = false;
      this.showModelModal = true;
    },
    closeModelModal() {
      this.showModelModal = false;
      this.focusMainInputIfReady();
    },
    closePromptModal() {
      this.showPromptModal = false;
      this.isEditingPrompt = false;
      this.closeCategoryEditor();
      this.focusMainInputIfReady();
    },
    focusMainInputIfReady() {
      this.$nextTick(() => {
        if (this.showPromptModal || this.showModelModal || this.confirmDialog.visible) return;
        if (!this.$refs.textarea) return;
        this.$refs.textarea.focus();
        this.resizeTextarea();
      });
    },
    createModelConfig() {
      this.modelFormError = '';
      this.showApiKey = false;
      this.editingModelData = this.emptyModelConfig();
    },
    editModelConfig(item) {
      this.modelFormError = '';
      this.showApiKey = false;
      this.editingModelData = this.cloneModel(item);
    },
    onProviderChange() {
      if (!this.editingModelData) return;
      const provider = String(this.editingModelData.provider || '自定义');
      const config = PROVIDER_MAP[provider];
      if (!config) return;
      if (provider === '自定义') {
        this.editingModelData.apiUrl = '';
      } else {
        this.editingModelData.apiUrl = config.apiUrl;
      }
      this.editingModelData.protocol = config.protocol === 'anthropic' ? 'anthropic' : 'openai';
    },
    toggleApiKeyVisibility() {
      this.showApiKey = !this.showApiKey;
    },
    updateModelField(payload) {
      if (!payload || !this.editingModelData) return;
      const { field, value } = payload;
      if (!field) return;
      this.$set(this.editingModelData, field, value);
    },
    buildModelId(name) {
      return makeModelId(name);
    },
    async saveModelConfig() {
      if (!this.editingModelData || this.isSavingModel) return;
      this.modelFormError = '';
      const form = this.editingModelData;
      if (!String(form.name || '').trim()) {
        this.modelFormError = '模型显示名称不能为空';
        return;
      }
      if (!String(form.apiUrl || '').trim()) {
        this.modelFormError = 'API 地址不能为空';
        return;
      }
      if (!String(form.apiKey || '').trim()) {
        this.modelFormError = 'API Key 不能为空';
        return;
      }
      if (!String(form.model || '').trim()) {
        this.modelFormError = '模型标识不能为空';
        return;
      }

      this.isSavingModel = true;
      try {
        let id = String(form.id || '').trim();
        if (!id) {
          id = this.buildModelId(form.name);
          let counter = 1;
          while (this.models.some(item => item.id === id)) {
            id = `${this.buildModelId(form.name)}-${counter++}`;
          }
        }

        const normalized = this.normalizeModelItem({
          ...form,
          id,
          name: String(form.name).trim(),
          description: String(form.description || '').trim(),
          provider: String(form.provider || '').trim() || '自定义',
          apiUrl: String(form.apiUrl).trim(),
          apiKey: String(form.apiKey).trim(),
          model: String(form.model).trim()
        });

        const index = this.models.findIndex(item => item.id === id);
        if (index >= 0) {
          this.models.splice(index, 1, normalized);
        } else {
          this.models.push(normalized);
        }
        this.currentModelId = normalized.id;
        this.editingModelData = this.cloneModel(normalized);
        await this.persistModelState();
        this.showToast('模型配置已保存', 'success');
      } catch (error) {
        console.error('saveModelConfig failed:', error);
        this.modelFormError = `保存失败：${error.message || '未知错误'}`;
        this.showToast('模型配置保存失败', 'error');
      } finally {
        this.isSavingModel = false;
      }
    },
    showToast(message, type = 'success') {
      if (!message) return;
      const now = Date.now();
      if (this._lastToastMessage === String(message) && now - (this._lastToastAt || 0) < 1600) {
        return;
      }
      this._lastToastMessage = String(message);
      this._lastToastAt = now;
      this.toast = {
        message: String(message),
        type: type === 'error' ? 'error' : 'success'
      };
      if (this._toastTimer) {
        clearTimeout(this._toastTimer);
      }
      this._toastTimer = setTimeout(() => {
        this.toast = { message: '', type: 'success' };
        this._toastTimer = null;
      }, 2200);
    },
    async requestConfirm(message, title = '请确认') {
      if (this.confirmDialog.resolver) {
        this.confirmDialog.resolver(false);
      }
      return new Promise((resolve) => {
        this.confirmDialog = {
          visible: true,
          title: String(title || '请确认'),
          message: String(message || ''),
          resolver: resolve
        };
      });
    },
    resolveConfirmDialog(result) {
      const resolver = this.confirmDialog.resolver;
      this.confirmDialog = {
        visible: false,
        title: '请确认',
        message: '',
        resolver: null
      };
      if (resolver) {
        resolver(!!result);
      }
      this.focusMainInputIfReady();
    },
    handleConfirmOk() {
      this.resolveConfirmDialog(true);
    },
    handleConfirmCancel() {
      this.resolveConfirmDialog(false);
    },
    handleDocumentMouseUp() {
      this.$nextTick(() => {
        this.updateSelectionActionsFromCurrentSelection();
      });
    },
    handleSelectionChange() {
      const selection = window.getSelection ? window.getSelection() : null;
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        this.clearSelectionActions();
      }
    },
    isSelectionInsideChatMain(selection) {
      const chatMain = this.$refs.chatMain;
      if (!chatMain || !selection || selection.rangeCount === 0) return false;
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;
      return chatMain.contains(startContainer) && chatMain.contains(endContainer);
    },
    getSelectionEndRect(range) {
      if (!range) return null;
      const endRange = range.cloneRange();
      endRange.collapse(false);
      const endRects = endRange.getClientRects();
      if (endRects && endRects.length > 0) {
        return endRects[endRects.length - 1];
      }
      const fullRect = range.getBoundingClientRect();
      if (fullRect && (fullRect.width > 0 || fullRect.height > 0)) {
        return fullRect;
      }
      return null;
    },
    updateSelectionActionsFromCurrentSelection() {
      const selection = window.getSelection ? window.getSelection() : null;
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        this.clearSelectionActions();
        return;
      }
      const selectedText = selection.toString().trim();
      if (!selectedText) {
        this.clearSelectionActions();
        return;
      }
      if (!this.isSelectionInsideChatMain(selection)) {
        this.clearSelectionActions();
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = this.getSelectionEndRect(range);
      if (!rect) {
        this.clearSelectionActions();
        return;
      }

      const buttonTop = Math.max(12, Math.min(window.innerHeight - 48, rect.bottom + 8));
      const buttonLeft = Math.max(12, Math.min(window.innerWidth - 180, rect.right - 170));
      this.selectionActions = {
        visible: true,
        text: selectedText,
        top: buttonTop,
        left: buttonLeft
      };
    },
    clearSelectionActions() {
      if (!this.selectionActions.visible && !this.selectionActions.text) return;
      this.selectionActions = {
        visible: false,
        text: '',
        top: 0,
        left: 0
      };
    },
    async copySelectionText() {
      if (!this.selectionActions.text) return;
      const copied = await this.writeTextToClipboard(this.selectionActions.text);
      if (!copied) {
        this.showToast('复制失败，请重试', 'error');
        return;
      }
      this.showToast('复制成功', 'success');
      this.clearSelectionActions();
    },
    appendSelectionToInput() {
      const text = String(this.selectionActions.text || '')
        .replace(/\s*\r?\n\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!text) return;
      if (!this.inputText) {
        this.inputText = text;
      } else {
        const separator = this.inputText.endsWith(' ') ? '' : ' ';
        this.inputText = `${this.inputText}${separator}${text}`;
      }
      this.clearSelectionActions();
      this.$nextTick(() => {
        if (this.$refs.textarea) {
          this.$refs.textarea.focus();
        }
        this.resizeTextarea();
      });
    },
    async deleteModelConfig(modelId) {
      if (!modelId) return;
      const confirmed = await this.requestConfirm('确定要删除该模型配置吗？');
      if (!confirmed) return;
      this.models = this.models.filter(item => item.id !== modelId);
      if (this.models.length === 0) {
        this.currentModelId = '';
        this.editingModelData = this.emptyModelConfig();
      } else if (!this.models.some(item => item.id === this.currentModelId)) {
        this.currentModelId = this.models[0].id;
        this.editingModelData = this.cloneModel(this.models[0]);
      }
      await this.persistModelState();
    },
    buildProxyTargetUrl(targetApiUrl) {
      return resolveProxyTargetUrl(targetApiUrl, this.proxyBaseUrl);
    },
    buildModelRequest(modelConfig, messages) {
      return createModelRequest(modelConfig, messages);
    },
    buildHeaders(modelConfig) {
      return createModelHeaders(modelConfig);
    },
    appendStreamChunk(data, protocol) {
      let content = '';
      if (protocol === 'anthropic') {
        if (data.type === 'content_block_delta') {
          content = data?.delta?.text || '';
        } else if (data.type === 'message_delta') {
          content = '';
        }
      } else {
        content = data?.choices?.[0]?.delta?.content || '';
      }
      if (typeof content === 'string' && content.length > 0) {
        this.currentStreamText += content;
        this.scrollToBottom();
      }
    },
    extractAnthropicEventData(line) {
      return parseAnthropicEventData(line);
    },
    editMessage(text) {
      this.inputText = text;
      this.$refs.textarea.focus();
      this.$nextTick(() => {
        this.resizeTextarea();
      });
    },
    getCurrentTime() {
      return formatCurrentTime();
    },
    formatHistoryTime(timestamp) {
      return formatChatHistoryTime(timestamp);
    },
    async loadHistory() {
      const parsed = await this.readHistoryData();
      this.chatHistory = parsed
        .filter(chat => chat.messages && chat.messages.length > 0)
        .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
      if (this.chatHistory.length !== parsed.length) {
        await this.writeHistoryData(this.chatHistory);
      }
    },
    async saveHistory() {
      if (!this.currentChatId) return;

      // 如果没有任何消息，不保存到历史记录，并从现有记录中移除（如果有）
      if (this.messages.filter(m => m.role !== 'system').length === 0) {
        const chatIndex = this.chatHistory.findIndex(c => c.id === this.currentChatId);
        if (chatIndex !== -1) {
          this.chatHistory.splice(chatIndex, 1);
          await this.writeHistoryData(this.chatHistory);
        }
        return;
      }

      const chatIndex = this.chatHistory.findIndex(c => c.id === this.currentChatId);
      const firstUserMessage = this.messages.find(m => m.role === 'user');
      const title = firstUserMessage ? (firstUserMessage.content.substring(0, 15) + (firstUserMessage.content.length > 15 ? '...' : '')) : '新对话';
        
      if (chatIndex !== -1) {
        const existingChat = this.chatHistory[chatIndex];
        const hasMessageChanged = JSON.stringify(existingChat.messages || []) !== JSON.stringify(this.messages || []);
        const hasTitleChanged = existingChat.title !== title;

        this.chatHistory[chatIndex].messages = [...this.messages];
        this.chatHistory[chatIndex].title = title;
        if (hasMessageChanged || hasTitleChanged) {
          this.chatHistory[chatIndex].updatedAt = Date.now();
        }
      } else {
        this.chatHistory.unshift({
          id: this.currentChatId,
          title: title,
          messages: [...this.messages],
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      
      this.chatHistory.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
      await this.writeHistoryData(this.chatHistory);
    },
    createNewChat() {
      this.currentChatId = Date.now().toString();
      
      // 注入默认的 system 级别提示词
      const now = new Date();
      const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      const weekStr = now.toLocaleDateString('zh-CN', { weekday: 'long' });
      const systemPrompt = `你是一位严谨、专业的通用知识助手。请以用户提供的当前时间为准，回答问题时保持清晰、准确、中立。今天的日期：${dateStr}${weekStr}。`;

      this.messages = [
        { role: 'system', content: systemPrompt }
      ];
      
      this.inputText = '';
      this.currentStreamText = '';
      this.isGenerating = false;
      this.saveHistory().catch((error) => {
        console.error('saveHistory failed:', error);
      });
      if(window.innerWidth < 768) {
         this.isSidebarOpen = false;
      }
    },
    selectChat(id) {
      if (this.isGenerating) return;
      const chat = this.chatHistory.find(c => c.id === id);
      if (chat) {
        this.currentChatId = id;
        this.messages = chat.messages || [];
        this.inputText = '';
        this.currentStreamText = '';
        if(window.innerWidth < 768) {
           this.isSidebarOpen = false;
        }
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    async deleteChat(id) {
      if (this.isGenerating && id === this.currentChatId) return;
      this.chatHistory = this.chatHistory.filter(c => c.id !== id);
      await this.writeHistoryData(this.chatHistory);
      
      if (this.currentChatId === id) {
        if (this.chatHistory.length > 0) {
          this.selectChat(this.chatHistory[0].id);
        } else {
          this.createNewChat();
        }
      }
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
      this.saveSidebarState();
    },
    loadSidebarState() {
      const savedState = localStorage.getItem('llm_wenda_sidebar_open');
      if (savedState !== null) {
        this.isSidebarOpen = savedState === 'true';
      }
    },
    saveSidebarState() {
      localStorage.setItem('llm_wenda_sidebar_open', this.isSidebarOpen);
    },
    fallbackCopyText(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    },
    async writeTextToClipboard(text) {
      if (navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (error) {
          console.warn('navigator.clipboard.writeText failed, fallback to execCommand', error);
        }
      }
      try {
        return this.fallbackCopyText(text);
      } catch (error) {
        console.error('fallback copy failed:', error);
        return false;
      }
    },
    animateCopyButton(event) {
      const btn = event?.currentTarget;
      if (!btn) return;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>已复制</span>';
      setTimeout(() => {
        if (btn.isConnected) {
          btn.innerHTML = originalHtml;
        }
      }, 2000);
    },
    async copyText(text, event) {
      const copied = await this.writeTextToClipboard(text);
      if (!copied) {
        this.showToast('复制失败，请重试', 'error');
        return;
      }
      this.showToast('复制成功', 'success');
      this.animateCopyButton(event);
    },
    resizeTextarea() {
      const textarea = this.$refs.textarea;
      if (!textarea) return;
      textarea.style.height = 'auto';
      const minHeight = parseFloat(window.getComputedStyle(textarea).minHeight) || 0;
      const nextHeight = Math.max(textarea.scrollHeight, minHeight);
      textarea.style.height = `${Math.min(nextHeight, 200)}px`;
    },
    triggerFileUpload() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.click();
      }
    },
    handleFileUpload(event) {
      const files = Array.from(event?.target?.files || []);
      if (files.length === 0) return;
      const allowedExts = ['docx', 'pdf', 'xls', 'xlsx', 'csv'];
      const invalidFiles = files.filter((file) => {
        const ext = this.getFileExtension(file.name);
        return !allowedExts.includes(ext);
      });
      if (invalidFiles.length > 0) {
        this.showToast('仅支持上传 docx、pdf、excel 文件', 'error');
      }
      files.forEach((file) => {
        const ext = this.getFileExtension(file.name);
        if (!allowedExts.includes(ext)) return;
        const item = {
          id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: Number(file.size || 0),
          ext,
          status: 'parsing',
          progress: 0,
          content: '',
          error: ''
        };
        this.uploadedFiles.push(item);
        this.parseUploadedFile(item.id, file);
      });
      event.target.value = '';
    },
    removeUploadedFile(fileId) {
      const target = this.uploadedFiles.find(file => file.id === fileId);
      if (target) {
        target.status = 'removed';
        target.progress = 0;
        target.content = '';
        target.error = '';
      }
      this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== fileId);
    },
    canUpdateUploadedFile(fileId) {
      return this.uploadedFiles.some(file => file.id === fileId);
    },
    updateUploadedFile(fileId, patch) {
      const index = this.uploadedFiles.findIndex(file => file.id === fileId);
      if (index === -1) return false;
      const next = { ...this.uploadedFiles[index], ...(patch || {}) };
      if (next.progress != null) {
        const safeProgress = Number(next.progress);
        next.progress = Number.isFinite(safeProgress)
          ? Math.max(0, Math.min(100, Math.round(safeProgress)))
          : this.uploadedFiles[index].progress || 0;
      }
      this.$set(this.uploadedFiles, index, next);
      return true;
    },
    getFileExtension(filename) {
      return getUploadFileExtension(filename);
    },
    formatFileSize(size) {
      return formatUploadFileSize(size);
    },
    getAttachmentSubtext(file) {
      if (file.status === 'parsing') return `解析中 ${this.getFileProgressValue(file)}%`;
      if (file.status === 'error') return file.error || '解析失败';
      return `${String(file.ext || '').toUpperCase()} ${this.formatFileSize(file.size)}`;
    },
    getFileProgressValue(file) {
      return normalizeFileProgress(file);
    },
    async parseUploadedFile(fileId, file) {
      if (!this.canUpdateUploadedFile(fileId)) return;
      this.updateUploadedFile(fileId, {
        status: 'parsing',
        progress: 5,
        content: '',
        error: ''
      });
      try {
        const ext = this.getFileExtension(file.name);
        const text = await this.extractFileText(file, ext, (progress) => {
          this.updateUploadedFile(fileId, {
            status: 'parsing',
            progress
          });
        });
        if (!this.canUpdateUploadedFile(fileId)) return;
        const normalized = String(text || '').trim();
        this.updateUploadedFile(fileId, {
          content: normalized || '（文件内容为空）',
          status: 'ready',
          progress: 100,
          error: ''
        });
      } catch (error) {
        if (!this.canUpdateUploadedFile(fileId)) return;
        console.error('Failed to parse file:', error);
        this.updateUploadedFile(fileId, {
          status: 'error',
          error: '解析失败',
          content: '',
          progress: 0
        });
        this.showToast(`${file.name} 解析失败，请检查文件格式`, 'error');
      }
    },
    async extractFileText(file, ext, onProgress) {
      if (ext === 'docx') {
        return this.extractDocxText(file, onProgress);
      }
      if (ext === 'pdf') {
        return this.extractPdfText(file, onProgress);
      }
      if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') {
        return this.extractExcelText(file, onProgress);
      }
      throw new Error('unsupported file type');
    },
    async extractDocxText(file, onProgress) {
      if (onProgress) onProgress(20);
      const buffer = await file.arrayBuffer();
      if (onProgress) onProgress(55);
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      if (onProgress) onProgress(95);
      return result.value || '';
    },
    async extractPdfText(file, onProgress) {
      if (onProgress) onProgress(15);
      const buffer = await file.arrayBuffer();
      const task = pdfjsLib.getDocument({
        data: new Uint8Array(buffer)
      });
      const pdf = await task.promise;
      const pages = [];
      for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
        const page = await pdf.getPage(pageIndex);
        const textContent = await page.getTextContent();
        const line = textContent.items.map(item => item.str).join(' ');
        pages.push(line);
        if (onProgress) {
          const pageProgress = 20 + ((pageIndex / Math.max(pdf.numPages, 1)) * 75);
          onProgress(pageProgress);
        }
      }
      return pages.join('\n');
    },
    async extractExcelText(file, onProgress) {
      if (onProgress) onProgress(20);
      const buffer = await file.arrayBuffer();
      if (onProgress) onProgress(55);
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetContents = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
        const rowText = rows
          .map(row => (Array.isArray(row) ? row.join('\t') : ''))
          .filter(Boolean)
          .join('\n');
        return rowText ? `[${sheetName}]\n${rowText}` : '';
      }).filter(Boolean);
      if (onProgress) onProgress(95);
      return sheetContents.join('\n\n');
    },
    buildUploadedFilesPromptText() {
      return this.parsedUploadedFiles
        .map((file, index) => `文件${index + 1}（序号）-${file.name}：${file.content}`)
        .join('\n\n');
    },
    buildFinalUserPrompt(userQuestion) {
      if (this.parsedUploadedFiles.length === 0) {
        return userQuestion;
      }
      const filesText = this.buildUploadedFilesPromptText();
      return `用户上传文件内容为：${filesText}；基于这些问题，回答用户提问：${userQuestion}`;
    },
    async loadCategories() {
      const payload = await this.readPromptData();
      if (Array.isArray(payload.categories) && payload.categories.length > 0) {
        this.categories = payload.categories;
      } else {
        await this.initDefaultCategories();
      }
    },
    async initDefaultCategories() {
      this.categories = ['写作助手', '编程开发', '翻译', '效率工具'];
      await this.saveCategories();
    },
    async queuePromptDataPersist() {
      const snapshot = this.normalizePromptData({
        categories: [...this.categories],
        prompts: [...this.prompts]
      });
      if (!this._promptPersistQueue) {
        this._promptPersistQueue = Promise.resolve();
      }
      this._promptPersistQueue = this._promptPersistQueue
        .catch(() => {
          // keep chain alive after previous failures
        })
        .then(() => this.writePromptData(snapshot));
      return this._promptPersistQueue;
    },
    async saveCategories() {
      await this.queuePromptDataPersist();
    },
    async addCategory() {
      this.categoryEditor = {
        visible: true,
        mode: 'add',
        name: '',
        oldName: ''
      };
    },
    async editCategory(oldCat) {
      this.categoryEditor = {
        visible: true,
        mode: 'edit',
        name: oldCat,
        oldName: oldCat
      };
    },
    closeCategoryEditor() {
      this.categoryEditor = {
        visible: false,
        mode: 'add',
        name: '',
        oldName: ''
      };
    },
    updateCategoryEditorName(value) {
      this.$set(this.categoryEditor, 'name', String(value || ''));
    },
    updatePromptField(payload) {
      if (!payload) return;
      const { field, value } = payload;
      if (!field) return;
      this.$set(this.editingPromptData, field, value);
    },
    async submitCategoryEditor() {
      const catName = String(this.categoryEditor.name || '').trim();
      if (!catName) {
        this.showToast('分类名称不能为空', 'error');
        return;
      }
      if (this.categoryEditor.mode === 'add') {
        if (this.categories.includes(catName)) {
          this.showToast('分类已存在', 'error');
          return;
        }
        this.categories.push(catName);
        await this.saveCategories();
        this.currentPromptCategory = catName;
        this.closeCategoryEditor();
        this.showToast('分类已新增', 'success');
        return;
      }

      const oldCat = this.categoryEditor.oldName;
      if (!oldCat) {
        this.showToast('分类编辑状态异常，请重试', 'error');
        this.closeCategoryEditor();
        return;
      }
      if (catName === oldCat) {
        this.closeCategoryEditor();
        return;
      }
      if (this.categories.includes(catName)) {
        this.showToast('该分类名称已存在', 'error');
        return;
      }

      const index = this.categories.indexOf(oldCat);
      if (index !== -1) {
        this.categories.splice(index, 1, catName);
      }

      let promptsUpdated = false;
      this.prompts.forEach((p) => {
        if (p.category === oldCat) {
          p.category = catName;
          promptsUpdated = true;
        }
      });
      if (this.currentPromptCategory === oldCat) {
        this.currentPromptCategory = catName;
      }

      await this.saveCategories();
      if (promptsUpdated) {
        await this.savePrompts();
      }
      this.closeCategoryEditor();
      this.showToast('分类已更新', 'success');
    },
    async deleteCategory(cat) {
      const relatedPrompts = this.prompts.filter(p => p.category === cat);
      if (relatedPrompts.length > 0) {
        const confirmed = await this.requestConfirm(`分类 "${cat}" 下有 ${relatedPrompts.length} 个提示词。是否同时删除该分类及下属的所有提示词？`);
        if (!confirmed) return;
        this.prompts = this.prompts.filter(p => p.category !== cat);
        this.categories = this.categories.filter(c => c !== cat);
        if (this.currentPromptCategory === cat) this.currentPromptCategory = '全部';
        await this.savePrompts();
        await this.saveCategories();
      } else {
        const confirmed = await this.requestConfirm(`确定要删除分类 "${cat}" 吗？`);
        if (!confirmed) return;
        this.categories = this.categories.filter(c => c !== cat);
        if (this.currentPromptCategory === cat) this.currentPromptCategory = '全部';
        await this.saveCategories();
      }
    },
    async loadPrompts() {
      const payload = await this.readPromptData();
      if (Array.isArray(payload.prompts) && payload.prompts.length > 0) {
        this.prompts = payload.prompts;
      } else {
        await this.initDefaultPrompts();
      }
    },
    async initDefaultPrompts() {
      this.prompts = [
        { id: '1', title: '文章润色', content: '请帮我润色以下文章，使其更加专业、流畅，并修正其中的语法错误：\n', category: '写作助手' },
        { id: '2', title: '代码解释', content: '请帮我逐行解释以下代码的逻辑和功能：\n', category: '编程开发' },
        { id: '3', title: '语言翻译', content: '请将以下内容翻译成英文，要求表达地道，符合英语母语者的习惯：\n', category: '翻译' },
        { id: '4', title: '总结摘要', content: '请帮我提取以下文章的核心观点，并生成一份简短的摘要：\n', category: '效率工具' }
      ];
      await this.savePrompts();
    },
    async savePrompts() {
      await this.queuePromptDataPersist();
    },
    selectPrompt(prompt) {
      this.inputText = prompt.content;
      this.closePromptModal();
    },
    addNewPrompt() {
      this.editingPromptData = { id: null, title: '', content: '', category: this.currentPromptCategory !== '全部' ? this.currentPromptCategory : '' };
      this.isEditingPrompt = true;
    },
    editPrompt(prompt) {
      this.editingPromptData = { ...prompt };
      this.isEditingPrompt = true;
    },
    async saveEditPrompt() {
      if (!this.editingPromptData.title.trim() || !this.editingPromptData.content.trim()) {
        this.showToast('标题和内容不能为空', 'error');
        return;
      }
      
      if (!this.editingPromptData.category.trim()) {
        this.editingPromptData.category = '未分类';
      }
      const finalCategory = this.editingPromptData.category.trim();
      this.editingPromptData.category = finalCategory;
      
      if (!this.categories.includes(finalCategory)) {
        this.categories.push(finalCategory);
        await this.saveCategories();
      }
      
      if (this.editingPromptData.id) {
        const index = this.prompts.findIndex(p => p.id === this.editingPromptData.id);
        if (index !== -1) {
          this.prompts.splice(index, 1, { ...this.editingPromptData });
        }
      } else {
        this.prompts.push({
          ...this.editingPromptData,
          id: Date.now().toString()
        });
      }
      
      await this.savePrompts();
      this.isEditingPrompt = false;
    },
    async deletePrompt(id) {
      const confirmed = await this.requestConfirm('确定要删除这个提示词吗？');
      if (!confirmed) return;
      this.prompts = this.prompts.filter(p => p.id !== id);
      this.savePrompts().catch((error) => {
        console.error('savePrompts failed:', error);
        this.showToast('提示词保存失败，请重试', 'error');
      });
      this.showToast('提示词已删除', 'success');
    },
    renderMarkdown(text) {
      if (!text) return '';
      const rawHtml = md.render(text);
      return DOMPurify.sanitize(rawHtml);
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const main = this.$refs.chatMain;
        if (main) {
          main.scrollTop = main.scrollHeight;
        }
      });
    },
    async sendMessage() {
      if (!this.inputText.trim() || this.isGenerating) return;
      if (this.isParsingFiles) {
        this.showToast('附件正在解析中，请稍后发送', 'error');
        return;
      }

      const userQuestion = this.inputText.trim();
      const finalPrompt = this.buildFinalUserPrompt(userQuestion);
      this.messages.push({ role: 'user', content: userQuestion });
      this.inputText = '';
      this.$nextTick(() => {
        this.resizeTextarea();
        this.scrollToBottom();
      });

      this.isGenerating = true;
      this.currentStreamText = '';

      const selectedModel = this.models.find(m => m.id === this.currentModelId);
      if (!selectedModel) {
        this.currentStreamText = '未找到可用模型，请先在“配置模型”中添加。';
        this.messages.push({
          role: 'assistant',
          content: this.currentStreamText,
          time: this.getCurrentTime()
        });
        this.currentStreamText = '';
        this.isGenerating = false;
        return;
      }

      // 提取对话历史上下文
      const apiMessages = this.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // 如果当前问题包含上传的文件（经过 buildFinalUserPrompt 处理），需要替换最后一条用户消息的内容
      if (apiMessages.length > 0 && apiMessages[apiMessages.length - 1].role === 'user') {
        apiMessages[apiMessages.length - 1].content = finalPrompt;
      }

      const requestBody = this.buildModelRequest(selectedModel, apiMessages);
      const requestUrl = this.buildProxyTargetUrl(selectedModel.apiUrl);

      try {
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: this.buildHeaders(selectedModel),
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('响应体为空，无法读取流式内容');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        const protocol = selectedModel.protocol === 'anthropic' ? 'anthropic' : 'openai';

        let isReading = true;
        while (isReading) {
          const { done, value } = await reader.read();
          if (done) {
            isReading = false;
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop();

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line || !line.startsWith('data:')) continue;

            const dataStr = line.slice(5).trim();
            if (!dataStr) continue;
            if (dataStr === '[DONE]') {
              isReading = false;
              break;
            }

            try {
              const data = JSON.parse(dataStr);
              this.appendStreamChunk(data, protocol);
            } catch (e) {
              console.error('Error parsing SSE data:', e, dataStr);
            }
          }
        }

        const remainingLine = buffer.trim();
        if (remainingLine.startsWith('data:')) {
          if (protocol === 'anthropic') {
            const finalData = this.extractAnthropicEventData(remainingLine);
            if (finalData) {
              this.appendStreamChunk(finalData, protocol);
            }
          } else {
            const dataStr = remainingLine.slice(5).trim();
            if (dataStr && dataStr !== '[DONE]') {
              try {
                const data = JSON.parse(dataStr);
                this.appendStreamChunk(data, protocol);
              } catch (e) {
                console.error('Error parsing final SSE data:', e, dataStr);
              }
            }
          }
        }

      } catch (error) {
        console.error('API call failed:', error);
        this.currentStreamText = '请求失败，请稍后再试。\n\nError: ' + error.message;
      } finally {
        if (!this.currentStreamText) {
          this.currentStreamText = '未收到模型返回内容，请检查流式响应格式。';
        }
        this.messages.push({ 
          role: 'assistant', 
          content: this.currentStreamText,
          time: this.getCurrentTime()
        });
        this.currentStreamText = '';
        this.isGenerating = false;
        this.scrollToBottom();
      }
    }
  }
}
</script>

<style>
</style>

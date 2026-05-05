<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-2xl w-[90vw] md:w-[85vw] max-w-[65rem] h-[85vh] md:h-[80vh] max-h-[48rem] flex flex-col shadow-xl overflow-hidden animate-[modal-pop_0.3s_ease-out]">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">模型配置</h2>
        <div class="flex items-center gap-2.5">
          <button class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-[13px] transition-colors" :disabled="isSavingModel" @click="$emit('save-model')">
            {{ isSavingModel ? '保存中...' : '保存' }}
          </button>
          <button class="bg-transparent border-none text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 cursor-pointer rounded-lg p-1 flex items-center justify-center transition-all" @click="$emit('close')">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="flex-1 flex overflow-hidden">
        <div class="w-[17.5rem] border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-800/50">
          <button class="px-3 py-2 border border-dashed border-blue-300 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 cursor-pointer transition-colors" @click="$emit('create-model')">+ 新增模型</button>
          <div class="flex-1 overflow-y-auto flex flex-col gap-2">
            <div
              v-for="item in models"
              :key="item.id"
              class="flex items-center justify-between gap-2 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 bg-white dark:bg-gray-800 cursor-pointer transition-colors group"
              :class="editingModelData && item.id === editingModelData.id ? '!border-blue-500 !bg-blue-50 dark:!bg-blue-900/20' : 'hover:border-gray-300 dark:hover:border-gray-600'"
              @click="$emit('edit-model', item)"
            >
              <div class="flex-1 min-w-0">
                <div class="text-gray-900 dark:text-gray-100 text-sm font-semibold truncate">{{ item.name }}</div>
                <div class="mt-1 text-gray-500 dark:text-gray-400 text-xs">{{ item.provider || '自定义' }} · {{ item.protocol === 'anthropic' ? 'Anthropic' : 'OpenAI' }}</div>
              </div>
              <button class="bg-transparent border-none text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 cursor-pointer p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" @click.stop="$emit('delete-model', item.id)" title="删除模型">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
            <div v-if="models.length === 0" class="text-center text-gray-400 text-sm py-8">当前暂无模型，请先新增</div>
          </div>
        </div>
        <div class="flex-1 px-6 py-5 overflow-y-auto bg-slate-50 dark:bg-gray-900">
          <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">{{ editingModelData && editingModelData.id ? '编辑模型' : '新增模型' }}</h3>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">显示名称</label>
              <input class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" :value="modelField('name')" type="text" placeholder="例如：DeepSeek Chat" @input="emitModelField('name', $event.target.value)" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Provider</label>
              <select class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" :value="modelField('provider')" @change="handleProviderChange($event.target.value)">
                <option v-for="provider in providerOptions" :key="provider.value" :value="provider.value">{{ provider.label }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">协议</label>
              <select class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" :value="modelField('protocol')" @change="emitModelField('protocol', $event.target.value)">
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">模型标识</label>
              <input class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" :value="modelField('model')" type="text" placeholder="例如：deepseek-chat" @input="emitModelField('model', $event.target.value)" />
            </div>
          </div>
          <div class="flex flex-col gap-1.5 mb-3">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">API 地址</label>
            <input class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" :value="modelField('apiUrl')" type="text" placeholder="例如：https://api.deepseek.com/v1/chat/completions" @input="emitModelField('apiUrl', $event.target.value)" />
          </div>
          <div class="flex flex-col gap-1.5 mb-3">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">API Key</label>
            <div class="relative">
              <input class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" :value="modelField('apiKey')" :type="showApiKey ? 'text' : 'password'" placeholder="输入 API Key" @input="emitModelField('apiKey', $event.target.value)" />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                :title="showApiKey ? '隐藏 API Key' : '显示 API Key'"
                @click="$emit('toggle-api-key-visibility')"
              >
                <svg v-if="showApiKey" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.9-2.15 2.37-4.03 4.23-5.44"></path>
                  <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a10.96 10.96 0 0 1-1.68 2.75"></path>
                  <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-1.5 mb-3">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">描述</label>
            <input class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" :value="modelField('description')" type="text" placeholder="模型说明（可选）" @input="emitModelField('description', $event.target.value)" />
          </div>
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">max_tokens</label>
              <input class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" :value="modelField('maxTokens')" type="number" min="1" @input="emitModelField('maxTokens', Number($event.target.value))" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">temperature</label>
              <input class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" :value="modelField('temperature')" type="number" min="0" max="2" step="0.1" @input="emitModelField('temperature', Number($event.target.value))" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">top_p</label>
              <input class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" :value="modelField('topP')" type="number" min="0" max="1" step="0.1" @input="emitModelField('topP', Number($event.target.value))" />
            </div>
          </div>
          <div v-if="modelFormError" class="text-red-500 text-sm mt-2">{{ modelFormError }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModelConfigModal',
  props: {
    show: { type: Boolean, default: false },
    models: { type: Array, default: () => [] },
    editingModelData: { type: Object, default: () => ({}) },
    providerOptions: { type: Array, default: () => [] },
    modelFormError: { type: String, default: '' },
    isSavingModel: { type: Boolean, default: false },
    showApiKey: { type: Boolean, default: false }
  },
  methods: {
    modelField(field) {
      if (!this.editingModelData || typeof this.editingModelData !== 'object') {
        return '';
      }
      return this.editingModelData[field];
    },
    emitModelField(field, value) {
      this.$emit('update-model-field', { field, value });
    },
    handleProviderChange(value) {
      this.emitModelField('provider', value);
      this.$emit('provider-change');
    }
  }
};
</script>

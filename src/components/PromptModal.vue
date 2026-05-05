<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-2xl w-[90vw] md:w-[85vw] max-w-[65rem] h-[85vh] md:h-[80vh] max-h-[48rem] flex flex-col shadow-xl overflow-hidden animate-[modal-pop_0.3s_ease-out]">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">常用提示词</h2>
        <button class="bg-transparent border-none text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 cursor-pointer rounded-lg p-1 flex items-center justify-center transition-all" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar -->
        <div class="w-48 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800/50">
          <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
            <div
              class="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors"
              :class="currentPromptCategory === '全部' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
              @click="$emit('update-current-category', '全部')"
            >
              <span class="truncate">全部</span>
            </div>
            <div
              v-for="cat in categories"
              :key="cat"
              class="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors group"
              :class="currentPromptCategory === cat ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
              @click="$emit('update-current-category', cat)"
            >
              <span class="truncate flex-1">{{ cat }}</span>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors" @click.stop="$emit('edit-category', cat)" title="编辑分类">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors" @click.stop="$emit('delete-category', cat)" title="删除分类">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2">
            <button class="w-full px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg border border-dashed border-blue-300 dark:border-blue-700 transition-colors" @click="$emit('add-category')">+ 新增分类</button>
            <button class="w-full px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg border border-dashed border-blue-300 dark:border-blue-700 transition-colors" @click="$emit('add-new-prompt')">+ 新增提示词</button>
          </div>
          <div v-if="categoryEditor.visible" class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            <input
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-2"
              :value="editorName"
              type="text"
              :placeholder="categoryEditor.mode === 'add' ? '请输入分类名称' : '请输入新的分类名称'"
              @input="$emit('update-category-editor-name', $event.target.value)"
              @keydown.enter.prevent="$emit('submit-category-editor')"
            />
            <div class="flex justify-end gap-2">
              <button class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors" @click="$emit('close-category-editor')">取消</button>
              <button class="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors" @click="$emit('submit-category-editor')">
                {{ categoryEditor.mode === 'add' ? '新增' : '保存' }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-gray-900">
          <div v-if="isEditingPrompt" class="max-w-2xl mx-auto">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">{{ editingPromptData.id ? '编辑提示词' : '新增提示词' }}</h3>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">标题</label>
                <input class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" :value="promptField('title')" type="text" placeholder="例如：文章润色" @input="emitPromptField('title', $event.target.value)" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">分类</label>
                <input class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" :value="promptField('category')" type="text" placeholder="例如：写作助手" list="category-options" @input="emitPromptField('category', $event.target.value)" />
                <datalist id="category-options">
                  <option v-for="cat in categories" :key="cat" :value="cat"></option>
                </datalist>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">提示词内容</label>
                <textarea class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-y" :value="promptField('content')" rows="6" placeholder="输入提示词的具体内容..." @input="emitPromptField('content', $event.target.value)"></textarea>
              </div>
              <div class="flex justify-end gap-3 mt-2">
                <button class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg dark:text-gray-300 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors" @click="$emit('cancel-edit-prompt')">取消</button>
                <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors" @click="$emit('save-edit-prompt')">保存</button>
              </div>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="prompt in filteredPrompts" :key="prompt.id" class="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all flex flex-col" @click="$emit('select-prompt', prompt)">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 truncate pr-2">{{ prompt.title }}</h4>
                <span class="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 rounded flex-shrink-0">{{ prompt.category }}</span>
              </div>
              <div class="flex-1 overflow-hidden">
                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 leading-relaxed">{{ prompt.content }}</p>
              </div>
              <div class="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-1">
                <button class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors" @click.stop="$emit('edit-prompt', prompt)" title="编辑">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded transition-colors" @click.stop="$emit('delete-prompt', prompt.id)" title="删除">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div v-if="filteredPrompts.length === 0" class="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
              该分类下暂无提示词
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PromptModal',
  props: {
    show: { type: Boolean, default: false },
    categories: { type: Array, default: () => [] },
    currentPromptCategory: { type: String, default: '全部' },
    categoryEditor: { type: Object, default: () => ({ visible: false, mode: 'add', name: '', oldName: '' }) },
    isEditingPrompt: { type: Boolean, default: false },
    editingPromptData: { type: Object, default: () => ({ id: null, title: '', content: '', category: '' }) },
    filteredPrompts: { type: Array, default: () => [] }
  },
  computed: {
    editorName() {
      return this.categoryEditor && typeof this.categoryEditor === 'object'
        ? this.categoryEditor.name || ''
        : '';
    }
  },
  methods: {
    promptField(field) {
      if (!this.editingPromptData || typeof this.editingPromptData !== 'object') {
        return '';
      }
      return this.editingPromptData[field] || '';
    },
    emitPromptField(field, value) {
      this.$emit('update-prompt-field', { field, value });
    }
  }
};
</script>

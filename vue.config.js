const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: './',
  transpileDependencies: [
    'markdown-it',
    'dompurify'
  ],
  chainWebpack: config => {
    config.entry('app').clear().add('core-js/stable').add('regenerator-runtime/runtime').add('./src/main.js')
  },
  devServer: {
    proxy: {
      '/llmserver': {
        target: 'http://127.0.0.1:9080',
        changeOrigin: true,
        pathRewrite: {
          '^/llmserver': ''
        }
      }
    }
  }
})

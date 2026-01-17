<template>
  <div class="container">
    <h1>PyWebView 6.1 + Vue3 + TS 示例</h1>
    <!-- 调用 Python API -->
    <button @click="callPythonApi">调用Python方法</button>
    <p v-if="pythonResult">Python 返回结果：{{ pythonResult }}</p>
    
    <!-- 显示 Python 主动推送的消息 -->
    <p v-if="pythonMessage">Python 推送：{{ pythonMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const pythonResult = ref('')
const pythonMessage = ref('')

// 1. 定义全局回调函数，供 Python 调用
// 挂载到 window 上，让 Python 能通过 evaluate_js 访问
onMounted(() => {
  window.handlePythonMessage = (message: string) => {
    pythonMessage.value = message
  }
})

// 2. 调用 Python 暴露的 API（6.1 仅保留 api 调用功能）
const callPythonApi = async () => {
  try {
    // 6.1 仅保留 window.pywebview.api 可用
    const result = await window.pywebview.api.hello('Vue 前端')
    pythonResult.value = result
  } catch (e) {
    console.error('调用Python API失败：', e)
  }
}
</script>

<script lang="ts">
// 补充 TS 类型声明，避免类型报错
declare global {
  interface Window {
    handlePythonMessage: (message: string) => void
    pywebview: {
      api: {
        hello: (name: string) => Promise<string>
      }
    }
  }
}
export {}
</script>

<style scoped>
.container {
  width: 80%;
  margin: 50px auto;
  text-align: center;
}
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>

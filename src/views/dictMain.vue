<template>
  <div class="app-wrapper">
    <titlebar @move-window="handleMoveWindow" @quit="handleQuit" @minimize="handleMinimize" @restart="handleRestart" />
    <RouterView />
    <bottomPanel :status-info="statusInfo" @top="handleTop" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from 'element-plus';

// import { clearInterval } from "timers";
import { useConfigStore } from "@/stores/configStore";
import { useRootStore } from "@/stores/rootStore";
import { useDictStore } from "@/stores/dict/dictStore";
import { TimerId, useMessageQueueStore } from '@/stores/dict/messageQueueStore';
import { UserMessage, SocketService, createSocketService } from '@/services/socketService';

import titlebar from "@/components/dictTitlebar.vue";
import bottomPanel from "@/components/dictBottomPanel.vue";

const configStore = useConfigStore();
const rootStore = useRootStore();
const dictStore = useDictStore();
const dictState = dictStore.dictState;
const messageQueueStore = useMessageQueueStore();
const { messageQueue } = messageQueueStore;

const userId: Ref<string> = ref(''); // Reactive user ID

// Initialize SocketService
const socketService: SocketService = createSocketService();

const handleMoveWindow = (payload: { deltaX: number, deltaY: number }) => {
  rootStore.moveWindow(payload.deltaX, payload.deltaY);
}

const handleMinimize = () => {
  rootStore.minimize();
};

const handleRestart = () => {
  rootStore.restart();
};

const handleTop = (payload: { isTop: boolean }) => {
  rootStore.top(payload.isTop);
}

const handleQuit = () => {
  rootStore.quit();
};

const statusInfo = ref("");

// Local state for popped messages
const latestPopped = ref<string>('')
let popTimer: TimerId | null = null

const pop = () => {
  // Clear existing timer to avoid duplicates
  if (popTimer) clearInterval(popTimer);

  // Only start timer if queue is not empty
  if (messageQueue.length > 0) {
    popTimer = setInterval(() => {
      // Pop ONLY from the queue
      const poppedStr = messageQueue.shift(); // shift() for FIFO, pop() for LIFO
      if (poppedStr) {
        latestPopped.value = poppedStr
        console.debug('Popped:', poppedStr);
        statusInfo.value = poppedStr;
      }

      // Stop timer if queue is empty
      if (messageQueue.length === 0 && popTimer) {
        clearInterval(popTimer)
        popTimer = null
      }
    }, 800) // 800ms interval
  }
}

// Handler for received active messages
const handlePrivateMessage = (event: CustomEvent) => {
  const usrMsg = event.detail as UserMessage;
  messageQueueStore.push(usrMsg.msg);
};

// Watch queue length to auto-start/stop pop timer
watch(
  () => messageQueue.length,
  (newLength) => {
    if (newLength > 0) pop()
    else if (popTimer) clearInterval(popTimer)
  },
  { immediate: true } // Run on component mount
)

onMounted(async () => {
  // window.electron.ipcRenderer.invoke('app', 'log', "info", "App Vue");

  rootStore.rootState.isPyWebviewReady = await rootStore.waitForPyWebview();
  if (!rootStore.rootState.isPyWebviewReady) {
    ElMessage.warning('pywebview API unavailable');
  } else {
    const guiCfg = configStore.config.Dictionary.GUI;
    const width = guiCfg.Width;
    console.debug(`width = ${width}`);
    const height = guiCfg.Height;
    console.debug(`height = ${height}`);
    rootStore.resize(width, height);
  }

  socketService.initSocket(rootStore.rootState.serverUrl);

  userId.value = dictState.user;
  // Auto-authenticate on mount (optional)
  if (userId.value.trim()) {
    socketService.authenticateUser(userId);
  }

  // Listen for custom event from socket service
  window.addEventListener('private-message-received', handlePrivateMessage as EventListener);
})

onUnmounted((): void => {
  // Clean up SocketService to prevent memory leaks
  socketService.destroy();
  window.removeEventListener('private-message-received', handlePrivateMessage as EventListener);

  if (popTimer) clearInterval(popTimer);
});

</script>

<style scoped>
/* 根容器：固定701px宽，作为所有absolute组件的定位基准 */
.app-wrapper {
  width: 701px !important;
  /* 强制固定宽度，和组件一致 */
  height: 548px !important;
  /* 高度由内部组件撑开（或设固定值） */
  position: relative;
  /* 关键：让内部absolute组件以它为基准 */
  margin: 0 auto;
  /* 可选：水平居中，视觉更友好 */
  padding: 0;
  border: 0;
  box-sizing: border-box;
  overflow: hidden;
  /* 防止内部组件溢出 */
}

/* 全局重置：让body/html宽度适配根容器，消除右侧83px */
:global(html),
:global(body) {
  width: auto !important;
  /* 取消body/html的100%宽，由根容器决定 */
  height: auto !important;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

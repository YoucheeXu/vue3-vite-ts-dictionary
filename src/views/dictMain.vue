<template>
  <div class="app-wrapper">
    <titlebar @move-window="handleMoveWindow" @quit="handleQuit" @minimize="handleMinimize" />
    <inputPanel ref="childInputRef" @query-word="handleQueryWord" @query-next="handleQueryNext"
      @query-prev="handleQueryPrev" />
    <wordPanel ref="childWordRef" :word="wordRef" :audio-u-r-l="audioURLRef" :b-new="bNewRef" :level="levelRef"
      :n-stars="nStarsRef" />
    <dictPanel ref="childDictRef" :dict-u-r-l="dictURLRef" @switch-tab="handleSwitchTab"
      @stats-update="handleStatsUpdate" />
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

import titlebar from "@/components/dictTitlebar.vue";
import inputPanel from "@/components/dictInputPanel.vue";
import wordPanel from "@/components/dictWordPanel.vue";
import dictPanel from "@/components/dictDictPanel.vue";
import bottomPanel from "@/components/dictBottomPanel.vue";

import type { ITabInfo } from "@/stores/dict/types";

const configStore = useConfigStore();
const rootStore = useRootStore();
const dictStore = useDictStore();
const dictState = dictStore.dictState;

const handleMoveWindow = (payload: { deltaX: number, deltaY: number }) => {
  rootStore.moveWindow(payload.deltaX, payload.deltaY);
}

const handleMinimize = () => {
  rootStore.minimize();
};

const handleTop = (payload: { isTop: boolean }) => {
  rootStore.top(payload.isTop);
}

const handleQuit = () => {
  rootStore.quit();
};

const childInputRef = ref<InstanceType<typeof inputPanel> | null>(null);

const childWordRef = ref<InstanceType<typeof wordPanel> | null>(null);
const wordRef = ref("");
const audioURLRef = ref("");
const bNewRef = ref(false);
const levelRef = ref("");
const nStarsRef = ref(0);

const childDictRef = ref(null);
const dictURLRef = ref("");

const statusInfo = ref("");

const pronounce = () => {
  const childWord = childWordRef.value;
  childWord?.play();
};

const queryWord = async (word: string) => {
  const dictId = dictState.curDictId;
  console.log(`query ${word} in #${dictId} dict`);
  // console.log(`current word: ${dictState.curWord}, tab: ${dictState.curDictId}`);

  // if (word == dictState.curWord && dictId == dictState.curDictId) {
  //   pronounce();
  //   return;
  // }
  // console.log(`word: ${word}, tabId: ${dictId}`);
  dictStore
    .queryWord(word, dictId)
    .then(([dictURL, audioURL, bNew, level, nStars]: [string, string, boolean, string, number]) => {
      wordRef.value = word;

      audioURLRef.value = audioURL;
      // audioURLRef.value = new URL(audioURL).href;
      console.debug(`Audio src = ${audioURLRef.value}`);
      bNewRef.value = bNew;
      levelRef.value = level;
      nStarsRef.value = nStars;

      dictURLRef.value = dictURL;
      // dictURLRef.value = new URL(dictURL).href;
      console.debug(`iframe src = ${dictURLRef.value}`);

      pronounce();
    });
  dictState.curWord = word;
  // dictState.curDictId = dictId;
};

// TODO: status of QueryPrev button
const handleQueryWord = async () => {
  if (childInputRef.value) {
    const childInput = childInputRef.value;
    const word = childInput.word;
    // const tabId = childDictRef.value.editableTabsValue;
    queryWord(word);
  }
};

// TODO: status of button
const handleQueryNext = async () => {
  dictStore.getNextWordAct().then((word: string) => {
    queryWord(word);
  });
};

// TODO: status of button
const handleQueryPrev = async () => {
  dictStore.getPrevWordAct().then((word: string) => {
    queryWord(word);
  });
};

const handleSwitchTab = (payload: { dictId: number }) => {
  const dictId = payload.dictId;
  console.debug(`switch to tab ${dictId}`);
  if (childInputRef.value) {
    dictState.curDictId = dictId;
    const word = childInputRef.value.word as string;
    if (word.length > 1) {
      queryWord(word);
    }
  }
};

const handleStatsUpdate = (payload: { msg: string }) => {
  console.debug(`status: ${payload.msg}`);
  statusInfo.value = payload.msg;
}

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

  dictStore.getTabsInfo().then((tabs: ITabInfo[]) => {
    dictState.tabsInfo = tabs;
    console.log(`Startup: ${JSON.stringify(dictState.tabsInfo)}`);
  });
})

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

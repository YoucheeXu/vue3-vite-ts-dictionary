<template>
  <inputPanel ref="childInputRef" :words_dict="wordsDict" @query-word="handleQueryWord"
    @query-word-like="handleQueryWordLike" @query-next="handleQueryNext" @query-prev="handleQueryPrev" />
  <wordPanel ref="childWordRef" :word="wordRef" :audio-u-r-l="audioURLRef" :b-new="bNewRef" :level="levelRef"
    :n-stars="nStarsRef" />
  <dictPanel ref="childDictRef" :dict-u-r-l="dictURLRef" @switch-tab="handleSwitchTab"
    @stats-update="handleStatsUpdate" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import { useDictStore } from "@/stores/dict/dictStore";
import { useMessageQueueStore } from '@/stores/dict/messageQueueStore';

import inputPanel from "@/components/dictInputPanel.vue";
import wordPanel from "@/components/dictWordPanel.vue";
import dictPanel from "@/components/dictDictPanel.vue";

import type { ITabInfo } from "@/stores/dict/types";

const dictStore = useDictStore();
const dictState = dictStore.dictState;
const messageQueueStore = useMessageQueueStore();

const wordsDict = ref<Record<string, string>>({});

const childInputRef = ref<InstanceType<typeof inputPanel> | null>(null);

const childWordRef = ref<InstanceType<typeof wordPanel> | null>(null);
const wordRef = ref("");
const audioURLRef = ref("");
const bNewRef = ref(false);
const levelRef = ref("");
const nStarsRef = ref(0);

const dictURLRef = ref("");

const pronounce = () => {
  const childWord = childWordRef.value;
  childWord?.play();
};

const queryWord = async (word: string) => {
  const dictId = dictState.curDictId;
  console.log(`query ${word} in #${dictId} dict`);

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

const handleQueryWordLike = async (playload: { dictId: number, wordLike: string, limit: number }) => {
  wordsDict.value = await dictStore.query_wordlike(playload.dictId, playload.wordLike, playload.limit);
  // console.debug(`wordsDict = ${wordsDict.value}`);
}

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
  messageQueueStore.push(payload.msg);
}

onMounted(async () => {
  dictStore.getTabsInfo().then((tabs: ITabInfo[]) => {
    dictState.tabsInfo = tabs;
    console.log(`Startup: ${JSON.stringify(dictState.tabsInfo)}`);
  });
})

</script>

<style scoped>
</style>

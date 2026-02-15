import { reactive, computed } from "vue";
import { defineStore } from "pinia";
import { requestDictsInfo, requestQueryWord } from "@/service/dict";
import type { ITabInfo, IDictState, IDictInfo, IDictDetail, IWordDetail } from "./types";
import { useConfigStore } from "@/stores/configStore";

export const useDictStore = defineStore("dictState", () => {
  const dictState: IDictState = {
    tabsInfo: [],
    curDictId: -1,
    curWord: "",
  };

  // Get the singleton instance of config store (reuses existing state)
  const configStore = useConfigStore();
  const apiPrefix = computed<string>(() => {
    return configStore.config.Server.apiPrefix; // e.g., "/api"
  });

  async function getDictsInfoAct(): Promise<IDictInfo[]> {
    // const dictsInfo = (await window.ipc.invoke("app", "getTabsInfo")) as IDictInfo[];
    const result = await requestDictsInfo();
    console.log(`dicts: ${result.message}, ${result.data}, ${result.status}`);
    const dictsInfo = JSON.parse(result.data) as IDictInfo[];
    console.log(`dicts = ${dictsInfo}`);

    return dictsInfo;
  }

  async function getTabsInfoAct(): Promise<ITabInfo[]> {
    // const tabsInfo = (await window.ipc.invoke("app", "getTabsInfo")) as ITabInfo[];

    const dictsInfo = await getDictsInfoAct();

    const tabsInfo: ITabInfo[] = [];
    let i = 0;
    for (const dictInfo of dictsInfo) {
      console.log(`${dictInfo.id} = ${dictInfo.title}`);

      tabsInfo.push({
        tabId: i,
        label: dictInfo.title,
        dictId: dictInfo.id,
      });

      i += 1;
    }

    return tabsInfo;
  }

  async function queryWordAct(word: string, dictId: number): Promise<[string, string, boolean, string, number]> {
    const result = await requestQueryWord(word, dictId);
    console.log(`queryWordAct = ${JSON.stringify(result)}`);
    const wordData = result.data as IWordDetail;
    // const baseURL = "http://127.0.0.1:5000";
    // const baseURL = import.meta.env.VITE_BASE_URL;
    // const baseURL = "http://192.168.1.5:5000";
    // const baseURL = "/api";
    const baseURL = apiPrefix.value;
    console.debug(`baseURL = ${baseURL}`);
    const dictURL = `${baseURL}/${wordData.dict_url}`;
    console.debug(`dictURL = ${dictURL}`);
    const audioURL = `${baseURL}/${wordData.audio_url}`;
    console.debug(`audioURL = ${audioURL}`);
    return [dictURL, audioURL, wordData.is_new, wordData.level, wordData.stars];
  }

  async function getNextWordAct() {
    // TODO
    const word = "able";
    return word;
  }

  async function getPrevWordAct() {
    // TODO
    const word = "able";
    return word;
  }

  return {
    dictState,
    getDictsInfoAct,
    getTabsInfoAct,
    queryWordAct,
    getNextWordAct,
    getPrevWordAct,
  };
});

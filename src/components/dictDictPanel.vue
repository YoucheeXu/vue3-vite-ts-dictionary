<template>
  <div class="dict_panel">
    <!--div class = "" id = "words_list_box"
            style = "overflow:auto; height:430px; width:201px; "-->
    <select id="words_list" size="25" style="border: none; height: 430px; width: 201px; display: none; float: left">
      <!-- <option selected>word 1</option> -->
      <!-- <option>word 2</option> -->
      <!-- <option>word 3</option> -->
      <!-- <option>word 4</option> -->
      <!-- <option>word 5</option> -->
    </select>
    <!--/div-->
    <div id="contents_box" style="overflow-y: auto; height: 430px; width: 701px; float: left"
      @dragenter="handleDragEnter" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
      <!-- <div class="Word" /> -->
      <div id="tabContainer" style="width: 100%; height: 100%; position: relative; z-index: 10;">
        <el-tabs v-model="editableTabsValue" type="card" editable @edit="handleTabsEdit" @tab-click="handleClickTab">
          <el-tab-pane v-for="item in editableTabs" :key="item.tabId" :label="item.label" :name="item.dictId"
            class="drop-area" :class="{ 'drop-area--active': isDragging }">
            <iframe :src="props.dictURL" style="position: relative; width: 701px; height: 314px" frameborder="0"
              marginwidth="0" marginheight="0" allowtransparency="true" sandbox="allow-same-origin allow-scripts"
              :style="{ pointerEvents: isDragging ? 'none' : 'auto' }" @dragenter.stop.prevent @dragover.stop.prevent
              @drop.stop.prevent>
            </iframe>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <!-- /.contents_box -->
    <div class="top">
      <a onclick="window.scrollTo(0,0);" alt="Top" href="#top" title="TOP" style="color: #cc0000">TOP</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref, watchEffect } from "vue";
import { useDictStore } from "@/stores/dict/dictStore";
import type { TabsPaneContext } from "element-plus";
import type { TabPaneName } from "element-plus";
import type { ITabInfo } from "@/stores/dict/types";

const props = defineProps<{ dictURL: string }>();

const dictStore = useDictStore();
const dictState = dictStore.dictState;

// State: whether dragging over the area
const isDragging = ref(false)

let tabIndex = 1;
const editableTabsValue = ref(1);

/* const editableTabs = computed(async () => {
  const tabsInfos: ITabInfo[] = [];
  const tabs = await window.Electron.ipcRenderer.invoke('app', 'GetTabs');
  for (const key of tabs) {
    tabsInfos.push({
      title: "dict.Desc",
      name: key
    })
    tabIndex++;
  }
  editableTabsValue.value = tabsInfos[0].name;
  // rootState.curDictBase = tabsInfos[0].id;
  // console.log(`set curDictBase: ${rootState.curDictBase}`)
  console.log(tabsInfos);
  return tabsInfos;
}); */

/*const editableTabs = computed<ITabInfo[]>(() => {
    return window.electron.ipcRenderer.invoke('app', 'GetTabs').then((tabs: string[]) => {
        const tabsInfos: ITabInfo[] = [];
        for (const key of tabs) {
            tabsInfos.push({
                title: "dict.Desc",
                name: key
            })
            tabIndex++;
        }
        editableTabsValue.value = tabsInfos[0].name;
        // rootState.curDictBase = tabsInfos[0].id;
        // console.log(`set curDictBase: ${rootState.curDictBase}`)
        console.log(tabsInfos);
        return tabsInfos;
    });
});*/

/* const editableTabs = computed(() => {
  if (rootState.tabsInfo.length >= 1) {
    // console.log(rootState.tabsInfo);
    tabIndex = rootState.tabsInfo.length;
    const tabName = rootState.tabsInfo[0].name;
    editableTabsValue.value = tabName;
    rootState.curTab = tabName;
  }
  console.log(rootState.tabsInfo);
  return rootState.tabsInfo;
}); */

const editableTabs = ref<ITabInfo[]>([]);
watchEffect(() => {
  if (dictState.tabsInfo.length >= 1) {
    tabIndex = dictState.tabsInfo.length;
    editableTabsValue.value = dictState.curTabId;
  }
  // console.log(rootState.tabsInfo);
  editableTabs.value = dictState.tabsInfo;
});

// TODO: Not implemented
const handleTabsEdit = (targetName: TabPaneName | undefined, action: "remove" | "add") => {
  if (action === "add") {
    const newTabIdx = ++tabIndex;
    const newTabTitle = "New Tab";
    editableTabs.value.push({
      tabId: newTabIdx,
      label: newTabTitle,
      dictId: -1,
    });
    editableTabsValue.value = newTabIdx;
  } else if (action === "remove") {
    const tabs = editableTabs.value;
    let activeName = editableTabsValue.value;
    if (activeName === targetName) {
      tabs.forEach((tab, index) => {
        if (tab.tabId === targetName) {
          const nextTab = tabs[index + 1] || tabs[index - 1];
          if (nextTab) {
            activeName = nextTab.tabId;
          }
        }
      });
    }

    editableTabsValue.value = activeName;
    editableTabs.value = tabs.filter((tab) => tab.label !== targetName);
  }
};

const emit = defineEmits<{
  "switchTab": [payload: { dictId: number }]
  "statsUpdate": [payload: { msg: string }]
}>()

const handleClickTab = (pane: TabsPaneContext, ev: Event) => {
  // console.log(pane.paneName);
  console.debug(ev);
  const dictId = pane.paneName as number;
  emit("switchTab", { dictId });
  dictState.curTabId = editableTabsValue.value;
};

/**
 * Handle drag enter event
 * @param e DragEvent - Native drag enter event
 */
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault() // Block default behavior
  e.stopPropagation()
  isDragging.value = true
}

/**
 * Handle drag over event (critical to allow drop)
 * @param e DragEvent - Native drag over event
 */
const handleDragOver = (e: DragEvent) => {
  e.preventDefault() // Critical: Block default to allow drop
  e.stopPropagation()
  isDragging.value = true
  // Specify accepted types (optional: only accept files/folders)
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy' // Set drop effect to copy
  }
}

/**
 * Handle drag leave event
 * @param e DragEvent - Native drag leave event
 */
const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  // Only set to false if mouse leaves the entire drop area (avoid false trigger on child elements)
  const currentTarget = e.currentTarget as HTMLElement | null
  const relatedTarget = e.relatedTarget as HTMLElement | null
  if (currentTarget && relatedTarget && !currentTarget.contains(relatedTarget)) {
    isDragging.value = false
  }
}

/**
 * Type of dragged item (file/folder)
 */
interface FileItem {
  type: 'file' | 'folder'
  name: string
  size: number
  fullPath: string
  file: File
}

/**
 * List of dragged files/folders (typed as FileItem[])
 */
const fileList: Ref<FileItem[]> = ref([])

// Type guard: Check if entry is FileSystemFileEntry
const isFileEntry = (entry: FileSystemEntry): entry is FileSystemFileEntry => {
  return entry.isFile
}

// Type guard: Check if entry is FileSystemDirectoryEntry
const isDirectoryEntry = (entry: FileSystemEntry): entry is FileSystemDirectoryEntry => {
  return entry.isDirectory
}

const getFileNameWithoutExtensionRobust = (filePath: string): string => {
  const pureFileName = filePath.split(/[\\/]/).pop() || '';
  if (!pureFileName || pureFileName.lastIndexOf('.') === -1) return pureFileName;
  if (pureFileName.startsWith('.') && pureFileName.indexOf('.', 1) === -1) return pureFileName;
  return pureFileName.substring(0, pureFileName.lastIndexOf('.'));
};

// TXT line reading state (new)
const rawTxtContent: Ref<string> = ref('')
const txtLines: Ref<string[]> = ref([])
const filterEmptyLines: Ref<boolean> = ref(true)
const errorMsg: Ref<string> = ref('')

const splitLines = (): void => {
  if (!rawTxtContent.value) {
    txtLines.value = []
    return
  }
  let lines = rawTxtContent.value.split(/\r?\n|\r/) // Support all line breaks
  if (filterEmptyLines.value) {
    lines = lines.filter(line => line.trim() !== '')
  }
  txtLines.value = lines
}

async function dealWithFiles(filesList: FileItem[]) {
  for (const file of filesList) {
    const fileName = file.name
    console.debug(`${fileName}: ${file.fullPath}`)
    if (fileName.endsWith('.mp3')) {
      const ret = await dictStore.uploadAudio(1, file.file);
      const msg = ret.msg;
      console.debug(`upload audio: ${msg}`);
      emit('statsUpdate', { msg });
    } else if (fileName.endsWith('.json')) {
      const ret = await dictStore.uploadDict(dictState.curDictId, file.file);
      const msg = ret.msg;
      emit('statsUpdate', { msg });
    } else if (fileName.endsWith('.txt')) {
      // Read TXT and split lines
      const reader = new FileReader()
      reader.onload = async (event) => {
        rawTxtContent.value = event.target?.result as string
        splitLines()
        const level = getFileNameWithoutExtensionRobust(fileName);
        console.debug(`level: ${level}`);
        for (const word of txtLines.value) {
          const ret = await dictStore.addLevel(word, level);
          emit('statsUpdate', { msg: ret.msg });
        }
      }
      reader.onerror = () => {
        errorMsg.value = `Failed to read ${fileName}: ${reader.error?.message}`
      }
      reader.readAsText(file.file, 'UTF-8') // Use 'GBK' for Chinese garbled text
    } else {
      throw new Error(`Unsupported file type: ${fileName} (only .json/.mp3/.txt are allowed)`);
    }
  }
}

/**
 * Handle drop event (core logic to parse files/folders)
 * @param e DragEvent - Native drop event
 */
const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false

  // Clear previous list
  fileList.value = []

  // Get drag data (DataTransfer object)
  const items = e.dataTransfer?.items as DataTransferItem[] | undefined;
  if (!items || items.length === 0) return;

  // Parse each dragged item
  for (const item of items) {
    const entry = item.webkitGetAsEntry();
    if (entry) {
      if (isFileEntry(entry)) {
        await readFileEntry(entry);
      } else if (isDirectoryEntry(entry)) {
        await readDirectoryEntry(entry, entry.name);
      }
    }
  }
  // console.debug(fileList.value);
  await dealWithFiles(fileList.value);
}

// Parse single file entry
/**
 * Read a single file entry and add to fileList
 * @param fileEntry FileSystemFileEntry - Native file entry object
 * @returns Promise<void>
 */
const readFileEntry = (fileEntry: FileSystemFileEntry): Promise<void> => {
  return new Promise((resolve) => {
    fileEntry.file((file: File) => {
      fileList.value.push({
        type: 'file',
        name: file.name,
        size: file.size,
        fullPath: fileEntry.fullPath,
        file: file
      })
      resolve()
    })
  })
}

/**
 * Recursively read directory entry (supports nested folders)
 * @param dirEntry FileSystemDirectoryEntry - Native directory entry object
 * @param parentPath string - Parent folder path (for nested path calculation)
 * @returns Promise<void>
 */
const readDirectoryEntry = (dirEntry: FileSystemDirectoryEntry, parentPath: string): Promise<void> => {
  return new Promise((resolve) => {
    const reader: FileSystemDirectoryReader = dirEntry.createReader()
    reader.readEntries(async (entries: FileSystemEntry[]) => {
      // Add folder itself to the list
      // fileList.value.push({
      //   type: 'folder',
      //   name: dirEntry.name,
      //   size: 0, // Folders have no size by default
      //   fullPath: dirEntry.fullPath
      // })

      // Traverse sub-items of the folder
      for (const entry of entries) {
        if (isFileEntry(entry)) {
          await readFileEntry(entry)
        } else if (isDirectoryEntry(entry)) {
          await readDirectoryEntry(entry, `${parentPath}/${entry.name}`)
        }
      }
      resolve()
    })
  })
}

/**
 * Format file size (bytes → KB/MB/GB)
 * @param bytes number - File size in bytes
 * @returns string - Formatted size string (e.g., "2.56 MB")
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB'] as const
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

defineExpose({
  editableTabsValue,
});
</script>

<style scoped>
.dict_panel {
  position: absolute;
  display: inline;
  left: 0px;
  top: 143px;
  height: 370px;
  width: 701px;
  /* width: 100%; */
  margin: 0;
  padding: 0;
  border: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.drop-area {
  width: 100%;
  height: 100%;
  margin: 2px auto;
  padding: 2px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.drop-area--active {
  border-color: #409eff;
  background-color: #f5f8ff;
}
</style>

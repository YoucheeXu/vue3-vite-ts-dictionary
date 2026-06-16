<template>
  <div class="input_panel">
    <imgButton4 id="btn_prev" img="./skin/prev_btn.bmp" :width="45" :height="37" @btn-cliked="handleBtnCliked" />
    <imgButton4 id="btn_next" disabled="disabled" img="./skin/next_btn.bmp" :width="40" :height="37"
      @btn-cliked="handleBtnCliked" />
    <div class="input_box" style="width: 600px; height: 37px; background: url(./skin/combox_bk.bmp)">
      <el-autocomplete v-model="word" ref="autoCompleteRef" :fetch-suggestions="handleFetchSuggestions"
        @select="handleSelectItem" @keyup.enter.prevent="handleEnterKey" placeholder="Input word to search"
        style="width: 466px; height: 37px; border: 0px" :loading="isLoading" :debounce="300"
        popper-class="custom-autocomplete-dropdown">
        <template #default="{ item }">
          <div>
            <span>{{ item.key }}</span>
            <span style="margin-left: 10px">{{ item.value }}</span>
          </div>
        </template>
      </el-autocomplete>
      <imgButton3 id="btn_del" img="./skin/delete_item.bmp" :width="30" :height="34" @btn-cliked="handleBtnCliked" />
      <imgButton3 id="btn_drop" img="./skin/combobox_drop_btn.bmp" :width="20" :height="34"
        @btn-cliked="handleBtnCliked" />
      <imgButton3 id="btn_lookup" img="./skin/lookup_btn.bmp" :width="110" :height="37" @btn-cliked="handleBtnCliked" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { nextTick } from "vue";
import imgButton3 from "@/base-ui/imgButton3.vue";
import imgButton4 from "@/base-ui/imgButton4.vue";

const props = defineProps<{
  words_dict?: Record<string, string>;
}>();

const emit = defineEmits<{
  "queryWord": [],
  "queryWordLike": [playload: { dictId: number, wordLike: string, limit: number }]
  "queryPrev": [],
  "queryNext": [],
}>();

// const word = defineModel();
const word = ref("");
const autoCompleteRef = ref<InstanceType<typeof import('element-plus')['ElAutocomplete']>>();
let nativeInput: HTMLInputElement | null = null;
const isLoading = ref(false);
// Store the latest callback for refreshing suggestions
const latestSuggestionCallback = ref<((results: any[]) => void) | null>(null);

// Convert Record to Array (dropdown needs array, not object)
const dropdownOptions = computed(() => {
  if (!props.words_dict) return [];
  // Convert Record to array: { key: string, value: string }[]
  return Object.entries(props.words_dict).map(([key, value]) => ({ key, value }));
});

onMounted(() => {
  // 获取原生 input DOM
  const inputInstance = autoCompleteRef.value?.inputRef
  if (inputInstance) {
    nativeInput = (inputInstance.input || inputInstance.$el?.querySelector('input')) as HTMLInputElement
    // 捕获阶段绑定，确保先于组件内部监听器执行
    nativeInput?.addEventListener('keydown', handleNativeKeyDown, true)
  }
})

// Handle input change & emit query to parent
const handleFetchSuggestions = (query: string, callback: (results: any[]) => void) => {
  // Save the callback for later refresh
  latestSuggestionCallback.value = callback;

  // Only emit if input is not empty (adjust as needed)
  if (query.trim()) {
    isLoading.value = true;
    emit('queryWordLike', {
      dictId: 0,
      wordLike: `${query}*`, // Add * as required
      limit: 10
    });
    callback([]);
  } else {
    // If input is empty, clear dropdown
    callback([]);
    isLoading.value = false;
  }
};

const focusAndSelectInput = async () => {
  await nextTick(); // Wait for DOM to update (after dropdown closes)
  // Get the underlying input DOM element
  const inputInstance = autoCompleteRef.value?.inputRef
  if (!inputInstance) return;

  inputInstance.focus(); // Regain focus
  // inputInstance.select(); // Select all text in input
  const nativeInput = inputInstance.input || inputInstance.$el?.querySelector('input')
  nativeInput?.select();
};

const closeDropdown = async () => {
  if (latestSuggestionCallback.value) {
    latestSuggestionCallback.value([]); // No suggestions = dropdown closes
  }

  isLoading.value = false;

  if (autoCompleteRef.value) {
    // autoCompleteRef.value.blur();
    autoCompleteRef.value.close();
  }

  if (autoCompleteRef.value?.popperRef) {
    autoCompleteRef.value.popperRef.hide(); // Official hide method
  }
};

// Update dropdown when props.words_dict changes (watch props)
watch(
  () => props.words_dict,
  () => {
    isLoading.value = false;
    // Trigger autocomplete to refresh suggestions with new data
    // Only refresh if we have a valid callback and input is not empty
    if (latestSuggestionCallback.value && word.value.trim()) {
      // Pass updated dropdown options to the autocomplete
      latestSuggestionCallback.value(dropdownOptions.value);
    }
  },
  { immediate: true, deep: true } // Run on initial mount, deep: watch Record key/value changes
);

// Handle dropdown item selection
const handleSelectItem = (item: Record<string, any>) => {
  word.value = item.key;
};

// Handle Enter key press (Core Feature)
const handleEnterKey = () => {
  handleQueryWord();
};

/**
 * Handles native Home/End key events to preserve default cursor behavior.
 * Stops event propagation to prevent the autocomplete component from
 * intercepting and overriding native cursor navigation.
 * @param e - Native DOM keyboard event instance
 */
const handleNativeKeyDown = (e: KeyboardEvent): void => {
  if (e.key === 'Home' || e.key === 'End') {
    // Prevent the event from bubbling up to the component's internal key handler
    e.stopPropagation()
    // Browser will execute native cursor jump behavior by default
  }
}

const handleBtnCliked = (id: string) => {
  console.debug(id + " was clicked!");
  switch (id) {
    case "btn_del":
      word.value = "";
      break;
    case "btn_prev":
      emit("queryPrev");
      break;
    case "btn_next":
      emit("queryNext");
      break;
    case "btn_lookup":
      emit("queryWord");
      break;
    default:
    // rootState.info(id);
  }
};

const handleQueryWord = async () => {
  emit("queryWord");
  await closeDropdown();
  await focusAndSelectInput();
};

defineExpose({
  word,
});

onBeforeUnmount(() => {
  // 解绑事件，避免内存泄漏
  nativeInput?.removeEventListener('keydown', handleNativeKeyDown, true)
  nativeInput = null
})

</script>

<style scoped>
.input_panel {
  position: absolute;
  left: 0px;
  top: 35px;
  width: 701px;
  /* width: 100%; */
  height: 48px;
  margin: 0;
  padding: 0;
  border: 0;
  box-sizing: border-box;
  overflow: hidden;
  background-color: #f0f0f0;
}

#btn_prev {
  outline: none;
  border: none;
  position: relative;
  left: 10px;
  top: 10px;
}

#btn_next {
  outline: none;
  border: none;
  position: absolute;
  left: 55px;
  top: 10px;
}

.input_box {
  position: absolute;
  top: 10px;
  left: 95px;
  width: 486px;
  height: 32px;
}

#btn_del {
  position: absolute;
  top: 1px;
  left: 436px;
}

#btn_drop {
  position: absolute;
  top: 1px;
  left: 466px;
}

#btn_lookup {
  position: absolute;
  top: 0px;
  left: 486px;
}
</style>

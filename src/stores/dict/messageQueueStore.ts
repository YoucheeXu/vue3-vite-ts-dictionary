// src/stores/stringArrayStore.ts (Simplified)
import { defineStore } from "pinia";
import { ref } from "vue";

// Universal type for timer (environment-agnostic)
export type TimerId = ReturnType<typeof setInterval>;

export const useMessageQueueStore = defineStore("messageQueue", () => {
    // Shared string array (multi components can push)
    const messageQueue = ref<string[]>([]);

    // Push method (exposed for all components)
    const push = (str: string) => {
        if (str.trim()) {
            // Avoid empty strings
            messageQueue.value.push(str);
        }
    };

    // Only expose necessary state/methods
    return { messageQueue, push };
});

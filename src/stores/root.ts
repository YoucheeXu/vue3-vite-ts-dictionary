import { resolve } from "path";
import { defineStore } from "pinia";

export interface IRootState {
  baseURL: string;
  timeout: number;
}

export const useRootStore = defineStore("rootState", () => {
    const rootState: IRootState = {
        // baseURL: "http://127.0.0.1:5000",
        baseURL: "/api",
        timeout: 1000,
    };

    async function waitForPyWebview(timeout: number = 1000) {
        return new Promise((resolve) => {
            const interval = setInterval(()=>{
                // check if pywebview.api exists
                if (window.pywebview?.api) {
                    clearInterval(interval);
                    resolve(true);
                }
            }, 100) // check every 100ms

            // Timeout to prevent infinite waiting
            setTimeout(() => {
                clearInterval(interval);
                resolve(false);
            }, timeout)
        })
    }

    async function fullscreen() {
        const result = window.pywebview.api.invoke("fullscreen");
        console.debug(result);
    }

    async function quit(): Promise<void> {
        // window.ipc.invoke("app", "quit");
        const result = window.pywebview.api.invoke("quit");
        console.debug(result);
    }

    return {
        rootState,
        waitForPyWebview,
        fullscreen,
        quit
    };
});

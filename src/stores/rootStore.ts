import { resolve } from "path";
import { defineStore } from "pinia";

export interface IRootState {
  baseURL: string;
  timeout: number;
  isPyWebviewReady: boolean;
}

export const useRootStore = defineStore("rootState", () => {
    const rootState: IRootState = {
        // baseURL: "http://127.0.0.1:5000",
        baseURL: "/api",
        timeout: 1000,
        isPyWebviewReady: false
    };

    async function waitForPyWebview(timeout: number = 1000): Promise<boolean> {
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

  async function minimize(): Promise<void> {
    // window.ipc.invoke("app", "minimize");
    const result = window.pywebview.api.invoke("minimize");
    console.debug(result)
  }

  async function resize(width: number, height: number): Promise<void> {
    try {
        // const params = [width, height];
        const result = window.pywebview.api.invoke("resize", width, height);
        // const result = window.pywebview.api.invoke("resize", width);
        console.debug(result)
    } catch(error){
        console.error(error);
    }
  }

  async function top(isTop: boolean) {
    const result = window.pywebview.api.invoke("top", (isTop = isTop));
    console.debug(result)
  }

    async function fullscreen() {
        if (rootState.isPyWebviewReady) {
            const result = window.pywebview.api.invoke("fullscreen");
            console.debug(result);
        } else {
            // document.documentElement.requestFullscreen();
        }
    }

    async function quit(): Promise<void> {
        // window.ipc.invoke("app", "quit");
        if (rootState.isPyWebviewReady) {
            const result = window.pywebview.api.invoke("quit");
            console.debug(result);
        } else {

        }
    }

    return {
        rootState,
        waitForPyWebview,
        minimize,
        resize,
        top,
        fullscreen,
        quit
    };
});

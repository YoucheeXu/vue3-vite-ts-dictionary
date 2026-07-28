import { ref } from "vue";
import { defineStore } from "pinia";
import { useConfigStore } from "@/stores/configStore";

// Judge if current environment is local file (file:// protocol)
// const isLocalFileEnv = window.location.protocol === 'file:'

export interface IRootState {
  baseURL: string;
  serverUrl: string;
  timeout: number;
  isPyWebviewReady: boolean;
}

export const useRootStore = defineStore("rootState", () => {
    const configStore = useConfigStore();

    const rootState: IRootState = {
        // baseURL: "http://127.0.0.1:5000",
        baseURL: process.env.NODE_ENV === 'development'? configStore.config.Server.apiPrefix: configStore.config.Server.serverUrl,
        serverUrl: configStore.config.Server.serverUrl,
        timeout: configStore.config.Server.timeout,
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

  async function moveWindow(deltaX: number, deltaY: number): Promise<void> {
      window.pywebview.api.invoke("moveWindow", deltaX, deltaY);
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

    async function restart(): Promise<void> {
        // window.ipc.invoke("app", "quit");
        if (rootState.isPyWebviewReady) {
            const result = window.pywebview.api.invoke("restart");
            console.debug(result);
        } else {

        }
    }
    
    async function modifyTitle(title: string){
      const result = window.pywebview.api.invoke("ModifyTitle", (title = title));
      console.debug(result)
    }

    return {
        rootState,
        waitForPyWebview,
        moveWindow,
        minimize,
        resize,
        top,
        fullscreen,
        quit,
        restart,
        modifyTitle
    };
});

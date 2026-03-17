/// <reference types="vite/client" />

declare module "*.vue" {
    import type { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

// 6.1 版本的 pywebview 类型声明
declare interface Window {
    handlePythonMessage: (message: string) => void;
    pywebview: {
        api: {
            invoke: (
                idmsg: string,
                ...args: any[]
            ) => Promise<{
                code: number;
                msg?: string;
                data?: any;
                params?: Record<string, any>;
            }>;
        };
    };
    handlePythonCommand: (command: string, params: Record<string, any>) => void;
}

declare const __BUILD_TIME__: string;

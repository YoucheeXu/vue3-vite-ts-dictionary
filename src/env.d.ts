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
            hello: (name: string) => Promise<string>;
            // 后续添加更多 Python API 方法
        };
    };
}

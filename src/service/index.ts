// service unfity interface
import CNetRequest from "./request";
import { useRootStore } from "@/stores/rootStore";

const rootState = useRootStore();

const netRequest = new CNetRequest({
    // baseURL: "http://127.0.0.1:5000",
    // baseURL: '/api',
    // baseURL: import.meta.env.VITE_BASE_URL,
    baseURL: rootState.rootState.baseURL,
    // timeout: import.meta.env.VITE_NET_TIMEOUT,
    timeout: rootState.rootState.timeout,
    interceptors: {
        requestInterceptor: (config) => {
            const token = "";
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        requestInterceptorCatch: (err) => {
            console.log("requset fail intercetpor");
            return err;
        },
        responseInterceptor: (config) => {
            console.log("请求配置：", config);
            return config;
        },
        responseInterceptorCatch: (err) => {
            console.log("response fail intercetpor: " + err.code);
            return err;
        },
    },
});

export default netRequest;

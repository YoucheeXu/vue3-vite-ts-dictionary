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
            console.error("requset fail intercetpor");
            return Promise.reject(err);
        },
        responseInterceptor: (config) => {
            console.error("请求配置：", config);
            return config;
        },
        responseInterceptorCatch: (err) => {
            console.error("response fail intercetpor: " + err.code);
            console.error("response fail intercetpor: " + err.response?.data?.msg);
            // return err;
            return Promise.reject(err);
        },
    },
});

export default netRequest;

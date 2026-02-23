import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/* interface NetRequestInterceptors<T = AxiosResponse> {
    requestInterceptor?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig,
    requestInterceptorCatch?: (error: any) => any,
    responseInterceptor?: <config: T) => T,
    responseInterceptorCatch?: (error: any) => any
} */

interface NetRequestInterceptors {
    requestInterceptor?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig,
    requestInterceptorCatch?: (error: any) => any,
    responseInterceptor?: <T = AxiosResponse>(config: T) => T,
    responseInterceptorCatch?: (error: any) => any
}

interface NetRequestConfig extends AxiosRequestConfig {
    interceptors?: NetRequestInterceptors,
    /*headers: {
        Accept: "AxiosHeaderValue",
        "Content-Length": "AxiosHeaderValue",
        "User-Agent": "AxiosHeaderValue",
        "Content-Encoding": "AxiosHeaderValue",
        Authorization: "AxiosHeaderValue",
        AxiosHeaders: axiosHeaders
    },*/
}

// HTTP error status code - prompt message mapping table
const mapErrorStatus = new Map([
  [400, 'Bad Request (400): Invalid parameters or incorrect request format'],
  [401, 'Unauthorized (401): Please log in again to get access permissions'],
  [403, 'Forbidden (403): You do not have permission to access this interface'],
  [404, 'Not Found (404): The requested interface address does not exist'],
  [405, 'Method Not Allowed (405): The current request method is not supported'],
  [408, 'Request Timeout (408): Please check your network or try again later'],
  [500, 'Internal Server Error (500): The server failed to process the request'],
  [501, 'Not Implemented (501): The server has not implemented this function yet'],
  [502, 'Bad Gateway (502): The server received an invalid response as a gateway'],
  [503, 'Service Unavailable (503): The server is temporarily overloaded or under maintenance'],
  [504, 'Gateway Timeout (504): The server timed out as a gateway'],
  [505, 'HTTP Version Not Supported (505): The server does not support the current HTTP version']
]);

class CNetRequest {
    instance: AxiosInstance;
    // Custom interceptors
    interceptors?: NetRequestInterceptors;

    constructor(config: NetRequestConfig) {
        this.instance = axios.create(config);

        this.interceptors = config.interceptors;

        // interceptors for single instance
        this.instance.interceptors.request.use(
            this.interceptors?.requestInterceptor,
            this.interceptors?.requestInterceptorCatch
        )
        this.instance.interceptors.response.use(
            this.interceptors?.responseInterceptor,
            this.interceptors?.responseInterceptorCatch
        )

        // interceptors for all instance
        this.instance.interceptors.request.use((config) => {
            return config;
        }, err => {
            console.log("instance for all interceptor request fail");
            return err;
        })
        this.instance.interceptors.response.use((res) => {
            return res.data;
        }, (err) => {
            console.log("instance for all interceptor response fail");
            console.log(err.response.status);   // error code like 404
            const status = err.response.status;
            const errorMsg = mapErrorStatus.get(status) || `Unkown Error(${status || 'No Error Code'})`;
            console.error(`[HTTP Error]${errorMsg}`);
            // Throw structured error (easy for business layer to catch)
            err.customMessage = errorMsg; // Add custom prompt to error object
            return err;
        })
    }

    request<T = any>(config: NetRequestConfig): Promise<T> {
        return new Promise((resolve, reject) => {
            if (config.interceptors?.requestInterceptor) {
                config = config.interceptors.requestInterceptor(config as any);
            }
            this.instance.request<any, T, any>(config).then((res) => {
                if (config.interceptors?.responseInterceptor) {
                    res = config.interceptors.responseInterceptor<T>(res);
                }
                // console.log(res);
                resolve(res);
            }).catch(err => {
                reject(err);
                return err;
            })
            // .finally(() => {})
        })
    }

    get<T = any>(config: NetRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'GET' });
    }

    post<T = any>(config: NetRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'POST' });
    }
    
    put<T = any>(config: NetRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'PUT' });
    }

    delete<T = any>(config: NetRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'DELETE' });
    }

    patch<T = any>(config: NetRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'PATCH' });
    }
}

export default CNetRequest;
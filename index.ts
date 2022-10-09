import axios, {
    AxiosRequestConfig, AxiosResponse, CancelTokenSource, RawAxiosRequestHeaders
} from 'axios';

export interface AxiosChainConfig extends AxiosRequestConfig {
    repeatCancel?: boolean;
    mergeSameRequest?: boolean;
    retryCount?: number;
    cache?: boolean;
    // 单位ms
    cacheTime?: number;
}

export type AxiosChainInterceptor<T = any> = (config: AxiosChainConfig) => ((promise: Promise<T>) => any) | (Promise<(promise: Promise<T>) => any>) | void | Promise<void>;

type AxiosChainMixType<S, P> = (keyof P extends never ? S : {
    [K in keyof (S & P)]: K extends keyof S ? S[K] : (S & P)[K]
} & S)

type AxiosChainType<S, P> = keyof P extends keyof AxiosResponse ? P extends AxiosResponse ? AxiosResponse<S> : AxiosChainMixType<S, P> : AxiosChainMixType<S, P>

class AxiosChainResponse<T = any, P = AxiosResponse> implements Promise<AxiosChainType<T, P>> {
    private static cancleMap = new Map<string, CancelTokenSource>();
    private static runPromiseMap = new Map<string, Promise<any>>();

    private promise: Promise<AxiosChainType<T, P>>;
    private config: AxiosChainConfig;
    private cancleSource: CancelTokenSource;
    private retryCount: number;
    private enableInterceptor: boolean = true;
    private interceptors: Array<AxiosChainInterceptor> = [];
    private originalData?: AxiosChainType<any, AxiosResponse>;

    constructor(config: AxiosChainConfig) {
        this.config = config;
        this.retryCount = config.retryCount || 0;
        this.cancleSource = axios.CancelToken.source();
        this.promise = new Promise<AxiosChainType<T, P>>((resolve, reject) => {
            setTimeout(async () => {
                const { url, method, data = {}, params = {}, cache, cacheTime, repeatCancel, mergeSameRequest } = this.config;

                const key = `${url}&${method}&${JSON.stringify(Object.keys(data))}&${JSON.stringify(Object.values(data))}&${JSON.stringify(Object.keys(params))}&${JSON.stringify(Object.values(params))}`;

                const interceptors = [];

                if (this.enableInterceptor) {
                    for (const fn of this.interceptors) {
                        const value = fn(config);
                        if (value instanceof Promise) {
                            const result = await value;
                            if (result) {
                                interceptors.unshift(result);
                            }
                        } else if (value) {
                            interceptors.unshift(value);
                        }
                    }
                }

                const interceptor = interceptors.reduce((a, b) => (promise) => {
                    const newb = (p: Promise<any>) => {
                        try {
                            if (!b) {
                                return p;
                            }
                            const result = b(p);
                            if (!result) {
                                return p;
                            }
                            return result instanceof Promise ? result : Promise.resolve(result);
                        } catch (error) {
                            return Promise.reject(error);
                        }
                    };
                    return a(newb(promise)) || promise;
                }, (v) => v);

                const creatRequest = () => {
                    if (cache) {
                        const resulKext = localStorage.getItem(key);
                        if (resulKext) {
                            const result = JSON.parse(resulKext);
                            if (!result.time || result.time && result.time - Date.now() > 0) {
                                return Promise.resolve(result);
                            }
                        }
                    }
                    if (repeatCancel) {
                        const cancelSource = AxiosChainResponse.cancleMap.get(key);
                        if (cancelSource) {
                            AxiosChainResponse.cancleMap.delete(key);
                            cancelSource.cancel();
                        }
                        AxiosChainResponse.cancleMap.set(key, this.cancleSource);
                    }
                    if (mergeSameRequest) {
                        const runPromise = AxiosChainResponse.runPromiseMap.get(key);
                        if (runPromise) {
                            runPromise.finally(() => {
                                AxiosChainResponse.runPromiseMap.delete(key);
                            });
                            return runPromise;
                        }
                    }
                    const promise = axios.request<T>({
                        ...this.config,
                        cancelToken: this.cancleSource.token
                    });
                    if (cache) {
                        promise.then((response) => {
                            localStorage.setItem(key, JSON.stringify({ ...response, time: cacheTime ? cacheTime + Date.now() : 0, request: undefined }));
                        });
                    }
                    AxiosChainResponse.runPromiseMap.set(key, promise);
                    return promise;
                };

                const newResolve = (response: any) => {
                    this.originalData = response;
                    return interceptor(Promise.resolve(response)).then(resolve);
                };

                const newReject = (reason: any) => {
                    if (this.retryCount && !axios.isCancel(reason)) {
                        this.retryCount--;
                        creatRequest().then(newResolve, newReject).catch(newReject);
                        return
                    }
                    reject(reason);
                };

                creatRequest().then(newResolve, newReject).catch(newReject);
            }, 0);
        });
    }

    disableInterceptor<V = T>(): AxiosChainResponse<V> {
        this.enableInterceptor = false;
        return this as any;
    }

    use<S = P, K = T>(fn: AxiosChainInterceptor): AxiosChainResponse<K, S> {
        this.interceptors.push(fn);
        return this as any;
    }

    retry(retry: number) {
        this.retryCount = retry;
        return this;
    }

    /**
     * @description 启用本地缓存
     * @param expireTime 单位毫秒 失效时间
     * @returns
     */
    enableCache(expireTime?: number) {
        this.config.cacheTime = expireTime;
        this.config.cache = true;
        return this;
    }

    disableCache() {
        this.config.cacheTime = undefined;
        this.config.cache = false;
        return this;
    }

    /**
     * @description 合并相同请求 如果在请求之前 有一个相同的请求还在执行 会复用这个执行的请求
     * @returns
     */
    enableMergeSameRequest() {
        this.config.mergeSameRequest = true;
        return this;
    }

    disableMergeSameRequest() {
        this.config.mergeSameRequest = false;
        return this;
    }

    /**
   * @description 取消重复请求
   * @returns
   */
    enableRepeatCancel() {
        this.config.repeatCancel = true;
        return this;
    }

    disableRepeatCancel() {
        this.config.repeatCancel = false;
        return this;
    }

    /**
     * @description 取消请求
     * @param text
     * @returns
     */
    cancel(text?: string) {
        this.cancleSource.cancel(text);
        return this;
    }

    getData<K = P extends AxiosResponse ? T : any>(): Promise<K> {
        const promise: Promise<AxiosResponse['data']> = this.promise as any;
        return promise.then((item) => this.originalData?.data);
    }

    send(data: Record<string, any>, mix = true) {
        this.config.data = mix ? {
            ...this.config.data,
            ...data
        } : data;
        return this;
    }

    query(params: Record<string, any>, mix = true) {
        this.config.params = mix ? {
            ...this.config.params,
            ...params
        } : params;
        return this;
    }

    setConfig(options: AxiosChainConfig, mix = true) {
        this.config = mix ? {
            ...this.config,
            ...options
        } : options;
        return this;
    }

    setHeaders(headers: RawAxiosRequestHeaders, mix = true) {
        this.config.headers = mix ? { ...this.config.headers, ...headers } : headers;
        return this;
    }

    headerFromData() {
        return this.setHeaders({ 'Content-Type': 'multipart/form-data' });
    }

    headerJson() {
        return this.setHeaders({ 'Content-Type': 'application/json' });
    }

    headerFormUrlencoded() {
        return this.setHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    }

    then<TResult1 = AxiosChainType<T, P>, TResult2 = never>(onfulfilled?: (value: AxiosChainType<T, P>) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): Promise<TResult1 | TResult2> {
        return this.promise.then(onfulfilled, onrejected);
    }
    catch<TResult = never>(onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<AxiosChainType<T, P> | TResult> {
        return this.promise.catch(onrejected);
    }
    finally(onfinally?: () => void): Promise<AxiosChainType<T, P>> {
        return this.promise.finally(onfinally);
    }
    [Symbol.toStringTag] = 'AxiosChainResponse';
}

class AxiosChain<T = AxiosResponse> {
    private config?: AxiosChainConfig;
    private interceptors: Array<AxiosChainInterceptor> = [];

    constructor(config?: AxiosChainConfig) {
        this.config = config;
    }

    public static request<S = any, P = AxiosResponse>(config: AxiosChainConfig) {
        return new AxiosChainResponse<S, P>(config);
    }

    public static get<S = any, P = AxiosResponse>(url: string, params?: Record<string, any>) {
        return AxiosChain.request<S, P>({
            url,
            method: 'get',
            params
        });
    }

    public static post<S = any, P = AxiosResponse>(url: string, data?: Record<string, any>) {
        return AxiosChain.request<S, P>({
            url,
            data,
            method: 'post'
        });
    }

    public use<P = T>(fn: AxiosChainInterceptor<AxiosChainType<any, T>>): AxiosChain<P> {
        this.interceptors.push(fn);
        return this as any;
    }

    public request<S = any>(config: AxiosChainConfig) {
        const promise = new AxiosChainResponse<S, T>({
            ...this.config,
            ...config
        });
        this.interceptors.forEach((fn) => {
            promise.use(fn);
        });
        return promise;
    }

    public get<S = any>(url: string, params?: Record<string, any>) {
        return this.request<S>({
            url,
            method: 'get',
            params,
        });
    }

    public post<S = any>(url: string, data?: Record<string, any>) {
        return this.request<S>({
            url,
            data,
            method: 'post'
        });
    }
}

export default AxiosChain;

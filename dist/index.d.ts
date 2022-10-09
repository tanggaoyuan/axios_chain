import { AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from 'axios';
export interface AxiosChainConfig extends AxiosRequestConfig {
    repeatCancel?: boolean;
    mergeSameRequest?: boolean;
    retryCount?: number;
    cache?: boolean;
    cacheTime?: number;
}
export declare type AxiosChainInterceptor<T = any> = (config: AxiosChainConfig) => ((promise: Promise<T>) => any) | (Promise<(promise: Promise<T>) => any>) | void | Promise<void>;
declare type AxiosChainMixType<S, P> = (keyof P extends never ? S : {
    [K in keyof (S & P)]: K extends keyof S ? S[K] : (S & P)[K];
} & S);
declare type AxiosChainType<S, P> = keyof P extends keyof AxiosResponse ? P extends AxiosResponse ? AxiosResponse<S> : AxiosChainMixType<S, P> : AxiosChainMixType<S, P>;
declare class AxiosChainResponse<T = any, P = AxiosResponse> implements Promise<AxiosChainType<T, P>> {
    private static cancleMap;
    private static runPromiseMap;
    private promise;
    private config;
    private cancleSource;
    private retryCount;
    private enableInterceptor;
    private interceptors;
    private originalData?;
    constructor(config: AxiosChainConfig);
    disableInterceptor<V = T>(): AxiosChainResponse<V>;
    use<S = P, K = T>(fn: AxiosChainInterceptor): AxiosChainResponse<K, S>;
    retry(retry: number): this;
    /**
     * @description 启用本地缓存
     * @param expireTime 单位毫秒 失效时间
     * @returns
     */
    enableCache(expireTime?: number): this;
    disableCache(): this;
    /**
     * @description 合并相同请求 如果在请求之前 有一个相同的请求还在执行 会复用这个执行的请求
     * @returns
     */
    enableMergeSameRequest(): this;
    disableMergeSameRequest(): this;
    /**
   * @description 取消重复请求
   * @returns
   */
    enableRepeatCancel(): this;
    disableRepeatCancel(): this;
    /**
     * @description 取消请求
     * @param text
     * @returns
     */
    cancel(text?: string): this;
    getData<K = P extends AxiosResponse ? T : any>(): Promise<K>;
    send(data: Record<string, any>, mix?: boolean): this;
    query(params: Record<string, any>, mix?: boolean): this;
    setConfig(options: AxiosChainConfig, mix?: boolean): this;
    setHeaders(headers: RawAxiosRequestHeaders, mix?: boolean): this;
    headerFromData(): this;
    headerJson(): this;
    headerFormUrlencoded(): this;
    then<TResult1 = AxiosChainType<T, P>, TResult2 = never>(onfulfilled?: (value: AxiosChainType<T, P>) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<AxiosChainType<T, P> | TResult>;
    finally(onfinally?: () => void): Promise<AxiosChainType<T, P>>;
    [Symbol.toStringTag]: string;
}
declare class AxiosChain<T = AxiosResponse> {
    private config?;
    private interceptors;
    constructor(config?: AxiosChainConfig);
    static request<S = any, P = AxiosResponse>(config: AxiosChainConfig): AxiosChainResponse<S, P>;
    static get<S = any, P = AxiosResponse>(url: string, params?: Record<string, any>): AxiosChainResponse<S, P>;
    static post<S = any, P = AxiosResponse>(url: string, data?: Record<string, any>): AxiosChainResponse<S, P>;
    use<P = T>(fn: AxiosChainInterceptor<AxiosChainType<any, T>>): AxiosChain<P>;
    request<S = any>(config: AxiosChainConfig): AxiosChainResponse<S, T>;
    get<S = any>(url: string, params?: Record<string, any>): AxiosChainResponse<S, T>;
    post<S = any>(url: string, data?: Record<string, any>): AxiosChainResponse<S, T>;
}
export default AxiosChain;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class AxiosChainResponse {
    constructor(config) {
        this.enableInterceptor = true;
        this.interceptors = [];
        this[_a] = 'AxiosChainResponse';
        this.config = config;
        this.retryCount = config.retryCount || 0;
        this.cancleSource = axios_1.default.CancelToken.source();
        this.promise = new Promise((resolve, reject) => {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                const { url, method, data = {}, params = {}, cache, cacheTime, repeatCancel, mergeSameRequest } = this.config;
                const key = `${url}&${method}&${JSON.stringify(Object.keys(data))}&${JSON.stringify(Object.values(data))}&${JSON.stringify(Object.keys(params))}&${JSON.stringify(Object.values(params))}`;
                const interceptors = [];
                if (this.enableInterceptor) {
                    for (const fn of this.interceptors) {
                        const value = fn(config);
                        if (value instanceof Promise) {
                            const result = yield value;
                            if (result) {
                                interceptors.unshift(result);
                            }
                        }
                        else if (value) {
                            interceptors.unshift(value);
                        }
                    }
                }
                const interceptor = interceptors.reduce((a, b) => (promise) => {
                    const newb = (p) => {
                        try {
                            if (!b) {
                                return p;
                            }
                            const result = b(p);
                            if (!result) {
                                return p;
                            }
                            return result instanceof Promise ? result : Promise.resolve(result);
                        }
                        catch (error) {
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
                    const promise = axios_1.default.request(Object.assign(Object.assign({}, this.config), { cancelToken: this.cancleSource.token }));
                    if (cache) {
                        promise.then((response) => {
                            localStorage.setItem(key, JSON.stringify(Object.assign(Object.assign({}, response), { time: cacheTime ? cacheTime + Date.now() : 0, request: undefined })));
                        });
                    }
                    AxiosChainResponse.runPromiseMap.set(key, promise);
                    return promise;
                };
                const newResolve = (response) => {
                    this.originalData = response;
                    return interceptor(Promise.resolve(response)).then(resolve);
                };
                const newReject = (reason) => {
                    if (this.retryCount && !axios_1.default.isCancel(reason)) {
                        this.retryCount--;
                        creatRequest().then(newResolve, newReject).catch(newReject);
                        return;
                    }
                    reject(reason);
                };
                creatRequest().then(newResolve, newReject).catch(newReject);
            }), 0);
        });
    }
    disableInterceptor() {
        this.enableInterceptor = false;
        return this;
    }
    use(fn) {
        this.interceptors.push(fn);
        return this;
    }
    retry(retry) {
        this.retryCount = retry;
        return this;
    }
    /**
     * @description 启用本地缓存
     * @param expireTime 单位毫秒 失效时间
     * @returns
     */
    enableCache(expireTime) {
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
    cancel(text) {
        this.cancleSource.cancel(text);
        return this;
    }
    getData() {
        const promise = this.promise;
        return promise.then((item) => { var _b; return (_b = this.originalData) === null || _b === void 0 ? void 0 : _b.data; });
    }
    send(data, mix = true) {
        this.config.data = mix ? Object.assign(Object.assign({}, this.config.data), data) : data;
        return this;
    }
    query(params, mix = true) {
        this.config.params = mix ? Object.assign(Object.assign({}, this.config.params), params) : params;
        return this;
    }
    setConfig(options, mix = true) {
        this.config = mix ? Object.assign(Object.assign({}, this.config), options) : options;
        return this;
    }
    setHeaders(headers, mix = true) {
        this.config.headers = mix ? Object.assign(Object.assign({}, this.config.headers), headers) : headers;
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
    then(onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    }
    catch(onrejected) {
        return this.promise.catch(onrejected);
    }
    finally(onfinally) {
        return this.promise.finally(onfinally);
    }
}
_a = Symbol.toStringTag;
AxiosChainResponse.cancleMap = new Map();
AxiosChainResponse.runPromiseMap = new Map();
class AxiosChain {
    constructor(config) {
        this.interceptors = [];
        this.config = config;
    }
    static request(config) {
        return new AxiosChainResponse(config);
    }
    static get(url, params) {
        return AxiosChain.request({
            url,
            method: 'get',
            params
        });
    }
    static post(url, data) {
        return AxiosChain.request({
            url,
            data,
            method: 'post'
        });
    }
    use(fn) {
        this.interceptors.push(fn);
        return this;
    }
    request(config) {
        const promise = new AxiosChainResponse(Object.assign(Object.assign({}, this.config), config));
        this.interceptors.forEach((fn) => {
            promise.use(fn);
        });
        return promise;
    }
    get(url, params) {
        return this.request({
            url,
            method: 'get',
            params,
        });
    }
    post(url, data) {
        return this.request({
            url,
            data,
            method: 'post'
        });
    }
}
exports.default = AxiosChain;

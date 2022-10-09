"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var axios_1 = __importDefault(require("axios"));
var AxiosChainResponse = /** @class */ (function () {
    function AxiosChainResponse(config) {
        var _this = this;
        this.enableInterceptor = true;
        this.interceptors = [];
        this[_a] = 'AxiosChainResponse';
        this.config = config;
        this.retryCount = config.retryCount || 0;
        this.cancleSource = axios_1["default"].CancelToken.source();
        this.promise = new Promise(function (resolve, reject) {
            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                var _b, url, method, _c, data, _d, params, cache, cacheTime, repeatCancel, mergeSameRequest, key, interceptors, _i, _e, fn, value, result, interceptor, creatRequest, newResolve, newReject;
                var _this = this;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _b = this.config, url = _b.url, method = _b.method, _c = _b.data, data = _c === void 0 ? {} : _c, _d = _b.params, params = _d === void 0 ? {} : _d, cache = _b.cache, cacheTime = _b.cacheTime, repeatCancel = _b.repeatCancel, mergeSameRequest = _b.mergeSameRequest;
                            key = "".concat(url, "&").concat(method, "&").concat(JSON.stringify(Object.keys(data)), "&").concat(JSON.stringify(Object.values(data)), "&").concat(JSON.stringify(Object.keys(params)), "&").concat(JSON.stringify(Object.values(params)));
                            interceptors = [];
                            if (!this.enableInterceptor) return [3 /*break*/, 5];
                            _i = 0, _e = this.interceptors;
                            _f.label = 1;
                        case 1:
                            if (!(_i < _e.length)) return [3 /*break*/, 5];
                            fn = _e[_i];
                            value = fn(config);
                            if (!(value instanceof Promise)) return [3 /*break*/, 3];
                            return [4 /*yield*/, value];
                        case 2:
                            result = _f.sent();
                            if (result) {
                                interceptors.unshift(result);
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            if (value) {
                                interceptors.unshift(value);
                            }
                            _f.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 1];
                        case 5:
                            interceptor = interceptors.reduce(function (a, b) { return function (promise) {
                                var newb = function (p) {
                                    try {
                                        if (!b) {
                                            return p;
                                        }
                                        var result = b(p);
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
                            }; }, function (v) { return v; });
                            creatRequest = function () {
                                if (cache) {
                                    var resulKext = localStorage.getItem(key);
                                    if (resulKext) {
                                        var result = JSON.parse(resulKext);
                                        if (!result.time || result.time && result.time - Date.now() > 0) {
                                            return Promise.resolve(result);
                                        }
                                    }
                                }
                                if (repeatCancel) {
                                    var cancelSource = AxiosChainResponse.cancleMap.get(key);
                                    if (cancelSource) {
                                        AxiosChainResponse.cancleMap["delete"](key);
                                        cancelSource.cancel();
                                    }
                                    AxiosChainResponse.cancleMap.set(key, _this.cancleSource);
                                }
                                if (mergeSameRequest) {
                                    var runPromise = AxiosChainResponse.runPromiseMap.get(key);
                                    if (runPromise) {
                                        runPromise["finally"](function () {
                                            AxiosChainResponse.runPromiseMap["delete"](key);
                                        });
                                        return runPromise;
                                    }
                                }
                                var promise = axios_1["default"].request(__assign(__assign({}, _this.config), { cancelToken: _this.cancleSource.token }));
                                if (cache) {
                                    promise.then(function (response) {
                                        localStorage.setItem(key, JSON.stringify(__assign(__assign({}, response), { time: cacheTime ? cacheTime + Date.now() : 0, request: undefined })));
                                    });
                                }
                                AxiosChainResponse.runPromiseMap.set(key, promise);
                                return promise;
                            };
                            newResolve = function (response) {
                                _this.originalData = response;
                                return interceptor(Promise.resolve(response)).then(resolve);
                            };
                            newReject = function (reason) {
                                if (_this.retryCount && !axios_1["default"].isCancel(reason)) {
                                    _this.retryCount--;
                                    creatRequest().then(newResolve, newReject)["catch"](newReject);
                                    return;
                                }
                                reject(reason);
                            };
                            creatRequest().then(newResolve, newReject)["catch"](newReject);
                            return [2 /*return*/];
                    }
                });
            }); }, 0);
        });
    }
    AxiosChainResponse.prototype.disableInterceptor = function () {
        this.enableInterceptor = false;
        return this;
    };
    AxiosChainResponse.prototype.use = function (fn) {
        this.interceptors.push(fn);
        return this;
    };
    AxiosChainResponse.prototype.retry = function (retry) {
        this.retryCount = retry;
        return this;
    };
    /**
     * @description 启用本地缓存
     * @param expireTime 单位毫秒 失效时间
     * @returns
     */
    AxiosChainResponse.prototype.enableCache = function (expireTime) {
        this.config.cacheTime = expireTime;
        this.config.cache = true;
        return this;
    };
    AxiosChainResponse.prototype.disableCache = function () {
        this.config.cacheTime = undefined;
        this.config.cache = false;
        return this;
    };
    /**
     * @description 合并相同请求 如果在请求之前 有一个相同的请求还在执行 会复用这个执行的请求
     * @returns
     */
    AxiosChainResponse.prototype.enableMergeSameRequest = function () {
        this.config.mergeSameRequest = true;
        return this;
    };
    AxiosChainResponse.prototype.disableMergeSameRequest = function () {
        this.config.mergeSameRequest = false;
        return this;
    };
    /**
   * @description 取消重复请求
   * @returns
   */
    AxiosChainResponse.prototype.enableRepeatCancel = function () {
        this.config.repeatCancel = true;
        return this;
    };
    AxiosChainResponse.prototype.disableRepeatCancel = function () {
        this.config.repeatCancel = false;
        return this;
    };
    /**
     * @description 取消请求
     * @param text
     * @returns
     */
    AxiosChainResponse.prototype.cancel = function (text) {
        this.cancleSource.cancel(text);
        return this;
    };
    AxiosChainResponse.prototype.getData = function () {
        var _this = this;
        var promise = this.promise;
        return promise.then(function (item) { var _b; return (_b = _this.originalData) === null || _b === void 0 ? void 0 : _b.data; });
    };
    AxiosChainResponse.prototype.send = function (data, mix) {
        if (mix === void 0) { mix = true; }
        this.config.data = mix ? __assign(__assign({}, this.config.data), data) : data;
        return this;
    };
    AxiosChainResponse.prototype.query = function (params, mix) {
        if (mix === void 0) { mix = true; }
        this.config.params = mix ? __assign(__assign({}, this.config.params), params) : params;
        return this;
    };
    AxiosChainResponse.prototype.setConfig = function (options, mix) {
        if (mix === void 0) { mix = true; }
        this.config = mix ? __assign(__assign({}, this.config), options) : options;
        return this;
    };
    AxiosChainResponse.prototype.setHeaders = function (headers, mix) {
        if (mix === void 0) { mix = true; }
        this.config.headers = mix ? __assign(__assign({}, this.config.headers), headers) : headers;
        return this;
    };
    AxiosChainResponse.prototype.headerFromData = function () {
        return this.setHeaders({ 'Content-Type': 'multipart/form-data' });
    };
    AxiosChainResponse.prototype.headerJson = function () {
        return this.setHeaders({ 'Content-Type': 'application/json' });
    };
    AxiosChainResponse.prototype.headerFormUrlencoded = function () {
        return this.setHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    };
    AxiosChainResponse.prototype.then = function (onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    };
    AxiosChainResponse.prototype["catch"] = function (onrejected) {
        return this.promise["catch"](onrejected);
    };
    AxiosChainResponse.prototype["finally"] = function (onfinally) {
        return this.promise["finally"](onfinally);
    };
    var _a;
    _a = Symbol.toStringTag;
    AxiosChainResponse.cancleMap = new Map();
    AxiosChainResponse.runPromiseMap = new Map();
    return AxiosChainResponse;
}());
var AxiosChain = /** @class */ (function () {
    function AxiosChain(config) {
        this.interceptors = [];
        this.config = config;
    }
    AxiosChain.request = function (config) {
        return new AxiosChainResponse(config);
    };
    AxiosChain.get = function (url, params) {
        return AxiosChain.request({
            url: url,
            method: 'get',
            params: params
        });
    };
    AxiosChain.post = function (url, data) {
        return AxiosChain.request({
            url: url,
            data: data,
            method: 'post'
        });
    };
    AxiosChain.prototype.use = function (fn) {
        this.interceptors.push(fn);
        return this;
    };
    AxiosChain.prototype.request = function (config) {
        var promise = new AxiosChainResponse(__assign(__assign({}, this.config), config));
        this.interceptors.forEach(function (fn) {
            promise.use(fn);
        });
        return promise;
    };
    AxiosChain.prototype.get = function (url, params) {
        return this.request({
            url: url,
            method: 'get',
            params: params
        });
    };
    AxiosChain.prototype.post = function (url, data) {
        return this.request({
            url: url,
            data: data,
            method: 'post'
        });
    };
    return AxiosChain;
}());
exports["default"] = AxiosChain;

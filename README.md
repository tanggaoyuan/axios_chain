#### 基础使用

```js
import AxionChain from '@tanggaoyuan/axios_chain';

const chain = new AxionChain({
  timeout: 2000,
  baseURL: 'http://xxxxx',
});

// 设置请求参数
chain.post('/api/xxxx').send({}).query({}).then((response) => { });

// 设置请求头
chain.post('/api/xxxx').setHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }).then(() => {

});
chain.post('/api/xxxx').headerFormUrlencoded().then(() => {
  // application/x-www-form-urlencoded
});
chain.post('/api/xxxx').headerJson().then(() => {
  // application/json
});
chain.post('/api/xxxx').headerFromData().then(() => {
  // multipart/form-data
});

// 设置配置参数
chain.post('/api/xxxx').setConfig({
  timeout: 3000,
  baseURL: '/',
});

// 请求取消
const promise = chain.get('http:xxxxxx').query({});
promise.cancel();

// 取消重复请求，只对启用repeatcancel的请求起作用
chain.get('http:xxxxxx').query({}).enableRepeatCancel(); // 这个将会被取消
chain.get('http:xxxxxx').query({}).enableRepeatCancel(); // 请求
chain.get('http:xxxxxx').query({}); // 请求
chain.get('http:xxxxx').query({}).disableRepeatCancel(); // 请求

// 合并重复请求，只对启用mergeSameRequest的请求起作用
chain.get('http:xxxxxx').query({}).enableMergeSameRequest(); // 请求
chain.get('http:xxxxxx').query({}).enableMergeSameRequest(); // 这个将复用第一个请求
chain.get('http:xxxxxx').query({}).enableMergeSameRequest(); // 这个将复用第一个请求
chain.get('http:xxxxxx').query({}); // 请求
chain.get('http:xxxxx').query({}).disableMergeSameRequest(); // 请求

// 缓存,只对启用cache的请求起作用
chain.post('http:xxxxxx').send({}).enableCache(); // 请求完后进行缓存，持久缓存
chain.post('http:xxxxxx').send({}).enableCache(); // 请求之前如果缓存有数据。则返回缓存的数据
chain.post('http:xxxxxx').send({}).enableCache(20000); // 设置隔多久失效，单位毫秒
chain.post('http:xxxxxx').send({}); // 将不用缓存的数据
chain.post('http:xxxxxx').send({}).enableCache().disableCache();
```

#### 拦截器

```js
const chain = new AxiosChain();

// 全局拦截器

chain.use((config) => {
  config.headers['token'] = 'xxxxx'
})

chain.use((config) => {
  config.data['time'] = Date.now();
  return (promise) => {
        reture promise.then((response) => {
    if (response.code === -1) {
      return Promise.reject(response.data)
    }
    return response.data
  })
  }
})

chain.use(() => {
  return async (promise) => {
    await delay(1000)
    return promise.then((response) => response.data)
  }
})

chain.use(async (config)=>{
    const info = await chain.post('http://xxxxxx').disableInterceptor().getData()
    config.data = {...config.data,...info}
    return (promise)=>{
        return promise
    }
})

// 支持链式
chain.use().use()

// 局部拦截器
chain.post().use((config) => { console.log(coonfig) }).use()

// 拦截器失能
chain.post().disableInterceptor()
```

```js
// 拦截器

const chain = new AxiosChain();
chain.post<{ name: string, age: number }>('xxxx').then((response) => {
  // response.data是{name:string,age:number}类型
});

const chain = new AxiosChain().use<any>(() => {
  return (promise) => {
    return promise.then((response) => response.data);
  };
});
chain.post<{ name: string, age: number }>('xxxx').then((response) => {
  // 此时 response 是{name:string,age:number,[x:string]:any}类型
});

const chain = new AxiosChain().use<never>(() => {
  return (promise) => {
    return promise.then((response) => response.data);
  };
});
chain.post<{ name: string, age: number }>('xxxx').then((response) => {
  // 此时 response 是{ name:string,age:number }类型
});

const chain = new AxiosChain().use<{ time: number }>(() => {
  return (promise) => {
    return promise.then((response) => {
      response.data['time'] = Date.now();
      return response.data;
    });
  };
});
chain.post<{ name: string, age: number }>('xxxx').then((response) => {
  // 此时 response 是{ name:string,age:number,time:number }类型
});
```

---
title: Axios
date: 2025-08-25
duration: 3min
type: notes
art: random
---

[[toc]]

### 请求失败自动重新请求

#### 方案1

手动实现一个简易的请求失败

##### 基本流程

<img src="https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240902222824361.png?imageSlim" alt="image-20240902222824361" style="zoom:50%;" />

##### 源代码

配置基本项

```js
// 最大重试次数
const MAX_RETRIES = 3 
// 重试时间间隔
const RETRY_DELAY = 1000
```

重试的请求函数

`instance(config)`发送请求

```js
const backoff = new Promise((resolve) => {
    setTimeout(() => {
      resolve(instance(config))
    // RETRY_DELAY 每次请求的时间间隔
    }, RETRY_DELAY)
})
```

所有代码

```js
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { getUserStore } from '@/stores'
const userStore = getUserStore()
const instance = axios.create({
  baseURL: 'http://localhost:3000'
})
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

// 添加请求拦截器
instance.interceptors.request.use(
  async (config) => {
    // 在发送请求之前做些什么
    config.headers.Authorization = `Bearer ${userStore.token}`
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 添加响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    if (response.data.code && response.data.code === 2000) {
      return Promise.reject(response)
    }
    return response
  },
  async (error) => {
    const config = error.config
    if (!config.retryCount) {
      config.retryCount = 0
    }
    if (config.retryCount < MAX_RETRIES) {
      config.retryCount++
      console.log('retryCount', config.retryCount)
      const backoff = new Promise((resolve) => {
        setTimeout(() => {
          resolve(instance(config))
        }, RETRY_DELAY)
      })
      await backoff
    }
    if (error?.response?.status === 401) {
      // 清空token
      userStore.setToken('')
      ElMessage.error('登陆过期')
    }
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error)
  }
)

export default instance

```

#### 方案2

通过库`axios-retry`来实现

[官方文档](https://www.npmjs.com/package/axios-retry)

```bash
pnpm install axios-retry
```

### 取消请求

[官方文档教程](https://www.axios-http.cn/docs/cancellation)

流程图

<img src="https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240903113304977.png?imageSlim" alt="image-20240903113304977" style="zoom:33%;" />

基本步骤

- 通过`axios.CancelToken.source()`方法生成`source`

- 给请求添加配置项`cancelToken`,值为`source.token`,此时的请求相当于和`source`绑定

- 通过`source.cancel('取消请求的原因')`取消请求

  注意:

  1.想取消哪个请求就必须调用哪个请求的`source.cancel()`方法

  2.每个请求的cancelToken的位置不一样(具体看[文档](https://www.axios-http.cn/docs/cancellation))

  - get

    ```js
    axios.get('xxx', {
      cancelToken: source.token
    })
    ```

   - post
  
     ```js
     axios.post('xxx', {
       name:'xxx'
     },{
       ancelToken: source.token
     })
     ```
  
   - put
  
     ```js
     axios.put('xxx', {
       name:'xxx'
     },{
       ancelToken: source.token
     })
     ```
  
   - delete
  
     ```js
     axios.delete('xxx', {
       cancelToken: source.token
     })
     ```
  
     

代码(get请求)

- 接口函数

```js
import http from '@/utils/http'
const getMovieService = async (params, cancelToken) => {
// http为axios实例
  return http.get('/getMovie', {
    params,
    ...(cancelToken ? { cancelToken } : {})
  })
}
```

- 简单使用

  模拟搜索,当用户多次点击搜索按钮,如果之前搜索的请求还没有请求成功,则取消上次的搜索

  ```js
  // 导入接口函数
  import { getMovieService } from '@/api/movie'
  import axios from 'axios'
  
  // 考虑到可能有多个不同的请求,因此使用key-value的形式来储存请求的source
  // key->'哪个请求'  value->'source'
  const cancelTokens = {
    getTableDataRequest: null
  }
  
  const handleSearch = async () => {
    // getTableDataRequest有值,之前发送过一次请求
    if (cancelTokens.getTableDataRequest) {
      cancelTokens.getTableDataRequest.cancel('取消请求')
    }
    const movieName = inputValue.value
    const { pageSize, currentPage } = baseTableComRef.value.getPaginationData()
    const pageIndex = currentPage
    // 创建source
    const source = axios.CancelToken.source()
    // 储存改请求的source
    cancelTokens.getTableDataRequest = source
    // source.token作为cancelToken传入函数
    getTableData({ pageSize, pageIndex, movieName }, source.token)
  }
  
  // 把接口函数getMovieService重新封装了一次
  const getTableData = async (params, cancelToken) => {
    await getMovieService(params, cancelToken)
      .then((res) => {
       cancelTokens.getTableDataRequest = null
    }).catch((err) => {
        console.log('err', err)
      })
  }
  ```
  
  

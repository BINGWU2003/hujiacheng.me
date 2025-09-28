---
title: Vue常用的Api
date: 2024-09-08
duration: 3min
type: notes
art: random
---

[[toc]]
## Vue常用的Api

### 异步组件

[官方文档](https://cn.vuejs.org/guide/components/async.html#async-components)

1.是什么

是按需加载的组件,动态的从服务器中读取,有利于减少初始化加载时间,提高应用性能

2.使用方法

使用`dedefineAsyncComponent`来定义异步组件,函数的参数为一个对象

对象的属性

```js
{
  // loader为一个函数,函数返回值为import('组件路径')
  loader: () => import('../components/AsyncComNew.vue'),
  // loadingComponent 组件加载的延迟时间
  delay: 1000,
  // 组件没有加载时显示的组件
  loadingComponent: Loading,
  // 组件加载失败时显示的组件
  errorComponent: Error,
  // 组件的加载时间超过了timeout则显示错误组件
  timeout: 4000
}
```

示例:

```vue
<template>
  <div>my-view</div>
  <AsyncCom />
</template>

<script setup>
// 导入
import { defineAsyncComponent } from 'vue'
import Loading from '../components/Loading.vue'
import Error from '../components/Error.vue'
const AsyncCom = defineAsyncComponent({
  // 使用的组件
  loader: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(import('../components/AsyncComNew.vue'))
      }, 2000)
    })
  },
  // loadingComponent 组件加载的延迟时间
  delay: 1000,
  // 组件没有加载时显示的组件
  loadingComponent: Loading,
  // 组件加载失败时显示的组件
  errorComponent: Error,
  // 组件的加载时间超过了timeout则显示错误组件
  timeout: 4000
})
</script>

<style lang="scss" scoped></style>

```

查看浏览器控制台,等待2s,从服务器获取组件

![image-20240819170137779](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240819170137779.png?imageSlim)



### 自定义插件

[官方文档](https://cn.vuejs.org/guide/reusability/plugins.html#writing-a-plugin)

1.是什么

插件 (Plugins) 是一种能为 Vue 添加全局功能的工具代码。

2.使用

- 定义一个插件

  `options`是安装插件的时候传入的参数

  ```js
  const myPlugin = {
    install(app, options) {
      // 配置此应用
       console.log('我的第一个插件', options)
      // 挂载全局方法或者变量
      app.config.globalProperties.$bingwu = 'bingwu'
      console.log('app', app)
    }
  }
  ```

- 安装插件

  传入参数`{ name: 'bingwu' }`

  ```js
  const app = createApp(App)
  app.use(myPlugin, { name: 'bingwu' })
  ```

  控制台输出

  ![image-20240903205921561](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240903205921561.png?imageSlim)

- 使用挂载的变量/函数

  在模板中使用

  ```vue
  <template>
    <div>我是{{ $bingwu }}</div>
  </template>
  ```

  `$bingwu`最终会被替换为`'bingwu'`

### 自定义指令

[官方文档](https://cn.vuejs.org/guide/reusability/custom-directives#custom-directives)

1.是什么

除了 Vue 内置的一系列指令 (比如 `v-model` 或 `v-show`) 之外，Vue 还允许你注册自定义的指令

2.使用

a.全局

- 定义指令

  通过`app.directive('指令名称',{钩子函数})`来定义指令

  通常在`mounted`和`updated`钩子中处理

  `binding`详细见[文档](https://cn.vuejs.org/guide/reusability/custom-directives#custom-directives)

  `binding.value`(常用)代表在使用指令时传递的参数

  ```js
  const app = createApp(App)
  // 自定义指令
  // 使 v-my 在所有组件中都可用
  app.directive('my', {
    // 在mounted钩子中处理
    mounted(el, binding, vnode) {
      // dom节点
      console.log('el', el)
      // 钩子参数
      console.log('binding', binding)
      // 代表绑定元素的底层 VNode。
      console.log('vnode', vnode)
    }
  })
  ```

- 使用

  `binding.value`的值为`'bingwu'`

  ```vue
  <template>
    <div v-my="'bingwu'">我是</div>
  </template>
  ```

  ![image-20240903213219315](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240903213219315.png?imageSlim)

### 自定义hooks

[官方文档](https://cn.vuejs.org/guide/reusability/composables)

1.是什么

利用 Vue 的组合式 API 来封装和复用**有状态逻辑**的函数。

2.使用

- 定义hooks

  函数通常以useXXX来命名

  ```js
  import { ref, onMounted } from 'vue'
  export const useAdd = () => {
    const count = ref(0)
    const decrease = (num1, num2) => num1 + num2
    onMounted(() => {
      console.log('mounted!!!')
    })
    return {
      count,
      decrease
    }
  }
  ```

- 使用

  ```vue
  <script setup>
   // 导入hook
  import { useAdd } from '../hooks/data'
  const { count, decrease } = useAdd()
  </script>
  
  <template>
    <div>{{ count }}</div>
    <div>{{ decrease(2, 7) }}</div>
  </template>
  ```

  
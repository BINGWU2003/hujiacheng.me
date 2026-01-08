---
title: Vue 3 核心机制深度解析：`h` 函数与 `render` 函数 vs `createApp`
date: 2025-12-17
duration: 20min
type: notes
art: random
---

[[toc]]

在 Vue 3 中，开发命令式组件（如 `$message`, `$confirm` 这种通过函数调用的组件）时，确实主要有两种流派：**`createApp`** 和 **`h` + `render**`。

它们的核心区别在于**性能开销**和**上下文（Context）的继承**。

---

## 1. 核心机制对比

### 1.1 方案 A：`createApp` (创建新应用实例)

这是创建一个完全独立的 Vue "微型应用"。

```javascript
import { createApp } from 'vue'
import MyComponent from './MyComponent.vue'

function showModal(props) {
  const mountNode = document.createElement('div')
  document.body.appendChild(mountNode)

  // 创建一个全新的 App 实例
  const app = createApp(MyComponent, props)
  app.mount(mountNode)

  return {
    destroy: () => {
      app.unmount()
      document.body.removeChild(mountNode)
    }
  }
}

```

### 1.2 方案 B：`h` + `render` (虚拟 DOM 渲染)

这是利用 Vue 底层的渲染器，直接将虚拟 DOM（VNode）渲染到真实 DOM 上。

```javascript
import { createVNode, render } from 'vue' // h 也是 createVNode 的别名
import MyComponent from './MyComponent.vue'

function showModal(props) {
  const mountNode = document.createElement('div')
  document.body.appendChild(mountNode)

  // 创建虚拟节点
  const vnode = createVNode(MyComponent, props)
  
  // 渲染到节点
  render(vnode, mountNode)

  return {
    destroy: () => {
      render(null, mountNode) // 销毁
      document.body.removeChild(mountNode)
    }
  }
}

```

---

## 2. 深度差异分析

### 2.1 上下文与插件 (Context & Plugins) —— **最痛的点**

* **`createApp`:**
* **缺点：** 它是完全隔离的。你在主应用（`main.js`）里注册的 `vue-router`、`pinia`、`i18n` 或全局组件，在这个新实例里**统统不存在**。
* **后果：** 如果你的弹窗里用到了 `<router-link>` 或 `store`，会报错。你必须在新实例里重新 `use` 一遍这些插件，非常麻烦且浪费资源。


* **`h` + `render`:**
* **优势：** 它可以更容易地“继承”主应用的上下文。
* **做法：** 你可以将主应用的 `app._context` 赋值给 VNode 的 `appContext` 属性，这样弹窗就能无缝使用全局插件和属性。


```javascript
// h + render 继承上下文示例
import { createVNode, render } from 'vue'
import mainApp from './main' // 引入你的主 App 实例

const vnode = createVNode(Component, props)
// 关键一步：继承上下文
vnode.appContext = mainApp._context 
render(vnode, container)

```



### 2.2 性能开销 (Overhead)

* **`createApp`:**
* **重：** 需要初始化一套完整的 Vue 应用生命周期、事件系统和响应式根基。对于一个简单的 Toast 提示来说，这是杀鸡用牛刀。


* **`h` + `render`:**
* **轻：** 仅仅是创建 VNode 并通过渲染器挂载，跳过了 App 实例化的过程，开销极小。



### 2.3 销毁与卸载

* **`createApp`:** 使用 standard 的 `app.unmount()`，逻辑清晰，符合直觉。
* **`h` + `render`:** 使用 `render(null, container)` 来触发生命周期的卸载钩子（`onUnmounted`），稍微底层一点，但效果一样。

---

### 2.4 对比总结表

| 特性 | `createApp` | `h` + `render` (createVNode) |
| --- | --- | --- |
| **抽象级别** | 高级 API (应用级) | 底层 API (渲染级) |
| **性能开销** | **高** (创建完整实例) | **低** (仅处理 VNode) |
| **上下文共享** | **困难** (完全隔离，需重新安装插件) | **容易** (可手动挂载 `appContext`) |
| **Router/Store** | 默认无法访问 | 可通过继承上下文访问 |
| **适用场景** | 独立于主应用的大型挂件 (如微前端部件) | 频繁调用的 UI 组件 (Toast, Modal, Notification) |
| **复杂度** | 简单直观 | 需要理解 VNode 和 Render 机制 |

---

### 2.5 最佳实践建议

**结论：** 在 Vue 3 中，绝大多数命令式组件场景（Modal, Toast, Drawer），**推荐使用 `h` (createVNode) + `render**`。

**理由：**

1. **更轻量：** 没必要为弹个窗就 new 一个 App。
2. **解决生态问题：** 能够通过 `vnode.appContext` 共享 Router 和 Pinia，这在实际开发中是刚需。

**如何优雅地实现上下文共享？**
通常我们会写一个单例或插件来获取当前的 App 实例：

```javascript
// plugin-toast.js
import { createVNode, render } from 'vue'
import ToastComponent from './Toast.vue'

export default {
  install(app) {
    // 将方法挂载到全局
    app.config.globalProperties.$toast = (options) => {
      const div = document.createElement('div')
      document.body.appendChild(div)

      const vnode = createVNode(ToastComponent, options)
      
      // *** 核心：将当前 app 的上下文赋值给 vnode ***
      vnode.appContext = app._context 
      
      render(vnode, div)
      
      // 可以在组件内部 emit 一个销毁事件来清理 DOM
    }
  }
}

```

### 2.6 编译器

理解了 `h` 和 `render`，你就能理解 `.vue` 文件的本质。

Vue 的编译器（Compiler）做的工作，本质上就是把 `<template>` 翻译成一个 `render` 函数。

**源代码：**

```vue
<template>
  <div id="app">Vue</div>
</template>

```

**编译后（近似）：**

```javascript
import { h } from 'vue'

export default {
  render() {
    return h('div', { id: 'app' }, 'Vue')
  }
}

```

### 2.7 总结

* **`<template>`** 是给开发者看的语法糖。
* **`h` / `createVNode**` 是生成虚拟 DOM 的工具。
* **`render`** 是将虚拟 DOM 变为真实 DOM 的引擎。
* **函数式组件调用**（如 `Confirm`）的本质，就是手动执行了一次 Vue 内部自动完成的 `createVNode -> render` 流程。
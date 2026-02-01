---
title: Vite 打包全流程可视化：从源码到产物
date: 2026-02-02
duration: 60min
type: notes
art: random
---

[[toc]]

本文档通过具体的项目代码示例，可视化展示 Vite 打包过程中每一步的代码转换，让你真正理解"代码是怎么变的"。

## 目录

- [1. 项目结构示例](#1-项目结构示例)
- [2. Vue SFC 文件的完整转换](#2-vue-sfc-文件的完整转换)
- [3. TypeScript 文件的转换](#3-typescript-文件的转换)
- [4. CSS/SCSS 的处理流程](#4-cssscss-的处理流程)
- [5. 静态资源的处理](#5-静态资源的处理)
- [6. 代码分割与 Chunk 生成](#6-代码分割与-chunk-生成)
- [7. 最终产物结构](#7-最终产物结构)
- [8. 完整构建流程图](#8-完整构建流程图)

---

## 1. 项目结构示例

我们以一个典型的 Vue 3 + TypeScript 项目为例：

```
src/
├── main.ts                 # 入口文件
├── App.vue                 # 根组件
├── components/
│   ├── HelloWorld.vue      # 普通组件
│   └── LazyComponent.vue   # 懒加载组件
├── composables/
│   └── useCounter.ts       # 组合式函数
├── styles/
│   ├── variables.scss      # SCSS 变量
│   └── main.scss           # 全局样式
├── assets/
│   ├── logo.png            # 图片资源
│   └── icon.svg            # SVG 图标
└── utils/
    └── helpers.ts          # 工具函数
```

---

## 2. Vue SFC 文件的完整转换

### 2.1 原始 Vue 文件

```vue
<!-- src/components/HelloWorld.vue -->
<template>
  <div class="hello-world">
    <h1>{{ title }}</h1>
    <p class="count">Count: {{ count }}</p>
    <button @click="increment">+1</button>
    <img :src="logoUrl" alt="Logo" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCounter } from '@/composables/useCounter'
import logoUrl from '@/assets/logo.png'

interface Props {
  title: string
}

const props = defineProps<Props>()
const { count, increment } = useCounter()

const doubleCount = computed(() => count.value * 2)
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.hello-world {
  padding: $spacing-md;
  
  h1 {
    color: $primary-color;
    font-size: 24px;
  }
  
  .count {
    color: #666;
  }
  
  button {
    background: $primary-color;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background: darken($primary-color, 10%);
    }
  }
}
</style>
```

### 2.2 阶段一：SFC 解析（@vitejs/plugin-vue）

Vite 使用 `@vue/compiler-sfc` 将 `.vue` 文件拆分成三个部分：

```typescript
// 解析后的 SFC 描述对象
{
  filename: '/src/components/HelloWorld.vue',
  source: '原始文件内容...',
  template: {
    type: 'template',
    content: '<div class="hello-world">...</div>',
    loc: { start: { line: 2 }, end: { line: 9 } },
    attrs: {},
    ast: { /* 模板 AST */ }
  },
  script: null,  // 没有普通 script
  scriptSetup: {
    type: 'script',
    content: "import { ref, computed } from 'vue'...",
    loc: { start: { line: 11 }, end: { line: 23 } },
    attrs: { setup: true, lang: 'ts' },
  },
  styles: [{
    type: 'style',
    content: '@use "@/styles/variables" as *;...',
    loc: { start: { line: 25 }, end: { line: 50 } },
    attrs: { scoped: true, lang: 'scss' },
    scoped: true,
    lang: 'scss'
  }],
  customBlocks: [],
  cssVars: [],
  slotted: false
}
```

### 2.3 阶段二：Script 编译

`<script setup>` 被编译为标准的 Vue 组件选项：

```javascript
// 编译后的 script 部分
import { defineComponent as _defineComponent } from 'vue'
import { ref, computed } from 'vue'
import { useCounter } from '@/composables/useCounter'
import logoUrl from '@/assets/logo.png'

export default /*#__PURE__*/_defineComponent({
  __name: 'HelloWorld',
  props: {
    title: { type: String, required: true }
  },
  setup(__props, { expose: __expose }) {
    __expose();
    
    const props = __props
    const { count, increment } = useCounter()
    const doubleCount = computed(() => count.value * 2)
    
    return { count, increment, doubleCount, logoUrl }
  }
})
```

:::info 转换说明
1. **`defineProps<Props>()`** → 编译为 `props` 选项，类型信息被提取
2. **顶层变量** → 自动包含在 `setup()` 返回值中
3. **`/*#__PURE__*/`** → 标记为纯函数，便于 Tree Shaking
:::

### 2.4 阶段三：Template 编译

模板被编译为渲染函数：

```javascript
// 编译后的 render 函数
import { 
  createElementVNode as _createElementVNode,
  toDisplayString as _toDisplayString,
  createVNode as _createVNode,
  openBlock as _openBlock,
  createElementBlock as _createElementBlock
} from 'vue'

// 静态节点提升 (hoisted)
const _hoisted_1 = { class: "hello-world" }
const _hoisted_2 = ["src"]

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    _createElementVNode("h1", null, _toDisplayString($props.title), 1 /* TEXT */),
    _createElementVNode("p", { class: "count" }, "Count: " + _toDisplayString($setup.count), 1 /* TEXT */),
    _createElementVNode("button", {
      onClick: _cache[0] || (_cache[0] = (...args) => ($setup.increment && $setup.increment(...args)))
    }, "+1"),
    _createElementVNode("img", {
      src: $setup.logoUrl,
      alt: "Logo"
    }, null, 8 /* PROPS */, _hoisted_2)
  ]))
}
```

:::tip 模板编译的优化
1. **静态提升（Static Hoisting）**：`_hoisted_1` 在组件外部定义，避免重复创建
2. **PatchFlags**：数字 `1`、`8` 是 patch 标记，告诉 Vue 只有这些部分需要更新
3. **事件缓存**：`_cache[0]` 缓存事件处理器，避免不必要的更新
:::

### 2.5 阶段四：Scoped CSS 处理

SCSS 被编译，并添加 scoped 属性：

```css
/* 原始 SCSS */
.hello-world {
  padding: $spacing-md;
  h1 { color: $primary-color; }
}

/* ↓ SCSS 编译后 */
.hello-world {
  padding: 16px;
}
.hello-world h1 {
  color: #409eff;
}

/* ↓ 添加 scoped 属性后 */
.hello-world[data-v-7a7a37b1] {
  padding: 16px;
}
.hello-world h1[data-v-7a7a37b1] {
  color: #409eff;
}
.hello-world .count[data-v-7a7a37b1] {
  color: #666;
}
.hello-world button[data-v-7a7a37b1] {
  background: #409eff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.hello-world button[data-v-7a7a37b1]:hover {
  background: #3a8ee6;
}
```

同时，模板中的元素会被添加相同的 data 属性：

```html
<!-- 编译后的模板（运行时渲染） -->
<div class="hello-world" data-v-7a7a37b1>
  <h1 data-v-7a7a37b1>Hello</h1>
  <p class="count" data-v-7a7a37b1>Count: 0</p>
  <button data-v-7a7a37b1>+1</button>
</div>
```

### 2.6 阶段五：最终合并输出

所有部分合并为一个 JavaScript 模块：

```javascript
// HelloWorld.vue 编译后的完整代码
import { 
  defineComponent,
  ref, 
  computed,
  createElementVNode,
  toDisplayString,
  openBlock,
  createElementBlock
} from 'vue'
import { useCounter } from '/src/composables/useCounter.ts'
import logoUrl from '/src/assets/logo.png'

// 静态节点
const _hoisted_1 = { class: "hello-world" }

// 组件定义
const _sfc_main = /*#__PURE__*/ defineComponent({
  __name: 'HelloWorld',
  props: {
    title: { type: String, required: true }
  },
  setup(__props) {
    const { count, increment } = useCounter()
    const doubleCount = computed(() => count.value * 2)
    return { count, increment, doubleCount, logoUrl }
  }
})

// 渲染函数
function _sfc_render(_ctx, _cache, $props, $setup) {
  return (openBlock(), createElementBlock("div", _hoisted_1, [
    createElementVNode("h1", null, toDisplayString($props.title), 1),
    createElementVNode("p", { class: "count" }, "Count: " + toDisplayString($setup.count), 1),
    createElementVNode("button", {
      onClick: _cache[0] || (_cache[0] = (...args) => $setup.increment(...args))
    }, "+1"),
    createElementVNode("img", { src: $setup.logoUrl, alt: "Logo" }, null, 8, ["src"])
  ]))
}

// 样式注入
import '/src/components/HelloWorld.vue?vue&type=style&index=0&scoped=7a7a37b1&lang.scss'

// 添加 scopeId
_sfc_main.__scopeId = "data-v-7a7a37b1"

// 挂载渲染函数
_sfc_main.render = _sfc_render

// 热更新支持（开发环境）
_sfc_main.__hmrId = "7a7a37b1"
__VUE_HMR_RUNTIME__.createRecord("7a7a37b1", _sfc_main)

export default _sfc_main
```

---

## 3. TypeScript 文件的转换

### 3.1 原始 TypeScript 文件

```typescript
// src/composables/useCounter.ts
import { ref, computed, type Ref, type ComputedRef } from 'vue'

interface UseCounterReturn {
  count: Ref<number>
  doubleCount: ComputedRef<number>
  increment: () => void
  decrement: () => void
  reset: () => void
}

export function useCounter(initialValue: number = 0): UseCounterReturn {
  const count = ref<number>(initialValue)
  
  const doubleCount = computed<number>(() => count.value * 2)
  
  const increment = (): void => {
    count.value++
  }
  
  const decrement = (): void => {
    count.value--
  }
  
  const reset = (): void => {
    count.value = initialValue
  }
  
  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset,
  }
}

// 未使用的导出（将被 Tree Shaking 移除）
export const UNUSED_CONSTANT = 'This will be removed'

export function unusedFunction(): void {
  console.log('This function is never called')
}
```

### 3.2 阶段一：esbuild 转换 TypeScript

esbuild 快速移除类型注解（不做类型检查）：

```javascript
// esbuild 转换后
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const doubleCount = computed(() => count.value * 2)
  
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  const reset = () => {
    count.value = initialValue
  }
  
  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset,
  }
}

export const UNUSED_CONSTANT = 'This will be removed'

export function unusedFunction() {
  console.log('This function is never called')
}
```

:::info esbuild 做了什么？
1. **移除类型注解**：`Ref<number>` → 移除
2. **移除 interface**：`UseCounterReturn` → 完全删除
3. **移除 type import**：`type Ref` → 移除（仅类型导入）
4. **保留 `import`**：`ref, computed` 是运行时需要的
5. **不做类型检查**：语法错误会报错，类型错误不会
:::

### 3.3 阶段二：Rollup 处理（Tree Shaking）

Rollup 分析模块依赖，移除未使用的代码：

```javascript
// Tree Shaking 后（假设只使用了 count 和 increment）
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubleCount = computed(() => count.value * 2)
  
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  const reset = () => {
    count.value = initialValue
  }
  
  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset,
  }
}

// ❌ UNUSED_CONSTANT 被移除
// ❌ unusedFunction 被移除
```

:::warning Tree Shaking 的限制
注意：`decrement` 和 `reset` 虽然未被调用，但因为它们在函数内部定义并返回，Rollup 无法确定外部是否会使用，所以保留了。

只有**模块级别**的未使用导出才会被移除。
:::

### 3.4 阶段三：代码压缩（esbuild minify）

```javascript
// esbuild 压缩后
import{ref as e,computed as t}from"vue";export function useCounter(o=0){const n=e(o),u=t(()=>n.value*2),r=()=>{n.value++},c=()=>{n.value--},s=()=>{n.value=o};return{count:n,doubleCount:u,increment:r,decrement:c,reset:s}}
```

**压缩做了什么？**
- 变量重命名：`count` → `n`，`increment` → `r`
- 移除空格和换行
- 移除注释

---

## 4. CSS/SCSS 的处理流程

### 4.1 原始 SCSS 文件

```scss
// src/styles/variables.scss
$primary-color: #409eff;
$secondary-color: #67c23a;
$danger-color: #f56c6c;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin button-style($bg-color) {
  background-color: $bg-color;
  color: white;
  padding: $spacing-sm $spacing-md;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: darken($bg-color, 10%);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}
```

```scss
// src/styles/main.scss
@use './variables' as *;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-md;
}

.btn {
  @include button-style($primary-color);
  
  &--secondary {
    @include button-style($secondary-color);
  }
  
  &--danger {
    @include button-style($danger-color);
  }
}

.flex-center {
  @include flex-center;
}
```

### 4.2 阶段一：SCSS 编译（sass/dart-sass）

```css
/* SCSS 编译后的 CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.btn {
  background-color: #409eff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn:hover {
  background-color: #3a8ee6;
}
.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.btn--secondary {
  background-color: #67c23a;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn--secondary:hover {
  background-color: #5daf34;
}
.btn--secondary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.btn--danger {
  background-color: #f56c6c;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn--danger:hover {
  background-color: #f34141;
}
.btn--danger:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

:::info SCSS 编译做了什么？
1. **变量替换**：`$primary-color` → `#409eff`
2. **Mixin 展开**：`@include button-style()` → 实际 CSS
3. **函数计算**：`darken($primary-color, 10%)` → `#3a8ee6`
4. **嵌套展开**：`.btn { &--secondary }` → `.btn--secondary`
5. **@use 解析**：导入并合并模块
:::

### 4.3 阶段二：PostCSS 处理（可选）

```css
/* autoprefixer 添加浏览器前缀后 */
.flex-center {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  -webkit-box-pack: center;
      -ms-flex-pack: center;
          justify-content: center;
}

.btn {
  -webkit-transition: background-color 0.2s;
  transition: background-color 0.2s;
}
```

### 4.4 阶段三：CSS 压缩（esbuild/lightningcss）

```css
/* 压缩后 */
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333}.container{max-width:1200px;margin:0 auto;padding:0 16px}.btn{background-color:#409eff;color:#fff;padding:8px 16px;border:none;border-radius:4px;cursor:pointer;transition:background-color .2s}.btn:hover{background-color:#3a8ee6}.btn:disabled{background-color:#ccc;cursor:not-allowed}.btn--secondary{background-color:#67c23a;color:#fff;padding:8px 16px;border:none;border-radius:4px;cursor:pointer;transition:background-color .2s}.btn--secondary:hover{background-color:#5daf34}.btn--secondary:disabled{background-color:#ccc;cursor:not-allowed}.btn--danger{background-color:#f56c6c;color:#fff;padding:8px 16px;border:none;border-radius:4px;cursor:pointer;transition:background-color .2s}.btn--danger:hover{background-color:#f34141}.btn--danger:disabled{background-color:#ccc;cursor:not-allowed}.flex-center{display:flex;align-items:center;justify-content:center}
```

### 4.5 阶段四：CSS 代码分割

Vite 会将 CSS 按以下方式处理：

```
src/styles/main.scss     →  dist/assets/index-[hash].css (入口 CSS)
HelloWorld.vue (scoped)  →  dist/assets/index-[hash].css (合并到入口)
LazyComponent.vue        →  dist/assets/LazyComponent-[hash].css (单独 chunk)
```

---

## 5. 静态资源的处理

### 5.1 图片资源

```typescript
// 源代码中的导入
import logoUrl from '@/assets/logo.png'
import smallIcon from '@/assets/small-icon.png'  // 假设 < 4KB
```

**处理结果**：

```javascript
// 大图片 (> 4KB) - 独立文件
const logoUrl = '/assets/logo-a1b2c3d4.png'

// 小图片 (< 4KB) - 内联 base64
const smallIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
```

**目录结构**：

```
dist/
└── assets/
    ├── logo-a1b2c3d4.png     # 大于 4KB，独立文件
    └── index-e5f6g7h8.js     # 小于 4KB 的图片内联在 JS 中
```

:::info assetsInlineLimit 配置
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    assetsInlineLimit: 4096, // 默认 4KB
    // 小于此值的资源会被内联为 base64
  }
})
```
:::

### 5.2 SVG 处理

```typescript
// 方式 1：作为 URL 导入
import iconUrl from '@/assets/icon.svg'
// 结果: '/assets/icon-h1i2j3k4.svg'

// 方式 2：作为组件导入（需要 vite-svg-loader 插件）
import IconComponent from '@/assets/icon.svg?component'
// 结果: Vue 组件

// 方式 3：作为原始字符串导入
import iconRaw from '@/assets/icon.svg?raw'
// 结果: '<svg xmlns="http://www.w3.org/2000/svg">...</svg>'
```

### 5.3 JSON 文件

```typescript
// 源代码
import config from '@/config.json'
import { version } from '@/package.json'

// 转换后
// 完整导入 - 整个 JSON 被内联
const config = {"apiUrl":"https://api.example.com","timeout":5000}

// 具名导入 - 支持 Tree Shaking
const version = "1.0.0"  // 只包含需要的字段
```

### 5.4 Web Worker

```typescript
// 源代码
import MyWorker from '@/workers/heavy-task.ts?worker'
const worker = new MyWorker()

// 转换后 - Worker 被单独打包
import MyWorker from '/assets/heavy-task-worker-x9y8z7.js?worker'
```

---

## 6. 代码分割与 Chunk 生成

### 6.1 入口文件分析

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/main.scss'

// 静态导入 - 打包到主 chunk
import Home from './views/Home.vue'

// 动态导入 - 单独 chunk
const About = () => import('./views/About.vue')
const Dashboard = () => import('./views/Dashboard.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/dashboard', component: Dashboard },
  ]
})

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
app.mount('#app')
```

### 6.2 Rollup 依赖图分析

```
模块依赖图
==========

main.ts (入口)
├── vue (外部依赖)
├── vue-router (外部依赖)
├── pinia (外部依赖)
├── App.vue
│   ├── HelloWorld.vue
│   │   ├── useCounter.ts
│   │   └── logo.png
│   └── styles (scoped)
├── Home.vue (静态导入)
│   └── ...
├── About.vue (动态导入) ──→ 单独 chunk
│   └── ...
└── Dashboard.vue (动态导入) ──→ 单独 chunk
    ├── Chart.vue
    └── echarts (大型依赖)
```

### 6.3 Chunk 生成策略

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-echarts': ['echarts'],
        }
      }
    }
  }
})
```

**生成的 Chunk 结构**：

```
dist/assets/
├── index-a1b2c3d4.js          # 主入口 (main.ts + App.vue + Home.vue)
├── index-a1b2c3d4.css         # 主入口样式
├── vendor-vue-e5f6g7h8.js     # Vue 全家桶
├── vendor-echarts-i9j0k1l2.js # ECharts
├── About-m3n4o5p6.js          # About 页面 chunk
├── About-m3n4o5p6.css         # About 页面样式
├── Dashboard-q7r8s9t0.js      # Dashboard 页面 chunk
└── Dashboard-q7r8s9t0.css     # Dashboard 页面样式
```

### 6.4 Chunk 内容示例

```javascript
// dist/assets/index-a1b2c3d4.js (简化展示)

// 1. Vue 运行时引用（从 vendor chunk）
import { createApp, ref, computed, ... } from './vendor-vue-e5f6g7h8.js'

// 2. 模块定义
const _sfc_main$1 = { /* HelloWorld 组件 */ }
const _sfc_main = { /* App 组件 */ }

// 3. 路由配置（动态导入保持不变）
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: () => import('./About-m3n4o5p6.js') },
  { path: '/dashboard', component: () => import('./Dashboard-q7r8s9t0.js') }
]

// 4. 应用初始化
const app = createApp(_sfc_main)
app.use(router)
app.use(pinia)
app.mount('#app')
```

---

## 7. 最终产物结构

### 7.1 完整的 dist 目录

```
dist/
├── index.html                          # HTML 入口
├── assets/
│   ├── index-a1b2c3d4.js              # 主 JS bundle (~50KB)
│   ├── index-a1b2c3d4.css             # 主 CSS bundle (~10KB)
│   ├── vendor-vue-e5f6g7h8.js         # Vue 框架 (~80KB)
│   ├── vendor-echarts-i9j0k1l2.js     # ECharts (~200KB)
│   ├── About-m3n4o5p6.js              # About 页面 (~5KB)
│   ├── About-m3n4o5p6.css             # About 样式 (~2KB)
│   ├── Dashboard-q7r8s9t0.js          # Dashboard (~15KB)
│   ├── Dashboard-q7r8s9t0.css         # Dashboard 样式 (~3KB)
│   ├── logo-u1v2w3x4.png              # 图片资源
│   └── icon-y5z6a7b8.svg              # SVG 资源
└── favicon.ico                         # 网站图标
```

### 7.2 index.html 的变化

**构建前**：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**构建后**：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <script type="module" crossorigin src="/assets/index-a1b2c3d4.js"></script>
  <link rel="modulepreload" crossorigin href="/assets/vendor-vue-e5f6g7h8.js">
  <link rel="stylesheet" crossorigin href="/assets/index-a1b2c3d4.css">
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

:::info HTML 注入的资源
1. **主入口 JS**：`<script type="module">` 异步加载
2. **modulepreload**：预加载关键依赖，提升加载速度
3. **CSS**：同步加载，避免 FOUC（无样式内容闪烁）
:::

---

## 8. 完整构建流程图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Vite Build 完整流程                                │
└─────────────────────────────────────────────────────────────────────────────┘

源文件                    处理阶段                           输出
━━━━━━                    ━━━━━━                            ━━━━

                         ┌─────────────┐
.vue 文件 ──────────────→│ Vue Plugin  │
                         │ (SFC 解析)   │
                         └──────┬──────┘
                                │
                    ┌───────────┼───────────┐
                    ↓           ↓           ↓
              ┌─────────┐ ┌─────────┐ ┌─────────┐
              │ Template│ │ Script  │ │ Style   │
              │ Compiler│ │ Compiler│ │ Compiler│
              └────┬────┘ └────┬────┘ └────┬────┘
                   │           │           │
                   ↓           ↓           ↓
              render()    JS Module    CSS Module
                   │           │           │
                   └───────────┴───────────┘
                               │
                               ↓
                    ┌─────────────────┐
.ts 文件 ──────────→│    esbuild      │────→ JS (类型已移除)
                    │ (TS → JS 转换)   │
                    └─────────────────┘
                               │
                               ↓
                    ┌─────────────────┐
.scss 文件 ────────→│   Sass/Less     │────→ CSS
                    │ (预处理器编译)   │
                    └─────────────────┘
                               │
                               ↓
                    ┌─────────────────────────────────┐
                    │           Rollup                 │
                    │  ┌─────────────────────────┐    │
                    │  │ 1. 依赖解析 (resolveId)  │    │
                    │  │ 2. 模块加载 (load)       │    │
所有模块 ──────────→│  │ 3. 模块转换 (transform)  │    │
                    │  │ 4. 依赖图构建            │    │
                    │  │ 5. Tree Shaking         │    │
                    │  │ 6. 代码分割             │    │
                    │  │ 7. Chunk 生成           │    │
                    │  └─────────────────────────┘    │
                    └─────────────────────────────────┘
                               │
                               ↓
                    ┌─────────────────┐
                    │    Minify       │
                    │ (esbuild/terser)│
                    └─────────────────┘
                               │
                    ┌──────────┴──────────┐
                    ↓                     ↓
              ┌──────────┐         ┌──────────┐
              │ JS Chunks │         │CSS Chunks│
              └──────────┘         └──────────┘
                    │                     │
                    ↓                     ↓
              ┌─────────────────────────────┐
              │         dist/assets/        │
              │ ├── index-xxxx.js          │
              │ ├── index-xxxx.css         │
              │ ├── vendor-xxxx.js         │
              │ ├── About-xxxx.js          │
              │ └── ...                    │
              └─────────────────────────────┘
                               │
                               ↓
                    ┌─────────────────┐
index.html ────────→│  HTML Plugin    │────→ dist/index.html
                    │ (资源注入)       │      (带有正确的资源引用)
                    └─────────────────┘

图片/字体 ─────────→ 复制/处理/hash ──────→ dist/assets/xxx-xxxx.png
```

### 8.1 各文件类型转换速查表

| 源文件 | 处理器 | 中间产物 | 最终产物 |
|--------|--------|----------|----------|
| `.vue` | @vitejs/plugin-vue | JS + CSS 模块 | `.js` chunk + `.css` chunk |
| `.ts/.tsx` | esbuild | JS (无类型) | 合并到 `.js` chunk |
| `.js/.jsx` | esbuild | JS (转换语法) | 合并到 `.js` chunk |
| `.scss/.sass` | sass | CSS | 合并到 `.css` chunk |
| `.less` | less | CSS | 合并到 `.css` chunk |
| `.css` | PostCSS (可选) | CSS | 合并到 `.css` chunk |
| `.png/.jpg` (大) | - | - | 独立文件 + hash |
| `.png/.jpg` (小) | - | base64 | 内联到 JS |
| `.svg` | - | - | 独立文件 或 内联 |
| `.json` | - | JS 对象 | 内联到 JS |
| `.wasm` | - | - | 独立文件 |

### 8.2 Vite 插件钩子执行顺序

```
构建阶段                 钩子名称              执行内容
━━━━━━                  ━━━━━━              ━━━━━━

配置阶段
  │
  ├─── config ─────────→ 修改/扩展 Vite 配置
  │
  ├─── configResolved ─→ 读取最终配置
  │
构建阶段
  │
  ├─── buildStart ────→ 构建开始，初始化资源
  │
  │    ┌─────────────────────────────────┐
  │    │  对每个模块循环执行：              │
  │    │                                  │
  │    │  resolveId ──→ 解析模块路径       │
  │    │      ↓                           │
  │    │  load ───────→ 加载模块内容       │
  │    │      ↓                           │
  │    │  transform ──→ 转换模块代码       │
  │    │      ↓                           │
  │    │  moduleParsed → 模块解析完成      │
  │    │                                  │
  │    └─────────────────────────────────┘
  │
  ├─── buildEnd ──────→ 所有模块处理完成
  │
生成阶段
  │
  ├─── renderStart ───→ 开始生成 bundle
  │
  ├─── renderChunk ───→ 处理每个 chunk
  │
  ├─── generateBundle → 生成最终 bundle
  │
  ├─── writeBundle ───→ 写入文件系统
  │
  └─── closeBundle ───→ 构建完成，清理资源
```

---

## 总结

通过本文档，你应该对 Vite 打包过程有了直观的理解：

### 核心转换过程

1. **Vue SFC**：拆分 → 编译模板/脚本/样式 → 合并为 JS 模块
2. **TypeScript**：esbuild 移除类型 → Rollup Tree Shaking → 压缩
3. **CSS/SCSS**：预处理器编译 → PostCSS → 压缩 → 提取到独立文件
4. **静态资源**：小文件内联，大文件独立输出并添加 hash

### 关键优化点

1. **静态提升**：模板中的静态内容在编译时提取
2. **Tree Shaking**：未使用的导出被移除
3. **代码分割**：动态导入自动生成独立 chunk
4. **资源优化**：小文件内联减少请求，hash 确保缓存有效

> 理解构建过程有助于编写更优化的代码，也能更好地排查构建问题。

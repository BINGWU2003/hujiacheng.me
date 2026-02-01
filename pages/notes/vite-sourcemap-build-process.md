---
title: Vite Source Map 构建全流程详解
date: 2026-02-02
duration: 45min
type: notes
art: random
---

[[toc]]

本文档详细解析 Vite 开启 Source Map 后的完整构建流程，包括每个阶段如何生成、传递和合并 Source Map。

## 目录

- [1. Source Map 基础回顾](#1-source-map-基础回顾)
- [2. Vite Source Map 配置](#2-vite-source-map-配置)
- [3. 多阶段转换的 Source Map 链](#3-多阶段转换的-source-map-链)
- [4. Vue SFC 的 Source Map 生成](#4-vue-sfc-的-source-map-生成)
- [5. TypeScript 的 Source Map 生成](#5-typescript-的-source-map-生成)
- [6. CSS/SCSS 的 Source Map 生成](#6-cssscss-的-source-map-生成)
- [7. Rollup 的 Source Map 合并](#7-rollup-的-source-map-合并)
- [8. 代码压缩阶段的 Source Map](#8-代码压缩阶段的-source-map)
- [9. 完整构建流程图](#9-完整构建流程图)
- [10. Source Map 调试实战](#10-source-map-调试实战)

---

## 1. Source Map 基础回顾

### 1.1 Source Map 是什么

Source Map 是一个 JSON 文件，建立了**转换后代码**与**原始源码**之间的映射关系。

```json
{
  "version": 3,
  "file": "index-a1b2c3d4.js",
  "sources": [
    "../../src/main.ts",
    "../../src/App.vue",
    "../../src/components/HelloWorld.vue"
  ],
  "sourcesContent": [
    "import { createApp } from 'vue'...",
    "<template>...</template>...",
    "<template>...</template>..."
  ],
  "names": ["createApp", "ref", "count", "increment"],
  "mappings": "AAAA,SAASA,UAAW,MAAO..."
}
```

### 1.2 各字段含义

| 字段 | 说明 | 示例 |
|------|------|------|
| `version` | Source Map 版本，目前为 3 | `3` |
| `file` | 转换后的文件名 | `"index-a1b2c3d4.js"` |
| `sources` | 原始源文件路径数组 | `["../src/main.ts"]` |
| `sourcesContent` | 原始源文件内容（可选） | `["import..."]` |
| `names` | 原始代码中的标识符 | `["count", "increment"]` |
| `mappings` | VLQ 编码的位置映射 | `"AAAA,SAASA..."` |

### 1.3 mappings 编码原理

`mappings` 是整个 Source Map 的核心，使用 **Base64 VLQ** 编码存储位置信息：

```
mappings: "AAAA;AACA,SAASA,UAAW;AAC3B"
          │     │
          │     └── 第二行的映射
          └── 第一行的映射（分号分隔行）

每个片段（逗号分隔）包含 1-5 个 VLQ 数字：
1. 生成代码的列号（相对上一个）
2. 源文件索引（相对上一个）
3. 源代码行号（相对上一个）
4. 源代码列号（相对上一个）
5. names 数组索引（可选）
```

:::info VLQ 编码示例
```
"AAAA" 解码为 [0, 0, 0, 0]
意思是：生成代码第0列 → 第0个源文件的第0行第0列

"SAASA" 解码为 [9, 0, 0, 9, 0]
意思是：生成代码第9列 → 同一源文件的同一行第9列，使用 names[0]
```
:::

---

## 2. Vite Source Map 配置

### 2.1 配置选项

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Source Map 模式
    sourcemap: true,          // boolean | 'inline' | 'hidden'
    
    // 详细配置
    rollupOptions: {
      output: {
        sourcemap: true,
        sourcemapExcludeSources: false,  // 是否排除源码内容
        sourcemapPathTransform: (relativeSourcePath) => {
          // 自定义源文件路径
          return relativeSourcePath.replace('../', '')
        }
      }
    }
  },
  
  // CSS Source Map（开发环境默认开启）
  css: {
    devSourcemap: true
  }
})
```

### 2.2 三种 Source Map 模式对比

```typescript
// 模式 1: true - 生成独立 .map 文件
sourcemap: true
// 输出:
// dist/assets/index-a1b2c3d4.js
// dist/assets/index-a1b2c3d4.js.map  ← 独立文件
// JS 文件末尾: //# sourceMappingURL=index-a1b2c3d4.js.map

// 模式 2: 'inline' - 内联到 JS 文件
sourcemap: 'inline'
// 输出:
// dist/assets/index-a1b2c3d4.js
// JS 文件末尾: //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjoz...

// 模式 3: 'hidden' - 生成 .map 但不添加引用注释
sourcemap: 'hidden'
// 输出:
// dist/assets/index-a1b2c3d4.js      ← 无 sourceMappingURL 注释
// dist/assets/index-a1b2c3d4.js.map  ← 文件存在但不被引用
```

:::tip 选择建议
| 场景 | 推荐配置 | 原因 |
|------|----------|------|
| 开发环境 | `true` | 便于调试 |
| 生产环境（内部） | `true` | 错误追踪 + 调试 |
| 生产环境（公开） | `'hidden'` | 上传到监控平台，不暴露给用户 |
| 需要最小体积 | `false` | 不生成 Source Map |
:::

---

## 3. 多阶段转换的 Source Map 链

### 3.1 转换链问题

一个 Vue 文件会经历多次转换，每次转换都会生成 Source Map：

```
原始文件          转换1           转换2           转换3           最终产物
HelloWorld.vue → Vue 编译 → TypeScript 编译 → Rollup 打包 → 压缩后的 JS
    │              │              │               │              │
    │              ↓              ↓               ↓              │
    │          map1.json     map2.json       map3.json          │
    │                                                            │
    └─────────────── 需要一个完整的映射 ─────────────────────────→│
```

**问题**：最终代码的第 100 行对应原始文件的哪一行？

### 3.2 Source Map 合并原理

Vite/Rollup 使用 **Source Map 合并（Remapping）** 技术：

```typescript
// 简化的合并逻辑
function remapSourceMap(
  originalMap: SourceMap,   // 第一次转换的 map
  transformedMap: SourceMap // 第二次转换的 map
): SourceMap {
  // transformedMap 中的每个位置，
  // 通过 originalMap 追溯到真正的源码位置
  
  const mergedMappings = transformedMap.mappings.map(segment => {
    const [genCol, srcIndex, srcLine, srcCol] = segment
    
    // 用 originalMap 查找这个位置的原始来源
    const originalPosition = originalMap.lookup(srcLine, srcCol)
    
    return [genCol, originalPosition.sourceIndex, 
            originalPosition.line, originalPosition.column]
  })
  
  return {
    version: 3,
    sources: originalMap.sources,  // 使用最原始的源文件
    mappings: encode(mergedMappings),
    // ...
  }
}
```

### 3.3 Vite 中的实际合并

Vite 使用 `@ampproject/remapping` 库进行 Source Map 合并：

```typescript
// Vite 内部简化实现
import remapping from '@ampproject/remapping'

function combineSourcemaps(
  filename: string,
  sourcemapList: SourceMap[]
): SourceMap {
  // sourcemapList 包含转换链中所有的 source map
  // 按照转换顺序排列：[最新的 map, ..., 最早的 map]
  
  return remapping(sourcemapList, () => null)
}
```

---

## 4. Vue SFC 的 Source Map 生成

### 4.1 SFC 解析阶段

当 `@vitejs/plugin-vue` 解析 `.vue` 文件时：

```vue
<!-- 原始文件: HelloWorld.vue -->
<template>                           <!-- 行 1 -->
  <div class="hello">                <!-- 行 2 -->
    <h1>{{ msg }}</h1>               <!-- 行 3 -->
  </div>                             <!-- 行 4 -->
</template>                          <!-- 行 5 -->
                                     <!-- 行 6 -->
<script setup lang="ts">             <!-- 行 7 -->
import { ref } from 'vue'            <!-- 行 8 -->
const count = ref(0)                 <!-- 行 9 -->
</script>                            <!-- 行 10 -->
                                     <!-- 行 11 -->
<style scoped>                       <!-- 行 12 -->
.hello { color: red; }               <!-- 行 13 -->
</style>                             <!-- 行 14 -->
```

SFC 编译器为每个部分生成独立的 Source Map：

```typescript
// SFC 编译器输出
{
  script: {
    content: "import { ref } from 'vue'\nconst count = ref(0)",
    map: {
      version: 3,
      sources: ["HelloWorld.vue"],
      mappings: "AAAO;AACA",  // 映射到原始文件的第 8-9 行
      // 注意：偏移量考虑了 <script> 标签的位置
    }
  },
  template: {
    content: "<div class=\"hello\">...</div>",
    map: {
      version: 3,
      sources: ["HelloWorld.vue"],
      mappings: "AACA;AACA;AACA",  // 映射到第 2-4 行
    }
  },
  styles: [{
    content: ".hello { color: red; }",
    map: {
      version: 3,
      sources: ["HelloWorld.vue"],
      mappings: "AACO",  // 映射到第 13 行
    }
  }]
}
```

### 4.2 Template 编译的 Source Map

模板编译为渲染函数时，需要保持映射：

```typescript
// 原始模板
<h1>{{ msg }}</h1>  // HelloWorld.vue 第 3 行

// 编译后的渲染函数
_createElementVNode("h1", null, _toDisplayString(_ctx.msg), 1)
// ↑ 需要映射回原始模板位置
```

模板编译器（`@vue/compiler-sfc`）生成详细的位置映射：

```typescript
// 模板编译时的位置追踪
{
  ast: {
    type: 'Element',
    tag: 'h1',
    loc: {
      start: { line: 3, column: 5, offset: 42 },
      end: { line: 3, column: 24, offset: 61 },
      source: '<h1>{{ msg }}</h1>'
    },
    children: [{
      type: 'Interpolation',
      content: {
        type: 'SimpleExpression',
        content: 'msg',
        loc: {
          start: { line: 3, column: 10, offset: 47 },
          end: { line: 3, column: 13, offset: 50 }
        }
      }
    }]
  }
}
```

### 4.3 最终的 Vue 组件 Source Map

```javascript
// 编译后的 HelloWorld.vue 模块
import { ref, createElementVNode, toDisplayString, openBlock, createElementBlock } from 'vue'

const _sfc_main = {
  __name: 'HelloWorld',
  setup() {
    const count = ref(0)        // ← 映射到 HelloWorld.vue:9
    return { count }
  }
}

function _sfc_render(_ctx) {
  return (openBlock(), createElementBlock("div", { class: "hello" }, [
    createElementVNode("h1", null, toDisplayString(_ctx.msg), 1)
    // ↑ 映射到 HelloWorld.vue:3，列 5-24
  ]))
}

_sfc_main.render = _sfc_render
export default _sfc_main

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhlbGxvV29ybGQudnVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQU9BLENBQUE7QUFDQTtBQUNBOzs7O0FBTEE7QUFDQTtBQUNBOzs7OzsifQ==
```

:::info Source Map 内容解码
```json
{
  "version": 3,
  "sources": ["HelloWorld.vue"],
  "names": [],
  "mappings": ";;;;;;AAOA,CAAA;AACA;AACA;;;AALA;AACA;AACA;;;;;;",
  "sourcesContent": ["<template>\n  <div class=\"hello\">..."]
}
```

mappings 解码后的部分映射：
- 空行 `;;;;;;` 表示编译后的 import 语句没有直接对应源码
- `AAOA` → 映射到源文件第 8 行（script 内容开始）
- `AALA` → 映射到源文件第 2 行（template 内容开始）
:::

---

## 5. TypeScript 的 Source Map 生成

### 5.1 esbuild 转换阶段

```typescript
// 原始 TypeScript: useCounter.ts
import { ref, computed, type Ref } from 'vue'     // 行 1

interface CounterReturn {                          // 行 3
  count: Ref<number>                              // 行 4
  increment: () => void                           // 行 5
}                                                  // 行 6

export function useCounter(): CounterReturn {     // 行 8
  const count = ref<number>(0)                    // 行 9
  const increment = (): void => {                 // 行 10
    count.value++                                 // 行 11
  }                                               // 行 12
  return { count, increment }                     // 行 13
}                                                  // 行 14
```

esbuild 转换时生成 Source Map：

```javascript
// esbuild 输出
import { ref, computed } from 'vue'              // 行 1

export function useCounter() {                   // 行 3 ← 注意行号变化
  const count = ref(0)                           // 行 4
  const increment = () => {                      // 行 5
    count.value++                                // 行 6
  }                                               // 行 7
  return { count, increment }                    // 行 8
}                                                 // 行 9
```

```json
// esbuild 生成的 Source Map
{
  "version": 3,
  "sources": ["useCounter.ts"],
  "sourcesContent": ["import { ref, computed, type Ref } from 'vue'..."],
  "mappings": "AAAA,SAAS,KAAK,UAAW;AAQzB,gBAAS,aAAa;AACpB,QAAM,QAAQ,IAAI,CAAC;AACnB,QAAM,YAAY,MAAM;AACtB,YAAM;AAAA,EACR;AACA,SAAO,EAAE,OAAO,UAAU;AAC5B",
  "names": []
}
```

### 5.2 类型信息移除的映射

```
原始 TS                              转换后 JS
─────────────────                   ─────────────────
行 1: import { type Ref }     →     行 1: import { }     (type 被移除)
行 3: interface CounterReturn →     (完全移除)
行 4:   count: Ref<number>    →     (完全移除)
行 5:   increment: () => void →     (完全移除)
行 6: }                       →     (完全移除)
行 8: export function...      →     行 3: export function...
行 9: ref<number>(0)          →     行 4: ref(0)          (泛型移除)
行 10: (): void =>            →     行 5: () =>           (类型移除)
```

Source Map 的 mappings 需要正确处理这些行号跳跃：

```
转换后第 3 行 → 原始第 8 行
转换后第 4 行 → 原始第 9 行
转换后第 5 行 → 原始第 10 行
...
```

---

## 6. CSS/SCSS 的 Source Map 生成

### 6.1 SCSS 编译的 Source Map

```scss
// 原始 SCSS: main.scss
@use './variables' as *;                    // 行 1

.container {                                // 行 3
  max-width: $max-width;                    // 行 4 （变量: 1200px）
  
  .header {                                 // 行 6
    padding: $spacing-md;                   // 行 7 （变量: 16px）
    background: $primary-color;             // 行 8 （变量: #409eff）
    
    h1 {                                    // 行 10
      color: darken($primary-color, 10%);   // 行 11 （函数计算）
    }                                       // 行 12
  }                                         // 行 13
}                                           // 行 14
```

Sass 编译器输出：

```css
/* 编译后 CSS */
.container {                                /* 行 1 */
  max-width: 1200px;                        /* 行 2 */
}                                           /* 行 3 */
.container .header {                        /* 行 4 */
  padding: 16px;                            /* 行 5 */
  background: #409eff;                      /* 行 6 */
}                                           /* 行 7 */
.container .header h1 {                     /* 行 8 */
  color: #3a8ee6;                           /* 行 9 */
}                                           /* 行 10 */

/*# sourceMappingURL=main.css.map */
```

```json
// main.css.map
{
  "version": 3,
  "sources": ["main.scss", "_variables.scss"],
  "names": [],
  "mappings": "AAEA;EACE,eAAA;;AAEA;EACE,gBAAA;EACA,wBAAA;;AAEA;EACE,gCAAA",
  "file": "main.css"
}
```

### 6.2 映射解析

```
CSS 输出                    映射到 SCSS
─────────────────          ─────────────────
行 1: .container           → main.scss 行 3
行 2: max-width: 1200px    → main.scss 行 4 ($max-width 展开)
行 4: .container .header   → main.scss 行 6 (嵌套展开)
行 5: padding: 16px        → main.scss 行 7 ($spacing-md 展开)
行 9: color: #3a8ee6       → main.scss 行 11 (darken() 计算)
```

:::tip 变量追踪
虽然 `$primary-color` 定义在 `_variables.scss` 中，Source Map 会指向**使用位置**（main.scss 行 8），而不是变量定义位置。

这是因为调试时我们通常想知道"这个样式是在哪里写的"，而不是"变量在哪定义"。
:::

### 6.3 Scoped CSS 的 Source Map

Vue 组件的 scoped 样式会添加属性选择器：

```scss
// 原始 (HelloWorld.vue 行 12-14)
<style scoped>
.hello { color: red; }
</style>

// 转换后
.hello[data-v-7a7a37b1] { color: red; }
```

Source Map 仍然映射到原始 `.vue` 文件：

```json
{
  "version": 3,
  "sources": ["HelloWorld.vue"],
  "mappings": "AACO",  // 映射到 HelloWorld.vue 行 13
  "names": []
}
```

---

## 7. Rollup 的 Source Map 合并

### 7.1 模块合并时的 Source Map

Rollup 将多个模块打包到一个 chunk 时，需要合并它们的 Source Map：

```
输入模块                    输出 Chunk
─────────────────          ─────────────────
main.ts (map1)      ──┐
App.vue (map2)      ──┼──→  index-xxx.js + index-xxx.js.map
HelloWorld.vue (map3)─┘
```

### 7.2 合并过程详解

```javascript
// 假设的 chunk 内容
// index-xxx.js

// 来自 main.ts
import { createApp } from 'vue'                    // chunk 行 1

// 来自 HelloWorld.vue
const _sfc_main = {                                // chunk 行 4
  setup() {
    const count = ref(0)                           // chunk 行 6
    return { count }
  }
}

// 来自 App.vue  
const _sfc_main$1 = {                              // chunk 行 12
  // ...
}

// 来自 main.ts
const app = createApp(_sfc_main$1)                 // chunk 行 20
app.mount('#app')                                  // chunk 行 21
```

合并后的 Source Map：

```json
{
  "version": 3,
  "file": "index-a1b2c3d4.js",
  "sources": [
    "../../src/main.ts",
    "../../src/components/HelloWorld.vue",
    "../../src/App.vue"
  ],
  "sourcesContent": [
    "import { createApp } from 'vue'...",
    "<template>...</template>...",
    "<template>...</template>..."
  ],
  "mappings": "AAAA,SAAS,...;ACIA,MAAM,...;ACJA,...",
  "names": ["createApp", "ref", "count"]
}
```

### 7.3 mappings 合并逻辑

```
Chunk 行号    源文件索引    源文件行号    说明
─────────    ──────────   ──────────   ─────────────
行 1    →    sources[0]    行 1         main.ts 的 import
行 4    →    sources[1]    行 7         HelloWorld.vue 的 script
行 6    →    sources[1]    行 9         HelloWorld.vue: const count = ref(0)
行 12   →    sources[2]    行 5         App.vue 的 script
行 20   →    sources[0]    行 10        main.ts: createApp()
行 21   →    sources[0]    行 11        main.ts: app.mount()
```

---

## 8. 代码压缩阶段的 Source Map

### 8.1 esbuild 压缩

```javascript
// 压缩前 (index-xxx.js)
import { createApp, ref } from 'vue'

const _sfc_main = {
  __name: 'HelloWorld',
  setup() {
    const count = ref(0)
    const increment = () => {
      count.value++
    }
    return { count, increment }
  }
}

const app = createApp(_sfc_main)
app.mount('#app')
```

```javascript
// 压缩后
import{createApp as e,ref as t}from"vue";const n={__name:"HelloWorld",setup(){const n=t(0),o=()=>{n.value++};return{count:n,increment:o}}},o=e(n);o.mount("#app");
```

### 8.2 压缩后的 Source Map

```json
{
  "version": 3,
  "sources": ["../../src/main.ts", "../../src/components/HelloWorld.vue"],
  "mappings": "AAAA,QAAS,aAAA,EAAA,KAAA,MACA;AACT,MAAM,EAAA,EAAA;AAAA,EAAA,QAAA;AAAA,EAAA,OAAA;AACN,UAAM,IAAA,EAAA,CAAA;AACN,UAAM,IAAA,MAAA;AACJ,MAAA,MAAA;AAAA,IAAA;AACF,WAAA,EAAA,OAAA,GAAA,WAAA,EAAA;AAAA,EAAA;AAAA;AAGF,MAAM,IAAA,EAAA,CAAA;AACN,EAAA,MAAA,MAAA",
  "names": ["createApp", "ref", "count", "increment", "app"]
}
```

### 8.3 变量重命名的映射

压缩器重命名变量时，Source Map 需要通过 `names` 数组保留原始名称：

```
压缩后代码        names 索引    原始名称
─────────        ──────────    ─────────
e               names[0]      createApp
t               names[1]      ref
n (第一个)       names[2]      count
o               names[3]      increment
```

:::warning 为什么调试时能看到原始变量名？
浏览器 DevTools 使用 Source Map 的 `names` 数组恢复原始标识符名称。

当你在压缩代码中悬停 `n` 变量时，DevTools 会显示 `count` 这个原始名称。
:::

### 8.4 Terser vs esbuild 的 Source Map 质量

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'esbuild',  // 或 'terser'
    sourcemap: true,
  }
})
```

| 特性 | esbuild | Terser |
|------|---------|--------|
| 速度 | 极快（Go 实现） | 较慢（JS 实现） |
| Source Map 精度 | 良好 | 更精确 |
| 名称保留 | 基本 | 更完整 |
| 推荐场景 | 一般项目 | 需要精确调试时 |

---

## 9. 完整构建流程图

```
                    Vite Build with Source Map
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

源文件                        转换阶段                        Source Map
━━━━━                        ━━━━━━                         ━━━━━━━━━

                           ┌──────────────┐
HelloWorld.vue  ──────────→│  Vue Plugin  │
                           │  (SFC 解析)   │
                           └──────┬───────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ↓                   ↓                   ↓
        ┌──────────┐       ┌──────────┐       ┌──────────┐
        │ Template │       │  Script  │       │  Style   │
        │ Compiler │       │ Compiler │       │ Compiler │
        └────┬─────┘       └────┬─────┘       └────┬─────┘
             │                  │                  │
             ↓                  ↓                  ↓
        map_template       map_script         map_style
             │                  │                  │
             └──────────────────┴──────────────────┘
                                │
                                ↓
                    ┌───────────────────────┐
                    │   @ampproject/remapping │
                    │   (合并三个 Source Map)  │
                    └───────────┬───────────┘
                                │
                                ↓
                         map_vue (合并后)
                                │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                │
                           ┌────┴────┐
useCounter.ts  ───────────→│ esbuild │
                           │ (TS编译) │
                           └────┬────┘
                                │
                                ↓
                           map_ts
                                │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                │
                           ┌────┴────┐
main.scss  ───────────────→│  Sass   │
                           │ (SCSS编译)│
                           └────┬────┘
                                │
                                ↓
                           map_scss
                                │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                │
    所有模块   ─────────────────┴─────────────────
       │
       ↓
┌──────────────────────────────────────────────────────────────┐
│                         Rollup                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1. 收集所有模块的 Source Map                            │  │
│  │                                                         │  │
│  │    map_vue ─┐                                          │  │
│  │    map_ts  ─┼──→ 模块 Source Map 集合                  │  │
│  │    map_scss ┘                                          │  │
│  │                                                         │  │
│  │ 2. 构建依赖图，确定模块在 chunk 中的位置                 │  │
│  │                                                         │  │
│  │ 3. 生成 chunk 并合并 Source Map                        │  │
│  │                                                         │  │
│  │    chunk_content + merged_source_map                   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────────┐
│                    Minify (esbuild/terser)                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1. 压缩代码（重命名变量、移除空格）                      │  │
│  │                                                         │  │
│  │ 2. 更新 Source Map                                     │  │
│  │    - 调整列号（代码变为一行）                           │  │
│  │    - 记录变量重命名到 names 数组                        │  │
│  │                                                         │  │
│  │ 3. 再次合并 Source Map                                 │  │
│  │    minified_map ← merge(rollup_map, minify_map)        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────────┐
│                      输出文件                                  │
│                                                               │
│  dist/assets/                                                │
│  ├── index-a1b2c3d4.js          (压缩后的代码)                │
│  ├── index-a1b2c3d4.js.map      (最终合并的 Source Map)       │
│  ├── index-a1b2c3d4.css         (压缩后的样式)                │
│  └── index-a1b2c3d4.css.map     (CSS Source Map)             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 9.1 Source Map 合并次数统计

对于一个典型的 Vue SFC 文件：

```
合并阶段                          合并次数
──────────                       ─────────
1. SFC 内部                      3 次 (template + script + style)
   (template map + script map + style map)
   
2. TypeScript 转换               1 次
   (esbuild ts map + sfc map)
   
3. Rollup 打包                   N 次 (N = chunk 中的模块数)
   (所有模块 map 合并)
   
4. 代码压缩                      1 次
   (rollup map + minify map)
   
5. CSS 压缩                      1 次
   (sass map + minify map)
   
总计：约 5 + N 次合并操作
```

---

## 10. Source Map 调试实战

### 10.1 验证 Source Map 正确性

```javascript
// 在浏览器控制台执行
async function validateSourceMap(jsUrl) {
  const jsContent = await fetch(jsUrl).then(r => r.text())
  
  // 提取 sourceMappingURL
  const match = jsContent.match(/\/\/# sourceMappingURL=(.+)/)
  if (!match) {
    console.error('No source map reference found')
    return
  }
  
  const mapUrl = new URL(match[1], jsUrl).href
  const sourceMap = await fetch(mapUrl).then(r => r.json())
  
  console.log('Source Map Info:')
  console.log('- Version:', sourceMap.version)
  console.log('- Sources:', sourceMap.sources)
  console.log('- Names count:', sourceMap.names?.length || 0)
  console.log('- Has sourcesContent:', !!sourceMap.sourcesContent)
  
  return sourceMap
}

validateSourceMap('/assets/index-a1b2c3d4.js')
```

### 10.2 使用 source-map 库解析

```javascript
// 安装: npm install source-map
import { SourceMapConsumer } from 'source-map'

async function debugSourceMap() {
  const rawSourceMap = await fetch('/assets/index.js.map').then(r => r.json())
  
  const consumer = await new SourceMapConsumer(rawSourceMap)
  
  // 查询：压缩代码第 1 行第 500 列对应的源码位置
  const originalPosition = consumer.originalPositionFor({
    line: 1,
    column: 500
  })
  
  console.log('Original Position:', originalPosition)
  // {
  //   source: '../../src/components/HelloWorld.vue',
  //   line: 9,
  //   column: 4,
  //   name: 'count'
  // }
  
  // 反向查询：源码位置对应的压缩代码位置
  const generatedPosition = consumer.generatedPositionFor({
    source: '../../src/components/HelloWorld.vue',
    line: 9,
    column: 4
  })
  
  console.log('Generated Position:', generatedPosition)
  // { line: 1, column: 500, lastColumn: 510 }
  
  consumer.destroy()
}
```

### 10.3 Chrome DevTools 调试技巧

```javascript
// 1. 在源文件中设置断点
// Sources 面板 → 找到原始文件 → 点击行号设置断点

// 2. 条件断点
// 右键行号 → Add conditional breakpoint
// 输入条件: count.value > 5

// 3. 查看变量映射
// 悬停压缩代码中的变量，会显示原始变量名

// 4. 黑盒第三方库
// 右键 node_modules 文件 → Add script to ignore list
// 这样单步调试时会跳过这些文件
```

### 10.4 常见问题排查

**问题 1：Source Map 无法加载**

```javascript
// 检查 Source Map 路径
// 1. 打开 DevTools → Network
// 2. 过滤 ".map"
// 3. 检查是否 404

// 常见原因：
// - sourcemap: 'hidden' 不会在 JS 中添加引用
// - 服务器未配置 .map 文件的 MIME 类型
// - 路径不正确（相对路径问题）
```

**问题 2：映射位置不准确**

```javascript
// 可能的原因：
// 1. Source Map 合并过程中精度丢失
// 2. 某个插件没有正确传递 Source Map
// 3. 代码转换顺序问题

// 排查方法：
// 禁用压缩，检查未压缩代码的 Source Map 是否正确
export default defineConfig({
  build: {
    minify: false,
    sourcemap: true
  }
})
```

**问题 3：sourcesContent 为空**

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        sourcemapExcludeSources: false  // 确保包含源码
      }
    }
  }
})
```

---

## 总结

### Source Map 构建的关键点

1. **多阶段转换**：Vue SFC → TypeScript → Rollup → Minify，每一步都生成 Source Map

2. **Source Map 合并**：使用 `@ampproject/remapping` 合并转换链中的所有 Source Map

3. **精度传递**：每个工具都需要正确处理和传递 Source Map，任一环节出错都会导致映射不准确

4. **性能影响**：生成和合并 Source Map 会增加构建时间，但对运行时无影响

### 配置建议

| 环境 | sourcemap 配置 | 说明 |
|------|----------------|------|
| 开发 | `true`（默认） | 便于调试 |
| 测试 | `true` | 错误追踪 |
| 生产（内部） | `true` | 完整调试能力 |
| 生产（公开） | `'hidden'` | 上传到 Sentry 等监控平台 |
| 生产（追求体积） | `false` | 不生成 Source Map |

> Source Map 是现代前端调试的基石，理解其构建流程有助于排查复杂的映射问题。

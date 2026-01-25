---
title: Sourcemap 完全指南
date: 2026-01-23
duration: 60min
type: notes
art: random
---

[[toc]]

本文档详细讲解 Vite 打包生成的 Sourcemap 是什么、为什么需要它、如何配置和使用，以及最佳实践。

## 目录

- [1. Sourcemap 是什么](#1-sourcemap-是什么)
- [2. 为什么需要 Sourcemap](#2-为什么需要-sourcemap)
- [3. Sourcemap 的工作原理](#3-sourcemap-的工作原理)
- [4. Vite 中的 Sourcemap 配置](#4-vite-中的-sourcemap-配置)
- [5. Sourcemap 类型详解](#5-sourcemap-类型详解)
- [6. Sourcemap 文件结构](#6-sourcemap-文件结构)
- [7. 生产环境 Sourcemap 策略](#7-生产环境-sourcemap-策略)
- [8. Sourcemap 与错误监控](#8-sourcemap-与错误监控)
- [9. 性能与安全考虑](#9-性能与安全考虑)
- [10. 最佳实践](#10-最佳实践)

---

## 1. Sourcemap 是什么

### 1.1 定义

**Sourcemap（源码映射）** 是一个信息文件，它存储了**转换后的代码**与**原始源代码**之间的位置映射关系。

简单来说：
```
原始代码（开发时写的）  ←→  Sourcemap  ←→  转换后的代码（浏览器运行的）
```

### 1.2 生活化类比

想象你在读一本翻译过的书：

```
┌─────────────────────────────────────────────────────────────┐
│  原著（中文）                                                │
│  第 3 章，第 15 页，第 8 行                                  │
│  "这是一个美好的早晨"                                        │
└─────────────────────────────────────────────────────────────┘
                            ↕
                      Sourcemap
                    （翻译对照表）
                            ↕
┌─────────────────────────────────────────────────────────────┐
│  译本（英文）                                                │
│  Chapter 3, Page 20, Line 12                                │
│  "It was a beautiful morning"                               │
└─────────────────────────────────────────────────────────────┘
```

**Sourcemap 就像这个翻译对照表**：
- 告诉你英文版的某一行对应中文版的哪一行
- 让你能从译本快速找到原著的位置
- 帮助你理解原文的真实含义

### 1.3 前端开发中的实际场景

**开发时写的代码（原始代码）：**
```javascript
// src/utils/calculator.js
export function add(a, b) {
  console.log('Adding numbers:', a, b);
  return a + b;
}

export function multiply(a, b) {
  console.log('Multiplying numbers:', a, b);
  return a * b;
}
```

**构建后浏览器运行的代码（转换后的代码）：**
```javascript
// dist/assets/calculator-a1b2c3d4.js
function t(n,r){return console.log("Adding numbers:",n,r),n+r}function e(n,r){return console.log("Multiplying numbers:",n,r),n*r}export{t as add,e as multiply};
```

**问题来了：**
- 代码被压缩成一行，完全看不懂
- 变量名被改了（`add` → `t`, `multiply` → `e`）
- 如果这里报错，你怎么知道是原始代码的哪一行出了问题？

**Sourcemap 的作用：**
```
浏览器报错：calculator-a1b2c3d4.js:1:45
              ↓
通过 Sourcemap 映射
              ↓
实际位置：src/utils/calculator.js:3:3
         （add 函数的 console.log 那一行）
```

---

## 2. 为什么需要 Sourcemap

### 2.1 代码转换的必然性

现代前端开发中，代码会经历多次转换：

```
┌─────────────────────────────────────────────────────────────┐
│  开发阶段：你写的代码                                        │
│  ─────────────────────────────────────────────────────────  │
│  • TypeScript / JSX                                         │
│  • ES6+ 语法（箭头函数、解构、async/await）                  │
│  • Vue 单文件组件                                            │
│  • SCSS / Less                                              │
│  • 可读的变量名和注释                                        │
│  • 多个文件，清晰的目录结构                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    构建工具处理
                    （Vite / Webpack）
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  生产环境：浏览器运行的代码                                  │
│  ─────────────────────────────────────────────────────────  │
│  • 纯 JavaScript（ES5 或 ES6）                               │
│  • 代码压缩（去空格、去注释、去换行）                        │
│  • 变量名混淆（a, b, c, t, e, n）                           │
│  • 多个文件合并成几个 bundle                                 │
│  • 代码分割和懒加载                                          │
└─────────────────────────────────────────────────────────────┘
```

**转换示例：**

**原始代码（TypeScript + Vue）：**
```typescript
// src/components/UserCard.vue
<script setup lang="ts">
interface User {
  name: string;
  age: number;
}

const props = defineProps<{
  user: User;
}>();

const greeting = computed(() => {
  return `Hello, ${props.user.name}! You are ${props.user.age} years old.`;
});
</script>
```

**转换后的代码（压缩后）：**
```javascript
const t=e=>({user:e}),n=e=>`Hello, ${e.user.name}! You are ${e.user.age} years old.`;
```

**没有 Sourcemap 的痛苦：**
- ❌ 报错显示在压缩后的代码位置，完全看不懂
- ❌ 无法定位到原始代码的具体行
- ❌ 调试时只能看到混淆后的变量名
- ❌ 无法在浏览器中设置断点调试原始代码

**有 Sourcemap 的便利：**
- ✅ 报错自动映射到原始代码位置
- ✅ 浏览器 DevTools 显示原始代码
- ✅ 可以在原始代码上设置断点
- ✅ 调试时看到真实的变量名和代码结构

### 2.2 核心需求场景

#### 场景 1：生产环境错误调试

**问题：**
```javascript
// 生产环境报错
Uncaught TypeError: Cannot read property 'name' of undefined
  at n (vendor-vue-e5f6g7h8.js:1:2345)
```

**没有 Sourcemap：**
- 打开 `vendor-vue-e5f6g7h8.js`，看到的是一行压缩代码
- 完全不知道是哪个组件、哪个函数出的问题
- 只能靠猜测或者重现问题

**有 Sourcemap：**
```javascript
// 浏览器自动映射到原始位置
Uncaught TypeError: Cannot read property 'name' of undefined
  at UserCard.vue:15:23
  at computed (vue.js:1234)
```
- 直接定位到 `UserCard.vue` 的第 15 行
- 可以看到原始代码上下文
- 快速找到问题根源

#### 场景 2：性能分析

**Chrome DevTools Performance 面板：**

没有 Sourcemap：
```
函数调用栈：
├─ n (vendor-vue.js:1:2345)  ← 看不懂
├─ t (vendor-vue.js:1:5678)  ← 看不懂
└─ e (index.js:1:9012)       ← 看不懂
```

有 Sourcemap：
```
函数调用栈：
├─ UserCard.render (UserCard.vue:15)  ← 清晰明了
├─ VNode.patch (vue/runtime-core.js:234)
└─ App.mount (main.js:10)
```

#### 场景 3：错误监控平台

**Sentry / Bugsnag 等错误监控：**

没有 Sourcemap：
```
Error: User not found
  at n (index-a1b2c3d4.js:1:12345)
  at t (index-a1b2c3d4.js:1:23456)
```
- 无法定位具体代码
- 无法分析错误原因

有 Sourcemap（上传到 Sentry）：
```
Error: User not found
  at fetchUser (src/api/user.js:45)
  at UserProfile.loadData (src/views/UserProfile.vue:23)
```
- 精确定位到源代码
- 可以看到完整的调用栈
- 快速修复问题

---

## 3. Sourcemap 的工作原理

### 3.1 映射关系的本质

Sourcemap 记录了三个关键信息：

```
1. 转换后代码的位置（行号、列号）
2. 原始代码的位置（行号、列号）
3. 原始文件名
```

**示例：**

原始代码：
```javascript
// src/utils.js (第 3 行，第 10 列)
function add(a, b) {
  return a + b;
}
```

转换后代码：
```javascript
// dist/utils.js (第 1 行，第 15 列)
function t(n,r){return n+r}
```

Sourcemap 记录：
```
转换后位置 (1, 15) → 原始位置 (3, 10) @ src/utils.js
```

### 3.2 映射过程图解

```
┌─────────────────────────────────────────────────────────────┐
│  步骤 1: 构建工具生成 Sourcemap                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Vite 构建过程：                                             │
│  1. 读取源代码                                               │
│  2. 转换代码（TypeScript → JS, 压缩等）                      │
│  3. 记录每个 token 的位置变化                                │
│  4. 生成 .map 文件                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 2: 浏览器加载代码和 Sourcemap                          │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  浏览器看到：                                                │
│  <script src="index-a1b2c3d4.js"></script>                  │
│                                                              │
│  index-a1b2c3d4.js 文件末尾：                                │
│  //# sourceMappingURL=index-a1b2c3d4.js.map                 │
│                                                              │
│  浏览器自动下载：                                            │
│  index-a1b2c3d4.js.map                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 3: 发生错误时，浏览器使用 Sourcemap 映射              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  1. 捕获错误：index-a1b2c3d4.js:1:2345                      │
│  2. 查找 Sourcemap：找到对应的映射记录                       │
│  3. 映射到原始位置：src/main.js:15:10                       │
│  4. 在 DevTools 中显示原始代码                               │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 位置映射的精确性

Sourcemap 的映射是**精确到列**的：

```javascript
// 原始代码
const greeting = `Hello, ${name}!`;
//    ↑        ↑  ↑      ↑  ↑    ↑
//    列1      列6 列9    列17 列22 列24

// 转换后代码
const t=`Hello, ${n}!`;
//    ↑ ↑ ↑      ↑ ↑ ↑
//    列1 列7 列9  列17 列19 列21

// Sourcemap 记录每个 token 的映射
(1, 1)  → (1, 1)   // const
(1, 7)  → (1, 6)   // greeting → t
(1, 9)  → (1, 9)   // `Hello,
(1, 17) → (1, 17)  // ${
(1, 19) → (1, 22)  // name → n
(1, 21) → (1, 24)  // }!`
```

这种精确的映射确保了：
- 错误提示准确到具体的变量或表达式
- 断点设置在正确的位置
- 调试时变量名正确显示

---

## 4. Vite 中的 Sourcemap 配置

### 4.1 基础配置

在 Vite 中，Sourcemap 通过 `build.sourcemap` 选项配置：

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: true,  // 配置 sourcemap 生成
  }
}
```

### 4.2 配置选项详解

Vite 支持多种 Sourcemap 配置值：

| 配置值 | 说明 | 生成的文件 | sourceMappingURL 注释 |
|-------|------|-----------|---------------------|
| `false` | 不生成 sourcemap | 无 | 无 |
| `true` | 生成独立的 .map 文件 | `index.js` + `index.js.map` | `//# sourceMappingURL=index.js.map` |
| `'inline'` | sourcemap 内联到 JS 文件中 | `index.js`（包含 sourcemap） | `//# sourceMappingURL=data:application/json;base64,...` |
| `'hidden'` | 生成 .map 文件但不添加注释 | `index.js` + `index.js.map` | 无 |

### 4.3 各配置的详细说明

#### 配置 1: `sourcemap: false`（默认）

**特点：**
- 不生成任何 sourcemap 文件
- 构建速度最快
- 产物体积最小

**适用场景：**
- 不需要调试的生产环境
- 对构建速度要求极高的场景

**输出示例：**
```bash
dist/
├── assets/
│   ├── index-a1b2c3d4.js       # 只有 JS 文件
│   └── vendor-vue-e5f6g7h8.js
└── index.html
```

**JS 文件内容：**
```javascript
// dist/assets/index-a1b2c3d4.js
function t(n,r){return n+r}
// 文件末尾没有 sourceMappingURL 注释
```

#### 配置 2: `sourcemap: true`

**特点：**
- 生成独立的 .map 文件
- JS 文件末尾添加 sourceMappingURL 注释
- 浏览器会自动下载 .map 文件

**适用场景：**
- 开发环境
- 需要调试的测试环境
- 内部使用的生产环境

**输出示例：**
```bash
dist/
├── assets/
│   ├── index-a1b2c3d4.js
│   ├── index-a1b2c3d4.js.map      # ← 生成了 .map 文件
│   ├── vendor-vue-e5f6g7h8.js
│   └── vendor-vue-e5f6g7h8.js.map # ← 生成了 .map 文件
└── index.html
```

**JS 文件内容：**
```javascript
// dist/assets/index-a1b2c3d4.js
function t(n,r){return n+r}
//# sourceMappingURL=index-a1b2c3d4.js.map  // ← 添加了注释
```

**浏览器行为：**
1. 加载 `index-a1b2c3d4.js`
2. 看到 `sourceMappingURL` 注释
3. 自动发起请求下载 `index-a1b2c3d4.js.map`
4. 使用 sourcemap 进行错误映射

#### 配置 3: `sourcemap: 'inline'`

**特点：**
- sourcemap 内容以 base64 编码内联到 JS 文件中
- 不生成独立的 .map 文件
- JS 文件体积会增大（约增加 50-100%）

**适用场景：**
- 需要单文件部署的场景
- 不希望暴露 .map 文件的场景
- 调试时不想处理多个文件

**输出示例：**
```bash
dist/
├── assets/
│   ├── index-a1b2c3d4.js       # 只有 JS 文件，但体积更大
│   └── vendor-vue-e5f6g7h8.js
└── index.html
```

**JS 文件内容：**
```javascript
// dist/assets/index-a1b2c3d4.js
function t(n,r){return n+r}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tYWluLmpzIl0sIm5hbWVzIjpbImFkZCIsImEiLCJiIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxFQUFUQyxFQUFXQyxHQUFYLE9BQW9CRCxFQUFJQyJ9
```

**优缺点对比：**

✅ 优点：
- 单文件部署，不需要额外处理 .map 文件
- 不会暴露独立的 .map 文件

❌ 缺点：
- JS 文件体积显著增大
- 浏览器需要解析 base64 编码
- 不利于 CDN 缓存（JS 文件变化频繁）

#### 配置 4: `sourcemap: 'hidden'`（推荐生产环境）

**特点：**
- 生成独立的 .map 文件
- **不在 JS 文件中添加 sourceMappingURL 注释**
- 浏览器不会自动下载 .map 文件
- 可以手动上传到错误监控平台

**适用场景：**
- ✅ **生产环境（强烈推荐）**
- 需要错误追踪但不想暴露源码
- 配合 Sentry 等错误监控平台使用

**输出示例：**
```bash
dist/
├── assets/
│   ├── index-a1b2c3d4.js
│   ├── index-a1b2c3d4.js.map      # ← 生成了 .map 文件
│   ├── vendor-vue-e5f6g7h8.js
│   └── vendor-vue-e5f6g7h8.js.map # ← 生成了 .map 文件
└── index.html
```

**JS 文件内容：**
```javascript
// dist/assets/index-a1b2c3d4.js
function t(n,r){return n+r}
// 文件末尾没有 sourceMappingURL 注释 ← 关键区别
```

**工作流程：**
```
1. 构建时生成 .map 文件
   ↓
2. 部署时：
   - JS 文件部署到 CDN
   - .map 文件上传到 Sentry（不部署到 CDN）
   ↓
3. 用户访问：
   - 浏览器只下载 JS 文件
   - 不会下载 .map 文件（因为没有注释）
   - 普通用户看不到源码
   ↓
4. 发生错误：
   - 错误信息发送到 Sentry
   - Sentry 使用上传的 .map 文件进行映射
   - 开发者看到原始代码位置
```

**优势：**
- ✅ 保护源码不被普通用户看到
- ✅ 支持错误追踪和调试
- ✅ 不增加用户下载的文件大小
- ✅ 灵活控制 sourcemap 的使用

### 4.4 本项目的配置

```javascript
// vite.config.mjs
export default {
  build: {
    sourcemap: 'hidden',  // 使用 hidden 模式
  }
}
```

**为什么选择 `hidden`？**

1. **安全性**：不暴露源码给普通用户
2. **性能**：用户不需要下载 .map 文件
3. **可调试性**：配合 Sentry 可以追踪错误
4. **灵活性**：可以选择性上传 sourcemap

---

## 5. Sourcemap 类型详解

### 5.1 Sourcemap 的不同格式

> **注意**：本节介绍的是 **Webpack 的 devtool 选项**，用于帮助理解 Sourcemap 的不同生成策略。Vite 的 `build.sourcemap` 只支持 `true`、`false`、`'inline'`、`'hidden'` 四个值，但了解这些格式有助于理解 Sourcemap 的工作原理。

除了 Vite 的配置选项，Sourcemap 本身也有不同的生成格式（主要在 Webpack 中体现），影响文件大小和精确度。

#### 格式对比表

| 格式 | 说明 | 文件大小 | 精确度 | 适用场景 |
|-----|------|---------|--------|---------|
| **eval** | 使用 eval 包裹代码 | 最小 | 低 | 开发环境（快速） |
| **cheap** | 只映射行，不映射列 | 小 | 中 | 开发环境（平衡） |
| **cheap-module** | 只映射行，包含 loader 信息 | 小 | 中 | 开发环境（推荐） |
| **source-map** | 完整的 sourcemap | 大 | 高 | 生产环境 |
| **inline-source-map** | 内联的完整 sourcemap | 最大 | 高 | 特殊场景 |
| **hidden-source-map** | 不添加引用注释 | 大 | 高 | 生产环境（推荐） |
| **nosources-source-map** | 不包含源码内容 | 中 | 高 | 保护源码 |

### 5.2 各格式详细说明

#### 格式 1: eval

**特点：**
- 每个模块使用 `eval()` 执行
- 在 eval 的字符串末尾添加 `//# sourceURL`
- 不生成独立的 .map 文件
- 构建速度最快

**生成的代码：**
```javascript
eval("function add(a, b) {\n  return a + b;\n}\n//# sourceURL=webpack:///src/utils.js");
```

**优缺点：**
- ✅ 构建速度极快
- ✅ 可以看到文件名
- ❌ 只能定位到文件，不能定位到具体行
- ❌ 不适合生产环境

#### 格式 2: cheap-source-map

**特点：**
- 只映射行号，不映射列号
- 不包含 loader 的 sourcemap
- 文件较小

**映射示例：**
```javascript
// 原始代码（第 3 行）
const greeting = `Hello, ${name}!`;

// 转换后代码（第 1 行）
const t=`Hello, ${n}!`;

// cheap-source-map 映射
转换后第 1 行 → 原始第 3 行（不记录列号）
```

**优缺点：**
- ✅ 文件较小
- ✅ 构建速度快
- ❌ 无法精确定位到列
- ❌ 不包含 loader 转换信息

#### 格式 3: cheap-module-source-map（推荐开发环境）

**特点：**
- 只映射行号，不映射列号
- **包含 loader 的 sourcemap**（如 babel-loader, vue-loader）
- 可以看到转换前的原始代码

**示例：**
```javascript
// 原始 TypeScript 代码
const greeting: string = `Hello, ${name}!`;

// 经过 ts-loader 转换
const greeting = `Hello, ${name}!`;

// 经过压缩
const t=`Hello, ${n}!`;

// cheap-module-source-map 可以映射回原始 TS 代码
```

**优缺点：**
- ✅ 包含完整的转换链信息
- ✅ 文件大小适中
- ✅ 适合开发环境
- ❌ 无法精确定位到列

#### 格式 4: source-map（推荐生产环境）

**特点：**
- 完整的 sourcemap
- 映射行号和列号
- 包含所有转换信息
- 文件最大但最精确

**映射示例：**
```javascript
// 精确到列的映射
原始位置 (3, 10) → 转换后位置 (1, 15)
原始位置 (3, 22) → 转换后位置 (1, 19)
```

**优缺点：**
- ✅ 最精确的映射
- ✅ 完整的调试信息
- ✅ 适合生产环境错误追踪
- ❌ 文件较大
- ❌ 构建时间较长

#### 格式 5: hidden-source-map（推荐生产环境）

**特点：**
- 与 source-map 相同，但不添加 `sourceMappingURL` 注释
- 浏览器不会自动加载
- 可以手动上传到错误监控平台

**使用场景：**
```javascript
// 构建配置
{
  devtool: 'hidden-source-map'  // Webpack
  // 或
  sourcemap: 'hidden'  // Vite
}

// 生成的 JS 文件（无注释）
function t(n,r){return n+r}
// 文件末尾没有 //# sourceMappingURL

// 但会生成 .map 文件
// index.js.map 存在，可以上传到 Sentry
```

#### 格式 6: nosources-source-map

**特点：**
- 生成完整的 sourcemap
- **不包含原始源码内容**
- 只包含位置映射信息

**Sourcemap 文件对比：**

普通 source-map：
```json
{
  "version": 3,
  "sources": ["src/utils.js"],
  "sourcesContent": [
    "function add(a, b) {\n  return a + b;\n}"
  ],
  "mappings": "AAAA,SAASA,EAATC,EAAWC..."
}
```

nosources-source-map：
```json
{
  "version": 3,
  "sources": ["src/utils.js"],
  "sourcesContent": null,  // ← 不包含源码
  "mappings": "AAAA,SAASA,EAATC,EAAWC..."
}
```

**优缺点：**
- ✅ 保护源码不被泄露
- ✅ 仍然可以映射到文件和行号
- ❌ 无法在浏览器中查看原始代码
- ❌ 调试体验较差

### 5.3 配置选择建议

#### 开发环境

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: true,  // Vite 开发环境默认已启用 sourcemap
  }
}
```

> **注意**：Vite 开发模式下默认启用 sourcemap，无需额外配置。`build.sourcemap` 主要用于生产构建。

**推荐理由：**
- 快速构建
- 完整的调试信息
- 可以看到原始代码

#### 生产环境

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: 'hidden',  // 推荐
  }
}
```

**推荐理由：**
- 不暴露源码给用户
- 支持错误追踪
- 可以上传到 Sentry

#### 高安全性要求

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: false,  // 完全不生成
  }
}
```

**推荐理由：**
- 完全不暴露任何信息
- 最小的产物体积
- 最快的构建速度

---

## 6. Sourcemap 文件结构

### 6.1 Sourcemap 文件格式

Sourcemap 文件是一个 JSON 格式的文件，包含了代码映射的所有信息。

**完整示例：**

```json
{
  "version": 3,
  "file": "index.js",
  "sourceRoot": "",
  "sources": [
    "src/utils.js",
    "src/main.js"
  ],
  "sourcesContent": [
    "function add(a, b) {\n  return a + b;\n}",
    "import { add } from './utils.js';\nconsole.log(add(1, 2));"
  ],
  "names": [
    "add",
    "a",
    "b",
    "console",
    "log"
  ],
  "mappings": "AAAA,SAASA,EAATC,EAAWC,GAAX,CAAe,OAAOD,EAAIC,CAA1B,CCAAC,QAAQC,IAAI,CAACJ,EAAI,CAAC,EAAE,CAAC,CAAC"
}
```

### 6.2 字段详解

#### 字段 1: version

```json
"version": 3
```

**说明：**
- Sourcemap 规范的版本号
- 当前最新版本是 3
- 版本 1 和 2 已废弃

#### 字段 2: file

```json
"file": "index.js"
```

**说明：**
- 转换后的文件名
- 这个 sourcemap 对应的 JS 文件

#### 字段 3: sourceRoot

```json
"sourceRoot": ""
```

**说明：**
- 源文件的根路径
- 通常为空字符串
- 如果设置了，会作为 sources 中路径的前缀

**示例：**
```json
{
  "sourceRoot": "/project/",
  "sources": ["src/utils.js"]
}
// 实际路径：/project/src/utils.js
```

#### 字段 4: sources

```json
"sources": [
  "src/utils.js",
  "src/main.js"
]
```

**说明：**
- 原始源文件的路径数组
- 相对于 sourceRoot 的路径
- 按照在转换后代码中出现的顺序排列

#### 字段 5: sourcesContent

```json
"sourcesContent": [
  "function add(a, b) {\n  return a + b;\n}",
  "import { add } from './utils.js';\nconsole.log(add(1, 2));"
]
```

**说明：**
- 原始源文件的完整内容
- 与 sources 数组一一对应
- 可选字段，如果不包含则为 null

**作用：**
- 浏览器可以直接显示原始代码
- 不需要额外请求源文件
- 方便离线调试

**nosources-source-map 模式：**
```json
"sourcesContent": null  // 不包含源码内容
```

#### 字段 6: names

```json
"names": [
  "add",
  "a",
  "b",
  "console",
  "log"
]
```

**说明：**
- 原始代码中的变量名、函数名等标识符
- 用于在 mappings 中引用
- 压缩后的代码可以映射回原始名称

**示例：**
```javascript
// 原始代码
function add(a, b) {
  return a + b;
}

// 压缩后
function t(n,r){return n+r}

// names 数组
["add", "a", "b"]

// 映射关系
t → add (names[0])
n → a   (names[1])
r → b   (names[2])
```

#### 字段 7: mappings（核心字段）

```json
"mappings": "AAAA,SAASA,EAATC,EAAWC,GAAX,CAAe,OAAOD,EAAIC"
```

**说明：**
- 最核心、最复杂的字段
- 使用 VLQ（Variable Length Quantity）编码
- 记录了所有的位置映射关系

**编码规则：**
- 使用 Base64 字符编码
- 分号 `;` 分隔行
- 逗号 `,` 分隔同一行的映射点

**解码后的信息：**
每个映射点包含 5 个值：
1. 生成代码的列偏移
2. 源文件索引（sources 数组的索引）
3. 源代码的行偏移
4. 源代码的列偏移
5. 名称索引（names 数组的索引，可选）

### 6.3 mappings 字段详解

#### VLQ 编码原理

**为什么使用 VLQ？**
- 位置信息通常是小数字
- VLQ 可以用更少的字符表示小数字
- 大幅减小 sourcemap 文件体积

**编码示例：**
```
数字 0  → A
数字 1  → C
数字 2  → E
数字 -1 → D
数字 15 → e
数字 16 → gB
```

#### mappings 结构示例

```javascript
// 原始代码（2 行）
function add(a, b) {
  return a + b;
}

// 压缩后代码（1 行）
function t(n,r){return n+r}

// mappings 字段
"AAAA,SAASA,EAATC,EAAWC,GAAX,CAAe,OAAOD,EAAIC"
//    ↑     ↑     ↑     ↑     ↑       ↑      ↑
//    |     |     |     |     |       |      |
//  function  add   (    a     ,       b      )
```

**分号分隔行：**
```
"AAAA,SAASA;CCAA,QAAQC"
//          ↑
//      分号表示换行
//  第 1 行: AAAA,SAASA
//  第 2 行: CCAA,QAAQC
```

**逗号分隔映射点：**
```
"AAAA,SAASA,EAATC"
//    ↑      ↑
//  逗号分隔同一行的不同映射点
//  映射点 1: AAAA
//  映射点 2: SAASA
//  映射点 3: EAATC
```

### 6.4 实际文件大小对比

**示例项目构建产物：**

| 文件类型 | 文件大小 | 说明 |
|---------|---------|------|
| `index.js` | 200 KB | 压缩后的 JS 文件 |
| `index.js.map` | 800 KB | 完整的 sourcemap（约 4 倍） |
| `index.js.map` (nosources) | 150 KB | 不含源码的 sourcemap |
| `index.js` (inline) | 1 MB | 内联 sourcemap 的 JS |

**结论：**
- Sourcemap 文件通常是 JS 文件的 3-5 倍大小
- 使用 `hidden` 模式可以避免用户下载
- 使用 `nosources` 可以减小 sourcemap 体积

---

## 7. 生产环境 Sourcemap 策略

### 7.1 常见部署策略

#### 策略 1: 完全不生成（不推荐）

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: false
  }
}
```

**优点：**
- ✅ 构建速度最快
- ✅ 产物体积最小
- ✅ 完全不暴露源码

**缺点：**
- ❌ 无法追踪生产环境错误
- ❌ 无法调试线上问题
- ❌ 错误信息完全无法定位

**适用场景：**
- 对安全性要求极高的项目
- 不需要错误追踪的简单项目

#### 策略 2: 生成但不部署（推荐）

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: 'hidden'  // 生成但不添加引用
  }
}
```

**部署流程：**
```bash
# 1. 构建
npm run build

# 2. 分离文件
dist/
├── assets/
│   ├── index.js       # 部署到 CDN
│   └── index.js.map   # 上传到 Sentry，不部署

# 3. 部署 JS 文件到 CDN
rsync -av dist/assets/*.js cdn:/path/

# 4. 上传 sourcemap 到 Sentry
sentry-cli releases files VERSION upload-sourcemaps dist/assets/
```

**优点：**
- ✅ 用户不会下载 sourcemap
- ✅ 支持错误追踪
- ✅ 保护源码安全
- ✅ 灵活控制访问权限

**缺点：**
- ❌ 需要额外的部署步骤
- ❌ 需要配置错误监控平台

**适用场景：**
- ✅ **大多数生产项目（强烈推荐）**

#### 策略 3: 条件部署

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: true  // 生成并添加引用
  }
}
```

**Nginx 配置（限制访问）：**
```nginx
# 只允许内网 IP 访问 .map 文件
location ~* \.map$ {
  # 允许内网 IP
  allow 10.0.0.0/8;
  allow 192.168.0.0/16;

  # 拒绝其他所有 IP
  deny all;

  # 或者需要认证
  auth_basic "Restricted";
  auth_basic_user_file /etc/nginx/.htpasswd;
}
```

**优点：**
- ✅ 内部人员可以直接调试
- ✅ 外部用户无法访问
- ✅ 灵活的访问控制

**缺点：**
- ❌ 需要配置服务器
- ❌ 仍然部署了 sourcemap 文件

**适用场景：**
- 内部使用的管理系统
- 需要现场调试的项目

### 7.2 本项目的策略

**配置：**
```javascript
// vite.config.mjs
export default {
  build: {
    sourcemap: 'hidden',
  }
}
```

**插件过滤：**
```javascript
// vite/plugins/sourcemap-output-filter.js
export default function createSourcemapOutputFilter() {
  return {
    name: 'sourcemap-output-filter',
    apply: 'build',
    enforce: 'post',

    generateBundle(outputOptions, bundle) {
      // 定义需要排除的 chunk 模式
      const excludePatterns = [
        /^vendor-/,        // 所有 vendor chunk
        /^monaco-editor/,  // monaco-editor
      ];

      for (const fileName in bundle) {
        const file = bundle[fileName];

        if (file.type === 'chunk') {
          const shouldExclude = excludePatterns.some(pattern =>
            pattern.test(file.name)
          );

          if (shouldExclude) {
            // 删除 vendor 的 sourcemap
            const mapFileName = `${fileName}.map`;
            if (bundle[mapFileName]) {
              delete bundle[mapFileName];
            }
          }
        }
      }
    }
  };
}
```

**最终效果：**
```bash
dist/assets/
├── index-a1b2c3d4.js
├── index-a1b2c3d4.js.map      # ✅ 保留业务代码的 sourcemap
├── vendor-vue-e5f6g7h8.js     # ❌ 没有 .map 文件
├── vendor-element-i9j0k1l2.js # ❌ 没有 .map 文件
└── monaco-editor-m3n4o5p6.js  # ❌ 没有 .map 文件
```

**优势：**
1. **减少 50% 以上的 sourcemap 体积**
   - 第三方库的 sourcemap 通常很大
   - 只保留业务代码的 sourcemap

2. **保护第三方库源码**
   - 不暴露 node_modules 的代码
   - 只暴露自己的业务代码

3. **精准的错误追踪**
   - 业务代码错误可以精确定位
   - 第三方库错误通常不需要调试

---

## 8. Sourcemap 与错误监控

### 8.1 Sentry 集成

Sentry 是最流行的错误监控平台，完美支持 Sourcemap。

#### 安装 Sentry

```bash
npm install @sentry/vue
```

#### 配置 Sentry

```javascript
// src/main.js
import * as Sentry from '@sentry/vue';
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

Sentry.init({
  app,
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production',
  release: 'my-project@1.0.0',  // 版本号很重要
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});

app.mount('#app');
```

#### 上传 Sourcemap 到 Sentry

**方法 1: 使用 Sentry CLI**

```bash
# 安装 Sentry CLI
npm install -g @sentry/cli

# 配置认证
export SENTRY_AUTH_TOKEN=your-auth-token
export SENTRY_ORG=your-org
export SENTRY_PROJECT=your-project

# 创建 release
sentry-cli releases new my-project@1.0.0

# 上传 sourcemap
sentry-cli releases files my-project@1.0.0 \
  upload-sourcemaps dist/assets/ \
  --url-prefix '~/assets/'

# 完成 release
sentry-cli releases finalize my-project@1.0.0
```

**方法 2: 使用 Vite 插件**

```bash
npm install @sentry/vite-plugin
```

```javascript
// vite.config.js
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default {
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    sentryVitePlugin({
      org: 'your-org',
      project: 'your-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,

      // 上传 sourcemap
      sourcemaps: {
        assets: './dist/assets/**',
        ignore: ['**/vendor-*.js.map'],  // 忽略 vendor
      },

      // 上传后删除本地 sourcemap
      cleanArtifacts: true,
    }),
  ],
};
```

#### Sentry 错误展示

**没有 Sourcemap：**
```
Error: Cannot read property 'name' of undefined
  at n (index-a1b2c3d4.js:1:2345)
  at t (index-a1b2c3d4.js:1:5678)
```

**有 Sourcemap：**
```
Error: Cannot read property 'name' of undefined
  at UserCard.vue:15:23
    13 | const props = defineProps<{ user: User }>();
    14 |
  > 15 | const greeting = computed(() => {
       |                       ^
    16 |   return `Hello, ${props.user.name}!`;
    17 | });

  at computed (vue.js:1234)
  at setup (UserCard.vue:10)
```

### 8.2 浏览器 DevTools 使用

#### Chrome DevTools

**查看 Sourcemap：**
1. 打开 DevTools（F12）
2. 进入 Sources 面板
3. 如果有 sourcemap，会自动显示原始代码

**设置断点：**
```
Sources 面板
├── Page（页面文件）
│   └── dist/assets/index.js（压缩后的代码）
└── webpack://（原始代码，通过 sourcemap 映射）
    └── src/
        ├── main.js
        ├── App.vue
        └── components/
```

**调试体验：**
- 可以在原始代码上设置断点
- 变量名显示为原始名称
- 调用栈显示原始文件和行号

#### 手动加载 Sourcemap

如果使用 `hidden` 模式，浏览器不会自动加载 sourcemap，但可以手动加载：

**方法 1: 浏览器扩展**
- 安装 Sourcemap 加载扩展
- 配置 sourcemap 文件路径
- 浏览器会自动加载

**方法 2: 本地覆盖**
```
1. 打开 DevTools
2. Sources → Overrides
3. 选择本地文件夹
4. 将 .map 文件放入对应路径
5. 刷新页面
```

---

## 9. 性能与安全考虑

### 9.1 性能影响

#### 构建性能

**Sourcemap 生成时间对比：**

| 配置 | 构建时间 | 相对速度 |
|-----|---------|---------|
| `sourcemap: false` | 30s | 基准（最快） |
| `sourcemap: 'hidden'` | 45s | +50% |
| `sourcemap: true` | 45s | +50% |
| `sourcemap: 'inline'` | 50s | +67% |

**优化建议：**
- 开发环境使用 `cheap-module-source-map`（快速）
- 生产环境使用 `hidden`（平衡）
- CI/CD 环境可以考虑并行构建

#### 运行时性能

**用户体验影响：**

```
配置: sourcemap: false
├── 用户下载：200 KB（仅 JS）
└── 加载时间：快

配置: sourcemap: true
├── 用户下载：200 KB（JS）+ 800 KB（.map）
└── 加载时间：慢（多一个请求）

配置: sourcemap: 'hidden'
├── 用户下载：200 KB（仅 JS）
└── 加载时间：快（不下载 .map）
```

**结论：**
- `hidden` 模式对用户性能无影响
- `true` 模式会增加用户下载量
- `inline` 模式会显著增加 JS 文件大小

### 9.2 安全考虑

#### 源码泄露风险

**风险等级：**

| 配置 | 源码暴露 | 风险等级 | 说明 |
|-----|---------|---------|------|
| `false` | 无 | 低 | 完全不暴露 |
| `hidden` | 可控 | 低-中 | 仅上传到监控平台 |
| `true` | 是 | 高 | 任何人都可以下载 |
| `inline` | 是 | 高 | 源码直接内联在 JS 中 |

**保护措施：**

1. **使用 hidden 模式**
```javascript
build: {
  sourcemap: 'hidden'
}
```

2. **限制 .map 文件访问**
```nginx
location ~* \.map$ {
  deny all;
}
```

3. **构建后删除 sourcesContent**
```javascript
// 使用插件在构建后移除 sourcemap 中的源码内容
// 这样只保留位置映射，不包含原始源码
// 可以使用 rollup-plugin-transform 或自定义插件处理 .map 文件
```

4. **定期清理旧版本 sourcemap**
```bash
# 只保留最近 3 个版本的 sourcemap
sentry-cli releases list | tail -n +4 | xargs -I {} sentry-cli releases delete {}
```

#### 敏感信息泄露

**常见问题：**

```javascript
// ❌ 错误：在代码中硬编码敏感信息
const API_KEY = 'sk_live_1234567890abcdef';
const SECRET = 'my-secret-key';

// 即使压缩，sourcemap 也会暴露这些信息
```

**解决方案：**

```javascript
// ✅ 正确：使用环境变量
const API_KEY = import.meta.env.VITE_API_KEY;

// ✅ 正确：从服务器获取
const config = await fetch('/api/config').then(r => r.json());
```

### 9.3 最佳实践总结

#### 开发环境

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: true,  // 完整的 sourcemap
  }
}
```

**理由：**
- 快速调试
- 完整的错误信息
- 不需要考虑安全性

#### 生产环境

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: 'hidden',  // 推荐
  }
}
```

**配合使用：**
- 上传到 Sentry 等错误监控平台
- 使用 sourcemap-output-filter 过滤第三方库
- 定期清理旧版本

---

## 10. 最佳实践

### 10.1 配置建议

#### 通用配置

```javascript
// vite.config.js
export default defineConfig(({ command, mode }) => {
  return {
    build: {
      // 生产环境使用 hidden
      sourcemap: mode === 'production' ? 'hidden' : true,

      // 压缩配置
      minify: 'esbuild',
      esbuildOptions: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
      },
    },

    plugins: [
      // 过滤第三方库的 sourcemap
      createSourcemapOutputFilter({
        exclude: [/^vendor-/, /^monaco-editor/],
      }),

      // 上传到 Sentry（仅生产环境）
      mode === 'production' && sentryVitePlugin({
        org: 'your-org',
        project: 'your-project',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          assets: './dist/assets/**',
          ignore: ['**/vendor-*.js.map'],
        },
        cleanArtifacts: true,
      }),
    ].filter(Boolean),
  };
});
```

### 10.2 CI/CD 集成

#### GitHub Actions 示例

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_APP_VERSION: ${{ github.sha }}

      - name: Upload sourcemaps to Sentry
        run: |
          npm install -g @sentry/cli
          sentry-cli releases new ${{ github.sha }}
          sentry-cli releases files ${{ github.sha }} \
            upload-sourcemaps dist/assets/ \
            --url-prefix '~/assets/'
          sentry-cli releases finalize ${{ github.sha }}
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: your-org
          SENTRY_PROJECT: your-project

      - name: Deploy to CDN
        run: |
          # 只部署 JS/CSS 文件，不部署 .map 文件
          rsync -av --exclude='*.map' dist/ cdn:/path/
```

### 10.3 调试技巧

#### 技巧 1: 本地调试生产构建

```bash
# 1. 构建生产版本
npm run build

# 2. 启动本地服务器
npx serve dist

# 3. 在浏览器中打开
# http://localhost:3000

# 4. 手动加载 sourcemap
# DevTools → Sources → Overrides
# 将 dist/assets/*.map 文件添加到 Overrides
```

#### 技巧 2: 使用 source-map-explorer

```bash
# 安装
npm install -g source-map-explorer

# 分析 sourcemap
source-map-explorer dist/assets/index-*.js

# 生成可视化报告
source-map-explorer dist/assets/*.js --html report.html
```

#### 技巧 3: 验证 sourcemap 正确性

```javascript
// verify-sourcemap.js
const fs = require('fs');
const sourceMap = require('source-map');

async function verifySourcemap(mapFile) {
  const rawSourceMap = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
  const consumer = await new sourceMap.SourceMapConsumer(rawSourceMap);

  // 测试映射
  const pos = consumer.originalPositionFor({
    line: 1,
    column: 100
  });

  console.log('映射结果:', pos);
  // { source: 'src/main.js', line: 15, column: 10, name: 'add' }

  consumer.destroy();
}

verifySourcemap('dist/assets/index.js.map');
```

### 10.4 常见问题排查

#### 问题 1: Sourcemap 不生效

**症状：**
- 浏览器显示压缩后的代码
- 无法设置断点

**排查步骤：**
```bash
# 1. 检查是否生成了 .map 文件
ls dist/assets/*.map

# 2. 检查 JS 文件是否有 sourceMappingURL 注释
tail -n 1 dist/assets/index-*.js
# 应该看到：//# sourceMappingURL=index-xxx.js.map

# 3. 检查 .map 文件是否可访问
curl https://your-cdn.com/assets/index-xxx.js.map

# 4. 检查浏览器设置
# DevTools → Settings → Enable JavaScript source maps
```

#### 问题 2: Sourcemap 文件过大

**解决方案：**

```javascript
// 1. 过滤第三方库（推荐）
plugins: [
  createSourcemapOutputFilter({
    exclude: [/^vendor-/, /node_modules/]
  })
]

// 2. 使用插件移除 sourcesContent
// 可以编写 Vite 插件在 generateBundle 钩子中
// 删除 .map 文件中的 sourcesContent 字段

// 3. 压缩 sourcemap
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

// 在 generateBundle 钩子中压缩 .map 文件
async generateBundle(options, bundle) {
  for (const fileName in bundle) {
    if (fileName.endsWith('.map')) {
      const file = bundle[fileName];
      const compressed = await gzipAsync(file.source);
      // 保存为 .map.gz
    }
  }
}
```

#### 问题 3: Sentry 无法解析 sourcemap

**排查步骤：**

```bash
# 1. 检查 release 版本是否匹配
# Sentry.init 中的 release 必须与上传时的版本一致

# 2. 检查 URL 前缀
sentry-cli releases files VERSION list
# 确保 URL 前缀正确

# 3. 手动测试映射
sentry-cli releases files VERSION upload-sourcemaps \
  dist/assets/ \
  --url-prefix '~/assets/' \
  --validate

# 4. 查看 Sentry 日志
# Sentry → Settings → Projects → [Your Project] → Source Maps
```

---

## 11. 总结

### 11.1 核心要点

**Sourcemap 是什么？**
- 转换后代码与原始代码的位置映射文件
- 用于调试压缩/转换后的代码
- 包含文件名、行号、列号、变量名等信息

**为什么需要 Sourcemap？**
- 生产环境代码被压缩和混淆
- 错误信息无法定位到原始代码
- 调试体验极差

**如何使用 Sourcemap？**
- 开发环境：`sourcemap: true`（完整调试）
- 生产环境：`sourcemap: 'hidden'`（安全 + 错误追踪）
- 配合 Sentry 等错误监控平台

### 11.2 配置决策树

```
是否需要调试生产环境？
├─ 否 → sourcemap: false
└─ 是
    ├─ 是否担心源码泄露？
    │   ├─ 否 → sourcemap: true
    │   └─ 是
    │       ├─ 是否使用错误监控平台？
    │       │   ├─ 是 → sourcemap: 'hidden' ✅ 推荐
    │       │   └─ 否 → sourcemap: 'hidden' + 本地保留 .map 文件
    │       └─ 是否需要内网访问？
    │           └─ 是 → sourcemap: true + Nginx 限制
```

### 11.3 最佳实践清单

**✅ 推荐做法：**
- 生产环境使用 `sourcemap: 'hidden'`
- 配合 Sentry 等错误监控平台
- 过滤第三方库的 sourcemap
- 定期清理旧版本 sourcemap
- 不在代码中硬编码敏感信息

**❌ 避免做法：**
- 生产环境使用 `sourcemap: true`（暴露源码）
- 使用 `inline` 模式（增大文件体积）
- 不配置错误监控就使用 `hidden` 模式
- 将 .map 文件部署到公开 CDN

### 11.4 参考资源

**官方文档：**
- [Vite Sourcemap 配置](https://cn.vite.dev/config/build-options.html#build-sourcemap)
- [Sourcemap 规范](https://sourcemaps.info/spec.html)
- [Chrome DevTools Sourcemap](https://developer.chrome.com/docs/devtools/javascript/source-maps/)

**工具和库：**
- [Sentry](https://sentry.io/) - 错误监控平台
- [source-map](https://github.com/mozilla/source-map) - Sourcemap 处理库
- [source-map-explorer](https://github.com/danvk/source-map-explorer) - Sourcemap 分析工具

---

## 结语

Sourcemap 是现代前端开发中不可或缺的工具，它让我们能够在享受代码压缩和优化带来的性能提升的同时，保持良好的调试体验。

通过本文档，你应该已经全面了解了：
- Sourcemap 的工作原理和文件结构
- Vite 中的各种 Sourcemap 配置选项
- 生产环境的最佳实践和安全考虑
- 与错误监控平台的集成方法

**关键建议：**
1. **开发环境**：使用完整的 sourcemap，优先考虑调试体验
2. **生产环境**：使用 `hidden` 模式，平衡安全性和可调试性
3. **错误监控**：配合 Sentry 等平台，实现精准的错误追踪
4. **性能优化**：过滤第三方库的 sourcemap，减少体积

希望这份文档能帮助你更好地理解和使用 Sourcemap，提升项目的开发和维护效率！

---

**文档版本：** 1.0
**最后更新：** 2026-01-23
**作者：** Claude (Frontend Architecture Expert)
**适用 Vite 版本：** 5.x+


---
title: Vite 构建流程详解：从源码到产物
date: 2026-01-23
duration: 60min
type: notes
art: random
---

[[toc]]

本文档从宏观角度详细讲解 Vite 项目的构建流程，帮助你理解从执行构建命令到生成最终产物的完整过程。

## 目录

- [1. 构建流程概览](#1-构建流程概览)
- [2. 命令执行与配置加载](#2-命令执行与配置加载)
- [3. 依赖预构建（开发模式）](#3-依赖预构建开发模式)
- [4. 模块解析与加载](#4-模块解析与加载)
- [5. 代码转换与编译](#5-代码转换与编译)
- [6. 代码分割策略](#6-代码分割策略)
- [7. 资源处理](#7-资源处理)
- [8. 代码优化与压缩](#8-代码优化与压缩)
- [9. 产物生成与输出](#9-产物生成与输出)
- [10. 本项目构建实例](#10-本项目构建实例)

---

## 1. 构建流程概览

### 1.1 整体流程图

```
npm run build
    ↓
┌──────────────────────────────────────┐
│  阶段 1: 配置加载与解析               │
│  - 读取 vite.config.js               │
│  - 加载环境变量                      │
│  - 合并默认配置                      │
└──────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│  阶段 2: 模块图构建                   │
│  - 从入口文件开始                    │
│  - 解析所有模块依赖                  │
│  - 构建完整的依赖图谱                │
└──────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│  阶段 3: 代码转换                     │
│  - Vue 文件编译                      │
│  - TypeScript 转换                   │
│  - JSX/TSX 转换                      │
│  - CSS 预处理                        │
└──────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│  阶段 4: 代码分割                     │
│  - 分析模块依赖关系                  │
│  - 按配置分割代码                    │
│  - 生成多个 chunk                    │
└──────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│  阶段 5: 代码优化                     │
│  - Tree Shaking                      │
│  - 代码压缩                          │
│  - 移除无用代码                      │
└──────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│  阶段 6: 资源处理                     │
│  - 图片优化                          │
│  - 字体处理                          │
│  - 静态资源复制                      │
└──────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│  阶段 7: 产物生成                     │
│  - 生成 JS/CSS 文件                  │
│  - 生成 HTML 文件                    │
│  - 生成 Sourcemap                    │
│  - 生成压缩文件                      │
└──────────────────────────────────────┘
    ↓
构建完成
```

### 1.2 核心概念

**构建模式**
- 开发模式（dev）：快速启动，按需编译，HMR 热更新
- 生产模式（build）：完整构建，代码优化，生成产物

**构建工具**
- **开发阶段**：使用 esbuild 进行依赖预构建（速度快）
- **生产构建**：使用 Rollup 进行打包（产物优化好）

**为什么使用两种工具？**
- esbuild：Go 语言编写，速度极快，适合开发环境
- Rollup：成熟的打包工具，Tree Shaking 效果好，插件生态完善

---

## 2. 命令执行与配置加载

### 2.1 构建命令执行

当你执行 `npm run build` 时，实际执行的是：

```bash
vite build
```

这个命令会触发 Vite 的构建流程，主要步骤如下：

1. **解析命令行参数**
   - 读取 `--mode`、`--base`、`--outDir` 等参数
   - 确定构建模式（默认为 production）

2. **查找配置文件**
   - 按顺序查找：`vite.config.js`、`vite.config.mjs`、`vite.config.ts`
   - 支持多种配置文件格式

3. **加载配置文件**
   - 执行配置文件导出的函数
   - 传入 `command: 'build'` 和 `mode: 'production'`

### 2.2 环境变量加载

Vite 会自动加载项目根目录下的环境变量文件：

```
.env                # 所有模式下都会加载
.env.local          # 所有模式下都会加载，但会被 git 忽略
.env.production     # 仅在生产模式下加载
.env.production.local  # 仅在生产模式下加载，但会被 git 忽略
```

**加载优先级**（从高到低）：
1. `.env.production.local`
2. `.env.production`
3. `.env.local`
4. `.env`

**环境变量规则**：
- 只有以 `VITE_` 开头的变量才会暴露给客户端代码
- 其他变量仅在构建配置中可用

### 2.3 配置合并

Vite 会按以下顺序合并配置：

```
1. Vite 默认配置
   ↓
2. 用户配置文件 (vite.config.js)
   ↓
3. 插件注入的配置
   ↓
4. 命令行参数
```

**本项目配置示例**：

```javascript
// vite.config.mjs
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd());

  // 读取版本号
  const version = readVersion();

  return {
    // 基础配置
    base: '/',

    // 插件配置
    plugins: createVitePlugins(env, command === 'build'),

    // 路径别名
    resolve: {
      alias: {
        '@': '/src',
        'components': '/src/components',
        // ...
      }
    },

    // 构建配置
    build: {
      outDir: 'dist',
      sourcemap: 'hidden',
      // ...
    }
  };
});
```

---

## 3. 依赖预构建（开发模式）

> **注意**：依赖预构建主要用于**开发模式**（`vite dev`），而非生产构建。生产构建时，Rollup 会直接处理所有依赖，不依赖预构建的缓存。本章节帮助你理解 Vite 开发服务器的工作原理。

### 3.1 为什么需要依赖预构建？

**问题背景**：
- 许多 npm 包使用 CommonJS 或 UMD 格式
- 有些包有数百个内部模块（如 lodash-es）
- 浏览器原生 ESM 不支持裸模块导入（如 `import { debounce } from 'lodash-es'`）

**预构建的作用**（开发模式下）：
1. **格式转换**：将 CommonJS/UMD 转换为 ESM
2. **性能优化**：将多个模块合并为单个模块，减少 HTTP 请求
3. **路径解析**：将裸模块导入转换为浏览器可识别的路径

### 3.2 预构建流程

```
1. 扫描依赖
   - 从入口文件开始扫描
   - 识别所有 import 语句
   - 收集需要预构建的依赖

2. 使用 esbuild 构建
   - 将依赖打包为单个文件
   - 转换为 ESM 格式
   - 生成到 node_modules/.vite 目录

3. 缓存依赖
   - 基于 package.json 和配置生成哈希
   - 依赖未变化时直接使用缓存
   - 大幅提升二次构建速度
```

### 3.3 预构建配置

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 强制预构建的依赖
    include: ['vue', 'vue-router'],

    // 排除预构建的依赖
    exclude: ['your-local-package'],

    // esbuild 选项
    esbuildOptions: {
      target: 'esnext'
    }
  }
}
```

---

## 4. 模块解析与加载

### 4.1 入口文件解析

构建从 `index.html` 开始：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- Vite 从这里开始解析 -->
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**解析过程**：
1. 读取 `index.html` 文件
2. 找到 `<script type="module">` 标签
3. 将 `/src/main.js` 作为入口模块
4. 开始构建模块依赖图

### 4.2 模块依赖图构建

Vite 会递归解析所有模块，构建完整的依赖关系图：

```
main.js
  ├─ vue (node_modules)
  ├─ App.vue
  │   ├─ vue
  │   ├─ HelloWorld.vue
  │   └─ style.css
  ├─ router/index.js
  │   ├─ vue-router (node_modules)
  │   └─ views/*.vue
  └─ store/index.js
      ├─ vuex (node_modules)
      └─ modules/*.js
```

**构建步骤**：

1. **解析导入语句**
   - 分析每个模块的 `import` 语句
   - 识别导入的模块路径

2. **路径解析**
   - 相对路径：`./App.vue` → 解析为绝对路径
   - 别名路径：`@/components/Foo.vue` → 根据配置解析
   - 裸模块：`vue` → 解析到 node_modules

3. **递归加载**
   - 加载每个依赖模块
   - 继续解析该模块的依赖
   - 直到所有模块都被处理

### 4.3 路径别名解析

**配置示例**：

```javascript
resolve: {
  alias: {
    '@': '/src',
    'components': '/src/components',
    'styles': '/src/styles',
    'utils': '/src/utils'
  }
}
```

**解析示例**：
- `@/App.vue` → `/src/App.vue`
- `components/Button.vue` → `/src/components/Button.vue`
- `utils/format.js` → `/src/utils/format.js`

---

## 5. 代码转换与编译

### 5.1 Vue 文件编译

Vue 单文件组件（SFC）需要被编译为 JavaScript：

**原始 Vue 文件**：
```vue
<template>
  <div class="hello">{{ msg }}</div>
</template>

<script setup>
import { ref } from 'vue'
const msg = ref('Hello World')
</script>

<style scoped>
.hello { color: red; }
</style>
```

**编译过程**：
1. **模板编译**：将 `<template>` 编译为渲染函数
2. **脚本处理**：处理 `<script setup>` 语法
3. **样式提取**：提取 `<style>` 并处理 scoped
4. **组合输出**：生成最终的 JavaScript 模块

### 5.2 TypeScript 转换

Vite 使用 esbuild 进行 TypeScript 转换，速度极快：

**转换内容**：
- 移除类型注解
- 转换 TypeScript 特有语法
- 转换为目标 JavaScript 版本

**注意事项**：
- esbuild 只做语法转换，不做类型检查
- 类型检查需要单独运行 `tsc --noEmit`
- 或使用 `vite-plugin-checker` 插件

### 5.3 CSS 预处理

**支持的预处理器**：
- Sass/SCSS
- Less
- Stylus

**处理流程**：
```
.scss 文件
  ↓
Sass 编译器处理
  ↓
PostCSS 处理（autoprefixer 等）
  ↓
CSS 模块化（如果是 .module.scss）
  ↓
输出 CSS
```

**本项目示例**：
```scss
// styles/variables.scss
$primary-color: #409eff;

// 编译后
:root {
  --primary-color: #409eff;
}
```

---

## 6. 代码分割策略

### 6.1 为什么需要代码分割？

**问题**：
- 单个大文件加载慢
- 修改一处代码，整个文件缓存失效
- 首屏加载不需要的代码也被加载

**解决方案**：
- 将代码分割为多个小文件
- 按需加载
- 利用浏览器缓存

### 6.2 代码分割类型

**1. 入口分割**
- 每个入口文件生成独立的 chunk
- 适用于多页应用

**2. 动态导入分割**
```javascript
// 路由懒加载
const Home = () => import('./views/Home.vue')
const About = () => import('./views/About.vue')
```

**3. 手动分割（manualChunks）**
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-vue': ['vue', 'vue-router', 'vuex'],
        'vendor-ui': ['element-plus'],
        'vendor-utils': ['lodash-es', 'dayjs']
      }
    }
  }
}
```

### 6.3 本项目分割策略

```
最终产物：
├── index-[hash].js          # 入口文件
├── vendor-vue-[hash].js     # Vue 全家桶
├── vendor-element-[hash].js # Element Plus
├── vendor-vxe-[hash].js     # VXE Table
├── vendor-echarts-[hash].js # ECharts
├── vendor-utils-[hash].js   # 工具库
└── [route]-[hash].js        # 各路由页面
```

**优势**：
- 第三方库独立缓存，不受业务代码影响
- 按功能分类，便于管理
- 路由懒加载，减少首屏加载时间

---

## 7. 资源处理

### 7.1 静态资源处理

**图片资源**：
```javascript
// 小于 4KB 的图片会被转为 base64
import logo from './logo.png'  // logo 是 base64 字符串或 URL

// 大于 4KB 的图片会被复制到 dist/assets
import banner from './banner.jpg'  // banner 是 /assets/banner-[hash].jpg
```

**字体资源**：
```css
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/myfont.woff2') format('woff2');
}
```
- 字体文件会被复制到 `dist/assets`
- 文件名会添加哈希值

**JSON 文件**：
```javascript
import data from './data.json'
// data 是解析后的 JSON 对象
```

### 7.2 Public 目录

`public` 目录下的文件会被直接复制到 `dist` 根目录：

```
public/
  ├── favicon.ico
  ├── robots.txt
  └── static/
      └── logo.png

构建后 →

dist/
  ├── favicon.ico
  ├── robots.txt
  └── static/
      └── logo.png
```

**使用场景**：
- 不需要被构建处理的文件
- 需要保持固定路径的文件
- 第三方库的静态资源

---

## 8. 代码优化与压缩

### 8.1 Tree Shaking

**什么是 Tree Shaking？**
- 移除未使用的代码
- 基于 ES Module 的静态分析
- 减小最终产物体积

**示例**：
```javascript
// utils.js
export function used() { return 'used' }
export function unused() { return 'unused' }

// main.js
import { used } from './utils.js'
console.log(used())

// 构建后，unused 函数会被移除
```

**注意事项**：
- 必须使用 ES Module 语法（import/export）
- CommonJS（require/module.exports）不支持 Tree Shaking
- 副作用代码可能影响 Tree Shaking 效果

### 8.2 代码压缩

Vite 使用 esbuild 进行代码压缩，速度比 Terser 快 20-40 倍：

**压缩内容**：
- 移除空格和换行
- 缩短变量名
- 移除注释
- 移除 console 和 debugger（可配置）

**配置示例**：
```javascript
build: {
  minify: 'esbuild',  // 使用 esbuild 压缩
  esbuildOptions: {
    drop: ['console', 'debugger'],  // 移除 console 和 debugger
    legalComments: 'none'  // 移除注释
  }
}
```

### 8.3 CSS 优化

**CSS 提取**：
- 所有 CSS 会被提取到独立的 `.css` 文件
- 支持 CSS 代码分割
- 自动添加浏览器前缀（PostCSS）

**CSS 压缩**：
- 移除空格和注释
- 合并相同规则
- 优化选择器

---

## 9. 产物生成与输出

### 9.1 文件哈希

所有输出文件都会添加内容哈希：

```
index-a1b2c3d4.js
vendor-vue-e5f6g7h8.js
style-i9j0k1l2.css
```

**哈希的作用**：
- 文件内容变化时，哈希值改变
- 浏览器会请求新文件，而不是使用缓存
- 未变化的文件保持相同哈希，继续使用缓存

### 9.2 Sourcemap 生成

Sourcemap 用于调试压缩后的代码：

**Sourcemap 类型**：
- `hidden`：生成 sourcemap 但不在文件中引用（推荐生产环境）
- `inline`：sourcemap 内联到文件中
- `true`：生成独立的 .map 文件并引用
- `false`：不生成 sourcemap

**本项目配置**：
```javascript
build: {
  sourcemap: 'hidden'
}
```

**优势**：
- 生成 sourcemap 用于错误追踪
- 不在代码中暴露 sourcemap 路径
- 可以选择性上传到错误监控平台（如 Sentry）

### 9.3 HTML 处理

**原始 HTML**：
```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**构建后 HTML**：
```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
    <link rel="stylesheet" href="/assets/index-a1b2c3d4.css">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/assets/index-e5f6g7h8.js"></script>
  </body>
</html>
```

**处理内容**：
- 自动注入构建后的 JS 和 CSS 文件
- 更新资源路径为带哈希的文件名
- 压缩 HTML（移除空格和注释）

### 9.4 压缩文件生成

本项目使用 `vite-plugin-compression` 生成压缩文件：

**生成的文件**：
```
dist/assets/
  ├── index-[hash].js
  ├── index-[hash].js.gz      # Gzip 压缩
  ├── index-[hash].js.br      # Brotli 压缩
  └── index-[hash].js.map
```

**压缩算法对比**：
- **Gzip**：兼容性好，压缩率约 70%
- **Brotli**：压缩率更高（约 80%），但需要较新的浏览器

**服务器配置**：
- Nginx 会自动选择合适的压缩文件
- 支持 Brotli 的浏览器优先使用 .br 文件
- 其他浏览器使用 .gz 文件

---

## 10. 本项目构建实例

### 10.1 完整构建流程

以本项目为例，执行 `npm run build` 后的完整流程：

```
1. 命令执行
   npm run build
   ↓
2. 加载配置
   - 读取 vite.config.mjs
   - 加载 .env.production
   - 读取版本号
   ↓
3. 初始化插件
   - @vitejs/plugin-vue
   - unplugin-auto-import
   - unplugin-vue-setup-extend-plus
   - vite-plugin-compression
   - 其他自定义插件
   ↓
4. 构建模块图
   - 从 index.html 开始
   - 解析 /src/main.js
   - 递归解析所有依赖
   ↓
5. 代码转换
   - Vue 文件编译
   - TypeScript 转换
   - SCSS 预处理
   - 自动导入处理
   ↓
6. 代码分割
   - vendor-vue (Vue 全家桶)
   - vendor-element (Element Plus)
   - vendor-vxe (VXE Table)
   - vendor-echarts (ECharts)
   - vendor-utils (工具库)
   - 路由页面分割
   ↓
7. 代码优化
   - Tree Shaking
   - esbuild 压缩
   - 移除 console
   - CSS 优化
   ↓
8. 生成产物
   - 生成 JS/CSS 文件
   - 添加文件哈希
   - 生成 hidden sourcemap
   - 过滤 vendor sourcemap
   - 生成 gzip/brotli 压缩
   - 更新 HTML 引用
   ↓
9. 输出到 dist 目录
```

### 10.2 最终产物结构

```
dist/
├── assets/
│   ├── index-a1b2c3d4.js
│   ├── index-a1b2c3d4.js.gz
│   ├── index-a1b2c3d4.js.br
│   ├── index-a1b2c3d4.js.map
│   │
│   ├── vendor-vue-e5f6g7h8.js
│   ├── vendor-vue-e5f6g7h8.js.gz
│   ├── vendor-vue-e5f6g7h8.js.br
│   │
│   ├── vendor-element-i9j0k1l2.js
│   ├── vendor-element-i9j0k1l2.js.gz
│   ├── vendor-element-i9j0k1l2.js.br
│   │
│   ├── vendor-vxe-m3n4o5p6.js
│   ├── vendor-echarts-q7r8s9t0.js
│   ├── vendor-utils-u1v2w3x4.js
│   │
│   ├── home-y5z6a7b8.js
│   ├── home-y5z6a7b8.js.map
│   ├── about-c9d0e1f2.js
│   ├── about-c9d0e1f2.js.map
│   │
│   ├── index-g3h4i5j6.css
│   ├── index-g3h4i5j6.css.gz
│   └── index-g3h4i5j6.css.br
│
├── index.html
├── favicon.ico
└── robots.txt
```

### 10.3 构建产物分析

**文件大小对比**（示例）：

| 文件类型 | 原始大小 | Gzip | Brotli |
|---------|---------|------|--------|
| vendor-vue.js | 500 KB | 150 KB | 120 KB |
| vendor-element.js | 800 KB | 240 KB | 190 KB |
| index.js | 200 KB | 60 KB | 48 KB |
| index.css | 100 KB | 20 KB | 16 KB |

**优化效果**：
- Gzip 压缩率：约 70%
- Brotli 压缩率：约 80%
- 总体积减少：75% 以上

---

## 11. 总结

### 11.1 Vite 构建流程关键点

**1. 配置加载**
- 支持多种配置文件格式
- 环境变量自动加载
- 插件配置灵活

**2. 依赖预构建（开发模式）**
- 使用 esbuild 快速预构建
- 格式转换和性能优化
- 智能缓存机制
- 注意：仅用于开发服务器，生产构建由 Rollup 直接处理

**3. 模块解析**
- 从 HTML 入口开始
- 递归构建依赖图
- 支持路径别名

**4. 代码转换**
- Vue 文件编译
- TypeScript 转换
- CSS 预处理

**5. 代码分割**
- 手动分割第三方库
- 路由懒加载
- 优化缓存策略

**6. 代码优化**
- Tree Shaking 移除无用代码
- esbuild 快速压缩
- CSS 提取和优化

**7. 产物生成**
- 文件哈希命名
- Sourcemap 生成
- 压缩文件生成

### 11.2 性能优化建议

**构建性能**：
- 合理配置依赖预构建
- 使用 esbuild 而非 Terser
- 启用构建缓存

**产物优化**：
- 精细化代码分割
- 启用 Tree Shaking
- 生成压缩文件（gzip/brotli）
- 合理使用 Sourcemap

**加载性能**：
- 路由懒加载
- 第三方库独立缓存
- 利用浏览器缓存策略

### 11.3 与 Webpack 对比

| 特性 | Vite | Webpack |
|-----|------|---------|
| 开发服务器启动 | 极快（秒级） | 较慢（分钟级） |
| 热更新速度 | 极快 | 较慢 |
| 生产构建工具 | Rollup | Webpack |
| 配置复杂度 | 简单 | 复杂 |
| 插件生态 | 快速增长 | 成熟完善 |
| 依赖预构建 | esbuild | Webpack |

**Vite 的优势**：
- 开发体验极佳
- 配置简单
- 构建速度快

---

## 12. 参考资源

### 12.1 官方文档

- [Vite 官方文档](https://cn.vite.dev/)
- [Vite 构建生产版本](https://cn.vite.dev/guide/build.html)
- [Rollup 官方文档](https://rollupjs.org/)

### 12.2 相关工具

- [esbuild](https://esbuild.github.io/) - 极快的 JavaScript 打包工具
- [Rollup](https://rollupjs.org/) - JavaScript 模块打包器
- [PostCSS](https://postcss.org/) - CSS 转换工具

### 12.3 本项目相关插件

- [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue) - Vue 3 单文件组件支持
- [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) - 自动导入 API
- [vite-plugin-compression](https://github.com/vbenjs/vite-plugin-compression) - 资源压缩
- [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) - 打包分析

---

## 结语

本文档从宏观角度详细讲解了 Vite 的构建流程，涵盖了从命令执行到产物生成的每个关键环节。通过理解这些流程，你可以：

1. **深入理解构建原理** - 知道每个阶段在做什么，为什么这样做
2. **优化构建配置** - 根据项目需求调整配置，提升构建效率
3. **排查构建问题** - 快速定位问题所在的阶段
4. **提升开发效率** - 利用 Vite 的特性加速开发流程

Vite 的核心优势在于：
- **开发体验**：极快的冷启动和热更新
- **简单配置**：开箱即用，配置简洁
- **现代化**：基于原生 ESM，拥抱未来标准
- **高性能**：esbuild + Rollup 的完美组合

希望这份文档能帮助你更好地理解和使用 Vite 构建工具。

---

**文档版本：** 1.0
**最后更新：** 2026-01-23
**适用 Vite 版本：** 5.x+

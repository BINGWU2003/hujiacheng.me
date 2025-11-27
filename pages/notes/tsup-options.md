---
title: tsup 配置选项
date: 2025-11-10
duration: 90min
type: notes
art: random
---

[[toc]]

## 什么是 tsup

[tsup](https://tsup.egoist.dev/) 是一个基于 esbuild 的零配置 TypeScript 打包工具，专门用于构建 TypeScript 库。它的名字来自 "TypeScript UP"。

```bash
# 安装 tsup
npm install -D tsup

# 零配置构建
tsup src/index.ts

# 生成 CJS、ESM 和类型声明
tsup src/index.ts --format cjs,esm --dts
```

:::tip 版本说明
本文档基于 **tsup 8.x+** 编写，包含最新的配置选项和最佳实践。如果你使用旧版本 tsup，某些选项可能不可用。

**主要更新**：
- ✅ tsup 8.0+ 新增 `--experimental-dts` 选项，使用 `@microsoft/api-extractor` 生成更可靠的类型声明
- ✅ 支持 `--legacy-output` 标志，避免 `.mjs`/`.cjs` 扩展名
- ✅ 改进的代码分割支持（ESM 默认开启，CJS 通过 `--splitting` 实验性支持）
- ✅ 自动处理 CLI hashbang（`#!/usr/bin/env node`），无需手动设置可执行权限
- ✅ 增强的 Tree Shaking（可选使用 Rollup 替代 esbuild）
:::

:::warning 注意事项
- tsup 主要基于 esbuild，适合快速构建 TypeScript 库
- 配置选项会随 tsup 版本更新而变化
- 建议先使用命令行熟悉功能，再创建配置文件
- 对于复杂的打包需求，可能需要考虑使用 Rollup 或 Vite
:::

### 核心特性

- ⚡ **极速构建**：基于 esbuild，比 Webpack/Rollup 快 10-100 倍
- 🎯 **零配置**：开箱即用，无需复杂配置
- 📦 **多格式输出**：支持 CJS、ESM、IIFE 等格式
- 🔷 **类型声明**：自动生成 `.d.ts` 文件
- 🎨 **代码分割**：支持多入口和代码分割
- 🔥 **HMR 支持**：开发模式下支持热更新
- 📝 **Source Maps**：支持生成 source map

## 为什么需要 tsup

### 传统库打包的问题

没有 tsup 之前，构建 TypeScript 库需要复杂的配置：

```bash
# ❌ 使用 tsc（TypeScript 编译器）
{
  "compilerOptions": {
    "declaration": true,
    "outDir": "dist"
  }
}

# 问题：
# - 不支持打包（需要额外工具）
# - 不支持多格式输出
# - 构建速度慢
# - 需要额外处理 CSS、JSON 等

# ❌ 使用 Rollup
# 需要安装和配置多个插件：
npm install -D rollup @rollup/plugin-typescript @rollup/plugin-node-resolve @rollup/plugin-commonjs rollup-plugin-dts

# 需要复杂的配置文件
// rollup.config.js
export default [
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.js', format: 'cjs' },
      { file: 'dist/index.mjs', format: 'esm' }
    ],
    plugins: [
      typescript(),
      resolve(),
      commonjs()
    ]
  },
  {
    // 单独配置类型声明
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [dts()]
  }
]

# 问题：
# - 配置复杂
# - 需要维护多个插件
# - 构建速度中等
```

### 使用 tsup 后

```bash
# ✅ 使用 tsup：一行命令搞定
tsup src/index.ts --format cjs,esm --dts

# 生成：
# dist/index.js      (CJS 格式)
# dist/index.mjs     (ESM 格式)
# dist/index.d.ts    (类型声明)

# 耗时：< 1 秒（esbuild 极速）
```

**效果**：
- ✅ 零配置，开箱即用
- ✅ 自动生成类型声明
- ✅ 支持多种格式
- ✅ 构建速度极快
- ✅ 无需额外插件

## 安装

### 基础安装

```bash
# 使用 npm
npm install -D tsup

# 使用 yarn
yarn add -D tsup

# 使用 pnpm（推荐）
pnpm add -D tsup
```

### 依赖说明

tsup 只需要安装自己，不需要额外依赖：

```json
{
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.3.0"  // TypeScript（必需）
  }
}
```

## 配置方式

### 方式一：命令行参数（推荐入门）

```bash
# 基础构建
tsup src/index.ts

# 指定格式
tsup src/index.ts --format cjs,esm

# 生成类型声明
tsup src/index.ts --dts

# 完整配置
tsup src/index.ts --format cjs,esm --dts --clean --sourcemap
```

### 方式二：配置文件（推荐项目）

支持的配置文件格式：

```bash
# JavaScript
tsup.config.ts     # TypeScript（推荐）
tsup.config.js     # JavaScript
tsup.config.cjs    # CommonJS
tsup.config.mjs    # ES Module

# JSON
tsup.config.json

# package.json
{
  "tsup": {
    // 配置项
  }
}
```

**基础配置示例**：

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true
});
```

## 一、核心配置选项

### 1.1 entry（入口文件）

**作用**：指定构建的入口文件。

```typescript
// 单入口
export default defineConfig({
  entry: ['src/index.ts']
});

// 多入口
export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts']
});

// 使用 glob 模式
export default defineConfig({
  entry: ['src/*.ts']
});

// 命名入口（自定义输出文件名）
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts'
  }
});
```

**影响对比**：

```bash
# 单入口
entry: ['src/index.ts']
# 输出：
# dist/index.js
# dist/index.mjs
# dist/index.d.ts

# 多入口
entry: ['src/index.ts', 'src/cli.ts']
# 输出：
# dist/index.js
# dist/index.mjs
# dist/index.d.ts
# dist/cli.js
# dist/cli.mjs
# dist/cli.d.ts

# 命名入口
entry: {
  'my-lib': 'src/index.ts',
  'my-cli': 'src/cli.ts'
}
# 输出：
# dist/my-lib.js
# dist/my-lib.mjs
# dist/my-cli.js
# dist/my-cli.mjs
```

### 1.2 format（输出格式）

**作用**：指定输出的模块格式。

```typescript
export default defineConfig({
  format: ['cjs', 'esm', 'iife']
});
```

**可选值**：

| 格式 | 说明 | 文件扩展名 | 适用场景 |
|------|------|-----------|----------|
| `cjs` | CommonJS | `.js` 或 `.cjs` | Node.js、require() |
| `esm` | ES Module | `.mjs` 或 `.js` | 现代 Node.js、import |
| `iife` | 立即执行函数 | `.global.js` | 浏览器 `<script>` 标签 |

> 💡 **提示**：输出文件的扩展名取决于 `package.json` 中的 `type` 字段。如果需要自定义扩展名，可以使用 `outExtension` 选项或 `--legacy-output` 命令行参数。

**影响对比**：

```typescript
// 源代码
export function greet(name: string) {
  return `Hello ${name}`;
}

// format: ['cjs']
// dist/index.js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.greet = greet;
function greet(name) {
  return `Hello ${name}`;
}

// format: ['esm']
// dist/index.mjs
export function greet(name) {
  return `Hello ${name}`;
}

// format: ['iife']
// dist/index.global.js
var MyLib = (function () {
  'use strict';
  function greet(name) {
    return `Hello ${name}`;
  }
  return { greet };
})();
```

**推荐配置**：

```typescript
// 库开发（推荐同时支持 CJS 和 ESM）
export default defineConfig({
  format: ['cjs', 'esm']
});

// 浏览器使用
export default defineConfig({
  format: ['esm', 'iife']
});
```

### 1.3 dts（类型声明）

**作用**：生成 TypeScript 类型声明文件（`.d.ts`）。

```typescript
// 简单配置
export default defineConfig({
  dts: true  // 自动生成 .d.ts
});

// 详细配置
export default defineConfig({
  dts: {
    entry: 'src/index.ts',       // 入口文件
    resolve: true,                // 解析外部类型
    compilerOptions: {            // TypeScript 编译选项
      strict: true
    }
  }
});

// 只生成类型声明（不打包 JS）
// 命令行方式：tsup index.ts --dts-only
```

**影响对比**：

```typescript
// 源代码：src/index.ts
export interface User {
  name: string;
  age: number;
}

export function getUser(): User {
  return { name: 'Tom', age: 25 };
}

// ❌ dts: false（或不配置）
tsup src/index.ts
# 输出：
# dist/index.js
# dist/index.mjs
# （没有类型声明）

// ✅ dts: true
tsup src/index.ts --dts
# 输出：
# dist/index.js
# dist/index.mjs
# dist/index.d.ts  ← 类型声明

// dist/index.d.ts 内容
export interface User {
  name: string;
  age: number;
}
export declare function getUser(): User;
```

**这是 tsup 相比 Vite 的重要优势**：

```typescript
// ✅ tsup：内置类型声明生成
export default defineConfig({
  dts: true  // 一行配置搞定
});

// ❌ Vite：需要额外插件
import dts from 'vite-plugin-dts';
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ]
});
```

### 1.4 outDir（输出目录）

**作用**：指定输出目录。

```typescript
export default defineConfig({
  outDir: 'dist'  // 默认值
});

// 自定义输出目录
export default defineConfig({
  outDir: 'lib'
});
```

**影响对比**：

```bash
# outDir: 'dist'（默认）
dist/
├── index.js
├── index.mjs
└── index.d.ts

# outDir: 'lib'
lib/
├── index.js
├── index.mjs
└── index.d.ts
```

### 1.5 clean（清理输出目录）

**作用**：构建前清理输出目录。

```typescript
export default defineConfig({
  clean: true  // 推荐开启
});
```

**影响对比**：

```bash
# ❌ clean: false（默认）
# 第一次构建
tsup src/index.ts
# dist/index.js

# 修改 entry 为 src/main.ts
tsup src/main.ts
# dist/index.js  ← 旧文件还在
# dist/main.js   ← 新文件

# ✅ clean: true
# 第一次构建
tsup src/index.ts --clean
# dist/index.js

# 修改 entry 为 src/main.ts
tsup src/main.ts --clean
# dist/main.js   ← 只有新文件
```

### 1.6 sourcemap（Source Map）

**作用**：生成 source map，方便调试。

```typescript
// 生成 source map
export default defineConfig({
  sourcemap: true
});

// 生成内联 source map
export default defineConfig({
  sourcemap: 'inline'
});

// 根据 watch 模式动态配置
export default defineConfig((options) => ({
  sourcemap: options.watch ? 'inline' : true
}));
```

**影响对比**：

```bash
# sourcemap: false（默认）
dist/
├── index.js
└── index.mjs

# sourcemap: true
dist/
├── index.js
├── index.js.map     ← source map
├── index.mjs
└── index.mjs.map    ← source map

# sourcemap: 'inline'
dist/
├── index.js         ← 包含内联 source map
└── index.mjs        ← 包含内联 source map
```

### 1.7 target（编译目标）

**作用**：指定编译目标 ECMAScript 版本。

```typescript
export default defineConfig({
  target: 'es2020'  // 默认：node16
});

// 多个目标
export default defineConfig({
  target: ['es2020', 'node16']
});
```

**可选值**：

```typescript
// ES 版本
'es3' | 'es5' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'es2022' | 'esnext'

// Node.js 版本
'node10' | 'node12' | 'node14' | 'node16' | 'node18' | 'node20'

// 浏览器（也支持）
'chrome' | 'firefox' | 'safari' | 'edge'
```

> 💡 **提示**：ES5 目标需要通过 SWC 进行转译。

**影响对比**：

```typescript
// 源代码
const greet = (name: string) => `Hello ${name}`;

// target: 'es5'
var greet = function (name) { return "Hello " + name; };

// target: 'es2020'
const greet = (name) => `Hello ${name}`;
```

**推荐配置**：

```typescript
// 库开发（兼容性）
export default defineConfig({
  target: 'es2018'  // 兼容 Node.js 12+
});

// 现代项目
export default defineConfig({
  target: 'es2020'
});

// Node.js 项目
export default defineConfig({
  target: 'node16'
});
```

### 1.8 minify（代码压缩）

**作用**：压缩输出代码。

```typescript
// 不压缩（默认）
export default defineConfig({
  minify: false
});

// 压缩
export default defineConfig({
  minify: true
});

// 使用 Terser 压缩（更好的压缩率）
export default defineConfig({
  minify: 'terser'
});
```

**影响对比**：

```typescript
// 源代码
export function add(a: number, b: number) {
  return a + b;
}

// minify: false
export function add(a, b) {
  return a + b;
}

// minify: true（使用 esbuild 压缩）
export function add(n,r){return n+r}

// minify: 'terser'（更激进的压缩）
export function add(n,r){return n+r}
```

**文件大小对比**：

```bash
# minify: false
dist/index.js     12 KB

# minify: true
dist/index.js     8 KB   （减少 33%）

# minify: 'terser'
dist/index.js     7 KB   （减少 41%）
```

### 1.9 watch（监听模式）

**作用**：监听文件变化，自动重新构建。

```typescript
export default defineConfig({
  watch: true  // 开发模式
});

// 或在命令行
// tsup src/index.ts --watch
```

**影响对比**：

```bash
# 不使用 watch
tsup src/index.ts
# ✓ Build success
# （构建完成后退出）

# 使用 watch
tsup src/index.ts --watch
# ✓ Build success
# Watching for changes...
# （持续监听，文件改变时自动重新构建）

# 修改 src/index.ts
# ⚡ Rebuilding...
# ✓ Build success
```

**忽略特定目录**（默认忽略 `dist`、`node_modules`、`.git`）：

```bash
# 忽略额外目录
tsup src/index.ts --watch --ignore-watch ignore-this-folder

# 忽略多个目录
tsup src/index.ts --watch --ignore-watch folder1 --ignore-watch folder2
```

### 1.10 splitting（代码分割）

**作用**：启用代码分割。

```typescript
export default defineConfig({
  splitting: true  // ESM 格式默认开启，CJS 格式需要手动开启
});

// 禁用代码分割
export default defineConfig({
  splitting: false
});
```

> ⚠️ **注意**：代码分割对于 ESM 输出格式默认是开启的，对于 CJS 输出是实验性功能。

**影响对比**：

```typescript
// 源代码
// src/index.ts
export { Button } from './components/Button';
export { Input } from './components/Input';

// src/components/Button.ts
import { shared } from './shared';
export const Button = () => { /* ... */ };

// src/components/Input.ts
import { shared } from './shared';
export const Input = () => { /* ... */ };

// ❌ splitting: false
dist/
└── index.js     (包含所有代码，shared 代码重复)

// ✅ splitting: true
dist/
├── index.js     (入口)
├── chunk-HASH.js (shared 代码)
├── Button.js
└── Input.js

// 优势：
// - shared 代码只打包一次
// - 按需加载
// - 减小包体积
```

### 1.11 external（外部依赖）

**作用**：排除不需要打包的依赖。

```typescript
// 排除所有 dependencies
export default defineConfig({
  external: [/.*/]
});

// 排除特定包
export default defineConfig({
  external: ['react', 'react-dom']
});

// 排除所有 node_modules
export default defineConfig({
  external: [/node_modules/]
});
```

**影响对比**：

```typescript
// package.json
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}

// 源代码
import { debounce } from 'lodash';
export const myDebounce = debounce(() => {}, 300);

// ❌ 不配置 external
tsup src/index.ts
# dist/index.js (包含完整的 lodash 代码，体积大)

// ✅ external: ['lodash']
export default defineConfig({
  external: ['lodash']
});
tsup src/index.ts
# dist/index.js (不包含 lodash，只有 require('lodash'))

// dist/index.js
const lodash = require('lodash');
exports.myDebounce = lodash.debounce(() => {}, 300);
```

**推荐配置**：

```typescript
// 库开发（排除所有 dependencies）
import { defineConfig } from 'tsup';
import pkg from './package.json';

export default defineConfig({
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ]
});

// 或者简单配置
export default defineConfig({
  external: [/.*/]  // 排除所有外部依赖
});
```

### 1.12 noExternal（不外部化）

**作用**：强制打包某些依赖。

```typescript
export default defineConfig({
  external: [/.*/],       // 排除所有依赖
  noExternal: ['lodash']  // 但打包 lodash
});
```

### 1.13 globalName（全局变量名）

**作用**：为 IIFE 格式指定全局变量名。

```typescript
export default defineConfig({
  format: ['iife'],
  globalName: 'MyLib'
});
```

**影响对比**：

```typescript
// 源代码
export function greet() {
  return 'Hello';
}

// 不配置 globalName
// dist/index.global.js
var MyModule = (function() {
  // ...
})();

// globalName: 'MyLib'
// dist/index.global.js
var MyLib = (function() {
  'use strict';
  function greet() {
    return 'Hello';
  }
  return { greet };
})();

// 使用
<script src="dist/index.global.js"></script>
<script>
  console.log(MyLib.greet());  // 'Hello'
</script>
```

### 1.14 platform（平台）

**作用**：指定目标平台。

```typescript
export default defineConfig({
  platform: 'node'  // 或 'browser', 'neutral'
});
```

**影响对比**：

```typescript
// platform: 'node'
// - 不打包 Node.js 内置模块（fs, path 等）
// - 优化 Node.js 环境

// platform: 'browser'
// - 打包所有依赖
// - 优化浏览器环境

// platform: 'neutral'
// - 不假定任何平台
// - 需要手动配置
```

### 1.15 shims（垫片）

**作用**：为某些功能添加垫片。

```typescript
export default defineConfig({
  shims: true  // 自动添加必要的垫片
});
```

**支持的垫片**：

```typescript
// __dirname、__filename 垫片
// import.meta.url 垫片
```

### 1.16 bundle（是否打包）

**作用**：控制是否打包所有依赖。

```typescript
// 打包所有依赖（默认）
export default defineConfig({
  bundle: true
});

// 不打包，保留 import 语句
export default defineConfig({
  bundle: false
});
```

**影响对比**：

```typescript
// 源代码
import { add } from './utils';
export const result = add(1, 2);

// bundle: true（默认）
// dist/index.js
function add(a, b) { return a + b; }
const result = add(1, 2);
exports.result = result;

// bundle: false
// dist/index.js
import { add } from './utils';
export const result = add(1, 2);
// （保留 import，不打包 utils）
```

### 1.17 treeshake（Tree Shaking）

**作用**：启用 Rollup 的 Tree Shaking（移除未使用的代码）。

```typescript
// 启用 Rollup tree shaking（替代 esbuild 默认的 tree shaking）
export default defineConfig({
  treeshake: true
});
```

> ⚠️ **注意**：esbuild 默认会进行 tree shaking，但有时效果不如 Rollup。启用此选项会使用 Rollup 进行 tree shaking，可能会获得更好的效果。

```bash
# 命令行方式
tsup src/index.ts --treeshake
```

### 1.18 env（环境变量）

**作用**：定义编译时环境变量。

```typescript
export default defineConfig({
  env: {
    NODE_ENV: 'production',
    API_URL: 'https://api.example.com'
  }
});
```

```bash
# 命令行方式
tsup src/index.ts --env.NODE_ENV production --env.API_URL https://api.example.com
```

**在代码中使用**：

```typescript
// 源代码（两种方式都支持）
console.log(process.env.NODE_ENV);
console.log(import.meta.env.API_URL);

// 编译后（会被替换为实际值）
console.log('production');
console.log('https://api.example.com');
```

> ⚠️ **注意**：不要在代码中直接 `import process from 'process'`，否则环境变量替换可能不生效。

### 1.19 inject（注入代码）

**作用**：自动注入模块。

```typescript
export default defineConfig({
  inject: ['./react-shim.js']  // 自动注入 React
});
```

### 1.20 banner 和 footer

**作用**：在输出文件的开头/结尾添加内容。

```typescript
export default defineConfig({
  banner: {
    js: '/* My Library v1.0.0 */',
    css: '/* Styles */'
  },
  footer: {
    js: '/* Copyright 2024 */'
  }
});
```

### 1.21 outExtension（自定义输出扩展名）

**作用**：自定义输出文件的扩展名。

```typescript
export default defineConfig({
  outExtension({ format }) {
    return {
      js: `.${format}.js`,  // 如：index.esm.js, index.cjs.js
    }
  },
});
```

### 1.22 onSuccess（构建成功回调）

**作用**：构建成功后执行命令或函数。

```bash
# 命令行方式
tsup src/index.ts --watch --onSuccess "node dist/index.js"
```

```typescript
// 配置文件方式
import { defineConfig } from 'tsup';
import http from 'http';

export default defineConfig({
  async onSuccess() {
    // 启动开发服务器
    const server = http.createServer((req, res) => {
      res.end('Hello World!');
    });
    server.listen(3000);

    // 返回清理函数
    return () => {
      server.close();
    };
  },
});
```

### 1.23 loader（自定义文件加载器）

**作用**：为特定文件类型指定加载器。

```bash
# 命令行方式
tsup --loader ".jpg=base64" --loader ".webp=file"
```

```typescript
export default defineConfig({
  loader: {
    '.jpg': 'base64',   // 转为 base64
    '.webp': 'file',    // 作为文件处理
    '.png': 'dataurl',  // 转为 data URL
  },
});
```

### 1.24 publicDir（复制静态资源）

**作用**：将指定目录的文件复制到输出目录。

```bash
# 默认复制 ./public 目录
tsup --publicDir public

# 自定义目录
tsup --publicDir assets
```

### 1.25 metafile（生成元数据）

**作用**：生成 esbuild 元数据文件，用于分析打包结果。

```bash
tsup --format cjs,esm --metafile
```

生成的 `metafile-*.json` 可用于 [bundle-buddy](https://bundle-buddy.com/) 等工具分析。

### 1.26 experimentalDts（实验性类型声明）

**作用**：使用 `@microsoft/api-extractor` 生成更健壮的类型声明。

```bash
# 需要先安装
npm i @microsoft/api-extractor -D

# 使用
tsup index.ts --experimental-dts
```

### 1.27 cjsInterop（CommonJS 互操作）

**作用**：控制默认导出在 CommonJS 中的转换方式。

```bash
tsup src/index.ts --cjsInterop
```

```typescript
// 源代码
export default function greet() {
  return 'Hello';
}

// 默认转换
module.exports.default = greet;

// 使用 --cjsInterop 后（如果只有默认导出）
module.exports = greet;
```

## 二、完整推荐配置

### 2.1 基础库配置

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2018',
  external: [/.*/]  // 排除所有依赖
});
```

**对应的 package.json**：

```json
{
  "name": "my-lib",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  }
}
```

### 2.2 React 组件库配置

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2020',
  external: ['react', 'react-dom'],  // 排除 React
  esbuildOptions(options) {
    options.jsx = 'automatic';  // 使用新的 JSX 转换
  }
});
```

### 2.3 CLI 工具配置

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  dts: false,  // CLI 通常不需要类型声明
  clean: true,
  shims: true,  // 添加 Node.js 垫片
  platform: 'node',
  target: 'node16'
});
```

> 💡 **提示**：如果源文件 `src/cli.ts` 开头包含 `#!/usr/bin/env node`（hashbang），tsup 会自动将输出文件设为可执行，无需在 `banner` 中手动添加。

**对应的 package.json**：

```json
{
  "name": "my-cli",
  "bin": {
    "my-cli": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsup"
  }
}
```

### 2.4 多入口配置

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    utils: 'src/utils/index.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: true,  // 启用代码分割
  treeshake: true   // 启用 Rollup tree shaking
});
```

```bash
# 命令行方式
tsup --entry src/a.ts --entry src/b.ts
```

**对应的 package.json**：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./cli": {
      "types": "./dist/cli.d.ts",
      "import": "./dist/cli.mjs",
      "require": "./dist/cli.js"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.js"
    }
  }
}
```

### 2.5 生产环境配置

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  dts: true,
  clean: true,
  sourcemap: false,  // 生产环境不生成 source map
  minify: true,      // 压缩代码
  target: 'es2018',
  globalName: 'MyLib',
  treeshake: true    // 启用 Rollup tree shaking
});
```

### 2.6 Monorepo 包配置

```typescript
// packages/shared/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [/.*/]
});

// packages/ui/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['@my-monorepo/shared']  // 排除同 monorepo 的包
});
```

### 2.7 CSS 处理配置

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  injectStyle: true,  // 将 CSS 注入到 JS 中
  // 或者
  // injectStyle: false,  // 生成独立的 CSS 文件
});
```

## 三、常用命令

### 3.1 基础命令

```bash
# 基础构建
tsup src/index.ts

# 指定多个入口
tsup src/index.ts src/cli.ts

# 使用 glob
tsup src/*.ts

# 指定输出目录
tsup src/index.ts --out-dir lib
```

### 3.2 格式相关

```bash
# 指定输出格式
tsup src/index.ts --format cjs
tsup src/index.ts --format esm
tsup src/index.ts --format cjs,esm
tsup src/index.ts --format cjs,esm,iife

# 生成类型声明
tsup src/index.ts --dts
tsup src/index.ts --dts-only  # 只生成类型

# 兼容模式（避免 .mjs/.cjs 扩展名）
tsup src/index.ts --format esm,cjs,iife --legacy-output
```

### 3.3 开发相关

```bash
# 监听模式
tsup src/index.ts --watch

# 清理输出目录
tsup src/index.ts --clean

# 生成 source map
tsup src/index.ts --sourcemap

# 详细输出
tsup src/index.ts --verbose
```

### 3.4 优化相关

```bash
# 压缩代码
tsup src/index.ts --minify

# 代码分割
tsup src/index.ts --splitting

# Tree shaking
tsup src/index.ts --treeshake

# 指定目标
tsup src/index.ts --target es2020
tsup src/index.ts --target node16
```

### 3.5 完整示例

```bash
# 完整构建命令
tsup src/index.ts \
  --format cjs,esm \
  --dts \
  --clean \
  --sourcemap \
  --minify \
  --target es2020

# package.json 脚本
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "build:prod": "tsup --minify --sourcemap false"
  }
}
```

### 3.6 tsup-node 命令

专门用于 Node.js 应用的命令，会自动排除 Node.js 内置模块：

```bash
# 不打包 Node.js 内置包（如 fs, path 等）
tsup-node src/index.ts
```

### 3.7 条件配置

配置文件可以导出一个函数，根据命令行参数动态生成配置：

```typescript
import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    // 根据 watch 模式调整配置
    minify: !options.watch,
    sourcemap: options.watch ? 'inline' : true
  };
});
```

## 四、常见问题和最佳实践

### 4.1 类型声明生成失败

**问题**：生成的 `.d.ts` 文件不完整或有错误。

**解决方案**：

```typescript
// 方案 1：使用 dts 详细配置
export default defineConfig({
  dts: {
    resolve: true,  // 解析外部类型
    compilerOptions: {
      strict: true
    }
  }
});

// 方案 2：检查 tsconfig.json
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": false
  }
}

// 方案 3：排除问题文件
export default defineConfig({
  dts: {
    entry: 'src/index.ts',
    exclude: ['**/*.test.ts']
  }
});
```

### 4.2 外部依赖打包问题

**问题**：dependencies 被打包进产物，导致体积过大。

**解决方案**：

```typescript
// ❌ 错误：没有排除依赖
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm']
});

// ✅ 正确：排除所有依赖
import { defineConfig } from 'tsup';
import pkg from './package.json';

export default defineConfig({
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ]
});

// 或者简单配置
export default defineConfig({
  external: [/.*/]  // 排除所有
});
```

### 4.3 package.json 配置不匹配

**问题**：打包后的产物路径与 package.json 不一致。

**解决方案**：

```json
// 确保 package.json 配置正确
{
  "main": "./dist/index.js",       // CJS 入口
  "module": "./dist/index.mjs",    // ESM 入口
  "types": "./dist/index.d.ts",    // 类型入口
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "files": ["dist"]  // 发布时包含 dist 目录
}
```

**对应的 tsup 配置**：

```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist'
});
```

### 4.4 CSS 处理

**问题**：不知道如何处理 CSS 文件。

**解决方案**：

```typescript
// 方案 1：注入 CSS 到 JS
export default defineConfig({
  injectStyle: true
});
// 使用：import './style.css' → CSS 自动注入

// 方案 2：生成独立 CSS 文件
export default defineConfig({
  injectStyle: false
});
// 生成：dist/index.css

// 方案 3：使用 PostCSS
export default defineConfig({
  injectStyle: true,
  esbuildOptions(options) {
    options.loader = {
      '.css': 'css'
    };
  }
});
```

### 4.5 环境变量替换

**问题**：需要在构建时替换环境变量。

**解决方案**：

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_URL: process.env.API_URL || 'https://api.example.com'
  }
});

// 或使用 define
export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  }
});
```

### 4.6 Monorepo 配置

**问题**：在 Monorepo 中如何配置 tsup。

**解决方案**：

```
my-monorepo/
├── packages/
│   ├── shared/
│   │   ├── src/index.ts
│   │   ├── tsup.config.ts
│   │   └── package.json
│   └── ui/
│       ├── src/index.ts
│       ├── tsup.config.ts
│       └── package.json
└── apps/
    └── web/
```

**shared 配置**：

```typescript
// packages/shared/tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: [/.*/]  // 排除所有依赖
});
```

**ui 配置**：

```typescript
// packages/ui/tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['@my-monorepo/shared']  // 排除同 monorepo 的包
});
```

**在 Turborepo 中使用**：

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

### 4.7 最佳实践

#### 1. 使用配置文件

```typescript
// ✅ 推荐：tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true
});

// ❌ 不推荐：长命令行
// tsup src/index.ts --format cjs,esm --dts --clean
```

#### 2. 排除外部依赖

```typescript
// ✅ 库开发必须排除依赖
export default defineConfig({
  external: [/.*/]
});

// ❌ 不排除会导致：
// - 打包体积大
// - 依赖重复安装
// - 版本冲突
```

#### 3. 正确配置 package.json

```json
{
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "files": ["dist"]
}
```

#### 4. 开发工作流

```json
{
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup",
    "build:prod": "tsup --minify",
    "prepublishOnly": "npm run build"
  }
}
```

#### 5. 版本管理

```typescript
// 使用 package.json 的版本
import pkg from './package.json';

export default defineConfig({
  banner: {
    js: `/* ${pkg.name} v${pkg.version} */`
  }
});
```

## 五、与其他工具对比

### tsup vs tsc（TypeScript 编译器）

| 特性 | tsup | tsc |
|------|------|-----|
| **速度** | ⚡ 极快（esbuild） | ⚠️ 慢 |
| **打包** | ✅ 内置 | ❌ 不支持 |
| **多格式** | ✅ CJS/ESM/IIFE | ❌ 只有 target |
| **类型声明** | ✅ 自动生成 | ✅ 支持 |
| **配置** | ⭐⭐ 简单 | ⭐⭐⭐ 复杂 |
| **适用场景** | 库开发 | 类型检查 |

### tsup vs Rollup

| 特性 | tsup | Rollup |
|------|------|--------|
| **速度** | ⚡ 极快 | ⚠️ 中等 |
| **配置** | ⭐⭐ 简单 | ⭐⭐⭐⭐ 复杂 |
| **插件** | ⚠️ 有限 | ✅ 丰富 |
| **类型声明** | ✅ 内置 | ⚠️ 需要插件 |
| **Tree Shaking** | ✅ 优秀 | ✅ 优秀 |
| **学习曲线** | ⭐ 低 | ⭐⭐⭐ 高 |

### tsup vs Vite（Library Mode）

| 特性 | tsup | Vite |
|------|------|------|
| **速度** | ⚡ 极快 | ⚡ 快 |
| **配置** | ⭐⭐ 简单 | ⭐⭐⭐ 中等 |
| **类型声明** | ✅ 内置（简单） | ⚠️ 需插件 |
| **适用场景** | 纯 TS 库 | 应用+库 |
| **功能** | 🎯 专注打包 | 🌟 全能 |

### 推荐选择

```
纯 TypeScript 库 → tsup ⭐⭐⭐⭐⭐
- 零配置
- 速度快
- 类型声明自动生成

带 CSS 的组件库 → Vite ⭐⭐⭐⭐
- CSS 处理更好
- 插件生态丰富

复杂库项目 → Rollup ⭐⭐⭐
- 完全控制
- 丰富的插件

只需要编译 → tsc ⭐⭐
- 类型检查
- 不需要打包
```

## 六、实际案例

### 案例 1：工具函数库

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2018',
  external: [/.*/]
});
```

```json
// package.json
{
  "name": "@my/utils",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  }
}
```

### 案例 2：React Hooks 库

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  }
});
```

### 案例 3：CLI 工具

```typescript
// src/cli.ts（源文件开头添加 hashbang）
#!/usr/bin/env node

import { program } from 'commander';
// ...CLI 代码
```

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  shims: true,
  platform: 'node',
  target: 'node16'
  // 无需手动添加 banner，tsup 会自动处理源文件中的 hashbang
});
```

```json
// package.json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": {
    "my-cli": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsup",
    "prepublishOnly": "npm run build"
  }
}
```

## 七、总结

### 核心优势

1. **零配置**：开箱即用，无需复杂配置
2. **极速构建**：基于 esbuild，速度极快
3. **类型声明**：自动生成，无需额外插件
4. **多格式输出**：支持 CJS、ESM、IIFE
5. **简单易用**：学习成本低，上手快

### 最小配置

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true
});
```

### 推荐配置

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2018',
  external: [/.*/],
  minify: process.env.NODE_ENV === 'production'
});
```

### 何时使用 tsup

**✅ 适合**：
- 纯 TypeScript 工具库
- React Hooks 库
- Node.js 工具
- CLI 工具
- 小型库项目

**❌ 不适合**：
- 需要复杂打包配置
- 大量自定义插件
- 带复杂 CSS 的组件库（推荐 Vite）

### 学习建议

1. **从命令行开始**：`tsup src/index.ts --format cjs,esm --dts`
2. **逐步添加配置**：创建 `tsup.config.ts`
3. **配置 package.json**：正确导出模块
4. **集成到工作流**：配置 npm scripts
5. **发布到 npm**：测试和发布

## 八、IDE 配置

### VS Code JSON Schema 支持

在 VS Code 中启用 tsup 配置文件的智能提示：

```json
// .vscode/settings.json
{
  "json.schemas": [
    {
      "url": "https://cdn.jsdelivr.net/npm/tsup/schema.json",
      "fileMatch": ["package.json", "tsup.config.json"]
    }
  ]
}
```

## 参考资源

- [tsup 官方文档](https://tsup.egoist.dev/)
- [tsup GitHub](https://github.com/egoist/tsup)
- [esbuild 文档](https://esbuild.github.io/)
- [package.json exports](https://nodejs.org/api/packages.html#exports)

---

🎉 使用 tsup，让 TypeScript 库打包变得简单快速！

---
title: Rollup 配置选项
date: 2025-11-27
duration: 120min
type: notes
art: random
---

[[toc]]

:::tip 版本说明
本文档基于 **Rollup 4.x** 编写，包含最新的配置选项和最佳实践。如果你使用旧版本 Rollup，某些选项可能不可用。

**主要更新**：
- ✅ 新增 `treeshake.preset`（'smallest' | 'safest' | 'recommended'）预设配置
- ✅ 新增 `preserveModules`、`manualChunks`、`interop` 等高级输出选项
- ✅ 新增 Watch 模式详细配置和编程式 API
- ✅ 新增性能优化章节（缓存、并行处理、插件顺序）
- ✅ 补充 `@rollup/plugin-alias` 等常用插件配置
- ✅ 提供 JavaScript/TypeScript/Vue 3 组件库的完整配置模板
:::

:::warning 注意事项
- 配置选项会随 Rollup 版本更新而变化
- 不同的项目类型（库/应用）需要不同的配置策略
- Vite 在生产环境使用 Rollup，可参考 `vite.config.ts` 中的 `build.rollupOptions`
- 建议使用官方插件（`@rollup/plugin-*`），社区插件需注意维护状态
:::

## 什么是 Rollup

[Rollup](https://cn.rollupjs.org/) 是一个用于 JavaScript 的模块打包器，它将点滴代码编织成错综复杂的程序。Rollup 对代码模块使用新的标准化格式（ES modules），而不是传统的 CommonJS 和 AMD。

```bash
# 安装 Rollup
npm install -D rollup

# 使用配置文件打包
npx rollup -c

# 直接打包
npx rollup src/main.js -o dist/bundle.js -f es
```

### 核心特性

- 🌳 **Tree-shaking**：基于 ES modules 的静态分析，自动移除未使用的代码
- 🗡️ **代码分割**：支持多入口和动态导入，自动代码分割
- 🌍 **多种输出格式**：ES、CJS、UMD、IIFE、AMD、SystemJS
- 🔌 **强大的插件系统**：丰富的插件生态，易于扩展
- 🎯 **专注于库打包**：适合打包 JavaScript 库和工具
- ⚡ **被 Vite 采用**：Vite 在生产环境使用 Rollup 打包

## 为什么需要 Rollup

### 传统打包工具的问题

```javascript
// ❌ Webpack 打包库的问题
// 1. 打包体积大（包含 runtime 代码）
// 2. 不够干净（模块包装代码多）
// 3. Tree-shaking 效果一般

// Webpack 打包输出（简化）
(function(modules) {
  // webpack runtime
  var installedModules = {};
  function __webpack_require__(moduleId) {
    // ...module loading code
  }
  return __webpack_require__(0);
})([
  /* 0 */ function(module, exports) { /* your code */ },
  /* 1 */ function(module, exports) { /* dependencies */ }
]);

// ❌ 问题：
// - 包含大量 webpack runtime 代码
// - 每个模块都被包装在函数中
// - 不适合作为库被其他项目引用
```

### 使用 Rollup 后

```javascript
// ✅ Rollup 打包输出
// 几乎就是你的源代码，只是合并和优化了

// src/math.js
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// src/main.js
import { add } from './math.js';
console.log(add(1, 2));

// Rollup 打包输出（ES format）
function add(a, b) {
  return a + b;
}

console.log(add(1, 2));

// ✅ 优势：
// - multiply 函数被 tree-shaking 移除（未使用）
// - 没有模块包装代码
// - 输出代码非常干净
// - 体积小，性能好
```

**效果对比**：

```bash
# 同一个库，不同工具打包

# Webpack 打包
dist/bundle.js    15.2 KB

# Rollup 打包
dist/bundle.js    3.8 KB

# 差异原因：
# - Rollup 没有 runtime 代码
# - Rollup 的 tree-shaking 更彻底
# - Rollup 输出更接近源码
```

## 安装

### 基础安装

```bash
# 使用 npm
npm install -D rollup

# 使用 yarn
yarn add -D rollup

# 使用 pnpm（推荐）
pnpm add -D rollup
```

### 常用插件安装

```bash
# Node.js 解析插件（处理 node_modules）
pnpm add -D @rollup/plugin-node-resolve

# CommonJS 转换插件
pnpm add -D @rollup/plugin-commonjs

# Babel 插件（转换 ES6+）
pnpm add -D @rollup/plugin-babel

# TypeScript 插件
pnpm add -D @rollup/plugin-typescript

# JSON 插件
pnpm add -D @rollup/plugin-json

# Terser 压缩插件
pnpm add -D @rollup/plugin-terser
```

## 配置文件

### 基础配置

创建 `rollup.config.js`：

```javascript
// rollup.config.js
export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  }
};
```

### 配置文件类型

```javascript
// 1. 默认：rollup.config.js
export default {
  input: 'src/main.js',
  output: { file: 'dist/bundle.js', format: 'es' }
};

// 2. ESM：rollup.config.mjs
export default {
  input: 'src/main.js',
  output: { file: 'dist/bundle.js', format: 'es' }
};

// 3. CommonJS：rollup.config.cjs
module.exports = {
  input: 'src/main.js',
  output: { file: 'dist/bundle.js', format: 'es' }
};

// 4. TypeScript：rollup.config.ts
import { RollupOptions } from 'rollup';

const config: RollupOptions = {
  input: 'src/main.ts',
  output: { file: 'dist/bundle.js', format: 'es' }
};

export default config;
```

## 一、输入选项（Input Options）

### 1.1 input（入口文件）

**作用**：指定打包的入口文件。

```javascript
// 单入口
export default {
  input: 'src/main.js'
};

// 多入口（对象形式）
export default {
  input: {
    main: 'src/main.js',
    vendor: 'src/vendor.js'
  }
};

// 多入口（数组形式）
export default {
  input: ['src/main.js', 'src/vendor.js']
};
```

**影响对比**：

```bash
# 单入口
input: 'src/main.js'
→ 输出：dist/bundle.js

# 多入口（对象）
input: {
  main: 'src/main.js',
  vendor: 'src/vendor.js'
}
→ 输出：
  dist/main.js
  dist/vendor.js

# 多入口（数组）
input: ['src/main.js', 'src/vendor.js']
→ 输出：
  dist/main.js
  dist/vendor.js
```

### 1.2 external（外部依赖）

**作用**：指定哪些模块不打包进 bundle，而是作为外部依赖。

```javascript
// 字符串数组
export default {
  input: 'src/main.js',
  external: ['lodash', 'vue']
};

// 正则表达式
export default {
  external: /node_modules/
};

// 函数
export default {
  external: (id) => {
    return id.includes('node_modules');
  }
};
```

**影响对比**：

```javascript
// 源码
import _ from 'lodash';
import { ref } from 'vue';

export function myFunction() {
  return _.debounce(() => {}, 100);
}

// 不配置 external
export default {
  input: 'src/main.js'
};
// 输出：lodash 和 vue 都被打包进去
// dist/bundle.js (200KB)

// 配置 external
export default {
  external: ['lodash', 'vue']
};
// 输出：lodash 和 vue 不打包，作为外部依赖
// dist/bundle.js (5KB)
import _ from 'lodash';
import { ref } from 'vue';
```

**使用场景**：

```javascript
// 打包库时（推荐）
export default {
  external: [
    'vue',           // 运行时依赖
    'lodash-es',     // 工具库依赖
    /^@vue\//        // Vue 相关包
  ]
};

// 打包应用时
export default {
  external: []  // 通常不需要 external
};
```

### 1.3 plugins（插件）

**作用**：配置 Rollup 插件。

```javascript
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/main.js',
  plugins: [
    resolve(),       // 解析 node_modules
    commonjs(),      // 转换 CommonJS
    babel({          // 转换 ES6+
      babelHelpers: 'bundled'
    }),
    terser()         // 压缩代码
  ]
};
```

**插件执行顺序**：

```javascript
export default {
  plugins: [
    // 1. 解析阶段（从上到下）
    resolve(),     // 先解析模块路径
    commonjs(),    // 再转换 CommonJS
    
    // 2. 转换阶段（从上到下）
    babel(),       // 转换语法
    
    // 3. 生成阶段（从下到上）
    terser()       // 最后压缩
  ]
};
```

### 1.4 onwarn（警告处理）

**作用**：自定义警告处理。

```javascript
export default {
  input: 'src/main.js',
  onwarn(warning, warn) {
    // 忽略特定警告
    if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
    
    // 将警告转为错误
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      throw new Error(warning.message);
    }
    
    // 默认处理
    warn(warning);
  }
};
```

**常见警告类型**：

```javascript
export default {
  onwarn(warning, warn) {
    // CIRCULAR_DEPENDENCY：循环依赖
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      console.warn('检测到循环依赖:', warning.cycle);
      return;
    }
    
    // UNUSED_EXTERNAL_IMPORT：未使用的外部导入
    if (warning.code === 'UNUSED_EXTERNAL_IMPORT') {
      return;  // 忽略
    }
    
    // THIS_IS_UNDEFINED：this 为 undefined
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }
    
    warn(warning);
  }
};
```

### 1.5 treeshake（Tree-shaking）

**作用**：配置 tree-shaking 行为。

```javascript
// 启用 tree-shaking（默认）
export default {
  treeshake: true
};

// 禁用 tree-shaking
export default {
  treeshake: false
};

// 使用预设
export default {
  treeshake: {
    preset: 'recommended'  // 'smallest' | 'safest' | 'recommended'
  }
};

// 详细配置
export default {
  treeshake: {
    preset: 'smallest',                        // 预设配置
    annotations: true,                         // 使用注释判断副作用
    correctVarValueBeforeDeclaration: false,   // 变量声明前的值优化
    moduleSideEffects: true,                   // 保留模块副作用
    propertyReadSideEffects: false,            // 属性读取无副作用
    tryCatchDeoptimization: true,              // try-catch 块优化
    unknownGlobalSideEffects: true             // 未知全局变量有副作用
  }
};
```

**预设说明**：

| 预设 | 说明 | 适用场景 |
|------|------|----------|
| `recommended` | 推荐配置（默认） | 平衡体积和兼容性 |
| `smallest` | 最激进的优化 | 追求最小体积 |
| `safest` | 最保守的优化 | 确保兼容性 |

**影响对比**：

```javascript
// 源码
// utils.js
export function used() {
  console.log('used');
}

export function unused() {
  console.log('unused');
}

// main.js
import { used } from './utils.js';
used();

// treeshake: true（默认）
function used() {
  console.log('used');
}
used();
// ✓ unused 函数被移除

// treeshake: false
function used() {
  console.log('used');
}
function unused() {
  console.log('unused');
}
used();
// ✗ unused 函数保留（未移除）

// treeshake: { preset: 'smallest' }
// 最激进的优化，移除更多未使用代码
function used(){console.log('used')}used();
```

## 二、输出选项（Output Options）

### 2.1 file / dir（输出文件）

**作用**：指定输出文件路径。

```javascript
// 单个文件
export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js'
  }
};

// 输出目录（多入口或代码分割）
export default {
  input: {
    main: 'src/main.js',
    vendor: 'src/vendor.js'
  },
  output: {
    dir: 'dist'
  }
};
```

**规则**：

```javascript
// ✅ 单入口 + file
{
  input: 'src/main.js',
  output: { file: 'dist/bundle.js' }
}

// ✅ 多入口 + dir
{
  input: ['src/a.js', 'src/b.js'],
  output: { dir: 'dist' }
}

// ❌ 单入口 + dir（不推荐）
{
  input: 'src/main.js',
  output: { dir: 'dist' }  // 会输出 dist/main.js
}

// ❌ 多入口 + file（错误）
{
  input: ['src/a.js', 'src/b.js'],
  output: { file: 'dist/bundle.js' }  // 报错
}
```

### 2.2 format（输出格式）

**作用**：指定输出的模块格式。

```javascript
export default {
  output: {
    format: 'es'  // ES modules
  }
};
```

**可选格式**：

| 格式 | 说明 | 使用场景 |
|------|------|----------|
| `es` | ES modules | 现代浏览器、Node.js、Vite |
| `cjs` | CommonJS | Node.js、旧版工具 |
| `umd` | UMD | 浏览器 `<script>`、Node.js |
| `iife` | 立即执行函数 | 浏览器 `<script>` |
| `amd` | AMD | RequireJS |
| `system` | SystemJS | SystemJS 加载器 |

**输出对比**：

```javascript
// 源码
export function add(a, b) {
  return a + b;
}

// format: 'es'
export function add(a, b) {
  return a + b;
}

// format: 'cjs'
Object.defineProperty(exports, '__esModule', { value: true });
function add(a, b) {
  return a + b;
}
exports.add = add;

// format: 'umd'
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.MyLib = {}));
}(this, function (exports) {
  function add(a, b) {
    return a + b;
  }
  exports.add = add;
}));

// format: 'iife'
var MyLib = (function () {
  function add(a, b) {
    return a + b;
  }
  return { add: add };
}());
```

**选择建议**：

```javascript
// 打包库（多格式输出）
export default {
  input: 'src/main.js',
  output: [
    { file: 'dist/my-lib.esm.js', format: 'es' },      // 给打包工具用
    { file: 'dist/my-lib.cjs.js', format: 'cjs' },     // 给 Node.js 用
    { file: 'dist/my-lib.umd.js', format: 'umd', name: 'MyLib' }  // 给浏览器用
  ]
};

// 打包应用（单格式）
export default {
  input: 'src/main.js',
  output: {
    dir: 'dist',
    format: 'es'  // 现代应用使用 ES
  }
};
```

### 2.3 name（全局变量名）

**作用**：UMD/IIFE 格式的全局变量名。

```javascript
export default {
  output: {
    format: 'umd',
    name: 'MyLibrary'  // 必需
  }
};
```

**影响对比**：

```javascript
// format: 'umd', name: 'MyLib'
// 浏览器中可以通过 window.MyLib 访问

<script src="dist/bundle.js"></script>
<script>
  console.log(MyLib.add(1, 2));  // 3
</script>

// format: 'iife', name: 'MyLib'
var MyLib = (function () {
  // ...
}());

// format: 'es'（不需要 name）
export function add(a, b) {
  return a + b;
}
```

### 2.4 sourcemap（Source Map）

**作用**：生成 source map 文件。

```javascript
export default {
  output: {
    sourcemap: true
  }
};
```

**可选值**：

```javascript
// 生成独立的 .map 文件
{
  sourcemap: true
}
// → dist/bundle.js
// → dist/bundle.js.map

// 内联 source map
{
  sourcemap: 'inline'
}
// → dist/bundle.js（包含 source map）

// 隐藏的 source map
{
  sourcemap: 'hidden'
}
// → dist/bundle.js（无注释）
// → dist/bundle.js.map

// 不生成
{
  sourcemap: false  // 默认
}
```

**影响对比**：

```bash
# sourcemap: false
dist/bundle.js         50 KB

# sourcemap: true
dist/bundle.js         50 KB
dist/bundle.js.map    120 KB

# sourcemap: 'inline'
dist/bundle.js        170 KB（包含 source map）
```

### 2.5 globals（全局变量映射）

**作用**：指定外部依赖的全局变量名（UMD/IIFE）。

```javascript
export default {
  external: ['vue', 'lodash'],
  output: {
    format: 'umd',
    name: 'MyLib',
    globals: {
      vue: 'Vue',
      lodash: '_'
    }
  }
};
```

**影响对比**：

```javascript
// 源码
import { ref } from 'vue';
import _ from 'lodash';

// 不配置 globals（错误）
export default {
  external: ['vue', 'lodash'],
  output: { format: 'umd', name: 'MyLib' }
};
// ❌ 报错：缺少全局变量映射

// 配置 globals（正确）
export default {
  external: ['vue', 'lodash'],
  output: {
    format: 'umd',
    name: 'MyLib',
    globals: {
      vue: 'Vue',
      lodash: '_'
    }
  }
};

// 输出
(function (global, Vue, _) {
  // ...
}(this, window.Vue, window._));
```

### 2.6 exports（导出模式）

**作用**：指定导出模式。

```javascript
export default {
  output: {
    exports: 'auto'  // 默认
  }
};
```

**可选值**：

| 值 | 说明 | 适用场景 |
|---|---|---|
| `auto` | 自动检测 | 默认（推荐） |
| `default` | 仅默认导出 | 单一默认导出 `export default` |
| `named` | 仅命名导出 | 多个命名导出 `export { a, b }` |
| `none` | 无导出 | IIFE 格式，不导出任何内容 |

**影响对比**：

```javascript
// 源码 1：仅默认导出
export default 42;

// exports: 'auto' 或 'default'（CJS 输出）
module.exports = 42;

// exports: 'named'（CJS 输出）
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = 42;

// 源码 2：混合导出
export default function main() {}
export const util = {};

// exports: 'auto'（CJS 输出）
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = main;
exports.util = util;

// exports: 'default'（CJS 输出）
module.exports = main;  // 只导出默认值，util 被忽略

// exports: 'named'（CJS 输出）
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = main;
exports.util = util;
```

### 2.7 banner / footer（注释）

**作用**：在输出文件头部/尾部添加注释。

```javascript
export default {
  output: {
    banner: '/* MyLib v1.0.0 - MIT License */',
    footer: '/* Built on 2025-11-14 */'
  }
};
```

**动态注释**：

```javascript
import pkg from './package.json';

export default {
  output: {
    banner: `/*!
 * ${pkg.name} v${pkg.version}
 * (c) 2025 ${pkg.author}
 * @license ${pkg.license}
 */`,
    footer: `/* Built: ${new Date().toISOString()} */`
  }
};
```

**输出**：

```javascript
/*!
 * my-lib v1.0.0
 * (c) 2025 John Doe
 * @license MIT
 */
function add(a, b) {
  return a + b;
}
export { add };
/* Built: 2025-11-14T10:30:00.000Z */
```

### 2.8 compact（压缩输出）

**作用**：压缩输出代码（移除空格和换行）。

```javascript
export default {
  output: {
    compact: true
  }
};
```

**影响对比**：

```javascript
// compact: false（默认）
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

export { add, multiply };

// compact: true
function add(a,b){return a+b;}function multiply(a,b){return a*b;}export{add,multiply};
```

**注意**：

```javascript
// compact 只移除空格，不混淆代码
// 如需完整压缩，使用 terser 插件

import terser from '@rollup/plugin-terser';

export default {
  plugins: [terser()]
};
```

### 2.9 entryFileNames / chunkFileNames（文件命名）

**作用**：自定义输出文件名。

```javascript
export default {
  output: {
    dir: 'dist',
    entryFileNames: '[name].[hash].js',         // 入口文件
    chunkFileNames: 'chunks/[name].[hash].js',  // 代码分割文件
    assetFileNames: 'assets/[name].[hash][extname]'  // 资源文件
  }
};
```

**占位符**：

| 占位符 | 说明 | 示例 | 适用 |
|--------|------|------|------|
| `[name]` | 文件名（不含扩展名） | `main` | 全部 |
| `[hash]` | 内容哈希（完整） | `abc123def456` | 全部 |
| `[chunkhash]` | 仅 chunk 内容哈希 | `abc123` | chunk/entry |
| `[format]` | 输出格式 | `es`, `cjs` | entry/chunk |
| `[ext]` | 扩展名（不带点） | `js` | 全部 |
| `[extname]` | 扩展名（带点） | `.js` | 全部 |

**示例**：

```javascript
export default {
  input: {
    main: 'src/main.js',
    vendor: 'src/vendor.js'
  },
  output: {
    dir: 'dist',
    entryFileNames: 'js/[name].[hash].js',
    chunkFileNames: 'js/chunks/[name].[hash].js',
    assetFileNames: 'assets/[name].[hash][extname]'
  }
};

// 输出
dist/
├── js/
│   ├── main.abc123def456.js
│   ├── vendor.def456ghi789.js
│   └── chunks/
│       └── shared.ghi789jkl012.js
└── assets/
    └── logo.jkl012mno345.png

// 使用函数动态命名
export default {
  output: {
    dir: 'dist',
    entryFileNames: (chunkInfo) => {
      return chunkInfo.name === 'main' 
        ? 'app.js' 
        : '[name]-[hash].js';
    },
    chunkFileNames: (chunkInfo) => {
      // 根据模块来源分组
      if (chunkInfo.moduleIds.some(id => id.includes('node_modules'))) {
        return 'vendor/[name].[hash].js';
      }
      return 'chunks/[name].[hash].js';
    }
  }
};
```

### 2.10 preserveModules（保留模块结构）

**作用**：保留原始模块结构，不合并文件。

```javascript
export default {
  input: ['src/main.js', 'src/utils.js'],
  output: {
    dir: 'dist',
    format: 'es',
    preserveModules: true,           // 保留模块结构
    preserveModulesRoot: 'src'       // 指定根目录
  }
};
```

**影响对比**：

```bash
# preserveModules: false（默认）
dist/
└── main.js（所有代码合并）

# preserveModules: true
dist/
├── main.js
├── utils.js
└── components/
    ├── Button.js
    └── Input.js
```

**适用场景**：

```javascript
// 适合发布库时保留模块结构
// 用户可以按需导入
import { Button } from 'my-lib/components/Button';
import { formatDate } from 'my-lib/utils/date';
```

### 2.11 manualChunks（手动代码分割）

**作用**：手动控制代码分割。

```javascript
export default {
  output: {
    dir: 'dist',
    manualChunks: {
      vendor: ['react', 'react-dom'],
      utils: ['lodash', 'axios']
    }
  }
};

// 或使用函数
export default {
  output: {
    dir: 'dist',
    manualChunks(id) {
      // 将 node_modules 分离到 vendor
      if (id.includes('node_modules')) {
        return 'vendor';
      }
      // 将 utils 目录分离
      if (id.includes('src/utils')) {
        return 'utils';
      }
    }
  }
};
```

**输出结果**：

```bash
dist/
├── main.js
├── vendor.js      # react, react-dom
└── utils.js       # lodash, axios
```

### 2.12 interop（互操作性）

**作用**：控制 ES modules 和 CommonJS 的互操作方式。

```javascript
export default {
  output: {
    format: 'cjs',
    interop: 'auto'  // 'auto' | 'esModule' | 'default' | 'defaultOnly' | false
  }
};
```

**可选值**：

| 值 | 说明 | 使用场景 |
|---|---|---|
| `auto` | 自动检测（默认） | 推荐 |
| `esModule` | 添加 `__esModule` 标记 | 标准 ES module 互操作 |
| `default` | 使用 default 互操作 | 仅有默认导出 |
| `defaultOnly` | 仅处理 default 导出 | 优化场景 |
| `false` | 不处理互操作 | 纯 ES modules |

## 三、常用插件

### 3.1 @rollup/plugin-node-resolve

**作用**：解析 node_modules 中的模块。

```bash
pnpm add -D @rollup/plugin-node-resolve
```

```javascript
import resolve from '@rollup/plugin-node-resolve';

export default {
  plugins: [
    resolve({
      extensions: ['.js', '.ts'],  // 支持的扩展名
      browser: true,               // 使用 browser 字段
      preferBuiltins: false        // 优先使用内置模块
    })
  ]
};
```

**影响对比**：

```javascript
// 源码
import _ from 'lodash-es';

// 不使用 resolve 插件
// ❌ 报错：无法解析 'lodash-es'

// 使用 resolve 插件
// ✓ 自动从 node_modules 解析并打包
```

### 3.2 @rollup/plugin-commonjs

**作用**：将 CommonJS 模块转换为 ES modules。

```bash
pnpm add -D @rollup/plugin-commonjs
```

```javascript
import commonjs from '@rollup/plugin-commonjs';

export default {
  plugins: [
    commonjs({
      include: 'node_modules/**',  // 包含的文件
      exclude: [],                 // 排除的文件
      extensions: ['.js', '.cjs']  // 支持的扩展名
    })
  ]
};
```

**影响对比**：

```javascript
// CommonJS 模块（node_modules/some-lib/index.js）
module.exports = function someLib() {
  return 'hello';
};

// 不使用 commonjs 插件
import someLib from 'some-lib';
// ❌ 无法正确导入 CommonJS 模块

// 使用 commonjs 插件
import someLib from 'some-lib';
someLib();  // ✓ 正常工作
```

### 3.3 @rollup/plugin-babel

**作用**：使用 Babel 转换代码。

```bash
pnpm add -D @rollup/plugin-babel @babel/core @babel/preset-env
```

```javascript
import babel from '@rollup/plugin-babel';

export default {
  plugins: [
    babel({
      babelHelpers: 'bundled',  // 'bundled' | 'runtime' | 'inline' | 'external'
      exclude: 'node_modules/**',
      extensions: ['.js', '.ts', '.jsx', '.tsx'],
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }]
      ]
    })
  ]
};
```

**babelHelpers 选项**：

```javascript
// babelHelpers: 'bundled'（推荐用于库）
// Babel helpers 打包进输出文件

// babelHelpers: 'runtime'（用于应用）
// 需要安装 @babel/runtime
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';

// babelHelpers: 'inline'（不推荐）
// 每个文件都内联 helpers，导致代码重复

// babelHelpers: 'external'（用于工具库）
// helpers 作为外部依赖
```

### 3.4 @rollup/plugin-typescript

**作用**：处理 TypeScript 文件。

```bash
pnpm add -D @rollup/plugin-typescript typescript tslib
```

```javascript
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/main.ts',
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',  // tsconfig 路径
      declaration: true,             // 生成 .d.ts
      declarationDir: 'dist/types',  // .d.ts 输出目录
      exclude: ['**/*.test.ts']      // 排除文件
    })
  ]
};
```

**生成类型声明**：

```typescript
// src/math.ts
export function add(a: number, b: number): number {
  return a + b;
}

// 输出
// dist/math.js
export function add(a, b) {
  return a + b;
}

// dist/types/math.d.ts
export declare function add(a: number, b: number): number;
```

### 3.5 @rollup/plugin-json

**作用**：导入 JSON 文件。

```bash
pnpm add -D @rollup/plugin-json
```

```javascript
import json from '@rollup/plugin-json';

export default {
  plugins: [
    json({
      compact: true,       // 压缩 JSON
      namedExports: true   // 支持命名导出
    })
  ]
};
```

**使用示例**：

```javascript
// package.json
{
  "name": "my-lib",
  "version": "1.0.0"
}

// 源码
import pkg from './package.json';
import { version } from './package.json';

console.log(pkg.name);     // 'my-lib'
console.log(version);      // '1.0.0'
```

### 3.6 @rollup/plugin-terser

**作用**：压缩 JavaScript 代码。

```bash
pnpm add -D @rollup/plugin-terser
```

```javascript
import terser from '@rollup/plugin-terser';

export default {
  plugins: [
    terser({
      compress: {
        drop_console: true,     // 移除 console
        drop_debugger: true,    // 移除 debugger
        pure_funcs: ['console.log']  // 移除特定函数调用
      },
      format: {
        comments: false         // 移除注释
      }
    })
  ]
};
```

**压缩效果**：

```javascript
// 源码
function add(a, b) {
  console.log('Adding:', a, b);
  return a + b;
}

export { add };

// terser 压缩后
function add(a,b){return a+b}export{add};

// 体积对比
// 源码：120 bytes
// 压缩后：35 bytes（减少 70%）
```

### 3.7 @rollup/plugin-replace

**作用**：替换代码中的字符串。

```bash
pnpm add -D @rollup/plugin-replace
```

```javascript
import replace from '@rollup/plugin-replace';

export default {
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __VERSION__: JSON.stringify(require('./package.json').version),
      preventAssignment: true  // 防止意外替换赋值语句
    })
  ]
};
```

**使用示例**：

```javascript
// 源码
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode');
}

console.log('Version:', __VERSION__);

// 替换后
if ('production' === 'development') {
  console.log('Debug mode');  // tree-shaking 会移除这段代码
}

console.log('Version:', '1.0.0');
```

### 3.8 rollup-plugin-visualizer

**作用**：生成打包分析报告。

```bash
pnpm add -D rollup-plugin-visualizer
```

```javascript
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      filename: 'stats.html',   // 输出文件名
      open: true,               // 自动打开浏览器
      gzipSize: true,           // 显示 gzip 大小
      brotliSize: true,         // 显示 brotli 大小
      template: 'treemap'       // 'treemap' | 'sunburst' | 'network'
    })
  ]
};
```

**生成报告**：

```bash
npx rollup -c

# 输出
# stats.html（可视化分析报告）
# - 各模块大小占比
# - 依赖关系图
# - gzip/brotli 压缩大小
# - 模块依赖树状图
```

### 3.9 @rollup/plugin-alias

**作用**：配置模块路径别名。

```bash
pnpm add -D @rollup/plugin-alias
```

```javascript
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'url';

export default {
  plugins: [
    alias({
      entries: [
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        { find: '@components', replacement: fileURLToPath(new URL('./src/components', import.meta.url)) },
        { find: '@utils', replacement: fileURLToPath(new URL('./src/utils', import.meta.url)) }
      ]
    })
  ]
};
```

**使用示例**：

```javascript
// 使用别名前
import Button from '../../../components/Button.vue';
import { formatDate } from '../../../utils/date.js';

// 使用别名后
import Button from '@components/Button.vue';
import { formatDate } from '@utils/date.js';
```

## 四、完整推荐配置

### 4.1 打包 JavaScript 库

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import pkg from './package.json';

export default [
  // ES module
  {
    input: 'src/index.js',
    external: Object.keys(pkg.peerDependencies || {}),
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      })
    ]
  },
  
  // CommonJS
  {
    input: 'src/index.js',
    external: Object.keys(pkg.peerDependencies || {}),
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      })
    ]
  },
  
  // UMD（浏览器）
  {
    input: 'src/index.js',
    external: Object.keys(pkg.peerDependencies || {}),
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'MyLib',
      sourcemap: true,
      globals: {
        vue: 'Vue'  // 外部依赖的全局变量
      }
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      }),
      terser()  // 压缩
    ]
  }
];
```

### 4.2 打包 TypeScript 库

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import pkg from './package.json';

export default [
  // ES module
  {
    input: 'src/index.ts',
    external: Object.keys(pkg.peerDependencies || {}),
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/types'
      })
    ]
  },
  
  // CommonJS
  {
    input: 'src/index.ts',
    external: Object.keys(pkg.peerDependencies || {}),
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false  // 只在 ES 输出时生成一次
      })
    ]
  },
  
  // UMD（压缩版）
  {
    input: 'src/index.ts',
    external: Object.keys(pkg.peerDependencies || {}),
    output: {
      file: 'dist/my-lib.umd.min.js',
      format: 'umd',
      name: 'MyLib',
      sourcemap: true,
      globals: {
        vue: 'Vue'
      }
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      terser()
    ]
  }
];
```

**对应的 package.json**：

```json
{
  "name": "my-lib",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/my-lib.cjs.js",
  "module": "dist/my-lib.esm.js",
  "browser": "dist/my-lib.umd.min.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/my-lib.esm.js",
      "require": "./dist/my-lib.cjs.js"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "rollup -c"
  }
}
```

### 4.3 打包 Vue 3 组件库

```javascript
// rollup.config.js
import vue from 'rollup-plugin-vue';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';
import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',
    external: ['vue'],
    output: [
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true
      },
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      vue({
        target: 'browser',
        preprocessStyles: true
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/types'
      }),
      postcss({
        extract: true,
        minimize: true
      }),
      terser()
    ]
  }
];
```

### 4.4 Monorepo 子包配置

```javascript
// packages/shared/rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  external: ['vue'],  // 不打包 peerDependencies
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    }
  ],
  plugins: [
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types',
      rootDir: 'src'
    })
  ]
};
```

## 五、Watch 模式（监听模式）

### 5.1 基础配置

```javascript
export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  },
  watch: {
    include: 'src/**',           // 监听的文件
    exclude: 'node_modules/**',  // 排除的文件
    clearScreen: false           // 不清空控制台
  }
};
```

### 5.2 Watch 选项

```javascript
export default {
  // ...
  watch: {
    buildDelay: 1000,         // 延迟构建（ms）
    chokidar: {               // chokidar 选项
      usePolling: true,       // 使用轮询（某些系统需要）
      interval: 100           // 轮询间隔（ms）
    },
    clearScreen: false,       // 不清空屏幕
    skipWrite: false,         // 不跳过写入
    include: ['src/**'],      // 包含的文件
    exclude: ['node_modules/**']  // 排除的文件
  }
};
```

### 5.3 使用 Watch 模式

```bash
# 命令行
npx rollup -c -w
# 或
npx rollup -c --watch

# package.json
{
  "scripts": {
    "dev": "rollup -c -w",
    "build": "rollup -c"
  }
}
```

### 5.4 编程式 Watch

```javascript
import { watch } from 'rollup';

const watchOptions = {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  },
  watch: {
    include: 'src/**'
  }
};

const watcher = watch(watchOptions);

watcher.on('event', event => {
  switch (event.code) {
    case 'START':
      console.log('Rollup is starting...');
      break;
    case 'BUNDLE_START':
      console.log('Building bundle...');
      break;
    case 'BUNDLE_END':
      console.log('Bundle built in', event.duration, 'ms');
      break;
    case 'END':
      console.log('Watching for changes...');
      break;
    case 'ERROR':
      console.error('Error:', event.error);
      break;
  }
});

// 停止监听
// watcher.close();
```

## 六、性能优化

### 6.1 缓存配置

```javascript
export default {
  cache: true,  // 启用缓存
  // ...
};

// 编程式使用缓存
let cache;

async function build() {
  const bundle = await rollup({
    input: 'src/main.js',
    cache  // 使用之前的缓存
  });
  
  cache = bundle.cache;  // 保存缓存供下次使用
}
```

### 6.2 并行处理

```javascript
export default {
  maxParallelFileOps: 20  // 最大并行文件操作数（默认 20）
};
```

### 6.3 优化插件顺序

```javascript
export default {
  plugins: [
    // 1. 首先解析路径
    resolve(),
    
    // 2. 转换 CommonJS
    commonjs(),
    
    // 3. 转换代码
    typescript(),
    
    // 4. 压缩（最后）
    terser()
  ]
};
```

### 6.4 使用 external 减少打包体积

```javascript
import pkg from './package.json';

export default {
  external: [
    // 不打包依赖
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    
    // 不打包 Node.js 内置模块
    /^node:/,
    'path',
    'fs',
    'url'
  ]
};
```

## 七、常见问题

### 7.1 如何处理 CSS

**方案一：使用 rollup-plugin-postcss**

```bash
pnpm add -D rollup-plugin-postcss
```

```javascript
import postcss from 'rollup-plugin-postcss';

export default {
  plugins: [
    postcss({
      extract: true,           // 提取到单独文件
      minimize: true,          // 压缩
      modules: false,          // CSS Modules
      extensions: ['.css', '.scss']
    })
  ]
};
```

**方案二：外部引入**

```javascript
// 在组件中引入
import './styles.css';

// rollup.config.js
export default {
  plugins: [
    postcss({
      inject: true  // 注入到 <head>
    })
  ]
};
```

### 7.2 循环依赖警告

**问题**：

```bash
(!) Circular dependency
src/a.js -> src/b.js -> src/a.js
```

**解决方案**：

```javascript
// ❌ 循环依赖
// a.js
import { b } from './b.js';
export const a = b + 1;

// b.js
import { a } from './a.js';
export const b = a + 1;

// ✅ 解决方案 1：重构代码
// shared.js
export const value = 1;

// a.js
import { value } from './shared.js';
export const a = value + 1;

// b.js
import { value } from './shared.js';
export const b = value + 2;

// ✅ 解决方案 2：忽略警告（不推荐）
export default {
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning);
  }
};
```

### 7.3 未使用的外部导入

**问题**：

```bash
(!) Unused external import 'lodash'
```

**原因**：

```javascript
// 导入了但没使用
import _ from 'lodash';

// main.js
export function add(a, b) {
  return a + b;
}
```

**解决方案**：

```javascript
// 移除未使用的导入
// import _ from 'lodash';  // 删除

export function add(a, b) {
  return a + b;
}
```

### 7.4 this is undefined

**问题**：

```bash
(!) `this` has been rewritten to `undefined`
```

**原因**：ES modules 中 `this` 是 `undefined`。

**解决方案**：

```javascript
// ❌ 使用 this
export function getGlobal() {
  return this.window;
}

// ✅ 使用 globalThis
export function getGlobal() {
  return globalThis.window;
}

// ✅ 使用 window
export function getGlobal() {
  return window;
}
```

### 7.5 打包体积过大

**问题**：打包后的文件太大。

**解决方案**：

```javascript
// 1. 配置 external（不打包依赖）
export default {
  external: ['vue', 'lodash-es']
};

// 2. 启用 tree-shaking
export default {
  treeshake: true
};

// 3. 使用压缩
import terser from '@rollup/plugin-terser';

export default {
  plugins: [terser()]
};

// 4. 代码分割
export default {
  input: {
    main: 'src/main.js',
    vendor: 'src/vendor.js'
  },
  output: {
    dir: 'dist',
    format: 'es'
  }
};

// 5. 分析打包
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({ open: true })
  ]
};
```

### 7.6 处理环境变量

**问题**：如何在代码中使用环境变量？

**方案一：使用 @rollup/plugin-replace**

```javascript
import replace from '@rollup/plugin-replace';

export default {
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
      preventAssignment: true
    })
  ]
};
```

**方案二：使用 dotenv**

```javascript
import dotenv from 'dotenv';
import replace from '@rollup/plugin-replace';

dotenv.config();

export default {
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
      preventAssignment: true
    })
  ]
};
```

### 7.7 TypeScript 路径映射问题

**问题**：TypeScript 的 `paths` 配置不生效。

**解决方案**：

```bash
# 安装插件
pnpm add -D @rollup/plugin-alias
```

```javascript
// rollup.config.js
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'url';

export default {
  plugins: [
    alias({
      entries: [
        { 
          find: '@', 
          replacement: fileURLToPath(new URL('./src', import.meta.url)) 
        }
      ]
    }),
    typescript()
  ]
};
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## 八、最佳实践

### 8.1 多格式输出

```javascript
// 为不同场景提供不同格式
export default [
  // ES（现代打包工具）
  {
    output: { format: 'es' }
  },
  // CJS（Node.js）
  {
    output: { format: 'cjs' }
  },
  // UMD（浏览器）
  {
    output: { format: 'umd', name: 'MyLib' }
  }
];
```

### 8.2 正确配置 external

```javascript
import pkg from './package.json';

export default {
  // 运行时依赖不打包
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    /^node:/  // Node.js 内置模块
  ]
};
```

### 8.3 生成 Source Map

```javascript
export default {
  output: {
    sourcemap: true  // 方便调试
  }
};
```

### 8.4 生成类型声明

```javascript
import typescript from '@rollup/plugin-typescript';

export default {
  plugins: [
    typescript({
      declaration: true,
      declarationDir: 'dist/types'
    })
  ]
};
```

### 8.5 配置 package.json

```json
{
  "type": "module",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js"
    }
  },
  "files": ["dist"],
  "sideEffects": false
}
```

### 8.6 使用 NPM Scripts

```json
{
  "scripts": {
    "build": "rollup -c",
    "build:watch": "rollup -c -w",
    "build:prod": "NODE_ENV=production rollup -c",
    "build:analyze": "rollup -c --environment ANALYZE:true"
  }
}
```

### 8.7 日志和调试

```javascript
export default {
  // 配置日志级别
  logLevel: 'info',  // 'silent' | 'error' | 'warn' | 'info' | 'debug'
  
  // 自定义日志处理
  onLog(level, log, handler) {
    if (log.code === 'CIRCULAR_DEPENDENCY') {
      return; // 忽略循环依赖警告
    }
    if (level === 'warn') {
      console.warn('警告:', log.message);
    }
    handler(level, log);
  },
  
  // 自定义警告处理（已弃用，使用 onLog）
  onwarn(warning, warn) {
    if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
    warn(warning);
  }
};
```

### 8.8 条件配置

```javascript
// rollup.config.js
import { defineConfig } from 'rollup';

const isProduction = process.env.NODE_ENV === 'production';
const shouldAnalyze = process.env.ANALYZE === 'true';

export default defineConfig({
  input: 'src/main.js',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: !isProduction  // 只在开发环境生成 sourcemap
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    isProduction && terser(),  // 只在生产环境压缩
    shouldAnalyze && visualizer()  // 按需分析
  ].filter(Boolean)  // 过滤掉 false 值
});
```

### 8.9 使用 defineConfig 获得类型提示

```javascript
// rollup.config.js
import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  input: 'src/main.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  },
  plugins: [typescript()]
});

// 或使用 JSDoc
/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  }
};
```

### 8.10 Monorepo 中的配置共享

```javascript
// packages/shared/rollup.config.base.js
export function createConfig(input, output) {
  return {
    input,
    output,
    external: ['vue', 'react'],
    plugins: [
      resolve(),
      commonjs(),
      typescript()
    ]
  };
}

// packages/package-a/rollup.config.js
import { createConfig } from '../shared/rollup.config.base.js';

export default createConfig('src/index.ts', {
  file: 'dist/index.js',
  format: 'es'
});

// packages/package-b/rollup.config.js
import { createConfig } from '../shared/rollup.config.base.js';

export default createConfig('src/index.ts', {
  file: 'dist/index.js',
  format: 'es'
});
```

### 8.11 错误处理和恢复

```javascript
// rollup.config.js
export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  },
  onLog(level, log, handler) {
    // 记录所有错误
    if (level === 'error') {
      console.error('构建错误:', log);
    }
    handler(level, log);
  },
  plugins: [
    {
      name: 'error-handler',
      buildEnd(error) {
        if (error) {
          console.error('构建失败:', error);
          // 发送通知、记录日志等
        }
      }
    }
  ]
};

// 编程式错误处理
import { rollup } from 'rollup';

async function build() {
  try {
    const bundle = await rollup({
      input: 'src/main.js'
    });
    
    await bundle.write({
      file: 'dist/bundle.js',
      format: 'es'
    });
    
    console.log('✅ 构建成功');
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    if (error.loc) {
      console.error(`  位置: ${error.loc.file}:${error.loc.line}:${error.loc.column}`);
    }
    process.exit(1);
  }
}

build();
```

### 8.12 性能监控

```javascript
export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  },
  // 启用性能分析
  perf: true,
  plugins: [
    {
      name: 'perf-monitor',
      buildStart() {
        this.startTime = Date.now();
        console.log('🚀 开始构建...');
      },
      buildEnd() {
        const duration = Date.now() - this.startTime;
        console.log(`✅ 构建完成，耗时: ${duration}ms`);
      },
      renderStart() {
        console.log('📝 开始生成代码...');
      },
      renderEnd() {
        console.log('✅ 代码生成完成');
      }
    }
  ]
};
```

### 8.13 自定义插件示例

```javascript
// rollup.config.js

// 简单的横幅插件
function bannerPlugin(text) {
  return {
    name: 'banner',
    renderChunk(code) {
      return `/* ${text} */\n${code}`;
    }
  };
}

// 文件大小报告插件
function sizeReportPlugin() {
  return {
    name: 'size-report',
    generateBundle(options, bundle) {
      console.log('\n📊 文件大小报告:');
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk') {
          const size = (chunk.code.length / 1024).toFixed(2);
          console.log(`  ${fileName}: ${size} KB`);
        }
      }
    }
  };
}

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  },
  plugins: [
    bannerPlugin('My Library v1.0.0'),
    sizeReportPlugin()
  ]
};
```

## 九、与其他工具对比

### Rollup vs Webpack

| 特性 | Rollup | Webpack |
|------|--------|---------|
| **打包目标** | 库 | 应用 |
| **输出体积** | ⭐⭐⭐⭐⭐ 小 | ⭐⭐⭐ 中等 |
| **Tree-shaking** | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 良好 |
| **代码分割** | ⭐⭐⭐⭐ 简单 | ⭐⭐⭐⭐⭐ 强大 |
| **插件生态** | ⭐⭐⭐⭐ 丰富 | ⭐⭐⭐⭐⭐ 最丰富 |
| **学习曲线** | ⭐⭐ 简单 | ⭐⭐⭐⭐ 复杂 |
| **开发服务器** | ❌ 无 | ✅ 有 |

**选择建议**：

```
打包库 → Rollup ⭐⭐⭐⭐⭐
- 输出干净
- 体积小
- Tree-shaking 好

打包应用 → Webpack ⭐⭐⭐⭐
- 功能全面
- 开发体验好
- 生态完善
```

### Rollup vs esbuild

| 特性 | Rollup | esbuild |
|------|--------|---------|
| **速度** | ⭐⭐⭐ 快 | ⭐⭐⭐⭐⭐ 极快 |
| **插件生态** | ⭐⭐⭐⭐ 丰富 | ⭐⭐ 有限 |
| **Tree-shaking** | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐ 基础 |
| **代码转换** | ⭐⭐⭐⭐ Babel | ⭐⭐⭐ 内置 |
| **生产环境** | ✅ 成熟 | ⚠️ 快速发展中 |

**选择建议**：

```
生产级库打包 → Rollup ⭐⭐⭐⭐⭐
- Tree-shaking 最好
- 输出质量高
- 生态成熟

快速开发 → esbuild ⭐⭐⭐⭐
- 速度极快
- 适合开发环境
- 简单场景
```

### Rollup vs Vite

```
Vite = esbuild（开发） + Rollup（生产）

开发阶段：
- Vite 使用 esbuild 预构建
- 原生 ES modules

生产阶段：
- Vite 使用 Rollup 打包
- Tree-shaking + 代码分割
```

**Rollup 在 Vite 中的作用**：

```javascript
// vite.config.js
export default {
  build: {
    // 这些都是 Rollup 选项
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
};
```

## 十、快速配置模板

### 10.1 纯 JavaScript 库

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  // ES Module
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    external: ['vue', 'react'],
    plugins: [resolve(), commonjs()]
  },
  // CommonJS
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    },
    external: ['vue', 'react'],
    plugins: [resolve(), commonjs()]
  },
  // UMD（压缩）
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.umd.min.js',
      format: 'umd',
      name: 'MyLib',
      sourcemap: true,
      globals: { vue: 'Vue', react: 'React' }
    },
    external: ['vue', 'react'],
    plugins: [resolve(), commonjs(), terser()]
  }
];
```

### 10.2 TypeScript 库

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.esm.js', format: 'es', sourcemap: true },
      { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: true, exports: 'auto' }
    ],
    external: ['vue'],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        declaration: true,
        declarationDir: 'dist/types',
        rootDir: 'src'
      })
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.min.js',
      format: 'umd',
      name: 'MyLib',
      sourcemap: true,
      globals: { vue: 'Vue' }
    },
    external: ['vue'],
    plugins: [resolve(), commonjs(), typescript(), terser()]
  }
]);
```

### 10.3 Vue 3 组件库

```javascript
// rollup.config.js
import vue from 'rollup-plugin-vue';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.esm.js', format: 'es', sourcemap: true },
    { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' }
  ],
  external: ['vue'],
  plugins: [
    resolve(),
    commonjs(),
    vue({ target: 'browser', preprocessStyles: true }),
    typescript({ declaration: true, declarationDir: 'dist/types' }),
    postcss({ extract: true, minimize: true })
  ]
});
```

## 十一、总结

### 核心优势

1. **输出干净**：接近源码的输出，无冗余代码
2. **Tree-shaking**：业界最好的无用代码消除
3. **多格式支持**：ES/CJS/UMD/IIFE/AMD/System
4. **专注库打包**：适合打包 JavaScript 库和工具
5. **插件丰富**：强大的插件生态系统
6. **配置简单**：相比 Webpack 更易上手

### 最小配置

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  },
  plugins: [resolve(), commonjs()]
};
```

### 推荐工作流

```bash
# 1. 安装依赖
pnpm add -D rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs

# 2. 创建配置文件 rollup.config.js

# 3. 配置 package.json
{
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w"
  },
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/types/index.d.ts"
}

# 4. 打包
pnpm build
```

### 关键要点

1. **正确配置 external**：不打包运行时依赖和 peerDependencies
2. **多格式输出**：提供 ES + CJS + UMD 满足不同场景
3. **生成类型声明**：TypeScript 项目必需生成 .d.ts 文件
4. **启用 Source Map**：方便调试和错误追踪
5. **使用合适的插件**：根据项目需求选择必要插件
6. **启用 Tree-shaking**：充分利用 Rollup 的优势
7. **配置 watch 模式**：开发时提高效率
8. **性能优化**：使用缓存、并行处理

### 适用场景

✅ **推荐使用 Rollup**：
- 打包 JavaScript/TypeScript 库
- 打包 Vue/React 组件库
- Monorepo 子包构建
- 工具库和插件

❌ **不推荐使用 Rollup**：
- 复杂的 Web 应用（推荐 Vite/Webpack）
- 需要 HMR 开发服务器（推荐 Vite）
- 大量静态资源处理

### 学习路径

1. **基础**（1-2 天）
   - 理解 ES modules
   - 掌握基础配置
   - 了解常用插件

2. **实践**（3-5 天）
   - 打包简单库
   - 配置多格式输出
   - 处理常见问题

3. **进阶**（1-2 周）
   - Tree-shaking 优化
   - 代码分割策略
   - 自定义插件开发

4. **精通**（持续学习）
   - 性能优化
   - 复杂场景处理
   - 与其他工具集成

## 参考资源

- [Rollup 官网](https://rollupjs.org/)
- [Rollup 中文文档](https://cn.rollupjs.org/)
- [Rollup GitHub](https://github.com/rollup/rollup)
- [Rollup Plugins](https://github.com/rollup/plugins)
- [Awesome Rollup](https://github.com/rollup/awesome)

---

🎉 使用 Rollup，打包最干净、最优化的 JavaScript 库！

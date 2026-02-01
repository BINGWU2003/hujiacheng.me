---
title: Vite 打包慢？原因分析与优化实战指南
date: 2026-02-02
duration: 45min
type: notes
art: random
---

[[toc]]

本文档从前端架构师的视角，深入分析 Vite 打包速度慢的各种原因，并提供系统性的解决方案和最佳实践。

## 目录

- [1. Vite 构建原理简述](#1-vite-构建原理简述)
- [2. 打包慢的常见原因](#2-打包慢的常见原因)
- [3. 诊断打包性能问题](#3-诊断打包性能问题)
- [4. 优化方案详解](#4-优化方案详解)
- [5. 进阶优化策略](#5-进阶优化策略)
- [6. 实战案例分析](#6-实战案例分析)
- [7. 性能优化检查清单](#7-性能优化检查清单)

---

## 1. Vite 构建原理简述

Vite 在生产环境构建时使用 **Rollup** 作为打包工具，虽然开发环境利用原生 ES 模块实现了极速启动，但生产构建依然需要完整的打包流程：

```
源代码 → 依赖解析 → 模块转换 → 代码分割 → Tree Shaking → 压缩混淆 → 输出产物
```

### 1.1 为什么生产构建比开发慢？

| 阶段 | 开发环境 | 生产环境 |
|------|----------|----------|
| 模块处理 | 按需编译 | 全量编译 |
| 代码压缩 | 不压缩 | Terser/esbuild 压缩 |
| Tree Shaking | 不执行 | 完整执行 |
| 代码分割 | 不分割 | 智能分割 |
| Source Map | 简化版 | 完整版（可选） |

---

## 2. 打包慢的常见原因

### 2.1 依赖相关问题

#### 2.1.1 依赖包过大或过多

```bash
# 查看依赖大小
npx vite-bundle-visualizer

# 或使用 rollup-plugin-visualizer
npm install -D rollup-plugin-visualizer
```

**常见的"体积杀手"**：

| 依赖包 | 体积 | 替代方案 |
|--------|------|----------|
| `moment.js` | ~300KB | `dayjs` (~2KB) |
| `lodash` | ~70KB | `lodash-es` + 按需引入 |
| `antd` / `element-plus` | ~1MB+ | 按需引入组件 |
| `echarts` | ~1MB | 按需引入图表 |
| `xlsx` | ~500KB | `xlsx-js-style` 或服务端处理 |

:::tip 为什么依赖体积影响构建速度？
**构建时影响**：
- **解析阶段**：更多代码意味着更多的 AST 解析工作，Rollup 需要遍历每个模块的导入导出
- **转换阶段**：每个模块都需要经过 Babel/esbuild 转换，代码量越大耗时越长
- **Tree Shaking**：Rollup 需要分析整个依赖图来确定哪些代码可以删除，依赖越大分析越慢
- **压缩阶段**：Terser/esbuild 压缩的时间复杂度与代码量成正比

**运行时影响**：
- 更大的包体积 → 更长的下载时间 → 更慢的首屏渲染
- 更多的 JavaScript 代码 → 更长的解析和执行时间
:::

#### 2.1.2 依赖未正确预构建（开发环境）

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    // 强制预构建某些依赖
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      // 嵌套依赖也需要显式声明
      'element-plus/es/components/button/style/css',
    ],
    // 排除不需要预构建的依赖
    exclude: ['your-local-package'],
  },
})
```

:::info 预构建的原理与作用
**什么是预构建？**
Vite 在首次启动开发服务器时使用 esbuild 将依赖转换为 ESM 格式并缓存到 `node_modules/.vite` 目录。

**⚠️ 重要提示：`optimizeDeps` 仅影响开发环境，不影响生产构建！**

生产构建（`vite build`）使用 Rollup 重新处理所有依赖，不会读取预构建缓存。

**为什么需要预构建？（开发环境）**
1. **CJS → ESM 转换**：许多 npm 包只提供 CommonJS 格式，浏览器无法直接使用
2. **合并请求**：将有大量内部模块的依赖（如 lodash-es 有 600+ 模块）打包成单个文件，避免请求瀑布
3. **缓存复用**：预构建结果被缓存，后续启动直接使用

**未正确预构建的后果**：
- ❌ 开发时：首次加载页面时出现大量请求，页面加载缓慢，HMR 变慢
- ✅ 构建时：**不受影响**，Rollup 有独立的依赖处理流程
:::

#### 2.1.3 CommonJS 依赖转换

Vite 需要将 CommonJS 依赖转换为 ESM，这个过程可能很耗时：

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    commonjsOptions: {
      // 优化 CJS 转换
      transformMixedEsModules: true,
      // 忽略不需要转换的依赖
      ignore: ['some-cjs-only-package'],
    },
  },
})
```

:::warning CJS 转换为什么慢？
**转换过程的复杂性**：
1. **静态分析困难**：CJS 使用动态 `require()`，无法在编译时确定导入内容
2. **模块包装**：需要将 CJS 模块包装成 ESM 格式，添加额外的胶水代码
3. **循环依赖处理**：CJS 和 ESM 处理循环依赖的方式不同，需要特殊处理

**`transformMixedEsModules` 的作用**：
- 允许在同一个文件中混用 `import` 和 `require`
- 自动检测并转换混合模块，避免运行时错误

**优化建议**：优先选择提供 ESM 格式的依赖包（通常在 package.json 中有 `"module"` 或 `"exports"` 字段）
:::

### 2.2 代码转换问题

#### 2.2.1 TypeScript 编译慢

```typescript
// vite.config.ts
export default defineConfig({
  esbuild: {
    // 使用 esbuild 进行 TS 转换（默认）
    target: 'es2020',
    // 跳过类型检查（类型检查应该在 CI 中单独执行）
    tsconfigRaw: {
      compilerOptions: {
        // 禁用装饰器元数据（如果不需要）
        emitDecoratorMetadata: false,
      },
    },
  },
})
```

**最佳实践**：将类型检查与构建分离

```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "type-check": "vue-tsc --noEmit",
    "build:ci": "pnpm type-check && pnpm build"
  }
}
```

:::tip 为什么分离类型检查能加速构建？
**esbuild vs tsc 的本质区别**：
| 特性 | esbuild | tsc |
|------|---------|-----|
| 语言 | Go (编译型) | JavaScript (解释型) |
| 类型检查 | ❌ 不支持 | ✅ 完整支持 |
| 转换速度 | 10-100x 更快 | 较慢 |
| 输出 | 仅 JS 代码 | JS + 类型声明 |

**Vite 的策略**：
- 使用 esbuild 进行快速的语法转换（去除类型注解、转换 JSX）
- 类型检查交给 IDE 实时完成或 CI 中单独执行
- 这样构建过程不会被类型检查阻塞

**影响**：类型错误不会阻止构建，需要在 CI 中确保类型安全
:::

#### 2.2.2 Babel 配置不当

```typescript
// vite.config.ts
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // 使用 SWC 替代 Babel（更快）
      // jsxRuntime: 'automatic',
      babel: {
        // 减少 Babel 插件数量
        plugins: [],
        // 排除 node_modules
        exclude: /node_modules/,
      },
    }),
  ],
})
```

#### 2.2.3 CSS 预处理器编译慢

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // 减少 @import 的使用，改用 @use
        additionalData: `@use "@/styles/variables" as *;`,
        // 使用 dart-sass 的现代 API
        api: 'modern-compiler',
      },
      less: {
        // 启用 JavaScript（仅在需要时）
        javascriptEnabled: true,
      },
    },
    // 开启 CSS 模块的本地作用域
    modules: {
      localsConvention: 'camelCase',
    },
  },
})
```

### 2.3 插件相关问题

#### 2.3.1 插件执行顺序不当

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    // ❌ 错误：每个文件都会触发
    myHeavyPlugin(),
    
    // ✅ 正确：限制插件作用范围
    {
      ...myHeavyPlugin(),
      apply: 'build', // 仅在构建时生效
      enforce: 'post', // 最后执行
    },
  ],
})
```

#### 2.3.2 插件配置不当导致重复处理

```typescript
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      // 限制扫描目录
      dirs: ['src/components'],
      // 排除不需要自动导入的组件
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
      // 开启类型声明
      dts: true,
    }),
  ],
})
```

### 2.4 构建配置问题

#### 2.4.1 Source Map 生成耗时

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 生产环境禁用 source map（最快）
    sourcemap: false,
    
    // 或使用 'hidden'（生成但不引用）
    // sourcemap: 'hidden',
    
    // 或使用 esbuild 生成（较快）
    // sourcemap: true,
  },
})
```

:::info Source Map 为什么影响构建速度？
**Source Map 的生成过程**：
1. **映射表构建**：需要记录每一行压缩后代码对应的原始位置
2. **Base64 VLQ 编码**：位置信息需要编码成紧凑格式
3. **文件写入**：生成额外的 .map 文件

**不同选项的影响**：
| 选项 | 构建速度 | 文件体积 | 调试能力 | 安全性 |
|------|----------|----------|----------|--------|
| `false` | ⚡⚡⚡ 最快 | 最小 | ❌ 无法调试 | ✅ 源码不暴露 |
| `true` | ⚡ 较慢 | 较大 | ✅ 完整调试 | ❌ 源码暴露 |
| `'hidden'` | ⚡ 较慢 | 较大 | ✅ 需手动加载 | ⚠️ 需保护 .map 文件 |
| `'inline'` | ⚡ 较慢 | 最大 | ✅ 完整调试 | ❌ 源码暴露 |

**生产环境建议**：
- 禁用 Source Map 或使用 `'hidden'` 配合错误监控平台（如 Sentry）上传 Source Map
:::

#### 2.4.2 代码压缩配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 使用 esbuild 压缩（默认，最快）
    minify: 'esbuild',
    
    // 或使用 terser（更小但更慢）
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true,
    //   },
    // },
  },
})
```

**压缩工具对比**：

| 工具 | 速度 | 压缩率 | 配置复杂度 |
|------|------|--------|------------|
| esbuild | ⚡⚡⚡ 极快 | 较好 | 低 |
| terser | ⚡ 慢 | 最好 | 高 |
| swc | ⚡⚡ 快 | 较好 | 中 |

:::tip 为什么 esbuild 比 Terser 快 10-100 倍？
**底层实现差异**：
| 特性 | esbuild (Go) | Terser (JS) |
|------|--------------|-------------|
| 语言 | Go 编译型语言 | JavaScript 解释型 |
| 并行处理 | 原生多线程 | 单线程（可配置 Worker） |
| 内存管理 | 高效垃圾回收 | V8 GC 开销大 |
| AST 操作 | 单次遍历 | 多次遍历 |

**压缩率差异的原因**：
- Terser 实现了更多高级优化（如内联函数、死代码分支消除）
- esbuild 为了速度牺牲了约 1-3% 的压缩率
- 对于大多数项目，这点体积差异可以忽略

**建议**：除非对包体积有极致要求，否则优先使用 esbuild
:::

#### 2.4.3 Chunk 分割策略不当

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 手动分割代码块
        manualChunks: {
          // 将大型库单独打包
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus'],
          'utils-vendor': ['lodash-es', 'dayjs'],
        },
        
        // 或使用函数动态分割
        // manualChunks(id) {
        //   if (id.includes('node_modules')) {
        //     return 'vendor'
        //   }
        // },
      },
    },
  },
})
```

### 2.5 项目结构问题

#### 2.5.1 文件数量过多

```bash
# 检查项目文件数量
find src -name "*.vue" -o -name "*.ts" -o -name "*.tsx" | wc -l
```

**优化建议**：
- 使用动态导入拆分路由
- 将工具函数合并到单个文件
- 使用 barrel 文件（index.ts）聚合导出

#### 2.5.2 循环依赖

```bash
# 使用 madge 检测循环依赖
npx madge --circular --extensions ts,vue src/
```

```typescript
// vite.config.ts
import circleDependency from 'vite-plugin-circular-dependency'

export default defineConfig({
  plugins: [
    circleDependency({
      // 检测循环依赖
      circleImportThrowErr: false, // 警告而非报错
    }),
  ],
})
```

:::danger 循环依赖如何影响构建？
**构建时的影响**：
1. **模块解析复杂度增加**：Rollup 需要多次遍历依赖图来解决循环
2. **Tree Shaking 失效**：循环依赖的模块可能无法被正确标记为未使用
3. **代码分割困难**：相互依赖的模块难以被分割到不同的 chunk

**运行时的影响**：
```javascript
// A.js
import { b } from './B.js'
export const a = 'A' + b  // b 可能是 undefined！

// B.js  
import { a } from './A.js'
export const b = 'B' + a  // a 可能是 undefined！
```
- ESM 的循环依赖会导致变量在访问时可能是 `undefined`
- 这类 bug 难以排查，且可能在生产环境才暴露

**解决方案**：
- 提取公共代码到第三个模块
- 使用依赖注入代替直接导入
- 延迟导入（在函数内部导入）
:::

### 2.6 硬件与环境问题

#### 2.6.1 内存不足

```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=8192" npm run build

# 或在 package.json 中配置
{
  "scripts": {
    "build": "cross-env NODE_OPTIONS=--max-old-space-size=8192 vite build"
  }
}
```

#### 2.6.2 磁盘 I/O 慢

```typescript
// vite.config.ts
export default defineConfig({
  cacheDir: '.vite', // 使用 SSD 目录作为缓存
  build: {
    // 减少写入操作
    write: true,
  },
})
```

---

## 3. 诊断打包性能问题

### 3.1 使用 Vite 内置性能分析

```bash
# 开启详细日志
DEBUG=vite:* npm run build

# 或使用 --debug 标志
npx vite build --debug
```

### 3.2 使用 rollup-plugin-visualizer

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})
```

### 3.3 分析插件耗时

```typescript
// vite.config.ts
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    Inspect({
      build: true,
      outputDir: '.vite-inspect',
    }),
  ],
})
```

### 3.4 使用 speed-measure-webpack-plugin 等效方案

```typescript
// scripts/analyze-build.ts
import { performance } from 'node:perf_hooks'
import { build } from 'vite'

async function analyzeBuild() {
  const start = performance.now()
  
  await build({
    configFile: './vite.config.ts',
    logLevel: 'info',
  })
  
  const duration = performance.now() - start
  console.log(`构建耗时: ${(duration / 1000).toFixed(2)}s`)
}

analyzeBuild()
```

---

## 4. 优化方案详解

### 4.1 依赖优化

#### 4.1.1 按需引入组件库

```typescript
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

:::info 按需引入的原理与效果
**全量引入 vs 按需引入**：
```typescript
// ❌ 全量引入 - 引入整个库（~1MB）
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
app.use(ElementPlus)

// ✅ 按需引入 - 只引入使用的组件（~50KB）
import { ElButton, ElInput } from 'element-plus'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/input/style/css'
```

**unplugin-vue-components 的工作原理**：
1. **编译时扫描**：分析模板中使用的组件标签
2. **自动导入**：在编译时自动添加 import 语句
3. **样式处理**：自动引入对应组件的样式文件

**构建时间影响**：
- 减少需要处理的代码量 → 更快的转换和压缩
- 减少 Tree Shaking 的工作量 → 更快的依赖分析
- 实测：Element Plus 全量引入 vs 按需引入，构建时间减少 30-50%
:::

#### 4.1.2 使用 CDN 加载大型依赖

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { viteExternalsPlugin } from 'vite-plugin-externals'

export default defineConfig({
  plugins: [
    viteExternalsPlugin({
      vue: 'Vue',
      'vue-router': 'VueRouter',
      axios: 'axios',
    }),
  ],
})
```

```html
<!-- index.html -->
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="https://unpkg.com/vue-router@4/dist/vue-router.global.prod.js"></script>
```

:::tip CDN 外置依赖的原理与权衡
**工作原理**：
1. **externals 配置**：告诉 Rollup 不要打包这些依赖
2. **全局变量映射**：将 `import Vue from 'vue'` 转换为访问 `window.Vue`
3. **CDN 加载**：通过 `<script>` 标签从 CDN 加载依赖

**构建时间优化**：
- 外置的依赖完全不参与构建流程
- 减少 Rollup 需要处理的模块数量
- Vue + Vue Router + Pinia 外置后，构建时间可减少 20-40%

**权衡考虑**：
| 优点 | 缺点 |
|------|------|
| 构建更快 | 依赖 CDN 可用性 |
| 利用浏览器缓存 | 版本管理复杂 |
| 减少服务器带宽 | 可能增加首屏请求数 |
| 多项目共享缓存 | Tree Shaking 失效 |

**建议场景**：
- ✅ 大型稳定依赖（Vue、React、Lodash）
- ❌ 频繁更新的依赖
- ❌ 需要 Tree Shaking 的库
:::

#### 4.1.3 预构建优化（仅开发环境）

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    // 强制预构建
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@vueuse/core',
      'element-plus/es',
      // 深层依赖
      'element-plus > @ctrl/tinycolor',
    ],
    // 使用 esbuild 进行预构建
    esbuildOptions: {
      target: 'es2020',
    },
  },
})
```

:::warning 注意
`optimizeDeps` 配置**仅优化开发环境**的启动速度和 HMR 性能，对 `vite build` 生产构建无影响。

如果你的目标是优化**生产构建速度**，请关注：
- 使用 esbuild 压缩（`build.minify: 'esbuild'`）
- 禁用 Source Map（`build.sourcemap: false`）
- 优化代码分割策略
- 使用 CDN 外置大型依赖
:::

### 4.2 构建优化

#### 4.2.1 开启构建缓存

```typescript
// vite.config.ts（Vite 4.x+）
export default defineConfig({
  build: {
    // 实验性：开启构建缓存（Vite 6+）
    // cache: true,
  },
})
```

#### 4.2.2 使用 esbuild 替代 Terser

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'esbuild',
    target: 'es2020',
  },
  esbuild: {
    drop: ['console', 'debugger'], // 移除 console 和 debugger
    legalComments: 'none', // 移除注释
  },
})
```

#### 4.2.3 优化 Rollup 配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      // 减少解析时间
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: 'no-external',
      },
      // 输出优化
      output: {
        // 使用更高效的 chunk 命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 合并小 chunk
        experimentalMinChunkSize: 10 * 1024, // 10KB
      },
    },
  },
})
```

### 4.3 代码分割优化

#### 4.3.1 路由懒加载

```typescript
// router/index.ts
const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/about',
    component: () => import('@/views/About.vue'),
  },
  // 使用命名 chunk（Vite 使用 Rollup，注释格式不同）
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue'), // Vite 会自动根据文件名生成 chunk 名
  },
]
```

#### 4.3.2 组件懒加载

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 异步组件
const HeavyChart = defineAsyncComponent(() => 
  import('@/components/HeavyChart.vue')
)

// 带 loading 和 error 的异步组件
const AsyncModal = defineAsyncComponent({
  loader: () => import('@/components/Modal.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,
  timeout: 10000,
})
</script>
```

#### 4.3.3 智能分包策略

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // node_modules 分包
          if (id.includes('node_modules')) {
            // Vue 全家桶
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vue-vendor'
            }
            // UI 库
            if (id.includes('element-plus') || id.includes('ant-design')) {
              return 'ui-vendor'
            }
            // 工具库
            if (id.includes('lodash') || id.includes('dayjs')) {
              return 'utils-vendor'
            }
            // 其他第三方库
            return 'vendor'
          }
          // 公共组件
          if (id.includes('src/components/common')) {
            return 'common-components'
          }
        },
      },
    },
  },
})
```

:::info 代码分割如何影响构建和加载？
**分包的核心目标**：
1. **优化缓存命中率**：将变化频率不同的代码分开，业务代码更新时不影响依赖缓存
2. **并行加载**：多个小文件可以并行下载，利用 HTTP/2 多路复用
3. **按需加载**：首屏只加载必要代码，其他代码延迟加载

**分包策略的原理**：
```
未分包：vendor.js (2MB) → 任何依赖更新都导致缓存失效

智能分包：
├── vue-vendor.js (200KB)   → Vue 全家桶，极少更新
├── ui-vendor.js (500KB)    → UI 库，偶尔更新
├── utils-vendor.js (100KB) → 工具库，偶尔更新  
└── app.js (300KB)          → 业务代码，频繁更新
```

**对构建时间的影响**：
- 分包策略本身对构建时间影响很小
- 但合理分包可以减少增量构建时需要重新处理的代码量
- 配合 CI 缓存，可以显著提升部署效率

**常见分包错误**：
- ❌ 分包过细导致过多 HTTP 请求
- ❌ 将相互依赖的模块分到不同 chunk 导致循环加载
- ❌ 将小工具函数单独成 chunk 造成请求浪费
:::

### 4.4 缓存优化

#### 4.4.1 利用浏览器缓存

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 使用 contenthash 确保缓存有效性
        chunkFileNames: 'js/[name].[hash].js',
        entryFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
})
```

#### 4.4.2 使用持久化缓存

```typescript
// vite.config.ts（使用 vite-plugin-node-polyfills 等需要缓存的插件）
export default defineConfig({
  cacheDir: 'node_modules/.vite',
})
```

---

## 5. 进阶优化策略

### 5.1 使用 Turbopack / Rspack

如果项目对构建速度有极致要求，可考虑迁移到更快的构建工具：

```bash
# Rspack (兼容 webpack 生态)
npm create rspack@latest

# 或使用 Rsbuild (更简洁的配置)
npm create rsbuild@latest
```

### 5.2 多线程构建

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      // Rollup 的并行文件操作（注意：这不是真正的多线程构建）
      // Rollup 本身是单线程的，此选项控制并行 I/O 操作数
      maxParallelFileOps: 20, // 默认值
    },
  },
})
```

:::info 关于 Vite/Rollup 的并行处理
Rollup 核心是单线程的，`maxParallelFileOps` 仅控制并行的文件 I/O 操作数量，不是真正的多线程构建。

如果需要真正的并行构建，可以考虑：
- **Turborepo**：在 Monorepo 中并行构建多个包
- **Rspack/Rsbuild**：基于 Rust，原生支持多线程
:::

### 5.3 关于增量构建

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 控制是否清空输出目录
    emptyOutDir: true, // 默认 true
  },
})
```

:::warning 注意
Vite（基于 Rollup）目前**不支持真正的增量构建**。每次 `vite build` 都会重新构建所有文件。

如果需要增量构建能力，可以考虑：
- **Turborepo**：通过缓存实现增量构建效果
- **Nx**：智能检测变更，只构建受影响的项目
- **Rspack**：支持持久化缓存
:::

### 5.4 使用 SWC 替代 Babel

```typescript
// vite.config.ts
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [
    react({
      // SWC 比 Babel 快 20-70 倍
    }),
  ],
})
```

### 5.5 分环境配置

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: mode === 'staging' ? 'hidden' : false,
    minify: mode === 'development' ? false : 'esbuild',
    rollupOptions: {
      treeshake: mode === 'production',
    },
  },
}))
```

---

## 6. 实战案例分析

### 6.1 案例一：大型企业项目优化

**问题**：项目构建时间从 2 分钟增长到 8 分钟

**原因分析**：
1. Element Plus 全量引入
2. ECharts 全量引入
3. 使用 Terser 压缩
4. 生成完整 Source Map

**解决方案**：

```typescript
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  build: {
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          echarts: ['echarts/core', 'echarts/charts', 'echarts/renderers'],
        },
      },
    },
  },
})
```

**优化结果**：构建时间从 8 分钟降至 1.5 分钟

### 6.2 案例二：Monorepo 项目优化

**问题**：Monorepo 中多个子包构建慢

**解决方案**：

```typescript
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "cache": true
    }
  }
}
```

```json
// package.json
{
  "scripts": {
    "build": "turbo run build --filter=./packages/*"
  }
}
```

### 6.3 案例三：首屏加载优化

**问题**：首屏加载的 vendor.js 过大（2.5MB）

**解决方案**：

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 精细化分包
            const chunks = {
              vue: ['vue', '@vue', 'vue-router', 'pinia'],
              ui: ['element-plus', '@element-plus'],
              utils: ['lodash', 'axios', 'dayjs'],
              charts: ['echarts', 'zrender'],
            }
            
            for (const [chunkName, packages] of Object.entries(chunks)) {
              if (packages.some(pkg => id.includes(pkg))) {
                return chunkName
              }
            }
            
            return 'vendor'
          }
        },
      },
    },
  },
})
```

**优化结果**：首屏加载体积从 2.5MB 降至 800KB

---

## 7. 性能优化检查清单

### 7.1 构建前检查

- [ ] 检查是否有不必要的依赖
- [ ] 检查是否有大型库可以替换为轻量替代品
- [ ] 检查是否所有依赖都在 `dependencies` 而非 `devDependencies`
- [ ] 检查是否存在循环依赖
- [ ] 检查 TypeScript 配置是否合理

### 7.2 Vite 配置检查

- [ ] 使用 esbuild 而非 Terser 进行压缩
- [ ] 生产环境禁用或使用 hidden source map
- [ ] 启用 Tree Shaking
- [ ] 配置合理的代码分割策略

### 7.3 代码层面检查

- [ ] 使用路由懒加载
- [ ] 大型组件使用异步组件
- [ ] 第三方库按需引入
- [ ] 避免在顶层导入大型库

### 7.4 CI/CD 优化

- [ ] 使用构建缓存
- [ ] 并行执行 lint 和 type-check
- [ ] 使用高性能 CI 机器
- [ ] 考虑使用增量构建

### 7.5 快速优化命令汇总

```bash
# 1. 分析包体积
npx vite-bundle-visualizer

# 2. 检测循环依赖
npx madge --circular --extensions ts,vue src/

# 3. 检查未使用的依赖
npx depcheck

# 4. 检查重复依赖
npm ls --all | grep -E "├|└"

# 5. 使用更大内存构建
NODE_OPTIONS="--max-old-space-size=8192" npm run build

# 6. 开启详细日志定位问题
DEBUG=vite:* npm run build
```

---

## 总结

Vite 打包慢通常由以下原因造成：

1. **依赖问题**：包体积大、CJS 转换慢
2. **配置问题**：压缩工具选择、Source Map、代码分割
3. **代码问题**：循环依赖、未使用懒加载
4. **环境问题**：内存不足、磁盘慢

**核心优化原则及其原理**：

### 🎯 精准定位：先分析再优化

**为什么重要？**
- 优化不应该是盲目的，错误的优化可能适得其反
- 不同项目的瓶颈不同，需要针对性解决

**具体影响**：
- 使用 `rollup-plugin-visualizer` 可以直观看到每个模块的体积占比
- 使用 `vite-plugin-inspect` 可以看到每个插件的处理耗时
- 基于数据的优化比猜测更有效

### 📦 按需加载：依赖按需、组件按需、路由按需

**为什么有效？**
- Vite 构建时间与需要处理的代码量成正相关
- 减少代码量 = 减少解析、转换、压缩的工作量

**具体影响**：
| 优化项 | 构建时间减少 | 产物体积减少 |
|--------|--------------|--------------| 
| UI 库按需引入 | 30-50% | 50-80% |
| 工具库按需引入 | 10-20% | 30-60% |
| 路由懒加载 | 5-10% | 首屏体积减少 50%+ |

### ⚡ 提升速度：使用 esbuild、禁用 Source Map

**为什么 esbuild 快？**
- Go 语言编写，编译型语言天然比 JavaScript 快
- 原生支持并行处理，充分利用多核 CPU
- 单次 AST 遍历完成所有转换

**Source Map 的代价**：
- 需要记录每一行代码的映射关系
- 生成和写入 .map 文件消耗 I/O
- 对于大型项目，Source Map 可能占构建时间的 20-30%

### 🔄 利用缓存：CI 缓存、依赖缓存

**缓存的价值**（以 CI 构建为例）：
```
首次构建: 依赖安装 (60s) + 业务代码构建 (90s) = 150s
二次构建: 跳过依赖安装 (0s) + 业务代码构建 (90s) = 90s
```

:::warning 注意
`node_modules/.vite` 目录是**开发环境**的预构建缓存，对生产构建（`vite build`）无影响。

生产构建使用 Rollup，它有自己的处理流程，不读取 `.vite` 缓存。
:::

**CI 缓存策略**：
- 缓存 `node_modules` 目录（依赖安装）
- 使用 lock 文件 hash 作为缓存 key
- 部分 CI 平台支持 Rollup 构建缓存（如 Turborepo）

### 📊 持续监控：建立构建时间基准，定期检查

**为什么需要监控？**
- 构建时间会随着项目增长逐渐变慢
- 某次依赖更新可能引入性能问题
- 没有基准就无法衡量优化效果

**建议的监控指标**：
- 构建总时间
- 各阶段耗时（解析、转换、压缩、写入）
- 产物体积
- chunk 数量

---

> 记住：优化是一个持续的过程，应该在项目初期就建立良好的构建性能基准，并在每次重大变更后进行监控。

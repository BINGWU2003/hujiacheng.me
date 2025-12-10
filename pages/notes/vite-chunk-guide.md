---
title: Vite 打包产物与分包策略详解 (Chunk Guide)
date: 2025-12-10
duration: 30min
type: notes
art: plum
---

[[toc]]

## 1\. 核心概念：什么是 Chunk？

在 Vite（及其底层打包工具 Rollup）构建过程中，**Chunk（代码块）** 指的是打包生成的**独立 JavaScript 文件**。

  * **过去（Bundle）：** 所有代码（业务逻辑 + 第三方库）打包成一个巨大的 `bundle.js`。
  * **现在（Chunks）：** 为了性能，代码被拆分成多个小的 `.js` 文件，这些小文件就是 Chunk。

### 为什么需要拆分 Chunk？

1.  **按需加载 (Lazy Loading)：** 首页只加载首页需要的代码，进入其他页面再加载对应的 Chunk，大幅缩短首屏白屏时间。
2.  **长效缓存 (Long-term Caching)：**
      * **业务代码**（经常变）：每次发布都会更新，用户需要重新下载。
      * **第三方库**（不常变）：如 Vue、Axios。拆分出来后，只要不升级版本，用户就可以一直使用浏览器缓存，无需重新下载。

-----

## 2\. Chunk 的三种主要类型

当你运行 `npm run build` 后，`dist` 目录下的 JS 文件主要分为三类：

| 类型 | 命名示例 | 说明 |
| :--- | :--- | :--- |
| **Entry Chunk**<br>(入口块) | `index-[hash].js` | 项目的启动文件（如 `main.ts`），包含核心初始化逻辑。 |
| **Async Chunk**<br>(异步块) | `AboutView-[hash].js` | 通过路由懒加载 (`import()`) 引入的文件。只有用户访问特定路由时才会下载。 |
| **Vendor Chunk**<br>(第三方块) | `vendor-[hash].js`<br>`framework-[hash].js` | 来自 `node_modules` 的依赖库。通过配置分包策略手动拆分出来的产物。 |

-----

## 3\. 进阶配置：`manualChunks` 策略

Vite 允许通过 `build.rollupOptions.output.manualChunks` 函数来手动控制如何拆分代码。

### 核心参数：`id` (Module ID)

`manualChunks(id)` 函数中的 `id` 参数代表**当前处理文件的绝对物理路径**。

  * **macOS/Linux 示例:**
    `/Users/username/project/node_modules/vue/dist/vue.runtime.esm-bundler.js`
  * **Windows 示例:**
    `D:/Work/project/node_modules/vue/dist/vue.runtime.esm-bundler.js`

> **⚠️ 重要坑点：**
> 由于 `id` 是绝对路径，编写判断逻辑时**必须使用 `.includes()`**，而不能使用全等 `===`。同时要小心路径误判（例如你的项目文件夹名就叫 `vue-project`，会导致所有文件都包含 `vue` 关键词）。

### 推荐的生产环境配置方案

以下配置将代码分为三层：**框架层 (Framework)**、**UI 库层 (UI Libs)** 和 **基础依赖层 (Vendor)**。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        // 整理文件名结构
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',

        // --- 核心分包逻辑 ---
        manualChunks(id) {
          // 1. 先过滤：只处理 node_modules 内的依赖
          if (id.includes('node_modules')) {
            
            // 2. 框架层：变动频率最低，缓存优先级最高
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'framework'; // 生成 framework-[hash].js
            }

            // 3. UI 库层：体积较大，独立拆分
            // 根据实际项目调整关键字，如 'element-plus', 'ant-design', 'vant'
            if (id.includes('vant') || id.includes('element-plus')) {
              return 'ui-libs'; // 生成 ui-libs-[hash].js
            }

            // 4. 其他所有 node_modules 依赖归为 vendor
            return 'vendor'; // 生成 vendor-[hash].js
          }
        },
      },
    },
  },
});
```

-----

## 4\. 调试与验证

如果你不确定分包是否生效，或者不知道某个库的 `id` 到底长什么样，可以使用 `console.log` 进行调试。

**步骤：**

1.  在 `vite.config.ts` 的 `manualChunks` 函数第一行加入：
    ```typescript
    if (id.includes('node_modules')) {
        console.log('Chunk ID:', id);
    }
    ```
2.  运行 `npm run build`。
3.  查看终端输出的路径信息，根据实际路径调整你的 `includes` 匹配规则。

## 5\. 总结

  * **Chunk** 是为了解决性能和缓存问题而拆分出来的独立文件。
  * **`id`** 是文件的**绝对路径**，不是简单的包名。
  * **分包原则**：将“经常修改的业务代码”与“长期稳定的第三方库”分离；将“巨大的 UI 库”独立拆分。
  * **安全检查**：判断路径时，建议加上 `id.includes('node_modules')` 作为前置条件，防止误伤项目源码。
---
title: Vite 构建流程详解：从命令到产物
date: 2026-01-23
duration: 60min
type: notes
art: random
---

[[toc]]

本文档详细阐述 Vite 项目执行 `npm run build` 命令后的完整构建流程，结合插件钩子机制深入剖析每个阶段的工作原理。

## 目录

- [1. 构建流程概览](#1-构建流程概览)
- [2. 构建前置阶段](#2-构建前置阶段)
- [3. 构建核心阶段](#3-构建核心阶段)
- [4. 构建输出阶段](#4-构建输出阶段)
- [5. 构建后处理阶段](#5-构建后处理阶段)
- [6. 本项目构建流程实例](#6-本项目构建流程实例)
- [7. 插件执行顺序详解](#7-插件执行顺序详解)

---

## 1. 构建流程概览

当执行 `npm run build` 命令时，Vite 会启动生产环境构建流程，整个过程可以分为以下几个主要阶段：

```
命令执行
  ↓
配置解析阶段 (config, configResolved)
  ↓
构建初始化 (options, buildStart)
  ↓
模块处理阶段 (resolveId, load, transform, moduleParsed)
  ↓
代码生成阶段 (renderStart, renderChunk, augmentChunkHash)
  ↓
资源输出阶段 (generateBundle, writeBundle)
  ↓
构建完成 (buildEnd, closeBundle)
```

### 1.1 钩子分类

Vite 插件钩子可以分为三大类：

**通用钩子（Universal Hooks）**
- 继承自 Rollup，在开发和构建模式下都会调用
- 包括：`options`, `buildStart`, `resolveId`, `load`, `transform`, `buildEnd`, `closeBundle`

**Vite 特有钩子（Vite-Specific Hooks）**
- Vite 独有的钩子，用于处理特定场景
- 包括：`config`, `configResolved`, `configureServer`, `transformIndexHtml`, `handleHotUpdate` 等

**输出生成钩子（Output Generation Hooks）**
- 在 Rollup 输出阶段调用
- 包括：`renderStart`, `renderChunk`, `generateBundle`, `writeBundle` 等

---

## 2. 构建前置阶段

### 2.1 config 钩子

**执行时机：** 最早执行，在配置文件被解析之前

**作用：** 修改 Vite 配置，可以返回部分配置对象与现有配置合并

**执行顺序：** 按插件注册顺序依次执行

```javascript
// 插件示例
export default function myPlugin() {
  return {
    name: 'my-plugin',
    config(config, { command, mode }) {
      // command: 'build' | 'serve'
      // mode: 'development' | 'production' | 自定义模式

      if (command === 'build') {
        return {
          build: {
            rollupOptions: {
              // 修改 Rollup 配置
            }
          }
        }
      }
    }
  }
}
```

**本项目应用：**
- 各插件在此阶段注入自己的配置
- 例如 `auto-import` 插件配置自动导入规则
- `compression` 插件配置压缩选项

### 2.2 configResolved 钩子

**执行时机：** 在 Vite 配置确认后，构建开始前

**作用：** 获取最终解析后的配置，不能再修改配置，通常用于读取配置信息

```javascript
export default function myPlugin() {
  let config;

  return {
    name: 'my-plugin',
    configResolved(resolvedConfig) {
      // 保存配置供后续钩子使用
      config = resolvedConfig;

      console.log('构建模式:', config.command);
      console.log('是否生产环境:', config.isProduction);
      console.log('输出目录:', config.build.outDir);
    }
  }
}
```

**本项目应用：**
- `sourcemap-output-filter` 插件在此阶段读取配置
- 确定是否需要过滤 sourcemap 文件

---

## 3. 构建核心阶段

### 3.1 options 钩子

**执行时机：** 构建开始时，在 `buildStart` 之前

**作用：** 替换或操作传递给 Rollup 的选项对象

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    options(options) {
      // 可以修改 Rollup 的 input 选项
      return {
        ...options,
        // 自定义配置
      }
    }
  }
}
```

### 3.2 buildStart 钩子

**执行时机：** 每次构建开始时调用

**作用：** 访问 Rollup 选项，执行初始化操作

**特点：** 并行执行（parallel）

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    buildStart(options) {
      console.log('构建开始');
      console.log('入口文件:', options.input);

      // 可以在这里做一些初始化工作
      // 例如：清理缓存、创建临时目录等
    }
  }
}
```

**本项目应用：**
- Vue 插件在此阶段初始化编译器
- 各插件准备构建所需的资源

### 3.3 resolveId 钩子

**执行时机：** 每次解析模块导入时调用

**作用：** 自定义模块解析逻辑，可以拦截导入并返回自定义的模块 ID

**特点：**
- 首个执行（first）
- 可以返回 `null` 让其他解析器处理

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    resolveId(source, importer, options) {
      // source: 导入的模块路径
      // importer: 导入该模块的文件路径
      // options: 解析选项

      if (source === 'virtual-module') {
        // 返回虚拟模块 ID
        return '\0virtual-module';
      }

      // 返回 null 让其他插件处理
      return null;
    }
  }
}
```

**本项目应用：**
- 处理路径别名（`@`, `~`, `components` 等）
- `auto-import` 插件解析自动导入的组件和 API

### 3.4 load 钩子

**执行时机：** 在 `resolveId` 之后，加载模块内容时调用

**作用：** 自定义模块加载逻辑，可以返回模块的源代码

**特点：** 首个执行（first）

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    load(id) {
      // id: 模块的完整路径

      if (id === '\0virtual-module') {
        // 返回虚拟模块的代码
        return 'export default "This is a virtual module"';
      }

      // 返回 null 让其他插件或默认加载器处理
      return null;
    }
  }
}
```

**本项目应用：**
- Vue 插件加载 `.vue` 文件
- 处理特殊文件类型（如 JSON、图片等）

### 3.5 transform 钩子

**执行时机：** 在 `load` 之后，对每个加载的模块进行转换

**作用：** 转换模块代码，这是最常用的钩子之一

**特点：** 顺序执行（sequential）

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    transform(code, id) {
      // code: 模块的源代码
      // id: 模块的完整路径

      if (id.endsWith('.vue')) {
        // 转换 Vue 文件
        const transformedCode = someTransform(code);

        return {
          code: transformedCode,
          map: null, // sourcemap
        };
      }

      return null;
    }
  }
}
```

**本项目应用：**
- Vue 插件编译 `.vue` 单文件组件
- `setup-extend` 插件处理 Vue 组件的 name 属性
- esbuild 转换 TypeScript/JSX
- 移除 console 和 debugger（生产环境）

### 3.6 moduleParsed 钩子

**执行时机：** 模块被完全解析后调用

**作用：** 获取模块的 AST 和依赖信息

**特点：**
- 仅在构建阶段调用（开发模式不调用，性能考虑）
- 并行执行（parallel）

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    moduleParsed(moduleInfo) {
      console.log('模块 ID:', moduleInfo.id);
      console.log('模块依赖:', moduleInfo.importedIds);
      console.log('模块导出:', moduleInfo.exports);
      console.log('是否入口:', moduleInfo.isEntry);
    }
  }
}
```

**本项目应用：**
- 分析模块依赖关系
- 为代码分割提供依赖信息

---

## 4. 构建输出阶段

### 4.1 renderStart 钩子

**执行时机：** 在 Rollup 开始生成输出文件之前

**作用：** 在输出生成开始时执行操作

**特点：** 并行执行（parallel）

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    renderStart(outputOptions, inputOptions) {
      console.log('开始生成输出文件');
      console.log('输出格式:', outputOptions.format);
      console.log('输出目录:', outputOptions.dir);
    }
  }
}
```

### 4.2 renderChunk 钩子

**执行时机：** 在每个 chunk 渲染后调用

**作用：** 转换单个 chunk 的代码，可以修改代码或添加 sourcemap

**特点：** 顺序执行（sequential）

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    renderChunk(code, chunk, options) {
      // code: chunk 的代码
      // chunk: chunk 信息（文件名、模块列表等）
      // options: 输出选项

      console.log('处理 chunk:', chunk.fileName);
      console.log('chunk 包含的模块:', Object.keys(chunk.modules));

      // 可以修改代码
      const modifiedCode = code.replace(/console\.log/g, '');

      return {
        code: modifiedCode,
        map: null,
      };
    }
  }
}
```

**本项目应用：**
- esbuild 压缩代码
- 移除注释和 console

### 4.3 augmentChunkHash 钩子

**执行时机：** 在生成 chunk 哈希之前

**作用：** 为 chunk 添加额外的哈希输入，影响最终的文件名

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    augmentChunkHash(chunkInfo) {
      // 返回字符串会被添加到哈希计算中
      if (chunkInfo.name === 'main') {
        return 'custom-hash-input';
      }
    }
  }
}
```

### 4.4 generateBundle 钩子

**执行时机：** 在 bundle 生成完成后，文件写入磁盘之前

**作用：** 修改、添加或删除输出文件，这是修改最终输出的最后机会

**特点：** 顺序执行（sequential）

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    generateBundle(options, bundle) {
      // bundle: 包含所有输出文件的对象

      for (const fileName in bundle) {
        const file = bundle[fileName];

        if (file.type === 'chunk') {
          console.log('Chunk 文件:', fileName);
          console.log('Chunk 大小:', file.code.length);
        } else if (file.type === 'asset') {
          console.log('资源文件:', fileName);
        }
      }

      // 可以添加新文件
      this.emitFile({
        type: 'asset',
        fileName: 'custom-file.txt',
        source: 'Custom content',
      });

      // 可以删除文件
      delete bundle['unwanted-file.js'];
    }
  }
}
```

**本项目应用：**
- `sourcemap-output-filter` 插件在此阶段过滤 sourcemap 文件
- `compression` 插件生成 gzip/brotli 压缩文件
- `visualizer` 插件生成打包分析报告

### 4.5 writeBundle 钩子

**执行时机：** 在文件写入磁盘之后

**作用：** 执行清理工作或后续操作，此时文件已经写入

**特点：** 并行执行（parallel）

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    writeBundle(options, bundle) {
      console.log('文件已写入磁盘');
      console.log('输出目录:', options.dir);

      // 可以执行后续操作
      // 例如：上传到 CDN、发送通知等
    }
  }
}
```

**本项目应用：**
- 可用于上传 sourcemap 到 Sentry
- 生成构建报告
- 清理临时文件

---

## 5. 构建后处理阶段

### 5.1 buildEnd 钩子

**执行时机：** 构建结束时调用（无论成功或失败）

**作用：** 清理资源，记录构建信息

**特点：** 并行执行（parallel）

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    buildEnd(error) {
      if (error) {
        console.error('构建失败:', error);
      } else {
        console.log('构建成功完成');
      }

      // 清理临时资源
    }
  }
}
```

### 5.2 closeBundle 钩子

**执行时机：** 最后执行的钩子，在所有操作完成后

**作用：** 最终的清理工作

**特点：** 并行执行（parallel）

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    closeBundle() {
      console.log('构建流程完全结束');
      // 最终清理工作
    }
  }
}
```

---

## 6. 本项目构建流程实例

基于当前项目配置，完整的构建流程如下：

### 6.1 配置解析阶段

```
1. 执行 vite.config.mjs 导出的函数
   - mode: 'production'
   - command: 'build'
   - 加载环境变量 (loadEnv)
   - 读取版本号 (readVersion)

2. 各插件的 config 钩子执行
   - @vitejs/plugin-vue
   - unplugin-auto-import (createAutoImport)
   - unplugin-vue-setup-extend-plus (createSetupExtend)
   - vite-plugin-compression (createCompression)
   - sourcemap-output-filter (createSourcemapOutputFilter)
   - rollup-plugin-visualizer (如果启用)

3. configResolved 钩子执行
   - 各插件读取最终配置
   - sourcemap-output-filter 确认过滤规则
```

### 6.2 构建初始化阶段

```
1. options 钩子执行
   - 修改 Rollup 配置选项

2. buildStart 钩子执行
   - Vue 插件初始化编译器
   - 各插件准备构建资源
```

### 6.3 模块处理阶段

```
对于每个模块（从入口文件 index.html 开始）：

1. resolveId 钩子
   - 解析路径别名 (@, ~, components, styles, utils)
   - auto-import 插件解析自动导入的 API
   - 解析 node_modules 中的依赖

2. load 钩子
   - Vue 插件加载 .vue 文件
   - 加载 .js/.ts/.jsx/.tsx 文件
   - 加载静态资源（图片、字体等）

3. transform 钩子
   - Vue 插件编译 .vue 单文件组件
   - setup-extend 插件处理 Vue 组件 name 属性
   - esbuild 转换 TypeScript/JSX
   - 生产环境：移除 console 和 debugger
   - SCSS 预处理器处理样式

4. moduleParsed 钩子
   - 分析模块依赖关系
   - 构建依赖图谱
```

### 6.4 代码分割阶段

```
根据 manualChunks 配置进行代码分割：

1. vendor-vue: vue, vue-router, vuex, vue-demi
2. vendor-element: element-plus, @element-plus/icons-vue
3. vendor-vxe: vxe-table, vxe-pc-ui, xe-utils
4. vendor-echarts: echarts
5. vendor-utils: lodash-es, dayjs, axios
6. vendor-nf-design-base-elp: @saber/nf-design-base-elp
7. vendor-highlight: highlight.js
8. 业务代码按路由自动分割
```

### 6.5 输出生成阶段

```
1. renderStart 钩子
   - 开始生成输出文件

2. renderChunk 钩子（对每个 chunk）
   - esbuild 压缩代码
   - 移除注释（legalComments: 'none'）
   - 生成 hidden sourcemap

3. augmentChunkHash 钩子
   - 计算 chunk 哈希值
   - 生成带哈希的文件名

4. generateBundle 钩子
   - sourcemap-output-filter 过滤 sourcemap
     * 保留业务代码的 sourcemap
     * 删除 vendor chunk 的 sourcemap
   - compression 插件生成压缩文件
     * 生成 .gz 文件
     * 生成 .br 文件
   - visualizer 生成打包分析报告（如果启用）

5. writeBundle 钩子
   - 文件写入 dist 目录
```

### 6.6 构建完成阶段

```
1. buildEnd 钩子
   - 记录构建信息
   - 清理临时资源

2. closeBundle 钩子
   - 最终清理工作
   - 构建流程完全结束
```

### 6.7 最终产物

```
dist/
├── assets/
│   ├── index-[hash].js          # 入口文件
│   ├── index-[hash].js.map      # 入口 sourcemap
│   ├── vendor-vue-[hash].js     # Vue 相关依赖
│   ├── vendor-element-[hash].js # Element Plus
│   ├── vendor-vxe-[hash].js     # VXE Table
│   ├── vendor-echarts-[hash].js # ECharts
│   ├── vendor-utils-[hash].js   # 工具库
│   ├── [route]-[hash].js        # 路由分割的业务代码
│   ├── [route]-[hash].js.map    # 业务代码 sourcemap
│   ├── *.css                    # 样式文件
│   ├── *.gz                     # Gzip 压缩文件
│   └── *.br                     # Brotli 压缩文件
├── index.html                   # 入口 HTML
└── stats.html                   # 打包分析报告（可选）
```

---

## 7. 插件执行顺序详解

### 7.1 插件解析顺序

Vite 按以下顺序解析和执行插件：

```
1. Alias 解析插件
   ↓
2. enforce: 'pre' 的用户插件
   ↓
3. Vite 核心插件
   ↓
4. 普通用户插件（无 enforce 值）
   ↓
5. Vite 构建插件
   ↓
6. enforce: 'post' 的用户插件
   ↓
7. Vite 后构建插件（压缩、manifest、报告等）
```

### 7.2 本项目插件执行顺序

基于当前项目配置，插件的实际执行顺序：

```
构建阶段插件顺序：

1. @vitejs/plugin-vue
   - 处理 .vue 文件
   - 编译单文件组件

2. unplugin-auto-import
   - 自动导入 Vue API (ref, computed, watch 等)
   - 自动导入 Vue Router API
   - 自动导入 Vuex API

3. unplugin-vue-setup-extend-plus
   - 处理 Vue 组件的 name 属性
   - 支持 <script setup name="ComponentName">

4. vite-plugin-compression
   - enforce: 'post' (后置执行)
   - 在 generateBundle 阶段生成压缩文件

5. sourcemap-output-filter
   - 在 generateBundle 阶段过滤 sourcemap

6. rollup-plugin-visualizer (可选)
   - 在 generateBundle 阶段生成分析报告
```

### 7.3 钩子执行特性

不同钩子有不同的执行特性：

**顺序执行（Sequential）**
- 按插件顺序依次执行
- 前一个插件执行完才执行下一个
- 适用于需要链式处理的场景
- 钩子：`transform`, `renderChunk`, `generateBundle`

**并行执行（Parallel）**
- 所有插件的钩子同时执行
- 提高执行效率
- 适用于独立操作
- 钩子：`buildStart`, `buildEnd`, `renderStart`, `writeBundle`, `closeBundle`

**首个执行（First）**
- 按顺序执行，直到某个插件返回非 null 值
- 后续插件不再执行
- 适用于解析和加载场景
- 钩子：`resolveId`, `load`

### 7.4 条件执行插件

插件可以通过 `apply` 选项指定执行环境：

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    apply: 'build', // 仅在构建时执行
    // apply: 'serve', // 仅在开发时执行
    // apply: (config, { command }) => command === 'build', // 自定义条件
  }
}
```

**本项目应用：**
- `compression` 插件仅在构建时执行
- `sourcemap-output-filter` 插件仅在构建时执行
- `code-inspector-plugin` 插件仅在开发时执行

---

## 8. 性能优化要点

### 8.1 构建性能优化

基于构建流程，以下是关键的性能优化点：

**1. 依赖预构建（optimizeDeps）**
```javascript
optimizeDeps: {
  esbuildOptions: {
    target: 'esnext', // 使用现代语法，减少转换
  }
}
```

**2. 代码分割（manualChunks）**
- 将第三方库分离为独立 chunk
- 利用浏览器缓存
- 减少主包体积

**3. Sourcemap 优化**
- 使用 `hidden` sourcemap
- 仅为业务代码生成 sourcemap
- 减少构建时间和产物体积

**4. 压缩优化**
- 使用 esbuild 压缩（比 terser 快）
- 移除 console 和 debugger
- 移除注释

### 8.2 产物优化

**1. 资源压缩**
```javascript
// Gzip 和 Brotli 压缩
vite-plugin-compression
```

**2. 文件哈希**
- 自动为文件名添加哈希
- 支持长期缓存策略

**3. Tree Shaking**
- Rollup 自动移除未使用的代码
- 使用 ES Module 语法

**4. CSS 优化**
- 自动提取 CSS
- CSS 代码分割
- 移除未使用的样式

---

## 9. 调试技巧

### 9.1 查看构建详情

```bash
# 查看详细构建日志
npm run build -- --debug

# 生成打包分析报告
VISUALIZER=true npm run build
```

### 9.2 插件调试

在插件中添加日志输出：

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    configResolved(config) {
      console.log('[my-plugin] 配置已解析');
    },
    buildStart() {
      console.log('[my-plugin] 构建开始');
    },
    transform(code, id) {
      if (id.includes('target-file')) {
        console.log('[my-plugin] 转换文件:', id);
      }
      return null;
    },
    generateBundle(options, bundle) {
      console.log('[my-plugin] 生成的文件数量:', Object.keys(bundle).length);
    }
  }
}
```

### 9.3 常见问题排查

**1. 模块解析失败**
- 检查 `resolveId` 钩子
- 确认路径别名配置
- 查看 `resolve.alias` 设置

**2. 代码转换错误**
- 检查 `transform` 钩子
- 确认文件类型处理顺序
- 查看 sourcemap 是否正确

**3. 产物异常**
- 检查 `generateBundle` 钩子
- 确认文件是否被意外删除或修改
- 查看插件执行顺序

---

## 10. 总结

### 10.1 完整构建流程时序图

```
npm run build
    ↓
┌─────────────────────────────────────────┐
│  1. 配置解析阶段                         │
│  - config 钩子                          │
│  - configResolved 钩子                  │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  2. 构建初始化                           │
│  - options 钩子                         │
│  - buildStart 钩子                      │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  3. 模块处理（循环处理每个模块）          │
│  - resolveId 钩子 (解析模块路径)         │
│  - load 钩子 (加载模块内容)              │
│  - transform 钩子 (转换模块代码)         │
│  - moduleParsed 钩子 (解析完成)         │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  4. 代码分割                             │
│  - 根据 manualChunks 配置分割代码        │
│  - 生成依赖图谱                          │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  5. 输出生成                             │
│  - renderStart 钩子                     │
│  - renderChunk 钩子 (处理每个 chunk)    │
│  - augmentChunkHash 钩子 (计算哈希)     │
│  - generateBundle 钩子 (生成产物)       │
│  - writeBundle 钩子 (写入磁盘)          │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  6. 构建完成                             │
│  - buildEnd 钩子                        │
│  - closeBundle 钩子                     │
└─────────────────────────────────────────┘
    ↓
构建完成，产物输出到 dist 目录
```

### 10.2 关键要点

**1. 钩子执行顺序**
- 配置钩子最先执行（config → configResolved）
- 模块处理钩子循环执行（resolveId → load → transform）
- 输出钩子最后执行（renderChunk → generateBundle → writeBundle）

**2. 插件顺序很重要**
- 使用 `enforce: 'pre'` 提前执行
- 使用 `enforce: 'post'` 延后执行
- 默认按注册顺序执行

**3. 性能优化关键点**
- 合理配置代码分割
- 使用 esbuild 进行快速转换和压缩
- 优化 sourcemap 生成策略
- 启用资源压缩（gzip/brotli）

**4. 调试建议**
- 在关键钩子添加日志
- 使用 visualizer 分析打包结果
- 检查插件执行顺序
- 确认文件转换流程

### 10.3 本项目构建特点

基于当前项目配置，构建流程具有以下特点：

**1. 模块化的插件管理**
- 插件配置集中在 `vite/plugins/index.js`
- 根据构建模式动态加载插件
- 便于维护和扩展

**2. 精细化的代码分割**
- 7 个 vendor chunk，按功能分类
- 减少重复打包
- 优化缓存策略

**3. 智能的 Sourcemap 处理**
- 仅为业务代码生成 sourcemap
- 使用 hidden 模式保护源码
- 减少 50% 以上的 sourcemap 体积

**4. 完善的压缩策略**
- esbuild 快速压缩
- 生成 gzip 和 brotli 双格式
- 移除 console 和注释

---

## 11. 参考资源

### 11.1 官方文档

- [Vite 插件 API](https://cn.vite.dev/guide/api-plugin)
- [Rollup 插件开发](https://rollupjs.org/plugin-development/)
- [Vite 配置参考](https://cn.vite.dev/config/)

### 11.2 相关插件文档

- [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue)
- [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import)
- [vite-plugin-compression](https://github.com/vbenjs/vite-plugin-compression)
- [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer)

---

## 12. 附录

### 12.1 钩子快速参考表

| 钩子名称 | 执行阶段 | 执行特性 | 主要用途 |
|---------|---------|---------|---------|
| `config` | 配置解析前 | Sequential | 修改配置 |
| `configResolved` | 配置解析后 | Sequential | 读取配置 |
| `options` | 构建开始前 | Sequential | 修改 Rollup 选项 |
| `buildStart` | 构建开始 | Parallel | 初始化操作 |
| `resolveId` | 模块解析 | First | 自定义模块解析 |
| `load` | 模块加载 | First | 自定义模块加载 |
| `transform` | 代码转换 | Sequential | 转换模块代码 |
| `moduleParsed` | 模块解析完成 | Parallel | 分析模块信息 |
| `renderStart` | 输出开始 | Parallel | 输出前准备 |
| `renderChunk` | Chunk 渲染 | Sequential | 转换 chunk 代码 |
| `augmentChunkHash` | 哈希计算 | Sequential | 影响文件哈希 |
| `generateBundle` | 生成产物 | Sequential | 修改输出文件 |
| `writeBundle` | 写入磁盘后 | Parallel | 后续操作 |
| `buildEnd` | 构建结束 | Parallel | 清理资源 |
| `closeBundle` | 完全结束 | Parallel | 最终清理 |

### 12.2 插件开发模板

```javascript
export default function myVitePlugin(options = {}) {
  // 插件内部状态
  let config;

  return {
    // 插件名称（必需）
    name: 'my-vite-plugin',

    // 应用模式：'build' | 'serve' | (config, env) => boolean
    apply: 'build',

    // 执行顺序：'pre' | 'post'
    enforce: 'post',

    // 配置解析前
    config(config, { command, mode }) {
      return {
        // 返回部分配置进行合并
      };
    },

    // 配置解析后
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    // 构建开始
    buildStart(options) {
      // 初始化操作
    },

    // 模块解析
    resolveId(source, importer, options) {
      // 返回模块 ID 或 null
      return null;
    },

    // 模块加载
    load(id) {
      // 返回模块代码或 null
      return null;
    },

    // 代码转换
    transform(code, id) {
      // 返回转换后的代码
      return {
        code,
        map: null,
      };
    },

    // 输出生成
    generateBundle(options, bundle) {
      // 修改、添加或删除输出文件
    },

    // 构建结束
    buildEnd(error) {
      // 清理资源
    },
  };
}
```

### 12.3 常见场景示例

**场景 1：添加版本号到文件头部**

```javascript
export default function addVersionPlugin(version) {
  return {
    name: 'add-version',
    renderChunk(code, chunk) {
      if (chunk.isEntry) {
        return {
          code: `/* Version: ${version} */\n${code}`,
          map: null,
        };
      }
    }
  };
}
```

**场景 2：过滤特定文件**

```javascript
export default function filterFilesPlugin(pattern) {
  return {
    name: 'filter-files',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        if (pattern.test(fileName)) {
          delete bundle[fileName];
        }
      }
    }
  };
}
```

**场景 3：生成构建报告**

```javascript
export default function buildReportPlugin() {
  return {
    name: 'build-report',
    generateBundle(options, bundle) {
      const report = {
        chunks: [],
        assets: [],
        totalSize: 0,
      };

      for (const fileName in bundle) {
        const file = bundle[fileName];
        const size = file.type === 'chunk'
          ? file.code.length
          : file.source.length;

        report.totalSize += size;

        if (file.type === 'chunk') {
          report.chunks.push({ fileName, size });
        } else {
          report.assets.push({ fileName, size });
        }
      }

      this.emitFile({
        type: 'asset',
        fileName: 'build-report.json',
        source: JSON.stringify(report, null, 2),
      });
    }
  };
}
```

---

## 结语

本文档详细阐述了 Vite 项目从执行 `npm run build` 命令到生成最终产物的完整构建流程。通过深入理解插件钩子机制和执行顺序，可以更好地：

1. **优化构建性能** - 了解每个阶段的工作原理，针对性地进行优化
2. **开发自定义插件** - 掌握插件开发的核心概念和最佳实践
3. **排查构建问题** - 快速定位问题所在的构建阶段和插件
4. **提升代码质量** - 利用构建流程实现代码检查、优化和转换

希望这份文档能帮助你更深入地理解 Vite 的构建机制，并在实际项目中灵活运用。

---

**文档版本：** 1.0
**最后更新：** 2026-01-22
**适用 Vite 版本：** 5.x+

---
title: Vue 组件库打包配置指南
date: 2025-09-22
duration: 30min
art: random
---

[[toc]]

本文档详细介绍了如何配置 Vite 来构建一个现代化的 Vue 3 组件库，包括 TypeScript 支持、多种输出格式、Tree Shaking 优化等。

## 项目概述

我们的组件库 `@vue/my-components-vite` 是基于 Vue 3 + TypeScript + Element Plus 构建的组件库，支持：

- ✅ ES Module 和 UMD 两种输出格式
- ✅ TypeScript 类型定义自动生成
- ✅ Tree Shaking 优化
- ✅ CSS 样式分离
- ✅ Source Map 支持
- ✅ 代码压缩优化

## Package.json 配置

### 基本信息

```json
{
  "name": "@vue/my-components-vite",
  "version": "1.0.0",
  "description": "基于 Element Plus 的 Vue 3 组件库",
  "type": "module"
}
```

### 入口文件配置

```json
{
  "main": "dist/index.umd.js", // CommonJS 入口（兼容性）
  "module": "dist/index.es.js", // ES Module 入口
  "types": "dist/index.d.ts", // TypeScript 类型定义
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.es.js",
      "require": "./dist/index.umd.js"
    },
    "./style": "./dist/style.css" // 样式文件导出
  }
}
```

### 发布文件

```json
{
  "files": [
    "dist" // 只发布 dist 目录
  ]
}
```

### 依赖管理

```json
{
  "peerDependencies": {
    "element-plus": "^2.11.2",
    "vue": "^3.3.0"
  }
}
```

使用 `peerDependencies` 确保宿主项目提供这些依赖，避免重复打包。

## Vite 配置详解

### 插件配置

#### Vue 插件

```typescript
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(), // 支持 .vue 文件
    // ...
  ],
})
```

#### TypeScript 声明文件生成

```typescript
import dts from 'vite-plugin-dts'

dts({
  insertTypesEntry: true, // 自动插入类型入口
  include: ['src/**/*', 'index.ts'], // 包含的文件
  exclude: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*'], // 排除测试文件
  outDir: 'dist', // 输出目录
  rollupTypes: true, // 合并类型定义
  copyDtsFiles: true, // 复制 .d.ts 文件
  staticImport: true, // 静态导入优化
  clearPureImport: true, // 清理纯导入
})
```

### 构建配置

#### 库模式配置

```typescript
build: {
  lib: {
    entry: {
      index: resolve(__dirname, 'index.ts'),  // 入口文件
    },
    name: 'MyComponentsVite',                 // UMD 全局变量名
    fileName: (format, entryName) => `${entryName}.${format}.js`,
    formats: ['es', 'umd'],                   // 输出格式
  }
}
```

#### Rollup 选项

```typescript
rollupOptions: {
  // 外部依赖配置
  external: [
    'vue',
    'element-plus',
    '@element-plus/icons-vue',
    /^element-plus\/.*/,  // 匹配 element-plus 子模块
    /^vue\/.*/,           // 匹配 vue 子模块
  ],

  output: [
    // ES 模块输出
    {
      format: 'es',
      entryFileNames: '[name].es.js',
      preserveModules: true,        // 保持模块结构，支持 Tree Shaking
      preserveModulesRoot: 'src',   // 模块根目录
      exports: 'named',             // 命名导出
      dir: 'dist',
    },
    // UMD 输出
    {
      format: 'umd',
      entryFileNames: '[name].umd.js',
      name: 'MyComponentsVite',
      exports: 'named',
      globals: {                    // 全局变量映射
        vue: 'Vue',
        'element-plus': 'ElementPlus',
        '@element-plus/icons-vue': 'ElementPlusIconsVue',
      },
      dir: 'dist',
    },
  ]
}
```

### Tree Shaking 优化

```typescript
rollupOptions: {
  treeshake: {
    moduleSideEffects: false,        // 模块无副作用
    propertyReadSideEffects: false,  // 属性读取无副作用
    tryCatchDeoptimization: false,   // 禁用 try-catch 去优化
  }
}
```

### 代码压缩配置

```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,    // 移除 console
      drop_debugger: true,   // 移除 debugger
    },
  },
  sourcemap: true,           // 生成 source map
  target: 'es2015',          // 目标环境
  cssCodeSplit: false,       // CSS 样式合并（重要：设置为 false）
}
```

### CSS 样式合并打包配置

#### 问题背景

默认情况下，Vite 会为每个组件生成独立的 CSS 文件，这会导致：

- ❌ 用户需要分别引入多个 CSS 文件
- ❌ 增加 HTTP 请求数量
- ❌ 样式管理复杂
- ❌ 使用体验差

例如，未优化前的输出结构：

```
dist/
├── components/
│   ├── button/
│   │   ├── button.css          # 按钮组件样式
│   │   └── ...
│   └── pagination-select/
│       ├── pagination-select.css  # 分页选择器样式
│       └── ...
└── ...
```

#### 解决方案

通过配置 Vite，将所有组件的样式合并到单个文件中：

```typescript
export default defineConfig({
  // ...其他配置
  build: {
    // 1. 禁用 CSS 代码分割
    cssCodeSplit: false, // 关键配置：将所有 CSS 合并到一个文件

    rollupOptions: {
      output: [
        {
          format: 'es',
          // 2. 统一 CSS 输出文件名
          assetFileNames: 'style.css', // 所有样式合并到 style.css
          // ...其他配置
        },
        {
          format: 'umd',
          // 3. UMD 格式也使用相同的 CSS 文件名
          assetFileNames: 'style.css',
          // ...其他配置
        },
      ],
    },
  },
})
```

#### 配置详解

##### 1. cssCodeSplit 配置

```typescript
build: {
  cssCodeSplit: false,  // 禁用 CSS 代码分割
}
```

- `true`（默认）：为每个入口点生成独立的 CSS 文件
- `false`：将所有 CSS 合并到一个文件中

##### 2. assetFileNames 配置

```typescript
rollupOptions: {
  output: [
    {
      format: 'es',
      assetFileNames: 'style.css',  // 自定义资源文件名
    },
  ],
}
```

- 控制生成的资源文件（CSS、图片等）的命名规则
- 使用固定名称确保样式文件统一

#### 优化后的输出结构

```
dist/
├── style.css              # ✅ 所有组件样式合并到一个文件
├── index.es.js            # ES Module 入口
├── index.umd.js           # UMD 入口
├── index.d.ts             # TypeScript 类型定义
└── components/            # 组件 JS 文件（无独立 CSS）
    ├── button/
    │   ├── button.es.js
    │   └── index.es.js
    └── pagination-select/
        ├── pagination-select.vue.es.js
        └── index.es.js
```

#### 使用效果

##### 优化前（分散的样式文件）

```typescript
// 用户需要分别引入多个 CSS 文件
import '@vue/my-components-vite/dist/components/button/button.css'
import '@vue/my-components-vite/dist/components/pagination-select/pagination-select.css'
// 更多组件需要更多 CSS 引入...
```

##### 优化后（统一样式文件）

```typescript
// 只需引入一个 CSS 文件即可
import '@vue/my-components-vite/dist/style.css'

// 或者通过 exports 字段
import '@vue/my-components-vite/style'
```

#### 构建验证

构建完成后，你会看到类似的输出：

```bash
✓ 18 modules transformed.
dist/style.css                    0.67 kB │ gzip: 0.30 kB  # ✅ 合并后的样式文件
dist/index.es.js                  1.21 kB │ gzip: 0.50 kB
dist/index.umd.js                 7.02 kB │ gzip: 3.00 kB
```

#### Package.json 配置

确保在 `package.json` 中正确导出样式文件：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.es.js",
      "require": "./dist/index.umd.js"
    },
    "./style": "./dist/style.css" // 样式文件导出
  }
}
```

## 输出结构

构建完成后，`dist` 目录结构如下：

```
dist/
├── style.css               # ✅ 合并后的样式文件（所有组件样式）
├── index.d.ts              # TypeScript 类型定义
├── index.es.js             # ES Module 格式
├── index.es.js.map         # ES Module Source Map
├── index.umd.js            # UMD 格式
├── index.umd.js.map        # UMD Source Map
├── components/             # 组件模块（ES 格式，无独立 CSS）
│   ├── button/
│   │   ├── button.es.js
│   │   ├── button.vue.es.js
│   │   └── index.es.js
│   └── pagination-select/
│       ├── pagination-select.vue.es.js
│       └── index.es.js
└── utils/                  # 工具模块（ES 格式）
    ├── common.es.js
    ├── component.es.js
    └── types.es.js
```

### 关键变化

- ✅ **style.css**：所有组件的样式都合并到这一个文件中
- ✅ **无独立 CSS**：`components/` 目录下不再有独立的 `.css` 文件
- ✅ **统一引入**：用户只需引入一个样式文件即可使用所有组件

## 使用方式

### 完整导入

```typescript
// ES Module
import MyComponents from '@vue/my-components-vite'
import '@vue/my-components-vite/style'  // ✅ 只需引入一个样式文件

// 或者直接引入 CSS 文件
import '@vue/my-components-vite/dist/style.css'

// UMD（浏览器）
<script src="path/to/@vue/my-components-vite/dist/index.umd.js"></script>
<link rel="stylesheet" href="path/to/@vue/my-components-vite/dist/style.css">
```

### 按需导入（Tree Shaking）

```typescript
// 只导入需要的组件
import { Button, PaginationSelect } from '@vue/my-components-vite'
// ✅ 样式文件仍然需要完整引入（推荐做法）
import '@vue/my-components-vite/style'

// 或者从具体路径导入
import Button from '@vue/my-components-vite/dist/components/button'
import '@vue/my-components-vite/dist/style.css' // 样式文件
```

> **注意**：即使按需导入组件，样式文件仍建议完整引入，因为组件间可能存在样式依赖。

## 最佳实践

### 1. 外部依赖管理

- 将 Vue、Element Plus 等框架依赖设置为 `external`
- 使用 `peerDependencies` 而不是 `dependencies`

### 2. 模块结构保持

- 启用 `preserveModules` 支持 Tree Shaking
- 合理组织源码目录结构

### 3. 类型定义优化

- 使用 `vite-plugin-dts` 自动生成类型文件
- 启用 `rollupTypes` 合并类型定义

### 4. 构建优化

- 启用代码压缩和 Tree Shaking
- 生成 Source Map 便于调试
- **CSS 样式合并**：将所有组件样式合并到单个文件，提升使用体验

### 5. 发布配置

- 只发布 `dist` 目录
- 提供多种入口格式支持
- 配置正确的 `exports` 字段
- **样式文件导出**：在 `exports` 中提供样式文件的便捷导入路径

### 6. CSS 样式管理

- **合并优于分离**：对于组件库，将样式合并到单个文件比分离更实用
- **统一引入路径**：提供 `./style` 导出路径，简化用户使用
- **版本一致性**：确保样式文件与组件版本同步更新
- **文档说明**：在文档中明确说明样式文件的引入方式

## 常见问题

### Q: 为什么要同时提供 ES 和 UMD 格式？

A: ES 格式支持 Tree Shaking，现代打包工具首选；UMD 格式兼容性好，可直接在浏览器使用。

### Q: `preserveModules` 的作用是什么？

A: 保持源码的模块结构，生成多个文件而不是打包成单个文件，这样支持更好的 Tree Shaking。

### Q: 如何确保 Tree Shaking 生效？

A:

1. 使用 ES Module 格式
2. 启用 `preserveModules`
3. 配置 `treeshake` 选项
4. 确保代码无副作用

### Q: 类型文件为什么这么大？

A: `vite-plugin-dts` 会生成完整的类型定义，包括所有导出。可以通过 `rollupTypes` 选项优化。

### Q: 为什么要将 CSS 样式合并到一个文件？

A:

1. **简化使用**：用户只需引入一个样式文件，而不是多个
2. **减少请求**：减少 HTTP 请求数量，提升加载性能
3. **避免遗漏**：防止用户忘记引入某个组件的样式文件
4. **管理便捷**：样式版本管理更加统一和简单

### Q: CSS 合并会影响 Tree Shaking 吗？

A:

- **JS 代码**：不影响，JavaScript 代码仍然支持 Tree Shaking
- **CSS 样式**：会包含所有组件样式，但对于组件库来说这通常是可接受的
- **优化建议**：如果样式文件过大，可以考虑提供核心样式和扩展样式的分离版本

### Q: 如何处理样式文件的按需加载？

A:

```typescript
// 方案一：完整引入（推荐）
import '@vue/my-components-vite/style'

// 方案二：如果组件库提供了样式分离，可以按需引入
import '@vue/my-components-vite/dist/components/button/style.css'
import '@vue/my-components-vite/dist/components/pagination-select/style.css'
```

## 全局组件类型声明配置

### components.d.ts 文件说明

当我们在 Vue 应用中全局注册组件后，TypeScript 和 Vue 的 IDE 插件（如 Volar）需要知道这些全局组件的类型信息。`components.d.ts` 文件就是用来声明全局组件类型的配置文件。

### 文件配置示例

```typescript
// src/components.d.ts

// 首先，从组件库导入组件的实际类型
import { PaginationSelect } from '@vue/my-components-vite'

// 扩展 Vue 的全局组件类型
declare module 'vue' {
  // GlobalComponents 告诉 Volar 和 TypeScript 在模板中可以识别哪些全局组件
  export interface GlobalComponents {
    // key 是你在模板中使用的标签名 (app.component的第一个参数)
    // value 是组件的类型
    PaginationSelect: typeof PaginationSelect
    // 如果还有其他全局组件，继续在这里添加
    // MyButton: typeof MyButton
    // ElButton: typeof import('element-plus')['ElButton']
  }
}

// 最后加一个 export {}，确保这个文件被当作一个模块处理
// 否则 declare module 会污染全局作用域
export {}
```

### 配置步骤

#### 1. 创建类型声明文件

在你的 Vue 项目中创建 `src/components.d.ts` 文件（或其他合适的位置）。

#### 2. 导入组件类型

```typescript
import { Button, PaginationSelect } from '@vue/my-components-vite'
```

#### 3. 声明全局组件接口

```typescript
declare module 'vue' {
  export interface GlobalComponents {
    MyButton: typeof Button
    PaginationSelect: typeof PaginationSelect
  }
}
```

#### 4. 确保 TypeScript 识别

在 `tsconfig.json` 中确保包含了这个文件：

```json
{
  "compilerOptions": {
    // ...
  },
  "include": [
    "src/**/*",
    "src/components.d.ts" // 确保包含类型声明文件
  ]
}
```

### 主要用途

#### 1. **IDE 智能提示**

- 在 Vue 模板中使用全局组件时，IDE 能提供智能提示
- 显示组件的 props、事件、插槽等信息
- 提供代码补全功能

#### 2. **TypeScript 类型检查**

- 确保在模板中使用的全局组件名称正确
- 检查传递给组件的 props 类型是否匹配
- 在编译时发现类型错误

#### 3. **开发体验优化**

- 鼠标悬停显示组件文档
- 快速导航到组件定义
- 重构时自动更新组件引用

### 使用场景

#### 场景一：全局注册单个组件

```typescript
// main.ts
import { createApp } from 'vue'
import { PaginationSelect } from '@vue/my-components-vite'
import App from './App.vue'

const app = createApp(App)
app.component('PaginationSelect', PaginationSelect)
app.mount('#app')
```

对应的类型声明：

```typescript
// components.d.ts
import { PaginationSelect } from '@vue/my-components-vite'

declare module 'vue' {
  export interface GlobalComponents {
    PaginationSelect: typeof PaginationSelect
  }
}

export {}
```

#### 场景二：批量注册组件

```typescript
// main.ts
import { createApp } from 'vue'
import * as MyComponents from '@vue/my-components-vite'
import App from './App.vue'

const app = createApp(App)

// 批量注册所有组件
Object.entries(MyComponents).forEach(([name, component]) => {
  app.component(name, component)
})

app.mount('#app')
```

对应的类型声明：

```typescript
// components.d.ts
import * as MyComponents from '@vue/my-components-vite'

declare module 'vue' {
  export interface GlobalComponents {
    Button: typeof MyComponents.Button
    PaginationSelect: typeof MyComponents.PaginationSelect
    // 根据实际导出的组件添加更多...
  }
}

export {}
```

#### 场景三：混合使用多个组件库

```typescript
// components.d.ts
import { PaginationSelect } from '@vue/my-components-vite'
import { ElButton, ElInput } from 'element-plus'

declare module 'vue' {
  export interface GlobalComponents {
    // 自定义组件库
    PaginationSelect: typeof PaginationSelect

    // Element Plus 组件
    ElButton: typeof ElButton
    ElInput: typeof ElInput

    // 或者使用动态导入
    ElDialog: (typeof import('element-plus'))['ElDialog']
  }
}

export {}
```

### 注意事项

#### 1. **文件位置**

- 通常放在 `src/` 目录下
- 文件名必须以 `.d.ts` 结尾
- 确保被 TypeScript 配置包含

#### 2. **模块声明**

- 必须使用 `declare module 'vue'` 来扩展 Vue 的类型
- 需要添加 `export {}` 确保文件被视为模块

#### 3. **组件名称对应**

- `GlobalComponents` 中的 key 必须与 `app.component()` 的第一个参数完全一致
- 区分大小写

#### 4. **类型导入**

- 确保从正确的路径导入组件类型
- 如果组件库没有导出类型，可能需要使用 `typeof import()` 语法

### 最佳实践

#### 1. **自动化生成**

可以编写脚本自动生成 `components.d.ts` 文件：

```typescript
// scripts/generate-components-dts.js
const fs = require('node:fs')
const path = require('node:path')

const components = ['Button', 'PaginationSelect'] // 你的组件列表

const content = `// Auto-generated file
import { ${components.join(', ')} } from '@vue/my-components-vite'

declare module 'vue' {
  export interface GlobalComponents {
${components.map(name => `    ${name}: typeof ${name}`).join('\n')}
  }
}

export {}
`

fs.writeFileSync(path.join(__dirname, '../src/components.d.ts'), content)
```

#### 2. **版本控制**

- 将 `components.d.ts` 文件提交到版本控制
- 在组件库更新时及时更新类型声明

#### 3. **团队协作**

- 在项目文档中说明全局组件的使用方式
- 统一团队的组件注册和类型声明规范

## 相关资源

- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [vite-plugin-dts](https://github.com/qmhc/vite-plugin-dts)
- [Rollup External](https://rollupjs.org/guide/en/#external)
- [Package.json Exports](https://nodejs.org/api/packages.html#exports)
- [Vue Global Components TypeScript](https://vuejs.org/guide/typescript/composition-api.html#typing-global-components)
- [Volar IDE Support](https://github.com/vuejs/language-tools)

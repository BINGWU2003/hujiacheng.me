---
title: Vue3+TypeScript 组件库 Vite 打包配置
date: 2025-12-04
duration: 150min
type: notes
art: random
---

[[toc]]

## 项目仓库

本文档基于真实项目编写，完整代码可在 GitHub 上查看：

🔗 **项目地址**: [https://github.com/BINGWU2003/vue-lib](https://github.com/BINGWU2003/vue-lib)

包含：
- ✅ 完整的 Vite 7.x + Vue 3.5 配置
- ✅ TypeScript 类型声明生成
- ✅ Demo 演示应用
- ✅ 可直接运行的示例代码

---

## 什么是 Vite 库模式

[Vite](https://vitejs.dev/) 是新一代前端构建工具，提供极快的开发服务器启动和热更新体验。Vite 的**库模式（Library Mode）**专门用于打包可复用的组件库或工具库，而非完整的应用程序。

### 核心特性

- 快速构建：基于 Rollup，提供优化的生产构建
- 多格式输出：支持 ES Module、CommonJS、UMD 等格式
- 依赖外部化：自动排除不应打包的依赖
- TypeScript 支持：原生支持 TypeScript，可生成类型声明文件
- 开发体验：快速的 HMR（热模块替换）

```bash
# 安装 Vite
npm install --save-dev vite

# Vue 3 + TypeScript 项目额外依赖
npm install --save-dev @vitejs/plugin-vue vue-tsc unplugin-dts @types/node
```

:::tip 版本说明
本文档基于 **Vite 7.x** 编写（当前最新稳定版本）。

**Vite 版本演进**：
- **Vite 7.x**（2024年12月发布，本文档）：
  - 进一步改进的 Environment API
  - 更好的性能优化
  - 增强的 SSR 和模块图处理
  - 默认使用 Rollup 4.x
  - 完全向后兼容库模式配置

- Vite 6.x（2024年11月发布）：
  - 引入 Environment API
  - 改进的 SSR 支持

- Vite 5.x（稳定版本）：
  - 广泛使用的版本
  - 完整的库模式支持
  :::

:::warning 注意事项
- 本文档适用于使用 Vite 7.x 构建 Vue 3 组件库的项目
- Vite 7.x 的库模式配置与 5.x/6.x 基本兼容
- 升级时建议查看官方迁移指南
- 迁移指南：https://vitejs.dev/guide/migration
:::

## 配置文件

Vite 使用 `vite.config.ts` 或 `vite.config.js` 作为配置文件：

```bash
# TypeScript 配置（推荐）
vite.config.ts

# JavaScript 配置
vite.config.js
vite.config.mjs    # ES Module 项目
vite.config.cjs    # CommonJS 项目
```

**推荐使用** `vite.config.ts`，本文以 TypeScript 格式为例。

### 配置文件模块系统说明

#### vite.config.ts vs vite.config.mts

根据项目的模块系统选择：

**1. vite.config.ts**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})
```

**使用模块系统**：
- `package.json` 中 `"type": "module"` → ES Module
- `package.json` 中 `"type": "commonjs"` 或未指定 → 根据 tsconfig.json

**2. vite.config.mts（ES Module 项目明确使用）**

```typescript
// vite.config.mts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})
```

**适用场景**：
- 明确使用 ES Module 语法
- 避免模块系统混淆
- TypeScript + ES Module 项目

## 一、库模式核心配置

### 1.1 build.lib

**作用**：启用库模式并配置入口、输出格式等。

```typescript
{
  build: {
    lib: {
      entry: string | string[] | { [name: string]: string },
      name?: string,
      formats?: ('es' | 'cjs' | 'umd' | 'iife')[],
      fileName?: string | ((format, entryName) => string),
      cssFileName?: string
    }
  }
}
```

**详细说明**：

| 选项 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `entry` | `string \| string[] \| object` | 是 | 库的入口文件 |
| `name` | `string` | 条件必需 | 全局变量名（UMD/IIFE 格式必需） |
| `formats` | `Array` | 否 | 输出格式，默认 `['es', 'umd']` |
| `fileName` | `string \| Function` | 否 | 输出文件名 |
| `cssFileName` | `string` | 否 | CSS 输出文件名 |

**单入口配置示例**：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyComponentLib',
      formats: ['es', 'umd'],
      fileName: (format) => `my-lib.${format}.js`
    }
  }
})
```

**影响对比**：

```bash
# formats: ['es', 'umd']
dist/
  my-lib.es.js      # ES Module 格式
  my-lib.umd.js     # UMD 格式
  style.css         # CSS 文件

# formats: ['es', 'cjs']
dist/
  my-lib.es.js      # ES Module 格式
  my-lib.cjs        # CommonJS 格式
```

### 1.2 build.rollupOptions

**作用**：配置底层 Rollup 的选项，用于依赖外部化、输出配置等。

```typescript
{
  build: {
    rollupOptions: {
      external?: string | RegExp | (string | RegExp)[],
      output?: {
        globals?: { [name: string]: string }
      }
    }
  }
}
```

**external - 外部化依赖**：

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      // 字符串数组
      external: ['vue', 'vue-router', 'pinia'],

      // 正则表达式
      external: /^vue/,  // 匹配 vue、vue-router 等

      // 混合使用
      external: ['lodash-es', /^@vue/, /^element-plus/],

      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter'
        }
      }
    }
  }
})
```

**为什么要外部化依赖**？

```typescript
// 不外部化 - 打包体积大
// dist/my-lib.es.js 包含 Vue 源码（约500KB）

// 外部化 - 打包体积小
// dist/my-lib.es.js 只有组件代码（约50KB）
{
  rollupOptions: {
    external: ['vue']
  }
}
```

## 二、Vue 特定配置

### 2.1 @vitejs/plugin-vue

**作用**：提供 Vue 3 单文件组件（SFC）支持。

```bash
npm install --save-dev @vitejs/plugin-vue
```

**基础配置**：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})
```

**高级配置**：

```typescript
export default defineConfig({
  plugins: [
    vue({
      // 模板编译选项
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('my-')
        }
      },

      // 脚本设置
      script: {
        defineModel: true,
        propsDestructure: true
      }
    })
  ]
})
```

### 2.2 unplugin-dts（生成类型声明文件）

**作用**：自动生成 `.d.ts` 类型声明文件，支持 Vue SFC。

```bash
npm install --save-dev unplugin-dts
```

**基础配置**：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'unplugin-dts/vite'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      outDirs: 'dist/types',
      entryRoot: 'src',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      cleanVueFileName: true,
      insertTypesEntry: true
    })
  ]
})
```

**高级配置选项**：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `outDirs` | `string \| string[]` | - | 类型声明文件输出目录，可指定数组输出到多个目录 |
| `entryRoot` | `string` | - | 入口文件根目录（用于 monorepo） |
| `include` | `string \| string[]` | - | 需要包含的文件模式 |
| `exclude` | `string \| string[]` | - | 需要排除的文件模式 |
| `cleanVueFileName` | `boolean` | `false` | 清理 .vue 文件名后缀 |
| `insertTypesEntry` | `boolean` | `false` | 自动插入类型入口 |
| `staticImport` | `boolean` | `false` | 将动态导入转为静态导入 |
| `copyDtsFiles` | `boolean` | `false` | 是否复制源码中的 .d.ts 文件 |
| `declarationOnly` | `boolean` | `false` | 只生成声明文件，删除所有其他产物 |
| `bundleTypes` | `boolean \| object` | `false` | 是否将类型声明打包为单个文件 |

## 三、TypeScript 配置

### 3.1 tsconfig.json 基础配置

**作用**：配置 TypeScript 类型检查选项。由于使用 Vite 进行构建，TypeScript 主要负责类型检查，实际的编译和打包由 Vite 处理。

:::tip 重要说明
使用 Vite 时，TypeScript 的配置可以大幅简化：
- **Vite 负责**：代码转换、打包、输出文件
- **TypeScript 负责**：类型检查、IDE 智能提示
- **无需配置**：`outDir`、`declaration`（由 unplugin-dts 处理）
:::

```json
{
  "compilerOptions": {
    // 模块系统（仅用于类型检查）
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",

    // 严格模式
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    // 路径别名（需与 vite.config.ts 保持一致）
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    // Vue 支持
    "jsx": "preserve",
    "jsxImportSource": "vue",

    // 其他必需选项
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

**与传统 tsc 编译的区别**：

| 配置项 | 传统 tsc 编译 | Vite + TypeScript |
|--------|--------------|------------------|
| `target` | 控制输出代码版本 | 仅用于类型检查 |
| `module` | 控制模块格式 | 仅用于类型检查 |
| `outDir` | 必需，输出目录 | 不需要，Vite 控制 |
| `declaration` | 需要配置 | 不需要，用 unplugin-dts |
| `sourceMap` | 需要配置 | 不需要，Vite 控制 |

### 3.2 编译选项详解

#### target

**作用**：设置编译后的 JavaScript 版本。

```json
{
  "compilerOptions": {
    "target": "ES2020"  // 或 "ES2015", "ES2018", "ESNext"
  }
}
```

**可选值对比**：

| 值 | 说明 | 使用场景 |
|------|------|----------|
| `"ES5"` | ES5 语法 | 需要兼容旧浏览器 |
| `"ES2015"` | ES6 语法 | 现代浏览器最低要求 |
| `"ES2020"` | ES2020 语法 | 推荐，现代浏览器 |
| `"ESNext"` | 最新特性 | 仅现代浏览器 |

#### module

**作用**：指定生成代码的模块系统。

```json
{
  "compilerOptions": {
    "module": "ESNext"  // 推荐用于库模式
  }
}
```

**常用值**：

| 值 | 说明 | 使用场景 |
|------|------|----------|
| `"CommonJS"` | CommonJS 模块 | Node.js 项目 |
| `"ESNext"` | ES Module | 现代库开发（推荐） |
| `"ES2020"` | ES2020 模块 | 与 Vite 配合使用 |

#### moduleResolution

**作用**：指定模块解析策略。

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"  // Vite/Rollup 项目推荐
  }
}
```

**可选值对比**：

| 值 | 说明 | 适用场景 |
|------|------|----------|
| `"node"` | Node.js 解析策略 | 传统 Node.js 项目 |
| `"node16"` | Node.js 16+ 策略 | 现代 Node.js |
| `"bundler"` | 打包工具策略 | Vite/Rollup（推荐） |

**影响对比**：

```typescript
// moduleResolution: "node"
import { foo } from 'package'  // 查找 node_modules/package/index.js

// moduleResolution: "bundler"
import { foo } from 'package'  // 支持 package.json exports 字段
```

#### declaration & declarationMap

**作用**：生成类型声明文件及其 source map。

```json
{
  "compilerOptions": {
    "declaration": true,        // 生成 .d.ts 文件
    "declarationMap": true,     // 生成 .d.ts.map 文件
    "emitDeclarationOnly": false // 同时生成 JS 和 .d.ts
  }
}
```

**影响对比**：

```bash
# declaration: false
dist/
  index.js        # 只有 JS 文件

# declaration: true, declarationMap: false
dist/
  index.js
  index.d.ts      # 类型声明文件

# declaration: true, declarationMap: true
dist/
  index.js
  index.d.ts
  index.d.ts.map  # 声明文件的 source map
```

#### strict 模式选项

**作用**：启用严格的类型检查。

```json
{
  "compilerOptions": {
    "strict": true,                    // 启用所有严格检查
    "noImplicitAny": true,             // 禁止隐式 any
    "strictNullChecks": true,          // 严格空值检查
    "strictFunctionTypes": true,       // 严格函数类型
    "strictBindCallApply": true,       // 严格 bind/call/apply
    "strictPropertyInitialization": true, // 严格属性初始化
    "noImplicitThis": true,            // 禁止隐式 this
    "alwaysStrict": true               // 始终使用严格模式
  }
}
```

**推荐做法**：

```json
// 组件库开发推荐配置
{
  "compilerOptions": {
    "strict": true,  // 启用所有严格检查（推荐）
    // 如果需要逐步迁移，可以单独配置
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

#### paths（路径别名）

**作用**：配置模块路径映射。

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

**使用效果**：

```typescript
// 使用前
import Button from '../../../components/Button.vue'

// 使用后
import Button from '@/components/Button.vue'
// 或
import Button from '@components/Button.vue'
```

**注意事项**：

:::warning 重要
`paths` 配置需要与 Vite 的 `resolve.alias` 保持一致：

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components')
    }
  }
})

// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```
:::

#### Vue 相关选项

**作用**：支持 Vue 3 单文件组件。

```json
{
  "compilerOptions": {
    // JSX 支持
    "jsx": "preserve",           // 保留 JSX 语法，由 Vue 处理
    "jsxImportSource": "vue",    // JSX 运行时来源

    // 或使用 React JSX（如果混用）
    // "jsx": "react-jsx",
    // "jsxImportSource": "react"
  }
}
```

**jsx 选项对比**：

| 值 | 说明 | 使用场景 |
|------|------|----------|
| `"preserve"` | 保留 JSX | Vue 项目（推荐） |
| `"react"` | 转换为 React.createElement | React 项目 |
| `"react-jsx"` | 转换为 _jsx | React 17+ |

### 3.3 完整推荐配置

#### Vite 库模式推荐配置（简化版）

```json
{
  "compilerOptions": {
    // 模块系统（仅影响类型检查）
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",

    // 严格模式（推荐全部启用）
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    // 路径别名
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    // Vue 支持
    "jsx": "preserve",
    "jsxImportSource": "vue",

    // 模块解析
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,

    // 其他
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

**配置说明**：

| 配置类别 | 说明 | 由谁处理 |
|---------|------|---------|
| 类型检查 | `strict`、`noUnusedLocals` 等 | TypeScript |
| 路径别名 | `baseUrl`、`paths` | TypeScript + Vite |
| 代码转换 | `target`、`module` | ✅ Vite（忽略 TS 设置） |
| 输出文件 | `outDir`、`sourceMap` | ✅ Vite（不需要在 TS 配置） |
| 类型声明 | `declaration` | ✅ unplugin-dts（不需要在 TS 配置） |

#### Monorepo 项目配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,

    // Monorepo 特定
    "composite": true,              // 启用项目引用
    "incremental": true,            // 增量编译（加快类型检查）

    // 路径映射（引用其他包）
    "baseUrl": ".",
    "paths": {
      "@mylib/core": ["../core/src"],
      "@mylib/utils": ["../utils/src"]
    },

    // 其他必需选项
    "jsx": "preserve",
    "jsxImportSource": "vue",
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"],

  // 引用其他项目
  "references": [
    { "path": "../core" },
    { "path": "../utils" }
  ]
}
```

### 3.4 最小化配置（快速开始）

如果你只是想快速开始，这是最精简的配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

**说明**：
- ✅ 足够用于大多数 Vue 3 + Vite 项目
- ✅ 启用严格模式保证代码质量
- ✅ 支持 Vue SFC 和 JSX
- ✅ 如需路径别名，添加 `baseUrl` 和 `paths`

### 3.5 常见配置问题

#### 问题 1：找不到模块

```typescript
// 错误：Cannot find module '@/components/Button' or its corresponding type declarations
import Button from '@/components/Button.vue'
```

**解决方案**：

```json
// tsconfig.json - 添加路径映射
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

```typescript
// vite.config.ts - 同步配置别名
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

#### 问题 2：Vue 文件类型错误

```typescript
// 错误：Cannot find module './App.vue' or its corresponding type declarations
import App from './App.vue'
```

**解决方案**：

```typescript
// src/env.d.ts - 添加 Vue 模块声明
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

#### 问题 3：JSX 语法错误

```typescript
// 错误：Cannot use JSX unless the '--jsx' flag is provided
const element = <div>Hello</div>
```

**解决方案**：

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue"
  }
}
```

## 四、完整配置示例

### 4.1 Vue 3 组件库基础配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'unplugin-dts/vite'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      outDirs: 'dist/types',          // 注意：官方接口使用 outDirs（复数）
      entryRoot: 'src',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      cleanVueFileName: true,
      copyDtsFiles: false             // 不复制源码中的 .d.ts
    })
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyComponentLib',
      formats: ['es', 'umd'],
      fileName: (format) => `my-lib.${format}.js`,
      cssFileName: 'index'            // CSS 文件名（不含扩展名）
    },

    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') return 'index.css'
          return assetInfo.name || 'assets/[name][extname]'
        },
        exports: 'named'                // 使用命名导出
      }
    },

    cssCodeSplit: false,
    sourcemap: true,
    outDir: 'dist'
  }
})
```

:::tip 配置说明
- **unplugin-dts 配置**：
  - 使用 `outDirs`（复数）根据官方 `CreateRuntimeOptions` 接口
  - `copyDtsFiles: false` 避免复制不必要的 .d.ts 文件

- **build.lib 配置**：
  - `cssFileName` 用于指定 CSS 输出名称
  - Vite 7.x 完全支持该配置

- **rollupOptions.output**：
  - `exports: 'named'` 使用命名导出模式
  - `assetFileNames` 自定义资源文件命名
:::

### 4.2 多入口配置

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'utils': resolve(__dirname, 'src/utils/index.ts'),
        'components': resolve(__dirname, 'src/components/index.ts')
      },
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', /^@vue\//]
    }
  }
})
```

## 五、package.json 配置

### 5.1 单入口库配置

```json
{
  "name": "my-component-lib",
  "version": "1.0.0",
  "type": "module",
  "description": "My Vue 3 Component Library",
  "main": "./dist/my-lib.umd.js",
  "module": "./dist/my-lib.es.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/my-lib.es.js",
      "require": "./dist/my-lib.umd.js"
    },
    "./style.css": "./dist/index.css"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "type-check": "vue-tsc --noEmit"
  },
  "peerDependencies": {
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "@vitejs/plugin-vue": "^6.0.0",
    "typescript": "^5.9.0",
    "unplugin-dts": "^1.0.0-beta.6",
    "vite": "^7.0.0",
    "vue": "^3.5.0",
    "vue-tsc": "^3.0.0"
  }
}
```

:::tip 版本说明（2025年最新）
- **Vite**: `^7.0.0` - 最新稳定版本
- **Vue**: `^3.5.0` - 最新稳定版本
- **@vitejs/plugin-vue**: `^6.0.0` - 配合 Vite 7.x
- **unplugin-dts**: `^1.0.0-beta.6` - 支持最新功能
- **TypeScript**: `^5.9.0` - 最新稳定版本
- **vue-tsc**: `^3.0.0` - Vue 3 类型检查工具
:::

### 5.2 exports 字段说明

| 字段 | 说明 |
|------|------|
| `types` | TypeScript 类型声明文件路径 |
| `import` | ES Module 导入路径 |
| `require` | CommonJS 导入路径 |

## 六、常见问题和最佳实践

### 6.1 依赖外部化策略

**推荐做法**：

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        // 框架和核心库（必须外部化）
        'vue',
        'vue-router',
        'pinia',

        // Vue 生态插件
        /^@vue\//,

        // UI 框架（如果使用）
        'element-plus',
        /^element-plus/
      ]
    }
  }
})
```

:::warning 重要提示
**为什么要外部化依赖**？
- ✅ 减小打包体积：避免将 Vue 等大型依赖打包进库
- ✅ 避免重复打包：使用库的项目可能已安装这些依赖
- ✅ 保持版本灵活：允许使用者选择依赖版本

**必须外部化的依赖**：
- 所有 `peerDependencies` 中的包
- 框架类库：`vue`, `react`, `angular` 等
- 大型 UI 框架：`element-plus`, `ant-design-vue` 等
:::

### 6.2 CSS 处理最佳实践

**推荐做法**：

```typescript
export default defineConfig({
  build: {
    cssCodeSplit: false,  // 将所有 CSS 合并到一个文件
    lib: {
      cssFileName: 'index'  // 自定义 CSS 文件名
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') return 'index.css'
          return assetInfo.name || 'assets/[name][extname]'
        }
      }
    }
  }
})
```

**在 package.json 中导出 CSS**：

```json
{
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/my-lib.es.js",
      "require": "./dist/my-lib.umd.js"
    },
    "./style.css": "./dist/index.css"
  }
}
```

**使用者导入方式**：

```typescript
// 导入组件
import { MyButton } from 'my-component-lib'

// 导入样式
import 'my-component-lib/style.css'
```

### 6.3 Tree Shaking 优化

**package.json 配置**：

```json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "*.vue"
  ]
}
```

**src/index.ts - 使用命名导出**：

```typescript
// ✅ 推荐：命名导出，支持 Tree Shaking
export { default as MyButton } from './components/MyButton.vue'
export { default as MyInput } from './components/MyInput.vue'

// ❌ 避免：默认导出整个对象
// export default {
//   MyButton,
//   MyInput
// }
```

**使用效果**：

```typescript
// 只会打包 MyButton，MyInput 会被 Tree Shaking 移除
import { MyButton } from 'my-component-lib'
```

### 6.4 常见配置错误

#### 错误 1：unplugin-dts 配置错误

```typescript
// ❌ 错误：使用了错误的属性名
dts({
  outputDir: 'dist/types'  // 错误！应该是 outDirs
})

// ✅ 正确：outDirs（根据官方 CreateRuntimeOptions 接口）
dts({
  outDirs: 'dist/types'
})
```

#### 错误 2：忘记外部化 Vue

```typescript
// ❌ 错误：未外部化 vue
export default defineConfig({
  build: {
    lib: { /* ... */ }
    // 缺少 rollupOptions.external
  }
})

// ✅ 正确：外部化 vue
export default defineConfig({
  build: {
    lib: { /* ... */ },
    rollupOptions: {
      external: ['vue']
    }
  }
})
```

#### 错误 3：package.json 缺少 types 字段

```json
// ❌ 错误：缺少 types
{
  "main": "./dist/my-lib.umd.js",
  "module": "./dist/my-lib.es.js"
}

// ✅ 正确：包含 types
{
  "main": "./dist/my-lib.umd.js",
  "module": "./dist/my-lib.es.js",
  "types": "./dist/types/index.d.ts"
}
```

## 七、真实项目完整配置（基于当前项目）

本节展示一个真实可用的 Vue 3 组件库配置，基于当前项目实践。

### 7.1 项目结构

```
vue-lib/
├── src/
│   ├── button/
│   │   ├── button.vue
│   │   ├── type.ts
│   │   └── index.ts
│   ├── input/
│   │   ├── input.vue
│   │   ├── type.ts
│   │   └── index.ts
│   ├── index.ts           # 主入口
│   └── env.d.ts           # 类型声明
├── demo/                  # 演示应用
│   ├── src/
│   └── package.json
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 7.2 vite.config.ts（当前项目配置）

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'unplugin-dts/vite'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      outDirs: 'dist/types',
      entryRoot: 'src',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      cleanVueFileName: true,
      copyDtsFiles: false
    })
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyComponentLib',
      formats: ['es', 'umd'],
      fileName: (format) => `my-lib.${format}.js`,
      cssFileName: 'index'
    },

    rollupOptions: {
      external: ['vue', 'element-plus'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') return 'index.css'
          return assetInfo.name || 'assets/[name][extname]'
        },
        exports: 'named'
      }
    },

    cssCodeSplit: false,
    sourcemap: true,
    outDir: 'dist'
  }
})
```

### 7.3 package.json（当前项目配置）

```json
{
  "name": "vue-lib",
  "version": "1.0.0",
  "type": "module",
  "description": "My Vue 3 Component Library",
  "main": "./dist/my-lib.umd.js",
  "module": "./dist/my-lib.es.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/my-lib.es.js",
      "require": "./dist/my-lib.umd.js"
    },
    "./style.css": "./dist/index.css"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "type-check": "vue-tsc --noEmit",
    "demo": "cd demo && pnpm dev",
    "demo:install": "cd demo && pnpm install"
  },
  "peerDependencies": {
    "vue": "^3.3.0",
    "element-plus": "^2.10.0"
  },
  "devDependencies": {
    "@types/node": "^24.10.1",
    "@vitejs/plugin-vue": "^6.0.2",
    "typescript": "^5.9.3",
    "unplugin-dts": "^1.0.0-beta.6",
    "vite": "^7.2.6",
    "vue": "^3.5.25",
    "vue-tsc": "^3.1.5",
    "element-plus": "^2.10.0"
  }
}
```

### 7.4 tsconfig.json（当前项目配置）

```json
{
  "compilerOptions": {
    // 模块系统（仅影响类型检查）
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",

    // 严格模式（推荐全部启用）
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    // 路径别名
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    // 模块解析
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,

    // 其他
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

### 7.5 src/index.ts（入口文件）

```typescript
// src/index.ts
export * from "./button"
export * from "./input"
```

### 7.6 构建输出

执行 `npm run build` 后的输出结构：

```
dist/
├── types/
│   ├── button/
│   │   ├── type.d.ts
│   │   └── index.d.ts
│   ├── input/
│   │   ├── type.d.ts
│   │   └── index.d.ts
│   └── index.d.ts
├── my-lib.es.js          # ES Module 格式
├── my-lib.es.js.map      # Source Map
├── my-lib.umd.js         # UMD 格式
├── my-lib.umd.js.map     # Source Map
└── index.css             # 样式文件
```

## 八、总结

### 必须配置的选项

1. **build.lib** - 启用库模式并配置入口
2. **build.rollupOptions.external** - 外部化依赖（避免打包 Vue 等）
3. **plugins** - Vue 插件和类型声明生成（unplugin-dts）
4. **package.json exports** - 正确的导出配置（支持 ESM/CJS）

### 推荐工作流

1. ✅ 使用 **Vite 7.x + TypeScript + Vue 3.5**
2. ✅ 配置 **unplugin-dts** 生成类型声明
3. ✅ 外部化 Vue 和主要依赖（通过 `external`）
4. ✅ 提供 **ES Module 和 UMD** 格式
5. ✅ 配置正确的 **package.json exports** 字段
6. ✅ 启用 **Tree Shaking** 支持（命名导出 + sideEffects）
7. ✅ 使用 **demo 应用**测试组件库

### 常用命令

```bash
# 开发模式（开发组件）
npm run dev

# 类型检查
npm run type-check

# 构建库
npm run build

# 运行演示应用
npm run demo

# 发布到 npm
npm publish
```

### 版本兼容性（2025年推荐）

| 依赖 | 推荐版本 | 说明 |
|------|---------|------|
| Vite | `^7.0.0` | 最新稳定版本，性能最优 |
| Vue | `^3.5.0` | 最新 Vue 3 版本 |
| @vitejs/plugin-vue | `^6.0.0` | 配合 Vite 7.x |
| unplugin-dts | `^1.0.0-beta.6` | 最新类型生成插件 |
| TypeScript | `^5.9.0` | 最新 TS 稳定版 |
| vue-tsc | `^3.0.0` | Vue 类型检查工具 |

### 核心配置要点

1. **unplugin-dts 配置**：
   - 使用 `outDirs`（复数，根据官方 `CreateRuntimeOptions` 接口）
   - 设置 `copyDtsFiles: false` 避免复制不必要文件
   - 支持数组形式输出到多个目录：`outDirs: ['dist/types', 'lib/types']`

2. **Vite build 配置**：
   - `cssFileName` 指定 CSS 输出名称
   - `cssCodeSplit: false` 合并所有 CSS
   - `sourcemap: true` 生成 Source Map

3. **Rollup 配置**：
   - `external` 外部化所有 peer dependencies
   - `exports: 'named'` 使用命名导出模式
   - `globals` 为 UMD 格式提供全局变量映射

## 九、参考资源

### 官方文档

- [Vite 官方文档](https://vitejs.dev/) - Vite 完整文档
- [Vite 库模式指南](https://vitejs.dev/guide/build.html#library-mode) - 库模式详细说明
- [Vite 配置参考](https://vitejs.dev/config/) - 完整配置选项
- [Vue 3 官方文档](https://vuejs.org/) - Vue 3 框架文档
- [TypeScript 官方文档](https://www.typescriptlang.org/) - TypeScript 语言文档

### 插件和工具

- [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) - Vue SFC 支持
- [unplugin-dts](https://github.com/qmhc/unplugin-dts) - TypeScript 类型声明生成
- [vue-tsc](https://github.com/vuejs/language-tools/tree/master/packages/tsc) - Vue 类型检查工具
- [Rollup 配置选项](https://rollupjs.org/configuration-options/) - Rollup 打包配置

### 相关资源

- [Vite 插件开发指南](https://vitejs.dev/guide/api-plugin.html)
- [npm package.json 字段说明](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [Node.js ESM 支持](https://nodejs.org/api/esm.html)

### 本文档更新

- **更新日期**：2025-12-04
- **基于版本**：Vite 7.x, Vue 3.5, TypeScript 5.9
- **文档状态**：✅ 已更新至最新版本
- **项目地址**：[https://github.com/BINGWU2003/vue-lib](https://github.com/BINGWU2003/vue-lib)

---

**总结**：本文档提供了完整的 Vue 3 + TypeScript 组件库 Vite 打包配置指南，涵盖从基础配置到真实项目实践的所有内容。通过遵循本文档的最佳实践，你可以快速构建一个现代化、高性能的 Vue 组件库。

**完整示例代码**：所有配置和代码示例均可在 [GitHub 仓库](https://github.com/BINGWU2003/vue-lib) 中查看和运行。


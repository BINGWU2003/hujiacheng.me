---
title: TypeScript 类型打包配置指南
date: 2025-09-18
duration: 310in
art: random
---

[[toc]]

本文档详细介绍如何在 Vite + TypeScript 项目中配置类型声明文件的打包和导出。

## 概述

在构建 TypeScript 库时，除了打包 JavaScript 代码，我们还需要生成并导出类型声明文件（`.d.ts`），以便其他项目在使用我们的库时能够获得完整的类型支持。

## 配置步骤

### 1. 安装必要依赖

首先需要安装 `vite-plugin-dts` 插件：

```bash
# 在项目根目录安装（推荐）
pnpm add vite-plugin-dts -D -w

# 或者在具体包目录下安装
pnpm add vite-plugin-dts -D
```

### 2. 配置 TypeScript 编译选项

在项目根目录的 `tsconfig.json` 中添加类型声明相关配置：

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "sourceMap": true,
    "target": "es2016",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": false,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "jsx": "preserve",
    "lib": ["esnext", "dom"],
    "declaration": true, // 生成类型声明文件
    "declarationMap": true, // 生成声明文件的sourcemap
    "baseUrl": ".",
    "paths": {
      "@vue/*": ["packages/*/src"]
    }
  }
}
```

关键配置项说明（使用`tsc`编译， 需要在`tsconfig.json`中配置）：

- `declaration: true` - 启用生成类型声明文件
- `declarationMap: true` - 生成声明文件的 source map，便于调试

## TypeScript 编译器 vs Vite 插件的区别

### 使用 TypeScript 编译器 (tsc) 生成类型文件

当使用 `tsc` 命令直接编译时，类型声明文件的生成完全依赖 `tsconfig.json` 中的配置：

```json
{
  "compilerOptions": {
    "declaration": true, // 必须设置为 true
    "declarationMap": true, // 可选，生成 .d.ts.map 文件
    "outDir": "dist", // 输出目录
    "rootDir": "src" // 源码根目录
  }
}
```

**特点：**

- **完全依赖 tsconfig.json**：所有配置都在 TypeScript 配置文件中
- **输出结构固定**：严格按照 `outDir` 和 `rootDir` 的相对关系生成
- **处理范围广**：处理 `include` 中指定的所有 TypeScript 文件
- **构建命令**：`tsc` 或 `tsc --build`

**示例输出结构：**

```
src/
├── index.ts
├── utils/
│   └── helper.ts
└── types/
    └── user.ts

dist/ (使用 tsc)
├── index.d.ts
├── index.d.ts.map
├── utils/
│   ├── helper.d.ts
│   └── helper.d.ts.map
└── types/
    ├── user.d.ts
    └── user.d.ts.map
```

### 使用 Vite 插件 (vite-plugin-dts) 生成类型文件

[插件文档](https://github.com/qmhc/unplugin-dts?tab=readme-ov-file#readme)

当使用 `vite-plugin-dts` 时，插件会接管类型声明文件的生成过程：

```typescript
// vite.config.ts
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*', 'index.ts'],
      outDir: 'dist',
      // 插件特有的配置选项
    }),
  ],
})
```

**特点：**

- **插件控制生成**：类型文件生成由插件管理，不完全依赖 tsconfig.json
- **灵活的输出控制**：可以通过插件选项精确控制输出
- **与构建集成**：与 Vite 构建流程深度集成
- **额外功能**：提供 `insertTypesEntry` 等便利功能

### 核心区别对比

| 方面                    | TypeScript 编译器 (tsc)                         | Vite 插件 (vite-plugin-dts)              |
| ----------------------- | ----------------------------------------------- | ---------------------------------------- |
| **配置位置**            | 完全在 `tsconfig.json`                          | 主要在 `vite.config.ts`                  |
| **declaration 设置**    | 必须在 tsconfig.json 中设置 `declaration: true` | 插件内部处理，tsconfig.json 中可以不设置 |
| **declarationMap 设置** | 在 tsconfig.json 中设置 `declarationMap: true`  | 插件选项中控制                           |
| **输出控制**            | 受限于 TypeScript 编译器规则                    | 更灵活，可自定义处理                     |
| **文件包含**            | 基于 tsconfig.json 的 include/exclude           | 插件的 include/exclude 选项              |
| **构建集成**            | 独立的编译步骤                                  | 与 Vite 构建流程集成                     |
| **package.json 管理**   | 需要手动维护 types 字段                         | 可自动插入 types 字段                    |

### 实际使用场景的配置差异

#### 场景1：纯 TypeScript 编译

```json
// tsconfig.json
{
  "compilerOptions": {
    "declaration": true, // 必需
    "declarationMap": true, // 必需
    "outDir": "dist"
  }
}
```

```bash
# 构建命令
tsc
```

#### 场景2：Vite + vite-plugin-dts

```json
// tsconfig.json - 可以不设置 declaration 相关选项
{
  "compilerOptions": {
    "outDir": "dist"
    // declaration: true,     // 可选，插件会处理
    // declarationMap: true   // 可选，插件会处理
  }
}
```

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*', 'index.ts'],
      outDir: 'dist',
    }),
  ],
})
```

```bash
# 构建命令
vite build
```

### 推荐的配置策略

**对于 Vite 项目（推荐）：**

1. **tsconfig.json 保持简洁**：

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "target": "es2016",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": false
    // 不需要设置 declaration 和 declarationMap
  }
}
```

2. **vite.config.ts 中完整配置**：

```typescript
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true, // 自动管理 package.json
      include: ['src/**/*', 'index.ts'],
      outDir: 'dist',
      // 插件会自动处理 declaration 和 declarationMap
    }),
  ],
})
```

**优势：**

- 配置更集中，易于维护
- 与构建流程深度集成
- 自动化程度更高
- 更好的错误处理和调试信息

### 3. 配置 Vite 构建

在包的 `vite.config.ts` 中配置 `vite-plugin-dts` 插件（使用`vite`打包）：

```typescript
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true, // 自动插入类型入口文件
      include: ['src/**/*', 'index.ts'], // 包含的文件
      outDir: 'dist', // 输出目录
    }),
  ],
  build: {
    lib: {
      entry: ['index.ts'],
      fileName: (format, entryName) => `my-app-vite-${entryName}.${format}.js`,
      cssFileName: 'my-app-vite-style',
      formats: ['es'],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
})
```

`vite-plugin-dts` 配置选项说明：

- `insertTypesEntry` - 自动在 package.json 中插入 types 字段
  - 设置为 `true` 时，构建完成后会自动在 package.json 中添加或更新 `types` 字段
  - 避免手动维护 types 字段路径，减少配置错误的可能性
  - 推荐使用此选项，让插件自动管理类型声明文件的入口
- `include` - 指定要处理的文件模式，详细说明如下：

  **配置语法：**
  - `'src/**/*'` - 包含 src 目录及其所有子目录中的所有文件
    - `src/` 表示 src 目录
    - `**` 表示匹配任意深度的子目录（0 层或多层）
    - `*` 表示匹配任意文件名和扩展名
  - `'index.ts'` - 包含根目录下的 index.ts 文件

  **实际作用：**
  - **扫描范围控制**：只处理指定模式匹配的 TypeScript 文件
  - **类型生成**：为匹配的文件生成对应的 `.d.ts` 类型声明文件
  - **性能优化**：避免处理不必要的文件，提高构建速度
  - **输出结构**：保持与源码相同的目录结构生成类型文件

  **使用场景：**
  - 库的入口文件（如 `index.ts`）必须包含，用于导出主要 API
  - 源码目录（如 `src/**/*`）包含所有业务逻辑和类型定义
  - 排除测试文件、配置文件等不需要生成类型声明的文件

  **示例效果：**

  ```
  输入文件：
  ├── index.ts
  ├── src/
  │   ├── utils1.ts
  │   ├── utils2.ts
  │   └── types/
  │       └── types1.ts

  生成的类型文件：
  ├── dist/
  │   ├── index.d.ts
  │   ├── utils1.d.ts
  │   ├── utils2.d.ts
  │   └── types/
  │       └── types1.d.ts
  ```

- `outDir` - 类型声明文件输出目录
- `exclude` - 排除不需要处理的文件（可选）

### 4. 配置 package.json

在包的 `package.json` 中添加类型相关字段。根据是否使用 `insertTypesEntry` 自动插入，有两种配置方式：

#### 方式一：使用 insertTypesEntry 自动管理（推荐）

当 `vite.config.ts` 中设置了 `insertTypesEntry: true` 时，**不需要**手动添加 `types` 字段：

```json
{
  "name": "@vue/my-app-vite",
  "version": "1.0.0",
  "main": "dist/my-app-vite-index.es.js",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/my-app-vite-index.es.js"
    }
  },
  "scripts": {
    "build": "vite build"
  },
  "devDependencies": {
    "vite": "^7.1.4",
    "vite-plugin-dts": "^4.3.0"
  }
}
```

构建完成后，插件会自动添加 `types` 字段：

```json
{
  "name": "@vue/my-app-vite",
  "types": "dist/index.d.ts" // 这一行会被自动添加
  // ... 其他配置
}
```

#### 方式二：手动管理 types 字段

如果不使用 `insertTypesEntry` 或设置为 `false`，需要手动添加：

```json
{
  "name": "@vue/my-app-vite",
  "version": "1.0.0",
  "main": "dist/my-app-vite-index.es.js",
  "types": "dist/index.d.ts", // 手动添加
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/my-app-vite-index.es.js"
    }
  },
  "scripts": {
    "build": "vite build"
  },
  "devDependencies": {
    "vite": "^7.1.4",
    "vite-plugin-dts": "^4.3.0"
  }
}
```

#### 配置说明

**两种方式的区别：**

| 配置项       | 方式一（自动管理）   | 方式二（手动管理）         |
| ------------ | -------------------- | -------------------------- |
| `types` 字段 | 构建时自动添加       | 需要手动维护               |
| 维护成本     | 低，无需关心路径变化 | 高，路径变化时需要手动更新 |
| 错误风险     | 低，插件确保路径正确 | 高，可能出现路径不匹配     |
| 推荐程度     | ✅ 推荐              | ❌ 不推荐                  |

**关键字段说明：**

- `types` - 指向主要的类型声明文件（自动管理时无需手动添加）
- `exports.types` - 在 exports 字段中指定类型声明文件路径（仍需手动维护）
- `exports.import` - 指定 ES 模块的入口文件

**注意事项：**

1. **exports 字段**：即使使用 `insertTypesEntry: true`，`exports` 中的 `types` 字段仍需手动维护
2. **构建顺序**：使用自动插入时，`types` 字段在构建完成后才会出现
3. **版本控制**：构建后的 `package.json` 变更需要正确提交到版本控制系统

## 项目结构示例

```
packages/my-app-vite/
├── src/
│   ├── types/
│   │   └── types1.ts        # 类型定义文件
│   ├── utils1.ts
│   ├── utils2.ts
│   └── utils3.ts
├── index.ts                 # 主入口文件
├── package.json
├── vite.config.ts
└── dist/                    # 构建输出目录
    ├── index.d.ts          # 主类型声明文件
    ├── index.d.ts.map      # 类型声明文件的 source map
    ├── types/
    │   └── types1.d.ts     # 各个模块的类型声明文件
    └── my-app-vite-index.es.js  # JavaScript 输出文件
```

## 类型文件示例

### 类型定义文件 (`src/types/types1.ts`)

```typescript
interface User {
  name: string
  age: number
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  country: string
}

export type { User }
```

### 主入口文件 (`index.ts`)

```typescript
export * from './src/utils1'
export * from './src/utils2'
export * from './src/utils3'
export * from './src/types/types1'
```

## 构建和测试

### 构建项目

```bash
# 在项目根目录下构建特定包
pnpm --filter @vue/my-app-vite build

# 或者进入包目录构建
cd packages/my-app-vite
pnpm build
```

### 验证类型导出

构建完成后，检查 `dist` 目录是否生成了以下文件：

- `index.d.ts` - 主类型声明文件
- `index.d.ts.map` - 类型声明文件的 source map
- 各个模块对应的 `.d.ts` 文件

### 在其他项目中使用

```typescript
// 安装包
pnpm add @vue/my-app-vite

// 使用时会自动获得类型支持
import type { User } from '@vue/my-app-vite'

const user: User = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
  // ... 其他属性
}
```

## 常见问题和解决方案

### 1. 构建时找不到 vite-plugin-dts

**错误信息：**

```
Cannot find package 'vite-plugin-dts'
```

**解决方案：**
确保在正确的目录安装了依赖：

```bash
# 在包目录下安装
cd packages/my-app-vite
pnpm add vite-plugin-dts -D

# 或在根目录安装到 workspace
pnpm add vite-plugin-dts -D -w
```

### 2. 类型声明文件路径不正确

**问题：** 生成的类型文件路径与 package.json 中配置的不匹配

**解决方案：**

- 确保 `vite.config.ts` 中的 `outDir` 与 `package.json` 中的 `types` 字段路径一致
- 检查 `dts` 插件的 `include` 配置是否正确

### 3. 类型声明文件不完整

**问题：** 某些类型没有被导出到声明文件中

**解决方案：**

- 确保在主入口文件 `index.ts` 中正确导出了所有类型
- 检查 `tsconfig.json` 中的 `include` 和 `exclude` 配置
- 确保类型文件使用了 `export` 语句

## 高级配置

### 多入口点配置

如果你的库有多个入口点，可以这样配置：

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*', 'index.ts', 'utils.ts'],
      outDir: 'dist',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'index.ts',
        utils: 'utils.ts',
      },
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      formats: ['es'],
    },
  },
})
```

对应的 package.json：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.es.js"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.es.js"
    }
  }
}
```

### 自定义类型声明处理

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*', 'index.ts'],
      outDir: 'dist',
      beforeWriteFile: (filePath, content) => {
        // 在写入文件前自定义处理
        return {
          filePath: filePath.replace(/src\//, ''),
          content,
        }
      },
    }),
  ],
})
```

## 最佳实践

1. **统一配置管理：** 在 monorepo 中，建议在根目录配置 TypeScript 和依赖，各个包共享配置

2. **类型文件组织：** 将类型定义集中在 `types` 目录下，便于管理和维护

3. **版本控制：** 将生成的 `dist` 目录添加到 `.gitignore`，只在发布时构建

4. **持续集成：** 在 CI/CD 中添加类型检查步骤，确保类型声明文件的正确性

5. **文档维护：** 为导出的类型添加 JSDoc 注释，提供更好的开发体验

## 总结

通过以上配置，你的 TypeScript 库就能正确地生成和导出类型声明文件了。用户在安装和使用你的库时，将获得完整的类型支持和 IntelliSense 体验。

记住定期更新依赖版本，并在每次发布前验证类型声明文件的正确性。

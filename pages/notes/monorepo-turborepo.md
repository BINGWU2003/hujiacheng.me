---
title: monorepo + turborepo 搭建项目
date: 2025-11-27
duration: 60min
type: notes
art: random
---

[[toc]]

:::tip 版本说明
本文档基于以下版本编写：

**核心工具版本**：
- **Turborepo**: v2.6.1 (2024 年 11 月发布)
- **pnpm**: v9.15.0 (2024 年 12 月发布)
- **Node.js**: 18.0.0+ (推荐 20.18.1 LTS)

**重要里程碑**：
- ✅ **Turborepo 2.0** (2024-06-04)：新终端 UI、Watch 模式、MIT 许可证
- ✅ **Turborepo 2.1** (2024-07)：改进的任务依赖和缓存
- ✅ **Turborepo 2.4** (2024-09)：性能优化和稳定性改进
- ✅ **Turborepo 2.6** (2024-11)：最新稳定版本

**配置变更（v1.x → v2.x）**：
- 🔄 `pipeline` → `tasks`：配置键名变更
- 🔄 `$schema` URL 更新为 v2
- ⚠️ **必须配置** `packageManager` 字段
- ✅ 环境变量配置稳定化
:::

:::warning 注意事项
- **Turborepo 2.x** 相比 1.x 有重大变更，建议新项目直接使用 2.x
- **packageManager 字段**：Turborepo 2.0+ 要求在根 package.json 中定义（如 `"packageManager": "pnpm@9.15.0"`）
- **迁移工具**：可使用 `npx @turbo/codemod migrate` 自动迁移 1.x 配置到 2.x
- **pnpm 9.x**：引入了新的依赖解析算法，性能更优
:::

## 什么是 Monorepo

Monorepo（Monolithic Repository）是一种项目管理策略，将多个相关的项目或包存放在同一个代码仓库中。

### 传统项目结构（Multi-repo）

```
organization/
├── project-a/        (独立仓库)
│   ├── .git/
│   └── package.json
├── project-b/        (独立仓库)
│   ├── .git/
│   └── package.json
└── project-c/        (独立仓库)
    ├── .git/
    └── package.json
```

### Monorepo 项目结构

```
my-monorepo/
├── .git/             (单一仓库)
├── package.json      (根配置)
├── packages/
│   ├── package-a/
│   │   └── package.json
│   ├── package-b/
│   │   └── package.json
│   └── package-c/
│       └── package.json
```

### Monorepo 的优势

**✅ 优点**：

1. **代码共享**：包之间可以直接引用，无需发布到 npm
2. **统一管理**：统一的依赖版本、构建配置、代码规范
3. **原子提交**：跨包的修改可以在一次提交中完成
4. **重构便利**：重构影响多个包时更容易追踪和测试
5. **协作效率**：团队成员可以看到完整的项目代码

**❌ 缺点**：

1. **仓库体积**：随着项目增多，仓库会变得很大
2. **权限控制**：难以对不同包设置不同的访问权限
3. **CI/CD 复杂**：需要智能构建，避免每次都构建所有包
4. **学习成本**：需要了解 Monorepo 工具和工作流

### 适用场景

**适合使用 Monorepo**：

- 组件库 + 文档站点
- 前端应用 + 后端 API
- 多个相互依赖的包
- 微前端架构
- 共享工具库的多个应用

**不适合使用 Monorepo**：

- 完全独立的项目
- 团队规模很小（1-2人）
- 没有代码共享需求

## 技术选型

### 1. npm workspaces

**特点**：
- ✅ npm 7+ 原生支持，无需额外工具
- ✅ 简单易用，适合小型项目
- ❌ 功能相对基础

**适用场景**：小型 Monorepo，简单的依赖管理

### 2. pnpm workspaces

**特点**：
- ✅ 节省磁盘空间（硬链接）
- ✅ 安装速度快
- ✅ 严格的依赖隔离
- ✅ 功能完善

**适用场景**：推荐首选，适合各种规模的项目

### 3. Yarn workspaces

**特点**：
- ✅ 成熟稳定
- ✅ 功能丰富
- ❌ Yarn 1 和 Yarn 2+ 差异较大

**适用场景**：已使用 Yarn 的项目

### 4. Lerna

**特点**：
- ✅ 老牌 Monorepo 工具
- ✅ 提供版本管理和发布功能
- ⚠️  维护不太活跃

**适用场景**：需要独立版本管理的多包项目

### 5. Turborepo

**特点**：
- ✅ 智能任务缓存
- ✅ 并行构建优化
- ✅ 远程缓存
- ❌ 需要学习配置

**适用场景**：大型项目，需要构建优化

### 6. Nx

**特点**：
- ✅ 功能最强大
- ✅ 可视化依赖图
- ✅ 智能构建
- ❌ 学习曲线陡峭

**适用场景**：企业级大型项目

### 推荐方案

| 项目规模 | 推荐方案 | 理由 |
|---------|---------|------|
| 小型（2-5个包） | **pnpm workspaces** | 简单快速，功能够用 |
| 中型（5-10个包） | **pnpm + Turborepo** | 构建优化，提高效率 |
| 大型（10+个包） | **pnpm + Nx** | 完整的工具链和优化 |

**本文将使用 pnpm workspaces + Turborepo 作为示例**。

## 准备工作

### 1. 安装 Node.js

```bash
# 检查版本
node -v  # 需要 v18.0.0 或更高
npm -v   # 需要 v9.0.0 或更高
```

如果版本不够，请访问 [nodejs.org](https://nodejs.org/) 下载最新版本。

### 2. 安装 pnpm

```bash
# 通过 npm 安装
npm install -g pnpm

# 检查版本
pnpm -v  # 需要 v8.0.0 或更高
```

### 3. 创建项目目录

```bash
# 创建并进入项目目录
mkdir my-monorepo
cd my-monorepo

# 初始化 Git
git init

# 创建 .gitignore
cat > .gitignore << EOF
node_modules
dist
.DS_Store
*.log
.turbo
.env.local
EOF
```

## 第一步：初始化根目录

### 1.1 创建 package.json

```bash
pnpm init
```

编辑 `package.json`：

```json
{
  "name": "my-monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "My awesome monorepo project",
  "scripts": {
    "dev": "pnpm --parallel --recursive run dev",
    "build": "pnpm --recursive run build",
    "lint": "pnpm --recursive run lint",
    "test": "pnpm --recursive run test",
    "clean": "pnpm --recursive run clean && rm -rf node_modules"
  },
  "keywords": ["monorepo"],
  "author": "Your Name",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

**说明**：
- `"private": true` - 防止根目录被发布到 npm
- `--recursive` - 在所有子包中执行命令
- `--parallel` - 并行执行（适合开发模式）

### 1.2 配置 pnpm workspace

创建 `pnpm-workspace.yaml`：

```yaml
packages:
  # 所有在 packages 目录下的包
  - 'packages/*'
  # 所有在 apps 目录下的应用
  - 'apps/*'
  # 排除测试目录
  - '!**/test/**'
  - '!**/node_modules/**'
```

**配置说明**：
- ✅ `packages/*` - 通常存放可复用的包（库、组件、工具）
- ✅ `apps/*` - 通常存放应用程序（网站、服务）
- ✅ `!**/test/**` - 排除测试目录（避免作为独立包）
- ✅ `!**/node_modules/**` - 排除依赖目录

**高级配置示例**：

```yaml
packages:
  # 精确匹配单个包
  - 'my-app'

  # packages 目录下的直接子目录
  - 'packages/*'

  # packages 目录下的所有子目录（递归）
  - 'packages/**'

  # 多个目录
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'

  # 排除模式
  - '!**/test/**'
  - '!**/*.test.ts'
  - '!**/node_modules/**'
```

**pnpm 9.x 新特性**：

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'

# catalog（pnpm 9.0+）：统一管理依赖版本
catalog:
  react: ^18.3.0
  typescript: ^5.3.3
  vite: ^5.0.0
```

使用 catalog：

```json
{
  "dependencies": {
    "react": "catalog:",
    "typescript": "catalog:"
  }
}
```

### 1.3 创建目录结构

```bash
# 创建目录
mkdir -p packages apps

# 创建基础结构
mkdir -p packages/shared
mkdir -p packages/ui
mkdir -p apps/web
mkdir -p apps/docs
```

**最终结构**：

```
my-monorepo/
├── .git/
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── packages/          # 共享包
│   ├── shared/        # 共享工具
│   └── ui/            # UI 组件库
└── apps/              # 应用
    ├── web/           # 主应用
    └── docs/          # 文档站点
```

## 第二步：创建共享包

### 2.1 创建 shared 包

```bash
cd packages/shared
pnpm init
```

编辑 `packages/shared/package.json`：

```json
{
  "name": "@my-monorepo/shared",
  "version": "1.0.0",
  "description": "Shared utilities and helpers",
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
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "tsup src/index.ts --watch --format cjs,esm --dts",
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.3.3"
  }
}
```

创建源代码 `packages/shared/src/index.ts`：

```typescript
/**
 * 格式化日期
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN');
}

/**
 * 延迟函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 生成随机ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
```

创建 `packages/shared/tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 2.2 创建 UI 组件库

```bash
cd ../../packages/ui
pnpm init
```

编辑 `packages/ui/package.json`：

```json
{
  "name": "@my-monorepo/ui",
  "version": "1.0.0",
  "description": "Shared UI components",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./style.css": "./dist/style.css"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "tsup src/index.ts --watch --format cjs,esm --dts",
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@my-monorepo/shared": "workspace:*"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.3.3"
  }
}
```

**注意**：`"@my-monorepo/shared": "workspace:*"` 表示引用本地 workspace 中的包。

创建组件 `packages/ui/src/Button.ts`：

```typescript
import { generateId } from '@my-monorepo/shared';

export interface ButtonProps {
  text: string;
  onClick?: () => void;
}

export class Button {
  private id: string;
  private element: HTMLButtonElement;

  constructor(props: ButtonProps) {
    this.id = generateId();
    this.element = document.createElement('button');
    this.element.textContent = props.text;
    this.element.id = this.id;

    if (props.onClick) {
      this.element.addEventListener('click', props.onClick);
    }
  }

  render(container: HTMLElement): void {
    container.appendChild(this.element);
  }
}
```

创建入口 `packages/ui/src/index.ts`：

```typescript
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

创建 `packages/ui/tsconfig.json`：

```json
{
  "extends": "../shared/tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2020", "DOM"],
    "rootDir": "./src"
  }
}
```

### 2.3 安装依赖

回到根目录：

```bash
cd ../..

# 安装所有依赖
pnpm install
```

## 第三步：创建应用

### 3.1 创建 Web 应用（Vite + Vue 3）

```bash
cd apps/web

# 使用 Vite 创建 Vue 3 项目
pnpm create vite . --template vue-ts
```

编辑 `apps/web/package.json`：

```json
{
  "name": "@my-monorepo/web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "@my-monorepo/shared": "workspace:*",
    "@my-monorepo/ui": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0"
  }
}
```

编辑 `apps/web/vite.config.ts`：

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  }
});
```

创建示例页面 `apps/web/src/App.vue`：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { formatDate, generateId } from '@my-monorepo/shared';

const currentDate = ref('');
const uniqueId = ref('');

onMounted(() => {
  currentDate.value = formatDate(new Date());
  uniqueId.value = generateId();
});
</script>

<template>
  <div class="app">
    <h1>My Monorepo Web App</h1>
    <p>Current Date: {{ currentDate }}</p>
    <p>Unique ID: {{ uniqueId }}</p>
  </div>
</template>

<style scoped>
.app {
  padding: 2rem;
  font-family: sans-serif;
}

h1 {
  color: #42b883;
}
</style>
```

### 3.2 创建文档站点（VitePress）

```bash
cd ../docs

# 初始化 VitePress
pnpm init
pnpm add -D vitepress vue
```

编辑 `apps/docs/package.json`：

```json
{
  "name": "@my-monorepo/docs",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview"
  },
  "devDependencies": {
    "vitepress": "^1.0.0",
    "vue": "^3.4.0"
  }
}
```

创建 `apps/docs/.vitepress/config.ts`：

```typescript
import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'My Monorepo Docs',
  description: 'Documentation for my monorepo project',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/' },
          { text: 'Shared Utils', link: '/guide/shared' },
          { text: 'UI Components', link: '/guide/ui' }
        ]
      }
    ]
  }
});
```

创建 `apps/docs/index.md`：

```markdown
---
layout: home
title: Home
---

# My Monorepo

Welcome to the documentation!

## Features

- 🚀 Fast and efficient
- 📦 Well organized
- 🛠️ Easy to maintain
```

创建 `apps/docs/guide/index.md`：

```markdown
# Getting Started

This is a monorepo project built with pnpm workspaces.

## Installation

\`\`\`bash
pnpm install
\`\`\`

## Development

\`\`\`bash
pnpm dev
\`\`\`
```

### 3.3 回到根目录安装依赖

```bash
cd ../..
pnpm install
```

## 第四步：配置 Turborepo

### 4.1 安装 Turborepo

```bash
pnpm add -D turbo
```

### 4.2 创建 turbo.json

在根目录创建 `turbo.json`（**Turborepo 2.x 语法**）：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

**Turborepo 2.x 配置说明**：
- ✅ `tasks` 替代了 v1.x 的 `pipeline`
- ✅ `ui: "tui"` - 启用新的终端 UI（v2.0 新特性）
- ✅ `dependsOn: ["^build"]` - `^` 表示先构建上游依赖的包
- ✅ `outputs` - 指定缓存的输出目录，支持排除模式（`!` 前缀）
- ✅ `cache: false` - 禁用缓存（适用于 dev 和 clean）
- ✅ `persistent: true` - 标记为持续运行的任务（如 dev server）

**v1.x → v2.x 迁移**：

```json
// ❌ Turborepo 1.x（旧语法）
{
  "pipeline": {
    "build": { ... }
  }
}

// ✅ Turborepo 2.x（新语法）
{
  "tasks": {
    "build": { ... }
  }
}
```

**自动迁移命令**：

```bash
# 自动迁移配置到 Turborepo 2.x
npx @turbo/codemod migrate

# 单独迁移特定项
npx @turbo/codemod update-schema-json-url    # 更新 schema URL
npx @turbo/codemod migrate-dot-env            # 迁移 dotEnv 配置
npx @turbo/codemod migrate-env-var-dependencies  # 迁移环境变量依赖
```

### 4.3 更新根目录脚本

编辑根目录 `package.json`（**Turborepo 2.x 要求**）：

```json
{
  "name": "my-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules .turbo"
  },
  "devDependencies": {
    "turbo": "^2.6.1"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

**重要配置项**：

- ✅ **`packageManager`**（**Turborepo 2.0+ 必需**）：指定包管理器和精确版本
  - 格式：`"<manager>@<version>"`
  - 示例：`"pnpm@9.15.0"` 或 `"npm@10.9.2"`
  - **作用**：确保团队使用相同的包管理器版本，提高构建一致性

- ✅ **`turbo: "^2.6.1"`**：使用 Turborepo 2.x 最新稳定版
  - v2.0+：新 UI、Watch 模式、MIT 许可证
  - v2.6.1：最新性能优化和 bug 修复

- ✅ **`engines`**：指定运行环境要求
  - Node.js 18+ 是 Turborepo 2.x 推荐版本
  - pnpm 9.0+ 支持最新特性
```

## 第五步：配置代码规范

### 5.1 安装 ESLint 和 Prettier

```bash
pnpm add -D eslint prettier \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-config-prettier \
  eslint-plugin-prettier
```

### 5.2 创建 .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }]
  }
};
```

### 5.3 创建 .prettierrc.json

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5",
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 5.4 创建 .eslintignore 和 .prettierignore

```bash
cat > .eslintignore << EOF
node_modules
dist
.turbo
*.config.js
*.config.ts
EOF

cp .eslintignore .prettierignore
```

### 5.5 添加 lint 脚本

在各个包的 `package.json` 中添加：

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx,.vue"
  }
}
```

## 第六步：配置 Git Hooks

### 6.1 安装 Husky 和 lint-staged

```bash
pnpm add -D husky lint-staged
npx husky init
```

### 6.2 配置 lint-staged

在根目录 `package.json` 中添加：

```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

### 6.3 配置 pre-commit hook

编辑 `.husky/pre-commit`：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

## 第七步：配置 TypeScript

### 7.1 创建根目录 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### 7.2 各包继承根配置

在`packages`的 `tsconfig.json` 中：

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "moduleResolution": "bundler",
    "lib": [
      "ES2020",
      "DOM"
    ]
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

## 第八步：测试和构建

### 8.1 构建所有包

```bash
# 构建 shared 包
cd packages/shared
pnpm build

# 构建 ui 包
cd ../ui
pnpm build

# 回到根目录
cd ../..
```

### 8.2 启动开发服务器

```bash
# 启动所有 dev 服务器
pnpm dev

# 或单独启动
pnpm --filter @my-monorepo/web dev
pnpm --filter @my-monorepo/docs dev
```

访问：
- Web 应用：http://localhost:3000
- 文档站点：http://localhost:5173

### 8.3 构建所有项目

```bash
pnpm build
```

## 完整目录结构

```
my-monorepo/
├── .git/
├── .gitignore
├── .eslintrc.cjs
├── .eslintignore
├── .prettierrc.json
├── .prettierignore
├── .husky/
│   └── pre-commit
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
├── tsconfig.json
├── packages/
│   ├── shared/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── dist/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── ui/
│       ├── src/
│       │   ├── Button.ts
│       │   └── index.ts
│       ├── dist/
│       ├── package.json
│       └── tsconfig.json
└── apps/
    ├── web/
    │   ├── src/
    │   │   ├── App.vue
    │   │   └── main.ts
    │   ├── public/
    │   ├── index.html
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── vite.config.ts
    └── docs/
        ├── .vitepress/
        │   └── config.ts
        ├── guide/
        │   ├── index.md
        │   ├── shared.md
        │   └── ui.md
        ├── index.md
        └── package.json
```

## 常用命令

### 依赖管理

```bash
# 安装所有依赖
pnpm install

# 添加根目录依赖
pnpm add -D typescript -w

# 为特定包添加依赖
pnpm --filter @my-monorepo/web add vue-router

# 为所有包添加依赖
pnpm --recursive add lodash

# 删除依赖
pnpm --filter @my-monorepo/web remove axios
```

### 执行脚本

```bash
# 在所有包中执行
pnpm --recursive run build

# 并行执行
pnpm --parallel --recursive run dev

# 在特定包中执行
pnpm --filter @my-monorepo/web dev

# 在多个包中执行
pnpm --filter @my-monorepo/web --filter @my-monorepo/docs dev
```

### 使用 Turborepo

```bash
# 构建（会自动处理依赖顺序）
turbo run build

# 开发模式
turbo run dev

# Watch 模式（Turborepo 2.0 新特性）
turbo watch dev
# 自动检测文件变化并重新运行任务

# 只构建特定包及其依赖
turbo run build --filter=@my-monorepo/web

# 强制重新构建（忽略缓存）
turbo run build --force

# 查看依赖图
turbo run build --graph

# 查看任务执行摘要
turbo run build --summarize
```

**Turborepo 2.0 新功能**：

**1. Watch 模式**：

```bash
# 监听文件变化，自动重新运行
turbo watch dev
turbo watch build
turbo watch lint

# 等价于传统的 nodemon/chokidar，但使用 Turborepo 的依赖图
```

**2. 新终端 UI**：

```bash
# 启用交互式 TUI（默认启用）
turbo run dev --ui=tui

# 使用传统流式输出
turbo run dev --ui=stream
```

**3. 任务过滤**：

```bash
# 只运行指定包
turbo run build --filter=@my-monorepo/web

# 运行多个包
turbo run build --filter=@my-monorepo/web --filter=@my-monorepo/docs

# 运行包及其依赖
turbo run build --filter=@my-monorepo/web...

# 运行包及其依赖者
turbo run build --filter=...@my-monorepo/shared
```

### 清理

```bash
# 清理所有 dist
pnpm clean

# 清理所有 node_modules
pnpm --recursive exec rm -rf node_modules
rm -rf node_modules

# 重新安装
pnpm install
```

## 发布流程

### 1. 配置发布脚本

在需要发布的包中添加：

```json
{
  "scripts": {
    "prepublishOnly": "pnpm build"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

### 2. 发布单个包

```bash
cd packages/shared
pnpm publish
```

### 3. 批量发布（使用 Changesets）

安装 Changesets：

```bash
pnpm add -D @changesets/cli
pnpm changeset init
```

创建 changeset：

```bash
pnpm changeset
```

发布：

```bash
# 更新版本
pnpm changeset version

# 构建
pnpm build

# 发布
pnpm changeset publish
```

## 最佳实践

### 1. 命名规范

```
包命名：@scope/package-name
├── @my-monorepo/shared       ✅ 共享工具
├── @my-monorepo/ui            ✅ UI 组件
├── @my-monorepo/web           ✅ Web 应用
└── @my-monorepo/docs          ✅ 文档站点
```

### 2. 依赖引用

```json
{
  "dependencies": {
    "@my-monorepo/shared": "workspace:*",    // 使用最新版本
    "@my-monorepo/ui": "workspace:^1.0.0"    // 指定版本范围
  }
}
```

### 3. 构建顺序

确保依赖的包先构建（**Turborepo 2.x 语法**）：

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]  // ^ 表示依赖的包
    }
  }
}
```

**依赖语法说明**：

```json
{
  "tasks": {
    "build": {
      // ✅ ^build - 先运行依赖包的 build
      "dependsOn": ["^build"]
    },
    "test": {
      // ✅ build - 先运行当前包的 build
      // ✅ ^build - 然后运行依赖包的 build
      "dependsOn": ["build", "^build"]
    },
    "deploy": {
      // ✅ build, test - 按顺序运行当前包的任务
      "dependsOn": ["build", "test"]
    }
  }
}
```

### 4. 版本管理策略

**统一版本（Unified）**：
- 所有包使用相同版本
- 适合紧密关联的包
- 示例：Babel, Vue 3

**独立版本（Independent）**：
- 每个包独立版本
- 适合松散关联的包
- 示例：Lodash

### 5. Git 提交规范

使用 Conventional Commits：

```bash
feat(web): 添加用户登录功能
fix(shared): 修复日期格式化 bug
docs(ui): 更新 Button 组件文档
chore: 升级依赖版本
```

### 6. CI/CD 配置

创建 `.github/workflows/ci.yml`：

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test
```

### 7. 性能优化

**使用 Turborepo 缓存（v2.x 语法）**：

```json
{
  "tasks": {
    "build": {
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"]
    }
  }
}
```

**缓存优化技巧**：

- ✅ **精确的 outputs**：只缓存必要的文件，减少缓存体积
- ✅ **排除模式**：使用 `!` 排除不需要缓存的文件（如 `.next/cache/**`）
- ✅ **inputs 配置**：指定影响缓存的输入文件
- ✅ **环境变量**：使用 `env` 配置影响缓存的环境变量

```json
{
  "tasks": {
    "build": {
      "outputs": ["dist/**"],
      "env": ["DATABASE_URL", "API_KEY"],  // 环境变量影响缓存
      "inputs": ["src/**/*.ts", "!src/**/*.test.ts"]  // 测试文件不影响构建缓存
    }
  }
}
```

**使用 pnpm 的并行安装**：

```bash
pnpm install --parallel
```

**配置 .npmrc（pnpm 9.x 推荐）**：

```ini
# .npmrc
# 提升依赖到根 node_modules（提高兼容性）
shamefully-hoist=true

# 不严格检查 peer 依赖（避免冲突）
strict-peer-dependencies=false

# 自动安装 peer dependencies（pnpm 9.x）
auto-install-peers=true

# 使用符号链接（节省空间）
symlink=true
```

**Turborepo 远程缓存**：

```bash
# 登录 Vercel（免费提供远程缓存）
npx turbo login

# 链接项目
npx turbo link

# 之后所有构建都会使用远程缓存
turbo run build
```

**远程缓存优势**：
- ✅ 团队成员共享缓存
- ✅ CI/CD 加速构建
- ✅ 跨设备一致性

## 常见问题

### 1. 包引用失败

**问题**：导入本地包时报错找不到模块

**解决方案**：

```bash
# 确保已构建依赖的包
pnpm --filter @my-monorepo/shared build

# 重新安装依赖
pnpm install
```

### 2. TypeScript 类型找不到

**问题**：TypeScript 无法找到本地包的类型

**解决方案**：

确保包的 `package.json` 中配置了 `types` 字段：

```json
{
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts"
    }
  }
}
```

### 3. 循环依赖

**问题**：包 A 依赖包 B，包 B 又依赖包 A

**解决方案**：

- 重新设计包结构，提取共享代码到新包
- 使用依赖注入避免直接依赖

### 4. 构建缓存问题

**问题**：Turborepo 缓存了错误的构建结果

**解决方案**：

```bash
# 清理本地缓存
rm -rf .turbo

# 强制重新构建（忽略缓存）
turbo run build --force

# 清理所有缓存和输出
turbo run clean
pnpm clean
```

**缓存调试**：

```bash
# 查看缓存命中情况
turbo run build --summarize

# 生成缓存摘要文件
turbo run build --summarize=summary.json

# 查看为什么任务被执行（未命中缓存）
turbo run build --dry-run
```

### 5. Turborepo 2.x 迁移问题

**问题**：从 Turborepo 1.x 升级到 2.x 后配置不工作

**解决方案**：

```bash
# 自动迁移配置
npx @turbo/codemod migrate

# 检查迁移后的配置
cat turbo.json

# 验证配置正确性
turbo run build --dry-run
```

**主要变更检查清单**：

- ✅ `pipeline` → `tasks`
- ✅ `$schema` URL 更新
- ✅ `packageManager` 字段已添加
- ✅ 环境变量从 `experimentalGlobalPassThroughEnv` 迁移到 `globalPassThroughEnv`

### 6. pnpm workspace 协议问题

**问题**：使用 `workspace:*` 后发布到 npm 失败

**解决方案**：

pnpm 会自动在发布时将 `workspace:*` 替换为实际版本号。确保：

```json
{
  "dependencies": {
    "@my-monorepo/shared": "workspace:*"  // 开发时
  }
}

// 发布后自动转换为：
{
  "dependencies": {
    "@my-monorepo/shared": "1.0.0"  // 发布后
  }
}
```

**pnpm 发布配置**：

```json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

### 5. pnpm-lock.yaml 冲突

**问题**：多人协作时 pnpm-lock.yaml 经常冲突

**解决方案**：

```bash
# 删除 lock 文件
rm pnpm-lock.yaml

# 重新生成
pnpm install
```

## 进阶功能

### 1. 共享配置

创建 `packages/config`：

```typescript
// packages/config/eslint-config/index.js
module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    // 共享规则
  }
};
```

在其他包中使用：

```json
{
  "eslintConfig": {
    "extends": "@my-monorepo/config/eslint-config"
  }
}
```

### 2. 自定义工具包

创建 `packages/scripts`：

```typescript
// packages/scripts/src/build.ts
export function build() {
  console.log('Custom build script');
  // 自定义构建逻辑
}
```

### 3. 远程缓存（Turborepo）

配置远程缓存加速团队构建：

```bash
# 登录 Vercel
npx turbo login

# 链接项目
npx turbo link
```

## 总结

通过本教程，你已经学会了：

### ✅ 完成的工作

1. **项目初始化**
   - 配置 pnpm 9.x workspaces
   - 创建 Monorepo 目录结构
   - 配置 catalog 统一依赖版本（pnpm 9.0+）

2. **创建包和应用**
   - 共享工具包（shared）
   - UI 组件库（ui）
   - Web 应用（web）
   - 文档站点（docs）

3. **构建优化（Turborepo 2.x）**
   - 配置 Turborepo 2.6.1（最新稳定版）
   - 智能缓存和并行构建
   - Watch 模式和新终端 UI
   - 远程缓存（可选）

4. **代码规范**
   - ESLint + Prettier
   - Git Hooks（Husky + lint-staged）

5. **TypeScript 配置**
   - 类型检查
   - 声明文件生成

### 🎯 下一步

1. **添加测试**：配置 Vitest 或 Jest
2. **添加 E2E 测试**：配置 Playwright 或 Cypress
3. **配置 CI/CD**：GitHub Actions 自动化
4. **添加文档**：完善各包的 README
5. **版本管理**：使用 Changesets 管理版本
6. **探索 Turborepo 2.x 新特性**：Watch 模式、任务过滤、远程缓存

### 📚 参考资源

**官方文档**：
- [Turborepo 2.0 发布公告](https://turborepo.com/blog/turbo-2-0) - 2024-06-04
- [Turborepo 官方文档](https://turbo.build/repo/docs)
- [pnpm workspaces 文档](https://pnpm.io/workspaces)
- [pnpm 9.x 更新日志](https://github.com/pnpm/pnpm/releases)

**工具和生态**：
- [Monorepo 工具对比](https://monorepo.tools/)
- [Changesets 版本管理](https://github.com/changesets/changesets)
- [Turborepo 示例项目](https://github.com/vercel/turborepo/tree/main/examples)

**迁移指南**：
- [Turborepo 1.x → 2.x 迁移](https://turbo.build/repo/docs/crafting-your-repository/upgrading)
- [自动迁移工具](https://turbo.build/repo/docs/reference/turbo-codemod)

### 🆕 Turborepo 2.x 关键特性

- ✅ **新终端 UI**：交互式任务查看和日志
- ✅ **Watch 模式**：智能文件监听和自动重跑
- ✅ **MIT 许可证**：从专有许可证变更
- ✅ **长期支持**：官方支持政策
- ✅ **性能提升**：Rust 核心引擎优化

### 📊 版本兼容性

| 工具 | 推荐版本 | 最低版本 | 备注 |
|------|---------|---------|------|
| **Turborepo** | 2.6.1 | 2.0.0 | 使用 2.x 新语法 |
| **pnpm** | 9.15.0 | 9.0.0 | 支持 catalog 特性 |
| **Node.js** | 20.18.1 LTS | 18.0.0 | 推荐 LTS 版本 |
| **TypeScript** | 5.3.3+ | 5.0.0 | 支持最新特性 |

---

🎉 恭喜！你已经成功创建了一个基于 **Turborepo 2.x + pnpm 9.x** 的现代化 Monorepo 项目！
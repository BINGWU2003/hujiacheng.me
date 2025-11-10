---
title: monorepo + turborepo 搭建项目
date: 2025-11-10
duration: 60min
type: notes
art: random
---

[[toc]]

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
```

**说明**：
- `packages/*` - 通常存放可复用的包（库、组件、工具）
- `apps/*` - 通常存放应用程序（网站、服务）

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

在根目录创建 `turbo.json`：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
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

**说明**：
- `dependsOn: ["^build"]` - 先构建依赖的包
- `outputs` - 指定缓存的输出目录
- `cache: false` - 不缓存（适用于 dev 和 clean）
- `persistent: true` - 持续运行的任务（如 dev server）

### 4.3 更新根目录脚本

编辑根目录 `package.json`：

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
    "turbo": "^1.11.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
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

在各个包的 `tsconfig.json` 中：

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
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

# 只构建特定包及其依赖
turbo run build --filter=@my-monorepo/web

# 强制重新构建（忽略缓存）
turbo run build --force

# 查看依赖图
turbo run build --graph
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

确保依赖的包先构建：

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]  // ^ 表示依赖的包
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

**使用 Turborepo 缓存**：

```json
{
  "pipeline": {
    "build": {
      "outputs": ["dist/**"],        // 缓存输出
      "dependsOn": ["^build"]
    }
  }
}
```

**使用 pnpm 的并行安装**：

```bash
pnpm install --parallel
```

**配置 .npmrc**：

```
# .npmrc
shamefully-hoist=true          # 提升依赖到根 node_modules
strict-peer-dependencies=false # 不严格检查 peer 依赖
```

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
# 清理缓存
rm -rf .turbo

# 强制重新构建
turbo run build --force
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
   - 配置 pnpm workspaces
   - 创建 Monorepo 目录结构

2. **创建包和应用**
   - 共享工具包（shared）
   - UI 组件库（ui）
   - Web 应用（web）
   - 文档站点（docs）

3. **构建优化**
   - 配置 Turborepo
   - 智能缓存和并行构建

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

### 📚 参考资源

- [pnpm workspaces](https://pnpm.io/workspaces)
- [Turborepo 文档](https://turbo.build/repo/docs)
- [Monorepo 最佳实践](https://monorepo.tools/)

---

🎉 恭喜！你已经成功创建了一个完整的 Monorepo 项目！
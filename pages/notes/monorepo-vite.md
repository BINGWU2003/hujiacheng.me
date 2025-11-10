---
title: monorepo + vite 搭建项目
date: 2025-11-10
duration: 60min
type: notes
art: random
---

[[toc]]

## 前言

本文档将教你使用 **Monorepo** 架构，并使用 **Vite** 作为统一的构建工具来搭建一个完整的项目。

### 为什么选择 Vite

**Vite 的优势**：
- ⚡ **极速启动**：原生 ESM 开发服务器
- 🔥 **热更新快**：基于 ESM 的 HMR
- 📦 **多功能**：支持应用和库的构建
- 🛠️ **配置简单**：开箱即用，配置灵活
- 🔌 **插件丰富**：完善的插件生态

### 项目目标

我们将创建：
- 📚 **共享工具包**（使用 Vite Library Mode）
- 🎨 **UI 组件库**（使用 Vite Library Mode）
- 🌐 **Web 应用**（使用 Vite）
- 📖 **文档站点**（使用 VitePress）

### 技术栈

- **包管理器**：pnpm
- **构建工具**：Vite
- **构建优化**：Turborepo
- **类型检查**：TypeScript
- **前端框架**：Vue 3
- **代码规范**：ESLint + Prettier

## 准备工作

### 1. 安装必要工具

```bash
# 检查 Node.js 版本
node -v  # 需要 v18.0.0 或更高

# 安装 pnpm
npm install -g pnpm

# 检查 pnpm 版本
pnpm -v  # 需要 v8.0.0 或更高
```

### 2. 创建项目目录

```bash
# 创建项目目录
mkdir my-vite-monorepo
cd my-vite-monorepo

# 初始化 Git
git init

# 创建 .gitignore
cat > .gitignore << 'EOF'
# 依赖
node_modules

# 构建产物
dist
*.local

# 编辑器
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.idea
*.swp
*.swo
.DS_Store

# 日志
*.log
npm-debug.log*
pnpm-debug.log*

# 缓存
.turbo
.eslintcache

# 环境变量
.env.local
.env.*.local
EOF
```

## 第一步：初始化根目录

### 1.1 创建 package.json

```bash
pnpm init
```

编辑根目录 `package.json`：

```json
{
  "name": "my-vite-monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "Monorepo project built with Vite",
  "type": "module",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "preview": "turbo run preview",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,vue,json,css,scss,md}\"",
    "clean": "turbo run clean && rm -rf node_modules .turbo"
  },
  "keywords": ["monorepo", "vite"],
  "author": "Your Name",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

### 1.2 配置 pnpm workspace

创建 `pnpm-workspace.yaml`：

```yaml
packages:
  # 共享包
  - 'packages/*'
  # 应用
  - 'apps/*'
```

### 1.3 创建目录结构

```bash
# 创建目录
mkdir -p packages/shared
mkdir -p packages/ui
mkdir -p apps/web
mkdir -p apps/docs
```

**目录结构**：

```
my-vite-monorepo/
├── packages/
│   ├── shared/       # 共享工具包
│   └── ui/           # UI 组件库
└── apps/
    ├── web/          # Web 应用
    └── docs/         # 文档站点
```

## 第二步：创建共享包（使用 Vite）

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
  "type": "module",
  "description": "Shared utilities and helpers",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.3.3",
    "vite-plugin-dts": "^3.7.0"
  }
}
```

创建源代码 `packages/shared/src/index.ts`：

```typescript
/**
 * 格式化日期
 */
export function formatDate(date: Date, locale = 'zh-CN'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
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

/**
 * 深度克隆
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;
  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn(...args);
      lastTime = now;
    }
  };
}
```

创建 Vite 配置 `packages/shared/vite.config.ts`：

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyMonorepoShared',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: [],
      output: {
        exports: 'named'
      }
    },
    sourcemap: true,
    emptyOutDir: true
  }
});
```

创建 `packages/shared/tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
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
  "type": "module",
  "description": "UI component library",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./style.css": "./dist/style.css"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@my-monorepo/shared": "workspace:*"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.3.3",
    "vite-plugin-dts": "^3.7.0"
  }
}
```

创建组件 `packages/ui/src/Button/Button.ts`：

```typescript
import { generateId } from '@my-monorepo/shared';
import './Button.css';

export interface ButtonProps {
  text: string;
  type?: 'primary' | 'default' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
}

export class Button {
  private id: string;
  private element: HTMLButtonElement;

  constructor(props: ButtonProps) {
    this.id = generateId();
    this.element = document.createElement('button');
    this.element.textContent = props.text;
    this.element.id = this.id;
    
    // 设置类名
    this.element.className = `my-button my-button--${props.type || 'default'} my-button--${props.size || 'medium'}`;
    
    // 设置禁用状态
    if (props.disabled) {
      this.element.disabled = true;
    }

    // 绑定点击事件
    if (props.onClick) {
      this.element.addEventListener('click', props.onClick);
    }
  }

  render(container: HTMLElement): void {
    container.appendChild(this.element);
  }

  destroy(): void {
    this.element.remove();
  }
}
```

创建样式 `packages/ui/src/Button/Button.css`：

```css
.my-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;
}

.my-button:hover {
  opacity: 0.8;
}

.my-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 类型 */
.my-button--default {
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
}

.my-button--primary {
  background-color: #1890ff;
  color: #fff;
}

.my-button--danger {
  background-color: #ff4d4f;
  color: #fff;
}

/* 尺寸 */
.my-button--small {
  padding: 4px 12px;
  font-size: 12px;
}

.my-button--medium {
  padding: 8px 16px;
  font-size: 14px;
}

.my-button--large {
  padding: 12px 20px;
  font-size: 16px;
}
```

创建入口文件 `packages/ui/src/index.ts`：

```typescript
export { Button } from './Button/Button';
export type { ButtonProps } from './Button/Button';

// 导出样式
import './Button/Button.css';
```

创建 Vite 配置 `packages/ui/vite.config.ts`：

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyMonorepoUI',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['@my-monorepo/shared'],
      output: {
        exports: 'named',
        globals: {
          '@my-monorepo/shared': 'MyMonorepoShared'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css';
          }
          return assetInfo.name || '';
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true
  }
});
```

创建 `packages/ui/tsconfig.json`：

```json
{
  "extends": "../shared/tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2020", "DOM"]
  }
}
```

### 2.3 安装依赖

回到根目录：

```bash
cd ../..
pnpm install
```

## 第三步：创建 Web 应用（Vite + Vue 3）

### 3.1 初始化 Vue 3 项目

```bash
cd apps/web
pnpm create vite . --template vue-ts
```

### 3.2 编辑配置

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
    "preview": "vite preview",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx,.vue"
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
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

### 3.3 创建示例页面

编辑 `apps/web/src/App.vue`：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { formatDate, generateId, debounce } from '@my-monorepo/shared';
import '@my-monorepo/ui/style.css';

const currentDate = ref('');
const uniqueId = ref('');
const inputValue = ref('');
const debouncedValue = ref('');

// 防抖处理
const handleInput = debounce((value: string) => {
  debouncedValue.value = value;
  console.log('Debounced value:', value);
}, 500);

onMounted(() => {
  currentDate.value = formatDate(new Date());
  uniqueId.value = generateId();
});
</script>

<template>
  <div class="app">
    <div class="header">
      <h1>🚀 My Vite Monorepo</h1>
      <p class="subtitle">使用 Vite 构建的 Monorepo 项目</p>
    </div>

    <div class="content">
      <div class="card">
        <h2>📦 共享工具包</h2>
        <div class="info-item">
          <span class="label">当前日期：</span>
          <span class="value">{{ currentDate }}</span>
        </div>
        <div class="info-item">
          <span class="label">唯一 ID：</span>
          <span class="value">{{ uniqueId }}</span>
        </div>
      </div>

      <div class="card">
        <h2>⚡ 防抖示例</h2>
        <input
          v-model="inputValue"
          type="text"
          placeholder="输入内容（500ms 防抖）"
          class="input"
          @input="handleInput(inputValue)"
        />
        <div class="info-item">
          <span class="label">实时值：</span>
          <span class="value">{{ inputValue }}</span>
        </div>
        <div class="info-item">
          <span class="label">防抖值：</span>
          <span class="value">{{ debouncedValue }}</span>
        </div>
      </div>

      <div class="card">
        <h2>🎨 UI 组件</h2>
        <p>UI 组件库使用原生 TypeScript + CSS 构建</p>
        <div id="button-container"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

h1 {
  color: #42b883;
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.2rem;
}

.content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h2 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
  font-family: 'Monaco', 'Courier New', monospace;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 1rem;
  transition: border-color 0.3s;
}

.input:focus {
  outline: none;
  border-color: #42b883;
}

#button-container {
  margin-top: 1rem;
}
</style>
```

编辑 `apps/web/src/main.ts`：

```typescript
import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

// 使用 UI 组件库
import { Button } from '@my-monorepo/ui';

createApp(App).mount('#app');

// 渲染按钮组件
const container = document.getElementById('button-container');
if (container) {
  const primaryBtn = new Button({
    text: 'Primary Button',
    type: 'primary',
    onClick: () => alert('Primary Button Clicked!')
  });
  primaryBtn.render(container);

  const defaultBtn = new Button({
    text: 'Default Button',
    type: 'default',
    onClick: () => alert('Default Button Clicked!')
  });
  defaultBtn.render(container);

  const dangerBtn = new Button({
    text: 'Danger Button',
    type: 'danger',
    size: 'large',
    onClick: () => alert('Danger Button Clicked!')
  });
  dangerBtn.render(container);
}
```

编辑 `apps/web/src/style.css`：

```css
:root {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: #333;
  background-color: #f5f5f5;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}
```

## 第四步：创建文档站点（VitePress）

### 4.1 初始化 VitePress

```bash
cd ../docs
pnpm init
pnpm add -D vitepress vue
```

### 4.2 配置 VitePress

编辑 `apps/docs/package.json`：

```json
{
  "name": "@my-monorepo/docs",
  "version": "1.0.0",
  "private": true,
  "type": "module",
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

创建配置文件 `apps/docs/.vitepress/config.ts`：

```typescript
import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'My Vite Monorepo',
  description: '使用 Vite 构建的 Monorepo 项目文档',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/guide/' },
          { text: '项目结构', link: '/guide/structure' },
          { text: '开发流程', link: '/guide/workflow' }
        ]
      },
      {
        text: 'API',
        items: [
          { text: '共享工具', link: '/api/shared' },
          { text: 'UI 组件', link: '/api/ui' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/my-vite-monorepo' }
    ]
  }
});
```

创建首页 `apps/docs/index.md`：

```markdown
---
layout: home
title: Home

hero:
  name: My Vite Monorepo
  text: 使用 Vite 构建的 Monorepo 项目
  tagline: 快速、简单、强大
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/
    - theme: alt
      text: GitHub
      link: https://github.com/yourusername/my-vite-monorepo

features:
  - icon: ⚡
    title: 极速开发
    details: 使用 Vite 提供闪电般的开发体验
  - icon: 📦
    title: Monorepo 架构
    details: 统一管理多个包和应用
  - icon: 🛠️
    title: TypeScript
    details: 完整的类型支持和智能提示
  - icon: 🎨
    title: UI 组件库
    details: 可复用的 UI 组件
---
```

创建指南页面 `apps/docs/guide/index.md`：

```markdown
# 快速开始

## 安装

\`\`\`bash
# 克隆项目
git clone <your-repo-url>
cd my-vite-monorepo

# 安装依赖
pnpm install
\`\`\`

## 开发

\`\`\`bash
# 启动所有开发服务器
pnpm dev

# 或单独启动
pnpm --filter @my-monorepo/web dev
pnpm --filter @my-monorepo/docs dev
\`\`\`

## 构建

\`\`\`bash
# 构建所有包和应用
pnpm build

# 或单独构建
pnpm --filter @my-monorepo/shared build
pnpm --filter @my-monorepo/ui build
\`\`\`

## 预览

\`\`\`bash
# 预览构建结果
pnpm preview
\`\`\`
```

创建 API 文档 `apps/docs/api/shared.md`：

```markdown
# 共享工具 API

## formatDate

格式化日期

**类型**：
\`\`\`typescript
function formatDate(date: Date, locale?: string): string
\`\`\`

**示例**：
\`\`\`typescript
import { formatDate } from '@my-monorepo/shared';

formatDate(new Date()); // "2025/11/10"
formatDate(new Date(), 'en-US'); // "11/10/2025"
\`\`\`

## sleep

延迟函数

**类型**：
\`\`\`typescript
function sleep(ms: number): Promise<void>
\`\`\`

**示例**：
\`\`\`typescript
import { sleep } from '@my-monorepo/shared';

await sleep(1000); // 延迟 1 秒
\`\`\`

## generateId

生成随机 ID

**类型**：
\`\`\`typescript
function generateId(): string
\`\`\`

**示例**：
\`\`\`typescript
import { generateId } from '@my-monorepo/shared';

const id = generateId(); // "a7s8d9f0g1h"
\`\`\`

## debounce

防抖函数

**类型**：
\`\`\`typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void
\`\`\`

**示例**：
\`\`\`typescript
import { debounce } from '@my-monorepo/shared';

const handleSearch = debounce((keyword: string) => {
  console.log('搜索:', keyword);
}, 500);

handleSearch('hello'); // 500ms 后执行
\`\`\`

## throttle

节流函数

**类型**：
\`\`\`typescript
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void
\`\`\`

**示例**：
\`\`\`typescript
import { throttle } from '@my-monorepo/shared';

const handleScroll = throttle(() => {
  console.log('滚动');
}, 200);

window.addEventListener('scroll', handleScroll);
\`\`\`
```

### 4.3 回到根目录安装依赖

```bash
cd ../..
pnpm install
```

## 第五步：配置 Turborepo

### 5.1 安装 Turborepo

```bash
pnpm add -D turbo
```

### 5.2 创建 turbo.json

在根目录创建 `turbo.json`：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".vitepress/dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "preview": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 5.3 更新根目录脚本

编辑根目录 `package.json`：

```json
{
  "name": "my-vite-monorepo",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "preview": "turbo run preview",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,vue,json,css,scss,md}\"",
    "clean": "turbo run clean && rm -rf node_modules .turbo"
  },
  "devDependencies": {
    "turbo": "^1.11.0",
    "prettier": "^3.1.1"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

## 第六步：配置代码规范

### 6.1 安装 ESLint 和 Prettier

```bash
pnpm add -D eslint prettier \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-plugin-vue \
  vue-eslint-parser \
  eslint-config-prettier \
  eslint-plugin-prettier
```

### 6.2 创建 ESLint 配置

创建 `.eslintrc.cjs`：

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
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2021,
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'vue/multi-word-component-names': ['error', {
      ignores: ['index']
    }]
  }
};
```

### 6.3 创建 Prettier 配置

创建 `.prettierrc.json`：

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5",
  "arrowParens": "always",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false
}
```

### 6.4 创建忽略文件

创建 `.eslintignore`：

```
node_modules
dist
.turbo
*.config.js
*.config.ts
.vitepress/cache
.vitepress/dist
```

创建 `.prettierignore`：

```
node_modules
dist
.turbo
pnpm-lock.yaml
.vitepress/cache
.vitepress/dist
```

### 6.5 添加 lint 脚本

在各个包的 `package.json` 中添加 lint 脚本（如果还没有）。

## 第七步：配置 Git Hooks

### 7.1 安装 Husky 和 lint-staged

```bash
pnpm add -D husky lint-staged
npx husky init
```

### 7.2 配置 lint-staged

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
    "*.{json,md,css,scss}": [
      "prettier --write"
    ]
  }
}
```

### 7.3 配置 pre-commit hook

编辑 `.husky/pre-commit`：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

## 第八步：构建和测试

### 8.1 构建共享包

```bash
# 构建 shared 包
pnpm --filter @my-monorepo/shared build

# 构建 ui 包
pnpm --filter @my-monorepo/ui build
```

### 8.2 启动开发服务器

```bash
# 启动所有开发服务器
pnpm dev

# 或分别启动
pnpm --filter @my-monorepo/web dev
pnpm --filter @my-monorepo/docs dev
```

访问：
- **Web 应用**：http://localhost:3000
- **文档站点**：http://localhost:5173

### 8.3 构建所有项目

```bash
pnpm build
```

### 8.4 预览构建结果

```bash
pnpm preview
```

## 完整目录结构

```
my-vite-monorepo/
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
├── packages/
│   ├── shared/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── dist/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── ui/
│       ├── src/
│       │   ├── Button/
│       │   │   ├── Button.ts
│       │   │   └── Button.css
│       │   └── index.ts
│       ├── dist/
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
└── apps/
    ├── web/
    │   ├── src/
    │   │   ├── App.vue
    │   │   ├── main.ts
    │   │   └── style.css
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
        │   ├── structure.md
        │   └── workflow.md
        ├── api/
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

# 为根目录添加依赖
pnpm add -D vite -w

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

# 使用 Turborepo（推荐）
turbo run build
turbo run dev
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

## Vite Library Mode 详解

### 配置说明

Vite 的 Library Mode 用于构建库，主要配置项：

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    // 生成类型声明文件
    dts({
      insertTypesEntry: true,  // 插入类型入口
      rollupTypes: true         // 合并类型声明
    })
  ],
  build: {
    lib: {
      // 入口文件
      entry: resolve(__dirname, 'src/index.ts'),
      // 库名称（用于 UMD/IIFE 格式）
      name: 'MyLibrary',
      // 输出格式
      formats: ['es', 'cjs'],
      // 输出文件名
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      // 外部依赖（不打包进库中）
      external: ['vue', '@my-monorepo/shared'],
      output: {
        // 导出方式
        exports: 'named',
        // 全局变量（用于 UMD 格式）
        globals: {
          vue: 'Vue',
          '@my-monorepo/shared': 'MyMonorepoShared'
        }
      }
    },
    sourcemap: true,      // 生成 sourcemap
    emptyOutDir: true     // 构建前清空输出目录
  }
});
```

### 输出格式

**ES Module（推荐）**：
```typescript
formats: ['es']
// 输出: index.js
// 现代浏览器和构建工具支持
```

**CommonJS**：
```typescript
formats: ['cjs']
// 输出: index.cjs
// Node.js 环境使用
```

**UMD**：
```typescript
formats: ['umd']
// 输出: index.umd.js
// 通用模块定义，浏览器直接引用
```

**同时输出多种格式**：
```typescript
formats: ['es', 'cjs', 'umd']
```

### 处理 CSS

Vite 会自动处理 CSS：

```typescript
// 导入 CSS
import './Button.css';

// Vite 会将 CSS 提取到单独的文件
// 输出: style.css
```

在 `package.json` 中导出 CSS：

```json
{
  "exports": {
    "./style.css": "./dist/style.css"
  }
}
```

## 最佳实践

### 1. 包的导出配置

```json
{
  "name": "@my-monorepo/package",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./style.css": "./dist/style.css"
  },
  "files": ["dist"]
}
```

### 2. 开发时自动构建

使用 `--watch` 模式：

```json
{
  "scripts": {
    "dev": "vite build --watch"
  }
}
```

### 3. TypeScript 路径别名

在 `vite.config.ts` 中配置：

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components')
    }
  }
});
```

### 4. 环境变量

创建 `.env` 文件：

```
VITE_APP_TITLE=My App
VITE_API_URL=https://api.example.com
```

在代码中使用：

```typescript
console.log(import.meta.env.VITE_APP_TITLE);
```

### 5. 优化构建产物

```typescript
export default defineConfig({
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue']
        }
      }
    },
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 生产环境移除 console
        drop_debugger: true
      }
    },
    // chunk 大小警告限制
    chunkSizeWarningLimit: 1000
  }
});
```

## 常见问题

### 1. 类型声明文件未生成

**问题**：构建后没有 `.d.ts` 文件

**解决方案**：

```bash
# 安装 vite-plugin-dts
pnpm add -D vite-plugin-dts

# 在 vite.config.ts 中添加插件
import dts from 'vite-plugin-dts';

plugins: [
  dts({
    insertTypesEntry: true,
    rollupTypes: true
  })
]
```

### 2. 本地包引用失败

**问题**：应用无法找到本地包

**解决方案**：

```bash
# 1. 确保包已构建
pnpm --filter @my-monorepo/shared build

# 2. 重新安装依赖
pnpm install

# 3. 检查 package.json exports 配置
```

### 3. CSS 未被提取

**问题**：CSS 没有单独输出文件

**解决方案**：

确保在入口文件中导入 CSS：

```typescript
// src/index.ts
import './style.css';
```

配置资源文件名：

```typescript
build: {
  rollupOptions: {
    output: {
      assetFileNames: (assetInfo) => {
        if (assetInfo.name === 'style.css') {
          return 'style.css';
        }
        return assetInfo.name || '';
      }
    }
  }
}
```

### 4. HMR 不生效

**问题**：修改代码后页面不自动刷新

**解决方案**：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    watch: {
      usePolling: true  // 某些系统需要轮询
    }
  }
});
```

### 5. 构建缓存问题

**问题**：修改代码后构建结果未更新

**解决方案**：

```bash
# 清理缓存
rm -rf node_modules/.vite

# 强制重新构建
pnpm build --force
```

## CI/CD 配置

### GitHub Actions

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

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: |
            packages/*/dist
            apps/*/dist
```

## 总结

通过本教程，你已经掌握了：

### ✅ 完成的工作

1. **Monorepo 架构**
   - pnpm workspaces 配置
   - 包和应用的组织结构

2. **Vite 构建**
   - Library Mode 构建共享包
   - 应用构建和开发服务器
   - TypeScript 类型生成

3. **开发工具**
   - Turborepo 构建优化
   - ESLint + Prettier 代码规范
   - Husky + lint-staged Git Hooks

4. **实战项目**
   - 共享工具包
   - UI 组件库
   - Vue 3 应用
   - VitePress 文档站点

### 🎯 优势

- **统一构建工具**：所有包和应用都使用 Vite
- **开发体验好**：极速的 HMR 和开发服务器
- **配置简单**：Vite Library Mode 开箱即用
- **类型支持**：完整的 TypeScript 支持
- **构建优化**：Turborepo 缓存和并行构建

### 📚 参考资源

- [Vite 官方文档](https://vitejs.dev/)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [pnpm workspaces](https://pnpm.io/workspaces)
- [Turborepo 文档](https://turbo.build/repo/docs)
- [VitePress 文档](https://vitepress.dev/)

---

🎉 恭喜！你已经成功使用 Vite 搭建了一个完整的 Monorepo 项目！
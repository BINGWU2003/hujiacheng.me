---
title: ESLint、Prettier、Husky 和 Commitlint 完整配置指南
date: 2025-09-18
duration: 30min
art: random
---

[[toc]]

本文档详细介绍了项目中代码质量、格式化、Git hooks 和提交规范的完整配置方案，包括使用方法和最佳实践。

## 概述

本项目构建了一套完整的代码质量保障体系，包含以下核心工具：

### 🔍 代码质量检查

- **ESLint 8**: 静态代码分析，检查代码质量和潜在问题
- **TypeScript 支持**: 完整的 TS 语法检查和类型验证
- **Vue 3 支持**: 单文件组件 (SFC) 的模板和脚本检查

### 🎨 代码格式化

- **Prettier**: 自动代码格式化，统一代码风格
- **多语言支持**: JavaScript、TypeScript、Vue、JSON、Markdown 等
- **编辑器集成**: 保存时自动格式化

### 🪝 Git Hooks 自动化

- **Husky**: Git hooks 管理，在提交时自动执行检查
- **Lint-staged**: 只对暂存文件运行检查，提高性能
- **Pre-commit**: 提交前自动运行 ESLint 和 Prettier

### 📝 提交信息规范

- **Commitlint**: 强制执行 Conventional Commits 规范
- **提交格式检查**: 确保提交信息格式一致
- **自动化验证**: 不符合规范的提交会被自动拒绝

### 🏗️ Monorepo 支持

- **工作区依赖解析**: 支持 `@vue/*` 形式的内部包引用
- **路径映射**: 自动解析 TypeScript 路径别名
- **子包配置**: 支持子包级别的规则定制

### 🔧 开发体验优化

- **编辑器集成**: VS Code、WebStorm 等主流编辑器支持
- **实时反馈**: 开发过程中的即时错误提示
- **自动修复**: 大部分问题可以自动修复
- **性能优化**: 增量检查，只处理变更文件

通过这套配置，团队可以实现：

- ✅ **零配置开发**: 新成员克隆项目后即可获得完整的代码质量保障
- ✅ **自动化质量控制**: 无需手动执行检查，Git hooks 自动处理
- ✅ **统一代码风格**: 团队成员的代码风格完全一致
- ✅ **规范化提交**: 所有提交信息都符合标准格式
- ✅ **高效协作**: 减少代码审查中的格式和风格讨论

## 快速开始

### 前置要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js**: 版本 >= 16.0.0
- **包管理器**: pnpm >= 8.0.0 (推荐) 或 npm >= 8.0.0
- **Git**: 版本 >= 2.20.0
- **编辑器**: VS Code (推荐) 或其他支持 ESLint/Prettier 的编辑器

### 检查环境

```bash
# 检查 Node.js 版本
node --version

# 检查 pnpm 版本
pnpm --version

# 检查 Git 版本
git --version
```

### 完整安装流程

#### 步骤 1: 安装依赖

如果你是从零开始配置项目，请按以下步骤安装所有必需的依赖：

```bash
# 1. 安装 ESLint 核心依赖
pnpm add -D eslint@^8.57.0

# 2. 安装 TypeScript ESLint 支持
pnpm add -D @typescript-eslint/eslint-plugin@^6.21.0 @typescript-eslint/parser@^6.21.0

# 3. 安装 Vue ESLint 支持
pnpm add -D eslint-plugin-vue@^9.20.1

# 4. 安装 Import 检查支持
pnpm add -D eslint-plugin-import@^2.29.1 eslint-import-resolver-typescript@^3.6.1

# 5. 安装 Prettier 核心依赖
pnpm add -D prettier@^3.2.5

# 6. 安装 ESLint 和 Prettier 集成
pnpm add -D eslint-config-prettier@^9.1.0

# 7. 安装 Git Hooks 管理
pnpm add -D husky@^9.0.11 lint-staged@^15.2.2

# 8. 安装提交信息检查
pnpm add -D @commitlint/cli@^18.6.1 @commitlint/config-conventional@^18.6.2
```

**或者一次性安装所有依赖：**

```bash
pnpm add -D eslint@^8.57.0 \
  @typescript-eslint/eslint-plugin@^6.21.0 \
  @typescript-eslint/parser@^6.21.0 \
  eslint-plugin-vue@^9.20.1 \
  eslint-plugin-import@^2.29.1 \
  eslint-import-resolver-typescript@^3.6.1 \
  prettier@^3.2.5 \
  eslint-config-prettier@^9.1.0 \
  husky@^9.0.11 \
  lint-staged@^15.2.2 \
  @commitlint/cli@^18.6.1 \
  @commitlint/config-conventional@^18.6.2
```

#### 步骤 2: 创建配置文件

创建所有必需的配置文件：

```bash
# 创建 ESLint 配置文件
touch .eslintrc.cjs

# 创建 ESLint 忽略文件
touch .eslintignore

# 创建 Prettier 配置文件
touch .prettierrc.cjs

# 创建 Prettier 忽略文件
touch .prettierignore

# 创建 Commitlint 配置文件
touch commitlint.config.cjs
```

#### 步骤 3: 初始化 Husky

```bash
# 初始化 Husky
npx husky init

# 创建 commit-msg hook
echo 'npx --no -- commitlint --edit $1' > .husky/commit-msg
```

#### 步骤 4: 配置 package.json

在 `package.json` 中添加必要的脚本和配置：

`prepare:husky`在执行`pnpm install`的时候自动执行，会在`husky/_`文件夹创建钩子文件，用于链接`pre-commit`和`commit-msg`文件

```json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint . --ext .js,.ts,.vue --ignore-path .eslintignore",
    "lint:fix": "eslint . --ext .js,.ts,.vue --ignore-path .eslintignore --fix",
    "format": "prettier --write \"**/*.{js,ts,vue,json,md,yml,yaml}\"",
    "format:check": "prettier --check \"**/*.{js,ts,vue,json,md,yml,yaml}\"",
    "check": "npm run lint && npm run format:check",
    "fix": "npm run lint:fix && npm run format"
  },
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

#### 步骤 5: 验证安装

```bash
# 检查 ESLint 版本
npx eslint --version

# 检查 Prettier 版本
npx prettier --version

# 检查 Commitlint 版本
npx commitlint --version

# 测试配置是否正常工作
npm run lint
npm run format:check
```

### 现有项目集成

如果你要在现有项目中集成这套配置：

#### 1. 备份现有配置

```bash
# 备份现有的配置文件（如果存在）
cp .eslintrc.* .eslintrc.backup 2>/dev/null || true
cp .prettierrc.* .prettierrc.backup 2>/dev/null || true
```

#### 2. 渐进式迁移

```bash
# 先安装基础依赖
pnpm add -D eslint@^8.57.0 prettier@^3.2.5

# 测试基础配置
npm run lint -- --no-fix
npm run format:check

# 逐步添加其他依赖和配置
```

#### 3. 处理现有代码

```bash
# 格式化所有现有代码
npm run format

# 修复可自动修复的 ESLint 问题
npm run lint:fix

# 手动修复剩余问题
npm run lint
```

## 安装的依赖

### ESLint 相关依赖

#### 核心依赖

- **`eslint: ^8.57.0`**
  - **作用**: ESLint 的核心包，提供代码质量检查功能
  - **为什么选择 8.x**: 项目要求使用 ESLint 8 版本，虽然 9.x 已发布，但 8.x 更稳定且与现有工具链兼容性更好
  - **功能**: 提供基础的 JavaScript 代码检查规则

#### TypeScript 支持

- **`@typescript-eslint/eslint-plugin: ^6.21.0`**
  - **作用**: 为 TypeScript 提供专门的 ESLint 规则
  - **为什么需要**: 原生 ESLint 无法理解 TypeScript 语法，需要专门的插件来检查 TS 特有的语法和类型问题
  - **功能**: 提供类型检查、接口规范、泛型使用等 TypeScript 特定规则

- **`@typescript-eslint/parser: ^6.21.0`**
  - **作用**: 将 TypeScript 代码解析为 ESLint 可以理解的 AST
  - **为什么需要**: ESLint 默认只能解析 JavaScript，需要专门的解析器来处理 TypeScript 语法
  - **功能**: 解析 TypeScript 语法，包括类型注解、装饰器、枚举等

#### Vue 支持

- **`eslint-plugin-vue: ^9.20.1`**
  - **作用**: 为 Vue.js 单文件组件提供 ESLint 规则
  - **为什么需要**: Vue SFC 包含 template、script、style 三个部分，需要专门的插件来解析和检查
  - **功能**: 检查 Vue 模板语法、组件规范、Composition API 使用等

#### 模块导入支持

- **`eslint-plugin-import: ^2.29.1`**
  - **作用**: 检查 ES6+ 的 import/export 语句
  - **为什么需要**: 在 monorepo 环境中，需要确保模块导入的正确性，避免循环依赖等问题
  - **功能**: 检查导入路径、未使用的导入、导入顺序等

- **`eslint-import-resolver-typescript: ^3.6.1`**
  - **作用**: 让 eslint-plugin-import 能够解析 TypeScript 的路径映射
  - **为什么需要**: 项目使用了 `@vue/*` 形式的路径别名，需要解析器来正确识别这些路径
  - **功能**: 解析 tsconfig.json 中的 paths 配置，支持 workspace 依赖

### Prettier 相关依赖

#### 核心依赖

- **`prettier: ^3.2.5`**
  - **作用**: 代码格式化工具，自动统一代码风格
  - **为什么选择**: 业界标准的代码格式化工具，支持多种语言，配置简单
  - **功能**: 自动格式化 JavaScript、TypeScript、Vue、JSON、Markdown 等文件

#### ESLint 集成

- **`eslint-config-prettier: ^9.1.0`**
  - **作用**: 禁用所有与 Prettier 冲突的 ESLint 规则
  - **为什么需要**: ESLint 和 Prettier 都有格式化功能，可能产生冲突，需要这个包来协调
  - **功能**: 确保 ESLint 专注于代码质量，Prettier 专注于代码格式

### 依赖版本选择说明

#### 版本兼容性考虑

- **ESLint 8.x**: 虽然 9.x 已发布，但 8.x 与现有 TypeScript 和 Vue 插件兼容性更好
- **TypeScript ESLint 6.x**: 支持 TypeScript 5.3.x，与项目的 TS 版本匹配
- **Vue Plugin 9.x**: 支持 Vue 3 的最新特性，包括 Composition API 和 script setup

#### 稳定性考虑

- 选择的版本都是经过充分测试的稳定版本
- 避免使用最新的 beta 或 alpha 版本，确保生产环境的稳定性
- 版本之间的兼容性经过验证，不会出现插件冲突

### Git Hooks 和提交规范依赖

#### Git Hooks 管理

- **`husky: ^9.0.11`**
  - **作用**: Git hooks 管理工具，简化 Git hooks 的配置和使用
  - **为什么需要**: 原生 Git hooks 配置复杂，husky 提供了简单的配置方式
  - **功能**: 管理 pre-commit、commit-msg 等 Git hooks

- **`lint-staged: ^15.2.2`**
  - **作用**: 只对 Git 暂存区的文件运行 linter
  - **为什么需要**: 避免对整个项目运行 linter，提高性能，只检查即将提交的文件
  - **功能**: 在提交前自动运行 ESLint 和 Prettier

#### 提交信息规范

- **`@commitlint/cli: ^18.6.1`**
  - **作用**: 提交信息检查工具的命令行接口
  - **为什么需要**: 确保团队使用统一的提交信息格式，便于生成 changelog 和版本管理
  - **功能**: 检查提交信息是否符合规范

- **`@commitlint/config-conventional: ^18.6.2`**
  - **作用**: 基于 Conventional Commits 规范的 commitlint 配置
  - **为什么选择**: Conventional Commits 是业界广泛采用的提交信息规范
  - **功能**: 提供标准的提交信息格式规则

### 可选依赖说明

以下依赖可以根据项目需求选择性添加：

- **`eslint-plugin-security`**: 安全相关的 ESLint 规则
- **`eslint-plugin-performance`**: 性能相关的检查规则
- **`@typescript-eslint/eslint-plugin-tslint`**: 迁移 TSLint 规则时使用
- **`eslint-plugin-jsx-a11y`**: React 项目的无障碍检查（本项目不需要）

## 配置文件说明

### ESLint 配置 (`.eslintrc.cjs`)

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier', // 必须放在最后，禁用与 Prettier 冲突的规则
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
  },
  plugins: ['@typescript-eslint', 'vue', 'import'],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      },
    },
  },
}
```

#### 主要规则说明

**TypeScript 规则：**

- `@typescript-eslint/no-unused-vars`: 检查未使用的变量
- `@typescript-eslint/no-explicit-any`: 警告使用 any 类型
- `@typescript-eslint/explicit-function-return-type`: 要求函数显式返回类型

**Vue 规则：**

- `vue/multi-word-component-names`: 关闭多词组件名要求
- `vue/require-explicit-emits`: 要求显式声明 emits
- `vue/prefer-import-from-vue`: 在 monorepo 中关闭，允许从子包导入

**Import 规则：**

- 自动解析 TypeScript 路径映射
- 检查模块导入的正确性
- 支持 workspace 依赖解析

### Prettier 配置 (`.prettierrc.cjs`)

```javascript
module.exports = {
  // 基础格式化选项
  semi: false, // 不使用分号
  singleQuote: true, // 使用单引号
  tabWidth: 2, // 缩进宽度为2个空格
  trailingComma: 'es5', // 在ES5中有效的尾随逗号
  printWidth: 80, // 每行最大字符数
  endOfLine: 'lf', // 使用LF换行符

  // Vue 特定选项
  vueIndentScriptAndStyle: false, // Vue文件中的script和style标签不缩进

  // 其他选项
  useTabs: false, // 使用空格而不是制表符
  quoteProps: 'as-needed', // 仅在需要时为对象属性添加引号
  bracketSpacing: true, // 对象字面量的大括号间添加空格
  arrowParens: 'avoid', // 箭头函数参数周围避免不必要的括号

  // 文件覆盖配置
  overrides: [
    {
      files: '*.json',
      options: { printWidth: 120, tabWidth: 2 },
    },
    {
      files: '*.vue',
      options: { printWidth: 100 },
    },
  ],
}
```

### Commitlint 配置 (`commitlint.config.cjs`)

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复bug
        'docs', // 文档变更
        'style', // 代码格式（不影响代码运行的变动）
        'refactor', // 重构（既不是新增功能，也不是修改bug的代码变动）
        'perf', // 性能优化
        'test', // 增加测试
        'chore', // 构建过程或辅助工具的变动
        'revert', // 回滚
        'build', // 构建系统或外部依赖项的更改
        'ci', // CI配置文件和脚本的更改
      ],
    ],
    // 主题长度限制
    'subject-max-length': [2, 'always', 100],
    // 主题不能为空
    'subject-empty': [2, 'never'],
    // 类型不能为空
    'type-empty': [2, 'never'],
    // 主题格式（不以大写字母开头，不以句号结尾）
    'subject-case': [2, 'always', 'lower-case'],
    // 头部最大长度
    'header-max-length': [2, 'always', 100],
  },
}
```

#### 提交信息格式说明

提交信息应遵循以下格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例：**

```bash
# 正确的提交信息
feat(auth): add user login functionality
fix(ui): resolve button alignment issue
docs: update installation guide
chore: update dependencies

# 错误的提交信息
Add login feature          # 缺少类型
feat: Add Login Feature     # 主题首字母大写
fix(ui): fix button.        # 主题以句号结尾
```

### Git Hooks 配置

Git Hooks 是 Git 提供的钩子机制，允许在特定的 Git 操作前后执行自定义脚本。我们使用 husky 来管理这些 hooks，确保代码质量和提交规范。

#### Pre-commit Hook (`.husky/pre-commit`)

**作用时机**: 在执行 `git commit` 命令时，Git 会在创建提交对象之前触发此 hook

**执行内容**:

```bash
npx lint-staged
```

**详细说明**:

- **触发条件**: 每次运行 `git commit` 时自动执行
- **执行对象**: 只检查和修复 Git 暂存区（staged）中的文件
- **主要功能**:
  - 对暂存的 `.js/.ts/.vue` 文件运行 ESLint 检查和自动修复
  - 对暂存的文件运行 Prettier 格式化
  - 如果发现无法自动修复的错误，会阻止提交并显示错误信息
- **性能优势**: 只处理即将提交的文件，而不是整个项目，大大提高执行速度
- **失败处理**: 如果检查失败，Git 会取消提交，开发者需要修复问题后重新提交

**工作流程**:

1. 开发者执行 `git add .` 将文件添加到暂存区
2. 开发者执行 `git commit -m "message"`
3. Git 触发 pre-commit hook
4. lint-staged 对暂存文件执行 ESLint 和 Prettier
5. 如果所有检查通过，继续提交流程
6. 如果检查失败，取消提交并显示错误

#### Commit-msg Hook (`.husky/commit-msg`)

**作用时机**: 在 Git 准备提交信息后，创建提交对象之前触发

**执行内容**:

```bash
npx --no -- commitlint --edit $1
```

**详细说明**:

- **触发条件**: 在 pre-commit hook 成功执行后，Git 准备创建提交时触发
- **参数说明**: `$1` 是 Git 传递的临时文件路径，包含提交信息内容
- **主要功能**:
  - 检查提交信息是否符合 Conventional Commits 规范
  - 验证提交类型是否在允许的列表中
  - 检查提交信息长度、格式等规则
- **失败处理**: 如果提交信息不符合规范，会阻止提交并显示具体的错误信息

**工作流程**:

1. pre-commit hook 执行成功
2. Git 准备提交信息（来自 `-m` 参数或编辑器）
3. Git 触发 commit-msg hook
4. commitlint 检查提交信息格式
5. 如果格式正确，创建提交对象
6. 如果格式错误，取消提交并显示错误

**检查规则示例**:

```bash
# ✅ 正确格式
feat: add user authentication
fix(ui): resolve button alignment issue
docs: update API documentation

# ❌ 错误格式
Add user authentication        # 缺少类型前缀
feat: Add User Authentication  # 主题首字母大写
fix(ui): resolve button.       # 主题以句号结尾
feature: add auth             # 类型不在允许列表中
```

#### Lint-staged 配置 (`package.json`)

```json
{
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

**配置说明**:

- **文件匹配**: 使用 glob 模式匹配不同类型的文件
- **命令执行**: 对匹配的文件按顺序执行指定的命令
- **自动修复**: ESLint 和 Prettier 会自动修复可修复的问题
- **错误处理**: 如果任何命令失败，整个流程会停止并恢复文件状态

### 忽略文件配置

**`.eslintignore`:**

```
# 构建产物
dist/
build/
lib/
es/

# 依赖和缓存
node_modules/
.eslintcache

# 配置文件
*.config.js
vite.config.*
```

**`.prettierignore`:**

```
# 构建产物
dist/
build/

# 依赖
node_modules/

# 锁文件
pnpm-lock.yaml
package-lock.json
```

## 使用方法

### 日常开发工作流

#### 推荐的开发流程

```bash
# 1. 开发过程中，随时检查代码质量
npm run lint

# 2. 修复可自动修复的问题
npm run lint:fix

# 3. 格式化代码
npm run format

# 4. 提交前进行完整检查
npm run check

# 5. 提交代码（会自动触发 hooks）
git add .
git commit -m "feat: add new feature"
```

#### 命令行使用详解

项目根目录提供了以下 npm 脚本：

**基础检查命令：**

```bash
# 检查所有文件的代码规范
npm run lint
# 等同于：npx eslint . --ext .js,.ts,.vue --ignore-path .eslintignore

# 自动修复可修复的 ESLint 问题
npm run lint:fix
# 等同于：npx eslint . --ext .js,.ts,.vue --ignore-path .eslintignore --fix

# 格式化所有支持的文件
npm run format
# 等同于：npx prettier --write "**/*.{js,ts,vue,json,md,yml,yaml}"

# 检查文件格式化状态（不修改文件）
npm run format:check
# 等同于：npx prettier --check "**/*.{js,ts,vue,json,md,yml,yaml}"
```

**组合命令：**

```bash
# 同时运行 lint 和格式检查
npm run check
# 等同于：npm run lint && npm run format:check

# 同时运行 lint 修复和格式化
npm run fix
# 等同于：npm run lint:fix && npm run format
```

**高级用法：**

```bash
# 只检查特定目录
npx eslint packages/reactivity --ext .ts,.js

# 只格式化特定文件类型
npx prettier --write "**/*.vue"

# 使用缓存提高性能
npx eslint . --cache --ext .js,.ts,.vue

# 输出详细信息
npm run lint -- --format=detailed

# 只显示错误，不显示警告
npm run lint -- --quiet
```

### 单独使用 ESLint

```bash
# 检查特定文件
npx eslint packages/reactivity/src/index.ts

# 检查并修复特定文件
npx eslint packages/reactivity/src/index.ts --fix

# 检查特定目录
npx eslint packages/reactivity/src/

# 检查 Vue 文件
npx eslint packages/vite-project-vue/src/App.vue
```

### 单独使用 Prettier

```bash
# 格式化特定文件
npx prettier --write packages/reactivity/src/index.ts

# 检查文件格式（不修改）
npx prettier --check packages/reactivity/src/index.ts

# 格式化整个目录
npx prettier --write "packages/reactivity/src/**/*.{ts,js,vue}"
```

### 提交信息检查

```bash
# 检查提交信息格式（手动测试）
echo "feat: add new feature" | npx commitlint

# 检查最近的提交信息
npx commitlint --from HEAD~1 --to HEAD --verbose

# 检查所有提交信息
npx commitlint --from=origin/main --to=HEAD --verbose
```

### Git Hooks 使用

Git hooks 会在相应的 Git 操作时自动触发，为开发者提供无感知的代码质量保障：

#### 完整的提交流程示例

```bash
# 1. 修改文件后添加到暂存区
git add src/components/Button.vue

# 2. 尝试提交（会触发两个 hooks）
git commit -m "feat: add button component"

# 执行过程：
# ├── pre-commit hook 触发
# │   ├── 运行 lint-staged
# │   ├── 对 Button.vue 执行 eslint --fix
# │   ├── 对 Button.vue 执行 prettier --write
# │   └── 如果有错误，停止提交并显示错误
# ├── commit-msg hook 触发
# │   ├── 运行 commitlint
# │   ├── 检查 "feat: add button component" 格式
# │   └── 如果格式错误，停止提交并显示错误
# └── 提交成功创建
```

#### 常见场景和处理

**场景 1: 代码格式问题（自动修复）**

```bash
git add src/utils.ts  # 文件有格式问题
git commit -m "fix: update utils"

# 输出：
# ✔ Running tasks for staged files...
# ✔ prettier --write: src/utils.ts
# ✔ eslint --fix: src/utils.ts
# [main abc1234] fix: update utils
```

**场景 2: ESLint 错误（无法自动修复）**

```bash
git add src/api.ts  # 文件有未使用的变量
git commit -m "feat: add api client"

# 输出：
# ✖ eslint --fix:
# src/api.ts
#   5:7  error  'unusedVar' is assigned a value but never used
#
# ✖ lint-staged failed
# 提交被取消，需要手动修复错误
```

**场景 3: 提交信息格式错误**

```bash
git add README.md
git commit -m "Update documentation"  # 格式不正确

# 输出：
# ✖ subject may not be empty [subject-empty]
# ✖ type may not be empty [type-empty]
#
# 需要使用正确格式：
git commit -m "docs: update documentation"
```

**场景 4: 跳过 hooks（不推荐）**

```bash
# 紧急情况下可以跳过 hooks，但不推荐
git commit -m "feat: emergency fix" --no-verify

# 或者只跳过 pre-commit
git commit -m "feat: emergency fix" --no-verify
```

#### Hook 执行顺序

```
git commit 命令执行
    ↓
1. pre-commit hook
    ├── 检查暂存区文件
    ├── 运行 lint-staged
    │   ├── ESLint 检查和修复
    │   └── Prettier 格式化
    └── 如果失败，停止提交
    ↓
2. commit-msg hook
    ├── 检查提交信息格式
    ├── 运行 commitlint
    └── 如果失败，停止提交
    ↓
3. 创建提交对象
    └── 提交成功
```

#### 性能优化说明

- **只处理暂存文件**: lint-staged 只检查 `git add` 的文件，不会检查整个项目
- **并行执行**: 多个文件可以并行处理，提高执行速度
- **缓存机制**: ESLint 支持缓存，重复检查相同文件时会更快
- **增量检查**: 只检查变更的部分，而不是整个文件

## Monorepo 支持

### 工作区依赖解析

配置支持解析 `@vue/*` 形式的工作区依赖：

```typescript
// 正确解析
import { shared } from '@vue/shared'
import { reactive } from '@vue/reactivity'

// 会报错：模块不存在
import { nonExistent } from '@vue/nonexistent'
```

### 子包配置扩展

子包可以创建自己的 `.eslintrc.cjs` 来扩展或覆盖根配置：

```javascript
// packages/vite-project-vue/.eslintrc.cjs
module.exports = {
  extends: ['../../.eslintrc.cjs'],
  rules: {
    // Vue 项目中允许 console.log
    'no-console': 'off',
    // 更严格的组件命名
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
  },
}
```

## 编辑器集成

### VS Code 完整配置

#### 必需扩展

安装以下扩展以获得最佳开发体验：

```bash
# 通过命令行安装扩展
code --install-extension ms-vscode.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension Vue.volar
code --install-extension bradlc.vscode-tailwindcss  # 如果使用 Tailwind CSS
```

或手动安装：

- **ESLint** (ms-vscode.vscode-eslint) - ESLint 集成
- **Prettier - Code formatter** (esbenp.prettier-vscode) - Prettier 集成
- **Vue Language Features (Volar)** (Vue.volar) - Vue 3 支持
- **TypeScript Vue Plugin (Volar)** (Vue.vscode-typescript-vue-plugin) - Vue TS 支持

#### 工作区配置

创建 `.vscode/settings.json` 文件：

```json
{
  // 编辑器基础设置
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.formatOnType": false,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,

  // ESLint 配置
  "eslint.enable": true,
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact", "vue"],
  "eslint.format.enable": false,
  "eslint.lintTask.enable": true,

  // 保存时自动修复
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },

  // 文件类型特定设置
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.wordWrap": "on"
  },

  // Vue 特定设置
  "vetur.validation.template": false,
  "vetur.validation.script": false,
  "vetur.validation.style": false,

  // 文件关联
  "files.associations": {
    "*.vue": "vue"
  },

  // 排除文件
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true,
    "**/.DS_Store": true
  },

  // 搜索排除
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true,
    "**/coverage": true
  }
}
```

#### 推荐的扩展配置

创建 `.vscode/extensions.json` 文件：

```json
{
  "recommendations": [
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag"
  ],
  "unwantedRecommendations": ["ms-vscode.vscode-typescript", "octref.vetur"]
}
```

#### 调试配置

创建 `.vscode/launch.json` 用于调试：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "breakOnLoad": true,
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
```

### WebStorm/IntelliJ IDEA 详细配置

#### ESLint 配置

1. **打开设置**：
   - Windows/Linux: `File → Settings`
   - macOS: `IntelliJ IDEA → Preferences`

2. **配置 ESLint**：
   - 导航到：`Languages & Frameworks → JavaScript → Code Quality Tools → ESLint`
   - 选择 `Automatic ESLint configuration`
   - 或手动配置：
     - ESLint package: `项目根目录/node_modules/eslint`
     - Configuration file: `项目根目录/.eslintrc.cjs`

3. **启用实时检查**：
   - 勾选 `Run eslint --fix on save`

#### Prettier 配置

1. **配置 Prettier**：
   - 导航到：`Languages & Frameworks → JavaScript → Prettier`
   - Prettier package: `项目根目录/node_modules/prettier`
   - Run for files: `{**/*,*}.{js,ts,jsx,tsx,vue,json,css,scss,md}`

2. **启用格式化**：
   - 勾选 `On 'Reformat Code' action`
   - 勾选 `On save`

#### Vue 支持

1. **启用 Vue 插件**：
   - 确保 Vue.js 插件已启用
   - 重启 IDE

2. **配置文件模板**：
   - `File → Settings → Editor → File and Code Templates`
   - 添加 Vue SFC 模板

### 其他编辑器

#### Vim/Neovim

使用 CoC (Conquer of Completion) 配置：

```json
{
  "eslint.enable": true,
  "eslint.filetypes": ["javascript", "typescript", "vue"],
  "prettier.enable": true,
  "coc.preferences.formatOnSaveFiletypes": ["javascript", "typescript", "vue", "json"]
}
```

#### Sublime Text

安装以下包：

- SublimeLinter
- SublimeLinter-eslint
- JsPrettier

#### Atom

安装以下包：

- linter-eslint
- prettier-atom
- language-vue

### 团队配置同步

为确保团队成员使用相同的编辑器配置：

1. **提交编辑器配置文件**：

   ```bash
   git add .vscode/
   git commit -m "chore: add vscode workspace settings"
   ```

2. **创建开发环境文档**：
   - 在项目 README 中说明推荐的编辑器和扩展
   - 提供配置步骤的详细说明

3. **使用 EditorConfig**：
   创建 `.editorconfig` 文件：

   ```ini
   root = true

   [*]
   charset = utf-8
   end_of_line = lf
   indent_style = space
   indent_size = 2
   insert_final_newline = true
   trim_trailing_whitespace = true

   [*.md]
   trim_trailing_whitespace = false
   ```

## 常见问题和解决方案

### 1. ESLint 和 Prettier 规则冲突

**问题：** ESLint 和 Prettier 对同一代码有不同的格式要求

**解决：** 确保 `eslint-config-prettier` 在 extends 数组的最后位置：

```javascript
extends: [
  'eslint:recommended',
  '@typescript-eslint/recommended',
  'plugin:vue/vue3-recommended',
  'prettier' // 必须在最后
]
```

### 2. TypeScript 路径映射无法解析

**问题：** ESLint 无法解析 `@vue/*` 形式的导入

**解决：** 检查 `eslint-import-resolver-typescript` 配置：

```javascript
settings: {
  'import/resolver': {
    typescript: {
      project: './tsconfig.json'
    }
  }
}
```

### 3. Vue 文件解析错误

**问题：** ESLint 无法正确解析 Vue 单文件组件

**解决：** 确保使用正确的解析器配置：

```javascript
parser: 'vue-eslint-parser',
parserOptions: {
  parser: '@typescript-eslint/parser'
}
```

### 4. Vue 文件 script 标签缩进问题

**问题：** Vue 文件中的 script 标签内容被 Prettier 自动缩进

**解决：** 在 `.prettierrc.cjs` 中设置：

```javascript
module.exports = {
  vueIndentScriptAndStyle: false, // 不缩进 script 和 style 标签
}
```

**说明：**

- `true`: script 和 style 标签内容会缩进一个层级
- `false`: script 和 style 标签内容从第一列开始，不缩进

### 5. 提交信息格式错误

**问题：** 提交时出现 commitlint 错误

**常见错误和解决方案：**

```bash
# 错误：缺少类型
✖ subject may not be empty [subject-empty]
✖ type may not be empty [type-empty]
# 解决：添加正确的类型前缀
git commit -m "feat: add new feature"

# 错误：类型不在允许列表中
✖ type must be one of [feat, fix, docs, style, refactor, perf, test, chore, revert, build, ci] [type-enum]
# 解决：使用正确的类型
git commit -m "feat: add new feature"  # 而不是 "feature: add new feature"

# 错误：主题过长
✖ header must not be longer than 100 characters [header-max-length]
# 解决：缩短提交信息
git commit -m "feat: add user auth"  # 而不是很长的描述

# 错误：主题格式不正确
✖ subject must not be sentence-case [subject-case]
# 解决：使用小写开头
git commit -m "feat: add new feature"  # 而不是 "feat: Add new feature"
```

### 6. 性能问题

**问题：** 大型项目中 ESLint 运行缓慢

**解决方案：**

- 使用 `.eslintignore` 排除不必要的文件
- 启用 ESLint 缓存：`eslint --cache`
- 只检查变更的文件（配合 Git hooks）

### 7. Git Hooks 不工作

**问题：** 提交时 Git hooks 没有执行

**排查步骤：**

```bash
# 1. 检查 husky 是否正确安装
ls -la .husky/

# 2. 检查 hooks 文件权限
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg

# 3. 检查 Git hooks 路径
git config core.hooksPath

# 4. 手动测试 hooks
.husky/pre-commit
echo "test commit" | .husky/commit-msg
```

**解决方案：**

```bash
# 重新初始化 husky
rm -rf .husky
npx husky init
echo 'npx lint-staged' > .husky/pre-commit
echo 'npx --no -- commitlint --edit $1' > .husky/commit-msg
```

### 8. 依赖版本冲突

**问题：** ESLint 插件版本不兼容

**解决方案：**

```bash
# 检查依赖树
npm ls eslint
npm ls @typescript-eslint/eslint-plugin

# 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 或使用 pnpm
pnpm install --force
```

### 9. 编辑器集成问题

**问题：** VS Code 中 ESLint 不工作

**排查步骤：**

1. 检查扩展是否启用
2. 查看输出面板的 ESLint 日志
3. 重启 ESLint 服务：`Ctrl+Shift+P` → "ESLint: Restart ESLint Server"

**解决方案：**

```json
// .vscode/settings.json
{
  "eslint.workingDirectories": ["./"],
  "eslint.validate": ["javascript", "typescript", "vue"],
  "eslint.debug": true
}
```

### 10. Monorepo 路径解析问题

**问题：** 无法解析 workspace 依赖

**解决方案：**

```javascript
// .eslintrc.cjs
module.exports = {
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
      },
    },
  },
}
```

### 11. Windows 系统兼容性问题

**问题：** Windows 下路径分隔符问题

**解决方案：**

```bash
# 使用 cross-env 处理环境变量
npm install -D cross-env

# package.json
{
  "scripts": {
    "lint": "cross-env NODE_ENV=development eslint ."
  }
}
```

### 12. 大文件处理问题

**问题：** 格式化大文件时内存不足

**解决方案：**

```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 或在 package.json 中
{
  "scripts": {
    "format": "node --max-old-space-size=4096 ./node_modules/.bin/prettier --write ."
  }
}
```

### 13. 提交信息中文支持

**问题：** Commitlint 不支持中文

**解决方案：**

```javascript
// commitlint.config.cjs
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0], // 禁用大小写检查
    'subject-max-length': [2, 'always', 200], // 增加长度限制
  },
}
```

### 14. 调试和日志

**启用详细日志：**

```bash
# ESLint 调试
DEBUG=eslint:* npm run lint

# Prettier 调试
npx prettier --debug-check src/

# Commitlint 调试
npx commitlint --verbose

# Husky 调试
HUSKY_DEBUG=1 git commit -m "test"
```

### 15. 常用修复命令

```bash
# 一键修复常见问题
npm run fix

# 重置所有配置
rm -rf node_modules .eslintcache
npm install
npx husky init

# 批量修复文件权限（Unix/Linux/macOS）
find .husky -type f -exec chmod +x {} \;

# 检查配置文件语法
node -c .eslintrc.cjs
node -c .prettierrc.cjs
node -c commitlint.config.cjs
```

## 最佳实践

### 1. 开发工作流最佳实践

#### 提交前检查流程

```bash
# 完整的提交前检查流程
npm run check          # 检查代码质量和格式
npm run test          # 运行测试（如果有）
git add .
git commit -m "feat: add new feature"  # 触发 Git hooks
```

#### 分支开发建议

```bash
# 创建功能分支
git checkout -b feature/new-feature

# 开发过程中定期检查
npm run lint:fix
npm run format

# 提交前最终检查
npm run check

# 合并前确保主分支代码质量
git checkout main
git pull origin main
npm run check
```

### 2. 持续集成 (CI/CD) 配置

#### GitHub Actions 完整配置

创建 `.github/workflows/ci.yml`：

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-format:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm run lint

      - name: Check Prettier formatting
        run: pnpm run format:check

      - name: Check commit messages
        if: github.event_name == 'pull_request'
        run: |
          npx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }} --verbose

  type-check:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm run type-check
```

#### GitLab CI 配置

创建 `.gitlab-ci.yml`：

```yaml
stages:
  - lint
  - test

variables:
  NODE_VERSION: '18'

before_script:
  - npm install -g pnpm
  - pnpm install --frozen-lockfile

lint:
  stage: lint
  image: node:$NODE_VERSION
  script:
    - pnpm run lint
    - pnpm run format:check
  only:
    - merge_requests
    - main
    - develop

type-check:
  stage: test
  image: node:$NODE_VERSION
  script:
    - pnpm run type-check
  only:
    - merge_requests
    - main
    - develop
```

### 3. 团队协作规范

#### 代码审查清单

**审查者检查项：**

- [ ] 代码是否通过了所有 ESLint 检查
- [ ] 代码格式是否符合 Prettier 规范
- [ ] 提交信息是否符合 Conventional Commits 规范
- [ ] 是否有未使用的导入或变量
- [ ] TypeScript 类型是否正确
- [ ] Vue 组件是否遵循最佳实践

**提交者自检清单：**

- [ ] 运行 `npm run check` 无错误
- [ ] 所有新增代码都有适当的类型注解
- [ ] 提交信息格式正确
- [ ] 没有调试代码（console.log 等）
- [ ] 代码符合项目架构规范

#### 团队配置同步

```bash
# 创建团队配置同步脚本
# scripts/setup-dev-env.sh
#!/bin/bash

echo "Setting up development environment..."

# 安装依赖
pnpm install

# 设置 Git hooks
npx husky install

# 检查编辑器配置
if [ ! -d ".vscode" ]; then
  echo "Creating VS Code workspace settings..."
  mkdir -p .vscode
  # 复制推荐配置
fi

# 运行初始检查
npm run check

echo "Development environment setup complete!"
```

### 4. 规则定制策略

#### 环境特定配置

**开发环境配置 (`.eslintrc.dev.cjs`)**：

```javascript
module.exports = {
  extends: ['./.eslintrc.cjs'],
  rules: {
    'no-console': 'warn', // 开发时允许 console
    'no-debugger': 'warn', // 开发时允许 debugger
    '@typescript-eslint/no-unused-vars': 'warn', // 开发时降级为警告
  },
}
```

**生产环境配置**：

```javascript
// 在 CI 中使用更严格的规则
module.exports = {
  extends: ['./.eslintrc.cjs'],
  rules: {
    'no-console': 'error', // 生产环境禁止 console
    'no-debugger': 'error', // 生产环境禁止 debugger
    '@typescript-eslint/no-unused-vars': 'error',
  },
}
```

#### 渐进式规则迁移

```javascript
// 新项目使用严格规则
const strictRules = {
  '@typescript-eslint/explicit-function-return-type': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
}

// 现有项目逐步迁移
const migrationRules = {
  '@typescript-eslint/explicit-function-return-type': 'warn',
  '@typescript-eslint/no-explicit-any': 'warn',
}

module.exports = {
  // 根据项目阶段选择规则
  rules: process.env.STRICT_MODE ? strictRules : migrationRules,
}
```

### 5. 性能优化建议

#### ESLint 性能优化

```javascript
// .eslintrc.cjs
module.exports = {
  // 启用缓存
  cache: true,
  cacheLocation: '.eslintcache',

  // 并行处理
  parallel: true,

  // 只检查变更文件
  extensions: ['.js', '.ts', '.vue'],

  // 排除不必要的文件
  ignorePatterns: ['dist/', 'node_modules/', '*.min.js', 'coverage/'],
}
```

#### Prettier 性能优化

```bash
# 使用 .prettierignore 排除大文件
echo "*.min.js" >> .prettierignore
echo "*.bundle.js" >> .prettierignore
echo "dist/" >> .prettierignore

# 只格式化变更文件
npx prettier --write $(git diff --name-only --diff-filter=ACMR | grep -E '\.(js|ts|vue)$')
```

### 6. 监控和维护

#### 定期维护任务

```bash
# 每月执行的维护脚本
# scripts/monthly-maintenance.sh

#!/bin/bash

echo "Running monthly maintenance..."

# 检查依赖更新
npm outdated

# 更新 ESLint 和 Prettier
npm update eslint prettier @typescript-eslint/eslint-plugin

# 检查配置兼容性
npm run check

# 生成依赖报告
npm audit

echo "Maintenance complete!"
```

#### 质量指标监控

```bash
# 生成代码质量报告
npx eslint . --format json --output-file reports/eslint-report.json

# 统计代码质量指标
echo "ESLint errors: $(cat reports/eslint-report.json | jq '[.[] | .errorCount] | add')"
echo "ESLint warnings: $(cat reports/eslint-report.json | jq '[.[] | .warningCount] | add')"
```

## 更新和维护

### 依赖更新

定期更新相关依赖：

```bash
# 检查过时的依赖
npm outdated

# 更新 ESLint 相关依赖
npm update eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# 更新 Prettier
npm update prettier eslint-config-prettier
```

### 配置调整

当项目需求变化时，可以调整配置：

- 添加新的文件类型支持
- 调整代码风格规则
- 添加项目特定的自定义规则

---

## 总结

本配置提供了一个完整的代码质量和格式化解决方案，支持：

- ✅ TypeScript 和 Vue 3 项目
- ✅ Monorepo 工作区
- ✅ 编辑器集成
- ✅ 自动化工作流

通过遵循本指南，团队可以保持一致的代码质量和风格，提高开发效率和代码可维护性。

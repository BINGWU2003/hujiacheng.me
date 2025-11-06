---
title: eslint prettier husky commitlint editorconfig stylelint 指南
date: 2025-11-06
duration: 120min
type: notes
art: random
---

[[toc]]

## 前言

本文档将带你从 0 到 1 搭建一套完整的前端代码规范体系，包括代码检查、格式化、提交规范等。

### 工具介绍

**必须配置的工具**：
- **ESLint**：JavaScript/TypeScript 代码检查工具
- **Prettier**：代码格式化工具
- **Husky**：Git hooks 管理工具
- **Commitlint**：Git commit 消息规范检查工具

**可选配置的工具**：
- **EditorConfig**：编辑器配置统一工具
- **Stylelint**：CSS/SCSS 代码检查工具

### 为什么需要代码规范

**没有代码规范的项目**：
```javascript
// 团队成员 A 的代码
function getUserInfo( userId ){
  const user=users.find(u=>u.id===userId)
  return user
}

// 团队成员 B 的代码
function getProductInfo(productId) {
  const product = products.find((p) => p.id === productId);
  return product;
}

// 团队成员 C 的代码
const getOrderInfo = orderId => {
    let order = orders.find(o => o.id == orderId)
    return order
}
```

**结果**：
- ❌ 代码风格不统一（空格、缩进、引号）
- ❌ 存在潜在问题（`==` vs `===`）
- ❌ Git diff 混乱
- ❌ 代码审查困难

**配置代码规范后**：
```javascript
// 所有成员的代码都遵循统一规范
function getUserInfo(userId) {
  const user = users.find((u) => u.id === userId);
  return user;
}

function getProductInfo(productId) {
  const product = products.find((p) => p.id === productId);
  return product;
}

function getOrderInfo(orderId) {
  const order = orders.find((o) => o.id === orderId);
  return order;
}
```

**结果**：
- ✅ 代码风格统一
- ✅ 自动发现和修复问题
- ✅ Git diff 清晰
- ✅ 代码审查高效

### 预期效果

配置完成后，你的项目将拥有：

1. **代码提交前**：
   - 自动格式化代码（Prettier）
   - 自动检查代码质量（ESLint）
   - 自动检查样式代码（Stylelint，可选）

2. **Git 提交时**：
   - 自动验证 commit 消息格式（Commitlint）
   - 阻止不符合规范的提交

3. **编辑器中**：
   - 统一的编辑器配置（EditorConfig，可选）
   - 保存时自动格式化
   - 实时显示代码问题

## 项目初始化

### 创建项目

```bash
# 创建项目目录
mkdir my-project
cd my-project

# 初始化 package.json
npm init -y
```

### 更新 package.json

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "项目描述",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

**注意**：
- 如果使用 ES Module（`"type": "module"`），配置文件需要使用 `.cjs` 或 `.mjs` 后缀
- 如果使用 CommonJS 或未指定，配置文件使用 `.js` 后缀即可

## 第一步：配置 ESLint

ESLint 是 JavaScript/TypeScript 代码检查的基础，必须首先配置。

### 1.1 安装 ESLint

```bash
# 安装 ESLint 8.x
npm install --save-dev eslint@8

# Vue 3 项目
npm install --save-dev eslint@8 \
  eslint-plugin-vue \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin

# React 项目
npm install --save-dev eslint@8 \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin
```

### 1.2 创建配置文件

根据项目模块系统选择配置文件格式：

**ES Module 项目**（`package.json` 中 `"type": "module"`）：

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
};
```

**CommonJS 项目**（默认或 `"type": "commonjs"`）：

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
};
```

### 1.3 Vue 3 + TypeScript 完整配置

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2021,
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: [
    'vue',
    '@typescript-eslint'
  ],
  rules: {
    // Vue 规则
    'vue/multi-word-component-names': ['error', {
      ignores: ['index', 'App', '[id]']
    }],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    
    // TypeScript 规则
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // 通用规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
};
```

### 1.4 React + TypeScript 完整配置

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // React 规则
    'react/react-in-jsx-scope': 'off',  // React 17+ 不需要
    'react/prop-types': 'off',  // 使用 TypeScript
    
    // TypeScript 规则
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // 通用规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
};
```

### 1.5 创建 .eslintignore

```
# 依赖
node_modules/

# 构建产物
dist/
build/
public/

# 配置文件
*.config.js
*.config.ts

# 其他
.DS_Store
*.min.js
```

### 1.6 配置 package.json scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx,.vue",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx,.vue --fix"
  }
}
```

### 1.7 测试 ESLint

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix
```

## 第二步：配置 Prettier

Prettier 负责代码格式化，与 ESLint 配合使用。

### 2.1 安装 Prettier

```bash
# 安装 Prettier
npm install --save-dev prettier

# 安装 ESLint 和 Prettier 集成插件
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

### 2.2 创建 Prettier 配置文件

```json
// .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

或者使用 JavaScript 格式（支持注释）：

```javascript
// .prettierrc.cjs
module.exports = {
  semi: true,              // 使用分号
  singleQuote: true,       // 使用单引号
  printWidth: 100,         // 每行最大长度
  tabWidth: 2,             // 缩进空格数
  useTabs: false,          // 使用空格而不是 Tab
  trailingComma: 'es5',    // 尾随逗号
  bracketSpacing: true,    // 对象括号间距
  arrowParens: 'always',   // 箭头函数参数括号
  endOfLine: 'lf',         // 换行符（Unix）
  
  // Vue 特定
  vueIndentScriptAndStyle: false,
  
  // HTML
  htmlWhitespaceSensitivity: 'ignore'
};
```

### 2.3 创建 .prettierignore

```
# 依赖
node_modules/

# 构建产物
dist/
build/
public/

# 其他
.DS_Store
*.min.js
*.min.css
pnpm-lock.yaml
package-lock.json
```

### 2.4 集成 ESLint 和 Prettier

更新 ESLint 配置，添加 Prettier 集成：

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',  // 或 'plugin:react/recommended'
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'  // ⭐ 必须放在最后
  ],
  // ... 其他配置
};
```

### 2.5 配置 package.json scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx,.vue",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx,.vue --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,vue,json,css,scss,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,vue,json,css,scss,md}\""
  }
}
```

### 2.6 测试 Prettier

```bash
# 格式化所有文件
npm run format

# 检查格式
npm run format:check
```

## 第三步：配置 Husky

Husky 用于管理 Git hooks，在代码提交前自动执行检查。

### 3.1 安装 Husky

```bash
# 安装 Husky 和 lint-staged
npm install --save-dev husky lint-staged

# 初始化 Husky
npx husky init
```

执行后会：
1. 创建 `.husky` 目录
2. 在 `package.json` 中添加 `prepare` 脚本
3. 创建 `.husky/pre-commit` 文件

### 3.2 配置 lint-staged

在 `package.json` 中添加 lint-staged 配置：

```json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx,.vue",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx,.vue --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,vue,json,css,scss,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,vue,json,css,scss,md}\""
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### 3.3 配置 pre-commit hook

编辑 `.husky/pre-commit` 文件：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### 3.4 测试 Husky

```bash
# 创建测试文件
echo "const a=1" > test.js

# 提交测试
git add test.js
git commit -m "test: 测试 Husky"

# 应该会看到：
# - ESLint 检查
# - Prettier 格式化
# - 自动修复代码
```

## 第四步：配置 Commitlint

Commitlint 用于规范 Git commit 消息格式。

### 4.1 安装 Commitlint

```bash
# 安装 Commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

### 4.2 创建配置文件

```javascript
// commitlint.config.cjs (ES Module 项目)
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type 类型定义
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复
        'docs',     // 文档变更
        'style',    // 代码格式（不影响代码运行）
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 增加测试
        'chore',    // 构建过程或辅助工具的变动
        'revert',   // 回退
        'build'     // 打包
      ]
    ],
    // subject 大小写不做校验（支持中文）
    'subject-case': [0]
  }
};
```

### 4.3 配置 commit-msg hook

```bash
# 创建 commit-msg hook
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg

# Windows 用户使用
echo npx --no -- commitlint --edit %1 > .husky/commit-msg

# 添加执行权限（Mac/Linux）
chmod +x .husky/commit-msg
```

或者手动创建 `.husky/commit-msg` 文件：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
```

### 4.4 Commit 消息规范

**格式**：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例**：

```bash
# ✅ 正确的提交
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复购物车计算错误"
git commit -m "docs: 更新 README"
git commit -m "feat(user): 添加用户注册功能"

# ❌ 错误的提交
git commit -m "更新代码"           # 缺少 type
git commit -m "update"            # type 不规范
git commit -m "feat：添加功能"     # 中文冒号
```

**常用 Type**：

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加用户搜索功能` |
| `fix` | Bug 修复 | `fix: 修复登录页面样式错误` |
| `docs` | 文档变更 | `docs: 更新 README` |
| `style` | 代码格式 | `style: 格式化代码` |
| `refactor` | 重构 | `refactor: 重构用户模块` |
| `perf` | 性能优化 | `perf: 优化图片加载速度` |
| `test` | 测试 | `test: 添加用户登录测试` |
| `chore` | 其他修改 | `chore: 更新依赖` |

### 4.5 测试 Commitlint

```bash
# ❌ 不规范的提交会被拒绝
git commit -m "update"
# 输出：✖ type must be one of [feat, fix, docs, ...]

# ✅ 规范的提交会通过
git commit -m "feat: 添加新功能"
# 提交成功
```

## 第五步：配置 EditorConfig（可选）

EditorConfig 帮助不同编辑器之间保持一致的编码风格。

### 5.1 创建 .editorconfig

```ini
# .editorconfig
root = true

# 所有文件
[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

# Markdown 文件
[*.md]
trim_trailing_whitespace = false

# Python 文件
[*.py]
indent_size = 4

# Makefile
[Makefile]
indent_style = tab
```

### 5.2 VSCode 配置

EditorConfig 在 VSCode 中原生支持，无需额外配置。

如果需要，可以在 `.vscode/settings.json` 中添加：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.detectIndentation": false
}
```

## 第六步：配置 Stylelint（可选）

Stylelint 用于检查和格式化 CSS/SCSS 代码。

### 6.1 安装 Stylelint

```bash
# 基础安装
npm install --save-dev stylelint stylelint-config-standard

# SCSS 项目
npm install --save-dev \
  stylelint \
  stylelint-config-standard-scss \
  stylelint-config-prettier

# Vue 项目
npm install --save-dev \
  stylelint \
  stylelint-config-standard-scss \
  stylelint-config-recommended-vue \
  stylelint-config-prettier \
  postcss-html

# 属性排序插件（可选）
npm install --save-dev stylelint-order
```

### 6.2 创建配置文件

**纯 CSS 项目**：

```javascript
// .stylelintrc.cjs
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-prettier'
  ],
  rules: {
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'selector-class-pattern': null
  }
};
```

**Vue 3 + SCSS 项目**：

```javascript
// .stylelintrc.cjs
module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue',
    'stylelint-config-prettier'
  ],
  overrides: [
    {
      files: ['*.vue', '**/*.vue'],
      customSyntax: 'postcss-html'
    }
  ],
  rules: {
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global']
      }
    ]
  }
};
```

### 6.3 创建 .stylelintignore

```
node_modules/
dist/
build/
public/
**/*.min.css
```

### 6.4 更新 package.json scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx,.vue",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx,.vue --fix",
    "lint:css": "stylelint \"**/*.{css,scss,vue}\"",
    "lint:css:fix": "stylelint \"**/*.{css,scss,vue}\" --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,vue,json,css,scss,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,vue,json,css,scss,md}\""
  }
}
```

### 6.5 更新 lint-staged 配置

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.vue": [
      "eslint --fix",
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### 6.6 测试 Stylelint

```bash
# 检查 CSS
npm run lint:css

# 自动修复
npm run lint:css:fix
```

## 完整配置示例

### Vue 3 + TypeScript 项目完整配置

**项目结构**：

```
my-vue-project/
├── .husky/
│   ├── commit-msg
│   └── pre-commit
├── src/
├── .editorconfig
├── .eslintignore
├── .eslintrc.cjs
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── .stylelintignore
├── .stylelintrc.cjs
├── commitlint.config.cjs
└── package.json
```

**package.json**：

```json
{
  "name": "my-vue-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "prepare": "husky",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx,.vue",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx,.vue --fix",
    "lint:css": "stylelint \"**/*.{css,scss,vue}\"",
    "lint:css:fix": "stylelint \"**/*.{css,scss,vue}\" --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,vue,json,css,scss,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,vue,json,css,scss,md}\""
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@commitlint/cli": "^18.4.3",
    "@commitlint/config-conventional": "^18.4.3",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.0.1",
    "eslint-plugin-vue": "^9.19.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "postcss-html": "^1.5.0",
    "prettier": "^3.1.1",
    "stylelint": "^16.0.2",
    "stylelint-config-prettier": "^9.0.5",
    "stylelint-config-recommended-vue": "^1.5.0",
    "stylelint-config-standard-scss": "^12.0.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "vue-tsc": "^1.8.25"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.vue": [
      "eslint --fix",
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**.eslintrc.cjs**：

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
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2021,
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'vue/multi-word-component-names': ['error', {
      ignores: ['index', 'App', '[id]']
    }],
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
};
```

**.prettierrc.json**：

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false
}
```

**commitlint.config.cjs**：

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert', 'build']
    ],
    'subject-case': [0]
  }
};
```

**.stylelintrc.cjs**：

```javascript
module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue',
    'stylelint-config-prettier'
  ],
  overrides: [
    {
      files: ['*.vue', '**/*.vue'],
      customSyntax: 'postcss-html'
    }
  ],
  rules: {
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global']
      }
    ]
  }
};
```

**.editorconfig**：

```ini
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

**.husky/pre-commit**：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**.husky/commit-msg**：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
```

## VSCode 配置

为了获得最佳开发体验，推荐配置 VSCode。

### 安装扩展

在 VSCode 中搜索并安装以下扩展：

1. **ESLint** - `dbaeumer.vscode-eslint`
2. **Prettier** - `esbenp.prettier-vscode`
3. **Stylelint** - `stylelint.vscode-stylelint`
4. **EditorConfig** - `editorconfig.editorconfig`

### 工作区配置

创建 `.vscode/settings.json`：

```json
{
  // 编辑器设置
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit"
  },
  "editor.detectIndentation": false,
  
  // ESLint
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  
  // Stylelint
  "stylelint.enable": true,
  "stylelint.validate": [
    "css",
    "scss",
    "sass",
    "less",
    "vue"
  ],
  
  // 禁用内置验证（避免冲突）
  "css.validate": false,
  "scss.validate": false,
  "less.validate": false,
  
  // 文件关联
  "files.associations": {
    "*.css": "css",
    "*.scss": "scss"
  }
}
```

### 推荐扩展列表

创建 `.vscode/extensions.json`：

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "stylelint.vscode-stylelint",
    "editorconfig.editorconfig",
    "vue.volar"
  ]
}
```

## 常见问题

### 1. ESLint 和 Prettier 冲突

**问题**：ESLint 的格式规则和 Prettier 冲突

**解决方案**：

```bash
# 安装集成插件
npm install --save-dev eslint-config-prettier eslint-plugin-prettier

# 在 ESLint 配置中添加（必须放在最后）
extends: [
  // ... 其他配置
  'plugin:prettier/recommended'  // 必须放在最后
]
```

### 2. Husky 不生效

**问题**：提交时没有触发检查

**解决方案**：

```bash
# 重新安装 Git hooks
rm -rf .husky
npx husky init

# 检查 .husky 目录权限（Mac/Linux）
chmod +x .husky/*

# 确保 package.json 中有 prepare 脚本
{
  "scripts": {
    "prepare": "husky"
  }
}

# 重新安装依赖
npm install
```

### 3. Commitlint 不生效

**问题**：提交不规范的消息没有被拦截

**解决方案**：

```bash
# 检查 commit-msg hook
cat .husky/commit-msg
# 应该包含：npx --no -- commitlint --edit $1

# 手动测试
echo "test message" | npx commitlint

# 检查配置文件
npx commitlint --print-config
```

### 4. 模块系统问题

**问题**：配置文件无法加载或报错

**解决方案**：

```bash
# 如果 package.json 中 "type": "module"
# 使用 .cjs 后缀
.eslintrc.cjs
.prettierrc.cjs
commitlint.config.cjs
.stylelintrc.cjs

# 如果没有 "type" 或 "type": "commonjs"
# 使用 .js 后缀
.eslintrc.js
.prettierrc.js
commitlint.config.js
.stylelintrc.js
```

### 5. Windows 下路径问题

**问题**：Windows 下 Husky 或 lint-staged 报错

**解决方案**：

```json
// package.json
{
  "lint-staged": {
    // Windows 使用正斜杠
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### 6. Stylelint 在 Vue 文件中报错

**问题**：Vue 文件中的 `:deep` 等伪类报错

**解决方案**：

```javascript
// .stylelintrc.cjs
module.exports = {
  rules: {
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global', 'v-deep']
      }
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep']
      }
    ]
  }
};
```

## 最佳实践

### 1. 团队协作

**文档化规范**：

在项目 `README.md` 中添加：

```markdown
## 开发规范

本项目使用以下工具确保代码质量和风格统一：

- **ESLint**：JavaScript/TypeScript 代码检查
- **Prettier**：代码格式化
- **Stylelint**：CSS/SCSS 代码检查
- **Commitlint**：Git 提交消息规范

### 快速开始

```bash
# 安装依赖
npm install

# 代码检查
npm run lint

# 代码格式化
npm run format

# CSS 检查
npm run lint:css
```

### Git 提交规范

```bash
# 格式
<type>(<scope>): <subject>

# 示例
feat: 添加用户登录功能
fix: 修复购物车计算错误
docs: 更新 API 文档
```

### VSCode 配置

请安装以下扩展以获得最佳开发体验：
- ESLint
- Prettier
- Stylelint
- EditorConfig
```

### 2. CI/CD 集成

**GitHub Actions**：

```yaml
# .github/workflows/code-quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run Prettier Check
        run: npm run format:check
      
      - name: Run Stylelint
        run: npm run lint:css
      
      - name: Validate Commit Messages
        if: github.event_name == 'pull_request'
        run: npx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }}
```

### 3. 渐进式迁移

对于已有项目，建议逐步迁移：

**第一阶段**：只配置格式化
```bash
npm install --save-dev prettier
# 配置 .prettierrc.json
# 运行 npm run format
```

**第二阶段**：添加代码检查
```bash
npm install --save-dev eslint
# 配置 .eslintrc.cjs
# 逐个目录修复问题
```

**第三阶段**：添加 Git hooks
```bash
npm install --save-dev husky lint-staged
# 配置 Git hooks
```

**第四阶段**：添加提交规范
```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
# 配置 commitlint
```

### 4. 性能优化

**使用缓存**：

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx,.vue --cache",
    "lint:css": "stylelint \"**/*.{css,scss,vue}\" --cache"
  }
}
```

**并行执行**：

```bash
npm install --save-dev npm-run-all

# package.json
{
  "scripts": {
    "lint:all": "npm-run-all --parallel lint lint:css",
    "lint:all:fix": "npm-run-all --parallel lint:fix lint:css:fix"
  }
}
```

## 总结

通过本文档的配置，你的项目将拥有：

### ✅ 已完成

1. **代码质量保障**
   - ESLint 检查 JavaScript/TypeScript 代码
   - Stylelint 检查 CSS/SCSS 代码
   - Prettier 统一代码格式

2. **提交流程规范**
   - Husky 管理 Git hooks
   - lint-staged 只检查暂存文件
   - Commitlint 规范提交消息

3. **编辑器统一**
   - EditorConfig 统一编辑器配置
   - VSCode 配置自动格式化和修复

4. **团队协作**
   - 统一的代码风格
   - 清晰的提交历史
   - 自动化的质量检查

### 🎯 下一步

1. **团队培训**：确保所有成员了解配置和规范
2. **CI/CD 集成**：在构建流程中强制检查
3. **持续优化**：根据团队反馈调整规则
4. **文档更新**：保持规范文档的及时更新

## 参考资源

- [ESLint 官方文档](https://eslint.org/)
- [Prettier 官方文档](https://prettier.io/)
- [Husky 官方文档](https://typicode.github.io/husky/)
- [Commitlint 官方文档](https://commitlint.js.org/)
- [EditorConfig 官方文档](https://editorconfig.org/)
- [Stylelint 官方文档](https://stylelint.io/)
- [Conventional Commits 规范](https://www.conventionalcommits.org/)

---

🎉 恭喜！你已经完成了前端代码规范的完整配置！
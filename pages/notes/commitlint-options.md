---
title: commitlint 配置选项
date: 2025-11-27
duration: 120min
type: notes
art: random
---

[[toc]]

## 什么是 commitlint

[commitlint](https://commitlint.js.org/) 是一个用于检查 Git commit 消息格式的工具，帮助团队：

- 📝 **统一提交格式**：强制执行一致的 commit 消息规范
- 🔍 **自动检查**：在提交前自动验证消息格式
- 📋 **自动生成日志**：基于规范的提交自动生成 CHANGELOG
- 🤝 **团队协作**：确保所有成员遵循相同的提交规范
- 🔧 **高度可配置**：支持自定义规则和插件

```bash
# 安装 commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# 初始化配置文件
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
```

:::tip 版本说明
本文档基于 **@commitlint/cli 19.x** 编写，适用于使用 Conventional Commits 规范的项目。

**当前稳定版本**：
- **@commitlint/cli**: v19.6.0 (2024 年发布)
- **@commitlint/config-conventional**: v19.6.0

**主要版本历史**：
- **v19.x** (2024)：当前稳定版本，改进配置系统，增强 TypeScript 支持
- **v18.x** (2023)：移除对 Node.js 16 的支持，要求 Node.js >= 18
- **v17.x** (2023)：完全迁移到 TypeScript
- **v16.x** (2022)：支持 ES Modules

**运行环境要求**：
- ✅ **Node.js >= 18** (推荐使用 LTS 版本)
- ✅ **Git >= 2.13.2**
- ⚠️ **Node.js 24+** 用户需要注意模块加载变化（见下方警告）
:::

:::warning 注意事项
- 本文档使用 **ES Module** 语法 (`export default`)，适用于现代 Node.js 项目
- 如果项目使用 CommonJS，配置文件应使用 `module.exports` 语法
- commitlint 配置支持多种文件格式：`.commitlintrc.js`、`commitlint.config.js`、`.commitlintrc.json` 等
- 推荐与 Husky 配合使用，在 commit-msg hook 中自动检查提交信息

**Node.js 24+ 重要提示**：
- Node v24 改变了模块加载方式，可能导致配置文件加载失败
- 如果遇到 `Please add rules to your commitlint.config.js` 错误：
  - 方案 1：添加 `package.json`，运行 `npm init es6` 声明为 ES6 模块
  - 方案 2：将配置文件重命名为 `commitlint.config.mjs`
:::

## 为什么需要 commitlint

**传统问题**：

```bash
# ❌ 不规范的 commit 消息
git commit -m "fix bug"
git commit -m "update"
git commit -m "修复了一些问题"
git commit -m "WIP"
```

**使用 commitlint 后**：

```bash
# ✅ 规范的 commit 消息
git commit -m "fix: 修复用户登录失败的问题"
git commit -m "feat: 添加用户个人资料页面"
git commit -m "docs: 更新 API 文档"
git commit -m "chore: 升级依赖版本"
```

## Commit 消息规范

### Conventional Commits 格式

commitlint 默认使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例**：

```
feat(user): 添加用户注册功能

- 实现用户注册表单
- 添加邮箱验证
- 集成第三方登录

Closes #123
```

### 结构说明

#### 1. Header（必需）

```
<type>(<scope>): <subject>
```

- **type**：提交类型（必需）
- **scope**：影响范围（可选）
- **subject**：简短描述（必需）

#### 2. Body（可选）

详细描述，说明修改的动机和与之前行为的对比。

#### 3. Footer（可选）

- 关联 issue：`Closes #123`
- 破坏性变更：`BREAKING CHANGE: 描述`

### 常用 Type 类型

| Type | 描述 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加用户搜索功能` |
| `fix` | Bug 修复 | `fix: 修复登录页面样式错误` |
| `docs` | 文档变更 | `docs: 更新 README` |
| `style` | 代码格式（不影响功能） | `style: 格式化代码` |
| `refactor` | 重构（不是新增功能或修复 bug） | `refactor: 重构用户模块` |
| `perf` | 性能优化 | `perf: 优化图片加载速度` |
| `test` | 测试相关 | `test: 添加用户登录测试` |
| `build` | 构建系统或外部依赖变更 | `build: 升级 webpack 到 v5` |
| `ci` | CI 配置文件和脚本变更 | `ci: 添加 GitHub Actions` |
| `chore` | 其他不修改 src 或测试的变更 | `chore: 更新 .gitignore` |
| `revert` | 回滚之前的提交 | `revert: 回滚到版本 1.0.0` |

## 配置文件

commitlint 支持多种配置文件格式：

```bash
# JavaScript（推荐）
commitlint.config.js
commitlint.config.cjs
commitlint.config.mjs

# TypeScript
commitlint.config.ts
commitlint.config.cts
commitlint.config.mts

# JSON
.commitlintrc.json
.commitlintrc

# YAML
.commitlintrc.yaml
.commitlintrc.yml

# package.json 中配置
{
  "commitlint": {
    // 配置项
  }
}
```

**推荐使用** `commitlint.config.js` 或 `commitlint.config.mjs`。

### 配置文件后缀说明

#### commitlint.config.js vs commitlint.config.mjs

根据项目的模块系统选择：

**1. commitlint.config.js**

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'
    ]]
  }
};
```

**使用模块系统**：
- `package.json` 中 `"type": "commonjs"` 或未指定 → CommonJS
- `package.json` 中 `"type": "module"` → ES Module（需要 `export default`）

**2. commitlint.config.mjs（ES Module 项目推荐）**

```javascript
// commitlint.config.mjs
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'
    ]]
  }
};
```

**适用场景**：
- 项目 `package.json` 中有 `"type": "module"`
- Node.js 22+ 推荐使用

## 一、核心配置选项

### 1.1 extends

**作用**：继承共享配置。

```javascript
export default {
  extends: ['@commitlint/config-conventional']
};
```

**常用配置**：

```javascript
export default {
  extends: [
    '@commitlint/config-conventional',  // 标准规范（推荐）
    '@commitlint/config-angular',       // Angular 规范
    '@commitlint/config-lerna-scopes',  // Lerna monorepo
    '@commitlint/config-nx-scopes'      // Nx workspace
  ]
};
```

**@commitlint/config-conventional 包含的规则**：

- type 必须是指定的类型之一
- type 不能为空
- subject 不能为空
- subject 以小写字母开头
- subject 结尾不能有句号
- 等等...

**影响对比**：

```bash
# ❌ 不使用 extends（无规则）
git commit -m "update"          # ✅ 通过（没有检查）
git commit -m "随便写"           # ✅ 通过（没有检查）

# ✅ 使用 config-conventional
git commit -m "update"          # ❌ 错误：type 和 subject 格式不正确
git commit -m "feat: 添加功能"   # ✅ 通过
```

### 1.2 rules

**作用**：配置具体的检查规则。

```javascript
export default {
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs']],
    'subject-case': [0],  // 禁用规则
    'header-max-length': [2, 'always', 100]
  }
};
```

**规则格式**：

```javascript
'rule-name': [
  level,      // 0: 禁用, 1: 警告, 2: 错误
  applicable, // 'always' 或 'never'
  value       // 规则的值
]
```

**level 说明**：

```javascript
export default {
  rules: {
    // 0: 禁用规则
    'subject-case': [0],
    
    // 1: 警告（不会阻止提交）
    'subject-full-stop': [1, 'never', '.'],
    
    // 2: 错误（会阻止提交）
    'type-empty': [2, 'never']
  }
};
```

**影响对比**：

```bash
# subject-case: [0] - 禁用
git commit -m "feat: Add Feature"   # ✅ 通过
git commit -m "feat: add feature"   # ✅ 通过

# subject-case: [2, 'always', 'lower-case'] - 错误
git commit -m "feat: Add Feature"   # ❌ 错误：subject 必须小写
git commit -m "feat: add feature"   # ✅ 通过

# subject-case: [1, 'always', 'lower-case'] - 警告
git commit -m "feat: Add Feature"   # ⚠️ 警告：subject 必须小写（但仍能提交）
```

### 1.3 parserPreset

**作用**：指定解析器预设。

```javascript
export default {
  parserPreset: 'conventional-changelog-angular'
};
```

**常用预设**：

```javascript
export default {
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/,
      headerCorrespondence: ['type', 'scope', 'subject']
    }
  }
};
```

### 1.4 formatter

**作用**：指定输出格式化器。

```javascript
export default {
  formatter: '@commitlint/format'
};
```

### 1.5 ignores

**作用**：忽略特定的 commit 消息。

```javascript
export default {
  ignores: [
    (commit) => commit.includes('WIP'),
    (commit) => commit.includes('[skip ci]')
  ]
};
```

**影响对比**：

```bash
# 配置 ignores
export default {
  ignores: [(commit) => commit.includes('WIP')]
};

# 提交
git commit -m "WIP: 开发中"        # ✅ 通过（被忽略）
git commit -m "feat: 添加功能"     # ✅ 通过（正常检查）
git commit -m "update"            # ❌ 错误（正常检查）
```

### 1.6 defaultIgnores

**作用**：是否使用默认的忽略规则。

```javascript
export default {
  defaultIgnores: true  // 默认为 true
};
```

**默认忽略的消息类型**：
- `Merge pull request` - Merge PR 消息
- `Merge X into Y` - 合并分支消息
- `Merge branch X` - 合并分支消息
- `Revert X` - 回滚提交消息
- `v1.2.3` - Semver 版本号格式
- `Automatic merge X` - 自动合并消息
- `Auto-merged X into Y` - 自动合并消息

**影响对比**：

```bash
# defaultIgnores: true（默认）
git commit -m "Merge pull request #123"  # ✅ 通过（被忽略）
git commit -m "Revert commit abc123"     # ✅ 通过（被忽略）
git commit -m "v1.2.3"                   # ✅ 通过（被忽略）
git commit -m "feat: 添加功能"            # ✅ 通过（正常检查）

# defaultIgnores: false
git commit -m "Merge pull request #123"  # ❌ 错误（不符合规范）
git commit -m "feat: 添加功能"            # ✅ 通过（正常检查）
```

**参考**：完整的默认忽略规则列表可查看 [@commitlint/is-ignored](https://github.com/conventional-changelog/commitlint/blob/master/%40commitlint/is-ignored/src/defaults.ts)

### 1.7 helpUrl

**作用**：自定义帮助文档链接。

```javascript
export default {
  helpUrl: 'https://github.com/your-org/commit-convention'
};
```

**影响**：当提交检查失败时，会在错误信息中显示自定义的帮助链接。

```bash
# 默认 helpUrl
✖   found 1 problems, 0 warnings
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint

# 自定义 helpUrl
✖   found 1 problems, 0 warnings
ⓘ   Get help: https://github.com/your-org/commit-convention
```

### 1.8 prompt

**作用**：配置交互式提示的选项（配合 `@commitlint/prompt` 使用）。

```javascript
export default {
  prompt: {
    messages: {
      // 自定义提示消息
    },
    questions: {
      type: {
        description: '请选择提交类型:',
        enum: {
          feat: {
            description: '新功能',
            title: 'Features'
          },
          fix: {
            description: 'Bug 修复',
            title: 'Bug Fixes'
          }
        }
      },
      scope: {
        description: '请输入影响范围 (可选):'
      },
      subject: {
        description: '请输入简短描述:'
      }
    }
  }
};
```

**使用场景**：配合 `@commitlint/prompt-cli` 使用，提供交互式提交体验。

```bash
# 安装
npm install --save-dev @commitlint/prompt-cli

# 使用
npx commit
```

## 二、常用规则详解

### 2.1 Type 相关规则

#### type-enum

**作用**：限制 type 的可选值。

```javascript
export default {
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // Bug 修复
        'docs',     // 文档变更
        'style',    // 代码格式
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 测试
        'build',    // 构建系统
        'ci',       // CI 配置
        'chore',    // 其他变更
        'revert'    // 回滚
      ]
    ]
  }
};
```

**影响对比**：

```bash
# type-enum 配置如上
git commit -m "feat: 添加功能"      # ✅ 通过
git commit -m "fix: 修复 bug"      # ✅ 通过
git commit -m "feature: 添加功能"   # ❌ 错误：type 'feature' 不在允许列表中
git commit -m "update: 更新代码"    # ❌ 错误：type 'update' 不在允许列表中
```

#### type-empty

**作用**：type 不能为空。

```javascript
export default {
  rules: {
    'type-empty': [2, 'never']
  }
};
```

**影响对比**：

```bash
git commit -m "添加功能"           # ❌ 错误：type 不能为空
git commit -m "feat: 添加功能"     # ✅ 通过
```

#### type-case

**作用**：type 的大小写格式。

```javascript
export default {
  rules: {
    'type-case': [2, 'always', 'lower-case']
  }
};
```

**可选值**：
- `lower-case`：小写
- `upper-case`：大写
- `camel-case`：驼峰
- `kebab-case`：短横线
- `snake-case`：下划线

**影响对比**：

```bash
# type-case: [2, 'always', 'lower-case']
git commit -m "feat: 添加功能"     # ✅ 通过
git commit -m "Feat: 添加功能"     # ❌ 错误：type 必须小写
git commit -m "FEAT: 添加功能"     # ❌ 错误：type 必须小写
```

### 2.2 Scope 相关规则

#### scope-enum

**作用**：限制 scope 的可选值。

```javascript
export default {
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'core',
        'ui',
        'api',
        'docs',
        'deps'
      ]
    ]
  }
};
```

**影响对比**：

```bash
git commit -m "feat(ui): 添加按钮"     # ✅ 通过
git commit -m "feat(api): 添加接口"    # ✅ 通过
git commit -m "feat(user): 添加功能"   # ❌ 错误：scope 'user' 不在允许列表中
git commit -m "feat: 添加功能"        # ✅ 通过（scope 可选）
```

#### scope-case

**作用**：scope 的大小写格式。

```javascript
export default {
  rules: {
    'scope-case': [2, 'always', 'lower-case']
  }
};
```

**影响对比**：

```bash
git commit -m "feat(ui): 添加功能"     # ✅ 通过
git commit -m "feat(UI): 添加功能"     # ❌ 错误：scope 必须小写
```

#### scope-empty

**作用**：scope 是否可以为空。

```javascript
export default {
  rules: {
    'scope-empty': [2, 'never']  // 不允许为空
  }
};
```

**影响对比**：

```bash
# scope-empty: [2, 'never']
git commit -m "feat: 添加功能"        # ❌ 错误：scope 不能为空
git commit -m "feat(ui): 添加功能"     # ✅ 通过
```

### 2.3 Subject 相关规则

#### subject-empty

**作用**：subject 不能为空。

```javascript
export default {
  rules: {
    'subject-empty': [2, 'never']
  }
};
```

**影响对比**：

```bash
git commit -m "feat:"              # ❌ 错误：subject 不能为空
git commit -m "feat: 添加功能"      # ✅ 通过
```

#### subject-case

**作用**：subject 的大小写格式。

```javascript
export default {
  rules: {
    'subject-case': [
      2,
      'always',
      ['sentence-case', 'lower-case']
    ]
  }
};
```

**可选值**：
- `lower-case`：小写
- `upper-case`：大写
- `sentence-case`：句子格式（首字母大写）
- `start-case`：每个单词首字母大写

**影响对比**：

```bash
# subject-case: [2, 'always', 'lower-case']
git commit -m "feat: add feature"      # ✅ 通过
git commit -m "feat: Add Feature"      # ❌ 错误：subject 必须小写
git commit -m "feat: 添加功能"         # ✅ 通过（中文不受影响）
```

#### subject-full-stop

**作用**：subject 结尾是否允许句号。

```javascript
export default {
  rules: {
    'subject-full-stop': [2, 'never', '.']
  }
};
```

**影响对比**：

```bash
# subject-full-stop: [2, 'never', '.']
git commit -m "feat: 添加功能"      # ✅ 通过
git commit -m "feat: 添加功能。"    # ❌ 错误：subject 结尾不能有句号
git commit -m "feat: 添加功能."     # ❌ 错误：subject 结尾不能有句号
```

#### subject-max-length

**作用**：subject 最大长度。

```javascript
export default {
  rules: {
    'subject-max-length': [2, 'always', 50]
  }
};
```

**影响对比**：

```bash
# subject-max-length: [2, 'always', 50]
git commit -m "feat: 添加功能"                     # ✅ 通过（8 字符）
git commit -m "feat: 这是一个非常非常非常非常非常非常非常长的描述"  # ❌ 错误：超过 50 字符
```

#### subject-min-length

**作用**：subject 最小长度。

```javascript
export default {
  rules: {
    'subject-min-length': [2, 'always', 10]
  }
};
```

### 2.4 Header 相关规则

#### header-max-length

**作用**：整个 header 的最大长度。

```javascript
export default {
  rules: {
    'header-max-length': [2, 'always', 100]
  }
};
```

**影响对比**：

```bash
# header-max-length: [2, 'always', 100]
git commit -m "feat(user): 添加用户注册功能"        # ✅ 通过
git commit -m "feat(authentication-system): 实现完整的用户认证和授权系统，包括注册、登录、密码重置等功能"  # ❌ 错误：超过 100 字符
```

#### header-case

**作用**：整个 header 的大小写格式。

```javascript
export default {
  rules: {
    'header-case': [2, 'always', 'lower-case']
  }
};
```

### 2.5 Body 相关规则

#### body-leading-blank

**作用**：body 前面必须有空行。

```javascript
export default {
  rules: {
    'body-leading-blank': [2, 'always']
  }
};
```

**影响对比**：

```bash
# ❌ 错误：body 前没有空行
git commit -m "feat: 添加功能
详细描述"

# ✅ 正确：body 前有空行
git commit -m "feat: 添加功能

详细描述"
```

#### body-max-line-length

**作用**：body 每行最大长度。

```javascript
export default {
  rules: {
    'body-max-line-length': [2, 'always', 100]
  }
};
```

### 2.6 Footer 相关规则

#### footer-leading-blank

**作用**：footer 前面必须有空行。

```javascript
export default {
  rules: {
    'footer-leading-blank': [2, 'always']
  }
};
```

**示例**：

```bash
# ✅ 正确
git commit -m "feat: 添加功能

详细描述

Closes #123"
```

## 三、完整推荐配置

### 3.1 基础配置（推荐）

```javascript
// commitlint.config.mjs
export default {
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
        'style',    // 代码格式（不影响代码运行的变动）
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 增加测试
        'chore',    // 构建过程或辅助工具的变动
        'revert',   // 回退
        'build'     // 打包
      ]
    ],
    // subject 大小写不做校验
    'subject-case': [0],
    // subject 最大长度
    'subject-max-length': [2, 'always', 50],
    // header 最大长度
    'header-max-length': [2, 'always', 100]
  }
};
```

### 3.2 中文项目配置

```javascript
// commitlint.config.mjs
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 bug
        'docs',     // 文档变更
        'style',    // 代码格式
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 测试
        'chore',    // 其他修改
        'revert',   // 回滚
        'build'     // 构建
      ]
    ],
    // subject 大小写不做校验（支持中文）
    'subject-case': [0],
    // subject 最大长度（中文占用字符多）
    'subject-max-length': [2, 'always', 72],
    // header 最大长度
    'header-max-length': [2, 'always', 100],
    // body 每行最大长度
    'body-max-line-length': [2, 'always', 100],
    // subject 前导空格
    'subject-leading-blank': [0]
  }
};
```

### 3.3 Monorepo 配置（Lerna/Nx）

```javascript
// commitlint.config.mjs
export default {
  extends: [
    '@commitlint/config-conventional',
    '@commitlint/config-lerna-scopes'  // 自动检测 packages 下的包名作为 scope
  ],
  rules: {
    'scope-enum': [0],  // 禁用，使用 lerna-scopes 自动检测
    'scope-empty': [2, 'never']  // scope 不能为空
  }
};
```

**目录结构**：

```
monorepo/
├── packages/
│   ├── core/
│   ├── ui/
│   └── utils/
└── commitlint.config.mjs
```

**提交示例**：

```bash
git commit -m "feat(core): 添加核心功能"
git commit -m "fix(ui): 修复按钮样式"
git commit -m "docs(utils): 更新工具文档"
```

### 3.4 严格配置

```javascript
// commitlint.config.mjs
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type 必须在指定范围内
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore']
    ],
    // type 不能为空
    'type-empty': [2, 'never'],
    // type 必须小写
    'type-case': [2, 'always', 'lower-case'],
    
    // scope 必须指定
    'scope-empty': [2, 'never'],
    // scope 必须在指定范围内
    'scope-enum': [
      2,
      'always',
      ['components', 'utils', 'api', 'docs', 'styles', 'config']
    ],
    // scope 必须小写
    'scope-case': [2, 'always', 'lower-case'],
    
    // subject 不能为空
    'subject-empty': [2, 'never'],
    // subject 必须小写开头
    'subject-case': [2, 'always', 'lower-case'],
    // subject 不能以句号结尾
    'subject-full-stop': [2, 'never', '.'],
    // subject 最小长度
    'subject-min-length': [2, 'always', 10],
    // subject 最大长度
    'subject-max-length': [2, 'always', 50],
    
    // header 最大长度
    'header-max-length': [2, 'always', 72],
    
    // body 前必须有空行
    'body-leading-blank': [2, 'always'],
    // body 每行最大长度
    'body-max-line-length': [2, 'always', 100],
    
    // footer 前必须有空行
    'footer-leading-blank': [2, 'always']
  }
};
```

### 3.5 自定义类型配置

```javascript
// commitlint.config.mjs
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',      // 新功能
        'fix',       // Bug 修复
        'docs',      // 文档更新
        'ui',        // UI/样式更新
        'refactor',  // 代码重构
        'perf',      // 性能优化
        'test',      // 测试相关
        'build',     // 构建相关
        'ci',        // CI 配置
        'chore',     // 其他修改
        'revert',    // 回滚
        'wip',       // 开发中
        'release',   // 发布版本
        'deps'       // 依赖更新
      ]
    ],
    'subject-case': [0]
  }
};
```

## 四、与 Git Hooks 集成

### 4.1 使用 Husky（推荐）

**1. 安装依赖**：

```bash
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional
```

**2. 初始化 husky**：

```bash
npx husky init
```

**3. 添加 commit-msg hook**：

```bash
# Unix/Mac/Linux
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg

# Windows (PowerShell/CMD)
# 注意：Windows 用户需要使用 ` (反引号) 转义 $
echo "npx --no -- commitlint --edit `$1" > .husky/commit-msg
```

**不同包管理器的 hook 配置**：

```bash
# npm (推荐)
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg

# pnpm
echo "pnpm dlx commitlint --edit \$1" > .husky/commit-msg

# yarn
echo "yarn commitlint --edit \$1" > .husky/commit-msg

# bun
echo "bunx commitlint --edit \$1" > .husky/commit-msg
```

**4. 配置 commitlint**：

```javascript
// commitlint.config.mjs
export default {
  extends: ['@commitlint/config-conventional']
};
```

**5. 测试**：

```bash
# ❌ 不规范的提交会被拒绝
git commit -m "update"

# 输出示例：
# ⧗   input: update
# ✖   subject may not be empty [subject-empty]
# ✖   type may not be empty [type-empty]
# ✖   found 2 problems, 0 warnings
# ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint

# ✅ 规范的提交会通过
git commit -m "feat: 添加用户登录功能"

# 输出示例：
# [main abc1234] feat: 添加用户登录功能
# 1 file changed, 10 insertions(+)
```

**测试另一个不符合规范的示例**：

```bash
git commit -m "foo: this will fail"

# 输出示例：
# ⧗   input: foo: this will fail
# ✖   type must be one of [build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test] [type-enum]
# ✖   found 1 problems, 0 warnings
# ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint
```

### 4.2 使用 simple-git-hooks

**1. 安装依赖**：

```bash
npm install --save-dev simple-git-hooks @commitlint/cli @commitlint/config-conventional
```

**2. 配置 package.json**：

```json
{
  "simple-git-hooks": {
    "commit-msg": "npx --no -- commitlint --edit $1"
  },
  "scripts": {
    "prepare": "simple-git-hooks"
  }
}
```

**3. 初始化**：

```bash
npx simple-git-hooks
```

### 4.3 完整工作流配置

```json
// package.json
{
  "scripts": {
    "prepare": "husky",
    "commit": "git-cz"
  },
  "devDependencies": {
    "@commitlint/cli": "^18.4.3",
    "@commitlint/config-conventional": "^18.4.3",
    "commitizen": "^4.3.0",
    "cz-conventional-changelog": "^3.3.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**.husky/commit-msg**：

```bash
#!/usr/bin/env sh
npx --no -- commitlint --edit $1
```

**.husky/pre-commit**：

```bash
#!/usr/bin/env sh
npx lint-staged
```

## 五、使用 Commitizen（可选）

### 5.1 安装 Commitizen

```bash
npm install --save-dev commitizen cz-conventional-changelog
```

### 5.2 配置

```json
// package.json
{
  "scripts": {
    "commit": "git-cz"
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

### 5.3 使用

```bash
# 使用交互式界面提交
npm run commit

# 或者
git cz
```

**交互式流程**：

```bash
? Select the type of change that you're committing: (Use arrow keys)
❯ feat:     A new feature
  fix:      A bug fix
  docs:     Documentation only changes
  style:    Changes that do not affect the meaning of the code
  refactor: A code change that neither fixes a bug nor adds a feature
  perf:     A code change that improves performance
  test:     Adding missing tests

? What is the scope of this change (e.g. component or file name): (press enter to skip)
 user

? Write a short, imperative tense description of the change:
 添加用户注册功能

? Provide a longer description of the change: (press enter to skip)
 实现用户注册表单和邮箱验证

? Are there any breaking changes? (y/N)
 N

? Does this change affect any open issues? (y/N)
 y

? Add issue references (e.g. "fix #123", "re #123".):
 Closes #123
```

## 六、常见问题和最佳实践

### 6.1 提交消息最佳实践

**1. Type 选择指南**：

```bash
# 添加新功能
feat: 添加用户个人资料页面

# 修复 bug
fix: 修复登录页面无法提交的问题

# 更新文档
docs: 更新 API 使用文档

# 代码格式调整（不影响功能）
style: 格式化用户模块代码

# 重构代码（不是新功能也不是修复 bug）
refactor: 重构用户认证逻辑

# 性能优化
perf: 优化列表渲染性能

# 添加或修改测试
test: 添加用户登录单元测试

# 构建相关（依赖、配置等）
build: 升级 webpack 到 v5

# CI 配置修改
ci: 添加自动化部署流程

# 其他修改（不修改 src 或 test）
chore: 更新 .gitignore
```

**2. Subject 编写指南**：

```bash
# ✅ 好的 subject
feat: 添加用户注册功能
fix: 修复购物车数量计算错误
docs: 更新部署文档

# ❌ 不好的 subject
feat: add feature        # 描述太模糊
fix: bug                 # 没说明修复了什么
docs: update             # 没说明更新了什么
```

**3. Scope 使用指南**：

```bash
# 按模块划分
feat(user): 添加用户注册功能
fix(payment): 修复支付失败问题
docs(api): 更新 API 文档

# 按文件/组件划分
feat(Button): 添加加载状态
fix(LoginForm): 修复表单验证
style(Header): 调整头部样式

# Monorepo 按包名划分
feat(core): 添加核心功能
fix(ui): 修复组件样式
docs(utils): 更新工具文档
```

**4. Body 编写指南**：

```bash
git commit -m "feat: 添加用户注册功能

- 实现注册表单UI
- 添加邮箱格式验证
- 集成第三方OAuth登录
- 添加验证码功能

实现思路：
1. 使用 Formik 管理表单状态
2. 使用 Yup 进行表单验证
3. 使用 React Query 处理API请求
"
```

**5. Footer 编写指南**：

```bash
# 关联 issue
git commit -m "fix: 修复登录失败的问题

Closes #123
Closes #456"

# 破坏性变更
git commit -m "feat: 重构用户API

BREAKING CHANGE: 用户API端点从 /user 改为 /api/users
"

# 同时包含
git commit -m "feat: 升级认证系统

BREAKING CHANGE: 需要重新配置认证密钥

Closes #789
"
```

### 6.2 常见错误解决

**1. subject may not be empty**

```bash
# ❌ 错误
git commit -m "feat:"

# ✅ 正确
git commit -m "feat: 添加功能"
```

**2. type may not be empty**

```bash
# ❌ 错误
git commit -m "添加功能"

# ✅ 正确
git commit -m "feat: 添加功能"
```

**3. type must be one of**

```bash
# ❌ 错误
git commit -m "feature: 添加功能"

# ✅ 正确
git commit -m "feat: 添加功能"
```

**4. subject must not be sentence-case**

```bash
# ❌ 错误（如果配置了 lower-case）
git commit -m "feat: Add Feature"

# ✅ 正确
git commit -m "feat: add feature"

# 或者修改配置允许
export default {
  rules: {
    'subject-case': [0]  // 禁用大小写检查
  }
};
```

**5. header must not be longer than 100 characters**

```bash
# ❌ 错误
git commit -m "feat: 这是一个非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的描述"

# ✅ 正确（简化描述）
git commit -m "feat: 添加用户认证功能"

# 或者使用 body 详细描述
git commit -m "feat: 添加用户认证功能

详细实现：
- 实现用户注册和登录
- 添加JWT令牌验证
- 集成第三方OAuth"
```

### 6.3 配置不生效的排查

**1. 检查配置文件名**：

```bash
# 确保文件名正确
commitlint.config.js
commitlint.config.mjs
.commitlintrc.json
```

**2. 检查模块系统**：

```javascript
// package.json 中有 "type": "module"
// 使用 .mjs 或 export default

// commitlint.config.mjs
export default {
  extends: ['@commitlint/config-conventional']
};

// package.json 中无 "type" 或 "type": "commonjs"
// 使用 .js 和 module.exports

// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional']
};
```

**3. 检查 husky hook**：

```bash
# 确保 hook 文件存在且可执行
ls -la .husky/commit-msg

# 确保内容正确
cat .husky/commit-msg
# 应该包含：npx --no -- commitlint --edit $1
```

**4. 手动测试 commitlint**：

```bash
# 测试配置是否正确
echo "test: message" | npx commitlint

# 测试配置文件是否能加载
npx commitlint --print-config
```

### 6.4 自定义规则和插件

#### 内联自定义规则

```javascript
// commitlint.config.mjs
export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'custom-rule': (parsed) => {
          const { subject } = parsed;
          // 自定义逻辑
          if (subject && subject.includes('TODO')) {
            return [false, 'subject 不能包含 TODO'];
          }
          return [true];
        }
      }
    }
  ],
  rules: {
    'custom-rule': [2, 'always']
  }
};
```

#### 使用外部插件

**1. 创建插件包**：

```javascript
// commitlint-plugin-custom/index.js
module.exports = {
  rules: {
    'no-todo': (parsed) => {
      const { subject } = parsed;
      if (subject && subject.includes('TODO')) {
        return [false, 'subject 不能包含 TODO'];
      }
      return [true];
    },
    'require-jira-ticket': (parsed) => {
      const { subject } = parsed;
      const jiraPattern = /[A-Z]+-\d+/;
      if (!jiraPattern.test(subject)) {
        return [false, 'subject 必须包含 JIRA ticket (例如: PROJ-123)'];
      }
      return [true];
    }
  }
};
```

**2. 在配置中使用插件**：

```javascript
// commitlint.config.mjs
export default {
  extends: ['@commitlint/config-conventional'],
  plugins: ['commitlint-plugin-custom'],
  rules: {
    // 使用插件规则时，格式为: '插件名/规则名'
    'custom/no-todo': [2, 'always'],
    'custom/require-jira-ticket': [1, 'always']  // 警告级别
  }
};
```

**3. package.json 配置**（插件需要声明 peerDependency）：

```json
{
  "name": "commitlint-plugin-custom",
  "peerDependencies": {
    "@commitlint/types": ">=7.6.0"
  }
}
```

**注意事项**：
- 插件支持从 commitlint v7.6.0 开始
- 插件规则使用时需要加上插件名前缀，如 `pluginname/rule-name`
- 插件必须在 `peerDependencies` 中声明 `@commitlint/types`

### 6.5 CI/CD 集成

**GitHub Actions**：

```yaml
# .github/workflows/commitlint.yml
name: Commitlint

on: [push, pull_request]

jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      
      - name: Validate current commit (last commit) with commitlint
        if: github.event_name == 'push'
        run: npx commitlint --from HEAD~1 --to HEAD --verbose
      
      - name: Validate PR commits with commitlint
        if: github.event_name == 'pull_request'
        run: npx commitlint --from ${{ github.event.pull_request.head.sha }}~${{ github.event.pull_request.commits }} --to ${{ github.event.pull_request.head.sha }} --verbose
```

**GitLab CI**：

```yaml
# .gitlab-ci.yml
commitlint:
  stage: test
  image: node:18
  before_script:
    - npm ci
  script:
    - npx commitlint --from $CI_COMMIT_BEFORE_SHA --to $CI_COMMIT_SHA
```

## 七、总结

### 版本支持

**当前版本**：
- **稳定版**: v19.x (推荐)
- **最低 Node.js 要求**: >= 18
- **插件支持**: >= v7.6.0
- **TypeScript 支持**: v17.x+
- **ES Modules 支持**: v16.x+

**版本策略**：
- ✅ 安全补丁会应用到未 EOL 的版本
- ✅ 新功能只会添加到最新主版本
- ⚠️ 不保证为旧版本及时发布补丁（非赞助项目）

### 必须配置的选项

1. **extends**: 继承标准配置
2. **rules**: 根据团队规范自定义
3. **Git Hooks**: 配置 husky 自动检查

### 推荐工作流

1. 安装 commitlint 和配置文件
2. 配置 husky 自动检查
3. 可选：安装 commitizen 或 @commitlint/prompt-cli 交互式提交
4. 在 CI 中验证提交消息
5. 团队培训统一规范

### 常用命令

```bash
# 检查单个消息
echo "feat: add feature" | npx commitlint

# 检查最近的提交
npx commitlint --from HEAD~1 --to HEAD

# 检查指定范围的提交
npx commitlint --from origin/main --to HEAD

# 打印配置
npx commitlint --print-config

# 帮助信息
npx commitlint --help
```

### 学习建议

1. 从标准配置开始：`@commitlint/config-conventional`
2. 理解 Conventional Commits 规范
3. 根据团队需求逐步调整规则
4. 使用 commitizen 降低使用门槛
5. 在团队内推广并培训

### Commit 消息模板

```bash
# 简单格式
<type>(<scope>): <subject>

# 完整格式
<type>(<scope>): <subject>

<body>

<footer>

# 实际示例
feat(user): 添加用户注册功能

- 实现注册表单UI
- 添加邮箱验证
- 集成第三方登录

Closes #123
```

## 参考资源

- [commitlint 官方文档](https://commitlint.js.org/)
- [Conventional Commits 规范](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format)
- [commitizen 文档](https://commitizen-tools.github.io/commitizen/)
- [husky 文档](https://typicode.github.io/husky/)
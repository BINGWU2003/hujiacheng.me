---
title: 前端工程化体系学习指南 - 从实践到原理
date: 2026-01-25
duration: 60min
art: random
---

[[toc]]

:::tip 学习目标
本文档面向**所有前端开发者**，无论你是刚接触工程化，还是有一定使用经验但想系统学习的开发者。

**适合人群**：
- 🔰 **初学者**：刚学完 HTML/CSS/JS，想了解如何搭建规范的项目
- 🌱 **工作驱动学习者**：遇到问题才查资料，没有系统学习过
- 📚 **有经验但想深入**：用过工具但不知道原理，想查漏补缺
- 🎯 **技术决策者**：需要为团队选型和制定规范

**本文特点**：
- ✅ **从零开始**：假设你没有任何工程化基础
- ✅ **问题导向**：先讲为什么需要，再讲怎么做
- ✅ **避坑指南**：标注常见错误和容易忽略的点
- ✅ **实战案例**：每个知识点配合真实场景
- ✅ **循序渐进**：从简单到复杂，逐步深入

**学习路径**：
1. **工程化基础** → 理解为什么需要工程化（20分钟）
2. **代码规范** → 保证代码质量和团队协作（2小时）
3. **构建系统** → 从开发到生产的完整流程（3小时）
4. **包管理** → 依赖管理和多项目管理（2小时）
5. **自动化** → 解放双手，提高效率（1小时）
6. **监控运维** → 保证生产环境稳定（1小时）

**阅读建议**：
- 📖 **首次阅读**：按顺序完整阅读，不跳过基础部分
- 🔖 **查漏补缺**：查看每节的「常见误区」和「容易忽略的点」
- 💻 **边学边练**：跟着示例代码动手实践
- 🔄 **反复回顾**：工程化知识需要在实践中不断加深理解
:::

## 一、前端工程化概述

### 1.1 什么是前端工程化

#### 1.1.1 一个真实的场景

想象你刚入职一家公司，接手一个「没有工程化」的项目：

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app"></div>
  <script src="jquery.js"></script>
  <script src="utils.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

**你会遇到这些问题**：

1. **代码混乱**
   ```javascript
   // app.js - 1000 行代码都在一个文件里
   var userInfo = { name: 'Tom' }
   function login() { /* 100 行代码 */ }
   function logout() { /* 100 行代码 */ }
   // ... 还有 900 行
   ```
   - ❌ 找个函数要翻半天
   - ❌ 不敢随便改，怕影响其他功能
   - ❌ 多人协作容易冲突

2. **代码风格不统一**
   ```javascript
   // 开发者 A 的代码
   function getUserInfo() {
       return userInfo
   }
   
   // 开发者 B 的代码
   const get_user_name = () => {
     return userInfo.name;
   };
   ```
   - ❌ 有的用 tab，有的用空格
   - ❌ 有的用单引号，有的用双引号
   - ❌ 命名风格各不相同

3. **依赖管理混乱**
   ```html
   <!-- 不知道这些 CDN 是什么版本 -->
   <script src="https://cdn.../jquery-3.x.x.js"></script>
   <script src="https://cdn.../lodash.min.js"></script>
   ```
   - ❌ 不知道依赖了哪些库
   - ❌ 不知道库的版本
   - ❌ CDN 挂了网站就打不开

4. **手动部署很痛苦**
   ```bash
   # 每次上线的步骤
   1. 压缩 JS 文件
   2. 压缩 CSS 文件
   3. 上传到服务器
   4. 清理浏览器缓存
   5. 测试是否正常
   ```
   - ❌ 容易漏步骤
   - ❌ 每次都要重复劳动
   - ❌ 出错了不知道怎么回滚

#### 1.1.2 工程化如何解决这些问题

**使用工程化后的项目**：

```
my-project/
├── src/                    # 源代码（开发时写的）
│   ├── components/         # 组件（代码复用）
│   ├── utils/              # 工具函数（模块化）
│   ├── api/                # 接口管理（统一管理）
│   └── main.ts             # 入口文件
├── .eslintrc.js           # 代码规范（自动检查）
├── .prettierrc.js         # 代码格式（自动格式化）
├── package.json           # 依赖管理（版本明确）
└── vite.config.ts         # 构建配置（自动化）
```

**一条命令解决所有问题**：

```bash
# 开发时
npm run dev
# ✅ 自动启动服务器
# ✅ 代码改动自动刷新
# ✅ 自动检查代码规范
# ✅ TypeScript 自动提示

# 部署时
npm run build
# ✅ 自动编译、压缩、优化
# ✅ 自动生成哈希文件名（解决缓存）
# ✅ 自动上传到服务器
# ✅ 自动发送通知
```

#### 1.1.3 工程化的定义

前端工程化是将**软件工程的方法和思想**应用到前端开发中，以**提高开发效率、保证代码质量、优化用户体验**的系统化实践。

**核心价值**：
- 📦 **模块化**：代码拆分、按需加载、依赖管理
- 🔧 **组件化**：UI 组件复用、业务组件抽象
- 📏 **规范化**：代码风格、提交规范、目录结构
- ⚡ **自动化**：构建、测试、部署、发布
- 🎯 **优化**：性能优化、体积优化、加载优化

**简单来说**：
> 工程化就是让你写代码更轻松，让团队协作更顺畅，让项目质量更有保障。

### 1.2 工程化体系全景图

```
┌─────────────────────────────────────────────────────────────┐
│                      前端工程化体系                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  开发规范    │  │  构建系统    │  │  质量保障    │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ • 代码规范   │  │ • 模块打包   │  │ • 单元测试   │     │
│  │ • 提交规范   │  │ • 资源处理   │  │ • E2E 测试   │     │
│  │ • 分支规范   │  │ • 代码转换   │  │ • 性能监控   │     │
│  │ • 文档规范   │  │ • 优化策略   │  │ • 错误追踪   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  包管理      │  │  自动化      │  │  部署运维    │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ • npm/pnpm   │  │ • Git Hooks  │  │ • CI/CD      │     │
│  │ • Monorepo   │  │ • 自动构建   │  │ • 容器化     │     │
│  │ • 依赖管理   │  │ • 自动测试   │  │ • 灰度发布   │     │
│  │ • 版本管理   │  │ • 自动发布   │  │ • 监控告警   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 学习路径建议

#### 阶段一：建立认知（第 1 天）

**目标**：理解为什么需要工程化

**学习内容**：
- [ ] 对比有工程化和无工程化的项目
- [ ] 理解工程化的核心价值
- [ ] 了解工程化工具全景图

**实践任务**：
- 用 Vite 创建第一个项目：`npm create vite@latest`
- 运行 `npm run dev`，观察开发服务器
- 运行 `npm run build`，查看构建产物

#### 阶段二：代码规范（第 2-7 天）

**目标**：保证代码质量和团队协作

**学习内容**：
- [ ] EditorConfig：统一编辑器配置
- [ ] ESLint：代码质量检查
- [ ] Prettier：代码格式化
- [ ] Git Hooks：提交前自动检查

**实践任务**：
```bash
# Day 2-3：配置 ESLint
npm install -D eslint
npx eslint --init

# Day 4-5：配置 Prettier
npm install -D prettier
# 创建 .prettierrc.js

# Day 6-7：配置 Git Hooks
npm install -D husky lint-staged
npx husky init
```

**常见问题**：
- ❓ ESLint 和 Prettier 冲突怎么办？
- ❓ 为什么 Git 提交被拦截了？
- ❓ 如何忽略某些文件的检查？

*（这些问题在后面章节会详细解答）*

#### 阶段三：构建系统（第 8-14 天）

**目标**：理解从开发到生产的完整流程

**学习内容**：
- [ ] 模块化：CommonJS vs ESM
- [ ] Vite：开发服务器和热更新
- [ ] Rollup：生产环境打包
- [ ] 构建优化：代码分割、Tree Shaking

**实践任务**：
```bash
# Day 8-10：理解模块化
# 阅读并运行示例代码

# Day 11-12：配置 Vite
# 修改 vite.config.ts
# 添加插件、配置路径别名

# Day 13-14：构建优化
# 分析打包体积
# 实现代码分割
```

#### 阶段四：包管理（第 15-21 天）

**目标**：管理依赖和多项目

**学习内容**：
- [ ] npm/pnpm/yarn 对比
- [ ] package.json 详解
- [ ] Monorepo 实践
- [ ] 版本管理

**实践任务**：
```bash
# Day 15-17：包管理器
# 理解 package.json
# 学习 pnpm 的优势

# Day 18-21：Monorepo
# 创建多包项目
# 配置 pnpm workspace
# 使用 Turborepo 加速构建
```

#### 阶段五：自动化（第 22-28 天）

**目标**：自动化构建、测试、部署

**学习内容**：
- [ ] GitHub Actions
- [ ] 自动化测试
- [ ] 自动化部署
- [ ] 错误监控

**实践任务**：
```bash
# Day 22-24：CI/CD
# 配置 GitHub Actions
# 自动运行测试

# Day 25-28：部署上线
# 部署到 Vercel/Netlify
# 配置 Sentry 监控
```

#### 阶段六：深入原理（持续学习）

**目标**：理解底层原理，能自己开发工具

**学习内容**：
- 阅读 Vite 源码
- 开发 Vite 插件
- 开发 ESLint 规则
- 开发 CLI 工具

**学习方式**：
- 📖 阅读官方文档的 Advanced 部分
- 🔍 查看优秀开源项目的源码
- ✍️ 写技术博客总结
- 🗣️ 在团队分享
- 🌟 贡献开源项目

---

:::warning 学习建议
**不要一次性学完所有内容！**

1. **循序渐进**：先会用，再懂原理
2. **动手实践**：每学一个工具就在项目中用起来
3. **遇到问题**：先看报错信息，再查文档，最后问 AI
4. **定期回顾**：隔一段时间重新看一遍，会有新的理解
5. **不要焦虑**：工程化是一个持续学习的过程，慢慢来
:::

---

## 二、代码规范体系

### 2.1 EditorConfig - 编辑器配置统一

#### 2.1.1 为什么需要 EditorConfig？

**问题场景**：

```javascript
// 开发者 A 用 VS Code，tab 转 2 个空格
function hello() {
··console.log('A')
}

// 开发者 B 用 WebStorm，tab 转 4 个空格
function hello() {
····console.log('B')
}

// Git 提交时产生大量无意义的 diff
```

**EditorConfig 的作用**：

让所有编辑器（VS Code、WebStorm、Sublime Text 等）都使用**相同的代码格式配置**。

#### 2.1.2 快速上手（5分钟）

**第一步：创建配置文件**

在项目根目录创建 `.editorconfig` 文件：

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
insert_final_newline = true
```

**第二步：安装编辑器插件**

- **VS Code**：搜索并安装 `EditorConfig for VS Code`
- **WebStorm**：内置支持，无需安装

**第三步：验证是否生效**

1. 新建一个 `.js` 文件
2. 按 `Tab` 键
3. 观察是否转换为 2 个空格

✅ 如果是 2 个空格，说明配置生效了！

#### 2.1.3 配置项详解

```ini
# .editorconfig

# 表示这是最顶层的配置文件，停止向上查找
root = true

# 对所有文件生效
[*]
charset = utf-8                    # 文件编码
end_of_line = lf                   # 换行符（lf/cr/crlf）
indent_style = space               # 缩进风格（space/tab）
indent_size = 2                    # 缩进大小
trim_trailing_whitespace = true    # 删除行尾空格
insert_final_newline = true        # 文件末尾插入空行

# Markdown 文件特殊配置
[*.md]
trim_trailing_whitespace = false   # 保留行尾空格（Markdown 语法需要）
max_line_length = off              # 不限制行长度

# Makefile 必须使用 tab
[Makefile]
indent_style = tab

# JSON 文件使用 2 空格缩进
[*.json]
indent_size = 2

# Python 文件使用 4 空格缩进
[*.py]
indent_size = 4
```

#### 2.1.4 深入理解

**Q1：EditorConfig 和 Prettier 有什么区别？**

| 工具 | 作用时机 | 作用范围 | 优先级 |
|------|---------|---------|--------|
| **EditorConfig** | 编辑时实时生效 | 编辑器行为（缩进、换行等） | 最高（编辑器层面） |
| **Prettier** | 保存时或手动格式化 | 代码格式化（换行、空格、引号等） | 次之（工具层面） |
| **ESLint** | Lint 时 | 代码质量检查 | 最后（检查层面） |

**Q2：为什么我的配置没生效？**

检查清单：
1. ✅ 文件名是否正确：`.editorconfig`（注意开头的点）
2. ✅ 文件位置是否正确：项目根目录
3. ✅ 编辑器插件是否安装：VS Code 需要手动安装
4. ✅ 重启编辑器：安装插件后需要重启

**Q3：我已经有很多历史代码了，怎么办？**

使用 Prettier 一次性格式化：

```bash
# 安装 Prettier
npm install -D prettier

# 格式化所有文件
npx prettier --write "**/*.{js,ts,vue,css,json}"

# 提交格式化代码
git add .
git commit -m "chore: format code with prettier"
```

**Q4：EditorConfig 和 Prettier 有什么区别？**

- **EditorConfig**：编辑器级别，**实时生效**（你按 Tab 就转换为空格）
- **Prettier**：工具级别，**手动触发**（保存文件或运行命令时格式化）

建议：**两者都用**，EditorConfig 保证基础一致，Prettier 做更细致的格式化。

:::warning 容易忽略的点
1. **换行符问题**：Windows 是 `CRLF`，Mac/Linux 是 `LF`
   - 统一设置 `end_of_line = lf`
   - Git 也要配置：`git config --global core.autocrlf false`

2. **文件末尾空行**：`insert_final_newline = true`
   - 这是 POSIX 标准的要求
   - 避免 Git 提示 "No newline at end of file"

3. **行尾空格**：`trim_trailing_whitespace = true`
   - 自动删除行尾的空格
   - Markdown 除外（两个空格表示换行）
:::

---

### 2.2 ESLint - 代码质量检查

#### 2.2.1 为什么需要 ESLint？

**问题场景**：

```javascript
// ❌ 声明了变量但没使用
const userName = 'Tom'

// ❌ 使用了未声明的变量
console.log(userNmae)  // 拼写错误

// ❌ 使用了 == 而不是 ===
if (value == null) { }

// ❌ 函数复杂度太高
function complex() {
  if (...) {
    if (...) {
      if (...) {
        // 100 行嵌套代码
      }
    }
  }
}
```

这些问题**运行时才会发现**，导致：
- 🐛 Bug 多
- ⏰ 调试时间长
- 😱 上线后才发现

**ESLint 的作用**：

在**写代码时**就发现问题，编辑器会用红色波浪线提示：

```javascript
// ✅ ESLint 会立即提示
const userName = 'Tom'  // ⚠️ 'userName' is assigned a value but never used
```

#### 2.2.2 快速上手（10分钟）

**第一步：安装 ESLint**

```bash
npm install -D eslint @antfu/eslint-config
```

**第二步：创建配置文件**

```javascript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu()
```

**第三步：安装 VS Code 插件**

搜索并安装 `ESLint` 插件，然后重启 VS Code。

**第四步：测试是否生效**

创建 `test.js`：

```javascript
const a = 1  // 应该显示警告：变量未使用
console.log(b)  // 应该显示错误：变量未定义
```

✅ 看到红色波浪线，说明 ESLint 生效了！

**第五步：添加 npm 脚本**

```json
// package.json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

```bash
# 检查所有文件
npm run lint

# 自动修复可修复的问题
npm run lint:fix
```

#### 2.2.3 核心概念

ESLint 是一个**可配置的 JavaScript 代码检查工具**，通过**静态分析**发现代码中的问题。

**工作原理**：
```
源代码 → 解析器(Parser) → 抽象语法树(AST) → 规则检查(Rules) → 报告问题
```

**什么是 AST（抽象语法树）？**

```javascript
// 源代码
const a = 1

// 转换为 AST（简化版）
{
  type: 'VariableDeclaration',
  kind: 'const',
  declarations: [{
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name: 'a' },
    init: { type: 'Literal', value: 1 }
  }]
}
```

ESLint 通过遍历 AST，检查每个节点是否符合规则。

#### 2.2.4 配置系统演进

**旧配置（ESLint < 9.0）**：
```javascript
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    'semi': ['error', 'never'],
  }
}
```

**新配置（ESLint >= 9.0）**：
```javascript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  // 类型安全
  typescript: {
    tsconfigPath: 'tsconfig.json',
    overrides: {
      'ts/no-unsafe-assignment': 'off',
    }
  },

  // Vue 支持
  vue: true,

  // 格式化
  formatters: {
    css: true,
    html: true,
    markdown: 'prettier',
  },

  // 忽略文件
  ignores: [
    '**/dist',
    '**/node_modules',
    '**/.git',
  ],
})
```

#### 2.2.5 常见问题和错误

**问题 1：ESLint 不生效**

**症状**：代码有问题但编辑器没有提示。

**排查步骤**：

```bash
# 1. 检查 ESLint 是否安装
npm list eslint

# 2. 检查配置文件是否存在
ls eslint.config.js

# 3. 检查 VS Code 插件是否安装
# 打开 VS Code 扩展面板，搜索 "ESLint"

# 4. 查看 VS Code 输出
# 打开输出面板（Ctrl+Shift+U），选择 "ESLint"

# 5. 手动运行 ESLint
npx eslint test.js
```

**问题 2：规则太严格，到处都是错误**

**解决方案**：

```javascript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  // 关闭某些规则
  rules: {
    'no-console': 'off',  // 允许使用 console
    'no-debugger': 'warn',  // debugger 只警告不报错
    'vue/multi-word-component-names': 'off',  // 允许单词组件名
  },
})
```

**问题 3：某些文件不想检查**

**解决方案**：

```javascript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    '**/dist',
    '**/node_modules',
    '**/.git',
    '**/coverage',
    '**/*.min.js',
  ],
})
```

或创建 `.eslintignore` 文件：

```
# .eslintignore
dist
node_modules
*.min.js
```

**问题 4：ESLint 和 Prettier 冲突**

**症状**：ESLint 要求加分号，Prettier 自动删除分号。

**解决方案**：

```bash
# 方案 1：使用 @antfu/eslint-config（推荐）
# 它已经处理好了 ESLint 和 Prettier 的兼容

# 方案 2：手动配置
npm install -D eslint-config-prettier
```

```javascript
// eslint.config.js
import prettier from 'eslint-config-prettier'

export default [
  // ... 其他配置
  prettier,  // 放在最后，关闭与 Prettier 冲突的规则
]
```

**问题 5：某行代码想禁用 ESLint**

```javascript
// 禁用下一行的 ESLint 检查
// eslint-disable-next-line
console.log('debug')

// 禁用某个规则
// eslint-disable-next-line no-console
console.log('debug')

// 禁用整个文件
/* eslint-disable */

// 禁用文件中的某个规则
/* eslint-disable no-console */
```

:::warning 注意
不要滥用 `eslint-disable`！

- ✅ 偶尔用一两次：可以接受
- ❌ 到处都是 `eslint-disable`：说明规则配置有问题

如果某个规则经常需要禁用，应该在配置文件中关闭它。
:::

**问题 6：如何找到合适的规则？**

```bash
# 查看所有可用的规则
npx eslint --print-config eslint.config.js

# 查看某个文件应用的规则
npx eslint --print-config src/main.ts

# 在官网查找规则
# https://eslint.org/docs/latest/rules/
```

**实用技巧**：

```javascript
// 错误级别：
// 'off' 或 0  - 关闭规则
// 'warn' 或 1 - 警告（不会导致程序退出）
// 'error' 或 2 - 错误（会导致程序退出）

export default antfu({
  rules: {
    'no-console': 'warn',  // 只警告，不报错
    'no-debugger': 'error',  // 报错
    'no-unused-vars': 'off',  // 关闭
  },
})
```

:::tip 学习建议
1. **先用默认配置**：不要一开始就改配置
2. **遇到问题再调整**：看到报错后再决定是修代码还是改规则
3. **理解规则意图**：点击报错信息的链接，查看规则文档
4. **逐步严格**：一开始可以设置 `warn`，熟悉后改成 `error`
:::

#### 2.2.3 核心配置项深度解析

**1. Parser（解析器）**

```javascript
export default {
  languageOptions: {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
        globalReturn: false,
      },
      // TypeScript 特有配置
      project: './tsconfig.json',
      extraFileExtensions: ['.vue'],
    }
  }
}
```

**解析器选择**：
- `espree`：ESLint 默认，支持标准 JavaScript
- `@typescript-eslint/parser`：TypeScript 专用
- `@babel/eslint-parser`：需要 Babel 特性时
- `vue-eslint-parser`：Vue SFC 文件

**2. Plugins（插件）**

```javascript
import pluginVue from 'eslint-plugin-vue'
import pluginImport from 'eslint-plugin-import'
import pluginUnusedImports from 'eslint-plugin-unused-imports'

export default [
  {
    plugins: {
      vue: pluginVue,
      import: pluginImport,
      'unused-imports': pluginUnusedImports,
    },
    rules: {
      // 使用插件规则
      'vue/multi-word-component-names': 'off',
      'import/order': ['error', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      }],
      'unused-imports/no-unused-imports': 'error',
    }
  }
]
```

**常用插件推荐**：

| 插件 | 作用 | 推荐场景 |
|------|------|---------|
| `@typescript-eslint` | TypeScript 支持 | TypeScript 项目必备 |
| `eslint-plugin-vue` | Vue.js 支持 | Vue 项目必备 |
| `eslint-plugin-react` | React 支持 | React 项目必备 |
| `eslint-plugin-import` | 导入语句检查 | 大型项目推荐 |
| `eslint-plugin-unused-imports` | 清理未使用导入 | 提高代码质量 |
| `eslint-plugin-unicorn` | 更多最佳实践 | 追求代码质量 |
| `eslint-plugin-promise` | Promise 规范 | 异步代码较多 |
| `eslint-plugin-n` | Node.js 规范 | Node.js 项目 |

**3. Rules（规则）**

```javascript
export default [
  {
    rules: {
      // 错误级别：'off' | 0, 'warn' | 1, 'error' | 2
      
      // === 代码质量规则 ===
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-unused-vars': ['error', { 
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
      }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'prefer-const': ['error', { destructuring: 'all' }],
      
      // === 代码风格规则 ===
      'semi': ['error', 'never'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'always-multiline'],
      'indent': ['error', 2, { SwitchCase: 1 }],
      
      // === TypeScript 规则 ===
      'ts/no-explicit-any': 'warn',
      'ts/no-non-null-assertion': 'off',
      'ts/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      }],
      
      // === Vue 规则 ===
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/component-tags-order': ['error', {
        order: ['script', 'template', 'style'],
      }],
    }
  }
]
```

#### 2.2.4 实现自定义规则

**场景**：禁止在代码中使用 `console.time`，团队统一使用性能监控 SDK。

```javascript
// eslint-plugin-custom/rules/no-console-time.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止使用 console.time，请使用性能监控 SDK',
      category: 'Best Practices',
    },
    messages: {
      noConsoleTime: '禁止使用 {{method}}，请使用 Performance.measure()',
    },
    schema: [],
  },
  
  create(context) {
    return {
      // 访问成员表达式节点
      MemberExpression(node) {
        // 检查是否是 console.time 或 console.timeEnd
        if (
          node.object.name === 'console' &&
          (node.property.name === 'time' || node.property.name === 'timeEnd')
        ) {
          context.report({
            node,
            messageId: 'noConsoleTime',
            data: {
              method: `console.${node.property.name}`,
            },
          })
        }
      },
    }
  },
}
```

**使用自定义规则**：

```javascript
// eslint.config.js
import customPlugin from './eslint-plugin-custom/index.js'

export default [
  {
    plugins: {
      custom: customPlugin,
    },
    rules: {
      'custom/no-console-time': 'error',
    },
  },
]
```

#### 2.2.5 性能优化

**问题**：大型项目 ESLint 检查慢（> 30s）。

**优化策略**：

**1. 缓存机制**

```bash
# 启用缓存
eslint --cache --cache-location node_modules/.cache/eslint/

# package.json
{
  "scripts": {
    "lint": "eslint --cache ."
  }
}
```

**2. 并行处理**

```bash
# 使用多核并行检查
pnpm add -D eslint-parallel

# package.json
{
  "scripts": {
    "lint": "eslint-parallel 'src/**/*.{js,ts,vue}'"
  }
}
```

**3. 增量检查**

```bash
# 只检查变更的文件（配合 lint-staged）
pnpm add -D lint-staged

# .lintstagedrc
{
  "*.{js,ts,vue}": "eslint --fix"
}
```

**4. 规则优化**

```javascript
// 关闭耗时的类型检查规则
export default [
  {
    rules: {
      // 这些规则需要完整的类型信息，很慢
      'ts/no-unsafe-assignment': 'off',
      'ts/no-unsafe-member-access': 'off',
      'ts/no-unsafe-call': 'off',
    }
  }
]
```

---

### 2.3 Prettier - 代码格式化

#### 2.3.1 为什么需要 Prettier？

**问题场景**：

```javascript
// 开发者 A 的代码
const user = {name: "Tom",age: 18,city: "Beijing"};
if(user.age>18){console.log("Adult")}

// 开发者 B 的代码
const user = {
  name: 'Tom',
  age: 18,
  city: 'Beijing',
}

if (user.age > 18) {
  console.log('Adult')
}
```

即使用了 ESLint，还是会遇到：
- ❌ 代码风格不统一（换行、空格、引号）
- ❌ 手动格式化很麻烦
- ❌ Code Review 时浪费时间讨论格式问题

**Prettier 的作用**：

一个**固执己见的代码格式化工具**，保存文件时自动格式化，让团队不再纠结代码风格。

**核心理念**：
> "You press save and code is formatted." 
> 
> 保存即格式化，无需思考，无需讨论。

**Prettier 解决的问题**：

1. **彻底统一代码风格**
   - 所有人的代码看起来都一样
   - 不再有 tab vs space 的争论
   - 不再有单引号双引号的纠结

2. **提高开发效率**
   - 不需要手动调整格式
   - 保存时自动格式化
   - 可以随便写，反正会自动整理

3. **减少 Code Review 时间**
   - 不再讨论代码格式问题
   - 专注于代码逻辑和业务

4. **降低心智负担**
   - 写代码时不用考虑格式
   - 新人上手更容易

**为什么有人不用 Prettier？**

参考 Anthony Fu 的文章[《为什么我不使用 Prettier》](https://antfu.me/posts/why-not-prettier-zh)：

**反对观点**：
1. ESLint 已经可以处理格式化
2. Prettier 会强制一些不合理的格式
3. 配置冲突问题
4. 性能开销

**支持观点**：
1. ESLint 格式化能力有限
2. Prettier 的"零配置"哲学值得
3. 团队统一比个人喜好重要
4. 节省大量时间

**我的建议**：
- 👥 **团队项目**：建议用 Prettier（统一比个性重要）
- 👤 **个人项目**：可以不用（用 ESLint 的 `--fix` 也行）
- 🆕 **新项目**：建议用（一开始就规范）
- 🏛️ **老项目**：慎用（格式化会产生大量 Git diff）

#### 2.3.2 快速上手（5分钟）

**第一步：安装 Prettier**

```bash
npm install -D prettier
```

**第二步：创建配置文件**

```javascript
// .prettierrc.js
export default {
  semi: false,              // 不要分号
  singleQuote: true,        // 单引号
  printWidth: 100,          // 每行最多 100 字符
  trailingComma: 'all',     // 尾随逗号
  arrowParens: 'avoid',     // 箭头函数参数只有一个时省略括号
  endOfLine: 'lf',          // 换行符
}
```

**第三步：安装 VS Code 插件**

搜索并安装 `Prettier - Code formatter`。

**第四步：配置保存时自动格式化**

打开 VS Code 设置，添加：

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```

**第五步：测试是否生效**

创建 `test.js`：

```javascript
const user={name:"Tom",age:18};if(user.age>18){console.log("Adult")}
```

按 `Ctrl+S` 保存，应该自动格式化为：

```javascript
const user = { name: 'Tom', age: 18 }
if (user.age > 18) {
  console.log('Adult')
}
```

✅ 自动格式化了，说明 Prettier 生效了！

#### 2.3.3 ESLint + Prettier 集成方案

**如果要用 Prettier**：

```bash
pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier
```

```javascript
// .prettierrc.js
export default {
  // 基础配置
  semi: false,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'all',
  arrowParens: 'avoid',
  
  // 换行符
  endOfLine: 'lf',
  
  // Vue 特定
  vueIndentScriptAndStyle: false,
  
  // 覆盖特定文件
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
      }
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'never',
      }
    }
  ]
}
```

```javascript
// eslint.config.js
import prettier from 'eslint-plugin-prettier'
import configPrettier from 'eslint-config-prettier'

export default [
  configPrettier, // 关闭 ESLint 中与 Prettier 冲突的规则
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error', // 将 Prettier 错误显示为 ESLint 错误
    }
  }
]
```

---

### 2.4 Stylelint - 样式代码检查

#### 2.4.1 为什么需要 Stylelint？

**问题场景**：

```css
/* 不规范的 CSS 代码 */
.button{
  color:#ff0000;
  FONT-SIZE:16px;
  margin:0px 10px 0px 10px;
  background-color: #ff0000;  /* 和 color 重复 */
  disp1ay:flex;  /* 拼写错误 */
}
```

CSS 的问题：
- ❌ 没有代码提示和检查
- ❌ 拼写错误只有运行时才发现
- ❌ 属性重复、顺序混乱
- ❌ 颜色值不统一（#f00 vs #ff0000）
- ❌ 简写属性不规范

**Stylelint 的作用**：

CSS/SCSS/Less 的**代码检查工具**，就像 ESLint 之于 JavaScript。

**Stylelint 解决的问题**：

1. **语法错误检查**
   - 拼写错误（`disp1ay` → `display`）
   - 属性值错误（`color: 123px`）
   - 选择器错误

2. **代码质量检查**
   - 重复属性检查
   - 无效属性检查
   - 颜色值统一（都用小写）

3. **代码风格统一**
   - 属性顺序统一
   - 缩进和空格统一
   - 引号统一

4. **最佳实践**
   - 禁止使用 ID 选择器
   - 限制选择器嵌套深度
   - 建议使用简写属性

#### 2.4.2 配置指南

```bash
pnpm add -D stylelint stylelint-config-standard stylelint-config-recommended-vue
```

```javascript
// stylelint.config.js
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-vue',
  ],
  
  rules: {
    // 颜色格式
    'color-hex-length': 'short',
    'color-no-invalid-hex': true,
    
    // 选择器
    'selector-class-pattern': '^[a-z][a-zA-Z0-9]*$', // camelCase
    'selector-max-id': 0, // 禁止 ID 选择器
    
    // 属性顺序
    'order/properties-order': [
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'display',
      'flex',
      // ... 更多属性
    ],
    
    // Vue 特定
    'vue/no-deprecated-slot-attribute': true,
  },
  
  // 忽略文件
  ignoreFiles: [
    '**/*.js',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.ts',
    'dist/**',
  ],
}
```

---

### 2.5 Git Hooks - 提交规范

#### 2.5.1 为什么需要 Git Hooks？

**问题场景**：

```bash
# 团队成员的提交记录
git log --oneline

abc123f 修复bug
def456g update
ghi789h 。。。
jkl012m 111
mno345n 紧急修复！！！
pqr678s 改了点东西
```

这样的提交记录：
- ❌ 看不出修改了什么
- ❌ 无法追溯问题来源
- ❌ 无法生成 CHANGELOG
- ❌ 代码提交前没检查，提交了有问题的代码

**更严重的问题**：

```javascript
// 开发者直接提交了这样的代码
const a=1
console.log(b)  // 未定义的变量
debugger  // 调试代码忘记删除
```

然后直接 `git commit` 推送到了远程仓库，导致：
- 🔥 线上代码报错
- ⏰ 影响其他人开发
- 😰 紧急回滚和修复

**Git Hooks 的作用**：

在 Git 操作的**关键节点**自动执行检查，**提交前拦截问题代码**。

**Git Hooks 解决的问题**：

1. **代码质量保障**
   - 提交前自动运行 ESLint
   - 提交前自动运行测试
   - 确保有问题的代码无法提交

2. **提交信息规范**
   - 强制要求规范的提交信息
   - 自动生成 CHANGELOG
   - 方便代码回溯

3. **团队协作**
   - 统一的质量标准
   - 降低 Code Review 成本
   - 减少低级错误

4. **自动化流程**
   - 无需手动运行检查
   - 降低遗忘风险
   - 提高开发效率

**常见的 Git Hooks**：

| Hook | 触发时机 | 常用场景 |
|------|---------|---------|
| `pre-commit` | 提交前 | 运行 Lint、格式化、测试 |
| `commit-msg` | 提交信息录入后 | 验证提交信息格式 |
| `pre-push` | 推送前 | 运行完整测试 |
| `post-merge` | 合并后 | 自动安装依赖 |

#### 2.5.2 Husky - Git Hooks 管理

**安装配置**：

```bash
pnpm add -D husky
pnpm exec husky init
```

**目录结构**：
```
.husky/
├── pre-commit          # 提交前执行
├── commit-msg          # 提交信息验证
├── pre-push            # 推送前执行
└── _/
    └── husky.sh
```

**pre-commit**：
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行 lint-staged
pnpm lint-staged

# 运行类型检查
pnpm type-check

# 运行测试
pnpm test:unit --run
```

**commit-msg**：
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 验证提交信息格式
pnpm commitlint --edit $1
```

#### 2.5.3 lint-staged - 增量检查

**为什么需要 lint-staged？**

**问题场景**：

```bash
# 项目有 1000 个文件，你只修改了 2 个文件
# 但 pre-commit 检查所有 1000 个文件
npm run lint  # 耗时 30 秒 😰
```

结果：
- ❌ 每次提交都很慢
- ❌ 检查了大量无关文件
- ❌ 开发体验很差

**lint-staged 的作用**：

**只检查 Git 暂存区（staged）的文件**，大幅提升速度。

```bash
# 只检查修改的 2 个文件
lint-staged  # 耗时 1 秒 ✅
```

**配置**：

```javascript
// .lintstagedrc.js
export default {
  // JavaScript/TypeScript 文件
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'vitest related --run', // 运行相关测试
  ],
  
  // Vue 文件
  '*.vue': [
    'eslint --fix',
    'stylelint --fix',
  ],
  
  // 样式文件
  '*.{css,scss,less}': [
    'stylelint --fix',
  ],
  
  // Markdown 文件
  '*.md': [
    'markdownlint --fix',
  ],
  
  // 图片压缩
  '*.{png,jpg,jpeg}': [
    'imagemin',
  ],
}
```

**优化技巧**：

```javascript
// 防止 lint-staged 运行时间过长
export default {
  '*.{js,ts,vue}': (filenames) => {
    // 限制最多处理 50 个文件
    const files = filenames.length > 50 
      ? filenames.slice(0, 50) 
      : filenames
    
    return [
      `eslint --fix ${files.join(' ')}`,
      `vitest related ${files.join(' ')} --run`,
    ]
  },
}
```

#### 2.5.3 Commitlint - 提交信息规范

**安装**：

```bash
pnpm add -D @commitlint/cli @commitlint/config-conventional
```

**配置**：

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat',      // 新功能
        'fix',       // 修复 bug
        'docs',      // 文档更新
        'style',     // 代码格式（不影响代码运行）
        'refactor',  // 重构
        'perf',      // 性能优化
        'test',      // 测试相关
        'build',     // 构建系统或外部依赖
        'ci',        // CI 配置
        'chore',     // 其他不修改 src 或 test 的更改
        'revert',    // 回退
      ],
    ],
    
    // 主题不能为空
    'subject-empty': [2, 'never'],
    
    // 主题最大长度
    'subject-max-length': [2, 'always', 100],
    
    // 类型必须小写
    'type-case': [2, 'always', 'lower-case'],
    
    // scope 必须小写
    'scope-case': [2, 'always', 'lower-case'],
  },
}
```

**提交信息格式**：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例**：

```
feat(auth): 添加用户登录功能

- 实现用户名密码登录
- 添加登录状态管理
- 集成 JWT token 认证

Closes #123
```

#### 2.5.4 Commitlint - 提交信息规范

**为什么需要 Commitlint？**

即使配置了 Husky，开发者仍然可以：

```bash
git commit -m "修复bug"        # 不规范
git commit -m "update"          # 看不出修改了什么
git commit -m "。。。"          # 完全没有信息
```

**Commitlint 的作用**：

**强制要求**规范的提交信息格式，不符合规范的提交会被拒绝。

```bash
# ❌ 会被拒绝
git commit -m "修复bug"
# Error: 提交信息不符合规范

# ✅ 会通过
git commit -m "fix(auth): 修复登录失败的问题"
```

**安装**：

```bash
pnpm add -D @commitlint/cli @commitlint/config-conventional
```

**配置**：

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat',      // 新功能
        'fix',       // 修复 bug
        'docs',      // 文档更新
        'style',     // 代码格式（不影响代码运行）
        'refactor',  // 重构
        'perf',      // 性能优化
        'test',      // 测试相关
        'build',     // 构建系统或外部依赖
        'ci',        // CI 配置
        'chore',     // 其他不修改 src 或 test 的更改
        'revert',    // 回退
      ],
    ],
    
    // 主题不能为空
    'subject-empty': [2, 'never'],
    
    // 主题最大长度
    'subject-max-length': [2, 'always', 100],
    
    // 类型必须小写
    'type-case': [2, 'always', 'lower-case'],
    
    // scope 必须小写
    'scope-case': [2, 'always', 'lower-case'],
  },
}
```

**提交信息格式**：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例**：

```
feat(auth): 添加用户登录功能

- 实现用户名密码登录
- 添加登录状态管理
- 集成 JWT token 认证

Closes #123
```

**为什么要这样做？**

1. **可追溯性**：知道每次提交做了什么
2. **自动化**：可以自动生成 CHANGELOG
3. **团队协作**：统一的提交风格
4. **问题定位**：快速找到引入 bug 的提交

#### 2.5.5 Commitizen - 交互式提交

**为什么需要 Commitizen？**

即使有了 Commitlint，手写规范的提交信息仍然：
- ❌ 记不住格式
- ❌ 容易写错 type
- ❌ 不知道该写什么 scope

**Commitizen 的作用**：

提供**交互式命令行界面**，引导你写出规范的提交信息。

```bash
# 不用记格式，一步步选择
pnpm cz

? 选择提交类型: feat
? 选择改动范围: auth
? 输入提交信息: 添加用户登录功能
? 输入详细描述: (可选)
? 是否有破坏性更新: No
? 关联的 issue: #123

# 自动生成规范的提交信息
feat(auth): 添加用户登录功能

Closes #123
```

**安装**：

```bash
pnpm add -D commitizen cz-git
```

**配置**：

```javascript
// .czrc.js
export default {
  alias: {
    fd: 'docs: fix typos',
  },
  
  messages: {
    type: '选择你要提交的类型 :',
    scope: '选择一个提交范围（可选）:',
    customScope: '请输入自定义的提交范围 :',
    subject: '填写简短精炼的变更描述 :\n',
    body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
    breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
    footerPrefixSelect: '选择关联 issue 前缀（可选）:',
    customFooterPrefix: '输入自定义 issue 前缀 :',
    footer: '列举关联 issue (可选) 例如: #31, #I3244 :\n',
    confirmCommit: '是否提交或修改 commit ?',
  },
  
  types: [
    { value: 'feat', name: 'feat:     ✨ 新功能', emoji: ':sparkles:' },
    { value: 'fix', name: 'fix:      🐛 Bug 修复', emoji: ':bug:' },
    { value: 'docs', name: 'docs:     📝 文档更新', emoji: ':memo:' },
    { value: 'style', name: 'style:    💄 代码格式', emoji: ':lipstick:' },
    { value: 'refactor', name: 'refactor: ♻️  代码重构', emoji: ':recycle:' },
    { value: 'perf', name: 'perf:     ⚡️ 性能优化', emoji: ':zap:' },
    { value: 'test', name: 'test:     ✅ 测试相关', emoji: ':white_check_mark:' },
    { value: 'build', name: 'build:    📦️ 构建相关', emoji: ':package:' },
    { value: 'ci', name: 'ci:       🎡 CI 配置', emoji: ':ferris_wheel:' },
    { value: 'chore', name: 'chore:    🔨 其他修改', emoji: ':hammer:' },
    { value: 'revert', name: 'revert:   ⏪️ 回退代码', emoji: ':rewind:' },
  ],
  
  scopes: [
    { value: 'auth', name: 'auth:       认证模块' },
    { value: 'user', name: 'user:       用户模块' },
    { value: 'order', name: 'order:      订单模块' },
    { value: 'components', name: 'components: 组件相关' },
    { value: 'utils', name: 'utils:      工具函数' },
    { value: 'deps', name: 'deps:       依赖更新' },
    { value: 'config', name: 'config:     配置文件' },
  ],
}
```

**使用**：

```bash
# 代替 git commit
pnpm cz

# 或者添加 npm script
{
  "scripts": {
    "commit": "cz"
  }
}
```

---

## 三、构建系统深度解析

### 3.1 模块化演进史

#### 3.1.1 模块化发展历程

```javascript
// === 1. 全局函数时代（史前时代）===
function sayHello() {
  console.log('Hello')
}

// 问题：全局污染、命名冲突、依赖关系不明确


// === 2. 命名空间模式 ===
var MyApp = {
  utils: {
    sayHello: function() {
      console.log('Hello')
    }
  }
}

// 问题：仍然是全局变量，本质上没解决污染


// === 3. IIFE 模式 ===
var module = (function() {
  var privateVar = 'private'
  
  return {
    publicMethod: function() {
      return privateVar
    }
  }
})()

// 优点：真正的私有作用域
// 问题：依赖关系仍不明确


// === 4. CommonJS（Node.js）===
// math.js
module.exports = {
  add: (a, b) => a + b
}

// main.js
const math = require('./math')
math.add(1, 2)

// 特点：同步加载，适合服务端


// === 5. AMD（RequireJS）===
define(['jquery', './math'], function($, math) {
  return {
    calculate: function() {
      return math.add(1, 2)
    }
  }
})

// 特点：异步加载，适合浏览器


// === 6. UMD（通用模块）===
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory)
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('jquery'))
  } else {
    // 全局变量
    root.myModule = factory(root.jQuery)
  }
}(this, function ($) {
  return {
    method: function() {}
  }
}))


// === 7. ES Modules（现代标准）===
// math.js
export const add = (a, b) => a + b
export const subtract = (a, b) => a - b
export default { add, subtract }

// main.js
import math, { add } from './math.js'

// 特点：
// - 静态结构，利于 Tree Shaking
// - 异步加载
// - 浏览器和 Node.js 都支持
```

#### 3.1.2 ESM vs CommonJS 深度对比

| 特性 | ESM | CommonJS |
|------|-----|----------|
| **加载时机** | 编译时（静态） | 运行时（动态） |
| **加载方式** | 异步 | 同步 |
| **输出** | 值的引用（live binding） | 值的拷贝 |
| **循环依赖** | 支持（更好） | 支持（有限制） |
| **Tree Shaking** | ✅ 支持 | ❌ 不支持 |
| **顶层 this** | undefined | module.exports |
| **动态导入** | `import()` | `require()` |
| **浏览器支持** | ✅ 原生支持 | ❌ 需要打包 |

**live binding 示例**：

```javascript
// === CommonJS ===
// counter.js
let count = 0
module.exports = {
  count,
  increment: () => count++
}

// main.js
const counter = require('./counter')
console.log(counter.count) // 0
counter.increment()
console.log(counter.count) // 0（值的拷贝，不会变）


// === ES Modules ===
// counter.js
export let count = 0
export const increment = () => count++

// main.js
import { count, increment } from './counter.js'
console.log(count) // 0
increment()
console.log(count) // 1（值的引用，会变）
```

---

### 3.2 Vite 深度解析

#### 3.2.1 为什么需要 Vite？

**传统开发的痛点（Webpack）**：

```bash
# 启动开发服务器
npm run dev

# 等待...（喝杯咖啡 ☕）
⏰ 启动耗时: 45 秒
⏰ 热更新耗时: 5 秒

# 修改一行代码
console.log('hello')

# 等待热更新...（又要等 🙄）
⏰ 热更新耗时: 5 秒
```

大型项目的体验：
- ❌ 启动服务器要等几分钟
- ❌ 每次改代码要等几秒才能看到效果
- ❌ 开发体验极差，浪费时间

**为什么 Webpack 慢？**

```
启动时：分析所有依赖 → 编译所有模块 → 打包合并 → 启动服务器
        ▲______________慢（几分钟）______________▲

更新时：找到修改的文件 → 重新编译相关模块 → 重新打包 → 推送更新
        ▲______________慢（几秒）______________▲
```

#### 3.2.2 Vite 如何解决这些问题？

**Vite 的革新思路**：

```bash
# 启动开发服务器
npm run dev

# 几乎秒启动 🚀
⚡ 启动耗时: 0.3 秒

# 修改代码
console.log('hello')

# 立即看到效果 ⚡
⚡ 热更新耗时: < 50 毫秒
```

**核心原理**：

**1. 开发时：利用浏览器原生 ESM**

```
启动 → 启动服务器（瞬间，不编译任何代码）
       ↓
     浏览器请求某个文件
       ↓
     编译这一个文件（esbuild，毫秒级）
       ↓
     返回给浏览器
```

**传统方式 vs Vite**：

```javascript
// 传统方式（Webpack）
// 启动时就编译所有文件（1000+ 个文件）
app.js (500KB) ← 打包了所有模块

// Vite 方式
// 启动时不编译，浏览器请求哪个就编译哪个
main.js     ← 只编译入口文件
├─ App.vue  ← 浏览器请求时才编译
├─ Home.vue ← 浏览器请求时才编译
└─ About.vue ← 没请求，不编译
```

**2. 使用 esbuild 预构建依赖**

```javascript
// 问题：lodash-es 有 600+ 个小文件
import { debounce } from 'lodash-es'

// 不预构建：浏览器要发 600+ 个请求 😰
GET /node_modules/lodash-es/debounce.js
GET /node_modules/lodash-es/delay.js
GET /node_modules/lodash-es/...
// 600+ 个请求

// Vite 预构建：合并成一个文件 ✅
GET /.vite/deps/lodash-es.js  // 只需 1 个请求
```

**esbuild 为什么快？**
- 用 **Go 语言**编写（比 JavaScript 快 10-100 倍）
- **多线程并行**处理
- **高效的算法**和数据结构

#### 3.2.3 Vite 解决的问题

| 问题 | 传统工具 | Vite | 提升 |
|------|---------|------|------|
| **启动速度** | 30-60 秒 | < 1 秒 | 30-60 倍 |
| **热更新速度** | 3-10 秒 | < 50 毫秒 | 60-200 倍 |
| **首次访问** | 需要等待 | 即时 | 无等待 |
| **开发体验** | 😡 难受 | 😄 舒适 | 质的飞跃 |

**为什么 Vite 快？**

**传统构建工具（Webpack）**：

```
启动 → 分析依赖 → 编译所有模块 → 打包 → 启动服务器
        ▲________________慢（几分钟）________________▲
```

**Vite 的方式**：

```
启动 → 启动服务器（瞬间）
       ↓
     浏览器请求
       ↓
     按需编译单个模块（esbuild，毫秒级）
```

**核心原理**：

1. **Dev 开发时**：
   - 利用浏览器原生 ESM 支持
   - esbuild 预构建依赖（Go 语言，比 JS 快 10-100 倍）
   - 按需编译，只编译当前路由用到的模块

2. **Build 生产时**：
   - 使用 Rollup 打包（更成熟，产物更优）
   - 代码分割、Tree Shaking、压缩

#### 3.2.2 依赖预构建

**为什么需要预构建？**

```javascript
// lodash-es 有 600+ 个小模块
import { debounce } from 'lodash-es'

// 不预构建：浏览器会发起 600+ 个请求
// 预构建后：合并成一个文件，只需 1 个请求
```

**预构建过程**：

```
1. 扫描入口文件 → 找到所有依赖
2. esbuild 打包依赖 → node_modules/.vite/deps/
3. 添加强缓存 → 依赖不变，缓存永久有效
```

**配置预构建**：

```javascript
// vite.config.ts
export default {
  optimizeDeps: {
    // 手动指定需要预构建的依赖
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'lodash-es',
    ],
    
    // 排除不需要预构建的依赖
    exclude: [
      'your-local-package',
    ],
    
    // esbuild 配置
    esbuildOptions: {
      target: 'es2020',
      plugins: [],
    },
    
    // 强制重新预构建
    force: true,
  },
}
```

#### 3.2.3 HMR（热模块替换）

**实现原理**：

```
文件变更 → Vite 监听 → 编译模块 → WebSocket 推送 → 浏览器接收 → 更新模块
```

**HMR API**：

```javascript
// src/utils/math.ts
export const add = (a: number, b: number) => a + b

// 接受自身模块的更新
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console.log('math 模块已更新', newModule)
  })
}
```

**Vue/React 的 HMR**：

```javascript
// Vite 插件自动处理
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    // 组件内部状态会保留
    const count = ref(0)
    return { count }
  }
})
```

#### 3.2.4 环境变量

```bash
# .env
VITE_APP_TITLE=My App

# .env.development
VITE_API_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://api.example.com
```

```typescript
// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

```typescript
// 使用
console.log(import.meta.env.VITE_APP_TITLE)
console.log(import.meta.env.MODE) // 'development' | 'production'
console.log(import.meta.env.DEV)  // boolean
console.log(import.meta.env.PROD) // boolean
```

#### 3.2.5 插件开发

**Vite 插件是 Rollup 插件的超集**。

```typescript
// vite-plugin-example.ts
import type { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'vite-plugin-example',
    
    // 应用模式：'serve' | 'build' | 'all'
    apply: 'build',
    
    // 执行顺序：'pre' | 'post' | undefined
    enforce: 'pre',
    
    // Vite 特有钩子：服务器启动
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 自定义中间件
        next()
      })
    },
    
    // Vite 特有钩子：开发时模块转换
    transform(code, id) {
      if (id.endsWith('.svg')) {
        // 将 SVG 转换为 Vue 组件
        return {
          code: `export default ${JSON.stringify(code)}`,
          map: null,
        }
      }
    },
    
    // Rollup 钩子：解析模块
    resolveId(id) {
      if (id === 'virtual-module') {
        return id
      }
    },
    
    // Rollup 钩子：加载模块
    load(id) {
      if (id === 'virtual-module') {
        return 'export default "虚拟模块"'
      }
    },
    
    // Vite 特有钩子：HMR
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.custom')) {
        server.ws.send({
          type: 'custom',
          event: 'special-update',
          data: {}
        })
        
        return [] // 返回空数组表示自己处理了
      }
    },
  }
}
```

**实战：自动导入图标组件**：

```typescript
// vite-plugin-icon-auto-import.ts
import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

export function iconAutoImport(): Plugin {
  const virtualModuleId = 'virtual:icons'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'vite-plugin-icon-auto-import',
    
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    
    load(id) {
      if (id === resolvedVirtualModuleId) {
        // 读取 icons 目录下的所有 SVG
        const iconsDir = path.resolve(__dirname, 'src/assets/icons')
        const files = fs.readdirSync(iconsDir)
        const icons = files
          .filter(f => f.endsWith('.svg'))
          .map(f => f.replace('.svg', ''))
        
        // 生成导入代码
        const imports = icons.map(icon => 
          `import ${icon} from './assets/icons/${icon}.svg?component'`
        ).join('\n')
        
        const exports = `export default { ${icons.join(', ')} }`
        
        return `${imports}\n${exports}`
      }
    },
  }
}
```

```typescript
// vite.config.ts
import { iconAutoImport } from './vite-plugin-icon-auto-import'

export default {
  plugins: [
    iconAutoImport(),
  ],
}
```

```vue
<!-- App.vue -->
<script setup>
import icons from 'virtual:icons'
</script>

<template>
  <component :is="icons.Home" />
  <component :is="icons.User" />
</template>
```

---

### 3.3 Rollup 深度解析

#### 3.3.1 Rollup vs Webpack

| 特性 | Rollup | Webpack |
|------|--------|---------|
| **目标场景** | 库打包 | 应用打包 |
| **Tree Shaking** | ✅ 原生支持，效果更好 | ✅ 支持，需配置 |
| **代码分割** | ✅ 支持 | ✅ 支持（更强大） |
| **HMR** | ❌ 不内置 | ✅ 内置支持 |
| **插件生态** | 精简 | 丰富 |
| **产物体积** | 更小 | 较大 |
| **配置复杂度** | 简单 | 复杂 |

#### 3.3.2 Rollup 配置详解

```javascript
// rollup.config.js
import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'

export default defineConfig([
  // 主构建配置
  {
    // 入口文件
    input: 'src/index.ts',
    
    // 输出配置
    output: [
      // ESM 格式
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
      // CommonJS 格式
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named', // 导出模式
      },
      // UMD 格式（浏览器）
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'MyLibrary', // 全局变量名
        sourcemap: true,
        globals: {
          // 外部依赖的全局变量映射
          vue: 'Vue',
          lodash: '_',
        },
      },
    ],
    
    // 外部依赖（不打包进产物）
    external: [
      'vue',
      'lodash',
      /^@vue\//,  // 正则匹配
    ],
    
    // 插件
    plugins: [
      // 解析 node_modules 中的模块
      resolve({
        extensions: ['.ts', '.js'],
        preferBuiltins: true,
      }),
      
      // 转换 CommonJS 模块为 ESM
      commonjs(),
      
      // TypeScript 支持
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false, // 类型文件单独生成
      }),
      
      // 压缩
      terser({
        compress: {
          drop_console: true,
        },
      }),
    ],
    
    // Tree Shaking 配置
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      unknownGlobalSideEffects: false,
    },
  },
  
  // 类型文件构建
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    plugins: [dts()],
  },
])
```

#### 3.3.3 Tree Shaking 原理

**什么是 Tree Shaking？**

移除未使用的代码（Dead Code Elimination）。

**前提条件**：
1. 使用 ESM（静态结构）
2. 无副作用（side effects）

**示例**：

```javascript
// utils.js
export const add = (a, b) => a + b
export const subtract = (a, b) => a - b
export const multiply = (a, b) => a * b

// main.js
import { add } from './utils.js'
console.log(add(1, 2))

// 打包后：multiply 和 subtract 会被删除
```

**副作用问题**：

```javascript
// utils.js
export const add = (a, b) => a + b

// 副作用：修改全局变量
window.__APP_VERSION__ = '1.0.0'

// 即使没用到 add，这段代码也会保留
```

**package.json 声明无副作用**：

```json
{
  "name": "my-library",
  "sideEffects": false,
  
  // 或指定有副作用的文件
  "sideEffects": [
    "*.css",
    "*.scss",
    "src/polyfills.ts"
  ]
}
```

#### 3.3.4 实现一个简易 Rollup 插件

**场景**：自动为导出的函数添加性能监控。

```javascript
// rollup-plugin-performance.js
export function performancePlugin() {
  return {
    name: 'rollup-plugin-performance',
    
    transform(code, id) {
      // 只处理 .js 和 .ts 文件
      if (!/\.(js|ts)$/.test(id)) return null
      
      // 正则匹配导出的函数
      const regex = /export (function|const|let|var) (\w+)/g
      let match
      const functions = []
      
      while ((match = regex.exec(code)) !== null) {
        functions.push(match[2])
      }
      
      if (functions.length === 0) return null
      
      // 生成包装代码
      const wrapperCode = functions.map(fnName => `
        const original_${fnName} = ${fnName}
        ${fnName} = function(...args) {
          const start = performance.now()
          const result = original_${fnName}.apply(this, args)
          const end = performance.now()
          console.log(\`[Performance] ${fnName} took \${end - start}ms\`)
          return result
        }
      `).join('\n')
      
      return {
        code: code + '\n' + wrapperCode,
        map: null,
      }
    },
  }
}
```

---

### 3.4 构建优化策略

#### 3.4.1 代码分割（Code Splitting）

**为什么需要代码分割？**

```
不分割：main.js (2MB) → 加载慢，首屏白屏时间长
分割：main.js (100KB) + vendor.js (500KB) + page-a.js (200KB)
     → 首屏快，按需加载
```

**Vite 自动分割**：

```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks(id) {
          // node_modules 中的包分到 vendor
          if (id.includes('node_modules')) {
            // 大型库单独分包
            if (id.includes('lodash')) return 'lodash'
            if (id.includes('echarts')) return 'echarts'
            if (id.includes('@vue')) return 'vue-vendor'
            
            return 'vendor'
          }
          
          // 工具函数单独分包
          if (id.includes('/src/utils/')) {
            return 'utils'
          }
        },
        
        // 文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
      },
    },
    
    // chunk 大小警告阈值
    chunkSizeWarningLimit: 500,
  },
}
```

**路由懒加载**：

```typescript
// router/index.ts
const router = createRouter({
  routes: [
    {
      path: '/about',
      // 懒加载，会生成独立的 chunk
      component: () => import('../views/About.vue'),
    },
    {
      path: '/user',
      // 使用魔法注释指定 chunk 名称
      component: () => import(
        /* webpackChunkName: "user" */
        '../views/User.vue'
      ),
    },
  ],
})
```

#### 3.4.2 压缩优化

```javascript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default {
  plugins: [
    // Gzip 压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 10KB 以上才压缩
      algorithm: 'gzip',
      ext: '.gz',
    }),
    
    // Brotli 压缩（压缩率更高）
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  
  build: {
    // 生产环境移除 console
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // CSS 代码分割
    cssCodeSplit: true,
    
    // 禁用 CSS 内联
    assetsInlineLimit: 4096, // 4KB 以下内联为 base64
  },
}
```

#### 3.4.3 构建分析

```bash
pnpm add -D rollup-plugin-visualizer
```

```javascript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      open: true, // 构建后自动打开
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
}
```

---

## 四、包管理与 Monorepo

### 4.1 为什么需要包管理器？

**问题场景：没有包管理器的时代**

```html
<!-- 2010 年的前端开发 -->
<!DOCTYPE html>
<html>
<head>
  <!-- 手动下载 jQuery，放到项目里 -->
  <script src="js/jquery-1.8.3.min.js"></script>
  <!-- 又要用 lodash，再手动下载 -->
  <script src="js/lodash-2.4.1.min.js"></script>
  <!-- 不知道用的是什么版本 -->
  <script src="js/some-plugin.js"></script>
</head>
</html>
```

遇到的问题：
- ❌ 手动下载很麻烦
- ❌ 版本管理混乱
- ❌ 升级依赖很痛苦
- ❌ 依赖关系不明确
- ❌ 团队协作困难

**包管理器解决的问题**：

```bash
# 安装依赖
npm install jquery lodash

# package.json 记录版本
{
  "dependencies": {
    "jquery": "^3.7.1",
    "lodash": "^4.17.21"
  }
}

# 其他人只需要
npm install  # 自动安装相同版本的依赖
```

### 4.2 npm/pnpm/yarn 对比

#### 4.2.1 为什么有这么多包管理器？

**npm 的问题**（2015 年前）：
- 🐢 安装慢（串行安装）
- 💾 占用空间大（重复安装）
- 🐛 依赖地狱（版本冲突）

**Yarn 的诞生**（2016 年）：
- ✅ 并行安装，速度快
- ✅ 离线缓存
- ✅ 锁定版本（yarn.lock）

**Yarn 的诞生**（2016 年）：
- ✅ 并行安装，速度快
- ✅ 离线缓存
- ✅ 锁定版本（yarn.lock）

**pnpm 的革新**（2017 年）：
- ✅ 硬链接，节省空间
- ✅ 严格的依赖管理
- ✅ 速度最快

#### 4.2.2 三者对比

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| **安装速度** | 慢 | 快 | 最快 |
| **磁盘占用** | 大（重复安装） | 大 | 小（硬链接） |
| **node_modules 结构** | 扁平化 | 扁平化 | 嵌套 + 软链接 |
| **幽灵依赖** | ❌ 存在 | ❌ 存在 | ✅ 不存在 |
| **Monorepo 支持** | Workspaces | Workspaces | Workspaces（更好） |

**什么是幽灵依赖？**

```json
// package.json - 你只声明了 express
{
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

```javascript
// express 依赖了 body-parser
// npm/yarn 会将 body-parser 提升到顶层

// 你可以直接使用，但这是错的！
import bodyParser from 'body-parser' 
// ❌ package.json 中没有声明
// ❌ 如果 express 不再依赖 body-parser，你的代码就会报错
```

**pnpm 如何解决？**

```javascript
// pnpm 不会提升依赖
import bodyParser from 'body-parser'
// ✅ 直接报错：找不到模块
// ✅ 强制你在 package.json 中声明
```

### 4.3 pnpm 原理

**硬链接 + 符号链接**：

```
node_modules/
├── .pnpm/
│   ├── express@4.18.0/
│   │   └── node_modules/
│   │       └── express/  (硬链接到全局 store)
│   └── body-parser@1.20.0/
│       └── node_modules/
│           └── body-parser/
└── express -> .pnpm/express@4.18.0/node_modules/express
```

**优势**：
1. 节省磁盘空间（所有项目共享同一个 store）
2. 安装速度快（不需要复制文件）
3. 严格的依赖管理（避免幽灵依赖）

### 4.4 Monorepo 实战

#### 4.4.1 为什么需要 Monorepo？

**问题场景：传统多仓库（Multi-repo）**

```
公司项目/
├── project-web/          (独立仓库)
├── project-admin/        (独立仓库)
├── project-mobile/       (独立仓库)
├── shared-components/    (独立仓库)
└── shared-utils/         (独立仓库)
```

遇到的问题：

**1. 代码复用困难**
```bash
# 修改了 shared-utils
cd shared-utils
git commit
npm version patch
npm publish

# 每个项目都要更新依赖
cd ../project-web
npm update shared-utils

cd ../project-admin
npm update shared-utils

cd ../project-mobile
npm update shared-utils

# 😰 要操作 3 次，容易漏！
```

**2. 调试困难**
```bash
# 调试 shared-components 的问题
cd project-web
npm link ../shared-components  # 手动链接
# 改代码 → 构建 → 刷新 → 重复...

# 😰 流程复杂，效率低
```

**3. 版本管理混乱**
```json
// project-web/package.json
{
  "dependencies": {
    "shared-utils": "^1.2.0"
  }
}

// project-admin/package.json
{
  "dependencies": {
    "shared-utils": "^1.1.0"  // 😰 版本不一致！
  }
}
```

**4. 团队协作困难**
```bash
# 开发一个跨项目的功能
# 需要在 5 个仓库中分别创建 PR
# 需要 5 个仓库的维护者分别 Review
# 😰 流程繁琐，效率低下
```

#### 4.4.2 Monorepo 如何解决？

**Monorepo：单一仓库管理多个项目**

```
my-monorepo/               (一个仓库)
├── packages/
│   ├── shared-components/
│   └── shared-utils/
└── apps/
    ├── web/
    ├── admin/
    └── mobile/
```

**优势**：

**1. 代码复用简单**
```json
// apps/web/package.json
{
  "dependencies": {
    "@my-app/utils": "workspace:*"  // 自动使用本地版本
  }
}
```

```bash
# 修改 shared-utils
cd packages/shared-utils
# 改代码，保存

# 所有引用的项目立即生效 ✅
# 不需要发布，不需要更新依赖
```

**2. 统一的工具链**
```json
// 根目录的 package.json
{
  "scripts": {
    "dev": "turbo run dev",      // 所有项目一起启动
    "build": "turbo run build",  // 所有项目一起构建
    "test": "turbo run test",    // 所有项目一起测试
    "lint": "turbo run lint"     // 所有项目一起检查
  }
}
```

**3. 统一的版本管理**
```bash
# 使用 Changesets 统一管理版本
pnpm changeset
pnpm changeset version  # 自动更新所有包的版本
pnpm changeset publish  # 一键发布所有包
```

**4. 团队协作高效**
```bash
# 跨项目功能开发
# 只需要一个 PR
# 只需要一次 Code Review
# 所有改动一起合并 ✅
```

**5. 依赖管理统一**
```bash
# 所有项目共享依赖
# React 只需要安装一次
# Vue 只需要安装一次
# 节省磁盘空间，加快安装速度
```

#### 4.4.3 Monorepo 的适用场景

**✅ 适合使用 Monorepo**：
- 多个项目有大量共享代码
- 团队需要频繁跨项目协作
- 需要统一的工具链和规范
- 组件库 + 多个应用
- 前端 + 后端 + 移动端

**❌ 不适合使用 Monorepo**：
- 项目完全独立，没有共享代码
- 团队规模小（< 3 人）
- 不同项目的技术栈完全不同
- 对构建性能要求极高

#### 4.4.4 项目结构

```
my-monorepo/
├── package.json
├── pnpm-workspace.yaml
├── packages/
│   ├── ui/                    # 组件库
│   │   ├── package.json
│   │   └── src/
│   ├── utils/                 # 工具函数
│   │   ├── package.json
│   │   └── src/
│   └── cli/                   # CLI 工具
│       ├── package.json
│       └── src/
└── apps/
    ├── web/                   # Web 应用
    │   ├── package.json
    │   └── src/
    └── admin/                 # 管理后台
        ├── package.json
        └── src/
```

#### 4.3.2 pnpm Workspace 配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/__tests__/**'
```

```json
// package.json（根目录）
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter \"./apps/*\" dev",
    "build": "pnpm --recursive build",
    "test": "pnpm --recursive test",
    "lint": "pnpm --recursive lint"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

#### 4.3.3 包之间的依赖

```json
// packages/ui/package.json
{
  "name": "@my-app/ui",
  "version": "1.0.0",
  "dependencies": {
    "vue": "^3.4.0",
    "@my-app/utils": "workspace:*"  // 使用 workspace 协议
  }
}
```

```json
// apps/web/package.json
{
  "name": "web",
  "dependencies": {
    "@my-app/ui": "workspace:*",
    "@my-app/utils": "workspace:*"
  }
}
```

**安装依赖**：

```bash
# 为特定包安装依赖
pnpm --filter @my-app/ui add lodash

# 为所有包安装依赖
pnpm add -D vitest -w  # -w 表示安装到根目录

# 运行特定包的脚本
pnpm --filter web dev

# 运行所有包的脚本
pnpm -r build  # -r 表示 recursive
```

#### 4.3.4 Turborepo 加速构建

```bash
pnpm add -D turbo
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // 依赖包先构建
      "outputs": ["dist/**"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true  // 持续运行的任务
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true
    }
  }
}
```

```json
// package.json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "test": "turbo run test"
  }
}
```

**Turborepo 特性**：
1. **远程缓存**：团队共享构建缓存
2. **增量构建**：只构建变更的包
3. **并行执行**：多核并行构建
4. **依赖感知**：自动处理包之间的依赖关系

#### 4.3.5 Changsets 版本管理

```bash
pnpm add -D @changesets/cli
pnpm changeset init
```

```markdown
# .changeset/config.json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

**工作流程**：

```bash
# 1. 开发新功能
git checkout -b feat/new-feature

# 2. 添加 changeset
pnpm changeset
# 选择变更的包
# 选择版本类型（major/minor/patch）
# 填写变更描述

# 3. 提交代码
git add .
git commit -m "feat: add new feature"

# 4. 发布前生成版本和 CHANGELOG
pnpm changeset version

# 5. 构建和发布
pnpm build
pnpm changeset publish
```

---

## 五、自动化与 CI/CD

### 5.1 为什么需要 CI/CD？

#### 5.1.1 传统开发流程的痛点

**没有 CI/CD 的开发流程**：

```bash
# 开发完成，准备上线
# 第一步：手动运行检查
npm run lint       # ❌ 忘记运行了
npm run test       # ❌ 测试失败了，但没注意
npm run build      # ✅ 构建成功

# 第二步：手动部署
scp -r dist/* user@server:/var/www/  # 😰 需要记住命令
ssh user@server "pm2 restart app"     # 😰 需要手动重启

# 第三步：检查是否成功
# 打开浏览器，手动测试
# 😱 发现页面白屏！原来刚才测试失败了
# 😰 紧急回滚...
```

**遇到的问题**：
- ❌ 容易忘记运行测试
- ❌ 部署步骤复杂，容易出错
- ❌ 不同人部署结果可能不同
- ❌ 出问题后回滚困难
- ❌ 没有部署记录

**真实场景**：

```bash
# 周五下午 5:30，准备下班
# 小明：我改了个小功能，直接发布了
git push

# 周五下午 5:35
# 客服：网站打不开了！！！
# 小明：😱 我忘记运行测试了
# 小明：😱 我也不知道怎么回滚

# 结果：加班到晚上 10 点才修好
```

#### 5.1.2 CI/CD 如何解决？

**CI（Continuous Integration）持续集成**：

```bash
# 代码推送到 GitHub
git push

# 自动触发 CI 流程
✅ 自动安装依赖
✅ 自动运行 ESLint
✅ 自动运行测试
✅ 自动构建
❌ 如果任何步骤失败，拒绝合并

# 保证主分支代码永远是可用的
```

**CD（Continuous Deployment）持续部署**：

```bash
# 代码合并到主分支
git merge feature-branch

# 自动触发 CD 流程
✅ 自动构建生产版本
✅ 自动部署到服务器
✅ 自动发送通知
✅ 自动记录部署历史

# 一键回滚
git revert <commit>
# 自动回滚到上一个版本
```

**CI/CD 的价值**：

| 方面 | 手动部署 | CI/CD |
|------|---------|-------|
| **部署时间** | 30-60 分钟 | 3-5 分钟 |
| **出错概率** | 高（人为失误） | 低（自动化） |
| **回滚速度** | 慢（手动操作） | 快（一键回滚） |
| **可追溯性** | 差（无记录） | 好（完整日志） |
| **团队协作** | 难（需要权限） | 易（自动化） |

### 5.2 GitHub Actions 实战

#### 5.2.1 基础配置

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run lint
        run: pnpm lint
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      - name: Run tests
        run: pnpm test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
  
  build:
    runs-on: ubuntu-latest
    needs: [lint, test]  # 依赖前面的任务
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

#### 5.2.2 自动发布

```yaml
# .github/workflows/publish.yml
name: Publish

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'
      
      - run: pnpm install --frozen-lockfile
      
      - run: pnpm build
      
      - name: Publish to npm
        run: pnpm publish --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

### 5.2 部署自动化

#### 5.2.1 Vercel

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 5.2.2 Netlify

```toml
# netlify.toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--prefix=/dev/null"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 六、监控与调试

### 6.1 为什么需要 SourceMap？

#### 6.1.1 生产环境的困境

**问题场景**：

```javascript
// 你写的代码（src/index.ts）
function calculateTotal(items: Item[]) {
  const total = items.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)
  return total
}
```

**生产环境的代码（压缩后）**：

```javascript
// dist/index.js
function c(a){return a.reduce((b,c)=>b+c.p*c.q,0)}
```

**用户反馈：页面报错了！**

```bash
# 浏览器控制台
Uncaught TypeError: Cannot read property 'p' of undefined
  at c (index.js:1:234)
```

你：😱 `c (index.js:1:234)` 是哪里？
- ❌ 看不懂压缩后的代码
- ❌ 不知道是哪个文件的哪一行
- ❌ 无法调试和定位问题

**为什么要压缩代码？**

```javascript
// 原始代码：15KB
function calculateTotal(items: Item[]) {
  const total = items.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)
  return total
}

// 压缩后：2KB
function c(a){return a.reduce((b,c)=>b+c.p*c.q,0)}

// 体积减少 87%，加载更快！
```

但是：
- ✅ 用户加载更快
- ❌ 开发者无法调试

#### 6.1.2 SourceMap 如何解决？

**SourceMap 的作用**：

建立**压缩代码**和**源代码**之间的映射关系。

```
压缩代码：c (index.js:1:234)
   ↓ (通过 SourceMap 映射)
源代码：calculateTotal (src/index.ts:3:15)
```

**有了 SourceMap**：

```bash
# 浏览器控制台
Uncaught TypeError: Cannot read property 'price' of undefined
  at calculateTotal (src/index.ts:3:15)
  #                   ↑ 清楚地看到原始文件和行号
```

你：✅ 是 `src/index.ts` 第 3 行的 `item.price`
你：✅ 原来是 item 可能为 undefined
你：✅ 快速定位和修复问题

#### 6.1.3 SourceMap 类型选择

| 类型 | 构建速度 | 产物体积 | 调试体验 | 生产建议 |
|------|---------|---------|---------|---------|
| `eval` | 最快 | 无增加 | 较差 | ❌ |
| `eval-source-map` | 较快 | 大 | 好 | ❌ |
| `cheap-source-map` | 快 | 较大 | 一般 | ❌ |
| `source-map` | 慢 | 大 | 最好 | ✅ |
| `hidden-source-map` | 慢 | 大 | 需上传 | ✅ 推荐 |
| `nosources-source-map` | 慢 | 较小 | 有限 | ✅ |

**生产环境推荐**：`hidden-source-map`

```javascript
// vite.config.ts
export default {
  build: {
    sourcemap: 'hidden', 
    // ✅ 生成 .map 文件
    // ✅ 但不在 JS 中引用（用户看不到）
    // ✅ 上传到监控平台（Sentry）
    // ✅ 只有开发者能用来调试
  },
}
```

**为什么不直接暴露 SourceMap？**

```javascript
// ❌ sourcemap: true
// 用户可以下载 .map 文件
// 用户可以看到你的源代码
// 相当于开源了你的项目！

// ✅ sourcemap: 'hidden'
// 只生成 .map 文件，不公开
// 上传到 Sentry 等监控平台
// 只有开发者通过监控平台看到源码
```

#### 6.1.4 生产环境 SourceMap 方案

```javascript
// vite.config.ts
export default {
  build: {
    sourcemap: 'hidden', // 生成 .map 文件但不在 JS 中引用
  },
}
```

```javascript
// 上传 SourceMap 到监控平台
import { uploadSourceMap } from './utils/sentry'

// vite.config.ts
export default {
  plugins: [
    {
      name: 'upload-sourcemap',
      closeBundle() {
        if (process.env.NODE_ENV === 'production') {
          uploadSourceMap({
            apiKey: process.env.SENTRY_API_KEY,
            org: 'my-org',
            project: 'my-project',
            dist: './dist',
          })
        }
      },
    },
  ],
}
```

### 6.2 为什么需要错误监控（Sentry）？

#### 6.2.1 没有监控的困境

**问题场景**：

```bash
# 周一早上 9:00
# 老板：为什么周末有 100 个用户投诉网站打不开？
# 你：😱 我不知道啊，我周末没看

# 没有监控，你不知道：
# ❌ 什么时候出错的？
# ❌ 影响了多少用户？
# ❌ 是什么错误？
# ❌ 在哪个页面出错的？
# ❌ 用户用的什么浏览器？
```

**用户投诉的问题**：

```
用户A：网站打不开了
  → 什么时候？哪个页面？什么浏览器？
  用户：忘了...

用户B：点击按钮没反应
  → 能重现吗？控制台有报错吗？
  用户：我不懂技术...

用户C：页面白屏
  → 能截图吗？能看下控制台吗？
  用户：已经刷新了，现在正常了...
```

结果：
- ❌ 问题无法重现
- ❌ 不知道问题根源
- ❌ 只能瞎猜

#### 6.2.2 Sentry 如何解决？

**Sentry 的作用**：

自动收集和上报**生产环境的错误**，提供完整的错误信息和上下文。

**有了 Sentry 之后**：

```bash
# Sentry 自动发送告警邮件
🚨 新错误：Cannot read property 'price' of undefined
  • 发生时间：2026-01-25 14:32:15
  • 影响用户：23 人
  • 发生次数：156 次
  • 位置：src/pages/Cart.vue:45
  • 浏览器：Chrome 120
  • 操作系统：Windows 11
  • 用户操作：点击"结算"按钮
  • 用户信息：userId: 12345
```

**Sentry 提供的信息**：

1. **完整的错误堆栈**（通过 SourceMap）
2. **用户操作记录**（breadcrumbs）
3. **浏览器和系统信息**
4. **错误发生的频率**
5. **受影响的用户数量**
6. **错误趋势图**

**价值**：
- ✅ 主动发现问题（不等用户投诉）
- ✅ 快速定位问题（完整上下文）
- ✅ 评估影响范围（多少用户受影响）
- ✅ 追踪修复效果（错误是否减少）

### 6.3 Sentry 错误监控实战

```bash
pnpm add @sentry/vue
```

```typescript
// main.ts
import * as Sentry from '@sentry/vue'

Sentry.init({
  app,
  dsn: 'YOUR_DSN',
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
    }),
    new Sentry.Replay(),
  ],
  
  // 性能监控采样率
  tracesSampleRate: 1.0,
  
  // 录屏采样率
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // 环境
  environment: import.meta.env.MODE,
  
  // 版本
  release: `my-app@${__APP_VERSION__}`,
  
  // 过滤错误
  beforeSend(event, hint) {
    // 忽略特定错误
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null
    }
    return event
  },
})
```

---

## 七、学习资源

### 7.1 官方文档

- **Vite**: https://vitejs.dev/
- **Rollup**: https://rollupjs.org/
- **ESLint**: https://eslint.org/
- **pnpm**: https://pnpm.io/
- **Turborepo**: https://turbo.build/

### 7.2 开源项目

学习优秀项目的工程化实践：

- **Vite**: https://github.com/vitejs/vite
- **Vitest**: https://github.com/vitest-dev/vitest
- **UnoCSS**: https://github.com/unocss/unocss
- **Element Plus**: https://github.com/element-plus/element-plus
- **Ant Design Vue**: https://github.com/vueComponent/ant-design-vue

### 7.3 推荐文章

- Anthony Fu: https://antfu.me/
- Evan You: https://blog.evanyou.me/
- Vite 官方博客: https://vitejs.dev/blog/

### 7.4 实践建议

**第一阶段：基础掌握（1个月）**
- [ ] 配置一个完整的项目脚手架
- [ ] 实现 ESLint + Prettier + Husky
- [ ] 理解 Vite 的基本原理
- [ ] 学习 Git 工作流

**第二阶段：深入理解（2-3个月）**
- [ ] 阅读 Vite 核心源码
- [ ] 实现一个简易的 Vite 插件
- [ ] 实现一个 ESLint 自定义规则
- [ ] 搭建 Monorepo 项目

**第三阶段：工程实践（持续）**
- [ ] 在团队中推广工程化最佳实践
- [ ] 建立团队代码规范文档
- [ ] 搭建 CI/CD 流水线
- [ ] 建立性能监控体系

---

## 八、总结

前端工程化是一个**系统工程**，需要从**工具使用 → 原理理解 → 实践优化**逐步深入。

**核心要点**：

1. **代码规范**：建立自动化的代码质量保障体系
2. **构建优化**：理解构建原理，针对性优化
3. **包管理**：合理使用 Monorepo，提高代码复用
4. **自动化**：建立完整的 CI/CD 流程
5. **监控运维**：确保生产环境稳定性

**学习建议**：

- 不要只停留在工具使用层面
- 多阅读优秀开源项目的源码
- 在实际项目中应用和验证
- 持续关注前端技术发展

**记住**：工程化的目标是**提高效率、保证质量**，而不是为了工程化而工程化。选择合适的工具和方案，而不是追求"最新最全"。

---

:::tip 持续更新
本文档会持续更新，欢迎反馈和补充！
:::

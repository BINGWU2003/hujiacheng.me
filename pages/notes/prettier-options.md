---
title: prettier 配置选项
date: 2025-11-06
duration: 120min
type: notes
art: random
---

[[toc]]

## 什么是 Prettier

[Prettier](https://prettier.io/) 是一个固执己见的代码格式化工具，支持多种语言和框架：

- JavaScript、TypeScript、JSX、TSX
- Vue、Angular、HTML
- CSS、SCSS、Less
- JSON、YAML、Markdown
- GraphQL

Prettier 的核心理念是**解析代码并根据自己的规则重新打印**，确保所有输出的代码符合一致的风格。它通过解析代码的 AST（抽象语法树）来忽略原有的格式，然后按照统一的规则重新格式化。

```bash
# 安装 Prettier
npm install --save-dev prettier

# 初始化配置文件
echo {}> .prettierrc.json
```

:::tip 版本说明
本文档基于 **Prettier 3.x** 编写，包含最新的配置选项和最佳实践。

**Prettier 2.x vs 3.x 主要区别**：
- ✅ **Prettier 3.x**（推荐新项目）：
  - 默认 `endOfLine` 改为 `"lf"`（统一换行符）
  - 默认 `arrowParens` 改为 `"always"`（箭头函数始终添加括号）
  - 性能优化，格式化速度提升 10-20%
  - 更好的配置文件解析和缓存机制
  - 支持更多语言和框架（如 Vue 3.3+、TypeScript 5+）
  - 移除了一些已废弃的选项
- ⚠️ **Prettier 2.x**（仍然广泛使用）：
  - `endOfLine` 默认为 `"auto"`（保持原有换行符）
  - `arrowParens` 默认为 `"avoid"`（单参数省略括号）
  - 广泛用于现有项目中，稳定可靠

**主要版本更新时间线**：
- **Prettier 3.0**（2023-07-05）：重大性能改进和默认值变更
- **Prettier 2.0**（2020-03-21）：引入新的 CLI 和配置系统
- **Prettier 1.x**（已停止维护）：早期版本
:::

:::warning 注意事项
- 本文档主要适用于 Prettier 3.x，但大部分配置与 2.x 兼容
- Prettier 的配置选项相对稳定，版本间变化较小
- 建议新项目使用 Prettier 3.x 以获得更好的性能
- 升级到 Prettier 3.x 时，注意检查 `endOfLine` 和 `arrowParens` 的默认值变化
- 配置选项会随 Prettier 版本更新而变化，建议参考 [官方文档](https://prettier.io/docs/)
:::

## 配置文件

Prettier 支持多种配置文件格式：

```bash
# 推荐：JSON 格式
.prettierrc.json

# 其他格式
.prettierrc.js         # JavaScript 导出对象
.prettierrc.cjs        # CommonJS 模块（显式）
.prettierrc.mjs        # ES Module（显式）
.prettierrc.yaml       # YAML 格式
.prettierrc.yml        # YAML 格式（简写）
.prettierrc.toml       # TOML 格式
prettier.config.js     # JavaScript 配置文件
prettier.config.cjs    # CommonJS 配置文件
prettier.config.mjs    # ES Module 配置文件

# package.json 中配置
{
  "prettier": {
    // 配置项
  }
}
```

**推荐使用** `.prettierrc.json` 或 `.prettierrc.js`，本文以 JSON 格式为例。

### 配置文件后缀说明

#### 为什么会有不同的后缀？

不同的后缀代表不同的文件格式和模块系统，主要原因包括：

1. **历史兼容性**：支持老项目和新项目
2. **项目需求**：不同项目使用不同的模块系统
3. **功能需求**：某些格式支持动态配置和注释

#### 各种后缀的区别

**1. .prettierrc.json（推荐）**

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100
}
```

**特点**：
- ✅ 最简单直观，易于理解
- ✅ 支持 JSON Schema 自动补全
- ✅ 跨项目通用
- ❌ 不支持注释
- ❌ 不支持动态配置

**适用场景**：大多数项目的首选

---

**2. .prettierrc.js（JavaScript）**

```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  singleQuote: true,
  printWidth: 100,
  // 可以添加注释
  overrides: [
    {
      files: "*.test.js",
      options: { printWidth: 120 }
    }
  ]
};
```

**特点**：
- ✅ 支持注释
- ✅ 支持动态配置（条件判断）
- ✅ 可以导入其他模块
- ❌ 依赖 Node.js 环境

**使用模块系统**：根据 `package.json` 的 `"type"` 字段决定：
- `"type": "commonjs"` 或未指定 → CommonJS（`module.exports`）
- `"type": "module"` → ES Module（`export default`）

**适用场景**：需要动态配置或复杂逻辑的项目

---

**3. .prettierrc.cjs（CommonJS 显式）**

```javascript
// .prettierrc.cjs
module.exports = {
  semi: true,
  singleQuote: true,
  printWidth: 100
};
```

**特点**：
- ✅ 明确使用 CommonJS 语法
- ✅ 在 `"type": "module"` 的项目中仍可使用
- ✅ 避免模块系统混淆

**使用场景**：

```json
// package.json
{
  "type": "module"  // 项目使用 ES Module
}
```

此时如果想用 CommonJS 格式的配置文件，必须使用 `.cjs` 后缀。

**适用场景**：ES Module 项目中需要 CommonJS 配置

---

**4. .prettierrc.mjs（ES Module 显式）**

```javascript
// .prettierrc.mjs
export default {
  semi: true,
  singleQuote: true,
  printWidth: 100
};
```

**特点**：
- ✅ 明确使用 ES Module 语法
- ✅ 在 `"type": "commonjs"` 的项目中仍可使用
- ✅ 支持 `import` 语法

**使用场景**：

```json
// package.json
{
  "type": "commonjs"  // 或未指定
}
```

此时如果想用 ES Module 格式的配置文件，必须使用 `.mjs` 后缀。

**示例**：

```javascript
// .prettierrc.mjs
import baseConfig from './prettier.base.mjs';

export default {
  ...baseConfig,
  printWidth: 120
};
```

**适用场景**：CommonJS 项目中需要 ES Module 配置

---

**5. prettier.config.js vs .prettierrc.js**

```javascript
// prettier.config.js
module.exports = {
  semi: true
};

// .prettierrc.js
module.exports = {
  semi: true
};
```

**两者功能完全相同**，只是命名习惯不同：
- `prettier.config.js`：更明确表明是配置文件
- `.prettierrc.js`：遵循 rc 文件命名惯例（run commands）

**适用场景**：根据个人或团队喜好选择

---

**6. .prettierrc（无后缀）**

```json
{
  "semi": true,
  "singleQuote": true
}
```

**特点**：
- 可以是 JSON 或 YAML 格式
- Prettier 会自动识别
- 不推荐使用（不明确）

---

**7. YAML 格式（.prettierrc.yaml / .prettierrc.yml）**

```yaml
# .prettierrc.yaml
semi: true
singleQuote: true
printWidth: 100

# 支持注释
overrides:
  - files: "*.md"
    options:
      proseWrap: always
```

**特点**：
- ✅ 支持注释
- ✅ 语法简洁
- ❌ 需要熟悉 YAML 语法
- ❌ 缩进敏感

**适用场景**：习惯使用 YAML 的团队

---

#### 模块系统对照表

| package.json type | .js 文件使用 | .cjs 文件 | .mjs 文件 |
|-------------------|-------------|----------|----------|
| 未指定 | CommonJS | CommonJS | ES Module |
| `"type": "commonjs"` | CommonJS | CommonJS | ES Module |
| `"type": "module"` | ES Module | CommonJS | ES Module |

#### 实际示例对比

**场景 1：ES Module 项目需要 CommonJS 配置**

```json
// package.json
{
  "name": "my-app",
  "type": "module"
}
```

```javascript
// ❌ .prettierrc.js - 错误！会被当作 ES Module
module.exports = {
  semi: true
};
// 报错：SyntaxError: Unexpected token 'export'

// ✅ .prettierrc.cjs - 正确！明确使用 CommonJS
module.exports = {
  semi: true
};

// ✅ .prettierrc.mjs - 也可以，使用 ES Module
export default {
  semi: true
};
```

**场景 2：CommonJS 项目需要 ES Module 配置**

```json
// package.json
{
  "name": "my-app"
  // 未指定 type，默认 commonjs
}
```

```javascript
// ✅ .prettierrc.js - 使用 CommonJS
module.exports = {
  semi: true
};

// ✅ .prettierrc.cjs - 也可以
module.exports = {
  semi: true
};

// ✅ .prettierrc.mjs - 使用 ES Module
export default {
  semi: true
};
```

**场景 3：需要动态配置**

```javascript
// .prettierrc.js
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  semi: true,
  singleQuote: true,
  // 生产环境移除注释，开发环境保留
  printWidth: isProduction ? 80 : 120
};
```

#### 选择建议

**优先级（从高到低）**：

1. **`.prettierrc.json`** - 简单项目，无需动态配置
   ```json
   {
     "semi": true,
     "singleQuote": true
   }
   ```

2. **`.prettierrc.js`** - 需要注释或动态配置
   ```javascript
   module.exports = {
     semi: true,
     // 注释说明
     singleQuote: true
   };
   ```

3. **`.prettierrc.cjs`** - ES Module 项目中使用 CommonJS
   ```javascript
   // package.json: "type": "module"
   module.exports = { semi: true };
   ```

4. **`.prettierrc.mjs`** - CommonJS 项目中使用 ES Module
   ```javascript
   // package.json: "type": "commonjs" 或未指定
   export default { semi: true };
   ```

5. **其他格式** - 根据团队习惯选择

#### 总结

- **大多数项目**：使用 `.prettierrc.json`（简单明了）
- **需要注释**：使用 `.prettierrc.js` 或 `.prettierrc.yaml`
- **ES Module 项目**：使用 `.prettierrc.mjs` 或 `.prettierrc.cjs`（明确区分）
- **动态配置**：必须使用 `.js`、`.cjs` 或 `.mjs`
- **团队统一**：选择一种格式并在团队内保持一致

## 一、基础配置选项

### 1.1 printWidth

**作用**：指定每行代码的最大字符宽度，超过后会换行。

```json
{
  "printWidth": 80
}
```

**默认值**：`80`

**影响对比**：

```javascript
// printWidth: 80 (默认)
const user = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  address: "123 Main Street"
};

function calculateTotal(price, quantity, discount) {
  return price * quantity - discount;
}

// printWidth: 120
const user = { firstName: "John", lastName: "Doe", email: "john.doe@example.com", address: "123 Main Street" };

function calculateTotal(price, quantity, discount) { return price * quantity - discount; }

// printWidth: 40
const user = {
  firstName: "John",
  lastName: "Doe",
  email:
    "john.doe@example.com",
  address:
    "123 Main Street"
};

function calculateTotal(
  price,
  quantity,
  discount
) {
  return (
    price * quantity -
    discount
  );
}
```

**使用建议**：
- 小屏幕或分屏开发：`80`
- 宽屏显示器：`100` 或 `120`
- 团队标准：`80`（传统标准）或 `100`（现代宽屏）

### 1.2 tabWidth

**作用**：指定缩进的空格数。

```json
{
  "tabWidth": 2
}
```

**默认值**：`2`

**影响对比**：

```javascript
// tabWidth: 2
function greet(name) {
  if (name) {
    console.log(`Hello ${name}`);
  }
}

// tabWidth: 4
function greet(name) {
    if (name) {
        console.log(`Hello ${name}`);
    }
}
```

**使用建议**：
- JavaScript/TypeScript/Vue/React：`2`（社区主流）
- Python/Java：`4`
- 根据团队习惯选择

### 1.3 useTabs

**作用**：使用 Tab 字符缩进而不是空格。

```json
{
  "useTabs": false
}
```

**默认值**：`false`

**影响对比**：

```javascript
// useTabs: false（空格）
function calculate() {
··return 42;  // 2个空格
}

// useTabs: true（Tab）
function calculate() {
→ return 42;  // 1个Tab字符
}
```

**使用建议**：
- 现代项目推荐：`false`（空格）
- 跨平台一致性更好
- 避免不同编辑器 Tab 宽度不一致的问题

### 1.4 semi

**作用**：是否在语句末尾添加分号。

```json
{
  "semi": true
}
```

**默认值**：`true`

**影响对比**：

```javascript
// semi: true
const name = "John";
const age = 30;

function greet() {
  console.log("Hello");
}

export default App;

// semi: false
const name = "John"
const age = 30

function greet() {
  console.log("Hello")
}

export default App
```

**潜在问题（semi: false 时）**：

```javascript
// ❌ 可能出现的问题
const result = getData()
[1, 2, 3].forEach(n => console.log(n))
// 实际执行：const result = getData()[1, 2, 3].forEach(...)

// ✅ 需要手动添加分号
const result = getData()
;[1, 2, 3].forEach(n => console.log(n))
```

**使用建议**：
- 推荐：`true`（避免潜在问题）
- JavaScript 标准：`true`
- 无分号风格：`false`（需要团队熟悉 ASI 规则）

### 1.5 singleQuote

**作用**：使用单引号而不是双引号。

```json
{
  "singleQuote": true
}
```

**默认值**：`false`（双引号）

**影响对比**：

```javascript
// singleQuote: false（双引号）
const message = "Hello World";
const template = "User: John";
import Button from "./components/Button";

// singleQuote: true（单引号）
const message = 'Hello World';
const template = 'User: John';
import Button from './components/Button';

// 注意：字符串内包含引号时会自动选择
const text1 = "It's a beautiful day";  // 包含单引号，使用双引号
const text2 = 'He said "Hello"';       // 包含双引号，使用单引号
```

**使用建议**：
- JavaScript/TypeScript：`true`（社区主流）
- HTML 属性：始终使用双引号（Prettier 自动处理）
- JSON：始终使用双引号（规范要求）

### 1.6 jsxSingleQuote

**作用**：在 JSX 中使用单引号而不是双引号。

```json
{
  "jsxSingleQuote": false
}
```

**默认值**：`false`（双引号）

**影响对比**：

```jsx
// jsxSingleQuote: false（默认）
<div className="container">
  <Button type="primary" onClick={handleClick}>
    Click me
  </Button>
</div>

// jsxSingleQuote: true
<div className='container'>
  <Button type='primary' onClick={handleClick}>
    Click me
  </Button>
</div>
```

**使用建议**：
- 推荐：`false`（JSX 中使用双引号是社区惯例）
- 注意：此选项独立于 `singleQuote`，只影响 JSX 属性

### 1.7 quoteProps

**作用**：对象属性的引号使用规则。

```json
{
  "quoteProps": "as-needed"
}
```

**可选值**：
- `as-needed`（默认）：仅在需要时添加引号
- `consistent`：如果有一个属性需要引号，则所有属性都加引号
- `preserve`：保持原样

**影响对比**：

```javascript
// quoteProps: "as-needed"（默认）
const obj = {
  name: "John",
  age: 30,
  "first-name": "John",  // 必须用引号（包含特殊字符）
  "123": "number"        // 必须用引号（数字开头）
};

// quoteProps: "consistent"
const obj = {
  "name": "John",
  "age": 30,
  "first-name": "John",
  "123": "number"
};

// quoteProps: "preserve"（保持原样）
const obj = {
  "name": "John",  // 如果原来有引号，保留
  age: 30,         // 如果原来没有，不加
  "first-name": "John"
};
```

**使用建议**：
- 推荐：`as-needed`（简洁）
- 严格一致性：`consistent`

### 1.8 trailingComma

**作用**：在多行结构中是否添加尾随逗号。

```json
{
  "trailingComma": "es5"
}
```

**可选值**：
- `all`（默认，Prettier 3.x）：尽可能添加（包括函数参数）
- `es5`（Prettier 2.x 默认）：在 ES5 中有效的地方添加（对象、数组）
- `none`：不添加尾随逗号

**影响对比**：

```javascript
// trailingComma: "none"
const arr = [
  1,
  2,
  3
];

const obj = {
  name: "John",
  age: 30
};

function greet(
  firstName,
  lastName
) {}

// trailingComma: "es5"（推荐）
const arr = [
  1,
  2,
  3,  // ✅ 数组添加
];

const obj = {
  name: "John",
  age: 30,  // ✅ 对象添加
};

function greet(
  firstName,
  lastName  // ❌ 函数参数不添加（ES5 不支持）
) {}

// trailingComma: "all"
const arr = [
  1,
  2,
  3,
];

const obj = {
  name: "John",
  age: 30,
};

function greet(
  firstName,
  lastName,  // ✅ 函数参数也添加（ES2017+）
) {}
```

**优势**：

```javascript
// ✅ 使用尾随逗号 - Git diff 更清晰
const user = {
  name: "John",
  age: 30,
+ email: "john@example.com",  // 只显示这一行变更
};

// ❌ 不使用尾随逗号 - Git diff 有两行变更
const user = {
  name: "John",
- age: 30
+ age: 30,
+ email: "john@example.com"
};
```

**使用建议**：
- 现代项目：`es5` 或 `all`
- 兼容老浏览器：`es5`
- 不喜欢尾随逗号：`none`

### 1.9 bracketSpacing

**作用**：对象字面量的括号之间是否添加空格。

```json
{
  "bracketSpacing": true
}
```

**默认值**：`true`

**影响对比**：

```javascript
// bracketSpacing: true（默认）
const obj = { name: "John", age: 30 };
import { useState, useEffect } from 'react';

// bracketSpacing: false
const obj = {name: "John", age: 30};
import {useState, useEffect} from 'react';
```

**使用建议**：
- 推荐：`true`（更易阅读）
- 紧凑风格：`false`

### 1.10 bracketSameLine

**作用**：在 JSX 中，将 `>` 放在最后一行的末尾，而不是单独一行。

```json
{
  "bracketSameLine": false
}
```

**默认值**：`false`

:::tip 选项重命名
此选项在 Prettier 2.4.0 中引入，替代了已废弃的 `jsxBracketSameLine` 选项。如果你的项目使用 Prettier 2.3 或更早版本，请使用 `jsxBracketSameLine` 代替。
:::

**影响对比**：

```jsx
// bracketSameLine: false（默认）
<button
  className="btn"
  onClick={handleClick}
>
  Click me
</button>

<Component
  prop1="value1"
  prop2="value2"
/>

// bracketSameLine: true
<button
  className="btn"
  onClick={handleClick}>
  Click me
</button>

<Component
  prop1="value1"
  prop2="value2" />
```

**使用建议**：
- React/Vue 推荐：`false`（更清晰）
- 紧凑风格：`true`

### 1.11 arrowParens

**作用**：箭头函数参数是否始终添加括号。

```json
{
  "arrowParens": "always"
}
```

**可选值**：
- `always`（默认，Prettier 3.x）：始终添加括号
- `avoid`（Prettier 2.x 默认）：尽可能省略括号

**影响对比**：

```javascript
// arrowParens: "always"
const greet = (name) => console.log(name);
const double = (x) => x * 2;
const log = (msg) => {
  console.log(msg);
};

// async 函数
const fetchData = async (url) => {
  const res = await fetch(url);
  return res.json();
};

// arrowParens: "avoid"
const greet = name => console.log(name);
const double = x => x * 2;
const log = msg => {
  console.log(msg);
};

// async 仍需要括号（语法要求）
const fetchData = async (url) => {
  const res = await fetch(url);
  return res.json();
};

// 多个参数必须用括号
const add = (a, b) => a + b;

// 使用解构必须用括号
const getName = ({ name }) => name;
```

**使用建议**：
- TypeScript 项目：`always`（添加类型时需要括号）
- JavaScript 项目：`always`（一致性）或 `avoid`（简洁）

## 二、HTML/Vue/JSX 相关

### 2.1 htmlWhitespaceSensitivity

**作用**：HTML 文件的空格敏感度。

```json
{
  "htmlWhitespaceSensitivity": "css"
}
```

**可选值**：
- `css`（默认）：遵循 CSS display 属性
- `strict`：所有空格都敏感
- `ignore`：所有空格都不敏感

**影响对比**：

```html
<!-- htmlWhitespaceSensitivity: "css" -->
<div>
  <span>Hello</span>
  <span>World</span>
</div>

<!-- htmlWhitespaceSensitivity: "strict" -->
<div>
  <span>Hello</span> <span>World</span>
</div>

<!-- htmlWhitespaceSensitivity: "ignore" -->
<div><span>Hello</span><span>World</span></div>
```

**使用建议**：
- 推荐：`css`（默认，符合预期）
- 精确控制空格：`strict`

### 2.2 vueIndentScriptAndStyle

**作用**：Vue 文件中是否缩进 `<script>` 和 `<style>` 标签内的代码。

```json
{
  "vueIndentScriptAndStyle": false
}
```

**默认值**：`false`

**影响对比**：

```vue
<!-- vueIndentScriptAndStyle: false（默认）-->
<template>
  <div>
    <h1>{{ title }}</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: 'Hello'
    };
  }
};
</script>

<style>
.container {
  padding: 20px;
}
</style>

<!-- vueIndentScriptAndStyle: true -->
<template>
  <div>
    <h1>{{ title }}</h1>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        title: 'Hello'
      };
    }
  };
</script>

<style>
  .container {
    padding: 20px;
  }
</style>
```

**使用建议**：
- 推荐：`false`（Vue 官方风格）
- 个人偏好：`true`

### 2.3 singleAttributePerLine

**作用**：在 HTML、Vue、JSX 中，每行只保留一个属性。

```json
{
  "singleAttributePerLine": false
}
```

**默认值**：`false`

**影响对比**：

```jsx
// singleAttributePerLine: false
<button className="btn" onClick={handleClick} disabled>
  Click me
</button>

<input type="text" value={value} onChange={handleChange} placeholder="Enter name" />

// singleAttributePerLine: true
<button
  className="btn"
  onClick={handleClick}
  disabled
>
  Click me
</button>

<input
  type="text"
  value={value}
  onChange={handleChange}
  placeholder="Enter name"
/>
```

**使用建议**：
- 推荐：`false`（自动根据 printWidth 决定）
- 严格单行：`true`（更清晰，但较长）

## 三、其他选项

### 3.1 endOfLine

**作用**：指定换行符。

```json
{
  "endOfLine": "lf"
}
```

**可选值**：
- `lf`（默认，Prettier 3.x）：Unix/Linux 换行符 `\n`
- `crlf`：Windows 换行符 `\r\n`
- `cr`：旧 Mac 换行符 `\r`
- `auto`（Prettier 2.x 默认）：保持现有换行符

**影响对比**：

```javascript
// endOfLine: "lf" (Unix/Linux/macOS)
const name = "John";\n
const age = 30;\n

// endOfLine: "crlf" (Windows)
const name = "John";\r\n
const age = 30;\r\n
```

**使用建议**：
- 跨平台项目：`lf`（Git 配置 autocrlf）
- Windows 团队：`crlf`
- 推荐：`lf`（现代标准）

### 3.2 proseWrap

**作用**：Markdown 文本换行方式。

```json
{
  "proseWrap": "preserve"
}
```

**可选值**：
- `preserve`（默认）：保持原样
- `always`：超过 printWidth 就换行
- `never`：不换行

**影响对比**：

```markdown
<!-- proseWrap: "preserve" -->
This is a very long line of text that might exceed the print width but will be kept as is.

<!-- proseWrap: "always" (printWidth: 80) -->
This is a very long line of text that might exceed the print width but will be
kept as is.

<!-- proseWrap: "never" -->
This is a very long line of text that might exceed the print width but will be kept as is on a single line.
```

**使用建议**：
- 推荐：`preserve`（保持作者意图）
- 技术文档：`always`（便于 diff）

### 3.3 embeddedLanguageFormatting

**作用**：是否格式化嵌入式代码（如 Markdown 中的代码块）。

```json
{
  "embeddedLanguageFormatting": "auto"
}
```

**可选值**：
- `auto`（默认）：自动格式化可识别的嵌入代码
- `off`：不格式化嵌入代码

**影响对比**：

````markdown
<!-- embeddedLanguageFormatting: "auto" -->
```javascript
function greet(name) {
  console.log(`Hello ${name}`);
}
```

<!-- embeddedLanguageFormatting: "off" -->
```javascript
function greet(name){console.log(`Hello ${name}`);}
```
````

**使用建议**：
- 推荐：`auto`（格式化所有代码）

## 四、完整推荐配置

### 4.1 通用项目配置

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 4.2 React/TypeScript 项目配置

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "all",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "singleAttributePerLine": false
}
```

### 4.3 Vue 项目配置

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false,
  "htmlWhitespaceSensitivity": "css"
}
```

### 4.4 按文件类型覆盖配置

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "printWidth": 120,
        "tabWidth": 2
      }
    },
    {
      "files": "*.md",
      "options": {
        "proseWrap": "always",
        "printWidth": 80
      }
    },
    {
      "files": ["*.css", "*.scss"],
      "options": {
        "singleQuote": false
      }
    },
    {
      "files": "*.vue",
      "options": {
        "vueIndentScriptAndStyle": true
      }
    }
  ]
}
```

## 五、配置文件完整示例

### 5.1 .prettierrc.json

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "all",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "vueIndentScriptAndStyle": false,
  "endOfLine": "lf",
  "embeddedLanguageFormatting": "auto",
  "singleAttributePerLine": false
}
```

### 5.2 .prettierignore

```bash
# 依赖
node_modules
pnpm-lock.yaml
package-lock.json
yarn.lock

# 构建产物
dist
build
.next
.nuxt
out
coverage

# 缓存
.cache
.temp
*.log

# 自动生成的文件
*.min.js
*.min.css
auto-imports.d.ts
components.d.ts

# 其他
.git
.DS_Store
```

### 5.3 package.json 脚本

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "format:staged": "prettier --write"
  },
  "devDependencies": {
    "prettier": "^3.2.5"
  }
}
```

## 六、与 ESLint 集成

### 6.1 安装依赖

```bash
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

### 6.2 配置 ESLint

```javascript
// eslint.config.js (ESLint 9+)
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  prettierConfig,
  {
    plugins: {
      prettier
    },
    rules: {
      'prettier/prettier': 'error'
    }
  }
];

// .eslintrc.js (ESLint 8)
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended'  // 必须放在最后
  ],
  rules: {
    'prettier/prettier': 'error'
  }
};
```

### 6.3 VS Code 设置

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
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
  }
}
```

## 七、Pre-commit Hook 配置

### 7.1 使用 husky + lint-staged

```bash
# 安装依赖
npm install --save-dev husky lint-staged
npx husky init
```

**package.json**：

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
    "*.{json,md,html,css,scss}": [
      "prettier --write"
    ]
  }
}
```

**.husky/pre-commit**：

```bash
#!/usr/bin/env sh
npx lint-staged
```

### 7.2 使用 simple-git-hooks

```bash
npm install --save-dev simple-git-hooks lint-staged
```

**package.json**：

```json
{
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged"
  },
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  },
  "scripts": {
    "prepare": "simple-git-hooks"
  }
}
```

```bash
# 初始化
npx simple-git-hooks
```

## 八、常见问题和最佳实践

### 8.1 Prettier vs ESLint

**区别**：

| 工具 | 职责 | 示例 |
|------|------|------|
| Prettier | 代码格式化（样式） | 缩进、引号、分号、换行 |
| ESLint | 代码质量检查 | 未使用的变量、潜在错误 |

**推荐做法**：
```json
{
  "extends": ["eslint:recommended", "plugin:prettier/recommended"]
}
```

### 8.2 团队协作配置建议

1. **统一配置**：将 `.prettierrc.json` 提交到 Git
2. **编辑器配置**：分享 `.vscode/settings.json`
3. **CI 检查**：添加格式检查到 CI 流程

```yaml
# .github/workflows/ci.yml
- name: Check formatting
  run: npm run format:check
```

### 8.3 迁移现有项目

```bash
# 1. 安装 Prettier
npm install --save-dev prettier

# 2. 创建配置文件
echo {}> .prettierrc.json

# 3. 创建忽略文件
echo "node_modules" > .prettierignore

# 4. 格式化所有文件（建议单独提交）
npm run format

# 5. 提交更改
git add .
git commit -m "chore: 应用 Prettier 格式化"
```

### 8.4 解决格式化冲突

```javascript
// 如果某段代码不想被格式化
// prettier-ignore
const matrix = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
];

// prettier-ignore
function test() { return 'not formatted'; }
```

```html
<!-- prettier-ignore -->
<div    class="special-formatting"     >Content</div>
```

### 8.5 性能优化

```json
{
  "scripts": {
    "format": "prettier --write --cache .",
    "format:check": "prettier --check --cache ."
  }
}
```

`--cache` 选项会缓存格式化结果，加快后续运行速度。

## 九、总结

### 必须配置的选项

1. **printWidth**: `80` 或 `100` - 根据团队屏幕选择
2. **semi**: `true` - 避免 ASI 陷阱
3. **singleQuote**: `true` - JavaScript 社区主流
4. **trailingComma**: `all` - 更好的 Git diff（Prettier 3.x 默认）
5. **endOfLine**: `lf` - 跨平台一致性（Prettier 3.x 默认）

### 推荐工作流

1. 安装 Prettier 和编辑器插件
2. 配置保存时自动格式化
3. 配置 pre-commit hook
4. 在 CI 中检查格式

### 学习建议

1. 从默认配置开始使用
2. 根据团队习惯逐步调整
3. 保持配置简单（少即是多）
4. 使用 `.prettierignore` 排除特殊文件

## 参考资源

- [Prettier 官方文档](https://prettier.io/docs/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Prettier Playground](https://prettier.io/playground/)
- [ESLint + Prettier 集成指南](https://prettier.io/docs/en/integrating-with-linters.html)
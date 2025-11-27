---
title: tsconfig.json 配置选项
date: 2025-11-27
duration: 150min
type: notes
art: random
---

[[toc]]

## 什么是 tsconfig.json

`tsconfig.json` 是 TypeScript 项目的配置文件，它告诉 TypeScript 编译器如何编译你的项目。当目录中存在 `tsconfig.json` 文件时，表示该目录是 TypeScript 项目的根目录。

```bash
# 初始化 tsconfig.json（生成默认配置）
tsc --init
```

:::tip 版本说明
本文档基于 **TypeScript 5.9+** 编写，包含最新的配置选项和最佳实践。如果你使用旧版本 TypeScript，某些选项可能不可用。

**主要更新**：
- ✅ 新增 TypeScript 5.0+ 的 `verbatimModuleSyntax`、`allowImportingTsExtensions` 等选项
- ✅ 新增 TypeScript 5.4+ 的 `module: "preserve"` 选项
- ✅ 更新了现代前端项目（Vite/Next.js）的推荐配置
- ✅ 更新了 Node.js ESM 项目的最佳实践
- ✅ 补充了 `noUncheckedIndexedAccess`、`moduleDetection` 等重要选项
:::

:::warning 注意事项
- 配置选项会随 TypeScript 版本更新而变化
- 不同的构建工具（Vite、Webpack、esbuild）可能需要不同的配置
- 建议使用 `tsc --init` 生成初始配置，然后根据项目需求调整
:::

## 基础结构

```json
{
  "compilerOptions": {
    // 编译选项
  },
  "include": [],    // 包含的文件
  "exclude": [],    // 排除的文件
  "files": [],      // 指定要编译的文件列表
  "extends": "",    // 继承其他配置文件
  "references": []  // 项目引用
}
```

## 一、顶级配置字段

### 1.1 files

**作用**：指定需要编译的文件列表（精确控制）。

```json
{
  "files": [
    "src/index.ts",
    "src/utils.ts"
  ]
}
```

**影响对比**：

```typescript
// ❌ 配置了 files，但尝试编译未列出的文件
// src/app.ts - 不会被编译

// ✅ 只有列出的文件会被编译
// src/index.ts - 会被编译
// src/utils.ts - 会被编译
```

**使用场景**：小型项目或需要精确控制编译文件时使用。

### 1.2 include

**作用**：指定需要编译的文件模式（支持通配符）。

```json
{
  "include": [
    "src/**/*",        // src 下所有文件
    "tests/**/*.ts"    // tests 下所有 .ts 文件
  ]
}
```

**通配符说明**：
- `*`：匹配零个或多个字符（不包括目录分隔符）
- `?`：匹配任意单个字符（不包括目录分隔符）
- `**/`：递归匹配任意深度的子目录

**影响对比**：

```typescript
// 配置: "include": ["src/**/*"]

// ✅ 会被包含
src/index.ts
src/utils/helper.ts
src/components/Button.tsx

// ❌ 不会被包含
lib/external.ts
tests/app.test.ts
```

**默认值**：如果未指定，默认包含 `**/*`（所有文件）。

### 1.3 exclude

**作用**：排除不需要编译的文件（在 include 的基础上排除）。

```json
{
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",      // 排除依赖包（默认）
    "**/*.spec.ts",      // 排除测试文件
    "**/*.test.ts",
    "dist"               // 排除构建输出目录
  ]
}
```

**重要提示**：
- `exclude` 只影响 `include` 的结果
- 被 `import` 引用的文件仍会被编译
- `node_modules` 默认被排除

**影响对比**：

```typescript
// 配置
{
  "include": ["src/**/*"],
  "exclude": ["**/*.test.ts"]
}

// ❌ 不会被编译
src/utils.test.ts

// ✅ 会被编译（因为被 import 了）
// src/index.ts
import { helper } from './utils.test'; // utils.test.ts 仍会被编译
```

### 1.4 extends

**作用**：继承其他配置文件，实现配置复用。

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true
  }
}

// tsconfig.json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

**合并规则**：
- 子配置会覆盖父配置的同名属性
- `files`、`include`、`exclude` 会完全覆盖，不会合并

**实际应用**：

```json
// configs/base.json - 基础配置
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020"
  }
}

// tsconfig.json - 开发环境
{
  "extends": "./configs/base.json",
  "compilerOptions": {
    "sourceMap": true
  }
}

// tsconfig.prod.json - 生产环境
{
  "extends": "./configs/base.json",
  "compilerOptions": {
    "sourceMap": false,
    "removeComments": true
  }
}
```

## 二、compilerOptions - 编译选项

### 2.1 类型检查相关

#### strict

**作用**：启用所有严格类型检查选项（推荐开启）。

```json
{
  "compilerOptions": {
    "strict": true  // 等同于开启以下所有选项
  }
}
```

等价于开启以下所有选项：
```json
{
  "compilerOptions": {
    "alwaysStrict": true,                      // 始终以严格模式解析
    "strictNullChecks": true,                  // 严格的 null/undefined 检查
    "strictBindCallApply": true,               // 严格检查 bind/call/apply
    "strictFunctionTypes": true,               // 严格的函数类型检查
    "strictPropertyInitialization": true,      // 严格的类属性初始化检查
    "noImplicitAny": true,                     // 禁止隐式 any
    "noImplicitThis": true,                    // 禁止隐式 this
    "useUnknownInCatchVariables": true         // catch 子句变量为 unknown（TS 4.4+）
  }
}
```

**注意**：`strict: true` 会随着 TypeScript 版本升级而包含新的严格检查选项。

**影响对比**：

```typescript
// ❌ strict: false
function greet(name) {  // 参数隐式 any，不报错
  return "Hello " + name;
}

let value: string | null = null;
console.log(value.length);  // 不报错，运行时崩溃

// ✅ strict: true
function greet(name) {  // ❌ 错误：参数 'name' 隐式具有 'any' 类型
  return "Hello " + name;
}

let value: string | null = null;
console.log(value.length);  // ❌ 错误：对象可能为 'null'

// 正确写法
function greet(name: string) {  // ✅ 显式类型
  return "Hello " + name;
}

let value: string | null = null;
if (value !== null) {
  console.log(value.length);  // ✅ 类型守卫
}
```

#### noImplicitAny

**作用**：禁止隐式 `any` 类型。

```json
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}
```

**影响对比**：

```typescript
// ❌ noImplicitAny: false
function calculate(a, b) {  // 参数隐式为 any
  return a + b;
}
calculate("1", "2");  // "12" - 可能不是预期结果

// ✅ noImplicitAny: true
function calculate(a, b) {  // ❌ 错误：参数隐式具有 'any' 类型
  return a + b;
}

// 正确写法
function calculate(a: number, b: number): number {
  return a + b;
}
calculate(1, 2);  // 3
```

#### strictNullChecks

**作用**：严格的 `null` 和 `undefined` 检查。

```json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

**影响对比**：

```typescript
// ❌ strictNullChecks: false
let name: string = null;  // 不报错
let age: number = undefined;  // 不报错

function getUserName(user) {
  return user.name.toUpperCase();  // 运行时可能崩溃
}

// ✅ strictNullChecks: true
let name: string = null;  // ❌ 错误：不能将类型 'null' 分配给类型 'string'
let age: number = undefined;  // ❌ 错误

// 正确写法
let name: string | null = null;  // ✅
let age: number | undefined = undefined;  // ✅

function getUserName(user: { name: string } | null) {
  if (user === null) {
    return "Unknown";
  }
  return user.name.toUpperCase();  // ✅ 类型安全
}

// 或使用可选链
function getUserName(user?: { name?: string }) {
  return user?.name?.toUpperCase() ?? "Unknown";
}
```

#### noUnusedLocals

**作用**：检测未使用的本地变量。

```json
{
  "compilerOptions": {
    "noUnusedLocals": true
  }
}
```

**影响对比**：

```typescript
// ❌ noUnusedLocals: false
function calculate() {
  const result = 10;  // 未使用，不报错
  const temp = 20;    // 未使用，不报错
  return 30;
}

// ✅ noUnusedLocals: true
function calculate() {
  const result = 10;  // ❌ 错误：'result' 已声明但从未使用
  const temp = 20;    // ❌ 错误：'temp' 已声明但从未使用
  return 30;
}

// 正确写法
function calculate() {
  const result = 10;
  return result * 3;
}
```

#### noUnusedParameters

**作用**：检测未使用的函数参数。

```json
{
  "compilerOptions": {
    "noUnusedParameters": true
  }
}
```

**影响对比**：

```typescript
// ❌ noUnusedParameters: false
function greet(name: string, age: number) {  // age 未使用，不报错
  return `Hello ${name}`;
}

// ✅ noUnusedParameters: true
function greet(name: string, age: number) {  // ❌ 错误：'age' 已声明但从未使用
  return `Hello ${name}`;
}

// 正确写法 1：删除未使用的参数
function greet(name: string) {
  return `Hello ${name}`;
}

// 正确写法 2：用下划线前缀表示故意不使用
function greet(name: string, _age: number) {  // ✅ 不报错
  return `Hello ${name}`;
}
```

#### noUncheckedIndexedAccess

**作用**：索引访问时自动包含 `undefined` 类型（TypeScript 4.1+）。

```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true
  }
}
```

**影响对比**：

```typescript
// ❌ noUncheckedIndexedAccess: false
const arr = [1, 2, 3];
const item = arr[10];  // 类型：number
item.toFixed(2);       // 运行时崩溃！arr[10] 是 undefined

const obj: Record<string, number> = {};
const value = obj['key'];  // 类型：number
value.toFixed(2);          // 运行时崩溃！

// ✅ noUncheckedIndexedAccess: true
const arr = [1, 2, 3];
const item = arr[10];  // 类型：number | undefined
item.toFixed(2);       // ❌ 错误：对象可能为 'undefined'

// 正确写法
if (item !== undefined) {
  item.toFixed(2);  // ✅ 类型守卫
}

const obj: Record<string, number> = {};
const value = obj['key'];  // 类型：number | undefined
if (value !== undefined) {
  value.toFixed(2);  // ✅
}

// 或使用可选链
arr[10]?.toFixed(2);
obj['key']?.toFixed(2);
```

**使用建议**：强烈推荐开启，避免常见的数组越界和对象访问错误。

### 2.2 模块相关

#### module

**作用**：指定生成的模块系统。

```json
{
  "compilerOptions": {
    "module": "ESNext"  // 或 "CommonJS", "AMD", "UMD", "System"
  }
}
```

**常用值**：
- `CommonJS`：Node.js 使用（`require`/`module.exports`）
- `ESNext`/`ES2015`/`ES2020`：现代 ES 模块（`import`/`export`）
- `Node16`/`NodeNext`：Node.js 原生 ESM 支持
- `preserve`：保持原始模块语法（TypeScript 5.4+，用于打包工具）
- `UMD`：通用模块定义，兼容多种环境

**影响对比**：

```typescript
// 源代码
export const name = "TypeScript";
export default function greet() {
  console.log("Hello");
}

// module: "CommonJS" 编译后
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
exports.name = "TypeScript";
function greet() {
    console.log("Hello");
}
exports.default = greet;

// module: "ESNext" 编译后
export const name = "TypeScript";
export default function greet() {
    console.log("Hello");
}
```

**module: "preserve" 说明**（TypeScript 5.4+）：

```json
{
  "compilerOptions": {
    "module": "preserve"
    // 自动隐含：
    // "moduleResolution": "bundler"
    // "esModuleInterop": true
    // "resolveJsonModule": true
  }
}
```

- 专为现代打包工具设计（Vite、Webpack、esbuild）
- 完全保留 ES 模块语法，不进行转换
- 简化配置，自动设置相关选项

**使用建议**：
- **Node.js CommonJS 项目**：`CommonJS`
- **Node.js ESM 项目**：`Node16` 或 `NodeNext`
- **现代前端项目（Vite/Webpack）**：`ESNext` 或 `preserve`
- **库开发**：根据目标环境选择

#### moduleResolution

**作用**：指定模块解析策略。

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"  // 或 "node", "node16", "nodenext", "classic"
  }
}
```

**常用值**：
- `bundler`：现代打包工具（Vite、esbuild、Webpack 5+）- **推荐用于前端项目**
- `node16`/`nodenext`：Node.js ESM 解析（Node.js 项目推荐）
- `node`：传统 Node.js 解析（CommonJS）
- `classic`：旧版，不推荐

**影响对比**：

```typescript
// import { helper } from "./utils"

// moduleResolution: "node"（传统模式）
// 按顺序查找：
// 1. ./utils.ts
// 2. ./utils.tsx
// 3. ./utils.d.ts
// 4. ./utils/package.json (查找 "types" 字段)
// 5. ./utils/index.ts
// 6. ./utils/index.tsx
// 7. ./utils/index.d.ts

// moduleResolution: "bundler"（TypeScript 4.7+）
// 现代打包工具解析，支持：
// - package.json 的 "exports" 字段
// - 自动扩展名解析
// - 允许 .ts/.tsx 扩展名导入
// - 更好的性能和灵活性
// - 隐含开启 esModuleInterop 和 resolveJsonModule

// moduleResolution: "node16" / "nodenext"
// Node.js ESM 模式：
// - 严格遵循 Node.js 模块解析规则
// - 要求显式写文件扩展名（.js/.mjs）
// - 支持 package.json 的 "exports" 字段
```

**使用建议**：
- **前端项目（Vite/Webpack）**：使用 `bundler`
- **Node.js ESM 项目**：使用 `node16` 或 `nodenext`
- **Node.js CommonJS 项目**：使用 `node`

#### baseUrl 和 paths

**作用**：配置模块路径映射，简化导入路径。

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "~/*": ["./"]
    }
  }
}
```

**影响对比**：

```typescript
// ❌ 不配置 paths - 相对路径很长
import { Button } from '../../../components/Button';
import { helper } from '../../../utils/helper';
import { config } from '../../../../config';

// ✅ 配置 paths - 简洁清晰
import { Button } from '@/components/Button';
import { helper } from '@utils/helper';
import { config } from '~/config';
```

**目录结构**：
```
project/
├── src/
│   ├── components/
│   │   └── Button.tsx
│   ├── utils/
│   │   └── helper.ts
│   └── pages/
│       └── home/
│           └── index.tsx
├── config.ts
└── tsconfig.json
```

#### resolveJsonModule

**作用**：允许导入 JSON 文件。

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

**影响对比**：

```typescript
// package.json
{
  "name": "my-app",
  "version": "1.0.0"
}

// ❌ resolveJsonModule: false
import pkg from './package.json';  // ❌ 错误：找不到模块

// ✅ resolveJsonModule: true
import pkg from './package.json';  // ✅ 类型安全
console.log(pkg.version);  // "1.0.0"
console.log(pkg.name);     // "my-app"

// 获得完整的类型提示
pkg.  // 自动补全：name, version 等
```

### 2.3 输出相关

#### outDir

**作用**：指定编译输出目录。

```json
{
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

**影响对比**：

```typescript
// 源码结构
src/
├── index.ts
└── utils/
    └── helper.ts

// ❌ 不配置 outDir - 编译文件和源文件混在一起
src/
├── index.ts
├── index.js      // 编译输出
└── utils/
    ├── helper.ts
    └── helper.js // 编译输出

// ✅ 配置 outDir: "./dist" - 清晰分离
src/
├── index.ts
└── utils/
    └── helper.ts
dist/              // 编译输出
├── index.js
└── utils/
    └── helper.js
```

#### declaration

**作用**：生成类型声明文件（`.d.ts`）。

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./types"  // 可选：声明文件输出目录
  }
}
```

**影响对比**：

```typescript
// src/utils.ts
export function add(a: number, b: number): number {
  return a + b;
}

export interface User {
  name: string;
  age: number;
}

// ❌ declaration: false
// 只生成 dist/utils.js

// ✅ declaration: true
// 生成 dist/utils.js 和 dist/utils.d.ts

// dist/utils.d.ts
export declare function add(a: number, b: number): number;
export interface User {
  name: string;
  age: number;
}
```

**使用场景**：开发 npm 包或类库时必须开启。

#### sourceMap

**作用**：生成 source map 文件，方便调试。

```json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

**影响对比**：

```typescript
// src/index.ts (第 10 行)
function buggyFunction() {
  throw new Error("Something wrong");
}

// ❌ sourceMap: false
// 错误堆栈指向编译后的 JS 文件
Error: Something wrong
    at buggyFunction (dist/index.js:15:10)  // 难以定位

// ✅ sourceMap: true
// 错误堆栈指向原始 TS 文件
Error: Something wrong
    at buggyFunction (src/index.ts:10:10)   // 精确定位
```

**配置建议**：
- 开发环境：`true`
- 生产环境：`false`（减小体积）或只保留在服务端

#### removeComments

**作用**：移除编译后代码中的注释。

```json
{
  "compilerOptions": {
    "removeComments": true
  }
}
```

**影响对比**：

```typescript
// src/index.ts
/**
 * 计算两个数的和
 * @param a 第一个数
 * @param b 第二个数
 */
function add(a: number, b: number) {
  // 返回结果
  return a + b;
}

// ❌ removeComments: false
// dist/index.js
/**
 * 计算两个数的和
 * @param a 第一个数
 * @param b 第二个数
 */
function add(a, b) {
    // 返回结果
    return a + b;
}

// ✅ removeComments: true
// dist/index.js
function add(a, b) {
    return a + b;
}
```

### 2.4 JavaScript 支持

#### allowJs

**作用**：允许编译 JavaScript 文件。

```json
{
  "compilerOptions": {
    "allowJs": true
  }
}
```

**影响对比**：

```javascript
// utils.js
export function helper() {
  return "Hello";
}

// index.ts
// ❌ allowJs: false
import { helper } from './utils.js';  // ❌ 错误：无法导入 JS 文件

// ✅ allowJs: true
import { helper } from './utils.js';  // ✅ 可以导入
console.log(helper());
```

**使用场景**：
- 渐进式迁移 JS 项目到 TS
- 混合使用 JS 和 TS 文件

#### checkJs

**作用**：对 JavaScript 文件进行类型检查。

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true
  }
}
```

**影响对比**：

```javascript
// utils.js

// ❌ checkJs: false
function add(a, b) {
  return a + b;
}
add("1", "2");  // 不报错

// ✅ checkJs: true
function add(a, b) {
  return a + b;
}
add("1", "2");  // ⚠️ 警告：类型不匹配

// 可以使用 JSDoc 添加类型
/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) {
  return a + b;
}
add("1", "2");  // ❌ 错误：类型 'string' 的参数不能赋给类型 'number' 的参数
```

### 2.5 语言和环境

#### target

**作用**：指定编译目标 ECMAScript 版本。

```json
{
  "compilerOptions": {
    "target": "ES2020"  // 或 "ES5", "ES2015", "ESNext"
  }
}
```

**影响对比**：

```typescript
// 源代码
const greet = (name: string) => `Hello ${name}`;

class Person {
  constructor(public name: string) {}
}

const nums = [1, 2, 3];
const doubled = nums.map(n => n * 2);

// target: "ES5" 编译后
var greet = function (name) { return "Hello " + name; };

var Person = /** @class */ (function () {
    function Person(name) {
        this.name = name;
    }
    return Person;
}());

var nums = [1, 2, 3];
var doubled = nums.map(function (n) { return n * 2; });

// target: "ES2020" 编译后
const greet = (name) => `Hello ${name}`;

class Person {
    constructor(name) {
        this.name = name;
    }
}

const nums = [1, 2, 3];
const doubled = nums.map(n => n * 2);
```

**选择建议**：
- 需要兼容老浏览器：`ES5`
- 现代浏览器：`ES2020` 或 `ESNext`
- Node.js 14+：`ES2020`

#### lib

**作用**：指定编译时包含的库文件。

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

**常用库**：
- `ES5`、`ES2015`、`ES2020`、`ESNext`：ECMAScript 标准库
- `DOM`：浏览器 DOM API
- `WebWorker`：Web Worker API
- `DOM.Iterable`：DOM 可迭代对象

**影响对比**：

```typescript
// lib: ["ES2020", "DOM"]
// ✅ 可以使用
const el = document.querySelector('.button');  // DOM API
const promise = Promise.resolve(42);           // ES2020
const map = new Map();                         // ES2015

// ❌ lib 中未包含 "DOM"
const el = document.querySelector('.button');  // ❌ 错误：找不到名称 'document'

// ❌ lib 中未包含 "ES2015" 或更高
const map = new Map();  // ❌ 错误：找不到名称 'Map'
```

#### jsx

**作用**：指定 JSX 代码的编译方式（React 项目必需）。

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"  // 或 "react", "preserve", "react-native"
  }
}
```

**常用值**：
- `react`：转换为 `React.createElement`（React 17 之前）
- `react-jsx`：使用新的 JSX 转换（React 17+）
- `preserve`：保留 JSX，由其他工具处理
- `react-native`：React Native 使用

**影响对比**：

```tsx
// 源代码
function App() {
  return <div>Hello World</div>;
}

// jsx: "react"
import React from 'react';  // 必须导入 React
function App() {
  return React.createElement("div", null, "Hello World");
}

// jsx: "react-jsx"
import { jsx as _jsx } from 'react/jsx-runtime';  // 自动导入
function App() {
  return _jsx("div", { children: "Hello World" });
}

// jsx: "preserve"
// 保持 JSX 不变，由 Babel 等工具处理
function App() {
  return <div>Hello World</div>;
}
```

### 2.6 互操作性

#### esModuleInterop

**作用**：改善 ES 模块和 CommonJS 模块的互操作性（强烈推荐开启）。

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

**影响对比**：

```typescript
// ❌ esModuleInterop: false
import * as React from 'react';         // 必须使用 * as
import * as express from 'express';

const app = express();  // ❌ 错误：express 不可调用

// ✅ esModuleInterop: true
import React from 'react';              // 可以直接导入
import express from 'express';

const app = express();  // ✅ 正常工作
```

#### allowSyntheticDefaultImports

**作用**：允许从没有默认导出的模块中默认导入（类型检查层面）。

```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true
  }
}
```

**影响对比**：

```typescript
// 某个 CommonJS 模块：utils.js
module.exports = {
  helper: () => {}
};

// ❌ allowSyntheticDefaultImports: false
import utils from './utils';  // ❌ 错误：模块没有默认导出

// ✅ allowSyntheticDefaultImports: true
import utils from './utils';  // ✅ 类型检查通过
```

**注意**：`esModuleInterop: true` 会自动启用此选项。

#### forceConsistentCasingInFileNames

**作用**：强制文件名大小写一致（**强烈推荐开启**）。

```json
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true
  }
}
```

**影响对比**：

```typescript
// 文件：src/utils/Helper.ts

// ❌ forceConsistentCasingInFileNames: false
import { helper } from './utils/helper';  // 不报错（但可能在其他系统出问题）
import { helper } from './utils/Helper';  // 不报错

// ✅ forceConsistentCasingInFileNames: true
import { helper } from './utils/helper';  // ❌ 错误：大小写不匹配
import { helper } from './utils/Helper';  // ✅ 正确
```

**重要性**：
- Windows 文件系统不区分大小写，Linux/macOS 区分大小写
- 开启此选项可防止跨平台部署时出现问题
- **必须开启**，避免 CI/CD 和生产环境出现意外

#### allowImportingTsExtensions

**作用**：允许在导入路径中使用 TypeScript 扩展名（TypeScript 5.0+）。

```json
{
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "noEmit": true  // 或 "emitDeclarationOnly": true
  }
}
```

**影响对比**：

```typescript
// ❌ allowImportingTsExtensions: false
import { utils } from './utils.ts';    // ❌ 错误：不能导入 .ts 扩展名
import { helper } from './helper.tsx'; // ❌ 错误

// ✅ allowImportingTsExtensions: true
import { utils } from './utils.ts';    // ✅ 正确
import { helper } from './helper.tsx'; // ✅ 正确
import { Component } from './App.vue'; // ✅ 正确（Vue 项目）

// 传统写法（无扩展名）
import { utils } from './utils';       // ✅ 始终正确
```

**使用场景**：
- 使用 Vite、esbuild 等现代打包工具
- 必须配合 `noEmit: true` 或 `emitDeclarationOnly: true`
- 让导入路径更明确，与实际文件名一致

**注意**：
- 此选项只影响类型检查，不影响运行时
- 打包工具需要支持解析这些扩展名

### 2.7 模块检测

#### moduleDetection

**作用**：控制如何检测文件是否为模块（TypeScript 4.7+）。

```json
{
  "compilerOptions": {
    "moduleDetection": "auto"  // 或 "legacy", "force"
  }
}
```

**可选值**：
- `auto`（默认）：智能检测，根据 import/export、package.json 的 "type" 字段、JSX 判断
- `legacy`：传统模式，只通过 import/export 判断
- `force`：强制所有文件作为模块处理

**影响对比**：

```typescript
// file.ts（无 import/export）
const name = "John";
console.log(name);

// ❌ moduleDetection: "legacy"
// 文件被视为全局脚本，变量会污染全局作用域

// ✅ moduleDetection: "force"
// 文件被视为模块，变量作用域限定在模块内

// ✅ moduleDetection: "auto"
// 根据项目配置智能判断：
// - package.json 中 "type": "module" → 模块
// - .tsx/.jsx 文件 → 模块
// - 有 import/export → 模块
```

**使用建议**：
- **现代项目**：使用 `"force"`，避免意外的全局作用域污染
- **大型项目**：使用 `"auto"`（默认），平衡兼容性
- **迁移项目**：使用 `"legacy"`，保持向后兼容

### 2.8 其他重要选项

#### skipLibCheck

**作用**：跳过类型声明文件（`.d.ts`）的类型检查。

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

**影响对比**：

```typescript
// node_modules 中某个库的类型定义有错误

// ❌ skipLibCheck: false
// 编译时会检查所有 .d.ts 文件，可能报错
// 编译速度慢

// ✅ skipLibCheck: true
// 跳过 node_modules 中的类型检查
// 编译速度快
// 只检查你的代码
```

**建议**：通常设为 `true`，提高编译速度。

#### isolatedModules

**作用**：确保每个文件都可以独立编译（Babel、esbuild 等工具要求）。

```json
{
  "compilerOptions": {
    "isolatedModules": true
  }
}
```

**影响对比**：

```typescript
// ❌ isolatedModules: true 时不允许

// 1. 单独导出类型（无 export）
type User = { name: string };  // ❌ 错误

// 2. const enum
const enum Color {  // ❌ 错误
  Red, Green, Blue
}

// ✅ 正确写法
export type User = { name: string };  // 添加 export

enum Color {  // 使用普通 enum
  Red, Green, Blue
}
```

**使用场景**：使用 Vite、esbuild、swc 等现代构建工具时必须开启。

#### verbatimModuleSyntax

**作用**：更严格的模块语法控制，确保导入导出语句的行为明确（TypeScript 5.0+）。

```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

**影响对比**：

```typescript
// ❌ verbatimModuleSyntax: true 时的限制

// 1. 仅类型导入必须使用 type 修饰符
import { User } from './types';  // ❌ 如果 User 是类型，会在运行时保留导入

// 2. 必须明确区分值导入和类型导入
import { type User, fetchUser } from './api';  // ✅ 正确
import type { User } from './api';             // ✅ 正确
import { fetchUser } from './api';             // ✅ 正确

// 3. 纯类型导入会被完全擦除
import type { A } from "a";                    // 完全擦除
import { type b, c } from "bcd";               // 只保留 c

// 4. 避免意外的副作用导入
import {} from "xyz";  // ❌ 错误：空导入会被删除，应该使用 import "xyz"
```

**优势**：
- 更明确的导入/导出语义
- 避免因类型导入产生的意外副作用
- 更好的打包工具兼容性
- 防止意外的 CommonJS 语法混用

**使用建议**：
- 推荐在新项目中开启
- 可以替代 `isolatedModules`（功能更强）
- 现代前端项目（Vite/Next.js）推荐使用

## 三、完整推荐配置

### 3.1 基础项目配置（现代前端）

```json
{
  "compilerOptions": {
    /* 类型检查 */
    "strict": true,                           // 启用所有严格检查（推荐）
    "noUnusedLocals": true,                   // 检查未使用的局部变量
    "noUnusedParameters": true,               // 检查未使用的参数
    "noFallthroughCasesInSwitch": true,       // 检查 switch 的 fallthrough
    "noUncheckedIndexedAccess": true,         // 索引访问时包含 undefined（TS 4.1+）
    
    /* 模块 */
    "module": "ESNext",                       // 或 "preserve"（TS 5.4+）
    "moduleResolution": "bundler",            // 现代打包工具解析（TS 4.7+）
    "resolveJsonModule": true,                // 允许导入 JSON
    
    /* 输出 */
    "outDir": "./dist",                       // 输出目录
    "sourceMap": true,                        // 生成 source map
    "declaration": true,                      // 生成类型声明
    "declarationMap": true,                   // 生成类型声明的 source map
    
    /* 互操作性 */
    "esModuleInterop": true,                  // ES 模块互操作（必需）
    "forceConsistentCasingInFileNames": true, // 强制文件名大小写（必需）
    "verbatimModuleSyntax": true,             // 严格模块语法（TS 5.0+，推荐）
    
    /* 语言和环境 */
    "target": "ES2020",                       // 编译目标（根据需要调整）
    "lib": ["ES2020", "DOM", "DOM.Iterable"], // 库文件
    
    /* 其他 */
    "skipLibCheck": true,                     // 跳过库检查（提高性能）
    "moduleDetection": "force"                // 强制模块检测（TS 4.7+）
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

**说明**：
- 适用于使用 Vite、Webpack、esbuild 等现代打包工具的项目
- TypeScript 5.x 推荐配置
- 如果使用 TypeScript 5.4+，可以将 `module` 改为 `"preserve"`

### 3.2 React + Vite 项目配置

```json
{
  "compilerOptions": {
    /* 类型检查 */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,         // 更严格的数组访问检查
    
    /* 模块 */
    "module": "ESNext",                       // 或 "preserve"（TS 5.4+）
    "moduleResolution": "bundler",            // Vite 必需
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@hooks/*": ["src/hooks/*"]
    },
    "resolveJsonModule": true,
    "types": ["vite/client"],                 // Vite 环境类型
    
    /* 输出 */
    "noEmit": true,                           // Vite 负责构建
    
    /* JSX */
    "jsx": "react-jsx",                       // React 17+ 新 JSX 转换
    "jsxImportSource": "react",               // JSX 导入源
    
    /* 互操作性 */
    "esModuleInterop": true,
    "allowImportingTsExtensions": true,       // 允许导入 .ts/.tsx（TS 5.0+）
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true,             // 严格模块语法（TS 5.0+）
    
    /* 语言和环境 */
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "useDefineForClassFields": true,          // 标准类字段行为
    
    /* 其他 */
    "skipLibCheck": true,
    "moduleDetection": "force"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**配套的 tsconfig.node.json**：

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["vite.config.ts"]
}
```

### 3.3 Node.js 项目配置

#### A. Node.js ESM 项目（推荐，Node.js 16+）

```json
{
  "compilerOptions": {
    /* 类型检查 */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* 模块 */
    "module": "Node16",                       // 或 "NodeNext"（推荐）
    "moduleResolution": "node16",             // 或 "nodenext"
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"]
    },
    "resolveJsonModule": true,
    "types": ["node"],                        // Node.js 类型
    
    /* 输出 */
    "outDir": "./dist",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    
    /* 互操作性 */
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    
    /* 语言和环境 */
    "target": "ES2022",                       // Node.js 16+ 支持
    "lib": ["ES2022"],                        // 不包含 DOM
    
    /* 其他 */
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"],
  "ts-node": {
    "esm": true
  }
}
```

**package.json** 需要设置：
```json
{
  "type": "module"
}
```

#### B. Node.js CommonJS 项目（传统）

```json
{
  "compilerOptions": {
    /* 类型检查 */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    
    /* 模块 */
    "module": "CommonJS",
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"]
    },
    "resolveJsonModule": true,
    "types": ["node"],
    
    /* 输出 */
    "outDir": "./dist",
    "sourceMap": true,
    "declaration": true,
    
    /* 互操作性 */
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    
    /* 语言和环境 */
    "target": "ES2020",
    "lib": ["ES2020"],
    
    /* 其他 */
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**说明**：
- **推荐使用 ESM**：Node.js 16+ 完全支持 ESM，推荐新项目使用
- **module: "Node16"/"NodeNext"**：严格遵循 Node.js 模块解析规则
- 需要在导入中显式写文件扩展名（如 `"./utils.js"`）
- 安装 `@types/node`：`npm install -D @types/node`

### 3.4 库开发配置

```json
{
  "compilerOptions": {
    /* 类型检查 */
    "strict": true,
    
    /* 模块 */
    "module": "ESNext",
    "moduleResolution": "bundler",
    
    /* 输出 */
    "outDir": "./dist",
    "declaration": true,                      // 必须生成类型声明
    "declarationMap": true,                   // 生成声明映射
    "sourceMap": true,
    "removeComments": true,                   // 移除注释减小体积
    
    /* 互操作性 */
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    
    /* 语言和环境 */
    "target": "ES2015",                       // 兼容性考虑
    "lib": ["ES2015"],
    
    /* 其他 */
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "examples", "tests"]
}
```

### 3.5 Vue 3 + Vite 项目配置

```json
{
  "compilerOptions": {
    /* 类型检查 */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* 模块 */
    "module": "ESNext",                       // 或 "preserve"（TS 5.4+）
    "moduleResolution": "bundler",            // Vite 必需（TS 4.7+）
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@views/*": ["src/views/*"],
      "@utils/*": ["src/utils/*"],
      "@api/*": ["src/api/*"],
      "@store/*": ["src/store/*"]
    },
    "resolveJsonModule": true,
    "types": ["vite/client"],                 // Vite 环境类型
    
    /* 输出 */
    "noEmit": true,                           // Vite 负责构建，无需 tsc 输出
    "sourceMap": false,                       // Vite 处理 source map
    
    /* JSX（Vue JSX/TSX 支持）*/
    "jsx": "preserve",                        // 保留 JSX，由 Vite 处理
    "jsxImportSource": "vue",                 // Vue JSX 支持
    
    /* 互操作性 */
    "esModuleInterop": true,                  // ES 模块互操作（必需）
    "allowImportingTsExtensions": true,       // 允许导入 .vue（TS 5.0+）
    "forceConsistentCasingInFileNames": true, // 强制文件名大小写（必需）
    "isolatedModules": true,                  // Vite 必需
    "verbatimModuleSyntax": true,             // 严格模块语法（TS 5.0+，推荐）
    
    /* 语言和环境 */
    "target": "ES2020",                       // 或 "ESNext"
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "useDefineForClassFields": true,          // Vue 3.3+ 推荐
    
    /* 其他 */
    "skipLibCheck": true,                     // 跳过库检查（必需）
    "moduleDetection": "force"                // 强制模块检测（TS 4.7+）
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",                           // 包含 .vue 文件
    "src/**/*.d.ts",
    "env.d.ts"                                // Vite 环境类型声明
  ],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]  // Vite 配置文件引用
}
```

**配套的 tsconfig.node.json**（用于 Vite 配置文件）：

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["vite.config.ts"]
}
```

**env.d.ts**（Vite 环境类型声明）：

```typescript
/// <reference types="vite/client" />

// Vue 单文件组件类型声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

**说明**：
- 适用于 Vue 3 + Vite 项目
- TypeScript 5.x 推荐配置
- `noEmit: true` 因为 Vite 负责构建
- 使用项目引用分离 Vite 配置文件的类型检查

## 四、TypeScript 5.9+ 最新默认配置

TypeScript 5.9 更新了 `tsc --init` 生成的默认配置，更适合现代开发：

```json
{
  "compilerOptions": {
    /* 文件布局 */
    // "rootDir": "./src",
    // "outDir": "./dist",
    
    /* 环境设置 */
    "module": "nodenext",                     // Node.js 模块系统
    "target": "esnext",                       // 最新 ECMAScript
    "types": [],                              // 不自动引入 @types/*
    
    /* 其他输出 */
    "sourceMap": true,                        // 生成 source map
    "declaration": true,                      // 生成声明文件
    "declarationMap": true,                   // 生成声明文件映射
    
    /* 更严格的类型检查 */
    "strict": true,                           // 启用所有严格检查
    "noUncheckedIndexedAccess": true,         // 索引访问包含 undefined
    "exactOptionalPropertyTypes": true,       // 精确的可选属性类型
    
    /* 推荐选项 */
    "jsx": "react-jsx",                       // React JSX
    "verbatimModuleSyntax": true,             // 严格模块语法
    "isolatedModules": true,                  // 独立模块
    "noUncheckedSideEffectImports": true,     // 检查副作用导入（TS 5.6+）
    "moduleDetection": "force",               // 强制模块检测
    "skipLibCheck": true                      // 跳过库检查
  }
}
```

**与旧版本的主要区别**：
1. ✅ 默认使用 `nodenext` 而不是 `commonjs`
2. ✅ 默认开启 `noUncheckedIndexedAccess`（更安全）
3. ✅ 默认开启 `verbatimModuleSyntax`（更明确）
4. ✅ 新增 `noUncheckedSideEffectImports`（TS 5.6+）
5. ✅ 更简洁的配置，注释掉非必需选项

## 五、常见问题和最佳实践

### 5.1 路径别名不生效

**问题**：配置了 `paths` 但运行时报错找不到模块。

**原因**：TypeScript 只负责类型检查，不会转换路径。

**解决方案**：

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

// vite.config.ts - Vite 项目
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});

// webpack.config.js - Webpack 项目
module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
};
```

### 5.2 严格模式太严格，如何渐进式启用

**策略**：

```json
{
  "compilerOptions": {
    // 第一步：基础检查
    "noImplicitAny": true,
    "strictNullChecks": false,
    
    // 第二步：逐步开启
    // "strictNullChecks": true,
    // "strictFunctionTypes": true,
    
    // 最终目标
    // "strict": true
  }
}
```

### 5.3 如何在一个文件中禁用某些检查

```typescript
// 禁用整个文件的检查
// @ts-nocheck

// 禁用下一行的检查
// @ts-ignore
const value: string = 123;

// 期望下一行有错误（用于测试）
// @ts-expect-error
const value: string = 123;
```

### 5.4 monorepo 多项目配置

```json
// tsconfig.base.json - 基础配置
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}

// packages/web/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM"]
  },
  "include": ["src"]
}

// packages/server/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "lib": ["ES2020"]
  },
  "include": ["src"]
}
```

## 六、总结

### 必须配置的选项（所有项目）

1. ✅ **strict**: `true` - 启用所有严格类型检查
2. ✅ **esModuleInterop**: `true` - ES 模块与 CommonJS 互操作
3. ✅ **skipLibCheck**: `true` - 跳过库类型检查，提高性能
4. ✅ **forceConsistentCasingInFileNames**: `true` - 跨平台一致性（必需）

### TypeScript 5.x 推荐配置

**现代前端项目（Vite/Webpack/Next.js）**：
```json
{
  "compilerOptions": {
    "strict": true,
    "module": "ESNext",                 // 或 "preserve"（TS 5.4+）
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,       // TS 5.0+
    "noUncheckedIndexedAccess": true,   // TS 4.1+
    "allowImportingTsExtensions": true, // TS 5.0+
    "noEmit": true,
    "jsx": "react-jsx",                 // React 项目
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "moduleDetection": "force"
  }
}
```

**Node.js ESM 项目**：
```json
{
  "compilerOptions": {
    "strict": true,
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "lib": ["ES2022"]
  }
}
```

### 根据项目类型配置

| 项目类型 | 关键配置 |
|---------|---------|
| **React + Vite** | `jsx: "react-jsx"`, `module: "ESNext"`, `moduleResolution: "bundler"` |
| **Vue 3 + Vite** | `jsx: "preserve"`, `allowImportingTsExtensions: true`, `noEmit: true` |
| **Node.js ESM** | `module: "NodeNext"`, `moduleResolution: "nodenext"` |
| **Node.js CommonJS** | `module: "CommonJS"`, `moduleResolution: "node"` |
| **库开发** | `declaration: true`, `declarationMap: true` |

### TypeScript 版本特性

| 版本 | 新增重要选项 |
|------|-------------|
| **TS 5.4** | `module: "preserve"` |
| **TS 5.0** | `verbatimModuleSyntax`, `allowImportingTsExtensions` |
| **TS 4.7** | `moduleResolution: "bundler"`, `moduleDetection` |
| **TS 4.1** | `noUncheckedIndexedAccess` |

### 性能优化建议

1. ✅ **skipLibCheck**: `true` - 跳过 node_modules 类型检查
2. ✅ **incremental**: `true` - 启用增量编译
3. ✅ 合理使用 `exclude` 排除不需要的文件
4. ✅ 使用项目引用（`references`）拆分大型 monorepo
5. ✅ 前端项目使用 `noEmit: true`，让构建工具处理编译

### 常见错误配置

❌ **错误示例**：
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node",  // ❌ 不匹配，应该用 "bundler"
    "isolatedModules": false,    // ❌ 使用 Vite 时必须为 true
    "strict": false,             // ❌ 不推荐，失去类型安全
    "skipLibCheck": false        // ❌ 降低性能
  }
}
```

### 学习建议

1. 📚 **使用 `tsc --init`** 生成带注释的配置文件
2. 🔍 **查看官方文档** [typescriptlang.org/tsconfig](https://www.typescriptlang.org/tsconfig)
3. 💡 **使用 IDE 提示** VS Code 会显示每个选项的说明
4. 📦 **参考社区模板** 如 `@tsconfig/node18`、`@tsconfig/vite-react`
5. ⚡ **逐步开启严格模式** 不要一次性开启所有严格选项
6. 🧪 **测试配置** 确保团队成员的开发环境一致

### 快速启动命令

```bash
# 安装 TypeScript
npm install -D typescript

# 生成 tsconfig.json
npx tsc --init

# 使用社区模板（推荐）
npm install -D @tsconfig/vite-react    # React + Vite
npm install -D @tsconfig/node18        # Node.js 18
npm install -D @tsconfig/nuxt          # Nuxt 3

# 然后在 tsconfig.json 中继承
{
  "extends": "@tsconfig/vite-react/tsconfig.json",
  "compilerOptions": {
    // 你的自定义配置
  }
}
```

## 参考资源

### 官方文档
- [TypeScript 官方配置文档](https://www.typescriptlang.org/tsconfig/) - 最权威的配置参考
- [TypeScript 5.9 发布说明](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html)
- [TypeScript 模块系统指南](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html)

### 社区资源
- [TSConfig Bases](https://github.com/tsconfig/bases) - 社区维护的配置模板
  - `@tsconfig/node18` - Node.js 18
  - `@tsconfig/vite-react` - React + Vite
  - `@tsconfig/nuxt` - Nuxt 3
  - 更多模板...
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) - 深入学习 TypeScript
- [TSConfig 参考](https://www.totaltypescript.com/tsconfig-cheat-sheet) - Matt Pocock 的配置速查表

### 工具
- [TSConfig Playground](https://www.typescriptlang.org/play) - 在线测试配置
- [TSConfig Validator](https://github.com/SchemaStore/schemastore) - JSON Schema 验证

### 版本更新
- **TypeScript 5.9**（2024）：更新默认 `tsc --init` 配置
- **TypeScript 5.4**（2024）：新增 `module: "preserve"`
- **TypeScript 5.0**（2023）：新增 `verbatimModuleSyntax`、`allowImportingTsExtensions`
- **TypeScript 4.7**（2022）：新增 `moduleResolution: "bundler"`、`moduleDetection`
- **TypeScript 4.1**（2020）：新增 `noUncheckedIndexedAccess`

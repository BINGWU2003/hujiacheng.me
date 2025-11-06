---
title: tsconfig.json配置选项
date: 2025-11-06
duration: 120min
type: notes
art: random
---

[[toc]]

## 什么是 tsconfig.json

`tsconfig.json` 是 TypeScript 项目的配置文件，它告诉 TypeScript 编译器如何编译你的项目。当目录中存在 `tsconfig.json` 文件时，表示该目录是 TypeScript 项目的根目录。

```bash
# 初始化 tsconfig.json
tsc --init
```

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

等价于：
```json
{
  "compilerOptions": {
    "alwaysStrict": true,
    "strictNullChecks": true,
    "strictBindCallApply": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true
  }
}
```

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

**使用建议**：
- Node.js 项目：`CommonJS`
- 现代前端项目：`ESNext`
- 库开发：根据目标环境选择

#### moduleResolution

**作用**：指定模块解析策略。

```json
{
  "compilerOptions": {
    "moduleResolution": "node"  // 或 "classic", "bundler"
  }
}
```

**常用值**：
- `node`：Node.js 风格解析（推荐）
- `bundler`：现代打包工具（Vite、Webpack 5+）
- `classic`：旧版，不推荐

**影响对比**：

```typescript
// import { helper } from "./utils"

// moduleResolution: "node"
// 按顺序查找：
// 1. ./utils.ts
// 2. ./utils.tsx
// 3. ./utils.d.ts
// 4. ./utils/package.json (查找 "types" 字段)
// 5. ./utils/index.ts
// 6. ./utils/index.tsx
// 7. ./utils/index.d.ts

// moduleResolution: "bundler"
// 现代打包工具解析，支持：
// - package.json 的 "exports" 字段
// - 自动扩展名解析
// - 更好的性能
```

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

**作用**：强制文件名大小写一致。

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

**重要性**：防止在不同操作系统（Windows/Linux/macOS）间出现问题。

### 2.7 其他重要选项

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

## 三、完整推荐配置

### 3.1 基础项目配置

```json
{
  "compilerOptions": {
    /* 类型检查 */
    "strict": true,                           // 启用所有严格检查
    "noUnusedLocals": true,                   // 检查未使用的局部变量
    "noUnusedParameters": true,               // 检查未使用的参数
    "noFallthroughCasesInSwitch": true,       // 检查 switch 的 fallthrough
    
    /* 模块 */
    "module": "ESNext",                       // 使用最新的模块系统
    "moduleResolution": "bundler",            // 现代打包工具解析
    "resolveJsonModule": true,                // 允许导入 JSON
    
    /* 输出 */
    "outDir": "./dist",                       // 输出目录
    "sourceMap": true,                        // 生成 source map
    "declaration": true,                      // 生成类型声明
    "removeComments": false,                  // 保留注释
    
    /* 互操作性 */
    "esModuleInterop": true,                  // ES 模块互操作
    "forceConsistentCasingInFileNames": true, // 强制文件名大小写
    "isolatedModules": true,                  // 独立模块
    
    /* 语言和环境 */
    "target": "ES2020",                       // 编译目标
    "lib": ["ES2020", "DOM", "DOM.Iterable"], // 库文件
    
    /* 其他 */
    "skipLibCheck": true                      // 跳过库检查
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3.2 React 项目配置

```json
{
  "compilerOptions": {
    /* 类型检查 */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    
    /* 模块 */
    "module": "ESNext",
    "moduleResolution": "bundler",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    },
    "resolveJsonModule": true,
    
    /* 输出 */
    "outDir": "./dist",
    "sourceMap": true,
    
    /* JSX */
    "jsx": "react-jsx",                       // React 17+ 新 JSX 转换
    
    /* 互操作性 */
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    
    /* 语言和环境 */
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    
    /* 其他 */
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

### 3.3 Node.js 项目配置

```json
{
  "compilerOptions": {
    /* 类型检查 */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    
    /* 模块 */
    "module": "CommonJS",                     // Node.js 使用 CommonJS
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    },
    "resolveJsonModule": true,
    
    /* 输出 */
    "outDir": "./dist",
    "sourceMap": true,
    "declaration": true,
    
    /* 互操作性 */
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    
    /* 语言和环境 */
    "target": "ES2020",
    "lib": ["ES2020"],                        // Node.js 不需要 DOM
    
    /* 其他 */
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

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

### 3.5 Vue 项目配置

```json
{
  "compilerOptions": {
    /* 类型检查 */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    
    /* 模块 */
    "module": "ESNext",
    "moduleResolution": "bundler",            // Vite 推荐使用 bundler
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
    "outDir": "./dist",
    "sourceMap": true,
    
    /* JSX（可选，如果使用 Vue JSX）*/
    "jsx": "preserve",                        // Vue 通常使用 template，保留 JSX 由 Vite 处理
    "jsxImportSource": "vue",                 // 如果使用 JSX，指定为 vue
    
    /* 互操作性 */
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,                  // Vite 需要
    "verbatimModuleSyntax": false,            // 允许类型导入优化
    
    /* 语言和环境 */
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "useDefineForClassFields": true,          // Vue 3.3+ 推荐
    
    /* 其他 */
    "skipLibCheck": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",                           // 包含 .vue 文件
    "src/**/*.d.ts"
  ],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

## 四、常见问题和最佳实践

### 4.1 路径别名不生效

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

### 4.2 严格模式太严格，如何渐进式启用

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

### 4.3 如何在一个文件中禁用某些检查

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

### 4.4 monorepo 多项目配置

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

## 五、总结

### 必须配置的选项

1. **strict**: `true` - 启用严格检查
2. **esModuleInterop**: `true` - 模块互操作
3. **skipLibCheck**: `true` - 提高编译速度
4. **forceConsistentCasingInFileNames**: `true` - 跨平台一致性

### 根据项目类型配置

- **React 项目**：`jsx: "react-jsx"`
- **Node.js 项目**：`module: "CommonJS"`
- **库开发**：`declaration: true`
- **使用 Vite/esbuild**：`isolatedModules: true`

### 性能优化

- 开启 `skipLibCheck`
- 合理使用 `exclude` 排除不需要的文件
- 使用 `incremental` 增量编译
- 使用项目引用（`references`）拆分大项目

### 学习建议

1. 从 `tsc --init` 生成的默认配置开始
2. 根据实际需求逐步调整
3. 遇到问题查阅官方文档
4. 使用 IDE 的自动补全和悬停提示了解各选项

## 参考资源

- [TypeScript 官方配置文档](https://www.typescriptlang.org/tsconfig/)
- [TSConfig 中文文档](https://www.tslang.cn/docs/handbook/tsconfig-json.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---
title: Vitest 单元测试配置指南
date: 2025-09-28
duration: 30min
art: random
---

[[toc]]

本文档介绍如何在 monorepo 项目中为工具函数库配置 Vitest 单元测试。

## 概述

Vitest 是一个由 Vite 提供支持的极速单元测试框架，专为现代前端项目设计。它提供了与 Jest 兼容的 API，同时具有更快的启动速度和更好的 ES 模块支持。

## 项目结构

```
packages/my-app-vite/
├── src/
│   ├── utils1.ts           # 工具函数
│   └── utils1.test.ts      # 测试文件
├── vitest.config.ts        # Vitest 配置文件
└── package.json           # 包含测试脚本
```

## 配置步骤

### 1. 安装依赖

在项目根目录的 `package.json` 中，Vitest 和覆盖率工具已作为开发依赖安装：

```json
{
  "devDependencies": {
    "vitest": "^3.2.4",
    "@vitest/coverage-v8": "^3.2.4"
  }
}
```

**注意：** 在 monorepo 架构中，我们将测试相关依赖安装在根目录，这样所有子包都可以共享这些依赖，避免重复安装。

### 2. 创建 Vitest 配置文件

在 `packages/my-app-vite/vitest.config.ts` 中创建配置：

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 测试环境
    environment: 'node',
    // 测试文件匹配模式
    include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
    // 排除的文件
    exclude: ['node_modules', 'dist'],
    // 全局设置
    globals: true,
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.d.ts', '**/*.config.{js,ts}', 'coverage/**'],
    },
  },
})
```

### 3. 配置 package.json 脚本

在 `packages/my-app-vite/package.json` 中添加测试脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:run:verbose": "vitest run --reporter=verbose"
  }
}
```

## 测试文件编写

### 基本结构

测试文件 `src/utils1.test.ts` 的基本结构：

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce, throttle, deepClone, generateId } from './utils1'

describe('utils1', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  // 测试用例...
})
```

### Vitest 常用 API 详解

#### 1. 测试结构 API

##### `describe(name, fn)`

用于创建测试套件，将相关的测试用例分组：

```typescript
describe('工具函数测试', () => {
  // 测试用例...
})

// 嵌套 describe
describe('utils1', () => {
  describe('debounce', () => {
    // debounce 相关测试
  })

  describe('throttle', () => {
    // throttle 相关测试
  })
})
```

##### `it(name, fn)` 或 `test(name, fn)`

定义单个测试用例：

```typescript
it('应该返回正确的结果', () => {
  // 测试逻辑
})

// 或者使用 test
test('应该返回正确的结果', () => {
  // 测试逻辑
})

// 异步测试
it('应该处理异步操作', async () => {
  const result = await asyncFunction()
  expect(result).toBe('expected')
})
```

#### 2. 断言 API - `expect`

##### 基本断言

```typescript
// 相等性断言
expect(actual).toBe(expected) // 严格相等 (===)
expect(actual).toEqual(expected) // 深度相等
expect(actual).not.toBe(expected) // 不相等

// 真值断言
expect(value).toBeTruthy() // 真值
expect(value).toBeFalsy() // 假值
expect(value).toBeNull() // null
expect(value).toBeUndefined() // undefined
expect(value).toBeDefined() // 已定义

// 数值断言
expect(number).toBeGreaterThan(3) // 大于
expect(number).toBeGreaterThanOrEqual(3) // 大于等于
expect(number).toBeLessThan(5) // 小于
expect(number).toBeCloseTo(0.3) // 浮点数近似相等
```

##### 字符串断言

```typescript
expect(string).toMatch(/pattern/) // 正则匹配
expect(string).toContain('substring') // 包含子字符串
expect(string).toHaveLength(5) // 长度
```

##### 数组和对象断言

```typescript
expect(array).toContain(item) // 数组包含元素
expect(array).toHaveLength(3) // 数组长度
expect(object).toHaveProperty('key') // 对象有属性
expect(object).toHaveProperty('key', 'value') // 对象属性值
expect(array).toEqual(expect.arrayContaining([1, 2])) // 数组包含
```

##### 函数断言

```typescript
expect(mockFn).toHaveBeenCalled() // 函数被调用
expect(mockFn).toHaveBeenCalledTimes(2) // 调用次数
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2') // 调用参数
expect(mockFn).toHaveBeenLastCalledWith('arg') // 最后一次调用参数
expect(() => fn()).toThrow() // 抛出异常
expect(() => fn()).toThrow('error message') // 抛出特定异常
```

##### 异步断言

```typescript
// Promise 断言
await expect(promise).resolves.toBe('value')
await expect(promise).rejects.toThrow('error')

// 或者使用 async/await
it('异步测试', async () => {
  const result = await asyncFunction()
  expect(result).toBe('expected')
})
```

#### 3. Mock 和 Spy API - `vi`

##### 创建 Mock 函数

```typescript
// 创建 mock 函数
const mockFn = vi.fn()

// 带返回值的 mock
const mockFn = vi.fn(() => 'return value')

// 带实现的 mock
const mockFn = vi.fn((a, b) => a + b)

// 检查 mock 调用
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
expect(mockFn).toHaveBeenCalledTimes(1)
```

##### Spy 监听

```typescript
// 监听对象方法
const spy = vi.spyOn(console, 'log')
console.log('test')
expect(spy).toHaveBeenCalledWith('test')

// 监听并模拟返回值
const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
```

##### 模拟模块

```typescript
// 模拟整个模块
vi.mock('./utils', () => ({
  default: vi.fn(),
  namedExport: vi.fn(),
}))

// 部分模拟
vi.mock('./utils', async () => {
  const actual = await vi.importActual('./utils')
  return {
    ...actual,
    specificFunction: vi.fn(),
  }
})
```

##### 时间控制

```typescript
// 使用假时间
vi.useFakeTimers()

// 推进时间
vi.advanceTimersByTime(1000) // 推进 1 秒
vi.advanceTimersToNextTimer() // 推进到下一个定时器

// 恢复真实时间
vi.useRealTimers()

// 设置系统时间
vi.setSystemTime(new Date('2023-01-01'))
```

#### 4. 生命周期钩子

##### `beforeEach(fn)` 和 `afterEach(fn)`

在每个测试用例前后执行：

```typescript
describe('测试套件', () => {
  beforeEach(() => {
    // 每个测试前执行
    vi.useFakeTimers()
  })

  afterEach(() => {
    // 每个测试后执行
    vi.restoreAllMocks()
    vi.useRealTimers()
  })
})
```

##### `beforeAll(fn)` 和 `afterAll(fn)`

在整个测试套件前后执行：

```typescript
describe('测试套件', () => {
  beforeAll(() => {
    // 所有测试前执行一次
    // 例如：设置数据库连接
  })

  afterAll(() => {
    // 所有测试后执行一次
    // 例如：清理资源
  })
})
```

#### 5. 实用工具

##### 跳过和仅运行

```typescript
// 跳过测试
it.skip('跳过这个测试', () => {
  // 不会执行
})

// 仅运行这个测试
it.only('只运行这个测试', () => {
  // 只有这个会执行
})

// 跳过整个套件
describe.skip('跳过的套件', () => {
  // 整个套件都不会执行
})
```

##### 条件测试

```typescript
// 根据条件运行测试
it.runIf(process.platform === 'win32')('Windows 专用测试', () => {
  // 只在 Windows 上运行
})

// 根据条件跳过测试
it.skipIf(process.env.CI)('本地环境测试', () => {
  // 在 CI 环境中跳过
})
```

#### 6. 实际使用示例

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('debounce 函数测试', () => {
  let mockFn: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // 每个测试前创建新的 mock 函数和假时间
    mockFn = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    // 每个测试后清理
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('应该延迟执行函数', () => {
    const debouncedFn = debounce(mockFn, 100)

    // 调用防抖函数
    debouncedFn('test')

    // 立即检查 - 不应该被调用
    expect(mockFn).not.toHaveBeenCalled()

    // 推进时间
    vi.advanceTimersByTime(100)

    // 现在应该被调用了
    expect(mockFn).toHaveBeenCalledWith('test')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})
```

### 测试用例示例

#### 1. 防抖函数测试

```typescript
describe('debounce', () => {
  it('应该延迟执行函数', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn('test')
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledWith('test')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('应该在多次调用时只执行最后一次', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn('first')
    debouncedFn('second')
    debouncedFn('third')

    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledWith('third')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})
```

#### 2. 节流函数测试

```typescript
describe('throttle', () => {
  it('应该限制函数执行频率', () => {
    const mockFn = vi.fn()
    const throttledFn = throttle(mockFn, 100)

    throttledFn('test1')
    expect(mockFn).toHaveBeenCalledWith('test1')
    expect(mockFn).toHaveBeenCalledTimes(1)

    // 在限制时间内调用不应该执行
    throttledFn('test2')
    expect(mockFn).toHaveBeenCalledTimes(1)

    // 等待限制时间过去
    vi.advanceTimersByTime(100)
    throttledFn('test3')
    expect(mockFn).toHaveBeenCalledWith('test3')
    expect(mockFn).toHaveBeenCalledTimes(2)
  })
})
```

#### 3. 深拷贝函数测试

```typescript
describe('deepClone', () => {
  it('应该克隆基本类型', () => {
    expect(deepClone(null)).toBe(null)
    expect(deepClone(undefined)).toBe(undefined)
    expect(deepClone(42)).toBe(42)
    expect(deepClone('string')).toBe('string')
    expect(deepClone(true)).toBe(true)
  })

  it('应该克隆对象', () => {
    const obj = {
      a: 1,
      b: 'string',
      c: {
        d: 2,
        e: [1, 2, 3],
      },
    }
    const clonedObj = deepClone(obj)

    expect(clonedObj).toEqual(obj)
    expect(clonedObj).not.toBe(obj)
    expect(clonedObj.c).not.toBe(obj.c)
    expect(clonedObj.c.e).not.toBe(obj.c.e)
  })
})
```

#### 4. 类型工具函数测试（utils2.ts）

类型工具函数主要用于运行时类型检查，这些函数不需要使用假时间，测试相对简单但覆盖面要广：

```typescript
describe('utils2 - 类型工具函数', () => {
  describe('isString', () => {
    it('应该正确识别字符串', () => {
      expect(isString('hello')).toBe(true)
      expect(isString('')).toBe(true)
      expect(isString('123')).toBe(true)
      expect(isString(`模板字符串`)).toBe(true)
    })

    it('应该正确识别非字符串', () => {
      expect(isString(123)).toBe(false)
      expect(isString(true)).toBe(false)
      expect(isString(null)).toBe(false)
      expect(isString(undefined)).toBe(false)
      expect(isString({})).toBe(false)
      expect(isString([])).toBe(false)
      expect(isString(() => {})).toBe(false)
    })
  })

  describe('isNumber', () => {
    it('应该正确识别数字', () => {
      expect(isNumber(123)).toBe(true)
      expect(isNumber(0)).toBe(true)
      expect(isNumber(-123)).toBe(true)
      expect(isNumber(3.14)).toBe(true)
      expect(isNumber(Infinity)).toBe(true)
      expect(isNumber(-Infinity)).toBe(true)
    })

    it('应该正确识别 NaN 为数字类型', () => {
      // 注意：typeof NaN === 'number'
      expect(isNumber(NaN)).toBe(true)
    })

    it('应该正确识别非数字', () => {
      expect(isNumber('123')).toBe(false)
      expect(isNumber(true)).toBe(false)
      expect(isNumber(null)).toBe(false)
      expect(isNumber(undefined)).toBe(false)
    })
  })

  describe('isObject', () => {
    it('应该正确识别对象', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
      expect(isObject(new Date())).toBe(true)
      expect(isObject([])).toBe(true) // 数组也是对象
    })

    it('应该正确识别 null 为非对象', () => {
      // 虽然 typeof null === 'object'，但函数正确排除了 null
      expect(isObject(null)).toBe(false)
    })
  })

  describe('isArray', () => {
    it('应该正确识别数组', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)
      expect(isArray(['a', 'b', 'c'])).toBe(true)
    })

    it('应该正确识别类数组对象为非数组', () => {
      const arrayLike = { 0: 'a', 1: 'b', length: 2 }
      expect(isArray(arrayLike)).toBe(false)
    })
  })

  // 类型保护功能测试
  describe('类型保护功能', () => {
    it('isString 应该提供正确的类型保护', () => {
      const value: unknown = 'hello'
      if (isString(value)) {
        // 在这个分支中，TypeScript 应该知道 value 是 string 类型
        expect(value.toUpperCase()).toBe('HELLO')
        expect(value.length).toBe(5)
      }
    })

    it('isArray 应该提供正确的类型保护', () => {
      const value: unknown = [1, 2, 3]
      if (isArray(value)) {
        // 在这个分支中，TypeScript 应该知道 value 是数组类型
        expect(value.length).toBe(3)
        expect(value.push(4)).toBe(4)
      }
    })
  })

  // 边界情况测试
  describe('边界情况', () => {
    it('应该正确处理特殊数值', () => {
      expect(isNumber(Number.MAX_VALUE)).toBe(true)
      expect(isNumber(Number.MIN_VALUE)).toBe(true)
      expect(isNumber(Number.POSITIVE_INFINITY)).toBe(true)
      expect(isNumber(Number.NEGATIVE_INFINITY)).toBe(true)
    })

    it('应该正确处理包装对象', () => {
      // 注意：这些是对象，不是原始类型
      expect(isObject(new String('test'))).toBe(true)
      expect(isObject(new Number(123))).toBe(true)
      expect(isObject(new Boolean(true))).toBe(true)

      expect(isString(new String('test'))).toBe(false)
      expect(isNumber(new Number(123))).toBe(false)
      expect(isBoolean(new Boolean(true))).toBe(false)
    })
  })
})
```

**类型工具函数测试特点：**

1. **全面性测试**：每个函数都测试正确识别目标类型和排除其他类型
2. **边界情况**：测试特殊值如 NaN、Infinity、null、undefined 等
3. **类型保护验证**：确保函数能正确作为 TypeScript 类型保护使用
4. **包装对象处理**：测试 `new String()` 等包装对象的特殊情况
5. **实际应用场景**：验证函数在真实代码中的表现

## 运行测试

### 本地运行

在 `packages/my-app-vite` 目录下：

#### 1. 开发时使用 - 实时反馈

```bash
npm run test
```

- **监听模式（Watch Mode）**
- 启动后会持续运行，监听文件变化
- 当你修改源代码或测试文件时，会自动重新运行相关测试
- 适合**开发阶段**使用，提供实时反馈
- 按 `q` 可以退出，按 `r` 可以重新运行所有测试
- 提供交互式界面，可以过滤测试、查看覆盖率等

#### 2. 快速验证或CI中使用 - 一次性检查

```bash
npm run test:run
```

- **一次性运行模式**
- 运行所有测试后立即退出
- 不会监听文件变化
- 适合**CI/CD 环境**或需要快速验证的场景
- 运行完成后返回退出码（0表示成功，非0表示失败）
- 输出简洁的测试结果

#### 3. 代码质量检查 - 查看测试覆盖率

```bash
npm run test:coverage
```

- **一次性运行 + 代码覆盖率报告**
- 在运行测试的同时生成代码覆盖率报告
- 会创建 `coverage` 目录，包含详细的覆盖率数据
- 生成多种格式的报告（text、json、html）
- 适合**代码质量检查**和**发布前验证**
- 可以看到哪些代码行被测试覆盖，哪些没有

#### 4. 详细测试输出 - 调试和分析

```bash
npm run test:run:verbose
```

- **一次性运行 + 详细输出模式**
- 显示每个测试套件和测试用例的详细信息
- 输出格式类似于树状结构，便于查看测试层次
- 适合**调试测试**和**分析测试结构**时使用
- 比简洁模式提供更多信息，便于定位问题

**输出对比：**

简洁模式（`npm run test:run`）：

```
✓ src/utils2.test.ts (33 tests) 7ms
✓ src/utils1.test.ts (18 tests) 13ms

Test Files  2 passed (2)
     Tests  51 passed (51)
```

详细模式（`npm run test:run:verbose`）：

```
✓ src/utils1.test.ts (18)
  ✓ utils1 (18)
    ✓ debounce (4)
      ✓ 应该延迟执行函数
      ✓ 应该在多次调用时只执行最后一次
      ✓ 应该在 immediate 为 true 时立即执行
      ✓ 应该正确处理多个参数
    ✓ throttle (3)
      ✓ 应该限制函数执行频率
      ✓ 应该保持 this 上下文
      ✓ 应该正确处理多个参数
```

#### 覆盖率报告表头说明

运行 `npm run test:coverage` 后会显示覆盖率表格，表头各列含义如下：

```
File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------|---------|----------|---------|---------|-------------------
utils1.ts   |   95.24 |    83.33 |     100 |   94.74 | 23-25
utils2.ts   |     100 |      100 |     100 |     100 |
------------|---------|----------|---------|---------|-------------------
All files   |   97.62 |    91.67 |     100 |   97.37 |
```

**各列详解：**

- **`File`**：被测试的源文件名
- **`% Stmts`**（Statement Coverage - 语句覆盖率）
  - 被执行的语句占总语句数的百分比
  - 计算方式：(执行的语句数 / 总语句数) × 100%
  - 最基本的覆盖率指标，确保代码被执行

- **`% Branch`**（Branch Coverage - 分支覆盖率）
  - 被测试的分支条件占总分支数的百分比
  - 包括：if/else、switch/case、三元操作符、逻辑运算符等
  - 示例：`if (x > 0) { ... } else { ... }` 需要测试两种情况才能达到100%

- **`% Funcs`**（Function Coverage - 函数覆盖率）
  - 被调用的函数占总函数数的百分比
  - 确保每个函数都至少被执行一次

- **`% Lines`**（Line Coverage - 行覆盖率）
  - 被执行的代码行占总代码行数的百分比
  - 空行、注释行、声明行通常不计入统计

- **`Uncovered Line #s`**（未覆盖的行号）
  - 列出所有未被测试覆盖的具体行号
  - 格式：单行 `45`，连续行 `23-25`，多个区间 `23-25,45,67-70`
  - 帮助快速定位需要补充测试的代码位置

**覆盖率目标建议：**

| 指标       | 一般标准 | 高质量标准 |
| ---------- | -------- | ---------- |
| 语句覆盖率 | ≥ 80%    | ≥ 90%      |
| 分支覆盖率 | ≥ 75%    | ≥ 85%      |
| 函数覆盖率 | ≥ 90%    | ≥ 95%      |
| 行覆盖率   | ≥ 80%    | ≥ 90%      |

**提高覆盖率的方法：**

1. **查看未覆盖行号**：根据 `Uncovered Line #s` 定位问题代码
2. **补充分支测试**：确保所有 if/else、switch 分支都被测试
3. **测试边界情况**：测试函数的各种输入情况和异常情况
4. **检查异常处理**：确保 try/catch 块被覆盖

### 在 monorepo 根目录运行

```bash
# 使用 pnpm workspace 过滤器
pnpm --filter @vue/my-app-vite run test:run
```

## 测试结果示例

运行 `npm run test:run` 后的完整测试结果：

```
✓ src/utils1.test.ts (18)
  ✓ utils1 (18)
    ✓ debounce (4)
      ✓ 应该延迟执行函数
      ✓ 应该在多次调用时只执行最后一次
      ✓ 应该在 immediate 为 true 时立即执行
      ✓ 应该正确处理多个参数
    ✓ throttle (3)
      ✓ 应该限制函数执行频率
      ✓ 应该保持 this 上下文
      ✓ 应该正确处理多个参数
    ✓ deepClone (6)
      ✓ 应该克隆基本类型
      ✓ 应该克隆日期对象
      ✓ 应该克隆数组
      ✓ 应该克隆对象
      ✓ 应该处理嵌套对象
      ✓ 应该处理包含数组的对象
    ✓ generateId (5)
      ✓ 应该生成带有默认前缀的ID
      ✓ 应该生成带有自定义前缀的ID
      ✓ 应该生成唯一的ID
      ✓ 应该生成指定长度的随机部分
      ✓ 应该只包含字母和数字

✓ src/utils2.test.ts (64)
  ✓ utils2 - 类型工具函数 (64)
    ✓ isString (8)
      ✓ 应该正确识别字符串
      ✓ 应该正确识别非字符串
    ✓ isNumber (8)
      ✓ 应该正确识别数字
      ✓ 应该正确识别 NaN 为数字类型
      ✓ 应该正确识别非数字
    ✓ isBoolean (6)
      ✓ 应该正确识别布尔值
      ✓ 应该正确识别非布尔值
    ✓ isFunction (10)
      ✓ 应该正确识别函数
      ✓ 应该正确识别箭头函数
      ✓ 应该正确识别类构造函数
      ✓ 应该正确识别非函数
    ✓ isObject (8)
      ✓ 应该正确识别对象
      ✓ 应该正确识别 null 为非对象
      ✓ 应该正确识别非对象
    ✓ isArray (8)
      ✓ 应该正确识别数组
      ✓ 应该正确识别类数组对象为非数组
      ✓ 应该正确识别非数组
    ✓ isUndefined (6)
      ✓ 应该正确识别 undefined
      ✓ 应该正确识别未声明的变量属性为 undefined
      ✓ 应该正确识别非 undefined
    ✓ isNull (4)
      ✓ 应该正确识别 null
      ✓ 应该正确识别非 null
    ✓ isNullOrUndefined (6)
      ✓ 应该正确识别 null 或 undefined
      ✓ 应该正确识别非 null 且非 undefined

Test Files  2 passed (2)
     Tests  82 passed (82)
  Start at  10:38:15
  Duration  425ms (transform 89ms, setup 0ms, collect 67ms, tests 15ms, environment 0ms, prepare 124ms)
```

## 最佳实践

### 1. 测试文件命名

- 测试文件应与源文件同名，添加 `.test.ts` 或 `.spec.ts` 后缀
- 例如：`utils1.ts` → `utils1.test.ts`

### 2. 测试结构

- 使用 `describe` 分组相关测试
- 使用 `it` 或 `test` 编写具体测试用例
- 测试描述应清晰说明测试目的

### 3. Mock 和 Spy

```typescript
// 使用 vi.fn() 创建 mock 函数
const mockFn = vi.fn()

// 使用 vi.spyOn() 监听对象方法
const spy = vi.spyOn(console, 'log')

// 使用 vi.mock() 模拟整个模块
vi.mock('./module', () => ({
  default: vi.fn(),
}))
```

### 4. 时间相关测试

```typescript
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// 在测试中控制时间
vi.advanceTimersByTime(1000)
```

### 5. 异步测试

```typescript
it('应该处理异步操作', async () => {
  const result = await asyncFunction()
  expect(result).toBe('expected')
})

it('应该处理 Promise 拒绝', async () => {
  await expect(asyncFunction()).rejects.toThrow('error message')
})
```

## 配置选项详解

### 测试环境

```typescript
export default defineConfig({
  test: {
    environment: 'node', // 'node' | 'jsdom' | 'happy-dom'
  },
})
```

### 全局 API

```typescript
export default defineConfig({
  test: {
    globals: true, // 启用全局 API，无需导入 describe, it, expect
  },
})
```

### 覆盖率配置

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8', // 'v8' | 'istanbul'
      reporter: ['text', 'json', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
```

## 故障排除

### 常见问题

1. **模块解析问题**

   ```typescript
   // 在 vitest.config.ts 中配置路径别名
   export default defineConfig({
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   })
   ```

2. **TypeScript 类型问题**

   ```typescript
   // 在 tsconfig.json 中添加 vitest 类型
   {
     "compilerOptions": {
       "types": ["vitest/globals"]
     }
   }
   ```

3. **ES 模块问题**
   ```typescript
   // 确保 package.json 中设置了 type: "module"
   {
     "type": "module"
   }
   ```

## 总结

通过以上配置，我们成功为 monorepo 项目中的工具函数库配置了 Vitest 单元测试。这个配置提供了：

- 快速的测试执行速度
- 完整的代码覆盖率报告
- 与现代前端工具链的良好集成
- 易于维护的测试结构

这样的测试配置确保了代码质量，提高了开发效率，并为持续集成提供了可靠的基础。

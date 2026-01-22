---
title: 为什么 Rollup 会将 Sourcemap 重置为 Undefined
date: 2026-01-22
duration: 20min
type: notes
art: random
---

[[toc]]


**因为合并多个模块后，所有原始 sourcemap 的映射关系都失效了（行号变了），必须丢弃旧的 sourcemap 并重新生成，所以 Rollup 将所有 chunk 的 `map` 统一重置为 `undefined`。**

---

## Sourcemap 的本质：映射关系

### 单个模块的 Sourcemap

```javascript
// 源文件: src/utils/math.js
export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;

// 编译后: dist/math.js
export const add=(a,b)=>a+b;export const multiply=(a,b)=>a*b;

// Sourcemap: math.js.map
{
  version: 3,
  file: 'math.js',                    // 输出文件
  sources: ['src/utils/math.js'],     // 源文件
  mappings: 'AAAA,OAAO,MAAM,GAAG...',
  // ↑ 映射关系：
  // 输出文件第1行第0列 → 源文件第1行第0列
  // 输出文件第1行第20列 → 源文件第2行第0列
}
```

**关键点**：Sourcemap 记录的是**具体的行号和列号**的映射关系。

---

## 问题：合并后行号完全改变

### 合并前：3个独立模块

```javascript
// ============================================
// 模块 1: vue.esm.js
// ============================================
// 代码（简化）
export function createApp(rootComponent) {
  return { mount() { ... } };
}

// Sourcemap
{
  file: 'vue.esm.js',
  sources: ['node_modules/vue/src/runtime-dom/index.ts'],
  mappings: 'AAAA,OAAO...',
  // 第1行 → src/runtime-dom/index.ts 第1行
  // 第2行 → src/runtime-dom/index.ts 第2行
}

// ============================================
// 模块 2: vue-router.esm.js
// ============================================
// 代码（简化）
export function createRouter(options) {
  return { push() { ... } };
}

// Sourcemap
{
  file: 'vue-router.esm.js',
  sources: ['node_modules/vue-router/src/router.ts'],
  mappings: 'AAAA,OAAO...',
  // 第1行 → src/router.ts 第1行
  // 第2行 → src/router.ts 第2行
}

// ============================================
// 模块 3: vuex.esm.js
// ============================================
// 代码（简化）
export function createStore(options) {
  return { commit() { ... } };
}

// Sourcemap
{
  file: 'vuex.esm.js',
  sources: ['node_modules/vuex/src/store.ts'],
  mappings: 'AAAA,OAAO...',
  // 第1行 → src/store.ts 第1行
  // 第2行 → src/store.ts 第2行
}
```

### 合并后：1个大文件

```javascript
// ============================================
// Chunk: vendor-vue.js (合并后)
// ============================================

// 第1-100行：来自 vue.esm.js
export function createApp(rootComponent) {
  return { mount() { ... } };
}
// ... 更多 Vue 代码 ...

// 第101-200行：来自 vue-router.esm.js
export function createRouter(options) {
  return { push() { ... } };
}
// ... 更多 Vue Router 代码 ...

// 第201-300行：来自 vuex.esm.js
export function createStore(options) {
  return { commit() { ... } };
}
// ... 更多 Vuex 代码 ...

// 问题：旧的 Sourcemap 已经完全失效！
// ============================================

// vue.esm.js 的旧 sourcemap 说：
// "第1行 → src/runtime-dom/index.ts 第1行"
// 
// 但在合并后的文件中：
// - vue.esm.js 的代码现在从第1行开始 ✅ (碰巧还对)
// - vue-router.esm.js 的代码现在从第101行开始 ❌ (旧 sourcemap 说第1行)
// - vuex.esm.js 的代码现在从第201行开始 ❌ (旧 sourcemap 说第1行)
//
// 旧的映射关系完全错误！
```

---

## Rollup 的处理逻辑

### 伪代码演示

```javascript
function createChunk(modules, chunkName) {
  let mergedCode = '';
  let currentLine = 1;
  const modulePositions = [];
  
  // 合并所有模块的代码
  for (const module of modules) {
    const startLine = currentLine;
    
    // 追加模块代码
    mergedCode += module.code + '\n';
    
    // 记录这个模块在合并后的位置
    const lineCount = module.code.split('\n').length;
    currentLine += lineCount;
    
    modulePositions.push({
      moduleName: module.name,
      originalMap: module.map,  // 旧的 sourcemap
      startLine: startLine,     // 在合并文件中的起始行
      endLine: currentLine - 1  // 在合并文件中的结束行
    });
  }
  
  // 问题分析：
  // ============================================
  // module1 (vue.esm.js)
  //   - 原始 sourcemap: "第1行 → src/runtime-dom/index.ts 第1行"
  //   - 在合并文件中: 第1-100行
  //   - 需要调整: "第1行 → src/runtime-dom/index.ts 第1行" ✅ (还对)
  //
  // module2 (vue-router.esm.js)
  //   - 原始 sourcemap: "第1行 → src/router.ts 第1行"
  //   - 在合并文件中: 第101-200行
  //   - 需要调整: "第101行 → src/router.ts 第1行" ❌ (需要重新计算)
  //
  // module3 (vuex.esm.js)
  //   - 原始 sourcemap: "第1行 → src/store.ts 第1行"
  //   - 在合并文件中: 第201-300行
  //   - 需要调整: "第201行 → src/store.ts 第1行" ❌ (需要重新计算)
  // ============================================
  
  // Rollup 的决定：
  // 1. 旧的 sourcemap 都失效了，无法直接使用
  // 2. 重新计算映射关系非常复杂且耗时
  // 3. 现在不知道用户是否需要 sourcemap（要看配置）
  // 4. 先丢弃所有旧的 sourcemap，设置为 undefined
  // 5. 如果后续需要，在 Output 阶段重新生成
  
  return {
    name: chunkName,
    code: mergedCode,
    map: undefined,  // ← 统一重置为 undefined
    // 不保存 modulePositions，因为：
    // - 占用内存
    // - 后续可能用不到
    // - 如果需要，Output 阶段会重新分析代码
  };
}
```

---

## 为什么是 undefined 而不是 null？

### JavaScript 语义区别

```javascript
// ============================================
// undefined: "这个属性还没有值"
// ============================================
const chunk = {
  name: 'vendor-vue',
  code: '...',
  map: undefined  // "我还没有 sourcemap，但可能会生成一个"
};

// Rollup 的理解：
// "这个 chunk 目前没有 sourcemap"
// "但如果配置要求生成，我会在 Output 阶段生成"

// ============================================
// null: "这个属性明确设置为空值"
// ============================================
const module = {
  name: 'vue.esm.js',
  code: '...',
  map: null  // "我明确不要 sourcemap"
};

// Rollup 的理解：
// "这个模块明确表示不需要 sourcemap"
// "即使配置要求生成，也不生成"
```

### Rollup 的判断逻辑

```javascript
// Output 阶段的逻辑
function generateOutput(chunk, config) {
  // 情况 1: chunk.map 已经有值
  if (chunk.map && typeof chunk.map === 'object') {
    // 使用已有的 sourcemap
    return chunk.map;
  }
  
  // 情况 2: chunk.map 是 undefined（从 Chunk 阶段来的）
  if (chunk.map === undefined) {
    // "这个 chunk 还没有 sourcemap"
    // "检查配置，看是否需要生成"
    if (config.sourcemap === 'hidden' || config.sourcemap === true) {
      // 生成新的 sourcemap
      return generateNewSourcemap(chunk.code);
    }
    return null;  // 配置不要求生成
  }
  
  // 情况 3: chunk.map 是 null（明确不要）
  if (chunk.map === null) {
    // "明确不要 sourcemap，不生成"
    return null;
  }
}
```

---

## 为什么不保留原始信息？

### 技术上可以保留

```javascript
// Rollup 技术上可以这样做（但实际没有）
const chunk = {
  name: 'vendor-vue',
  code: mergedCode,
  map: undefined,
  _metadata: {
    modules: [
      {
        name: 'vue.esm.js',
        startLine: 1,
        endLine: 100,
        originalMap: { /* vue 的 sourcemap */ }
      },
      {
        name: 'vue-router.esm.js',
        startLine: 101,
        endLine: 200,
        originalMap: { /* vue-router 的 sourcemap */ }
      },
      {
        name: 'vuex.esm.js',
        startLine: 201,
        endLine: 300,
        originalMap: null  // ← 保留 "不要 sourcemap" 的信息
      }
    ]
  }
};

// 然后在 Output 阶段可以检查：
if (chunk._metadata.modules.every(m => m.originalMap === null)) {
  // "所有模块都不要 sourcemap，那这个 chunk 也不生成"
  chunk.map = null;
}
```

### 为什么不这样做？

#### 1. 内存开销巨大

```javascript
// 大型项目的情况
const chunk = {
  name: 'vendor-vue',
  code: '... 10000 行代码 ...',
  _metadata: {
    modules: [
      // 可能有 50+ 个模块
      { name: 'vue/runtime-dom.js', originalMap: { /* 几百 KB */ } },
      { name: 'vue/runtime-core.js', originalMap: { /* 几百 KB */ } },
      { name: 'vue/reactivity.js', originalMap: { /* 几百 KB */ } },
      // ... 更多模块
    ]
  }
};

// 问题：
// - 每个模块的 originalMap 可能有几百 KB
// - 50 个模块 = 几十 MB 的元数据
// - 在大型项目中可能有 10+ 个 chunk
// - 总内存开销：几百 MB
// - 而这些信息可能根本用不到（如果配置 sourcemap: false）
```

#### 2. 旧的 Sourcemap 无法直接使用

```javascript
// 即使保留了原始 sourcemap，也无法直接使用
// 因为需要重新计算所有映射关系

function mergeSourcemaps(modules) {
  const newMappings = [];
  
  for (const module of modules) {
    if (!module.originalMap) continue;
    
    // 需要调整每个映射的行号
    for (const mapping of module.originalMap.mappings) {
      // 原始映射: 第1行 → 源文件第X行
      // 新映射: 第(startLine + 1)行 → 源文件第X行
      
      newMappings.push({
        generatedLine: module.startLine + mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        sourceLine: mapping.sourceLine,
        sourceColumn: mapping.sourceColumn
      });
    }
  }
  
  // 这个过程非常复杂且耗时
  // 而且如果配置 sourcemap: false，这些计算都是浪费
}
```

#### 3. 设计哲学：按需生成

```javascript
// Rollup 的设计哲学：
// "不要在 Chunk 阶段做 Output 阶段的工作"

// Chunk 阶段的职责：
// - 合并模块代码
// - 优化代码结构
// - 不关心 sourcemap

// Output 阶段的职责：
// - 检查配置
// - 如果需要 sourcemap，重新分析代码生成
// - 如果不需要，节省计算资源

// 这样的分离带来的好处：
// - 每个阶段职责清晰
// - 不浪费资源做可能用不到的工作
// - 内存占用更少
```

---

## 真实的技术原因

### 1. Sourcemap 映射关系必须重新计算

```javascript
// 原始模块的 sourcemap
{
  mappings: 'AAAA,OAAO,MAAM'
  // 解码后：
  // [0, 0, 0, 0]  // 第1行第0列 → 源文件第1行第0列
  // [0, 5, 0, 5]  // 第1行第5列 → 源文件第1行第5列
}

// 合并后，这个模块从第101行开始
// 需要调整为：
{
  mappings: '...,AAAA,OAAO,MAAM'
  // 解码后：
  // [100, 0, 0, 0]  // 第101行第0列 → 源文件第1行第0列
  // [100, 5, 0, 5]  // 第101行第5列 → 源文件第1行第5列
}

// 问题：
// - 需要解码原始 mappings（VLQ 解码）
// - 调整所有行号
// - 重新编码（VLQ 编码）
// - 非常耗时，而且可能用不到
```

### 2. 性能优化

```javascript
// 场景：用户配置 sourcemap: false

// 如果保留原始信息：
Chunk 阶段: 保存所有模块的 sourcemap → 占用几百 MB 内存
Output 阶段: 检查配置 sourcemap: false → 丢弃所有 sourcemap
结果: 浪费了内存和时间

// 如果重置为 undefined：
Chunk 阶段: 丢弃所有 sourcemap → 释放内存
Output 阶段: 检查配置 sourcemap: false → 不生成 sourcemap
结果: 节省内存和时间
```

### 3. 代码复杂度

```javascript
// 如果要保留原始信息，需要处理各种情况：

// 情况 1: 所有模块都有 sourcemap
if (modules.every(m => m.map)) {
  // 合并所有 sourcemap
}

// 情况 2: 部分模块有 sourcemap
if (modules.some(m => m.map)) {
  // 只合并有 sourcemap 的模块？
  // 还是为所有模块生成 sourcemap？
}

// 情况 3: 所有模块都没有 sourcemap (map: null)
if (modules.every(m => m.map === null)) {
  // 这个 chunk 也不要 sourcemap？
  // 还是根据配置决定？
}

// 情况 4: 混合情况
// - 模块 A: map: { ... }
// - 模块 B: map: null
// - 模块 C: map: undefined
// 如何处理？

// Rollup 的选择：统一重置为 undefined，简化逻辑
```

---

## 类比说明

### 拼图的位置说明书

想象你在拼一个大拼图：

**原始状态**：每块拼图都有自己的说明书
```
拼图 A 的说明书: "我在位置 (0, 0)"
拼图 B 的说明书: "我在位置 (0, 0)"
拼图 C 的说明书: "我在位置 (0, 0)"
```

**拼在一起后**：位置完全改变
```
拼图 A 现在在: (0, 0)    ← 说明书还对
拼图 B 现在在: (10, 0)   ← 说明书错了（说的是 0, 0）
拼图 C 现在在: (20, 0)   ← 说明书错了（说的是 0, 0）
```

**Rollup 的做法**：
1. 丢弃所有旧说明书（都失效了）
2. 位置信息重置为"未知"
3. 如果需要新说明书，重新测量所有拼图的实际位置
4. 生成一份新的完整说明书

**为什么不保留旧说明书？**
- 旧说明书已经错了，无法直接使用
- 保留它们占用空间
- 如果不需要新说明书，保留旧的就是浪费

---

## 总结

### Rollup 重置为 undefined 的原因

| 原因 | 说明 |
|------|------|
| **映射关系失效** | 合并后行号改变，旧 sourcemap 的映射关系完全错误 |
| **必须重新生成** | 无法简单调整旧 sourcemap，必须重新分析代码生成新的 |
| **性能优化** | 丢弃旧信息释放内存，避免浪费资源 |
| **按需生成** | 在 Output 阶段根据配置决定是否生成，不提前做无用功 |
| **设计简化** | 统一处理所有 chunk，不需要复杂的条件判断 |
| **语义明确** | `undefined` 表示"还没有"，`null` 表示"不要" |

### 关键结论

1. **Transform 阶段的 `map: null` 无法传递到 Output 阶段**
   - Chunk 合并会丢弃所有原始 sourcemap 信息
   - 所有 chunk 的 `map` 统一重置为 `undefined`

2. **Output 阶段只看配置，不看历史**
   - 检查 `chunk.map === undefined` 和 `config.sourcemap`
   - 根据配置决定是否生成新的 sourcemap
   - 无法知道原始模块有没有 sourcemap

3. **唯一的解决方案：GenerateBundle 钩子**
   - 在 sourcemap 生成之后执行
   - 直接删除不需要的 `.map` 文件
   - 这是唯一能真正控制最终输出的时机

这就是为什么 Transform 钩子无法阻止 sourcemap 生成的根本原因！

---
title: Transform 钩子失效总结
date: 2026-01-22
duration: 20min
type: notes
art: random
---

[[toc]]

**Chunk 合并会将所有模块的 sourcemap 状态重置为 `undefined`，导致 Output 阶段无法区分哪些 chunk 应该有 sourcemap，最终根据 `sourcemap: 'hidden'` 配置为所有 chunk 生成 sourcemap。**

---

## 关键发现对比表

| Chunk 类型 | 配置方式 | Transform 阶段 | Chunk 阶段 | Output 阶段 | 最终结果 |
|-----------|---------|---------------|-----------|------------|---------|
| **vendor-vue** | manualChunks | map: null | map: undefined | 生成 sourcemap | ❌ 有 .map |
| **vendor-element** | manualChunks | map: null | map: undefined | 生成 sourcemap | ❌ 有 .map |
| **vendor-vxe** | manualChunks | map: null | map: undefined | 生成 sourcemap | ❌ 有 .map |
| **monaco-editor** | 自动分割 | map: null | map: undefined | 生成 sourcemap | ❌ 有 .map |
| **index** | 业务代码 | map: {...} | map: undefined | 生成 sourcemap | ✅ 有 .map |

**结论**：所有 chunk 的处理逻辑完全一样，都生成了 sourcemap！

---

## 三个阶段的状态变化

### Transform 阶段（模块级别）

```javascript
// ✅ 成功过滤
moduleMap = {
  // manualChunks: vendor-vue
  'node_modules/vue/dist/vue.esm.js': { map: null },
  'node_modules/vue-router/dist/vue-router.esm.js': { map: null },
  'node_modules/vuex/dist/vuex.esm.js': { map: null },
  
  // manualChunks: vendor-element
  'node_modules/element-plus/es/index.mjs': { map: null },
  'node_modules/@element-plus/icons-vue/dist/index.mjs': { map: null },
  
  // 自动分割: monaco-editor
  'node_modules/monaco-editor/esm/vs/editor/editor.main.js': { map: null },
  'node_modules/monaco-editor/esm/vs/editor/editor.api.js': { map: null },
  
  // 业务代码
  'src/main.js': { map: { /* sourcemap 数据 */ } },
  'src/views/home.vue': { map: { /* sourcemap 数据 */ } },
}

// 统计
✅ 保留 sourcemap: 50 个文件 (业务代码)
🚫 跳过 sourcemap: 200 个文件 (第三方库)
```

### Chunk 阶段（合并重置）

```javascript
// ⚠️ 信息丢失
chunks = [
  // manualChunks 配置的
  { name: 'vendor-vue', map: undefined },       // ← 重置
  { name: 'vendor-element', map: undefined },   // ← 重置
  { name: 'vendor-vxe', map: undefined },       // ← 重置
  
  // 自动分割的
  { name: 'monaco-editor', map: undefined },    // ← 重置
  
  // 业务代码
  { name: 'index', map: undefined },            // ← 也重置了
]

// 关键问题
所有 chunk 的 map 都是 undefined
无法区分哪些应该有 sourcemap，哪些不应该有
```

### Output 阶段（统一生成）

```javascript
// ❌ 全部生成
if (config.sourcemap === 'hidden') {
  for (const chunk of chunks) {
    if (chunk.map === undefined) {
      generateSourcemap(chunk);  // ← 所有 chunk 都满足条件
    }
  }
}

// 输出结果
dist/assets/vendor-vue-C9gVCVuR.js.map          ← 生成了
dist/assets/vendor-element-4vsbiGeC.js.map      ← 生成了
dist/assets/vendor-vxe-BTD-ZBhw.js.map          ← 生成了
dist/assets/monaco-editor-DkVVM8E4.js.map       ← 生成了
dist/assets/index-Bk8aZ-po.js.map               ← 生成了
```

---

## 为什么 manualChunks 和自动分割都失效？

### 原因 1: Chunk 合并的统一处理

```javascript
// Rollup 的 chunk 合并逻辑（伪代码）

function createChunk(modules, chunkName) {
  // 合并所有模块的代码
  const mergedCode = modules.map(m => m.code).join('\n');
  
  // ⚠️ 关键：丢弃所有模块的 sourcemap
  // 不管这些模块的 map 是 null、{ ... } 还是 undefined
  // 合并后统一重置为 undefined
  
  return {
    name: chunkName,
    code: mergedCode,
    map: undefined  // ← 统一重置
  };
}

// 对 manualChunks 的处理
const vendorVueChunk = createChunk(
  [vue, vueRouter, vuex],  // 这些模块的 map 都是 null
  'vendor-vue'
);
// 结果: { name: 'vendor-vue', map: undefined }

// 对自动分割的处理
const monacoChunk = createChunk(
  [monacoEditor1, monacoEditor2, ...],  // 这些模块的 map 也是 null
  'monaco-editor'
);
// 结果: { name: 'monaco-editor', map: undefined }

// 两者的结果完全一样！
```

### 原因 2: Output 阶段的统一逻辑

```javascript
// Rollup 在 Output 阶段不区分 chunk 的来源

function generateOutput(chunks, config) {
  for (const chunk of chunks) {
    // 不关心这个 chunk 是：
    // - manualChunks 配置的
    // - 自动分割的
    // - 业务代码
    
    // 只关心：
    // - chunk.map 是否为 undefined
    // - config.sourcemap 的值
    
    if (chunk.map === undefined && config.sourcemap === 'hidden') {
      chunk.map = generateNewSourcemap(chunk.code);
    }
    
    writeFile(`${chunk.name}.js`, chunk.code);
    if (chunk.map) {
      writeFile(`${chunk.name}.js.map`, chunk.map);
    }
  }
}
```

### 原因 3: 没有元数据传递机制

```javascript
// Transform 阶段的信息
module.map = null;  // "我不要 sourcemap"

// Chunk 阶段
chunk.map = undefined;  // "我没有 sourcemap"

// 问题：Rollup 无法区分：
// - undefined: 从未生成过 sourcemap
// - null: 明确不要 sourcemap

// 如果有元数据机制（假设）
chunk = {
  name: 'vendor-vue',
  code: '...',
  map: undefined,
  metadata: {
    originalMapStatus: 'null',  // ← 记录原始状态
    source: 'manualChunks',     // ← 记录来源
    shouldGenerateSourcemap: false  // ← 记录意图
  }
}

// 但实际上 Rollup 没有这个机制
// 所有信息在 chunk 合并时都丢失了
```

---

## 数据流对比

### ❌ Transform 钩子（失败）

```
Transform 阶段
├─ vendor-vue 的模块
│  ├─ vue.esm.js          → map: null ✅
│  ├─ vue-router.esm.js   → map: null ✅
│  └─ vuex.esm.js         → map: null ✅
├─ vendor-element 的模块
│  └─ element-plus.mjs    → map: null ✅
└─ monaco-editor 的模块
   └─ editor.main.js      → map: null ✅

        ↓ Chunk 合并（信息丢失）

Chunk 阶段
├─ vendor-vue          → map: undefined ⚠️
├─ vendor-element      → map: undefined ⚠️
└─ monaco-editor       → map: undefined ⚠️

        ↓ Output 生成（配置生效）

Output 阶段
检查: sourcemap: 'hidden' ✅
所有 chunk.map === undefined
        ↓
为所有 chunk 生成 sourcemap
├─ vendor-vue.js.map          ❌
├─ vendor-element.js.map      ❌
└─ monaco-editor.js.map       ❌
```

### ✅ GenerateBundle 钩子（成功）

```
Transform 阶段
└─ 正常处理（不过滤）

        ↓

Chunk 阶段
└─ 正常合并

        ↓

Output 阶段
└─ 生成所有 sourcemap
   ├─ vendor-vue.js.map
   ├─ vendor-element.js.map
   └─ monaco-editor.js.map

        ↓ GenerateBundle 钩子（关键）

删除不需要的 sourcemap
├─ delete vendor-vue.js.map       ✅
├─ delete vendor-element.js.map   ✅
├─ delete monaco-editor.js.map    ✅
└─ 保留 index.js.map              ✅

        ↓

最终输出
└─ 只有 index.js.map
```

---

## 最终结论

### Transform 钩子为什么对所有类型的 chunk 都失效？

1. **统一的合并逻辑**
   - Rollup 对所有 chunk（manualChunks、自动分割、业务代码）使用相同的合并逻辑
   - 合并时统一丢弃所有 sourcemap 信息
   - 状态统一重置为 `undefined`

2. **统一的输出逻辑**
   - Output 阶段只看 `chunk.map` 和 `config.sourcemap`
   - 不区分 chunk 的来源和类型
   - 对所有 `map: undefined` 的 chunk 统一生成 sourcemap

3. **没有信息传递机制**
   - Transform 阶段的 `map: null` 无法传递到 Output 阶段
   - Chunk 合并会清除所有历史信息
   - Output 阶段无法知道哪些 chunk 应该有 sourcemap

### 唯一的解决方案

**使用 `generateBundle` 钩子在 Output 阶段直接删除不需要的 sourcemap 文件！**

```javascript
generateBundle(outputOptions, bundle) {
  // 在这个时机：
  // ✅ sourcemap 已经生成
  // ✅ 可以看到所有 chunk 的名称
  // ✅ 可以直接删除文件
  
  for (const fileName in bundle) {
    if (shouldExclude(fileName)) {
      delete bundle[`${fileName}.map`];  // 真正删除
    }
  }
}
```

这是唯一能真正控制最终 sourcemap 输出的方法！🎯

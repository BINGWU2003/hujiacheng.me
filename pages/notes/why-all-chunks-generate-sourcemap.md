---
title: Transform 钩子失效的原因
date: 2026-01-22
duration: 20min
type: notes
art: random
---

[[toc]]

Transform 钩子失效的根本原因：所有 Chunk 都生成了 Sourcemap

## 关键发现

使用 `sourcemap-filter.js` (transform 钩子) 后，**所有的 chunk 都生成了 sourcemap**：

```bash
# manualChunks 配置的 vendor chunk
dist/assets/vendor-vue-C9gVCVuR.js.map          ← 生成了 ❌
dist/assets/vendor-element-4vsbiGeC.js.map      ← 生成了 ❌
dist/assets/vendor-vxe-BTD-ZBhw.js.map          ← 生成了 ❌
dist/assets/vendor-echarts-CwNDiq1b.js.map      ← 生成了 ❌
dist/assets/vendor-utils-ChwYSnVq.js.map        ← 生成了 ❌
dist/assets/vendor-highlight-VBxm829V.js.map    ← 生成了 ❌

# 自动分割的第三方库 chunk
dist/assets/monaco-editor-DkVVM8E4.js.map       ← 生成了 ❌

# 业务代码 chunk
dist/assets/index-Bk8aZ-po.js.map               ← 生成了 ✅
```

**问题**：为什么 transform 钩子对 `node_modules` 返回了 `map: null`，但所有包（不管是手动配置的还是自动分割的）都生成了 sourcemap？

---

## 根本原因：Chunk 生成会重置所有 Sourcemap 信息

### 完整的构建流程

```javascript
// ============================================
// 阶段 1: Transform（模块级别）
// ============================================

// 处理 Vue 相关的模块
transform(code, id: 'node_modules/vue/dist/vue.esm.js')
→ 返回 { code, map: null }  ✅

transform(code, id: 'node_modules/vue-router/dist/vue-router.esm.js')
→ 返回 { code, map: null }  ✅

transform(code, id: 'node_modules/vuex/dist/vuex.esm.js')
→ 返回 { code, map: null }  ✅

// 处理 Element Plus 相关的模块
transform(code, id: 'node_modules/element-plus/es/index.mjs')
→ 返回 { code, map: null }  ✅

transform(code, id: 'node_modules/element-plus/es/components/button/index.mjs')
→ 返回 { code, map: null }  ✅

// 处理 Monaco Editor 相关的模块
transform(code, id: 'node_modules/monaco-editor/esm/vs/editor/editor.main.js')
→ 返回 { code, map: null }  ✅

transform(code, id: 'node_modules/monaco-editor/esm/vs/editor/editor.api.js')
→ 返回 { code, map: null }  ✅

// 处理业务代码
transform(code, id: 'src/main.js')
→ 返回 null (保留 sourcemap)  ✅

transform(code, id: 'src/views/home.vue')
→ 返回 null (保留 sourcemap)  ✅

// Transform 阶段结束后的模块映射表
moduleMap = {
  'node_modules/vue/dist/vue.esm.js': { code: '...', map: null },
  'node_modules/vue-router/dist/vue-router.esm.js': { code: '...', map: null },
  'node_modules/vuex/dist/vuex.esm.js': { code: '...', map: null },
  'node_modules/element-plus/es/index.mjs': { code: '...', map: null },
  'node_modules/monaco-editor/esm/vs/editor/editor.main.js': { code: '...', map: null },
  'src/main.js': { code: '...', map: { /* sourcemap 数据 */ } },
  'src/views/home.vue': { code: '...', map: { /* sourcemap 数据 */ } },
  // ... 更多模块
}

// ============================================
// 阶段 2: Chunk 生成（关键阶段）
// ============================================

// Rollup 根据配置进行代码分割
rollupOptions: {
  output: {
    manualChunks: {
      'vendor-vue': ['vue', 'vue-router', 'vuex', 'vue-demi'],
      'vendor-element': ['element-plus', '@element-plus/icons-vue'],
      'vendor-vxe': ['vxe-table', 'vxe-pc-ui', 'xe-utils'],
      // ...
    }
  }
}

// ============================================
// Chunk 1: vendor-vue (manualChunks 配置)
// ============================================
const vendorVueModules = [
  'node_modules/vue/dist/vue.esm.js',           // map: null
  'node_modules/vue-router/dist/vue-router.esm.js', // map: null
  'node_modules/vuex/dist/vuex.esm.js',         // map: null
  'node_modules/vue-demi/lib/index.mjs',        // map: null
  // ... 20+ 个文件
];

// Rollup 合并这些模块
const vendorVueChunk = {
  name: 'vendor-vue',
  code: mergeModules(vendorVueModules),  // 合并所有代码
  map: undefined  // ← 关键：丢弃所有中间 sourcemap，重置为 undefined
};

// ⚠️ 重要：map: null 的信息在这里丢失了！
// Rollup 的逻辑：
// "我要创建一个新的 chunk，合并多个模块的代码，
//  之前每个模块的 sourcemap 都是针对单个文件的，
//  现在我合并成一个大文件，旧的 sourcemap 都无效了，
//  所以全部丢弃，状态重置为 undefined"

// ============================================
// Chunk 2: vendor-element (manualChunks 配置)
// ============================================
const vendorElementModules = [
  'node_modules/element-plus/es/index.mjs',     // map: null
  'node_modules/element-plus/es/components/button/index.mjs', // map: null
  'node_modules/@element-plus/icons-vue/dist/index.mjs', // map: null
  // ... 50+ 个文件
];

const vendorElementChunk = {
  name: 'vendor-element',
  code: mergeModules(vendorElementModules),
  map: undefined  // ← 同样丢弃了所有中间 sourcemap
};

// ============================================
// Chunk 3: monaco-editor (自动分割)
// ============================================
// 注意：monaco-editor 不在 manualChunks 中，但 Rollup 会自动分割大型第三方库

const monacoEditorModules = [
  'node_modules/monaco-editor/esm/vs/editor/editor.main.js', // map: null
  'node_modules/monaco-editor/esm/vs/editor/editor.api.js',  // map: null
  'node_modules/monaco-editor/esm/vs/base/common/platform.js', // map: null
  // ... 100+ 个文件
];

const monacoEditorChunk = {
  name: 'monaco-editor',
  code: mergeModules(monacoEditorModules),
  map: undefined  // ← 同样丢弃了所有中间 sourcemap
};

// ============================================
// Chunk 4: index (业务代码)
// ============================================
const indexModules = [
  'src/main.js',           // map: { /* 有 sourcemap */ }
  'src/views/home.vue',    // map: { /* 有 sourcemap */ }
  'src/components/Button.vue', // map: { /* 有 sourcemap */ }
  // ... 100+ 个业务文件
];

const indexChunk = {
  name: 'index',
  code: mergeModules(indexModules),
  map: undefined  // ← 即使原始模块有 sourcemap，合并后也重置为 undefined
};

// Chunk 生成后的列表
chunks = [
  { name: 'vendor-vue', code: '...', map: undefined },      // manualChunks
  { name: 'vendor-element', code: '...', map: undefined },  // manualChunks
  { name: 'vendor-vxe', code: '...', map: undefined },      // manualChunks
  { name: 'vendor-echarts', code: '...', map: undefined },  // manualChunks
  { name: 'vendor-utils', code: '...', map: undefined },    // manualChunks
  { name: 'vendor-highlight', code: '...', map: undefined },// manualChunks
  { name: 'monaco-editor', code: '...', map: undefined },   // 自动分割
  { name: 'index', code: '...', map: undefined },           // 业务代码
];

// ⚠️ 关键发现：所有 chunk 的 map 都是 undefined
// 不管是：
// - manualChunks 配置的 (vendor-vue, vendor-element, ...)
// - 自动分割的 (monaco-editor)
// - 业务代码 (index)
// 它们的 map 状态都一样：undefined

// ============================================
// 阶段 3: Output 生成（问题爆发）
// ============================================

// Rollup 检查配置
const sourcemapConfig = viteConfig.build.sourcemap; // 'hidden'

// Rollup 的逻辑
if (sourcemapConfig === 'hidden' || sourcemapConfig === true) {
  // "用户配置了 sourcemap: 'hidden'，说明要生成 sourcemap！"
  
  for (const chunk of chunks) {
    // 检查 chunk 的 map 状态
    if (chunk.map === undefined) {
      // "这个 chunk 没有 sourcemap，我需要生成一个新的！"
      
      // 重新生成 sourcemap
      const newSourcemap = generateSourcemap({
        code: chunk.code,
        name: chunk.name,
        // 分析代码结构
        // 生成映射关系
      });
      
      // 输出文件
      writeFile(`dist/assets/${chunk.name}.js`, chunk.code);
      writeFile(`dist/assets/${chunk.name}.js.map`, newSourcemap);
    }
  }
}

// 最终输出（所有 chunk 都生成了 sourcemap）
writeFile('dist/assets/vendor-vue-C9gVCVuR.js.map', ...);       // ← 生成了
writeFile('dist/assets/vendor-element-4vsbiGeC.js.map', ...);   // ← 生成了
writeFile('dist/assets/vendor-vxe-BTD-ZBhw.js.map', ...);       // ← 生成了
writeFile('dist/assets/vendor-echarts-CwNDiq1b.js.map', ...);   // ← 生成了
writeFile('dist/assets/vendor-utils-ChwYSnVq.js.map', ...);     // ← 生成了
writeFile('dist/assets/vendor-highlight-VBxm829V.js.map', ...); // ← 生成了
writeFile('dist/assets/monaco-editor-DkVVM8E4.js.map', ...);    // ← 生成了
writeFile('dist/assets/index-Bk8aZ-po.js.map', ...);            // ← 生成了
```

---

## 核心问题总结

### 问题 1: Chunk 合并会重置所有 Sourcemap 状态

```javascript
// Transform 阶段
module1: { code: '...', map: null }      // 明确不要 sourcemap
module2: { code: '...', map: { ... } }   // 有 sourcemap
module3: { code: '...', map: null }      // 明确不要 sourcemap

// Chunk 合并后
chunk: {
  code: module1.code + module2.code + module3.code,
  map: undefined  // ← 所有信息都丢失，统一重置为 undefined
}

// 关键：Rollup 无法区分：
// - map: undefined (从未生成过 sourcemap)
// - map: null (明确不要 sourcemap)
// - map: { ... } (有 sourcemap)
// 合并后都变成 map: undefined
```

### 问题 2: Output 阶段只看配置，不看历史

```javascript
// Rollup 的决策逻辑
if (config.sourcemap === 'hidden') {
  for (const chunk of chunks) {
    if (chunk.map === undefined) {
      // "没有 sourcemap？那我生成一个！"
      chunk.map = generateNewSourcemap(chunk.code);
    }
  }
}

// 问题：Rollup 无法知道：
// - 这个 chunk 的原始模块在 transform 阶段返回了 map: null
// - 这个 chunk 是 vendor 还是业务代码
// - 这个 chunk 是 manualChunks 配置的还是自动分割的

// Rollup 只知道：
// - chunk.map === undefined
// - config.sourcemap === 'hidden'
// - 结论：生成 sourcemap
```

### 问题 3: manualChunks 和自动分割没有区别

```javascript
// 对于 Rollup 来说，这两种 chunk 没有任何区别：

// manualChunks 配置的 chunk
{
  name: 'vendor-vue',
  code: '...',
  map: undefined  // ← 状态
}

// 自动分割的 chunk
{
  name: 'monaco-editor',
  code: '...',
  map: undefined  // ← 状态完全一样
}

// Output 阶段的处理逻辑也完全一样：
// 都会检查 map === undefined
// 都会根据 config.sourcemap 生成新的 sourcemap
```

---

## 为什么所有包都生成了 Sourcemap

### 统一的原因

**不管是 `manualChunks` 配置的 vendor chunk，还是自动分割的 monaco-editor chunk，它们在 Output 阶段的状态都是一样的：`map: undefined`**

```javascript
// 所有 chunk 的状态
chunks = [
  { name: 'vendor-vue', map: undefined },      // manualChunks
  { name: 'vendor-element', map: undefined },  // manualChunks
  { name: 'monaco-editor', map: undefined },   // 自动分割
  { name: 'index', map: undefined },           // 业务代码
];

// Rollup 的处理逻辑（对所有 chunk 一视同仁）
for (const chunk of chunks) {
  if (config.sourcemap === 'hidden' && chunk.map === undefined) {
    generateSourcemap(chunk);  // ← 所有 chunk 都会生成
  }
}
```

### 具体原因

1. **Transform 阶段的信息无法传递**
   - Transform 返回的 `map: null` 只影响单个模块
   - Chunk 合并时，所有模块的 sourcemap 信息都被丢弃
   - 无法区分哪些模块原本有 sourcemap，哪些没有

2. **Chunk 合并会重置状态**
   - 不管原始模块的 map 是 `null`、`{ ... }` 还是 `undefined`
   - 合并后都统一变成 `map: undefined`
   - 历史信息完全丢失

3. **配置优先级最高**
   - `build.sourcemap: 'hidden'` 配置在 Output 阶段生效
   - Rollup 看到配置后，为所有 `map: undefined` 的 chunk 生成 sourcemap
   - 不管这些 chunk 是什么类型，来自哪里

---

## 可视化流程

```
Transform 阶段
├─ vue.esm.js          → map: null
├─ vue-router.esm.js   → map: null
├─ element-plus.mjs    → map: null
├─ monaco-editor.js    → map: null
└─ src/main.js         → map: { ... }
         ↓
Chunk 生成阶段（信息丢失）
├─ vendor-vue          → map: undefined  (合并了 vue, vue-router, ...)
├─ vendor-element      → map: undefined  (合并了 element-plus, ...)
├─ monaco-editor       → map: undefined  (合并了 monaco-editor, ...)
└─ index               → map: undefined  (合并了 src/main.js, ...)
         ↓
Output 生成阶段（配置生效）
检查: sourcemap: 'hidden' ✅
         ↓
为所有 map: undefined 的 chunk 生成 sourcemap
├─ vendor-vue.js.map          ← 生成 ❌
├─ vendor-element.js.map      ← 生成 ❌
├─ monaco-editor.js.map       ← 生成 ❌
└─ index.js.map               ← 生成 ✅
```

---

## 正确的解决方案

### 使用 GenerateBundle 钩子

```javascript
// vite/plugins/sourcemap-output-filter.js
export default function createSourcemapOutputFilter() {
  return {
    name: 'sourcemap-output-filter',
    apply: 'build',
    enforce: 'post',
    
    generateBundle(outputOptions, bundle) {
      const excludePatterns = [
        /^vendor-/,        // 所有 manualChunks 的 vendor
        /^monaco-editor/,  // 自动分割的 monaco-editor
      ];
      
      for (const fileName in bundle) {
        const file = bundle[fileName];
        
        if (file.type === 'chunk') {
          const shouldExclude = excludePatterns.some(pattern => 
            pattern.test(file.name)
          );
          
          if (shouldExclude) {
            // 删除 sourcemap 文件
            const mapFileName = `${fileName}.map`;
            if (bundle[mapFileName]) {
              delete bundle[mapFileName];
            }
            
            // 移除 sourceMappingURL 注释
            if (file.code) {
              file.code = file.code.replace(
                /\/\/# sourceMappingURL=.*\.map/g,
                ''
              );
            }
          }
        }
      }
    }
  };
}
```

### 最终效果

```bash
# 所有 vendor chunk 和第三方库的 sourcemap 都被删除
dist/assets/vendor-vue-C9gVCVuR.js           ← 没有 .map ✅
dist/assets/vendor-element-4vsbiGeC.js       ← 没有 .map ✅
dist/assets/vendor-vxe-BTD-ZBhw.js           ← 没有 .map ✅
dist/assets/monaco-editor-DkVVM8E4.js        ← 没有 .map ✅

# 只有业务代码保留 sourcemap
dist/assets/index-Bk8aZ-po.js.map            ← 保留 ✅
```

---

## 总结

### Transform 钩子失效的根本原因

1. **所有 chunk 的状态都一样**
   - 不管是 manualChunks 配置的还是自动分割的
   - 不管原始模块有没有 sourcemap
   - 合并后都变成 `map: undefined`

2. **Output 阶段无法区分**
   - Rollup 只看到 `map: undefined` 和 `sourcemap: 'hidden'`
   - 无法知道哪些 chunk 应该有 sourcemap，哪些不应该有
   - 统一为所有 chunk 生成 sourcemap

3. **唯一的解决方案**
   - 在 `generateBundle` 钩子中删除不需要的 sourcemap
   - 这是唯一能真正控制最终输出的时机

**结论**：Transform 钩子无法阻止任何 chunk（不管是 vendor 还是第三方库）生成 sourcemap，必须使用 GenerateBundle 钩子！

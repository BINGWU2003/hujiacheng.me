---
title: Console 性能分析方法
date: 2026-02-06
duration: 20min
type: notes
art: random
---

[[toc]]

本文档总结了在浏览器 Console 中直接执行的性能分析脚本，用于诊断前端性能问题。

## 目录

- [1. 请求统计分析](#1-请求统计分析)
- [2. HAR 文件分析](#2-har-文件分析)
- [3. 性能指标测量](#3-性能指标测量)
- [4. 实战案例](#4-实战案例)

---

## 1. 请求统计分析

### 1.1 按文件类型统计请求

```javascript
// 获取所有请求并按类型分类
const entries = performance.getEntriesByType('resource');

const stats = entries.reduce((acc, e) => {
  const url = new URL(e.name);
  let type = 'other';
  
  if (url.pathname.endsWith('.vue')) type = 'vue';
  else if (url.pathname.endsWith('.js')) type = 'js';
  else if (url.pathname.endsWith('.ts')) type = 'ts';
  else if (url.pathname.endsWith('.css')) type = 'css';
  else if (url.pathname.includes('node_modules') || url.pathname.includes('.vite')) type = 'node_modules';
  
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {});

console.table(stats);
console.log('总请求数:', entries.length);
```

### 1.2 按目录分类统计

```javascript
// 按目录路径统计请求
const entries = performance.getEntriesByType('resource');

const pathStats = entries.reduce((acc, e) => {
  const url = new URL(e.name);
  const path = url.pathname;
  
  let category;
  if (path.includes('node_modules') || path.includes('.vite/deps')) {
    category = '📦 node_modules';
  } else if (path.includes('/src/views/')) {
    category = '📄 src/views (页面)';
  } else if (path.includes('/src/components/')) {
    category = '🧩 src/components (组件)';
  } else if (path.includes('/src/')) {
    category = '📁 src/other';
  } else {
    category = '❓ other';
  }
  
  acc[category] = (acc[category] || 0) + 1;
  return acc;
}, {});

console.table(pathStats);
```

### 1.3 查看具体的 node_modules 请求

```javascript
// 查看哪些 node_modules 请求没有被预构建
performance.getEntriesByType('resource')
  .filter(e => e.name.includes('node_modules') || e.name.includes('.vite'))
  .map(e => new URL(e.name).pathname)
  .forEach(p => console.log(p));
```

---

## 2. HAR 文件分析

### 2.1 导出 HAR 文件

1. 打开 DevTools → **Network** 面板
2. 刷新页面，等待所有请求加载完成
3. 右键 → **Save all as HAR with content**
4. 保存文件

### 2.2 分析 HAR 数据

将 HAR 文件内容粘贴到变量 `harData` 中，然后执行：

```javascript
// 假设 harData 是你的 HAR JSON 数据
// const harData = { ... };

const entries = harData.log.entries;

// 1. 总请求统计
console.log('📊 总请求数:', entries.length);

// 2. 按文件类型统计
const typeStats = {};
entries.forEach(e => {
  const url = e.request.url;
  let type = 'other';
  if (url.includes('.js') || url.includes('type=module')) type = 'js';
  else if (url.includes('.vue')) type = 'vue';
  else if (url.includes('.css')) type = 'css';
  else if (url.includes('.ts')) type = 'ts';
  typeStats[type] = (typeStats[type] || 0) + 1;
});
console.log('\n📁 按文件类型:');
console.table(typeStats);

// 3. 按路径分类统计
const pathStats = {};
entries.forEach(e => {
  const url = e.request.url;
  let category;
  if (url.includes('.vite/deps')) category = '📦 .vite/deps (预构建)';
  else if (url.includes('node_modules')) category = '📦 node_modules (未预构建)';
  else if (url.includes('/src/views/')) category = '📄 src/views';
  else if (url.includes('/src/components/')) category = '🧩 src/components';
  else if (url.includes('/src/')) category = '📁 src/other';
  else category = '❓ other';
  pathStats[category] = (pathStats[category] || 0) + 1;
});
console.log('\n📂 按目录分类:');
console.table(pathStats);

// 4. 找出请求最多的包（关键！）
const packageStats = {};
entries.forEach(e => {
  const url = e.request.url;
  const match = url.match(/node_modules\/(@[^\/]+\/[^\/]+|[^\/]+)/);
  if (match) {
    const pkg = match[1];
    packageStats[pkg] = (packageStats[pkg] || 0) + 1;
  }
});
const sortedPackages = Object.entries(packageStats)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);
console.log('\n🔥 请求最多的包 TOP 20:');
console.table(sortedPackages.map(([pkg, count]) => ({ 包名: pkg, 请求数: count })));
```

---

## 3. 性能指标测量

### 3.1 一键获取所有性能指标

```javascript
(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  const resources = performance.getEntriesByType('resource');
  
  const fp = paint.find(p => p.name === 'first-paint');
  const fcp = paint.find(p => p.name === 'first-contentful-paint');
  
  console.log('=== 📊 性能指标 ===');
  console.log(`⚪ 白屏时间 (First Paint): ${fp?.startTime.toFixed(2)}ms`);
  console.log(`📝 首次内容渲染 (FCP): ${fcp?.startTime.toFixed(2)}ms`);
  console.log(`📄 DOM 加载完成: ${nav.domContentLoadedEventEnd.toFixed(2)}ms`);
  console.log(`✅ 页面完全加载: ${nav.loadEventEnd.toFixed(2)}ms`);
  console.log(`📦 资源请求数: ${resources.length}`);
  console.log(`📊 JS 请求数: ${resources.filter(r => r.initiatorType === 'script').length}`);
})();
```

### 3.2 详细的导航性能指标

```javascript
const navigation = performance.getEntriesByType('navigation')[0];
const paintMetrics = performance.getEntriesByType('paint');

console.table({
  'DNS 查询': navigation.domainLookupEnd - navigation.domainLookupStart,
  'TCP 连接': navigation.connectEnd - navigation.connectStart,
  'DOM 解析完成': navigation.domContentLoadedEventEnd - navigation.fetchStart,
  '页面完全加载': navigation.loadEventEnd - navigation.fetchStart,
});

paintMetrics.forEach(paint => {
  console.log(`${paint.name}: ${paint.startTime.toFixed(2)}ms`);
});
```

### 3.3 资源加载时间分析

```javascript
// 找出加载最慢的资源
const resources = performance.getEntriesByType('resource');

const slowResources = resources
  .map(r => ({
    name: r.name.split('/').pop().substring(0, 50),
    duration: r.duration.toFixed(2) + 'ms',
    size: (r.transferSize / 1024).toFixed(2) + 'KB'
  }))
  .sort((a, b) => parseFloat(b.duration) - parseFloat(a.duration))
  .slice(0, 10);

console.log('🐢 加载最慢的资源 TOP 10:');
console.table(slowResources);
```

---

## 4. 实战案例

### 4.1 诊断 Vite 开发模式请求过多问题

**问题**：首次加载有 1000+ 个 JS 请求

**诊断步骤**：

1. 使用 HAR 分析脚本，发现 `src/views` 有 585 个请求
2. 定位到 `import.meta.glob('../**/**/*.vue')` 范围过大
3. 发现 `result().then()` 立即执行导致所有组件被预加载

**解决方案**：

```javascript
// 优化前：立即执行
if (result) result().then(mod => (mod.default.name = path));
return result;

// 优化后：延迟执行
return () => result().then(mod => {
  mod.default.name = path;
  return mod;
});
```

**优化效果**：
- 请求数：1101 → 282（减少 74%）

### 4.2 检查 optimizeDeps 是否生效

```javascript
// 统计预构建 vs 未预构建的请求
const entries = performance.getEntriesByType('resource');

const viteDepStats = {
  '已预构建 (.vite/deps)': 0,
  '未预构建 (node_modules)': 0
};

entries.forEach(e => {
  if (e.name.includes('.vite/deps')) {
    viteDepStats['已预构建 (.vite/deps)']++;
  } else if (e.name.includes('node_modules')) {
    viteDepStats['未预构建 (node_modules)']++;
  }
});

console.table(viteDepStats);
```

---

## 附录：Network 面板筛选技巧

| 筛选条件 | 输入内容 |
|----------|----------|
| 只看 JS | `.js` 或点击 **JS** 按钮 |
| 只看 Vue | `.vue` |
| 只看某路径 | `/src/views/` |
| 排除某路径 | `-node_modules` |
| 精确 MIME | `mime-type:application/javascript` |
| 只看本地 | `domain:localhost` |

---

## 参考资料

- [MDN - Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Vite - Dep Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html)
- [Chrome DevTools - Network Reference](https://developer.chrome.com/docs/devtools/network/reference/)

---
title: Sourcemap 配置
date: 2026-01-22
duration: 20min
type: notes
art: random
---

[[toc]]

Sourcemap 配置

## 1. `sourcemap: true` - 生成 sourcemap 并保留注释

### 生成的 JS 文件 (vendor-vue.js)
```javascript
// ... 打包后的代码 ...
(function() {
  var createApp = function() {
    // Vue 核心代码
  };
  
  // ... 更多代码 ...
})();

//# sourceMappingURL=vendor-vue.js.map
```

### 生成的文件
```
dist/
  ├── vendor-vue.js          (包含 sourceMappingURL 注释)
  └── vendor-vue.js.map      (sourcemap 文件)
```

### 浏览器行为
1. 浏览器加载 `vendor-vue.js`
2. 解析到最后一行的 `//# sourceMappingURL=vendor-vue.js.map`
3. **自动下载** `vendor-vue.js.map` 文件
4. 开发者工具中显示原始源码
5. **任何人都可以看到源码**（包括用户）

---

## 2. `sourcemap: 'hidden'` - 生成 sourcemap 但不保留注释

### 生成的 JS 文件 (vendor-vue.js)
```javascript
// ... 打包后的代码 ...
(function() {
  var createApp = function() {
    // Vue 核心代码
  };
  
  // ... 更多代码 ...
})();

// ← 注意：没有 sourceMappingURL 注释！
```

### 生成的文件
```
dist/
  ├── vendor-vue.js          (不包含 sourceMappingURL 注释)
  └── vendor-vue.js.map      (sourcemap 文件仍然生成)
```

### 浏览器行为
1. 浏览器加载 `vendor-vue.js`
2. 没有找到 `//# sourceMappingURL` 注释
3. **不会自动下载** sourcemap 文件
4. 开发者工具中只显示压缩后的代码
5. **普通用户看不到源码**

### Sentry 的使用方式
```javascript
// Sentry 上传 sourcemap 后的工作流程：

1. 用户浏览器运行压缩代码，发生错误
   → 错误堆栈：vendor-vue.js:1:2345

2. Sentry 接收到错误报告
   → 堆栈信息：vendor-vue.js:1:2345

3. Sentry 服务器查找对应的 sourcemap
   → 从你上传的 vendor-vue.js.map 中查找

4. Sentry 还原真实位置
   → 真实位置：src/main.js:42:10
   → 显示原始代码上下文
```

---

## 3. `sourcemap: false` - 不生成 sourcemap

### 生成的 JS 文件 (vendor-vue.js)
```javascript
// ... 打包后的代码 ...
(function() {
  var createApp = function() {
    // Vue 核心代码
  };
  
  // ... 更多代码 ...
})();

// ← 没有注释
```

### 生成的文件
```
dist/
  └── vendor-vue.js          (不包含注释，也不生成 .map 文件)
```

### 浏览器行为
- 无法还原源码
- Sentry 也无法还原源码

---

## 注释的具体格式

### 标准格式
```javascript
//# sourceMappingURL=vendor-vue.js.map
```

### 完整 URL 格式
```javascript
//# sourceMappingURL=https://cdn.example.com/assets/vendor-vue.js.map
```

### Base64 内联格式（不常用）
```javascript
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoi...
```

---

## 为什么使用 'hidden' 模式？

### ✅ 优点

1. **保护源码**
   - 普通用户无法通过浏览器开发者工具看到源码
   - 防止商业逻辑泄露

2. **支持错误追踪**
   - Sentry 等工具可以上传 sourcemap 到私有服务器
   - 开发团队可以看到真实错误位置
   - 用户看不到源码

3. **减少带宽**
   - 浏览器不会自动下载 sourcemap 文件
   - 节省 CDN 流量

### ❌ 缺点

1. **调试不便**
   - 生产环境出现问题时，无法直接在浏览器中调试
   - 必须依赖 Sentry 等工具

---

## 实际文件内容示例

### sourcemap: true 的输出文件
```javascript
// dist/vendor-vue.js (文件末尾)

// ... 10000 行压缩代码 ...
var e=function(){return t},n=function(){return r};export{e as createApp,n as h}
//# sourceMappingURL=vendor-vue.js.map
```

### sourcemap: 'hidden' 的输出文件
```javascript
// dist/vendor-vue.js (文件末尾)

// ... 10000 行压缩代码 ...
var e=function(){return t},n=function(){return r};export{e as createApp,n as h}
```

**区别**：最后一行的注释被移除了！

---

## 我们的插件如何处理这个注释

在 `sourcemap-output-filter.js` 中：

```javascript
generateBundle(outputOptions, bundle) {
  for (const fileName in bundle) {
    const file = bundle[fileName];
    
    if (file.type === 'chunk') {
      const shouldExclude = excludePatterns.some(pattern => 
        pattern.test(file.name)
      );

      if (shouldExclude) {
        // 1. 删除 sourcemap 文件
        delete bundle[`${fileName}.map`];
        
        // 2. 移除 JS 文件中的 sourceMappingURL 注释
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
```

### 为什么要移除注释？

即使我们删除了 `.map` 文件，如果 JS 文件中还保留着 `//# sourceMappingURL` 注释：

1. 浏览器会尝试下载 `vendor-vue.js.map`
2. 返回 404 错误
3. 控制台会显示警告：`DevTools failed to load source map`

所以我们需要**同时删除文件和注释**。

---

## 总结

| 配置 | 生成 .map 文件 | JS 中的注释 | 浏览器行为 | 适用场景 |
|------|--------------|------------|-----------|---------|
| `true` | ✅ | ✅ | 自动下载 sourcemap | 开发环境 |
| `'hidden'` | ✅ | ❌ | 不下载 sourcemap | 生产环境 + Sentry |
| `false` | ❌ | ❌ | 无 sourcemap | 不需要调试 |

**关键点**：`'hidden'` 模式生成 sourcemap 文件，但不在 JS 文件末尾添加 `//# sourceMappingURL` 注释，这样浏览器就不会自动加载 sourcemap，但 Sentry 可以通过手动上传使用。

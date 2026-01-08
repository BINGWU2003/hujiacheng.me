---
title: Proxy 和 Reflect
date: 2026-01-05
duration: 20min
type: notes
art: plum
---

[[toc]]

`Proxy` 和 `Reflect` 是现代 JavaScript (ES6+) 中用于**元编程 (Meta-programming)** 的两个核心特性。

简单来说：**`Proxy` 用于“拦截”对象的基本操作，而 `Reflect` 用于“执行”这些操作的标准行为。** 它们通常成对出现，是 Vue 3 响应式系统的基石。

以下是深度的解析和对比。

---

## 1. 核心概念

### **Proxy (代理)**

`Proxy` 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。

* **作用：** 它是“守门员”。你想访问或修改目标对象，必须先经过它。
* **语法：** `const p = new Proxy(target, handler)`

### **Reflect (反射)**

`Reflect` 是一个内置对象，提供拦截 JavaScript 操作的方法。这些方法与 `Proxy` 的 `handler` 方法一一对应。

* **作用：** 它是“原样执行者”。它提供了操作对象的默认行为，但以函数调用的形式。
* **语法：** `Reflect.get(target, property, receiver)`

---

## 2. 为什么它们是“黄金搭档”？

你可能会问：

*“我在 Proxy 的拦截器里，直接操作原对象 `target[key] = value` 不行吗？为什么一定要用 `Reflect`？”*

主要有以下三个原因，其中**第三点（Receiver 机制）最为关键**。

### A. 标准化返回值

很多 Object 操作在失败时会抛错，或者返回不一致的值。`Reflect` 统一了返回行为，通常返回布尔值，让代码更健壮。

```javascript
const obj = {};
Object.defineProperty(obj, 'foo', { value: 1, writable: false });

// 传统方式：赋值失败静默失败（严格模式下报错），需要 try-catch
obj.foo = 2; 

// Reflect 方式：返回 false，逻辑更清晰
if (Reflect.set(obj, 'foo', 2)) {
  console.log('success');
} else {
  console.log('failed'); // 输出 failed
}

```

### B. 函数式操作

`Reflect` 让 `delete`、`in` 等操作符变成了函数调用，使代码更具表现力。

* `key in obj`  ->  `Reflect.has(obj, key)`
* `delete obj.key`  ->  `Reflect.deleteProperty(obj, key)`

### C. **关键点：修正 `this` 指向 (Receiver)**

这是 Vue 3 必须使用 `Reflect` 的根本原因。

当对象存在**继承**或者**Getter**访问器时，如果只使用 `target[key]`，`this` 的指向会通过闭包锁定在原始对象（`target`）上，而不是代理对象（`Proxy`）上。这会导致依赖 `this` 的其他响应式属性无法被触发。

**错误示例（不使用 Reflect）：**

```javascript
const target = {
  _name: 'Vue',
  get name() {
    // 这里的 this 也就是关键所在
    return this._name; 
  }
};

const proxy = new Proxy(target, {
  get(target, key, receiver) {
    console.log('target:', target);
    console.log('receiver:', receiver);
    console.log('触发拦截:', key);
    // 错误：直接返回 target[key]，此时 getter 里的 this 指向 target
    return target[key]; 
  }
});

const user = {
  __proto__: proxy,
  _name: 'React' // 我们希望继承后，this._name 读的是 user 的 _name
};

// 我们期望输出 'React' (因为 user 继承了 proxy)，且触发拦截
// 实际结果：输出 'Vue'。
// 原因：Proxy 里的 target[key] 执行时，getter 里的 this 绑定在了 target 上，而不是调用者 user 上。
console.log(user.name); 

```

**正确示例（使用 Reflect）：**

```javascript

const target = {
  _name: 'Vue',
  get name() {
    // 这里的 this 也就是关键所在
    return this._name; 
  }
};

const proxy = new Proxy(target, {
  get(target, key, receiver) {
    console.log('触发拦截:', key);
    // 正确：Reflect.get 接收 receiver 参数，将 this 绑定回调用者
    return Reflect.get(target, key, receiver);
  }
});

const user = {
  __proto__: proxy,
  _name: 'React'
};

// 输出 'React'。Reflect 确保了 getter 内部的 this 正确指向了 user。
console.log(user.name); 

```

::: info
1.为什么proxy的receiver指向user？

handler.get的receiver为proxy或者继承了proxy的对象：

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get

因为user的__proto__指向了proxy（即继承了proxy），所以receiver指向了user。

2.reflect的get的receiver有什么用？

如果target对象中指定了getter，receiver则为getter调用时的this值。

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get

即当访问user.name（getter访问器）时，会在proxy的handler.get中执行Reflect.get(target, key, receiver)，使target的this指向receiver（即user），所以this._name指向了user._name。

:::

---

## 3. 常用 Trap (拦截器) 对照表

| 操作 | Proxy Handler | Reflect 方法 | 说明 |
| --- | --- | --- | --- |
| 读取属性 | `get(target, prop, receiver)` | `Reflect.get(...)` | 拦截 `obj.prop` |
| 写入属性 | `set(target, prop, value, receiver)` | `Reflect.set(...)` | 拦截 `obj.prop = v` |
| 判断属性存在 | `has(target, prop)` | `Reflect.has(...)` | 拦截 `prop in obj` |
| 删除属性 | `deleteProperty(target, prop)` | `Reflect.deleteProperty(...)` | 拦截 `delete obj.prop` |
| 获取键名 | `ownKeys(target)` | `Reflect.ownKeys(...)` | 拦截 `Object.keys`, `for...in` |
| 函数调用 | `apply(target, thisArg, args)` | `Reflect.apply(...)` | 拦截 `func(...)` |

---

## 4. Vue 3 中的实际应用简析

Vue 3 的 `reactive` 就是基于这两个特性构建的。

```javascript
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 1. 收集依赖 (track)
      track(target, key);
      
      // 2. 也就是这里，必须用 Reflect 确保 this 指向正确
      // 如果 res 是对象，还需要递归 wrap 成 Proxy (懒代理)
      const res = Reflect.get(target, key, receiver);
      return res;
    },
    set(target, key, value, receiver) {
      // 1. 设置值
      const result = Reflect.set(target, key, value, receiver);
      
      // 2. 触发更新 (trigger)
      trigger(target, key);
      return result;
    }
  });
}

```

## 总结

* **Proxy** 提供了极其强大的能力来**修改**对象的底层行为。
* **Reflect** 提供了安全、规范的**默认**行为。
* **一定要配合使用**：在 `Proxy` 的 handler 中，永远建议使用 `Reflect` 对应的方法来操作 `target`，尤其是为了保证 `receiver` (即 `this`) 的正确传递。
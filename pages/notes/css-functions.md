---
title: CSS 函数
date: 2025-10-27
duration: 20min
type: notes
art: random
---

[[toc]]

## CSS 函数

**CSS 值函数**是调用特殊数据处理或计算的语句，以返回一个 CSS 属性的 [CSS](https://developer.mozilla.org/zh-CN/docs/Web/CSS) [值](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_values_and_units)。

文档地址：

*https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_values_and_units/CSS_value_functions*

## env()

文档地址：

*https://developer.mozilla.org/zh-CN/docs/Web/CSS/env*

作用：插入由用户代理（通常是浏览器）定义的**环境变量**的值。（小程序适配使用比较频繁）

使用方法：

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

`meta`标签的`content`添加`viewport-fit=cover`

```css
env( <variable-name> , <fallback-value>? )
```

**`variable-name(必须)`**：环境变量的名称，例如 `safe-area-inset-bottom`。

**`fallback-value(可选)`**：一个备用值。如果浏览器不支持 `env()` 函数或该变量不存在，就会使用这个值。

代码示例：

```css
/* 1. 为 body 设置全局的 padding，防止主要内容被遮挡 */
body {
  /* * 为顶部、右侧、底部、左侧添加安全区域内边距。
   * 对于不支持 env() 的浏览器，它会回退到 0（或你设置的备用值）。
   */
  padding-top: env(safe-area-inset-top, 20px);
  padding-right: env(safe-area-inset-right, 20px);
  padding-bottom: env(safe-area-inset-bottom, 20px);
  padding-left: env(safe-area-inset-left, 20px);
}

/* 2. 单独处理固定定位的元素 */
.main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  /* 仅在顶部添加安全区域的 padding */
  padding-top: env(safe-area-inset-top, 20px); 
  background-color: white;
}

.main-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  /* 仅在底部添加安全区域的 padding */
  padding-bottom: env(safe-area-inset-bottom, 20px); 
  background-color: white;
}
```

## var()

文档：

*https://developer.mozilla.org/zh-CN/docs/Web/CSS/var*

作用：插入一个[自定义属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/--*)（有时也被称为“CSS 变量”）的值，用来代替非自定义属性中值的任何部分。

使用方法：

```css
var( <custom-property-name> , <declaration-value>? )
```

**`custom-property-name(必需)`**：变量名称（例如 `var(--main-color)`）。

**`declaration-value(可选)`**：备用值。**如果第一个参数的变量未定义或无效**，浏览器就会使用这个备用值。

代码示例：

变量一般声明在`:root`

https://developer.mozilla.org/zh-CN/docs/Web/CSS/:root

```css
:root {
  /* 声明了三个全局变量 */
  --main-brand-color: #4A90E2;
  --main-bg-color: #FFFFFF;
  --default-font-size: 16px;
}

.element {
  /* * 尝试使用 --header-color。
   * 如果 --header-color 没有被定义，
   * 浏览器将使用 'blue' 作为备用。
   */
  color: var(--header-color, blue);

  /* * 备用值可以是任何有效值，
   * 包括逗号，这在 font-family 中很有用。
   */
  font-family: var(--custom-font, "Arial", sans-serif);
}

.element {
  /* * 1. 尝试使用 --main-color。
   * 2. 如果失败，尝试使用 --backup-color。
   * 3. 如果都失败，使用 'black'。
   */
  color: var(--main-color, var(--backup-color, black));
}
```

## calc()

文档地址：

*https://developer.mozilla.org/zh-CN/docs/Web/CSS/calc*

作用：允许在声明 CSS 属性值时执行一些计算。

使用方法：

```css
/* 语法 */
property: calc(expression);
```

`calc()` 函数支持四种基本的数学运算符：

- `+` (加法)
- `-` (减法)
- `*` (乘法)
- `/` (除法)

::: tip

使用运算符的时候，推荐运算符两侧添加空格，如果不加空格，对于+ 和 - 是无效语法。

:::

代码示例：

```css
.element {
  /* 宽度为父容器的 100%，再减去 50px */
  width: calc(100% - 50px);
}

/* 1. 在 :root 定义变量 */
:root {
  --header-height: 70px;
  --base-padding: 1rem;
  --base-font-size: 16px;
}

/* 2. 在组件中使用 calc() 和 var() */
.main-content {
  height: calc(100vh - var(--header-height));
}

.container {
  /* 计算内边距：基础内边距的两倍 */
  padding: calc(var(--base-padding) * 2);
}

body {
  /* 响应式字体大小：基础大小 + 随视口变化的增量 */
  font-size: calc(var(--base-font-size) + 0.5vw);
}
```

## calc()&var()&env()的区别

| **函数**     | **主要目的**                         | **示例**                                       |
| ------------ | ------------------------------------ | ---------------------------------------------- |
| **`calc()`** | **执行数学计算** (混合单位)          | `width: calc(100% - 20px);`                    |
| **`var()`**  | **获取 CSS 变量** (由开发者定义)     | `color: var(--main-color);`                    |
| **`env()`**  | **获取环境变量** (由浏览器/设备定义) | `padding-bottom: env(safe-area-inset-bottom);` |
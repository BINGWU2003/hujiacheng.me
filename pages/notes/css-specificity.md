---
title: CSS选择器优先级
date: 2025-10-23
duration: 20min
type: notes
art: plum
---

[[toc]]

今天看了下css选择器优先级的文章，发现之前自己对css选择器优先级的理解还是有点模糊，所以想写一篇文章来总结一下，感慨一下，ai的辅助太强。

## CSS选择器

### 类型选择器

- MDN文档：*https://developer.mozilla.org/zh-CN/docs/Web/CSS/Type_selectors*
- 作用：通过节点名称匹配元素

- 语法：

  ```css
  元素 { 样式声明 }
  ```

- 代码示例：

  ```css
  /* 所有 <a> 元素。*/
  a {
    color: red;
  }
  ```

### 类选择器

- MDN文档：*https://developer.mozilla.org/zh-CN/docs/Web/CSS/Class_selectors*

- 作用：根据 [`class`](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Global_attributes#class) 属性的内容匹配元素

- 语法：

  ```css
  .类名 { 样式声明 }
  ```

  等价于`[class~=类名] { 样式声明 }`：

  ```css
  .name {
    color: blue;
  }
  [class="name"] {
    color: red;
  }
  ```

- 代码示例：

  ```css
  /* 所有含有 class="spacious" 类的元素 */
  .spacious {
    margin: 2em;
  }
  
  /* 所有含有 class="spacious" 类的 <li> 元素 */
  li.spacious {
    margin: 2em;
  }
  
  /* 所有同时含有“spacious”和“elegant”类的 <li> 元素 */
  /* 例如 class="elegant retro spacious" */
  li.spacious.elegant {
    margin: 2em;
  }
  ```

### 属性选择器

- MDN文档：*https://developer.mozilla.org/zh-CN/docs/Web/CSS/Attribute_selectors*

- 作用：根据 [`class`](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Global_attributes#class) 属性的内容匹配元素

- 语法（具体见MDN文档）：

  ```css
  /* 存在 attr 属性的元素 */
  [attr] 
  /* 存在 attr 属性且值为value的元素 */
  [attr=value]
  ```

- 代码示例：

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      [class="name"] {
        color: red;
      }
      [title="hujiacheng"] {
        color: blue;
      }
      [id="hujiacheng1"] {
        color: green;
      }
      [title1] {
        color: yellow;
      }
      [title1="hujiacheng2"] {
        color: pink;
      }
    </style>
  </head>
  <body>
    <h1 class="name">hujiacheng</h1>
    <h2 title="hujiacheng">hujiacheng</h2>
    <h3 id="hujiacheng1">hujiacheng1</h3>
    <h4 title1="hujiacheng2">hujiacheng2</h4>
    <h5 title1>hujiacheng3</h5>
  </body>
  </html>
  ```

### ID选择器

- MDN文档：*https://developer.mozilla.org/zh-CN/docs/Web/CSS/ID_selectors*

- 作用：根据该元素的 [`id`](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Global_attributes/id) 属性中的内容匹配元素

- 语法：

  ```css
  #id 属性值 { 样式声明 }
  ```

  等价于`[id=id 属性值] { 样式声明 }`：

  ```css
  #name {
    color: blue;
  }
  [id="name"] {
    color: red;
  }
  ```

- 代码示例：

  ```css
  /* id 为 "demo" 的元素会被选中 */
  #demo {
    border: red 2px solid;
  }
  ```

### 伪元素

- MDN文档：*https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-elements*

- 作用：以`::`开头，伪元素是一个附加至选择器末的关键词，允许你对被选择元素的特定部分修改样式

- 语法：

  ```css
  selector::pseudo-element {
    property: value;
  }
  ```

- 代码示例：

  ```css
  /* 每一个 <p> 元素的第一行。 */
  p::first-line {
    color: blue;
    text-transform: uppercase;
  }
  ```

### 伪类

- MDN文档：*https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-classes*

- 作用：以`:`开头，用于指定所选元素的特殊状态

- 语法：

  ```css
  selector:pseudo-class {
    property: value;
  }
  ```

- 代码示例：

  ```css
  /* 用户的指针悬停在其上的任何按钮 */
  button:hover {
    color: blue;
  }
  ```

## CSS优先级

MDN文档：

*https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_cascade/Specificity*

结论：ID选择器（A）>伪类=属性选择器=类选择器（B）>伪元素=类型选择器（C）

### 特指度（`css`权重）

特指度：`(A,B,C`)

*用于浏览器在存在多条` CSS `规则指向同一元素时，确定哪条规则的声明应被最终应用*

| **优先级 (从高到低)** | **选择器类型**   | **示例**                              | **特指度值 (A, B, C)** | **备注**                                   |
| --------------------- | ---------------- | ------------------------------------- | ---------------------- | ------------------------------------------ |
| **-**                 | **`!important`** | `color: red !important;`              | (N/A)                  | **规则覆盖**。它不是选择器，但优先级最高。 |
| **-**                 | **内联样式**     | `<div style="color: red;">`           | (N/A)                  | **优先级高于ID**。可记为 (1, 0, 0, 0)。    |
| **1**                 | **ID 选择器**    | `#my-id`                              | (1, 0, 0)              | (A=1)                                      |
| **2**                 | **类选择器**     | `.my-class`                           | (0, 1, 0)              | (B=1)                                      |
| **2**                 | **属性选择器**   | `[type="text"]`, `[href]`             | (0, 1, 0)              | (B=1)                                      |
| **2**                 | **伪类**         | `:hover`, `:focus`, `:nth-child`      | (0, 1, 0)              | (B=1)                                      |
| **3**                 | **元素选择器**   | `div`, `p`, `h1`                      | (0, 0, 1)              | (C=1)                                      |
| **3**                 | **伪元素**       | `::before`, `::after`, `::first-line` | (0, 0, 1)              | (C=1)                                      |
| **4**                 | **通配选择器**   | `*`                                   | (0, 0, 0)              | 无特指度                                   |
| **4**                 | **组合符**       | `>` (子), `+` (相邻), `~` (兄弟)      | (0, 0, 0)              | 不增加特指度                               |
| **4**                 | **`:where()`**   | `:where(.my-class)`                   | (0, 0, 0)              | **特例**：括号内的选择器特指度**归零**。   |

### 特指度的比较规则

#### 优先级从高到低

1. **`!important`**
   - “王牌”，强制覆盖一切。
2. **内联样式**
   - 写在 HTML 里的 `<div style="...">`。
3. **ID 选择器** (A类)
   - 如 `#my-id`
   - (分数记为 `1, 0, 0`)
4. **类、属性、伪类** (B类)
   - 如 `.my-class`, `[type="text"]`, `:hover`
   - (分数记为 `0, 1, 0`)
5. **元素、伪元素** (C类)
   - 如 `div`, `::before`
   - (分数记为 `0, 0, 1`)
6. **通配符 (`\*`)**
   - (分数为 `0, 0, 0`)

#### 核心比较规则

1. **高类碾压低类（不可进位）：**
   - 比较分数时，**先看 A (ID)**。A 多的直接赢，B 和 C 再多也没用。
   - **例如：** `(1, 0, 0)` **大于** `(0, 99, 99)`。
   - A 相同，再比 B。B 多的赢，C 再多也没用。
2. **平局规则（后来者居上）：**
   - 如果 (A, B, C) 分数**完全相同**，CSS 文件里**写在最后面**的那个规则获胜。

### 伪类&伪元素

代码如下：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>伪类 vs 伪元素 优先级</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }

        .comparison {
            font-size: 1.5em;
            line-height: 1.6;
            padding: 10px;
            border: 2px dashed #ccc;
            cursor: pointer;
        }

        /*
          规则 1: 伪元素 (默认状态)
          ---------------------------------
          选择器: p.comparison::first-line
          计算:
            A (ID): 0
            B (Class): 1 (来自 .comparison)
            C (Element/Pseudo-element): 2 (来自 p 和 ::first-line)
          
          特指度 = (0, 1, 2)
        */
        p.comparison::first-line {
            color: blue;
            font-weight: bold;
            transition: color 0.3s;
        }

        /*
          规则 2: 伪类 + 伪元素 (Hover 状态)
          ---------------------------------
          选择器: p.comparison:hover::first-line
          计算:
            A (ID): 0
            B (Class/Pseudo-class): 2 (来自 .comparison 和 :hover)
            C (Element/Pseudo-element): 2 (来自 p 和 ::first-line)
          
          特指度 = (0, 2, 2)
        */
        p.comparison:hover::first-line {
            color: red;
        }

        /* 为了对比，我们让p元素的其他部分保持黑色 
          (或者你也可以单独设置 p.comparison:hover { color: gray; } 来观察)
        */

    </style>
</head>
<body>
    <h1>伪类 vs 伪元素 优先级对比</h1>
    
    <div class="comparison">
        <p class="comparison">
            <b>请将鼠标悬停在（Hover）这段文字上。</b>
            <br>
            默认情况下，第一行受 <code>p.comparison::first-line</code> (特指度 0,1,2) 控制，是<b>蓝色</b>的。
            <br>
            当你悬停时，<code>p.comparison:hover::first-line</code> (特指度 0,2,2) 将会生效。
            <br>
            观察第一行的颜色变化。
        </p>
    </div>

    <h2>分析</h2>
    <p>
        在这个修正的例子中，两个规则都**直接**以 <code>::first-line</code> 为目标。
    </p>
    <ul>
        <li>规则 1 (默认): <code>p.comparison::first-line</code> { color: blue; } - <b>特指度 (0, 1, 2)</b></li>
        <li>规则 2 (悬停): <code>p.comparison:hover::first-line</code> { color: red; } - <b>特指度 (0, 2, 2)</b></li>
    </ul>
    <p>
        当鼠标悬停时，两个规则都匹配，浏览器比较 <b>(0, 1, 2)</b> 和 <b>(0, 2, 2)</b>：
    </p>
    <ol>
        <li>比较 A 值：0 和 0，相同。</li>
        <li>比较 B 值：1 和 2。<b>2 获胜！</b></li>
        <li>比较结束。</li>
    </ol>
    <p>
        因此，包含了伪类 <code>:hover</code> 的规则 2 获胜。
        <br>
        <b>结果：</b>第一行在悬停时会从蓝色变为**红色**。
    </p>

</body>
</html>
```

优先级：伪类>伪元素

### 伪元素&类型选择器&伪类

代码如下：

```html
<!DOCTYPE html>
<html lang="zh-CN">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS 选择器优先级示例</title>

  <style>
    /*
          ==================================================
          示例 1: 类型选择器 (p) vs 伪元素 (::first-line)
          ==================================================
        */

    /* 规则 1: 类型选择器 (p)
          特指度: (0, 0, 1)
        */
    p {
      color: red;
      /* 段落默认为红色 */
      font-size: 1.2em;
    }

    /* 规则 2: 类型选择器 (p) + 伪元素 (::first-line)
          特指度: (0, 0, 2)  (p=1, ::first-line=1)
          
          解释: 
          (0,0,2) 的特指度高于 (0,0,1)。
          因此，这条规则会覆盖规则1（但仅限于第一行）。
        */
    p::first-line {
      color: blue;
      /* 段落的第一行是蓝色 */
      font-weight: bold;
    }


    /*
          ==================================================
          示例 2: (对比) 类型选择器 (div) vs 伪类 (:hover)
          ==================================================
        */

    /* 规则 3: 类型选择器 (div)
          特指度: (0, 0, 1)
        */
    div {
      color: green;
      padding: 15px;
      border: 1px solid green;
      margin-top: 20px;
      cursor: pointer;
    }

    /* 规则 4: 类型选择器 (div) + 伪类 (:hover)
          特指度: (0, 1, 1)  (div=1, :hover=10)
          
          解释:
          伪类 (:hover) 贡献 (0,1,0)，优先级高于 伪元素 (::first-line) 的 (0,0,1)。
          (0,1,1) 的特指度远高于 (0,0,1)。
        */
    div:hover {
      color: orange;
      border-color: orange;
      background-color: #fffbeb;
    }
  </style>
</head>

<body>

  <h1>CSS 选择器优先级演示</h1>

  <hr>

  <h2>示例 1: 类型选择器 vs 伪元素</h2>

  <p>
    这是一个段落。根据 CSS 规则 (<code>p</code>)，这个段落的默认颜色是红色的。
    但是，第一行的优先级被 <code>p::first-line</code> 选择器（特指度 0,0,2）覆盖了，
    所以第一行应该是蓝色的，并且是粗体。
    段落的剩余部分将保持红色（特指度 0,0,1）。
  </p>

  <hr>

  <h2>示例 2: (对比) 类型选择器 vs 伪类</h2>

  <div>
    把鼠标悬停在这个 div 元素上。
    <br>
    默认情况下，它受 <code>div</code> (特指度 0,0,1) 控制，是绿色的。
    <br>
    当你悬停时，<code>div:hover</code> (特指度 0,1,1) 生效，它会变成橙色。
  </div>

</body>

</html>
```

优先级：伪类>伪元素=类型选择器

::: tip

伪元素和类型选择器特指度是一样的，由于使用伪元素的时候，前面必须有个选择器，如果是类型选择器那么，特指度一定是比只使用一个类型选择器多1的*(0,0,1) < (0,0,2)*  

:::

### 伪类&属性选择器&类选择器

代码如下：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>类 vs 属性 vs 伪类 优先级</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        .test-box {
            font-size: 1.5em;
            font-weight: bold;
            padding: 20px;
            border: 2px solid #ccc;
            cursor: pointer;
            transition: all 0.3s;
        }

        /* ==================================================
          场景 1: :hover (伪类) 在 [data-role] (属性) 之前定义
          ==================================================
        */
        
        /* 规则 A (伪类)
          选择器: .demo-1:hover
          特指度 (A,B,C) = (0, 2, 0)
          (A=0, B=2 [来自 .demo-1 和 :hover], C=0)
        */
        .demo-1:hover {
            color: blue;
            background-color: #e0f7ff;
        }

        /* 规则 B (属性)
          选择器: .demo-1[data-role="test-1"]
          特指度 (A,B,C) = (0, 2, 0)
          (A=0, B=2 [来自 .demo-1 和 data-role], C=0)
        */
        .demo-1[data-role="test-1"] {
            color: green; /* 默认颜色为 green */
        }
        

        /* ==================================================
          场景 2: [data-role] (属性) 在 :hover (伪类) 之前定义
          ==================================================
        */

        /* 规则 C (属性)
          特指度 (A,B,C) = (0, 2, 0)
        */
        .demo-2[data-role="test-2"] {
            color: green; /* 默认颜色为 green */
        }
        
        /* 规则 D (伪类)
          特指度 (A,B,C) = (0, 2, 0)
        */
        .demo-2:hover {
            color: blue;
            background-color: #e0f7ff;
        }

    </style>
</head>
<body>

    <h1>类 vs 属性 vs 伪类 优先级</h1>
    <p>
        这三者的基础优先级是<b>完全相同</b>的 (都属于 B 类)。
        <br>
        当总特指度相同时，优先级由“源代码顺序”决定（后来者居上）。
    </p>

    <hr>

    <h2>场景 1: 伪类 (blue) 先定义，属性 (green) 后定义</h2>
    <div class="test-box demo-1" data-role="test-1">
        请悬停（Hover）在我上面。
        <br>
        我的颜色<b>将会保持绿色</b>。
    </div>
    <p>
        <b>分析：</b>
        <br>
        默认状态：规则 B 生效，颜色为 <code>green</code>。
        <br>
        悬停状态：规则 A 和 规则 B 都匹配。
        <br>
        规则 A (<code>.demo-1:hover</code>) 特指度为 (0, 2, 0)。
        <br>
        规则 B (<code>.demo-1[data-role="test-1"]</code>) 特指度为 (0, 2, 0)。
        <br>
        <b>特指度平局！</b> 规则 B 在 CSS 中定义在最后，所以规则 B 获胜，颜色保持 <code>green</code>。
    </p>

    <hr>

    <h2>场景 2: 属性 (green) 先定义，伪类 (blue) 后定义</h2>
    <div class="test-box demo-2" data-role="test-2">
        请悬停（Hover）在我上面。
        <br>
        我的颜色<b>将会变为蓝色</b>。
    </div>
    <p>
        <b>分析：</b>
        <br>
        默认状态：规则 C 生效，颜色为 <code>green</code>。
        <br>
        悬停状态：规则 C 和 规则 D 都匹配。
        <br>
        规则 C (<code>.demo-2[data-role="test-2"]</code>) 特指度为 (0, 2, 0)。
        <br>
        规则 D (<code>.demo-2:hover</code>) 特指度为 (0, 2, 0)。
        <br>
        <b>特指度平局！</b> 规则 D 在 CSS 中定义在最后，所以规则 D 获胜，颜色变为 <code>blue</code>。
    </p>


</body>
</html>
```

优先级：伪类=属性选择器=类选择器

### ID选择器

代码如下：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ID 选择器 vs B类选择器 优先级</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        .demo-box {
            font-size: 1.5em;
            font-weight: bold;
            padding: 20px;
            border: 2px solid #ccc;
            cursor: pointer;
            transition: all 0.3s;
        }

        /* 规则 1: ID 选择器 (A 类)
          --------------------------
          特指度 (A,B,C) = (1, 0, 0)
        */
        #element-id {
            color: red; /* ID 选择器说：我是红色 */
        }

        /* 规则 2: 类 + 属性 + 伪类 (B 类组合)
          --------------------------
          选择器: .element-class[data-role="test"]:hover
          计算:
            A (ID): 0
            B (Class/Attr/Pseudo): 3 
               (1 来自 .element-class, 
                1 来自 [data-role="test"], 
                1 来自 :hover)
            C (Element): 0
            
          特指度 (A,B,C) = (0, 3, 0)
        */
        .element-class[data-role="test"]:hover {
            color: blue; /* B类组合说：悬停时变蓝色 */
            background-color: #e0f7ff;
        }

    </style>
</head>
<body>

    <h1>ID 选择器 vs (类 + 属性 + 伪类)</h1>
    
    <div id="element-id" class="element-class" data-role="test">
        请悬停（Hover）在我上面。
        <br>
        我的颜色<b>将会保持红色</b>。
    </div>

    <h2>分析</h2>
    <p>
        当你将鼠标悬停在这个 <code>div</code> 上时，有两条规则试图设置它的颜色：
    </p>
    <ul>
        <li>规则 1 (ID): <code>#element-id</code> { color: red; } - <b>特指度 (1, 0, 0)</b></li>
        <li>规则 2 (B类组合): <code>.element-class[data-role="test"]:hover</code> { color: blue; } - <b>特指度 (0, 3, 0)</b></li>
    </ul>
    <p>
        浏览器比较 <b>(1, 0, 0)</b> 和 <b>(0, 3, 0)</b>：
    </p>
    <ol>
        <li>比较 A 值：<b>1</b> vs <b>0</b>。</li>
        <li><b>1 获胜！</b> 比较结束。</li>
    </ol>
    <p>
        <b>结论：</b>
        <br>
        ID 选择器的特指度 (A=1) **碾压**了 B 类选择器的组合（B=3）。
        <br>
        这就是 CSS 特指度的“不可进位”原则：即使我们堆叠了 3 个（甚至 99 个）B 类选择器，它们的权重也永远无法超过 1 个 A 类（ID）选择器。
    </p>


</body>
</html>
```

优先级：ID选择器>伪类=属性选择器=类选择器


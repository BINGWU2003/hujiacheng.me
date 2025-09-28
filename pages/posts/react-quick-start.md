---
title: React快速入门
date: 2024-07-28
duration: 60min
art: random
---

[[toc]]
## 教程参考

[react核心语法](https://www.bilibili.com/video/BV1pF411m7wV/?share_source=copy_web&vd_source=3acabbfb34a5a857a28e70904c4ac854)

[组件通信与插槽](https://www.bilibili.com/video/BV1xM41197cZ/?share_source=copy_web&vd_source=3acabbfb34a5a857a28e70904c4ac854)

[React Hooks速成](https://www.bilibili.com/video/BV1kc411D7F9/?share_source=copy_web&vd_source=3acabbfb34a5a857a28e70904c4ac854)

[React中文文档](https://zh-hans.react.dev/)

## React核心语法

### 搭建项目

#### 构建命令

使用官方的命令创建

```bash
npx create-next-app@latest
```

使用Vite创建项目

```bash
pnpm create vite
```

#### 创建第一个React项目

这里使用npx create-next-app@latest来创建项目

![image-20240608143917982](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608143917982.png?imageSlim)

使用pnpm dev启动项目

![image-20240608144111614](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608144111614.png?imageSlim)

浏览器访问http://localhost:3000出现以下页面说明搭建完成

![image-20240608144221197](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608144221197.png?imageSlim)

### TSX(JSX)

TSX(JSX)将typescript(javascript)语法和html结合在一起的一种语法,是一种模板

#### 删除无用代码方便后续学习

修改一下**page.tsx**文件和**layout.tsx**文件,方便后续学习

page.tsx文件

```tsx
export default function Home() {
  return (
    <div>hello react</div>
  )
}
```

![image-20240608145431691](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608145431691.png?imageSlim)

layout.tsx文件

删除全局样式的引入

![image-20240608145522872](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608145522872.png?imageSlim)

刷新页面

出现hello react

![image-20240608145604864](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608145604864.png?imageSlim)

#### 函数组件

一个函数为一个组件,函数的返回值为要渲染的内容

```tsx
export default function Home() {
  return (
    <div>hello react</div>
  )
}
```

如果返回的内容只有一行,可以省略 ()

```tsx
export default function Home() {
  return <div>hello react</div>
}
```

如果返回的内容有多行,括号不能省略

```tsx
export default function Home() {
  return (
    <div>
      <div>hello</div>
      <div>react</div>
    </div>
  )
}
```

#### TXS只能返回一个根元素

有点像vue2中的template,只能有一个根元素

出现两个根元素

```tsx
export default function Home() {
  return (
    <div>hello react</div>
    <div>hello react</div>
  )
}
```

vscode报错提示

![image-20240608150710033](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608150710033.png?imageSlim)

#### TXS空标签

<> 多级元素内容 </>

用于处理多级元素

```tsx
export default function Home() {
  return (
    // 空标签
    <>
      <div>hello react</div>
      <div>hello react</div>
    </>
  )
}
```

最终渲染出来的结构没有产生多余的html元素

![image-20240608151051949](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608151051949.png?imageSlim)

#### TSX展开语法

```tsx
"use client"
export default function Home() {
  // 定义一个属性
  const objData = {
    style: {
      color: "red",
      // 带有 - 要使用驼峰
      fontSize: '30px'
    },
    className: 'redText',
  }
  return (
    <>
    {/* 展开 */}
      <div {...objData}>hello world</div>
    </>
  )
}
```

![image-20240608173042333](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608173042333.png?imageSlim)

### 数据渲染

#### 插值语法

看完视频后,感觉有点类似vue的插值语法,哈哈哈

##### 标签内容

```tsx
export default function Home() {
  const title = 'hello react'
  return (
    <>
    {/* 使用在标签内部 */}
      <div>{title}</div>
    </>
  )
}
```

![image-20240608151829003](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608151829003.png?imageSlim)

##### 标签属性

```tsx
export default function Home() {
  const title = 'hello react'
  // 标签属性
  const titleAttribute = 'titleAttribute'
  return (
    <>
    {/* 使用标签属性 */}
      <div title={titleAttribute}>{title}</div>
    </>
  )
}
```

![image-20240608152318341](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608152318341.png?imageSlim)

#### 条件渲染

使用三元表达式

```tsx
export default function Home() {
  let flag = false
  return (
    <>
      <div>{flag?'hello react':'hello vue'}</div>
    </>
  )
}
```

在函数中使用条件判断

```tsx
export default function Home() {
  let title = null
  let flag = true
  // 定义一个flag标志
  if(flag){
    title = <span>hello react</span>
  } else {
    title = <span>hello vue</span>
  }
  return (
    <>
      <div>{title}</div>
    </>
  )
}
```

flag为true

![image-20240608153100375](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608153100375.png?imageSlim)

flag为false

![image-20240608153121992](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608153121992.png?imageSlim)

#### 列表渲染

先写的todolist再回过头来看基本语法,map在react中用的应该是非常多

列表中的key用于保证元素的唯一性,类似vue的v-for中的key

```tsx
export default function Home() {
  const list = ['吃饭', '睡觉', '看手机', '打游戏']
  return (
    <>
      <ul>
        {list.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </>
  )
}
```

![image-20240608155331087](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608155331087.png?imageSlim)

使用Fragment来包裹返回的多个根元素

[Fragment介绍](https://zh-hans.react.dev/reference/react/Fragment)

![image-20240608160011997](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608160011997.png?imageSlim)

和<></>类似,Fragment里可以写key,但<></>不行

```tsx
import { Fragment } from "react"
export default function Home() {
  const list = ['吃饭', '睡觉', '看手机', '打游戏']
  return (
    <>
      <ul>
        {list.map((item) => (
          // 使用Fragment包裹多级元素
          <Fragment key={item}>
            <li >{item}</li>
            <li>----</li>
          </Fragment>
        ))}
      </ul>
    </>
  )
}
```

![image-20240608160315805](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608160315805.png?imageSlim)

### 事件处理

标签的属性通常使用驼峰

点击事件:onClick

```tsx
"use client"
export default function Home() {
  const handleClick = () => {
    alert('click')
  }
  return (
    <>
      <button onClick={handleClick}>按钮</button>
    </>
  )
}
```

![image-20240608161007671](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608161007671.png?imageSlim)

### 状态处理

#### useState

[useState文档](https://zh-hans.react.dev/reference/react/useState)

```ts
const [state, setState] = useState(initialState)
```

initialState为初始值

state为数据

setState用于修改state的函数

```tsx
"use client"
// 导入useState
import { useState } from "react"
export default function Home() {
  // 使用useState
  const [title,setTitle] = useState<string>('标题x')
  const handleClick = () => {
    setTitle('标题a')
  }
  return (
    <>
    <h1>{title}</h1>
      <button onClick={handleClick}>按钮</button>
    </>
  )
}
```

点击按钮修改title

![image-20240608162106627](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608162106627.png?imageSlim)

##### 修改对象的技巧

先展开旧的对象,再覆盖旧的属性值

```tsx
"use client"
import { useState } from "react"
interface Content {
  title: string;
  name: string;
}
export default function Home() {

  const [content, setContent] = useState<Content>({
    title: '标题1',
    name: '吃饭'
  })
  const handleClick = () => {
    // 修改对象的某个属性
    setContent({
      // 先展开对象
      ...content,
      // 新的属性值会覆盖旧的属性值
      name: '睡觉'
    })
  }
  return (
    <>
      <h1>{content.name}</h1>
      <button onClick={handleClick}>按钮</button>
    </>
  )
}
```

点击按钮

![image-20240608163447953](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608163447953.png?imageSlim)

##### 修改数组的技巧

vue中可以使用push,pop直接修改数组,react中有点小麻烦

先展开数组,再添加一个新的元素

```tsx
"use client"
import { useState } from "react"

export default function Home() {

  const [list, setList] = useState([1, 2, 3])
  const handleClick = () => {
    // 先展开数组,再添加一个新的元素
    setList([...list, 4])
  }
  return (
    <>
      <ul>
        {list.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <button onClick={handleClick}>按钮</button>
    </>
  )
}
```

点击按钮新增一个数组元素4

![image-20240608164419909](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608164419909.png?imageSlim)

## React组件通信与插槽

### ReactDom组件

#### 设置props属性

```tsx
"use client"
export default function Home() {
  const url = 'https://bing-wu-doc.netlify.app/background.svg'
  return (
    <>
      <div>hello world</div>
      {/* 在html元素上使用props */}
      <img src={url} alt="" />
    </>
  )
}
```

![image-20240608171532539](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608171532539.png?imageSlim)

#### 设置className属性

```tsx
"use client"
export default function Home() {
  return (
    <>
      <div className="redText">hello world</div>
    </>
  )
}
```

![image-20240608171817494](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608171817494.png?imageSlim)

#### 设置style属性

带有 - 要使用驼峰

```tsx
"use client"
export default function Home() {
  // 设置样式
  const titleStyle = {
    color: "red",
    // 带有 - 要使用驼峰
    fontSize: '30px'
  }
  return (
    <>
    {/* style */}
      <div style={titleStyle}>hello world</div>
    </>
  )
}
```

### React组件

#### 创建一个React组件

```tsx
export default function MyApp() {
  return (
    <div>myapp组件</div>
  )
}
```

![image-20240608173330134](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608173330134.png?imageSlim)

导入react组件并使用

![image-20240608173427392](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608173427392.png?imageSlim)

![image-20240608173438293](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608173438293.png?imageSlim)

#### 设置props属性

##### 父传子

MyApp组件

```tsx

interface MyAppProps {
  content: string;
  sayHello: () => void;
  active: boolean;
}

export default function MyApp({ content, sayHello, active }: MyAppProps) {

  return (
    <>
      <div>myapp组件</div>
      <div>{content}</div>
      <button onClick={sayHello}>按钮</button>
      <div>{active ? '激活' : '未激活'}</div>
      <div>------</div>
    </>
  )
}
```

pages组件

active未设置值,默认为true

```tsx
"use client"
import MyApp from "./MyApp"
export default function Home() {
  const sayHello = ()=>{
    alert('hello')
  }
  return (
    <>
      <div>hello world</div>
      <MyApp content={'内容1'} sayHello={sayHello} active></MyApp>
    </>
  )
}
```

![image-20240608174709186](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240608174709186.png?imageSlim)

##### 父传子再传孙

page组件

```tsx
"use client"
import MyApp from "./MyApp"
export default function Home() {
  const data = {
    content: "我要吃饭",
    childData: {
      title: '今天天气好',
      date: "2077-9-1"
    }
  }
  return (
    <>
      <div>hello world</div>
      {/* 展开data */}
      <MyApp  {...data}></MyApp>
    </>
  )
}
```

MyApp组件

```tsx
import MyChild from "./MyChild";
interface MyAppProps {
  content: string;
  childData: {
    title: string;
    date: string;
  }
}

export default function MyApp({ content, childData }: MyAppProps) {

  return (
    <>
      <div>myapp组件</div>
      <div>{content}</div>
      {/* 展开要传入到孙组件的数据 */}
      <MyChild {...childData}></MyChild>
    </>
  )
}
```

MyChild组件

创建一个MyChild组件

![image-20240609135440876](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240609135440876.png?imageSlim)

填入以下代码

```tsx

interface MyChildProps {
  title: string;
  date: string;
}
export default function MyChild({ title, date }: MyChildProps) {
  return (
    <>
      <div>mychild组件</div>
      <div>{title}</div>
      <div>{date}</div>
    </>
  )
}
```

页面中展示的效果

![image-20240609140008373](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240609140008373.png?imageSlim)

#### 插槽

##### 普通传参

myapp组件

```tsx
// 使用默认的属性children获取传入过来的html元素
export default function MyApp({ children }: any) {
  return (
    <>
      <div>myapp组件</div>
      <div>
        {/* 使用 */}
        {children}
      </div>
    </>
  )
}
```

page组件

```tsx
"use client"
import MyApp from "./MyApp"
export default function Home() {
  return (
    <>
      <div>hello world</div>
      <MyApp>
        {/* 往myapp组件传入的html元素 */}
        <div>1</div>
        <div>1</div>
        <div>1</div>
      </MyApp>
    </>
  )
}
```

![image-20240609140450757](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240609140450757.png?imageSlim)

##### 向多个位置传递

page组件

```tsx
"use client"
import MyApp from "./MyApp"
export default function Home() {
  return (
    <>
      <div>hello world</div>
      <MyApp content={'吃饭吃饭吃饭'} title={'天气好好'}>
        {/* 往myapp组件传入的html元素 */}
        <div>1</div>
        <div>1</div>
        <div>1</div>
      </MyApp>
      {/* 不传title */}
      <MyApp content={'睡觉睡觉睡觉'}>
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </MyApp>
    </>
  )
}

```

myapp组件

```tsx
// props的属性设置默认值表示可选的
// title可选
export default function MyApp({ children, content, title = '默认标题' }: any) {
  return (
    <>
      <div>myapp组件</div>
      <div>
        {/* 使用 */}
        {children}
      </div>
      <div>{title}</div>
      <div>{content}</div>
    </>
  )
}
```

![image-20240609141308597](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240609141308597.png?imageSlim)

#### 子传父

有点像vue的emits

page组件

```tsx
"use client"
import MyApp from "./MyApp"
export default function Home() {
  // 传入到myapp组件的函数
  const getData = (data: string) => {
    console.log('data', data);
  }
  return (
    <>
      <div>hello world</div>
      {/* 传入函数 */}
      <MyApp getData={getData}>
      </MyApp>
    </>
  )
}
```

myapp组件

```tsx
import { useState } from "react"

export default function MyApp({ getData }: any) {
  const [name] = useState('小李')
  return (
    <>
      <div>myapp组件</div>
      <div>{name}</div>
      {/* myapp组件触发page组件传入过来的函数 */}
      <button onClick={(e) => getData(name)}>按钮</button>
    </>
  )
}
```

获取到myapp组件的数据

![image-20240609142742492](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240609142742492.png?imageSlim)

#### 多层组件传参

[createContext](https://react.docschina.org/reference/react/createContext#createcontext)

组件嵌套层数很多,4-5层以上的时候

如果是多文件组件,感觉不出来有什么用,待考量

##### 方式一

```tsx
"use client"
// 导入
import { createContext, useContext } from "react"
// 创建一个context
const DataContext = createContext('今天吃饭了吗')
function MyChild() {
    // 使用context
  const data = useContext(DataContext)
  return (
    <>
      <div>my-child</div>
      <div>{data}</div>
    </>
  )
}

export default function Home() {
  return (
    <>
      <div>hello world</div>
      <MyChild></MyChild>
    </>
  )
}
```

![image-20240609150940032](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240609150940032.png?imageSlim)

##### 方式二

使用Consumer和Provider

```tsx
"use client"
import { createContext, useState } from "react"
// 创建一个context
const DataContext = createContext('')
function MyChild() {
  return (
    <>
      <div>MyChild组件</div>
      <DataContext.Consumer>
        {/* 使用插值语法 */}
        {
          // 包裹一个函数  函数第一个参数是Provider传入过来的数据
          (value) => <div>{value}</div>
        }
      </DataContext.Consumer>
    </>
  )
}


export default function Home() {
  const [data] = useState<string>('今天吃了面')
  return (
    <>
      <div>hello world</div>
      {/* 要传递过去的数据 */}
      <DataContext.Provider value={data}>
        <MyChild> </MyChild>
      </DataContext.Provider>
    </>
  )
}

```

## ReactHooks速成

### useReducer

[useReducer官方文档](https://zh-hans.react.dev/reference/react/useReducer)

统一管理状态的操作方式

```tsx
"use client"

import { useReducer } from "react"

interface action {
  type: string
}
// 创建一个函数
const countReducer = (state: number, { type }: action) => {
  if (type === 'increment') {
    return state + 1
  } else if (type === 'decrement') {
    return state - 1
  } else {
    return state
  }
}

export default function Home() {
  // 第一个参数为更新state的函数,第二参数为state的初始值
  const [count, dispatch] = useReducer(countReducer, 0)
  return (
    <>
      <div>hello world</div>
      <div>{count}</div>
      <button onClick={e => dispatch({ type: 'increment' })}>+</button>
      <button onClick={e => dispatch({ type: 'decrement' })}>-</button>
    </>
  )
}
```

![image-20240610231557565](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240610231557565.png?imageSlim)

### useRef

[useRef官方文档](https://zh-hans.react.dev/reference/react/useRef)

#### 用于记录上次状态更新的值

```tsx
"use client"
import { useRef,useState } from "react"
export default function Home() {
  const [count, setCount] = useState(0)
  // 参数为默认值
  const preCount = useRef(-1)
  const handleClick = () => {
    preCount.current = count
    setCount(count + 1)
  }
  return (
    <>
      <div>hello world</div>
      <div>当前的count{count}</div>
      <div>上一次的count{preCount.current}</div>
      <button onClick={handleClick}>count++</button>
    </>
  )
}
```

![image-20240610232925258](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240610232925258.png?imageSlim)

#### 用于获取dom对象

获取普通的html元素

```tsx
"use client"
import { useRef} from "react"
export default function Home() {
  const divRef = useRef(null)
  const handleClick = () => {
    console.log('dom',divRef.current.innerHTML);
    
  }
  return (
    <>
      <div>hello world</div>
      <div ref={divRef}>div标签</div>
      <button onClick={handleClick}>get</button>
    </>
  )
}
```

![image-20240610233422775](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240610233422775.png?imageSlim)

### forwardRef&useImperativeHandle

[forwardRef官方文档](https://zh-hans.react.dev/reference/react/forwardRef)

`forwardRef` 允许组件使用 [ref](https://zh-hans.react.dev/learn/manipulating-the-dom-with-refs) 将 DOM 节点暴露给父组件。

[useImperativeHandle官方文档](https://zh-hans.react.dev/reference/react/useImperativeHandle)

`useImperativeHandle` 是 React 中的一个 Hook，它能让你自定义由 [ref](https://zh-hans.react.dev/learn/manipulating-the-dom-with-refs) 暴露出来的句柄。

```tsx
"use client"
import { useRef, forwardRef, useImperativeHandle } from "react"
// 要暴露出去的组件
const MyChild = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => {
    return {
      // 要暴露出去的方法
      showHello() {
        console.log('hello world')
      }
    }
  })
  return <div>mychild组件</div>
})
// 设置显示名称
MyChild.displayName = 'MyChild';
export default function Home() {
  const myChildRef = useRef(null)
  const handleClick = () => {
    myChildRef.current.showHello()
  }
  return (
    <>
      <div>hello world</div>
      <MyChild ref={myChildRef}></MyChild>
      <button onClick={handleClick}>get</button>
    </>
  )
}
```

输出hello world

![image-20240610235028628](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240610235028628.png?imageSlim)

### useEffect

[useEffect文档](https://react.docschina.org/reference/react/useEffect)

类似vue中的watch

依赖的数据发生变化,useEffect函数就会执行

```tsx
"use client"
import { useEffect, useState } from "react"
export default function Home() {
  const [num, setNum] = useState(0)
  // num为要依赖的数据
  useEffect(() => {
    console.log("useEffect")
  }, [num])

  return (
    <>
      <div>hello world</div>
      {/* num变化,执行useEffect */}
      <button onClick={() => setNum(num + 1)}>++</button>
    </>
  )
}
```

![image-20240611164938924](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240611164938924.png?imageSlim)

### useMemo

[useMemo官方文档](https://react.docschina.org/reference/react/useMemo)

父组件的重新渲染会引起子组件的重新渲染

```tsx
"use client"
import { useState } from "react"

const MyChild = () => {
  console.log("MyChild组件渲染了")
  return (
    <div>MyChild组件</div>
  )
}

export default function Home() {
  const [num, setNum] = useState(0)
  return (
    <>
      <div>hello world</div>
      <MyChild />
      <button onClick={() => setNum(num + 1)}>++</button>
    </>
  )
}
```

![image-20240611165733337](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240611165733337.png?imageSlim)

只有name变化才会重新渲染子组件(!!!)

```tsx
"use client"
import { useState, useMemo } from "react"

// 子组件获取父组件传递过来的name
const MyChild = ({ name }) => {
  // 让name变更的时候重新渲染子组件
  const memoName = useMemo(() => {
    console.log("MyChild组件渲染了")
    const newName = name + '123'
    return newName
  }, [name])
  return (
    <>
      <div>MyChild组件</div>
      <div>{name}</div>
      <div>{memoName}</div>
    </>

  )
}

export default function Home() {
  const [num, setNum] = useState(0)
  const [name, setName] = useState("")
  return (
    <>
      <div>hello world</div>

      <MyChild name={name} />
      <div>{num}</div>
      <button onClick={() => setNum(num + 1)}>++</button>
      <button onClick={() => setName("name" + name)}>name</button>
    </>
  )
}
```


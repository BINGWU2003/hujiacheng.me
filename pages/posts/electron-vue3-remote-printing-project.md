---
title: Electron+Vue3的远程打印项目
date: 2024-08-19
duration: 18min
art: random
---

[[toc]]

## 核心技术选型

vue3+electron+hiprint+mqtt

[Hiprint](http://hiprint.io/):

和web端统一打印库,方便把web端数据和打印模板构建成html

Mqtt:

用于客户端和服务端的连接

[Electron](https://www.electronjs.org/zh/docs/latest/):

1.用于构建桌面端项目

可以直接将vue3项目打包成桌面端,参考教程:https://juejin.cn/post/7360899424107970586

2.使用Electron提供的api实现打印

[打印api文档](https://www.electronjs.org/zh/docs/latest/api/web-contents#contentsprintoptions-callback)

有静默打印,打印html,获取打印机列表等api接口

## 后端接口梳理

客户端使用的接口:

- [/app/remotePrint/register(注册客户端)](https://app.apifox.com/link/project/3742176/apis/api-203595568)
- [/app/remotePrint/registerPrint(注册打印机)](https://app.apifox.com/link/project/3742176/apis/api-203658545)
- [/app/remotePrint/pushClientStatus(客户端是否能打印)](https://app.apifox.com/link/project/3742176/apis/api-203598817)
- [/app/remotePrint/getPrintData(获取打印数据)](https://app.apifox.com/link/project/3742176/apis/api-203596589)
- [/app/remotePrint/printCallback(打印任务回调)](https://app.apifox.com/link/project/3742176/apis/api-203597016)
- [/app/remotePrint/getMqttConfig(获取mqtt配置信息)](https://app.apifox.com/link/project/3742176/apis/api-203710344)

小程序端使用的接口:

- [/app/remotePrint/getPrintTemplate(获取打印模板)](https://app.apifox.com/link/project/3742176/apis/api-203692260)
- [/app/remotePrint/printTask(打印)](https://app.apifox.com/link/project/3742176/apis/api-203596370)
- [/app/remotePrint/getClientStatus(获取客户端状态)](https://app.apifox.com/link/project/3742176/apis/api-203596179)

## 基本打印流程

### 客户端和小程序端流程

![image-20240819134750435](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240819134750435.png?imageSlim)

### mqtt流程

![image-20240819134854937](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240819134854937.png?imageSlim)

## 项目的安装和使用

打包之后的应用(生产环境)默认使用的是正式环境url

在登陆页面的`登陆按钮`下面中间的`空白处`连续点击10次可以切换到测试环境.

<img src="https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/20240815_152256.gif?imageSlim" alt="20240815_152256" style="zoom: 50%;" /> 

如果切换到测试环境,想回到正式环境,需要完全关闭app再重新打开.

- 安装依赖

```bash
npm i
```

- 启动项目

```bash
npm run dev
```

- 打包项目

```bash
npm run electron:build
```

打包后的安装包在根目录的`release`文件夹

## 项目文件资源目录

```bash
|-- print_client_service项目
    |-- .gitignore # 忽略要被git跟踪的文件
    |-- .npmrc # 配置electron的安装源
    |-- index.html
    |-- package-lock.json
    |-- package.json
    |-- README.md
    |-- vite.config.js
    |-- public # 静态文件目录,存放打包使用的图标等等
    |   |-- logo.ico
    |-- src
    |   |-- App.vue
    |   |-- main.js
    |   |-- assets
    |   |   |-- background.svg
    |   |   |-- empty.png
    |   |   |-- qrcode.png
    |   |   |-- iconfont
    |   |       |-- iconmes.css
    |   |-- axios
    |   |   |-- index.js # 封装的axios
    |   |   |-- api
    |   |       |-- login.js # 登陆的接口
    |   |       |-- print.js # 打印的接口
    |   |-- common
    |   |   |-- devConfig.js # 配置连接的服务地址
    |   |-- components
    |   |   |-- loading
    |   |       |-- index.vue
    |   |-- router
    |   |   |-- index.js # 路由守卫
    |   |   |-- routes.js # 路由数据
    |   |-- styles
    |   |   |-- style.css
    |   |   |-- colorui
    |   |       |-- icon.css
    |   |       |-- main.css
    |   |-- utils
    |   |   |-- common.js # 原生的消息弹窗
    |   |   |-- generateHtml.js # 将web端数据和模板构建成html
    |   |   |-- mqttPlugin.js # 封装的mqtt
    |   |   |-- rootHtml.js # 包含了打印的html的默认样式
    |   |-- views
    |       |-- index.vue
    |       |-- index
    |           |-- company.vue # 公司选择页面
    |           |-- login.vue # 登陆页面
    |           |-- print.vue # 打印页面
    |-- src-electron # electron的主进程目录
        |-- logo.ico 
        |-- main.js # electron的主进程文件
        |-- preload.js # 暴露出的自定义electron的api,用于在组件中调用
        |-- print.js # electron打印api的封装
```

## 遇到的问题

- png转ico

需要借助[icofx](https://zhutix.com/software/icofx/),否则容易出现转换后图标很模糊的问题

教程参考:https://www.cnblogs.com/hibiscus-ben/p/15330623.html

- 使用npm包管理器来管理

如果使用其他包管理工具,pnpm/cnpm等等,得重新配置electron下载源.不一定有现成的配置文件,得自己配置,很麻烦

- 打印机实际打印的大小约为60mm*40mm

虽然纸张大小为80mm*40mm,但打印机实际打印的大小约为60mm*40mm.web端的模板必须按照60mm*40mm的大小来设置

- web端调用浏览器的打印api打印出来的内容有时间字段,但是远程打印这边打印出来的内容没有时间字段

在获取到打印数据列表时,需要给列表的每一个item项新增一个printTime字段,值为当前的时间.web端配置打印模板的时候也需把时间字段设置为printTime

```javascript
resData.data.workOrderTicketPrintVOS = resData.data.workOrderTicketPrintVOS.map((item) => {
  const now = new Date()
  item.printTime = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }) + ' ' + now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return item
})
```

- Electron的应用默认是可以多开的

如果要求不能多开,需要去electron的主进程文件`main.js`中配置,当创建两个窗口实例的时候需要进行处理

- 通过Hiprint构建的html有高度误差,误差为1mm

例如,模板的height是80mm,但是构建出来的html纸张的高度是79mm.如果一次性打印很多张,一次打印100张,误差就有10cm,可能会出现打印内容偏移不全的问题.

因此在构建html之前要先把模板的高度增加1mm再去构建.

```javascript
// hipirnt构建的html有高度误差,要重新构建加1
const modifyHeight = (jsonString) => {
  // 解析 JSON 字符串为对象
  const jsonObject = JSON.parse(jsonString)

  // 递归函数遍历对象并修改 height 值
  const traverseAndModify = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === 'height' && typeof obj[key] === 'number') {
          // 高度要加1
          obj[key] += 1
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverseAndModify(obj[key])
        }
      }
    }
  }

  // 开始遍历和修改
  traverseAndModify(jsonObject)

  // 将修改后的对象转换回 JSON 字符串
  return JSON.stringify(jsonObject)
}
```

- 打印机相关的问题

1.打印出来的内容是倒向的

打印配置为横向打印

2.打印宽度如果和打印模板的宽度一样的话,很可能出现打印内容缺失

打印的配置的宽度width可以稍微比模板大2~5mm

- 打包之后页面白屏的问题

配置路由的`history`为createWebHashHistory模式

```javascript
const router = createRouter({
    // 使用hash(createWebHashHistory)模式，(createWebHistory是HTML5历史模式，支持SEO)
    history: createWebHashHistory(),
    routes: routes,
})
```

- 开发环境如果连接测试环境的url,登陆之后无法获取响应头里的token

解决方法:

后端配置响应头的内容

```json
Access-Control-Expose-Headers: authorization
```

配置之后,允许前端访问authorization头,拿响应头的token

**备注:如果是打包之后(生产环境),当切换为测试环境的url,又可以获取到token(原因未知)**
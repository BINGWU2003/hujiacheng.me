---
title: Vue 3 + Vite + Sentry 监控配置指南
date: 2025-11-05
duration: 20min
type: notes
art: random
---

[[toc]]

本文档包含从零开始在 Vue 3 (Vite) 项目中接入 Sentry 的所有步骤。

## 步骤一：Sentry 平台准备 (获取 4 个关键信息)

在开始安装前，请登录 [sentry.io](https://sentry.io/) 并进入你的项目，获取以下 4 个信息：

1. **DSN (Data Source Name)**
   - **用途**：在 `main.ts` 中使用，告诉 Sentry SDK 把错误发到哪里。
   - **位置**：`[你的项目] > Settings > Client Keys (DSN)`。
2. **Auth Token (认证令牌)**
   - **用途**：在 `.env` 中使用，供 `vite.config.js` 插件上传 Source Maps 时认证。
   - **位置**：`Settings > Developer Settings > New Internal Integration`。
   - **权限**：创建时至少需要 `Project` 的 **Admin** 权限。
   - **注意**：Token **只会显示一次**，请立即复制。
3. **Org Slug (组织 Slug)**
   - **用途**：在 `.env` 中使用，告诉 Vite 插件你是哪个组织。
   - **位置**：你的 Sentry URL `https://[org-slug].sentry.io/` 的 `org-slug` 部分。
4. **Project Slug (项目 Slug)**
   - **用途**：在 `.env` 中使用，告诉 Vite 插件你要上传到哪个项目。
   - **位置**：`[你的项目] > Settings > General Settings` 中的 "Project Name"。



## 步骤二：安装 Sentry 依赖

你需要两个包：Vue 运行时 SDK 和 Vite 构建插件。

```bash
# Sentry 的 Vue SDK（用于运行时捕获错误）
pnpm add @sentry/vue

# Sentry 的 Vite 插件（用于构建时上传 Source Maps）
pnpm add -D @sentry/vite-plugin
```



## 步骤三：配置环境变量 (区分构建时与运行时)

这是非常关键的一步。你需要创建两个 `.env` 文件。

1.创建 .env 文件 (用于构建时)

此文件存放私密信息，供 vite.config.js 在 pnpm build 时读取。

代码段

```bash
# .env (此文件不应提交到 Git)

# Sentry 插件的认证 Token
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Sentry 插件的组织 Slug
SENTRY_ORG=your-sentry-organization-slug

# Sentry 插件的项目 Slug
SENTRY_PROJECT=your-sentry-project-slug

# Sentry SDK 使用的 DSN (这是公开的)
VITE_SENTRY_DSN=https://your-dsn-key@xxxx.sentry.io/xxxxxx

# 你的代码中用于判断环境的变量
VITE_MODE="production"

# APP版本号
VITE_APP_VERSION = 1.0.0
```

2.(必须) 更新 .gitignore

绝对不要将你的 SENTRY_AUTH_TOKEN 提交到 Git。

代码段

```bash
# .gitignore

# 忽略包含私密密钥的环境文件
.env
.env.*
!.env.production
!.env.development
```

## 步骤四：核心配置 `vite.config.js` (注入版本号)

这是你的 `vite.config.js`，但**增加了一个关键的 `define` 块**。这是确保 `main.ts` 能获取到版本号的核心。

```ts
// vite.config.js

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { sentryVitePlugin } from '@sentry/vite-plugin' // 引入插件

// 1. 从 package.json 读取版本号
const appVersion = process.env.npm_package_version

// https://vite.dev/config/
export default defineConfig({
  build: {
    // 2. 确保 Sourcemap 开启，Sentry 插件才有 .map 文件可传
    sourcemap: true
  },

  plugins: [
    vue(),
    vueDevTools(),
    
    // 3. Sentry 插件配置
    sentryVitePlugin({
      // 4. 从 .env 文件读取组织和项目
      org: process.env.SENTRY_ORG, 
      project: process.env.SENTRY_PROJECT, 

      // 5. 从 .env 文件读取 Auth Token
      authToken: process.env.SENTRY_AUTH_TOKEN,

      sourcemaps: {
        assets: './dist/**', // 指定查找 sourcemap 的路径
        // 6. (来自你的配置) 上传后删除
        filesToDeleteAfterUpload: './dist/**/*.map', 
      },

      // 7. 关键：定义 release ID
      // 格式必须与 main.ts 中 Sentry.init() 的 release 格式完全一致
      release: {
        name: `vue-project-sentry@${appVersion}`
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
```



## 步骤五：核心配置 `main.ts` (使用版本号)

这是你的 `main.ts` 文件。**它无需任何修改**，因为上一步的 `define` 已经为它准备好了 `VITE_APP_VERSION` 变量。

```ts
// main.ts

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import * as Sentry from '@sentry/vue'

const app = createApp(App)

// 1. VITE_MODE
if (import.meta.env.VITE_MODE === 'production') {
  
  // 2. VITE_APP_VERSION
  const appVersion = import.meta.env.VITE_APP_VERSION;

  console.log('Sentry DSN:', import.meta.env.VITE_SENTRY_DSN)
  console.log('App Version for Sentry:', appVersion) // "1.0.x"
  
  // 3. 在这里初始化 Sentry
  Sentry.init({
    app, 
    dsn: import.meta.env.VITE_SENTRY_DSN, 
    integrations: [
      Sentry.browserTracingIntegration({ router }), 
      Sentry.replayIntegration(), 
    ],

    // 4. 关键：此 release ID 格式与 vite.config.js 100% 一致
    release: `vue-project-sentry@${appVersion}`, 
    
    // 性能监控配置
    tracesSampleRate: 1.0, 
    // 会话重放配置
    replaysSessionSampleRate: 0.1, 
    replaysOnErrorSampleRate: 1.0, 
    // 区分环境
    environment: import.meta.env.VITE_MODE,
  });
}

app.use(createPinia())
app.use(router)

app.mount('#app')
```



## 步骤六：验证与测试

1. **修改版本**：修改 `package.json` 中的 `version`（例如改为 `1.1.0`）。
2. **构建**：运行 `pnpm build`。
   - **检查日志**：确认 `sentryVitePlugin` 成功上传，并显示 `release "vue-project-sentry@1.1.0"`。
3. **检查 Sentry 平台**：
   - 访问 Sentry > Releases，确认 `vue-project-sentry@1.1.0` 已创建。
   - 点击该 Release，进入 "Artifacts" (产物) 标签页，确认 `.js.map` 文件列表存在。
4. **本地预览**：运行 `pnpm preview`。
5. **触发错误**：在 `preview` 服务中打开控制台，手动触发一个错误（例如 `throw new Error('Test Error 1.1.0')`）。
6. **检查 Sentry 错误**：
   - 访问 Sentry "Issues"，等待新错误上报。
   - 点开错误详情，堆栈跟踪 (Stack Trace) 应该已**精确映射到你的 `.vue` 或 `.ts` 源码行号**。

release版本

![image-20251105135701052](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251105135701052.png)

报错信息（精确到具体的代码位置）：

![image-20251105135726606](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251105135726606.png)

上传的源代码产物（`sourcemap`）：

![image-20251105140509927](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251105140509927.png)

## 步骤七：配置邮箱告警

1. 登录 Sentry，进入你的项目。
2. 在左侧菜单点击 **Issue Alerts**。
3. 配置要发送警告的项目。
4. 保存规则。

推送配置：

![image-20251105140650730](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251105140650730.png)

警告推送到邮箱：

![image-20251105142914682](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251105142914682.png)

## demo

在线地址：https://bing-wu-vue-sentry.netlify.app/

源代码：https://github.com/BINGWU2003/vue-project-sentry

配置文档：https://docs.sentry.io/platforms/javascript/guides/vue/
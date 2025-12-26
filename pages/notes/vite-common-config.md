---
title: Vite 常用配置
date: 2025-12-26
duration: 15min
type: notes
art: plum
---

总结一些Vite的常用配置，方便后续查阅

[[toc]]

## alias 配置

vite.config.ts 配置

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "src",
    },
  },
});
```

tsconfig.json 配置

baseUrl 为项目根目录，paths 为路径别名

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

借助 vite-tsconfig-paths 插件，可以解决路径别名问题

文档:https://github.com/aleclarson/vite-tsconfig-paths

可以直接去掉 vite.config.ts 中的 resolve 配置

```ts
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
});
```

## proxy 配置

vite.config.ts 配置

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

如果不配置 rewrite，实际访问的地址为：http://localhost:3000/api/xxx

配置 rewrite 后，实际访问的地址为：http://localhost:3000/xxx

## sourcemap 配置

配合 sentry + sentry-webpack-plugin 插件使用，可以实现源代码错误追踪

插件文档:https://www.npmjs.com/package/@sentry/vite-plugin

vite 配置参考：https://hujiacheng.netlify.app/notes/vue-3-vite-sentry-monitoring-configuration-guide#%E6%AD%A5%E9%AA%A4%E5%9B%9B%EF%BC%9A%E6%A0%B8%E5%BF%83%E9%85%8D%E7%BD%AE-vite-config-js-%E6%B3%A8%E5%85%A5%E7%89%88%E6%9C%AC%E5%8F%B7

```ts
// vite.config.js

import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin"; // 引入插件

// 1. 从 package.json 读取版本号
const appVersion = process.env.npm_package_version;

// https://vite.dev/config/
export default defineConfig({
  build: {
    // 2. 确保 Sourcemap 开启，Sentry 插件才有 .map 文件可传
    sourcemap: true,
  },

  plugins: [
    // 3. Sentry 插件配置
    sentryVitePlugin({
      // 4. 从 .env 文件读取组织和项目
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,

      // 5. 从 .env 文件读取 Auth Token
      authToken: process.env.SENTRY_AUTH_TOKEN,

      sourcemaps: {
        assets: "./dist/**", // 指定查找 sourcemap 的路径
        // 6. (来自你的配置) 上传后删除
        filesToDeleteAfterUpload: "./dist/**/*.map",
      },

      // 7. 关键：定义 release ID
      // 格式必须与 main.ts 中 Sentry.init() 的 release 格式完全一致
      release: {
        name: `vue-project-sentry@${appVersion}`,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

## terserOptions 配置

terser 是用于压缩 JavaScript 代码的工具

安装 terser 插件

```bash
pnpm install terser -D
```

minify 配置项用于压缩代码，terserOptions 配置项用于配置 terser 的压缩选项

vite.config.ts 配置

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import terser from "terser";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), terser()],
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

compress 配置项用于压缩代码，drop_console 和 drop_debugger 用于删除 console.log 和 debugger 语句

## manualChunks 配置

manualChunks 配置项用于将代码分割成多个 chunk，可以提高代码的加载速度

主要是用于第三方库的分割，比如 react 和 react-dom 库，静态资源库的拆分

rollupOptions 配置项用于配置 rollup 的打包选项

vite.config.ts 配置

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import terser from "terser";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), terser()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("react") || id.includes("react-dom")) {
            return "react-libs";
          }
        },
      },
    },
  },
});
```

会把 react 和 react-dom 库分割到 react-libs 这个 chunk 中

个人文档：https://hujiacheng2003.site/notes/vite-chunk-guide

## 动态拆包

动态拆包主要是用于按需加载，比如按路由拆包，按组件拆包等

一般是通过 import() 语句来动态加载模块，比如：

```ts
import("@/utils/sum").then(({ sum }) => {
  console.log(sum(1, 2));
});
```

此时 sum 函数会被分割到 sum[hash].js 文件中

## 环境变量 env

环境变量配置在 .env 文件中，比如：

需要加前缀 VITE\_ ，否则不会被识别为环境变量

```bash
VITE_APP_TITLE=vite-project-app
VITE_APP_API_URL=http://localhost:3000
```

在代码中可以通过 import.meta.env 访问环境变量，比如：

```ts
console.log(import.meta.env.VITE_APP_TITLE);
```

配置类型提示，需要在 global.d.ts 文件中添加类型提示，比如：

```ts
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

tsconfig.json 配置

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  },
  "include": ["global.d.ts"]
}
```

或者在 tsconfig.app.json 文件中添加类型提示，比如：

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  },
  "include": ["global.d.ts"]
}
```

文档：https://cn.vite.dev/guide/env-and-mode


  * **Q: 文件生成了，但没有提示？**

      * **A:** 尝试重启 VS Code 窗口 (`Cmd/Ctrl + Shift + P` -\> `Reload Window`)。Volar 有时需要重启才能加载新的 `.d.ts` 文件。

  * **Q: 手动声明时报错 `Module 'vue' has no exported member 'GlobalComponents'`？**

      * **A:** 确保你的 Vue 版本是 3.2+。如果是旧版本或特定环境，尝试将 `declare module 'vue'` 改为 `declare module '@vue/runtime-core'`。

  * **Q: 自动生成的 `components.d.ts` 经常变动，要提交到 Git 吗？**

      * **A:** **建议提交**。这能确保团队成员拉取代码后，不需要运行项目就能立刻获得准确的类型提示，也有利于 CI/CD 环节的类型检查。

-----
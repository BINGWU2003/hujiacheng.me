---
title: Vue 3 + TypeScript 全局组件类型声明指南
date: 2025-12-09
duration: 15min
type: notes
art: plum
---

[[toc]]

## 1\. 背景与目的

在 Vue 3 项目中，使用 `app.component()` 全局注册的组件，或者通过自动引入插件使用的组件，默认情况下 IDE (VS Code + Volar/Vue Official) 无法自动推断其类型。

**配置本指南内容后，你将获得：**

  * 全局组件的 Props 智能提示。
  * 模板中的类型检查（避免传递错误的数据类型）。
  * 支持 `Cmd + 点击` 跳转到组件定义。

-----

## 2\. 解决方案

根据组件注册方式的不同，分为**自动生成**（推荐）和**手动声明**两种方案。

### 方案 A：自动生成 (推荐)

适用于使用 Vite 并配合 `unplugin-vue-components` 实现自动按需引入的项目。

1.  **安装插件**

    ```bash
    npm install unplugin-vue-components -D
    ```

2.  **配置 Vite**
    修改 `vite.config.ts`，启用 `dts` 选项：

    ```typescript
    // vite.config.ts
    import Components from 'unplugin-vue-components/vite'

    export default defineConfig({
      plugins: [
        // ...其他插件
        Components({
          // 指定类型声明文件的生成路径
          dts: 'src/types/components.d.ts', 
          // 自动搜索组件的目录
          dirs: ['src/components'],
        }),
      ],
    })
    ```

3.  **生效方式**
    运行开发服务器 (`npm run dev`)。插件会自动扫描指定目录下的组件，并在 `src/types/components.d.ts` 中生成类型定义。

-----

### 方案 B：手动声明

适用于通过 `app.component()` 手动注册的组件，或者第三方库的全局组件。

1.  **创建声明文件**
    在 `src` 目录下新建文件，例如 `src/types/global-components.d.ts`。

2.  **编写类型定义**
    利用 TypeScript 的**模块补充 (Module Augmentation)** 特性扩展 Vue 接口：

    ```typescript
    // src/types/global-components.d.ts

    // 1. 引入组件实例类型
    import MyHeader from '@/components/MyHeader.vue'
    import MyButton from '@/components/MyButton.vue'

    // 2. 扩展 vue 模块
    declare module 'vue' {
      export interface GlobalComponents {
        // 推荐同时声明大驼峰和短横线两种写法
        MyHeader: typeof MyHeader
        'my-header': typeof MyHeader
        
        MyButton: typeof MyButton
        'my-button': typeof MyButton
      }
    }

    export {} // 确保这是一个模块文件
    ```

-----

## 3\. 关键配置：tsconfig.json

无论使用方案 A 还是 B，都**必须**确保 TypeScript 编译器包含了生成的 `.d.ts` 文件。

打开根目录下的 `tsconfig.json`，检查 `include` 字段：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    // 确保 Volar 能够识别 Vue 文件的类型
    "types": ["vite/client"] 
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    // 关键点：必须包含你的声明文件路径
    // 如果你放在 src/types 下，"src/**/*.d.ts" 通常能覆盖到
    // 如果不生效，请显式添加路径，例如：
    "src/types/**/*.d.ts",
    "components.d.ts" 
  ],
  "exclude": ["node_modules"]
}
```

-----

## 4\. 验证与排错

### 如何验证配置成功？

1.  在任何 `.vue` 文件的 `<template>` 中键入全局组件名称。
2.  鼠标悬停在标签上，应显示组件的具体文件路径，而不是 `any`。
3.  输入组件属性时，IDE 应自动提示该组件定义的 Props。

### 常见问题 (FAQ)

  * **Q: 文件生成了，但没有提示？**

      * **A:** 尝试重启 VS Code 窗口 (`Cmd/Ctrl + Shift + P` -\> `Reload Window`)。Volar 有时需要重启才能加载新的 `.d.ts` 文件。

  * **Q: 手动声明时报错 `Module 'vue' has no exported member 'GlobalComponents'`？**

      * **A:** 确保你的 Vue 版本是 3.2+。如果是旧版本或特定环境，尝试将 `declare module 'vue'` 改为 `declare module '@vue/runtime-core'`。

  * **Q: 自动生成的 `components.d.ts` 经常变动，要提交到 Git 吗？**

      * **A:** **建议提交**。这能确保团队成员拉取代码后，不需要运行项目就能立刻获得准确的类型提示，也有利于 CI/CD 环节的类型检查。

-----
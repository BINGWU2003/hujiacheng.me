---
title: 作品
display: Works
description: 我的个人作品
wrapperClass: 'text-center'
art: dots
navs:
  vite-plugin:
    - name: 'vite-plugin-define-types-dts'
      link: 'https://npmx.dev/package/vite-plugin-define-types-dts'
      desc: '从 Vite define 配置生成 TypeScript 声明文件'
      icon: 'i-simple-icons-vite'
    - name: 'vite-build-monitor'
      link: 'https://npmx.dev/package/vite-build-monitor'
      desc: '监控 Vite 构建过程中的 heap 和 RSS 内存使用'
      icon: 'i-simple-icons-vite'
  mcp-server:
    - name: 'file-ref-tags-mcp'
      link: 'https://npmx.dev/package/file-ref-tags-mcp'
      desc: '为 file-ref-tags VSCode 扩展提供代码片段查询能力的 MCP 服务'
      icon: 'i-simple-icons-claude'
    - name: 'aig-mcp-server'
      link: 'https://npmx.dev/package/aig-mcp-server'
      desc: '让 AI 编程助手在改代码前自动存档，支持一键回滚并整理 Git 提交'
      icon: 'i-simple-icons-claude'
  cli:
    - name: 'bingwu-create'
      link: 'https://npmx.dev/package/bingwu-create'
      desc: '快速拉取项目模版的 CLI 工具'
      icon: 'i-ri-terminal-box-line'
  starter-templates:
    - name: 'bingwu-my-monorepo'
      link: 'https://github.com/BINGWU2003/bingwu-my-monorepo'
      desc: '基于 pnpm workspace 和 Turbo 的组件库、工具库开发启动模板'
      icon: 'i-ri-github-line'
    - name: 'starter-ts'
      link: 'https://github.com/BINGWU2003/starter-ts'
      desc: '用于 TypeScript library 开发的启动模板'
      icon: 'i-ri-github-line'
  npm-profile:
    - name: 'npm'
      link: 'https://www.npmjs.com/~hujiacheng'
      desc: '我发布在 npm 上的包'
      icon: 'i-simple-icons-npm'
    - name: 'npmx'
      link: 'https://npmx.dev/org/hujiacheng'
      desc: '我的 npmx 组织与包列表'
      icon: 'i-simple-icons-npm'
---

<!-- @layout-full-width -->

<ListNav :projects="frontmatter.navs" intro="我的个人作品" />

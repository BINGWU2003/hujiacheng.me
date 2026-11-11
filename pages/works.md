---
title: 作品
display: Works
description: 我的个人作品
wrapperClass: 'text-center'
art: dots
navs:
  mcp:
    - name: '@weekly-git-report/mcp'
      link: 'https://npmx.dev/package/@weekly-git-report/mcp'
      desc: '给支持 MCP 的 Agent/客户端提供周报相关工具的 stdio 服务'
      icon: 'i-simple-icons-modelcontextprotocol'
    - name: '@agent-git/mcp'
      link: 'https://npmx.dev/package/@agent-git/mcp'
      desc: '为 Agent-Git 的 Git checkpoint 工作流提供 MCP 适配能力'
      icon: 'i-simple-icons-modelcontextprotocol'
  cli:
    - name: 'bingwu-create'
      link: 'https://npmx.dev/package/bingwu-cli'
      desc: '快速拉取项目模版的 CLI 工具'
      icon: 'i-ri-terminal-box-line'
---

<!-- @layout-full-width -->

<ListNav :projects="frontmatter.navs" intro="我的个人作品" />

---
title: MCP-ROUTER配置
date: 2025-10-20
duration: 4min
type: notes
art: random
---
[[toc]]

## 前置工作

安装`mcp-router`：https://mcp-router.net/en

安装`mcpr-cli`：

```bash
npm install -g mcpr-cli@latest
```

检查是否安装成功

```bash
mcpr --version
```

## MCP-ROUTER配置

添加常用的`mcp-server`：

![image-20251020173019446](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251020173019446.png)

![image-20251020173249680](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251020173249680.png)

常用的配置：

`sequential thinking`：

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ]
    }
  }
}
```

`serena`：

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/oraios/serena", "serena-mcp-server"]
    }
  }
}
```

`ddg-search`：

```json
{
    "mcpServers": {
        "ddg-search": {
            "command": "uvx",
            "args": ["duckduckgo-mcp-server"]
        }
    }
}
```

`context7`：

```perl
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

playwright：

::: tip

注意，playwright最新版v0.0.42有问题，部分设备不兼容，请用v0.0.41，因此配置中需要将`@playwright/mcp@latest`改为`@playwright/mcp@0.0.41`。MCP Router若默认自带playwright，你需要手动修改`@playwright/mcp@latest`。

:::

```perl
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@0.0.41"
      ]
    }
  }
}
```

点击`Runing`启用：

![image-20251020174820765](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251020174820765.png)

## 新建MCP App Integrations并获取MCPR_TOKEN

![image-20251020173716792](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251020173716792.png)

![image-20251020173731015](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251020173731015.png)

![image-20251020173743630](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251020173743630.png)

## codex配置MCP

打开文件`config.toml`，文件位置：`.codex/config.toml`

添加如下内容：

```bash
 [mcp_servers.mcp-router]
 command = "C:\\Node\\node.exe"
 args = ["C:\\Users\\Jack\\AppData\\Roaming\\npm\\node_modules\\mcpr-cli\\dist\\mcpr.js", "connect"]
 env = { 
   SystemRoot = 'C:\WINDOWS',
   COMSPEC = 'C:\WINDOWS\system32\cmd.exe',
   MCPR_TOKEN = "你的KEY"
 }
```

### command

`nodejs`的安装路径

可以通过如下命令查看：

```bash
 where node
```

![image-20251020174213647](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251020174213647.png)

### args

`mcpr-cli`的安装路径

可以先通过如下命令找到`node_modules`：

```bash
 npm root -g
```

![image-20251020174557183](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251020174557183.png)

位于`dist`目录下：

```bash
C:\nvm4w\nodejs\node_modules\mcpr-cli\dist\mcpr.js
```

![image-20251020174617384](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251020174617384.png)

### MCPR_TOKEN

在`mcp router`里获取到的`token`：

![image-20251020174726624](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251020174726624.png)

配置成功之后可以点击`Access Control`自定义启用哪些`mcp-server`：

![image-20251020174911647](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251020174911647.png)
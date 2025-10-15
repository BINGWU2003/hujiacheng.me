---
title: uniapp内网穿透
date: 2025-10-15
duration: 5min
type: notes
art: random
---

[[toc]]

内网穿透工具使用ngrok，用来代理uniapp h5页面

## ngrok配置

官网：https://ngrok.com/

配置token：

```bash
ngrok config add-authtoken you_token
```

配置代理端口：

```
ngrok http 80
```

## uniapp配置

```json
"h5": {
   "devServer": {
       "disableHostCheck": true
   }
}
```

devServer服务器配置disableHostCheck为true，用于解决页面报错`Invalid Host header`
---
title: Vue 项目 Linux (Nginx) 部署操作文档
date: 2025-12-4
duration: 15min
type: notes
art: random
---

[[toc]]

**项目环境摘要：**

  * **服务器 IP:** `117.72.41.30`
  * **部署目录:** `/var/www/my-vue-app`
  * **前端框架:** Vue.js (SPA 模式)
  * **后端接口:** 第三方 HTTPS 接口 (`api.imooc-admin.lgdsunday.club`)
  * **Web 服务器:** Nginx

-----

## 第一阶段：本地构建与上传

### 1\. 本地打包

在您的开发机（本地电脑）项目根目录下执行构建命令，生成静态文件。

```bash
npm run build
# 构建成功后，项目根目录会生成一个 dist 文件夹
```

### 2\. 上传文件到服务器

使用 SCP 或 FTP 工具将 `dist` 文件夹内的所有内容上传到服务器指定目录。

**在本地终端执行：**

```bash
# 假设远程用户为 root，请根据实际情况替换用户名
scp -r dist/* root@117.72.41.30:/var/www/my-vue-app
```

*(注意：如果服务器上没有该目录，需先登录服务器执行 `mkdir -p /var/www/my-vue-app` 创建)*

-----

## 第二阶段：服务器环境准备

### 1\. 安装 Nginx (如果尚未安装)

登录服务器终端执行：

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS
sudo yum install nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2\. 清理默认配置 (关键)

为了防止 Nginx 加载默认的 "Welcome to nginx" 页面，建议移除默认配置。

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 3\. 设置目录权限

确保 Nginx 有权限读取静态文件，否则会报 403 Forbidden。

```bash
sudo chmod -R 755 /var/www/my-vue-app
```

-----

## 第三阶段：Nginx 核心配置 (重点)

### 1\. 创建/编辑配置文件

创建您的项目专属配置文件。**注意文件名必须以 `.conf` 结尾**。

```bash
sudo nano /etc/nginx/conf.d/my-vue-app.conf
```

### 2\. 写入配置内容

复制并粘贴以下完整配置。此配置已包含**Vue 路由刷新修复**以及**第三方 HTTPS 接口的反向代理修复**。

```nginx
server {
    listen       80;
    server_name  117.72.41.30; # 您的服务器 IP

    # ==========================================
    # 1. 前端静态文件配置
    # ==========================================
    location / {
        root   /var/www/my-vue-app; # 指向静态文件目录
        index  index.html index.htm;

        # 【核心】解决 Vue History 模式刷新变 404 的问题
        # 原理：找不到文件时，回退给 index.html 让 Vue 路由处理
        try_files $uri $uri/ /index.html;
    }

    # ==========================================
    # 2. 后端接口反向代理 (解决跨域与 HTTPS 问题)
    # ==========================================
    # 匹配路径：前端请求 /prod-api/xxx
    location /prod-api/ {
        # 转发目标：第三方 HTTPS 接口
        proxy_pass https://api.imooc-admin.lgdsunday.club/api/; 
        
        # 【关键配置】开启 SSL 服务名称验证 (解决无法连接 HTTPS 源的问题)
        proxy_ssl_server_name on;
        
        # 【关键配置】伪装 Host 头，让对方服务器以为是直接访问的域名
        proxy_set_header Host api.imooc-admin.lgdsunday.club;
        
        # 屏蔽原始 IP 头 (防止第三方接口因 IP 校验拒绝请求，视情况保留或删除)
        # proxy_set_header X-Real-IP $remote_addr;
        # proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3\. 保存并退出

  * 按 `Ctrl + O` 保存。
  * 按 `Enter` 确认文件名。
  * 按 `Ctrl + X` 退出编辑器。

-----

## 第四阶段：验证与应用

### 1\. 排除干扰文件 (常见错误)

检查配置目录下是否有意外产生的临时文件（如 `.save` 结尾），Nginx 会忽略它们或导致冲突。

```bash
# 查看目录
ls /etc/nginx/conf.d/

# 如果存在 my-vue-app.conf.save，请删除或重命名
sudo rm /etc/nginx/conf.d/my-vue-app.conf.save
```

### 2\. 检查语法

```bash
sudo nginx -t
```

  * 必须看到 `syntax is ok` 和 `test is successful` 才能继续。

### 3\. 重启 Nginx

```bash
sudo systemctl reload nginx
```

### 4\. 验证清单

1.  **访问页面：** 浏览器输入 `http://117.72.41.30`，应显示 Vue 项目首页。
2.  **刷新页面：** 进入任意子页面（如 `/user`）后刷新浏览器，不应出现 404。
3.  **测试接口：** 打开浏览器控制台 (F12) -\> Network，查看接口请求是否返回 200。

-----

## 附录：接口路径转换逻辑解析

理解 Nginx 是如何将前端请求映射到后端真实接口的：

**1. 转换示例**

  * **前端请求 (浏览器):** `http://117.72.41.30/prod-api/login`
  * **后端真实接收:** `https://api.imooc-admin.lgdsunday.club/api/login`

**2. 详细执行流程**
Nginx 处理步骤如下：

1.  **匹配 (Match):** 识别到请求路径以 `/prod-api/` 开头，进入 `location /prod-api/` 块。
2.  **截取 (Strip):** 因为 `proxy_pass` URL 结尾带有斜杠 `/`，Nginx 会自动**切除**匹配到的前缀 `/prod-api/`。
      * `.../prod-api/login`  --\> 剩下 `login`
3.  **拼接 (Append):** 将剩余部分 (`login`) 拼接到 `proxy_pass` 指定的 URL 后面。
      * `.../api/` + `login`
4.  **转发 (Forward):** 最终组合成 `.../api/login` 发送给目标服务器。

**注意：** 此机制依赖于 `proxy_pass` 结尾的斜杠 `/`。如果去掉斜杠，拼接逻辑会完全改变，导致 404。
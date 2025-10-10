---
title: Express.js 云服务器部署指南
date: 2025-10-10
duration: 15min
art: random
---

[[toc]]

本指南旨在提供一个从零开始，在云服务器上部署一个生产级别的 Express.js 应用的完整流程。我们将使用 **PM2** 作为进程管理器，**Nginx** 作为反向代理。

## 1. 准备工作 (Prerequisites)

### A. 准备 Express 项目

- **监听 Host**：确保你的项目 `app.listen` 监听的是 `0.0.0.0`，而不是 `127.0.0.1`。

  JavaScript

  ```
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
  ```

- **代码管理**：将你的项目代码托管在 Git 仓库（如 GitHub, Gitee）。

- **环境变量**：使用 `.env` 文件管理敏感信息，并确保 `.env` 已被添加到 `.gitignore` 中。

### B. 准备云服务器

- **操作系统**：推荐使用主流的 Linux 发行版，如 **Ubuntu Server**。
- **安全组/防火墙**：在你的云服务商（京东云、阿里云等）控制台，确保开放以下端口的**入站规则**：
  - `22`: SSH 远程连接端口。
  - `80`: HTTP 网站访问的标准端口。
  - `443`: HTTPS 安全访问的标准端口。

## 2. 服务器环境配置

### A. 连接服务器

```bash
ssh root@<你的服务器公网IP>
```

### B. 安装基础工具 (curl, git, nginx)

在安装其他软件之前，先更新软件包列表并安装 `curl`、`git` 和 `nginx`。其中 `curl` 用于下载 nvm 安装脚本。

```bash
sudo apt update
sudo apt install curl git nginx -y
```

### C. 安装 Node.js (使用 NVM)

```bash
# 使用 curl 下载并执行 nvm (Node Version Manager) 的安装脚本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 激活 nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 安装最新的 LTS (长期支持) 版本的 Node.js
nvm install --lts
```

## 3. 项目部署与配置

### A. 部署代码

选择一个目录（如 `/var/www`），并从 Git 仓库克隆你的项目。

```bash
cd /var/www
sudo git clone <你的项目仓库地址>
cd <你的项目目录>
```

### B. 安装依赖与编译 (关键步骤)

- **安装生产依赖**：`--production` 标志会跳过 `devDependencies`。

  ```bash
  npm install --production
  ```

- **(如果是 TypeScript 项目) 编译代码**：**此步至关重要！**

  ```bash
  npm run build
  ```

  这会根据 `tsconfig.json` 生成一个 `dist` 目录，里面是可运行的 JavaScript 文件。

### C. 配置环境变量

在服务器的项目根目录手动创建 `.env` 文件，并填入生产环境所需的配置。

```bash
nano .env
```

粘贴你的生产配置（数据库地址、密码、JWT 密钥等）并保存。

## 4. 启动与持久化运行

### A. 使用 PM2 运行应用

PM2 是一个强大的 Node.js 进程管理器，可以保证应用稳定运行。

- **全局安装 PM2**:

  ```bash
  sudo npm install pm2 -g
  ```

- (最佳实践) 使用配置文件启动：

  在项目根目录创建 ecosystem.config.js 文件。

  JavaScript

  ```
  // ecosystem.config.js
  module.exports = {
    apps: [{
      name: 'my-express-app',     // 应用名称
      // 对于 TypeScript 项目，入口是编译后的文件
      script: 'dist/app.js',       // 启动脚本路径
      instances: 1,                // 实例数量
      autorestart: true,           // 自动重启
      watch: false,                // 禁用文件监视
      max_memory_restart: '1G',    // 内存超过 1G 后重启
      env_production: {
        NODE_ENV: "production",    // 定义生产环境变量
      }
    }]
  };
  ```

- **启动应用**:

  ```bash
  pm2 start ecosystem.config.js
  ```

- **设置开机自启**:

  ```bash
  pm2 startup
  # 按照提示复制并执行生成的命令
  pm2 save
  ```

## 5. 上线与访问

### A. 配置 Nginx 反向代理

使用 Nginx 将来自公网 80 端口的请求转发到你内部运行的应用。

- **创建 Nginx 配置文件**:

  ```bash
  sudo nano /etc/nginx/sites-available/my-express-app.conf
  ```

- **粘贴以下配置**:

  Nginx

  ```
  server {
      listen 80;
      listen [::]:80;
  
      # 填写你的域名，如果没有就用服务器 IP
      server_name your_domain.com www.your_domain.com;
  
      location / {
          # 将请求转发到你 Express 应用监听的端口 (例如 3000)
          proxy_pass http://localhost:3000; 
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_cache_bypass $http_upgrade;
      }
  }
  ```

- **启用配置并重启 Nginx**:

  ```bash
  # 创建链接以启用配置
  sudo ln -s /etc/nginx/sites-available/my-express-app.conf /etc/nginx/sites-enabled/
  # (可选) 移除默认配置防止冲突
  sudo rm /etc/nginx/sites-enabled/default
  # 测试配置语法
  sudo nginx -t
  # 重启 Nginx
  sudo systemctl restart nginx
  ```

## 6. 日常维护：项目更新流程

当你的代码更新后，只需执行以下步骤：

1. SSH 登录服务器并进入项目目录。
2. 拉取最新代码：`git pull`
3. 重新安装依赖（以防有变动）：`npm install --production`
4. (如果是 TypeScript 项目) 重新编译：`npm run build`
5. 重启应用：`pm2 restart my-express-app`

------

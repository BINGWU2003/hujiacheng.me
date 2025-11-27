---
title: npmrc 配置选项
date: 2025-11-27
duration: 90min
type: notes
art: random
---

[[toc]]

## 什么是 npmrc

[npmrc](https://docs.npmjs.com/cli/v10/configuring-npm/npmrc) 是 npm 的配置文件,用于设置 npm 的行为和选项,帮助开发者:

- 🔧 **自定义配置**:配置 registry、代理、认证等
- 📦 **优化安装**:设置缓存、并发、超时等提升安装速度
- 🔐 **安全管理**:配置私有仓库认证信息
- 👥 **团队协作**:统一团队的 npm 配置
- 🚀 **提升效率**:自动化配置常用选项

```bash
# 查看所有配置
npm config list

# 查看某个配置项
npm config get registry

# 设置配置项
npm config set registry https://registry.npmmirror.com

# 删除配置项
npm config delete registry
```

:::tip 版本说明
本文档基于 **npm CLI 10.x** 编写，适用于 Node.js 18+ 环境。

**当前版本**：
- **npm CLI**: v10.9.2 (2024 年 12 月发布)
- **Node.js LTS**: v18.x, v20.x, v22.x

**主要版本历史**：
- **npm v11.x** (2024-11 开始)：新版本，包含一些破坏性变更
  - `npm init` 新增 type 提示
  - `npm publish` 默认 dist-tag 行为变更
  - `bun.lockb` 文件加入严格忽略列表
- **npm v10.x** (2023-09 至今)：当前稳定版本，推荐使用
  - 改进性能和依赖解析
  - 增强安全性
- **npm v9.x** (2022-10)：引入 `overrides` 字段支持
- **npm v8.x** (2021-10)：lockfile v3 格式
- **npm v7.x** (2020-10)：重大更新，peer dependencies 严格检查

**运行环境要求**：
- ✅ Node.js >= 18.17.0 (npm 10.x)
- ✅ Node.js >= 20.5.0 (npm 11.x)
:::

:::warning 注意事项
- 本文档主要针对 **npm 10.x**，大部分配置与 npm 11.x 兼容
- npm 7+ 对 peer dependencies 行为有重大变更，可能需要使用 `legacy-peer-deps`
- 配置文件格式为 INI 格式，不支持 JSON
- 敏感信息（如 token）建议使用环境变量而非直接写入配置文件
:::

## 配置文件

npmrc 配置有多个级别,优先级从高到低:

```bash
# 1. 项目级配置(优先级最高)
/path/to/my/project/.npmrc

# 2. 用户级配置
~/.npmrc

# 3. 全局配置
$PREFIX/etc/npmrc

# 4. npm 内置配置(优先级最低)
/path/to/npm/npmrc
```

### 配置文件格式

npmrc 使用 INI 格式:

```ini
# 注释使用 # 或 ;
registry=https://registry.npmmirror.com
save-exact=true
engine-strict=true

# 作用域配置
@mycompany:registry=https://npm.mycompany.com
```

### 配置文件优先级示例

```bash
# 项目 .npmrc
registry=https://registry.npmmirror.com

# 用户 ~/.npmrc
registry=https://registry.npmjs.org

# 实际使用的是项目配置
npm config get registry
# 输出: https://registry.npmmirror.com
```

## 一、核心配置选项

### 1.1 registry

**作用**:指定 npm 包的下载源。

```ini
registry=https://registry.npmmirror.com
```

**默认值**:`https://registry.npmjs.org/`

**常用源**:

```ini
# npm 官方源(默认)
registry=https://registry.npmjs.org/

# 淘宝镜像源(推荐国内使用)
registry=https://registry.npmmirror.com

# 腾讯云镜像源
registry=https://mirrors.cloud.tencent.com/npm/

# 华为云镜像源
registry=https://mirrors.huaweicloud.com/repository/npm/

# 公司私有源
registry=https://npm.mycompany.com
```

**影响对比**:

```bash
# ❌ 官方源(国内较慢)
registry=https://registry.npmjs.org/
npm install vue
# 下载速度: ~200KB/s

# ✅ 淘宝镜像(国内快速)
registry=https://registry.npmmirror.com
npm install vue
# 下载速度: ~2MB/s
```

**使用建议**:
- 国内项目:使用淘宝镜像
- 国际项目:使用官方源
- 企业项目:使用私有源

### 1.2 作用域配置(Scoped Packages)

**作用**:为特定作用域的包指定不同的源。

```ini
# 默认源
registry=https://registry.npmmirror.com

# @mycompany 作用域使用私有源
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=${NPM_TOKEN}

# @vue 作用域使用官方源
@vue:registry=https://registry.npmjs.org/
```

**影响对比**:

```bash
# 不同作用域使用不同源
npm install vue              # 使用淘宝镜像
npm install @mycompany/utils # 使用私有源
npm install @vue/cli         # 使用官方源
```

**使用场景**:
- 公司私有包与公开包混用
- 某些包必须从官方源下载
- 多个私有源并存

### 1.3 save-exact

**作用**:安装包时保存确切版本号,而非范围版本。

```ini
save-exact=true
```

**默认值**:`false`

**影响对比**:

```bash
# save-exact=false(默认)
npm install vue
# package.json: "vue": "^3.4.0"

# save-exact=true
npm install vue
# package.json: "vue": "3.4.0"
```

**版本号差异**:

```json
// save-exact=false
{
  "dependencies": {
    "vue": "^3.4.0"      // 允许 3.x.x 版本更新
  }
}

// save-exact=true
{
  "dependencies": {
    "vue": "3.4.0"       // 锁定确切版本
  }
}
```

**使用建议**:
- 生产环境:`true`(版本可控)
- 开发环境:`false`(获取更新)
- 库开发:`false`(兼容性更好)

### 1.4 engine-strict

**作用**:严格检查 Node.js 和 npm 版本要求。

```ini
engine-strict=true
```

**默认值**:`false`

**配合 package.json 使用**:

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=10.0.0"
  }
}
```

**影响对比**:

```bash
# engine-strict=false(默认)
# Node.js 16.x 环境
npm install
# ⚠️ 警告但继续安装

# engine-strict=true
# Node.js 16.x 环境
npm install
# ❌ 错误: Unsupported engine
```

**使用建议**:
- 严格项目:`true`
- 兼容项目:`false`
- CI/CD 环境:`true`

### 1.5 package-lock

**作用**:控制是否生成 package-lock.json。

```ini
package-lock=true
```

**默认值**:`true`

**影响对比**:

```bash
# package-lock=true(推荐)
npm install
# 生成 package-lock.json,锁定依赖版本

# package-lock=false(不推荐)
npm install
# 不生成 package-lock.json,每次安装可能版本不同
```

**使用建议**:
- 应用项目:`true`(必须)
- 库项目:`true`(推荐)
- 永远不要设为 `false`

### 1.6 production

**作用**:只安装 dependencies,不安装 devDependencies。

```ini
production=true
```

**默认值**:`false`

**影响对比**:

```bash
# production=false(默认)
npm install
# 安装所有依赖(dependencies + devDependencies)

# production=true
npm install
# 只安装生产依赖(dependencies)

# 等同于
npm install --production
npm ci --production
```

**使用场景**:
- 生产环境构建
- Docker 镜像构建
- CI/CD 部署阶段

### 1.7 ignore-scripts

**作用**:禁止运行 package.json 中的脚本。

```ini
ignore-scripts=true
```

**默认值**:`false`

**影响的脚本**:

```json
{
  "scripts": {
    "preinstall": "echo pre",
    "install": "echo install",
    "postinstall": "echo post",
    "prepublish": "echo prepublish"
  }
}
```

**影响对比**:

```bash
# ignore-scripts=false(默认)
npm install some-package
# 执行 preinstall, install, postinstall 脚本

# ignore-scripts=true
npm install some-package
# 跳过所有脚本,更安全但可能导致包不可用
```

**使用场景**:
- 安全审计
- 快速安装(跳过构建)
- 避免恶意脚本

## 二、性能优化配置

### 2.1 cache

**作用**:指定 npm 缓存目录。

```ini
cache=/path/to/npm-cache
```

**默认值**:
- Windows: `%AppData%/npm-cache`
- macOS/Linux: `~/.npm`

**使用场景**:

```ini
# CI/CD 环境自定义缓存路径
cache=.npm-cache

# 多项目共享缓存
cache=/shared/npm-cache
```

**相关命令**:

```bash
# 查看缓存路径
npm config get cache

# 清理缓存
npm cache clean --force

# 验证缓存
npm cache verify
```

### 2.2 maxsockets

**作用**:限制并发网络请求数。

```ini
maxsockets=10
```

**默认值**:`15`

**影响对比**:

```bash
# maxsockets=1(串行下载)
npm install
# 下载速度慢,但稳定

# maxsockets=50(高并发)
npm install
# 下载速度快,但可能被限流

# maxsockets=10(推荐)
npm install
# 平衡速度和稳定性
```

**使用建议**:
- 国内网络:`5-10`
- 快速网络:`15-30`
- CI/CD:`10`

### 2.3 fetch-retries

**作用**:网络请求失败时的重试次数。

```ini
fetch-retries=3
```

**默认值**:`2`

**相关配置**:

```ini
# 重试次数
fetch-retries=5

# 重试最小延迟(毫秒)
fetch-retry-mintimeout=10000

# 重试最大延迟(毫秒)
fetch-retry-maxtimeout=60000
```

**使用场景**:
- 网络不稳定:增加重试次数
- CI/CD:适当增加重试
- 本地开发:默认值即可

### 2.4 prefer-offline

**作用**:优先使用缓存,减少网络请求。

```ini
prefer-offline=true
```

**默认值**:`false`

**影响对比**:

```bash
# prefer-offline=false(默认)
npm install
# 总是检查远程版本,即使缓存存在

# prefer-offline=true
npm install
# 优先使用缓存,缓存不存在才请求网络

# prefer-offline vs offline
prefer-offline=true  # 缓存优先,缺失则请求网络
offline=true         # 完全离线,缺失则失败
```

**使用场景**:
- 频繁安装相同包
- 网络受限环境
- 加速构建

### 2.5 strict-ssl

**作用**:是否验证 SSL 证书。

```ini
strict-ssl=true
```

**默认值**:`true`

**影响对比**:

```bash
# strict-ssl=true(推荐)
npm install
# 验证 SSL 证书,更安全

# strict-ssl=false(不推荐)
npm install
# 不验证证书,可能有安全风险
```

**使用场景**:

```ini
# ⚠️ 仅在企业内网自签名证书时使用
strict-ssl=false
```

**注意**:不推荐在生产环境禁用 SSL 验证!

### 2.6 progress

**作用**:显示安装进度条。

```ini
progress=true
```

**默认值**:`true`(终端环境)

**影响对比**:

```bash
# progress=true
npm install
# [████████████████] 100%
# 显示进度条

# progress=false
npm install
# 不显示进度条,减少日志输出(CI 环境推荐)
```

## 三、依赖管理配置

### 3.1 legacy-peer-deps

**作用**:使用 npm 7 之前的 peer dependencies 行为。

```ini
legacy-peer-deps=true
```

**默认值**:`false`

**影响对比**:

```bash
# legacy-peer-deps=false(npm 7+ 默认)
npm install
# ❌ 严格检查 peer dependencies 冲突,冲突时报错

# legacy-peer-deps=true
npm install
# ✅ 忽略 peer dependencies 冲突,像 npm 6 一样
```

**使用场景**:

```bash
# 遇到 peer dependencies 冲突
npm install
# ❌ ERESOLVE unable to resolve dependency tree

# 临时解决
npm install --legacy-peer-deps

# 永久配置
legacy-peer-deps=true
```

**注意**:这是临时解决方案,应该修复依赖冲突而非长期依赖此选项。

### 3.2 auto-install-peers

**作用**:自动安装 peer dependencies。

```ini
auto-install-peers=true
```

**默认值**:`false`

**影响对比**:

```bash
# auto-install-peers=false(默认)
npm install eslint-plugin-vue
# ⚠️ 警告: eslint is a peer dependency

# auto-install-peers=true
npm install eslint-plugin-vue
# ✅ 自动安装 eslint
```

**使用建议**:
- 新项目:`true`(方便)
- 维护项目:`false`(可控)

### 3.3 save-prefix

**作用**:保存依赖时的版本前缀。

```ini
save-prefix=~
```

**默认值**:`^`

**版本前缀说明**:

```ini
# ^ (默认) - 兼容版本
save-prefix=^
# "vue": "^3.4.0" → 允许 3.x.x

# ~ - 小版本更新
save-prefix=~
# "vue": "~3.4.0" → 允许 3.4.x

# = 或留空 - 确切版本
save-prefix=
# "vue": "3.4.0" → 锁定版本
```

**影响对比**:

```json
// save-prefix=^
{
  "dependencies": {
    "vue": "^3.4.0"  // 3.4.0 ≤ version < 4.0.0
  }
}

// save-prefix=~
{
  "dependencies": {
    "vue": "~3.4.0"  // 3.4.0 ≤ version < 3.5.0
  }
}

// save-prefix= (空)
{
  "dependencies": {
    "vue": "3.4.0"   // 确切版本
  }
}
```

### 3.4 optional

**作用**:是否安装 optionalDependencies。

```ini
optional=true
```

**默认值**:`true`

**影响对比**:

```bash
# optional=true(默认)
npm install
# 尝试安装可选依赖,失败不影响主流程

# optional=false
npm install
# 跳过所有可选依赖
```

**使用场景**:
- 加速安装:设为 `false`
- 某些可选依赖导致问题:设为 `false`

## 四、身份认证配置

### 4.1 认证 Token

**作用**:配置私有 registry 的认证 token。

```ini
# 方式一:直接配置(不推荐)
//npm.mycompany.com/:_authToken=your-token-here

# 方式二:环境变量(推荐)
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
```

**使用场景**:

```bash
# 项目 .npmrc(提交到 git)
//npm.mycompany.com/:_authToken=${NPM_TOKEN}

# 用户 ~/.npmrc(本地)
//npm.mycompany.com/:_authToken=actual-token-value

# CI/CD 环境变量
export NPM_TOKEN=your-ci-token
npm install
```

**安全建议**:
- ✅ 使用环境变量
- ✅ 用户级配置
- ❌ 不要将 token 提交到 git
- ✅ 定期轮换 token

### 4.2 Basic Auth

**作用**:使用用户名密码认证。

```bash
# 使用 npm login 自动配置
npm login --registry=https://npm.mycompany.com

# 或手动配置(不推荐)
//npm.mycompany.com/:username=your-username
//npm.mycompany.com/:_password=base64-encoded-password
//npm.mycompany.com/:email=your-email
```

### 4.3 作用域认证

**作用**:为不同作用域配置不同认证。

```ini
# 公司私有包
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=${COMPANY_NPM_TOKEN}

# GitHub Packages
@github:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}

# 默认官方源(无需认证)
registry=https://registry.npmmirror.com
```

## 五、代理配置

### 5.1 HTTP/HTTPS 代理

**作用**:配置网络代理。

```ini
# HTTP 代理
proxy=http://proxy.mycompany.com:8080

# HTTPS 代理
https-proxy=http://proxy.mycompany.com:8080

# 带认证的代理
proxy=http://username:password@proxy.mycompany.com:8080
```

**影响对比**:

```bash
# 无代理
npm install
# ❌ 可能无法访问外网

# 配置代理
proxy=http://proxy.company.com:8080
npm install
# ✅ 通过代理访问外网
```

### 5.2 noproxy

**作用**:配置不使用代理的域名。

```ini
proxy=http://proxy.mycompany.com:8080
noproxy=localhost,127.0.0.1,.mycompany.com
```

**使用场景**:
- 内网域名不走代理
- 本地服务不走代理

## 六、完整推荐配置

### 6.1 国内开发环境

```ini
# .npmrc (项目根目录)

# 使用国内镜像源
registry=https://registry.npmmirror.com

# 依赖管理
save-exact=true
package-lock=true
auto-install-peers=true

# 性能优化
prefer-offline=true
maxsockets=10
fetch-retries=5

# 开发体验
progress=true
engine-strict=true

# 私有包配置
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
```

### 6.2 企业项目配置

```ini
# .npmrc (项目根目录,提交到 git)

# 公司私有源
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=${NPM_TOKEN}

# 其他包使用淘宝镜像
registry=https://registry.npmmirror.com

# 严格依赖管理
save-exact=true
engine-strict=true
package-lock=true

# 代理配置
proxy=http://proxy.mycompany.com:8080
noproxy=localhost,.mycompany.com

# 性能优化
maxsockets=10
fetch-retries=3
```

**配合 package.json**:

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=10.0.0"
  },
  "scripts": {
    "preinstall": "node -e \"if(process.env.npm_config_registry.includes('npmjs.org')){throw new Error('请使用公司镜像源')}\""
  }
}
```

### 6.3 CI/CD 环境配置

```ini
# .npmrc (CI 环境)

# 使用镜像加速
registry=https://registry.npmmirror.com

# 生产模式
production=true
ignore-scripts=false

# 性能优化
prefer-offline=false
maxsockets=20
fetch-retries=5

# 日志配置
progress=false
loglevel=warn

# 私有包认证(通过环境变量)
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
```

**CI 配置示例(GitHub Actions)**:

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Configure npm
        run: |
          echo "//npm.mycompany.com/:_authToken=${{ secrets.NPM_TOKEN }}" >> .npmrc

      - run: npm ci
      - run: npm test
      - run: npm run build
```

### 6.4 Monorepo 配置

```ini
# 根目录 .npmrc

# 工作区配置
workspaces=true

# 共享配置
registry=https://registry.npmmirror.com
save-exact=true
engine-strict=true

# 私有包
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=${NPM_TOKEN}

# 性能优化
prefer-offline=true
maxsockets=15
```

**配合 package.json**:

```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

## 七、环境变量

### 7.1 使用环境变量

npmrc 支持通过 `${VAR}` 引用环境变量:

```ini
# .npmrc
registry=https://registry.npmmirror.com
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
```

**设置环境变量**:

```bash
# Linux/macOS
export NPM_TOKEN=your-token

# Windows CMD
set NPM_TOKEN=your-token

# Windows PowerShell
$env:NPM_TOKEN="your-token"

# .env 文件(需要工具加载)
NPM_TOKEN=your-token
```

### 7.2 npm_config_ 前缀

所有配置都可以通过 `npm_config_` 前缀的环境变量设置:

```bash
# 等同于 registry=https://registry.npmmirror.com
export npm_config_registry=https://registry.npmmirror.com

# 等同于 legacy-peer-deps=true
export npm_config_legacy_peer_deps=true

npm install
```

**优先级**:环境变量 > 命令行参数 > 项目 .npmrc > 用户 ~/.npmrc

## 八、常见场景和最佳实践

### 8.1 切换镜像源

**方案一:使用 nrm(推荐)**

```bash
# 安装 nrm
npm install -g nrm

# 列出可用源
nrm ls

# 切换到淘宝源
nrm use taobao

# 测试速度
nrm test
```

**方案二:使用别名**

```bash
# ~/.bashrc 或 ~/.zshrc
alias npm-taobao='npm --registry=https://registry.npmmirror.com'
alias npm-official='npm --registry=https://registry.npmjs.org'

# 使用
npm-taobao install vue
npm-official publish
```

**方案三:配置文件**

```bash
# 临时使用
npm install --registry=https://registry.npmmirror.com

# 永久配置
npm config set registry https://registry.npmmirror.com

# 项目级配置
echo "registry=https://registry.npmmirror.com" > .npmrc
```

### 8.2 发布包到私有源

```bash
# 1. 配置私有源
npm config set @mycompany:registry https://npm.mycompany.com

# 2. 登录
npm login --registry=https://npm.mycompany.com

# 3. 发布
npm publish

# 或使用 .npmrc
# publishConfig 在 package.json 中
{
  "publishConfig": {
    "registry": "https://npm.mycompany.com"
  }
}
```

### 8.3 离线安装

```bash
# 1. 在有网环境打包
npm pack

# 2. 复制 tarball 到离线环境
scp package-1.0.0.tgz offline-server:/path

# 3. 离线环境安装
npm install ./package-1.0.0.tgz
```

**或使用 npm-bundle**:

```bash
# 1. 打包所有依赖
npm install -g npm-bundle
npm-bundle

# 2. 生成 node_modules.tar.gz
# 3. 复制到离线环境解压
tar -xzf node_modules.tar.gz
```

### 8.4 解决依赖冲突

**问题**:

```bash
npm install
# ERESOLVE unable to resolve dependency tree
```

**解决方案**:

```bash
# 方案一:使用 legacy peer deps(临时)
npm install --legacy-peer-deps

# 方案二:使用 force(不推荐)
npm install --force

# 方案三:配置 .npmrc(永久)
legacy-peer-deps=true

# 方案四:修复依赖版本(推荐)
# 查看冲突详情
npm install --legacy-peer-deps=false

# 更新冲突的包
npm update conflicting-package
```

### 8.5 加速安装

**优化配置**:

```ini
# .npmrc
# 使用国内镜像
registry=https://registry.npmmirror.com

# 优先使用缓存
prefer-offline=true

# 增加并发
maxsockets=20

# 减少重试延迟
fetch-retry-mintimeout=2000
fetch-retry-maxtimeout=10000
```

**使用 pnpm(推荐)**:

```bash
# 安装 pnpm
npm install -g pnpm

# pnpm 使用硬链接,速度更快
pnpm install
```

### 8.6 安全审计

```bash
# 检查漏洞
npm audit

# 自动修复
npm audit fix

# 强制修复(可能 breaking changes)
npm audit fix --force

# 配置 .npmrc
audit=true
audit-level=moderate  # none, low, moderate, high, critical
```

## 九、调试和问题排查

### 9.1 查看配置

```bash
# 查看所有配置
npm config list

# 查看所有配置(包括默认值)
npm config list -l

# 查看某个配置
npm config get registry

# 查看配置文件位置
npm config get userconfig  # 用户配置
npm config get globalconfig  # 全局配置
```

### 9.2 调试模式

```bash
# 详细日志
npm install --loglevel=verbose

# 调试日志
npm install --loglevel=silly

# 或配置 .npmrc
loglevel=verbose
```

### 9.3 清理和重置

```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 重置配置
npm config delete registry
npm config delete proxy
```

### 9.4 常见错误解决

**错误一:EACCES 权限错误**

```bash
# 不要使用 sudo npm install!
# 解决方案:配置 npm 全局安装目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**错误二:网络超时**

```bash
# 增加超时时间
npm config set fetch-timeout 60000

# 使用镜像源
npm config set registry https://registry.npmmirror.com

# 使用代理
npm config set proxy http://proxy:8080
```

**错误三:SSL 证书错误**

```bash
# 临时解决(不推荐)
npm config set strict-ssl false

# 正确方案:配置 CA 证书
npm config set cafile /path/to/ca.crt
```

**错误四:peer dependencies 冲突**

```bash
# 查看详细错误
npm install

# 临时解决
npm install --legacy-peer-deps

# 长期方案:更新依赖版本
```

## 十、总结

### 必须配置的选项

1. **registry** - 使用国内镜像加速
2. **save-exact** - 锁定版本号
3. **engine-strict** - 严格版本检查
4. **package-lock** - 启用锁文件(默认开启)

### 推荐工作流

1. 项目初始化时配置 `.npmrc`
2. 使用环境变量管理敏感信息
3. 提交 `.npmrc` 到 git(不包含 token)
4. CI/CD 中通过环境变量注入 token
5. 定期审计依赖安全性

### 常用命令

```bash
# 查看配置
npm config list
npm config get registry

# 设置配置
npm config set registry https://registry.npmmirror.com
npm config set save-exact true

# 删除配置
npm config delete registry

# 编辑配置文件
npm config edit

# 重置到默认值
npm config delete <key>
```

### 配置优先级

```
命令行参数 > 环境变量 > 项目 .npmrc > 用户 ~/.npmrc > 全局配置 > 默认值
```

### 学习建议

1. 从基础配置开始(registry, save-exact)
2. 根据需求逐步添加配置
3. 理解每个配置的作用和影响
4. 在项目中统一团队配置
5. 关注安全性,不要泄露 token

## 参考资源

- [npm 官方文档](https://docs.npmjs.com/cli/v10/configuring-npm/npmrc)
- [npm config 文档](https://docs.npmjs.com/cli/v10/commands/npm-config)
- [npm registry 文档](https://docs.npmjs.com/cli/v10/using-npm/registry)
- [淘宝 npm 镜像](https://npmmirror.com/)
- [nrm 源管理工具](https://github.com/Pana/nrm)
---
title: UniApp 微信小程序 CLI 自动化上传指南
date: 2026-02-09
duration: 15min
type: notes
art: plum
---

[[toc]]

本文介绍如何使用 `miniprogram-ci` 实现微信小程序的命令行自动化构建和上传，告别手动打开开发者工具上传代码的繁琐流程。

[仓库地址](https://github.com/BINGWU2003/bingwu-miniprogram/blob/main/scripts/upload-weixin.js)

## 目录

- [前置条件](#前置条件)
- [安装依赖](#安装依赖)
- [配置私钥](#配置私钥)
- [创建上传脚本](#创建上传脚本)
- [配置 npm scripts](#配置-npm-scripts)
- [使用方法](#使用方法)
- [Vite 插件优化](#vite-插件优化)
- [Netlify 自动部署](#netlify-自动部署)
- [常见问题](#常见问题)

---

## 前置条件

1. **开通代码上传权限**：登录 [微信公众平台](https://mp.weixin.qq.com) → 开发 → 开发设置 → 小程序代码上传
2. **下载代码上传密钥**：在上述页面生成并下载私钥文件
3. **配置 IP 白名单**：将你的公网 IP 添加到白名单

---

## 安装依赖

```bash
pnpm add -D miniprogram-ci
```

---

## 配置私钥

将下载的私钥文件放到项目根目录，命名格式：

```
private.{appid}.key
```

例如：`private.wxf97542ac5367bcb2.key`

> ⚠️ **安全提示**：如果私钥不提交到 Git，需要在 CI/CD 环境通过环境变量注入。

---

## 创建上传脚本

创建 `scripts/upload-weixin.js`：

```javascript
/**
 * 微信小程序 CLI 上传脚本
 *
 * 使用方法:
 *   pnpm upload:mp                                    # 版本号读取 package.json，描述使用最新 Git commit
 *   pnpm upload:mp --version=1.0.1                    # 指定版本号（覆盖 package.json）
 *   pnpm upload:mp --desc="修复bug"                   # 指定版本描述（覆盖 Git commit）
 *   pnpm upload:mp --robot=2                          # 指定机器人编号（1-30）
 *   pnpm upload:mp --version=2.0.0 --desc="重大更新"  # 组合使用多个参数
 *
 * 版本号策略: 命令行参数 > package.json version
 * 描述策略:   命令行参数 > Git 最新 commit > 默认时间戳
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import ci from 'miniprogram-ci'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

// 从 package.json 读取版本号
function getPackageVersion() {
  try {
    const pkgPath = path.resolve(ROOT_DIR, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    return pkg.version || '1.0.0'
  }
  catch {
    return '1.0.0'
  }
}

// 获取最新的 Git commit 信息
function getGitCommitMessage() {
  try {
    const message = execSync('git log -1 --pretty="%an: %s"', {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
    }).trim()
    return message || null
  }
  catch {
    return null
  }
}

// 生成默认描述
function getDefaultDesc() {
  const gitMessage = getGitCommitMessage()
  if (gitMessage) {
    return gitMessage
  }
  return `上传于 ${new Date().toLocaleString('zh-CN')}`
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2)
  const params = {
    version: null,
    desc: null,
    robot: 1,
  }

  args.forEach((arg) => {
    if (arg.startsWith('--version=')) {
      params.version = arg.split('=')[1]
    }
    else if (arg.startsWith('--desc=')) {
      params.desc = arg.split('=')[1]
    }
    else if (arg.startsWith('--robot=')) {
      params.robot = Number.parseInt(arg.split('=')[1], 10)
    }
  })

  if (!params.version) {
    params.version = getPackageVersion()
  }

  if (!params.desc) {
    params.desc = getDefaultDesc()
  }

  return params
}

// 读取环境变量
function loadEnvFile(mode = 'production') {
  const envPath = path.resolve(ROOT_DIR, 'env', `.env.${mode}`)
  const defaultEnvPath = path.resolve(ROOT_DIR, 'env', '.env')
  const envContent = {}

  // 读取 .env 文件
  ;[defaultEnvPath, envPath].forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      content.split('\n').forEach((line) => {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=')
          if (key) {
            envContent[key.trim()] = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '')
          }
        }
      })
    }
  })

  return envContent
}

// 获取私钥路径
function getPrivateKeyPath(appid) {
  const keyPatterns = [`private.${appid}.key`, 'private.key']

  for (const pattern of keyPatterns) {
    const keyPath = path.resolve(ROOT_DIR, pattern)
    if (fs.existsSync(keyPath)) {
      return keyPath
    }
  }

  throw new Error(`未找到私钥文件，请确保项目根目录存在 private.${appid}.key 文件`)
}

// 主函数
async function main() {
  console.log('\n🚀 开始微信小程序上传流程...\n')

  const params = parseArgs()
  const env = loadEnvFile('production')
  const appid = env.VITE_WX_APPID

  if (!appid) {
    throw new Error('未找到 VITE_WX_APPID 环境变量')
  }

  console.log(`📱 AppID: ${appid}`)
  console.log(`📌 版本号: ${params.version}`)
  console.log(`📝 版本描述: ${params.desc}`)
  console.log(`🤖 机器人编号: ${params.robot}`)

  const privateKeyPath = getPrivateKeyPath(appid)
  console.log(`🔑 私钥路径: ${privateKeyPath}`)

  // 构建小程序
  console.log('\n📦 正在构建小程序...\n')
  execSync('pnpm build:mp:prod', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_OPEN_DEVTOOLS: 'true', // 跳过打开开发者工具
    },
  })

  // 上传
  const projectPath = path.resolve(ROOT_DIR, 'dist', 'build', 'mp-weixin')
  console.log(`📂 项目路径: ${projectPath}`)
  console.log('\n⬆️ 正在上传到微信服务器...\n')

  const project = new ci.Project({
    appid,
    type: 'miniProgram',
    projectPath,
    privateKeyPath,
    ignores: ['node_modules/**/*'],
  })

  await ci.upload({
    project,
    version: params.version,
    desc: params.desc,
    robot: params.robot,
    setting: {
      es6: true,
      es7: true,
      minify: true,
      autoPrefixWXSS: true,
      minifyWXML: true,
      minifyWXSS: true,
      minifyJS: true,
    },
  })

  console.log('\n✅ 上传成功!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  📌 版本号: ${params.version}`)
  console.log(`  📝 描述: ${params.desc}`)
  console.log(`  🤖 机器人: ${params.robot}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n📋 下一步操作:')
  console.log('  1. 登录微信公众平台: https://mp.weixin.qq.com')
  console.log('  2. 进入 "管理 -> 版本管理"')
  console.log('  3. 在 "开发版本" 中找到刚上传的版本')
  console.log('  4. 点击 "选为体验版" 按钮\n')
}

main().catch((error) => {
  console.error('❌ 执行出错:', error)
  process.exit(1)
})
```

---

## 配置 npm scripts

在 `package.json` 中添加：

```json
{
  "scripts": {
    "upload:mp": "node ./scripts/upload-weixin.js"
  }
}
```

---

## 使用方法

### 基本用法

```bash
# 自动读取 package.json 版本号，使用最新 Git commit 作为描述
pnpm upload:mp
```

### 指定参数

```bash
# 指定版本号
pnpm upload:mp --version=1.0.1

# 指定描述
pnpm upload:mp --desc="修复登录问题"

# 指定机器人编号（1-30，用于区分不同开发者）
pnpm upload:mp --robot=2

# 组合使用
pnpm upload:mp --version=2.0.0 --desc="重大更新" --robot=2
```

### 版本管理建议

```bash
# 修复 bug
npm version patch   # 1.0.0 → 1.0.1
pnpm upload:mp

# 新增功能
npm version minor   # 1.0.1 → 1.1.0
pnpm upload:mp

# 大版本更新
npm version major   # 1.1.0 → 2.0.0
pnpm upload:mp
```

---

## Vite 插件优化

在 `vite.config.ts` 中，可以通过环境变量控制是否打开开发者工具：

```typescript
const { UNI_PLATFORM, SKIP_OPEN_DEVTOOLS } = process.env

export default defineConfig({
  plugins: [
    // 上传时跳过打开开发者工具
    SKIP_OPEN_DEVTOOLS !== 'true' && openDevTools({ mode }),
    // ... 其他插件
  ],
})
```

---

## Netlify 自动部署

### netlify.toml 配置

```toml
[build]
command = "pnpm netlify:build"
publish = "dist/build/h5"

[build.environment]
NODE_VERSION = "20"
ENABLE_MP_UPLOAD = "true"
```

### 构建脚本 (scripts/netlify-build.js)

```javascript
import { execSync } from 'node:child_process'

async function main() {
  // 1. 构建 H5
  console.log('📦 [1/2] 正在构建 H5...')
  execSync('pnpm build:h5:prod', { stdio: 'inherit' })

  // 2. 可选：上传微信小程序
  if (process.env.ENABLE_MP_UPLOAD === 'true') {
    console.log('📱 [2/2] 正在上传微信小程序...')
    execSync('pnpm upload:mp', { stdio: 'inherit' })
  }

  console.log('✅ 构建完成!')
}

main()
```

---

## 常见问题

### 1. EPERM: operation not permitted

**原因**：`pages.json` 文件被其他进程占用（如开发服务器、HBuilderX）

**解决**：关闭开发服务器后重新上传

```bash
# 先停止 pnpm dev:mp-weixin
pnpm upload:mp
```

### 2. 上传失败：无权限

**解决**：
1. 登录微信公众平台 → 开发 → 开发设置
2. 检查代码上传密钥是否正确
3. 检查 IP 白名单是否包含当前 IP

### 3. 私钥文件找不到

**解决**：确保私钥文件命名正确并放在项目根目录

```
项目根目录/
├── private.wxf97542ac5367bcb2.key  ← 私钥文件
├── package.json
└── ...
```

---

## 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--version` | 版本号 | 读取 `package.json` 的 `version` |
| `--desc` | 版本描述 | 最新 Git commit 信息 |
| `--robot` | 机器人编号（1-30） | `1` |

## Git Commit 格式说明

脚本使用以下命令获取最新 commit：

```bash
git log -1 --pretty="%an: %s"
```

| 占位符 | 含义 | 示例 |
|--------|------|------|
| `%an` | 作者名字 | `张三` |
| `%s` | 提交标题 | `feat: 新增登录功能` |

输出示例：`张三: feat: 新增登录功能`

---

## 总结

通过 `miniprogram-ci`，我们实现了：

1. ✅ 命令行一键构建上传
2. ✅ 自动读取 `package.json` 版本号
3. ✅ 自动使用 Git commit 作为版本描述
4. ✅ 支持 CI/CD 自动化部署
5. ✅ 可选打开开发者工具

这大大简化了微信小程序的发布流程，提高了开发效率！

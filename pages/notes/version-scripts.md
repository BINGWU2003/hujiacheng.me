---
title: 版本号生成与读取脚本说明
date: 2026-01-20
duration: 20min
type: notes
art: random
---

[[toc]]

项目使用自动版本号生成机制，在每次构建时自动生成唯一的版本号，用于 Sentry 错误追踪的 Release 标识。

## 版本号格式

```
YYYYMMDD.HHmm.gitHash
```

**示例**: `20260120.1613.9705c824`

| 部分 | 说明 | 示例 |
|------|------|------|
| `YYYYMMDD` | 构建日期 | `20260120` (2026年1月20日) |
| `HHmm` | 构建时间 | `1613` (16:13) |
| `gitHash` | Git 提交短 Hash | `9705c824` |

---

## 脚本说明

### 1. `scripts/generate-version.js`

**用途**: 在构建前生成版本号并写入 `.version` 文件

**执行时机**: 在 `pnpm build` 等构建命令前自动执行

**工作流程**:
```
1. 获取当前时间戳 (YYYYMMDD.HHmm)
2. 获取 Git 短 Hash (git rev-parse --short HEAD)
3. 组合生成版本号
4. 写入项目根目录的 .version 文件
```

**代码结构**:
```javascript
// 获取时间戳
function getTimestamp() {
  const now = new Date();
  // 返回格式: YYYYMMDD.HHmm
}

// 获取 Git Hash
function getGitHash() {
  // 执行: git rev-parse --short HEAD
  // 如果不在 git 仓库，返回 'local'
}

// 生成版本号
function generateVersion() {
  return `${getTimestamp()}.${getGitHash()}`;
}

// 写入文件
function writeVersionFile(version) {
  writeFileSync('.version', version);
}
```

**手动运行**:
```bash
node scripts/generate-version.js
```

**输出示例**:
```
🔧 开始生成版本号...

✅ 版本号已生成: 20260120.1613.9705c824
📁 版本文件位置: E:\code\DC_MES_WEB_SABER3\.version

📋 版本信息:
   - 时间戳: 20260120.1613
   - Git Hash: 9705c824
   - 完整版本: 20260120.1613.9705c824
```

---

### 2. `scripts/read-version.js` (CommonJS)

**用途**: 读取 `.version` 文件中的版本号

**使用场景**: `upload-sourcemap.js` 脚本中使用

**代码**:
```javascript
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

function readVersion() {
  const versionFile = join(__dirname, '..', '.version');
  if (existsSync(versionFile)) {
    return readFileSync(versionFile, 'utf-8').trim();
  }
  return 'dev'; // 文件不存在时的默认值
}

module.exports = { readVersion };
```

**使用方式**:
```javascript
const { readVersion } = require('./read-version.js');
const version = readVersion(); // '20260120.1613.9705c824'
```

---

### 3. `scripts/read-version.mjs` (ESM)

**用途**: 与 `read-version.js` 功能相同，但使用 ES Module 格式

**使用场景**: `vite.config.mjs` 中使用

**代码**:
```javascript
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export function readVersion() {
  const versionFile = join(process.cwd(), '.version');
  if (existsSync(versionFile)) {
    return readFileSync(versionFile, 'utf-8').trim();
  }
  return 'dev';
}
```

**使用方式**:
```javascript
import { readVersion } from './scripts/read-version.mjs';
const version = readVersion();
```

---

## 版本号使用位置

### 1. 前端代码 (Sentry 初始化)

通过 Vite 的 `define` 注入全局变量 `__APP_VERSION__`:

```javascript
// vite.config.mjs
define: {
  __APP_VERSION__: JSON.stringify(appVersion),
}

// src/sentry/config.js
const SENTRY_APP_VERSION = typeof __APP_VERSION__ !== 'undefined' 
  ? __APP_VERSION__ 
  : 'dev';
```

### 2. Sourcemap 上传脚本

```javascript
// scripts/upload-sourcemap.js
const { readVersion } = require('./read-version.js');
const SENTRY_APP_VERSION = readVersion();

// Sentry Release 格式: mes_web@20260120.1613.9705c824-production
const SENTRY_RELEASE = `${SENTRY_PROJECT}@${SENTRY_APP_VERSION}-${SENTRY_MODE}`;
```

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `.version` | 版本号存储文件 (已加入 .gitignore) |
| `scripts/generate-version.js` | 版本号生成脚本 |
| `scripts/read-version.js` | 版本号读取 (CommonJS) |
| `scripts/read-version.mjs` | 版本号读取 (ESM) |
| `scripts/upload-sourcemap.js` | Sourcemap 上传脚本 |
| `vite.config.mjs` | Vite 配置 (注入 __APP_VERSION__) |
| `src/sentry/config.js` | Sentry 配置 (使用 __APP_VERSION__) |

---

## package.json 脚本

```json
{
  "scripts": {
    "generate:version": "node scripts/generate-version.js",
    "build": "npm run generate:version && vite build",
    "build:prod": "npm run generate:version && vite build --mode production",
    "build:test": "npm run generate:version && vite build --mode test",
    "upload:sourcemap:prod": "node scripts/upload-sourcemap.js --mode production",
    "upload:sourcemap:test": "node scripts/upload-sourcemap.js --mode test",
    "build:prod:sourcemap": "npm run build:prod && npm run upload:sourcemap:prod",
    "build:test:sourcemap": "npm run build:test && npm run upload:sourcemap:test"
  }
}
```

---

## 流程图

```
┌─────────────────────────────────────────────────────────────┐
│                    pnpm build:prod:sourcemap                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. npm run generate:version                                 │
│     └─ 执行 generate-version.js                              │
│        └─ 生成版本号 → 写入 .version 文件                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. vite build --mode production                            │
│     └─ vite.config.mjs 读取 .version                         │
│        └─ 通过 define 注入 __APP_VERSION__ 到前端代码          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. npm run upload:sourcemap:prod                           │
│     └─ 执行 upload-sourcemap.js                              │
│        ├─ 读取 .version 获取版本号                            │
│        ├─ 创建 Sentry Release                                │
│        ├─ 关联 Git 提交记录                                   │
│        ├─ 上传 Sourcemap                                     │
│        ├─ 完成 Release                                       │
│        └─ 删除本地 Sourcemap 文件                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 常见问题

### Q: 为什么需要两个版本的 read-version？

**A**: 因为模块系统不同：
- `vite.config.mjs` 使用 ESM (`import/export`)
- `upload-sourcemap.js` 使用 CommonJS (`require/module.exports`)

### Q: .version 文件为什么要加入 .gitignore？

**A**: 因为版本号是在构建时动态生成的，每次构建都会变化，不应该提交到版本库。

### Q: 本地开发时版本号是什么？

**A**: 本地开发时 (`pnpm dev`)，版本号默认为 `'dev'`，不会读取 `.version` 文件。

---

## 附录：完整源代码

### `scripts/generate-version.js`

```javascript
#!/usr/bin/env node
/**
 * 版本号生成脚本
 * 在构建前运行，生成唯一的版本号并写入文件供后续使用
 *
 * 版本格式: YYYYMMDD.HHmm.git短hash
 * 例如: 20260119.1830.abc1234
 *
 * 使用方法:
 * 1. 构建时自动调用: pnpm build:prod (已在 package.json 中配置)
 * 2. 手动运行: node scripts/generate-version.js
 */

const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const { join } = require('path');

const rootDir = join(__dirname, '..');
const versionFile = join(rootDir, '.version');

/**
 * 获取当前时间戳
 * @returns {string} 格式: YYYYMMDD.HHmm
 */
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');

  return `${year}${month}${day}.${hour}${minute}`;
}

/**
 * 获取 Git 短 hash
 * @returns {string} Git 短 hash，如果不在 git 仓库中则返回 'local'
 */
function getGitHash() {
  try {
    const hash = execSync('git rev-parse --short HEAD', {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return hash;
  } catch {
    console.warn('⚠️  无法获取 Git hash，使用 "local" 作为标识');
    return 'local';
  }
}

/**
 * 生成版本号
 * @returns {string} 版本号，格式: YYYYMMDD.HHmm.gitHash
 */
function generateVersion() {
  const timestamp = getTimestamp();
  const gitHash = getGitHash();
  return `${timestamp}.${gitHash}`;
}

/**
 * 将版本号写入文件
 * @param {string} version 版本号
 */
function writeVersionFile(version) {
  writeFileSync(versionFile, version, 'utf-8');
  console.log(`✅ 版本号已生成: ${version}`);
  console.log(`📁 版本文件位置: ${versionFile}`);
}

function main() {
  console.log('🔧 开始生成版本号...\n');

  const version = generateVersion();
  writeVersionFile(version);

  console.log('\n📋 版本信息:');
  console.log(`   - 时间戳: ${getTimestamp()}`);
  console.log(`   - Git Hash: ${getGitHash()}`);
  console.log(`   - 完整版本: ${version}\n`);
}

main();
```

---

### `scripts/read-version.js` (CommonJS)

```javascript
/**
 * 版本号读取工具
 * 供 Vite 配置和 upload-sourcemap.js 使用
 */

const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

const rootDir = join(__dirname, '..');
const versionFile = join(rootDir, '.version');

/**
 * 读取版本号
 * @returns {string} 版本号，如果文件不存在则返回默认值
 */
function readVersion() {
  if (existsSync(versionFile)) {
    return readFileSync(versionFile, 'utf-8').trim();
  }
  console.warn('⚠️  版本文件不存在，使用默认版本号 "dev"');
  return 'dev';
}

module.exports = { readVersion };
```

---

### `scripts/read-version.mjs` (ESM)

```javascript
/**
 * 版本号读取工具 (ESM 版本)
 * 供 vite.config.mjs 使用
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * 读取版本号
 * @returns {string} 版本号，如果文件不存在则返回 'dev'
 */
export function readVersion() {
  const versionFile = join(process.cwd(), '.version');
  if (existsSync(versionFile)) {
    return readFileSync(versionFile, 'utf-8').trim();
  }
  return 'dev';
}
```

---

### `scripts/upload-sourcemap.js`

**用途**: 将构建产物的 Sourcemap 上传到 Sentry，用于错误堆栈还原

**执行时机**: 在 `pnpm build` 完成后执行

**执行流程**:

```
1. 检查 dist 目录是否存在 sourcemap 文件
2. 创建 Sentry Release
3. 关联 Git 提交记录 (Commit Integration)
4. 注入 Debug IDs
5. 上传 Sourcemap 文件
6. 完成 Release (finalize)
7. 删除本地 Sourcemap 文件 (防止源码泄露)
```

**命令行参数**:

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--mode` / `-m` | 构建模式 | `production` |
| `--help` / `-h` | 显示帮助 | - |

**使用方式**:

```bash
# 生产环境
node scripts/upload-sourcemap.js --mode production
# 或
pnpm upload:sourcemap:prod

# 测试环境
node scripts/upload-sourcemap.js --mode test
# 或
pnpm upload:sourcemap:test
```

**环境变量依赖** (从 `.env.production` 或 `.env.test` 读取):

| 变量 | 说明 |
|------|------|
| `VITE_SENTRY_AUTH_TOKEN` | Sentry API 认证令牌 |
| `VITE_SENTRY_ORG` | Sentry 组织名称 |
| `VITE_SENTRY_PROJECT` | Sentry 项目名称 |
| `VITE_SENTRY_DSN` | Sentry DSN |

**输出示例**:

```
🚀 开始上传 Sourcemap 到 Sentry

📋 配置信息:
   - 环境: production
   - 组织: yunzhi
   - 项目: mes_web
   - 版本: mes_web@20260120.1620.9705c824-production

📁 找到 42 个 sourcemap 文件

⏳ 创建 Release...
✅ 创建 Release 完成

⏳ 关联 Git 提交记录...
✅ 关联 Git 提交记录 完成

⏳ 注入 Debug IDs...
✅ 注入 Debug IDs 完成

⏳ 上传 Sourcemap...
✅ 上传 Sourcemap 完成

⏳ 完成 Release...
✅ 完成 Release 完成

🗑️  删除本地 sourcemap 文件...
✅ 已删除 42 个 sourcemap 文件

🎉 Sourcemap 上传完成！
📖 在 Sentry 项目设置 > Source Maps 中查看上传的文件
```

**完整源代码**:

```javascript
#!/usr/bin/env node
/**
 * Sentry Sourcemap 上传脚本
 * 使用 Sentry CLI 上传 sourcemap
 *
 * 使用方法：
 * 1. 构建完成后运行: node scripts/upload-sourcemap.js
 * 2. 或在 CI/CD 中: pnpm build && pnpm upload:sourcemap
 *
 * 参考文档：https://docs.sentry.io/platforms/javascript/guides/vue/sourcemaps/uploading/cli/
 */

const { execSync } = require('child_process');
const { existsSync, rmSync, readdirSync } = require('fs');
const { join } = require('path');
const { loadEnv } = require('vite'); // 使用 Vite 的 loadEnv 加载环境变量
const { readVersion } = require('./read-version.js'); // 读取生成的版本号

const rootDir = join(__dirname, '..'); // 调整为根目录
const distDir = join(rootDir, 'dist');
const assetsDir = join(distDir, 'assets');

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    mode: 'production', // 默认值
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--mode' || arg === '-m') {
      options.mode = args[i + 1];
      i++;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
📖 使用说明:
  node scripts/upload-sourcemap.js [选项]
      `);
      process.exit(0);
    }
  }

  return options;
}

const options = parseArgs();

// 加载环境变量
// 第三个参数 '' 表示加载所有环境变量，包括 VITE_ 开头的
const env = loadEnv(options.mode, rootDir, '');
Object.assign(process.env, env);

// 获取配置（直接从环境变量读取）
const sentryConfig = ({ mode }) => {
  const SENTRY_MODE = mode;
  // 从环境变量中读取配置
  const SENTRY_AUTH_TOKEN = process.env.VITE_SENTRY_AUTH_TOKEN;
  const SENTRY_ORG = process.env.VITE_SENTRY_ORG;
  const SENTRY_PROJECT = process.env.VITE_SENTRY_PROJECT;
  const SENTRY_DSN = process.env.VITE_SENTRY_DSN;

  // 使用生成的版本号 (由 generate-version.js 生成)
  const SENTRY_APP_VERSION = readVersion();

  // Release 版本格式: mes_web@20260119.1830.abc1234-production
  const SENTRY_RELEASE = `${SENTRY_PROJECT}@${SENTRY_APP_VERSION}-${SENTRY_MODE}`;

  return {
    SENTRY_AUTH_TOKEN,
    SENTRY_ORG,
    SENTRY_PROJECT,
    SENTRY_DSN,
    SENTRY_MODE,
    SENTRY_APP_VERSION,
    SENTRY_RELEASE,
  };
};

const config = sentryConfig({ mode: options.mode });

// 检查 dist 目录
function checkDistDir() {
  if (!existsSync(assetsDir)) {
    console.error('❌ 未找到 dist/assets 目录，请先运行 pnpm build');
    process.exit(1);
  }

  const mapFiles = readdirSync(assetsDir).filter(f => f.endsWith('.map'));
  if (mapFiles.length === 0) {
    console.error('❌ 未找到 sourcemap 文件，请确保构建时开启了 sourcemap');
    process.exit(1);
  }

  console.log(`📁 找到 ${mapFiles.length} 个 sourcemap 文件\n`);
}

// 执行命令
function runCommand(command, description) {
  console.log(`⏳ ${description}...`);
  try {
    execSync(command, { cwd: rootDir, stdio: 'inherit' });
    console.log(`✅ ${description} 完成\n`);
  } catch (error) {
    console.error(`❌ ${description} 失败`);
    process.exit(1);
  }
}

// 删除 sourcemap 文件
function deleteSourcemaps() {
  console.log('🗑️  删除本地 sourcemap 文件...');
  const mapFiles = readdirSync(assetsDir).filter(f => f.endsWith('.map'));
  mapFiles.forEach(file => {
    rmSync(join(assetsDir, file));
  });
  console.log(`✅ 已删除 ${mapFiles.length} 个 sourcemap 文件\n`);
}

function main() {
  console.log('🚀 开始上传 Sourcemap 到 Sentry\n');
  console.log(`📋 配置信息:`);
  console.log(`   - 环境: ${options.mode}`);
  console.log(`   - 组织: ${config.SENTRY_ORG}`);
  console.log(`   - 项目: ${config.SENTRY_PROJECT}`);
  console.log(`   - 版本: ${config.SENTRY_RELEASE}\n`);

  // 检查 token 是否存在
  if (!config.SENTRY_AUTH_TOKEN) {
    console.error('❌ 错误: Sentry Auth Token 配置缺失！');
    process.exit(1);
  }

  // 1. 检查 dist 目录
  checkDistDir();

  // 构建 sentry-cli 基础命令（注意参数顺序：全局参数 -> 子命令 -> 子命令参数）
  const authToken = `--auth-token ${config.SENTRY_AUTH_TOKEN}`;
  const orgProject = `--org ${config.SENTRY_ORG} --project ${config.SENTRY_PROJECT}`;

  // 2. 创建 Release（这样 Sentry 后台就能立即看到新版本）
  runCommand(
    `npx sentry-cli ${authToken} releases ${orgProject} new ${config.SENTRY_RELEASE}`,
    '创建 Release'
  );

  // 3. 关联 Git 提交记录 (Commit Integration)
  // 使用 --local 标志从本地 git 仓库获取提交信息
  // --ignore-missing 避免因为 rebase/squash 等操作导致的提交找不到错误
  // 参考: https://docs.sentry.io/cli/releases/#commit-integration
  runCommand(
    `npx sentry-cli ${authToken} releases ${orgProject} set-commits ${config.SENTRY_RELEASE} --local --ignore-missing`,
    '关联 Git 提交记录'
  );

  // 4. 注入 Debug IDs
  runCommand(
    `npx sentry-cli ${authToken} sourcemaps inject ./dist`,
    '注入 Debug IDs'
  );

  // 5. 上传 sourcemap
  runCommand(
    `npx sentry-cli ${authToken} sourcemaps upload ${orgProject} --release ${config.SENTRY_RELEASE} ./dist`,
    '上传 Sourcemap'
  );

  // 6. 完成 Release（标记为已部署）
  runCommand(
    `npx sentry-cli ${authToken} releases ${orgProject} finalize ${config.SENTRY_RELEASE}`,
    '完成 Release'
  );

  // 7. 删除本地 sourcemap 文件（防止泄露源码）
  deleteSourcemaps();

  console.log('🎉 Sourcemap 上传完成！');
  console.log('📖 在 Sentry 项目设置 > Source Maps 中查看上传的文件');
  console.log(`📋 配置信息:`);
  console.log(`   - 环境: ${options.mode}`);
  console.log(`   - 组织: ${config.SENTRY_ORG}`);
  console.log(`   - 项目: ${config.SENTRY_PROJECT}`);
  console.log(`   - 版本: ${config.SENTRY_RELEASE}\n`);
}

main();
```

---

## Sentry CLI 命令说明

| 命令 | 说明 |
|------|------|
| `sentry-cli releases new <release>` | 创建新的 Release |
| `sentry-cli releases set-commits <release> --local` | 关联本地 Git 提交 |
| `sentry-cli sourcemaps inject <path>` | 注入 Debug IDs 到 JS 文件 |
| `sentry-cli sourcemaps upload <path>` | 上传 Sourcemap 文件 |
| `sentry-cli releases finalize <release>` | 标记 Release 为已完成 |

**参考文档**:
- [Sentry CLI Releases](https://docs.sentry.io/cli/releases/)
- [Sentry Sourcemap Upload](https://docs.sentry.io/platforms/javascript/guides/vue/sourcemaps/uploading/cli/)
- [Commit Integration](https://docs.sentry.io/cli/releases/#commit-integration)

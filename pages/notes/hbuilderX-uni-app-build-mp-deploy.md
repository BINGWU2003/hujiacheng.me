---
title: HBuilderX uni-app 微信小程序打包部署指南
date: 2026-02-10
duration: 90min
type: notes
art: random
---

[[toc]]

本文介绍如何使用脚本打包部署 HBuilderX uni-app 微信小程序。

## 📋 目录

- [为什么使用脚本打包](#为什么使用脚本打包)
- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [环境准备](#环境准备)
- [快速开始](#快速开始)
- [npm 命令说明](#npm-命令说明)
- [配置文件说明](#配置文件说明)
- [常见问题](#常见问题)

---

## 为什么使用脚本打包

### 传统方式的痛点 😫

使用 HBuilderX 图形界面或微信开发者工具手动打包部署时，存在以下问题：

#### 1. **流程繁琐**

```
HBuilderX 中点击"发行"
  ↓
填写小程序名称、AppID 等信息
  ↓
等待构建完成
  ↓
❌ 构建可能失败但不知道原因
  ↓
手动打开微信开发者工具
  ↓
导入构建产物目录
  ↓
点击"上传"按钮
  ↓
填写版本号和描述（每次都要手动输入）
  ↓
等待上传完成
  ↓
登录微信公众平台设置体验版
```

**至少需要 7-10 个手动操作步骤！**

#### 2. **构建异步问题**

- HBuilderX CLI 构建是**异步的**
- 命令返回 ≠ 构建完成
- 如果立即上传会报错：`app.json is not found`
- 需要手动等待或重试，不确定要等多久

#### 3. **版本管理混乱**

- 版本号需要手动输入，容易出错
- 没有和 `package.json` 同步
- 团队协作时版本号容易冲突

#### 4. **描述信息低效**

- 每次都要手动填写版本描述
- 无法自动记录 Git commit 信息
- 难以追溯每个版本的具体改动

#### 5. **无法自动化**

- 无法集成到 CI/CD 流程
- 无法批量发布多个版本
- 无法在服务器上自动部署

### 使用脚本的优势 ✨

#### 1. **一键完成** 🚀

```bash
npm run upload:weixin
```

**一个命令完成所有操作！**

- ✅ 自动构建
- ✅ 智能等待构建完成
- ✅ 自动上传
- ✅ 不打开开发者工具

#### 2. **智能等待机制** ⏱️

```javascript
// 自动轮询检查 app.json 是否生成
await waitForBuild(projectPath, 60); // 最多等待 60 秒
```

- ✅ 自动检测构建完成（检测 `app.json`）
- ✅ 最多等待 60 秒，超时自动提示
- ✅ 实时显示等待进度
- ✅ 避免 "app.json not found" 错误

#### 3. **自动版本管理** 📌

```bash
# 自动从 package.json 读取版本号
npm run upload:weixin

# 或者手动指定版本号
npm run upload:weixin -- --version=1.6.7
```

- ✅ 默认读取 `package.json` 版本号
- ✅ 支持命令行参数覆盖
- ✅ 版本号统一管理，避免冲突

#### 4. **自动 Git 集成** 📝

```bash
# 自动使用最新 Git commit 作为描述
npm run upload:weixin

# 输出：
# 📝 描述: BINGWU2003: feat: 新增工单管理功能
```

- ✅ 自动读取最新 Git commit 信息
- ✅ 包含作者和提交信息
- ✅ 可追溯每个版本的改动

#### 5. **支持 CI/CD** 🔄

```bash
# 在 GitLab CI/Jenkins/GitHub Actions 中
npm run upload:weixin -- --version=1.6.7 --desc="自动发布"
```

- ✅ 可集成到 CI/CD 流程
- ✅ 支持自动化部署
- ✅ 可定时发布

#### 6. **灵活参数配置** ⚙️

```bash
# 完全自定义
npm run upload:weixin -- \
  --version=1.6.7 \
  --desc="新增功能+修复bug" \
  --robot=2
```

- ✅ 支持自定义版本号
- ✅ 支持自定义描述
- ✅ 支持多机器人（1-30）

### 效率对比

| 操作           | 传统方式           | 脚本方式       |
| -------------- | ------------------ | -------------- |
| **所需步骤**   | 7-10 步            | 1 步           |
| **所需时间**   | 3-5 分钟           | 30-60 秒       |
| **出错概率**   | 高（多次手动操作） | 低（自动化）   |
| **版本管理**   | 手动输入           | 自动同步       |
| **Git 集成**   | 需手动复制         | 自动读取       |
| **可重复执行** | 否（需重新操作）   | 是（一个命令） |
| **CI/CD 支持** | 不支持             | 完全支持       |

### 实际使用对比示例

#### 传统方式：发布版本 1.6.7

```
1. 打开 HBuilderX
2. 点击"发行" → "小程序-微信"
3. 填写小程序名称
4. 填写 AppID
5. 点击"发行"
6. 等待构建...（不知道什么时候完成）
7. 打开微信开发者工具
8. 导入项目：unpackage/dist/build/mp-weixin/
9. 点击"上传"
10. 填写版本号：1.6.7
11. 填写描述：新增工单管理功能
12. 点击"上传"
13. 等待上传完成
14. 登录微信公众平台设置体验版

总耗时：3-5 分钟
```

#### 脚本方式：发布版本 1.6.7

```bash
# 1. 更新 package.json 版本号
# 2. 提交代码
git commit -m "feat: 新增工单管理功能"

# 3. 一键上传
npm run upload:weixin

总耗时：30-60 秒
```

**效率提升：5-10 倍！**

---

## 项目概述

### 基本信息

- **项目名称**：DC-MES 小程序
- **开发工具**：HBuilderX
- **框架**：uni-app (Vue 2)
- **小程序平台**：微信小程序
- **AppID**：`wxbf93238977b19c01`

### 项目结构

```
DC_WECHAT_APPLET/
├── api/                          # API 接口
├── components/                   # 组件
├── pages/                        # 页面
├── static/                       # 静态资源
├── store/                        # Vuex 状态管理
├── utils/                        # 工具函数
├── scripts/                      # 构建脚本
│   └── upload-weixin.js         # 微信小程序上传脚本
├── unpackage/                    # 编译输出目录
│   └── dist/
│       └── build/
│           └── mp-weixin/       # 微信小程序构建产物
├── App.vue                       # 应用入口
├── main.js                       # 主入口文件
├── manifest.json                 # uni-app 配置文件
├── pages.json                    # 页面路由配置
├── package.json                  # npm 配置
└── private.wxbf93238977b19c01.key # 微信上传密钥
```

---

## 技术栈

### 核心技术

| 技术           | 版本    | 用途               |
| -------------- | ------- | ------------------ |
| uni-app        | Vue 2   | 跨平台框架         |
| Vue            | 2.x     | 前端框架           |
| HBuilderX      | 最新版  | 开发工具           |
| miniprogram-ci | ^2.1.26 | 微信小程序 CI 工具 |

### 开发依赖

```json
{
  "@bingwu/iip-ui-utils": "^1.2.15",
  "dayjs": "^1.11.13",
  "decimal.js": "^10.5.0",
  "lodash-es": "^4.17.21",
  "sm-crypto": "^0.3.13"
}
```

---

## 环境准备

### 1. 安装 HBuilderX

1. 下载 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 安装 HBuilderX CLI 工具
   - 打开 HBuilderX
   - 菜单：`工具` → `插件安装` → `cli`

3. **配置环境变量（Windows）**

   为了在命令行中直接使用 `hbuilderx` 命令，需要配置系统环境变量：

   **方法一：手动配置**
   1. 右键 `此电脑` → `属性` → `高级系统设置` → `环境变量`
   2. 在 **系统变量** 中找到 `Path`，点击 `编辑`
   3. 点击 `新建`，添加 HBuilderX 安装目录，例如：
      ```
      C:\Program Files\HBuilderX
      ```
      或
      ```
      D:\HBuilderX
      ```
   4. 点击 `确定` 保存
   5. **重启终端**（重要！）

   **方法二：使用命令（管理员权限）**
   1. 以管理员身份打开 PowerShell
   2. 执行以下命令（替换为你的实际安装路径）：
      ```powershell
      [System.Environment]::SetEnvironmentVariable(
        'Path',
        $env:Path + ';C:\Program Files\HBuilderX',
        [System.EnvironmentVariableTarget]::Machine
      )
      ```
   3. 重启终端

   **验证配置**

   打开新的终端窗口，执行：

   ```bash
   hbuilderx --version
   ```

   如果显示版本号，说明配置成功。如果提示 `'hbuilderx' 不是内部或外部命令`，请检查：
   - ✅ 路径是否正确
   - ✅ 是否已重启终端
   - ✅ HBuilderX CLI 插件是否已安装

### 2. 配置微信开发者工具

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 登录微信开发者工具
3. 设置 → 安全设置 → 开启服务端口

### 3. 获取微信上传密钥

1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 进入：`开发` → `开发管理` → `开发设置`
3. 找到 **小程序代码上传** 区域
4. 点击 **生成** 按钮生成密钥
5. 下载密钥文件（文件名格式：`private.wxAPPID.key`）
6. 将密钥文件放到项目根目录

### 4. 配置 IP 白名单

在微信公众平台的"小程序代码上传"区域，添加你的服务器/本地 IP 到白名单。

### 5. 安装 Node.js 依赖

```bash
cd DC_WECHAT_APPLET
npm install
```

---

## 快速开始

### 第一次使用（一次性配置）

#### 1. 确保密钥文件已放置

将微信小程序上传密钥 `private.wxbf93238977b19c01.key` 放到项目根目录。

#### 2. 检查 manifest.json 配置

确保 `manifest.json` 中已配置私钥路径：

```json
{
  "mp-weixin": {
    "appid": "wxbf93238977b19c01",
    "privateKeyPath": "private.wxbf93238977b19c01.key" // 必须配置
  }
}
```

#### 3. 安装依赖

```bash
npm install
```

### 日常使用：发布新版本

#### 方式一：使用默认配置（推荐）⭐

```bash
# 自动读取 package.json 版本号和 Git commit 描述
npm run upload:weixin
```

**输出示例**：

```
🚀 开始微信小程序上传流程...

📦 开始构建微信小程序...
[HBuilderX 构建输出...]
✅ HBuilderX 构建命令执行完成

⏳ 等待 HBuilderX 构建完成...
  等待中... 15/60s✅ 构建产物已就绪

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📱 AppID: wxbf93238977b19c01
  📌 版本号: 1.6.6 (来自 package.json)
  📝 描述: BINGWU2003: feat: 新增工单管理功能 (来自 Git)
  🤖 机器人: 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⬆️ 正在上传到微信服务器...
✅ 上传成功!
```

#### 方式二：自定义版本信息

```bash
# 指定版本号和描述
npm run upload:weixin -- --version=1.6.7 --desc="修复登录bug"
```

#### 方式三：仅构建不上传

```bash
# 仅构建，用于本地测试
npm run hbx:build-weixin
```

### 完整发布流程示例

```bash
# 1. 修改代码...

# 2. 更新版本号（编辑 package.json）
{
  "version": "1.6.7"
}

# 3. 提交代码
git add .
git commit -m "feat: 新增工单管理功能"

# 4. 一键上传
npm run upload:weixin

# 5. 登录微信公众平台设置体验版
#    https://mp.weixin.qq.com
```

**就这么简单！🎉**

## 打包流程

### 方式一：HBuilderX 图形化界面（传统方式）

#### 开发环境打包

1. 在 HBuilderX 中打开项目
2. 菜单：`运行` → `运行到小程序模拟器` → `微信开发者工具`
3. 会自动打开微信开发者工具并预览

**输出目录**：`unpackage/dist/dev/mp-weixin/`

#### 生产环境打包

1. 在 HBuilderX 中打开项目
2. 菜单：`发行` → `小程序-微信（仅适用于uni-app）`
3. 填写相关信息：
   - 小程序名称
   - AppID
   - 其他配置
4. 点击 **发行**

**输出目录**：`unpackage/dist/build/mp-weixin/`

### 方式二：HBuilderX CLI（命令行）

#### 开发环境打包

```bash
npm run hbx:build-weixin
```

#### 使用参数说明

```bash
hbuilderx publish --platform mp-weixin --project DC_WECHAT_APPLET --upload false --appid wxbf93238977b19c01
```

| 参数           | 说明         | 示例                             |
| -------------- | ------------ | -------------------------------- |
| `--platform`   | 发布平台     | `mp-weixin`                      |
| `--project`    | 项目名称     | `DC_WECHAT_APPLET`               |
| `--upload`     | 是否上传     | `false` / `true`                 |
| `--appid`      | 小程序 AppID | `wxbf93238977b19c01`             |
| `--privatekey` | 私钥路径     | `private.wxbf93238977b19c01.key` |

---

## 部署流程

### 方式一：HBuilderX 图形化上传

1. 完成生产环境打包
2. 在弹出的配置框中勾选 **上传到微信服务器**
3. 填写版本号和描述
4. 点击 **发行**
5. 等待上传完成

### 方式二：微信开发者工具手动上传

1. 打包完成后，打开微信开发者工具
2. 导入项目：`unpackage/dist/build/mp-weixin/`
3. 点击工具栏的 **上传** 按钮
4. 填写版本号和项目备注
5. 点击 **上传**

### 方式三：命令行自动上传（推荐）⭐

#### 一键构建+上传

```bash
npm run upload:weixin
```

**执行流程**：

1. ✅ 自动执行 HBuilderX CLI 构建
2. ✅ 等待构建完成（检测 `app.json`）
3. ✅ 使用 `miniprogram-ci` 上传到微信服务器

#### 带参数上传

```bash
# 指定版本号
npm run upload:weixin -- --version=1.0.1

# 指定版本描述
npm run upload:weixin -- --desc="修复登录bug"

# 指定机器人编号（1-30）
npm run upload:weixin -- --robot=2

# 组合使用
npm run upload:weixin -- --version=1.0.2 --desc="新增功能" --robot=1
```

#### 版本号和描述策略

| 配置项     | 优先级                                        |
| ---------- | --------------------------------------------- |
| **版本号** | 命令行参数 > `package.json` version > `1.0.0` |
| **描述**   | 命令行参数 > Git 最新 commit > 时间戳         |

---

## npm 命令说明

### 可用命令

```json
{
  "scripts": {
    "upload:weixin": "node scripts/upload-weixin.js",
    "hbx:build-weixin": "hbuilderx publish --platform mp-weixin --project DC_WECHAT_APPLET --upload false --appid wxbf93238977b19c01"
  }
}
```

### 命令详解

#### 1. `upload:weixin` - 一键构建+上传（推荐）⭐

**功能**：

- ✅ 自动执行 HBuilderX 构建
- ✅ 等待构建完成（智能检测 app.json）
- ✅ 使用 miniprogram-ci 上传到微信服务器
- ✅ 不打开微信开发者工具

**使用方法**：

```bash
# 基础用法（使用 package.json 版本号 + Git commit 描述）
npm run upload:weixin

# 指定版本号
npm run upload:weixin -- --version=1.0.1

# 指定版本描述
npm run upload:weixin -- --desc="修复登录bug"

# 指定机器人编号（1-30）
npm run upload:weixin -- --robot=2

# 组合使用
npm run upload:weixin -- --version=1.6.7 --desc="新增功能" --robot=1
```

**参数说明**：

| 参数        | 说明       | 默认值                        |
| ----------- | ---------- | ----------------------------- |
| `--version` | 版本号     | `package.json` 中的 `version` |
| `--desc`    | 版本描述   | Git 最新 commit 或当前时间戳  |
| `--robot`   | 机器人编号 | `1`                           |

#### 2. `hbx:build-weixin` - 仅构建

**功能**：

- ✅ 仅执行 HBuilderX 构建
- ✅ 不上传
- ✅ 不打开微信开发者工具

**使用场景**：

- 本地验证构建是否成功
- 手动使用微信开发者工具上传

**使用方法**：

```bash
npm run hbx:build-weixin
```

**输出目录**：`unpackage/dist/build/mp-weixin/`

### 命令对比

| 命令                 | 构建    | 上传    | 打开工具 | 推荐场景             |
| -------------------- | ------- | ------- | -------- | -------------------- |
| **upload:weixin**    | ✅ 自动 | ✅ 自动 | ❌ 否    | **日常开发/发布** ⭐ |
| **hbx:build-weixin** | ✅ 手动 | ❌ 否   | ❌ 否    | 本地测试             |

### 推荐工作流

```bash
# 日常发布流程（一步完成）
npm run upload:weixin -- --version=1.6.7 --desc="新增功能"

# 本地测试流程
npm run hbx:build-weixin
# 然后在微信开发者工具中手动预览
```

---

## 配置文件说明

### manifest.json

uni-app 应用配置文件。

#### 关键配置

```json
{
  "name": "dc-mes-app",
  "appid": "__UNI__AE3AD32",
  "mp-weixin": {
    "appid": "wxbf93238977b19c01",
    "privateKeyPath": "private.wxbf93238977b19c01.key",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "minified": true,
      "postcss": true
    }
  }
}
```

**重要字段说明**：

- `mp-weixin.appid`：微信小程序 AppID
- `mp-weixin.privateKeyPath`：上传密钥路径（必须配置，否则会报错 `41001`）
- `mp-weixin.setting`：微信小程序编译设置

### package.json

npm 项目配置文件。

```json
{
  "name": "dc-mes-app",
  "version": "1.6.6",
  "description": "DC-MES小程序",
  "type": "module"
}
```

**重要字段说明**：

- `version`：项目版本号（会被 `upload-weixin.js` 脚本读取）
- `type: "module"`：支持 ES Module 语法

### pages.json

页面路由配置文件。

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    }
  ],
  "tabBar": {
    "custom": true
  }
}
```

---

## 常见问题

### 1. 上传失败：`41001: access_token missing`

**原因**：`manifest.json` 中未配置 `privateKeyPath`。

**解决方案**：

```json
{
  "mp-weixin": {
    "appid": "wxbf93238977b19c01",
    "privateKeyPath": "private.wxbf93238977b19c01.key" // 添加此行
  }
}
```

### 2. 上传失败：`app.json is not found`

**原因**：HBuilderX 构建是异步的，构建未完成就开始上传。

**解决方案**：

使用我们的脚本会自动等待构建完成：

```bash
npm run upload:weixin
```

脚本会等待最多 60 秒，直到检测到 `app.json` 生成。

### 3. HBuilderX CLI 命令找不到

**解决方案**：

1. 确保已安装 HBuilderX CLI 插件
2. 重启终端
3. 如果还不行，手动添加 HBuilderX 到系统环境变量

### 4. 构建产物目录错误

**检查配置**：

- 开发环境：`unpackage/dist/dev/mp-weixin/`
- 生产环境：`unpackage/dist/build/mp-weixin/`

脚本默认使用生产环境路径，如需修改，编辑 `scripts/upload-weixin.js`：

```javascript
const CONFIG = {
  outputDir: "unpackage/dist/build/mp-weixin", // 修改此处
};
```

### 5. IP 白名单限制

**错误信息**：`invalid ip xxx.xxx.xxx.xxx, not in whitelist`

**解决方案**：

1. 登录微信公众平台
2. 进入：`开发` → `开发管理` → `开发设置`
3. 找到 **小程序代码上传**
4. 点击 **配置 IP 白名单**
5. 添加你的 IP 地址

### 6. Browserslist 过期警告

**警告信息**：

```
Browserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
```

**解决方案**（可选）：

```bash
npx update-browserslist-db@latest
```

此警告不影响构建和上传，可以忽略。

---

## 完整部署流程示例

### 场景：发布新版本 1.6.7

#### 1. 更新版本号

编辑 `package.json`：

```json
{
  "version": "1.6.7"
}
```

#### 2. 提交代码

```bash
git add .
git commit -m "feat: 新增工单管理功能"
git push
```

#### 3. 构建并上传

```bash
npm run upload:weixin -- --desc="新增工单管理功能"
```

**输出示例**：

```
🚀 开始微信小程序上传流程...

📦 开始构建微信小程序...

[HBuilderX 构建输出...]

✅ HBuilderX 构建命令执行完成

⏳ 等待 HBuilderX 构建完成...
  等待中... 15/60s✅ 构建产物已就绪

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📱 AppID: wxbf93238977b19c01
  📌 版本号: 1.6.7
  📝 描述: feat: 新增工单管理功能
  🤖 机器人: 1
  🔑 私钥: private.wxbf93238977b19c01.key
  📂 项目: unpackage/dist/build/mp-weixin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⬆️ 正在上传到微信服务器...

✅ 上传成功!

📋 下一步操作:
  1. 登录微信公众平台: https://mp.weixin.qq.com
  2. 进入 "管理 -> 版本管理"
  3. 在 "开发版本" 中找到刚上传的版本
  4. 点击 "选为体验版" 按钮
```

#### 4. 设置为体验版

1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 进入：`管理` → `版本管理`
3. 在 **开发版本** 中找到刚上传的版本 `1.6.7`
4. 点击 **选为体验版**
5. 扫码体验

#### 5. 提交审核

1. 在体验版测试通过后
2. 点击 **提交审核**
3. 填写审核信息
4. 等待审核通过（1-7 天）

#### 6. 发布上线

1. 审核通过后
2. 点击 **发布**
3. 版本正式上线

---

## 脚本源码

> 文件路径：`scripts/upload-weixin.js`

```javascript
/**
 * 微信小程序一键构建+上传脚本
 *
 * 功能：
 *   1. 自动执行 HBuilderX 构建（npm run hbx:build-weixin）
 *   2. 等待构建完成
 *   3. 上传到微信服务器
 *
 * 使用方法:
 *   npm run upload:weixin                              # 默认上传
 *   npm run upload:weixin -- --version=1.0.1           # 指定版本号
 *   npm run upload:weixin -- --desc="修复bug"          # 指定版本描述
 *   npm run upload:weixin -- --robot=2                 # 指定机器人编号（1-30）
 *
 * 版本号策略: 命令行参数 > package.json version > 1.0.0
 * 描述策略:   命令行参数 > Git 最新 commit > 默认时间戳
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import ci from "miniprogram-ci";

// ==================== 配置区域 ====================
const CONFIG = {
  // 微信小程序 AppID
  appid: "wxbf93238977b19c01",
  // 私钥文件名（相对于项目根目录）
  privateKeyFile: "private.wxbf93238977b19c01.key",
  // 构建输出目录（相对于项目根目录）
  outputDir: "unpackage/dist/build/mp-weixin",
  // 默认机器人编号
  defaultRobot: 1,
};
// ==============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

// 从 package.json 读取版本号
function getPackageVersion() {
  try {
    const pkgPath = path.resolve(ROOT_DIR, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return pkg.version || "1.0.0";
  } catch {
    return "1.0.0";
  }
}

// 获取最新的 Git commit 信息
function getGitCommitMessage() {
  try {
    const message = execSync('git log -1 --pretty="%an: %s"', {
      cwd: ROOT_DIR,
      encoding: "utf-8",
    }).trim();
    return message || null;
  } catch {
    return null;
  }
}

// 生成默认描述
function getDefaultDesc() {
  const gitMessage = getGitCommitMessage();
  if (gitMessage) {
    return gitMessage;
  }
  return `上传于 ${new Date().toLocaleString("zh-CN")}`;
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    version: null,
    desc: null,
    robot: CONFIG.defaultRobot,
  };

  args.forEach((arg) => {
    if (arg.startsWith("--version=")) {
      params.version = arg.split("=")[1];
    } else if (arg.startsWith("--desc=")) {
      params.desc = arg.split("=")[1];
    } else if (arg.startsWith("--robot=")) {
      params.robot = Number.parseInt(arg.split("=")[1], 10);
    }
  });

  // 如果命令行没有指定版本号，则从 package.json 读取
  if (!params.version) {
    params.version = getPackageVersion();
  }

  // 如果命令行没有指定描述，则使用默认
  if (!params.desc) {
    params.desc = getDefaultDesc();
  }

  return params;
}

// 执行 HBuilderX 构建
function buildProject() {
  console.log("\n📦 开始构建微信小程序...\n");

  try {
    execSync("npm run hbx:build-weixin", {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });
    console.log("\n✅ HBuilderX 构建命令执行完成\n");
  } catch (error) {
    console.error("\n❌ 构建失败:", error.message);
    throw new Error("HBuilderX 构建失败");
  }
}

// 等待构建完成（检查 app.json 是否存在）
async function waitForBuild(projectPath, maxWaitSeconds = 60) {
  const appJsonPath = path.resolve(projectPath, "app.json");
  const startTime = Date.now();
  const checkInterval = 1000; // 每秒检查一次

  console.log("\n⏳ 等待 HBuilderX 构建完成...\n");

  while (true) {
    if (fs.existsSync(appJsonPath)) {
      console.log("✅ 构建产物已就绪\n");
      return true;
    }

    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    if (elapsedSeconds >= maxWaitSeconds) {
      console.log(`❌ 等待超时（${maxWaitSeconds}秒），构建可能失败\n`);
      return false;
    }

    process.stdout.write(`\r  等待中... ${elapsedSeconds}/${maxWaitSeconds}s`);
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }
}

// 主函数
async function main() {
  console.log("\n🚀 开始微信小程序上传流程...\n");

  const params = parseArgs();
  const privateKeyPath = path.resolve(ROOT_DIR, CONFIG.privateKeyFile);
  const projectPath = path.resolve(ROOT_DIR, CONFIG.outputDir);

  // 检查私钥文件
  if (!fs.existsSync(privateKeyPath)) {
    throw new Error(`私钥文件不存在: ${privateKeyPath}`);
  }

  // 执行 HBuilderX 构建
  buildProject();

  // 等待构建完成（app.json 生成）
  const buildReady = await waitForBuild(projectPath);
  if (!buildReady) {
    throw new Error("构建未完成，无法上传");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  📱 AppID: ${CONFIG.appid}`);
  console.log(`  📌 版本号: ${params.version}`);
  console.log(`  📝 描述: ${params.desc}`);
  console.log(`  🤖 机器人: ${params.robot}`);
  console.log(`  🔑 私钥: ${CONFIG.privateKeyFile}`);
  console.log(`  📂 项目: ${CONFIG.outputDir}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log("\n⬆️ 正在上传到微信服务器...\n");

  const project = new ci.Project({
    appid: CONFIG.appid,
    type: "miniProgram",
    projectPath,
    privateKeyPath,
    ignores: ["node_modules/**/*"],
  });

  try {
    const uploadResult = await ci.upload({
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
      onProgressUpdate: (task) => {
        if (task._status === "done") {
          console.log(`  ✅ ${task._msg}`);
        }
      },
    });

    console.log("\n✅ 上传成功!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  📌 版本号: ${params.version}`);
    console.log(`  📝 描述: ${params.desc}`);
    console.log(`  🤖 机器人: ${params.robot}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📋 下一步操作:");
    console.log("  1. 登录微信公众平台: https://mp.weixin.qq.com");
    console.log('  2. 进入 "管理 -> 版本管理"');
    console.log('  3. 在 "开发版本" 中找到刚上传的版本');
    console.log('  4. 点击 "选为体验版" 按钮\n');

    return uploadResult;
  } catch (error) {
    console.error("\n❌ 上传失败:", error.message);
    if (
      error.message.includes("privateKeyPath") ||
      error.message.includes("access_token")
    ) {
      console.log("\n💡 提示: 请确保已在微信公众平台配置代码上传密钥");
      console.log("   1. 登录微信公众平台");
      console.log('   2. 进入 "开发 -> 开发设置"');
      console.log('   3. 在 "小程序代码上传" 区域生成并下载密钥');
      console.log('   4. 在 "小程序代码上传" 区域配置上传IP白名单');
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ 执行出错:", error);
  process.exit(1);
});
```

---

## 附录

### A. 机器人编号说明

微信小程序支持 1-30 个机器人，用于不同的上传场景：

- **机器人 1**：默认机器人，用于日常开发
- **机器人 2-30**：可用于不同环境（测试、预发布等）

### B. 相关文档链接

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [HBuilderX 文档](https://hx.dcloud.net.cn/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [miniprogram-ci 文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)

### C. Git 提交规范

建议使用约定式提交（Conventional Commits）：

```bash
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响代码运行）
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建过程或辅助工具的变动
```

示例：

```bash
git commit -m "feat: 新增工单管理模块"
git commit -m "fix: 修复登录页面闪退问题"
git commit -m "docs: 更新部署文档"
```

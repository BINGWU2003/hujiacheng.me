---
title: 日志系统说明文档
date: 2025-8-15
duration: 42min
art: random
---

[[toc]]

## 概述

本应用实现了一个完整的日志记录和管理系统，用于记录应用运行过程中的关键信息、错误和用户操作。日志系统具有自动清理、用户友好的查看界面等特性。

## 系统架构

日志系统由两个核心模块组成：

1. **日志记录模块** (`src-electron/log.js`) - 负责日志的写入和管理
2. **日志集成模块** (`src-electron/main.js`) - 负责日志功能在主应用中的集成和用户界面

## 功能特性

### 1. 自动日志文件管理

- **按日期分文件**：每天自动创建一个新的日志文件，格式为 `YYYY-MM-DD.log`
- **自动清理**：系统自动保留最近 7 天的日志文件，超过 7 天的日志文件将被自动删除
- **文件检查**：每次写入前自动检查日志文件是否存在，不存在则自动创建

### 2. 便捷的用户访问

- **托盘菜单集成**：在系统托盘右键菜单中提供日志查看选项
- **多种查看方式**：
  - 查看所有日志：打开日志文件夹，用户可查看所有历史日志
  - 查看当天日志：直接打开当天的日志文件
- **智能文件检测**：如果当天没有日志文件，会显示友好的提示信息

### 3. 渲染进程集成

- **IPC 通信**：通过 `generate-log` 通道，渲染进程可以向主进程发送日志消息
- **全应用覆盖**：前端 Vue 组件和后端 Electron 主进程都可以记录日志

## 核心实现

### 日志记录模块 (log.js)

#### 核心函数实现

**1. 检查和创建日志文件**

```javascript
function checkLogFile() {
  const filePath = `${logs}/${dayjs().format("YYYY-MM-DD")}.log`;
  return new Promise((resolve, reject) => {
    access(filePath, constants.F_OK, (err) => {
      if (err) {
        writeFile(filePath, "", (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  });
}
```

**2. 写入日志消息**

```javascript
function log(message) {
  const filePath = `${logs}/${dayjs().format("YYYY-MM-DD")}.log`;
  return new Promise((resolve, reject) => {
    checkLogFile()
      .then(() => {
        const logMessage = `${dayjs().format(
          "YYYY/MM/DD HH:mm:ss"
        )}: ${message}\n`;
        appendFile(filePath, logMessage, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      })
      .catch((err) => {
        reject(err);
      });
    deleteOldLogs();
  });
}
```

**3. 清理旧日志文件**

```javascript
function deleteOldLogs() {
  const daysToKeep = 7;
  const currentDate = dayjs();

  return new Promise((resolve, reject) => {
    readdir(logs, (err, files) => {
      if (err) {
        return reject("无法扫描目录: " + err);
      }

      files.forEach((file) => {
        // 假设文件名中包含日期，例如：2024-03-01.log
        const fileDate = dayjs(file.split(".")[0], "YYYY-MM-DD");

        if (fileDate.isBefore(currentDate.subtract(daysToKeep, "days"))) {
          const filePath = path.join(logs, file);
          unlink(filePath, (err) => {
            if (err) {
              console.error("无法删除文件 " + filePath + ": " + err);
            } else {
              console.log("已删除文件: " + filePath);
            }
          });
        }
      });

      resolve();
    });
  });
}
```

**4. 完整模块导出**

```javascript
const { app } = require("electron");
const {
  access,
  appendFile,
  constants,
  writeFile,
  unlink,
  readdir,
} = require("node:fs");
const dayjs = require("dayjs");
const path = require("path");
const logs = app.getPath("logs");

// 导出主函数
module.exports = log;
```

**特点：**

- 使用 `dayjs` 进行时间格式化
- 异步文件操作，避免阻塞主线程
- 每次写入都会触发旧日志清理
- 完整的错误处理机制
- 自动管理日志文件生命周期

### 托盘菜单集成 (main.js)

#### 托盘菜单实现

```javascript
function createTray() {
  tray = new Tray(join(__dirname, "logo.ico"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "日志",
      submenu: [
        {
          label: "查看所有日志",
          click: () => {
            shell.openPath(app.getPath("logs"));
          },
        },
        {
          label: "查看当天日志",
          click: () => {
            const logFilePath = join(
              app.getPath("logs"),
              `${dayjs().format("YYYY-MM-DD")}.log`
            );
            if (existsSync(logFilePath)) {
              shell.openPath(logFilePath);
            } else {
              dialog.showMessageBox({
                type: "warning",
                title: "日志文件不存在",
                message: "日志文件不存在，请确认是否有日志文件生成",
                buttons: ["确定"],
              });
            }
          },
        },
      ],
    },
    {
      label: "显示",
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: "退出",
      click: () => {
        log("应用退出");
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("智衣通");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    mainWindow.show();
  });
}
```

#### IPC 日志处理

```javascript
// 处理来自渲染进程的日志请求
ipcMain.handle("generate-log", (event, message) => {
  log(message);
});
```

#### 应用中的日志使用示例

```javascript
// 引入日志模块
const log = require("./log");

// 应用启动时记录日志
app.on("ready", () => {
  createWindow();
  createTray();
  log("应用启动成功");
});

// 自动更新过程中的日志记录
autoUpdater.on("checking-for-update", () => {
  log("开始检查更新...");
});

autoUpdater.on("update-available", (info) => {
  log(`发现新版本: ${info.version}`);
});

autoUpdater.on("error", (error) => {
  log(`更新检查出错: ${error.message}`);
});
```

## 使用方法

### 1. 在主进程中记录日志

```javascript
const log = require("./log");

// 记录普通信息
log("应用启动成功");

// 记录错误信息
log(`更新检查出错: ${error.message}`);

// 记录用户操作
log("用户选择立即下载更新");
```

### 2. 在渲染进程中记录日志

```javascript
// 通过IPC发送日志消息到主进程
ipcRenderer.invoke("generate-log", "用户登录成功");
```

### 3. 查看日志

用户可以通过以下方式查看日志：

1. **通过托盘菜单**：

   - 右键点击系统托盘中的应用图标
   - 选择"日志" → "查看所有日志"或"查看当天日志"

2. **直接访问文件**：
   - 日志文件位置：`app.getPath('logs')`
   - 文件命名格式：`YYYY-MM-DD.log`

## 日志格式

每条日志记录包含以下信息：

```
YYYY/MM/DD HH:mm:ss: 日志消息内容
```

**示例：**

```
2024/03/09 14:30:25: 应用启动成功
2024/03/09 14:30:26: 开始检查更新...
2024/03/09 14:30:28: 当前已是最新版本
```

## 存储位置

日志文件存储在操作系统标准的日志目录中：

- **Windows**: `%USERPROFILE%\AppData\Roaming\{app-name}\logs`
- **macOS**: `~/Library/Logs/{app-name}`
- **Linux**: `~/.config/{app-name}/logs`

## 维护策略

### 自动清理机制

- **触发时机**：每次写入日志时
- **保留策略**：保留最近 7 天的日志文件
- **清理逻辑**：比较文件名中的日期与当前日期，自动删除过期文件

### 错误处理

- **文件创建失败**：返回 Promise rejected 状态
- **写入失败**：记录错误并通过 Promise 传递
- **目录扫描失败**：在控制台输出错误信息

## 最佳实践

### 1. 日志内容建议

- **包含上下文**：记录足够的上下文信息帮助问题定位
- **使用合适的级别**：区分普通信息、警告和错误
- **避免敏感信息**：不要记录密码、token 等敏感数据

### 2. 性能考虑

- **异步操作**：所有文件操作都是异步的，不会阻塞 UI
- **适量记录**：避免过度记录导致日志文件过大
- **自动清理**：7 天自动清理策略平衡了调试需求和磁盘空间

### 3. 调试支持

- **开发环境**：可以增加更详细的调试日志
- **生产环境**：记录关键操作和错误信息
- **用户反馈**：日志可以帮助用户报告问题时提供更多信息

## 扩展建议

1. **日志级别**：可以增加不同的日志级别（INFO、WARN、ERROR）
2. **日志轮转**：可以按文件大小进行日志轮转
3. **远程日志**：可以考虑将关键日志上传到远程服务器
4. **日志分析**：可以增加日志分析和统计功能

## 故障排除

### 常见问题

1. **日志文件不存在**

   - 检查应用是否有写入权限
   - 确认日志目录是否可访问

2. **日志写入失败**

   - 检查磁盘空间是否充足
   - 确认文件是否被其他程序占用

3. **旧日志未清理**
   - 检查文件命名格式是否正确
   - 确认日期解析逻辑是否正常工作

---


---
title: express+ts+sequelize构建服务端
date: 2024-11-11
duration: 18min
art: random
---

[[toc]]

express+ts+sequelize构建服务端

## 环境搭建

- 初始化

  ```bash
  npm init
  ```

​	项目根目录会生成一个`package.json`文件

![image-20241111160417158](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20241111160417158.png)

- 安装ts

  ```bash
  npm i typescript
  ```

  

- 安装ts-node

  用于运行ts文件代码

  ```bash
  npm install ts-node
  ```

  

- 安装nodemon

  用于热更新

  ```bash
  npm i nodemon
  ```

  

- 根目录新建文件`tsconfig.json`

  添加如下内容

  ```json
  {
    "compilerOptions": {
      "module": "NodeNext", // 指定模块系统，NodeNext 表示使用 Node.js 的 ESM 模块系统。
      "moduleResolution": "node", // 指定模块解析策略，"node" 表示使用 Node.js 风格的模块解析。
      "baseUrl": "src", // 基础目录，用于解析非相对模块的导入。
      "outDir": "dist", // 指定编译输出目录，编译后的 JavaScript 文件将放在此目录中。
      "sourceMap": true, // 生成 source map 文件，便于调试。
      "noImplicitAny": true // 启用严格的类型检查，当 TypeScript 无法推断变量类型时会报错。
    },
    "include": [
      "src/**/*"
    ] // 包含 src 目录下的所有文件和子目录。
  }
  ```

  

- 根目录新建文件`nodemon.json`

  添加如下内容

  ```json
  {
      "watch": ["src"], // 监视 "src" 目录中的文件变化。
      "ext": ".ts,.js", // 监视的文件扩展名，包括 .ts 和 .js 文件。
      "exec": "ts-node ./src/index.ts" // 当监视的文件发生变化时，执行的命令，这里使用 ts-node 运行 ./src/index.ts 文件。
  }
  ```

  配置`package.json`文件中的启动命令

  `start`为启动名称

  ![image-20241111162612661](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20241111162612661.png)

  运行项目

  ```bash
  npm start
  ```

  

  

## 搭建express

安装依赖

```bash
npm i --save-dev @types/express
```

```bash
npm i --save-dev @types/compression
```

```bash
npm i --save-dev @types/cors
```


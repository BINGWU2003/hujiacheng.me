---
title: 搭建monorepo项目
date: 2025-08-31
duration: 3min
type: notes
art: random
---

[[toc]]
### 开发环境搭建

- 初始化项目

  ```bash
  pnpm init
  ```

- 根目录新增`.npmrc`文件

  内容如下

  ```
  shamefully-hoist=true
  ```

  `shamefully-hoist=true`不扁平化`node_modules`目录，方便依赖引入（使用pnpm安装的话，会默认扁平化安装目录）

- 根目录新增`pnpm-workspace.yaml`文件

  内容如下

  ```
  # 包管理在packages目录下
  packages:
    - 'packages/*'
  ```

  表示包所在的目录

  ![image-20250830230627486](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20250830230627486.png)

- 配置ts和打包

  ```bash
  pnpm install typescript esbuild minist -D -w
  ```

  `-D` 开发依赖

  `-w` 安装在根目录的`package.json`中，所有的包都可以共享此依赖

- 初始化`tsconfig.json`配置

  ```
  npx tsc --init
  ```

  配置内容如下

  ```json
  {
    "compilerOptions": {
      "outDir": "dist", // 输出的目录
      "sourceMap": true, // 采用sourcemap
      "target": "es2016", // 目标语法
      "module": "esnext", // 模块格式
      "moduleResolution": "node", // 模块解析方式
      "strict": false, // 严格模式
      "resolveJsonModule": true, // 解析json模块
      "esModuleInterop": true, // 允许通过es6语法引入commonjs模块
      "jsx": "preserve", // jsx 不转义
      "lib": ["esnext", "dom"], // 支持的类库 esnext及dom
      "baseUrl": ".", // 基础路径
      "paths": {
        "@vue/*": ["packages/*/src"] // 路径别名 支持在ts文件中通过@vue/reactivity引入reactivity包
      }
    }
  }
  ```

- 配置打包脚本

  1.配置`package.json`文件

  package文件字段解读：[地址](https://juejin.cn/post/7145001740696289317)
  
  ![image-20250830231615852](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20250830231615852.png)

​	`private:true`发布npm包的时候，不发布此包

​	`type:module`使用esm模块规范  （支持import xxx from xxx）

​	`dev`配置打包脚本。参数说明：`reactivity `包名， `-f esm` 打包格式

```json
{
  "name": "monorepo-vue",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node scripts/dev.js reactivity -f esm"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "packageManager": "pnpm@10.15.0",
  "dependencies": {
    "vue": "^3.5.20"
  },
  "devDependencies": {
    "esbuild": "^0.25.9",
    "minimist": "^1.2.8",
    "typescript": "^5.9.2"
  }
}
```

2.配置`dev.js`脚本

新增`scripts`文件夹，在文件夹新增`dev.js`文件

内容如下

```js
// 打包的脚本
// node scripts/dev.js reactivity -f esm
// reactivity 包名
// -f esm 打包的格式

// 使用esm模块规范  
// package.json =>  "type": "module",
import minimist from "minimist"
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { createRequire } from 'module'
// process.argv.slice(2) => 获取命令行参数  => ['reactivity', '-f', 'esm']
const args = minimist(process.argv.slice(2))
const target = args._[0] || 'reactivity' // 包名
const format = args.f || 'esm' // 打包的格式
// import.meta.url 获取当前文件的url
// fileURLToPath 将url转换为路径
// __filename 当前文件的路径
const __filename = fileURLToPath(import.meta.url)
// __dirname 当前文件的目录
const __dirname = dirname(__filename)
// createRequire 创建一个require函数
const require = createRequire(import.meta.url)
// 入口文件
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)
```
- 配置`packages`包

  其中文件名为包名，每个包都有自己的`package.json`文件，入口文件`index.ts`

![image-20250830233059958](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20250830233059958.png)

注意：`package.json`的文件名命名为`@xxx1/xxx2`，其中`xxx1`代表项目名称，`xxx2`代表包名称。例如`@vue/reactivity`

为了使导入包的支持这种格式，`tsconfig.json`新增配置：

```json
{
	// ...其他配置项
    "baseUrl": ".", // 基础路径
    "paths": {
      "@vue/*": ["packages/*/src"] // 路径别名 支持在ts文件中通过@vue/reactivity引入reactivity包
    }
  }
}
```

现在可以在某个包导入`packages`里的其他包

![image-20250830233631927](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20250830233631927.png)

如果要在某个里包安装`packages`里的其他包，使用命令行

```bash
pnpm install @vue/shared --workspace --filter @vue/reactivity
```

![image-20250830233937701](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20250830233937701.png)

![image-20250830234138741](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20250830234138741.png)

`pnpm-workspace`[地址](https://pnpm.io/zh/workspaces)

包`reactivity`的`node_moudles`里新增了安装的包

- 配置`esbuild`

  更新`dev.js`文件

  ```js
  // 打包的脚本
  // node scripts/dev.js reactivity -f esm
  // reactivity 包名
  // -f esm打包的格式
  
  // 使用esm模块规范  
  // package.json =>  "type": "module",
  import minimist from "minimist"
  import { fileURLToPath } from 'url'
  import { dirname, resolve } from 'path'
  import { createRequire } from 'module'
  import esbuild from 'esbuild'
  // process.argv.slice(2) => 获取命令行参数  => ['reactivity', '-f', 'esm']
  const args = minimist(process.argv.slice(2))
  const target = args._[0] || 'reactivity' // 包名
  const format = args.f || 'esm' // 打包的格式
  // import.meta.url 获取当前文件的url
  // fileURLToPath 将url转换为路径
  // __filename 当前文件的路径
  const __filename = fileURLToPath(import.meta.url)
  // __dirname 当前文件的目录
  const __dirname = dirname(__filename)
  // createRequire 创建一个require函数
  const require = createRequire(import.meta.url)
  // 入口文件
  const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)
  const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))
  // esbuild打包
  esbuild.build({
    // 入口文件
    entryPoints: [entry],
    // 输出文件
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
    // 依赖的包会打包到一起
    bundle: true,
    // 给浏览器使用
    platform: 'browser',
    // 生成sourcemap 可以调试
    sourcemap: true,
    // 打包的格式
    format, // esm cjs iife(立即执行函数)
    // 全局变量
    globalName: pkg.buildOptions?.name
  }).then(() => {
    console.log('打包成功');
  }).catch(() => {
    console.log('打包失败');
  })
  
  ```

  运行打包命令：

  ```bash
  pnpm dev
  ```

​	`dist`为输出目录，里面有输出文件，如果此包依赖`packages`里其他的包，会同时打包进来

<img src="https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20250831000227399.png" alt="image-20250831000227399" style="zoom: 50%;" />

![image-20250831000356223](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20250831000356223.png)
---
title: 使用Netlify自动化部署Vitepress
date: 2024-05-11
duration: 12min
art: random
---

[[toc]]

## 创建Netlify账号

[账号注册地址](https://app.netlify.com/signup)

## 创建一个Vitepress项目

打开cmd执行该命令创建一个vitepress项目

```sh
pnpm add -D vitepress
```

初始化项目

```sh
pnpm vitepress init
```

![image-20240511010603299](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511010603299.png?imageSlim)

运行项目

```sh
pnpm run docs:dev
```

浏览器打开此地址

![image-20240511010720916](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511010720916.png?imageSlim)

出现这个说明项目创建成功

![image-20240511010658517](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511010658517.png?imageSlim)

在项目根目录创建一个.girignore文件(用于忽略不用上传到github的文件)

.gitignore文件内容如下

```
node_modules
.DS_Store
dist-ssr
cache
dist
.cache
.temp
*.local
```

![image-20240511011435612](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511011435612.png?imageSlim)

之后把代码托管到你自己的GitHub上

![](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511011558579.png?imageSlim)

## 进入Netlify

登录账号进入Netify，点击Add new site

![image-20240511011749954](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511011749954.png?imageSlim)

选择第一个选项

![image-20240511011901898](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511011901898.png?imageSlim)

选择GitHub

![image-20240511011950258](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511011950258.png?imageSlim)

授权完毕后选择你的Vitepress项目

![image-20240511012113684](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511012113684.png?imageSlim)

输入你喜欢的网站地址

![image-20240511012225729](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511012225729.png?imageSlim)

输入构建命令和打包地址

构建命令:

```
pnpm run docs:build
```

打包地址:

```
.vitepress/dist
```

![image-20240511013145525](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511013145525.png?imageSlim)

等待部署完毕

当这里出现之前输入的网址，即部署成功

![image-20240511013258559](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511013258559.png?imageSlim)

访问一下，没有问题

![image-20240511013336428](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511013336428.png?imageSlim)

在这之后，你每次更新提交你的代码，Netlify就会自动帮你重新部署一次，让你的代码永远都是最新的
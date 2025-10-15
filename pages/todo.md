---
title: Todo List
display: ''
art: random
---

[[toc]]

<SubNav />

*你可以看到我正在做和未来要做的事*

### 博客

- 改动博客主题，加入更多的动画和交互效果
- 文章分类，标签，归档等
- 添加一些更有趣的功能

### LePlayer

[*LePlayer*](https://github.com/skyline523/LePlayer)

一个开源的音频播放器, Vue3 + TypeScript + Vite; 后续会出React和Vue 2兼容。

- [x] 时间显示
- [x] 播放和暂停
- [ ] [音量](https://github.com/skyline523/LePlayer)
- [ ] 进度条
- [ ] 进度条操作
- [ ] 播放列表
- [ ] 上一首
- [ ] 下一首
- [ ] 播放模式
- [ ] 播放器UI (底部固定模式，正常显示组件，小部件)

### monorepo 打包

在公司上的项目遇到个问题：monorepo下，多个子模块都是用 rollup 打包，打包会正常按顺序打包，但是使用 -w 命令来监听修改文件，会全部卡死在打包的过程。可能要从几种方法去做，我也还没去了解。就先列举下可能的方案了。

1. rollup打包不变，从每个子模块配置打包抽离到root统一构建，自定义配置打包配置(目前有挺多开源库都是这种方式，vue/vueuse/element-plus等等)
> https://juejin.cn/post/7225161813704097847#heading-0

2. 利用其他库使多个子模块的构建过程并行

3. 其实也是第二种方案的细分，就是用什么库了，nx/turbo ...

### 仿网易云音乐

- [x] 播放器 UI
- [x] 时间显示
- [x] 播放
- [x] 进度条相关
- [x] 上一首
- [x] 下一首
- [x] 播放模式(差心动模式)
- [x] 音量
- [x] 播放列表
- [x] 喜欢
- [ ] 播放历史

---

### 其它

- [ ] 工具库
- [ ] 工具库文档
- [ ] 组件库

### 学习

- [ ] monorepo

- [ ] docker
- [ ] nginx
- [ ] CI/CD

- [ ] nodejs

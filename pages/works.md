---
title: 作品
display: Works
description: 我的个人作品
wrapperClass: 'text-center'
art: dots
navs:
  npm 包:
    - name: 'npm'
      link: 'https://www.npmjs.com/~hujiacheng'
      desc: '我发布在 npm 上的包'
      icon: 'i-simple-icons-npm'
    - name: 'npmx'
      link: 'https://npmx.dev/org/hujiacheng'
      desc: '我的 npmx 组织与包列表'
      icon: 'i-simple-icons-npm'
---

<!-- @layout-full-width -->

<ListNav :projects="frontmatter.navs" intro="我的个人作品" />

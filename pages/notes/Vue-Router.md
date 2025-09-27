---
title: Vue-Router
date: 2024-09-08
duration: 3min
type: notes
art: random
---

[[toc]]

## Vue-Router

### 路由传参(params和query)

通过`router`的`push`方法来传参和路由跳转([官方文档](https://router.vuejs.org/zh/guide/essentials/navigation.html))

1. params(参数形式:/about/xxx/bbb)

   - 配置routes

     :xxx -> xxx相当于参数名称    

     ```js
      routes: [
         {
           path: '/about/:id/:name',
           name: 'about',
           component: () => import('../views/AboutView.vue')
         },
       ]
     ```

     注:

     - 如果`routes`没有配置参数,但跳转页面传入参数会给出警告

       `route.params`的输出为空对象

     ![image-20240908150708224](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240908150708224.png?imageSlim)

     - 如果`routes`配置了参数,但跳转页面没有传入参数会报错

       <img src="https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240908150956498.png?imageSlim" alt="image-20240908150956498" style="zoom:150%;" />

   - 跳转路由并传入参数

     `name`相当于路由名称,要跳转到哪个路由

     `params`传入的参数,`key`是配置routes时的参数名称

     ```js
     import { useRouter } from 'vue-router'
     const router = useRouter()
     const handleClick = () => {
       router.push({
         name: 'about',
         params: {
           id: 1,
           name: 'hujiacheng'
         }
       })
     }
     ```

   - 获取页面参数

     通过`route`来获取

     ```js
     import { useRoute, useRouter } from 'vue-router'
     const route = useRoute()
     console.log(route.params) // {"id": "1", "name": "hujiacheng"}
     ```

     

2. query参数(参数形式:/about?id=xxx&name=bbb)

   无需配置routes

   - 跳转页面并传入参数

     `name`相当于路由名称,要跳转到哪个路由

     `query`传入的参数,`key`是参数名称

     ```js
     import { useRouter } from 'vue-router'
     const router = useRouter()
     const handleClick = () => {
       router.push({
         name: 'about',
         query: {
           id: 1,
           name: 'hujiacheng'
         }
       })
     }
     ```

    - 获取页面参数
   
      通过`route`来获取
   
      ```js
      import { useRoute, useRouter } from 'vue-router'
      const route = useRoute()
      console.log(route.query) // {"id": "1","name": "hujiacheng"}
      ```
   
      
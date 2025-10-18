---
title: 浏览器渲染原理
date: 2025-10-18
duration: 20min
art: random
---

[[toc]]

## 浏览器是如何渲染页面的？

当浏览器的网络线程收到 HTML 文档后，会产生一个渲染任务，并将其传递给渲染主线程的消息队列。

在事件循环机制的作用下，渲染主线程取出消息队列中的渲染任务，开启渲染流程。

![课堂 ppt conv 2](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/%E8%AF%BE%E5%A0%82%20ppt%20conv%202.png)

-------

整个渲染流程分为多个阶段，分别是： HTML 解析、样式计算、布局、分层、绘制、分块、光栅化、画

每个阶段都有明确的输入输出，上一个阶段的输出会成为下一个阶段的输入。

这样，整个渲染流程就形成了一套组织严密的生产流水线。

![课堂 ppt conv 3](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/%E8%AF%BE%E5%A0%82%20ppt%20conv%203.png)

-------

渲染的第一步是**解析 HTML**。

解析过程中遇到 CSS 解析 CSS，遇到 JS 执行 JS。为了提高解析效率，浏览器在开始解析前，会启动一个预解析的线程，率先下载 HTML 中的外部 CSS 文件和 外部的 JS 文件。

如果主线程解析到`link`位置，此时外部的 CSS 文件还没有下载解析好，主线程不会等待，继续解析后续的 HTML。这是因为下载和解析 CSS 的工作是在预解析线程中进行的。这就是 CSS 不会阻塞 HTML 解析的根本原因。

![image-20251018174646163](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018174646163.png)

如果主线程解析到`script`位置，会停止解析 HTML，转而等待 JS 文件下载好，并将全局代码解析执行完成后，才能继续解析 HTML。这是因为 JS 代码的执行过程可能会修改当前的 DOM 树，所以 DOM 树的生成必须暂停。这就是 JS 会阻塞 HTML 解析的根本原因。

![image-20251018174705750](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018174705750.png)

第一步完成后，会得到 DOM 树和 CSSOM 树，浏览器的默认样式、内部样式、外部样式、行内样式均会包含在 CSSOM 树中。

![image-20251018174731637](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018174731637.png)

DOM树：

浏览器控制台执行：

```js
document
```

![image-20251018193946852](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018193946852.png)

DOM树是浏览器将HTML文档解析成的一个由节点和对象组成的树状结构，它代表了整个文档的内容和结构，并使得JavaScript等语言能够动态地访问和修改页面。

CSSOM树：

浏览器控制台执行：

```js
document.styleSheets
```

![image-20251018194531502](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018194531502.png)

CSSOM树是浏览器解析CSS样式后，根据选择器层级关系构建的、包含所有样式信息的树状结构，它与DOM树结合以确定页面中每个元素的最终渲染样式。

-------

渲染的下一步是**样式计算**。

主线程会遍历得到的 DOM 树，依次为树中的每个节点计算出它最终的样式，称之为 Computed Style。

在这一过程中，很多预设值会变成绝对值，比如`red`会变成`rgb(255,0,0)`；相对单位会变成绝对单位，比如`em`会变成`px`

这一步完成后，会得到一棵带有样式的 DOM 树。

![image-20251018174808086](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018174808086.png)

样式计算：

浏览器修改元素样式`color:red`

![image-20251018195410505](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018195410505.png)

查看计算样式：

`color:red`转换成了具体的值

![image-20251018195537219](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018195537219.png)

--------

接下来是**布局**，布局完成后会得到布局树。

布局阶段会依次遍历 DOM 树的每一个节点，计算每个节点的几何信息。例如节点的宽高、相对包含块的位置。

![image-20251018174824476](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018174824476.png)

大部分时候，DOM 树和布局树并非一一对应。

比如`display:none`的节点没有几何信息，因此不会生成到布局树；又比如使用了伪元素选择器，虽然 DOM 树中不存在这些伪元素节点，但它们拥有几何信息，所以会生成到布局树中。还有匿名行盒、匿名块盒等等都会导致 DOM 树和布局树无法一一对应。

![image-20251018174905367](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018174905367.png)

![image-20251018174926309](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018174926309.png)

-----------

下一步是**分层**

主线程会使用一套复杂的策略对整个布局树中进行分层。

分层的好处在于，将来某一个层改变后，仅会对该层进行后续处理，从而提升效率。

滚动条、堆叠上下文、transform、opacity 等样式都会或多或少的影响分层结果，也可以通过`will-change`属性更大程度的影响分层结果。

![image-20251018174951826](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018174951826.png)

浏览器：

一个代表一层

![image-20251018200330211](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018200330211.png)

---------

再下一步是**绘制**

主线程会为每个层单独产生绘制指令集，用于描述这一层的内容该如何画出来。

![image-20251018175008045](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018175008045.png)

------

完成绘制后，主线程将每个图层的绘制信息提交给合成线程，剩余工作将由合成线程完成。

![image-20251018175042891](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018175042891.png)

合成线程首先对每个图层进行分块，将其划分为更多的小区域。

![image-20251018175108383](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018175108383.png)

它会从线程池中拿取多个线程来完成分块工作。

![image-20251018175143661](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018175143661.png)

----

分块完成后，进入**光栅化**阶段。

合成线程会将块信息交给 GPU 进程，以极高的速度完成光栅化。

GPU 进程会开启多个线程来完成光栅化，并且优先处理靠近视口区域的块。

光栅化的结果，就是一块一块的位图

![image-20251018175158262](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018175158262.png)

---------

最后一个阶段就是**画**了

合成线程拿到每个层、每个块的位图后，生成一个个「指引（quad）」信息。

指引会标识出每个位图应该画到屏幕的哪个位置，以及会考虑到旋转、缩放等变形。

变形发生在合成线程，与渲染主线程无关，这就是`transform`效率高的本质原因。

合成线程会把 quad 提交给 GPU 进程，由 GPU 进程产生系统调用，提交给 GPU 硬件，完成最终的屏幕成像。

![image-20251018175210737](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018175210737.png)

## 什么是 reflow？

reflow 的本质就是重新计算 layout 树。

当进行了会影响布局树的操作后，需要重新计算布局树，会引发 layout。

为了避免连续的多次操作导致布局树反复计算，浏览器会合并这些操作，当 JS 代码全部完成后再进行统一计算。所以，改动属性造成的 reflow 是异步完成的。

也同样因为如此，当 JS 获取布局属性时，就可能造成无法获取到最新的布局信息。

浏览器在反复权衡下，最终决定获取属性立即 reflow。

![image-20251018175236113](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018175236113.png)

## 什么是 repaint？

repaint 的本质就是重新根据分层信息计算了绘制指令。

当改动了可见样式后，就需要重新计算，会引发 repaint。

由于元素的布局信息也属于可见样式，所以 reflow 一定会引起 repaint。

![image-20251018175244072](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018175244072.png)

## 为什么 transform 的效率高？

因为 transform 既不会影响布局也不会影响绘制指令，它影响的只是渲染流程的最后一个「draw」阶段

由于 draw 阶段在合成线程中，所以 transform 的变化几乎不会影响渲染主线程。反之，渲染主线程无论如何忙碌，也不会影响 transform 的变化。

![image-20251018175258739](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018175258739.png)

![image-20251018175308057](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251018175308057.png)

代码1：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>

    <style>
      .ball {
        width: 100px;
        height: 100px;
        background: #f40;
        border-radius: 50%;
        margin: 30px;
      }
      .ball1 {
        animation: move1 1s alternate infinite ease-in-out;
      }
      .ball2 {
        position: fixed;
        left: 0;
        animation: move2 1s alternate infinite ease-in-out;
      }
      @keyframes move1 {
        to {
          transform: translate(100px);
        }
      }
      @keyframes move2 {
        to {
          left: 100px;
        }
      }
    </style>
  </head>
  <body>
    <button id="btn">死循环</button>
    <div class="ball ball1"></div>
    <div class="ball ball2"></div>
    <script>
      function delay(duration) {
        var start = Date.now();
        while (Date.now() - start < duration) {}
      }
      btn.onclick = function () {
        delay(5000);
      };
    </script>
  </body>
</html>

```

代码运行时，两个小球同时都在左右平移，当点击死循环按钮，`ball2`的动画是通过直接修改`left: 100px;`来产生平移，`ball1`是动画是通过` transform: translate(100px);`来产生平移，前者`ball1`会产生发生在`draw`阶段，由**合成线程**来执行，后者`ball2`由于布局和位置发生改变，发生在`style`样式计算阶段，由**渲染主线程**来执行，当点击死循环按钮，会阻塞**渲染主线程**，导致`ball2`卡死。

总结：

| **对比项**         | **球1 (使用 transform)**                                     | **球2 (使用 left)**                                          |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **执行线程**       | **合成器线程 (Compositor Thread)**                           | **主线程 (Main Thread)**                                     |
| **渲染步骤**       | 仅需要**合成 (Composite)**                                   | 需要**重排/布局 (Layout) -> 重绘 (Paint)**                   |
| **工作原理**       | 浏览器为其创建独立图层，动画的每一帧仅由合成器线程移动图层，非常高效。 | 每一帧都需要主线程重新计算元素在页面中的位置和大小，并可能影响其他元素。 |
| **当主线程阻塞时** | 合成器线程**不受影响**，继续独立工作。                       | 主线程无法处理动画的计算和绘制任务。                         |
| **最终表现**       | **动画流畅**                                                 | **动画卡死**                                                 |

代码2：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <button id="btn">死循环</button>
    <p>
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Commodi omnis
      doloribus in corporis optio enim quia, delectus sit esse iste asperiores
      saepe placeat exercitationem? Ullam, unde vel? Molestiae a debitis facere
      nisi reiciendis deleniti? Adipisci eveniet beatae cupiditate numquam non?
      Quia excepturi consectetur officia autem eos, architecto iste veritatis
      reprehenderit quas velit optio? Vero sint ullam natus voluptatibus,
      voluptate dolorem, pariatur eaque ab quibusdam sapiente facere
      perspiciatis qui consectetur numquam delectus omnis! Ipsam dolorem
      perspiciatis ex? Ipsum minima eius aliquam, tempora amet natus possimus.
      Eveniet a necessitatibus officiis, veritatis molestias sunt neque quaerat
      eum dolores reiciendis voluptatum ex omnis repellat? Veniam temporibus
      doloribus asperiores reiciendis ipsum quisquam aliquid eius nisi. Nostrum
      officia aut laudantium dolorem, consequatur nihil, veniam tenetur tempora
      unde ipsum amet ab quae at possimus soluta doloremque maiores? Modi saepe
      est hic autem voluptatum ipsam reiciendis, eos quidem quae nulla
      voluptates repellat rerum at, suscipit omnis doloribus vero error tenetur
      molestias fugit laudantium iusto voluptas. Qui, consectetur similique quae
      itaque tempore suscipit autem! Ipsam obcaecati itaque perferendis fuga
      laboriosam, soluta a perspiciatis eos officiis consectetur eaque. Velit ea
      repudiandae consectetur fuga nesciunt ratione nam officiis. Non sapiente
      voluptate delectus officia, in sequi maiores adipisci accusamus, explicabo
      labore enim beatae perspiciatis unde consequuntur ea hic debitis ut.
      Accusantium, consectetur repudiandae maiores reprehenderit odio
      temporibus, nobis dolor consequuntur magni nemo incidunt, cum ducimus
      veritatis voluptatum eos alias illo maxime? Odit molestias laudantium
      consequuntur qui? Facilis deserunt eligendi illo quis distinctio
      necessitatibus. Dolorem, sint! Quis molestias recusandae dolores, corrupti
      eaque qui id quisquam rerum esse accusantium hic labore quae illum cum
      vero sit adipisci quod corporis illo! Amet aperiam laboriosam corporis
      laborum quo! At porro itaque esse aspernatur repellat, fugiat animi ut
      quam unde et magnam provident ex quisquam, qui nemo iusto rem? Numquam
      quas nisi vel impedit, libero quam optio maiores ullam at id, explicabo,
      perspiciatis cupiditate illo voluptas vero architecto? Animi molestias
      vero nemo dolorem nihil asperiores tempore sequi praesentium dolores
      repellendus rerum, dicta alias error repellat magnam dolor ut optio,
      quaerat assumenda beatae minima. Maiores culpa dolor, eum vitae dolore
      maxime sequi sint quasi praesentium voluptas cupiditate laboriosam saepe
      accusamus dolorem suscipit nemo qui eos. Dolorum delectus sint architecto.
      At dicta nisi accusantium reprehenderit ab dignissimos minus ratione
      reiciendis esse iusto tempora excepturi quidem, optio voluptatibus
      corporis, nam placeat quaerat laborum aperiam voluptates, atque id eveniet
      dolores. Dolores, explicabo facilis. Ipsa magni molestias quod deserunt.
      Quisquam earum quod laboriosam rem voluptatem exercitationem, commodi eum
      rerum itaque quasi corrupti qui corporis libero accusamus facilis. Eos
      reiciendis ducimus ipsum magnam quia corporis delectus veniam, velit
      excepturi facilis. Cumque omnis nemo cupiditate sapiente reprehenderit?
      Quod, esse. Fugit tempora consectetur doloremque voluptate tempore dolorum
      nihil reprehenderit ratione repellendus deserunt eius voluptatum, cum,
      nisi ullam necessitatibus eveniet maiores quaerat illum. Omnis quisquam
      debitis possimus natus! Dignissimos quisquam repellendus voluptas! Minus,
      numquam. Eveniet earum voluptates, voluptatibus vel omnis molestias magnam
      totam minima natus obcaecati eum consequuntur blanditiis atque, sunt vitae
      consequatur, reprehenderit fuga in qui. Assumenda voluptate dolorem
      corrupti ratione quibusdam natus eum fugiat obcaecati nam, eligendi
      accusantium error fugit id similique non voluptas, at animi aliquam
      quaerat velit! Natus, molestiae repudiandae alias, consequuntur cum id
      nam, sit porro dolore recusandae soluta. Neque perspiciatis quam ullam
      error soluta iusto eaque facilis nihil fuga laudantium, consectetur saepe.
      Dolores repudiandae quas soluta quos vero. Illum aspernatur hic ex sit
      assumenda. Distinctio, officiis deserunt. Nostrum enim illo quas, possimus
      quaerat minus est repudiandae rem nisi a natus molestias assumenda vitae
      dolorem accusamus libero, quidem voluptatem molestiae consequuntur magni
      dolor ratione quisquam. Ex eveniet porro laborum quod quidem, iusto
      corporis aliquid esse voluptatibus, maiores vero deserunt exercitationem
      molestiae. Dolor id doloribus sequi laudantium nam sapiente nostrum.
      Molestias veniam minus quo ea sint beatae quidem repellendus, dignissimos,
      culpa quod cum corporis quibusdam vero, totam et! Praesentium laborum
      explicabo, cum recusandae quasi eaque aperiam fugiat aliquam amet omnis
      delectus officia quod cupiditate? Voluptates consectetur natus, iste quo
      quisquam dolores. Fugiat modi nobis hic dolorum doloribus maxime velit
      maiores voluptatibus, atque perspiciatis soluta, sit impedit pariatur est
      ipsa harum illo voluptates minus facilis laboriosam eveniet laudantium.
      Veniam placeat, ullam eveniet commodi voluptas ab doloribus cumque
      sapiente corrupti illo maxime, aut quas nemo, obcaecati nesciunt
      voluptatem exercitationem expedita tempora dolor laboriosam magnam eum
      molestias? Totam vel sapiente ipsam esse veritatis sequi, ipsum quasi
      reprehenderit tempora sint fuga rerum in voluptatibus, placeat nesciunt.
      Beatae sapiente laboriosam eaque aut saepe temporibus nisi consectetur
      accusantium veniam? Quia amet odit commodi iusto cumque est consequatur
      nemo sit, repellat magni, possimus reiciendis ipsum veniam cupiditate ipsa
      ullam omnis? Perferendis, eligendi? Inventore unde illum dolore culpa
      eaque et ab quia dolores officiis repudiandae, dolorem quaerat dicta
      quidem, quibusdam officia voluptatum dignissimos. Dolorum vitae sit magni
      deserunt mollitia quasi, hic minus, ullam atque explicabo corrupti
      laudantium minima consectetur? Modi quia totam deserunt perferendis minus
      placeat cupiditate quam, expedita itaque quod facilis debitis quaerat enim
      amet ipsam saepe rem consectetur, voluptates perspiciatis reiciendis
      provident voluptate et quos. Minima, voluptates sequi voluptatibus
      deserunt, alias vel distinctio minus quam fugiat itaque pariatur saepe
      laborum ipsum quasi iusto nam! Excepturi dolorum laudantium ut doloremque,
      sunt accusamus omnis qui facilis quia consequuntur repellendus aut
      possimus iure molestias quaerat nulla pariatur architecto error voluptatum
      eaque nihil! Quis ipsum temporibus neque consequatur reprehenderit,
      tempora iste necessitatibus! Qui repellat animi necessitatibus repellendus
      dicta nobis praesentium culpa, quisquam quasi similique. Amet ex illo
      nobis sequi expedita soluta repellendus numquam praesentium a animi,
      perspiciatis debitis mollitia aut eveniet voluptas voluptatibus nam.
      Incidunt et quibusdam reprehenderit dolore a ex id officia minima beatae,
      qui minus excepturi distinctio magnam, quae delectus amet! Ipsam
      laboriosam voluptates animi. Similique molestiae at placeat officia ut
      ducimus totam facilis laboriosam. Maxime quam, accusantium nulla quibusdam
      molestiae perferendis velit, natus eligendi aliquam alias maiores
      inventore culpa, autem error! Doloremque perspiciatis voluptatibus,
      repellendus, esse consectetur iure neque non cupiditate et blanditiis nemo
      eius excepturi repellat. Illum rerum, ipsum quidem temporibus vero ad
      perferendis nemo nesciunt? Repellendus atque fugiat repellat ut saepe
      magni ex molestiae provident facere, explicabo laudantium, doloremque
      inventore accusamus voluptates temporibus ipsa, iure dolores. Sapiente?
    </p>
    <script>
      function delay(duration) {
        var start = Date.now();
        while (Date.now() - start < duration) {}
      }
      btn.onclick = function () {
        delay(5000);
      };
    </script>
  </body>
</html>

```

点击死循环按钮，页面仍然能继续滚动，浏览器将滚动操作放在了**合成器线程**中进行处理，因此尽管**渲染主线程**被阻塞了，任然可以滚动页面。

总结：

| **对比项**           | **主线程 (Main Thread)**                              | **合成器线程 (Compositor Thread)**               |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| **主要职责**         | 执行 JavaScript、进行页面布局和绘制。                 | **独立处理页面滚动**和特定CSS动画。              |
| **当前状态**         | 被`delay(5000)`函数中的死循环**完全阻塞**，无法工作。 | **不受影响**，保持独立运行。                     |
| **对滚动操作的响应** | 因被阻塞，**无法处理**任何滚动请求。                  | **直接接收并处理**用户的滚动操作，移动页面图层。 |
| **最终结果**         | 页面上的JS交互（如点击）会卡死。                      | 页面**依然可以流畅滚动**。                       |

---
title: 使用Git小乌龟完成常规的Git操作
date: 2024-05-24
duration: 3min
type: notes
art: random
---

[[toc]]

## 使用Git小乌龟完成常规的Git操作

### Git和Git小乌龟下载地址

[Git](https://git-scm.com/)

[Git小乌龟](https://tortoisegit.org/download/)

### 提交commit

本地做出更改才能提交

新建一个abc.txt文件，里面随便输入点内容，让本地的文件出现修改

![image-20240524114725141](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524114725141.png?imageSlim)

提交更改

![image-20240524114814942](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524114814942.png?imageSlim)

![image-20240524114949808](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524114949808.png?imageSlim)



### 推送push

提交完之后才能推送，选择你要推送的分支和推送到远程的哪个分支

![image-20240524115155163](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524115155163.png?imageSlim)

### 拉取pull

一般推送之前都要拉取一下远端代码，看看有没有冲突。或者是拉取远端的新代码到本地。

![image-20240524115319769](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524115319769.png?imageSlim)

### 解决冲突（使用vscode）

当拉取下来的的代码文件的某一行代码和你本地相同文件里的某一行不一样的话就会出现冲突。

本地仓库1的h.txt文件修改并推送到远端的master

![image-20240524115755002](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524115755002.png?imageSlim)

本地仓库2的h.txt文件

仓库2和仓库1的h.txt文件的同一行的内容不同

![image-20240524115939892](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524115939892.png?imageSlim)

在仓库2里去拉取master

出现冲突

![image-20240524134408244](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524134408244.png?imageSlim)

打开vscode，这是冲突的内容

![image-20240524134504704](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524134504704.png?imageSlim)

保留双方更改

![image-20240524134539669](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524134539669.png?imageSlim)

暂存，提交代码

![image-20240524134607564](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524134607564.png?imageSlim)

### 切换分支

![image-20240524134651470](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524134651470.png?imageSlim)

选择分支，带有remote是远端分支

![image-20240524134729745](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524134729745.png?imageSlim)

### 回滚代码版本reset

当前版本的h.txt文件

![image-20240524134847117](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524134847117.png?imageSlim)

选择显示日志

![image-20240524134814477](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524134814477.png?imageSlim)

回滚到commit为ttt的这个版本

![image-20240524135008440](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524135008440.png?imageSlim)

![image-20240524135039339](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524135039339.png?imageSlim)

选择硬重置

![image-20240524135131162](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524135131162.png?imageSlim)

回滚后的h.txt文件

![image-20240524135231837](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524135231837.png?imageSlim)

### 回滚被删除的分支

首先本地得有被删除的分支的commit才能回滚被删除的分支

删除此分支

![image-20240524135750580](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524135750580.png?imageSlim)

创建一个新分支，用来回滚被删除的分支

![image-20240524135835038](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524135835038.png?imageSlim)

在日志里找到最后被删除的分支的commit

![image-20240524140039821](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524140039821.png?imageSlim)

之后再重置到这个commit

### 克隆Clone

![image-20240524114349398](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524114349398.png?imageSlim)

![image-20240524114428207](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524114428207.png?imageSlim)

![image-20240524114451501](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524114451501.png?imageSlim)

**克隆成功**

![image-20240524114521273](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240524114521273.png?imageSlim)

### .gitignore






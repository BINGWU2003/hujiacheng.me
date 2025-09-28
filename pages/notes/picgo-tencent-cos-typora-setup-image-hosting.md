---
title: PicGo+腾讯COS+Typora搭建图床
date: 2024-05-10
duration: 18min
art: random
type: notes
---

[[toc]]

## 腾讯储存桶COS的准备

### 打开[腾讯云官网](https://cloud.tencent.com/)
搜索对象存储
![image-20240509235219394](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240509235219394.png?imageSlim)

### 创建一个储存桶

![image-20240509235351361](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240509235351361.png?imageSlim)

![image-20240509235528461](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240509235528461.png?imageSlim)

![](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240509235618220.png?imageSlim)

![image-20240511004139500](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240511004139500.png?imageSlim)

![image-20240509235743503](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240509235743503.png?imageSlim)

储存桶的准备已经完成

## PicGo的准备

### 下载[PicGo](https://molunerfinn.com/PicGo/)

### 配置PicGo的图床

#### 创建腾讯云COS

![image-20240510000156318](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240510000156318.png?imageSlim)

#### 配置相关内容

![image-20240510000520230](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240510000520230.png?imageSlim)

##### 获取SecretId，APPID，SecretKey

打开[腾讯API密钥管理](https://console.cloud.tencent.com/capi)来获取相关配置信息

新建密钥

![image-20240510001657346](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240510001657346.png?imageSlim)

拿到SecretId，SecretKey

![image-20240510001543899](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240510001543899.png?imageSlim)

拿到APPID

![image-20240510000848877](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240510000848877.png?imageSlim)

好了，现在SecretId，APPID，SecretKey都准备好了

##### 获取Bucket和储存区域

![image-20240510001301073](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240510001301073.png?imageSlim)

好了，现在Bucket，储存区域准备好了

##### 配置图片保存路径

![image-20240510002008347](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240510002008347.png?imageSlim)

如果配置了图片保存路径，图片上传之后就会自动创建一个文件夹

![image-20240510002212322](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240510002212322.png?imageSlim)

![image-20240510002313145](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240510002313145.png?imageSlim)

#### 完成创建PicGo的图床

![image-20240510002432294](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240510002432294.png?imageSlim)

## Typora的准备

点击左上角文件，选择偏好设置

![image-20240510002622796](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240510002622796.png?imageSlim)

- 插入图片选择**上传图片**

- 上传服务选择**PicGo**

![image-20240510002800141](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240510002800141.png?imageSlim)

设置完毕后重启typora

测试一下能不能上传

![image-20240510003131497](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240510003131497.png?imageSlim)


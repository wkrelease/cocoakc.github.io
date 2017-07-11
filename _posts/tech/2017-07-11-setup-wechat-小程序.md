---
layout: post
title: 小程序 学习 - 预览大图
category: 技术
tags: 小程序
keywords: 小程序
---

##  为image绑定事件

<image src="https://app.xxx.com/a.jpg" bindload="imageLoad" bindtap="previewImage" mode="aspectFill" data-index="{{ index }}"></image>

```

wx.previewImage({
current: this.data.urlList[currentIndex], 
urls: this.data.urlList
})

```

current 为当前显示图片的http链接
urls 需要预览的图片http链接列表

## 这些在官方文档里写的十分简明

[微信小程序官方文档](https://mp.weixin.qq.com/debug/wxadoc/dev/api/media-picture.html#wxpreviewimageobject)



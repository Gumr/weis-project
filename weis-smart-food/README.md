<!--
 * @Author: your name
 * @Date: 2021-09-10 18:03:48
 * @LastEditTime: 2021-09-28 16:25:04
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \weis-smart-food\README.md
-->
# "维士小盒饭" 前端项目

## 项目各文件夹说明

## libs(放各种库文件)

- 1.day 一个时间处理库，文档地址[https://dayjs.gitee.io/zh-CN/](https://dayjs.gitee.io/zh-CN/)
- 2.location 对地理位置处理的一些方法
- 3.qqmap qq 地图的 sdk
- 4.qrcode 绘制二维码的库，文档地址[https://github.com/yingye/weapp-qrcode#readme](https://github.com/yingye/weapp-qrcode#readme)
- 5.tool 自己写的 throttle 和 debounce, 建议使用 utils/throttle 下的节流和防抖方法
- 6.components/calendarPlugin 日历组件  文档地址：[https://treadpit.github.io/wx_calendar/]<!--文档版本1.x-->
- 7.echarts.js 包括 折线图、饼图、雷达图、表盘 (选择要打包的组件 Title Legend Tooltip Graphic)

## pages(放置小程序的页面文件)

目前有 4 个分包，packageDatum、packageDiscover、packageOrder、mineBox

## service(声明请求的各个方法)

声明的各个 service 都在 index 里同一引用然后导出了，可以只把公共的方法声明，只调用一次的方法其实可以不声明

## style(公共样式和字体)

## templates(放公共的 template)

## utils()

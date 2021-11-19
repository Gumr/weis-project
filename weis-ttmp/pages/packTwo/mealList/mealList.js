// /Users/weis/Desktop/miniprogram/weis-ttmp/pages/order/mealList/mealList.js

import apiRequest from '../../../service/index';
import {
  orderStatusMap,
  categoryMap,
} from '../../../utils/map'
const app = getApp();
Page({
  data: {
    tab: [//tab名称
      {
        name: '全部',
      },
      {
        name: '待配送/配送中',
      },
      {
        name: '已签收',
      },
    ],
    tabIndex: 0,//tabIndex

    list: [],//餐单列表
    skuList: new Array(4),
  },
  onLoad: function (options) {
    this.countNum = options.countNum;
    this.doneNum = options.doneNum;
    this.tradeNo = options.tradeNo;
    // this.tradeNo = 'TDPOF292C0581F841D73D1AE0';
    this.setData({
      navStatusHeight: app.globalData.navStatusHeight,
      title: `${this.countNum}餐已签收${this.doneNum}餐`, // 导航栏标题
    });
    this.pageNo = 1;
    tt.showLoading({
      title: '', // 内容
    });
  },
  onShow: function () {
    this.pageNo = 1;
    this.setData({
      list: [],
    })
    this.queryUserWriteOffList();
  },
  tab(e) {//tab点击
    let index = e.currentTarget.dataset.index;
    let tabIndex = this.data.tabIndex;
    if (index == tabIndex) {//点击当前tab不做任何操作
      return
    }

    this.setData({
      list: [],
      tabIndex: index
    }, () => {
      this.pageNo = 1;
      this.queryUserWriteOffList();
      tt.showLoading({
        title: '', // 内容
      });
    })
  },
  tapItem(e) {
    let shipId = e.currentTarget.dataset.ship;
    tt.navigateTo({
      url: `/pages/packTwo/mealInfo/mealInfo?shipId=${shipId}`, // 指定页面的 url

    });
  },
  onReachBottom() {
    this.queryUserWriteOffList();
  },
  queryUserWriteOffList() {
    apiRequest.queryUserWriteOffList({
      tradeNo: this.tradeNo,
      orderStt: this.data.tabIndex == 1 ? '01' : this.data.tabIndex == 2 ? '02' : 'all',
      pageNo: this.pageNo, //
      // pageSize: this.data.pageSize, // 
    }).then((res) => {
      console.log(res);
      if (res.errCode == 0) {
        let title = this.data.title;
        if (res.obj.totalSize && res.obj.saveSize) {
          title = `${res.obj.totalSize}餐已签收${res.obj.saveSize}餐`;
        }
        res.obj.transferList.forEach((item) => {
          item.orderSttText = orderStatusMap(item.orderStt);
          item.categoryText = categoryMap[item.category];
          let count = 0;
          item.dietOrderDetails.forEach((detail) => {
            let arr = JSON.parse(detail.skuImgUrl);
            detail.imgUrl = arr ? arr[0].imgUrl : '';
            count += detail.num;
          });

          item.week = new Date(item.date.substr(0, 4), parseInt(item.date.substr(4, 2)) - 1, item.date.substr(6, 2)).getUTCDay();
          item.count = count;

          let details = [];
          item.dietOrderDetails.forEach(detail => {
            for (var i = 0; i < detail.num; i++) {
              details.push(detail);
            }
          })
          item.dietOrderDetails = details;
        });
        let list = this.data.list || [];
        list = list.concat(res.obj.transferList);
        //orderStt 01
        this.setData({
          list, title,
        })
        this.pageNo += 1;
      }
    });
  },
  back() {//返回上一页
    tt.navigateBack({
      delta: 1,
    });
  },
})
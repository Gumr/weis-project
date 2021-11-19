// /Users/weis/Desktop/miniprogram/weis-ttmp/pages/packTwo/writeOffResult/writeOffResult.js

import apiRequest from '../../../service/index';

Page({
  data: {
    status: 0,//1成功 2失败 3下架
  },
  onLoad: function (options) {
    var list = JSON.parse(options.list);
    var addressId = options.addressId;
    this.tradeNo = options.tradeNo;
    this.tdpId = options.tdpId;
    this.countNum = options.countNum;
    this.doneNum = options.doneNum;
    this.setData({ list, addressId, });
    this.writeOff();
  },
  writeOff() {
    tt.showLoading({
      title: '', // 内容
    });
    apiRequest.writeOff({
      addressId: this.data.addressId,//地址id
      tradeNo: this.tradeNo,//订单id
      tdpId: this.tdpId,//套餐包id
      // shipWithCold:'',//00 热食配送 01 冷链配送
      distributionMode: '0',//0.配送 1.自取 2企业专送
      deliveryFrequency: '00',//00每餐 01每日
      dateList: this.data.list,
    }).then(res => {
      console.log(res)
      if (res.errCode == 0&&res.obj.saveFlg) {

      } else {
        // tt.showToast({
        //   title: res.errMsg, // 内容
        //   icon: 'none', // 图标
        // });
      }
      // this.setData({ status: res.errCode == 0&&res.obj.saveFlg ? 1 :res.errMsg=='1000000' ? 3 : 2, })
      this.setData({ status: res.errCode == 0&&res.obj.saveFlg ? 1 : 3,errMsg:res.errMsg })
    });
  },
  back(e){
    if(this.data.status==1){
      //成功返回订单详情
      tt.reLaunch({
        url: `/pages/packTwo/orderInfo/orderInfo?tdpId=${this.data.tdpId}&tradeNo=${this.tradeNo}`, // 
      });
    }else if(this.data.status==2){
      //核销失败返回上一页
      tt.navigateBack({
        delta: 1,
      });
    }else{
      //核销失败返回上一页
      tt.navigateBack({
        delta: 2,
      });
    }
  },
  tapDetail(e) {
    tt.navigateTo({
      url: `/pages/packTwo/mealList/mealList?doneNum=${this.doneNum}&countNum=${this.countNum}&tradeNo=${this.tradeNo}`, // 
    });
  },
})
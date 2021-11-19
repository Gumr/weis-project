// /Users/weis/Desktop/miniprogram/weis-ttmp/pages/packTwo/writeOffInfo/writeOffInfo.js

import apiRequest from '../../../service/index';

Page({
  data: {
    skuList: new Array(4),
    list: [],
  },
  onLoad: function (options) {
    console.log(options.dateList)
    var address = JSON.parse(options.address);
    var dateList = JSON.parse(options.dateList);
    this.tdpId = options.tdpId;
    this.tradeNo = options.tradeNo;
    let mealNum = options.mealNum;
    let dayNum = options.dayNum;
    this.setData({
      address, dateList, mealNum, dayNum,
    })
  },
  onShow: function () {
    if (this.data.address) {
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];
      prevPage.setData({ //对上页面进行赋值
        address: this.data.address,
      });
    }
    this.createTiktokWriteOffList(this.tdpId, this.data.address.id, this.data.dateList);
  },
  tapAddress(e) {
    tt.navigateTo({
      url: '/pages/packOne/addressList/addressList', // 地址列表
    });
  },
  //核销
  writeOff(e) {
    if (!this.data.list || this.data.list.length < 1) {
      return;
    }
    let that = this
    tt.showModal({
      title: "",
      content: "确定地址和每餐的配送时间准确无误吗？核销后不能修改",
      success(res) {
        if (res.confirm) {
          let { mealNum, dayNum, address, dateList } = that.data;
          tt.navigateTo({
            url: `/pages/packTwo/writeOffResult/writeOffResult?doneNum=0&countNum=${mealNum * dayNum}&tradeNo=${that.tradeNo}&addressId=${address.id}&list=${JSON.stringify(dateList)}&tdpId=${that.tdpId}`, // 核销结果
          });
        }
      },
      fail(res) {
        console.log(`showModal调用失败`);
      },
    });
  },
  // 抖音套餐核销排餐
  //params - tdpId 套餐包id dateList 时间 addressId 地址id 
  //{"tdpId":"100003","dateList":[{"date":"20210925","meal":["02"],"timeList":{"category":"02","mealTakingTime":"12:30-12:50"}}],"addressId":108081,"market":40,"openid":"ogPrK5VEVT8JTvxt52cEr4TBICbo"}
  createTiktokWriteOffList(tdpId, addressId, list) {
    tt.showLoading({
      title: '', // 内容
    });
    apiRequest.createTiktokWriteOffList({
      tdpId: tdpId,
      addressId: addressId,
      dateList: list,
    }).then(res => {
      console.log(res)
      if (res.errCode == 0) {
        let list = res.obj.bagResponses;
        list.forEach((item)=>{
          item.cateringBagList.forEach((c)=>{
            let comps=[];
            c.infoComposes.forEach((comp)=>{
              for(var i=0;i<comp.num;i++){
                comps.push(comp);
              }
            });
            c.infoComposes = comps;
          });
        });
        this.setData({
          list,
        })
      } else {
        tt.showToast({
          title: res.errMsg, // 内容
          icon: 'none', // 图标
        });
      }
    });
  },
  back(){//返回上一页
    tt.navigateBack({
      delta: 1,
      success: (res) => {
        
      },
      fail: (res) => {
        
      },
    });
  }
})
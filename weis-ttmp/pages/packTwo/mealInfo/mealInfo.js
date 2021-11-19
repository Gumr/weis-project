// /Users/weis/Desktop/miniprogram/weis-ttmp/pages/order/mealInfo/mealInfo.js

import apiRequest from '../../../service/index';
import {
  orderStatusMap,
  categoryMap,
} from '../../../utils/map'

Page({
  data: {
    skuList: []
  },
  onLoad: function (options) {
    this.shipId = options.shipId;
    // this.shipId = "TWRPDDE44C043D6DF7615E8D0";
  },
  onShow:function(){
    this.queryUserWriteOffDetail();
  },
  call: function (event) {
    //号码
    let phone = event.currentTarget.dataset.phone;
    tt.makePhoneCall({
      phoneNumber: phone, // 电话号码
      success: (res) => {

      },
      fail: (res) => {
        console.log(res);
        tt.showToast({
          title: '呼叫失败', // 内容
          icon: 'none', // 图标
        });
      },
    });
  },
  copy: function (event) {
    //单号
    let number = event.currentTarget.dataset.number;
    tt.setClipboardData({
      data: number, // 剪贴板数据
      success: ({ data }) => {
        tt.showToast({
          title: '复制成功', // 内容
          icon: 'none', // 图标
        });
      },
      fail: (res) => {
        console.log(res);
        tt.showToast({
          title: '复制失败', // 内容
          icon: 'none', // 图标
        });
      },
    });
  },
  queryUserWriteOffDetail(){
    tt.showLoading({
      title: '', // 内容
    });
    apiRequest.queryUserWriteOffDetail({
      shipOid:this.shipId,
    }).then((res)=>{
      console.log(res)
      if(res.errCode==0){
        let info =res.obj.queryWaybillRecord;
        let heatingPoint = res.obj.heatingPoint;
        
        let ship = res.obj.shipResult&&res.obj.shipResult.length>0?res.obj.shipResult[0]:[];
        //订单状态
        let orderSttText=orderStatusMap(ship.transfer.orderStt)
        // let orderSttText=orderStatusMap(ship.transfer.orderStt,info.distributionMode)
        let week = new Date(info.expectDate.substr(0,4),parseInt(info.expectDate.substr(4,2))-1,info.expectDate.substr(6,2)).getUTCDay();
        console.log(`week = ${week}`)
        this.setData({
          info,
          heatingPoint,
          foodData:ship.foodData,
          skuList:ship.transfer.skuList,
          ctime:ship.transfer.ctime,
          orderId:ship.transfer.orderId,
          category:categoryMap[ship.transfer.category],
          week,
          orderSttText,
        });

      }
    })
  },
  back(){//返回上一页
    tt.navigateBack({
      delta: 1,
    });
  },
})
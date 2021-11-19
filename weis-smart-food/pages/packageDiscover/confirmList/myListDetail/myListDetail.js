import apiRequest from '../../../../service/index'
import day from '../../../../libs/day'
import {
  isLoginClick,
  t,
  loginPromise,
} from '../../../../utils/common'
let app = getApp();
Page({


  data: {
    tipDialog: false,
    corpOrderDetailBean: {},
    categoryStatus: {
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
    },
    skuName:'',
    skuNum:'',
    share:false

  },


  onLoad: function (options) {

    this.setData({
      corpAddressId: options.corpAddressId,
      orderDate: options.orderDate,
      orderuid: options.uid,
      share: Boolean(options.share)
    })
    this.queryList()

  },



  onShow: function () {

  },
  queryList() {
    apiRequest
      .queryCorpOrderDetail({
        orderDate: this.data.orderDate,
        orderUid: this.data.orderuid,
        tgcaId: this.data.corpAddressId
      })
      .then(res => {
        if (res && res.errCode === 0) {
          let corpOrderDetailBean = res.obj.corpOrderDetailBean
          corpOrderDetailBean.signDate= corpOrderDetailBean.orderDate
          corpOrderDetailBean.orderDate = day(corpOrderDetailBean.orderDate).format('MM月DD日')
          this.setData({
            corpOrderDetailBean: corpOrderDetailBean
          })

        }
      });

  },
  call(e) {
    let number = e.currentTarget.dataset.number;
    if (!number) {
      return
    }
    wx.makePhoneCall({
      phoneNumber: number + '',
    }).catch((e) => {
      // console.log(e)  //用catch(e)来捕获错误{makePhoneCall:fail cancel}
    })

  },
  showConfirm(e) {
 
    let {name,num,category,skutype,sid,cid} = e.currentTarget.dataset
    this.setData({
      tipDialog: true,
      skuName:name,
      skuNum:this.$iptNum ?this.$iptNum:num,
      category:category,
      skutype:skutype, 
      sid:sid,
      cid:cid,
      tcosShouldNum:num
    })

  },
  signOrder: isLoginClick(function () {
    let {corpAddressId,category,skutype,cid,sid,corpOrderDetailBean,orderuid,tcosShouldNum} = this.data
    let date = corpOrderDetailBean.signDate //订单时间
    let nowdate= day(new Date()).format('YYYYMMDD')
    let uid = app.globalData.uid
    apiRequest
      .SignCorpOrder({
        tcosSignUid:uid,
        tcosTgcaId:corpAddressId,
        tcosCategory:category,
        tcosCid:cid,
        tcosSid:sid,
        tcosType:skutype,
        tcosNum: this.$iptNum || this.data.skuNum,
        tcosSignDate:nowdate,
        tcosOrderDate:date,
        orderUid:orderuid,
        tcosShouldNum:tcosShouldNum

      })
      .then(res => {
        if (res.obj.saveFlg) {
          this.queryList()
        }
      });
  }),
  iptNumber(e) {
    const { value} = e.detail
    this.$iptNum = Number(value)
    this.setData({
      usernum: Number(value),
    })
  },

  onShareAppMessage: function () {
    let date = this.data.corpOrderDetailBean.orderDate
    let orderDate= this.data.orderDate
   let orderuid = this.data.orderuid
   let  corpAddressId= this.data.corpAddressId
   let nowdate =this.data.nowdate
    return {
      title: `快来签收${date}的菜品吧`,
      imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/confirmOrder.png',
      path: `/pages/packageDiscover/confirmList/myListDetail/myListDetail?share=true&orderDate=${orderDate}&uid=${orderuid}&corpAddressId=${corpAddressId}`,
    }

  }
})
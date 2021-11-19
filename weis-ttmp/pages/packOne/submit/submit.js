// e:\project\weis-ttmp\weis-ttmp-nlm\weis-ttmp\pages\packOne\submit\submit\submit.js
import apiRequest from '../../../service/index';
Page({
  data: {
    imgPrefix: 'https://prodstatic.weis1606.cn/api/ttmpFood/index/',
  },
  onLoad: function (options) {
    this.dayNum=options.dayNum;
    this.mealNum=options.mealNum;
    this.setData({
      tdpid: options.tdpid
    })
  },
  onShow: function () {
    this.setData({
      isClick: true
    })
    this.queryCombinationPackageDetailById()
  },
  // 根据id查询套餐包详情
  queryCombinationPackageDetailById() {
    let { tdpid } = this.data;
    apiRequest.queryCombinationPackageDetailById({
      id: tdpid
    }).then((res) => {
      this.setData({
        mealDetail: res.obj || []
      })
    })
  },
  // 提交订单
  submit() {
    // 防止重复提交
    if(!this.data.isClick) {
      return;
    }
    this.setData({
      isClick: false
    })
    let { tdpid, tradeNo } = this.data;
    let api = '', params = {};
    // 不存在tradeNo单号是第一次支付，存在代表是重新支付
    if(!tradeNo) {
      api = 'submitCombinationPackageOrder'
      params = {
        payChannel: 'dou', // 支付渠道
        payWay: 'wechat', // 支付(方式)类型
        packSid: tdpid // 套餐包上的主键id
      }
    } else {
      api = 'repayCombinationPackageOrder'
      params = {
        payChannel: 'dou', // 支付渠道
        payWay: 'wechat', // 支付(方式)类型
        tradeNo, // 订单号
      }
    }
    apiRequest[api](params).then((res) => {
      if(res.errCode == 0) {
        this.setData({
          tradeNo: res.obj.payInfo.tradeNo
        })
        // 微信支付
        apiRequest.payment(res.obj.payInfo).then(async data => {
          let status = data.code == 0 ? 1 : 0
          tt.navigateTo({
            url: `/pages/packOne/payStatus/payStatus?status=${status}&tradeNo=${res.obj.payInfo.tradeNo}&tdpId=${tdpid}&dayNum=${this.dayNum}&mealNum=${this.mealNum}`,
          })
        })
      }
    })
  },
})
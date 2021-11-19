// pages/mineBox/operate/operate-order/operate-order.js
import apiRequest from "../../../../service/index";
import {
  isLoginClick,
  loginPromise,
} from '../../../../utils/common'
const day = require('../../../../libs/day')
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    list: []
  },
  lifetimes: {
    attached: function () {
      this.queryUserBuyActivity()
    },
    detached: function () {},
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 订单
    queryUserBuyActivity() {
      apiRequest
        .queryUserBuyActivity()
        .then((res) => {
          let data = res.obj.operatedCombines;
          this.setData({
            list: data.map(item => {
              item.operatedPayRecord.ctimeFilter = day(item.operatedPayRecord.ctime).format('YYYY-MM-DD HH:mm:ss')
              item.operatedPayRecord.payWayFilter = item.operatedPayRecord.payWay == 'wechat'?'微信支付':''
              return item
            })
          });
        })
        .catch((error) => {});
    },
    // 订单详情
    orderDetail: isLoginClick(function (e) {
      let {item} = e.currentTarget.dataset;
      item.operatedActivity.detailedInfo = '';
      wx.navigateTo({
        url: `../orderDetail/orderDetail?item=${JSON.stringify(item)}`,
      });
    })
  }
})

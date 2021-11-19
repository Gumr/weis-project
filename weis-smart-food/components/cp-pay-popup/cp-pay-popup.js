import apiRequest from '../../service/index';

import { wxPay, loginPromise } from '../../utils/common'

// components/pay-popup/pay-popup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean
    },
    balanceSupport: { // 是否支持余额支付
      type: Boolean,
      value: true
    },
    protocol: { // 是否显示 需要阅读协议
      type: Boolean,
      value: false
    },
    totalNum: { // 几个配送订单一起支付
      type: Number,
    },
    source: { // 去充值来源 跳回
      type: String,
      value: ''
    },
  },
  observers: {
    balanceSupport(support) {
      if (!support) {
        this.setData({
          'payList[0].disabled': true
        }, () => {
          this.checkBalanceSelected();
        })
      }
    }
  },
  ready() {
    
  },
  pageLifetimes:{
    show(){
      loginPromise.then((res)=>{
        this.getBalance();
      })
    },
  },
  attached() {
    this.setData({
      isIpx: getApp().globalData.isIpx
    })
  },
  /**
   * 组件的初始数据
   */
  data: {
    protocolChecked: false,
    selected: {
      value: 0,
      type: 'balance'
    },
    balance: 0,
    totalPrice: 0,
    payList: [
      {
        text: '余额',
        type: 'balance',
        value: 0,
        disabled: false,
        icon: '/images/payment_wallet.png'
      },
      {
        text: '微信',
        type: 'wechat',
        value: 1,
        disabled: false,
        icon: '/images/payment_wechat.png'
      }
    ],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleClickOverlay() {
      this.setData({
        show: false
      })
    },
    pay(price) { // 组件方法 可以外部调用 传入要支付得金额
      const balanceDisabled = price > this.data.balance;
      this.setData({
        show: true,
        ['payList[0].disabled']: balanceDisabled,
        totalPrice: price
      }, () => {
        this.checkBalanceSelected();
      })
    },
    protocolTap() {
      this.setData({
        protocolChecked: !this.data.protocolChecked
      })
    },
    viewProtocolTap() {
      wx.navigateTo({
        url: '/pages/mineBox/rechargeDeal/rechargeDeal',
      });
    },
    getBalance() {
      apiRequest.detailsBalance({
        pageSize: 1,
        pageNo: 1
      }).then((res) => {
        this.setData({
          balance: (res.obj && res.obj.totalBalance)
        })
        this.triggerEvent('getBalance', {
          balance: (res.obj && res.obj.totalBalance)
        })
      })
    },
    payItemTap(evt) {
      if(this.data.totalPrice <= 0) {
        wx.showToast({
          title: '支付金额为0',
          icon: 'none',
        });
        return
      }
      
      const { dataset } = evt.currentTarget
      if (dataset.disabled) return;
      this.setData({
        selected: {
          value: dataset.value,
          type: dataset.type
        }
      })
    },
    checkBalanceSelected() {
      const { payList } = this.data
      const balanceDisabled = payList[0].disabled;
      if (balanceDisabled) { // 余额被禁用 默认选中微信支付
        this.setData({
          selected: payList[1]
        })
      } else {
        this.setData({ // 余额可用 默认选中余额
          selected: payList[0]
        })
      }
    },
    payTap() {
      const { protocol, protocolChecked } = this.data;
      if (protocol) {
        if (protocolChecked) {
          this.payTapHandler()
        } else {
          wx.showToast({
            title: '请阅读并勾选会员协议',
            icon: 'none'
          })
        }
      } else {
        this.payTapHandler()
      }
    },
    payTapHandler() {
      if (this.data._paying) return;
      this.setData({
        _paying: true
      })

      const done = () => { // done 收起弹窗并修改支付状态
        this.setData({
          show: false
        }, () => {
          setTimeout(() => { // 弹窗收起有动画 防止多次点击
            this.setData({
              _paying: false
            })
          }, 1000)
        })
      }

      this.triggerEvent('on-confirm', {
        ...this.data.selected, // { value: 0, type: 'balance' }
        done,
        wxPay // 封装微信支付接口 可直接调用,
      })
    },
    recharge(){
      this.setData({
        show: false
      })
      wx.navigateTo({
        url: `/pages/mineBox/balance/balance?source=${this.data.source}`,
      });
    },
  }
})

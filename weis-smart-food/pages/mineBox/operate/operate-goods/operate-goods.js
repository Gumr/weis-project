// pages/mineBox/operate/operate-goods/operate-goods.js
import apiRequest from "../../../../service/index";
import { getStorage } from "../../../../utils/storage";
import { isLoginClick, loginPromise, wxPay } from "../../../../utils/common";
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    // banner
    indicatorDots: false, //小点
    autoplay: true, //是否自动轮播
    interval: 4000, //间隔时间
    duration: 400, //滑动时间
    indicatorColor: "white", //指示点颜色
    activeColor: "coral", //当前选中的指示点颜色
    currentIndex: 0,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    init(options) {
      loginPromise.then((res) => {
        this.setData({
            userInfo: res,
            options
          }, () => {
            this.queryOperatedActivity();
          });
      });
    },
    // 商品
    queryOperatedActivity() {
      const { userInfo, options } = this.data;
      apiRequest
        .queryOperatedActivity({
          activityId: options.id
        })
        .then((res) => {
          const info = res.obj;
          this.setData({
            info,
            shareModel: {
              title: info.activityInfo.productName,
              path:
                "pages/mineBox/operate/operate/operate?boxtype=share&id=" +
                info.activityInfo.id +
                "&invitedUid=" +
                userInfo.uid,
              imageUrl: info.activityInfo.activityImgList[0],
            },
          });
        })
        .catch((error) => {});
    },
    // 切换swiper
    handleChange(e) {
      this.setData({
        currentIndex: e.detail.current,
      });
    },
    // 我的分享-查看全部
    allShare: isLoginClick(function () {
      const { info } = this.data;
      wx.navigateTo({
        url: "/pages/mineBox/operate/share/share?id=" + info.activityInfo.id,
      });
    }),
    // 立即购买
    pay: isLoginClick(function () {
      const { info } = this.data;
      const app = getApp();
      apiRequest
        .payOperatedActivity({
          activityId: info.activityInfo.id, // 活动标识id
          openid: app.globalData.openId,
        })
        .then((res) => {
          if (res.errCode == "0") {
            wxPay(res.obj)
              .then((data) => {
                if (data.errMsg == "requestPayment:ok") {
                  wx.navigateTo({
                    url: `/pages/mineBox/operate/payStatus/payStatus?staffWeChat=${info.activityInfo.staffWeChat}&staffPhone=${info.activityInfo.staffPhone}&status=true`,
                  });
                }
              })
              .catch((data) => {
                if (data.errMsg == "requestPayment:fail cancel") {
                  wx.navigateTo({
                    url: `/pages/mineBox/operate/payStatus/payStatus?staffWeChat=${info.activityInfo.staffWeChat}&staffPhone=${info.activityInfo.staffPhone}`,
                  });
                }
                if (data.errMsg == "requestPayment:fail (detail message)") {
                  wx.showToast({
                    title: "支付失败",
                    icon: "none",
                    image: "",
                    duration: 1500,
                    mask: false,
                  });
                }
              });
          } else {
            wx.showToast({
              title: res.errMsg,
              icon: "none",
              image: "",
              duration: 1500,
              mask: false,
            });
          }
        })
        .catch((error) => {});
    }),
  },
});

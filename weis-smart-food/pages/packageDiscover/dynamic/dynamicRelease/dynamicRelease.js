// pages/packageDiscover/dynamic/dynamicRelease/dynamicRelease.js
import apiRequest from "../../../../service/index";
import {
  categoryMap
} from '../../../../utils/map'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    horseManImgList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      tcaId: options.tcaId,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  // 文字建议
  psAdvise(e) {
    this.setData({
      psAdvise: e.detail.value,
    });
  },
  // 选择图片
  chooseImage() {
    const horseManImgList = this.data.horseManImgList || [];
    if (horseManImgList.length >= 6) {
      wx.showToast({
        title: "最多上传6张图!",
        icon: "none",
      });
      return;
    }
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        if (res.tempFilePaths) {
          apiRequest.uploadFile(``, res.tempFilePaths[0], { ossCode: '02' }).then((response) => {
            response = JSON.parse(response.data);
            if (response.errCode === 0) {
              this.setData({
                horseManImgList: [...horseManImgList, response.obj.imageUrl],
              });
            }
          });
        }
      },
    });
  },
  // 删除图片
  deleteImage(evt) {
    const { index } = evt.currentTarget.dataset;
    const { horseManImgList } = this.data;
    horseManImgList.splice(index, 1);
    this.setData({
      horseManImgList,
    });
  },
  // 关联我的餐单
  relationMenu() {
    wx.navigateTo({
      url: `/pages/packageDiscover/dynamic/menuList/menuList`,
    });
  },
  // 提交
  addDynamic() {
    const { psAdvise, horseManImgList, menu } = this.data;
    if(!psAdvise) {
      return
    }
    this.setData({
      psAdvise: ''
    })
    apiRequest
      .addDynamic({
        content: psAdvise,
        imgArr: horseManImgList,
        // imgArr: horseManImgList.toString()
        oid: menu ? menu.oid : ''
      })
      .then((res) => {
        if(res.errCode == 0) {
          wx.switchTab({
            url: '/pages/discover/discover'
          })
        }
      })
      .catch((err) => {});
  },
  // 返回
  back() {
    this.setData({
      showBack: true
    })
  },
  // 确定返回
  sureBack() {
    wx.navigateBack({
      delta: 1
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});

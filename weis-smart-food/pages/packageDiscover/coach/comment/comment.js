// pages/packageDiscover/coach/comment/comment.js
import apiRequest from "../../../../service/index";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    rateMap: {
      1: "非常差",
      2: "很差",
      3: "一般",
      4: "很好",
      5: "非常好",
    },
    horseManImgList: []
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
    this.queryUserInfo();
  },
  queryUserInfo() {
    apiRequest
      .queryUserInfo({})
      .then((res) => {
        this.setData({
          uid: res.obj.userInfo.uid,
        });
      })
      .catch((error) => {});
  },
  // 星级评价
  evaluate: function (e) {
    this.setData({
      evaluate: e.detail,
    });
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
    if (horseManImgList.length >= 4) {
      wx.showToast({
        title: "最多上传4张图!",
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
          apiRequest.uploadFile(``, res.tempFilePaths[0]).then((response) => {
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
  // 提交
  addComment() {
    const { tcaId, uid, evaluate, psAdvise, horseManImgList } = this.data;
    apiRequest
      .addComment({
        tcaId,
        uid,
        star: evaluate,
        comment: psAdvise,
        imageUrl: horseManImgList.toString(),
      })
      .then((res) => {
        let {result} = res.obj;
        let status = result == 0?0:1
        wx.navigateTo({
          url: `/pages/packageDiscover/coach/submitStatus/submitStatus?status=${status}`,
        });
      })
      .catch((err) => {});
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

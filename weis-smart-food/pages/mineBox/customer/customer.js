// pages/mineBox/customer/customer.js
import apiRequest from '../../../service/index';
import {formatDate} from '../../../utils/util'
const fullDate = formatDate('Y-M-D')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    users: []
    // 测试数据
    // users: [
    //   {
    //     headImgUrl: 'https://ss0.baidu.com/7Po3dSag_xI4khGko9WTAnF6hhy/zhidao/pic/item/9c16fdfaaf51f3de9ba8ee1194eef01f3a2979a8.jpg',
    //     uname: '111',
    //     ctime: '2020/08/20'
    //   }
    // ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id,
      name: options.name
    })
    this.queryList()
  },
  queryList() {
    const {id: qrcodeId} = this.data
    apiRequest.queryUserListByQrcodeId({
      qrcodeId
    }).then((res) => {
      if (res.errCode === 0) {
        if (res.obj.users) {
          this.setData({
            users: res.obj.users.map((item) => {
              item.ctime = fullDate(item.ctime)
              return item
            })
          })
        }
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        })

      }
    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
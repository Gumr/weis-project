// pages/mineBox/cropImg/cropImg.js
// import {
//   post
// } from "../../../utils/http";
import apiRequest from '../../../service/index';
import { URL } from '../../../utils/request'
import WeCropper from '../../../libs/we-cropper/we-cropper'
const device = wx.getSystemInfoSync() // 获取设备信息
const width = device.windowWidth // 示例为一个与屏幕等宽的正方形裁剪框
const height = width
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cropperOpt: {
      id: 'cropper',
      targetId: 'targetCropper',
      pixelRatio: device.pixelRatio,
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - 300) / 2,
        y: (height - 300) / 2,
        width: 300,
        height: 300
      },
      boundStyle: {
        color: '#04b00f',
        mask: 'rgba(0,0,0,0.8)',
        lineWidth: 1
      }
    },
    type: '',
    src: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // type：根据不同的入口配置图片截取规则
    this._type = options.type
    this.subToken = options.subToken || '';
    const that = this
    //裁剪 插件配置
    const { cropperOpt } = this.data;
    cropperOpt.src = options.src
    if(this._type == 'riceball') {
      const ratio = 600 / 750
      cropperOpt.height = cropperOpt.width * ratio + 20
      cropperOpt.cut = {
        ...cropperOpt.cut,
        y: (height - 300 * ratio) / 2,
        height: 300 * ratio
      }
    }
    this.mycropper = new WeCropper(cropperOpt)
      .on('ready', (ctx) => {
        // that.mycropper .pushOrign(options.src)
      })
      .on('beforeImageLoad', (ctx) => {
        wx.showToast({
          title: '上传中',
          icon: 'loading',
          duration: 20000
        })
      })
      .on('imageLoad', (ctx) => {
        wx.hideToast()
      })
  },
  // 重选图片
  uploadTap() {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        const src = res.tempFilePaths[0]
        //  获取裁剪图片资源后，给data添加src属性及其值
        this.mycropper.pushOrign(src)
      }
    })
  },
  // 上传图片
  getCropperImage() {
    const that = this
    this.mycropper.getCropperImage((tempFilePath) => {
      that.uploadFile(tempFilePath)
    })
      .catch(e => {
        console.error('获取图片失败')
      })
  },
  uploadFile(tempFilePaths) {
    const that = this
    wx.showLoading({
      title: '上传中....'
    })

    wx.uploadFile({
      url: `${URL.api}/upload/image`,
      header: {
        token: wx.getStorageSync('token')
      },
      filePath: tempFilePaths,
      name: 'file',
      formData: {
        'flag': 'userAvator'
      },
      success: (uploadRes) => {
        const data = JSON.parse(uploadRes.data)
        wx.hideLoading()
        if (data.errCode !== 0) {
          wx.showToast({
            title: '图片上传失败，请重试',
            icon: 'none'
          })
          return
        }
        // post({
        //   url: '/cn.weis.api.User/updateUserUnameAndHeadImgUrl',
        //   data: {
        //     method: 'updateUserUnameAndHeadImgUrl',
        //     params: [{
        //       headImgUrl: data.obj.imageUrl
        //     }],
        //     id: 1
        //   }
        // })
        if(this._type == 'riceball') {
          const pages = getCurrentPages(),
            prePage = pages[pages.length - 2]
          debugger
          prePage.setData({
            trrUrl: data.obj.imageUrl
          }, () => {
            wx.navigateBack()
          })
          return
        }
        apiRequest.updateUserUnameAndHeadImgUrl({
          headImgUrl: data.obj.imageUrl,
          subToken: this.subToken,
        })
          .then(res => {
            if (res.errCode === 0) {
              wx.showToast({
                title: '修改成功',
                icon: 'none'
              })
              // app.globalData.userInfo.headImgUrl = JSON.parse(uploadRes.data).obj.imageUrl
              wx.navigateBack()
            }
          })
      },
      fail(err) {
        wx.showToast({
          title: JSON.stringify(err),
          icon: 'none'
        })
      }
    })
  },
  // 插件通过touchStart、touchMove、touchEnd方法来接收事件对象。
  touchStart(e) {
    this.mycropper.touchStart(e)
  },
  touchMove(e) {
    this.mycropper.touchMove(e)
  },
  touchEnd(e) {
    this.mycropper.touchEnd(e)
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
})
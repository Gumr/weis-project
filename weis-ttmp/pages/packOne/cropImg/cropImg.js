// e:\project\weis-ttmp\weis-ttmp-nlm\weis-ttmp\pages\packOne\cropImg\cropImg.js
import apiRequest from '../../../service/index';
import { URL } from '../../../utils/api'
import WeCropper from '../../../libs/we-cropper/we-cropper'
const device = tt.getSystemInfoSync() // 获取设备信息
const width = device.windowWidth // 示例为一个与屏幕等宽的正方形裁剪框
const height = width
const app = getApp()
Page({
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
  onLoad: function (options) {
    // this.subToken = options.subToken || '';
    // const that = this
    //裁剪 插件配置
    const { cropperOpt } = this.data;
    cropperOpt.src = options.src
    this.mycropper = new WeCropper(cropperOpt)
      .on('ready', (ctx) => {
        // that.mycropper .pushOrign(options.src)
      })
      .on('beforeImageLoad', (ctx) => {
        tt.showToast({
          title: '上传中',
          icon: 'loading',
          duration: 20000
        })
      })
      .on('imageLoad', (ctx) => {
        tt.hideToast()
      })
  },
  // 重选图片
  uploadTap() {
    tt.chooseImage({
      count: 1, // 默认9
      // sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      // sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
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
    tt.showLoading({
      title: '上传中....'
    })

    tt.uploadFile({
      url: `${URL.api}/upload/image`,
      header: {
        token: tt.getStorageSync('token')
      },
      filePath: tempFilePaths,
      name: 'file',
      formData: {
        'flag': 'userAvator'
      },
      success: (uploadRes) => {
        const data = JSON.parse(uploadRes.data)
        tt.hideLoading()
        if (data.errCode !== 0) {
          tt.showToast({
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
        apiRequest.updateUserUnameAndHeadImgUrl({
          headImgUrl: data.obj.imageUrl,
          // subToken: this.subToken,
        })
          .then(res => {
            if (res.errCode === 0) {
              tt.showToast({
                title: '修改成功',
                icon: 'none'
              })
              // app.globalData.userInfo.headImgUrl = JSON.parse(uploadRes.data).obj.imageUrl
              tt.navigateBack()
            }
          })
      },
      fail(err) {
        tt.showToast({
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
})
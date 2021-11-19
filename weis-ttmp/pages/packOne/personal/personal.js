// e:\project\weis-ttmp\weis-ttmp-nlm\weis-ttmp\pages\packOne\personal\personal\personal.js
import apiRequest from '../../../service/index';
Page({
  data: {
    imgPrefix: 'https://prodstatic.weis1606.cn/api/ttmpFood/my/',
    sexList: [
      {
        id: 1,
        name: "男",
      },
      {
        id: 2,
        name: "女",
      },
    ],
  },
  onLoad: function (options) {

  },
  onShow: function (options) {
    this.queryUserInfo()
  },
   // 查询用户信息
   queryUserInfo() {
    apiRequest.queryUserInfo({
      mainUid: true
    }).then((res) => {
      this.setData({
        userInfo: res.obj
      })
    });
  },
  // 上传头像
  headImg() {
    tt.chooseImage({
      count: 1,
      // sizeType: ['compressed'],
      // sourceType: ['album', 'camera'],
      success: (res) => {
        if (/\.(jpg|jpeg|png|JPG|PNG)$/.test(res.tempFilePaths[0])) {
          const tempFilePaths = res.tempFilePaths[0]
          tt.navigateTo({
            url: `/pages/packOne/cropImg/cropImg?src=${tempFilePaths}`
          })
          return
        }
        tt.showToast({
          title: '只能上传静态图片',
          icon: 'none'
        })
      }
    })
  },
  // 昵称
  nick() {
    let { userInfo } = this.data;
    tt.navigateTo({
      url: `/pages/packOne/nickName/nickName?nickName=${userInfo.uname}`,
    });
  },
  // 性别
  sex(e) {
    let { value } = e.detail;
    this.updateUserProfile({
      sex: Number(value) + 1,
    })
  },
  // 修改
  updateUserProfile(params) {
    apiRequest.updateUserProfile(params)
    .then(res => {
      this.queryUserInfo()
    })
    .catch(error => {

    })
  },
})
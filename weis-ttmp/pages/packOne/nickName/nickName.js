// e:\project\weis-ttmp\weis-ttmp-nlm\weis-ttmp\pages\packOne\nickName\nickName\nickName.js
import apiRequest from '../../../service/index';
Page({
  data: {
    btnBottom: 0
  },
  onLoad: function (options) {
    this.setData({
      nickName: options.nickName
    })
  },
  // 输入框-聚焦
  focusNick(e) {
    this.setData({
      btnBottom: e.detail.height, // 输出键盘高度
    })
  },
  // 输入框-失焦
  blurNick() {
    this.setData({
      btnBottom: 0
    })
  },
  // 输入框-改变
  changeNick: function (e) {
    this.setData({
      nickName: e.detail.value
    })
  },
  // 保存
  save: function () {
    let { nickName } = this.data;
    if(!nickName) {
      return;
    }
    apiRequest.updateUserUnameAndHeadImgUrl({
      uname: nickName
    })
    .then(res => {
      tt.navigateBack({
        delta: 1
      });
    })
    .catch(error => {

    })
  },
})
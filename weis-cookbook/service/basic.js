/**
 * Created by Huangyk.
 */
class HandleResponse {
  constructor() {
    this.app = getApp();
  }

	resolve(res) {
    return  Promise.resolve(res) ;
  }

  reject(err) {
    wx.showModal({
      title: "请求失败",
      content: err.errMsg || err.msg || "请求失败",
      showCancel: false
    });
  }
}

export default HandleResponse

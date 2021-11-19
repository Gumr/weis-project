// function getUserImageAuth() {
//   return new Promise((resolve, reject) => {
//     wx.getSetting({
//       success: (data) => {
//         resolve(data.authSetting['scope.writePhotosAlbum']);
//       },
//       fail: reject,
//     });
//   });
// }

function saveShareImage(image) {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath: image,
      success: () => {
        wx.showToast({
          title: '图片已保存',
          mask: false,
        });
        resolve()
      },
      fail: reject,
    });
  });
}

function requestUserImageAuthModal() {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: '保存图片需开启权限',
      content: '请确认授权，否则将无法保存图片',
      showCancel: false,
      confirmText: '确定',
      confirmColor: '#f5af53',
      success: (modal) => {
        if (modal.confirm) {
          wx.openSetting({
            success: (data) => {
              if (data.authSetting['scope.writePhotosAlbum']) {
                resolve()
              } else {
                wx.showToast({
                  icon: 'none',
                  title: '授权失败',
                });
                reject()
              }
            },
            fail: reject,
          });
        }
      },
      fail: reject,
    });
  });
}

class ShareImage {
  constructor(image) {
    this.image = image;
  }
  save() {
    return new Promise((resolve, reject) => {
      saveShareImage(this.image)
        .then(resolve)
        .catch((err) => {
          requestUserImageAuthModal()
            .then(() => {
              saveShareImage(this.image)
                .then(resolve, reject)
            })
            .catch(reject)
        })
    })

  }
  preview() {
    wx.previewImage({
      urls: [this.image],
    });
  }
}

export default ShareImage
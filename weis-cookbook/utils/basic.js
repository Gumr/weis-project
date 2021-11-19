function getImageInfo(path) {
  return new Promise(resolve => {
    wx.getImageInfo({
      src: path,
      complete: (res) => {
        if(res.errMsg.includes('getImageInfo:ok')) {
          resolve(res)
        }
      },
      fail: (err) => {
        console.log(err)
      }
    })
  })
}

function querySelect(ele) {
  return new Promise(resolve => {
    let query = wx.createSelectorQuery()
    query.select(ele).boundingClientRect()
    query.exec(res => {
      resolve(res)
    })
  })
}

module.exports = {
  getImageInfo,
  querySelect,
}
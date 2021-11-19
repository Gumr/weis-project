let leftHeight = 0, rightHeight = 0, column1 = [], column2 = []
const scale =  wx.getSystemInfoSync().windowWidth / 375 *2
const imgWidth = 335 / scale

function calcHeightByWaterfaLL() {
  return new Promise((resolve, reject) => {
    let query = wx.createSelectorQuery()
    query.select(`#waterfall_left`).boundingClientRect()
    query.select(`#waterfall_right`).boundingClientRect()
    query.exec((res) => {
      res[0] && res[1] ? resolve(res) : reject('get null element')
    })
  })
}

function getImageInfo(path) {
  return new Promise(resolve => {
    wx.getImageInfo({
      src: path,
      complete: (res) => {
        if(res.errMsg.includes('getImageInfo:ok')) {
          const {width, height} = res
          const scaleHeight = (height / width) * imgWidth
          resolve(scaleHeight)
        }
      }
    })
  })
}

/**
 * 瀑布流
 * @param {Object} context 上下文环境
 */
export function waterfall(context, index = 0) {
  let {originData} = context.data
  if(!originData[index]) {
    console.log('handle-end');
    context.$refreshing && context.setData({
      refreshSuccess: true
    })
    context.setData({
      loadmoreFlag: false
    })
    context.getTabBar() && context.getTabBar().setData({
      handleEnd: true
    })
    index = 0
    context.$refresh && context.$refresh.stopPullRefresh()
    context.$refreshing = false
    context.$handleEnd = true
    return
  }
  context.getTabBar() && context.getTabBar().setData({
    handleEnd: false
  })
  context.$handleEnd = false
  pushToColumn()
  
  // if((context.$pageNo === 1 || !context.$pageNo) && index === 0) {
  //   context.$handleEnd = false
  //   leftHeight = 0, rightHeight = 0, column1 =[], column2 = []
  //   context.setData({
  //     cookList: [[], []]
  //   }, () => {
  //     pushToColumn()
  //   })
  // } else {
  //   pushToColumn()
  // }
  
  async function pushToColumn() {
    const item = originData[index]
    const {trCoverImageWide, trCoverImageHeight, trCoverImageUrl} = item
    const pageNo = context.$pageNo
    const [data1, data2] = context.data.cookList
    if((!pageNo || pageNo === 1) && index === 0) {
      leftHeight = 0
      rightHeight = 0 
      column1 = []
      column2 = []
    } else if(pageNo > 1) {
      column1 = data1
      column2 = data2
    } else if (pageNo > 1 && index === 0) {
      const [res1, res2] = await calcHeightByWaterfaLL().catch(err => {
        console.log(err);
        index === 0 && waterfall(context)
        return
      })
      leftHeight = res1.height
      rightHeight = res2.height
    }

    let imgHeight = trCoverImageHeight ? 
    (trCoverImageHeight / trCoverImageWide) * imgWidth : 
    await getImageInfo(trCoverImageUrl)
    if(leftHeight <= rightHeight) {
      column1.push(item)
      leftHeight += imgHeight
    } else {
      column2.push(item)
      rightHeight += imgHeight
    }
    if(index === originData.length - 1) {
      context.setData({
        cookList: [column1, column2]
      })
    }
    waterfall(context, ++index)

    // if((context.$pageNo === 1 || !context.$pageNo) && index === 0) {
    //   context.$handleEnd = false
    //   leftHeight = 0, rightHeight = 0, column1 =[], column2 = []
    // } else {
    //   const [res1, res2] = await calcHeightByWaterfaLL().catch(err => {
    //     console.log(err);
    //     index === 0 && waterfall(context)
    //     return
    //   })
    //   leftHeight = res1.height
    //   rightHeight = res2.height
    // }

    // leftHeight <= rightHeight ? column1.push(item) : column2.push(item)
    // context.setData({
    //   cookList: [column1, column2]
    // }, () => {
    //   setTimeout(() => {
    //     waterfall(context, ++index)
    //   }, 15)
    // })
  }
}
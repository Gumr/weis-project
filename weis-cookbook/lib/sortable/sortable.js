let startPageY = 0, startTranY = 0, startClientY = 0, moveTranY = 0, moveClientY = 0, moveY = 0, currentindex = 0, preStartKey = -1

/**
 * 排序
 * @param {Object} context 上下文环境
 * @param {Array} target 排序的目标数组
 */
export default class Sortable {
  constructor(options) {
    const that = this
    let query = wx.createSelectorQuery()
    query.select(options.wrapDom).boundingClientRect()
    query.select(options.itemDom).boundingClientRect()
    query.exec(res => {
      options.wrapInfo = res[0]
      options.itemInfo = res[1]
      that.options = {...options}
      that.pageMetaSupport = compareVersion(this.options.systemInfo.SDKVersion, '2.9.0') >= 0;
    })
  }
  start(e) {
    const {wrapInfo, list: sortArr, context} = this.options
    startPageY = e.touches[0].pageY
    startClientY = e.touches[0].clientY
    // 计算X,Y轴初始位移, 使 item 中心移动到点击处
    startTranY = startPageY - wrapInfo.top - 16
    context.setData({
      [`${sortArr}_tranY`]: startTranY
    })
  }
  async move(e) {
    const {key} = e.currentTarget.dataset
    const {pageY: currentPageY, clientY: moveClientY} = e.touches[0]
    const {wrapInfo, itemInfo, list: sortArr, context, systemInfo: {windowHeight, platform}, navBarHeight} = this.options
    const list = context.data[sortArr]
    // 限制手动范围
    // if(key < 0 || key > list.length - 1 ) return

    // 获取 startKey 和 endKey
    // moveTranY = startTranY + currentPageY - startPageY
    moveTranY = currentPageY - wrapInfo.top - 20
    moveY = Math.abs(moveClientY - startClientY)
    context.setData({
      [`${sortArr}_tranY`]: moveTranY
    })
    let startKey = parseInt(key)
    let endKey = currentindex + Math.round(moveTranY / itemInfo.height)
    startKey = startKey <= 0 ? 0 : startKey >= list.length - 1 ? list.length - 1 : startKey
    endKey = endKey <= 0 ? 0 : endKey >= list.length -1 ? list.length -1 : endKey
    // 防止拖拽过程中发生乱序问题
    // 到顶到底自动滑动
    if (moveClientY + navBarHeight + itemInfo.height + 20 > windowHeight) { // 向下
      // 当前触摸点pageY + item高度 - (屏幕高度 - 底部固定区域高度)
      wx.pageScrollTo({
        // scrollTop: currentPageY - windowHeight + itemInfo.height + 20,
        scrollTop: currentPageY + itemInfo.height - (windowHeight - navBarHeight),
        duration: 1000
      });
    } else if (moveClientY - navBarHeight < itemInfo.height) { // 向上
      // 当前触摸点pageY - item高度 - 顶部固定区域高度
      wx.pageScrollTo({
        // scrollTop: currentPageY - moveY - itemInfo.height,
        scrollTop: currentPageY + itemInfo.height - (windowHeight - navBarHeight),
        duration: 1000
      });
    }
    if(startKey === endKey || endKey === preStartKey) return

    if(Math.abs(endKey - startKey) === 1 && platform !== 'devtools' && endKey !== preStartKey) wx.vibrateShort()
    let newList = await sort(startKey, endKey, list)
    context.setData({
      [sortArr]: newList
    })
    // 限制手动范围
    // if(key < 0 || key > lists.length - 1 ) return lists
  }
  end(e) {
    const {list: sortArr, context} = this.options
    preStartKey = -1
    context.data[sortArr].sort(sortByValue('sortKey'))
    context.setData({
      [sortArr]: context.data[sortArr],
      [`${sortArr}_tranY`]: 0
    })
  }
  resetDomInfo(scrolltop) {
    const that = this
    let {wrapDom, itemDom} = this.options
    let query = wx.createSelectorQuery()
    query.select(wrapDom).boundingClientRect()
    query.select(itemDom).boundingClientRect()
    query.exec(res => {
      res[0].top += scrolltop
      that.options.wrapInfo = res[0]
      that.options.itemInfo = res[1]
    })
  }
}

/**
* 根据 startKey 和 endKey 去重新计算每一项 sortKey
*/
function sort(startKey, endKey, list) {
  return new Promise(async resolve => {
    const type = startKey < endKey ? 'reduce' : 'add'
    list.map(item => {
      const {sortKey} = item
      if(type === 'reduce') { // 正序拖动
        if(sortKey > startKey && sortKey <= endKey) {
          item.sortKey--
        } else if(sortKey === startKey) {
          item.sortKey = endKey
        }
      } else if(type === 'add') { // 倒序拖动
        if(sortKey >= endKey && sortKey < startKey) {
          item.sortKey++
        } else if(sortKey === startKey) {
          item.sortKey = endKey
        }
      }
      return item
    })
    
    // list.map((item) => {
    //   if (startKey < endKey) { // 正序拖动
    //     if (item.sortKey > startKey && item.sortKey <= endKey) {
    //       item.sortKey--;
    //     } else if (item.sortKey === startKey) {
    //       item.sortKey = endKey;
    //     }
    //   } else if (startKey > endKey) { // 倒序拖动
    //     if (item.sortKey >= endKey && item.sortKey < startKey) {
    //       item.sortKey = excludeFix(item.sortKey + 1, startKey, 'add');
    //     } else if (item.sortKey === startKey) {
    //       item.sortKey = endKey;
    //     }
    //   }
    //   return item;
    // });
    preStartKey = endKey
    const newlist = await updateList(list)
    resolve(newlist)
  })

  
  list.map((item) => {
    if (startKey < endKey) { // 正序拖动
      if (item.sortKey > startKey && item.sortKey <= endKey) {
        item.sortKey = excludeFix(item.sortKey - 1, startKey, 'reduce');
      } else if (item.sortKey === startKey) {
        item.sortKey = endKey;
      }
      return item;
    } else if (startKey > endKey) { // 倒序拖动
      if (item.sortKey >= endKey && item.sortKey < startKey) {
        item.sortKey = excludeFix(item.sortKey + 1, startKey, 'add');
      } else if (item.sortKey === startKey) {
        item.sortKey = endKey;
      }
      return item;
    }
  });
}

function updateList(data, vibrate = true) {
  return new Promise(resolve => {
    let list = data.map((item, index) => {
      item.tranX = `${item.sortKey * 100}%`
      item.tranY = `${Math.floor(item.sortKey) * 100}%`
      return item;
    })
    resolve(list)
  })
}

function excludeFix(sortKey, startKey, type) {
  if (sortKey === startKey) return startKey;
  let _sortKey = type === 'reduce' ? sortKey - 1 : sortKey + 1;
  return _sortKey;
}

function sortByValue(attr, by) {
  by = by === undefined || by ? 1 : -1
  return (a, b) => {
    a = a[attr]
    b = b[attr]
    return a < b ? by = -1 : by = 1
  }
}

/**
 * 版本号比较
 */
const compareVersion = (v1, v2) => {
	v1 = v1.split('.')
	v2 = v2.split('.')
	const len = Math.max(v1.length, v2.length)
	while (v1.length < len) {
		v1.push('0')
	}
	while (v2.length < len) {
		v2.push('0')
	}
	for (let i = 0; i < len; i++) {
		const num1 = parseInt(v1[i])
		const num2 = parseInt(v2[i])
		if (num1 > num2) {
			return 1
		} else if (num1 < num2) {
			return -1
		}
	}
	return 0
}

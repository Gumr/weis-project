// component/refresh/refresh.js
const app = getApp()
const PULL_DEFAULT = -1
const PULL_LT_HEIGHT = 1
const PULL_GT_HEIGHT = 2
const PULL_REFRESHING = 0
let finalY = 0
let platform = 'ios', scale = 375/ wx.getSystemInfoSync().windowWidth*2
Component({
  /**
   * 启用插槽
   */
  options:{
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    successed: { // 下拉刷新成功
      type: Boolean,
      value: false
    },
    allloaded: { // 上拉加载全部加载完毕
      type: Boolean,
      value: false
    },
    pulldownDistance: { // 下拉距离
      type: Number,
      value: '90'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pullState: PULL_DEFAULT, // 刷新状态 -1:默认  1:开始下拉  2: 达到下拉最大距离  0: 正在刷新
    refreshHeight: 0, // 下拉高度
    scrollTop: 0
  },
  created: function() {
    platform = wx.getSystemInfoSync().platform
    scale =  wx.getSystemInfoSync().windowWidth / 375 *2
  },
  /**
   * 组件的方法列表
   */
  methods: {
    touchStart(e) {
      finalY = e.touches[0].pageY
    },
    touchMove(e) {
      const {pulldownDistance} = this.properties
      const pageY = e.touches[0].pageY
      const offsetY = pageY - finalY
      if( this.data.scrollTop > 0 || offsetY < 0 ) return
      if(offsetY >= pulldownDistance) {
        this.setData({
          refreshHeight: pulldownDistance,
          pullState: PULL_GT_HEIGHT
        })
      } else {
        this.setData({
          refreshHeight: offsetY,
          pullState: PULL_LT_HEIGHT
        })
      }
    },
    touchEnd(e) {
      const {refreshHeight} = this.data, {pulldownDistance} = this.properties
      if(refreshHeight >= pulldownDistance) {
        this.setData({
          pullState: PULL_REFRESHING
        }, () => {
          this.triggerEvent('handleRefresh', {success: () => {
            this.stopPullRefresh()
          }})
        })
      } else {
        this.setData({
          pullState: PULL_DEFAULT,
          refreshHeight: 0
        })
      }
    },
    //停止刷新
    stopPullRefresh() {
      setTimeout(() => {
        this.setData({
          pullState: PULL_DEFAULT,
          refreshHeight: 0
        }, setTimeout(() => {
          this.setData({
            successed: false
          })
        }, 600))
      }, 500)
    },
    //页面滚动
    onPageScroll: function(e) {
      const {pullState} = this.data
      this.data.scrollTop = e.scrollTop

      if(e.scrollTop > 0 && pullState !== PULL_DEFAULT) {
        if (this.data.refreshHeight - scale * e.scrollTop < this.properties.pulldownDistance) {
          this.setData({
            pullState: PULL_LT_HEIGHT
          })
        } else {
          this.setData({
            pullState: PULL_GT_HEIGHT
          })
        }
      }
    },
  }
})
// pages/cookDetail/cookDetail.js
import {formatDate, long2Timestamp, switch2Chinese} from '../../utils/util'
import BasicService from '../../service/BasicService'
import CookService from '../../service/CookService'
import {querySelect, getImageInfo} from '../../utils/basic'
const basicService = new BasicService()
const cookService = new CookService()
const getDate = formatDate('Y-M-D')
const getMonthday = formatDate('MD')
const long2Timestamp24 = long2Timestamp(24)

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isFullScreen: app.globalData.isFullScreen,
    recipesDetail: {},
    activityBean: {},
    foodSku: {},
    commentTotal: 0,
    humanInfo: {},
    popupFlag: false,
    back: '', // 返回位置
    from: '00', // 根据不同入口控制状态显示范围，00不显示状态、01全部显示、02只显示投票中
    showMore: true,
    statusNull: false, //提示条是否无内容
    activityBean: null,
    showBackHome: false,
    showComments: false,
    cookid: '',
    showKbPublish: false,
    comment: null,
    isCurrentPhase: false,
    loginInfo: {},
    navtype: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.$id = options.id
    this.$index = +options.index
    this.$subIndex = +options.subIndex
    this.setData({
      back: options.back,
      from: options.from,
      cookid: this.$id,
      loginInfo: app.globalData.loginInfo
    })
    app.userInfoReadyCallback = () => {
      this.setData({
        loginInfo: app.globalData.loginInfo
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const pages = getCurrentPages()
    this.setData({
      showBackHome: pages.length > 1 ? false : true
    })
    this.$comment = this.selectComponent('#comment')
    this.queryRecipesById()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  voteRecipes() {
    app.checkLogin(() => {
      let {recipesDetail: {trId, vote}, recipesDetail, from} = this.data
      if(!recipesDetail.canVote) return // 已过投票期不可投票
      wx.vibrateShort();
      cookService.voteRecipes({
        trId: trId,
        trState: vote ? 0 : 1
      }).then(res => {
        if(res.errCode === 0) {
          recipesDetail.vote = !vote
          vote ? recipesDetail.trVoteNumber-- : recipesDetail.trVoteNumber++
  
          const pages =  getCurrentPages()
          if(pages.length >= 2) {
            const prepage = pages[pages.length - 2]
            if(pages[pages.length - 2].route.includes('leaderboard')) {
              const keys = `ranklist[${this.$index}]`
              pages[pages.length -2].setData({
                [keys]: recipesDetail
              })
            } else {
              let searched = false
              const {cookList} = prepage.data
              try {
                cookList.forEach((item, index) => {
                  if(searched) return false
                  item.forEach((subItem, subIndex) => {
                    if(subItem.trId === trId) {
                      const keys = `cookList[${index}][${subIndex}]`
                      searched = true
                      prepage.setData({
                        [keys]: recipesDetail
                      })
                      throw new Error("LoopTerminates");
                    }
                  })
                })
              } catch (e) {
                if (e.message !== "LoopTerminates") throw e;
              }
            }
          }
          this.setData({
            recipesDetail
          })
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none'
          })
        }
      })
    })
  },
  //收藏&取消收藏
  collectRecipes() {
    let {recipesDetail: {trId, collect}, recipesDetail} = this.data
    app.checkLogin(() => {
      cookService.collectRecipes({
        trId,
        trState: collect ? 0 : 1
      }).then(res => {
        if(res.errCode === 0) {
          const {result} = res.obj
          if(result) {
            recipesDetail.collect = !collect
            collect ? recipesDetail.trCollectNumber-- : recipesDetail.trCollectNumber++
            this.setData({
              recipesDetail
            })
          }
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none'
          })
        }
      })
    })
  },
  cancelDeleteCook() {
    this.setData({
      deleteFlag: false
    })
  },
  deleteCook() {
    cookService.deleteRecipesById({
      trId: this.$id
    }).then(res => {
      if(res.errCode === 0) {
        if(res.obj.result != 0) {
          wx.showToast({
            title: '食谱已删除',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack()
            const pages =  getCurrentPages();
            let which = pages[pages.length -2].data.nowTab
            pages[pages.length - 2].switchTab({currentTarget: {dataset: {index: which}}})
          }, 1000)
        } else {
          wx.showToast({
            title: '删除失败，请重试',
            icon: 'none'
          })
        }
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none'
        })
      }
      this.setData({
        deleteFlag: false
      })
    })
  },
  queryRecipesById() {
    cookService.queryRecipesById({
      trId: this.$id
    }).then(res => {
      if(res.errCode === 0) {
        const now = +new Date()
        let {humanInfo, from} = this.data
        let {recipesDetail, commentTotal, activityBean, foodSku, recipesDetail: {follow, headImgUrl, uname, trUid, cook}, isCurrentPhase} = res.obj
        const currentStatus = recipesDetail.trAuditResult
        recipesDetail.trPractice = JSON.parse(recipesDetail.trPractice)
        recipesDetail.trSeasoning = JSON.parse(recipesDetail.trSeasoning)
        recipesDetail.trCreateTime = getDate(recipesDetail.trCreateTime)
        recipesDetail.trRanking = switch2Chinese(recipesDetail.trRanking)
        // 显示投票按钮：05:投票中、06:终止投票、07:研发中、08:已上架、09:已下架
        recipesDetail.showVote = Number(currentStatus) >= 5 ? true : false
        recipesDetail.canVote = currentStatus === '05' ? true : false

        //显示审核通过前状态
        if(currentStatus === '01') { //待审核
          recipesDetail.preVoting = activityBean ? `(${getMonthday(long2Timestamp24(activityBean.taStartAudit))}-${getMonthday(long2Timestamp24(activityBean.taEndAudit))}第${switch2Chinese(activityBean.taPhase)}期菜谱统一进行审核)` : '' 
        } else if(currentStatus === '02' || currentStatus === '04') {
          recipesDetail.preVoting = activityBean ? `(${getMonthday(long2Timestamp24(activityBean.taStartVote))}会出榜单，敬请关注)` : '' // 审核中
        } else if(currentStatus === '03') {
          recipesDetail.preVoting = `未通过审核(${recipesDetail.trNote})`
        } else recipesDetail.preVoting = ''

        if(activityBean) {
          activityBean.taStartAudit = getMonthday(long2Timestamp24(activityBean.taStartAudit))
          activityBean.taEndAudit = getMonthday(long2Timestamp24(activityBean.taEndAudit))
          this.$term = activityBean.taPhase
          activityBean.taPhase = switch2Chinese(activityBean.taPhase)
          activityBean.trNote = !activityBean.trNote ? '' : `(${activityBean.trNote})`
        }
        foodSku && (foodSku.skuImgUrl = JSON.parse(foodSku.skuImgUrl))
        foodSku && (foodSku.publishTime = getMonthday(foodSku.publishTime))
        humanInfo = {follow, headImgUrl, uname, trUid, cook}
        this.setData({
          isCurrentPhase,
          recipesDetail,
          activityBean,
          foodSku,
          commentTotal,
          humanInfo,
          showMore: (recipesDetail.cook && currentStatus === '00') || (from === '01' && !recipesDetail.cook && (currentStatus === '00' || currentStatus === '01' || currentStatus === '03')) ? true : false// 可修改可删除：01:待审核、03:未通过审核、00:违规被禁
        }, () => {
          let statusNull = false
          if(from === '02') {
            statusNull = currentStatus !== '05' ? true : false
          } else if(from === '01') {
            statusNull = currentStatus === '06' || currentStatus === '09' ? true : false
          } else statusNull = true
          this.setData({
            statusNull
          })
        })
      } else {
        wx.navigateBack()
      }
    })
  },
  handlePopupEvent(e) {
    const {type} = e.currentTarget.dataset
    if(type === 'del') {
      this.setData({
        deleteFlag: true,
        popupFlag: false
      })
    } else {
      this.setData({
        popupFlag: false
      }, () => {
        wx.navigateTo({
          url: `/pages/uploadCook/uploadCook?id=${this.$id}`
        })
      })
    }
  },
  updateFollow(e) {
    const {humanInfo: {trUid, follow}} = this.data
    app.checkLogin(() => {
      basicService.updateFollow({
        followUid: trUid,
        flag: 'follow'
      }).then(res => {
        const {result} = res.obj
        if(result) {
          this.setData({
            ['humanInfo.follow']: !follow
          })
        }
      })
    })
  },
  togglePopup() {
    this.setData({
      popupFlag: !this.data.popupFlag
    })
  },
  previewImage(e) {
    const {index, type}= e.currentTarget.dataset
    const {recipesDetail: {trPractice, trCoverImageUrl}} = this.data
    let urls = []
    urls = type === 'main' ? [trCoverImageUrl] : trPractice.map(item =>item.stepImageUrl)
    wx.previewImage({
      current: urls[index], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  toUserInfo(e) {
    const {humanInfo: {trUid, uname, headImgUrl, sex}} = this.data
    app.checkLogin(() => {
      wx.navigateTo({
        url: `/pages/userInfo/userInfo?uid=${trUid}&uname=${uname}&avatar=${headImgUrl}&sex=${sex}`
      })
    })
  },
  toLeaderboard() {
    const {isCurrentPhase, activityBean: {taEndVote}} = this.data
    const url = isCurrentPhase ? `/pages/leaderboard/leaderboard?term=${this.$term}&endvote=${taEndVote}` : `/pages/preLeaderboard/preLeaderboard?term=${this.$term}`
    app.checkLogin(() => {
      wx.navigateTo({
        url
      })
    })
  },
  // 跳转数搭|饮食小程序
  async jumpToMini() {
    const {foodSku: {tfsId}} = this.data
    const userInfo = await app.queryUserInfo()
    // const {userInfo: {isCounselor}} = app.globalData
    if(userInfo.isCounselor) {
      wx.navigateToMiniProgram({
        appId: 'wx237bd451081d52b5',
        // envVersion: 'trial',
        path: `/pages/predefine/goodsDetail/goodsDetail?id=${tfsId}&type=detail`
      })
    } else {
      wx.navigateToMiniProgram({
        appId: 'wxf5247c7b4b8817a0',
        // envVersion: 'trial',
        path: `/pages/predefine/goodsDetail/goodsDetail?id=${tfsId}&type=detail`
      })
    }
  },
  onShareAppMessage: function (res) {
    const {recipesDetail: {trName}} = this.data
    // if (res.from === 'button') {
    //   console.log(res.target)
    // }
    this.addShareRecord()
    return {
      title: trName,
      path: `/pages/cookDetail/cookDetail?id=${this.$id}`,
      imageUrl: this.data.recipesDetail.trCoverImageUrl,
      success: function (res) {
        console.log('成功', res)
      }
    }
  },
  async drawShareImg() {
    const that = this
    const {recipesDetail: {trCoverImageUrl}} = this.data
    const {path, width: imgWidth, height: imgHeight} = await getImageInfo(trCoverImageUrl)
    const {width: iconWidth, height: iconHeight} = await getImageInfo('/images/icon_video_play_s.png')
    const {systemInfo: {windowWidth}} = app.globalData
    const rate = 750 / windowWidth
    wx.createSelectorQuery().select('#shareCanvas').boundingClientRect(function (rect) {
      const {width, height} = rect
      //创建一个canvas对象
      const ctx = wx.createCanvasContext('myCanvas', that)
      // 绘制背景图
      ctx.drawImage(path, 0, 0, width, width * imgHeight / imgWidth)
      ctx.setFillStyle("rgba(255,255,255,0)")
      ctx.fillRect(0, 0, width, height)
      ctx.clip()
      ctx.save()
      ctx.drawImage('/images/icon_video_play_s.png', width / 2 - iconWidth, height / 2 - iconHeight, 70, 70)
      ctx.draw()
    }).exec()
  },
  addShareRecord() {
    basicService.addShareRecord({
      trId: this.$id
    })
  },
  showCommentsFn() {
    app.checkLogin(() => {
      this.setData({
        showKbPublish: true
      })
      this.$comment.setData({
        showKbPublish: true,
        placeholderTxt: '喜欢评论的人，做菜一定超好吃~'
      })
      this.$comment.$type = '00'
    })
  },
  hideKbPublish() {
    this.setData({
      showKbPublish: false
    })
  },
  async scrollToComment() {
    const res = await querySelect('.container')
    wx.pageScrollTo({
      scrollTop: res[0].height - app.globalData.navBarHeight,
      duration: 300
    })
  },
  fullscreenchange(event) {
    const {fullScreen} = event.detail
    this.setData({
      navtype: !fullScreen
    })
  },
  onPageScroll(e) {
    const {scrollTop} = e
    const cxt = wx.createVideoContext('video', this)
    if(scrollTop >= 30) {
      cxt.pause()
    } else {
      cxt.play()
    }
  },
  backEvent() {
    const {back} = this.data
    if(back === 'home') {
      wx.switchTab({
        url: '/pages/index/index'
      })
    } else {
      wx.navigateBack()
    }
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})
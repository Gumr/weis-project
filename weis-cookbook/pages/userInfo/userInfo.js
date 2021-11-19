// pages/userInfo/userInfo.js
import CookService from '../../service/CookService'
const cookService = new CookService()
import BasicService from '../../service/BasicService'
const basicService = new BasicService()
import {waterfall} from '../../lib/waterfall/waterfall'
// let leftHeight = 0, rightHeight = 0, column1 = [], column2 = []
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    originData: [],
    cookList: [[], []],
    navBarHeight: 0,
    uname: '',
    avatar: '',
    sex: 1,
    follow: null,
    _self: false,
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.$pageNo = 1
    this.$pageSize = 10
    this.$uid = options.uid
    // leftHeight = 0, rightHeight = 0, column1 = [], column2 = []
    this.setData({
      uname: options.uname,
      avatar: options.avatar,
      sex: options.sex,
      _self: app.globalData.userInfo.headImgUrl === options.avatar ? true : false
    })
    this.queryUserInfo()
    this.getMyCook()
    this.queryMyFollowAndFansNumber()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      navBarHeight: app.globalData.navBarHeight
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  voteRecipes(e) {
    let {cookList} = this.data
    const {id, status, index, subindex} = e.currentTarget.dataset
    wx.vibrateShort();
    cookService.voteRecipes({
      trId: id,
      trState: status ? 0 : 1
    }).then(res => {
      if(res.errCode === 0) {
        cookList[index][subindex].vote = !status
        status ? cookList[index][subindex].trVoteNumber-- : cookList[index][subindex].trVoteNumber++
        this.setData({
          cookList
        })
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none'
        })
      }
    })
  },
  updateFollow() {
    const {follow} = this.data
    if(this.data._self) return
    basicService.updateFollow({
      followUid: this.$uid,
      flag: 'follow'
    }).then(res => {
      const {result} = res.obj
      if(result) {
        // wx.showToast({
        //   title: status === 1 ? '成功关注' : '已取消关注',
        //   icon: 'none'
        // })
        this.$pageNo=1
        this.setData({
          follow: !follow
        })
        this.queryMyFollowAndFansNumber()
      }
    })
  },
  // 查看用户的食谱
  getMyCook() {
    cookService.getMyCook({
      uid: this.$uid,
      pageNo: this.$pageNo,
      pageSize: this.$pageSize
    }).then(res => {
      if(res.errCode === 0) {
        const {recipesList, isCook} = res.obj
        let filterList = []
        if(recipesList.length === 0) {
          if(this.$pageNo > 1) {
            this.$pageNo--
          }
        } else {
          recipesList.forEach(item => {
            if(item.trAuditResult !== '00') {
              filterList.push(item)
            }
          })
          this.setData({
            originData: filterList,
            isCook
          }, () => {
            waterfall(this)
          })
        }
      }
    })
  },
  toCookDetail(e) {
    const {id, index, subindex} = e.currentTarget.dataset
    app.checkLogin(() => {
      wx.navigateTo({
        url: `/pages/cookDetail/cookDetail?id=${id}&index=${index}&subIndex=${subindex}`
      })
    })
  },
  queryMyFollowAndFansNumber() {
    basicService.queryMyFollowAndFansNumber({
      uid: this.$uid
    }).then(res => {
      if(res.errCode === 0) {
        this.setData({
          followNum: res.obj.followNum,
          fans: res.obj.fans,
          follow: res.obj.follow == undefined ? null : res.obj.follow
        })
      }
    })
  },
  queryUserInfo() {
    basicService.queryUserInfo({
      uid: this.$uid
    }).then(res => {
      if(res.errCode === 0) {
        let userInfos = res.obj
        let { userProfile} = userInfos
        userProfile.sex = userProfile.sex === 0 ? userInfos.sex : userProfile.sex
        this.setData({
          userInfo: userInfos
        })
      }
    })
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
    const {originData} = this.data
    this.$pageNo++
    this.getMyCook()
  }
})
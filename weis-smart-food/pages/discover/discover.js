// pages/discover/discover.js
import apiRequest from '../../service/index';
import {
  loginPromise,
  isLoginClick,
  judgeSubAccount,
  showDialog,
  saveUseLog
} from '../../utils/common'
import {
  getStorage
} from '../../utils/storage';
const app = getApp()
import {
  debounce,
} from '../../utils/throttle';
import {
  categoryMap
} from '../../utils/map'
import day from '../../libs/day';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab: [{
    //   name: '维粉饭圈',
    // },{
    //   name: '营养课堂',
    // },{
    //   name: '企业优惠',
    // },{
    //   name: '减脂增肌',
    // },{
    //   name: '慢病康复',
    // },{
    //   name: '少儿成长',
    // }],
    tab: [{
      name: '维粉饭圈',
    },{
      name: '营养课堂',
    },{
      name: '维士星故事',
    },{
      name: '专家在线',
    }],
    activeIdx: 0,//选中tab下标
    scrollIndex: 'scroll-0',
    newDishes: [],
    dynamic: [],
    categoryMap,
    // 营养课堂
    // article: [
    //   {
    //     img: 'https://prodstatic.weis1606.cn/api/smartFood/discover/find_card_life@2x.png',
    //     catalogue: '100003',
    //     title: '营养和生活',
    //   },
    //   {
    //     img: 'https://prodstatic.weis1606.cn/api/smartFood/discover/find_card_thin@2x.png',
    //     catalogue: '100001',
    //     title: '营养和瘦身',
    //   },
    //   {
    //     img: 'https://prodstatic.weis1606.cn/api/smartFood/discover/find_card_disease@2x.png',
    //     catalogue: '100002',
    //     title: '营养和疾病',
    //   }
    // ],
    // 营养课堂
    video: [],
    // 维士星故事
    userStory: [],
    // 专家在线
    expertOnline: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.isOrderClick = true; // 是否“点赞”可点击，控制频繁点赞
    debugger
    this.setData({
      navStatusHeight: app.globalData.navStatusHeight,
      uncheck_vote: app.globalData.uncheck_vote
    })
    loginPromise.then(async (res) => {
      // 后台配置弹窗显示
      showDialog('01',this);
      this.setData({
        uid: res.uid,
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    loginPromise.then(async () => {
      const loginInfo = getStorage('loginInfo');
      this.setData({
        loginInfo,
        // subToken: getStorage('subToken'),
      })
      
      // 判断子账户是否有效
      judgeSubAccount()
      app.checkUnread()
      
      // this.queryCoachInfo() // 教练专区
      // this.queryPublicityCopy()//减脂增肌
      // this.chronic()//慢病康复
      // this.juvenile()//少儿成长
      this.queryUnReadMsg() // 查询我饭圈的所有未读消息
      this.newFoodSkuList() // 饭圈新菜列表
      this.queryDynamicByType() // 动态列表数据
      this.queryFanCircleDynamicPublishRoot() // 查询饭圈动态发布权限
      // this.queryVideos() // 营养课堂-旧
      this.queryNutrition() // 营养课堂
      this.queryUserStory() // 维士星故事
      this.queryShowRoleInfo() // 专家在线
    })
  },
  login: isLoginClick(function () {

  }),
  tab(e){
    let activeIdx = this.data.activeIdx;
    let index = e.currentTarget.dataset.index;
    if(index == activeIdx){
      return
    }
    this.setData({
      activeIdx: index,
      scrollIndex: index == 0 || index == 1 ? `scroll-0` : `scroll-4`
    })
  },
  // ------------------------------维粉饭圈------------------------------
  // 链接点击
  linkTap(e) {
    let { item1 } = e.currentTarget.dataset;
    if(item1.isUrl) {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${item1.text}`,
      });
    }
  },
  // 查询我饭圈的所有未读消息
  queryUnReadMsg() {
    apiRequest.queryUnReadMsg().then((res) => {
      if (res.errCode === 0) {
        this.setData({
          unReadMsgCount: res.obj.unReadMsgCount,
        })
      }
    })
  },
  // 设置我所有未读的消息为已读
  setDoReadMsg() {
    apiRequest.setDoReadMsg()
    .then((res) => {
    })
  },
  // 导航栏左上角-消息
  tapcustom() {
    wx.navigateTo({
      url: `/pages/packageDiscover/dynamic/newsCenter/newsCenter`
    })
    if(this.data.unReadMsgCount > 0) {
      this.setDoReadMsg()
    }
  },
  goDishesVote() {
    apiRequest.redPointToVoteSku({
      optionFlag: 1
    }).then(res => {
      app.globalData.uncheck_vote = false
      this.setData({
        uncheck_vote: false
      })
      wx.hideTabBarRedDot({
        index: 2
      })
      wx.navigateTo({
        url: '/pages/packageDiscover/dishesVote/dishesVote'
      })
    })
  },
  // 饭圈新菜列表
  newFoodSkuList() {
    apiRequest.newFoodSkuList({
      pageNO: 1,// 页数
      pageSize: 9999,// 长度
    }).then((res) => {
      if (res.errCode === 0) {
        let {newSkuList, subscribe} = res.obj;
        this.setData({
          newDishes: newSkuList,
          subscribe,
        })
      }
    })
  },
  goodsDetail(e) {
    let { id, index, tfsstt } = e.currentTarget.dataset;
    let { subscribe, newDishes } = this.data;
    let obj = {
      from: 'discover',
      id,
      orderMethod: '01',
      type: 'detail',
      subscribe,
      tfsStt: tfsstt,
      // category: food.tdcCategory,
    }
    // 订阅菜品提醒-参数
    newDishes = newDishes[index];
    let newDishesItem = {
      tmcsBeginDate: newDishes.tmcsBeginDate, // 菜品开售时间
      tmcsEndDate: newDishes.tmcsEndDate, // 菜品结束时间
      tfsSuggestedSkuname: newDishes.tfsSuggestedSkuname, // 菜品名称
      tfsCid: newDishes.tfsCid, // 菜品cid
    }
    wx.navigateTo({
      url: `/pages/packageOrder/goodsDetail/goodsDetail?param=${JSON.stringify(obj)}&newDishesItem=${JSON.stringify(newDishesItem)}`,
    });
  },
  // 动态列表数据
  queryDynamicByType() {
    apiRequest.queryDynamicByType({
      pageNO: 1,// 页数
      pageSize: 9999,// 长度
      queryType: 'QUERY_COMMON_DYNAMIC_TYPE',// 查询公共动态
    }).then((res) => {
      if (res.errCode === 0) {
        let regSign = /^#http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?#$/; // 包含#号url
        let reg = /^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/; // 不含#号url
        this.setData({
          dynamic: res.obj.fanCircleDynamicList.map(item => {
            item.tbdCtimeFilter = day(item.tbdCtime).format('YYYY.MM.DD')
            // 链接高亮可跳转
            // 包含#号，可能含有url
            if(item.tbdDynamicText.indexOf("#") != -1) {
              item.tbdDynamicTextArr = item.tbdDynamicText.split('#').filter(s => s && s.trim())
              item.tbdDynamicTextArr = item.tbdDynamicTextArr.map(item1 => {
                // 只有包含#号的url
                if(regSign.test(item.tbdDynamicText)) {
                  return {
                    text: item1,
                    isUrl: true
                  }
                } else {
                // 包含#号的url + 其他文字内容
                  return {
                    text: item1,
                    isUrl: reg.test(item1)
                  }
                }
              })
            }else {
              // 不含#号，没url
              item.tbdDynamicTextArr = [{
                text: item.tbdDynamicText,
                isUrl: false
              }]
            }
            return item
          }),
        }, () => {
          this.isOrderClick = true; // 点赞结果返回，才可再次点赞
        })
      }
    })
  },
  // 查询饭圈动态发布权限
  queryFanCircleDynamicPublishRoot() {
    apiRequest.queryFanCircleDynamicPublishRoot().then((res) => {
      if (res.errCode === 0) {
        this.setData({
          canPublish: res.obj.canPublish // 是否有发布动态权限
        })
        wx.setStorageSync('canPublish', this.data.canPublish);
      }
    })
  },
  // 动态详情
  dynamicDetail(e) {
    let { index } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/packageDiscover/dynamic/dynamicDetail/dynamicDetail?index=${index}`,
    });
  },
  // 发布动态
  release() {
    wx.navigateTo({
      url: `/pages/packageDiscover/dynamic/dynamicRelease/dynamicRelease`,
    });
  },
  // 删除
  delete(e) {
    let { tbdid } = e.currentTarget.dataset;
    this.setData({
      showDelete: true,
      tbdIdDelete: tbdid
    })
  },
  // 确定删除
  sureDelete() {
    apiRequest.delDynamic({
      dynamicId: this.data.tbdIdDelete
    }).then((res) => {
      if (res.errCode === 0) {
        this.setData({
          showDelete: false
        })
        this.queryDynamicByType()
      }
    })
  },
  // 点赞
  order(e) {
    if(!this.isOrderClick) {
      return
    }
    this.isOrderClick = false;
    const { likestatus, tbdid } = e.currentTarget.dataset;
    apiRequest.clickLikeButton({
      likeType: likestatus ? 'CANCEL_LIKE_DYNAMIC_TYPE' : 'LIKE_DYNAMIC_TYPE',
      bodyId: tbdid
    }).then((res) => {
      if (res.errCode === 0) {
       this.queryDynamicByType()
      }
    })
  },
  
  // ------------------------------营养课堂-旧------------------------------
  // // 查询视频
  // queryVideos() {
  //   apiRequest.queryVideos().then((res) => {
  //     if (res.errCode === 0) {
  //       this.setData({
  //         video: res.obj.discoverVideos,
  //       })
  //     }
  //   })
  // },
  // // 百科文章
  // article(e) {
  //   let { title, catalogue } = e.currentTarget.dataset;
  //   wx.navigateTo({
  //     url: `/pages/packageDiscover/schoolroom/article/article?title=${title}&catalogue=${catalogue}`
  //   })
  // },
  // // 精彩视频
  // video(e) {
  //   let { item } = e.currentTarget.dataset;
  //   wx.navigateTo({
  //     url: `/pages/packageDiscover/schoolroom/video/video?item=${JSON.stringify(item)}`
  //   })
  // },
  // ------------------------------营养课堂------------------------------
  // 查询视频
  queryNutrition() {
    apiRequest.queryNutrition().then((res) => {
      if (res.errCode === 0) {
        this.setData({
          video: res.obj.result.map((item, index) => {
            item.show = index % 5 == 0?'large': 'small'
            return item
          }),
        })
      }
    })
  },
  video(e) {
    let { item } = e.currentTarget.dataset;
    // 文章
    if(item.contentType == '10') {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${item.externalLink}`,
      });
      return
    }
    // 视频
    if(item.contentType == '20') {
      item = {
        video: item.videoUrl,
        name: item.mainTitle,
      }
      wx.navigateTo({
        url: `/pages/packageDiscover/schoolroom/video/video?item=${JSON.stringify(item)}`
      })
      return
    }
  },
  // ------------------------------维士星故事------------------------------
  // 维士星故事
  queryUserStory() {
    apiRequest.queryUserStory().then((res) => {
      if (res.errCode === 0) {
        this.setData({
          userStory: res.obj.result,
        })
      }
    })
  },
  userStory(e) {
    let { item } = e.currentTarget.dataset;
    // 文章
    if(item.contentType == '10') {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${item.externalLink}`,
      });
      return
    }
    // 视频
    if(item.contentType == '20') {
      item = {
        video: item.videoUrl,
        name: item.mainTitle,
      }
      wx.navigateTo({
        url: `/pages/packageDiscover/schoolroom/video/video?item=${JSON.stringify(item)}`
      })
      return
    }
  },
  // ------------------------------专家在线------------------------------
  // 专家在线
  queryShowRoleInfo() {
    apiRequest.queryShowRoleInfo().then((res) => {
      if (res.errCode === 0) {
        this.setData({
          expertOnline: res.obj.roleInfoDTOS,
        })
      }
    })
  },
  // 专家在线-点击跳转详情
  expertTap(evt) {
    const { index } = evt.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/packageDiscover/expert/expertDetail/expertDetail?index=${index}`
    })
  },
  // 客服
  contact(){
    wx.navigateTo({
      url: '/pages/mineBox/contact/contact',
    });
  },
// ------------------------------减脂增肌------------------------------
// 教练专区-点击跳转详情
coachTap(evt) {
  const { index } = evt.currentTarget.dataset;
  const item = this.data.coach[index];
  wx.navigateTo({
    url: `/pages/packageDiscover/coach/coachDetail/coachDetail?tcaId=${item.tcaId}`
  })
},
// 教练专区-数据
queryCoachInfo() {
  apiRequest.queryCoachInfo({
    pageSize: 9999,
    pageNo: 1,
  }).then((res) => {
    if (res.errCode === 0) {
      const { coachDTO } = res.obj;
      this.setData({
        coach: coachDTO.map(item => {
          item.star = item.star?item.star.toFixed(1):item.star
          item.domain = item.domainList.join("·")
          return item
        })
      })
    }
  })
},

  coachAll(){
    wx.navigateTo({
      url: '/pages/packageDiscover/coach/coachAll/coachAll',
    });  
  },

  queryPublicityCopy(){
    // 参数：01 减脂增肌 02 少儿青少年 03 企业专区 04慢病住院
    apiRequest.queryPublicityCopy({
      draftsType: '02',
      limitType: '01',
      healthGoal: '01'
    }).then((res) => {
      if (res.errCode === 0) {
        const { publicityDrafts } = res.obj;
        this.setData({
          contents: publicityDrafts
        })
      }
    })
  },

  // 慢病康复
  chronic(){
    // 参数：01 减脂增肌 02 少儿青少年 03 企业专区 04慢病住院
    apiRequest.queryPublicityCopy({
      draftsType: '02',
      limitType: '01',
      healthGoal: '04'
    }).then((res) => {
      if (res.errCode === 0) {
        const { publicityDrafts } = res.obj;
        this.setData({
          chronic: publicityDrafts
        })
      }
    })
  },

  juvenile(){
    // 参数：01 减脂增肌 02 少儿青少年 03 企业专区 04慢病住院
    apiRequest.queryPublicityCopy({
      draftsType: '02',
      limitType: '01',
      healthGoal: '02'
    }).then((res) => {
      if (res.errCode === 0) {
        const { publicityDrafts } = res.obj;
        this.setData({
          juvenile: publicityDrafts
        })
      }
    })
  },

  jumpPlan: isLoginClick(function (evt) {
    this.navigateTo({
      url: `/pages/packageDiscover/schemeLibrary/schemeLibrary`,
    });
  }),

  contentTap(evt) {
    const { index } = evt.currentTarget.dataset;
    const item = this.data.contents[index];
    this.navigateTo({
      url: `/pages/webview/webview?url=${item.draftUrl}`
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

  },

  /**
   * 用户点击右上角分享
   */
   onShareAppMessage: function (e) {
    const idx = (Math.random() * 3) | 0;
    const userInfo = wx.getStorageSync('userInfo');
    let headImgUrl = userInfo.headImgUrl || userInfo.avatarUrl;
    let uid = this.data.uid;
    if (e.from == "button" && e.target.dataset.type == 'openbox') {
      saveUseLog('02', this.data.discoverDialogs.id, '02');
      return {
        title: ['在吗？锦鲤朋友最高立减30元！', '再忙，也别忘了先领券再点餐~', '猜猜送你的现金券有多少钱？'][idx],
        imageUrl: 'https://prodstatic.weis1606.cn/api/market/sharebox.png',
        path: `/pages/activity/openBox/index?iuInvitedUid=${uid}&boxtype=share&scene=0717&shareimg=${headImgUrl}&invite=${uid}`,
      }
    }else{
      return {
        imageUrl: "https://prodstatic.weis1606.cn/api/smartFood/share.png",
      }
    }
  },
})
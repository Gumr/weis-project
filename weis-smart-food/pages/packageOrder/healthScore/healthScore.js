// pages/packageOrder/healthScore/healthScore.js
import Card from './model/card'
import day from '../../../libs/day'
import Draw from '../../../utils/Draw'
import apiRequest from '../../../service/index'
import ShareImage from '../../../utils/ShareImage'
import { isLoginClick, t, round, loginPromise } from '../../../utils/common'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mode: '',
    isShareBtn: true,
    drawerVisible: false,
    template: {},
    customActionStyle: {
      border: {
        borderColor: '#1A7AF8',
      },
      scale: {
        textIcon: '/palette/switch.png',
        imageIcon: '/palette/scale.png',
      },
      delete: {
        icon: '/palette/close.png',
      },
    },
    categoryStatus: {
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
      '04': '加餐',
    },
    dislogTits: {
      0: '热量可控',
      1: '营养均衡',
      2: '食物多样',
      3: '清淡少盐',
      4: '纤维充足',
    },
    dialogText: {
      '热量可控': '能量摄入是否达标：\n*能量供给不足：能量摄入低于供给标准的80%；\n*能量供给过低：能量摄入低于供给标准的60%，长期则营养不良；\n*能量供给过量：能量摄入超过供给标准，能量“过剩”导致肥胖。',
      '营养均衡': '没有不好的食物，只有不合理的膳食，其关键在于平衡，而三大供能营养素蛋白质、脂肪、碳水化合物的合理摄入是关键\n三大营养素摄入量是否达标，占比是否合理：\n*营养素合理摄入：营养素摄入量占供给标准的90%-110%；\n*营养素摄入不足：营养素摄入低于供给标准的80%；\n*营养素严重不足：营养素摄入低于供给标准的60%，影响营养平衡；\n*营养素”过剩“：营养素摄入超过供给标准的100%，长期则导致“富贵病”。',
      '食物多样': '没有任何一种食物能满足人体所需的能量及全部营养素，平衡膳食由多种食物组成，才能满足人体对各种营养需要，达到合理营养。\n膳食食物构成是否合理：\n*膳食结构合理：每日膳食包括五大类食物，食物12种以上，每餐食物3种以上；\n*膳食结构较合理：每日膳食包括四大类食物，食物10种以上，每餐食物3种以上；\n*膳食结构单调，不合理：每日膳食只包括2～3类食物，品种在10种以下，每餐食物2种以上。',
      "纤维充足": '膳食纤维作为人体的“第七大营养素”，具有重要的生理功能，对健康起着重要作用\n*《中国居民膳食指南》推荐成人每日膳食纤维摄入量为 25 g～30 g；\n*膳食纤维摄入不足，大大增加便秘、肥胖症、三高、心脑血管疾病等现代“文明病”的风险；\n*膳食纤维摄入过量，增加胃肠负担、影响矿元素的吸收利用。',
      "清淡少盐": '盐量摄入是否合理：\n*盐量摄入合理：每日盐量的摄入3-6克，每餐合理分配；\n*盐量摄入偏低：每日盐量低于3克，每餐摄入均偏少，有害健康；\n*盐量摄入偏高：每日盐量超于6克，高盐饮食，长期高钠饮食增加高血压风险。'
    },
    statusHeight: wx.getStorageSync('navStatusHeight'), //状态栏高度,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    const {index, page, invite, oid} = options
    // 订单详情进入指针
    this._index = index
    this._from = page || ''
    this._inviteUid = invite
    this._oid = oid
    this.setData({
      subInfo: wx.getStorageSync('subInfo') || {},
      showPan: options.showPan || false,//显示仪表盘
    })
    if(options.invite){
      app.globalData.inviteUid = options.invite;
    }
    if(options.scene){
      app.globalData.aldId = options.scene;
    }
    wx.hideShareMenu({}); 
    if(this.data.showPan){
      this.getData();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    loginPromise.then((res)=>{
      this.setData({
        uid: res.uid
      })
      this.getHealthScore()
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  getData(){
    const pages = getCurrentPages();
    const indexPage = pages.find(
      page => page.route === 'pages/mineBox/groupSelectMeal/index' || page.route === 'pages/index/index'
    );
    const detailPage = pages.find(
      page => page.route === 'pages/packageOrder/goodsDetail/goodsDetail'
    );
    const dialData = indexPage.data.dialData;
    const list = detailPage.data.list;//套餐数据
    dialData.carbonwaterSupply = list.recommendList[0].carbonwater;
    dialData.proteinSupply = list.recommendList[0].protein;
    dialData.fatSupply = list.recommendList[0].fat;
    dialData.energySupply = list.recommendList[0].energy;
    dialData.saltSupply = list.recommendList[0].totalSalt;
    dialData.foodTypeNum = list.recommendList[0].diversity;
    dialData.fiberSupply = list.recommendList[0].fiber;
    dialData.nutritionHealthScore = list.recommendList[0].score;
    this.setData({
      dialData
    })
  },
  
  shareScore() {
    this.setData({
      drawerVisible: true,
      mode: 'image'
    })
  },
  shareFriendTap() {
    
  },
  sharePosterTap() {
    this.setData({
      drawerVisible: false,
      paintPallette: new Card({
        data: this.data.scoreForms,
        man: this.data.humanInfoWithScore,
        skuList: this.data.skuList,
        scoreImage: this.data.scoreImage,
        codeImg: this.code
      }).palette(),
      showImg: true,
      mode: 'image'
    })
  },
  // 获取健康分
  async getHealthScore() {
    let scoreForms
    let humanInfoWithScore
    const from = ['showCateList', 'index', 'sharePlanOpen', 'orderDetail', 'orderList']
    const pages = getCurrentPages()
    // 由前页面跳转
    if(from.includes(this._from)) {
      const prePage = pages[pages.length - 2]
      humanInfoWithScore = prePage.data.humanInfoWithScore
      if(this._from === 'orderDetail') {
        scoreForms = prePage.data.scoreForms[this._index]
      } else {
        scoreForms = prePage.data.scoreForms
      }
      scoreForms.categoryText = this.data.categoryStatus[scoreForms.category]
      scoreForms.dateText = day(scoreForms.dateTime).format('MM月DD日')
    } else {
      // 分享直接打开
      const {scoreForms: sForms, info} = await this.getHealthScoreByOid()
      scoreForms = sForms
      humanInfoWithScore = info
    }
    this.setData({
      scoreForms: calcPercent(),
      isShareBtn: Boolean(this._oid) && (this.data.uid == humanInfoWithScore.uid || this.data.subInfo.tsuSubUid ==  humanInfoWithScore.uid),
      humanInfoWithScore
    })
    this.calScore();//雷达分计算
    function calcPercent() {
      const keys = ['totalEnergy', 'totalCarbonwater', 'totalProtein', 'totalFat', 'foodDiversity', 'dietaryFiber', 'totalSalt']
      keys.forEach(key => {
        const lowerKey = key.slice(0,1).toLowerCase() + key.slice(1)
        const upperKey = key.slice(0,1).toUpperCase() + key.slice(1)
        const percent = round((scoreForms.nutritionHealthDataBean[`actual${upperKey}`] / 2) / scoreForms.nutritionHealthDataBean[key] * 100)
        scoreForms[`${lowerKey}Percent`] = percent >=100 ? 100 : percent
      })
      return scoreForms
    }
    if(this.data.isShareBtn){
      this.getQrCode()
    }
    // console.log(scoreForms);
  },
  // 根据订单号查询健康分
  getHealthScoreByOid() {
    return new Promise(resolve => {
      apiRequest
      .queryUserNutritionHealthScore({
        infoComposeList: [{
          payFlag: true,
          oid: this._oid,
          fromUid: this._inviteUid
        }]
      }).then(res => {
        if(res.errCode === 0) {
          const {nutritionHealthScoreForms: scoreForms, info} = res.obj
          scoreForms.forEach(item => {
            item.dateText = day(item.dateTime).format('MM月DD日')
            item.categoryText = this.data.categoryStatus[item.category]
          })
          resolve({
            scoreForms: scoreForms[0],
            info
          })
        }
      })
    })
  },
  onImgOK(e) {
    this.imagePath = e.detail.path;
    this.setData({
      image: this.imagePath,
    });
  },
  longPressFn() {
    const that = this
    const {image} = this.data
    if (image && typeof image === 'string') {
      wx.saveImageToPhotosAlbum({
        filePath: this.imagePath,
        success(res) {
          if(res.errMsg.includes('saveImageToPhotosAlbum:ok')) {
            that.setData({
              showImg: false,
            }, () => {
              that.isCanvas();
              wx.showToast({
                icon: 'none',
                title: '保存成功'
              })
            })
          }
        }
      });
    }
  },
  showDialog(e) {
    const index = e.detail;
    this.setData({
      dialogTit: this.data.dislogTits[index],
      isShowDialog: true,
      mode: 'image'
    })
  },
  cancelShareTap() {
    this.setData({
      drawerVisible: false,
    })
    this.isCanvas();
  },
  closeDialog() {
    this.setData({
      isShowDialog: false,
    })
    this.isCanvas();
  },
  hideShare() {
    this.setData({
      showImg: false,
    })
    this.isCanvas();
  },
  calScore(){
    let scoreForms = this.data.scoreForms;
    let score = [
        {
            name: `热量可控`,
            index: 0,
            max: 30,
            value: scoreForms.intakeScore,
        },
        {
            name: '营养均衡',
            index: 1,
            max: 30,
            value: scoreForms.carbonwaterScore + scoreForms.proteinScore + scoreForms.fatScore,
        },
        {
            name: '食物多样',
            index: 2,
            max: 20,
            value: scoreForms.foodDiversityScore,
        },
        {
            name: '清淡少盐',
            index: 3,
            max: 10,
            value: scoreForms.saltScore,
        },
        {
            name: '纤维充足',
            index: 4,
            max: 10,
            value: scoreForms.dietaryFiberScore,
        }
    ];
    let skuList = scoreForms.skuInfoComposes && scoreForms.skuInfoComposes.filter((item) => {
      return item.catalogF != '100036'
    }).slice(0,10) || [];
    this.setData({
      score,
      skuList,
    })
  },

  finished(e){
    console.log(e)
    this.setData({
      scoreImage: e.detail
    })
  },

  // 页面展示canvas
  isCanvas(){
    setTimeout(()=>{
      this.setData({
        mode: ''
      })
    },200)
  },

  getQrCode(){
    apiRequest.getQrCode({
      targetPath: `/pages/index/index?invite=${this.data.uid}&scene=10440`,
      targetAppid: 'wxb41830cd88835f5c',
      scene: `10440`, //scene不同生成图片不同
    }).then((res) => {
      this.code = res.obj && res.obj.ImageUrl || '';
    })
  },

  sure(){
    let showTip = this.data.showTip;
    this.setData({
      showTip: !showTip,
      mode: showTip ? '' : 'image',
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
    // const {uid} = app.globalData
    const {scoreForms: {dateText, categoryText}, humanInfoWithScore: {uid}} = this.data
    this.setData({
      drawerVisible: false,
      mode: ''
    })
    return {
      title: `${dateText}${categoryText}营养健康得分`,
      imageUrl: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood/shareHealthScore.png',
      path: `/pages/packageOrder/healthScore/healthScore?oid=${this._oid}&invite=${uid}&scene=10440`,
    }
  }
})
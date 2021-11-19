// pages/uploadCookbook/uploadCookbook.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowTab: null,
    category: [{
      id: '02',
      img: '/images/meat.png',
      name: '蛋白质',
      example: '如牛肉，鱼肉，豆腐等'
    }, {
      id: '01',
      img: '/images/vegetable.png',
      name: '蔬菜',
      example: '如小白菜，冬瓜等'
    },  {
      id: '03',
      img: '/images/carbonwater.png',
      name: '碳水',
      example: '如面条，土豆，莲藕等'
    }],
    rules: [{
      id: 0,
      txt: '1.请按照每种菜谱的对应要求上传菜谱，以便通过审核，进入榜单'
    }, {
      id: 1,
      txt: '2.进入榜单的菜谱由大家进行统一投票'
    }, {
      id: 2,
      txt: '3.投票结束后，我们将会选榜单前四名菜品上架售卖'
    }, {
      id: 3,
      txt: '4.该菜品的六个月销售额的5‰将会作为奖金给到该菜谱的创作者'
    }, {
      id: 4,
      txt: '5.预计选中的每个菜谱能获得1200-2000元奖金'
    }],
    rulesWithProtein: [{
      id: 0,
      txt: '1.尽量用去皮去骨的肉类，符合我们营养素可检测量化的理念'
    }, {
      id: 1,
      txt: '2.尽量选用没有脂肪的肉类，符合我们低热量高营养的理念'
    }, {
      id: 2,
      txt: '3.烹饪方式较简单，便于量产'
    }],
    rulesWithVegetable: [{
      id: 0,
      txt: '1.尽量选用当季蔬菜，便于量产'
    }],
    rulesWithCarbonWater: [{
      id: 0,
      txt: '1.碳水菜品尽量去壳去皮'
    }],
    collectterm: null,
    endVoteDate: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      collectterm: wx.getStorageSync('collectterm'),
      endVoteDate: wx.getStorageSync('endCollectDate')
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  chooseCategory(e) {
    const {index}= e.currentTarget.dataset
    this.setData({
      nowTab: index
    })
  },
  uploadCook() {
    const {nowTab, category} = this.data
    if(nowTab !== null) {
      wx.navigateTo({
        url: `/pages/uploadCook/uploadCook`
      })
      wx.setStorageSync('cookCategory', category[nowTab].id)
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
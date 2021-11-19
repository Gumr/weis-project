// pages/mineAddress/mineAddress.js
import apiRequest from '../../../service/index';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgPrefix: 'https://prodstatic.weis1606.cn/api/ttmpFood/my/',
    sortStatus: {
      '1': {
        name: '家',
        class: 'home'
      },
      '2': {
        name: '公司',
        class: 'company'
      },
      '3': {
        name: '医院',
        class: 'hospital'
      },
      '4': {
        name: '学校',
        class: 'school'
      },
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      from: options.from || '',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getAddress();
  },
  // 获取地址
  getAddress: function () {
    var that = this;
    apiRequest.queryAddressListForThree({
      sortNum: '',
      dataStt: '',
    })
      .then((res) => {
        that.setData({
          addressList: res.obj.addressInfos,
        });
      })
      .catch((error) => { });
  },
  // 新增地址
  add: function () {
    tt.navigateTo({
      url: `/pages/packOne/addAddress/addAddress`,
    });
  },
  // 编辑
  edit: function (e) {
    tt.navigateTo({
      url: `/pages/packOne/addAddress/addAddress?index=${e.currentTarget.dataset.index}&type=edit`,
    });
  },
  //选择地址
  tapItem:function(e){
    if(this.data.from == 'my') {
      return
    }
    let pages = getCurrentPages();
    let prevPage = pages[ pages.length - 2 ];
    prevPage.setData({ //对上页面进行赋值
        address:this.data.addressList[e.currentTarget.dataset.index],
    });

    tt.navigateBack({
      delta: 1,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {

  },
});
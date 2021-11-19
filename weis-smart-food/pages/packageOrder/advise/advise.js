// pages/packageOrder/advise/advise.js

import apiRequest from '../../../service/index';
import { URL } from '../../../utils/request';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '意见反馈',
    selectIndex: 0,
    text: '',
    foodImage:[],
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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  // tab: function(e){
  //   let {index} = e.currentTarget.dataset;
  //   this.setData({
  //     selectIndex: index
  //   })
  // },

  desc: function(e){
    this.setData({
      text: e.detail.value
    })
  },

  // wxNum: function(e){
  //   this.setData({
  //     wxNum: e.detail.value
  //   })
  // },
  // 上传图片
  uploadImageTap: function(){
    const { foodImage } = this.data;
    if (foodImage.length >= 3) {
      wx.showToast({
        icon: 'none',
        title: '最多只可上传三张图片！'
      });
      return;
    }

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      fail: () => {
        
      },
      success: res => {
        if (res.tempFilePaths) {
          apiRequest
            .uploadFile(`${URL.api}/upload/image`, res.tempFilePaths[0], {
                flag: 'diet'
            })
            .then(response => {
              response = JSON.parse(response.data);

              if (response.errCode === 0) {
                foodImage.push({
                  image: response.obj.imageUrl
                });

                this.setData({
                    foodImage
                });
              }
            });
        }
      }
    });
  
  },
  // 删除图片
  deleteUploadImageTap: function(e){
    const { index } = e.currentTarget.dataset;
    const { foodImage } = this.data;
    foodImage.splice(index, 1);
    this.setData({
      foodImage: foodImage
    });
  },
  // 提交
  submit: function(){
    var that = this;
    let imgUrlList = [];
    let foodImage = this.data.foodImage;
    foodImage.forEach((item,index)=>{
      imgUrlList.push(item.image)
    })
    if(!that.data.text){
      wx.showToast({
        title: '反馈内容未填写',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });   
      return
    }
    apiRequest.addUserSuggest({
        type: that.data.selectIndex == 0 ? '01' : '02',
        content: that.data.text,
        wechat: that.data.wxNum,
        image: imgUrlList,
        video: that.data.video,
    })
    .then(res => {
      if(res.obj && res.obj.addResult){
        wx.switchTab({
          url: '/pages/my/my',
        });
      }else{
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
          image: '',
          duration: 1500,
          mask: false,
          success: (result)=>{
            
          },
          fail: ()=>{},
          complete: ()=>{}
        });
      }
    })
    .catch(error => {

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
  onShareAppMessage: function () {

  }
})
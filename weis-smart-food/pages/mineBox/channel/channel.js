import apiRequest from '../../../service/index';
import {getUrlParam,queryQrCodeDetail} from '../../../utils/common'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showCreate: false, // 生成渠道码
    showCode: false, // 渠道码详情
    channel: '' // 输入框的渠道码名称
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const {roleId} = this.options
    if(roleId != 100002) {
      this.queryChannelCode()
    } else {
      this.queryChannelQrCodeByUid()
    }
    this.setData({
      roleId
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

  },

  scanCode(){
    wx.scanCode({
      onlyFromCamera: false,
      // scanType: ['qrCode', 'barCode', 'datamatrix', 'pdf417'],
      success: (result) => {
        let path = result.path || '';
        let invite = path && getUrlParam('invite',path) || '';
        let scene = path && getUrlParam('scene',path) || '';
        if(path && (invite || scene)){
          queryQrCodeDetail(invite, scene).then((res)=>{
            this.setData({
              info: res.obj,
              showDialog: true
            })
          });
        }else{
          this.setData({
            showDialog: false
          })
          wx.showToast({
            title: '不属于拓展码或渠道码',
            icon: 'none',
          });
        }
      },
      fail: (result)=>{
        if(result.errMsg == 'scanCode:fail'){
          wx.showToast({
            title: '二维码格式错误',
            icon: 'none',
          });
        }
      }
    });
      
  },

  hide(){
    this.setData({
      showDialog: false
    })
  },

  // 生成渠道码
  generateFn(e) {
    let { editType: type, channelCodes, editIndex, channel } = this.data
    if (!channel) return
    let requestData = {
      name: channel,
      openMarket: '20'
    }
    if (type == 'edit') {
      requestData.id = channelCodes[editIndex].id
      requestData.code = channelCodes[editIndex].code
    }
    apiRequest.editPartnerQrcode(requestData)
    .then((res) => {
      if (res.errCode === 0) {
        this.queryChannelCode('create')
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        })
      }
    })
    this.setData({
      showCreate: false,
      channel: ''
    })
  },
  queryChannelCode(create) {
    apiRequest.queryQrcodeByUid({})
    .then(res => {
      if (res.errCode === 0) {
        const {partnerQrCodeDTOS} = res.obj
        let channelCodes = partnerQrCodeDTOS.reverse().map(item => {
          item.ctime = item.ctime.slice(0, 11).replace(/-/g, '/')
          return item
        })
        this.setData({
          channelCodes
        },()=> {
          if(create) this.showCodeFn()
        })
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        })
      }
    })
  },
  // 生成2b拓展经理的拓展二维码
  queryChannelQrCodeByUid() {
    apiRequest.queryChannelQrCodeByUid()
    .then(res => {
      this.setData({
        qrCodeUrl: res.obj.qrCodeUrl
      })
    })
  },
  showCreateFn() {
    this.setData({
      showCreate: true,
      editType: 'create'
    }, () => {
      setTimeout(() => {
        this.setData({
          focus: true,
        })
      }, 100)
    })
  },
  showCodeFn(e) {
    const index = e?e.currentTarget.dataset.index:0;
    this.setData({
      showCode: true,
      editIndex: index
    })
    // const {index} = e.currentTarget.dataset
    // this.setData({
    //   showCode: true,
    //   editIndex: index
    // })
  },
  goCustomerFn(e) {
    const {id, name} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/mineBox/customer/customer?id=${id}&name=${name}`
    })
  },
  editChannelCode() {
    const {channelCodes, editIndex} = this.data
    this.setData({
      showCode: false,
      editType: 'edit',
      showCreate: true,
      channel: channelCodes[editIndex].name
    }, () => {
      setTimeout(() => {
        this.setData({
          focus: true,
        })
      }, 100)
    })
  },
  inputFn(e) {
    this.setData({
      channel: e.detail.value
    })
  },
  hideModal() {
    this.setData({
      showCode: false,
      showCreate: false,
      channel: ''
    })
  },
  previewImg(e) {
    const {type} = e.currentTarget.dataset
    const {channelCodes, editIndex, qrCodeUrl} = this.data
    let current
    let urls
    // 内部拓展经理
    if(type === 'tz') {
      current = qrCodeUrl
      urls = [qrCodeUrl]
    } else {
      current = channelCodes[editIndex].url
      urls = [channelCodes[editIndex].url]
    }
    wx.previewImage({
      current, // 当前显示图片的http链接
      urls // 需要预览的图片http链接列表
    })
  },
  clear() {
    this.setData({
      channel: ''
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
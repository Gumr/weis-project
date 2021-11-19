// pages/packSubAccount/switchAccount/switchAccount.js
import apiRequest from '../../../service/index';
import {
  getStorage,
  setStorage,
  removeStorage
} from '../../../utils/storage'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab:[{
      name: '私人子账号'
    },{
      name: '企业子账号'
    }],
    tabIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      subInfo: getStorage('subInfo') || {},
      from: options.from || ''
    })
    // 教练点餐
    if(options.from && options.from == 'coachMeal'){
      const pages = getCurrentPages()
      this.prepage = pages[pages.length - 2];
      this.setData({
        subInfo: this.prepage.data.subInfo || {}
      })
    }
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
    this.getUserListForSubUser()
  },

  tapAccount(e){
    let index = e.currentTarget.dataset.index;
    let tabIndex = this.data.index;
    if(tabIndex == index){
      return
    }
    this.setData({
      tabIndex: index
    })
  },

  // 选择校区展开
  selectCampus(e){
    let corpSubUserInfos = this.data.corpSubUserInfos;
    let index = e.currentTarget.dataset.index;
    corpSubUserInfos[index].selected = !corpSubUserInfos[index].selected;
    let seletIndexArr = [];
    corpSubUserInfos.forEach((item,index)=>{
      if(item.selected){
        seletIndexArr.push(item.tgcaId)
      }
    })
    this.setData({
      corpSubUserInfos,
      seletIndexArr,
    })
  },


  getUserListForSubUser(){
    let subInfo = this.data.subInfo;
    apiRequest.getUserListForSubUser({

    }).then((res)=>{
      let subUserInfoList = res.obj.userSubUserInfos;//私人子账号
      let corpSubUserInfos = res.obj.corpSubUserInfos;//企业子账号
      let seletIndexArr = this.data.seletIndexArr || [];//展开企业子账号下标
      let isEmpInterface = res.obj.isEmpInterface;//校区接口人
      let info = res.obj.userResult;
      // 私人子账户id list
      let subUserInfoIdList = subUserInfoList.map((v)=>{
        return v.tsuSubUid
      });
      // 企业子账户id list
      let corpSubIdList = [];
      corpSubUserInfos.forEach((item,index)=>{
        item.subUserInfos.forEach((main,idx)=>{
          corpSubIdList.push(main.tsuSubUid)
        })
      })

      if(seletIndexArr.length > 0){
        corpSubUserInfos.forEach((item,index)=>{
          if(seletIndexArr.indexOf(item.tgcaId) >= 0){
            item.selected = true;
          }
        })
      }
      this.setData({
        subUserInfoList,
        corpSubUserInfos,
        isEmpInterface,
        info
      })
      if(subInfo.tsuSubUid && subUserInfoIdList.indexOf(subInfo.tsuSubUid) == -1 && corpSubIdList.indexOf(subInfo.tsuSubUid) == -1){
        this.setData({
          subInfo: {},
        })
        removeStorage('subToken');
        removeStorage('subInfo');
        wx.showToast({
          title: '子账户已失效，已切换为主账户',
          icon: 'none',
        }); 
      }
    })
  },

  add(e){
    let tsuSubType = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/mineBox/role/role?tsuSubType=${tsuSubType}&from=${this.data.from}`,
    });  
  },
  // add(e){
  //   let tsuSubType = e.currentTarget.dataset.type;
  //   wx.navigateTo({
  //     url: `/pages/packSubAccount/addSubAccount/addSubAccount?tsuSubType=${tsuSubType}&from=${this.data.from}`,
  //   });  
  // },

  // 切换私人子账户
  select(e){
    let index = e.currentTarget.dataset.index;
    let {subUserInfoList, subInfo, from} = this.data;
    let tsuSubUid = subUserInfoList[index].tsuSubUid;
    if(tsuSubUid == subInfo.tsuSubUid){
      // 已选中当前子账户不执行
      return
    }
    if(from == 'coachMeal'){
      this.prepage.setData({
        subInfo: subUserInfoList[index]
      })
      this.prepage.queryCoachComboList();
      wx.navigateBack({
        delta: 1
      });
      return
    }
    this.setData({
      showDialog: true,
      selectIndex: index,
      mainAccount: false,
      type: '00',//选择私人子账户
    })
  },

  // 切换企业子账户
  switchCampus(e){
    let {index, idx} = e.currentTarget.dataset;
    let {corpSubUserInfos, subInfo, from} = this.data;
    let tsuSubUid = corpSubUserInfos[index].subUserInfos[idx].tsuSubUid;
    if(tsuSubUid == subInfo.tsuSubUid){
      // 已选中当前子账户不执行
      return
    }
    if(from == 'coachMeal'){
      this.prepage.setData({
        subInfo: corpSubUserInfos[index].subUserInfos[idx]
      })
      this.prepage.queryCoachComboList();
      wx.navigateBack({
        delta: 1
      });
      return
    }
    this.setData({
      showDialog: true,
      selectIndex: index,
      corpIdx: idx,
      mainAccount: false,
      type: '01',//选择企业子账户
    })
  },

  // 选择主账户
  selectMain(){
    let {subInfo, from} = this.data;
    if(!subInfo.tsuSubUid){
      // 已选中当前主账户不执行
      return
    }
    if(from == 'coachMeal'){
      this.prepage.setData({
        subInfo: {}
      })
      this.prepage.queryCoachComboList();
      wx.navigateBack({
        delta: 1
      });
      return
    }
    this.setData({
      showDialog: true,
      mainAccount: true
    })
  },

  goPerson(e){
    let {subToken, tsuSubUid, tgcaName} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/mineBox/personal/personal?subToken=${subToken || ''}&tsuSubUid=${tsuSubUid || ''}&tgcaName=${tgcaName || ''}`,
    });
  },

  targetConfirmDialog(){
    let {mainAccount, selectIndex, subUserInfoList, type, corpSubUserInfos, corpIdx} = this.data;
    if(mainAccount){
      removeStorage('subToken');
      removeStorage('subInfo');
      this.setData({
        subInfo: {},
        showDialog: false
      })
    }else{
      let subToken = type == '00' ? subUserInfoList[selectIndex].subToken : corpSubUserInfos[selectIndex].subUserInfos[corpIdx].subToken;
      let subInfo = type == '00' ? subUserInfoList[selectIndex] : corpSubUserInfos[selectIndex].subUserInfos[corpIdx];
      setStorage('subToken', subToken);
      setStorage('subInfo',subInfo)
      this.setData({
        subInfo,
        showDialog: false
      })
    }
    wx.showToast({
      title: mainAccount ? '已切换为主账户' : '已切换为子账户',
      image: '/images/my/success.png',
      duration: 1500
    });
    wx.navigateBack({
      delta: 1
    });
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
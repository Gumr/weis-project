import apiRequest from '../../../service/index';
import day from '../../../libs/day'
let app =  getApp();
Page({

  
  data: {
    isIpx: app.globalData.isIpx,
    ergyList: [{
      name: '无过敏',
      value: '00'
    }, {
      name: '过敏',
      value: '01'
    }],
    allergyIndex: 0,
    allmin:false,
    allmidel:false,
    allergy:false,
    isShow: false,
    isShow2:false,

  },

  
  onLoad: function (options) {
    this.setData({
      corpId:options.corpId,
      tgcaId:options.tgcaId

    })
    this.getUserListForSubUser()

  },
  toggle(e) {
    let {isshow} = e.currentTarget.dataset
    if (isshow == '0' ) {
      this.setData({
        isShow: !this.data.isShow
      })

    } else {
      this.setData({
        isShow2: !this.data.isShow2
      })

    }
  
  },

  getUserListForSubUser() {
    apiRequest.getUserListForSubUserForCorp({
      corpId: this.data.corpId,
      addressId: this.data.tgcaId,
      dateTime:  day(new Date()).format('YYYYMMDD'),
      category:  '02',
    }).then((res) => {
      let subUserInfoList = res.obj.subUserInfoList; 
      this.setData({
        subUserInfoList: subUserInfoList, 
        selectNums: 0
      })
    })

  },
  /*选择有无过敏 */
  clickAllergy(e) {  
    let { allergyindex } = e.currentTarget.dataset
    this.setData({ 
      allergyIndex: allergyindex
    })
  },
  /*全选 */
  selectAll(e) {
    let {type} = e.currentTarget.dataset
    if (type == '0') { // 2-4岁
      this.setData({
        allmin:!this.data.allmin 
      })
    } else if (type == '1') {// 5-6岁
      this.setData({
        allmidel:!this.data.allmidel 
      })
    }else {
      this.setData({
        allergy:!this.data.allergy 
      })
    }
    this.setData({   
      seltype:type     
    }, () => {
      this.selectAllList(Boolean(this.data.allmin),Boolean(this.data.allmidel),Boolean(this.data.allergy)) //全选 
    })
  },
  selectAllList: function (allmin,allmidel,allergy) {
    let { subUserInfoList } = this.data;
    if (this.data.seltype == '0') {  
      subUserInfoList.subUserInfoBeans = subUserInfoList.subUserInfoBeans.map((item) => {
        item.checked = allmin;
        return item;
      })
    } 
    if (this.data.seltype == '1'){
      subUserInfoList.subUserInfoBeanList = subUserInfoList.subUserInfoBeanList.map((item) => {
        item.checked = allmidel;
        return item;
      })
    }
    if (this.data.seltype == '2'){
      subUserInfoList.infoBeans = subUserInfoList.infoBeans.map((item) => {
        item.checked = allergy;
        return item;
      })
    }    
    this.setData({
      subUserInfoList,
    }, () => {
      this.sumcount()
    })
  },
  selected: function (e) {
    var that = this;
    let subUserInfoList = that.data.subUserInfoList;
    let {
      tsusubuid, index,type
    } = e.currentTarget.dataset;
    let nowlist = {}
    if (type == '0') {
      nowlist = subUserInfoList.subUserInfoBeans
    } 
    if (type == '1') {
      nowlist = subUserInfoList.subUserInfoBeanList
    } 
    if (type == '2') 
    {
      nowlist = subUserInfoList.infoBeans
    }

    nowlist[index].checked = !nowlist[index].checked,

      that.setData({
        selectNums: nowlist[index].checked ? that.data.selectNums + 1 : that.data.selectNums - 1,
        subUserInfoList
      }, () => {

      })
  },
  sumcount() {
    let { subUserInfoList} = this.data;
    let nums = 0
  
      subUserInfoList.subUserInfoBeanList.map((item) => {
        if (item.checked) {
          nums++
        }
      })

    
    
      subUserInfoList.subUserInfoBeans.map((item) => {
        if (item.checked) {
          nums++
        }
      })

    
   
      subUserInfoList.infoBeans.map((item) => {
        if (item.checked) {
          nums++
        } 
      })

    
    this.setData({
      selectNums:nums
     })


  },
  /*点餐 */
  tapconfirm() {
    let { subUserInfoList} = this.data;

    let subuidsList = [] // 选中的子账号
    let tagArray = [] //选中的过敏原子账号
    let tagList = {}
    if (subUserInfoList.subUserInfoBeanList) {
      subUserInfoList.subUserInfoBeanList.map((item) => {
        if (item.checked) {
          subuidsList.push(item.tsuSubUid)
        }
      })

    }
    if (subUserInfoList.subUserInfoBeans) {
      subUserInfoList.subUserInfoBeans.map((item) => {
        if (item.checked) {
          subuidsList.push(item.tsuSubUid)
        }
      })

    }
if (subUserInfoList.infoBeans) {
  subUserInfoList.infoBeans.map((item) => {
    if (item.checked) {
      subuidsList.push(item.tsuSubUid)
      for (let index = 0; index < item.eatingHabitStr.length; index++) {
        tagArray.push(Number(item.eatingHabitStr[index].lid))
      }
    }
  })

}
   
 
    
    tagArray.length > 0 ? tagList['过敏原'] = tagArray : undefined

    wx.navigateTo({
      url:'/pages/mineBox/groupSelectMeal/index?tgcaId=' + this.data.tgcaId + '&corpId=' + this.data.corpId + '&type=' + this.data.type + '&subuidsList='+subuidsList +'&tagList='+JSON.stringify(tagList)+'&selchild=true&selType=01'
    })
  },
  
  onReady: function () {

  },

  
  onShow: function () {

  },

  
  onHide: function () {

  },

  
  onUnload: function () {

  },

  
  onPullDownRefresh: function () {

  },

  
  onReachBottom: function () {

  },

  
  onShareAppMessage: function () {

  }
})
// components/cp-spell-dispath/cp-spell-dispath.js
let app =  getApp();

  
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shipType: {//当前配送方式
      type: String,
      value: ''
    },
    disableShipType: {//不能热配 00
      type: String,
      value: ''
    },
    show: {
      type: Boolean
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx,
    delivery: [{
      icon: '/images/icons/hot.png',
      disable: 'https://prodstatic.weis1606.cn/api/smartFood/aboutWeis/hot-disable.png',
      shipType: '00',
      text: '热食配送'
    },{
      icon: '/images/icons/cold.png',
      disable: 'https://prodstatic.weis1606.cn/api/smartFood/aboutWeis/cold-disable.png',
      shipType: '01',
      text: '冷链配送',
      subText: '冷链保鲜袋收费2.5元/个',
    }]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show(shipType,disableShipType){
      this.setData({
        shipType,
        show: true,
        disableShipType: disableShipType || '',
      })
    },
    select(e){
      let shipType = e.currentTarget.dataset.shipType;
      if(shipType == this.data.disableShipType){
        return
      }
      if(this.data.shipType == shipType){
        this.setData({
          show: false
        })
        return
      }
      this.setData({
        show: false,
        shipType,
      })
      this.triggerEvent('on-select', {
        value: shipType
      });
    },
    close(){
      this.setData({
        show: false
      })
    },
  }
})

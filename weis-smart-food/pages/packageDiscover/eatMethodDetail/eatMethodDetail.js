import requests from '../../../service/index'
import * as echarts from '../../../libs/echarts';
import day from '../../../libs/day';
import { decideCategory } from '../../../utils/common'
// pages/packageDiscover/eatMethodDetail/eatMethodDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loaded: false,
    buttonHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      title: options.title,
      jumptype: options.jumptype
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

  },
  loadingEnd() {
    this.setData({
      loaded: true
    })
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('data', (data) => {
      this.setData({
        playData: data
      })
      this.getPlay(data);
    })
  },
  getPlay(data) {
    requests.getPlay({
      planName: data.name,
      planCode: data.code,
      category: decideCategory(),
      date: day().format('YYYYMMDD'),
    })
      .then((res) => {
        let percent = {};
        // if (this.data.code != '06' || this.data.code != '204') {
        percent.carbonwaterRatio = res.obj.play.carbohydrate;
        percent.proteinRatio = res.obj.play.protein;
        percent.fatRatio = res.obj.play.fat;
        // }
        let ProteinG = (Number(res.obj.play.calorie) * Number(res.obj.play.protein) / 400).toFixed(2)
        let FatG = (Number(res.obj.play.calorie) * Number(res.obj.play.fat) / 900).toFixed(2)
        let CarbohydrateG = (Number(res.obj.play.calorie) * Number(res.obj.play.carbohydrate) / 400).toFixed(2)
        this.setData({
          listData: percent,
          playList: res.obj.play,
          inputkal: res.obj.play.calorie,
          inputCarbohydrate: res.obj.play.carbohydrate,
          inputProtein: res.obj.play.protein,
          inputFat: res.obj.play.fat,
          ProteinG: ProteinG,
          FatG: FatG,
          CarbohydrateG: CarbohydrateG,
          isgray: res.obj.play.calorie == null ? true : false,
          playType: res.obj.play.playType
        })

        this.initEchart();  //能量数据
      })
  },
  initChart(id) {
    return new Promise(resolve => {
      this.selectComponent(id).init((canvas, width, height) => {
        const chart = echarts.init(canvas, null, {
          width,
          height
        });
        resolve(chart);
        return chart;
      });
    })
  },
  /**
   * 能量数据
   */
  initEchart() {
    const option = {
      title: {
        show: false
      },
      series: [{
        type: 'pie',
        center: ['50%', '50%'],
        hoverOffset: 5,
        label: {
          show: false
        },
        data: [{
          name: 'proteinRatio',
          value: 0,
          itemStyle: {
            color: '#FFB93F',
          }
        },
        {
          name: 'fatRatio',
          value: 0,
          itemStyle: {
            color: '#E55855'
          }
        },
        {
          name: 'carbonwaterRatio',
          value: 0,
          itemStyle: {
            color: '#21C4C0'
          }
        },
        ]
      }]
    }
    // 设置数据每项的value
    option.series[0].data.forEach((item) => {
      item.value = this.data.listData[item.name]
    })


    this.initChart('#play')
      .then((chart) => {
        chart.clear();
        chart.setOption(option, true);
        chart.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: 2
        })
      })
  },
  buttonTap() {
    this.checkPlayWay();
    this.changePlay() // 更换翻牌玩法信息 
      .then((res) => {
        if (res.errCode === 0) {
          if (!this.data.jumptype) {
            wx.switchTab({
              url: '/pages/index/index',
            });
          } else {
            let corpId = wx.getStorageSync('corpId', corpId)
            let tgcaId = wx.getStorageSync('tgcaId', tgcaId)

            // wx.redirectTo({
            //   url: '/pages/mineBox/groupSelectMeal/index?corpId=' + corpId + '&tgcaId=' + tgcaId,
            // });
            wx.navigateBack({
              delta: 2
            });
            wx.removeStorageSync('corpId');
            wx.removeStorageSync('tgcaId');
          }

        }
      })
  },
  changePlay() {
    return requests.changeSodaPlan({
      planCode: this.data.playData.code,
    })

  },
  checkPlayWay() {
    return requests.checkPlayWay({
      planName: this.data.playData.name,
      planCode: this.data.playData.code,
      date: day().format('YYYYMMDD'),
      category: decideCategory(),
      pop: 0
    })
  }
})
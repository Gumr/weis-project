import requests from '../../../../service/index'
// import { transformChartData } from '../../../../utils/util';
import echarts from '../../../../libs/echarts'
import ShareImage from '../../../../utils/ShareImage'
import day from '../../../../libs/day'
import { t, transformChartData } from '../../../../utils/common';
import Draw from '../../../../utils/Draw';

// pages/marketing/slimmingCamp/campReport/campReport.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    report: {},
    userInfo: {},
    ec: {
      lazyLoad: true
    },
    canvasHeight: 1438
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryUserInfo();
    if (options.id) {
      this.$tacid = options.id;
      this.queryEndReport();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.ctx = wx.createCanvasContext('share', this);

    this.drawer = new Draw(this.ctx, this);

    this.resolveChartImage = new Promise((resolve) => {
      this.chartImageResolver = resolve;
    })
    this.getWeightData()
      .then((data) => {
        data = data.map((item) => {
          item = transformChartData(item);

          return {
            date: day(item.date).format('MM/DD'),
            weight: Number(item.weight)
          };
        });

        this.$weightData = data;

        this.drawChart();
      })
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
  handleButtonHeight(evt) {
    this.setData({
      buttonHeight: 20 + evt.detail
    })
  },
  queryEndReport() {
    return requests.queryEndReport({
      tacid: this.$tacid
    }).then(res => {
      if (res.errCode === 0) {
        const hasRank = res.obj.rank !== 0;
        this.setData({
          report: res.obj,
          hasRank,
          canvasHeight: hasRank ? 1624 : 1438
        })
      }
    })
  },
  async shareTap() {
    if (this.$sharing) return;
    wx.showLoading({
      title: '绘制中',
    });

    this.$sharing = true;
    try {
      await this.resolveChartImage
      const shareImage = await this.drawShareImage()
      const sharer = new ShareImage(shareImage);
      sharer.preview();
      sharer.save();
    } catch (e) { }

    wx.hideLoading({
      title: '绘制中',
    });
    this.$sharing = false
  },
  handleCanvasFinished(evt) {
    this.$chartImage = evt.detail;
    this.chartImageResolver();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  async drawShareImage() {
    const { drawer, data } = this;

    const boxHeight = data.hasRank
      ? {
        paper: t(1510),
        border: t(1490)
      }
      : {
        paper: t(1324),
        border: t(1304)
      }

    await drawer.drawImage('https://prodstatic.weis1606.cn/api/activity/christmas_card_bj_3.png', {
      top: 0,
      left: 0,
      width: t(750),
      height: t(data.canvasHeight)
    })

    drawer.drawView({
      width: t(690),
      height: boxHeight.paper,
      top: t(57),
      left: t(30)
    }, {
      backgroundColor: '#FFF',
    })

    await drawer.drawImage('https://prodstatic.weis1606.cn/api/activity/card_bj.png', {
      top: t(67),
      left: t(40),
      width: t(670),
      height: boxHeight.border
    })

    await drawer.drawImage('https://prodstatic.weis1606.cn/api/activity/card_title.png', {
      top: t(107),
      left: t(134),
      width: t(482),
      height: t(52)
    })

    await drawer.drawImage('https://prodstatic.weis1606.cn/api/activity/card_crown.png', {
      top: t(174),
      left: t(416),
      width: t(75),
      height: t(71)
    })
    var g = this.ctx.createLinearGradient(t(211), t(297), t(211) + t(156 / 2), t(297) + t(156))
    g.addColorStop(0, '#FF7C00');
    g.addColorStop(1, '#FFBC00');



    drawer.drawView({
      top: t(211),
      left: t(297),
      width: t(156),
      height: t(156),
    }, {
      borderRadius: t(78),
      backgroundColor: g
    })

    await drawer.drawImage(data.userInfo.headImgUrl, {
      top: t(219),
      left: t(305),
      width: t(140),
      height: t(140),
      borderRadius: t(70),
    })

    drawer.drawText(data.userInfo.uname, {
      left: t(30),
      top: t(389),
      height: Math.ceil(t(32)),
      width: t(690)
    }, {
      fontSize: t(32),
      color: '#A0674A',
      textAlign: 'center',
    })

    await drawer.drawImage('https://prodstatic.weis1606.cn/api/activity/card_slogan.png', {
      left: t(70),
      top: t(445),
      width: t(610),
      height: t(116)
    })

    drawer.drawText('连续坚持14天，绘出了漂亮的阶段性成果：', {
      left: t(70),
      top: t(611),
      height: Math.ceil(t(24)),
      width: t(690)
    }, {
      fontSize: t(24),
      color: '#A0674A',
    })

    await drawer.drawImage(this.$chartImage, {
      top: t(669),
      left: t(70),
      width: t(610),
      height: t(488)
    })

    async function drawModal() {
      drawer.drawView({
        top: t(1193),
        left: t(70),
        width: t(610),
        height: t(146),
      }, {
        borderRadius: t(10),
        backgroundColor: '#FFF9F7'
      })

      drawer.drawText(`在瘦身营中名列第${data.report.rank}名`, {
        left: t(90),
        top: t(1229),
        height: Math.ceil(t(28)),
        width: t(432)
      }, {
        fontSize: t(28),
        color: '#A0674A',
      })

      drawer.drawView({
        left: t(144),
        top: t(1277),
        width: Math.ceil(t(59)),
        height: Math.ceil(t(26))
      }, {
        backgroundColor: '#FE5E0F',
        borderRadius: t(4)
      })

      drawer.drawText('获得', {
        left: t(90),
        top: t(1277),
        height: Math.ceil(t(26)),
        width: Math.ceil(t(52))
      }, {
        fontSize: t(26),
        color: '#D69473',
      })

      drawer.drawText(String(data.report.bounty), {
        left: t(150),
        top: t(1277),
        height: Math.ceil(t(26)),
        width: Math.ceil(t(52))
      }, {
        fontSize: t(26),
        color: '#FFF',
      })

      drawer.drawText('元奖励金！', {
        left: t(205),
        top: t(1277),
        height: Math.ceil(t(26)),
        width: Math.ceil(t(130))
      }, {
        fontSize: t(26),
        color: '#D69473',
      })

      await drawer.drawImage('https://prodstatic.weis1606.cn/api/activity/card_medal_1.png', {
        top: t(1197),
        left: t(522),
        width: t(138),
        height: t(130)
      })
    }

    if (data.hasRank) {
      await drawModal();
    }


    const topDiff = data.hasRank ? 0 : 186;

    await drawer.drawImage('https://prodstatic.weis1606.cn/api/page-qrcode/jianzhiying_qrcode.png', {
      top: t(1379 - topDiff),
      left: t(174),
      width: t(120),
      height: t(120)
    })

    drawer.drawText('维士健康饮食小程序', {
      left: t(324),
      top: t(1447 - topDiff),
      height: Math.ceil(t(28)),
      width: Math.ceil(t(252))
    }, {
      fontSize: t(28),
      color: '#D69473',
    })

    function drawSingleText(text, left) {
      drawer.drawText(text, {
        left,
        top: t(1403 - topDiff),
        height: Math.ceil(t(28)),
        width: Math.ceil(t(28))
      }, {
        fontSize: t(28),
        color: '#A0674A',
      })
    }

    drawSingleText('扫', t(324))
    drawSingleText('码', t(398))
    drawSingleText('进', t(472))
    drawSingleText('入', t(546))

    return new Promise((resolve, reject) => {
      drawer.draw(false, () => {
        drawer.canvasToTempFilePath({
          width: t(750),
          height: t(data.canvasHeight),
          id: 'share'
        }, this).then(res => {
          resolve(res.tempFilePath)
        }, reject);
      });
    })
  },
  getWeightData() {
    return requests
      .getEChartOnePage({
        params: [
          {
            pageNo: 1,
            pageSize: 14,
          },
        ],
      }).then((res) => res.errCode === 0 ? res.obj.page.reverse() : [])
  },
  drawChart() {
    const component = this.selectComponent('#canvas');
    component.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width,
        height
      });

      chart.setOption({
        title: {
        },
        grid: {
          left: 6,
          top: 0,
          right: 0,
          bottom: 0,
          containLabel: true
        },
        xAxis: {
          show: false
        },
        yAxis: {
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            fontSize: 12,
            color: '#C3A494'
          },
          type: 'category',
          data: this.$weightData.map(({ date }) => date)
        },
        series: [
          {
            type: 'bar',//echarts 该bar已干掉
            data: this.$weightData.map(({ weight }) => weight),
            barWidth: t(12),
            itemStyle: {
              barBorderRadius: [0, t(100), t(100), 0],
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  offset: 0,
                  color: '#FFBC00',
                },
                {
                  offset: 1,
                  color: '#FF7B00',
                },
              ]),
            }
          }
        ]
      })
      return chart;
    });
  },
  queryUserInfo() {
    requests.queryUserInfo({
      params: [{}]
    }).then((res) => {
      if (res.errCode === 0) {
        this.setData({
          userInfo: res.obj.userInfo
        })
      }
    })
  }
})
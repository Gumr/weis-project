// pages/mineBox/nutrientReport/nutrientReport.js
import apiRequest from "../../../service/index";
import { getStorage } from "../../../utils/storage";
import day from "../../../libs/day";
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    share: false,
    navStatusHeight: getStorage("navStatusHeight"),
    px2rpx: app.globalData.px2rpx,
    calendarConfig: {
      showLunar: false,
      multi: false,
      highlightToday: true,
      onlyShowCurrentMonth: true,
      disableMode: {
        // 禁用某一天之前/之后的所有日期
        type: "after", // [‘before’, 'after']
        date: day().format("YYYY-MM-DD"), // 无该属性或该属性值为假，则默认为当天
      },
      markToday: "今", // 当天日期展示不使用默认数字，用特殊文字标记
      chooseAreaMode: true,
      showSure: true, //显示确定按钮
      hideBackToday: true, //隐藏回到今天
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady: function () {
  //   let { options } = this.data;
  //   let setData = {}
  //   // 分享
  //   if(options.share && options.uid) {
  //     setData = {
  //       uid: Number(options.uid),
  //       dateList: JSON.parse(options.dateList),
  //       share: true
  //     }
  //   }else {
  //     let userInfo = wx.getStorageSync("userInfo");
  //     setData = {
  //       uid: userInfo.uid
  //     }
  //   }
  //   this.setData(setData, () => {
  //     this.initDate();
  //   })
  // },
  onReady: function () {
    let { options } = this.data;
    let setData = {}
    // 分享
    if(options.share && options.uid) {
      this.setData({
        uid: Number(options.uid),
        dateList: JSON.parse(options.dateList),
        share: true
      }, () => {
        this.initDate();
      })
    }else {
      apiRequest.queryUserInfo().then((res) => {
        this.setData({
          uid: res.obj.userInfo.uid
        }, () => {
          this.initDate();
        })
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 初始化
  initDate() {
    // 分享
    if(this.data.share) {
      this.getTitle(this.data.dateList)
      this.queryUserBusinessReports()
      return;
    }

    // 默认选中近7天
    let dateList = [];
    for (let i = 0; i < 7; i++) {
      let date = day().subtract(i, "day").format("YYYYMMDD");
      dateList.push(date);
    }
    dateList = dateList.reverse();
    this.setData({
      dateList
    },() => {
      this.calendar.chooseDateArea(Array(day(dateList[0]).format("YYYY-MM-DD"), day(dateList[dateList.length-1]).format("YYYY-MM-DD")));
      this.getTitle(dateList)
      this.queryUserBusinessReports()
    });
  },
  // 导航标题
  getTitle(dateList) {
    let start = dateList[0].slice(4, 6) + "月" + dateList[0].slice(6, 8) + "日";
    let end =
      dateList[dateList.length - 1].slice(4, 6) +
      "月" +
      dateList[dateList.length - 1].slice(6, 8) +
      "日";
    this.setData({
      title: dateList.length > 1 ? start + "-" + end : start,
    });
  },
  // 导航标题点击
  titleTextTap() {
    let { showTime, share } = this.data;
    if(share) {
      return;
    }
    this.setData({
      showTime: !showTime,
    });
  },
  // 日历-确定
  sureTime() {
    let date = this.calendar.getSelectedDay();
    let dateList = date.map((item) => {
      let itemStr =
        "" +
        item.year +
        (item.month > 10 ? item.month : "0" + item.month) +
        (item.day > 10 ? item.day : "0" + item.day);
      return itemStr;
    });
    this.setData({
      dateList,
      showTime: false,
    }, () => {
      this.getTitle(dateList)
      this.queryUserBusinessReports()
    });
  },
  // 日历-取消
  cancelTime: function () {
    this.setData({
      showTime: false,
    });
  },
  // 获取数据
  queryUserBusinessReports() {
    wx.showLoading({
      title: ' ',
      mask: true,
    });
    let { uid, dateList, headerData, pieData, infoData } = this.data;
    apiRequest
      .queryUserBusinessReports({
        fromUid: uid,
        startTime: dateList[0],
        endTime: dateList[dateList.length - 1]
      })
      .then((res) => {
        if(res.errCode === 0) {
          let data = res.obj.businessReportsBean;
          // 头部进度条-------数据
          headerData = {
            title: "热量",
            unit: "kcal",
            fromType: '01',
            list: [
              { name: "摄入", value: data.actualIntake },
              { name: "计划", value: data.planIntake },
            ],
          }
          // 进度条的宽度和颜色
          let list = headerData.list;
          let widthScale = Math.round((list[0].value / list[1].value) * 100);
          list[0].width = widthScale <= 100 ? widthScale + "%" : 100 + "%";
          list[1].width = "100%";

          list[1].bgColor = "#DEDEDE";
          if (list[0].value <= list[1].value) {
            list[0].bgColor = "#18C5C1";
          } else {
            list[0].bgColor = "#FA6400";
          }
          // 饼状图-------数据
          pieData = [
            {
              color: "#D8D8D8", // 碳水-灰
              value: data.actualCarbonwater,
              name: "碳水",
              scaleColor: "#666666",
              labelColor: "#666666",
              unit: "g"
            },
            {
              color: "#FA6400", // 蛋白质-红
              value: data.actualProtein,
              name: "蛋白质",
              scaleColor: "#FFFFFF",
              labelColor: "#FA6400",
              unit: "g"
            },
            {
              color: "#18C5C1", // 脂肪-绿
              value: data.actualFat,
              name: "脂肪",
              scaleColor: "#FFFFFF",
              labelColor: "#18C5C1",
              unit: "g"
            },
            
          ]
          // 信息-------数据
          infoData = [
            { name: "碳水", actual: data.actualCarbonwater, plan: data.planCarbonwater, unit: "g", fromType: '02' },
            { name: "蛋白质", actual: data.actualProtein, plan: data.planProtein, unit: "g", fromType: '03' },
            { name: "脂肪", actual: data.actualFat, plan: data.planFat, unit: "g", fromType: '04' },
            { name: "盐量", actual: data.actualSalt, plan: data.planSalt, unit: "g", fromType: '05' },
            { name: "食物多样性", actual: data.foodDiversity + '种', plan: '', unit: "", fromType: '' },
          ]
          this.setData({
            headerData,
            pieData,
            infoData,
            apiData: res.obj
          }, () => {
            this.pieOption()
          })
        }
      })
      .catch((error) => {});
  },
  // 饼状图-配置项
  pieOption() {
    let { pieData } = this.data;
    // 饼状图-配置项
    const option = {
      series: [
        // 百分比
        {
          type: "pie",
          radius: ["20%", "50%"],
          itemStyle: {
            normal: {
              borderColor: "#fff",
              borderWidth: 1,
              label: {
                //此处为指示线文字
                show: true,
                position: "inner", //标签的位置
                textStyle: {
                  fontWeight: 600,
                  fontSize: 12, //文字的字体大小
                },
                formatter: function (params) {
                  //指示线对应文字
                  return Math.round(params.percent, 1) + "%";
                },
              },
            }
          },
          data: pieData.map((item, index) => {
            const res = {};

            res.name = item.name || index;
            res.value = item.value;

            res.itemStyle = {
              color: item.color,
            };
            res.label = {
              color: item.scaleColor,
            };
            return res;
          })
        },
        // 标注
        {
          type: "pie", //饼状图
          radius: ["20%", "50%"], //大小
          itemStyle: {
            normal: {
              borderColor: "#fff",
              borderWidth: 1,
              label: {
                position: "outer", //标签的位置
                alignTo: "edge",
                formatter: function (params) {
                  return '\n' + params.data.name + '\n' + params.data.value + params.data.unit + '\n';
                },
                // formatter: "{b}\n{c}kcal",
                minMargin: 5,
                edgeDistance: 10,
                lineHeight: 15, // 文字行高
              },
              labelLine: {
                length: 10,
                length2: 20,
              },
            }
          },
          data: pieData.map((item, index) => {
            const res = {};

            res.name = item.name || index;
            res.value = item.value;

            res.itemStyle = {
              color: item.color,
            };
            res.label = {
              color: item.labelColor,
            };
            res.unit = item.unit;
            return res;
          }),
        },
      ],
    };
    this.setData({
      customOption: option,
    }, () => {
      wx.hideLoading()
    });
  },
  // 去到-详情页
  goDetail(e) {
    let { fromtype, name, unit } = e.currentTarget.dataset;
    if(!fromtype) {
      return;
    }
    let { title, apiData } = this.data;
    let obj = {
      title,
      name,
      unit,
      data: apiData.reportsBeanList.filter(item => item.fromType == fromtype)[0],
    }
    wx.navigateTo({
      url: `/pages/mineBox/nutrientReportDetail/nutrientReportDetail?param=${JSON.stringify(obj)}`,
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let { uid, dateList } = this.data;
    return {
      title: `分享我的营养报告给你看看`,
      imageUrl: "https://prodstatic.weis1606.cn/api/smartFood/nutrientReport-share.png",
      path: `/pages/mineBox/nutrientReport/nutrientReport?share=true&uid=${uid}&dateList=${JSON.stringify(dateList)}`,
    };
  },
});

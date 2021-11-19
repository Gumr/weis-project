// pages/mineBox/nutrientReport/nutrientReport.js
import { getStorage } from "../../../utils/storage";
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: getStorage("navStatusHeight"),
    px2rpx: app.globalData.px2rpx,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: JSON.parse(options.param)
    }, () => {
      this.queryUserBusinessReports()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 获取数据
  queryUserBusinessReports() {
    let { options } = this.data;
    let data = options.data;
    let headerData, pieData, infoData = '';
    // 头部进度条-------数据
    headerData = {
      title: options.name,
      unit: options.unit,
      list: [
        { name: "摄入", value: data.actualTotal },
        { name: "计划", value: data.planTotal },
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
        color: "#D8D8D8", // 早餐-灰
        value: data.breakfastTotal,
        name: "早餐",
        scaleColor: "#666666",
        labelColor: "#666666",
        unit: options.unit
      },
      {
        color: "#18C5C1", // 午餐-绿
        value: data.lunchTotal,
        name: "午餐",
        scaleColor: "#FFFFFF",
        labelColor: "#18C5C1",
        unit: options.unit
      },
      {
        color: "#FA6400", // 晚餐-红
        value: data.dinnerTotal,
        name: "晚餐",
        scaleColor: "#FFFFFF",
        labelColor: "#FA6400",
        unit: options.unit
      },
      {
        color: "#FCCC49", // 加餐-黄
        value: data.extraTotal,
        name: "加餐",
        scaleColor: "#FFFFFF",
        labelColor: "#FCCC49",
        unit: options.unit
      },
    ]
    // 信息-------数据
    infoData = [
      { name: "早餐", actual: data.breakfastTotal, plan: data.breakfastPlan },
      { name: "午餐", actual: data.lunchTotal, plan: data.lunchPlan },
      { name: "晚餐", actual: data.dinnerTotal, plan: data.dinnerPlan },
      { name: "加餐", actual: data.extraTotal, plan: data.extraPlan },
    ]
    this.setData({
      headerData,
      pieData,
      infoData
    }, () => {
      this.pieOption()
    })
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
                // formatter: "{b}\n{c}g",
                minMargin: 5,
                edgeDistance: 10,
                lineHeight: 15, // 文字行高
              },
              labelLine: {
                length: 20,
                length2: 100,
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
  // onShareAppMessage: function () {

  // },
});

import * as echarts from '../../../libs/echarts';
import day from '../../../libs/day';
import requests from '../../../service/index';
import { t, round, transformChartData } from '../../../utils/common'
// pages/packageDatum/bodyLine/bodyLine.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showQuerys: false,
    pageTitle: '',
    activeTabIndex: 0,
    tabs: [
      {
        label: '7天',
        value: '7'
      },
      {
        label: '30天',
        value: '30'
      },
      {
        label: '全部',
        value: 'all'
      }
    ],
    activeQuery: {},
    querys: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.type = options.type || 'weight';
    this.setData({
      type: this.type
    })

    this.setPageTitle()

    this.setQuerys();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: async function () {
    this.chart = await this.selectComponent('#chart').getChart();

    this.refresh();
  },
  setPageTitle(type = this.type) {
    switch (type) {
      case 'weight':
        this.setData({
          pageTitle: '体重曲线',
          dataLabel: '体重'
        })
        break;
      case 'bfr':
        this.setData({
          pageTitle: '体脂率曲线',
          dataLabel: '体脂率'
        })
        break;
      case 'glu':
        this.setData({
          pageTitle: '血糖曲线',
          dataLabel: '血糖'
        })
        break;
      case 'bp':
        this.setData({
          pageTitle: '血压曲线',
          dataLabel: '血压'
        })
        break;
      case 'step':
        this.setData({
          pageTitle: '记步曲线',
          dataLabel: '记步'
        })
        break;
    }
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
  activeQueryTap() {
    if (this.data.querys.length <= 1) return;
    this.setData({
      showQuerys: true
    })
  },
  refresh() {
    const request = this.getRequestByType();
    request.then(() => {
      this.renderChart();
    })
  },
  getList() {
    switch (this.type) {
      case 'weight':
      case 'bfr':
      case 'step':
        return this.list;
      case 'glu':
        return this.collections[this.data.activeQuery.value];
      case 'bp':
        return this.collections[this.data.activeQuery.value];
    }
  },
  setQuerys() {
    let querys = [];
    switch (this.type) {
      case 'weight':
        querys = [
          {
            label: '体重',
            value: 'weight'
          },
          {
            label: '体脂率',
            value: 'bfr'
          }
        ]
        break;
      case 'bfr':
        querys = [
          {
            label: '体脂率',
            value: 'bfr'
          },
          {
            label: '体重',
            value: 'weight'
          }
        ]
        break;
      case 'glu':
        querys = [
          {
            label: '凌晨',
            value: 1
          },
          {
            label: '早餐前',
            value: 2
          },
          {
            label: '早餐后',
            value: 3
          },
          {
            label: '午餐前',
            value: 4
          },
          {
            label: '午餐后',
            value: 5
          },
          {
            label: '晚餐前',
            value: 6
          },
          {
            label: '晚餐后',
            value: 7
          },
          {
            label: '睡前',
            value: 8
          }
        ]
        break;
      case 'bp':
        querys = [
          {
            label: '清晨空腹',
            value: 1
          },
          {
            label: '上午',
            value: 2
          },
          {
            label: '下午',
            value: 3
          },
          {
            label: '晚上',
            value: 4
          },
          {
            label: '睡前空腹',
            value: 5
          }
        ]
        break;
      case 'step':
        querys = [
          {
            label: '体重',
            value: 0
          }
        ]
        break;
    }

    this.setData({
      querys,
      activeQuery: querys[0]
    })
  },
  queryTap(evt) {
    const { index } = evt.currentTarget.dataset;
    const query = this.data.querys[index]
    if (query.value === this.data.activeQuery.value) return;
    const isString = typeof query.value === 'string';
    this.type = isString ? query.value : this.type;

    this.setPageTitle()

    this.setData({
      activeQuery: query,
      showQuerys: false
    })
    if (isString) {
      this.refresh();
    } else {
      this.renderChart();
    }
  },
  getRequestByType(type = this.type) {
    switch (type) {
      case 'weight':
        return this.getWeightData();
      case 'bfr':
        return this.queryBFRList();
      case 'glu':
        return this.queryHistoryBloodSugar();
      case 'bp':
        return this.queryHistoryBloodPressure();
      case 'step':
        return this.getUserStepList();
    }
  },
  getUserStepList() {
    return requests.getUserStepList({
      pageNo: 1,
      pageSize: this.getPageSize()
    }).then((res) => {
      if (res.errCode === 0) {
        this.list = res.obj.stepInfoList.map(item => {
          return ({
            date: item.date,
            value: item.step
          })
        }).sort(() => -1)
      }
    })
  },
  queryHistoryBloodPressure() {
    return requests.queryHistoryBloodPressure({
      pageNo: 1,
      pageSize: this.getPageSize()
    }).then((res) => {
      if (res.errCode === 0) {
        const list = res.obj.bodyDataVOList.sort(() => -1);
        const map = {
          '10': 1, // '清晨空腹',
          '15': 1, // '清晨空腹',
          '16': 2, // '上午',
          '11': 2, // '上午',
          '17': 3, // '下午',
          '12': 3, // '下午',
          '18': 4, // '晚上',
          '13': 4, // '晚上',
          '19': 5, // '睡前空腹',
          '14': 5, // '睡前空腹'
        };

        const collections = list.reduce((cols, item) => {
          const { bodyDataInfoList, time } = item;
          bodyDataInfoList.forEach(dataInfo => {
            const matched = dataInfo.bdKeyNote.match(/^([^\d]+)[\d:-]+(.+)$/);
            const key = map[dataInfo.bdKey]; // 拿到 querys对应的key
            const colList = cols[key] || (cols[key] = []);
            let col = colList[colList.length - 1];
            if (!col || col.date !== day(time).valueOf()) {
              col = { date: time, less: 0, value: 0 };
              colList.push(col);
            }
            if (matched) {
              const [_, type] = matched;
              switch (type) {
                case '低压值':
                  col.less = +dataInfo.bdValue
                  break;
                case '高压值':
                  col.value = +dataInfo.bdValue
                  break;
              }
            }
          })
          return cols;
        }, {})

        this.collections = collections;
      }
    })
  },
  getTimeRange() {
    const { tabs, activeTabIndex } = this.data;
    const item = tabs[activeTabIndex];
    const today = day();
    switch (item.value) {
      case '7':
        return [today.subtract(7, 'day').format('YYYYMMDD'), today.format('YYYYMMDD')]
      case '30':
        return [today.subtract(30, 'day').format('YYYYMMDD'), today.format('YYYYMMDD')]
      case 'all':
        return [today.subtract(60, 'day').format('YYYYMMDD'), today.format('YYYYMMDD')]
    }
  },
  getPageSize() {
    const { tabs, activeTabIndex } = this.data;
    const item = tabs[activeTabIndex]
    return {
      7: 7,
      30: 30,
      'all': 99
    }[item.value]
  },
  getWeightData() {
    const [beginTime, endTime] = this.getTimeRange();
    return requests.queryWeightByTime({
      bdKey: '9',
      beginTime,
      endTime
    }).then((res) => {
      if (res.errCode === 0) {
        const list = res.obj.bodyDataInfoList.map((item) => {
          return ({
            value: round(item.bdValue, 0),
            date: item.time
          })
        }).reverse();

        this.list = this.shimList(list, day(beginTime), day(endTime));
      }
    })
  },
  shimList(list, begin, end) {
    const res = [];
    let i = 0;
    const start = Date.now();
    while (end >= begin) {
      if (Date.now() - start > 10000) break;
      const item = list[i];
      const endTime = +end.format('YYYYMMDD')
      if (item && (item.date === endTime)) {
        res.unshift(item)
        i++;
      } else {
        res.unshift({
          date: endTime,
          value: 0
        })
      }
      end = end.subtract(1, 'day');
    }
    return res;
  },
  queryBFRList() { // 查询体脂率
    const [beginTime, endTime] = this.getTimeRange();
    return requests.queryWeightByTime({
      bdKey: '20',
      beginTime,
      endTime
    }).then((res) => {
      if (res.errCode === 0) {
        const list = res.obj.bodyDataInfoList.map((item) => {
          return ({
            value: item.bdValue,
            date: item.time
          })
        }).reverse();

        this.list = this.shimList(list, day(beginTime), day(endTime));
      }
    })
  },
  queryHistoryBloodSugar() {
    return requests.queryHistoryBloodSugar({
      pageNo: 1,
      pageSize: this.getPageSize()
    }).then((res) => {
      if (res.errCode === 0) {
        const list = res.obj.bodyDataVOList.sort(() => -1);
        const collections = list.reduce((cols, item) => {
          const { bodyDataInfoList, time } = item;
          bodyDataInfoList.forEach(dataInfo => {
            const col = cols[dataInfo.bdKey] || (cols[dataInfo.bdKey] = []);
            col.push({
              date: time,
              value: +dataInfo.bdValue
            })
          })
          return cols;
        }, {})

        this.collections = collections;
      }
    })
  },
  renderChart() {
    let list = this.getList();
    const noData = !list || list.length <= 0
    this.setData({
      noData
    })
    if (this.noData) {
      this.chart.clear();
      return;
    }

    function ceil(val) {
      return Math.ceil(val)
    }
    const { activeTabIndex } = this.data;
    const options = {
      grid: {
        left: ceil(t(30)),
        right: ceil(t(30)),
        top: ceil(t(60)),
        bottom: ceil(t(68))
      },
      yAxis: {
        show: false
      },
      xAxis: {
        boundaryGap: false,
        type: 'category',
        data: list.map(({ date }) => date),
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(153, 153, 153, 0.2)'
          }
        },
        axisLabel: {
          interval: (index) => {
            return activeTabIndex === 0 ||// index = 0 当前是7天曲线不过滤
              index === 0 || // 第一项不过滤
              index === list.length - 1 || // 最后一项不过滤
              index === Math.ceil(list.length / 2) // 中间一项不过滤， 一共显示三项
          },
          color: 'rgba(51, 51, 51, 0.7)',
          fontSize: Math.floor(t(24)),
          formatter(value) {
            const date = day(value);
            return `${date.format('MM/DD')}\n${date.format('YYYY')}`
          }
        },
        axisTick: {
          show: false
        }
      },
      tooltip: {
        trigger: 'axis',
        triggerOn: 'click',
        renderMode: 'richText',
        borderWidth: 1,
        padding: t(10),
        axisPointer: {
          axis: 'x',
          lineStyle: {
            color: 'rgba(250, 100, 0, 1)'
          }
        },
        textStyle: {
          color: '#fff'
        },
        backgroundColor: 'rgba(250, 100, 0, 1)',
        position: (point, params, dom, rect, { contentSize, viewSize }) => {
          const viewWidth = viewSize[0];
          const tooltipWidth = contentSize[0];
          const distance = viewWidth - point[0];
          const offsetLeft = tooltipWidth * (1 - distance / viewWidth);

          // 固定在顶部
          return [point[0] - offsetLeft, point[1]];
        },
        formatter: params => {
          params = params[0];
          const item = list[params.dataIndex];
          // const unit = {
          //   weight: '体重',
          //   glu: '血糖',
          //   bp: '血压',
          //   bfr: '体脂率'
          // }[this.type]

          const value = this.type === 'bp' ? `${item.value}/${item.less}` : item.value;
          // ${unit}:
          return `${value}\n${day(String(item.date)).format('YYYY/MM/DD')}`
        }
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbolSize: t(20) | 0,
          data: list.map(({ value }) => value),
          lineStyle: {
            color: 'rgba(250, 100, 0, 1)',
            width: t(6),
          },
          itemStyle: {
            color: '#FFB93F',
            borderColor: 'rgba(250, 100, 0, 1)',
            borderWidth: t(6) | 0
          },
          label: {
            show: true,
            distance: t(6),
            color: '#333',
            fontWeight: 'bold',
            fontSize: Math.ceil(t(28)),
            formatter: (params) => {
              const { dataIndex } = params;
              const data = list[dataIndex];

              return this.type === 'bp' ? `${data.value}/${data.less}` : data.value
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(250, 100, 0, 1)',
              },
              {
                offset: 1,
                color: 'rgba(255, 207, 63, 0)',
              },
            ]),
          }
        }
      ]
    }

    this.chart.setOption(options, true)
  },
  chartFinished(evt) {
    this.setData({
      chartImage: evt.detail
    })
  },
  tabTap(evt) {
    const { index } = evt.currentTarget.dataset;
    this.setData({
      activeTabIndex: index
    })

    this.refresh();
  }
})
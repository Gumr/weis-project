<template>
  <div class="fullscreen">
    <div class="timer">{{date}}</div>
    <div class="content">
      <el-row :gutter="20">
        <el-col :span="18" class="content-l">
          <div class="grid-content bg-purple-dark">
            <div class="content-l-h">
              <el-row :gutter="20" type="flex" justify="flex-start" align="center">
                <el-col :span="6">
                  <div class="dds">
                    <span>订单数</span>
                  </div>
                  <div class="hm">
                    {{orderData.orderNum}}
                    <span>单</span>
                    /{{orderData.orderUserNum}}
                    <span>人</span>
                  </div>
                  <div class="db">
                    相比昨天：
                    <img
                      :src="orderData.orderNumDiffValue > 0 ? '/images/icon_few_up.png' : '/images/icon_minor_down.png'"
                      alt
                    />
                    <span>{{orderData.orderNumDiffValue}}</span>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="dds ddyys">
                    <span>支付用户数</span>
                  </div>
                  <div class="hm">
                    {{orderData.placeOrderUserNum}}
                    <span>人</span>
                  </div>
                  <div class="db">
                    相比昨天：
                    <img
                      :src="orderData.placeOrderUserNumDiffValue > 0 ? '/images/icon_few_up.png' : '/images/icon_minor_down.png'"
                      alt
                    />
                    <span>{{orderData.placeOrderUserNumDiffValue}}</span>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="dds">
                    <span>转化率</span>
                  </div>
                  <div class="hm">
                    {{conversionRate.conversionRate}}
                    <span>%</span>
                  </div>
                  <div class="db">
                    相比昨天：
                    <img
                      :src="conversionRate.conversionRateDiffValue > 0 ? '/images/icon_few_up.png' : '/images/icon_minor_down.png'"
                      alt
                    />
                    <span>{{conversionRate.conversionRateDiffValue}}%</span>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="dds">
                    <span>客单价</span>
                  </div>
                  <div class="hm">
                    {{customerUnitPrice.customerUnitPrice}}
                    <span>元</span>
                  </div>
                  <div class="db">
                    相比昨天：
                    <img
                      :src="customerUnitPrice.customerUnitPriceDiffValue > 0 ? '/images/icon_few_up.png' : '/images/icon_minor_down.png'"
                      alt
                    />
                    <span>{{customerUnitPrice.customerUnitPriceDiffValue}}</span>
                  </div>
                </el-col>
              </el-row>
            </div>
            <div class="content-l-b">
              <el-row class="title">
                <img src="/images/arrow.png" alt />
                <el-col>销售额</el-col>
              </el-row>
              <el-row class="num" type="flex" align="bottom" justify="flex-start">
                <el-col>
                  ￥
                  <span class="int" v-for="(int, index) in nums.int" :key="index">{{int}}</span>.
                  <span
                    class="float"
                    v-for="(float, index) in nums.float"
                    :key="'float' + index"
                  >{{float}}</span>
                </el-col>
              </el-row>
              <el-row class="totalNum" type="flex" justify="space-between" align="center">
                <el-col>累计销售额：￥{{orderData.cumulativeSalesVolume}}</el-col>
                <el-col>
                  <span>日销售额</span>
                  <!-- <span>累计销售额</span> -->
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <div id="eachChart" ref="chart01"></div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-col>
        <el-col :span="6" class="content-r">
          <div class="grid-content bg-purple-dark">
            <div class="each">
              <el-row class="description" type="flex" justify="space-between" align="center">
                <el-col class="yys">
                  <div>注册用户数</div>
                  <div class="db">
                    相比昨天：
                    <img
                      :src="registerNumDiffValue > 0 ? '/images/icon_few_up.png' : '/images/icon_minor_down.png'"
                      alt
                    />
                    <span>{{registerNumDiffValue}}</span>
                  </div>
                </el-col>
                <el-col class="num">
                  <span>{{registerNum}}</span>
                  <span>人</span>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="20">
                  <div id="eachChart-r" ref="chart02"></div>
                </el-col>
              </el-row>
            </div>
            <div class="each">
              <el-row class="description" type="flex" justify="space-between" align="center">
                <el-col class="yys">
                  <div>访问用户数</div>
                  <div class="db">
                    相比昨天：
                    <img
                      :src="visitNumDiffValue > 0 ? '/images/icon_few_up.png' : '/images/icon_minor_down.png'"
                      alt
                    />
                    <span>{{visitNumDiffValue}}</span>
                  </div>
                </el-col>
                <el-col class="num">
                  <span>{{visitNum}}</span>
                  <span>人</span>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="20">
                  <div id="eachChart-r" ref="chart03"></div>
                </el-col>
              </el-row>
            </div>
            <div class="each">
              <el-row class="description" type="flex" justify="space-between" align="center">
                <el-col class="yys">
                  <div>次日留存率</div>
                  <div class="db">
                    相比昨天：
                    <img
                      :src="survivalRateDiffValue > 0 ? '/images/icon_few_up.png' : '/images/icon_minor_down.png'"
                      alt
                    />
                    <span>{{survivalRateDiffValue}}%</span>
                  </div>
                </el-col>
                <el-col class="num">
                  <span>{{survivalRate}}</span>
                  <span>%</span>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="20">
                  <div id="eachChart-r" ref="chart04"></div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import format from '@/utils/format';
import echarts from 'echarts/lib/echarts'
// 引入基本模板
// const echarts = require('echarts/lib/echarts');

// 引入柱状图组件
import 'echarts/lib/chart/line'

// 引入提示框和title组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'

export default {
  props: {
    value: {
      type: Object
    }
  },
  data() {
    return {
      date: '',
      nums: {
        int: [0, 0, 0, 0, 0, 0, 0, 0],
        float: [0, 0]
      },
      chartData01: {
        orderTable: {}
      },
      chartData02: {
        orderTable: {}
      },
      chartData03: {
        orderTable: {}
      },
      chartData04: {
        orderTable: {}
      },
      orderData: {},
      conversionRate: {},
      customerUnitPrice: {},

      totalData: {},
      registerNumDiffValue: 0,
      registerNum: 0,
      visitNumDiffValue: 0,
      visitNum: 0,
      survivalRateDiffValue: 0,
      survivalRate: 0,
      // BASE_URL: process.env.BASE_URL
    };
  },
  filters: {
    addPointForDate(longdate, start = 0) {
      // start分割开始的位置
      return `${longdate.slice(start, start + 4)}.${longdate.slice(
        start + 4,
        start + 6
      )}.${longdate.slice(start + 6, start + 8)}`;
    }
  },
  mounted() {
    const that = this;
    this.timer = setInterval(() => {
      that.date = this.getTime(); // 修改当前时间date
    }, 1000);

    if (!this.timer2) {
      that.realTimeOrderData();
      that.realTimeConversionRate();
      that.realTimeCustomerUnitPrice();
      // that.totalDataFn();
      for (let i = 1; i <= 4; i++) {
        that[`_chartPage0${i}`] = 1;
        that[`_chartData0${i}`] = [];
        // 01注册用单数 02访问用户数 03销售额 04客单价 05复购用户数
        that[`getChartOpt0${i}`] = that.getDifferentChartOpt(`0${i}`);
        that[`setChartOpt0${i}`] = that.setDifferentChartOpt(`0${i}`);
        that.getChartData(`0${i}`);
      }
    }
    this.timer2 = this.$nt(() => {
      // 加载表格数据
      setInterval(() => {
        that.realTimeOrderData();
        that.realTimeConversionRate();
        that.realTimeCustomerUnitPrice();

        // that.totalDataFn();
        for (let i = 1; i <= 4; i++) {
          that[`_chartPage0${i}`] = 1;
          that[`_chartData0${i}`] = [];
          // 01注册用单数 02访问用户数 03销售额 04客单价 05复购用户数
          that[`getChartOpt0${i}`] = that.getDifferentChartOpt(`0${i}`);
          that[`setChartOpt0${i}`] = that.setDifferentChartOpt(`0${i}`);
          that.getChartData(`0${i}`);
        }
      }, 5000);
    });
  },
  methods: {
    /* 获取当前时间 */
    getTime() {
      const date1 = new Date();
      const year = date1.getFullYear();
      const month = date1.getMonth() + 1;
      const day = date1.getDate();
      const hours = date1.getHours();
      const minutes = date1.getMinutes() < 10 ? `0${date1.getMinutes()}` : date1.getMinutes();
      const seconds = date1.getSeconds() < 10 ? `0${date1.getSeconds()}` : date1.getSeconds();

      return (
        `${year
        }年${
          month
        }月${
          day
        }日`
        + `  ${
          hours
        }:${
          minutes
        }:${
          seconds}`
      );
    },
    // 实时 -- 下单用户数、订单数、销售额
    realTimeOrderData() {
      this.$request('data.DataPunch/realTimeOrderData', {}).then((res) => {
        this.orderData = res.data.obj;
      });
    },
    // 实时 -- 转化率
    realTimeConversionRate() {
      this.$request('data.DataPunch/realTimeConversionRate', {}).then((res) => {
        this.conversionRate = res.data.obj;
      });
    },
    // 实时 -- 客单价
    realTimeCustomerUnitPrice() {
      this.$request('data.DataPunch/realTimeCustomerUnitPrice', {}).then((res) => {
        this.customerUnitPrice = res.data.obj;
      });
    },

    totalDataFn() {
      const that = this;
      this.$request('data.DataPunch/fullViewHomeDataPunch', {}).then((res) => {
        that.totalData = { ...res.data.obj };
      });
    },
    // 获取表数据
    getChartData(which = '01', pageNo = 1) {
      const that = this;
      const { addPointForDate } = this.$options.filters;
      const url = which === '01'
        ? 'data.DataPunch/salesVolumeForSale'
        : which === '02'
          ? 'data.DataPunch/registerNumberForOperate'
          : which === '03'
            ? 'data.DataPunch/visitNumberForOperate'
            : 'data.DataPunch/survivalRateForOperate';

      this.$request(url, {
        cycle: 'day',
        pageNo,
        pageSize: 7
      }).then((res) => {
        if (res.data.errCode === 0) {
          let {
            registerNumDiffValue,
            visitNumDiffValue,
            survivalRateDiffValue,
            survivalRate,
            salesVolume,
            orderTable,
            registerNum,
            visitNum,
            results = []
          } = res.data.obj;
          survivalRate && (that.survivalRate = survivalRate);
          registerNum && (that.registerNum = registerNum);
          visitNum && (that.visitNum = visitNum);
          registerNumDiffValue
            && (that.registerNumDiffValue = registerNumDiffValue);
          visitNumDiffValue && (that.visitNumDiffValue = visitNumDiffValue);
          survivalRateDiffValue
            && (that.survivalRateDiffValue = survivalRateDiffValue);

          results.forEach((v) => {
            v.dateTime = `${addPointForDate(v.dateTime)}`;
            v.dateTime = `${v.dateTime} ${format.week(+new Date(v.dateTime))}`;
          });
          results.reverse();

          if (salesVolume > 0) {
            salesVolume += '';
            const int = salesVolume.indexOf('.') != -1
              ? salesVolume.slice(0, salesVolume.indexOf('.')).split('')
              : salesVolume.split('');
            const float = salesVolume.indexOf('.') != -1
              ? salesVolume.slice(salesVolume.indexOf('.') + 1).split('')
              : [0, 0];
            const len = int.length;
            float.length < 2 && float.push('0');

            // for(var i = 0; i <= 8 - len; i++) {
            //   int.unshift('0')
            // }
            that.nums = {
              int,
              float
            };
          }
          that[`_chartData${which}`] = results;
          that.setDefaultChart(which, that[`_chartData${which}`]);
          that[`chartData${which}`] = { orderTable };
          // if (pageNo > 1) {
          //   that[`_chartData${which}`] = that[`_chartData${which}`].concat(
          //     results
          //   );
          //   that.setLazyLoadChart(
          //     which,
          //     that[`_chartData${which}`]
          //   );
          // } else {
          //   that[`_chartData${which}`] = results;
          //   that.setDefaultChart(which, that[`_chartData${which}`]);
          //   that[`chartData${which}`] = { orderTable };
          // }
        }
      });
    },

    // 页面刚加载时的默认表格数据
    setDefaultChart(type, chartData) {
      const chartOpt = this.getDefaultChartOpt(type);
      const xData = chartData.map(({ dateTime }) => dateTime);
      this[`getChartOpt${type}`](chartOpt);
      this[`setChartOpt${type}`](chartOpt, chartData);
      chartOpt.xAxis.data = xData;
      chartOpt.dataZoom[0].startValue = xData.length - 5;
      chartOpt.dataZoom[0].endValue = xData.length - 1;
      if (this[`chart${type}`]) {
        this[`chart${type}`].clear();
        this[`chart${type}`].setOption(chartOpt, true);
      } else {
        this.renderChart(this.$refs[`chart${type}`], chartOpt, type);
      }
    },
    // 拖动加载更多数据
    // setLazyLoadChart(type = "01", chartData) {
    //   // type表格指针、chartData表格数据
    //   const chartOpt = this[`chart${type}`].getOption();
    //   const dataZoom = chartOpt.dataZoom[0];
    //   const xData = chartData.map(({ dateTime }) => dateTime);
    //   this[`setChartOpt${type}`](chartOpt, chartData);
    //   chartOpt.xAxis[0].data = xData;
    //   dataZoom.start = null;
    //   dataZoom.end = null;
    //   dataZoom.startValue = chartData.length - 8;
    //   // dataZoom.endValue = chartData.length - 2;
    //   this[`chart${type}`].setOption(chartOpt, true);
    // },
    // 获取表格通用配置
    getDefaultChartOpt(type) {
      const options = {
        color: ['#37a2da', '#32c5e9', '#67e0e3'],
        tooltip: {
          trigger: 'axis',
          triggerOn: 'click',
          backgroundColor: 'rgba(50, 123, 253, 1)',
          renderMode: 'html',
          borderRadius: 2,
          padding: 6,
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'line', // 默认为直线，可选为：'line' | 'shadow'
            lineStyle: {
              color: '#327BFD',
              width: 0.5
            }
          },
          position: (point, params, dom, rect, { contentSize, viewSize }) => {
            const viewWidth = viewSize[0];
            const tooltipWidth = contentSize[0];
            const distance = viewWidth - point[0];
            const offsetLeft = tooltipWidth * (1 - distance / viewWidth);
            // 固定在顶部
            return [point[0] - offsetLeft, '10%'];
          },
          textStyle: {
            color: '#fff',
            fontSize: 12
          },
          formatter: this.tooltipFormatter(type)
        },
        grid: {
          left: type == '01' ? '4%' : '10%',
          right: type == '01' ? '4%' : '6%',
          top: '6%',
          bottom: '20%'
        },
        xAxis: {
          data: [
            '04.14 周一',
            '04.14 周二',
            '04.14 周一',
            '04.14 周一',
            '04.14 周一'
          ],
          type: 'category',
          boundaryGap: false,
          axisTick: {
            show: false
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#1F407B'
            }
          },
          axisLabel: {
            interval: 0,
            margin: 16,
            textStyle: {
              color: 'rgba(139, 216, 255, 1)',
              fontSize: window.innerWidth < 1600 ? 10 : 14,
              lineHeight: window.innerWidth < 1600 ? 10 : 14,
              fontWeight: 'normal'
            },
            formatter(value) {
              let returnVal = '';
              let strArr = '';
              if (value.length === 21) {
                strArr = value.split(' ');
                returnVal = `${strArr[0].slice(5)}-${strArr[1].slice(5)}`;
              } else if (value.length === 7) {
                returnVal = value;
              } else {
                strArr = value.split(' ');
                returnVal = `{${strArr[0].length}|${strArr[0].slice(5)}}\n{${
                  strArr[1].length
                }|${strArr[1]}}`;
              }
              return returnVal;
            },
            rich: {
              5: {
                color: 'rgba(139, 216, 255, 1)',
                lineHeight: 20
              },
              2: {
                color: 'rgba(139, 216, 255, .5)',
                lineHeight: 20
              }
            }
            // formatter: function(value) {
            //   var strArr = value.split(" ");
            //   return strArr[0] + "\n\n" + strArr[1];
            // }
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: '#1F407B'
            }
          }
        },
        yAxis: {
          show: true,
          lineStyle: {
            color: '#1F407B'
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: 'rgba(15, 66, 140, 1)'
            }
          },
          axisLabel: {
            // margin: 22,
            textStyle: {
              color: 'rgba(255, 255, 255, 1)',
              fontSize: window.innerWidth < 1600 ? 10 : 14
            },
            formatter: this.yAxisFormatter(type)
          }
        },
        dataZoom: [
          {
            type: 'inside',
            minValueSpan: 7,
            maxValueSpan: 7,
            zoomLock: true
          }
        ]
      };
      return options;
    },
    // 获取不同表设置不同表类型
    getDifferentChartOpt(type) {
      let handler;
      switch (type) {
        case '01':
          handler = (opt) => {
            opt.series = [
              {
                name: '示例1',
                type: 'line',
                data: [],
                lineStyle: {
                  color: 'RGBA(254, 165, 54, 1)'
                },
                smooth: true,
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'RGBA(255, 207, 119, 1)' // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: 'RGBA(255, 207, 119, .1)' // 100% 处的颜色
                      }
                    ]
                  }
                },
                symbol: 'circle',
                symbolSize: 10,
                itemStyle: {
                  color: 'RGBA(255, 207, 119, 1)',
                  borderWidth: 1,
                  borderColor: 'RGBA(0, 20, 64, 1)'
                }
              }
              // {
              //   name: "示例2",
              //   type: "line",
              //   data: [],
              //   lineStyle: {
              //     color: "#327BFD"
              //   },
              //   smooth: true,
              //   areaStyle: {
              //     color: {
              //       type: "linear",
              //       x: 0,
              //       y: 0,
              //       x2: 0,
              //       y2: 1,
              //       colorStops: [
              //         {
              //           offset: 0,
              //           color: "RGBA(130, 222, 255, 1)" // 0% 处的颜色
              //         },
              //         {
              //           offset: 1,
              //           color: "RGBA(130, 222, 255, .1)" // 100% 处的颜色
              //         }
              //       ]
              //     }
              //   },
              //   symbol: "circle",
              //   symbolSize: 10,
              //   itemStyle: {
              //     color: "RGBA(123, 204, 252, 1)",
              //     borderWidth: 1,
              //     borderColor: "RGBA(0, 20, 64, 1)"
              //   }
              // }
            ];
          };
          break;
        case '02':
          handler = (opt) => {
            opt.series = [
              {
                name: '示例',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#327BFD'
                },
                smooth: true,
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'RGBA(130, 222, 255, 1)' // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: 'RGBA(130, 222, 255, .1)' // 100% 处的颜色
                      }
                    ]
                  }
                },
                symbol: 'circle',
                symbolSize: 10,
                itemStyle: {
                  color: '#327BFD',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              }
            ];
          };
          break;
        case '03':
          handler = (opt) => {
            opt.series = [
              {
                name: '示例',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#327BFD'
                },
                smooth: true,
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'RGBA(130, 222, 255, 1)' // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: 'RGBA(130, 222, 255, .1)' // 100% 处的颜色
                      }
                    ]
                  }
                },
                symbol: 'circle',
                symbolSize: 10,
                itemStyle: {
                  color: '#327BFD',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              }
            ];
          };
          break;
        case '04':
          handler = (opt) => {
            opt.series = [
              {
                name: '示例',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#327BFD'
                },
                smooth: true,
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'RGBA(130, 222, 255, 1)' // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: 'RGBA(130, 222, 255, .1)' // 100% 处的颜色
                      }
                    ]
                  }
                },
                symbol: 'circle',
                symbolSize: 10,
                itemStyle: {
                  color: '#327BFD',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              }
            ];
          };
          break;
      }
      return handler;
    },
    // 设置不同表格数值
    setDifferentChartOpt(type) {
      const data1 = [];
      const data2 = [];
      let handler;
      switch (type) {
        case '01':
          handler = (opt, data) => {
            data.forEach((v) => {
              data1.push(v.salesVolume);
              // data2.push(v.dayCumulativeSalesVolume);
            });
            opt.series[0].data = data1;
            // opt.series[1].data = data2;
          };
          break;
        case '02':
          handler = (opt, data) => {
            data.forEach((v) => {
              data1.push(v.registerNum);
            });
            opt.series[0].data = data1;
          };
          break;
        case '03':
          handler = (opt, data) => {
            data.forEach((v) => {
              data1.push(v.visitNum);
            });
            opt.series[0].data = data1;
          };
          break;
        case '04':
          handler = (opt, data) => {
            data.forEach((v) => {
              data1.push(v.survivalRate);
            });
            opt.series[0].data = data1;
          };
          break;
      }
      return handler;
    },
    // 渲染图表
    renderChart(chartCpt, chartOpt, type) {
      !this[`chart${type}`] && (this[`chart${type}`] = echarts.init(chartCpt));
      this[`chart${type}`].setOption(chartOpt);
    },
    tooltipFormatter(type) {
      const formatter = (params) => {
        let tooltip = '';
        switch (type) {
          case '01':
            // let tips = this._tips[params[0].dataIndex]
            tooltip += `日销售额: ${params[0].value}`;
            break;
          case '02':
            // let tips = this._tips[params[0].dataIndex]
            tooltip += `注册用户数: ${params[0].value}`;
            break;
          case '03':
            // let tips = this._tips[params[0].dataIndex]
            tooltip += `访问用户数: ${params[0].value}`;
            break;
          case '04':
            // let tips = this._tips[params[0].dataIndex]
            tooltip += `次日留存率: ${params[0].value}`;
            break;
        }
        return tooltip;
      };
      return formatter;
    },
    yAxisFormatter(type) {
      const formatter = (params) => {
        if (params === 0) {
          const value = type === '01'
            ? ' 元/0'
            : type === '02' || type === '03'
              ? '人/0'
              : '%/0';
          return value;
        }
        return params;
      };
      return formatter;
    }
  },
  beforeUnmount() {
    this.timer && clearInterval(this.timer); // 清除定时器
    this.timer2 && clearInterval(this.timer2); // 清除定时器
  }
};
</script>

<style lang="less" scoped>
.fullscreen {
  width: 100%;
  height: 100%;
  overflow: hidden;
  // line-height: 1300px;
  position: absolute;
  left: 0;
  top: 0;
  background: url("../../../../../images/shujubg.png") no-repeat;
  background-size: 100% 100%;
  background-position: center center;
  color: #fff;
  font-size: 56px;
  text-align: center;
  vertical-align: center;
  z-index: 9999;
  .timer {
    height: unit(100 / 1920 * 100, vw);
    line-height: unit(130 / 1920 * 100, vw);
    font-size: unit(20 / 1920 * 100, vw);
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(139, 216, 255, 1);
    text-shadow: 3px 4px 6px rgba(1, 23, 53, 0.5);
  }
}
#eachChart {
  width: 100%;
  height: unit(458 / 1920 * 100, vw);
  margin: 0 auto;
}
#eachChart-r {
  width: 100%;
  height: 22vh;
  margin: 0 auto;
}
:deep(#eachChart > div:nth-of-type(2)) {
  background: rgba(50, 123, 253, 0.69);
  border-radius: 4px;
  box-shadow: -2px 4px 10px 0px rgba(50, 123, 253, 1);
  span {
    display: none !important;
  }
}
// .content {
//   margin: 20px;
// }
.content-l-h {
  height: unit(270 / 1920 * 100, vw);
  margin: 0 0 2vh 0px;
  padding: 0 5vh;
  .el-row {
    padding-top: 5.5vh;
  }
  .el-col {
    position: relative;
    &::after {
      content: "";
      width: 2px;
      height: 45px;
      background: rgba(139, 216, 255, 0.16);
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
    }
    &:last-of-type::after {
      display: none;
    }
    &:nth-of-type(2) .dds span::after {
      background: rgba(0, 225, 254, 1);
    }
    &:nth-of-type(3) .dds span::after {
      background: rgba(53, 207, 51, 1);
    }
    &:nth-of-type(4) .dds span::after {
      background: rgba(247, 182, 65, 1);
    }
  }
  .dds {
    font-size: 15px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(139, 216, 255, 1);
    position: relative;
    margin-bottom: 1.4vh;
    span {
      position: relative;
      &::after {
        content: "";
        width: 8px;
        height: 8px;
        display: block;
        position: absolute;
        left: -10px;
        top: 50%;
        transform: translate(-100%, -50%);
        background: rgba(134, 142, 231, 1);
      }
    }
  }
  .hm {
    font-size: unit(50 / 1920 * 100, vw);
    font-family: DINAlternate-Bold, DINAlternate;
    font-weight: bold;
    color: rgba(247, 252, 255, 1);
    margin-bottom: 1vh;
    span {
      font-size: unit(20 / 1920 * 100, vw);
    }
  }
  .db {
    font-size: unit(15 / 1920 * 100, vw);
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(139, 216, 255, 1);
    img {
      margin-right: 4px;
      width: unit(16 / 1920 * 100, vw);
      height: unit(16 / 1920 * 100, vw);
    }
    span {
      font-size: unit(26 / 1920 * 100, vw);
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(247, 252, 255, 1);
    }
  }
}

.content-l-b {
  text-align: left;
  padding: 0 1.8vh 0 6.8vh;
  margin: 0 1vh;
  .title {
    height: 4vh;
    line-height: 4vh;
    font-size: 25px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: rgba(77, 182, 241, 1);
    border-bottom: 1px solid rgba(6, 71, 128, 1);
    margin-bottom: 3vh;
    display: flex;
    align-items: center;
    img {
      width: 15px;
      height: 14px;
      margin-right: 13px;
    }
  }
  .num {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: unit(32 / 1920 * 100, vw);
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: rgba(198, 234, 255, 1);
    margin-bottom: 2vh;
    span {
      width: 8vh;
      height: 8vh;
      line-height: 8vh;
      text-align: center;
      display: inline-block;
      margin: 0 1vh;
    }
    .int {
      font-size: unit(50 / 1920 * 100, vw);
      font-family: Helvetica;
      color: rgba(255, 255, 255, 1);
      border: 2px solid rgba(40, 119, 171, 0.87);
      vertical-align: middle;
    }
    .float {
      width: 6vh;
      height: 6vh;
      line-height: 6vh;
      font-size: unit(32 / 1920 * 100, vw);
      font-family: Helvetica;
      color: rgba(255, 255, 255, 1);
      border: 2px solid rgba(40, 119, 171, 0.87);
      vertical-align: middle;
      margin-top: 1.8vh;
    }
  }
  .totalNum {
    text-align: center;
    font-size: unit(24 / 1920 * 100, vw);
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: rgba(255, 255, 255, 1);
    line-height: unit(24 / 1920 * 100, vw);
    margin-bottom: 1.6vh;
    .el-col {
      text-align: left;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      span {
        color: rgba(255, 208, 120, 1);
        position: relative;
        &::after {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: block;
          position: absolute;
          left: -12px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 208, 120, 1);
        }
      }
    }
    .el-col:last-of-type {
      text-align: right;
      font-size: unit(16 / 1920 * 100, vw);
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      span:nth-of-type(2) {
        color: rgba(120, 209, 255, 1);
        margin-left: 40px;
        &::after {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: block;
          position: absolute;
          left: -12px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(120, 209, 255, 1);
        }
      }
    }
  }
}
.content-r {
  .each {
    width: 100%;
    height: 26vh;
    margin-top: 1.5vh;
    .yys {
      font-size: 13px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(77, 182, 241, 1);
      text-align: left;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .db {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(255, 255, 255, 1);
        margin-top: 10px;
        img {
          width: 9px;
          height: 11px;
          margin-right: 4px;
        }
        span {
          color: rgba(255, 218, 0, 1);
        }
      }
    }
    .num {
      font-size: 44px;
      font-family: DINAlternate-Bold, DINAlternate;
      font-weight: bold;
      color: rgba(253, 254, 255, 1);
      span:last-of-type {
        font-size: 14px;
      }
    }
    &:nth-of-type(2),
    &:nth-of-type(3) {
      margin-top: 3vh;
    }
  }
}

@media screen and (max-width: 1920px) {
  #eachChart-r {
    height: 20vh;
  }
  .content-l-h .hm {
    font-size: 56px;
  }
}
@media screen and (max-width: 1600px) {
  #eachChart-r {
    height: 16.5vh;
  }
  .content-r {
    .each .num {
      font-size: 30px !important;
    }
  }
  .content-l-h .el-row {
    padding-top: 3.5vh;
  }
  .content-l-b {
    .num {
      span {
        width: 6vh;
        height: 6vh;
        line-height: 6vh;
      }
      .int {
        font-size: 32px;
      }
      .float {
        width: 4vh;
        height: 4vh;
        line-height: 4vh;
        font-size: 20px;
      }
    }
  }
}
</style>

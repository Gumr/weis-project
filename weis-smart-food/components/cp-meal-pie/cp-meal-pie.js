// components/cp-meal-pie/cp-meal-pie.js
import echarts from '../../libs/echarts'
import {
  t,
  round
} from '../../utils/common';
import {
  debounce,
} from '../../utils/throttle';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hideScore: {
      type: Boolean,
      value: false,//隐藏仪表盘
    },
    theme: {
      type: String,
      value: 'simple',
    },
    dialData: {
      type: Object,
      value: {
        totalCarbonwater: 1,//计划碳水
        carbonwaterSupply: 0,//实际碳水
        totalProtein: 1,//计划蛋白质
        proteinSupply: 0,//实际蛋白质
        totalFat: 1,//计划脂肪
        fatSupply: 0,//实际脂肪
        totalEnergy: 1,//计划能量
        energySupply: 0,//实际能量
        totalSalt: 0,//计划盐量
        saltSupply: 0,//实际盐量
        foodTypeNum: 0,//食物多样性
        totalDiversity: 0,//计划食物多样性
        fiberSupply: 0,//膳食纤维
        totalFiber: 0,//计划膳食纤维
        nutritionHealthScore: 0,//健康分
      },
    },
    mode: {
      type: String,
      value: 'canvas',
    },
    showControl: {
      type: Boolean,
      value: false
    },
    page: {
      type: String,
      value: '',
    },
  },

  observers: {
    theme(data){
      console.log(data)
      if(data == 'panel'){
        // 切换到表盘 指针从0开始
        this.panelIsChange = true;
      }
    },
    dialData: debounce(400, function(data){
      let {theme} = this.data;
      console.log(data + '----' + theme)
      if(theme == 'simple'){
        // 简约
        this.initData();
      }else if(theme == 'panel'){
        // 仪表盘
        this.setData({
          image: ''
        })
        this.initData();
        console.log(this.panel)
        if(this.panelIsChange || !this.panel || !this.getChart){
          // 切换到表盘 指针从0开始转动
          this.panel = this.selectComponent('#panel')
          this.getChart = this.initChart(this.panel);
          if(this.panelIsChange){
            this.panelIsChange = false;
          }
        }
        this.render();
      }else if(theme == 'pillars'){
        this.initData();
      }
    })
  },

  ready() {
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    image: '',
    ec: {
      lazyLoad: false
    },
    smallSize: {
      title: 20,
      value: 40,
      unit: 18,
      label: 20,
    },
    lineWidth: {
      dark: 6, // 内圆宽度
      light: 10 // 外圆宽度
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initData(){
      let theme = this.data.theme;
      let dialData = this.data.dialData;
      if(theme == 'simple'){
        dialData.carbonwaterPercent = round((dialData.carbonwaterSupply / dialData.totalCarbonwater ) * 100, 0);// 实际碳水/(计划碳水)
        dialData.proteinPercent =round((dialData.proteinSupply / dialData.totalProtein ) * 100, 0);// 实际蛋白质/(计划蛋白质)
        dialData.fatPercent = round((dialData.fatSupply / dialData.totalFat ) * 100, 0);// 实际脂肪/(计划脂肪)
        dialData.energyPercent = round((dialData.energySupply / dialData.totalEnergy ) * 100, 0);//能量百分比
        dialData.saltPercent = round((dialData.saltSupply / dialData.totalSalt ) * 100, 0);//盐量百分比
      }else if(theme == 'panel'){
        dialData.carbonwaterPercent = Math.min(round((dialData.carbonwaterSupply / (dialData.totalCarbonwater * 1.2) ) * 100, 1), 100);// 实际碳水/(计划碳水*120%)
        dialData.proteinPercent = Math.min(round((dialData.proteinSupply / (dialData.totalProtein * 1.2) ) * 100, 1), 100);// 实际蛋白质/(计划蛋白质*120%)
        dialData.fatPercent = Math.min(round((dialData.fatSupply / (dialData.totalFat * 1.2) ) * 100, 1), 100);// 实际脂肪/(计划脂肪*120%)
        dialData.energyPercent = round((dialData.energySupply / dialData.totalEnergy ) * 100, 1);//能量百分比
      }else if(theme == 'pillars'){
        dialData.carbonwaterPercent = Math.min(round((dialData.carbonwaterSupply / dialData.totalCarbonwater ) * 100, 1), 120);// 实际碳水/(计划碳水)
        dialData.proteinPercent = Math.min(round((dialData.proteinSupply / dialData.totalProtein ) * 100, 1), 120);// 实际蛋白质/(计划蛋白质)
        dialData.fatPercent = Math.min(round((dialData.fatSupply / dialData.totalFat ) * 100, 1), 120);// 实际脂肪/(计划脂肪)
        dialData.energyPercent = Math.min(round((dialData.energySupply / dialData.totalEnergy ) * 100, 1), 120);//能量百分比
        dialData.saltPercent = Math.min(round((dialData.saltSupply / dialData.totalSalt ) * 100, 1), 120);//盐量百分比
        dialData.foodPercent = Math.min(round((dialData.foodTypeNum / dialData.totalDiversity ) * 100, 1), 120);//食物多样性百分比
        dialData.fiberPercent = Math.min(round((dialData.fiberSupply / dialData.totalFiber ) * 100, 1), 120);//膳食纤维
      }
      this.setData({
        plateData: dialData,//表盘数据
      })
    },
    render() {
      let {plateData,} = this.data;
      return this.getChart.then((chart) => {
        if (this.option) {
          this.option.series[0].data[0].value = plateData.energySupply;
          this.option.series[0].axisLine.lineStyle.color[0] = [Math.min(round(plateData.totalEnergy/800, 2), 1), '#fff'];
        } else {
          this.option = {
            backgroundColor: 'transparent',
            tooltip: {
              formatter: '{a} <br/>{b} : {c}%'
            },
            toolbox: {
              feature: {
                restore: {},
                saveAsImage: {
                  show: true,
                }
              }
            },
            series: [{
              name: 'gauge',
              type: 'gauge',
              min: 0,
              max: 800,
              z: 10,
              startAngle: 210,
              endAngle: -30,
              splitNumber: 8,
              radius: '100%',
              center: ['50%', '50%'],
              axisLine: {
                show: true,
                lineStyle: {
                  width: 0,
                  color: [
                    [Math.min(round(plateData.totalEnergy/800, 2), 1), '#fff'],
                    [1, '#FA6400']
                  ]
                }
              },
              splitLine: {
                distance: 14,
                length: 10,
                lineStyle: {
                  color: 'auto',
                  width: 2,
                  shadowColor: 'rgba(255, 255, 255, 0)',
                  shadowBlur: 0,
                  shadowOffsetY: 0
                }
              },
              axisTick: {
                distance: 14,
                length: 7,
                splitNumber: 4,
                lineStyle: {
                  color: 'auto',
                  width: 2,
                  shadowColor: 'rgba(255, 255, 255)',
                  shadowBlur: 10,
                  shadowOffsetY: -10,
                }
              },
              axisLabel: {
                show: true,
                distance: 2,
                fontSize: 10,
                fontWeight: 100,
                fontFamily: "Microsoft YaHei",
                color: '#fff'
              },
              anchor: {},
              pointer: {
                icon: 'path://M90.205208,1.116068 C90.5307735,0.912662983 90.9339354,0.833457028 91.3375264,0.926662362 C91.6168821,0.991176801 91.8656263,1.13250036 92.0606602,1.32753425 C92.2556941,1.52256813 92.3970176,1.77131233 92.4615321,2.05066805 L92.4615321,2.05066805 L97.299573,23 L84.700427,23 L89.5384679,2.05066805 C89.6316733,1.64707711 89.8796424,1.31947303 90.205208,1.116068 Z',
                width: 6,
                length: '10%',
                offsetCenter: [0, '-48%'],
                itemStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                      offset: 0,
                      color: '#FF7000' // 0% 处的颜色
                    }, {
                      offset: 0.7,
                      color: '#FF9441' // 100% 处的颜色
                    }, {
                      offset: 1,
                      color: '#FFFFFF' // 100% 处的颜色
                    }],
                  },
                  borderColor: '#FFF',
                  shadowColor: 'rgba(255, 0, 0)',
                  shadowBlur: 0,
                  shadowOffsetY: 0
                }
              },
              title: {
                show: false,
                color: '#fff',
                fontSize: 12,
                fontWeight: 800,
                fontFamily: "Arial",
                offsetCenter: [0, '-50%']
              },
              data: [{
                value: plateData.energySupply,
              }],
              detail: {
                show: false
              }
            }]
          };
        }

        chart.setOption(this.option, true)
        return chart;
      })
    },
    initChart(component) {
      return new Promise(resolve => {
        component
          .init((canvas, width, height) => {
            const chart = echarts.init(canvas, null, {
              width,
              height
            });

            resolve(chart);
            return chart;
          });
      })
    },
    finished(e){
      if(this.data.mode === 'image'){
        this.setData({
          image: e.detail
        })
      }
    },
    score(){
      this.triggerEvent('toHealth');
    },
    control(){
      this.triggerEvent('control');
    },
  }
})
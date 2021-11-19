// components/cp-radar-panel/cp-radar-panel.js
import echarts from '../../libs/echarts'
import {
  t,
  round
} from '../../utils/common';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    score: {
      type: Array,
      value: [],
    },
    mode: String,
    radarStyle:{
      type: String,
      value: 'width:540rpx;height:540rpx;'
    },
    radius:{
      type: String,
      value: '60%',
    },
    tip:{
      type: Boolean,
      value: false,
    },
    areaColor:{
      type: String,
      value: '#FCE0BC',
    },
    title:{
      type: String,
      value: '',
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    ec: {
      lazyLoad: false
    },
    img: 'https://prodstatic.weis1606.cn/api/smartFood/tag-icon.png',
    // score: [
    //     {
    //         name: `热量可控`,
    //         index: 0,
    //         max: 30,
    //         value: 22,
    //     },
    //     {
    //         name: '营养均衡',
    //         index: 1,
    //         max: 30,
    //         value: 14,
    //     },
    //     {
    //         name: '食物多样',
    //         index: 2,
    //         max: 20,
    //         value: 8,
    //     },
    //     {
    //         name: '清淡少盐',
    //         index: 3,
    //         max: 10,
    //         value: 8,
    //     },
    //     {
    //         name: '纤维充足',
    //         index: 4,
    //         max: 10,
    //         value: 10,
    //     }
    // ],
  },

  observers: {
    score(data) {
      if (!this.isReady) return;
      if (data && data.length > 0) {
        this.render()
      }
    }
  },

  ready() {
    this.isReady = true;
    this.component = this.selectComponent('#chart')
    this.getChart = this.initChart(this.component)
    const { score } = this.data;
    if(score && score.length > 0){
      this.render()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
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
    render() {
      const {score,img, radius, tip, areaColor, title} = this.data;
      const that = this;
      return this.getChart.then((chart) => {
        const option = {
          radar: {
            // shape: 'circle',
            indicator: score,
            center: ['50%', '50%'],
            radius: radius,
            triggerEvent: true,
            splitArea: {
              areaStyle: {
                color: [areaColor],
              },
            },
            splitLine: {
              lineStyle: {
                color: ['#FAA66E']
              },
            },
            axisLine: {
              lineStyle: {
                color: ['#FAA66E']
              },
            },
            name: {
              color: '#7A3E00',
              fontSize: '10',
              align: 'center',
              lineHeight: 15,
              fontWeight: 'bold',
              formatter: function (value, params) {
                let str;
                if(params.index == 0){
                  str = tip ? [
                    `{max|${params.name}} {iconStyle|!}`,
                    `{max|满分(${score[params.index].max})}`,
                    `{actual|${score[params.index].value}}`
                  ].join('\n') : [
                    `{max|${params.name}}`,
                    `{actual|${score[params.index].value}}`
                  ].join('\n') 
                }else{
                  str = tip ? [
                    `{actualPad|${score[params.index].value}}`,
                    `${params.name} {iconStyle|!}`,
                    `满分(${score[params.index].max})`,
                  ].join('\n') : [
                    `{actualPad|${score[params.index].value}}`,
                    `${params.name}`,
                  ].join('\n')
                }
                return str
              },
              rich: {
                iconStyle: {
                  width: 10,
                  height: 10,
                  align: 'center',
                  verticalAlign: 'middle',
                  borderColor: '#FA6400',
                  borderRadius: 5,
                  lineHeight: 10,
                  fontSize: 8,
                  backgroundColor: '#FAA66E',
                },
                max:{
                  padding: [0, 0, -40, 0],
                  color: '#7A3E00',
                  fontSize: '10',
                  align: 'center',
                  lineHeight: 15,
                  fontWeight: 'bold',
                },
                actual: {
                  color: '#7A3E00',
                  fontSize: 18,
                  fontWeight: 'bold',
                  align: 'center',
                  padding: [10, 0, -40, 0],
                },
                actualPad: {
                  color: '#7A3E00',
                  fontSize: 18,
                  fontWeight: 'bold',
                  align: 'center',
                  padding: [0, 0, 10, 0],
                },
              }
            },
            nameGap: 30,
            splitNumber: 3,
          },
          series: [{
            name: '营养健康分',
            type: 'radar',
            areaStyle: {
              color: 'rgba(250, 100, 0, 0.4)',
            },
            lineStyle: {
              color: '#FA6400'
            },
            itemStyle: {
              color: '#FA6400',
            },
            data: [{
              value: score.map(item => item.value),
              name: '营养健康分',
              symbol: 'none',
            }],
          }],
          backgroundColor: 'transparent',
        };
        if(title){
          option.title = {
            text: title,
            x: 'center',
            y: 'center',
            textStyle: {
                color: '#7A3E00',
                fontWeight: 'normal',
                fontSize: 50,
                fontFamily: 'DINCondensedC'
            }
          }
        };
        chart.setOption(option, true);
        chart.on('click', function (params) {
          if(that.data.tip){
            let name = params.name;
            let index;
            for(var i = 0; i < score.length; i++){
              if(name.indexOf(score[i].name) >= 0){
                index = i;
                break;
              }
            }
            that.setData({
              index,
            })
            if(index >= 0){
              that.triggerEvent('on-tip', index);
            }
          }
        });
        that.transformImage(chart)
        return chart;
      })
    },
    transformImage(chart) {
      chart.on('finished', () => {
        setTimeout(()=>{
          this.component.canvasToTempFilePath({
            success: (res) => {
              this.setData({
                image: res.tempFilePath
              })
              this.triggerEvent('on-finished', res.tempFilePath);
            }
          })
        },200)
      })
    },
  }
})
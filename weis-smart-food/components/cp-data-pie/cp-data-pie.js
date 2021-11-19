import echarts from '../../libs/echarts'
import { t, round } from '../../utils/common'
// components/data-pie/data-pie.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: Array,
    customStyle: String,
    customRadius: {
      type: Array,
      value: null
    },
    customOption: {
      type: Object,
      value: null
    },
    ishighlight: {
      type: Boolean,
      value: true
    },
    activeIndex: {
      value: 0,
      type: Number
    },
    mode: {
      type: String,
      value: 'canvas',
    },
    showPercent: {
      type: Boolean,
      value: false
    }
  },
  observers: {
    customOption(data) {
      if (!this.isReady) return;
      if (data) {
        this.render(data)
      }
    },
    data(data) {
      if (!this.isReady) return;
      if (data) {
        this.render(data)
      }
    }
  },

  ready() {
    this.isReady = true;
    this.component = this.selectComponent('#chart')
    this.getChart = this.initChart(this.component)

    if (this.data.mode === 'image') {
      this.getChart.then((chart) => {
        this.transformImage(chart)
      })
    }

    const { data } = this.data;
    if (data && data.length > 0) {
      this.render(data)
    }


  },
  /**
   * 组件的初始数据
   */
  data: {
    image: '',
    ec: {
      lazyLoad: false
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    transformImage(chart) {
      chart.on('finished', () => {
        this.component.canvasToTempFilePath({
          success: (res) => {
            this.setData({
              image: res.tempFilePath
            })
          }
        })
      })
    },
    render(data) {
      const radius = this.data.showPercent ? ['35%', '55%'] : ['65%', '87%'];

      return this.getChart.then((chart) => {
        const option = this.data.customOption ? this.data.customOption : {
          title: {
            show: false,
          },
          series: [
            {
              type: 'pie',
              silent: true,
              animation: true,
              animationDuration: 0,
              radius: this.data.customRadius || radius,
              hoverOffset: t(10),
              label: this.data.showPercent
                ? {
                  show: true,
                  fontSize: Math.floor(t(28)),
                  formatter: (params) => {
                    return round(params.percent, 1) + '%'
                  }
                }
                : {
                  show: false,
                },
              data: data.map((item, index) => {
                const res = {};

                res.name = item.name || index;
                res.value = item.value;

                res.itemStyle = {
                  color: item.color
                }
                return res;
              })
            },
          ],
        };

        chart.setOption(option, true)

        if(this.data.ishighlight) {
          chart.dispatchAction({
            type: 'highlight',
            seriesIndex: this.data.activeIndex,
            dataIndex: this.data.activeIndex,
          });
        }

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
  }
})

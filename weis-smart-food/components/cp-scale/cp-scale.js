import { throttle } from '../../utils/throttle';
// components/scale/scale.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    min: {
      type: Number,
      value: 0
    },
    max: {
      type: Number,
      value: 10
    },
    value: {
      type: Number,
      value: 0
    },
    precision: {
      // 精度
      type: Number,
      value: 1
    },
    height: {
      type: Number,
      value: 80
    },
    intervalWidth: {
      // 间隔宽度
      type: Number,
      value: 40
    },
    intervalValue: {
      // 间隔值
      type: Number,
      value: 1
    },
    modalShow: {
      // 左右的蒙层渐变
      type: Boolean,
      value: true
    },
  },
  ready() {
    setTimeout(() => {
      this.toView();
    }, 200);

    // this.formatRectWidth().then(() => {

    // });
    // setTimeout(() => {
    //   this.formatRectWidth().then(() => {
    //     this.toView();
    //   });
    // }, 200);
    // this.hasIntersection = wx.createIntersectionObserver != null;
    // if (this.hasIntersection) {
    //   this.initObserver();
    // }
  },
  observers: {
    intervalWidth(width) {
      this.elWidth = width;
      this.setData({
        supportWidth: width / 2
      });
    },
    precision(val) {
      this.setData({
        precisionCount: 1 / val
      });

      this.toView();
    },
    max() {
      this.toView();
    },
    value() {
      this.toView();
    }
    // precision(precision) {
    //   this.ratio = 1 / precision;
    // },
    // 'value, intervalWidth'() {
    //   if (this.hasIntersection) {
    //     this.recompute = true;
    //   } else {
    //     this.formatRectWidth().then(width => {
    //       if (width) {
    //         this.toView();
    //       }
    //     });
    //   }
    // },
    // 'min, max, precision'(newMin, newMax, newPre) {
    //   const [oldMin, oldMax, oldPre] = this.oldScaleData || [];
    //   // 生成scale-list 依赖了这三个属性 生成时判断他的数据有没有变化 避免重复生成计算
    //   if (oldMin !== newMin || oldMax !== newMax || oldPre !== newPre) {
    //     this.oldScaleData = [newMin, newMax, newPre];
    //     // this.genScaleList();
    //     if (this.hasIntersection) {
    //       this.recompute = true;
    //     } else {
    //       this.toView();
    //     }
    //   }
    // }
  },
  /**
   * 组件的初始数据
   */
  data: {
    precisionCount: 0,
    // supportList: [], // 填充刻度尺两边的刻度列表
    // scaleList: [], // 刻度列表
    scrollLeft: 0, // 当前scrollLeft的位置
    supports: 0,
    supportWidth: 0
  },
  elWidth: 0,
  /**
   * 组件的方法列表
   */
  methods: {
    scrollHandler: throttle(60, function(e) {
      const scrollToLeft = Math.ceil(e.detail.scrollLeft);
      // 用当前距离left的滑动距离/间隔宽度 就是当前四舍五入后要对应的数据index
      const current = Math.floor(scrollToLeft / this.elWidth);
      let value = current * this.properties.precision + this.properties.min;
      // const debounceToView = debounce(300, () => {
      if (value < this.properties.min) {
        value = this.properties.min;
      } else if (value > this.properties.max) {
        value = this.properties.max;
      }
      // });
      // debounceToView();
      // this.toView(current);
      this.triggerEvent('change', { value });
    }),
    // 注册intersection observer回调器
    // initObserver() {
    //   wx.createIntersectionObserver(this)
    //     .relativeToViewport()
    //     .observe('#scale', res => {
    //       this.inView = res.boundingClientRect.top >= 0;
    //       if (!this.inView) return;
    //       // 间隔elwidth 未计算出来时和值更改了需要重新计算时 需要调用format
    //       if (!this.elWidth || this.recompute) {
    //         this.formatRectWidth().then(() => {
    //           this.recompute = false;
    //           this.toView();
    //         });
    //       } else if (this.remove) {
    //         // 调用cycleView方法时 说明需要调用toview 则在显示时调用一下
    //         this.remove = false;
    //         this.toView();
    //       }
    //     });
    // },
    // getValueIndex() {
    //   return this.ratio * (this.properties.value - this.properties.min);
    // },
    // // 刻度组件在弹窗时 需要弹窗显示后才能正确计算间隔的宽度
    // cycleToView() {
    //   // 在没有observer的微信环境里 使用cycletoView函数的回退方案_backCycleToView
    //   this._backCycleToView();
    // },
    // _backCycleToView() {
    //   this.formatRectWidth().then(width => {
    //     if (width) {
    //       setTimeout(() => {
    //         this.toView();
    //       }, 360);
    //     } else {
    //       setTimeout(() => {
    //         this._backCycleToView();
    //       }, 60);
    //     }
    //   });
    // },
    // toView(_index, intervalWidth = this.elWidth) {
    //   // inview 判断是否在显示在视口 如果不在视口则记录一次调用 在下次显示在视口时进行toview操作
    //   if (!this.inView && this.hasIntersection) {
    //     this.remove = true;
    //     return;
    //   }

    //   const index = _index != null ? _index : this.getValueIndex();
    //   const scrollLeft = index * intervalWidth;
    //   if (scrollLeft && this.data.scrollLeft !== scrollLeft) {
    //     this.setData({
    //       scrollLeft: scrollLeft
    //     });
    //   }
    // },
    toView() {
      const value = this.properties.value;
      const scrollLeft =
        this.elWidth *
        ((value - this.properties.min) / this.properties.precision);

      this.setData({
        scrollLeft
      });
    },
    formatRectWidth() {
      return this.getRect('.scale-item-wrap').then(rect => {
        // 判断获取元素的宽度跟当前this的宽度是否不相等
        this.elWidth = rect.width;

        this.setData({
          supportWidth: rect.width / 2
        });
        // 更新刻度分割宽度后 要重新计算出两边填充的刻度尺
        this.getRect('.support-box').then(rt => {
          this.setData({
            supports: Math.ceil(rt.width / this.elWidth)
          });
        });

        return rect;
      });
    },
    getRect(selector) {
      return new Promise(resolve => {
        this.createSelectorQuery()
          .select(selector)
          .boundingClientRect(resolve)
          .exec();
      });
    }
    // 生成补充刻度尺的循环列表
    // genSupportList(count) {
    //   const list = [];
    //   for (let i = 0; i <= count; i += 1) {
    //     list.push(i);
    //   }

    //   this.setData({
    //     supportList: list
    //   });
    // },
    // 生成刻度尺列表
    // genScaleList() {
    //   const { max, min, precision } = this.properties;

    //   const list = [];
    //   for (let i = min; i <= max; i += precision) {
    //     i = +i.toFixed(1);
    //     list.push(i);
    //   }

    //   this.setData({
    //     scaleList: list
    //   });
    // }
  }
});

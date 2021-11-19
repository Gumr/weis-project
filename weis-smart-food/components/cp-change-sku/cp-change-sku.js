// components/cp-change-sku/cp-change-sku.js
let app = getApp();
import {
  debounce,
  throttle
} from '../../utils/throttle';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    resultList: Array,
    scrollHeight: Number,
    totalNum: {
      type: Number,
      value: 0,
    },
    countPrice: {
      type: Number,
      value: 0,
    }
  },

  observers: {
    resultList(data) {
      if (Array.isArray(data) && data.length > 0 && !this.ready) {
        this.ready = true;
        this.formatList(data)
      }
    },
  },

  ready() {

  },

  /**
   * 组件的初始数据
   */
  data: {
    leftIndex: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    formatList(data) {
      console.log(data)
      const resultList = data;
      resultList.forEach((item1, index1) => {
        // 添加换行符
        if (item1.lineBreakPosition > 0) {
          const skuCatalog = item1.skuCatalog;
          const skuCatalogArr = skuCatalog.split('');
          skuCatalogArr.splice(item1.lineBreakPosition, 0, '\n');
          item1.skuKind = skuCatalogArr.join('');
        } else {
          item1.skuKind = item1.skuCatalog;
        }
        item1.detailList && item1.detailList.forEach((item2, index2) => {
          if (Array.isArray(item2.dietaryIntakes)) {
            item2.dietaryIntakes = item2.dietaryIntakes.filter(label => label.type === '02')
          } else if (Array.isArray(item2.dietLabelList)) {
            item2.dietLabelList = item2.dietLabelList.filter(label => label.type === '12' || label.type === '14')
          }
        })
      })
      this.setData({
        nameList: resultList,
      })
      this.countKindNum();
    },
    // 统计菜单分类下菜品数量
    countKindNum(){
      let nameList = this.data.nameList;
      nameList.forEach((item)=>{
        if(item.skuCatalog !== '我的最爱' && item.skuCatalog !== '新品'){
          if(item.detailList){
            item.num = item.detailList.reduce((c, im) => (im.type ? c + 0 : c + im.num), 0) //type存在套餐
          }
        }
      })
      this.setData({
        nameList
      })
    },
    selectKind: function (e) {
      let {
        index
      } = e.currentTarget.dataset;
      this.setData({
        leftIndex: index,
        intoIndex: `scroll_${index}`
      })
    },
    scroll: throttle(200, function (e) {
      let that = this;
      let navStatusHeight = app.globalData.navStatusHeight;
      let wrapTop = navStatusHeight;
      var query = wx.createSelectorQuery();
      query.in(this).selectAll('.wrap-box').boundingClientRect(function (rect) {
        let domList = rect;
        for (var i = 0; i < domList.length; i++) {
          if (domList[i].top <= wrapTop && domList[i + 1] && domList[i + 1].top > wrapTop) {
            if (that.data.leftIndex != i) {
              that.setData({
                leftIndex: i
              })
            }
            break
          } else if (domList[i].top <= wrapTop && i == domList.length - 1) {
            if (that.data.leftIndex != i) {
              that.setData({
                leftIndex: i
              })
            }
            break
          }
        }
      }).exec();
    }),
    add(e){
      let nameList = this.data.nameList;
      let {wrapindex, index, type} = e.currentTarget.dataset;
      type == 'add' ? nameList[wrapindex].detailList[index].num ++ : nameList[wrapindex].detailList[index].num --;
      this.setData({
        nameList
      })
      this.countKindNum()
      this.triggerEvent('tapAdd', {
        value: nameList
      })
    },
    confirmChangeFn(){
      this.triggerEvent('change')
    },
  }
})
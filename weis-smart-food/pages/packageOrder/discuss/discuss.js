// pages/mineBox/discuss/discuss.js
import apiRequest from '../../../service/index';
import day from '../../../libs/day'
import {
  categoryMap
} from '../../../utils/map'
import {
  filterTablewareSku,
  loginPromise
} from '../../../utils/common'
let app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryMap,
    rateMap: {
      1: '非常差',
      2: '较差',
      3: '一般',
      4: '较好',
      5: '非常好',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    loginPromise.then((res) => {
      this.setData({
        uid: res.uid,
        id: options.id,
        evaluationStt: Boolean(options.evaluationStt), //true 已评价
      }, async () => {
        await this.init();
        if (this.data.evaluationStt) {
          this.queryOrderEvaluate();
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  init: function () {
    var that = this;
    return apiRequest.queryShipOrderDetailForThree({
        shipOid: that.data.id,
      })
      .then(res => {
        let shipResult = res.obj.shipResult;
        shipResult = shipResult.map((ret) => {
          ret.$category = categoryMap[ret.detail.category];
          ret.$date = day(ret.detail.date).format('M月D日');
          ret.selectIdx = 0;
          ret.detail.skuList = filterTablewareSku(ret.detail.skuList).filter((item) => {
            return item.showFlag == '01';
          });
          return ret;
        })
        that.setData({
          shipResult,
          waybillRecord: res.obj.waybillRecord,
        })
      })
      .catch(error => {

      })

  },

  // 查看评价
  queryOrderEvaluate() {
    apiRequest.queryOrderEvaluate({
      shipOid: this.data.id,
    }).then((res) => {
      let transferEvaluate = res.obj.orderEvaluates.transferEvaluate; //配送评价
      let dishesEvaluate = res.obj.orderEvaluates.dishesEvaluate; //餐单 sku 评价
      let shipResult = this.data.shipResult;

      // 配送评价
      if (transferEvaluate) {
        this.setData({
          evaluate: transferEvaluate.evaluate,
          psAdvise: transferEvaluate.econtent,
          horseManImgList: transferEvaluate.econtentImgs.split(","),
        })
      }

      for (var i = 0; i < dishesEvaluate.length; i++) {
        for (var j = 0; j < dishesEvaluate[i].evaluates.length; j++) {
          ship: for (var h = 0; h < shipResult.length; h++) {
            for (var k = 0; k < shipResult[h].detail.skuList.length; k++) {
              if (dishesEvaluate[i].orderOid == shipResult[h].detail.orderId && dishesEvaluate[i].evaluates[j].skuId == shipResult[h].detail.skuList[k].id && dishesEvaluate[i].evaluates[j].type == '00') {
                shipResult[h].detail.skuList[k].taste = dishesEvaluate[i].evaluates[j].evaluate || 0;
                shipResult[h].detail.skuList[k].advise = dishesEvaluate[i].evaluates[j].econtent || '';
                shipResult[h].detail.skuList[k].horseManImgList = dishesEvaluate[i].evaluates[j].econtentImgs && dishesEvaluate[i].evaluates[j].econtentImgs.split(",") || [];
                if(!shipResult[h].show && (dishesEvaluate[i].evaluates[j].evaluate > 0 || dishesEvaluate[i].evaluates[j].econtent || dishesEvaluate[i].evaluates[j].econtentImgs)){
                  shipResult[h].show = true;
                }
                break ship
              }
            }
          }
        }
      }
      this.setData({
        shipResult
      })
    })
  },

  // 菜品评价
  taste: function (e) {
    let index = e.currentTarget.dataset.index;
    let shipResult = this.data.shipResult;
    shipResult[index].detail.skuList[shipResult[index].selectIdx].taste = e.detail
    this.setData({
      shipResult
    })
    this.check()
  },

  // 菜品建议
  advise: function (e) {
    let index = e.currentTarget.dataset.index;
    let shipResult = this.data.shipResult;
    shipResult[index].detail.skuList[shipResult[index].selectIdx].advise = e.detail.value
    this.setData({
      shipResult
    })
    this.check()
  },

  // 菜品上传图片
  chooseSkuImage(e) {
    const shipResult = this.data.shipResult;
    let index = e.currentTarget.dataset.index;
    let idx = shipResult[index].selectIdx;
    let horseManImgList = shipResult[index].detail.skuList[idx].horseManImgList || [];

    if (horseManImgList.length >= 4) {
      wx.showToast({
        title: '最多上传4张图!',
        icon: 'none'
      })
      return;
    }
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFilePaths) {
          apiRequest
            .uploadFile(``, res.tempFilePaths[0])
            .then(response => {
              response = JSON.parse(response.data);
              if (response.errCode === 0) {
                shipResult[index].detail.skuList[idx].horseManImgList = [...horseManImgList, response.obj.imageUrl];
                this.setData({
                  shipResult,
                })
                this.check()
              }
            });
        }
      }
    })
  },

  // 骑手评价
  evaluate: function (e) {
    this.setData({
      evaluate: e.detail
    })
  },

  // 骑手建议
  psAdvise(e) {
    this.setData({
      psAdvise: e.detail.value
    })
  },

  chooseImage() {
    const horseManImgList = this.data.horseManImgList || [];

    if (horseManImgList.length >= 4) {
      wx.showToast({
        title: '最多上传4张图!',
        icon: 'none'
      })
      return;
    }
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFilePaths) {
          apiRequest
            .uploadFile(``, res.tempFilePaths[0])
            .then(response => {
              response = JSON.parse(response.data);
              if (response.errCode === 0) {
                this.setData({
                  horseManImgList: [...horseManImgList, response.obj.imageUrl]
                })
              }
            });
        }
      }
    })
  },

  deleteImage(evt) {
    const {
      index
    } = evt.currentTarget.dataset;
    const {
      horseManImgList
    } = this.data;
    horseManImgList.splice(index, 1)
    this.setData({
      horseManImgList
    })
  },

  // 删除sku图片评价
  deleteSkuImage(e) {
    let index = e.currentTarget.dataset.index;
    let skuIdx = e.currentTarget.dataset.skuIdx;
    let shipResult = this.data.shipResult;
    shipResult[index].detail.skuList[shipResult[index].selectIdx].horseManImgList.splice(skuIdx, 1);
    this.setData({
      shipResult
    })
    this.check()
  },

  // 选择sku
  selectSku(e) {
    let {
      index,
      idx
    } = e.currentTarget.dataset;
    let {
      shipResult
    } = this.data;
    shipResult[index].selectIdx = idx;
    this.setData({
      shipResult
    })
  },

  check: function () {
    let shipResult = this.data.shipResult;
    let active = false;
    for (var i = 0; i < shipResult.length; i++) {
      for (var j = 0; j < shipResult[i].detail.skuList.length; j++) {
        if (shipResult[i].detail.skuList[j].taste || (shipResult[i].detail.skuList[j].horseManImgList && shipResult[i].detail.skuList[j].horseManImgList.length > 0) || shipResult[i].detail.skuList[j].advise) {
          active = true;
          break
        }
      }
    }
    this.setData({
      active,
    })
  },

  submit: function () {
    if (!this.data.active || (this.data.waybillRecord.distributionMode == 0 && this.data.waybillRecord.uid == this.data.uid && !this.data.evaluate)) {
      return
    }
    var that = this;
    let shipResult = that.data.shipResult;
    let waybillRecord = that.data.waybillRecord;
    let evaluate = that.data.evaluate || 0; //配送星星
    let psAdvise = that.data.psAdvise || ''; //配送建议
    let horseManImgList = that.data.horseManImgList || []; //配送评价图片
    let skuReviewList = []; //餐单评价
    shipResult.forEach((item, index) => {
      item.detail.skuList.forEach((main, idx) => {
        let data = {};
        data.shipOid = waybillRecord.shipOid;
        data.orderOid = item.detail.orderId;
        data.type = '00', //菜品评价
          data.evaluate = main.taste ? main.taste : 0;
        data.econtent = main.advise ? main.advise : '';
        data.econtentImgs = main.horseManImgList && main.horseManImgList.length > 0 ? main.horseManImgList.join(',') : '';
        data.skuId = main.id;
        skuReviewList.push(data)
      })
    })

    // 配送评价
    if (waybillRecord.distributionMode == 0 && waybillRecord.uid == this.data.uid) {
      let ps = {
        shipOid: waybillRecord.shipOid,
        orderOid: shipResult[0].detail.orderId,
        type: '01', //配送评价
        evaluate: evaluate,
        econtent: psAdvise,
        econtentImgs: horseManImgList.length > 0 ? horseManImgList.join(',') : '',
      };
      skuReviewList.push(ps);
    }

    apiRequest.addOrderEvaluate({
        orderEvaluates: skuReviewList,
      })
      .then(res => {
        if (res.obj.addStt) {
          this.setData({
            discussSucc: true,
          })
        }
      })
      .catch(error => {

      })

  },

  previewImage: function (e) {
    var current = e.currentTarget.dataset.src;
    if(current.indexOf('https') == -1){
      current = current.replace(/^http/,"https");
    }
    var imgList = [current];
    wx.previewImage({
      current: current, //当前点击的图片链接
      urls: imgList //图片数组
    })
  },

  back() {
    wx.navigateBack({
      delta: 1
    });
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

  }
})
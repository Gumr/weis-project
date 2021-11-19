// pages/packageOrder/goodsDetail/goodsDetail.js
const app = getApp();
// const util = require('../../../utils/util.js')
import {
  isLoginClick,
  loginPromise,
  isDoubleEleven,
  confObj,
  t
} from '../../../utils/common'
import apiRequest from '../../../service/index';
import day from '../../../libs/day'
import {
  setStorage,
  getStorage
} from '../../../utils/storage'
import Draw from '../../../utils/Draw';
import ShareImage from '../../../utils/ShareImage'
const location = require('../../../libs/location.js');
import {
  categoryMap,
} from '../../../utils/map'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    preImg: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood',
    navStatusHeight: wx.getStorageSync('navStatusHeight'),
    px2rpx: app.globalData.px2rpx,
    imgUrls: [

    ],
    indicatorDots: false, //小点
    indicatorColor: "white", //指示点颜色
    activeColor: "coral", //当前选中的指示点颜色
    autoplay: true, //是否自动轮播
    interval: 4000, //间隔时间
    duration: 400, //滑动时间
    currentIndex: 0,
    // tomorrow: util.dateUtil.format(new Date(new Date().setDate(new Date().getDate() + 1)), 'YMD'),
    // today: util.dateUtil.format(new Date(), 'YMD'),
    IMG_URL: app.globalData.IMG_URL,
    px2rpx: app.globalData.px2rpx,
    setMealImg: 'https://prodstatic.weis1606.cn/api/mini/meal_contrast_chart.png',
    // rechargeCardList: [],
    checkStock: false, // 判断是否校验库存
    showShare: false, // 是否显示 分享套餐-底部弹窗
    dialData: {
      totalCarbonwater: 1, //计划碳水
      carbonwaterSupply: 0, //实际碳水
      totalProtein: 1, //计划蛋白质
      proteinSupply: 0, //实际蛋白质
      totalFat: 1, //计划脂肪
      fatSupply: 0, //实际脂肪
      totalEnergy: 1, //计划能量
      energySupply: 0, //实际能量
      totalSalt: 0, //计划盐量
      saltSupply: 0, //实际盐量
      foodTypeNum: 0, //食物多样性
      totalDiversity: 0, //计划食物多样性
      totalFiber: 0, //膳食纤维
      fiberSupply: 0, //实际膳食纤维
      nutritionHealthScore: 0, //健康分
    },
    cart: categoryMap,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    let param = JSON.parse(options.param);
    let newDishesItem = options.newDishesItem ? JSON.parse(options.newDishesItem) : {};
    this.setData({
      selectIndex: param.selectIndex,
      code: param.code,
      from: param.from,// 来自哪个页面的跳转，discover: 发现页
      subscribe: param.subscribe || false,
      tfsStt: param.tfsStt || '',
      newDishesItem: newDishesItem || {},
      id: param.id,
      orderMethod: param.orderMethod,
      category: param.category,
      dateTime: param.dateTime ? param.dateTime : day().format('YYYYMMDD'),
      deliveryIndex: param.deliveryIndex,
      addressId: param.addressId ? param.addressId : '',
      heatId: param.heatId,
      type: param.type ? param.type : '',
      combo: param.combo ? param.combo : '00',
      comboid: param.comboid ? param.comboid : 0,
      shipType: param.shipType || '00',
      cid: param.cid || undefined,
      corpId: param.corpId || undefined,
      groupcomboId: param.groupcomboid || undefined,
      tgcaId: param.tgcaId || undefined,
      tgeRole: param.tgeRole || undefined,
      ageType: param.ageType || '',
      subuidsList: param.subuidsList || [],
      goodsShare: param.goodsShare || false,
      spellOrder: param.spellOrder || false,
      spellGroup: param.spellGroup || false,
      mergeCode: param.mergeCode || '',
      subInfo: getStorage('subInfo') || {},
      matchHpid: param.matchHpid,
    })
    // 投票页进获取菜品投票信息
    if(param.from == 'vote') {
      const pages = getCurrentPages(),
        prePage = pages[pages.length - 2],
        {voteSkuList} = prePage.data
      this.setData({
        skuInfo: {
          ...voteSkuList[prePage._detailIndex],
          skuRank: +prePage._detailIndex + 1
        },
      })
    }

    // const eventChannel = this.getOpenerEventChannel();
    // if(eventChannel.on){
    //   // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    //   eventChannel.on('acceptDataFromOpenerPage', function(data) {
    //     that.setData({
    //       dialData: data.dialData
    //     })
    //   })
    // }
    if (this.data.type) {
      this.queryDetail()
    } else {
      if (this.data.combo == '01') {
        // 套餐
        this.queryComo()
      } else {
        this.init()
      }
    }

    // this.getBuyCardForGoods();

    // 判断是否校验库存
    if (day(param.dateTime) <= day() || (day(param.dateTime).format('YYYY/MM/DD') == day().add(1, 'day').format('YYYY/MM/DD') && day() > day(`${day().format('YYYY/MM/DD')} ${confObj.orderTimeLimit}`))) {
      this.setData({
        checkStock: true
      })
    }
    this.checkLat();
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
    loginPromise.then((res) => {
      const loginInfo = getStorage('loginInfo');
      const isLogin = loginInfo.isAuthorized && loginInfo.isLogin && loginInfo.isPerProfile;
      this.setData({
        showComponent: !(loginInfo.isAuthorized && loginInfo.isLogin),
        isDoubleEleven: isDoubleEleven(),
        uid: res.uid
      })
      if (!this.data.type) {
        this.allPrice();
        if (this.data.update) {
          this.init()
        }
      }
    })
  },
  // 修改套餐
  setMealModify: isLoginClick(function () {
    let obj = {
      code: this.data.code, // 套餐推荐的目录code
      id: this.data.id,
      orderMethod: this.data.orderMethod,
      dateTime: this.data.dateTime,
      category: this.data.category,
      heatId: this.data.heatId,
      comboId: this.data.comboid,
      corpId: this.data.id>10000?this.data.corpId:null,
      addressId: this.data.addressId,
    }
    wx.navigateTo({
      url: `/pages/packageOrder/setMealModify/setMealModify?params=${JSON.stringify(obj)}`
    })
  }),

  rechargeTap: isLoginClick(function () {
    wx.navigateTo({
      url: '/pages/mineBox/balance/balance'
    })
  }),

  // getBuyCardForGoods() {
  //   apiRequest.getBuyCardForGoods().then((res) => {
  //     const cardList = res.errCode === 0 ? res.obj.cardList : [];
  //     this.setData({
  //       rechargeCardList: cardList.map((card) => {
  //         card.$present = card.totalAmount - card.cardModelBean.amount;
  //         return card;
  //       })
  //     })
  //   })
  // },
  preview() {
    wx.previewImage({
      urls: this.data.imgUrls // 需要预览的图片http链接列表
    })
  },


  // 截止下单时间
  // limitOrder: function () {
  //   return new Date(util.dateUtil.formatDate(new Date()) + ' ' + app.globalData.limitOrder, '/').getTime()
  // },

  // 切换swiper
  handleChange: function (e) {
    this.setData({
      currentIndex: e.detail.current
    })
  },

  queryDetail: function () {
    var that = this;
    apiRequest.querySKUById({
        id: that.data.id
      })
      .then(res => {
        let list = res.obj;
        list.skuInfo = [res.obj.skuInfo];
        if (list.skuInfo[0].dietLabelList) {
          let dietLabelList = [];
          let other = [];
          let flavor = []; //口味
          list.skuInfo[0].dietLabelList.forEach((item, index) => {
            if (item.type == '02') {
              // 过敏原
              dietLabelList.push(item)
            } else if (item.type == '14') {
              // 口味
              flavor.push(item)
            } else {
              // 其他标签
              other.push(item)
            }
          })
          list.skuInfo[0].dietLabelList = dietLabelList;
          list.skuInfo[0].other = other;
          list.skuInfo[0].flavor = flavor;
          list.skuInfo[0].introduceImg = list.skuInfo[0].introduceImg && JSON.parse(list.skuInfo[0].introduceImg)[0].imgUrl || ''
          list.skuInfo[0].reserveTime = list.skuInfo[0].salestime >= day().add(1, 'day') <= list.skuInfo[0].saleetime ? day().add(1, 'day').format('YYYYMMDD') : ''
        }
        that.setData({
          list: list,
          imgUrls: list.skuInfo[0].slideShowImgUrl
        })
      })
      .catch(error => {

      })
  },

  init: function () {
    var that = this;
    apiRequest.queryAppointGoods({
        id: that.data.id,
        orderMethod: that.data.orderMethod,
        dateTime: that.data.dateTime,
        category: that.data.category,
        heatPointId: that.data.heatId
      })
      .then(res => {
        let list = res.obj;
        let dietLabelList = [];
        let other = [];
        let flavor = [];; //口味
        list.skuInfo[0].dietLabelList.forEach((item, index) => {
          if (item.type == '02') {
            // 过敏原
            dietLabelList.push(item)
          } else if (item.type == '14') {
            // 口味
            flavor.push(item)
          } else {
            // 其他标签
            other.push(item)
          }
        })
        list.skuInfo[0].dietLabelList = dietLabelList;
        list.skuInfo[0].other = other;
        list.skuInfo[0].flavor = flavor;
        list.skuInfo[0].introduceImg = list.skuInfo[0].introduceImg && JSON.parse(list.skuInfo[0].introduceImg)[0].imgUrl || ''
        that.setData({
          list: list,
          imgUrls: list.skuInfo[0].slideShowImgUrl
        })
      })
      .catch(error => {

      })
  },

  // 套餐
  queryComo: function (replace) {
    var that = this;
    apiRequest.querySaleSetMeal({
      code: this.data.code, // 套餐推荐的目录code
      id: that.data.id,
      cid: that.data.id,
      orderMethod: that.data.orderMethod,
      dateTime: that.data.dateTime,
      category: that.data.category,
      heatPointId: that.data.heatId,
      comboId: that.data.comboid,
      corpId: that.data.id>10000?this.data.corpId:null
    })
      .then(res => {
        let dialData = this.data.dialData;
        let list = res.obj;
        let dietaryIntakes = [];
        let other = [];
        let flavor = [];; //口味
        list.recommendList[0].dietaryIntakes.forEach((item, index) => {
          if (item.type == '02') {
            // 过敏原
            dietaryIntakes.push(item)
          } else if (item.type == '14') {
            // 口味
            flavor.push(item)
          } else {
            // 其他标签
            other.push(item)
          }
        })
        list.recommendList[0].dietaryIntakes = dietaryIntakes;
        list.recommendList[0].other = other;
        list.recommendList[0].flavor = flavor;
        // list.recommendList[0].setMealDateils.forEach((item, index) => {
        //   item.packageForm = item.foodDiversities.map(main => main.foodName).join('、');
        // })
        list.recommendList[0].allQuality = list.recommendList[0].setMealDateils.reduce((all, item) => (all + item.num * item.quality), 0)

        that.setData({
          list: list,
          imgUrls: list.recommendList[0].slideShowImgUrl,
        })

        // 把修改的套餐内容替换到首页
        if(replace) {
          let { list, selectIndex } = this.data;
          const pages = getCurrentPages()
          const index = pages.findIndex(
            page => page.route === 'pages/index/index'
          );
          const prepage = pages[index];
          prepage.setData({
            [`recomMealList[${selectIndex}]`]: list.recommendList[0]
          })
        }
      })
      .catch(error => {

      })
  },

  // 减少
  reduce: function (e) {
    var that = this;
    apiRequest.addShoppingCart({
      code: this.data.code, // 套餐推荐的目录code
      cid: e.currentTarget.dataset.cid,
      dateTime: that.data.dateTime,
      category: that.data.category,
      orderMethod: that.data.orderMethod,
      num: -1,
      selfTaking: that.data.deliveryIndex,
      addressId: that.data.addressId ? that.data.addressId : 0,
      hpid: that.data.heatId,
      type: that.data.combo,
      version: '01',
      comboId: that.data.comboid,
      shipType: that.data.shipType,
      corpId: this.data.corpId,
      groupComboId: this.data.groupcomboId
    })
      .then(res => {
        if (res.obj.stt) {
          let list = that.data.list;
          that.data.combo == '01' ? list.recommendList[0].num-- : list.skuInfo[0].num--;
          that.setData({
            list: list,
            scale: true
          })
          that.allPrice();
          setTimeout(function () {
            that.setData({
              scale: false
            })
          }, 200)
        }
      })
      .catch(error => {

      })
  },

  // 增加
  add: isLoginClick(function (e) {
    var that = this;
    apiRequest.addShoppingCart({
      code: this.data.code, // 套餐推荐的目录code
      cid: e.currentTarget.dataset.cid,
      dateTime: that.data.dateTime,
      category: that.data.category,
      orderMethod: that.data.orderMethod,
      num: 1,
      selfTaking: that.data.deliveryIndex,
      addressId: that.data.addressId ? that.data.addressId : 0,
      hpid: that.data.heatId,
      type: that.data.combo,
      version: '01',
      comboId: that.data.comboid,
      shipType: that.data.shipType,
      corpId: this.data.corpId,
      groupComboId: this.data.groupcomboId
    })
      .then(res => {
        if (res.errCode == 1009) {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
            // image: '',
            // duration: 1500,
            // mask: false,
          });
          return
        }
        // 新用户&&加购数量超过1-提示
        if (res.obj.isOverBuy) {
          wx.showToast({
            title: '专享价仅限购1份，第2份恢复原价',
            icon: 'none',
          });
        }
        if (res.obj.stt) {
          let list = that.data.list;
          that.data.combo == '01' ? list.recommendList[0].num++ : list.skuInfo[0].num++;
          that.setData({
            list: list,
            scale: true
          })
          that.allPrice();
          setTimeout(function () {
            that.setData({
              scale: false
            })
          }, 200)
        }
      })
      .catch(error => {

      })

  }),
  allPrice: function () {
    var that = this;
    apiRequest.queryShoppingCartCount({
        orderMethod: that.data.orderMethod,
        dateTime: that.data.dateTime,
        category: that.data.category,
        corpId: this.data.corpId,
        interface: this.data.tgeRole,
        tgcaId: this.data.tgcaId
      })
      .then(res => {
        if (res.errCode == '0') {
          let total = res.obj;
          that.setData({
            total,
          })
        } else {
          var total = {
            piece: 0,
            totalPrice: 0
          }
          that.setData({
            total: total
          })
        }
      })
      .catch(error => {

      })
  },
  //去结算
  buy: function () {
    if (this.data.total.piece > 0) {
      if (!this.data.update) {
        this.setData({
          update: true,
        })
      }
      if (!this.data.corpId) {
        wx.navigateTo({
          url: `/pages/packageOrder/submit/submit?code=${this.data.code}&from=detail`,
        });

      } else { // 团餐
        wx.navigateTo({
          url: `/pages/packageOrder/submit/submit?code=${this.data.code}&from=groupMenu&corpId=` + this.data.corpId + '&tgcaId=' + this.data.tgcaId + '&tgeRole=' + this.data.tgeRole + '&subuidsList=' + JSON.stringify(this.data.subuidsList),
        });
      }

    } else {
      wx.showToast({
        title: '您还未选择商品',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
    }
  },

  // 拼单
  async spell(e) {
    // 是否可以拼单（菜品原价 >= 20元时才可以拼单）
    if (this.data.total.totalOriginalPrice < 20) {
      wx.showToast({
        title: '购物车中菜品原价大于等于20元才可发起拼单',
        icon: 'none',
      });
      return;
    }
    let {corpId, tgcaId, tgeRole, mergeCode, spellOrder, spellGroup, code} = this.data;
    if(e.currentTarget.dataset.spell == 'true'){
      spellOrder = true;
    }
    if (spellOrder) {
      if (this.data.total.allCart[0].skuList[0].selfTaking == 1) {
          const info = this.data.total.allCart[0].skuList[0];
          let hpid = info.heatingPointId;
          let date = info.date;
          let category = info.category;
          // 查询当前当热点信息
          const hpidInfo = await this.queryInfo(hpid)
          if(hpidInfo.selfTaking == 1){
            //自取切换成配送
            await this.switchLogisticsWay(date, category, hpid)
            wx.navigateTo({
              url: `/pages/packageOrder/submit/submit?code=${code}&from=${corpId ? 'groupMenu' : 'detail'}&spellOrder=true&corpId=${corpId || ''}&tgcaId=${tgcaId || ''}&tgeRole=${tgeRole || ''}&mergeCode=${mergeCode || ''}`,
            });
          }else{
            wx.showToast({
              title: '拼单不支持自取，请选择收货地址',
              icon: 'none',
            });
        }
      } else {
        wx.navigateTo({
          url: `/pages/packageOrder/submit/submit?code=${code}&from=${corpId ? 'groupMenu' : 'detail'}&spellOrder=true&corpId=${corpId || ''}&tgcaId=${tgcaId || ''}&tgeRole=${tgeRole || ''}&mergeCode=${mergeCode || ''}`,
        });
      }
    } else if (spellGroup) {
      wx.navigateTo({
        url: `/pages/packageOrder/submit/submit?code=${code}&from=${corpId ? 'groupMenu' : 'detail'}&spellGroup=true&corpId=${corpId || ''}&tgcaId=${tgcaId || ''}&tgeRole=${tgeRole || ''}&mergeCode=${mergeCode || ''}`,
      });
    }
  },

  // 查询当前加热点信息
  queryInfo(id) {
    return apiRequest.heatingPointListForRange({
      userLat: app.globalData.lat,
      userLng: app.globalData.lon,
      showAll: false,
      showScope: false,
      showInfo: true,
      key: 'queryInfo',
      hpId: id,
    }).then((res) => {
      return res.obj.dtos[0]
    })
  },

  switchLogisticsWay(date, category, hpid) {
    return apiRequest.switchLogisticsWay({
      addressId: 0,
      dateTime: date,
      category: [category],
      hpid: hpid,
      orderMethod: '01',
      selfTaking: 0,
      shipTimes: '00',
      shipType: '00', // 把自取切配送
      allStt: true,
      apiFrom: '01',
    }).then((res) => {

    })
  },

  updateLogin(e) {
    if (e.detail.type == '2' && !Number(this.data.heatId)) {
      console.log('2')
      // 获取加热点
      this.queryAddress()
    }
  },

  queryAddress() {
    let that = this;
    apiRequest.queryAddressListForThree({
        sortNum: '',
        dataStt: '',
      }).then((res) => {
        const addressList = res.obj.addressInfos || [];
        const address = addressList.filter((item) => {
          return item.tuaDef == '1';
        });
        if (address.length > 0) {
          that.queryHpidList(address[0].lat, address[0].lon)
        } else {
          that.checkLat(function () {
            that.queryHpidList(app.globalData.lat, app.globalData.lon);
          })
        }
      })
      .catch((error) => {});
  },
  goOrderFn() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  // 查询经纬度
  checkLat: function (callBack) {
    if (app.globalData.lat && app.globalData.lon) {
      callBack && callBack()
    } else {
      location.getCity(function (res) {
        app.globalData.lat = res.latitude;
        app.globalData.lon = res.longitude;
        callBack && callBack()
      })
    }
  },
  // 投票
  doVoteFn() {
    const {skuInfo} = this.data
    const pages = getCurrentPages(),
        prePage = pages[pages.length - 2],
        {voteSkuList} = prePage.data,
        sku = voteSkuList[prePage._detailIndex]
    if(sku.skuStt == 60) return
    wx.vibrateShort()
    apiRequest.voteForFavoriteGood({
      id: sku.id,
      cid: sku.skuId,
      voteFlag: !sku.voteStatus
    }).then(res => {
      if(res.errCode == 0) {
        const opNum = !skuInfo.voteStatus ? 1 : -1
        if(!skuInfo.voteStatus) {
          wx.showToast({
            title: '投票成功',
            icon: 'none'
          })
        }
        this.setData({
          skuInfo: {
            ...skuInfo,
            voteNum: skuInfo.voteNum + opNum,
            voteStatus: !skuInfo.voteStatus,
          }
        })
        prePage.getVoteList()
        // prePage.setData({
        //   [`voteSkuList[${prePage._detailIndex}].voteNum`]: skuInfo.voteNum + opNum,
        //   [`voteSkuList[${prePage._detailIndex}].voteStatus`]: !skuInfo.voteStatus
        // })
        return
      }
      wx.showToast({
        title: res.errMsg,
        icon: 'none'
      })
    })
  },
  queryHpidList(lat, lon) {
    var that = this;
    apiRequest.heatingPointListForRange({
        userLat: lat,
        userLng: lon,
        showAll: false,
        showScope: false,
        key: '10'
      })
      .then(res => {
        let hpidList = res.obj.dtos;
        this.setData({
          heatId: hpidList[0].hpId,
          deliveryIndex: hpidList[0].hotFlag || hpidList[0].coldFlag || hpidList[0].selfTaking == 0 || hpidList[index].selfTaking == 1 ? 0 : 1,
          shipType: hpidList[0].hotFlag ? '00' : (hpidList[0].coldFlag ? '01' : (hpidList[0].selfTaking == 0 || hpidList[0].selfTaking == 1 ? '00' : '02'))
        })
        if (this.data.combo == '01') {
          // 套餐
          this.queryComo()
        } else {
          this.init()
        }
      })
      .catch(error => {

      })
  },
  // 分享套餐-底部弹窗（菜品是直接分享，套餐是弹窗选择“分享” 或 “生成海报”）
  share() {
    this.setData({
      showShare: true
    })
  },
  // 保存海报分享
  async saveShareTap() {
    if (this.sharing) return;
    this.setData({
      showShare: false
    })
    wx.showLoading({
      title: '绘制中',
    })

    this.sharing = true;
    const imageUrl = (await this.drawShareImage()).tempFilePath;
    this.sharing = false;
    wx.hideLoading()
    const sharer = new ShareImage(imageUrl)
    sharer.save().then(sharer.preview.bind(sharer), sharer.preview.bind(sharer))
  },
  async drawShareImage() {
    const {
      list,
      px2rpx
    } = this.data;
    const data = list.recommendList[0];
    const ctx = this.ctx || (this.ctx = wx.createCanvasContext('share', this))
    const draw = new Draw(ctx)

    // 整个canvas背景
    draw.drawView({
      left: t(0),
      top: t(0),
      width: Math.ceil(t(750)),
      height: Math.ceil(t(4000)),
    }, {
      backgroundColor: "#F27041",
      border: 'none'
    })
    // ---背景-上----
    // 上方间距
    let marginTop = t(0)
    let bgimg = 'https://prodstatic.weis1606.cn/api/smartFood/goods_poster_top.png.png'
    await draw.drawImage(bgimg, {
      left: t(0),
      top: marginTop,
      width: t(750),
      height: t(883),
    })
    marginTop = t(108)
    // ---套餐名-背景图----
    bgimg = 'https://prodstatic.weis1606.cn/api/smartFood/goods_poster_name.png'
    await draw.drawImage(bgimg, {
      left: t(55),
      top: marginTop,
      width: t(640),
      height: t(152)
    })
    // ---套餐名-内容----
    let name = data.name;
    draw.drawText(name, {
      left: t(0),
      top: marginTop + t(64),
      // top: marginTop + t(82),
      height: Math.ceil(t(48)),
      width: t(750),
    }, {
      fontSize: t(48),
      fontWeight: 600,
      lineHeight: Math.ceil(t(48)),
      color: '#333333',
      textAlign: 'center'
    })

    // ---营养数据-背景----
    // 上方间距
    marginTop = t(284)
    draw.drawView({
      left: t(32),
      top: marginTop,
      width: Math.ceil(t(686)),
      height: Math.ceil(t(482)),
    }, {
      backgroundColor: "#FFF6EF",
      borderWidth: t(4),
      borderColor: '#EFA49C',
      borderRadius: t(20)
    })
    // ---营养数据-连接钩子----
    bgimg = 'https://prodstatic.weis1606.cn/api/smartFood/goods_poster_name_couple.png'
    await draw.drawImage(bgimg, {
      left: t(67),
      top: marginTop - t(88),
      width: t(615),
      height: t(142)
    })
    // ---营养数据-内容----
    name = data.energy;
    draw.drawText(name, {
      left: t(0),
      top: marginTop + t(94),
      height: Math.ceil(t(48)),
      width: t(750),
    }, {
      fontWeight: 600,
      color: '#333333',
      fontSize: t(90),
      textAlign: 'center'
    })

    name = 'kcal';
    draw.drawText(name, {
      left: t(0),
      top: marginTop + t(176),
      height: Math.ceil(t(48)),
      width: t(750),
    }, {
      color: '#999999',
      fontSize: t(28),
      textAlign: 'center'
    })

    let arr = [{
        name: '蛋白质',
        value: data.protein
      },
      {
        name: '脂肪',
        value: data.fat
      },
      {
        name: '碳水',
        value: data.carbonwater
      },
      {
        name: '盐分',
        value: data.salt || data.totalSalt
      },
    ]
    for (let i = 0; i < arr.length; i++) {
      draw.drawText(arr[i].name, {
        left: t(750 / 5 * i + 110),
        top: marginTop + t(280),
        height: Math.ceil(t(40)),
        width: Math.ceil(draw.textWidth(arr[i].name, t(28))),
      }, {
        color: '#999999',
        fontSize: t(28),
      })

      draw.drawText(arr[i].value, {
        left: t(750 / 5 * i + 90),
        top: marginTop + t(336),
        height: Math.ceil(t(54)),
        width: Math.ceil(draw.textWidth(arr[i].value, t(54))),
      }, {
        fontSize: t(54),
        fontWeight: 600,
        color: '#333333',
      })

      draw.drawText('g', {
        left: t(750 / 5 * i + 90) + Math.ceil(draw.textWidth(arr[i].value, t(54))),
        top: marginTop + t(350),
        // top: marginTop + t(336),
        height: Math.ceil(t(54)),
        width: Math.ceil(draw.textWidth('g', t(28))),
      }, {
        fontSize: t(28),
        color: '#333333',
      })
    }

    // ---菜品-背景----
    // 上方间距
    marginTop = t(786)
    arr = data.setMealDateils;
    draw.drawView({
      left: t(32),
      top: marginTop,
      width: Math.ceil(t(686)),
      height: Math.ceil(arr.length / 2) * (Math.ceil(t(425)) + Math.ceil(t(30))) + t(130),
    }, {
      backgroundColor: "#FFF6EF",
      borderWidth: t(4),
      borderColor: '#EFA49C',
      borderRadius: t(20)
    })
    // ---菜品-连接钩子----
    bgimg = 'https://prodstatic.weis1606.cn/api/smartFood/goods_poster_couple.png'
    await draw.drawImage(bgimg, {
      left: t(67),
      top: marginTop - t(60),
      width: t(615),
      height: t(100)
    })
    // ---菜品-内容----
    for (let i = 0; i < arr.length; i++) {
      draw.drawView({
        left: i % 2 == 0 ? t(80) : t(390),
        top: marginTop + t(80) + ((Math.ceil(t(425)) + Math.ceil(t(30))) * Math.floor(i / 2)),
        width: Math.ceil(t(280)),
        height: Math.ceil(t(425)),
      }, {
        backgroundColor: "#FFFFFF",
        borderRadius: t(10)
      })

      await draw.drawImage(arr[i].primaryImgUrl.replace('http', 'https'), {
        left: i % 2 == 0 ? t(80 + 18) : t(390 + 18),
        top: marginTop + t(80 + 18) + ((Math.ceil(t(425)) + Math.ceil(t(30))) * Math.floor(i / 2)),
        width: t(244),
        height: t(244)
      })

      draw.drawText(arr[i].name, {
        left: i % 2 == 0 ? t(80 + 18) : t(390 + 18),
        top: marginTop + t(80 + 294) + ((Math.ceil(t(425)) + Math.ceil(t(30))) * Math.floor(i / 2)),
        height: Math.ceil(t(30)),
        width: Math.ceil(draw.textWidth(arr[i].name, t(28))),
      }, {
        fontSize: t(28),
        color: '#000000',
        fontWeight: 600,
      })

      let nutrient = '能量' + arr[i].energy + 'kcal/蛋白质' + arr[i].protein + 'g/碳水' + arr[i].carbonwater + 'g/脂肪' + arr[i].fat + 'g'
      draw.drawText(nutrient, {
        left: i % 2 == 0 ? t(80 + 18) : t(390 + 18),
        top: marginTop + t(80 + 338) + ((Math.ceil(t(425)) + Math.ceil(t(30))) * Math.floor(i / 2)),
        height: Math.ceil(t(100)),
        width: Math.ceil(t(244)),
      }, {
        fontSize: t(20),
        color: '#666666',
        lineHeight: t(30)
      })
    }

    // ---过敏原-背景----
    // 上方间距 = 菜品上方间距 + 菜品高度（动态）
    marginTop = marginTop + Math.ceil(arr.length / 2) * (Math.ceil(t(425)) + Math.ceil(t(30))) + t(130)
    arr = data.dietaryIntakes;
    // 存在过敏原才显示
    if (arr.length > 0) {
      draw.drawView({
        left: t(32),
        top: marginTop + t(20),
        width: Math.ceil(t(686)),
        height: Math.ceil(t(140)) + (Math.ceil(arr.length / 3) * t(62)) + Math.ceil(t(80)),
      }, {
        backgroundColor: "#FFF6EF",
        borderWidth: t(4),
        borderColor: '#EFA49C',
        borderRadius: t(20)
      })
      // ---过敏原-连接钩子----
      bgimg = 'https://prodstatic.weis1606.cn/api/smartFood/goods_poster_couple.png'
      await draw.drawImage(bgimg, {
        left: t(67),
        top: marginTop - t(40),
        width: t(615),
        height: t(100)
      })

      // ---过敏原-内容----
      draw.drawText('过敏原', {
        left: t(68),
        top: marginTop + t(20) + t(80),
        height: Math.ceil(t(28)),
        width: Math.ceil(draw.textWidth('过敏原', t(32))),
      }, {
        fontSize: t(32),
        color: '#333333',
        fontWeight: 600,
      })
      let num = 0;
      for (let i = 0; i < arr.length; i++) {
        num = i % 3 == 0 ? t(0) : num + (Math.ceil(draw.textWidth(arr[i - 1].name, t(26))) + t(60) + t(20))
        draw.drawView({
          left: num + t(68),
          // left: (Math.ceil(draw.textWidth(arr[i].name, t(26))) + t(60) + t(20)) * (i%3) + t(68),
          top: marginTop + t(20) + t(140) + (Math.ceil((i + 1) / 3 - 1) * t(62)),
          width: Math.ceil(draw.textWidth(arr[i].name, t(26))) + t(60),
          height: Math.ceil(t(52)),
        }, {
          backgroundColor: "#FFFFFF",
          borderWidth: t(2),
          borderColor: '#FFCBB9',
          borderRadius: t(30),
        })

        draw.drawText(arr[i].name, {
          left: num + t(68) + t(30),
          // left: (Math.ceil(draw.textWidth(arr[i].name, t(26))) + t(60) + t(20)) * (i%3) + t(68) + t(30),
          top: marginTop + t(20) + t(140) + (Math.ceil((i + 1) / 3 - 1) * t(62)) + t(8),
          // top: marginTop + t(20) + t(140) + (Math.ceil((i+1)/3 - 1) * t(62)) + t(16),
          height: Math.ceil(t(26)),
          width: Math.ceil(draw.textWidth(arr[i].name, t(26))),
        }, {
          fontSize: t(26),
          color: '#D7704B',
        })
      }
    }

    // ---营养贴士-背景----
    // 上方间距 = 过敏原存在的话?过敏原上方间距 + 过敏原上方20间距 + 过敏原高度（动态）: 菜品上方间距
    marginTop = arr.length > 0 ? marginTop + t(20) + Math.ceil(t(140)) + (Math.ceil(arr.length / 3) * t(62)) + Math.ceil(t(80)) : marginTop
    let remark = data.remark;
    if (remark) {
      draw.drawView({
        left: t(32),
        top: marginTop + t(20),
        width: Math.ceil(t(686)),
        height: Math.ceil(t(488)),
      }, {
        backgroundColor: "#FFF6EF",
        borderWidth: t(4),
        borderColor: '#EFA49C',
        borderRadius: t(20)
      })
      // ---营养贴士-连接钩子----
      bgimg = 'https://prodstatic.weis1606.cn/api/smartFood/goods_poster_couple.png'
      await draw.drawImage(bgimg, {
        left: t(67),
        top: marginTop - t(40),
        width: t(615),
        height: t(100)
      })

      // ---营养贴士-内容----
      draw.drawText('营养贴士', {
        left: t(68),
        top: marginTop + t(20) + t(80),
        height: Math.ceil(t(28)),
        width: Math.ceil(draw.textWidth('营养贴士', t(32))),
      }, {
        fontSize: t(32),
        color: '#333333',
        fontWeight: 600,
      })
      draw.drawText(remark, {
        left: t(68),
        top: marginTop + t(20) + t(140),
        height: Math.ceil(t(280)),
        width: Math.ceil(t(616)),
      }, {
        fontSize: t(28),
        color: '#666666',
        lineHeight: t(28)
      })
    }
    // ---二维码-背景----
    // 上方间距 = 营养贴士存在的话?营养贴士上方间距 + 营养贴士上方20间距 + 营养贴士高度 : 营养贴士上方间距
    marginTop = remark ? marginTop + t(20) + Math.ceil(t(488)) : marginTop
    draw.drawView({
      left: t(32),
      top: marginTop + t(20),
      width: Math.ceil(t(686)),
      height: Math.ceil(t(280)),
    }, {
      backgroundColor: "#FFFFFF",
      borderWidth: t(4),
      borderColor: '#EFA49C',
      borderRadius: t(20)
    })
    // ---二维码-连接钩子----
    bgimg = 'https://prodstatic.weis1606.cn/api/smartFood/goods_poster_couple.png'
    await draw.drawImage(bgimg, {
      left: t(67),
      top: marginTop - t(40),
      width: t(615),
      height: t(100)
    })
    // ---二维码-内容----
    name = '维士小盒饭'
    draw.drawText(name, {
      left: t(134),
      top: marginTop + t(20) + t(100),
      height: Math.ceil(t(50)),
      width: Math.ceil(draw.textWidth(name, t(36))),
    }, {
      fontSize: t(36),
      color: '#333333',
      fontWeight: 600,
    })

    let tip = '精准饮食  按数吃饭'
    draw.drawText(tip, {
      left: t(134),
      top: marginTop + t(20) + t(160),
      height: Math.ceil(t(34)),
      width: Math.ceil(draw.textWidth(tip, t(24))),
    }, {
      fontSize: t(24),
      color: '#999999',
    })

    bgimg = 'https://prodstatic.weis1606.cn/api/smartFood/QRcode.png'
    await draw.drawImage(bgimg, {
      left: t(420),
      top: marginTop + t(20) + t(40),
      width: t(214),
      height: t(214)
    })
    // ---背景-下----
    // 上方间距 = 二维码上方间距 + 二维码上方20间距 + 二维码高度
    marginTop = marginTop + t(20) + Math.ceil(t(280))
    bgimg = 'https://prodstatic.weis1606.cn/api/smartFood/goods_poster_bottom.png'
    await draw.drawImage(bgimg, {
      left: t(0),
      top: marginTop,
      width: t(750),
      height: t(450),
    })
    // canvas的高度 = 背景底部图片上方间距 + 背景底部图片高度
    marginTop = marginTop + t(450)
    this.setData({
      marginTop
    })


    return new Promise((resolve) => {
      draw.draw(false, () => {
        setTimeout(() => {
          draw.canvasToTempFilePath({
            width: 750,
            height: marginTop * px2rpx,
            id: 'share'
          }, this).then(resolve)
        }, 600)
      })
    })

  },
  favor() {
    let list = this.data.list;
    apiRequest.favouriteSku({
      cid: list.skuInfo[0].cid,
      dataStt: list.favouritesStt ? '99' : '00',
    }).then((res) => {
      if (res.errCode == 0) {
        if (!list.favouritesStt) {
          wx.vibrateShort({
            success: (result) => {

            },
            fail: () => {},
            complete: () => {}
          });
          wx.showToast({
            title: '已加到我的最爱',
            icon: 'success',
          });
        } else {
          wx.showToast({
            title: '已从我的最爱中移除',
            icon: 'none',
          });
        }
        list.favouritesStt = !list.favouritesStt;
        this.setData({
          list
        })
      }
    })
  },
  // 去预定该菜品
  reserve(e) {
    let {
      reservetime
    } = e.currentTarget.dataset;
    // 跳转点餐页
    setStorage('planMealDate', {
      // date: day().add(1, 'day').format('YYYYMMDD'),
      date: reservetime,
      category: '02',
    })
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  // 提醒我
  remind: isLoginClick(function (e) {
    if (this.data.subscribe) {
      return
    }
    const that = this;
    wx.requestSubscribeMessage({
      tmplIds: ['cEK8_xf3pjwVS-XPoSd-kWaR4m9UPR_txmqtH4mfO3Q'],
      success(res) {
        that.subscribe2DishReminders(e)
      },
      fail(res) {
        // that.subscribe2DishReminders(e)
      }
    })
  }),

  subscribe2DishReminders(e) {
    let {
      newDishesItem
    } = this.data;
    apiRequest.subscribe2DishReminders({
      beginDate: newDishesItem.tmcsBeginDate, // 菜品开售时间
      endDate: newDishesItem.tmcsEndDate, // 菜品结束时间
      skuName: newDishesItem.tfsSuggestedSkuname, // 菜品名称
      skuCid: newDishesItem.tfsCid, // 菜品cid
    }).then((res) => {
      if (res.errCode === 0 && res.obj.id) {
        wx.showToast({
          title: '订阅成功~~~',
          icon: 'success',
        });
        this.setData({
          subscribe: true
        })
      }
    })
  },

  toHealth() {
    const {
      subInfo,
      category,
      dateTime
    } = this.data;
    const skuList = this.data.list.recommendList[0].setMealDateils;
    let cidList = {};
    skuList.forEach((item) => {
      cidList[item.cid] = item.num;
    })

    apiRequest
      .queryUserNutritionHealthScore({
        infoComposeList: [{
          fromUid: subInfo.tsuSubUid || this.data.uid,
          payFlag: false,
          category,
          orderDate: day(dateTime).format('YYYYMMDD'),
          cidList,
        }]
      })
      .then(res => {
        if (res.errCode === 0) {
          const {
            nutritionHealthScoreForms: scoreForms,
            info
          } = res.obj;
          console.log(scoreForms)
          this.setData({
            scoreForms: scoreForms[0],
            humanInfoWithScore: info
          })
          wx.navigateTo({
            url: `/pages/packageOrder/healthScore/healthScore?page=index&showPan=true`
          })
        }
      })
  },

  skuDetail(e) {
    let obj = {
      id: e.currentTarget.dataset.id,
      orderMethod: '01',
      category: this.data.category,
      type: 'detail'
    }
    wx.navigateTo({
      url: `/pages/packageOrder/goodsDetail/goodsDetail?param=${JSON.stringify(obj)}`,
    });
  },

  check() {
    this.setData({
      more: true
    })
  },
  cookerIntroFn() {
    this.setData({
      showIntro: !this.data.showIntro
    })
  },
  // ---------------------购物车-----------------------
  // 编辑购物车
  // 点击显示购物车&获取数据
  editCart: function () {
    var that = this;
    let {
      // list,
      // mealIndex,
      showCart,
      dateTime,
    } = that.data;
    if (showCart) {
      that.setData({
        showCart: false
      })
      return
    }
    apiRequest.queryShoppingCartCount({
        orderMethod: '01',
        category: 'all',
        dateTime,
      })
      .then(res => {
        let allCart = res.obj.allCart;
        let categoryList = ['01', '02', '03'];
        allCart.forEach((item1, index1) => {
          item1.dateTime = day(item1.date).format('MM月DD日')
          item1.categoryCart = [{
            category: '01',
            list: []
          }, {
            category: '02',
            list: []
          }, {
            category: '03',
            list: []
          }];
          item1.skuList.forEach((item2, index2) => {
            item2.dietLabelList = (item2.dietLabelList || []).filter(label => label.type === '02')
            item1.categoryCart[categoryList.indexOf(item2.category)].list.push(item2)
          })
          item1.categoryCart = item1.categoryCart.filter(item => item.list.length > 0)
        })
        this.setData({
          allCart,
          showCart: true,
        })
      })
      .catch(error => {

      })
  },
  // 购物车-增/减
  edit: function (e) {
    let {
      category,
      index1,
      index2,
      index3,
      type,
      combo,
      cid
    } = e.currentTarget.dataset;
    let {
      allCart,
      // list,
      // mealIndex,
      matchHpid
    } = this.data;
    let date = allCart[index1].date;
    let skuInfo = allCart[index1].categoryCart[index2].list[index3];
    // app.globalData.gio('track', 'c_Addgoods', {
    //   goodsId: cid,
    //   goodsName: skuInfo.skuname,
    //   type,
    // })
    apiRequest.addShoppingCart({
        code: this.data.code, // 套餐推荐的目录code
        cid: cid,
        dateTime: date,
        category: category,
        orderMethod: '01',
        num: type == 'reduce' ? -1 : 1,
        selfTaking: skuInfo.selfTaking,
        addressId: skuInfo.addressId || 0,
        hpid: skuInfo.heatingPointId,
        version: '01',
        comboId: 0,
        type: combo,
        shopType: matchHpid.shopType,
      })
      .then(res => {
        if (res.errCode == 1009) {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
          return
        }
        if (res.obj.stt) {
          if (res.obj.isOverBuy) {
            wx.showToast({
              title: '新用户专享商品限购一份，超过一份恢复原价',
              icon: 'none',
            })
          }
          type == 'reduce' ? skuInfo.num-- : skuInfo.num++;
          this.setData({
            allCart,
            scale: true
          })
          // if (day(list[mealIndex].date).format('YYYYMMDD') == date && list[mealIndex].categoryType == category) {
          //   let autoNum = skuInfo.num;
          //   // 同步同一sku数量
          //   this.autoNum(autoNum, cid);
          // }

          // 为0删除
          if (allCart[index1].categoryCart[index2].list[index3].num == 0) {
            allCart[index1].categoryCart[index2].list.splice(index3, 1);
            if (allCart[index1].categoryCart[index2].list.length == 0) {
              allCart[index1].categoryCart.splice(index2, 1)
              if (allCart[index1].categoryCart.length == 0) {
                allCart.splice(index1, 1);
              }
            }
            if (allCart.length == 0) {
              this.hideCart()
            }
            this.setData({
              allCart,
            })
          }
          this.allPrice();
          setTimeout(() => {
            this.setData({
              scale: false
            })
          }, 200)
        }
      })
      .catch(error => {

      })
  },
  // 关闭购物车
  hideCart: function () {
    this.setData({
      showCart: false,
    })
  },
  // 清空购物车-确定
  clear: function (e) {
    if (e.currentTarget.dataset.type == 'tip') {
      this.setData({
        clearCartTip: true
      })
      return
    }

    this.setData({
      clearCartTip: false
    })

    let that = this;
    apiRequest.addShoppingCart({
        code: this.data.code, // 套餐推荐的目录code
        category: 'all',
        orderMethod: '01',
        dataStt: '99',
        version: '01'
      })
      .then(res => {
        if (res.obj.stt) {
          // that.getMenu();
          // this.clearRecomNum();
          that.setData({
            showCart: false,
            total: {
              piece: 0,
              totalPrice: 0
            }
          }, () => {
            wx.showToast({
              title: '购物车已清空',
              icon: 'success',
            });
          })
          that.queryComo()
        }
      })
      .catch(error => {

      })
  },
  // 清空购物车-取消
  cancelTap() {
    this.setData({
      clearCartTip: false
    })
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
  // onShareAppMessage: function (e) {
  //   if (e.from == "button") {
  //     const { id, orderMethod, category, dateTime, deliveryIndex, addressId, heatId, combo, comboid, shipType, ageType, list, imgUrls } = this.data;
  //     let obj = {
  //       // 菜品/套餐-详情的参数
  //       id,
  //       orderMethod,
  //       category,
  //       dateTime,
  //       deliveryIndex,
  //       addressId,
  //       heatId,
  //       combo,
  //       comboid,
  //       shipType,
  //       ageType,
  //       // 菜品/套餐-分享的标识
  //       goodsShare: true
  //     }
  //     // 监听拉新（套餐分享需带上渠道码和用户uid）
  //     let userAdd = ''
  //     if(combo == '01') {
  //       let userInfo = wx.getStorageSync('userInfo')
  //       userAdd = '&scene=10339&invite=' + userInfo.uid
  //     }
  //     return {
  //       title: combo == '00'?list.skuInfo[0].skuname:combo == '01'?list.recommendList[0].name:'',
  //       imageUrl: imgUrls[0],
  //       path: `/pages/packageOrder/goodsDetail/goodsDetail?param=${JSON.stringify(obj)}${userAdd}`,
  //     }
  //   }
  // }
})
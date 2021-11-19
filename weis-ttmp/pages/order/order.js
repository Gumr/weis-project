/*
 * @Author: your name
 * @Date: 2021-09-17 16:18:47
 * @LastEditTime: 2021-09-22 11:14:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \weis-ttmp\pages\order\order.js
 */
// h:\material\weis-ttmp\pages\order\order\order.js
import apiRequest from '../../service/index';
import { isLoginClick } from '../../utils/common';
const app = getApp();

Page({
  data: {
    tab: [
      {
        name: '全部',
      },
      {
        name: '待核销/核销中',
      },
      {
        name: '已核销',
      },
      {
        name: '退款',
      },
    ],
    tabIndex: 0,
    list: [],
    pageNo: 1,
    pageSize: 10,
    //stt:['待核销','核销中','已核销','退款中','已退款','已过期']
    stt: ['WAITING_WRITER_OFF', 'DOING_WRITER_OFF', 'DONE_WRITER_OFF', 'REFUNDING_MONEY', 'REFUNDED_MONEY', 'EXPIRED']
  },
  onLoad: function (options) {
  },
  onShow: function () {
    // 判断登录
    const loginInfo = tt.getStorageSync('loginInfo');
    const isLogin = loginInfo.isAuthorized && loginInfo.isLogin;
    this.setData({
      list:[],
      pageNo: 1,
      isLogin,
      navStatusHeight: this.getNavStatusHeight(),
    },()=>{
      tt.showLoading({
        title: '数据加载中', // 内容
      });
      this.getData();
    })
    // console.log(app.globalData.navStatusHeight)
    
  },
  //状态拦标题栏高度
  getNavStatusHeight() {
    if (!app.globalData.navStatusHeight) {
      var sysinfo = tt.getSystemInfoSync(),
        statusHeight = sysinfo.statusBarHeight,
        navHeight;
      if (sysinfo.system.indexOf('iOS') > -1) {
        navHeight = 44;
      } else {
        navHeight = 48;
      }
      app.globalData.navStatusHeight = statusHeight + navHeight;
      tt.setStorageSync('navStatusHeight', statusHeight + navHeight);
    }
    return app.globalData.navStatusHeight;
  },
  //tab切换
  tab(e) {
    let index = e.currentTarget.dataset.index;
    if (index == this.data.tabIndex) {
      return
    }
    this.setData({
      tabIndex: index,
      pageNo: 1,
      list: [],
    }, () => {
      this.getData();
    })
  },
  //去登录
  tapLogin: isLoginClick(),
  //去首页
  tapShop(e) {
    tt.switchTab({
      url: '/pages/index/index', // TabBar 页面的路径
    });
  },
  tapMeal(e) {//跳转到餐单列表页
    let item = e.currentTarget.dataset.item;
    console.log(item);
    if (item.descMapping == this.data.stt[1]) {
      tt.navigateTo({
        url: `/pages/packTwo/mealList/mealList?doneNum=${item.finished_sum}&countNum=${item.total_sum}&tradeNo=${item.tdpoTradeNo}`, // 指定页面的 url
      });
    } else if (item.descMapping == this.data.stt[0]) {
      let now = new Date();
      //是否已过核销时间
      if(item.tdpoDeadline>now.getTime()){
        tt.navigateTo({
          url: `/pages/packTwo/writeOff/writeOff?tradeNo=${item.tdpoTradeNo}&dayNum=${item.dou_pack.tdp_days_num}&mealNum=${item.dou_pack.tdp_meals_num}&tdpId=${item.dou_pack.tdp_id}`, // 指定页面的 url
          success: (res) => {
            
          }, fail: (err) => {
            console.log(err)
          }
        });
      }else{
        tt.showToast({
          title: '已过可核销时间', // 内容
          icon: 'none', // 图标
        });
        this.setData({
          pageNo: 1,
        },()=>{
          //刷新
          this.getData();
        })
      }
    }
  },
  //订单详情
  tapItem(e) {
    let item = e.currentTarget.dataset.item;
    // console.log(item)
    tt.navigateTo({
      url: `/pages/packTwo/orderInfo/orderInfo?tradeNo=${item.tdpoTradeNo}`, // 指定页面的 url
    });
  },
  //tab对应code
  getSttCode(v) {
    switch (v) {
      case 1: return '10';
      case 2: return '20';
      case 3: return '30';
      default: return '00';
    }
  },
  // 提交订单
  getData() {
    apiRequest.listQueryCombinationPackageOrder({
      // params - long - uid
      // uid: '', // 
      pageNo: this.data.pageNo, //
      pageSize: this.data.pageSize, // 
      tabCode: this.getSttCode(this.data.tabIndex),//00.全部 10.待核销/核销中 20.已核销 30.已退款
    }).then((res) => {
      if (res.errCode == 0) {
        var { result } = res.obj;
        // result[0].sttDesc = '待核销';
        // console.log(result.sttDesc);
        // let result = 
        //   {
        //     // 创建时间
        //     "tdpoCtime": 1632824374177,
        //     "tdpoMtime": 0,
        //     // 订单状态的中文描述
        //     "sttDesc": "待核销",
        //     "tdcaConsumeTime": 0,
        //     // 套餐包主键id 即 == 下方的tdp_tdps_id
        //     "tdpoPackSid": 100000,
        //     // 订单原价格
        //     "tdpoOrderPrice": 38.00,
        //     "tdpoPayTime": 0,
        //     // 总共餐数
        //     "total_sum": 2,
        //     "tdpoId": 100014,
        //     // 已完成配送的餐数量
        //     "finished_sum": 0,
        //     "tdcaFinishTime": 0,
        //     "tdpoPayStt": "10",
        //     // 套餐包价格
        //     "tdpoComboPrice": 38.00,
        //     "tdpoDataStt": "00",
        //     // 套餐包内商品的价值金额
        //     "tdpoSkuPrice": 38.00,
        //     // 支付方式
        //     "tdpoPayWay": "wechat",
        //     // 实际支付价格
        //     "tdpoActualPrice": 9.90,
        //     "tdpoConsumeStt": "00",
        //     "tdpoDeadline": 1635523200000,
        //     "tdpoAppid": "asdasdasdasdasd",
        //     // 单号
        //     "tdpoTradeNo": "TDPO6B41CFD76E405E0193242",
        //     // 套餐包的详情
        //     "dou_pack": {
        //       // 详情图
        //       "tdp_detail_img": [
        //         "https://prodstatic.weis1606.cn/api/set_meal/set_meal_19.png?a=1",
        //         "https://prodstatic.weis1606.cn/api/set_meal/set_meal_19.png",
        //         "https://prodstatic.weis1606.cn/api/set_meal/set_meal_19.png"
        //       ],
        //       // 管理后台配置上线的套餐 的主键id
        //       "tdp_tdps_id": 100003,
        //       // 售价
        //       "tdp_sale_price": 9.90,
        //       // 封面图择取第一张arr[0]，详情则迭代展示 轮播即可
        //       "tdp_cover_img": [
        //         "https://prodstatic.weis1606.cn/api/set_meal/set_meal_19.png",
        //         "https://prodstatic.weis1606.cn/api/set_meal/set_meal_19.png",
        //         "https://prodstatic.weis1606.cn/api/set_meal/set_meal_19.png"
        //       ],
        //       // 这个套餐包有几天的餐
        //       "tdp_days_num": 1,
        //       // 套餐包标价
        //       "tdp_combo_price": 38.00,
        //       // 商品总价 值多少钱
        //       "tdp_sku_price": 38.00,
        //       // 套餐包主键
        //       "tdp_id": 100000,
        //       // 一天当中的 膳食顿数
        //       "tdp_meals_num": 2,
        //       // 套餐名称(标题)
        //       "tdp_name": "新品尝鲜套餐-减脂餐"
        //     },
        //     "tdpoUid": 100081, // 用户在字节平台我们的小程序中的uid
        //     "tdpoAccountPay": 38.00,// 应付价格 （实际支付看 套餐包售价 ）
        //     "tdpoOpenid": "12515215151" // 用户在字节平台我们的小程序中的唯一凭证
        //   };
        // console.log(result)
        // console.log(JSON.stringify(result))

        let list = this.data.list || [];
        list = list.concat(result),
          this.setData({
            list,
            pageNo: result && result.length > 0 ? this.data.pageNo + 1 : this.data.pageNo,
          })
      }
      console.log(res)//日志打印
    })
  },
  //上拉加载更多
  onReachBottom() {
    this.getData();
  },
})
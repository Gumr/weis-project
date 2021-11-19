/*
 * @Author: 顾俊威
 * @Date: 2021-09-22 11:19:32
 * @LastEditTime: 2021-09-22 15:48:34
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \weis-ttmp\pages\orderInfo\orderInfo.js
 */
// h:\material\weis-ttmp\pages\orderInfo\orderInfo.js
import apiRequest from '../../../service/index';
Page({
  data: {
    //stt:['待核销','核销中','已核销','退款中','已退款','已过期']
    stt: ['WAITING_WRITER_OFF', 'DOING_WRITER_OFF', 'DONE_WRITER_OFF', 'REFUNDING_MONEY', 'REFUNDED_MONEY', 'EXPIRED']
  },
  onLoad: function (options) {
    this.tradeNo = options.tradeNo;

  },
  onShow: function () {
    this.queryTikTokOrder();
  },
  //格式化日期
  formatDate: function (now) {
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    return year + "-" + this.add0(month) + "-" + this.add0(date) + " " + this.add0(hour) + ":" + this.add0(minute) + ":" + this.add0(second);
  },
  add0(v) {
    return v < 10 ? '0' + v : '' + v;
  },
  tapAct(e) {//点击按钮
    let dayNum = this.data.detail.dou_pack.tdp_days_num;
    let mealNum = this.data.detail.dou_pack.tdp_meals_num;
    if (this.data.detail.descMapping == this.data.stt[1]||this.data.detail.descMapping == this.data.stt[2]) {
      tt.navigateTo({//餐单列表
        url: `/pages/packTwo/mealList/mealList?doneNum=${this.data.detail.finished_sum}&countNum=${this.data.detail.total_sum}&tradeNo=${this.data.detail.tdpoTradeNo}`, // 指定页面的 url
      });
    } else if (this.data.detail.descMapping == this.data.stt[0]) {
      let now = new Date();
      //是否已过核销时间
      if (this.data.detail.tdpoDeadline > now.getTime()) {
        tt.navigateTo({//核销
          url: `/pages/packTwo/writeOff/writeOff?tradeNo=${this.data.detail.tdpoTradeNo}&dayNum=${dayNum}&mealNum=${mealNum}&tdpId=${this.data.detail.dou_pack.tdp_id}`, // 指定页面的 url
        });
      } else {
        tt.showToast({
          title: '已过可核销时间', // 内容
          icon: 'none', // 图标
        });
        //刷新
        this.queryTikTokOrder();
      }
    }
  },
  //取消订单
  tapCancel(e) {
    tt.showModal({
      title: '', // 标题
      content: '确定取消该订单吗？', // 内容
      showCancel: true,
      confirmText: '再考虑下', // 确定按钮的文案，最多 4 个字符
      cancelText: '取消订单', // 取消按钮的文案，最多 4 个字符
      success: (res) => {
        if (res.cancel) {
          this.refundTikTokOrderByTradeNo();
        }
      },
      fail: (res) => {
        console.log(res)
      },
    });
  },
  //复制订单号
  tapCopyNo(e) {
    //单号
    let number = e.currentTarget.dataset.number;
    tt.setClipboardData({
      data: number, // 剪贴板数据
      success: ({ data }) => {
        tt.showToast({
          title: '复制成功', // 内容
          icon: 'none', // 图标
        });
      },
      fail: (res) => {
        console.log(res);
        tt.showToast({
          title: '复制失败', // 内容
          icon: 'none', // 图标
        });
      },
    });
  },
  //查询订单详情
  queryTikTokOrder() {
    tt.showLoading({
      title: '', // 内容
    });
    apiRequest.queryTikTokOrder({
      tradeNo: this.tradeNo,
    }).then((res) => {
      console.log(res)
      if (res.errCode == 0) {

        // let index = JSON.parse(options.index);
        // let page = getCurrentPages()[getCurrentPages().length - 2];
        let detail = res.obj;
        // detail.descMapping = 'DONE_WRITER_OFF'
        // console.log(detail)
        if (detail) {
          var now = new Date();
          var dead = detail.tdpoDeadline > 0 ? new Date(detail.tdpoDeadline) : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          console.log(`deadLine = ${dead}`)
          //核销截止剩余天数
          var deadTime = dead.getDate() - now.getDate() + ((dead.getMonth() - now.getMonth()) * 30);
          deadTime = dead.getHours() > now.getHours() ? deadTime : deadTime - 1;
          //下单时间
          var time = new Date(detail.tdpoCtime);
          this.setData({ detail, deadTime, time: this.formatDate(time) });
        }
      }
    })
  },
  //退款
  refundTikTokOrderByTradeNo() {
    tt.showLoading({
      title: '', // 内容
    });
    apiRequest.refundTikTokOrderByTradeNo({
      tradeNo: this.tradeNo,
    }).then((res) => {
      console.log(`refundTikTokOrderByTradeNo: ${res}`);

      if (res.errCode == 0) {
        let detail = this.data.detail;
        detail.descMapping = this.data.stt[3];
        detail.sttDesc = '退款中'
        this.setData({ detail });
      } else {
        tt.showToast({
          title: res.errMsg, // 内容
          icon: 'none', // 图标
        });
      }
    });
  },
  back() {//返回上一页
    tt.navigateBack({
      delta: 1,
    });
  },
})
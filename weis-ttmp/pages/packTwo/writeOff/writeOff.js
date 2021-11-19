// /Users/weis/Desktop/miniprogram/weis-ttmp/pages/order/writeOff/writeOff.js

import apiRequest from '../../../service/index';

Page({
  data: {
    // calendarStartY:2021,
    // calendarStartM:9,
    lunchTimeIdx: -1,
    dinnerTimeIdx: -1,
    dateList: [],
    timeList: [{ id: '02', category: '午餐' }, { id: '03', category: '晚餐', }]
  },
  onLoad: function (options) {
    console.log(options)
    this.tradeNo = options.tradeNo;
    let dayNum = options.dayNum;
    let mealNum = options.mealNum;
    this.tdpId = options.tdpId;
    //默认选择当前月份开始
    let now = new Date();
    if (now.getHours() >= 18) {
      now = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
    } else {
      now = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }

    let timeList = this.data.timeList;
    for (var i = 0; i < mealNum; i++) {
      timeList[i].check = true;//默认选中餐别
    }

    //默认选择前三天
    let list = []
    for (var i = 0; i < dayNum; i++) {
      list.push({ year: now.getFullYear(), month: now.getMonth() + 1, date: now.getDate() + i });
    }
    this.setData({
      timeList,
      selecteds: list,
      dateList: list,
      calendarStartY: now.getFullYear(),
      calendarStartM: now.getMonth() + 1,
      dayNum,
      mealNum
      // disableDate:function(date){
      //   let now = new Date();
      //   if(now.getHours()>=18){
      //     now = new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
      //   }
      //   let last = new Date(now.getFullYear(),now.getMonth(),now.getDate()+30);
      //   if(date.getTime()-now.getTime()>0&&last.getTime()-date.getTime()>0){
      //     return false;
      //   }
      //   console.log(`range start:${now}`)
      //   console.log(`range end:${last}`)
      //   return true;
      // },
    });
    //参数目测02午餐03晚餐
    this.queryTimeList('02');
    this.queryTimeList('03');
  },
  onShow: function () {
    // console.log(`address = ${this.data.address}`)
    this.detectAddress(this.data.address);
  },
  //选择地址
  tapAddress(e) {
    tt.navigateTo({
      url: '/pages/packOne/addressList/addressList', // 地址列表
    });
  },
  //设置完成
  tapDone: function (e) {
    if (!this.confirmInfo(true)) {
      return;
    }
    // this.createTiktokWriteOffList();
    //选择的日期餐别时间
    let list = this.data.dateList.map((value) => {
      let date = {};
      date.date = `${value.year}${this.zero(value.month)}${this.zero(value.date)}`;
      // let meal = [];
      let timeList = [];
      for (var i in this.data.timeList) {
        let time = this.data.timeList[i];
        // meal.push(time.id);
        if (time.check)
          timeList.push({ category: time.id, mealTakingTime: (time.id == '02' ? this.data.lunchTimeIdx : this.data.dinnerTimeIdx) < 0 ? time.defaultSetTakingTime : time.timeList[time.id == '02' ? this.data.lunchTimeIdx : this.data.dinnerTimeIdx] })
      }
      // date.meal = meal;
      date.timeList = timeList;
      // console.log(value);
      return date;
    })
    tt.navigateTo({
      url: `/pages/packTwo/writeOffInfo/writeOffInfo?mealNum=${this.data.mealNum}&dayNum=${this.data.dayNum}&tradeNo=${this.tradeNo}&tdpId=${this.tdpId}&address=${JSON.stringify(this.data.address)}&dateList=${JSON.stringify(list)}`, // 核销排餐
    });
  },
  //选择餐别
  tapCategory(e) {
    let { index } = e.currentTarget.dataset;
    let list = this.data.timeList;
    if (!this.data.address || !list[index].timeList) {
      tt.showToast({
        title: '请选择地址', // 内容
        icon: 'none', // 图标
      });
      return;
    }
    if (this.data.mealNum == 2) {
      list[0].check = true;
      list[1].check = true;
    } else if (this.data.mealNum == 1) {

      list[(index + 1) % 2].check = false;
      list[index].check = true;
    }
    this.setData({
      timeList: list,
    });
    this.confirmInfo();
  },
  //餐别时间
  bindPickerChange(e) {
    let { index } = e.currentTarget.dataset;
    console.log(`index = ${index}`)
    this.setData({
      lunchTimeIdx: index == 0 ? e.detail.value : this.data.lunchTimeIdx,
      dinnerTimeIdx: index == 1 ? e.detail.value : this.data.dinnerTimeIdx,
    });
    this.confirmInfo();
  },
  //日期选择返回
  selectDate(e) {
    let dateList = e.detail;
    this.setData({
      dateList,
    })
    if (this.data.dateList.length != this.data.dayNum) {
      tt.showToast({
        title: `所选日期过${this.data.dateList.length > this.data.dayNum ? '多' : '少'}，该产品为${this.data.dayNum}日套餐`, // 内容
        icon: 'none', // 图标
      });
    }
    // console.log(dateList);
    this.confirmInfo();
  },
  //经纬度匹配加热点列表第一个
  detectAddress(address) {
    if (!address) return;
    tt.showLoading({
      title: '', // 内容
    });
    apiRequest.heatingPointListForRange({
      userLat: address.lat, //
      userLng: address.lon, // 
    }).then((res) => {
      if (res.errCode == 0) {
        let heatList = res.obj.dtos;

        //1和2是什么？抄WX小程序的
        let heatPoint = heatList.filter((item) => {
          return (item.selfTaking == '1' || item.selfTaking == '2') && item.hotFlag
        })[0];
        //加热点
        if (heatPoint) {
          this.setData({ heatPoint: heatPoint, });

          //参数目测02午餐03晚餐
          this.queryTimeList('02');
          this.queryTimeList('03');
          this.confirmInfo();
        } else {
          tt.showToast({
            title: '该地址超出配送范围', // 内容
            icon: 'none', // 图标
          });
        }
      } else {

      }
    })
  },
  //确认信息是否完整
  confirmInfo(toast = false) {
    var confirm = false;
    var text = '';
    if (!this.data.address) {
      text = '请选择地址';
    } else if (this.data.dateList.length != this.data.dayNum) {
      text = '日期选择错误';
    } else if (!this.data.timeList[0].check && !this.data.timeList[1].check) {//没有选择餐别
      text = '请选择餐别';
    } else if (this.data.mealNum >= 2 && (!this.data.timeList[0].check || !this.data.timeList[1].check)) {//一天两餐就必须都要选中
      text = '餐别选择错误';
    } else {
      confirm = true;
    }
    // if (this.data.dateList.length != this.data.dayNum || !this.data.address || (!this.data.timeList[0].check && !this.data.timeList[1].check) || (this.data.mealNum >= 2 && (!this.data.timeList[0].check || !this.data.timeList[1].check))) {
    //   this.setData({
    //     confirm: false,
    //   });
    //   return false;
    // }
    if (toast && !confirm) {
      tt.showToast({
        title: text, // 内容
        icon: 'none', // 图标
      });
    }
    this.setData({
      confirm,
    });
    return confirm;
  },
  //餐别配送时间列表
  queryTimeList(category) {
    var dateTime = '';
    if (this.data.dateList && this.data.dateList.length > 0) {
      dateTime = `${this.data.dateList[0].year}${this.zero(this.data.dateList[0].month)}${this.zero(this.data.dateList[0].date)}`;
    } else {
      let date = new Date();
      //第二天
      date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      dateTime = `${date.getFullYear()}${this.zero(date.getMonth() + 1)}${this.zero(date.getDate())}`;
    }
    apiRequest.queryHeatingPointConf({
      hId: this.data.heatPoint ? this.data.heatPoint.hpId : '100000',
      category: category,
      dataStt: '00',//参数不明  抄WX小程序的
      orderMethod: '01',//参数不明  抄WX小程序的
      selfTaking: '0',//0配送
      mergeFlag: '00', //00 普通
      dateTime,
    }).then(res => {
      if (res.errCode == 0) {
        let timeList = this.data.timeList;
        var list = res.obj.selfTakingTimes;
        // list.push(res.obj.defaultSetTakingTime);
        // list = list.concat(res.obj.selfTakingTimes);
        //参数目测02午餐03晚餐
        timeList[0].timeList = category != '02' ? timeList[0].timeList : list
        timeList[0].defaultSetTakingTime = category != '02' ? timeList[0].defaultSetTakingTime : res.obj.defaultSetTakingTime
        timeList[1].timeList = category != '03' ? timeList[1].timeList : list
        timeList[1].defaultSetTakingTime = category != '03' ? timeList[1].defaultSetTakingTime : res.obj.defaultSetTakingTime
        this.setData({
          timeList,
        });

      } else if (res.errCode == 1009) {
        tt.showToast({
          title: res.errMsg,
          icon: 'none',
        });
        return;
      }
    });
  },
  //补全0
  zero: function (i) {
    return i >= 10 ? i : '0' + i;
  },
  back() {//返回上一页
    tt.navigateBack({
      delta: 1,
    });
  },
})
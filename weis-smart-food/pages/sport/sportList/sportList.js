// import SportService from "../../../service/SportService";
// const sportService = new SportService();
import apiRequest from "../../../service/index";
const util = require('../../../utils/util.js')
Page({
  data: {
    usercard: false,
    selectTime: '',
    loadingFlag: true,
    status: 0,
    sportTypeList: [], //动作部位分类
    active: 0,
    dataList: '',
    dataList2: [],
    dataList3: [],
    dataList4: [],
    dataList5: [],
    sportInfoList: [],
    scrollHeight: "",
    tmrPositionName: '',
    paramType: null,
    replaceFlag: false, //添加动作
    choseName: '',
    selectIndex: '',
    selectArrBuffer: {}, // 欲添加动作缓存
    selectIndexBuffer: '', // 欲添加动作指针缓存
    selectArr: [],
    dataArr: [],
    indexnum: 0,
    selectkg: '',
    selectNums: '',
    selectMin: '',
    selectSlope: '',
    selectSpeed: '',
    selectSec: '',
    type: '' // 添加动作到何处，sys&cus 方案库，plan 个人计划
  },
  onLoad(options) {
    this.setData({
      type: options.type,
      // selectTime: util.dateUtil.format(new Date(), 'YMD')
      selectTime: options.selectVal,
    })
    this.getOldChoose()
  },
  onShow: function () {
    this.getSportInfo();
    this.computeScrollViewHeight()
  },
  bindkg(e) {
    this.setData({
      selectkg: e.detail.value
    })
  },
  bindNums(e) {
    this.setData({
      selectNums: e.detail.value
    })
  },
  bindname(e) {
    this.setData({
      sportName: e.detail.value
    })
  },
  bindkal(e) {
    this.setData({
      sportKal: e.detail.value
    })

  },
  bindMin(e) {
    this.setData({
      selectMin: e.detail.value
    })
  },

  bindSlope(e) {
    this.setData({
      selectSlope: e.detail.value
    })
  },

  bindSpeed(e) {
    this.setData({
      selectSpeed: e.detail.value
    })
  },

  /*上次选择动作*/
  getOldChoose() {

    if (wx.getStorageSync("sportSelectArr")) {
      this.setData({
        selectArr: wx.getStorageSync("sportSelectArr"),
        indexnum: wx.getStorageSync("sportSelectArr").length
      })
    }


  },

  bindSec(e) {
    this.setData({
      selectSec: e.detail.value
    })
  },
  //计算 scroll-view 的高度
  computeScrollViewHeight() {
    let that = this;
    let query = wx.createSelectorQuery();
    query
      .select(".top-nav")
      .boundingClientRect(function (res) {
        //得到tab的高度
        let tabHeight = res.height;
        //获取屏幕可用高度
        let screenHeight = wx.getSystemInfoSync().windowHeight;
        //计算 scroll-view 的高度
        let scrollHeight = 0;
        if (that.sportItem == 1) {
          scrollHeight = screenHeight - tabHeight - 100;
        } else {
          scrollHeight = screenHeight - tabHeight - 100;
        }

        that.setData({
          scrollHeight: scrollHeight - 40
        })
      })
      .exec();
  },
  close() {

    this.setData({
      replaceFlag: false
    })
  },
  /*选择动作 */
  choseSport(e) {
    let chooseFlag = false
    let sport = e.currentTarget.dataset.sport;
    let index = e.currentTarget.dataset.index;
    // this.data.selectArr.forEach(v => {
    //   if (v.sportId == sport.tmrId) {
    //     chooseFlag = true
    //   }
    // })
    if (!chooseFlag) {
      this.setData({
        choseName: sport.tmrSport,
        replaceFlag: true,
        paramType: sport.tmrParamType.split(","),
        selectIndex: index,
        selectkg: sport.tmrWeight,
        selectNums: sport.tmrFrequency,
        selectMin: sport.tmrSportTime,
        selectSlope: sport.tmrAngle,
        selectSpeed: Math.round(sport.tmrSpeed / 10),
        selectSec: sport.tmrSecond,
        selectIndexBuffer: index
      })
      let datalist = {
        sportId: sport.tmrId,
        sportName: sport.tmrSport,
        sportType: sport.tmrMotiontype,
        position: sport.tmrPositionName,
        limbs: sport.tmrLimbs,
        groupNum: sport.tmrGroupNum,
        tmrSecond: sport.tmrSecond,
        tmrFrequencyMax: sport.tmrFrequencyMax,
        tmrFrequencyMin: sport.tmrFrequencyMin,
        frequency: sport.tmrFrequency,
        tmrSportTime: sport.tmrSportTime,
        weight: sport.tmrWeight,
        tmrWeightMax: parseFloat(sport.tmrWeightMax),
        tmrWeightMin: parseFloat(sport.tmrWeightMin),
        tmrWeightStep: parseFloat(sport.tmrWeightStep),
        tmrSportMax: sport.tmrSportMax,
        tmrSportMin: sport.tmrSportMin,
        tmrSportStep: sport.tmrSportStep,
        tmrSpeed: sport.tmrSpeed,
        tmrAngle: sport.tmrAngle,
        tmrParamType: sport.tmrParamType
      };
      this.data.selectArrBuffer = datalist
      this.setData({
        selectArrBuffer: this.data.selectArrBuffer
      })
    }
  },
  hasNull() {
    let nullFlag = false;

    this.data.paramType.forEach(v => {
      switch (v) {
        case "1":
          if (this.data.selectkg == 0 || this.data.selectkg == "") {
            wx.showToast({
              icon: 'none',
              title: "数值不能为0或空",
              duration: 2000
            })
            nullFlag = true;
          }
          break;
        case "2":
          if (this.data.selectNums == 0 || this.data.selectNums == "") {
            wx.showToast({
              icon: 'none',
              title: "数值不能为0或空",
              duration: 2000
            })
            nullFlag = true;
          }
          break;
        case "3":
          if (this.data.selectMin == 0 || this.data.selectMin == "") {
            wx.showToast({
              icon: 'none',
              title: "数值不能为0或空",
              duration: 2000
            })
            nullFlag = true;
          }
          break;
        case "4":
          if (this.data.selectSlope == "") {
            wx.showToast({
              icon: 'none',
              title: "数值不能为空",
              duration: 2000
            })
            nullFlag = true;
          }
          break;
        case "5":
          if (this.data.selectSpeed == 0 || this.data.selectSpeed == "") {
            wx.showToast({
              icon: 'none',
              title: "数值不能为0或空",
              duration: 2000
            })
            nullFlag = true;
          }
          break;
        case "6":
          if (this.data.selectSec == 0 || this.data.selectSec == "") {
            wx.showToast({
              icon: 'none',
              title: "数值不能为0或空",
              duration: 2000
            })
            nullFlag = true;
          }
          break
      }
    });

    return nullFlag
  },
  //自定义打卡
  useraddGroupCofm() {
    if (!this.data.sportName || !this.data.sportKal) {
      return
    }
    apiRequest.userAddCustomSportCard({
      sportName: this.data.sportName,
      time: this.data.selectTime,
      calorie: this.data.sportKal
    })
      .then(res => {
        if (res.errCode == 0) {
          this.setData({
            usercard: false
          })
          wx.showToast({
            title: '打卡成功',
            icon: 'none',
          });
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
        }
      })


  },
  /*修改动作 */
  addGroupCofm() {
    if (!this.hasNull()) {
      this.data.sportInfoList[this.data.selectIndexBuffer].choosed = true
      this.data.selectArrBuffer.weight = this.data.selectkg; //秒
      this.data.selectArrBuffer.tmrSecond = this.data.selectSec; //秒
      this.data.selectArrBuffer.tmrSpeed = this.data.selectSpeed; //速度
      this.data.selectArrBuffer.tmrAngle = this.data.selectSlope; //坡度
      this.data.selectArrBuffer.tmrFrequency = this.data.selectNums; //次数
      this.data.selectArrBuffer.frequency = this.data.selectNums; //次数
      this.data.selectArrBuffer.tmrSportTime = this.data.selectMin; //分钟   sportTime
      this.data.selectArr.push(this.data.selectArrBuffer)

      this.setData({
        replaceFlag: false,
        selectArr: this.data.selectArr,
        sportInfoList: this.data.sportInfoList
      })
      this.chooseNext();
      // wx.setStorageSync("sportSelectArr", this.data.selectArr);
    }
  },
  // 打卡
  chooseNext() {
    let dataArr = []
    for (var i = 0; i < this.data.selectArr.length; i++) {
      var datai2 = {
        sportId: this.data.selectArr[i].sportId,
        sportName: this.data.selectArr[i].sportName,
        tmrParamType: this.data.selectArr[i].tmrParamType,
        sportType: this.data.selectArr[i].sportType,
        tmrAngle: this.data.selectArr[i].tmrAngle,
        tmrSpeed: this.data.selectArr[i].tmrSpeed,
        tmrSecond: this.data.selectArr[i].tmrSecond,
        tmrSportTime: this.data.selectArr[i].tmrSportTime,
        limbs: this.data.selectArr[i].limbs,
        position: this.data.selectArr[i].position,
        groupNum: this.data.selectArr[i].groupNum,
        frequency: this.data.selectArr[i].tmrFrequency,
        weight: this.data.selectArr[i].weight,
        calorie: this.data.selectArr[i].calorie
      };
    }
    dataArr.push(datai2);
    let _this = this

    apiRequest.userAddSportCard({

      state: 1,
      time: _this.data.selectTime,
      data: dataArr

    })
      .then(res => {
        if (res.errCode == 0) {
          // if (_this.data.selectArr.length >= 1) {
          //   _this.data.scrollHeight = _this.data.scrollHeight - 70
          // }
          _this.data.indexnum++
          _this.setData({
            // scrollHeight: _this.data.scrollHeight,
            indexnum: _this.data.indexnum
          })
          wx.setStorageSync("sportSelectArr", this.data.selectArr);
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          prevPage.$sported = true;
        } else {
          let nums = this.data.selectArr.slice(0, -1)
          _this.data.sportInfoList[_this.data.selectIndexBuffer].choosed = false
          _this.setData({
            sportInfoList: _this.data.sportInfoList,
            selectArr: nums,
          })
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
        }
      })
  },
  nextto() {
    wx.removeStorageSync("sportSelectArr");
    wx.navigateBack({});
  },
  toSearch() {
    wx.navigateTo({
      url: `/pages/sport/searchSport/index?selectTime=${this.data.selectTime}`
    })
  },
  toindex() {
    // wx.setStorageSync("sportSelectArr", this.data.selectArr);
    const pages = getCurrentPages()
    const prePage = pages[pages.length - 2]
    if (prePage.route.indexOf('libraryDetail') != -1) {
      prePage.data.type = this.data.type
      prePage.data.isEdit = true
      prePage.getOriginData_plan()
      // wx.navigateBack({
      //   url: `/pages/features/libraryDetail/libraryDetail?type=${this.data.type}&isEdit=true`
      // })
      return
    }
    // wx.navigateTo({
    //   url: `/pages/features/libraryDetail/libraryDetail?type=${this.data.type}&isEdit=true`
    // })
  },
  //查询动作库
  getSportInfo() {
    let _this = this
    apiRequest.queryAllMotionRules({

    })
      .then(res => {
        _this.setData({
          dataList: res.obj,
          loadingFlag: false
        })
        _this.handleData()
      })
      .then(() => {
        this.getOldChoose();
      });

  },
  //数据筛选
  handleData() {

    var hash = [];
    var dataList = []
    var dataArray = []
    if (this.data.status == 0) {
      dataList = this.data.dataList.motionRulesArrayList2 // 无氧部位分类

    } else if (this.data.status == 1) {
      dataList = this.data.dataList.motionRulesArrayList1 // 有氧部位分类
    } else if (this.data.status == 2) {
      dataList = this.data.dataList.motionRulesArrayList3 // 小工具部位分类
    } else {
      dataList = this.data.dataList.motionRulesArrayList4 // 自重训练部位分类
    }
    for (let k = 0; k < dataList.length; k++) {
      for (let l = 0; l < this.data.selectArr.length; l++) {
        if (dataList[k].tmrId == this.data.selectArr[l].sportId) {
          dataList[k].choosed = true;
        }
      }
    }
    dataArray = dataList //,,
    dataList = dataList.reduce(function (x, y) {
      hash[y["tmrPositionName"]] ?
        "" :
        (hash[y["tmrPositionName"]] = true && x.push(y));
      return x;
    }, [])
    this.setData({
      sportTypeList: dataList,
      sportInfoList: dataArray,
      tmrPositionName: dataList[0].tmrPositionName
    })

  },
  //切换动作部位分类
  tab(e) {
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    this.setData({
      active: index,
      tmrPositionName: id
    })
    // this.active = index;
  },
  cancel() {
    this.setData({
      usercard: false
    })
  },
  //切换动作类型分类
  changeStatus: function (e) {
    var that = this;
    // 将id作为状态区分的标记--e.currentTarget是事件函数固有的，里面包含自带和通过data-设置的内容

    var status = e.currentTarget.id;
    if (status == 4) {
      this.setData({
        usercard: true
      })
      return
    }
    that.setData({
      status: status,
      active: 0
    });
    that.handleData()
  }

})
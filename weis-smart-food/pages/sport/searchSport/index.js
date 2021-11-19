// pages/searchSport/index.js
import apiRequest from "../../../service/index";

Page({

  data: {
    addGroupCofm: '',
    selectTime: '',
    showdelete: false,
    historyList: [],
    popupFlag: false,
    searchName: '',
    showlist: false,
    searchName: '',
    selectkg: '',
    selectNums: '',
    selectMin: '',
    selectSlope: '',
    selectSpeed: '',
    selectSec: '',
    indexnum: 0,
    dataArr: [],
    selectArr: [],
    selectIndexBuffer: '', // 欲添加动作指针缓存
  },

  onLoad: function (options) {
    // debugger
    this.setData({
      selectTime: options.selectTime
    })
  },
  cancelPopupFlag() {
    this.setData({
      popupFlag: false
    })
  },
  deletename() {
    this.setData({
      searchName: '',
      showlist: false,
    })
    this.getSportSearch();



  },
  showtag() {
    this.setData({
      popupFlag: true
    })
  },
  search(e) {
    this.setData({
      showdelete: true,
      searchName: e.detail.value
    })
    this.querySportByName()
  },
  querySport(e) {
    this.setData({
      searchName: e.currentTarget.dataset.sport
    })
    this.querySportByName()

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

  bindMin(e) {
    this.setData({
      selectMin: e.detail.value
    })
  },
  bindSec(e) {
    this.setData({
      selectSec: e.detail.value
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
  choseSport(e) {
    let chooseFlag = false
    let sport = e.currentTarget.dataset.sport;
    let index = e.currentTarget.dataset.index;

    let oldSport = wx.getStorageSync("sportSelectArr");
    if (oldSport) {
      this.setData({
        selectArr: oldSport
      })
    }
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


      this.data.selectArr.push(datalist)
      console.log(this.data.selectArr)
      this.setData({
        selectArr: this.data.selectArr,
        indexnum: this.data.selectArr.length,

      })

    }
  },
  chooseNext() {
    let dataArr = []
    for (var i = 0; i < this.data.selectArr.length; i++) {
      console.log(this.data.selectArr[i])
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

    apiRequest.userAddSportCard({

      state: 1,
      time: this.data.selectTime,
      data: dataArr

    })
      .then(res => {
        if (res.errCode == 0) {
          this.data.historySport[this.data.selectIndexBuffer].choosed = true
          wx.showToast({
            title: '打卡成功',
            icon: 'none',
          });
          wx.setStorageSync("sportSelectArr", this.data.selectArr);
        } else {

          this.data.historySport[this.data.selectIndexBuffer].choosed = false

          wx.showToast({
            title: '打卡失败',
            icon: 'none',
          });
        }
        this.setData({
          historySport: this.data.historySport
        })


      })


  },
  /*修改动作 */
  addGroupCofm() {
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
          break;
      }
    });
    if (!nullFlag) {
      this.data.selectArr[this.data.indexnum - 1].weight = this.data.selectkg; //秒
      this.data.selectArr[this.data.indexnum - 1].tmrSecond = this.data.selectSec; //秒
      this.data.selectArr[this.data.indexnum - 1].tmrSpeed = this.data.selectSpeed; //速度
      this.data.selectArr[this.data.indexnum - 1].tmrAngle = this.data.selectSlope; //坡度
      this.data.selectArr[this.data.indexnum - 1].tmrFrequency = this.data.selectNums; //次数
      this.data.selectArr[this.data.indexnum - 1].frequency = this.data.selectNums; //次数
      this.data.selectArr[this.data.indexnum - 1].tmrSportTime = this.data.selectMin; //分钟   sportTime

      this.setData({
        replaceFlag: false,

      })

      this.chooseNext()
    } else {
      if (!nullFlag) {
        this.data.selectArr.splice(this.data.indexnum - 1, 1);
      }

      this.setData({
        selectArr: this.data.selectArr
      })

    }
  },

  close() {
    this.data.selectArr.splice(this.data.selectArr.length - 1, 1);
    this.setData({
      replaceFlag: false,
      selectArr: this.data.selectArr
    })

  },
  /*搜索记录搜索*/
  querySportByName() {
    if (!this.data.searchName) {
      return
    }
    apiRequest.queryNewMotionRules({

      sportName: this.data.searchName

    })
      .then(res => {
        this.setData({
          searchName: this.data.searchName,
          showlist: true,
          historySport: res.obj.newMotionRulesList
        })

      })
  }
})
// pages/mineBox/forecast/forecast/forecast.js
import day from '../../../../libs/day';
import apiRequest from '../../../../service/index'
import { throttle } from '../../../../utils/throttle'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    setWeekShow: false,
    dateModifyShow: false,
    setWeek: [{
      value: '1',
      name: '周一',
    }, {
      value: '2',
      name: '周二',
    }, {
      value: '3',
      name: '周三',
    }, {
      value: '4',
      name: '周四',
    }, {
      value: '5',
      name: '周五',
    }, {
      value: '6',
      name: '周六',
    }, {
      value: '7',
      name: '周日',
    }],
    setWeekSelect: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 预测企业id：corpId 、校区id：tgcaId
    this.setData({
      corpId: options.corpId,
      tgcaId: options.tgcaId,
      week: 1,
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
    // this.queryGroupForecastDetailList()
  },
  // 导航栏星期-改变
  headTap(e) {
    let dateList = e.detail;
    this.setData({
      dateList
    }, () => {
      this.queryGroupForecastDetailList()
    })
  },
  // 销售预测列表
  queryGroupForecastDetailList() {
    let { dateList, corpId, tgcaId} = this.data;
    apiRequest.queryGroupForecastDetailList({
      dateList,
      corpId,
      tgcaId,
      // corpId: '100000',
      // tgcaId: '100502',
    })
      .then(res => {
        let { listBeans } = res.obj;
        // 套餐名称
        let name = {
          title: '设置',
          value: listBeans[0].messageBeanList.map(item => {
            return item.tgfdComboName
          })
        }
        // 套餐数量
        let weekArr = [ '一', '二', '三', '四', '五', '六', '日']
        let disabledAll = true
        let isAdd = true
        let list = listBeans.map(item => {
          item.day = item.date.slice(6,8);
          item.weeks = weekArr[item.week - 1]
          item.messageBeanList.map(item1 => {
            if(item1.tgfStt == '00') {
              disabledAll = false
            }
            if(item1.tgfdId) {
              isAdd = false
            }
          })
          return item
        })
        // 星期勾选
        let setWeekSelect = []
        if(!isAdd) {
          list.map(item => {
            item.messageBeanList.map(item1 => {
              if(item1.tgfShow) {
                setWeekSelect.push(item.week)
                return
              }
            })
          })
        }else {
          setWeekSelect = ['1', '2', '3', '4', '5']
        }
        // 1：提交  2：提交修改  3：本周未提交  3：已提交，不可修改数据
        let btnStatus = 0
        // disabledAll：false 存在可修改   true 全部禁用不可修改
        // isAdd: false 修改 true 新增
        if(!disabledAll) {
          if(isAdd) {
            btnStatus = 1
          }else {
            btnStatus = 2
          }
        } else {
            if(isAdd) {
              btnStatus = 3
            }else {
              btnStatus = 4
            }
        }

        this.setData({
          listBeansInit: list,
          nameBeans: name,
          listBeans: list,
          setWeekSelect,
          btnStatus
        }, () => {
          this.setWeekFilter()
          this.total()
        })
      })
      .catch(() => { });
  },
  // 计算合计
  total() {
    let { listBeans } = this.data;
    // 总计
    let total = {
      title: '总计',
      value: []
    }
    for(let i = 0; i < listBeans.length;i++) {
      for(let j = 0; j < listBeans[i].messageBeanList.length;j++) {
        const current = listBeans[i].messageBeanList[j]
        total.value[j] = (total.value[j] || 0) + current.tgfdNum
      }
    }
    this.setData({
      totalBeans: total
    })
  },
  // 设置星期-点击
  setWeek() {
    let { setWeek, setWeekSelect } = this.data;
    setWeek.map(item => {
      if(setWeekSelect.includes(item.value)) {
        item.checked = true
      }else {
        item.checked = false
      }
    })
    this.setData({
      setWeek,
      setWeekShow: true
    })
  },
  // 设置星期-改变
  setWeekChange(e) {
    const {index} = e.currentTarget.dataset;
    let { setWeek } = this.data;
    setWeek[index].checked = !setWeek[index].checked;
    this.setData({
      setWeek
    })
  },
  // 设置星期-确定
  setWeekConfirm(e) {
    const {index} = e.currentTarget.dataset;
    let { setWeek, setWeekSelect } = this.data;
    setWeekSelect = []
    setWeek.forEach(item => {
      if(item.checked) {
        setWeekSelect.push(item.value)
      }
    })
    
    this.setData({
      setWeek,
      setWeekSelect,
      setWeekShow: false
    }, () => {
      this.setWeekFilter()
      this.total()
    })
  },
  // 设置星期-过滤数据
  setWeekFilter() {
    let { setWeekSelect, listBeans, listBeansInit } = this.data;
    listBeans = listBeansInit.filter(item => setWeekSelect.includes(item.week))
    this.setData({
      listBeans
    })
  },
  // 长按
  longpress(e) {
    const {index1, tgfstt, tgfdnum} = e.currentTarget.dataset;
    const { listBeans } = this.data;
    if(tgfstt == "10") {
      return;
    }
    this.setData({
      longpress: {
        index1,
        tgfdnum
      },
      dateModifyShow: true,
      dateModifyText: '是否要把本周其他日期的该套餐都改成' + tgfdnum + '份？'
    })
  },
  // 日期批量修改-弹窗
  dateModifyConfirm() {
    const {longpress, listBeans, totalBeans} = this.data;
    listBeans.map(item => {
      let items = item.messageBeanList[longpress.index1]
      if(items.tgfStt == '00' && items.tgfdMealId) {
        items.tgfdNum = longpress.tgfdnum
      }
    })
    this.setData({
      listBeans,
      dateModifyShow: false
    }, () => {
      this.total()
    })
  },
  // 数据改变
  inputChange(e) {
    const { value } = e.detail;
    const {index, index1} = e.currentTarget.dataset;
    let { listBeans } = this.data;
    listBeans[index].messageBeanList[index1].tgfdNum = Number(value)
    this.setData({
      listBeans
    }, () => {
      this.total()
    })
  },
  // 提交修改
  submit: throttle(1500, function () {
    let { tgcaId, listBeans, btnStatus } = this.data;
    apiRequest.changeGroupForecasDetail({
      // tgcaId: '100502',
      tgcaId,
      listBeans
    })
      .then(res => {
        let status = res.errCode == 0?1:0
        wx.navigateTo({
          url: `/pages/mineBox/forecast/submitStatus/submitStatus?status=${status}`,
        });
        this.queryGroupForecastDetailList()
      })
      .catch(() => { });
  }),
  // ----------------
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
  // onShareAppMessage: function () {

  // }
})
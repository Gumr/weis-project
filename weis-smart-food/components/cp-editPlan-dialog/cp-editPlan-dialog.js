import apiRequest from '../../service/index';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean
    },
    title: {
      type: String,
      value: ''
    },
    subTitle: {
      type: String,
      value: ''
    },
    iptType: {
      type: String,
      value: '1' // 1 修改名称 2 修改三大营养素 3 修改单个营养素比例
    },
    iptVal: {
      type: String,
      value: '固定蛋白饮食法'
    },
    btnText: {
      type: String,
      value: '保存' //按钮文案
    },
    btnHeightTop: {
      type: String,
      value: '68rpx'
    },
    oneObj: {
      type: Object,
      value: {}
    },
    listArr: {
      type: Array,
      value: []
    },
    errTip: {
      type: String,
      value: ''
    }
  },
  observers: {
    balanceSupport(support) {
      if (!support) {
        this.setData({
          'payList[0].disabled': true
        }, () => {
          this.checkBalanceSelected();
        })
      }
    },
  },
  ready() {
    
  },
  attached() {
    
  },
  observers: {
    'show'(data) {
      if(data){
        this.monitorKeyboard()
        this.setData({
          err: false,
          btnDisabled: false
        })
      }
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    keyboardheight: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    monitorKeyboard(){
      let pages = getCurrentPages();
      let currPage = null;
      if (pages.length) {
        currPage = pages[pages.length - 1];
      }
      wx.onKeyboardHeightChange(res => {
        if(currPage && currPage.route == 'pages/packageOrder/plan/plan' && res.height > 0){
          this.setData({
            keyboardheight: res.height - 48
          })
        }else{
          this.setData({
            keyboardheight: res.height
          })
        }
      })
    },
    handleClickOverlay() {
      this.setData({
        show: false,
        errTip: '',
        err: false,
        keyboardheight: 0,
      })
    },
    showPopup() { // 组件方法 可以外部调用 
      this.setData({
        show: true,
      })
    },

    // bindblur() {
    //   this.setData({
    //     keyboardheight: 0
    //   })
    // },

    // focus() {
    //   wx.onKeyboardHeightChange(res => {
    //     this.setData({
    //       keyboardheight: res.height
    //     })
    //   })
    // },

    // 改编方案名
    change(e) {
      this.setData({
        iptVal: e.detail.value,
        btnDisabled: !e.detail.value ? true : false
      })
    },
    // 清空方案名
    clear() {
      this.setData({
        iptVal: '',
        btnDisabled: true
      })
    },
    // 修改三餐能量
    edit(e) {
      let {
        index
      } = e.currentTarget.dataset;
      let {
        listArr
      } = this.data;
      listArr[index].val = e.detail.value;
      let total = listArr.reduce((totalVal, item) => {
        totalVal += Number(item.val)
        return totalVal
      }, 0)
      this.setData({
        listArr,
        err: total != 100 ? true : false
      })
    },

    // 修改摄入量
    editIntake(e) {
      let {
        oneObj
      } = this.data;
      oneObj.val = e.detail.value;
      this.setData({
        oneObj,
        btnDisabled: !e.detail.value ? true : false
      })
    },

    save() {
      let {
        iptType,
        iptVal,
        listArr,
        oneObj,
        err,
        btnDisabled
      } = this.data;
      if (err) {
        return
      }
      if (iptType == '1') {
        if (btnDisabled) {
          return
        }
        this.triggerEvent('update', {
          iptVal
        });
      } else if (iptType == '2') {
        this.triggerEvent('update', {
          listArr
        });
      } else if (iptType == '3') {
        if (btnDisabled) {
          return
        }
        this.triggerEvent('update', {
          oneObj
        });
      }
    },
  }
})
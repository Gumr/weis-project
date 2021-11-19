// components/wxInput/wxInput.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    height: {
      type: String,
      value: '400'
    },
    disabled: {
      type: Boolean,
      value: false
    },
    placeholder: {
        type: String,
        value: '请输入'
    },
    placeholderStyle: String,
    placeholderClass: String,
    maxlength: {
        type: Number,
        value: 140
    },
    focus: {
        type: Boolean,
        value: false
    },
    confirmType: {
        type: String,
        value: 'done'
    },
    confirmHold: {
        type: Boolean,
        value: false
    },
    type: {
        type: String,
        value: 'text'
    },
    title: {
      type: String,
      value: ''
    },
    unit: {
      type: String,
      value: ''
    },
    placeholder2: {
      type: String,
      value: ''
    },
    unit2: {
      type: String,
      value: ''
    },
    value: String,
    required: {
        type: Boolean,
        value: false,
    },
    limit: {
      type: Number,
      value: '',
    },
    symbol:{
      type: Boolean,
      value: false
    },
    show:{
      type: Boolean,
      value: false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    symbolIndex: 0,
    keyboardheight: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 键盘高度
    keyboardheight(e) {
      wx.onKeyboardHeightChange(res => {
        this.setData({
          keyboardheight: res.height
        })
      })
    },

    handleInputChange(e) {
      let detail = {
          value: e.detail.value
      }
      this.setData({
          value: detail.value
      });

      this.triggerEvent('input', detail);
    },
    handleInputFocus(e) {
      this.keyboardheight();
        this.triggerEvent('focus', e.detail);
    },
    handleInputBlur(e) {
        let detail = {
            value: e.detail.value
        }
        this.triggerEvent('blur', detail);
        this.setData({
          keyboardheight: 0
        })
    },
    handleInputConfirm(e) {
        let detail = {
            value: e.detail.value
        }
        this.setData({
            value: detail.value
        });
        this.triggerEvent('confirm', detail);
    },
    // 取消
    cancel(){
      this.setData({
        value: ''
    });
      this.triggerEvent('cancel', {});
    },

    // 点击符号
    sym: function(){
      this.setData({
        selectFh: !this.data.selectFh
      })
    },

    sureSymbol: function(e){
      this.setData({
        selectFh: !this.data.selectFh,
        symbolIndex: e.currentTarget.dataset.index,
      },()=>{
        this.triggerEvent('symbol', e.currentTarget.dataset.index);
      })
    },

    // 确定
    sure(){
      var pattern = /^[1-9](\d+)?(\.\d+)?$|^0(\.\d+)?$/;
      var space = /^[ ]*$/;
      if(this.data.value === '' || space.test(this.data.value)){
        wx.showToast({
          title: '数值不能为空',
          icon: 'none',
          duration: 1500,
        });
        return
      }
      if((this.data.type == 'Number' || this.data.type == 'digit')){
        if(!pattern.test(this.data.value) || (this.data.value.length>=2 && this.data.value.substr(0,1) == 0 && this.data.value.substr(1,1) == 0) || (this.data.value.length>=2 && this.data.value.substr(0,1) == 0 && this.data.value.substr(this.data.value.length-1,1) == 0)){
          wx.showToast({
            title: '数值不合法',
            icon: 'none',
            duration: 1500,
          });
          return
        }
      }
      if(this.data.limit){
        if(this.data.value > this.data.limit){
          // console.log('2')
          wx.showToast({
            title: '数值不合法',
            icon: 'none',
            duration: 1500,
          });
          return
        }
      }
      this.triggerEvent('sure', this.data.value);
      this.setData({
        show: false,
        keyboardheight: 0,
        value: ''
      })
    },
  }
})

<template>
  <div v-if="show">
  <div class="mask"></div>
  <div class="content">
    <div id="printTest">
      <div  class="table" v-for="(data, dataIndex) in formData" :key="dataIndex">
        <div class="title"><span>深圳市维士数字饮食（科技）有限公司</span></div>
        <div class="title"><span>配送单/出货单</span></div>
        <div class="info">
          <div class="short-title">配送点名称</div>
          <div class="short-title2">{{infoData.hpName}}</div>
          <div class="short-title">配送点电话</div>
          <div class="short-title3">{{infoData.hpPhone}}</div>
        </div>
        <div class="info">
          <div class="short-title">配送点联系人</div>
          <div class="short-title2">{{infoData.hpLeader}}</div>
          <div class="short-title">送货日期</div>
          <div class="short-title3">{{infoData.date}}</div>
        </div>
        <div class="info">
          <div class="short-title">配送点地址</div>
          <div class="short-title2">{{infoData.hpAddress}}</div>
          <div class="short-title">单据编号</div>
          <div class="short-title3"></div>
        </div>
        <div class="table-head">
          <div class="colums" v-for="(item, index) in thead" :key="index">{{item}}</div>
        </div>
        <div class="table-head" v-for="(item, index) in data.dish" :key="index">
          <div class="colums">{{item.tksoCid}}</div>
          <div class="colums">{{item.tfsSkuname}}</div>
          <div class="colums">{{item.tfsQuality}}{{item.tfsUnit}}/盒</div>
          <div class="colums">{{item.tksoTotalNum}}</div>
          <div class="colums">{{item.tksoActualNum}}</div>
          <div class="colums"></div>
          <div class="colums">{{item.tksoRemark}}</div>
        </div>
        <div class="total">
          <div class="div1">
            <div class="d">小计</div>
            <div class="d">合计</div>
          </div>
          <div class="div3">计划出库量</div>
          <div class="div3">{{infoData.actualType}}种/{{infoData.actualNum}}盒</div>
          <div class="div2">实际出库量</div>
          <div class="div4">{{data.type}}种/{{data.num}}盒</div>
          <div class="div2">实际出库量</div>
          <div class="div4" v-if="dataIndex === formData.length - 1">{{infoData.totalType}}种/{{infoData.totalNum}}盒</div>
          <div class="div4" v-else>{{data.type}}种/{{data.num}}盒</div>
        </div>
        <div class="bottom">
          <div class="div1">制单人：</div>
          <div class="div2"></div>
          <div class="div3">捡货人：</div>
          <div class="div4"></div>
          <div class="div5">送货司机：</div>
          <div class="div6"></div>
        </div>
        <div class="bottom">
          <div class="div1">收货人：</div>
          <div class="div2"></div>
          <div class="div3">服务满意度：</div>
          <div class="div4"></div>
          <div class="div5">收货时间：</div>
          <div class="div6"></div>
        </div>
        <div class="bottom">
          <div class="div1">送货车牌号：</div>
          <div class="div2"></div>
          <div class="div3">车厢清洁度：</div>
          <div class="div4"></div>
          <div class="div5">车厢温度：</div>
          <div class="div6"></div>
        </div>
        <div class="zw">
          <div class="page-size"><span style="margin-right: 20px;">{{printDate}}</span>  {{dataIndex + 1}}/{{formData.length}}</div>
        </div>
      </div>
    </div>
    <div class="bottom-btn">
      <el-button @click="cancelClick">取消</el-button>
      <el-button v-print="printObj" type="danger">打印</el-button>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    formData: {
      type: Array,
      default: () => []
    },
    infoData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      printDate: this.$day(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      thead: ['产品编码', '产品名称', '规格/单位', '计划送货量', '实际送货量', '实际签收量', '备注',],
      printObj: {
        id: '#printTest',
        popTitle: '',
      }
    };
  },
  mounted() {

  },
  methods: {
    cancelClick() {
      this.$emit('print-cancel');
    },
  }
};
</script>

<style media="printContent">
    @page {
      /* margin-top: 5mm; /* this affects the margin in the printer settings */
      /* margin-bottom: 0; */
    }
    .page-size {
      position: absolute;
      font-size: 12px;
      bottom: 10px;
      right: 0;
    }
</style>
<style scoped lang="less">
  .mask {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background-color: black;
    opacity: 0.5;
    z-index: 9;
  }
  .content {
    position: fixed;
    top: 100px;
    bottom: 100px;
    width: 1000px;
    left: 50%;
    margin-left: -500px;
    background-color: white;
    z-index: 10;
    overflow-y: auto;
    padding: 50px 50px 150px 50px;
    box-sizing: border-box;
  }
  .zw {
    position: relative;
    margin-top: 3px;
    width: 910px;
    float:left;
    height: 30px;
    margin-left: -5px;
    background-color: #FFF;
  }
  .table {
    float:left;
    width: 900px;
    margin-left: 0px;
    margin-top: 0px;
    position: relative;
    border: 1px solid #999999;
    border-bottom: none;
    // margin-bottom: 15px;
    .title{
      float:left;
      width: 100%;
      height: 50px;
      line-height: 50px;
      text-align: center;
      border-bottom: 1px solid #999999;
      box-sizing: border-box;
      font-size: 14px;
    }
    .title {
      font-size: 18px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .none {
      border-right: none;
    }
    .table-head,.info {
      float:left;
      height: 30px;
      width: 100%;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      .short-title, .short-title2, .short-title3 {
        float:left;
        height: 30px;
        line-height: 30px;
        text-align: center;
        border-right: 1px solid #999999;
        border-bottom: 1px solid #999999;
        box-sizing: border-box;
        width: 128px;
        &:last-child {
          border-right: none;
        }
      }
      .short-title2 {
        width: 386px;
      }
      .short-title3 {
        width: 256px;
      }
      .colums {
        flex: 1;
        height: 30px;
        line-height: 30px;
        text-align: center;
        border-right: 1px solid #999999;
        border-bottom: 1px solid #999999;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        &:nth-child(7n) {
          border-right: none;
        }
      }
    }
    .total, .bottom {
      float:left;
      width: 100%;
      height: 60px;
      border-bottom: 1px solid #999999;
      box-sizing: border-box;
      .div1, .div2, .div3, .div4, .div5, .div6 {
        font-size: 14px;
        width: 257px;
        height:60px;
        border-right: 1px solid #999999;
        display: flex;
        align-items: center;
        justify-content: center;
        float:left;
        box-sizing: border-box;
        flex-wrap: wrap;
        border-bottom: 1px solid #999999;
      }
      .d {
        height: 30px;
        width: 100%;
        line-height: 30px;
        text-align: center;
        border-bottom: 1px solid #999999;
        &:last-child {
          border:none;
        }
      }
      .div2 {
        width: 128.5px;
        height: 30px;
      }
      .div3 {
        height: 60px;
        width: 129px;
      }
      .div4 {
        height: 30px;
        width: 256px;
        border-right: none;
      }
    }
    .bottom {
      height: 30px;
      .div1, .div2, .div3, .div4, .div5, .div6 {
        height: 30px;
        width: 130px;
      }
      .div2 {
        width: 127px;
      }
      .div3 {
        width: 128.5px;
      }
      .div4 {
        width:129px;
        border-right: 1px solid #999999;
      }
      .div5 {
        width: 129px;
      }
      .div6 {
        width:224px;
        border-right: none;
      }
    }
  }
  .bottom-btn {
    position: fixed;
    bottom:100px;
    background-color: white;
    left: 0;
    width: 1000px;
    height: 100px;
    left: 50%;
    margin-left: -500px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

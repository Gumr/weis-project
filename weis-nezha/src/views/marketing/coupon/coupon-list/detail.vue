<template>
  <div class="page-container">
    <h2>基础信息</h2>
    <div class="section-item">
      <span class="section-label label-1 self-start">券模板类别选择：</span>
      <span class="base-input line-height-40">
        <div>{{ prize.tcsTypeStr }}</div>
        <div>{{ prize.tcsUseTypeStr }}</div>
      </span>
    </div>
    <div v-if="prize.tcsType == '02'" class="section-item">
      <span class="section-label label-1">使用门槛：</span>
      <span class="base-input line-height-40">{{ prize.tcsRestrictAmount }}</span>
      <span class="line-height-40">元</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">券模板名称：</span>
      <span class="base-input line-height-40">{{ prize.tcsName }}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">券模板面额：</span>
      <span class="base-input line-height-40">{{ prize.tcsAmount}}</span>
      <span class="line-height-40">元</span>
    </div>
      <div class="section-item">
      <span class="section-label label-1">点餐适用门槛：</span>
      <span class="base-input line-height-40">{{ prize.tcsOrderThreshold  == '00' ?'无门槛':'预订单使用' }}</span>
     
    </div>
    <div class="section-item">
      <span class="section-label label-1">券模板有效期：</span>
      <span class="base-input line-height-40">{{ prize.tcsPeriodValid }}</span>
      <span class="line-height-40">天</span>
    </div>
    <div v-if="prize.tcsRestrictAmount" class="section-item">
      <span class="section-label label-1">券模板使用门槛金额：</span>
      <span class="base-input line-height-40">{{ prize.tcsRestrictAmount }}</span>
      <span class="line-height-40">元</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">券模板简介：</span>
      <span
        class="base-input line-height-40"
        style="width: 500px;display: block;word-break:hyphenate;word-wrap:break-word"
      >{{ prize.tcsIntro }}</span>
    </div>
    <div v-if="prize.couponSys.length > 0" class="section-item">
      <span class="section-label label-1 self-start">指定菜品：</span>
      <span
        class="base-input line-height-40"
        style="width: 500px;display: block;word-break:hyphenate;word-wrap:break-word"
      >
        <el-table class="mrg-tp-12" :data="prize.couponSys" border stripe>
          <el-table-column v-for="col in skuInfoCols" v-bind="col" :key="col.label"></el-table-column>
        </el-table>
      </span>
    </div>
  </div>
</template>

<script>

export default {
  components: {
  },
  data() {
    return {
      skuInfoCols: [
        {
          label: '菜品编码',
          prop: 'skuCid'
        },
        {
          label: '菜品名称',
          prop: 'skuName'
        },
        {
          label: '菜品单价',
          prop: 'price'
        }
      ],
      prize: {
        tcsTypeStr: '',
        tcsUseTypeStr: '',
        couponSys: [],
        tcsName: '',
        tcsType: '',
        tcsAmount: '',
        tcsPeriodValid: '',
        tcsIntro: '',
        tcsRestrictAmount: 0,
        tcsStackable: 2
      }
    }
  },
  created() {
    this.getCouponInfo()
  },
  methods: {
    getCouponInfo() {
      const hander = (err, data) => {
        if (!err) {
          this.prize = {
            ...this.prize,
            ...data,
            tcsUseTypeStr: { '00': '普通券', '02': '菜品券' }[data.tcsUseType]
          }
        }
      }

      this.$request('coupon.Coupon/getCouponInfo', {
        tcsId: this.$route.query.id
      }).then(this.$rw(hander))
    }
  }
}

</script>

<style lang="less" scoped>
section {
  padding-top: 30px;
}
.medium-input {
  width: 240px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 150px;
  margin: 0 20px;
}

.self-start {
  align-self: flex-start;
}

.small-input {
  margin-left: 8px;
  width: 120px;
}
.small-select {
  margin-left: 8px;
  width: 200px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  button {
    height: 30px;
    line-height: 5px;
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  min-width: 160px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3,
h3 {
  margin-left: 22px;
}
.coupon {
  margin-left: 100px;
  min-height: 10px;
  width: 920px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  .coupon-item {
    width: 450px;
    min-height: 130px;
    border: 1px solid #cccccc;
    margin-bottom: 20px;
    padding: 10px 0;
    box-sizing: border-box;
  }
  .c-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    padding: 0 10px;
    box-sizing: border-box;
    span {
      margin-right: 10px;
      color: #409eff;
      cursor: pointer;
      &:last-child {
        margin: 0;
      }
    }
  }
}
</style>
